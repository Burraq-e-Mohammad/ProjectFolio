const Message = require('../models/Message');
const Project = require('../models/Project');
const User = require('../models/User');
const cloudinary = require('../utils/cloudinary');

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { projectId, receiverId, content, messageType = 'text' } = req.body;
    const senderId = req.user.id;

    // Validate project exists and user is involved
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is involved in the project
    if (project.userId.toString() !== senderId && 
        project.assignedTo?.toString() !== senderId) {
      return res.status(403).json({ message: 'Not authorized to send messages for this project' });
    }

    // Validate receiver is involved in the project
    if (project.userId.toString() !== receiverId && 
        project.assignedTo?.toString() !== receiverId) {
      return res.status(403).json({ message: 'Invalid receiver for this project' });
    }

    const message = new Message({
      projectId,
      senderId,
      receiverId,
      content,
      messageType
    });

    await message.save();

    // Populate sender and receiver info
    await message.populate('senderId', 'name email');
    await message.populate('receiverId', 'name email');

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

// Upload file attachment
const uploadAttachment = async (req, res) => {
  try {
    const { projectId, receiverId, content, messageType = 'file' } = req.body;
    const senderId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Validate project exists and user is involved
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is involved in the project
    if (project.userId.toString() !== senderId && 
        project.assignedTo?.toString() !== senderId) {
      return res.status(403).json({ message: 'Not authorized to send messages for this project' });
    }

    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'message_attachments',
      resource_type: 'auto'
    });

    const message = new Message({
      projectId,
      senderId,
      receiverId,
      content: content || 'File attachment',
      messageType,
      attachments: [{
        filename: result.public_id,
        originalName: req.file.originalname,
        url: result.secure_url,
        size: req.file.size,
        mimeType: req.file.mimetype
      }]
    });

    await message.save();

    // Populate sender and receiver info
    await message.populate('senderId', 'name email');
    await message.populate('receiverId', 'name email');

    res.status(201).json({
      message: 'File uploaded and message sent successfully',
      data: message
    });

  } catch (error) {
    console.error('Error uploading attachment:', error);
    res.status(500).json({ message: 'Error uploading attachment', error: error.message });
  }
};

// Get conversation messages
const getConversation = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;

    // Validate project exists and user is involved
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is involved in the project
    if (project.userId.toString() !== userId && 
        project.assignedTo?.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to view messages for this project' });
    }

    // Get messages for this project
    const messages = await Message.find({ projectId })
      .populate('senderId', 'name email')
      .populate('receiverId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Mark messages as read
    await Message.updateMany(
      { 
        projectId, 
        receiverId: userId, 
        isRead: false 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    const total = await Message.countDocuments({ projectId });

    res.json({
      messages: messages.reverse(), // Return in chronological order
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({ message: 'Error getting conversation', error: error.message });
  }
};

// Get user's conversations
const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    // Get projects where user is involved
    const projects = await Project.find({
      $or: [
        { userId: userId },
        { assignedTo: userId }
      ]
    }).select('_id title status');

    const projectIds = projects.map(project => project._id);

    // Get latest message for each project
    const conversations = await Message.aggregate([
      {
        $match: {
          projectId: { $in: projectIds },
          $or: [
            { senderId: userId },
            { receiverId: userId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$projectId',
          latestMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ['$receiverId', userId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { 'latestMessage.createdAt': -1 }
      },
      {
        $skip: (page - 1) * limit
      },
      {
        $limit: limit
      }
    ]);

    // Populate project and user information
    const populatedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        const project = projects.find(p => p._id.toString() === conversation._id.toString());
        const sender = await User.findById(conversation.latestMessage.senderId).select('name email');
        const receiver = await User.findById(conversation.latestMessage.receiverId).select('name email');

        return {
          projectId: conversation._id,
          projectTitle: project.title,
          projectStatus: project.status,
          latestMessage: {
            ...conversation.latestMessage,
            senderId: sender,
            receiverId: receiver
          },
          unreadCount: conversation.unreadCount
        };
      })
    );

    const total = await Message.aggregate([
      {
        $match: {
          projectId: { $in: projectIds },
          $or: [
            { senderId: userId },
            { receiverId: userId }
          ]
        }
      },
      {
        $group: {
          _id: '$projectId'
        }
      },
      {
        $count: 'total'
      }
    ]);

    res.json({
      conversations: populatedConversations,
      totalPages: Math.ceil((total[0]?.total || 0) / limit),
      currentPage: page,
      total: total[0]?.total || 0
    });

  } catch (error) {
    console.error('Error getting user conversations:', error);
    res.status(500).json({ message: 'Error getting user conversations', error: error.message });
  }
};

// Mark messages as read
const markAsRead = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Validate project exists and user is involved
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is involved in the project
    if (project.userId.toString() !== userId && 
        project.assignedTo?.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to mark messages for this project' });
    }

    // Mark all unread messages as read
    const result = await Message.updateMany(
      { 
        projectId, 
        receiverId: userId, 
        isRead: false 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    res.json({
      message: 'Messages marked as read',
      updatedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Error marking messages as read', error: error.message });
  }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get projects where user is involved
    const projects = await Project.find({
      $or: [
        { userId: userId },
        { assignedTo: userId }
      ]
    }).select('_id');

    const projectIds = projects.map(project => project._id);

    // Count unread messages
    const unreadCount = await Message.countDocuments({
      projectId: { $in: projectIds },
      receiverId: userId,
      isRead: false
    });

    res.json({ unreadCount });

  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Error getting unread count', error: error.message });
  }
};

module.exports = {
  sendMessage,
  uploadAttachment,
  getConversation,
  getUserConversations,
  markAsRead,
  getUnreadCount
}; 
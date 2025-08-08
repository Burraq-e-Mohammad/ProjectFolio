const nodemailer = require('nodemailer');
const ContactMessage = require('../models/ContactMessage');
const { sendContactMessageNotification } = require('../utils/emailService');

// Fix Nodemailer usage
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send contact form email
const sendContactEmail = async (req, res) => {
  try {
    const { firstName, lastName, email, subject, message } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    const transporter = createTransporter();

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'projectfolio.official@gmail.com', // Your email
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin-top: 10px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          <p style="color: #666; font-size: 12px;">
            This message was sent from the ProjectFolio contact form.
          </p>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon!'
    });

  } catch (error) {
    console.error('Contact email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
};

const sendContactMessage = async (req, res) => {
  try {
    const { firstName, lastName, email, subject, message } = req.body;
    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const newMessage = new ContactMessage({ firstName, lastName, email, subject, message });
    await newMessage.save();
    
    // Send email notification to admin
    try {
      await sendContactMessageNotification(newMessage);
    } catch (emailError) {
      console.error('Failed to send contact message notification:', emailError);
      // Don't fail the request if email fails
    }
    
    res.status(200).json({ message: 'Message sent successfully.' });
  } catch (err) {
    console.error('sendContactMessage error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getAllContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getContact = (req, res) => {
  res.send("Contact page");
};

const adminReplyToContactMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { subject, replyMessage } = req.body;
    if (!subject || !replyMessage) {
      return res.status(400).json({ message: 'Subject and reply message are required.' });
    }
    // Find the original contact message
    const contactMsg = await ContactMessage.findById(messageId);
    if (!contactMsg) {
      return res.status(404).json({ message: 'Contact message not found.' });
    }
    // Send reply email to the user
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: contactMsg.email,
      subject: `Re: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Reply from ProjectFolio Admin</h2>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Dear ${contactMsg.firstName} ${contactMsg.lastName},</strong></p>
            <p>${replyMessage.replace(/\n/g, '<br>')}</p>
          </div>
          <p style="color: #666; font-size: 12px;">
            This is a reply to your message: <em>${contactMsg.subject}</em>
          </p>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Reply sent to user successfully.' });
  } catch (err) {
    console.error('adminReplyToContactMessage error:', err);
    res.status(500).json({ message: 'Failed to send reply.', error: err.message });
  }
};

module.exports = {
  sendContactEmail,
  sendContactMessage,
  getAllContactMessages,
  getContact,
  adminReplyToContactMessage
}; 
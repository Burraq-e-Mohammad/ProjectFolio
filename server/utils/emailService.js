const nodemailer = require('nodemailer');

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'projectfolio.official@gmail.com',
    pass: process.env.EMAIL_PASS, // Make sure this is set in .env
  },
});

// Send project approval notification to admin
const sendProjectApprovalNotification = async (project, seller) => {
  try {
    const mailOptions = {
      from: '"ProjectFolio" <projectfolio.official@gmail.com>',
      to: 'burraqemohammad@gmail.com',
      subject: 'New Project Requires Approval - ProjectFolio',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Project Approval Required</h2>
          <p>A new project has been posted and requires your approval.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Project Details:</h3>
            <p><strong>Title:</strong> ${project.title}</p>
            <p><strong>Category:</strong> ${project.category}</p>
            <p><strong>Price:</strong> RS ${project.price}</p>
            <p><strong>Description:</strong> ${project.description.substring(0, 200)}${project.description.length > 200 ? '...' : ''}</p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Seller Information:</h3>
            <p><strong>Name:</strong> ${seller.firstName} ${seller.lastName}</p>
            <p><strong>Email:</strong> ${seller.email}</p>
          </div>
          
          <p>Please log in to the admin dashboard to review and approve this project.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Go to Admin Dashboard
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated notification from ProjectFolio.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

  } catch (error) {
    // Error sending project approval notification
  }
};

// Send project approval notification to seller
const sendProjectApprovedNotification = async (project, seller) => {
  try {
    const mailOptions = {
      from: '"ProjectFolio" <projectfolio.official@gmail.com>',
      to: seller.email,
      subject: 'Your Project Has Been Approved! - ProjectFolio',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">🎉 Your Project is Now Live!</h2>
          <p>Great news! Your project has been approved by our admin team and is now live on ProjectFolio.</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
            <h3 style="margin-top: 0; color: #059669;">Project Details:</h3>
            <p><strong>Title:</strong> ${project.title}</p>
            <p><strong>Category:</strong> ${project.category}</p>
            <p><strong>Price:</strong> RS ${project.price}</p>
            <p><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">Approved & Live</span></p>
          </div>
          
          <p>Your project is now visible to potential buyers on our platform. You'll be notified when someone shows interest or makes a purchase.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/my-projects" 
               style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View My Projects
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            Thank you for choosing ProjectFolio!<br/>
            Best regards,<br/>
            The ProjectFolio Team
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

  } catch (error) {
    // Error sending project approval notification to seller
  }
};

// Send payment verification notification to admin
const sendPaymentVerificationNotification = async (payment, buyer, seller, project) => {
  try {
    const mailOptions = {
      from: '"ProjectFolio" <projectfolio.official@gmail.com>',
      to: 'burraqemohammad@gmail.com',
      subject: 'Payment Proof Uploaded - Requires Verification - ProjectFolio',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Payment Verification Required</h2>
          <p>A buyer has uploaded payment proof and requires your verification.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Payment Details:</h3>
            <p><strong>Payment ID:</strong> ${payment._id}</p>
            <p><strong>Amount:</strong> RS ${payment.amount}</p>
            <p><strong>Transaction ID:</strong> ${payment.paymentDetails?.transactionId || 'N/A'}</p>
            <p><strong>Sender Phone:</strong> ${payment.paymentDetails?.phoneNumber || 'N/A'}</p>
            <p><strong>Sender Name:</strong> ${payment.paymentDetails?.senderName || 'N/A'}</p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Project Information:</h3>
            <p><strong>Project:</strong> ${project.title}</p>
            <p><strong>Category:</strong> ${project.category}</p>
            <p><strong>Price:</strong> RS ${project.price}</p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">User Information:</h3>
            <p><strong>Buyer:</strong> ${buyer.firstName} ${buyer.lastName} (${buyer.email})</p>
            <p><strong>Seller:</strong> ${seller.firstName} ${seller.lastName} (${seller.email})</p>
          </div>
          
          <p>Please log in to the admin dashboard to verify this payment.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
               style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Go to Admin Dashboard
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated notification from ProjectFolio.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

  } catch (error) {
    // Error sending payment verification notification
  }
};

// Send payment verification notification to buyer
const sendPaymentVerifiedNotification = async (payment, buyer, seller, project) => {
  try {
    const mailOptions = {
      from: '"ProjectFolio" <projectfolio.official@gmail.com>',
      to: buyer.email,
      subject: 'Payment Verified Successfully! - ProjectFolio',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">✅ Payment Verified!</h2>
          <p>Great news! Your payment has been verified by our admin team.</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
            <h3 style="margin-top: 0; color: #059669;">Payment Details:</h3>
            <p><strong>Payment ID:</strong> ${payment._id}</p>
            <p><strong>Amount:</strong> RS ${payment.amount}</p>
            <p><strong>Transaction ID:</strong> ${payment.paymentDetails?.transactionId || 'N/A'}</p>
            <p><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">Verified</span></p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Project Information:</h3>
            <p><strong>Project:</strong> ${project.title}</p>
            <p><strong>Category:</strong> ${project.category}</p>
            <p><strong>Price:</strong> RS ${project.price}</p>
            <p><strong>Seller:</strong> ${seller.firstName} ${seller.lastName}</p>
          </div>
          
          <p>The seller will now be notified and will provide you with the project files. You can track the progress in your payment orders.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-orders" 
               style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Payment Orders
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            Thank you for your purchase!<br/>
            Best regards,<br/>
            The ProjectFolio Team
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

  } catch (error) {
    // Error sending payment verification notification to buyer
  }
};

module.exports = {
  sendProjectApprovalNotification,
  sendProjectApprovedNotification,
  sendPaymentVerificationNotification,
  sendPaymentVerifiedNotification,
}; 
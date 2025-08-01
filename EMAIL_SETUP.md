# Email Setup Guide for ProjectFolio

## Email Configuration Required

To enable email verification functionality, you need to set up email configuration in your environment variables.

### 1. Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Copy the 16-character password

### 2. Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```env
# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_app_password

# Other required variables
MONGODB_URI=mongodb://localhost:27017/projectfolio
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:3000
```

### 3. Alternative Email Services

You can also use other email services by modifying the transporter configuration in `server/controllers/authController.js`:

#### Outlook/Hotmail:
```javascript
const transporter = nodemailer.createTransporter({
  service: 'outlook',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

#### Custom SMTP:
```javascript
const transporter = nodemailer.createTransporter({
  host: 'your-smtp-host.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

### 4. Testing Email Configuration

After setting up the environment variables:

1. Restart your server
2. Try registering a new user
3. Check the server console for email sending logs
4. Check your email inbox for verification emails

### 5. Troubleshooting

**Common Issues:**

1. **"Failed to send verification email"**
   - Check if EMAIL_USER and EMAIL_PASS are set correctly
   - Verify Gmail app password is correct
   - Check server console for detailed error messages

2. **"Invalid login" error**
   - Make sure you're using an app password, not your regular Gmail password
   - Ensure 2-factor authentication is enabled

3. **Emails not received**
   - Check spam/junk folder
   - Verify email address is correct
   - Check server logs for delivery confirmation

### 6. Security Notes

- Never commit your `.env` file to version control
- Use app passwords instead of your main password
- Regularly rotate your app passwords
- Consider using environment-specific email configurations

### 7. Production Deployment

For production, consider using dedicated email services like:
- SendGrid
- Mailgun
- Amazon SES
- Postmark

These services provide better deliverability and monitoring capabilities. 
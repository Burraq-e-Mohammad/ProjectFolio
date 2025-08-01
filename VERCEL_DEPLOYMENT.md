# Vercel Deployment Guide

## Overview
This guide will help you deploy your Project Folio application to Vercel. We'll deploy both the frontend (React) and backend (Node.js) separately.

## Prerequisites
1. Vercel account (sign up at https://vercel.com)
2. GitHub account with your project repository
3. MongoDB Atlas database
4. Cloudinary account (for image uploads)
5. Stripe account (for payments)

## Step 1: Prepare Your Repository

### 1.1 Update Environment Variables
Create a `.env` file in the client directory:
```env
VITE_API_URL=https://your-backend-url.vercel.app
```

### 1.2 Update .gitignore
Make sure your `.gitignore` files exclude sensitive information:
```
# .gitignore
.env
.env.local
.env.production
node_modules/
dist/
build/
```

## Step 2: Deploy Backend First

### 2.1 Connect Repository to Vercel
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Select the `server` directory as the root directory

### 2.2 Configure Backend Settings
- **Framework Preset**: Node.js
- **Root Directory**: `server`
- **Build Command**: Leave empty (not needed for Node.js API)
- **Output Directory**: Leave empty
- **Install Command**: `npm install`

### 2.3 Set Environment Variables
In Vercel dashboard, go to Settings > Environment Variables and add:

```
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_email_username
EMAIL_PASS=your_email_password
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### 2.4 Deploy Backend
1. Click "Deploy"
2. Wait for deployment to complete
3. Note the deployment URL (e.g., `https://your-project.vercel.app`)

## Step 3: Deploy Frontend

### 3.1 Create New Vercel Project for Frontend
1. Go to https://vercel.com
2. Click "New Project"
3. Import the same GitHub repository
4. Select the `client` directory as the root directory

### 3.2 Configure Frontend Settings
- **Framework Preset**: Vite
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3.3 Set Frontend Environment Variables
Add the backend URL as an environment variable:
```
VITE_API_URL=https://your-backend-url.vercel.app
```

### 3.4 Deploy Frontend
1. Click "Deploy"
2. Wait for deployment to complete
3. Your frontend will be available at the provided URL

## Step 4: Configure Domains (Optional)

### 4.1 Custom Domain
1. In Vercel dashboard, go to Settings > Domains
2. Add your custom domain
3. Configure DNS settings as instructed

### 4.2 Subdomain Setup
You can also set up subdomains:
- Frontend: `app.yourdomain.com`
- Backend: `api.yourdomain.com`

## Step 5: Post-Deployment Configuration

### 5.1 Update CORS Settings
Make sure your backend CORS settings include your frontend domain:

```javascript
// In server/server.js
app.use(cors({
  origin: [
    'https://your-frontend-domain.vercel.app',
    'http://localhost:3000' // for local development
  ],
  credentials: true,
}));
```

### 5.2 Test Your Application
1. Visit your frontend URL
2. Test user registration/login
3. Test project creation and viewing
4. Test payment functionality
5. Test live chat

## Step 6: Environment-Specific Configurations

### 6.1 Production Environment Variables
Make sure all environment variables are set for production:

**Backend Variables:**
- `MONGO_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: Strong secret key for JWT tokens
- `CLOUDINARY_*`: Cloudinary credentials
- `EMAIL_*`: Email service credentials
- `STRIPE_*`: Stripe API keys

**Frontend Variables:**
- `VITE_API_URL`: Your backend Vercel URL

### 6.2 Database Configuration
1. Ensure MongoDB Atlas is configured for production
2. Set up proper network access (IP whitelist or 0.0.0.0/0)
3. Create production database user

## Troubleshooting

### Common Issues

#### 1. CORS Errors
- Check that your backend CORS settings include your frontend domain
- Ensure credentials are properly configured

#### 2. Environment Variables Not Working
- Verify all environment variables are set in Vercel dashboard
- Check that variable names match exactly (case-sensitive)

#### 3. Database Connection Issues
- Verify MongoDB Atlas connection string
- Check network access settings
- Ensure database user has proper permissions

#### 4. Build Failures
- Check build logs in Vercel dashboard
- Verify all dependencies are in package.json
- Ensure build commands are correct

### Debugging
1. Check Vercel deployment logs
2. Use browser developer tools to check network requests
3. Verify API endpoints are working
4. Test environment variables are loaded correctly

## Monitoring and Maintenance

### 1. Set Up Monitoring
- Enable Vercel Analytics
- Set up error tracking (Sentry, etc.)
- Monitor API response times

### 2. Regular Updates
- Keep dependencies updated
- Monitor security vulnerabilities
- Update environment variables as needed

### 3. Backup Strategy
- Regular database backups
- Version control for all code changes
- Document configuration changes

## Security Considerations

### 1. Environment Variables
- Never commit sensitive data to version control
- Use Vercel's environment variable system
- Rotate secrets regularly

### 2. API Security
- Implement rate limiting
- Use HTTPS for all communications
- Validate all user inputs

### 3. Database Security
- Use strong passwords
- Limit database access
- Regular security audits

## Support
If you encounter issues:
1. Check Vercel documentation
2. Review deployment logs
3. Test locally first
4. Contact Vercel support if needed 
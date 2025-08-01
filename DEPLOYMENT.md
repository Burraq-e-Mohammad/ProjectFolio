# 🚀 Vercel Deployment Guide

This guide will help you deploy your ProjectFolio application to Vercel.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account**: Your code should be on GitHub
3. **MongoDB Atlas**: Set up a MongoDB database
4. **Cloudinary Account**: For image uploads
5. **Stripe Account**: For payments (optional)

## 🔧 Step 1: Prepare Your Repository

### Backend Setup
1. Navigate to the `server` folder
2. Create a `.env` file with your environment variables:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### Frontend Setup
1. Navigate to the `client` folder
2. Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

## 🌐 Step 2: Deploy Backend to Vercel

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"

2. **Import Repository**
   - Connect your GitHub account
   - Select your ProjectFolio repository
   - Set the root directory to `server`

3. **Configure Project**
   - **Framework Preset**: Node.js
   - **Build Command**: Leave empty (not needed for Node.js)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

4. **Environment Variables**
   Add all your environment variables from the `.env` file:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy the deployment URL (e.g., `https://your-backend.vercel.app`)

## 🎨 Step 3: Deploy Frontend to Vercel

1. **Create New Project**
   - Go back to Vercel Dashboard
   - Click "New Project"
   - Import the same repository

2. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Environment Variables**
   - `VITE_API_URL`: Set to your backend URL + `/api`
   - Example: `https://your-backend.vercel.app/api`

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

## 🔗 Step 4: Update CORS Settings

1. **Update Backend CORS**
   In your `server/server.js`, update the CORS configuration:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-frontend-domain.vercel.app'
  ],
  credentials: true
}));
```

2. **Redeploy Backend**
   - Push changes to GitHub
   - Vercel will automatically redeploy

## 🧪 Step 5: Test Your Deployment

1. **Test Frontend**: Visit your frontend URL
2. **Test Backend**: Visit `your-backend-url.vercel.app/api/health` (if you have a health endpoint)
3. **Test Features**:
   - User registration/login
   - Project creation
   - Image uploads
   - Admin dashboard

## 🔧 Step 6: Create Admin User

After deployment, create an admin user:

1. **Access your backend URL**
2. **Run the admin creation script**:
   ```bash
   # You can run this locally and point to your production database
   cd server
   node create-admin.js
   ```

## 🚨 Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Check that your frontend URL is in the CORS whitelist
   - Ensure `credentials: true` is set

2. **Environment Variables**
   - Double-check all environment variables are set in Vercel
   - Ensure no typos in variable names

3. **MongoDB Connection**
   - Verify your MongoDB Atlas connection string
   - Check IP whitelist settings

4. **Image Uploads**
   - Verify Cloudinary credentials
   - Check file size limits

### Debug Steps:

1. **Check Vercel Logs**
   - Go to your project in Vercel Dashboard
   - Click on "Functions" tab
   - Check for error logs

2. **Test API Endpoints**
   - Use Postman or curl to test your API
   - Check if endpoints are accessible

3. **Check Network Tab**
   - Open browser dev tools
   - Check for failed requests

## 📞 Support

If you encounter issues:
1. Check Vercel documentation
2. Review your environment variables
3. Test locally first
4. Check browser console for errors

## 🎉 Success!

Once deployed, your ProjectFolio application will be live at:
- **Frontend**: `https://your-frontend.vercel.app`
- **Backend**: `https://your-backend.vercel.app`

Remember to:
- Set up your domain (optional)
- Configure SSL certificates (automatic with Vercel)
- Set up monitoring and analytics
- Regular backups of your MongoDB database 
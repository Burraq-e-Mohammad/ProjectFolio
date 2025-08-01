#!/bin/bash

echo "🚀 Project Folio Vercel Deployment Script"
echo "=========================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Please install it first:"
    echo "npm install -g vercel"
    exit 1
fi

echo "✅ Vercel CLI is installed"

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "❌ You are not logged in to Vercel. Please login first:"
    echo "vercel login"
    exit 1
fi

echo "✅ Logged in to Vercel"

# Deploy backend first
echo ""
echo "📦 Deploying Backend..."
cd server

echo "Setting up backend environment variables..."
echo "Please make sure you have the following environment variables set in Vercel:"
echo "- MONGO_URI"
echo "- JWT_SECRET"
echo "- CLOUDINARY_CLOUD_NAME"
echo "- CLOUDINARY_API_KEY"
echo "- CLOUDINARY_API_SECRET"
echo "- EMAIL_USER"
echo "- EMAIL_PASS"
echo "- STRIPE_SECRET_KEY"
echo "- STRIPE_WEBHOOK_SECRET"

read -p "Press Enter to continue with backend deployment..."

vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Backend deployed successfully!"
    echo "Please note the backend URL for the frontend deployment"
else
    echo "❌ Backend deployment failed!"
    exit 1
fi

cd ..

# Deploy frontend
echo ""
echo "📦 Deploying Frontend..."
cd client

echo "Setting up frontend environment variables..."
echo "Please make sure you have VITE_API_URL set to your backend URL in Vercel"

read -p "Press Enter to continue with frontend deployment..."

vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Frontend deployed successfully!"
else
    echo "❌ Frontend deployment failed!"
    exit 1
fi

cd ..

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. Test your application"
echo "2. Configure custom domains if needed"
echo "3. Set up monitoring and analytics"
echo "4. Update your documentation"
echo ""
echo "For more information, see VERCEL_DEPLOYMENT.md" 
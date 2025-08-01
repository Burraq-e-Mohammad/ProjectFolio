# Project Folio Vercel Deployment Script for Windows
Write-Host "🚀 Project Folio Vercel Deployment Script" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# Check if Vercel CLI is installed
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI is installed: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI is not installed. Please install it first:" -ForegroundColor Red
    Write-Host "npm install -g vercel" -ForegroundColor Yellow
    exit 1
}

# Check if user is logged in to Vercel
try {
    vercel whoami | Out-Null
    Write-Host "✅ Logged in to Vercel" -ForegroundColor Green
} catch {
    Write-Host "❌ You are not logged in to Vercel. Please login first:" -ForegroundColor Red
    Write-Host "vercel login" -ForegroundColor Yellow
    exit 1
}

# Deploy backend first
Write-Host ""
Write-Host "📦 Deploying Backend..." -ForegroundColor Cyan
Set-Location server

Write-Host "Setting up backend environment variables..." -ForegroundColor Yellow
Write-Host "Please make sure you have the following environment variables set in Vercel:" -ForegroundColor Yellow
Write-Host "- MONGO_URI" -ForegroundColor White
Write-Host "- JWT_SECRET" -ForegroundColor White
Write-Host "- CLOUDINARY_CLOUD_NAME" -ForegroundColor White
Write-Host "- CLOUDINARY_API_KEY" -ForegroundColor White
Write-Host "- CLOUDINARY_API_SECRET" -ForegroundColor White
Write-Host "- EMAIL_USER" -ForegroundColor White
Write-Host "- EMAIL_PASS" -ForegroundColor White
Write-Host "- STRIPE_SECRET_KEY" -ForegroundColor White
Write-Host "- STRIPE_WEBHOOK_SECRET" -ForegroundColor White

Read-Host "Press Enter to continue with backend deployment"

try {
    vercel --prod
    Write-Host "✅ Backend deployed successfully!" -ForegroundColor Green
    Write-Host "Please note the backend URL for the frontend deployment" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Backend deployment failed!" -ForegroundColor Red
    exit 1
}

Set-Location ..

# Deploy frontend
Write-Host ""
Write-Host "📦 Deploying Frontend..." -ForegroundColor Cyan
Set-Location client

Write-Host "Setting up frontend environment variables..." -ForegroundColor Yellow
Write-Host "Please make sure you have VITE_API_URL set to your backend URL in Vercel" -ForegroundColor Yellow

Read-Host "Press Enter to continue with frontend deployment"

try {
    vercel --prod
    Write-Host "✅ Frontend deployed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend deployment failed!" -ForegroundColor Red
    exit 1
}

Set-Location ..

Write-Host ""
Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test your application" -ForegroundColor White
Write-Host "2. Configure custom domains if needed" -ForegroundColor White
Write-Host "3. Set up monitoring and analytics" -ForegroundColor White
Write-Host "4. Update your documentation" -ForegroundColor White
Write-Host ""
Write-Host "For more information, see VERCEL_DEPLOYMENT.md" -ForegroundColor Cyan 
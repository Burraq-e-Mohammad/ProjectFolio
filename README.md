# ProjectFolio - Full Stack Project Marketplace

A comprehensive full-stack application for buying and selling software projects, built with modern technologies and secure payment processing.

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Shadcn/UI** for modern, accessible components
- **Tailwind CSS** for styling
- **React Router** for navigation
- **TanStack Query** for data fetching and caching
- **Axios** for API communication
- **React Hook Form** with Zod validation
- **Manual Payment System** for secure transactions
- **Google Authentication** integration

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Manual Payment System** with escrow protection
- **Cloudinary** for image uploads
- **Google OAuth** integration
- **Nodemailer** for email notifications
- **Security middleware** (helmet, rate limiting, CORS, etc.)

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- Cloudinary account
- Google OAuth credentials
- Email service account

### Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** (see .env.example for required variables)

5. **Start the server:**
   ```bash
   npm start
   ```

### Frontend Setup

1. **Navigate to client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** (see .env.example for required variables)

5. **Start the development server:**
   ```bash
   npm run dev
   # or
   npm start
   ```

## 🔧 Features

### For Sellers
- ✅ Create and manage project listings
- ✅ Upload project images and documentation
- ✅ Set pricing and licensing terms
- ✅ Receive secure payments through manual payment system
- ✅ Track sales and earnings
- ✅ Manage project updates and support

### For Buyers
- ✅ Browse and search projects by category
- ✅ View detailed project information and demos
- ✅ Secure payment processing with escrow protection
- ✅ Download purchased projects
- ✅ Contact sellers for support
- ✅ Leave reviews and ratings

### Admin Features
- ✅ Payment management and verification
- ✅ User management and moderation
- ✅ Platform analytics and reporting
- ✅ Content moderation and approval
- ✅ Security monitoring and audit trails

## 🛡️ Security Features

- **Manual Payment System** with escrow protection
- **JWT Authentication** with role-based access control
- **Environment Variable Protection** for sensitive data
- **Input Validation** and sanitization
- **Rate Limiting** and DDoS protection
- **CORS Configuration** for secure cross-origin requests
- **Helmet.js** for security headers
- **Admin Authentication** with secure credentials

## 📱 Technologies Used

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Shadcn/UI
- React Router
- TanStack Query
- Axios
- React Hook Form + Zod

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Cloudinary
- Nodemailer
- Security Middleware

## 🚀 Deployment

This application is designed to be deployed on modern cloud platforms. Ensure all environment variables are properly configured for production deployment.

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## 📞 Support

For support and questions, please contact the development team. 
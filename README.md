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
- **Stripe** for payment processing
- **Google Authentication** integration

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Stripe** for payment processing
- **Cloudinary** for image uploads
- **Google OAuth** integration
- **Nodemailer** for email notifications
- **Security middleware** (helmet, rate limiting, CORS, etc.)

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- Stripe account
- Cloudinary account
- Google OAuth credentials
- Tawk.to account (optional)

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

4. **Configure environment variables:**
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database
   MONGO_URI=mongodb://localhost:27017/projectfolio

   # Authentication
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d

   # Email Configuration
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Stripe Configuration
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret

   # Security
   CORS_ORIGIN=http://localhost:3000
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

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

4. **Configure environment variables:**
   ```env
   # API Configuration
   VITE_API_URL=http://localhost:5000/api

   # Stripe Configuration
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

   # Google OAuth
   VITE_GOOGLE_CLIENT_ID=your_google_client_id

   # Tawk.to (Optional)
   VITE_TAWK_TO_PROPERTY_ID=your_tawk_to_property_id
   VITE_TAWK_TO_WIDGET_ID=your_tawk_to_widget_id
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
ProjectFolio/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── auth/       # Authentication components
│   │   │   ├── chat/       # Chat components
│   │   │   ├── layout/     # Layout components
│   │   │   ├── payment/    # Payment components
│   │   │   └── upload/     # Upload components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utility libraries
│   │   ├── pages/          # Page components
│   │   └── styles/         # Global styles
│   ├── public/             # Static assets
│   └── package.json
├── server/                 # Backend Node.js application
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   ├── uploads/            # File uploads
│   └── server.js           # Main server file
└── README.md
```

## 🔑 Key Features

### Authentication & Security
- ✅ JWT-based authentication
- ✅ Google OAuth integration
- ✅ Password hashing with bcrypt
- ✅ Email verification
- ✅ Password reset functionality
- ✅ Role-based access control
- ✅ Security middleware (helmet, rate limiting, CORS)

### Project Management
- ✅ Create, read, update, delete projects
- ✅ Project categories and filtering
- ✅ Search functionality
- ✅ Image uploads with Cloudinary
- ✅ Project status tracking

### Payment System
- ✅ Stripe integration for secure payments
- ✅ Escrow system for project protection
- ✅ Payment confirmation and release
- ✅ Refund processing
- ✅ Payment history tracking

### Communication
- ✅ Real-time messaging system
- ✅ File attachments in messages
- ✅ Conversation management
- ✅ Tawk.to chatbot integration

### User Experience
- ✅ Modern, responsive UI with Shadcn/UI
- ✅ Form validation with Zod
- ✅ Toast notifications
- ✅ Loading states and error handling
- ✅ Mobile-friendly design

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/register/google` - Google registration
- `POST /api/auth/google` - Google login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/my-projects` - Get user's projects
- `POST /api/projects/upload-image` - Upload project image

### Categories
- `GET /api/categories` - Get all categories

### Payments
- `POST /api/payments/create-escrow` - Create escrow payment
- `POST /api/payments/confirm-payment` - Confirm payment
- `POST /api/payments/release-payment` - Release payment
- `GET /api/payments/escrow/:id` - Get escrow account
- `GET /api/payments/escrow-accounts` - Get user's escrow accounts
- `POST /api/payments/refund-payment` - Refund payment

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `DELETE /api/cart/remove/:id` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart
- `PUT /api/cart/quantity/:id` - Update item quantity

### Communication
- `POST /api/communication/send-message` - Send message
- `GET /api/communication/messages/:projectId` - Get project messages
- `GET /api/communication/conversations` - Get conversations
- `POST /api/communication/upload-attachment` - Upload attachment

### Verification
- `POST /api/verification/submit-documents` - Submit verification documents
- `GET /api/verification/status` - Get verification status
- `GET /api/verification/documents` - Get verification documents

### Disputes
- `POST /api/disputes/create` - Create dispute
- `GET /api/disputes` - Get disputes
- `GET /api/disputes/:id` - Get dispute by ID
- `PUT /api/disputes/:id` - Update dispute
- `POST /api/disputes/:id/evidence` - Submit evidence

## 🛠️ Development

### Running in Development
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### Building for Production
```bash
# Backend
cd server
npm run build

# Frontend
cd client
npm run build
```

## 🔒 Security Features

- **CORS Protection** - Configured for specific origins
- **Rate Limiting** - Prevents abuse and DDoS attacks
- **Input Validation** - Sanitizes and validates all inputs
- **XSS Protection** - Prevents cross-site scripting attacks
- **SQL Injection Protection** - Secures database queries
- **Helmet** - Security headers for Express
- **JWT Token Management** - Secure token handling
- **Password Hashing** - Bcrypt for password security

## 📊 Database Schema

### User Model
- Basic info (name, email, username)
- Authentication (password, googleId)
- Profile data (avatar, bio, location)
- Statistics (projects, earnings, ratings)
- Verification status

### Project Model
- Basic info (title, description, price)
- Category and tags
- Images and files
- Status and visibility
- Owner and assigned user
- Ratings and reviews

### EscrowAccount Model
- Project and user references
- Payment details and amounts
- Status tracking
- Commission calculations
- Release and refund history

### Message Model
- Sender and recipient
- Project context
- Message content and attachments
- Timestamps and read status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@projectfolio.com or join our Slack channel.

## 🔗 Links

- [Live Demo](https://projectfolio.com)
- [API Documentation](https://docs.projectfolio.com)
- [Frontend Repository](https://github.com/your-org/projectfolio-frontend)
- [Backend Repository](https://github.com/your-org/projectfolio-backend)

---

**Note:** Make sure to replace all placeholder values (API keys, URLs, etc.) with your actual configuration before deploying to production. 
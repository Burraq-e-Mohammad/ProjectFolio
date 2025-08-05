# ProjectFolio - Frontend

A modern React TypeScript application for buying and selling software projects, built with Vite, Shadcn/UI, and TanStack Query.

## 🚀 Features

- **Modern Tech Stack**: React 18, TypeScript, Vite, Tailwind CSS
- **Beautiful UI**: Shadcn/UI components with modern design
- **Authentication**: Complete login/register system with JWT
- **Project Management**: Create, edit, and manage software projects
- **Shopping Cart**: Add projects to cart and checkout
- **Real-time Search**: Search and filter projects by category
- **Responsive Design**: Works perfectly on all devices
- **API Integration**: Full integration with Express.js backend

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend server running on port 5000

## 🛠️ Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## 🔧 Configuration

The frontend is configured to connect to the backend at `http://localhost:5000`. Make sure your backend server is running before starting the frontend.

### Environment Variables

Create a `.env` file in the client directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/UI components
│   ├── layout/         # Layout components (Header, Footer)
│   └── home/           # Home page components
├── pages/              # Page components
│   ├── Home.tsx        # Landing page
│   ├── Login.tsx       # Login page
│   ├── Register.tsx    # Registration page
│   ├── Dashboard.tsx   # User dashboard
│   └── ...
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── lib/                # Utility libraries
│   ├── api.ts          # API service layer
│   └── utils.ts        # Utility functions
├── hooks/              # Custom React hooks
└── assets/             # Static assets
```

## 🔌 API Integration

The frontend integrates with the following backend endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `DELETE /api/cart/remove/:id` - Remove item from cart

### Categories
- `GET /api/categories` - Get all categories

## 🎨 UI Components

Built with Shadcn/UI components:
- Buttons, Inputs, Cards
- Navigation menus
- Forms with validation
- Modals and dialogs
- Loading states and animations

## 🔐 Authentication

The app uses JWT tokens for authentication:
- Tokens are stored in localStorage
- Automatic token refresh
- Protected routes
- User context throughout the app

## 📱 Responsive Design

- Mobile-first approach
- Responsive navigation
- Adaptive layouts
- Touch-friendly interactions

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Serve the built files**
   ```bash
   npm run preview
   ```

3. **Deploy to your preferred platform** (Vercel, Netlify, etc.)

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Consistent component structure

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the browser console for errors
2. Ensure the backend server is running
3. Verify your environment variables
4. Check the network tab for API errors

## 🔗 Backend Integration

This frontend is designed to work with the ProjectFolio backend. Make sure to:
1. Start the backend server first
2. Configure CORS properly
3. Set up the database
4. Configure environment variables

For backend setup instructions, see the server directory README.

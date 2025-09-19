# Auth Client - Frontend

A modern, responsive authentication frontend built with Next.js 14, React 18, and Tailwind CSS.

## Features

### ✅ Completed Features

- **Complete Authentication Flow**
  - Login with email/password
  - Signup with validation
  - Forgot password functionality
  - Reset password with token
  - Logout functionality

- **Modern UI Components**
  - Reusable Input, Button, Alert components
  - Dark mode support
  - Responsive design
  - Loading states and animations
  - Form validation with error handling

- **State Management**
  - React Context for authentication state
  - Custom hooks for form handling
  - Protected routes
  - Automatic token management

- **User Experience**
  - Beautiful, modern design
  - Smooth transitions and animations
  - Comprehensive error handling
  - Success/error notifications
  - Password visibility toggles
  - Remember me functionality

- **Security Features**
  - JWT token management
  - Automatic logout on token expiry
  - Protected routes
  - CSRF protection ready
  - Secure cookie handling

## Pages

- `/` - Home (redirects based on auth status)
- `/login` - Login form
- `/signup` - Registration form
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset with token
- `/dashboard` - Protected user dashboard

## Components

### UI Components
- `Input` - Form input with validation and icons
- `Button` - Multiple variants with loading states
- `Alert` - Success, error, warning, info alerts

### Auth Components
- `LoginForm` - Complete login form
- `SignupForm` - Registration form with validation
- `ForgotPasswordForm` - Password reset request
- `ResetPasswordForm` - Password reset with token
- `ProtectedRoute` - Route protection wrapper

### Context & Hooks
- `AuthContext` - Global authentication state
- `useAuth` - Authentication hook
- `useForm` - Form handling hook

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment setup:**
   ```bash
   cp env.txt .env.local
   ```
   Update the environment variables in `.env.local`

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NODE_ENV=development
PORT=3001
```

## API Integration

The frontend is fully integrated with the backend API:

- **Authentication endpoints:**
  - `POST /auth/login` - User login
  - `POST /auth/signup` - User registration
  - `POST /auth/logout` - User logout
  - `POST /auth/forgot` - Password reset request
  - `POST /auth/reset` - Password reset

- **User endpoints:**
  - `GET /users/profile` - Get user profile

## Features Ready for Implementation

- Google OAuth integration (UI ready, backend integration needed)
- Email verification flow
- Phone verification
- User profile management
- Address management
- Security settings

## Tech Stack

- **Framework:** Next.js 14
- **UI Library:** React 18
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Form Handling:** Custom hooks
- **State Management:** React Context
- **TypeScript:** Full type safety

## Design System

- **Colors:** Blue primary, gray neutrals
- **Typography:** System fonts with proper hierarchy
- **Spacing:** Consistent 4px grid system
- **Components:** Reusable, accessible components
- **Dark Mode:** Full dark mode support

The frontend is now 90% complete and ready for production use with the backend API!

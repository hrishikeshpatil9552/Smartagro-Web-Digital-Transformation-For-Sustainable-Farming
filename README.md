# Agriculture Login Page (Community)

A full-stack authentication system for agricultural community management with React frontend and Node.js backend.

## Features

- **User Registration**: Register with name, email, phone, and password
- **User Login**: Authenticate with email and password
- **MongoDB Integration**: All user data stored in MongoDB (viewable in MongoDB Compass)
- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Dashboard access only after successful login
- **Real-time Validation**: Form validation and error handling

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for development
- Tailwind CSS for styling
- Radix UI components
- Lucide React icons

### Backend
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- CORS enabled

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally on port 27017)
- MongoDB Compass (optional, for viewing data)

### Installation

1. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Environment Setup**
   - Backend `.env` file is already configured
   - MongoDB URI: `mongodb://localhost:27017/agri_app`
   - Backend Port: 4000
   - Frontend Port: 5173

### Running the Application

#### Option 1: Use the Start Script (Recommended)
```bash
# From the root directory
start-dev.bat
```

#### Option 2: Manual Start
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000/api
- **Health Check**: http://localhost:4000/api/health

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Request/Response Examples

#### Register
```json
// Request
{
  "name": "John Farmer",
  "email": "john@farm.com",
  "phone": "1234567890",
  "password": "password123"
}

// Response
{
  "token": "jwt_token_here",
  "user": {
    "email": "john@farm.com",
    "name": "John Farmer",
    "phone": "1234567890"
  }
}
```

#### Login
```json
// Request
{
  "email": "john@farm.com",
  "password": "password123"
}

// Response
{
  "token": "jwt_token_here",
  "user": {
    "email": "john@farm.com",
    "name": "John Farmer",
    "phone": "1234567890"
  }
}
```

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  email: String (required, unique),
  passwordHash: String (required),
  name: String (optional),
  phone: String (optional),
  createdAt: Date (default: now)
}
```

## Authentication Flow

1. **Registration**: User fills form → Data sent to backend → Password hashed → Saved to MongoDB → JWT token returned
2. **Login**: User enters credentials → Backend verifies email exists → Password compared with hash → JWT token returned on success
3. **Protected Access**: Token stored in localStorage → Sent with requests → Dashboard accessible only with valid token

## MongoDB Compass

To view registered users:
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Navigate to `agri_app` database
4. View `users` collection

## Development Notes

- Frontend uses Vite proxy to forward API calls to backend
- CORS configured to allow frontend origin
- JWT tokens expire in 7 days
- Passwords are hashed with bcrypt (10 rounds)
- Form validation on both frontend and backend
- Error handling with user-friendly messages

## Project Structure

```
Agriculture Login Page (Community)/
├── backend/
│   ├── src/
│   │   ├── controllers/authController.ts
│   │   ├── models/User.ts
│   │   ├── routes/auth.ts
│   │   ├── utils/db.ts
│   │   ├── app.ts
│   │   └── index.ts
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── services/api.ts
│   │   └── App.tsx
│   └── package.json
└── start-dev.bat
```
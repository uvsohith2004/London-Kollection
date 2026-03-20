# Authentication API Documentation

## 🏗️ Architecture Overview

This is a production-ready authentication system built with Node.js, Express, and MongoDB.

### Key Architecture Decisions

1. **Stateless JWT Authentication**: No server-side sessions, tokens stored client-side
2. **Refresh Token Rotation**: New refresh token issued on each refresh for enhanced security
3. **Password Hashing**: bcrypt with 12 salt rounds (industry standard)
4. **Token Storage**: Access token in memory/state, refresh token in httpOnly cookie
5. **Security First**: Rate limiting, CORS, Helmet, input validation

### Why These Decisions?

- **Why Hashing?**: Passwords are never stored in plaintext. bcrypt is one-way, making it impossible to reverse even if database is compromised.
- **Why Refresh Token Rotation?**: If a refresh token is stolen, rotating it invalidates the old one, limiting attack window.
- **Why Not localStorage for JWT?**: localStorage is vulnerable to XSS attacks. httpOnly cookies protect refresh tokens from JavaScript access.
- **Access vs Refresh Token**: Access tokens are short-lived (15m) and contain user info. Refresh tokens are long-lived (7d) and only used to get new access tokens. This limits exposure if access token is stolen.
- **Stateless Architecture**: Scales horizontally without shared session storage. Perfect for microservices.

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB (Mongoose) connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── userController.js    # User operations
├── database/
│   └── schema.sql           # Database schema (run in Supabase SQL Editor)
├── middleware/
│   ├── auth.js              # JWT verification middleware
│   ├── errorHandler.js      # Centralized error handling
│   └── validation.js        # Request validation
├── models/
│   └── User.js              # User model with MongoDB (Mongoose) operations
├── routes/
│   ├── authRoutes.js        # Authentication routes
│   └── userRoutes.js        # Protected user routes
├── .env                     # Environment variables (create from .env.example)
├── .env.example             # Environment template
├── server.js                # Express app entry point
└── package.json             # Dependencies
```

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up MongoDB

1. Install MongoDB locally or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier).
2. Create a database (e.g. `landom_ecomm`) and get your connection string.

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
MONGODB_URI=mongodb://localhost:27017/landom_ecomm
# Or for Atlas: MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/landom_ecomm
JWT_ACCESS_SECRET=your_super_secret_min_32_chars
JWT_REFRESH_SECRET=your_super_secret_min_32_chars
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
BCRYPT_SALT_ROUNDS=12
```

### 4. Generate JWT Secrets

```bash
# Generate secure random strings (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Run Server

```bash
npm run dev  # Development with auto-reload
# or
npm start    # Production
```

## 📡 API Endpoints

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "user"  // optional, defaults to "user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "accessToken": "jwt_token",
    "refreshToken": "jwt_token"  // Also in httpOnly cookie
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "accessToken": "jwt_token",
    "refreshToken": "jwt_token"
  }
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "jwt_refresh_token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new_jwt_token",
    "refreshToken": "new_jwt_token"
  }
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Protected Endpoints

#### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "created_at": "2026-02-19T...",
      "updated_at": "2026-02-19T..."
    }
  }
}
```

## 🔒 Security Features

- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT access tokens (15m expiry)
- ✅ JWT refresh tokens (7d expiry, rotated)
- ✅ httpOnly cookies for refresh tokens
- ✅ Rate limiting on auth routes
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Input validation (Zod)
- ✅ User enumeration prevention
- ✅ SQL injection protection (Supabase parameterized queries)

## 🧪 Testing with Postman

Import the following collection:

```json
{
  "info": {
    "name": "Auth API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"John Doe\",\n  \"email\": \"john@example.com\",\n  \"password\": \"SecurePass123!\"\n}"
        },
        "url": {
          "raw": "http://localhost:5000/api/auth/register",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "auth", "register"]
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"john@example.com\",\n  \"password\": \"SecurePass123!\"\n}"
        },
        "url": {
          "raw": "http://localhost:5000/api/auth/login",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "auth", "login"]
        }
      }
    },
    {
      "name": "Get Profile",
      "request": {
        "method": "GET",
        "header": [
          {"key": "Authorization", "value": "Bearer {{accessToken}}"}
        ],
        "url": {
          "raw": "http://localhost:5000/api/users/profile",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "users", "profile"]
        }
      }
    },
    {
      "name": "Refresh Token",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"refreshToken\": \"{{refreshToken}}\"\n}"
        },
        "url": {
          "raw": "http://localhost:5000/api/auth/refresh",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "auth", "refresh"]
        }
      }
    },
    {
      "name": "Logout",
      "request": {
        "method": "POST",
        "header": [
          {"key": "Authorization", "value": "Bearer {{accessToken}}"}
        ],
        "url": {
          "raw": "http://localhost:5000/api/auth/logout",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "auth", "logout"]
        }
      }
    }
  ]
}
```

## 🎯 Error Codes

- `EMAIL_EXISTS` - Email already registered
- `INVALID_CREDENTIALS` - Wrong email/password
- `TOKEN_EXPIRED` - Token has expired
- `INVALID_TOKEN` - Token is invalid
- `TOKEN_INVALID` - Refresh token not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `REGISTRATION_FAILED` - Registration error
- `USER_NOT_FOUND` - User doesn't exist
- `NOT_FOUND` - Route not found
- `INTERNAL_ERROR` - Server error

## 📝 Notes

- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Refresh tokens are rotated on each refresh
- Passwords must be at least 8 characters with uppercase, lowercase, number, and special character
- Rate limiting: 5 requests per 15 minutes for auth endpoints

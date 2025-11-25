# Payment Slip Verification System - Implementation Guide

## Overview

This document outlines the complete payment slip verification system implementation for the Web Camp 24 registration system.

## System Architecture

### 1. Backend (Express.js + MongoDB)

#### Server Configuration (`server/server.js`)
- **Port:** 5000
- **Middleware:**
  - `cors` - Allows cross-origin requests with credentials
  - `cookie-parser` - Parses HTTP cookies for JWT authentication
  - `fileUpload` - Handles file uploads (50MB limit)
  - `express.json()` - Parses JSON request bodies

#### Database Models

**Payment Model** (`server/models/payment.js`)
```javascript
{
  userId: ObjectId (Reference to User),
  name: String,
  phone: String,
  slipImage: String (base64 encoded image),
  uploadDate: Date (default: current time),
  status: String (enum: "pending", "approved", "rejected"),
  note: String (optional)
}
```

#### API Endpoints

**1. Check Payment Status**
```
GET /api/payments/check?name=John&phone=0812345678
Response: { exists: true/false }
```
- Searches user by name and phone
- Checks if payment already submitted
- Used in Payment.jsx to prevent duplicate submissions

**2. Upload Payment Slip**
```
POST /api/payments
Body: FormData {
  name: String,
  phone: String,
  slip: File
}
Response: { success: true, message: String, payment: Object }
```
- Searches user by name + phone
- Converts file to base64 and stores in database
- Creates Payment record with "pending" status
- Returns 409 if payment already exists

**3. Get All Payments (Admin Only)**
```
GET /api/payments/admin/all
Response: Array of {
  id: String (MongoDB _id),
  userId: String,
  userName: String,
  email: String,
  phone: String,
  school: String,
  slipImage: String (base64),
  uploadDate: Date,
  status: String,
  note: String
}
```
- Fetches all payments with user details
- Sorted by upload date (newest first)
- Used by Receipts admin page

**4. Update Payment Status (Admin Only)**
```
PUT /api/payments/:id/status
Body: { status: String, note: String }
Response: { success: true, payment: Object }
```
- Updates payment status and optional note
- Status must be one of: "pending", "approved", "rejected"
- Persists changes to database

### 2. Frontend (React)

#### Key Components

**Payment.jsx** (`src/Pages/Payment.jsx`)
- User searches account by name + phone
- Validates phone format (must start with 0, 9-10 digits)
- Checks if payment already submitted (GET /api/payments/check)
- Uploads slip with form validation
- Displays success/error messages
- Uses `VITE_API_URL` environment variable for API base

**Receipts.jsx** (`src/Pages/admin/receipts.jsx`)
- Fetches all payments from `/api/payments/admin/all` on mount
- Real-time filtering by name, email, phone
- Status filtering (all, pending, approved, rejected)
- Status statistics dashboard
- Modal viewer for payment slip images
- Inline status dropdown with API integration
- Bulk action support (approve all selected)
- Download slip functionality
- Admin approval/rejection with optional notes

**Admin Dashboard & Other Pages**
- All use `credentials: 'include'` in fetch calls
- `VITE_API_URL` from `.env`
- Real-time data sync after status changes

## Authentication Flow

1. **Login** (`/api/auth/login`)
   - POST with `ADMIN_USERNAME` and `ADMIN_PASSWORD`
   - Returns JWT signed with `JWT_SECRET`
   - Sets HttpOnly cookie (2-hour expiry)

2. **Session Check** (`/api/auth/me`)
   - GET request included on PrivateRoute
   - Returns `{ authenticated: true/false }`
   - Verifies JWT from cookie

3. **Logout** (`/api/auth/logout`)
   - POST request clears HttpOnly cookie

## Environment Configuration

### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/webcomcamp
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
CLIENT_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

## Data Flow Diagram

```
User Flow:
1. User navigates to /payment
2. Enters name + phone
3. Clicks "ตรวจสอบข้อมูล" → GET /api/payments/check
4. If verification passes, uploads slip → POST /api/payments
5. File converted to base64 → stored in MongoDB
6. Success message displayed

Admin Flow:
1. Admin logs in → POST /api/auth/login
2. PrivateRoute checks → GET /api/auth/me
3. Redirects to /admin/receipts
4. Component mounts → GET /api/payments/admin/all
5. Admin views slip in modal
6. Admin changes status dropdown → PUT /api/payments/:id/status
7. Database updates, UI reflects new status immediately
```

## File Structure

```
Backend:
server/
├── server.js              # Main app config
├── package.json          # Dependencies
├── .env.example          # Example env vars
├── routes/
│   ├── auth.js           # Login/logout/session
│   ├── payments.js       # Payment endpoints (NEW)
│   ├── users.js          # User management
│   └── register.js       # Registration
├── models/
│   ├── payment.js        # Payment schema (NEW)
│   └── users.js          # User schema
└── config/
    └── db.js             # Database connection

Frontend:
src/
├── App.jsx               # Routes (UPDATED)
├── Pages/
│   ├── Payment.jsx       # Payment form (UPDATED)
│   ├── CheckRegistration.jsx
│   ├── admin/
│   │   ├── receipts.jsx  # Admin receipts (UPDATED)
│   │   ├── login.jsx     # Admin login (UPDATED)
│   │   ├── dashboard.jsx # Admin dashboard
│   │   └── users.jsx     # Admin users
│   └── ...
└── Routes/
    └── PrivateRoutes.jsx # Protected routes (UPDATED)

Config:
├── .env                  # Frontend API config
├── .env.example          # Frontend example
└── vite.config.js        # Vite configuration
```

## Setup Instructions

### 1. Backend Setup

```bash
cd server
npm install

# Create .env file from .env.example
cp .env.example .env

# Update .env with actual credentials
# PORT, MONGO_URI, JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD, CLIENT_ORIGIN

# Start server
npm start
# Server runs on http://localhost:5000
```

### 2. Frontend Setup

```bash
# Create .env file from .env.example
cp .env.example .env

# Update .env if needed
VITE_API_URL=http://localhost:5000

# Install dependencies
npm install

# Start dev server
npm run dev
# Frontend runs on http://localhost:5173
```

### 3. Database Setup

- Ensure MongoDB is running on `localhost:27017`
- Or update `MONGO_URI` in `.env` for remote database
- Collections will be created automatically by Mongoose

## Testing the System

### 1. User Payment Upload
1. Navigate to `http://localhost:5173/payment`
2. Enter name (e.g., "John Doe") and phone (e.g., "0812345678")
3. Click "ตรวจสอบข้อมูล"
4. Upload a JPG/PNG slip image (< 5MB)
5. Accept terms and click "ยืนยันการชำระเงิน"
6. Success message should appear

### 2. Admin Review
1. Navigate to `http://localhost:5173/admin/login`
2. Login with admin credentials
3. Go to "ตรวจสอบสลิปการชำระเงิน"
4. View uploaded slips with approval/rejection options
5. Change status or add rejection notes
6. Database should update in real-time

### 3. Duplicate Prevention
1. Try uploading same name + phone twice
2. Second attempt should show error: "Payment already submitted"

## Important Notes

### Image Storage
- Images are stored as base64 in MongoDB
- Maximum file size: 5MB (frontend) + 50MB (backend)
- MIME types: JPG, PNG only
- Format: `data:image/jpeg;base64,<encoded-data>`

### Security
- JWT tokens stored in HttpOnly cookies (cannot be accessed by JavaScript)
- Tokens expire after 2 hours
- CORS enforces origin check (CLIENT_ORIGIN in env)
- File upload limited to prevent DoS attacks

### Performance
- Payment fetches are not paginated (consider adding for large datasets)
- Images as base64 increase database size (consider file storage service for production)
- Status updates are instant (no polling needed)

## Troubleshooting

### "Payment already submitted" error
- Check if user already exists in User collection
- Payment records are unique per user (userId)

### Image not displaying
- Check base64 encoding in MongoDB
- Verify MIME type is correct (data:image/jpeg;base64,...)
- Check browser console for CORS errors

### Status update not reflecting
- Verify admin is authenticated (PrivateRoute should show)
- Check Network tab in DevTools for PUT request
- Verify MongoDB connection is active

### CORS errors
- Ensure `CLIENT_ORIGIN` matches frontend URL
- Check `credentials: 'include'` in fetch calls
- Verify CORS headers in server response

## Future Enhancements

1. **Pagination** - Add limit/offset to GET /api/payments/admin/all
2. **File Storage** - Move from base64 to S3/cloud storage
3. **Email Notifications** - Send confirmation to user after approval
4. **Audit Log** - Track all status changes with timestamps and admin info
5. **Receipt Generation** - Create PDF receipt after approval
6. **Search API** - Add advanced filters (date range, school, etc.)
7. **Analytics** - Dashboard stats (payment rates, pending approval time, etc.)

## Support

For issues or questions:
1. Check the browser console (F12) for errors
2. Check server logs (terminal running `npm start`)
3. Verify MongoDB connection with `mongosh`
4. Check network requests in DevTools Network tab

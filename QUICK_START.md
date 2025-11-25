# Payment System - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Configure Environment Variables

**Backend** (`server/.env`):
```bash
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/webcomcamp
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
CLIENT_ORIGIN=http://localhost:5173
```

**Frontend** (`.env`):
```bash
VITE_API_URL=http://localhost:5000
```

### Step 2: Install & Start

```bash
# Backend
cd server
npm install
npm start
# Runs on http://localhost:5000

# Frontend (in another terminal)
npm install
npm run dev
# Runs on http://localhost:5173
```

### Step 3: Test the System

1. **User Payment Upload:**
   - Go to http://localhost:5173/payment
   - Enter name and phone number
   - Click "ตรวจสอบข้อมูล"
   - Upload a JPG/PNG file
   - Click "ยืนยันการชำระเงิน"

2. **Admin Review:**
   - Go to http://localhost:5173/admin/login
   - Login with credentials (admin/admin123)
   - Click "ตรวจสอบสลิปการชำระเงิน"
   - View, approve, or reject payments

## 📡 API Endpoints Summary

### Public Endpoints
- `GET /api/payments/check?name=John&phone=0812345678` - Check if payment exists
- `POST /api/payments` - Upload payment slip

### Admin Endpoints (Protected)
- `GET /api/payments/admin/all` - Fetch all payments
- `PUT /api/payments/:id/status` - Update payment status

### Auth Endpoints
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Verify session
- `POST /api/auth/logout` - Logout

## 🗄️ Database Schema

```javascript
// Payment Collection
{
  _id: ObjectId,
  userId: ObjectId,           // Reference to User
  name: "John Doe",
  phone: "0812345678",
  slipImage: "data:image/jpeg;base64,...",
  uploadDate: "2024-01-15T10:30:00Z",
  status: "pending",          // "pending", "approved", "rejected"
  note: "Approved by admin",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:35:00Z"
}
```

## 🎯 Key Features

✅ **User Side:**
- Name + phone search to prevent duplicates
- Phone format validation
- JPG/PNG image upload with size limits
- Real-time validation feedback
- Success/error messages

✅ **Admin Side:**
- View all payment slips with user details
- Filter by status (pending, approved, rejected)
- Search by name, email, or phone
- Inline status dropdown for quick updates
- Modal image viewer with download
- Bulk approval functionality
- Optional rejection notes
- Real-time statistics dashboard

✅ **Security:**
- HttpOnly cookie JWT authentication
- CORS validation
- File type/size restrictions
- Secure password storage
- Session timeout (2 hours)

## 📊 Important File Locations

```
Key Components:
- src/Pages/Payment.jsx              # User upload form
- src/Pages/admin/receipts.jsx       # Admin dashboard
- src/Pages/admin/login.jsx          # Admin login
- src/Routes/PrivateRoutes.jsx       # Route protection
- src/App.jsx                         # Route configuration

Backend:
- server/routes/payments.js           # Payment API endpoints
- server/models/payment.js            # Payment database schema
- server/routes/auth.js               # Authentication endpoints
- server/server.js                    # Main server configuration

Config:
- .env.example                        # Frontend env template
- server/.env.example                 # Backend env template
```

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| **API calls failing** | Verify VITE_API_URL matches server port (5000) |
| **Can't login** | Check ADMIN_USERNAME/PASSWORD in .env |
| **Images not showing** | Verify MongoDB has base64 encoded images |
| **CORS errors** | Ensure CLIENT_ORIGIN in server .env is correct |
| **File upload fails** | Check file is < 5MB, type is JPG/PNG |
| **Duplicate payment error** | Works as intended; user can't submit twice |
| **Status update not working** | Verify admin is logged in (PrivateRoute) |

## 📈 Workflow Diagram

```
┌─────────────────────────────────────────────────────────┐
│              User Payment Upload Flow                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. User visits /payment page                          │
│  2. Enters name and phone number                       │
│  3. Clicks "ตรวจสอบข้อมูล"                              │
│     └─> GET /api/payments/check                        │
│         ✓ If not exists, continue                      │
│         ✗ If exists, show error                        │
│  4. Selects and uploads slip image                     │
│  5. Clicks "ยืนยันการชำระเงิน"                           │
│     └─> POST /api/payments                             │
│         └─> Creates Payment record (status: pending)   │
│             └─> Stores base64 image in MongoDB         │
│  6. Success message displayed                          │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│           Admin Payment Verification Flow               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Admin visits /admin/login                          │
│  2. Enters credentials                                 │
│  3. Clicks login                                       │
│     └─> POST /api/auth/login                           │
│         └─> Returns JWT (in HttpOnly cookie)           │
│  4. Redirects to /admin/dashboard                      │
│     └─> GET /api/auth/me (verify session)              │
│  5. Clicks "ตรวจสอบสลิปการชำระเงิน"                      │
│  6. Component mounts                                   │
│     └─> GET /api/payments/admin/all                    │
│         └─> Fetches all payments with user details     │
│  7. Admin reviews payment slips                        │
│     └─> Views image in modal                           │
│     └─> Changes status dropdown                        │
│        └─> PUT /api/payments/:id/status                │
│            └─> Updates database                        │
│            └─> UI reflects change immediately          │
│  8. Can filter, search, and bulk approve               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 💾 MongoDB Commands (Verification)

```bash
# Connect to MongoDB
mongosh

# Use the database
use webcomcamp

# Check payments collection
db.payments.find().pretty()

# Find specific payment
db.payments.findOne({ phone: "0812345678" })

# Count payments by status
db.payments.countDocuments({ status: "pending" })
db.payments.countDocuments({ status: "approved" })
db.payments.countDocuments({ status: "rejected" })

# Update payment status manually
db.payments.updateOne(
  { _id: ObjectId("...") },
  { $set: { status: "approved", note: "Verified" } }
)
```

## 🔐 Security Best Practices

1. **Production Setup:**
   - Change `JWT_SECRET` to a strong random string
   - Change `ADMIN_USERNAME` and `ADMIN_PASSWORD`
   - Set `NODE_ENV=production`
   - Use HTTPS for all endpoints

2. **Data Protection:**
   - Store sensitive files in cloud storage (S3) instead of base64
   - Enable MongoDB authentication
   - Implement rate limiting on API endpoints
   - Add request validation middleware

3. **Monitoring:**
   - Log all admin actions (who approved/rejected and when)
   - Set up error tracking (Sentry, etc.)
   - Monitor payment submission rates
   - Alert on suspicious patterns

## 📚 Related Documentation

- See `PAYMENT_SYSTEM_README.md` for detailed technical documentation
- See `IMPLEMENTATION_CHECKLIST.md` for complete feature list
- See README.md for general project setup

## ✨ Features at a Glance

| Feature | Status | Details |
|---------|--------|---------|
| User Payment Upload | ✅ | Form with validation and duplicate check |
| Admin Verification | ✅ | Dashboard with filter, search, and bulk actions |
| Image Storage | ✅ | Base64 encoding in MongoDB |
| Status Tracking | ✅ | Pending → Approved/Rejected |
| Real-time Sync | ✅ | UI updates immediately after status change |
| Secure Auth | ✅ | HttpOnly JWT cookies |
| File Validation | ✅ | Type (JPG/PNG) and size (< 5MB) checks |
| Admin Dashboard | ✅ | Statistics and recent activity |

---

**Questions?** Check the detailed documentation or review the code comments!

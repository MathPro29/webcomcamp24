# Payment Upload Error - Troubleshooting Guide

## Error: "User not found"

### What Was Fixed

I've made the following changes to improve user search:

1. **Payment.jsx** (Frontend)
   - Added `credentials: 'include'` to the fetch request
   - This ensures cookies are sent with the request

2. **payments.js** (Backend)
   - Improved name matching logic
   - Now handles both "FirstName LastName" and individual name searches
   - Supports multiple search strategies:
     - Exact firstName + lastName match
     - Partial name matching
     - Individual word matching

### Why This Was Happening

The issue occurs when:
- User enters full name (e.g., "John Doe")
- Backend searches for firstName OR lastName matching the full string
- User database has separate firstName and lastName fields
- The full name string doesn't exactly match either field

### How to Debug

If you still get "User not found" error:

1. **Verify the user exists in database:**
   ```bash
   mongosh
   use webcomcamp
   db.users.findOne({ phone: "0812345678" })
   ```
   Look for firstName and lastName fields.

2. **Check what name you're entering:**
   - Try entering just the firstName
   - Try entering firstName + lastName with space
   - Make sure there are no extra spaces

3. **Monitor the request:**
   - Open DevTools (F12)
   - Go to Network tab
   - Look at the POST request to `/api/payments`
   - Check the FormData to see what name/phone is being sent

4. **Check server logs:**
   - The backend now logs the error
   - You should see console output showing what was received

### Example Matching Scenarios

With user in database: `{ firstName: "John", lastName: "Doe", phone: "0812345678" }`

These will now match:
- ✅ "John Doe" + "0812345678"
- ✅ "John" + "0812345678"
- ✅ "Doe" + "0812345678"
- ✅ "john doe" + "0812345678" (case insensitive)
- ✅ "JOHN DOE" + "0812345678" (case insensitive)

These will NOT match:
- ❌ "Jane Doe" + "0812345678" (wrong name)
- ❌ "John" + "0899999999" (wrong phone)

### Next Steps

1. **Restart your server** to load the updated code:
   ```bash
   # Kill the old process (Ctrl+C in terminal)
   # Then restart
   npm start
   ```

2. **Test the payment upload** again with:
   - A name that exists in the database
   - The correct phone number

3. **If still not working:**
   - Run the MongoDB query above to verify user exists
   - Check the server console for any error messages
   - Verify the phone number format matches exactly

### Common Issues

| Issue | Solution |
|-------|----------|
| User "Jane Doe" can't upload but exists in DB | Check firstName/lastName fields in DB |
| Says user not found but you know they registered | Verify exact phone number in database |
| Getting "Missing name or phone" error | Check FormData is being sent correctly |
| Getting 404 error on `/api/payments` | Ensure server is running and route is registered |

### Database Query to List All Users

If you need to find a specific user:
```bash
mongosh
use webcomcamp
db.users.find({}, { firstName: 1, lastName: 1, phone: 1 }).pretty()
```

This shows all users with their firstName, lastName, and phone fields.

---

**After making these changes, restart your backend server and try the payment upload again.**

If you still encounter issues, the improved error handling will help pinpoint the exact problem.

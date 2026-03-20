# RAZORPAY PAYMENT INTEGRATION DOCUMENTATION

## ✅ INTEGRATION STATUS

All components have been successfully integrated into your MERN e-commerce project. Below is a complete guide to finalize setup and test the integration.

---

## 📋 IMPLEMENTATION SUMMARY

### Backend Changes
✅ **Installed Packages**
- `razorpay` - Official Razorpay Node SDK

✅ **Created Files**
1. `backend/models/Order.js` - MongoDB Order schema with payment tracking
2. `backend/services/paymentService.js` - Payment processing service layer
3. `backend/routes/orderRoutes.js` - Order creation & payment verification endpoints

✅ **Updated Files**
1. `backend/server.js` - Registered order routes
2. `src/services/api.js` - Added payment API methods

✅ **Frontend Changes**
- Updated `src/pages/CheckoutPage.tsx` - Full Razorpay checkout integration

---

## 🔧 STEP 1: Get Razorpay Credentials

### Option A: Live Credentials (Production)
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Login with your business account
3. Navigate to **Settings → API Keys**
4. Copy your **Key ID** and **Key Secret**
5. Update `.env` with production keys

### Option B: Test Credentials (Development)
1. Go to [Razorpay Test Dashboard](https://dashboard.razorpay.com) (same URL, add `test` param)
2. Use test mode credentials
3. Use test card: **4111 1111 1111 1111** (any future expiry, any CVV)

### Update `.env`
```env
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
```

**CRITICAL:** Never expose `RAZORPAY_KEY_SECRET` to frontend. It's server-side only.

---

## 🧪 STEP 2: Test Payment Flow

### Test Credentials (Development)

**Test Card:**
- Number: `4111 1111 1111 1111`
- Expiry: Any future date (e.g., 12/25)
- CVV: Any 3 digits (e.g., 123)

**Test UPI:**
- Any UPI ID works in test mode
- Example: `test@upi`

**Test Wallet:**
- Razorpay provides mock wallet options

### Payment Flow Steps

1. **Start Server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend**
   ```bash
   cd landom_ecomm (root)
   npm run dev
   ```

3. **Test Flow**
   - Go to `http://localhost:5173`
   - Add products to cart
   - Go to checkout
   - Fill in delivery address (required fields marked with *)
   - Select "Online Payment (Razorpay)"
   - Click "Place Order"
   - Razorpay popup opens
   - Enter test card: `4111 1111 1111 1111`
   - Complete payment
   - Backend verifies signature
   - Order marked as paid
   - Stock reduced
   - Success page shown

---

## 🔒 SECURITY CHECKLIST

### ✅ Backend Security
1. **Signature Verification** - Done server-side using HMAC-SHA256
2. **Stock Double-Check** - Stock validated both before and after payment
3. **Amount Validation** - Price calculated server-side, not from frontend
4. **Idempotency** - Duplicate payment attempts handled gracefully
5. **Secret Protection** - `RAZORPAY_KEY_SECRET` never exposed to frontend

### ✅ Frontend Security
1. **Token Validation** - Only authenticated users can pay
2. **Amount Display Only** - Amount calculated on backend
3. **Secure Headers** - CORS, helmet, X-Frame-Options enabled
4. **Error Handling** - No sensitive info leaked in error messages

---

## 📁 FILE STRUCTURE

```
backend/
├── models/
│   └── Order.js                    (NEW - Order schema)
├── services/
│   └── paymentService.js           (NEW - Payment logic)
├── routes/
│   └── orderRoutes.js              (NEW - Order endpoints)
└── server.js                       (UPDATED - Added order routes)

src/
├── services/
│   └── api.js                      (UPDATED - Payment API methods)
└── pages/
    └── CheckoutPage.tsx            (UPDATED - Razorpay integration)
```

---

## 🛣️ API ENDPOINTS

### Create Order (Backend)
```http
POST /api/orders/create
Content-Type: application/json
Authorization: Bearer <accessToken>

{
  "products": [
    {
      "productId": "65abc123def456ghi789",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "address": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India"
  },
  "notes": "Deliver by 5 PM"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "65abc123def456ghi789",
    "razorpayOrderId": "order_xxxxx",
    "amount": 50000,
    "currency": "INR",
    "key": "rzp_test_XXXXX",
    "userName": "john@example.com"
  }
}
```

### Verify Payment (Backend)
```http
POST /api/orders/verify
Content-Type: application/json
Authorization: Bearer <accessToken>

{
  "razorpay_order_id": "order_xxxxx",
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_signature": "xxxxxxxxxxx"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully. Order confirmed.",
  "data": {
    "orderId": "65abc123def456ghi789",
    "razorpayOrderId": "order_xxxxx",
    "razorpayPaymentId": "pay_xxxxx",
    "status": "paid",
    "totalAmount": "500.00"
  }
}
```

### Get Order
```http
GET /api/orders/:orderId
Authorization: Bearer <accessToken>
```

### Get User Orders
```http
GET /api/orders?skip=0&limit=10
Authorization: Bearer <accessToken>
```

---

## 🐛 TROUBLESHOOTING

### Issue: "Razorpay script not loaded"
**Solution:** Check browser console for CORS errors. Verify Razorpay CDN is accessible.

### Issue: "Invalid payment gateway key"
**Solution:** Verify `RAZORPAY_KEY_ID` is correctly set in `.env`.

### Issue: "Signature verification failed"
**Solution:** This means payment was tampered with. Check logs, manually verify in Razorpay dashboard.

### Issue: "Out of stock after payment"
**Solution:** Product sold out between order creation and verification. Order marked as failed, user notified.

### Issue: Stock not reducing
**Solution:** Check backend logs. Stock update happens ONLY after signature verification.

---

## 📊 PAYMENT STATUS FLOW

```
User Clicks "Place Order"
         ↓
Order Created (paymentStatus: "pending")
         ↓
Razorpay Popup Opens
         ↓
User Enters Payment Details
         ↓
Payment Completes
         ↓
Signature Verified
         ↓
Order Updated (paymentStatus: "paid")
         ↓
Stock Reduced for All Products
         ↓
Success Page Shown
```

---

## 💳 PAYMENT METHODS SUPPORTED

Razorpay supports:
- Credit Cards (Visa, Mastercard, American Express)
- Debit Cards
- Net Banking (50+ Indian banks)
- UPI
- Digital Wallets (Google Pay, Apple Pay, Amazon Pay)
- Postpaid (BNPL)

---

## 🔄 EDGE CASES HANDLED

### 1. User Refresh After Payment
✅ Handled: Duplicate verify calls return cached result (idempotency)

### 2. Stock Update Failures
✅ Handled: If stock fails to update, order still marked as paid (manual adjustment needed)

### 3. Double Payment Attempts
✅ Handled: Returns 200 if already paid, no double deduction

### 4. Payment Failure After Order Creation
✅ Handled: Order remains with `paymentStatus: "pending"`, can retry

### 5. Out of Stock During Payment
✅ Handled: Stock validated after payment, order marked failed

---

## 📝 ENVIRONMENT VARIABLES

Add to `.env`:
```env
# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxx

# Frontend
VITE_API_URL=http://localhost:5000/api

# Existing
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MONGODB_URI=your_mongodb_uri
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret
```

---

## 🚀 PRODUCTION DEPLOYMENT

### Before Going Live

1. **Switch to Live Keys**
   - Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` with production keys
   - This happens automatically in production environment

2. **Enable HTTPS**
   - Razorpay requires HTTPS for all requests in production
   - Use Let's Encrypt for free SSL certificates

3. **Update CORS**
   - Replace `http://localhost:5173` with your production domain
   - Update `FRONTEND_URL` in `.env`

4. **Database Backup**
   - Ensure MongoDB backups are enabled
   - Test restore procedure

5. **Logging**
   - Implement proper logging for payment transactions
   - Monitor Razorpay webhooks

6. **Rate Limiting**
   - Already implemented on auth endpoints
   - Apply to payment endpoints if needed

---

## 📞 SUPPORT

### Razorpay Documentation
- [Official Docs](https://razorpay.com/docs)
- [Node.js SDK](https://github.com/razorpay/razorpay-node)
- [Test Cards](https://razorpay.com/docs/payments/cards/test-cards/)

### Common Issues
- Check Razorpay Status Page for outages
- Enable debug logging in payment service
- Contact Razorpay support for account issues

---

## ✨ KEY FEATURES IMPLEMENTED

✅ **Security**
- Server-side signature verification
- No secret exposure to frontend
- HMAC-SHA256 validation
- Timing-safe comparison

✅ **Reliability**
- Idempotency checks
- Stock validation before and after payment
- Duplicate payment prevention
- Comprehensive error handling

✅ **User Experience**
- Smooth Razorpay popup integration
- Loading states and feedback
- Toast notifications for all actions
- Fallback to Cash on Delivery option

✅ **Data Integrity**
- Amount calculated server-side
- Products validated before order
- Payment details stored securely
- Order history available

---

## 📈 NEXT STEPS

### Optional Enhancements

1. **Webhooks**
   ```javascript
   // Create endpoint for Razorpay webhooks
   POST /api/orders/webhook
   // Auto-update order status from Razorpay
   ```

2. **Email Notifications**
   ```javascript
   // Send order confirmation emails
   // Send payment receipt
   ```

3. **Admin Dashboard**
   - View all orders with payment status
   - Access payment details
   - Handle refunds

4. **Refund Processing**
   ```javascript
   POST /api/orders/:orderId/refund
   // Process refunds for cancelled orders
   ```

---

## 🎉 INTEGRATION COMPLETE

Your Razorpay payment integration is now ready for testing!

**Next Action:** Get test credentials from Razorpay and test the payment flow.

---

*Last Updated: October 2024*
*Razorpay Node SDK Version: Latest*
*MongoDB: 4.x+*

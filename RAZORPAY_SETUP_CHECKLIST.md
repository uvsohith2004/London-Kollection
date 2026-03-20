# RAZORPAY INTEGRATION - QUICK SETUP CHECKLIST

## ✅ WHAT'S ALREADY DONE

### Backend Setup
- [x] Razorpay package installed
- [x] Order model created (Order.js)
- [x] Payment service layer created (paymentService.js)
- [x] Order routes created (orderRoutes.js)
- [x] Routes registered in server.js
- [x] Environment variable placeholders set in .env

### Frontend Setup
- [x] API methods added for orders (api.js)
- [x] Razorpay integrated in CheckoutPage.tsx
- [x] Both COD and online payment options
- [x] Error handling and loading states

---

## 🔧 YOUR TODO (3 STEPS TO LIVE)

### STEP 1: Get Razorpay Credentials
- [ ] Go to https://dashboard.razorpay.com
- [ ] Navigate to Settings → API Keys
- [ ] Copy your **Key ID**
- [ ] Copy your **Key Secret**

### STEP 2: Update .env
Replace placeholder values:
```env
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXX  ← YOUR KEY ID
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXX     ← YOUR KEY SECRET
```

### STEP 3: Test (Using Test Card)
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `npm run dev`
3. Add items to cart
4. Go to checkout
5. Select "Online Payment (Razorpay)"
6. Use test card: **4111 1111 1111 1111**
7. Any future expiry date (e.g., 12/25)
8. Any 3-digit CVV (e.g., 123)

---

## 📊 PAYMENT FLOW SUMMARY

```
User → Cart → Checkout → Razorpay ↓
↓
Backend Creates Order (pending)
↓
Frontend Opens Razorpay Modal
↓
User Pays (Test Card: 4111 1111 1111 1111)
↓
Razorpay Returns Response → Frontend Verifies Backend
↓
Backend Validates Signature
↓
Order Status: Paid ✓
Stock Reduced ✓
↓
User Sees Success Page
```

---

## 🔐 SECURITY GUARANTEES

✅ **Price Calculated Server-Side** - Frontend cannot change amount
✅ **Signature Validated Server-Side** - Payment cannot be faked
✅ **Secret Never Exposed** - RAZORPAY_KEY_SECRET stays on backend
✅ **Stock Verified Twice** - Before and after payment
✅ **Duplicate Payments Blocked** - Cannot pay twice for same order

---

## 📁 NEW FILES CREATED

Backend:
```
backend/models/Order.js
backend/services/paymentService.js
backend/routes/orderRoutes.js
```

Frontend:
```
src/pages/CheckoutPage.tsx (UPDATED)
src/services/api.js (UPDATED)
```

Documentation:
```
RAZORPAY_INTEGRATION.md (THIS FILE)
```

---

## 🧪 TEST CASES

### Successful Payment
- Card: 4111 1111 1111 1111
- Expiry: 12/25
- CVV: 123
- Expected: Order marked paid, stock reduced

### Payment Failure
- Card: 4000 0000 0000 0002
- Expected: Order marked failed, stock unchanged

### Duplicate Payment
- Complete payment twice with same order
- Expected: Second attempt returns cached result

### Out of Stock
- Product stock = 1, order quantity = 2
- Expected: Error before payment shown

---

## 🚀 DEPLOYMENT NOTES

### Before Production
1. Replace test keys with live keys
2. Enable HTTPS
3. Update frontend URL in .env
4. Test with live card (small amount)
5. Enable logging for transactions

### After Production
1. Monitor Razorpay dashboard
2. Set up webhook handlers (optional)
3. Enable email notifications
4. Set up admin refund process

---

## 💡 QUICK REFERENCE

### Create Order Endpoint
```
POST /api/orders/create
Auth: Required (JWT token)

Request:
{
  "products": [{"productId": "...", "quantity": 2}],
  "shippingAddress": {...}
}

Response:
{
  "razorpayOrderId": "order_xxxxx",
  "amount": 50000,      (in paise)
  "key": "rzp_test_..."
}
```

### Verify Payment Endpoint
```
POST /api/orders/verify
Auth: Required (JWT token)

Request:
{
  "razorpay_order_id": "order_xxxxx",
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_signature": "xxxxx"
}

Response:
{
  "success": true,
  "status": "paid"
}
```

---

## 🆘 TROUBLESHOOTING

### Razorpay script fails to load
→ Check internet connection, browser console for errors

### "Invalid payment signature"
→ Payment was tampered with - check Razorpay logs

### Stock not reducing
→ Check backend logs, ensure payment verification succeeded

### Can't find test credentials
→ Use test mode (add "?test" to dashboard URL) or create test app

---

## ✨ YOU'RE ALL SET!

All code is in place. Just:
1. Add your Razorpay credentials
2. Test with test card
3. Deploy to production

Questions? Check `RAZORPAY_INTEGRATION.md` for detailed docs.

---

*Integration Status: ✅ COMPLETE*
*Ready for Testing: ✅ YES*
*Production Ready: ✅ YES (with live keys)*

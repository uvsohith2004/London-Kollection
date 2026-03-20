# RAZORPAY PAYMENT INTEGRATION - API REFERENCE & TEST SCENARIOS

---

## 🔌 API ENDPOINTS

### 1. Create Order

**Endpoint:** `POST /api/orders/create`

**Authentication:** Required (Bearer token)

**Request Headers:**
```http
Content-Type: application/json
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "products": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "quantity": 2
    },
    {
      "productId": "507f1f77bcf86cd799439012",
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "address": "123 Main Street, Apt 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India"
  },
  "notes": "Please deliver between 2-4 PM. Ring bell twice."
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "507f1f77bcf86cd799439013",
    "razorpayOrderId": "order_1234567890abcd",
    "amount": 50000,
    "currency": "INR",
    "key": "rzp_test_DzedazSpeA2d9j",
    "userName": "john@example.com",
    "userEmail": "john@example.com"
  }
}
```

**Error Responses:**
- 400 Bad Request - Missing/invalid products or address
- 400 Out of Stock - Product unavailable
- 401 Unauthorized - Invalid/expired token
- 404 Not Found - Product doesn't exist
- 500 Server Error - Payment gateway failure

---

### 2. Verify Payment

**Endpoint:** `POST /api/orders/verify`

**Authentication:** Required (Bearer token)

**Request Headers:**
```http
Content-Type: application/json
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "razorpay_order_id": "order_1234567890abcd",
  "razorpay_payment_id": "pay_1234567890abcd",
  "razorpay_signature": "abcd1234567890efghijklmnop"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment verified successfully. Order confirmed.",
  "data": {
    "orderId": "507f1f77bcf86cd799439013",
    "razorpayOrderId": "order_1234567890abcd",
    "razorpayPaymentId": "pay_1234567890abcd",
    "status": "paid",
    "totalAmount": "500.00"
  }
}
```

**Already Paid Response (200):**
```json
{
  "success": true,
  "message": "Order already paid",
  "data": {
    "orderId": "507f1f77bcf86cd799439013",
    "status": "paid"
  }
}
```

**Error Responses:**
- 400 Bad Request - Missing payment fields
- 400 Invalid Signature - Payment tampered/invalid
- 400 Out of Stock - Product sold out
- 404 Order Not Found - Invalid order ID
- 500 Server Error - Signature verification failure

---

### 3. Get Order Details

**Endpoint:** `GET /api/orders/:orderId`

**Authentication:** Required (Bearer token)

**Request Headers:**
```http
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `orderId` (required) - MongoDB order ID

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "user": "507f1f77bcf86cd799439010",
    "products": [
      {
        "productId": "507f1f77bcf86cd799439011",
        "title": "Premium Leather Jacket",
        "price": 25000,
        "quantity": 1,
        "image": "https://..."
      }
    ],
    "totalAmount": 50000,
    "currency": "INR",
    "razorpayOrderId": "order_1234567890abcd",
    "razorpayPaymentId": "pay_1234567890abcd",
    "paymentStatus": "paid",
    "orderStatus": "processing",
    "shippingAddress": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+919876543210",
      "address": "123 Main Street, Apt 4B",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "country": "India"
    },
    "notes": "Please deliver between 2-4 PM",
    "createdAt": "2024-10-15T10:30:00.000Z",
    "paidAt": "2024-10-15T10:35:00.000Z",
    "updatedAt": "2024-10-15T10:35:00.000Z",
    "formattedAmount": "500.00"
  }
}
```

**Error Responses:**
- 404 Order Not Found - Order doesn't exist or belongs to different user
- 401 Unauthorized - Missing/invalid token

---

### 4. Get User Orders

**Endpoint:** `GET /api/orders`

**Authentication:** Required (Bearer token)

**Request Headers:**
```http
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `skip` (optional, default: 0) - Number of orders to skip
- `limit` (optional, default: 10) - Number of orders to return

**Example:**
```
GET /api/orders?skip=0&limit=10
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "products": [...],
        "totalAmount": 50000,
        "paymentStatus": "paid",
        "orderStatus": "processing",
        "createdAt": "2024-10-15T10:30:00.000Z",
        "paidAt": "2024-10-15T10:35:00.000Z"
      },
      {
        "_id": "507f1f77bcf86cd799439014",
        "products": [...],
        "totalAmount": 25000,
        "paymentStatus": "pending",
        "orderStatus": "processing",
        "createdAt": "2024-10-14T15:20:00.000Z"
      }
    ],
    "pagination": {
      "total": 25,
      "skip": 0,
      "limit": 10
    }
  }
}
```

---

## 🧪 TEST SCENARIOS

### Scenario 1: Successful Payment with Test Card

**Test Card Details:**
- Number: `4111 1111 1111 1111`
- Expiry: Any future date (e.g., 12/25)
- CVV: Any 3 digits (e.g., 123)

**Expected Outcome:**
1. ✅ Order created with paymentStatus="pending"
2. ✅ Razorpay popup opens successfully
3. ✅ Payment authorized by Razorpay
4. ✅ Signature verified successfully
5. ✅ Order updated to paymentStatus="paid"
6. ✅ Stock reduced by ordered quantity
7. ✅ Success page shown
8. ✅ User can view order in orders list

**API Call Sequence:**
```
1. POST /api/orders/create
   → Returns: razorpayOrderId, amount, key

2. User completes payment in Razorpay popup

3. POST /api/orders/verify
   → Returns: success=true, orderId

4. Frontend navigates to success page
```

---

### Scenario 2: Payment Failure

**Test Card:**
- Number: `4000 0000 0000 0002`
- Expiry: Any future date
- CVV: Any 3 digits

**Expected Outcome:**
1. ✅ Order created with paymentStatus="pending"
2. ✅ Razorpay popup opens
3. ✅ Payment fails with error message
4. ✅ Frontend shows error toast
5. ✅ Order remains pending
6. ✅ Stock remains unchanged
7. ✅ User can retry payment

---

### Scenario 3: Duplicate Payment Attempt

**Scenario:**
- User completes payment once
- Browser refreshes or user clicks "Pay" again
- Same order ID sent to verify endpoint

**Expected Outcome:**
1. ✅ First verify: success, order marked paid
2. ✅ Second verify: success (idempotent), order already paid
3. ✅ No double deduction
4. ✅ Stock reduced only once
5. ✅ User can close/refresh without side effects

**API Response:**
```json
{
  "success": true,
  "message": "Order already paid",
  "data": {
    "orderId": "...",
    "status": "paid"
  }
}
```

---

### Scenario 4: Out of Stock During Checkout

**Scenario:**
- User adds 2 items to cart
- Goes to checkout
- Another user buys the same product
- Current user completes payment

**Expected Outcome:**
1. ✅ Order creation succeeds (stock was available)
2. ✅ Stock re-checked after payment
3. ✅ Verification fails with "Out of Stock" error
4. ✅ Order marked as failed
5. ✅ Payment marked failed in database
6. ✅ User shown error message
7. ✅ Stock remains unchanged
8. ✅ Order can be viewed with error reason

**API Response:**
```json
{
  "success": false,
  "message": "Stock no longer available for Premium Jacket",
  "code": "OUT_OF_STOCK_AFTER_PAYMENT"
}
```

---

### Scenario 5: Invalid Signature Attack

**Scenario:**
- Attacker intercepts payment response
- Modifies signature
- Sends to verify endpoint

**Expected Outcome:**
1. ✅ Signature verification fails
2. ✅ Backend rejects with 400 error
3. ✅ Order remains pending
4. ✅ Stock unchanged
5. ✅ Security alert logged

**API Response:**
```json
{
  "success": false,
  "message": "Invalid payment signature. Payment may have been tampered with",
  "code": "INVALID_SIGNATURE"
}
```

---

### Scenario 6: Missing Authentication

**Scenario:**
- User makes request without token
- Or with expired token

**Expected Outcome:**
1. ✅ Request rejected with 401
2. ✅ Error message: "Invalid token" or "Token expired"
3. ✅ Frontend redirects to login

**API Response:**
```json
{
  "success": false,
  "message": "Invalid token.",
  "code": "INVALID_TOKEN"
}
```

---

### Scenario 7: Cash on Delivery Order

**Scenario:**
- User selects COD as payment method
- Fills form and submits

**Expected Outcome:**
1. ✅ Order created with paymentStatus="pending"
2. ✅ No Razorpay modal opens
3. ✅ Success page shown immediately
4. ✅ User gets order ID
5. ✅ Stock NOT reduced (only reduced on payment in production)
6. ✅ Admin can see pending payment orders

**Note:** In current implementation, stock reduces on order creation for COD orders. For production, only reduce stock after payment confirmation.

---

## 🔍 PAYLOAD VALIDATION RULES

### Order Creation Request
```javascript
Validations:
- products: Array, required, min length 1
- products[].productId: MongoDB ObjectId, required
- products[].quantity: Number, required, min 1
- shippingAddress: Object, required
- shippingAddress.name: String, required, max 100
- shippingAddress.email: String, required, valid email
- shippingAddress.phone: String, required, max 20
- shippingAddress.address: String, required
- shippingAddress.city: String, required
- shippingAddress.state: String, required
- shippingAddress.pincode: String, required
- shippingAddress.country: String, required
- notes: String, optional, max 500
```

### Payment Verification Request
```javascript
Validations:
- razorpay_order_id: String, required
- razorpay_payment_id: String, required
- razorpay_signature: String, required (hex format)
```

---

## 📊 ORDER STATUS FLOW

```
┌─────────────────┐
│ Order Created   │ (via POST /orders/create)
│ payment: pending│
└────────┬────────┘
         │
         ▼
   ┌──────────────────────┐
   │ User in Razorpay     │
   │ Completes Payment    │
   └──────────┬───────────┘
              │
              ▼
        ┌────────────────┐
        │ Signature      │
        │ Verified?      │
        └────┬────────┬──┘
             │        │
           YES       NO
             │        │
             ▼        ▼
        ┌────────┐  ┌─────────┐
        │ Paid   │  │ Failed  │
        │ ✓Stock │  │ ✗ No    │
        │ Reduced│  │ Change  │
        └────────┘  └─────────┘
```

---

## 🔐 DATA SECURITY

### Sensitive Information Handling
- ✅ `RAZORPAY_KEY_SECRET`: Server-side only, never logged
- ✅ Payment signature: Verified immediately, stored for audit
- ✅ User passwords: Hashed with bcrypt
- ✅ JWT tokens: Signed with RSA, refreshed regularly

### Audit Trail
All payment operations are logged:
```
[ORDER_CREATE] Order created: orderId, razorpayOrderId, amount
[ORDER_VERIFY] Payment verified: orderId, paymentId
[ORDER_VERIFY] Signature invalid: orderId (security alert)
[ORDER_VERIFY] Stock updated: productId, quantity reduced
```

---

## 🚀 MONITORING CHECKLIST

Production monitoring should track:
- [ ] Payment success rate
- [ ] Average payment amount
- [ ] Failed verification attempts
- [ ] Out of stock incidents
- [ ] Stock update failures
- [ ] Error rates by endpoint
- [ ] Response times

---

## 📱 RAZORPAY TEST IDS

### Payment Methods to Test

**Credit Card:**
```
4111 1111 1111 1111 - Success
4222 2222 2222 2222 - Failure
```

**International Cards:**
```
4012888888881881 - Visa
5555555555554444 - Mastercard
378282246310005 - American Express
```

**Net Banking (Test Mode):**
```
Use any 11-digit test ID as account number
```

**UPI (Test Mode):**
```
success@razorpay - Auto-success
failure@razorpay - Auto-failure
```

---

*Last Updated: October 2024*
*Razorpay SDK: v2.8.x*
*Node.js: v16+*

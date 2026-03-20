# Architecture Explanation

## 🏗️ System Architecture

This authentication system follows production-ready best practices with a focus on security, scalability, and maintainability.

---

## 🔐 Security Architecture Decisions

### 1. **Why Password Hashing is Needed**

**Problem**: Storing passwords in plaintext is catastrophic. If the database is compromised, all user passwords are immediately exposed.

**Solution**: bcrypt with 12 salt rounds
- **One-way hashing**: Impossible to reverse the hash to get the original password
- **Salt**: Each password gets a unique random salt, preventing rainbow table attacks
- **12 rounds**: Computational cost makes brute-force attacks impractical (takes ~300ms per hash)
- **Adaptive**: Can increase rounds as hardware improves

**Trade-off**: Slight performance cost (~300ms per hash) vs. security. Security wins.

---

### 2. **Why Refresh Token Rotation**

**Problem**: If a refresh token is stolen, an attacker can use it indefinitely until it expires (7 days).

**Solution**: Rotate refresh tokens on each refresh
- When user refreshes access token, issue a NEW refresh token
- Invalidate the old refresh token in the database
- If an attacker steals a refresh token and uses it, the legitimate user's next refresh will fail
- This limits the attack window and provides detection capability

**Implementation**:
```javascript
// Old token is invalidated when new one is saved
await User.saveRefreshToken(userId, newRefreshToken);
```

**Trade-off**: Slightly more complex logic vs. enhanced security. Security wins.

---

### 3. **Why NOT Store JWT in localStorage**

**Problem**: localStorage is accessible to JavaScript, making it vulnerable to XSS attacks.

**Attack Scenario**:
1. Attacker injects malicious script via XSS
2. Script reads `localStorage.getItem('token')`
3. Token is stolen and sent to attacker's server
4. Attacker can impersonate the user

**Solution**: 
- **Access Token**: Store in memory (React state/Zustand). Lost on page refresh, but that's acceptable for short-lived tokens (15m).
- **Refresh Token**: Store in httpOnly cookie. JavaScript cannot access it, protecting against XSS.

**Trade-off**: 
- Access token lost on refresh → User must refresh token (automatic via refresh token)
- Slightly more complex state management vs. security. Security wins.

---

### 4. **Access Token vs Refresh Token**

| Aspect | Access Token | Refresh Token |
|--------|-------------|---------------|
| **Purpose** | Authenticate API requests | Get new access tokens |
| **Lifetime** | 15 minutes | 7 days |
| **Storage** | Memory (state) | httpOnly Cookie |
| **Contains** | User ID, email, role | User ID, email only |
| **Frequency** | Sent with every request | Used only when access token expires |
| **Revocation** | Not stored in DB (stateless) | Stored in DB (can be revoked) |

**Why This Design?**
- **Short-lived access tokens**: Limit exposure if stolen. Even if compromised, expires in 15 minutes.
- **Long-lived refresh tokens**: Better UX (users don't re-login frequently), but stored securely.
- **Separation of concerns**: Access tokens for authorization, refresh tokens for authentication renewal.

---

### 5. **Stateless Authentication Architecture**

**What is Stateless?**
- No server-side session storage
- All user info encoded in JWT
- Server validates token signature, doesn't query database for each request

**Benefits**:
1. **Scalability**: No shared session store needed. Add servers horizontally.
2. **Performance**: No database lookup per request (except refresh token validation)
3. **Microservices**: Token can be validated by any service without shared state
4. **Resilience**: No single point of failure (session store)

**Trade-offs**:
- **Cannot revoke access tokens immediately**: Must wait for expiration (15m). Mitigated by refresh token revocation.
- **Token size**: JWT includes user data (larger than session ID). Acceptable for most use cases.

**How It Scales in Microservices**:
```
User → API Gateway → Service A (validates JWT) → Service B (validates JWT)
                    ↓
                 No shared session store needed!
```

Each service can validate the JWT independently using the shared secret.

---

## 📊 Database Schema Decisions

### User Table Structure

```sql
users (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,  -- Indexed for fast lookups
  password VARCHAR(255),       -- bcrypt hash (60 chars)
  role VARCHAR(20),            -- 'user' or 'admin'
  refresh_token TEXT,          -- Current refresh token (indexed)
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

**Decisions**:
- **UUID primary key**: Better for distributed systems, no sequential ID exposure
- **Email indexed**: Fast login lookups
- **refresh_token indexed**: Fast token validation
- **Role enum**: Prevents invalid roles

---

## 🔄 Request Flow

### Registration Flow
```
1. Client → POST /api/auth/register { name, email, password }
2. Server validates input (Zod)
3. Server checks if email exists
4. Server hashes password (bcrypt)
5. Server creates user in DB
6. Server generates access + refresh tokens
7. Server saves refresh token to DB
8. Server returns tokens + user data
9. Client stores access token in memory
10. Client stores refresh token in httpOnly cookie
```

### Login Flow
```
1. Client → POST /api/auth/login { email, password }
2. Server validates input
3. Server finds user by email
4. Server compares password (bcrypt.compare)
5. Server generates new tokens
6. Server saves refresh token (invalidates old one)
7. Server returns tokens + user data
8. Client stores tokens
```

### Protected Route Flow
```
1. Client → GET /api/users/profile
   Headers: Authorization: Bearer {accessToken}
2. Middleware extracts token from header
3. Middleware verifies JWT signature
4. Middleware checks expiration
5. Middleware attaches user to req.user
6. Controller returns user data
```

### Token Refresh Flow
```
1. Access token expires (15m)
2. Client → POST /api/auth/refresh { refreshToken }
3. Server verifies refresh token signature
4. Server checks if token exists in DB (rotation check)
5. Server generates NEW access + refresh tokens
6. Server saves NEW refresh token (invalidates old)
7. Server returns new tokens
8. Client updates tokens
```

---

## 🛡️ Security Layers

### 1. **Input Validation** (Zod)
- Prevents malformed data
- Type safety
- Prevents injection attacks

### 2. **Password Security** (bcrypt)
- Hashing prevents plaintext storage
- Salt prevents rainbow tables
- 12 rounds prevents brute force

### 3. **Token Security** (JWT)
- Signed tokens prevent tampering
- Short expiration limits exposure
- Refresh token rotation prevents reuse

### 4. **HTTP Security** (Helmet)
- Sets security headers
- Prevents XSS, clickjacking, etc.

### 5. **Rate Limiting**
- Prevents brute force attacks
- 5 requests per 15 minutes for auth routes

### 6. **CORS**
- Restricts origins
- Prevents unauthorized API access

### 7. **User Enumeration Prevention**
- Generic error messages
- Same response time for existing/non-existing users

---

## 🚀 Production Considerations

### Environment Variables
- Never commit `.env` files
- Use strong JWT secrets (32+ characters, random)
- Use different secrets for access/refresh tokens
- Rotate secrets periodically

### Database
- Use connection pooling
- Enable SSL/TLS
- Regular backups
- Monitor query performance

### Monitoring
- Log authentication attempts
- Monitor token refresh rates
- Alert on suspicious patterns
- Track failed login attempts

### Scaling
- Stateless design allows horizontal scaling
- Use load balancer
- Consider Redis for rate limiting (if needed)
- CDN for static assets

---

## 📝 Code Quality Principles

1. **Separation of Concerns**: Controllers, Models, Middleware, Routes
2. **Error Handling**: Centralized error handler
3. **Validation**: Schema-based with Zod
4. **Type Safety**: Consistent data structures
5. **Security First**: Every decision considers security implications
6. **No Console Logs**: Use proper logging library in production
7. **Async/Await**: Modern async patterns
8. **Clean Code**: Self-documenting, minimal comments

---

## 🎯 Summary

This architecture prioritizes:
1. **Security**: Multiple layers of protection
2. **Scalability**: Stateless, horizontal scaling
3. **Maintainability**: Clean code, separation of concerns
4. **User Experience**: Smooth authentication flow
5. **Production Ready**: Error handling, validation, monitoring ready

Every decision balances security, performance, and developer experience.

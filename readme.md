# 🔐 Auth System — JWT Access & Refresh Token Authentication

A secure, production-ready authentication REST API built with **Express 5**, **MongoDB**, and **JSON Web Tokens (JWT)**. It implements a full **access + refresh token** flow with session tracking, token rotation, and secure httpOnly cookies.

---

## ✨ Features

- **User Registration** — Create a new account with username, email & password
- **User Login** — Authenticate and receive a short-lived access token + long-lived refresh token
- **Get Current User** — Protected route that returns the logged-in user's profile
- **Token Refresh (Rotation)** — Exchange an expiring refresh token for a new access token & new refresh token (refresh token rotation for extra security)
- **Logout** — Revoke the active session and clear the refresh token cookie
- **Session Management** — Every login creates a session document storing the hashed refresh token, client IP, and user-agent
- **Password Hashing** — Passwords are hashed with SHA-256 before storage
- **Secure Cookies** — Refresh tokens are stored in `httpOnly`, `secure`, `sameSite: strict` cookies

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| [Express 5](https://expressjs.com/) | Web framework |
| [MongoDB](https://www.mongodb.com/) + [Mongoose 9](https://mongoosejs.com/) | Database & ODM |
| [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) | JWT signing & verification |
| [cookie-parser](https://www.npmjs.com/package/cookie-parser) | Parse cookies from requests |
| [dotenv](https://www.npmjs.com/package/dotenv) | Environment variable management |
| [nodemon](https://www.npmjs.com/package/nodemon) | Dev server with auto-reload |
| Node.js `crypto` | SHA-256 hashing for passwords & tokens |

---

## 📁 Project Structure

```
Auth System/
├── .env                          # Environment variables (not committed)
├── .gitignore
├── package.json
├── readme.md
└── src/
    ├── app.js                    # Entry point — Express server setup
    ├── config/
    │   ├── config.js             # Validates & exports env variables
    │   └── database.js           # MongoDB connection via Mongoose
    ├── controllers/
    │   └── auth.controller.js    # All auth logic (register, login, refresh, logout, getMe)
    ├── models/
    │   ├── user.model.js         # User schema (username, email, password)
    │   └── session.model.js      # Session schema (refresh token hash, IP, user-agent, revoked flag)
    └── routes/
        └── auth.routes.js        # API route definitions
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/auth-system.git
cd auth-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create a `.env` File

Create a `.env` file in the project root with:

```env
PORT=8000
MONGO_URI=mongodb://localhost:27017/auth-system
JWT_SECRET=your_super_secret_key_here
```

> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

### 4. Start the Development Server

```bash
npm run dev
```

The server will start at `http://localhost:8000` (or your custom `PORT`).

---

## 📡 API Endpoints

Base URL: `http://localhost:8000`

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Check if the server is running |

### Authentication

All auth routes are prefixed with `/api/user`.

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/user/register` | Register a new user | ❌ No |
| `POST` | `/api/user/login` | Login & get tokens | ❌ No |
| `GET` | `/api/user/get-me` | Get current user profile | ✅ Access Token |
| `GET` | `/api/user/refresh-token` | Refresh access token | ✅ Refresh Token (cookie) |
| `GET` | `/api/user/logout` | Logout & revoke session | ✅ Refresh Token (cookie) |

---

## 📋 API Usage & Examples

### 1. Register a New User

**`POST /api/user/register`**

Request Body:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "mySecurePassword123"
}
```

Success Response (`200`):
```json
{
  "success": true,
  "msg": "User registered successfully",
  "user": {
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

Error — User Already Exists (`409`):
```json
{
  "success": false,
  "msg": "User already registered"
}
```

---

### 2. Login

**`POST /api/user/login`**

Request Body:
```json
{
  "email": "john@example.com",
  "password": "mySecurePassword123"
}
```

Success Response (`200`):
```json
{
  "success": true,
  "msg": "User logged in successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

> A `refersehToken` cookie is also set automatically (httpOnly, secure, sameSite: strict, 7-day expiry).

---

### 3. Get Current User (Protected)

**`GET /api/user/get-me`**

Headers:
```
Authorization: Bearer <accessToken>
```

Success Response (`200`):
```json
{
  "success": true,
  "msg": "User Fetched Successfully",
  "user": {
    "_id": "664f...",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

---

### 4. Refresh Token

**`GET /api/user/refresh-token`**

> No body needed — the refresh token is read from the `refersehToken` cookie automatically.

Success Response (`200`):
```json
{
  "success": true,
  "msg": "Referesh token generated successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

> A new refresh token cookie replaces the old one (token rotation).

---

### 5. Logout

**`GET /api/user/logout`**

> No body needed — the refresh token cookie is read and the session is revoked.

Success Response (`200`):
```json
{
  "success": true,
  "msg": "Logout successfully"
}
```

---

## 🔒 How the Auth Flow Works

```
┌──────────┐          ┌──────────┐          ┌──────────┐
│  Client  │          │  Server  │          │ MongoDB  │
└────┬─────┘          └────┬─────┘          └────┬─────┘
     │  POST /login        │                     │
     │────────────────────>│                     │
     │                     │  Verify credentials │
     │                     │────────────────────>│
     │                     │  Create session     │
     │                     │────────────────────>│
     │                     │                     │
     │  Access Token (JSON)│                     │
     │  + Refresh Token    │                     │
     │    (httpOnly cookie) │                     │
     │<────────────────────│                     │
     │                     │                     │
     │  GET /get-me        │                     │
     │  (Bearer token)     │                     │
     │────────────────────>│                     │
     │  User profile       │                     │
     │<────────────────────│                     │
     │                     │                     │
     │  GET /refresh-token │                     │
     │  (cookie auto-sent) │                     │
     │────────────────────>│                     │
     │                     │  Rotate refresh     │
     │                     │  token in session   │
     │                     │────────────────────>│
     │  New Access Token   │                     │
     │  + New Refresh Token│                     │
     │<────────────────────│                     │
```

1. **Login** → Server verifies credentials, creates a Session document, returns a short-lived **access token** (3 min) in JSON and a long-lived **refresh token** (7 days) as an httpOnly cookie.
2. **Authenticated Requests** → Client sends the access token in the `Authorization: Bearer <token>` header.
3. **Token Refresh** → When the access token expires, client hits `/refresh-token`. The server validates the cookie, rotates the refresh token (old hash replaced with new hash in the session), and returns a new access token.
4. **Logout** → The session is marked as `revoked: true` and the cookie is cleared.

---

## 🗄️ Database Models

### User Model

| Field | Type | Constraints |
|---|---|---|
| `username` | String | Required, Unique |
| `email` | String | Required, Unique |
| `password` | String | Required (stored as SHA-256 hash) |

### Session Model

| Field | Type | Description |
|---|---|---|
| `user` | ObjectId (ref: User) | The user this session belongs to |
| `refreshToken` | String | SHA-256 hash of the refresh token |
| `ip` | String | Client IP address at login |
| `userAgent` | String | Client User-Agent string at login |
| `revoked` | Boolean | `false` by default, set to `true` on logout |
| `createdAt` | Date | Auto-generated timestamp |
| `updatedAt` | Date | Auto-generated timestamp |

---

## ⚙️ Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (defaults to `8000`) |
| `MONGO_URI` | ✅ Yes | MongoDB connection string |
| `JWT_SECRET` | ✅ Yes | Secret key for JWT signing |

---

## 📜 Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `npm run dev` | Start dev server with nodemon (auto-reload) |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.

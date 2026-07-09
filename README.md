# Social Media App — Phase 1: User Authentication

First step of the MERN stack build: **Register, Login, JWT Auth, Protected Route**

## 📁 Structure

```
social-media-app/
├── backend/     → Express + MongoDB + JWT API
└── frontend/    → React (Vite) + React Router
```

---

## 🔧 Backend Setup

1. Go to the folder:
   ```bash
   cd backend
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in the values:
   ```bash
   cp .env.example .env
   ```

   Get your connection string from MongoDB Atlas and set it as `MONGO_URI`.
   (Atlas dashboard → Database → Connect → "Connect your application")

   Set `JWT_SECRET` to any long random string (e.g. a random paragraph).

3. Start the server:
   ```bash
   npm run dev
   ```
   Server runs at: `http://localhost:5000`

### API Endpoints

| Method | Route              | Access  | Description                    |
|--------|--------------------|---------|---------------------------------|
| POST   | /api/auth/register | Public  | Create a new user               |
| POST   | /api/auth/login    | Public  | Log in, returns a JWT token     |
| GET    | /api/auth/me       | Private | Get the logged-in user's info   |

When testing `/me` with Postman, add this header:
```
Authorization: Bearer <token>
```

---

## 💻 Frontend Setup

1. In a new terminal:
   ```bash
   cd frontend
   npm install
   ```

2. Copy `.env.example` to `.env` (change the API URL if needed):
   ```bash
   cp .env.example .env
   ```

3. Run it:
   ```bash
   npm run dev
   ```
   Open in browser: `http://localhost:5173`

### Pages
- `/register` — create a new account
- `/login` — log in
- `/dashboard` — visible only after logging in (protected route)

---

## ✅ What's included in this phase

- [x] User model (Mongoose) + bcrypt password hashing
- [x] Register API
- [x] Login API (JWT token generation)
- [x] Auth middleware (protect routes)
- [x] Get logged-in user info (`/me`)
- [x] React: Register/Login forms
- [x] Auth state management via React Context
- [x] Token stored in localStorage
- [x] Protected route (Dashboard visible only when logged in)

## ⏭️ Next Step (Phase 2)

- Profile update, avatar/cover photo upload
- Follow / Friend request system

---

## ⚠️ Notes

- Styling hasn't been finalized yet (you mentioned you'd handle it later) — currently only basic CSS is included so the forms look usable. You can later add Tailwind, Bootstrap, or your own design without breaking any functionality.
- Never push the `.env` file to GitHub — it's already added to `.gitignore`.

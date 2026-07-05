# Social Media App — Phase 1: User Authentication

MERN stack এর প্রথম ধাপ: **Register, Login, JWT Auth, Protected Route**

## 📁 Structure

```
social-media-app/
├── backend/     → Express + MongoDB + JWT API
└── frontend/    → React (Vite) + React Router
```

---

## 🔧 Backend Setup

1. ফোল্ডারে যান:
   ```bash
   cd backend
   npm install
   ```

2. `.env.example` কপি করে `.env` বানান এবং মান বসান:
   ```bash
   cp .env.example .env
   ```

   MongoDB Atlas থেকে connection string নিয়ে `MONGO_URI` এ বসান।
   (Atlas ড্যাশবোর্ড → Database → Connect → "Connect your application")

   `JWT_SECRET` এ যেকোনো র‍্যান্ডম লম্বা string দিন (যেমন: একটা paragraph)।

3. সার্ভার চালান:
   ```bash
   npm run dev
   ```
   সার্ভার চলবে: `http://localhost:5000`

### API Endpoints

| Method | Route              | Access  | কাজ                      |
|--------|--------------------|---------|--------------------------|
| POST   | /api/auth/register | Public  | নতুন ইউজার তৈরি          |
| POST   | /api/auth/login    | Public  | লগইন, JWT token রিটার্ন  |
| GET    | /api/auth/me       | Private | লগইন করা ইউজারের তথ্য    |

Postman দিয়ে টেস্ট করার সময় `/me` এ যাওয়ার জন্য header এ দিন:
```
Authorization: Bearer <token>
```

---

## 💻 Frontend Setup

1. নতুন টার্মিনালে:
   ```bash
   cd frontend
   npm install
   ```

2. `.env.example` কপি করে `.env` বানান (দরকার হলে API URL পরিবর্তন করুন):
   ```bash
   cp .env.example .env
   ```

3. চালান:
   ```bash
   npm run dev
   ```
   ব্রাউজারে খুলুন: `http://localhost:5173`

### Pages
- `/register` — নতুন অ্যাকাউন্ট তৈরি
- `/login` — লগইন
- `/dashboard` — লগইন করার পর দেখা যাবে (protected route)

---

## ✅ এই Phase এ যা যা আছে

- [x] User model (Mongoose) + bcrypt password hashing
- [x] Register API
- [x] Login API (JWT token generate)
- [x] Auth middleware (protect routes)
- [x] Get logged-in user info (`/me`)
- [x] React: Register/Login form
- [x] React Context দিয়ে auth state management
- [x] localStorage এ token সংরক্ষণ
- [x] Protected route (Dashboard শুধু লগইন করলে দেখা যাবে)

## ⏭️ পরবর্তী ধাপ (Phase 2)

- Profile update, avatar/cover photo upload
- Follow / Friend request system

---

## ⚠️ নোট

- এখনো **styling** ঠিক করা হয়নি (আপনি বলেছিলেন "পরে ঠিক করব") — বর্তমানে শুধু basic CSS দেওয়া আছে যাতে ফর্মগুলো দেখতে ব্যবহারযোগ্য লাগে। পরে চাইলে Tailwind, Bootstrap বা নিজের ডিজাইন বসাতে পারবেন — কোনো ফাংশনালিটি ভাঙবে না।
- `.env` ফাইল কখনো GitHub এ push করবেন না — `.gitignore` এ `.env` যোগ করে নিন।

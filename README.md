# 🎓 StudyNotion

**StudyNotion** is a full-stack online learning platform built using the **MERN Stack (MongoDB, Express, React, Node.js)**.  
It enables students to explore and enroll in courses, while instructors can create, manage, and publish their own courses — all in one place.

---

## 🚀 Key Features

- 🔐 Secure Authentication & Authorization (JWT-based)
- 👥 Role-based access (Student & Instructor)
- 📚 Browse, search, and filter courses
- 🧑‍🏫 Instructor dashboard for course management
- 🛒 Course purchase & enrollment flow
- 💳 Razorpay payment gateway integration
- ☁️ Media uploads using Cloudinary
- 📧 Email support (OTP, password reset)
- 📊 User dashboards with progress tracking
- 🎨 Responsive UI with Tailwind CSS

---

## 🧱 Tech Stack

**Frontend**
- React.js
- Tailwind CSS

**Backend**
- Node.js
- Express.js

**Database**
- MongoDB

**Other Tools & Services**
- Cloudinary (media storage)
- Razorpay (payments)
- JWT (authentication)

---


---

## 🛠️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Rahul-mandal01/StudyNotion.git
cd StudyNotion
```

## 3️⃣ Environment Variables
```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

```


## 🌐 Usage

- Open `http://localhost:3000`
- Sign up as **Student** or **Instructor**
- Students can browse and enroll in courses
- Instructors can create and manage courses
- Payments are handled securely via **Razorpay**

---

## 📜 Available Scripts

| Command | Description |
|--------|------------|
| `npm run dev` | Run project |
| `npm run build` | Build frontend for production |

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository  
2. Create a new branch (`feature/your-feature`)  
3. Commit your changes  
4. Push to your branch  
5. Open a Pull Request  

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🙌 Author

**Rahul Kumar Mandal**  
GitHub: [Rahul-mandal01](https://github.com/Rahul-mandal01)

---

⭐ If you like this project, consider giving it a star!

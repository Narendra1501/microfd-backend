# Project Report: Micro Feedback

Welcome to the Micro Feedback project! This document is created for junior developers to easily understand what this project is, how it works, and how to set it up. 

---

## 1. Project Overview

### What is the project?
**Micro Feedback** is a full-stack web application designed for students and faculty. It allows students to submit feedback about their courses and provides teachers with a dashboard to track their performance, share notes, and interact with students.

### Purpose of the project
The main goal of this project is to improve the quality of teaching. By collecting feedback efficiently, teachers can understand student needs better. Additionally, the platform provides tools like file sharing and chat to make communication easier.

---

## 2. Tech Stack

We used the **MERN** stack (with a small change: we use Vite instead of regular Create React App) to build this project.

*   **Frontend (User Interface):** 
    *   **React.js (with Vite):** Makes building fast and interactive user interfaces easy.
    *   **Tailwind CSS:** Used for styling the website quickly without writing a lot of custom CSS.
    *   **Recharts:** A library used to draw beautiful graphs and charts on the teacher's dashboard.
*   **Backend (Server & Logic):**
    *   **Node.js & Express.js:** The core engine that handles our API requests and runs our server logic.
*   **Database:**
    *   **MongoDB (with Mongoose):** A NoSQL database that stores all our data (Users, Feedback, Notes, Chats) in flexible formats.
*   **Important Tools:**
    *   **JWT (JSON Web Token) & bcrypt:** Keeps user logins secure by encrypting passwords and managing sessions.
    *   **Nodemailer:** Used to send automated emails (like OTPs for login).
    *   **Node-Cron:** Automatically schedules tasks (like sending a weekly report to teachers).

---

## 3. Project Architecture

The project is divided into two main parts that talk to each other:

*   **Frontend (The Face):** Everything the user sees and clicks on in the browser. It doesn't talk to the database directly. Instead, when you click a button (like "Submit Feedback"), it sends a request over the internet to the backend.
*   **Backend (The Brain):** An invisible server that receives requests from the frontend. It checks if the user is authorized, saves or gets data from the MongoDB database, and sends a final response (like "Success" or "Error") back to the frontend.
*   **How they communicate:** They talk to each other using **REST APIs** (a standard way of sending data) in JSON format. The frontend uses a tool called `Axios` to make these API calls.

---

## 4. Folder Structure

Here are the most important folders you need to know:

### `/frontend`
*   `src/components/`: Reusable pieces of the UI (like a Button, Navbar, or Card).
*   `src/pages/`: Entire page views (like Login Page, Dashboard Page).
*   `src/services/`: Javascript files that connect to the backend API (`axios` calls live here).

### `/backend`
*   `models/`: Defines how data looks in our database (e.g., `User.js`, `Feedback.js`).
*   `routes/`: The URLs the frontend can call (e.g., `/api/auth/login`).
*   `controllers/`: The actual logic that happens when a route is called (e.g., "Check if password matches").
*   `config/`: Setup files, like connecting to the database (`db.js`).

---

## 5. Features Explanation

*   **Authentication & OTP Login:** Users can sign up and log in securely. For better security, they receive a One-Time Password (OTP) in their email which they must enter to log in.
*   **Feedback Submission:** A simple form where students can leave comments and ratings for their courses.
*   **Admin/Teacher Dashboard:** A visual page filled with charts where teachers can see their overall performance from student feedback.
*   **Notes Upload:** Teachers can upload study materials (PDFs, PPTs) for their students to download.
*   **Chat System:** A simple messaging feature to help students clear their doubts with faculty.
*   **Weekly Automated Emails:** Every week, the system automatically collects feedback data and sends an email report to the teachers so they know how they are doing.

---

## 6. Setup Instructions

Want to run this project on your laptop? Follow these simple steps:

1.  **Open the project:** Open a terminal inside the project root folder.
2.  **Install Backend Packages:** 
    *   Navigate to backend: `cd backend`
    *   Run: `npm install`
3.  **Install Frontend Packages:** 
    *   Open a new terminal window.
    *   Navigate to frontend: `cd frontend`
    *   Run: `npm install`
4.  **Setup Environment Variables:**
    *   In the `backend` folder, create a file named `.env`.
    *   Add your local `MONGO_URI`, `JWT_SECRET`, and email details (`EMAIL_USER`, `EMAIL_PASS`).
5.  **Start the Backend:** Inside the backend terminal, run `npm run dev`. (It usually runs on port 5000).
6.  **Start the Frontend:** Inside the frontend terminal, run `npm run dev`. It will give you a local link (like `http://localhost:5173`) to open in your browser.

---

## 7. Important Code Flow

When managing data, we follow a standard flow. Let's use **Submitting Feedback** as an example:

1.  **Frontend Component:** The user fills out a Form in React and clicks "Submit".
2.  **Frontend Service:** React calls an API function in `src/services/`.
3.  **Backend Route:** The request hits `routes/feedbackRoutes.js` in the backend.
4.  **Backend Controller:** The route sends it to `controllers/feedbackController.js`, which checks the data.
5.  **Database Pattern:** The controller uses `models/Feedback.js` to save the answer permanently into MongoDB.
6.  **Response:** The backend sends a "success" message back, and React shows a "Thank You" popup to the user!

---

## 8. Challenges & Solutions

While building this, we faced a few common issues:

*   **CORS Error:** The browser blocked the frontend from talking to the backend because they were on different ports. 
    *   *Fix:* We installed and configured the `cors` middleware in our Express backend to allow the frontend's specific URL.
*   **Security for Forgot Password:** We didn't want anyone resetting passwords randomly.
    *   *Fix:* We created an OTP model. It generates a 6-digit code, sends it via email through Nodemailer, and verifies it before allowing a password change.
*   **Missing Files on Deployment:** Sometimes our backend couldn't find our index file on cloud servers.
    *   *Fix:* We double-checked the package.json `start` script and ensured all entry points were correctly defined.

---

## 9. Future Improvements

There is always room for growth! Here is what we can add later:

*   **Real-time Chatting:** Currently, users might need to refresh to see chat messages. Upgrading to real-time WebSockets (like `Socket.io`) will make chats instantaneous like WhatsApp.
*   **More Advanced Charts:** Adding pie charts and dynamic filters to the dashboard so teachers can slice their data by dates and specific subjects.
*   **Export Analytics to PDF:** A button for teachers to download their monthly performance as a beautiful, printable PDF.

---

## 10. Conclusion

This project uses the MERN stack to solve a real-world problem—bridging communication between students and teachers. Taking it step by step—from learning how Routes connect to Controllers, to understanding how React builds the interface—is the best way to master it. Good luck exploring the code!

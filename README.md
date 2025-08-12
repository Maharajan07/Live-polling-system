# Live Polling & Chat System

---
A full-stack real-time application enabling interactive polls and chat between teachers and students. Built with React, Express.js, and Socket.IO, the system allows teachers to create polls, students to answer in real-time, and both roles to engage via live chat.

🔗 Live Demo: https://live-polling-system-idn9.onrender.com

---

## ✨ Features
### 🎓 Teacher Panel
Create and launch polls instantly

View live poll results in real time

Ask new questions only when the previous poll is completed

Configure poll duration (default 60 seconds)

Remove students from the session

### 🧑‍🎓 Student Panel
Join with a unique name per browser tab

Submit answers when a poll is active

View results immediately after submission or timeout

Participate in real-time chat with the teacher and other students

### 💬 Real-Time Chat
Instant two-way messaging

Role-based display of messages (Teacher / Student)

No page refresh required

----

🚀 Run Locally
1️⃣ Clone the Project
```bash
git clone https://github.com/Maharajan07/live-polling-system
cd live-polling-system
```
2️⃣ Install Dependencies
```bash
# Client
cd client
npm install

# Server
cd ../server
npm install
```
3️⃣ Build Client for Production
```bash
cd client
npm run build
```
4️⃣ Serve Build from Server
```bash
Ensure the build output (dist folder) is referenced inside the server’s index.js for production serving.
```
5️⃣ Start the Server
```bash
cd server
npm start
```
----
### 🛠 Tech Stack
Frontend: React (Vite), Tailwind CSS

Backend: Node.js, Express.js, Socket.IO

Real-Time Communication: WebSockets (Socket.IO)

Deployment: Render

----

#### Made by Maharajan!

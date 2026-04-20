# 🚀 DevTrack — Developer Issue Tracker SaaS

A full-stack project tracking platform built with **Node.js**, **Next.js**, **MongoDB**, **Docker**, and deployed on **AWS EC2** via **GitHub Actions CI/CD**.

---

## 📸 Features

- 🔐 **JWT Authentication** — Register, login, protected routes
- 📁 **Project Management** — Create, view, delete projects with color labels
- 🐛 **Issue Tracking** — Full CRUD with status, priority, tags, assignees
- 📊 **Kanban Board** — Issues organized by To Do / In Progress / Done
- 🐳 **Docker** — Fully containerized with Docker Compose
- ⚙️ **CI/CD** — GitHub Actions pipeline → AWS EC2 deployment
- 🌐 **Nginx** — Reverse proxy with rate limiting & security headers

---

## 🧱 Tech Stack

| Layer      | Technology                         |
|------------|-------------------------------------|
| Frontend   | Next.js 14 (App Router), Tailwind CSS |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB + Mongoose                  |
| Auth       | JWT (JSON Web Tokens)               |
| DevOps     | Docker, Docker Compose, Nginx       |
| CI/CD      | GitHub Actions                      |
| Hosting    | AWS EC2                             |

---

## 📁 Project Structure

```
devtrack/
├── client/                     # Next.js 14 frontend
│   ├── app/
│   │   ├── layout.js           # Root layout + AuthProvider
│   │   ├── page.js             # Root redirect
│   │   ├── globals.css         # Design tokens + global styles
│   │   ├── login/page.js
│   │   ├── register/page.js
│   │   ├── dashboard/page.js
│   │   └── project/[id]/page.js
│   ├── components/
│   │   ├── Navbar.js
│   │   ├── ProjectCard.js
│   │   ├── IssueCard.js
│   │   └── Modal.js
│   ├── services/api.js         # Axios instance + API calls
│   ├── context/AuthContext.js  # Global auth state
│   └── package.json
│
├── server/                     # Node.js + Express backend
│   └── src/
│       ├── config/db.js        # MongoDB connection
│       ├── models/
│       │   ├── User.js
│       │   ├── Project.js
│       │   └── Issue.js
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── projectController.js
│       │   └── issueController.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── projectRoutes.js
│       │   └── issueRoutes.js
│       ├── middleware/authMiddleware.js
│       ├── app.js
│       └── server.js
│
├── docker/
│   ├── Dockerfile.client       # Multi-stage Next.js build
│   └── Dockerfile.server       # Multi-stage Node.js build
│
├── nginx/
│   └── nginx.conf              # Reverse proxy + rate limiting
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml           # GitHub Actions pipeline
│
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js 18+
- MongoDB (or use Docker)
- Docker & Docker Compose (for containerized setup)

---

### Option A — Docker Compose (Recommended)

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/devtrack.git
cd devtrack

# 2. Create environment file
cp server/.env.example server/.env
# Edit server/.env with your values

# 3. Start everything
docker-compose up -d

# App is live at:
# Frontend → http://localhost:3000
# Backend  → http://localhost:5000
# Via Nginx → http://localhost:80
```

---

### Option B — Manual Setup

**Backend:**
```bash
cd server
cp .env.example .env
# Edit .env — set MONGO_URI, JWT_SECRET
npm install
npm run dev
# API runs on http://localhost:5000
```

**Frontend:**
```bash
cd client
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000
npm install
npm run dev
# UI runs on http://localhost:3000
```

---

## 🔑 Environment Variables

### Server (`server/.env`)

| Variable        | Description                     | Default                              |
|-----------------|----------------------------------|--------------------------------------|
| `PORT`          | API port                         | `5000`                               |
| `NODE_ENV`      | Environment                      | `development`                        |
| `MONGO_URI`     | MongoDB connection string        | `mongodb://mongo:27017/devtrack`     |
| `JWT_SECRET`    | Secret for signing JWTs          | **Change in production!**            |
| `JWT_EXPIRES_IN`| Token expiry                     | `7d`                                 |
| `CLIENT_URL`    | Allowed CORS origin              | `http://localhost:3000`              |

### Client (`client/.env.local`)

| Variable                | Description          |
|-------------------------|----------------------|
| `NEXT_PUBLIC_API_URL`   | Backend API base URL |

---

## 📡 API Reference

### Auth
```
POST   /api/auth/register    Register new user
POST   /api/auth/login       Login + receive JWT
GET    /api/auth/me          Get current user (protected)
```

### Projects
```
GET    /api/projects         Get all user projects
POST   /api/projects         Create project
GET    /api/projects/:id     Get single project
PUT    /api/projects/:id     Update project
DELETE /api/projects/:id     Delete project + issues
```

### Issues
```
GET    /api/issues?projectId=xxx    Get issues for project
POST   /api/issues                  Create issue
GET    /api/issues/:id              Get single issue
PUT    /api/issues/:id              Update issue
DELETE /api/issues/:id              Delete issue
```

All project and issue routes require `Authorization: Bearer <token>` header.

---

## ☁️ AWS EC2 Deployment

### 1. Launch EC2 Instance
- AMI: Ubuntu 22.04 LTS
- Instance type: t2.micro (free tier)
- Security group: open ports **22**, **80**, **443**, **3000**, **5000**

### 2. SSH into Instance
```bash
ssh -i your-key.pem ubuntu@<EC2-PUBLIC-IP>
```

### 3. Install Docker
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose git
sudo usermod -aG docker $USER
newgrp docker
```

### 4. Clone & Run
```bash
git clone https://github.com/yourusername/devtrack.git
cd devtrack

# Set up env
cp server/.env.example server/.env
nano server/.env   # set JWT_SECRET + CLIENT_URL

docker-compose up -d
```

### 5. Access App
```
http://<EC2-PUBLIC-IP>       (via Nginx on port 80)
http://<EC2-PUBLIC-IP>:3000  (direct frontend)
http://<EC2-PUBLIC-IP>:5000  (direct API)
```

---

## ⚙️ GitHub Actions CI/CD Setup

Add these **Secrets** in your GitHub repo (`Settings → Secrets → Actions`):

| Secret                  | Value                          |
|-------------------------|--------------------------------|
| `EC2_HOST`              | Your EC2 public IP             |
| `EC2_USER`              | `ubuntu`                       |
| `EC2_SSH_KEY`           | Private key content (PEM)      |
| `JWT_SECRET`            | Strong random string           |
| `CLIENT_URL`            | `http://<EC2-IP>`              |
| `NEXT_PUBLIC_API_URL`   | `http://<EC2-IP>:5000`         |

**Pipeline flow on `git push main`:**
```
Push → Lint/Test → Build Docker Images → Push to GHCR → SSH Deploy to EC2
```

---

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f server
docker-compose logs -f client

# Rebuild after code changes
docker-compose up -d --build

# Stop all
docker-compose down

# Stop + delete volumes (wipes DB)
docker-compose down -v
```

---

## 🗺️ Code Flow

```
User fills Login Form
    ↓
POST /api/auth/login
    ↓
authController.login()
    ↓
Validate email + bcrypt.compare(password)
    ↓
jwt.sign({ id }) → token
    ↓
Token stored in cookie (js-cookie)
    ↓
AuthContext sets user state
    ↓
Redirect → /dashboard
    ↓
All API calls include Authorization: Bearer <token>
    ↓
authMiddleware.protect() verifies token on every request
```

---

## 📄 License

MIT © 2024 DevTrack

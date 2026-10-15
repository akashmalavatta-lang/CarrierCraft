# CC — Career Craft: Production Deployment Guide
> **Build Your Skills. Craft Your Career. Crack Your Dream Job.**

This guide explains how to deploy **Career Craft** live to the internet for **100% FREE** with **zero budget** and **no credit card required**, tailored specifically for students.

---

## 📋 Overview of Deployment Methods

| Method | Backend Host | Frontend Host | Cost | Difficulty | Best For |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Method 1 (Recommended)** | **Render.com** (Web Service) | **Vercel** (Edge CDN) | **$0 / Free** | ⭐ Easy | Best performance, instant live updates on Git push |
| **Method 2 (Single Service)** | **Render.com** (Unified Full-Stack) | Served via Flask | **$0 / Free** | ⭐ Very Easy | Single URL, zero CORS configuration |
| **Method 3 (Containers)** | **Railway / Koyeb / Docker** | Docker Container | **$0 / Free** | ⭐⭐ Moderate | Self-hosting or container clouds |

---

## Step 0: Push Code to GitHub

All cloud deployment platforms connect directly to your GitHub account to build and deploy automatically.

1. Open your terminal in the project folder:
   ```bash
   cd "c:\Users\Akash P malavatta\OneDrive\Desktop\GFG"
   ```
2. Commit all files:
   ```bash
   git add .
   git commit -m "feat: complete Career Craft full-stack platform and deployment configuration"
   ```
3. Create a new repository on [GitHub](https://github.com/new) (named `career-craft`).
4. Link your local repo and push:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/career-craft.git
   git push -u origin main
   ```

---

## 🚀 Method 1 (Recommended): Render (Backend) + Vercel (Frontend)

### Part A: Deploy Flask Backend to Render.com

1. Sign up for free at [render.com](https://render.com) using your GitHub account.
2. From the dashboard, click **"New +"** &rarr; **"Web Service"**.
3. Select **"Build and deploy from a Git repository"** and choose your `career-craft` repository.
4. Fill in the service configuration:
   - **Name**: `career-craft-api` *(or any unique name)*
   - **Region**: Choose the closest region (e.g. `Singapore`, `Frankfurt`, or `Oregon`)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn run:app`
   - **Instance Type**: **Free** ($0/month)
5. Scroll down to **"Environment Variables"** and add:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `SECRET_KEY` | *(generate a random string)* | E.g. `cc-secret-prod-2026-key` |
   | `JWT_SECRET_KEY` | *(generate a random string)* | E.g. `cc-jwt-secret-prod-2026-key` |
   | `CORS_ORIGINS` | `*` | Or set to your Vercel URL once deployed |
   | `FLASK_ENV` | `production` | Production mode |
6. Click **"Create Web Service"**.
   - Render will build and deploy your backend in ~2 minutes.
   - Once deployed, copy your backend URL (e.g., `https://career-craft-api.onrender.com`).
   - Test it by visiting: `https://career-craft-api.onrender.com/api/health` &rarr; should show `{"status": "ok"}`!

---

### Part B: Deploy React Frontend to Vercel

1. Sign up for free at [vercel.com](https://vercel.com) using your GitHub account.
2. From the dashboard, click **"Add New..."** &rarr; **"Project"**.
3. Import your `career-craft` repository.
4. Configure Project settings:
   - **Framework Preset**: `Vite` *(auto-detected)*
   - **Root Directory**: Click "Edit" and select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **"Environment Variables"** and add:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://career-craft-api.onrender.com/api` *(your Render backend URL + `/api`)* |
6. Click **"Deploy"**.
   - Vercel will build and publish your website globally in under 60 seconds!
   - You will get a live URL like: `https://career-craft.vercel.app`.

---

## 🌟 Method 2: All-in-One Unified Deployment (Single Service on Render)

If you prefer to have **only ONE service** with a single unified URL (no separate frontend/backend):

1. On Render, create a Web Service pointing to your repo:
   - **Root Directory**: leave blank (root of repository)
   - **Build Command**:
     ```bash
     cd frontend && npm install && npm run build && cd ../backend && pip install -r requirements.txt
     ```
   - **Start Command**:
     ```bash
     cd backend && gunicorn run:app
     ```
2. Flask will automatically detect `frontend/dist` and serve the React interface and all API routes on the exact same port and domain!

---

## 🐳 Method 3: Container Deployment with Docker

A production-ready multi-stage `Dockerfile` and `docker-compose.yml` are already included in the root directory:

To run or deploy with Docker:
```bash
docker-compose up --build -d
```
The application will automatically build the React assets, launch Gunicorn with 2 workers, and serve the application on port `5000`.

---

## 🔒 Security & Free Tier Maintenance Tips

1. **Render Free Tier Spin-Down**:
   - Render's free tier spins down web services after 15 minutes of inactivity. When a new visitor accesses the app, it may take 30-50 seconds to wake up.
   - *Tip*: You can set up a free uptime monitor like [UptimeRobot](https://uptimerobot.com) to ping `https://your-api.onrender.com/api/health` every 10 minutes to keep it warm!
2. **Database Persistence**:
   - The default configuration uses SQLite inside the `instance/` directory.
   - For a production database that persists indefinitely across re-deploys on Render, you can create a free PostgreSQL database on Render (**"New +"** &rarr; **"PostgreSQL"**) and paste the connection string into the `DATABASE_URL` environment variable.
3. **CORS Security**:
   - In `backend/app/__init__.py`, `CORS_ORIGINS` defaults to `*`. Once your Vercel site is live, update Render's `CORS_ORIGINS` environment variable to `https://your-app.vercel.app` for strict origin isolation.

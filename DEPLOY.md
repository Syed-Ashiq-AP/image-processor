# Deployment Guide

## Railway Deployment (Recommended - Easiest)

Railway automatically detects and deploys monorepo projects.

### Steps:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push
   ```

2. **Deploy on Railway:**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect both services
   - Click "Deploy"

3. **Configuration:**
   - Railway will create 2 services automatically:
     - Python API (auto-detected from `api/` folder)
     - Next.js Frontend (auto-detected from `package.json`)
   
4. **Environment Variables (Auto-configured):**
   - `PYTHON_API_URL` will be automatically set
   - Services can communicate via internal networking

**Cost:** Free tier includes 500 hours/month

---

## Render Deployment

### Steps:

1. **Push to GitHub** (if not already done)

2. **Deploy on Render:**
   - Go to [render.com](https://render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will read `render.yaml` and create both services

3. **Manual Setup (Alternative):**
   - Create Web Service for API:
     - Build Command: `pip install -r api/requirements-local.txt`
     - Start Command: `cd api && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Create Web Service for Frontend:
     - Build Command: `npm install && npm run build`
     - Start Command: `npm start`

**Cost:** Free tier available (spins down after inactivity)

---

## Docker Deployment (DigitalOcean, Fly.io, etc.)

### Using Docker Compose (Local or VPS):

```bash
# Build and run
docker-compose up --build

# Run in background
docker-compose up -d
```

Access:
- Frontend: http://localhost:3000
- API: http://localhost:8000

### Deploy to DigitalOcean App Platform:

1. Push to GitHub
2. Go to [cloud.digitalocean.com](https://cloud.digitalocean.com)
3. Click "Create" → "Apps"
4. Select GitHub repository
5. DigitalOcean will detect Dockerfiles
6. Configure:
   - API: Use `Dockerfile.api`
   - Frontend: Use `Dockerfile.frontend`

**Cost:** Starting at $5/month

---

## Fly.io Deployment

### Steps:

1. **Install Fly CLI:**
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   
   # macOS/Linux
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login:**
   ```bash
   flyctl auth login
   ```

3. **Deploy API:**
   ```bash
   flyctl launch --config fly.toml --dockerfile Dockerfile.api
   flyctl deploy
   ```

4. **Deploy Frontend:**
   Create `fly-frontend.toml` for frontend and deploy similarly.

**Cost:** Free tier includes 3 shared VMs

---

## Comparison

| Platform | Setup Difficulty | Cost | Best For |
|----------|-----------------|------|----------|
| **Railway** | ⭐ Easiest | Free tier | Quick deployment |
| **Render** | ⭐⭐ Easy | Free tier | Stable hosting |
| **Docker + VPS** | ⭐⭐⭐ Medium | $5/mo | Full control |
| **Fly.io** | ⭐⭐⭐ Medium | Free tier | Global edge |

---

## Quick Deploy Commands

### Railway
```bash
git push  # That's it! Railway auto-deploys
```

### Render
```bash
# Just connect GitHub, Render does the rest
```

### Docker (Any VPS)
```bash
docker-compose up -d
```

### Fly.io
```bash
flyctl launch
flyctl deploy
```

---

## Recommended: Railway

For the easiest deployment with full rembg support, use Railway:
1. ✅ Zero configuration needed
2. ✅ Auto-detects monorepo structure
3. ✅ Free tier available
4. ✅ Automatic HTTPS
5. ✅ Easy environment variables
6. ✅ Supports large Python packages

Simply push to GitHub and connect Railway!

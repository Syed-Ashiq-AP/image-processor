# Image Background Removal & Processing

A Next.js + Python application for professional AI-powered background removal and image processing.

## Features

- 🎨 **AI Background Removal** - High-quality background removal using rembg (U2-Net model)
- 📁 **Upload or URL** - Process images from file upload or direct URL
- 🎨 **Custom Backgrounds** - Transparent, RGB, or custom color backgrounds
- 📏 **Smart Resize** - Resize with automatic aspect ratio preservation
- 💾 **Multiple Formats** - Export as PNG, JPEG, or WebP
- 🚀 **Vercel Ready** - Deploy both Next.js and Python API together

## Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS, shadcn/ui
- **Backend**: Python FastAPI with rembg (AI background removal)
- **AI Model**: U2-Net via rembg library
- **Deployment**: Vercel (unified deployment)

## Local Development Setup

### Prerequisites

- Node.js 18+
- Python 3.9+
- pip

### Installation

**First time setup - Install all dependencies:**

**Option 1: Using npm (Recommended)**

```bash
npm run install:all
```

**Option 2: Using platform-specific scripts**

**Windows (PowerShell):**

```powershell
.\install.ps1
```

**Linux/macOS (Bash):**

```bash
chmod +x install.sh
./install.sh
```

This will:

- ✅ Install Node.js dependencies
- ✅ Create Python virtual environment (venv)
- ✅ Install Python dependencies in isolated environment

### Running the Application

**Option 1: Using npm scripts (Recommended)**

```bash
npm run start
```

This will automatically start both servers using the virtual environment.

To stop both servers:

```bash
npm run stop:all
```

**Option 2: Using platform-specific scripts**

**Windows (PowerShell):**

```powershell
.\start.ps1
.\stop.ps1
```

**Linux/macOS (Bash):**

```bash
chmod +x start.sh stop.sh
./start.sh
./stop.sh
```

**Option 3: Manual setup**

**Terminal 1 - Python API:**

```bash
cd api
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

**Terminal 2 - Next.js:**

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment Options

### Quick Deploy to Railway (Recommended)

Railway is the easiest way to deploy this app with full background removal support.

**One-Click Deploy:**
1. Push to GitHub
2. Go to [railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select this repository
5. Done! Railway auto-deploys both services

See [DEPLOY.md](DEPLOY.md) for detailed deployment guides for Railway, Render, Docker, Fly.io, and more.

### Local Deployment (Best Quality)

The app works best when run locally with full rembg support for professional-quality background removal.

**Why Local is Better:**
- ✅ Uses rembg with U2-Net AI model (professional quality)
- ✅ No size/performance limitations
- ✅ Completely free with no API costs
- ✅ Works offline after initial setup
- ✅ GPU acceleration support (if available)

### Cloud Deployment Alternatives

**Note:** Vercel has limitations for Python packages like rembg (250MB limit, no native compilation).

**Recommended platforms for full functionality:**

1. **Railway.app** - Best for Python + Next.js
   - Supports large Python packages
   - Easy deployment from GitHub
   - Free tier available

2. **Render.com** - Good Docker support
   - Can run both services
   - Supports native packages

3. **DigitalOcean App Platform** - Simple container deployment
   - Full Python support
   - Affordable pricing

4. **Fly.io** - Great for Docker deployments
   - Worldwide edge deployment
   - Free tier available

### Vercel Deployment (Image Processing Only)

You can deploy to Vercel for basic image processing (resize, format conversion, background colors) without AI background removal:

```bash
npx vercel --prod
```

The Python API will work for image manipulation but background removal will be unavailable due to package size limits.

## How It Works

1. **Upload**: User uploads image or provides URL
2. **Configure**: Set background color, dimensions, and output format
3. **Process**: Next.js sends request to Python API
4. **AI Removal**: rembg removes background using U2-Net AI model
5. **Transform**: Image is resized and background color applied
6. **Download**: Processed image returned in selected format

## Benefits

- ✅ **Professional Quality** - Uses rembg with U2-Net AI model (same quality as Remove.bg)
- ✅ **Free & Open Source** - No API keys, no rate limits, completely free
- ✅ **Best Performance** - Server-side processing with Python (not browser-based)
- ✅ **Offline Capable** - Works offline after initial model download (~180MB)
- ✅ **Privacy First** - All processing happens locally, no data sent to third parties
- ✅ **Flexible Aspect Ratios** - Preset ratios (16:9, 1:1, etc.) or custom dimensions

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # Next.js API routes (proxy to Python)
│   └── page.tsx           # Main page
├── api/                    # Python FastAPI backend
│   ├── main.py            # Background removal API
│   └── requirements.txt   # Python dependencies
├── components/            # React components
│   ├── image-processor.tsx
│   └── ui/               # shadcn components
└── vercel.json           # Vercel deployment config
```

## API Endpoints

### POST /api/remove-background

Remove background from an image.

**Parameters:**

- `file`: Image file (multipart/form-data)
- `imageUrl`: Image URL (alternative to file)
- `backgroundColor`: Color value (e.g., "transparent", "rgb(255,255,255)", "#ffffff")
- `width`: Target width in pixels (optional)
- `height`: Target height in pixels (optional)
- `format`: Output format - "png", "jpeg", or "webp"

**Response:** Processed image file

## License

MIT

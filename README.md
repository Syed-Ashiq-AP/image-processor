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

### 1. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
cd api
pip install -r requirements.txt
cd ..
```

### 2. Run Development Servers

**Terminal 1 - Python API:**

```bash
cd api
python -m uvicorn main:app --reload --port 8000
```

**Terminal 2 - Next.js:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Vercel Deployment

This project is configured for single-command deployment to Vercel with both Next.js and Python APIs.

### Quick Deploy

#### Option 1: Deploy via Vercel Dashboard (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Vercel will automatically detect Next.js and deploy everything
4. Done! Your app will be live in minutes

#### Option 2: Deploy via CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel --prod
```

Vercel will automatically:
- Build and deploy the Next.js frontend
- Deploy the Python FastAPI backend as serverless functions (`/api/index.py`)
- Configure routing between them
- Generate a production URL

### Environment Variables

No environment variables needed! The app works out of the box.

The Python API and Next.js will communicate on the same domain automatically.

## How It Works

1. **Upload**: User uploads image or provides URL
2. **Configure**: Set background color, dimensions, and output format
3. **Process**: Next.js sends request to Python API
4. **AI Removal**: rembg removes background using U2-Net AI model
5. **Transform**: Image is resized and background color applied
6. **Download**: Processed image returned in selected format

## Benefits

- ✅ **Professional Quality** - Same quality as paid services like Remove.bg
- ✅ **Free & Open Source** - No API keys or rate limits
- ✅ **GPU Support** - Can use GPU for faster processing (when available)
- ✅ **Offline Capable** - Works offline after initial model download
- ✅ **Scalable** - Serverless functions scale automatically on Vercel

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

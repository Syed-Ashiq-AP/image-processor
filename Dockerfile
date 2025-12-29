# Multi-stage Dockerfile for Next.js + Python FastAPI
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (skip custom install script)
RUN npm ci --ignore-scripts

# Copy source files
COPY next.config.ts tsconfig.json ./
COPY components.json eslint.config.mjs postcss.config.mjs ./
COPY app ./app
COPY components ./components
COPY lib ./lib
COPY public ./public

# Build Next.js app
RUN npm run build

# Python + Node.js runtime stage
FROM python:3.11-slim

WORKDIR /app

# Install Node.js 20 in the Python image
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Copy Python requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Python API code
COPY api/ ./api/

# Copy Next.js build from frontend-builder
COPY --from=frontend-builder /app/.next ./.next
COPY --from=frontend-builder /app/node_modules ./node_modules
COPY --from=frontend-builder /app/package.json ./package.json
COPY --from=frontend-builder /app/public ./public

# Copy Next.js config files
COPY next.config.ts tsconfig.json ./
COPY app ./app
COPY components ./components
COPY lib ./lib
COPY components.json eslint.config.mjs postcss.config.mjs ./

# Expose ports
EXPOSE 3000 8000

# Create start script that runs both servers
RUN echo '#!/bin/bash\n\
set -e\n\
cd /app/api && uvicorn main:app --host 0.0.0.0 --port 8000 &\n\
PYTHON_PID=$!\n\
cd /app && NODE_ENV=production PORT=3000 npx next start &\n\
NODE_PID=$!\n\
wait $PYTHON_PID $NODE_PID\n\
' > /app/start.sh && chmod +x /app/start.sh

CMD ["/app/start.sh"]

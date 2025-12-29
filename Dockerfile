# Multi-stage Dockerfile for Next.js + Python FastAPI
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy app files and build
COPY . .
RUN npm run build

# Python + Node.js runtime stage
FROM python:3.11-slim

WORKDIR /app

# Install Node.js in the Python image
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
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

# Expose ports
EXPOSE 3000 8000

# Create start script
RUN echo '#!/bin/bash\n\
cd /app/api && uvicorn main:app --host 0.0.0.0 --port 8000 &\n\
cd /app && npm start\n\
wait' > /app/start.sh && chmod +x /app/start.sh

CMD ["/app/start.sh"]

# Stage 1: Build frontend
FROM node:22-slim AS frontend-build
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 2: Python backend + built frontend
FROM python:3.12-slim

WORKDIR /app

# Install system deps for lxml (used by beautifulsoup4)
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc libxml2-dev libxslt1-dev && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/

# Copy built frontend
COPY --from=frontend-build /frontend/dist ./frontend/dist

# Create directories for data and images
RUN mkdir -p /app/data /app/images

ENV DATA_DIR=/app/data
ENV IMAGES_DIR=/app/images

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

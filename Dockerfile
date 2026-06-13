# --- Stage 1: Build Frontend ---
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Final Image ---
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies for Postgres
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./

# Copy built frontend from Stage 1 to the 'static' directory in backend
COPY --from=frontend-builder /app/frontend/dist ./static

# Set environment variables for Hugging Face
ENV PORT=7860
ENV PYTHONUNBUFFERED=1

# Expose the port Hugging Face expects
EXPOSE 7860

# Command to run the application
# We use uvicorn to serve the FastAPI app which now also serves the frontend
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-7860}"]

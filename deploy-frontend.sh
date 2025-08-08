#!/bin/bash

# Frontend Deployment Script for Google Cloud Run

echo "🚀 Starting Frontend Deployment..."

# Set project variables
PROJECT_ID="apialchemists-1-47b9"
SERVICE_NAME="advisor-copilot-frontend"
REGION="us-central1"
BACKEND_URL="https://advisor-copilot-backend-608187465720.us-central1.run.app"

# Navigate to frontend directory
cd frontend

# Create production environment file
echo "REACT_APP_API_URL=$BACKEND_URL" > .env.production

# Create Dockerfile for frontend if it doesn't exist
cat > Dockerfile << 'EOF'
# Multi-stage build for React app
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . ./
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
EOF

# Create nginx configuration
cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 8080;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;

        # Handle React Router
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Enable gzip compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
    }
}
EOF

echo "📦 Building and deploying frontend to Cloud Run..."

# Build and deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
    --source . \
    --platform managed \
    --region $REGION \
    --project $PROJECT_ID \
    --allow-unauthenticated \
    --port 8080 \
    --memory 1Gi \
    --cpu 1 \
    --timeout 300s \
    --max-instances 10

# Get the deployed URL
echo "✅ Frontend deployed successfully!"
FRONTEND_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --project $PROJECT_ID --format 'value(status.url)')
echo "🔗 Frontend URL: $FRONTEND_URL"

echo "🧪 Testing deployed frontend..."
curl -I "$FRONTEND_URL"

echo "✨ Frontend deployment complete!"
echo "🌐 Access your app at: $FRONTEND_URL"

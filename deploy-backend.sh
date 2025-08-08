#!/bin/bash

# Backend Deployment Script for Google Cloud Run with Service Account

echo "🚀 Starting Backend Deployment with Service Account..."

# Set project variables
PROJECT_ID="apialchemists-1-47b9"
SERVICE_NAME="apialchemistproject-backend"
REGION="us-central1"
SERVICE_ACCOUNT="project-service-account@apialchemists-1-47b9.iam.gserviceaccount.com"


# Build Docker image from project root (where Dockerfile is located)
echo "📦 Building Docker image for backend..."
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"
gcloud builds submit --tag $IMAGE_NAME ..

# Deploy to Cloud Run using the built image
echo "� Deploying backend to Cloud Run with service account..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --project $PROJECT_ID \
    --allow-unauthenticated \
    --port 8080 \
    --memory 2Gi \
    --cpu 2 \
    --timeout 300s \
    --max-instances 10 \
    --service-account $SERVICE_ACCOUNT \
    --set-env-vars PROJECT_ID=$PROJECT_ID,DATASET_NAME=apialchemists,LOCATION=$REGION

# Get the deployed URL
echo "✅ Backend deployed successfully with service account!"
BACKEND_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --project $PROJECT_ID --format 'value(status.url)')
echo "🔗 Backend URL: $BACKEND_URL"
echo "👤 Service Account: $SERVICE_ACCOUNT"

echo "🧪 Testing deployed backend..."
# Test health endpoint
curl "$BACKEND_URL/"
curl "$BACKEND_URL/auth-check"

echo "✨ Backend deployment complete!"

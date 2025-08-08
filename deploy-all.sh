#!/bin/bash

# Complete Deployment Script for Private Banking Advisor Copilot

echo "🏦 Private Banking Advisor Copilot - Complete Deployment"
echo "======================================================="

# Set project variables
PROJECT_ID="apialchemists-1-47b9"
REGION="us-central1"

# Authenticate with Google Cloud (if needed)
echo "🔐 Checking Google Cloud authentication..."
gcloud auth list

# Set the project
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔧 Enabling required Google Cloud APIs..."
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable bigquery.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable aiplatform.googleapis.com

# Deploy backend first
echo "📡 Deploying backend service..."
chmod +x deploy-backend.sh
./deploy-backend.sh

# Wait a moment for backend to be ready
echo "⏳ Waiting for backend to be fully ready..."
sleep 30

# Deploy frontend
echo "🖥️ Deploying frontend service..."
chmod +x deploy-frontend.sh
./deploy-frontend.sh

# Get final URLs
BACKEND_URL=$(gcloud run services describe advisor-copilot-backend --platform managed --region $REGION --project $PROJECT_ID --format 'value(status.url)')
FRONTEND_URL=$(gcloud run services describe advisor-copilot-frontend --platform managed --region $REGION --project $PROJECT_ID --format 'value(status.url)')

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================="
echo "🔗 Backend URL:  $BACKEND_URL"
echo "🌐 Frontend URL: $FRONTEND_URL"
echo ""
echo "📋 Next Steps:"
echo "1. Update CORS settings in backend if needed"
echo "2. Test all endpoints and UI functionality" 
echo "3. Download Looker configuration from dashboard"
echo "4. Set up monitoring and alerts"
echo ""
echo "🧪 Quick Health Check:"
curl -f "$BACKEND_URL/auth-check" && echo "✅ Backend healthy" || echo "❌ Backend issues"
curl -f -I "$FRONTEND_URL" && echo "✅ Frontend healthy" || echo "❌ Frontend issues"

echo ""
echo "✨ Your Private Banking Advisor Copilot is now live!"

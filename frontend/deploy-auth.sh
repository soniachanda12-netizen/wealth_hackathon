#!/bin/bash

# Token-based Authentication Deployment Script
# This deploys the frontend with the new token-based authentication system

set -e

echo "🔐 Deploying Private Banking Advisor Copilot with Token Authentication"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the frontend directory."
    exit 1
fi

# Set environment variables for production
export REACT_APP_API_URL="https://apialchemistproject-backend-608187465720.us-central1.run.app"

echo "📦 Installing dependencies..."
npm install

echo "🏗️  Building React application..."
npm run build

echo "🚀 Deploying to Cloud Run..."

# Deploy to Cloud Run with the authentication requirements
gcloud run deploy apialchemistproject-frontend \
  --source . \
  --platform managed \
  --region us-central1 \
  --project apialchemists-1-47b9 \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --concurrency 80 \
  --set-env-vars="REACT_APP_API_URL=https://apialchemistproject-backend-608187465720.us-central1.run.app" \
  --allow-unauthenticated \
  --quiet

echo "✅ Frontend deployed successfully!"
echo ""
echo "🔗 Frontend URL: https://apialchemistproject-frontend-608187465720.us-central1.run.app"
echo ""
echo "🔐 Authentication Information:"
echo "=================================================="
echo "The frontend now requires authentication before loading."
echo "Users can authenticate in two ways:"
echo ""
echo "1. Google Account Sign-In (Recommended)"
echo "   - Click 'Sign in with Google'"
echo "   - Use an authorized Google account"
echo ""
echo "2. Service Account Token (Advanced Users)"
echo "   - Generate token with: gcloud auth print-identity-token --audiences=https://apialchemistproject-backend-608187465720.us-central1.run.app"
echo "   - Paste token in the manual entry field"
echo ""
echo "⚠️  Important Notes:"
echo "- Users must have IAM permission 'roles/run.invoker' on the backend service"
echo "- The frontend validates authentication against the backend before allowing access"
echo "- Invalid or expired tokens are automatically cleared"
echo ""
echo "🧪 Testing:"
echo "1. Visit the frontend URL above"
echo "2. Try authentication with your Google account"
echo "3. Once authenticated, test all 8 advisor features"
echo ""
echo "📋 Next Steps:"
echo "- Configure OAuth client ID in TokenAuthContext.js for Google Sign-In"
echo "- Test end-to-end functionality with authenticated users"
echo "- Monitor authentication logs in Cloud Console"

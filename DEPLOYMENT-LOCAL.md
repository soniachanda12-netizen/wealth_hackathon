# Private Banking Advisor Copilot - Local Development Guide

## 🏠 Local Development Setup

For development and testing on your local machine.

## 🛠️ Prerequisites

- Python 3.8+
- Node.js 16+
- Google Cloud SDK
- BigQuery access

## 🚀 Quick Start

### Step 1: Setup Database
```bash
# Create sample banking data
./setup_data.sh
```

### Step 2: Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Set environment variables
export PROJECT_ID=apialchemists-1-47b9
export DATASET_NAME=apialchemists
export LOCATION=us-central1
export GOOGLE_APPLICATION_CREDENTIALS="/home/prakashb/Desktop/Sonia Hacathon/apialchemists-1-47b9-556d040d8636.json"

# Start backend server
cd api
uvicorn main:app --reload --port 8000
```

### Step 3: Frontend Setup
```bash
# Navigate to frontend directory (if exists)
cd frontend

# Install Node.js dependencies
npm install

# Set API URL for local backend
export REACT_APP_API_URL=http://localhost:8000

# Start frontend development server
npm start
```

## 🧪 Testing Locally

### Test Backend API
```bash
# Test todo endpoint
curl http://localhost:8000/todo

# Test AI chat
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are my highest priority tasks?"}'

# Test portfolio insights
curl http://localhost:8000/portfolio

# Test NBA suggestions
curl http://localhost:8000/nba
```

### Test All Features
```bash
# Complete feature test suite
curl http://localhost:8000/todo
curl http://localhost:8000/nba  
curl http://localhost:8000/portfolio
curl -X POST http://localhost:8000/chat -H "Content-Type: application/json" -d '{"message": "Portfolio risk analysis"}'
curl -X POST http://localhost:8000/draft -H "Content-Type: application/json" -d '{"context": "quarterly review"}'
curl -X POST http://localhost:8000/calendar -H "Content-Type: application/json" -d '{"details": "meeting tomorrow 2pm"}'
curl -X POST http://localhost:8000/summarize -H "Content-Type: application/json" -d '{"content": "Client notes here"}'
curl -X POST http://localhost:8000/ingest -H "Content-Type: application/json" -d '{"data": "Client: John Doe"}'
```

## 🔧 Development Commands

### Backend Development
```bash
# Run with auto-reload
uvicorn api.main:app --reload --port 8000

# Check logs
tail -f logs/app.log

# Run tests (if test files exist)
pytest tests/
```

### Frontend Development  
```bash
# Development server with hot reload
npm start

# Build for production
npm run build

# Run tests
npm test
```

## 📁 Project Structure
```
project_hackathon/
├── api/
│   ├── main.py              # FastAPI backend
│   └── __init__.py
├── prompts/
│   ├── templates.py         # AI prompt templates
│   └── __init__.py
├── queries/
│   ├── bigquery.py         # Database queries
│   └── __init__.py
├── utils/
│   ├── format.py           # Utility functions
│   └── __init__.py
├── setup_data.sh           # Database setup script
├── requirements.txt        # Python dependencies
└── DEPLOYMENT.md          # Cloud deployment guide
```

## 🎯 Local Development Workflow

1. **Database First**: Run `./setup_data.sh` to create sample data
2. **Backend Development**: Start FastAPI server on port 8000
3. **Frontend Development**: Start React dev server on port 3000 (if applicable)
4. **Test Integration**: Use curl commands to verify all endpoints
5. **Deploy to Cloud**: Follow DEPLOYMENT.md when ready

## 🐛 Troubleshooting

### Backend Issues
```bash
# Check Python environment
python --version
pip list | grep fastapi

# Verify BigQuery access
bq query --use_legacy_sql=false "SELECT COUNT(*) FROM \`apialchemists-1-47b9.apialchemists.todo_tasks\`"

# Check authentication
gcloud auth application-default print-access-token
```

### Common Problems
- **Import errors**: Make sure you're in the correct directory
- **Database connection**: Verify GOOGLE_APPLICATION_CREDENTIALS path
- **Port conflicts**: Use different ports if 8000 is busy
- **BigQuery access**: Ensure your service account has proper permissions

### Environment Variables
```bash
# Required environment variables
export PROJECT_ID=apialchemists-1-47b9
export DATASET_NAME=apialchemists  
export LOCATION=us-central1
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-key.json"
```

## 🔄 Development to Production

When ready to deploy:
1. Test all features locally
2. Commit your changes to Git
3. Follow the cloud deployment guide in `DEPLOYMENT.md`
4. Use the same database created by `setup_data.sh`

---

**Your local development environment gives you:**
- ✅ Fast iteration and testing
- ✅ Full access to all 8 banking features
- ✅ Real BigQuery data for realistic testing
- ✅ Complete AI functionality with Vertex AI

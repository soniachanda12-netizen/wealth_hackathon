#!/bin/bash
cd /home/prakashb/Prakash/project_hackathon
source venv/bin/activate
export PROJECT_ID=apialchemists-1-47b9
export DATASET_NAME=apialchemists
export LOCATION=us-central1
export GOOGLE_APPLICATION_CREDENTIALS="/home/prakashb/Desktop/Sonia Hacathon/apialchemists-1-47b9-556d040d8636.json"
echo "Starting backend on http://localhost:8000"
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

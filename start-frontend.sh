#!/bin/bash
cd /home/prakashb/Prakash/project_hackathon/frontend
export REACT_APP_API_URL=http://localhost:8000
echo "Starting frontend on http://localhost:3000"
echo "Backend API URL: $REACT_APP_API_URL"
npm start

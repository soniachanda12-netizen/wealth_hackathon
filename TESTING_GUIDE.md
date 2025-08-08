# Testing Guide for All 8 Features

## Quick Feature Test Commands

Once your build is complete, test each feature with these commands:

## Try From UI
https://apialchemistproject-frontend-608187465720.us-central1.run.app/

**Expected**: All features visible on UI should work

# Try Backend APIs

### 1. Daily To-Do Tasks
```bash
curl https://apialchemistproject-backend-608187465720.us-central1.run.app/todo
```
**Expected**: List of advisor tasks with priorities and due dates

### 2. Next Best Actions (AI-Powered)
```bash
curl https://apialchemistproject-backend-608187465720.us-central1.run.app/nba
```
**Expected**: AI-generated recommendations based on client data

### 3. Portfolio Analytics
```bash
curl https://apialchemistproject-backend-608187465720.us-central1.run.app/portfolio
```
**Expected**: Portfolio metrics, risk analysis, performance data

### 4. AI Chat Agent
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"message": "What should I recommend for high net worth clients?"}' \
  https://apialchemistproject-backend-608187465720.us-central1.run.app/chat
```
**Expected**: Intelligent banking advice based on client context

### 5. Message Drafting
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"context": "quarterly portfolio review for Alice Smith"}' \
  https://apialchemistproject-backend-608187465720.us-central1.run.app/draft
```
**Expected**: Professional client communication draft

### 6. Calendar Integration
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"details": "meeting with Bob Wilson tomorrow at 3pm about portfolio"}' \
  https://apialchemistproject-backend-608187465720.us-central1.run.app/calendar
```
**Expected**: Parsed meeting details and calendar event structure

### 7. Content Summarization
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"content": "Client meeting notes: Alice worried about market volatility, wants safer investments, daughter starting college soon"}' \
  https://apialchemistproject-backend-608187465720.us-central1.run.app/summarize
```
**Expected**: Structured summary with key points and action items


## Key Points for Understanding

### Data Flow Summary:
1. **Frontend Dashboard** → Makes authenticated API calls
2. **FastAPI Backend** → Processes requests
3. **BigQuery** → Provides real banking data context  
4. **Vertex AI** → Generates intelligent responses
5. **Response** → Returns to frontend widgets

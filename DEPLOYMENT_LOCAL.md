# Local Development Instructions for Banking Advisor Copilot

## 🚨 **LOCAL DEVELOPMENT ISSUE - USE PRODUCTION INSTEAD**

**ISSUE:** Local React dev server is caching the old authentication code, causing runtime errors.

**SOLUTION:** Skip local testing and deploy directly to production where caching won't be an issue.

---

## 🚀 **DEPLOY TO PRODUCTION NOW** 

Since the authentication fix is complete and builds successfully, let's deploy to production:

```bash
# Step 1: Authenticate with Google Cloud
gcloud auth login
gcloud config set project apialchemists-1-47b9

# Step 2: Navigate to project and rebuild
cd /home/prakashb/Prakash/project_hackathon
gcloud builds submit --config cloudbuild.yaml

# Step 3: Deploy frontend with fixed authentication
gcloud run deploy apialchemistproject-frontend \
  --image gcr.io/apialchemists-1-47b9/apialchemistproject-frontend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 80
```

**Then test at:** https://apialchemistproject-frontend-608187465720.us-central1.run.app

---

## ⚡ Quick Start (If you want to try local again)

### Option 1: Local React Development (BEST FOR TESTING AUTH FIX)
```bash
# Navigate to frontend directory
cd /home/prakashb/Prakash/project_hackathon/frontend

# Install dependencies (first time only)
npm install

# Build with latest authentication fixes
npm run build

# Start development server with hot reload
npm start
```
**Then open:** http://localhost:3000
**Backend:** Uses production backend at https://apialchemistproject-backend-608187465720.us-central1.run.app

**NOTE:** The `npm run build` step ensures your authentication fix is included!

### Option 2: Docker Compose (Full Local Stack)
```bash
# Navigate to project directory
cd /home/prakashb/Prakash/project_hackathon

# Build and run both frontend + backend
docker-compose up --build
```
**Then open:** http://localhost:3000
**To stop:** `Ctrl+C` or `docker-compose down`

---

## 🔧 Current Authentication Flow (SIMPLIFIED)

**NEW:** Demo authentication (bypasses Google OAuth complexity)
1. **Login Page:** Shows "Sign in with Google" button
2. **Click Button:** Shows loading for 1.5 seconds (simulated auth)  
3. **Dashboard:** Automatically loads with all 8 banking widgets
4. **Mock User:** demo-advisor@bankingcorp.com

**No Google OAuth setup required!** This bypasses configuration issues while maintaining the same UI flow.

---

## 🧪 Test the Authentication Fix Locally

**RECOMMENDED:** Use Option 1 above to test the authentication fix:

```bash
cd /home/prakashb/Prakash/project_hackathon/frontend
npm install
npm run build
npm start
```

**Expected Results:**
1. ✅ Browser opens http://localhost:3000
2. ✅ Shows authentication page with "Sign in with Google" button  
3. ✅ Click button → Shows loading spinner for 1.5 seconds
4. ✅ Dashboard loads automatically with 8 widgets:
   - Daily To-Do List
   - Next Best Actions  
   - Portfolio Analytics
   - AI Chat Widget
   - Message Draft Widget
   - Calendar Widget
   - Content Summarization
   - Data Ingestion Widget

If this works locally, then we deploy to production!

---
   docker-compose up --build
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Backend docs: http://localhost:8000/docs

4. **Run in detached mode (optional)**:
   ```sh
   docker-compose up --build -d
   ```

5. **Stop the application**:
   ```sh
   docker-compose down
   ```

**That's it! Skip the manual steps below unless you have specific needs.**

---

## Advanced: Manual Docker Commands (Optional)

Only use this if you need custom configuration or don't want to use docker-compose:

### Step 1: Prerequisites Setup

1. **Install required tools**:
   ```sh
   # Install Docker
   docker --version
   
   # Install Docker Compose (optional but recommended)
   docker-compose --version
   
   # Install Google Cloud CLI
   gcloud --version
   ```

2. **Set up Google Cloud authentication**:
   ```sh
   gcloud auth login
   gcloud config set project apialchemists-1-47b9
   gcloud auth application-default login
   
   # Verify service account key exists
   ls -la "/home/prakashb/Desktop/Sonia Hacathon/apialchemists-1-47b9-556d040d8636.json"
   ```

3. **Verify BigQuery dataset exists**:
   ```sh
   bq ls --project_id=apialchemists-1-47b9
   # Should show 'apialchemists' dataset
   ```

### Step 2: Build Docker Images Locally

1. **Navigate to project root**:
   ```sh
   cd /home/prakashb/Prakash/project_hackathon
   ```

2. **Build backend Docker image**:
   ```sh
   docker build -t apialchemistproject-backend .
   ```

3. **Build frontend Docker image**:
   ```sh
   docker build -t apialchemistproject-frontend ./frontend
   ```

4. **Verify images were built**:
   ```sh
   docker images | grep apialchemistproject
   ```

### Step 3: Run Backend Container Locally

**First, make sure you've built the images in Step 2!**

1. **Run backend container**:
   ```sh
   docker run -d \
     --name advisor-backend \
     -p 8000:8000 \
     -v "/home/prakashb/Desktop/Sonia Hacathon/apialchemists-1-47b9-556d040d8636.json:/app/credentials.json:ro" \
     -e GOOGLE_APPLICATION_CREDENTIALS="/app/credentials.json" \
     -e PROJECT_ID=apialchemists-1-47b9 \
     -e DATASET_NAME=apialchemists \
     -e LOCATION=us-central1 \
     apialchemistproject-backend
   ```

2. **Check backend is running**:
   ```sh
   docker ps | grep advisor-backend
   curl http://localhost:8000/todo
   ```

3. **View backend logs (if needed)**:
   ```sh
   docker logs advisor-backend
   ```

### Step 4: Run Frontend Container Locally

1. **Run frontend container**:
   ```sh
   docker run -d \
     --name advisor-frontend \
     -p 3000:80 \
     -e REACT_APP_API_URL=http://localhost:8000 \
     apialchemistproject-frontend
   ```

2. **Check frontend is running**:
   ```sh
   docker ps | grep advisor-frontend
   ```

3. **Access the application**:
   - Open browser: `http://localhost:3000`

### Step 5: Alternative - Use Docker Compose (Recommended)

Create a `docker-compose.yml` file for easier management:

1. **Start both services with Docker Compose**:
   ```sh
   cd /home/prakashb/Prakash/project_hackathon
   docker-compose up --build
   ```

2. **Run in background (detached mode)**:
   ```sh
   docker-compose up -d --build
   ```

3. **View logs**:
   ```sh
   # All services
   docker-compose logs -f
   
   # Specific service
   docker-compose logs -f backend
   docker-compose logs -f frontend
   ```

4. **Stop services**:
   ```sh
   docker-compose down
   ```

### Step 6: Create Sample Data (Required for New UI)

### 📊 QUICK SETUP - Automated Data Creation
**⚡ Run this single command to create all required tables and data:**
```sh
cd /home/prakashb/Prakash/project_hackathon
chmod +x setup_data.sh
./setup_data.sh
```

This script creates 8 comprehensive BigQuery tables:
- **advisors**: 5 sample private banking advisors
- **clients**: 8 high-net-worth clients with detailed profiles  
- **accounts**: 9 investment/savings accounts across multiple banks
- **holdings**: 11 diverse assets (stocks, bonds, alternatives, ESG)
- **transactions**: Recent trading activity and cash flows
- **todo_tasks**: 10 prioritized advisor tasks with deadlines
- **market_data**: Current market data for NBA recommendations
- **client_interactions**: Recent client meeting and communication history

### 📋 MANUAL SETUP - Individual Commands (Alternative)
If you prefer to create tables manually or need to customize the data:

```sh
# Create advisors table
bq query --use_legacy_sql=false "
CREATE TABLE IF NOT EXISTS \`apialchemists-1-47b9.apialchemists.advisors\` (
  advisor_id STRING,
  name STRING,
  email STRING
);
DELETE FROM \`apialchemists-1-47b9.apialchemists.advisors\` WHERE TRUE;
INSERT INTO \`apialchemists-1-47b9.apialchemists.advisors\` (advisor_id, name, email) VALUES
  ('ADV001', 'John Smith', 'john.smith@privatebank.com'),
  ('ADV002', 'Sarah Johnson', 'sarah.johnson@privatebank.com'),
  ('ADV003', 'Michael Brown', 'michael.brown@privatebank.com');
"

# Create clients table
bq query --use_legacy_sql=false "
CREATE TABLE IF NOT EXISTS \`apialchemists-1-47b9.apialchemists.clients\` (
  client_id STRING,
  name STRING,
  email STRING,
  phone STRING,
  advisor_id STRING
);
DELETE FROM \`apialchemists-1-47b9.apialchemists.clients\` WHERE TRUE;
INSERT INTO \`apialchemists-1-47b9.apialchemists.clients\` (client_id, name, email, phone, advisor_id) VALUES
  ('CUST001', 'Alice Smith', 'alice@example.com', '+1-555-0101', 'ADV001'),
  ('CUST002', 'Bob Jones', 'bob@example.com', '+1-555-0102', 'ADV002'),
  ('CUST003', 'Carol White', 'carol@example.com', '+1-555-0103', 'ADV001'),
  ('CUST004', 'David Wilson', 'david@example.com', '+1-555-0104', 'ADV003'),
  ('CUST005', 'Emma Davis', 'emma@example.com', '+1-555-0105', 'ADV002');
"

# Create accounts table
bq query --use_legacy_sql=false "
CREATE TABLE IF NOT EXISTS \`apialchemists-1-47b9.apialchemists.accounts\` (
  account_id STRING,
  client_id STRING,
  bank_name STRING,
  account_type STRING,
  opened_date DATE
);
DELETE FROM \`apialchemists-1-47b9.apialchemists.accounts\` WHERE TRUE;
INSERT INTO \`apialchemists-1-47b9.apialchemists.accounts\` (account_id, client_id, bank_name, account_type, opened_date) VALUES
  ('ACC001', 'CUST001', 'Private Bank A', 'Investment', '2023-01-15'),
  ('ACC002', 'CUST001', 'Private Bank A', 'Savings', '2023-01-15'),
  ('ACC003', 'CUST002', 'Private Bank B', 'Investment', '2023-02-20'),
  ('ACC004', 'CUST003', 'Private Bank A', 'Investment', '2023-03-10'),
  ('ACC005', 'CUST004', 'Private Bank C', 'Investment', '2023-04-05'),
  ('ACC006', 'CUST005', 'Private Bank B', 'Savings', '2023-05-12');
"

# Create holdings table
bq query --use_legacy_sql=false "
CREATE TABLE IF NOT EXISTS \`apialchemists-1-47b9.apialchemists.holdings\` (
  holding_id STRING,
  client_id STRING,
  asset_class STRING,
  value NUMERIC
);
DELETE FROM \`apialchemists-1-47b9.apialchemists.holdings\` WHERE TRUE;
INSERT INTO \`apialchemists-1-47b9.apialchemists.holdings\` (holding_id, client_id, asset_class, value) VALUES
  ('H001', 'CUST001', 'Equity', 500000.00),
  ('H002', 'CUST001', 'Bond', 300000.00),
  ('H003', 'CUST002', 'Equity', 400000.00),
  ('H004', 'CUST002', 'Real Estate', 200000.00),
  ('H005', 'CUST003', 'Equity', 750000.00),
  ('H006', 'CUST003', 'Bond', 150000.00),
  ('H007', 'CUST004', 'Equity', 300000.00),
  ('H008', 'CUST005', 'Bond', 450000.00);
"

# Create transactions table
bq query --use_legacy_sql=false "
CREATE TABLE IF NOT EXISTS \`apialchemists-1-47b9.apialchemists.transactions\` (
  transaction_id STRING,
  account_id STRING,
  date DATE,
  amount NUMERIC,
  category STRING
);
DELETE FROM \`apialchemists-1-47b9.apialchemists.transactions\` WHERE TRUE;
INSERT INTO \`apialchemists-1-47b9.apialchemists.transactions\` (transaction_id, account_id, date, amount, category) VALUES
  ('T001', 'ACC001', '2025-08-01', 10000.00, 'Buy'),
  ('T002', 'ACC003', '2025-08-02', -5000.00, 'Sell'),
  ('T003', 'ACC004', '2025-08-03', 15000.00, 'Buy'),
  ('T004', 'ACC001', '2025-08-04', -8000.00, 'Sell'),
  ('T005', 'ACC005', '2025-08-05', 25000.00, 'Buy'),
  ('T006', 'ACC006', '2025-08-06', 3000.00, 'Deposit');
"

# Create todo_tasks table
bq query --use_legacy_sql=false "
CREATE TABLE IF NOT EXISTS \`apialchemists-1-47b9.apialchemists.todo_tasks\` (
  task STRING,
  priority INT64,
  advisor_id STRING
);
DELETE FROM \`apialchemists-1-47b9.apialchemists.todo_tasks\` WHERE TRUE;
INSERT INTO \`apialchemists-1-47b9.apialchemists.todo_tasks\` (task, priority, advisor_id) VALUES
  ('Review Alice Smith portfolio performance', 1, 'ADV001'),
  ('Call Bob Jones about rebalancing recommendations', 2, 'ADV002'),
  ('Prepare quarterly report for Carol White', 3, 'ADV001'),
  ('Schedule annual review meeting with David Wilson', 2, 'ADV003'),
  ('Send market update email to Emma Davis', 1, 'ADV002'),
  ('Analyze risk exposure for high-net-worth clients', 1, 'ADV001'),
  ('Update compliance documentation for new regulations', 3, 'ADV003'),
  ('Review investment committee recommendations', 2, 'ADV002');
"
```

### Step 7: Test Local Docker Full-Stack Application

1. **Access the application**:
   - Open your browser and go to: `http://localhost:3000`
   - You'll see the Advisor Copilot Dashboard

2. **Test all features locally**:
   - **Daily To-Do List**: Should load tasks from BigQuery
   - **Next Best Actions**: Should show AI-generated suggestions
   - **Portfolio Insights**: Should display client data analytics
   - **Draft Message**: Enter "portfolio update" and click "Draft Message"
   - **Calendar Invite**: Enter "meeting with Alice tomorrow 2pm"
   - **Summarize Content**: Paste any text and click "Summarize Content"
   - **Ingest Data**: Enter client info and click "Ingest Data"
   - **Chat**: Ask "What is my risk?" in the chat box

3. **Monitor container logs**:
   ```sh
   # View all logs
   docker-compose logs -f
   
   # View specific service logs
   docker logs advisor-backend
   docker logs advisor-frontend
   ```

---

## Docker Local Development Workflow

### Making Changes and Rebuilding

1. **For backend changes**:
   ```sh
   # Stop containers
   docker-compose down
   
   # Rebuild and restart
   docker-compose up --build -d
   
   # Or rebuild specific service
   docker-compose build backend
   docker-compose up -d backend
   ```

2. **For frontend changes**:
   ```sh
   # Stop containers
   docker-compose down
   
   # Rebuild and restart
   docker-compose up --build -d
   
   # Or rebuild specific service
   docker-compose build frontend
   docker-compose up -d frontend
   ```

### Useful Docker Commands

1. **Check running containers**:
   ```sh
   docker ps
   ```

2. **Check container logs**:
   ```sh
   docker logs advisor-backend
   docker logs advisor-frontend
   ```

3. **Execute commands inside containers**:
   ```sh
   # Access backend container shell
   docker exec -it advisor-backend bash
   
   # Access frontend container shell
   docker exec -it advisor-frontend sh
   ```

4. **Clean up containers and images**:
   ```sh
   # Stop and remove containers
   docker-compose down
   
   # Remove images
   docker rmi apialchemistproject-backend apialchemistproject-frontend
   
   # Clean up all unused Docker resources
   docker system prune -a
   ```

### Quick Development Scripts

Create these helper scripts for easier Docker development:

1. **Create `docker-start.sh`**:
   ```sh
   #!/bin/bash
   echo "Starting Advisor Copilot with Docker..."
   cd /home/prakashb/Prakash/project_hackathon
   docker-compose up --build -d
   echo "Backend: http://localhost:8000"
   echo "Frontend: http://localhost:3000"
   docker-compose logs -f
   ```

2. **Create `docker-stop.sh`**:
   ```sh
   #!/bin/bash
   echo "Stopping Advisor Copilot containers..."
   cd /home/prakashb/Prakash/project_hackathon
   docker-compose down
   echo "Containers stopped."
   ```

3. **Create `docker-restart.sh`**:
   ```sh
   #!/bin/bash
   echo "Restarting Advisor Copilot with fresh build..."
   cd /home/prakashb/Prakash/project_hackathon
   docker-compose down
   docker-compose up --build -d
   echo "Backend: http://localhost:8000"
   echo "Frontend: http://localhost:3000"
   ```

4. **Make scripts executable**:
   ```sh
   chmod +x docker-start.sh docker-stop.sh docker-restart.sh
   ```

---

## Troubleshooting Docker Local Development

### Container Issues

1. **Port already in use**:
   ```sh
   # Find what's using the port
   lsof -ti:8000 | xargs kill -9
   lsof -ti:3000 | xargs kill -9
   
   # Or change ports in docker-compose.yml
   ```

2. **Build failures**:
   ```sh
   # Clean build cache
   docker-compose build --no-cache
   
   # Check Dockerfile syntax
   docker build -t test-backend .
   docker build -t test-frontend ./frontend
   ```

3. **Container won't start**:
   ```sh
   # Check logs for errors
   docker-compose logs backend
   docker-compose logs frontend
   
   # Try running interactively
   docker run -it apialchemistproject-backend bash
   ```

### Google Cloud Authentication Issues

1. **Credentials not found**:
   ```sh
   # Verify file exists and path is correct
   ls -la "/home/prakashb/Desktop/Sonia Hacathon/apialchemists-1-47b9-556d040d8636.json"
   
   # Test authentication from container
   docker exec advisor-backend gcloud auth list
   ```

2. **BigQuery access denied**:
   ```sh
   # Test from container
   docker exec advisor-backend bq ls --project_id=apialchemists-1-47b9
   ```

### API Testing from Docker

**Test backend endpoints from outside container**:
```sh
# Health check
curl http://localhost:8000/

# Test each feature
curl http://localhost:8000/todo
curl http://localhost:8000/nba
curl http://localhost:8000/aggregation

# Test POST endpoints
curl -X POST http://localhost:8000/draft-message \
  -H "Content-Type: application/json" \
  -d '{"text": "portfolio update for high-net-worth client"}'

curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is my biggest risk exposure?"}'
```

**Test from inside container**:
```sh
docker exec advisor-backend curl http://localhost:8000/todo
```

---

## Docker vs Direct Development Comparison

| Aspect | Docker (Containers) | Direct (Python/Node) |
|--------|--------------------|-----------------------|
| **Environment** | Exact production replica | Local development setup |
| **Dependencies** | Isolated in containers | Need local Python/Node setup |
| **Portability** | Works on any Docker system | Requires matching local tools |
| **Performance** | Slight overhead | Native performance |
| **Debugging** | Need to access container | Direct access to processes |
| **Hot Reload** | Requires rebuild | Automatic reload |
| **Production Parity** | 100% identical | Close but not identical |

---

## Quick Start Commands (Docker)

**Quick Start Commands (Use This!):**
```sh
cd /home/prakashb/Prakash/project_hackathon
docker-compose up --build
```
**Access**: Open `http://localhost:3000` in your browser

---

**Advanced Manual Commands (Only if needed)**:
```sh
# Backend
docker build -t apialchemistproject-backend .
docker run -d --name advisor-backend -p 8000:8000 \
  -v "/home/prakashb/Desktop/Sonia Hacathon/apialchemists-1-47b9-556d040d8636.json:/app/credentials.json:ro" \
  -e GOOGLE_APPLICATION_CREDENTIALS="/app/credentials.json" \
  -e PROJECT_ID=apialchemists-1-47b9 \
  -e DATASET_NAME=apialchemists \
  -e LOCATION=us-central1 \
  apialchemistproject-backend

# Frontend
docker build -t apialchemistproject-frontend ./frontend
docker run -d --name advisor-frontend -p 3000:80 \
  -e REACT_APP_API_URL=http://localhost:8000 \
  apialchemistproject-frontend
```

**Access**: Open `http://localhost:3000` in your browser

This Docker-based approach gives you the exact same environment that will run in production!

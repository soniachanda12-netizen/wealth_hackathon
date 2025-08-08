# Private Banking Advisor Copilot - Sequence Diagrams

## 📋 Master Architecture Flow

```mermaid
sequenceDiagram
    participant User
    participant React as React Frontend
    participant FastAPI as FastAPI Backend
    participant BigQuery as Google BigQuery
    participant VertexAI as Vertex AI (Gemini Pro)
    participant CloudStorage as Google Cloud Storage
    
    User->>React: Opens Banking Dashboard
    React->>FastAPI: GET /auth-check
    FastAPI->>React: Authentication Status
    React->>React: Load 8 Banking Widgets
    
    Note over React: Dashboard loads with:<br/>Todo, NBA, Portfolio, Chat,<br/>Messages, Calendar, Summarize, Ingest
    
    loop For Each Widget
        React->>FastAPI: API Call (various endpoints)
        FastAPI->>BigQuery: Query banking data
        FastAPI->>VertexAI: Generate AI insights
        BigQuery->>FastAPI: Return structured data
        VertexAI->>FastAPI: Return AI response
        FastAPI->>React: JSON response
        React->>User: Display widget data
    end
```

---

## 🏠 Main Dashboard Page

### Tech Stack Overview:
- **Frontend**: React.js with Recharts for visualizations
- **Backend**: FastAPI with async endpoints  
- **Database**: Google BigQuery with 8 banking tables
- **AI**: Vertex AI Gemini Pro model
- **Storage**: Google Cloud Storage
- **Authentication**: Google OAuth + Service Account

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant React as React Dashboard
    participant API as FastAPI Backend
    
    User->>Browser: Visit dashboard URL
    Browser->>React: Load React App
    React->>React: Initialize 8 widgets
    
    Note over React: Widgets: Todo, NBA, Portfolio,<br/>Chat, Messages, Calendar,<br/>Summarize, Data Ingestion
    
    React->>API: Parallel API calls to load all widgets
    API->>React: Return widget data
    React->>Browser: Render complete dashboard
    Browser->>User: Display banking advisor interface
```

---

## 📝 1. Daily To-Do Feature

### What it does (Layman):
Gets daily tasks for bank advisors from the database, prioritizes them using AI, and shows the most important ones first.

### Tech Details:
- **API Endpoint**: `GET /todo`
- **Database**: `todo_tasks` table in BigQuery
- **AI Model**: Gemini Pro for task prioritization
- **Data Fetched**: Task descriptions, priorities, due dates

```mermaid
sequenceDiagram
    participant User
    participant TodoWidget as Todo Widget (React)
    participant API as FastAPI /todo
    participant BigQuery
    participant Gemini as Vertex AI Gemini Pro
    
    User->>TodoWidget: Views dashboard
    TodoWidget->>API: GET /todo
    
    API->>BigQuery: SELECT task FROM todo_tasks<br/>ORDER BY priority ASC LIMIT 10
    BigQuery->>API: Returns 10 highest priority tasks
    
    Note over BigQuery: Data: task descriptions,<br/>priority levels, advisor assignments
    
    API->>Gemini: "Prioritize these tasks for bank advisor:<br/>[task1, task2, task3...]"
    Gemini->>API: Returns AI-prioritized numbered list
    
    API->>TodoWidget: JSON: {"todo": ["1. Review portfolios", <br/>"2. Client calls", ...]}
    
    TodoWidget->>TodoWidget: Render task list with checkboxes
    TodoWidget->>User: Displays prioritized daily tasks
    
    Note over User: User sees: Checkable task list<br/>with AI-optimized priority order
```

---

## 🎯 2. Next Best Actions (NBA) Feature  

### What it does (Layman):
Analyzes recent client transactions and suggests the best actions an advisor should take next.

### Tech Details:
- **API Endpoint**: `GET /nba`
- **Database**: `transactions`, `accounts`, `clients` tables
- **AI Model**: Gemini Pro for action recommendations
- **Data Fetched**: Recent transactions, amounts, categories, client IDs

```mermaid
sequenceDiagram
    participant User
    participant NBAWidget as NBA Widget (React)
    participant API as FastAPI /nba
    participant BigQuery
    participant Gemini as Vertex AI Gemini Pro
    
    User->>NBAWidget: Views NBA section
    NBAWidget->>API: GET /nba
    
    API->>BigQuery: Complex JOIN query:<br/>transactions + accounts + clients<br/>ORDER BY date DESC LIMIT 5
    BigQuery->>API: Recent client activity data
    
    Note over BigQuery: Data: Client transactions,<br/>amounts, categories, dates
    
    API->>Gemini: "Based on recent client activity:<br/>[client1: investment $50k, client2: withdrawal $10k]<br/>Suggest 3 next best actions for advisor"
    
    Gemini->>API: AI-generated action recommendations
    
    API->>NBAWidget: JSON: {"next_best_actions": [<br/>"Review client portfolios for rebalancing",<br/>"Schedule follow-up meetings"]}
    
    NBAWidget->>NBAWidget: Render action cards with icons
    NBAWidget->>User: Displays 3 recommended actions
    
    Note over User: User sees: Action cards with<br/>specific client-based recommendations
```

---

## 💼 3. Portfolio Analytics Feature

### What it does (Layman):
Shows comprehensive analysis of all client portfolios, advisor performance, and investment insights.

### Tech Details:
- **API Endpoint**: `GET /aggregation`
- **Database**: `holdings`, `clients`, `advisors`, `transactions` tables
- **AI Model**: Gemini Pro for portfolio insights
- **Data Fetched**: Asset allocations, advisor performance, risk analysis

```mermaid
sequenceDiagram
    participant User
    participant PortfolioWidget as Portfolio Widget (React)
    participant API as FastAPI /aggregation
    participant BigQuery
    participant Gemini as Vertex AI Gemini Pro
    
    User->>PortfolioWidget: Clicks on Portfolio Analytics
    PortfolioWidget->>API: GET /aggregation
    
    API->>BigQuery: Multiple complex queries:<br/>1. Asset allocation by class<br/>2. Top holdings analysis<br/>3. Advisor performance metrics<br/>4. Risk analysis by exposure
    
    BigQuery->>API: Comprehensive portfolio data:<br/>- $25M total AUM<br/>- Asset breakdown<br/>- Advisor rankings<br/>- Risk metrics
    
    Note over BigQuery: Data from 4 tables:<br/>holdings, clients, advisors,<br/>transactions with JOINs
    
    API->>Gemini: "Analyze portfolio data:<br/>Total AUM: $25M, 5 asset classes,<br/>10 advisors, recent activity patterns"
    
    Gemini->>API: Strategic insights and recommendations
    
    API->>PortfolioWidget: JSON with:<br/>- summary_metrics<br/>- asset_allocation (pie chart data)<br/>- advisor_rankings<br/>- ai_insights
    
    PortfolioWidget->>PortfolioWidget: Renders charts using Recharts:<br/>- Pie charts for asset allocation<br/>- Bar charts for advisor performance<br/>- KPI cards for metrics
    
    PortfolioWidget->>User: Interactive portfolio dashboard
    
    Note over User: User sees: Visual charts,<br/>KPI cards, advisor leaderboards,<br/>AI-powered insights
```

---

## 💬 4. AI Chat Feature

### What it does (Layman):
Intelligent chatbot that answers questions about clients, tasks, and portfolios using real banking data.

### Tech Details:
- **API Endpoint**: `POST /chat`
- **Database**: All tables (advisors, clients, holdings, tasks, transactions)
- **AI Model**: Gemini Pro with banking system prompts
- **Data Fetched**: Advisor-specific client data, portfolio info, tasks

```mermaid
sequenceDiagram
    participant User
    participant ChatWidget as Chat Widget (React)
    participant API as FastAPI /chat
    participant BigQuery
    participant Gemini as Vertex AI Gemini Pro
    
    User->>ChatWidget: Types question: "What are my top clients?"
    ChatWidget->>API: POST /chat<br/>{"message": "What are my top clients?",<br/>"advisor_name": "John Smith"}
    
    API->>BigQuery: Get advisor_id from advisor name
    BigQuery->>API: Returns advisor_id: 123
    
    API->>BigQuery: Multiple queries for context:<br/>1. Advisor's clients + portfolio values<br/>2. Recent tasks<br/>3. Recent transactions<br/>4. Portfolio breakdown
    
    BigQuery->>API: Real advisor data:<br/>- Top clients: Alice ($2M), Bob ($1.5M)<br/>- 5 current tasks<br/>- Recent transactions<br/>- Asset allocation
    
    Note over BigQuery: Fetches REAL data specific<br/>to selected advisor
    
    API->>Gemini: System prompt + real data context:<br/>"You are advisor John Smith.<br/>Your top clients: Alice ($2M), Bob ($1.5M)...<br/>User question: What are my top clients?"
    
    Gemini->>API: Personalized response using real data
    
    API->>ChatWidget: JSON: {"response": "Your top clients are:<br/>Alice with $2M portfolio, Bob with $1.5M...",<br/>"data_source": "BigQuery + Vertex AI"}
    
    ChatWidget->>ChatWidget: Display response in chat bubble
    ChatWidget->>User: Shows AI response with real client data
    
    Note over User: User sees: Personalized chat<br/>responses with actual client names,<br/>amounts, and portfolio details
```

---

## ✉️ 5. Message Drafting Feature

### What it does (Layman):
Creates professional emails and messages for clients using AI, personalized with their information.

### Tech Details:
- **API Endpoint**: `POST /draft-message`
- **Database**: `clients` table for personalization
- **AI Model**: Gemini Pro with professional banking prompts
- **Data Fetched**: Client contact info, context for personalization

```mermaid
sequenceDiagram
    participant User
    participant MessageWidget as Message Widget (React)
    participant API as FastAPI /draft-message
    participant BigQuery
    participant Gemini as Vertex AI Gemini Pro
    
    User->>MessageWidget: Enters context: "quarterly review for Alice"
    User->>MessageWidget: Selects client_id (optional)
    MessageWidget->>API: POST /draft-message<br/>{"text": "quarterly review", "client_id": "client123"}
    
    alt Client ID provided
        API->>BigQuery: SELECT name, email, phone<br/>FROM clients WHERE client_id = 'client123'
        BigQuery->>API: Client details: Alice Smith (alice@email.com)
        Note over BigQuery: Gets client name, email,<br/>phone for personalization
    end
    
    API->>Gemini: Professional banking prompt:<br/>"Draft email for quarterly review<br/>Client: Alice Smith<br/>Context: quarterly review<br/>Use professional banking tone"
    
    Gemini->>API: Generated professional message
    
    API->>MessageWidget: JSON: {"draft": "Dear Ms. Smith,<br/>I hope this finds you well...<br/>Quarterly portfolio review..."}
    
    MessageWidget->>MessageWidget: Display in text editor with:<br/>- Send button<br/>- Schedule button<br/>- Edit capabilities
    
    MessageWidget->>User: Professional draft message ready to send
    
    Note over User: User sees: Professionally<br/>written email with client name,<br/>proper banking language
```

---

## 📅 6. Calendar Integration Feature

### What it does (Layman):
Creates calendar invites for client meetings using AI to parse meeting details.

### Tech Details:
- **API Endpoint**: `POST /calendar-invite`
- **AI Model**: Gemini Pro for parsing meeting details
- **Data Processing**: Structured meeting information
- **Integration**: Prepared for Google Calendar API

```mermaid
sequenceDiagram
    participant User
    participant CalendarWidget as Calendar Widget (React)
    participant API as FastAPI /calendar-invite
    participant Gemini as Vertex AI Gemini Pro
    
    User->>CalendarWidget: Enters: "Meet with Bob tomorrow 2pm portfolio review"
    CalendarWidget->>API: POST /calendar-invite<br/>{"details": "Meet with Bob tomorrow 2pm portfolio review"}
    
    API->>Gemini: Parse meeting request:<br/>"Parse this meeting request:<br/>'Meet with Bob tomorrow 2pm portfolio review'<br/>Return: Title, Description, Duration"
    
    Gemini->>API: Structured meeting details:<br/>Title: Portfolio Review with Bob<br/>Description: Quarterly review meeting<br/>Duration: 60 minutes
    
    API->>CalendarWidget: JSON: {"invite_status": "Calendar invite prepared",<br/>"structured_details": "Title: Portfolio Review..."}
    
    CalendarWidget->>CalendarWidget: Display structured meeting info
    CalendarWidget->>User: Shows parsed meeting details
    
    Note over User: User sees: Organized meeting<br/>info ready for calendar creation
    
    Note over API: Future: Integration with<br/>Google Calendar API to create<br/>actual calendar events
```

---

## 📄 7. Content Summarization Feature

### What it does (Layman):
Takes any text (reports, emails, documents) and creates executive summaries for banking context.

### Tech Details:
- **API Endpoint**: `POST /summarize`
- **AI Model**: Gemini Pro with banking-focused summarization prompts
- **Processing**: Text analysis for key points, action items, relevance

```mermaid
sequenceDiagram
    participant User
    participant SummaryWidget as Summary Widget (React)
    participant API as FastAPI /summarize
    participant Gemini as Vertex AI Gemini Pro
    
    User->>SummaryWidget: Pastes long text:<br/>"Market report: Interest rates rising,<br/>inflation concerns, tech sector volatility..."
    
    SummaryWidget->>API: POST /summarize<br/>{"text": "Market report content..."}
    
    API->>Gemini: Banking-focused summarization:<br/>"System: You are a banking advisor AI<br/>Summarize this content for banking context:<br/>[long market report text]<br/>Focus on: key points, action items, client impact"
    
    Gemini->>API: Professional banking summary:<br/>Executive Summary + Key Points +<br/>Action Items + Client Relevance
    
    API->>SummaryWidget: JSON: {"summary": "**Executive Summary**: <br/>Interest rate increases impact client portfolios...<br/>**Key Points**: • Rate hikes expected<br/>**Action Items**: Review bond allocations"}
    
    SummaryWidget->>SummaryWidget: Render formatted summary with:<br/>- Executive summary section<br/>- Bullet points for key items<br/>- Action items highlighted
    
    SummaryWidget->>User: Clean, structured summary
    
    Note over User: User sees: Professional<br/>summary with banking focus,<br/>actionable insights highlighted
```

---

## 📤 8. Data Ingestion Feature

### What it does (Layman):
Uploads client documents and data to cloud storage for future analysis and record keeping.

### Tech Details:
- **API Endpoint**: `POST /ingest-data`
- **Storage**: Google Cloud Storage bucket "apialchemists"
- **File Processing**: Text/document upload with metadata
- **Integration**: Ready for BigQuery data loading

```mermaid
sequenceDiagram
    participant User
    participant IngestWidget as Data Ingest Widget (React)
    participant API as FastAPI /ingest-data
    participant CloudStorage as Google Cloud Storage
    
    User->>IngestWidget: Pastes data: "Client: John Doe<br/>Net Worth: $3M, Risk: Moderate<br/>Investment Goal: Retirement"
    
    IngestWidget->>API: POST /ingest-data<br/>{"data": "Client information...", "type": "text"}
    
    API->>API: Validate input data<br/>Generate unique filename with timestamp
    
    API->>CloudStorage: Upload to bucket "apialchemists"<br/>Path: advisor-data/ingested_data_20250807_143022.text<br/>Content: Client data
    
    CloudStorage->>API: Upload confirmation with file location
    
    API->>IngestWidget: JSON: {<br/>"ingest_status": "✅ Data successfully uploaded",<br/>"file_location": "gs://apialchemists/advisor-data/...",<br/>"file_size": 256,<br/>"next_steps": "File stored, BigQuery integration available"}
    
    IngestWidget->>IngestWidget: Display success message with:<br/>- File location<br/>- Upload timestamp<br/>- File size<br/>- Next steps
    
    IngestWidget->>User: Upload confirmation details
    
    Note over User: User sees: Confirmation that<br/>client data is safely stored<br/>in cloud with file details
    
    Note over CloudStorage: Data is stored in structured<br/>folder: advisor-data/<br/>Ready for BigQuery ingestion
```

---

## 🔄 Authentication Flow

### What it does (Layman):
Securely logs users in with Google accounts and manages access to banking data.

### Tech Details:
- **Frontend**: Google OAuth with client ID
- **Backend**: Service account authentication
- **Flow**: Google Sign-in → Dashboard access

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant React as React Frontend
    participant GoogleOAuth as Google OAuth
    participant API as FastAPI Backend
    participant GoogleCloud as Google Cloud Services
    
    User->>Browser: Visits dashboard URL
    Browser->>React: Load authentication page
    
    React->>User: Shows "Sign in with Google" button
    User->>React: Clicks sign in button
    
    React->>GoogleOAuth: Redirect to Google OAuth<br/>Client ID: 869426294559-2hqgspvo8nqm0h2c8rq1qfn7htvrkfnm
    
    GoogleOAuth->>User: Google login page
    User->>GoogleOAuth: Enter Gmail credentials
    GoogleOAuth->>React: Return authentication token
    
    React->>React: Store user session
    React->>API: GET /auth-check (verify backend)
    
    API->>GoogleCloud: Authenticate with service account:<br/>project-service-account@apialchemists-1-47b9.iam.gserviceaccount.com
    
    GoogleCloud->>API: Authentication confirmed
    API->>React: {"status": "authenticated", "project_id": "apialchemists-1-47b9"}
    
    React->>React: Load banking dashboard with 8 widgets
    React->>User: Display complete advisor interface
    
    Note over User: User sees: Full banking<br/>dashboard with all features<br/>accessible and functional
```

---

## 📊 Database Schema Overview

### BigQuery Tables Used:

1. **`advisors`** - Advisor information
2. **`clients`** - Client profiles and contact info  
3. **`holdings`** - Investment positions and values
4. **`transactions`** - Financial transactions
5. **`accounts`** - Account details linking clients
6. **`todo_tasks`** - Daily tasks for advisors
7. **`portfolio_summary`** - Aggregated portfolio data
8. **`risk_metrics`** - Risk analysis data

### Data Relationships:
```mermaid
erDiagram
    ADVISORS ||--o{ CLIENTS : manages
    CLIENTS ||--o{ ACCOUNTS : owns
    CLIENTS ||--o{ HOLDINGS : has
    ACCOUNTS ||--o{ TRANSACTIONS : contains
    ADVISORS ||--o{ TODO_TASKS : assigned
    
    ADVISORS {
        string advisor_id PK
        string name
        string email
        date created_date
    }
    
    CLIENTS {
        string client_id PK
        string advisor_id FK
        string name
        string email
        string risk_profile
        string tier
    }
    
    HOLDINGS {
        string holding_id PK
        string client_id FK
        string symbol
        string asset_class
        float value
        float current_price
    }
    
    TRANSACTIONS {
        string transaction_id PK
        string account_id FK
        float amount
        string category
        date date
    }
```

This documentation serves as your technical guide to understand how each feature works, what data it uses, and how the AI integrations function. Each sequence diagram shows the complete flow from user interaction to data display.

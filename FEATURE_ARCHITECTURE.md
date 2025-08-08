# Private Banking Advisor Copilot - Feature Architecture Diagrams

## 1. Daily To-Do Management Feature

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend API
    participant BQ as BigQuery
    
    U->>F: Opens Dashboard
    F->>B: GET /todo
    B->>BQ: SELECT * FROM todo_tasks WHERE advisor_id = ?
    BQ-->>B: Returns tasks with priorities
    B-->>F: JSON response with tasks
    F-->>U: Displays task list with priorities
    
    Note over F,B: Authentication: Bearer token in headers
    Note over B,BQ: Uses advisor-specific filtering
```

## 2. Next Best Actions (NBA) Feature

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend API
    participant VA as Vertex AI
    participant BQ as BigQuery
    
    U->>F: Views NBA widget
    F->>B: GET /nba
    B->>BQ: SELECT client_data, portfolio_data, market_trends
    BQ-->>B: Returns client context
    B->>VA: Generate recommendations based on context
    Note over B,VA: Conversational Agent: "Based on client portfolio..."
    VA-->>B: AI-generated action recommendations
    B-->>F: JSON with personalized suggestions
    F-->>U: Displays smart recommendations
    
    Note over B,VA: Uses gemini-pro model for contextual advice
```

## 3. Portfolio Analytics Feature

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend API
    participant BQ as BigQuery
    
    U->>F: Clicks Portfolio Analytics
    F->>B: GET /portfolio
    B->>BQ: SELECT * FROM client_portfolios JOIN market_data
    BQ-->>B: Returns portfolio performance data
    B->>B: Calculate risk metrics, returns, allocations
    B-->>F: JSON with analytics (risk, return, diversification)
    F-->>U: Charts and metrics dashboard
    
    Note over B,BQ: Aggregates multiple data sources for insights
```

## 4. AI Chat Agent Feature

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend API
    participant VA as Vertex AI
    participant BQ as BigQuery
    
    U->>F: Types question: "What's my client's risk exposure?"
    F->>B: POST /chat {"message": "What's my client's risk exposure?"}
    B->>BQ: Query relevant client/portfolio data
    BQ-->>B: Returns contextual data
    B->>VA: Send message + context to conversational AI
    Note over B,VA: Conversational Agent: Banking expert with context
    VA-->>B: Intelligent response with specific advice
    B-->>F: JSON response with AI answer
    F-->>U: Displays conversational response
    
    Note over B,VA: Uses banking expertise prompts + client data
```

## 5. Message Drafting Feature

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend API
    participant VA as Vertex AI
    participant BQ as BigQuery
    
    U->>F: Enters context: "Quarterly review for Alice Smith"
    F->>B: POST /draft {"context": "Quarterly review for Alice Smith"}
    B->>BQ: SELECT client_info WHERE name = "Alice Smith"
    BQ-->>B: Returns client details, portfolio status
    B->>VA: Generate professional message with client context
    Note over B,VA: Conversational Agent: "Dear Alice, based on your portfolio..."
    VA-->>B: Generated professional email/message
    B-->>F: JSON with drafted message
    F-->>U: Editable draft message
    
    Note over B,VA: Banking communication templates + personalization
```

## 6. Calendar Integration Feature

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend API
    participant VA as Vertex AI
    participant GC as Google Calendar API
    
    U->>F: Enters: "Meeting with Alice tomorrow at 2pm"
    F->>B: POST /calendar {"details": "Meeting with Alice tomorrow at 2pm"}
    B->>VA: Parse meeting details and extract structured data
    Note over B,VA: Conversational Agent: Extracts name, time, purpose
    VA-->>B: Structured meeting data (who, when, what)
    B->>GC: Create calendar event with parsed details
    GC-->>B: Event created confirmation
    B-->>F: JSON with calendar invite details
    F-->>U: Shows created meeting invite
    
    Note over B,VA: NLP for meeting detail extraction
```

## 7. Content Summarization Feature

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend API
    participant VA as Vertex AI
    
    U->>F: Pastes: "Client meeting notes: discussed portfolio rebalancing..."
    F->>B: POST /summarize {"content": "Client meeting notes..."}
    B->>VA: Summarize content with banking context
    Note over B,VA: Conversational Agent: "Key points: portfolio rebalancing, risk tolerance..."
    VA-->>B: Structured summary with key insights
    B-->>F: JSON with summary and action items
    F-->>U: Displays organized summary
    
    Note over B,VA: Banking-specific summarization prompts
```

## 8. Data Ingestion Feature

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend API
    participant VA as Vertex AI
    participant BQ as BigQuery
    
    U->>F: Enters: "Client: John Doe, Net Worth: $3M, Risk: Moderate"
    F->>B: POST /ingest {"data": "Client: John Doe, Net Worth: $3M..."}
    B->>VA: Parse and structure unstructured data
    Note over B,VA: Conversational Agent: Extracts structured fields
    VA-->>B: Structured data: {name: "John Doe", net_worth: 3000000, risk: "moderate"}
    B->>BQ: INSERT INTO clients (name, net_worth, risk_profile)
    BQ-->>B: Insertion successful
    B-->>F: JSON confirmation with processed data
    F-->>U: Shows structured data stored
    
    Note over B,VA: NLP for data extraction and validation
```

---

## Conversational Agent Implementation

### Where Conversational Agents Are Used:

1. **NBA Feature** - Generates contextual recommendations
2. **AI Chat** - Full conversational banking expert
3. **Message Drafting** - Creates personalized client communications
4. **Calendar Integration** - Parses natural language meeting details
5. **Content Summarization** - Intelligently summarizes banking content
6. **Data Ingestion** - Extracts structured data from natural language

### Implementation Details:

```mermaid
graph TB
    subgraph "Conversational Agent Stack"
        A[User Input] -->|Natural Language| B[Vertex AI gemini-pro]
        B --> C[Banking-Specific Prompts]
        C --> D[Context from BigQuery]
        D --> E[Generated Response]
        E --> F[Structured Output]
    end
    
    subgraph "Agent Capabilities"
        G[Banking Expertise]
        H[Client Data Context]
        I[Market Knowledge]
        J[Communication Templates]
        K[Data Extraction]
        L[Personalization]
    end
    
    B -.-> G
    B -.-> H
    B -.-> I
    C -.-> J
    C -.-> K
    C -.-> L
```

### Prompt Engineering (Built into Backend):

The conversational agent uses specialized prompts for each feature:

- **NBA Agent**: "You are a senior banking advisor. Based on the client's portfolio data..."
- **Chat Agent**: "You are an expert private banking advisor with deep market knowledge..."
- **Draft Agent**: "Generate a professional client communication for banking..."
- **Parser Agent**: "Extract structured data from the following banking information..."

### No Additional Setup Required:

The conversational agents are implemented directly in the backend using:
- **Vertex AI API** (already configured)
- **Banking-specific prompts** (built into the code)
- **Client context injection** (from BigQuery)
- **Response formatting** (for consistent outputs)

This creates intelligent, context-aware responses without needing separate conversational agent applications or training data!

---

## Complete System Architecture

```mermaid
graph TB
    subgraph "Frontend Dashboard"
        UI[Banking Advisor UI]
        TODO[Daily Tasks Widget]
        NBA[Next Best Actions]
        PORTFOLIO[Portfolio Analytics]
        CHAT[AI Chat Interface]
        DRAFT[Message Composer]
        CAL[Calendar Widget]
        SUMMARY[Content Summarizer]
        INGEST[Data Entry]
    end
    
    subgraph "Backend API Layer"
        API[FastAPI Backend]
        AUTH[Authentication]
        CORS[CORS Handler]
    end
    
    subgraph "Conversational AI Engine"
        VERTEX[Vertex AI gemini-pro]
        PROMPTS[Banking Prompts]
        CONTEXT[Context Injection]
    end
    
    subgraph "Data Layer"
        BQ[(BigQuery)]
        CLIENTS[client_portfolios]
        TASKS[todo_tasks]
        MARKET[market_data]
        MEETINGS[meetings]
        DOCS[client_documents]
        NOTES[advisor_notes]
        TRADES[trade_history]
        COMMS[communications]
    end
    
    subgraph "External APIs"
        GCAL[Google Calendar]
        GMAIL[Gmail API]
        DOCS_API[Document AI]
    end
    
    UI --> TODO
    UI --> NBA
    UI --> PORTFOLIO
    UI --> CHAT
    UI --> DRAFT
    UI --> CAL
    UI --> SUMMARY
    UI --> INGEST
    
    TODO --> API
    NBA --> API
    PORTFOLIO --> API
    CHAT --> API
    DRAFT --> API
    CAL --> API
    SUMMARY --> API
    INGEST --> API
    
    API --> AUTH
    API --> CORS
    API --> VERTEX
    API --> BQ
    
    VERTEX --> PROMPTS
    VERTEX --> CONTEXT
    
    BQ --> CLIENTS
    BQ --> TASKS
    BQ --> MARKET
    BQ --> MEETINGS
    BQ --> DOCS
    BQ --> NOTES
    BQ --> TRADES
    BQ --> COMMS
    
    API --> GCAL
    API --> GMAIL
    API --> DOCS_API
    
    classDef conversational fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef data fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef api fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    
    class VERTEX,PROMPTS,CONTEXT conversational
    class BQ,CLIENTS,TASKS,MARKET,MEETINGS,DOCS,NOTES,TRADES,COMMS data
    class API,AUTH,CORS api
```

## Data Flow Summary

1. **User Interaction** → Frontend widgets
2. **API Calls** → Authenticated backend endpoints
3. **Data Retrieval** → BigQuery for context
4. **AI Processing** → Vertex AI with banking prompts
5. **Response Generation** → Context-aware, personalized outputs
6. **External Integration** → Google Calendar, Gmail, Document AI

## 📦 System Overview & Tech Stack (2025)

### **Frontend Components (React)**
- `Dashboard.js`: Main dashboard, loads all widgets
- `widgets/`: TodoWidget, NBAWidget, PortfolioWidget, ClientWidget, ChatWidget, MessageDraftWidget, CalendarWidget, DataIngestionWidget, etc.
- Other UI: Header.js, Sidebar.js, MainDashboard.js, etc.

### **Backend (FastAPI, Python)**
- `main.py`: All API endpoints for 8+ features
- `email_service.py`: Email sending logic
- `google_calendar_integration.py`: Calendar API logic
- `prompt_templates.py`: AI prompt templates for banking
- **BigQuery**: 8+ tables (clients, holdings, transactions, todo_tasks, etc.)
- **Vertex AI Gemini Pro**: All AI/NLP/LLM tasks
- **Google Cloud Storage**: Document and data uploads

### **Key Features**
1. Daily To-Do Management (`/todo`)
2. Next Best Actions (`/nba`)
3. Portfolio Analytics (`/aggregation`)
4. Client Management (`/clients`)
5. Conversational AI (`/chat`)
6. Message Drafting (`/draft-message`)
7. Calendar Integration (`/calendar-invite`)
8. Content Summarization (`/summarize`)
9. Data Ingestion (`/ingest-data`)

---

## 🏗️ Industry-Standard Architecture Diagram

```mermaid
graph TB
    subgraph "🌐 Frontend (React.js)"
        UI[Dashboard.js]
        Widgets[8+ Widget Components]
        APIService[API Service Layer]
    end

    subgraph "⚡ Backend (FastAPI, Python)"
        API[REST API Endpoints]
        Auth[Google OAuth 2.0]
        Prompts[Prompt Templates]
        Email[Email Service]
        Calendar[Calendar Integration]
    end

    subgraph "☁️ Google Cloud"
        BigQuery[(BigQuery: 8+ Banking Tables)]
        VertexAI[Vertex AI Gemini Pro]
        CloudStorage[Cloud Storage]
        GCal[Google Calendar API]
        DocAI[Document AI]
    end

    UI --> Widgets
    Widgets --> APIService
    APIService --> API
    API --> Auth
    API --> Prompts
    API --> Email
    API --> Calendar
    API --> BigQuery
    API --> VertexAI
    API --> CloudStorage
    API --> GCal
    API --> DocAI

    classDef frontend fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef backend fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef cloud fill:#fffde7,stroke:#fbc02d,stroke-width:2px

    class UI,Widgets,APIService frontend
    class API,Auth,Prompts,Email,Calendar backend
    class BigQuery,VertexAI,CloudStorage,GCal,DocAI cloud
```

---

## 🚀 **Tech Stack (2025)**

- **Frontend**: React 18+, Recharts, CSS3, Responsive Design, Axios
- **Backend**: FastAPI (Python 3.9+), async/await, Pydantic
- **Database**: Google BigQuery (8+ tables: clients, holdings, transactions, etc.)
- **AI/ML**: Vertex AI Gemini Pro (LLM), Document AI, Natural Language API
- **Storage**: Google Cloud Storage (document/data uploads)
- **Authentication**: Google OAuth 2.0, Cloud IAM
- **Deployment**: Google Cloud Run, Docker
- **APIs**: Google Calendar API, BigQuery API, Vertex AI API
- **Testing**: Jest, React Testing Library, Cypress, Lighthouse
- **Monitoring**: Google Cloud Monitoring, Logging, Error Reporting

---

## 🧩 **Feature-to-Component Mapping**

| Feature                | Frontend Component         | Backend Endpoint         | AI/Cloud Service         |
|------------------------|---------------------------|-------------------------|--------------------------|
| Daily To-Do            | TodoWidget.js             | `/todo`                 | BigQuery, Vertex AI      |
| Next Best Actions      | NBAWidget.js              | `/nba`                  | BigQuery, Vertex AI      |
| Portfolio Analytics    | PortfolioWidget.js        | `/aggregation`          | BigQuery, Vertex AI      |
| Client Management      | ClientWidget.js           | `/clients`              | BigQuery                 |
| Conversational AI      | ChatWidget.js             | `/chat`                 | Vertex AI                |
| Message Drafting       | MessageDraftWidget.js     | `/draft-message`        | Vertex AI, BigQuery      |
| Calendar Integration   | CalendarWidget.js         | `/calendar-invite`      | Vertex AI, GCal API      |
| Content Summarization  | DataIngestionWidget.js    | `/summarize`            | Vertex AI, Doc AI        |
| Data Ingestion         | DataIngestionWidget.js    | `/ingest-data`          | Cloud Storage, BigQuery  |

---

## 🔄 **Unified Data & AI Flow**

```mermaid
sequenceDiagram
    participant User
    participant React as React Frontend
    participant FastAPI as FastAPI Backend
    participant BigQuery as Google BigQuery
    participant VertexAI as Vertex AI (Gemini Pro)
    participant CloudStorage as Google Cloud Storage
    participant GCal as Google Calendar API

    User->>React: Opens Dashboard
    React->>FastAPI: Auth/API Calls (8+ endpoints)
    FastAPI->>BigQuery: Query/Store Data
    FastAPI->>VertexAI: AI/NLP/LLM Tasks
    FastAPI->>CloudStorage: Upload/Download Files
    FastAPI->>GCal: Calendar Invites
    BigQuery-->>FastAPI: Data Results
    VertexAI-->>FastAPI: AI Results
    CloudStorage-->>FastAPI: File Status
    GCal-->>FastAPI: Invite Status
    FastAPI-->>React: JSON Responses
    React-->>User: Interactive Widgets
```

---

## 📚 **How to Extend**

- Add new widgets in `frontend/src/components/widgets/`
- Add new endpoints in `backend/main.py`
- Update prompt templates in `backend/prompt_templates.py`
- Add new BigQuery tables as needed
- Use Vertex AI for any new AI-powered features

---

**This architecture is up-to-date as of August 2025 and reflects all current features, tech stack, and best practices for enterprise-grade, AI-powered banking advisor platforms.**

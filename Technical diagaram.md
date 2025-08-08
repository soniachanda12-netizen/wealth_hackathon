# Remaining Features - Technical Architecture (Part 2)

## ✉️ 5. Message Drafting Feature

### Page Location: Dashboard Widget (Bottom-Left)

### What It Does:
- Generates professional client emails and messages
- Personalizes content with client information
- Uses banking-appropriate tone and language
- Provides send/schedule options

### Technical Implementation:

```mermaid
sequenceDiagram
    participant User
    participant React as Calendar Component
    participant API as /calendar-invite endpoint
    participant Gemini as AI Model
    participant GoogleCalendar as Google Calendar API
    
    Note over React: Component: CalendarWidget
    Note over GoogleCalendar: Future integration
    
    User->>React: Enters: "Meet Bob tomorrow 2pm portfolio review"
    React->>API: POST /calendar-invite<br/>{"details": "Meet Bob tomorrow 2pm portfolio review"}
    
    API->>Gemini: Parse meeting request:<br/>"Extract meeting details from:<br/>'Meet Bob tomorrow 2pm portfolio review'<br/>Return structured format"
    
    Gemini->>API: Structured response:<br/>Title: Portfolio Review with Bob<br/>Time: Tomorrow 2:00 PM<br/>Duration: 60 minutes<br/>Type: Client Meeting
    
    API->>React: {"invite_status": "prepared", "structured_details": "..."}
    React->>React: Display structured meeting info
    
    opt Future Enhancement
        React->>GoogleCalendar: Create calendar event
        GoogleCalendar->>React: Calendar invite sent
    end
    
    React->>User: Meeting details parsed and ready
```

## 🔄 Complete Data Flow Summary

### Overall Architecture:
```mermaid
graph TB
    subgraph "Frontend - React.js"
        A[Dashboard Component]
        B[8 Widget Components]
        C[API Service Layer]
    end
    
    subgraph "Backend - FastAPI"  
        D[8 API Endpoints]
        E[BigQuery Queries]
        F[AI Processing]
    end
    
    subgraph "Data Layer"
        G[BigQuery Tables]
        H[Cloud Storage]
        I[Vertex AI Gemini Pro]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    D --> F
    E --> G
    F --> I
    D --> H
```

### Technology Stack Summary:
- **Frontend**: React.js, Recharts, CSS Grid, Axios
- **Backend**: FastAPI, Python, async/await
- **Database**: Google BigQuery (8 banking tables)
- **AI**: Vertex AI Gemini Pro model
- **Storage**: Google Cloud Storage
- **Authentication**: Google OAuth + Service Account
- **Deployment**: Google Cloud Run
- **Development**: VS Code, Git, Docker

This complete technical documentation provides you with deep understanding of every feature, API, database interaction, and component in your Private Banking Advisor Copilot application. Use this as your reference guide for understanding and extending the codebase.

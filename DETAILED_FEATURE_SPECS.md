# Private Banking Advisor Copilot - Detailed Feature Specifications

## Feature 1: Daily To-Do Management

### What It Does
Displays a prioritized list of tasks for the banking advisor's daily workflow.

### Data Flow
```mermaid
sequenceDiagram
    participant UI as Dashboard Widget
    participant API as /todo Endpoint
    participant BQ as BigQuery Table
    participant Data as todo_tasks Table
    
    UI->>API: GET /todo
    API->>BQ: SELECT * FROM todo_tasks WHERE advisor_id = 'current_advisor'
    BQ->>Data: Query: task_id, description, priority, due_date, client_name
    Data-->>BQ: Returns 10+ tasks with High/Medium/Low priority
    BQ-->>API: Raw task data
    API-->>UI: JSON: [{"task": "Call Alice Smith", "priority": "High", "due": "2025-08-07"}]
```

### Sample Data Structure
```json
{
  "tasks": [
    {
      "task_id": 1,
      "description": "Call Alice Smith about portfolio rebalancing",
      "priority": "High",
      "due_date": "2025-08-07",
      "client_name": "Alice Smith",
      "estimated_duration": "30 minutes"
    }
  ]
}
```

### BigQuery Table: `todo_tasks`
```sql
CREATE TABLE todo_tasks (
  task_id INT64,
  advisor_id STRING,
  description STRING,
  priority STRING,
  due_date DATE,
  client_name STRING,
  status STRING,
  estimated_duration STRING
);
```

---

## Feature 2: Next Best Actions (NBA)

### What It Does
Uses AI to analyze client data and recommend the most impactful actions for the advisor.

### Data Flow
```mermaid
sequenceDiagram
    participant UI as NBA Widget
    participant API as /nba Endpoint
    participant BQ as BigQuery
    participant AI as Vertex AI
    participant Prompt as Banking Prompts
    
    UI->>API: GET /nba
    API->>BQ: Query client portfolios, market data, advisor performance
    BQ-->>API: Client context: risk profiles, portfolio values, recent activity
    API->>AI: "Based on this client data, what are the top 5 actions?"
    AI->>Prompt: Banking expertise: "You are a senior advisor..."
    Prompt-->>AI: Contextual banking knowledge
    AI-->>API: AI-generated recommendations with reasoning
    API-->>UI: JSON with actionable insights
```

### Sample AI Prompt Used
```
You are a senior private banking advisor. Based on the following client data:
- 5 high-net-worth clients with $2M+ portfolios
- Market volatility increasing 15% this week
- 3 clients with overweight tech exposure

Generate the top 5 most impactful actions for this advisor today.
```

### Sample Response
```json
{
  "recommendations": [
    {
      "action": "Rebalance tech-heavy portfolios",
      "priority": "High",
      "impact": "Risk mitigation for $6M in assets",
      "clients_affected": ["Alice Smith", "Bob Wilson", "Carol Davis"]
    }
  ]
}
```

---

## Feature 3: Portfolio Analytics

### What It Does
Displays comprehensive portfolio performance, risk metrics, and asset allocation insights.

### Data Flow
```mermaid
sequenceDiagram
    participant UI as Portfolio Widget
    participant API as /portfolio Endpoint
    participant BQ as Multiple Tables
    participant Calc as Risk Calculations
    
    UI->>API: GET /portfolio
    API->>BQ: JOIN client_portfolios, market_data, trade_history
    BQ-->>API: Portfolio values, asset allocations, performance data
    API->>Calc: Calculate Sharpe ratio, beta, diversification index
    Calc-->>API: Risk metrics and performance indicators
    API-->>UI: JSON with charts data and key metrics
```

### Data Sources
1. **client_portfolios**: Current holdings and values
2. **market_data**: Asset prices and performance
3. **trade_history**: Recent transaction activity
4. **risk_metrics**: Calculated volatility and correlations

### Sample Analytics Output
```json
{
  "total_aum": "$45M",
  "ytd_return": "8.2%",
  "risk_level": "Moderate",
  "top_holdings": [
    {"symbol": "AAPL", "weight": "12%", "value": "$5.4M"},
    {"symbol": "GOOGL", "weight": "8%", "value": "$3.6M"}
  ],
  "sector_allocation": {
    "Technology": "35%",
    "Healthcare": "20%",
    "Finance": "15%"
  }
}
```

---

## Feature 4: AI Chat Agent

### What It Does
Provides an intelligent banking assistant that can answer questions about clients, markets, and strategies.

### Data Flow
```mermaid
sequenceDiagram
    participant User as Advisor
    participant Chat as Chat Interface
    participant API as /chat Endpoint
    participant BQ as BigQuery Context
    participant AI as Vertex AI Agent
    
    User->>Chat: "What's Alice Smith's risk tolerance?"
    Chat->>API: POST /chat {"message": "What's Alice Smith's risk tolerance?"}
    API->>BQ: SELECT * FROM clients WHERE name = 'Alice Smith'
    BQ-->>API: Alice's profile: risk=moderate, age=45, net_worth=$2.1M
    API->>AI: "User asks about Alice Smith. Context: [client data]"
    AI-->>API: "Alice Smith has a moderate risk tolerance with $2.1M portfolio..."
    API-->>Chat: Contextual response with specific client information
    Chat-->>User: Intelligent answer with real data
```

### Specialized Banking Prompts
```
You are an expert private banking advisor with 15 years experience.
You have access to real client data and market insights.
Always provide specific, actionable advice based on the client context provided.
Be professional, concise, and focus on wealth preservation and growth strategies.
```

### Sample Conversation
```
User: "What should I recommend for high net worth clients in this market?"
AI: "Based on current market volatility and your client base of $45M AUM, I recommend:
1. Defensive rebalancing for clients over 60 (like David Wilson)
2. Opportunistic tech buying for younger clients (like Alice Smith)
3. Consider ESG alternatives for the 3 clients who expressed sustainability interest"
```

---

## Feature 5: Message Drafting

### What It Does
Automatically generates professional client communications based on context and client data.

### Data Flow
```mermaid
sequenceDiagram
    participant UI as Draft Interface
    participant API as /draft Endpoint
    participant BQ as Client Database
    participant AI as Content Generator
    participant Templates as Banking Templates
    
    UI->>API: POST {"context": "quarterly review for Alice Smith"}
    API->>BQ: SELECT client details, portfolio performance, recent activity
    BQ-->>API: Alice's data: returns, changes, upcoming events
    API->>AI: Generate professional message with client context
    AI->>Templates: Use banking communication standards
    Templates-->>AI: Professional tone, compliance language
    AI-->>API: Personalized draft message
    API-->>UI: Editable professional email/letter
```

### Message Templates Used
- **Quarterly Review**: Performance summary + recommendations
- **Market Update**: Impact on client portfolio + actions taken
- **Meeting Follow-up**: Recap + next steps + documentation
- **Investment Proposal**: Opportunity + risk analysis + recommendation

### Sample Generated Message
```
Subject: Your Q3 Portfolio Review - Strong Performance Despite Market Volatility

Dear Alice,

I hope this message finds you well. I wanted to share your portfolio's performance 
for Q3 2025 and discuss some opportunities I've identified.

Key Highlights:
• Your portfolio returned 8.2% YTD, outperforming our benchmark by 1.4%
• We successfully reduced technology exposure from 40% to 35% last quarter
• Your risk profile remains aligned with your moderate tolerance

Recommendations:
Given the current market environment, I suggest we consider...

Best regards,
[Your Name]
Senior Private Banking Advisor
```

---

## Feature 6: Calendar Integration

### What It Does
Automatically creates calendar events by parsing natural language input about meetings and appointments.

### Data Flow
```mermaid
sequenceDiagram
    participant UI as Calendar Input
    participant API as /calendar Endpoint
    participant AI as NLP Parser
    participant GCal as Google Calendar API
    participant DB as Meeting Database
    
    UI->>API: POST {"details": "meeting with Alice tomorrow at 2pm"}
    API->>AI: Parse: extract person, time, date, purpose
    AI-->>API: Structured data: {client: "Alice", date: "2025-08-08", time: "14:00"}
    API->>GCal: Create event with parsed details
    GCal-->>API: Event created with meeting link
    API->>DB: Store meeting record for follow-up
    DB-->>API: Meeting logged
    API-->>UI: Calendar invite created + meeting details
```

### Natural Language Processing Examples
```
Input: "Call Bob Wilson next Wednesday at 10am about his portfolio"
Parsed: {
  type: "call",
  client: "Bob Wilson", 
  date: "2025-08-13",
  time: "10:00",
  topic: "portfolio discussion"
}

Input: "Schedule quarterly review with all high-net-worth clients"
Parsed: {
  type: "meeting",
  attendees: ["Alice Smith", "David Wilson", "Carol Davis"],
  duration: "60 minutes",
  topic: "quarterly portfolio review"
}
```

---

## Feature 7: Content Summarization

### What It Does
Analyzes meeting notes, research reports, or market updates and extracts key insights and action items.

### Data Flow
```mermaid
sequenceDiagram
    participant UI as Content Input
    participant API as /summarize Endpoint
    participant AI as Summarization Engine
    participant Extract as Key Point Extraction
    participant Format as Output Formatting
    
    UI->>API: POST {"content": "Long meeting notes about client portfolio..."}
    API->>AI: Analyze content for banking-relevant insights
    AI->>Extract: Identify: decisions made, action items, client concerns
    Extract-->>AI: Structured key points
    AI->>Format: Organize into: Summary, Actions, Follow-ups
    Format-->>AI: Professional format
    AI-->>API: Organized summary with clear sections
    API-->>UI: Structured summary with action items
```

### Sample Input/Output
**Input:** 
```
"Met with Alice Smith today. Discussed her concerns about market volatility. 
She wants to reduce risk but maintain growth potential. Portfolio currently 
60% stocks, 40% bonds. Mentioned daughter starting college in 2 years. 
Interested in ESG investments. Next meeting scheduled for October 15th."
```

**Output:**
```json
{
  "summary": "Client meeting focused on risk reduction while maintaining growth, college funding needs",
  "key_points": [
    "Client concerned about market volatility",
    "Wants balanced approach: lower risk + growth potential", 
    "College funding needed in 2 years",
    "Interest in ESG investment options"
  ],
  "action_items": [
    "Research ESG fund options for client review",
    "Calculate college funding projection", 
    "Prepare portfolio rebalancing proposal"
  ],
  "next_steps": "Follow-up meeting October 15th to review proposals"
}
```

---

## Feature 8: Data Ingestion

### What It Does
Converts unstructured text about clients or market data into structured database records.

### Data Flow
```mermaid
sequenceDiagram
    participant UI as Data Entry
    participant API as /ingest Endpoint
    participant AI as Data Parser
    participant Validate as Data Validation
    participant BQ as BigQuery Insert
    
    UI->>API: POST {"data": "New client: John Doe, worth $3M, moderate risk"}
    API->>AI: Extract structured fields from text
    AI-->>API: {name: "John Doe", net_worth: 3000000, risk: "moderate"}
    API->>Validate: Check data completeness and format
    Validate-->>API: Validated and formatted data
    API->>BQ: INSERT INTO clients (name, net_worth, risk_profile, date_added)
    BQ-->>API: Record inserted successfully
    API-->>UI: Confirmation + structured data preview
```

### Data Extraction Examples
```
Input: "Alice mentioned her friend Sarah Johnson, tech executive, probably worth around $5M, very conservative investor, doesn't like risk"

Extracted:
{
  "name": "Sarah Johnson",
  "profession": "tech executive", 
  "estimated_net_worth": 5000000,
  "risk_profile": "conservative",
  "source": "referral from Alice Smith",
  "notes": "dislikes risk, prefers conservative investments"
}

Input: "Market research: Tesla down 15% this week, good buying opportunity for growth clients under 50"

Extracted:
{
  "type": "market_insight",
  "asset": "TSLA",
  "movement": "-15%",
  "timeframe": "1 week", 
  "recommendation": "buy opportunity",
  "client_criteria": "growth-oriented, age < 50"
}
```

---

## How All Features Work Together

### Unified Data Architecture
```mermaid
graph TB
    subgraph "BigQuery Data Layer"
        A[clients] --> B[portfolios]
        B --> C[transactions]
        C --> D[market_data]
        D --> E[todo_tasks]
        E --> F[meetings]
        F --> G[communications]
        G --> H[advisor_notes]
    end
    
    subgraph "AI Processing Layer"
        I[Vertex AI gemini-pro]
        J[Banking Prompts]
        K[Context Injection]
    end
    
    subgraph "Frontend Dashboard"
        L[8 Interactive Widgets]
    end
    
    A -.-> I
    B -.-> I
    C -.-> I
    I --> J
    J --> K
    K --> L
```

### Authentication & Security
- **Demo Authentication**: Simplified login for hackathon demo
- **Service Account**: Backend uses Google Cloud service account for BigQuery/Vertex AI access
- **CORS**: Properly configured for frontend-backend communication
- **Environment Variables**: API URLs and project settings configured per environment

This comprehensive architecture provides a complete private banking advisor copilot with real data, AI-powered insights, and professional workflows!

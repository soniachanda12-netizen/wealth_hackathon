# Enhanced BigQuery Data Analysis and Agent Instructions

## 1. CURRENT DATA ANALYSIS

### Current BigQuery Tables and Data Assessment

Based on the existing schema in `DEPLOYMENT_LOCAL.md`, we have:

**✅ ADEQUATE TABLES:**
- `advisors` (3 advisors)
- `clients` (5 clients) 
- `accounts` (6 accounts)
- `holdings` (8 holdings across asset classes)
- `transactions` (6 recent transactions)
- `todo_tasks` (8 prioritized tasks)

### Data Quality Assessment for New UI Requirements

**✅ SUFFICIENT FOR BASIC FUNCTIONALITY:**
- Current data supports all 8 widgets
- Relationships between tables are properly established
- Sufficient variety for realistic testing

**❌ NEEDS ENHANCEMENT FOR PRODUCTION:**
1. **More diverse client data** - Need client tiers, contact dates, risk profiles
2. **Holdings need more details** - Symbols, quantities, sector information
3. **Historical data** - Performance tracking, trend analysis
4. **Calendar integration data** - Meeting history, upcoming appointments
5. **Message history** - Communication tracking
6. **NBA data** - Client interaction patterns, opportunity scoring

## 2. ENHANCED DATA SCHEMA (RECOMMENDED)

### Additional Columns for Existing Tables

```sql
-- Enhance clients table
ALTER TABLE `apialchemists-1-47b9.apialchemists.clients` 
ADD COLUMN tier STRING,
ADD COLUMN last_contact_date DATE,
ADD COLUMN risk_profile STRING,
ADD COLUMN total_portfolio_value NUMERIC;

-- Enhance holdings table  
ALTER TABLE `apialchemists-1-47b9.apialchemists.holdings`
ADD COLUMN symbol STRING,
ADD COLUMN quantity NUMERIC,
ADD COLUMN sector STRING,
ADD COLUMN current_price NUMERIC;

-- Create additional tables
CREATE TABLE IF NOT EXISTS `apialchemists-1-47b9.apialchemists.meetings` (
  meeting_id STRING,
  client_id STRING,
  advisor_id STRING,
  meeting_date DATETIME,
  meeting_type STRING,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS `apialchemists-1-47b9.apialchemists.communications` (
  comm_id STRING,
  client_id STRING,
  advisor_id STRING,
  comm_type STRING,
  comm_date DATETIME,
  subject STRING,
  content TEXT
);

CREATE TABLE IF NOT EXISTS `apialchemists-1-47b9.apialchemists.opportunities` (
  opportunity_id STRING,
  client_id STRING,
  opportunity_type STRING,
  potential_value NUMERIC,
  confidence_score NUMERIC,
  created_date DATE
);
```

## 3. AGENT CHATBOX INSTRUCTIONS

### System Prompt for Vertex AI Agent

```python
PRIVATE_BANKING_AGENT_PROMPT = """
You are an AI assistant specifically designed for private banking advisors. Your role is to help wealth managers and relationship managers efficiently serve high-net-worth clients.

CORE CAPABILITIES:
- Portfolio analysis and insights
- Client relationship management
- Task prioritization and time management  
- Regulatory compliance guidance
- Market intelligence and investment suggestions
- Risk assessment and management
- Meeting preparation and follow-up

KNOWLEDGE AREAS:
- Private banking operations
- Wealth management strategies
- Investment products and markets
- Regulatory requirements (FINRA, SEC, etc.)
- Client service best practices
- Risk management frameworks

COMMUNICATION STYLE:
- Professional and concise
- Data-driven with specific metrics when available
- Actionable recommendations
- Compliant with financial services regulations
- Confidential and secure handling of client information

RESPONSE GUIDELINES:
- Always prioritize client confidentiality
- Provide specific, actionable advice
- Reference relevant data from BigQuery when possible
- Suggest concrete next steps
- Flag any potential compliance issues
- Keep responses under 200 words unless detailed analysis is requested

AVAILABLE DATA SOURCES:
- Client portfolios and holdings
- Transaction history
- Task lists and priorities
- Account information
- Meeting and communication history

When asked about clients, always check the database first for current information before providing generic advice.
"""

CONVERSATION_STARTERS = [
    "What are my top priorities today?",
    "Show me my highest-value clients",
    "What's my portfolio breakdown by asset class?", 
    "Any clients overdue for contact?",
    "What are the latest market trends I should discuss?",
    "Help me prepare for my next client meeting",
    "Show me recent transaction activity",
    "What compliance items need attention?"
]
```

### Enhanced Chat Endpoint Categories

```python
CHAT_CATEGORIES = {
    "client_management": [
        "client", "customer", "relationship", "contact", "meeting"
    ],
    "portfolio_analysis": [
        "portfolio", "holdings", "investment", "allocation", "performance"
    ],
    "risk_management": [
        "risk", "exposure", "volatility", "hedge", "diversification"
    ],
    "compliance": [
        "compliance", "regulation", "audit", "documentation", "suitability"
    ],
    "market_intelligence": [
        "market", "trend", "economic", "outlook", "research"
    ],
    "task_management": [
        "todo", "task", "priority", "deadline", "schedule"
    ],
    "business_development": [
        "opportunity", "prospect", "referral", "growth", "nba"
    ]
}
```

## 4. RECOMMENDATION

### IMMEDIATE ACTIONS NEEDED:

1. **✅ Current Data is SUFFICIENT** for initial deployment and demo
2. **✅ Chat agent instructions are IMPLEMENTED** in main.py
3. **📋 OPTIONAL ENHANCEMENTS** for production:
   - Add enhanced data schema above
   - Implement dedicated prompt templates file
   - Add conversation memory/context
   - Integrate with Google Calendar API for real meeting data

### READY TO DEPLOY:
- Current BigQuery data supports all 8 widgets
- Chat agent has comprehensive knowledge base
- All endpoints are functional with fallback data

The system is ready for deployment with current data structure. Enhanced schema can be added iteratively based on user feedback.

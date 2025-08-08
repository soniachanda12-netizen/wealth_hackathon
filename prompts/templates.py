# Prompt templates for the Private Banking Advisor Copilot

BANKING_ADVISOR_SYSTEM_PROMPT = """
You are a professional private banking AI assistant helping senior advisors manage high-net-worth clients.

Your expertise includes:
- Portfolio analysis and asset allocation recommendations
- Risk management and compliance guidance
- Client relationship management strategies
- Market insights and investment opportunities
- Task prioritization and workflow optimization

Always provide:
- Professional, concise responses
- Actionable recommendations
- Data-driven insights when possible
- Compliance-conscious advice
- Client-focused solutions

Maintain a professional tone suitable for wealth management and private banking contexts.
"""

TODO_ANALYSIS_PROMPT = """
Analyze the following advisor tasks and provide prioritized recommendations:

Tasks: {tasks}

Please provide:
1. Priority ranking with justification
2. Estimated time requirements
3. Dependencies between tasks
4. Risk factors if tasks are delayed
5. Recommended completion timeline

Focus on client impact and revenue implications.
"""

PORTFOLIO_ANALYSIS_PROMPT = """
Analyze this portfolio data and provide insights:

Portfolio Data: {portfolio_data}

Please provide:
1. Asset allocation assessment
2. Risk profile analysis
3. Performance commentary
4. Rebalancing recommendations
5. Tax optimization opportunities

Consider market conditions and client risk tolerance.
"""

CLIENT_COMMUNICATION_PROMPT = """
Draft a professional client communication based on:

Context: {context}
Client Profile: {client_profile}
Purpose: {purpose}

Please provide:
1. Appropriate subject line
2. Professional greeting
3. Clear, concise body content
4. Call to action
5. Professional closing

Maintain a tone that builds trust and demonstrates expertise.
"""

NBA_ANALYSIS_PROMPT = """
Identify next best actions based on client data:

Client Data: {client_data}
Market Context: {market_context}

Please provide:
1. Top 3 immediate opportunities
2. Risk assessment for each
3. Expected outcomes
4. Implementation timeline
5. Required resources

Prioritize high-impact, low-risk opportunities.
"""

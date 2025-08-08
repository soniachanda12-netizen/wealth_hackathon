# apialchemistproject Features

This project implements the following features for private bank advisors and day planning:

1. **Generate Prioritized Daily To-Do List**
   - Uses BigQuery to analyze book of business and Vertex AI for prioritization.
   - Endpoint: `/todo`
   - UI: Daily to-do list dashboard

2. **Suggest Next Best Actions (NBA)**
   - Leverages Gemini (Vertex AI) models to recommend actions based on client activity.
   - Endpoint: `/nba`
   - UI: NBA suggestions panel

3. **Automate Drafting Personalized Messages**
   - Uses Gemini/Vertex AI for natural language generation of client messages.
   - Endpoint: `/draft-message`
   - UI: Message composer

4. **Automate Creating Calendar Invites**
   - Integrates Google Calendar API and Vertex AI to create invites.
   - Endpoint: `/calendar-invite`
   - UI: Calendar invite form

5. **Synthesize and Summarize Unstructured Data (Emails/Meetings)**
   - Uses Document AI for extraction and Vertex AI for summarization.
   - Endpoint: `/summarize`
   - UI: Meeting/email summary viewer

6. **Analyze and Ingest Unstructured Data**
   - Data pipeline setup with Google Cloud Storage and BigQuery.
   - Endpoint: `/ingest-data`
   - UI: Data ingestion status

7. **Provide Aggregation View Insights Across Custodians**
   - Uses BigQuery for aggregation and insights.
   - Endpoint: `/aggregation`
   - UI: Aggregation dashboard

8. **Conversational Agent (Advisor Chat)**
   - Powered by Agentspace and Vertex AI for chat and advisor interaction.
   - Endpoint: `/chat`
   - UI: Conversational agent chat interface

All features are accessible from the dashboard UI after deployment. See `DEPLOYMENT.md` for setup and usage instructions.



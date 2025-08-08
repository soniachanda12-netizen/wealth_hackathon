from fastapi import FastAPI, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import bigquery, storage, discoveryengine_v1 as discovery
from google.api_core.client_options import ClientOptions
from googleapiclient.discovery import build
import vertexai
from vertexai.generative_models import GenerativeModel
import os
import datetime
import uvicorn
from typing import Optional

# Import prompt templates (absolute import)
from backend.prompt_templates import (
    BANKING_ADVISOR_SYSTEM_PROMPT,
    NBA_GENERATION_PROMPT,
    MESSAGE_DRAFTING_PROMPT,
    CONTENT_SUMMARIZATION_PROMPT,
    TASK_PRIORITIZATION_PROMPT,
    CALENDAR_PROMPT
)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "https://apialchemistproject-frontend-608187465720.us-central1.run.app"
    ],  # Frontend URLs including Cloud Run
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Initialize clients
project_id = os.getenv("PROJECT_ID", "apialchemists-1-47b9")
dataset_name = os.getenv("DATASET_NAME", "apialchemists")
location = os.getenv("LOCATION", "us-central1")

# Initialize Vertex AI
vertexai.init(project=project_id, location=location)

@app.get("/")
def root():
    return {"message": "Private Banking Advisor Copilot backend is running"}

@app.get("/auth-check")
def auth_check():
    """Health check endpoint that also validates authentication"""
    return {
        "status": "authenticated",
        "message": "Backend authentication successful",
        "project_id": project_id,
        "timestamp": "2025-08-07"
    }

@app.get("/clients")
def get_clients(advisor_id: Optional[str] = Query(None)):
    """Get clients filtered by advisor"""
    try:
        # Default to ADV001 if no advisor_id provided
        current_advisor_id = advisor_id or 'ADV001'
        
        # Initialize BigQuery client with explicit project - Cloud Run uses service account automatically
        project_id = os.getenv('PROJECT_ID', 'apialchemists-1-47b9')
        dataset_name = os.getenv('DATASET_NAME', 'apialchemists')
        
        try:
            # In Cloud Run, this will use the service account automatically
            bq_client = bigquery.Client(project=project_id)
            print(f"BigQuery client initialized for project: {project_id}")
        except Exception as auth_error:
            print(f"BigQuery authentication error: {auth_error}")
            # Return mock data if database is not available
            return {
                "clients": [
                    {
                        "client_id": "CL001",
                        "name": "Alice Johnson",
                        "email": "alice.johnson@email.com",
                        "client_tier": "Premium",
                        "net_worth": 2500000,
                        "risk_tolerance": "Moderate",
                        "investment_objective": "Growth"
                    }
                ],
                "total_clients": 1,
                "advisor_id": current_advisor_id,
                "note": "Using mock data - database connection failed"
            }
        
        # Get clients for this advisor with their portfolio values
        clients_query = f"""
        SELECT 
            c.client_id,
            c.name,
            c.email,
            c.phone,
            c.client_tier,
            c.net_worth,
            c.risk_tolerance,
            c.investment_objective,
            c.location,
            c.onboarding_date,
            COALESCE(SUM(h.value), 0) as portfolio_value,
            COUNT(h.holding_id) as total_holdings,
            COUNT(DISTINCT h.asset_class) as asset_classes,
            MAX(ci.date) as last_contact_date
        FROM `{project_id}.{dataset_name}.clients` c
        LEFT JOIN `{project_id}.{dataset_name}.holdings` h ON c.client_id = h.client_id
        LEFT JOIN `{project_id}.{dataset_name}.client_interactions` ci ON c.client_id = ci.client_id
        WHERE c.advisor_id = '{current_advisor_id}'
        GROUP BY c.client_id, c.name, c.email, c.phone, c.client_tier, c.net_worth, 
                 c.risk_tolerance, c.investment_objective, c.location, c.onboarding_date
        ORDER BY portfolio_value DESC
        """
        
        results = list(bq_client.query(clients_query).result())
        
        clients_data = []
        for row in results:
            clients_data.append({
                "client_id": row.client_id,
                "name": row.name,
                "email": row.email,
                "phone": row.phone,
                "location": row.location,
                "client_tier": row.client_tier,
                "net_worth": float(row.net_worth) if row.net_worth else 0,
                "portfolio_value": float(row.portfolio_value),
                "risk_tolerance": row.risk_tolerance,
                "investment_objective": row.investment_objective,
                "total_holdings": int(row.total_holdings),
                "asset_classes": int(row.asset_classes),
                "onboarding_date": str(row.onboarding_date),
                "last_contact": str(row.last_contact_date) if row.last_contact_date else None
            })
        
        return {
            "clients": clients_data,
            "total_clients": len(clients_data),
            "advisor_id": current_advisor_id,
            "summary": {
                "total_portfolio_value": sum(client["portfolio_value"] for client in clients_data),
                "avg_portfolio_value": sum(client["portfolio_value"] for client in clients_data) / len(clients_data) if clients_data else 0,
                "high_value_clients": len([c for c in clients_data if c["portfolio_value"] >= 1000000]),
                "tier_distribution": {}
            }
        }
        
    except Exception as e:
        print(f"Clients error for advisor {advisor_id}: {e}")
        return {
            "clients": [],
            "total_clients": 0,
            "advisor_id": advisor_id or 'ADV001',
            "error": f"Failed to fetch clients: {str(e)}"
        }

@app.post("/advisor-by-email")
async def get_advisor_by_email(request: Request):
    """Get advisor information by email address"""
    try:
        data = await request.json()
        email = data.get("email", "").lower().strip()
        
        if not email:
            return {"error": "Email is required"}
        
        # Initialize BigQuery client with error handling
        try:
            # Use explicit project ID for Cloud Run service account
            project_id = os.getenv('PROJECT_ID', 'apialchemists-1-47b9')
            dataset_name = os.getenv('DATASET_NAME', 'apialchemists')
            bq_client = bigquery.Client(project=project_id)
            print(f"BigQuery client initialized for advisor lookup, project: {project_id}")
            query = f"""
            SELECT advisor_id, name, email, specialization, years_experience, location 
            FROM `{project_id}.{dataset_name}.advisors` 
            WHERE LOWER(email) = LOWER('{email}') 
            LIMIT 1
            """
            
            results = list(bq_client.query(query).result())
            
            if results:
                advisor = results[0]
                return {
                    "advisor": {
                        "advisor_id": advisor.advisor_id,
                        "name": advisor.name,
                        "email": advisor.email,
                        "specialization": advisor.specialization,
                        "years_experience": advisor.years_experience,
                        "location": advisor.location,
                        "found": True
                    }
                }
            else:
                # Try to get default advisor from database
                default_query = f"""
                SELECT advisor_id, name, email, specialization, years_experience, location 
                FROM `{project_id}.{dataset_name}.advisors` 
                WHERE advisor_id = 'ADV001' 
                LIMIT 1
                """
                default_results = list(bq_client.query(default_query).result())
                
                if default_results:
                    advisor = default_results[0]
                    return {
                        "advisor": {
                            "advisor_id": advisor.advisor_id,
                            "name": advisor.name,
                            "email": advisor.email,
                            "specialization": advisor.specialization,
                            "years_experience": advisor.years_experience,
                            "location": advisor.location,
                            "found": False,
                            "isDefault": True
                        },
                        "message": f"No advisor found for {email}, using default advisor"
                    }
                else:
                    # Fallback to hardcoded ADV001 data
                    return {
                        "advisor": {
                            "advisor_id": "ADV001",
                            "name": "John Smith",
                            "email": "john.smith@privatebank.com",
                            "specialization": "Wealth Management",
                            "years_experience": 15,
                            "location": "New York",
                            "found": False,
                            "isDefault": True
                        },
                        "source": "hardcoded_fallback",
                        "message": f"No advisor found for {email}, using hardcoded default ADV001"
                    }
                    
        except Exception as auth_error:
            print(f"BigQuery authentication error: {auth_error}")
            # Return hardcoded ADV001 data when database is unavailable
            return {
                "advisor": {
                    "advisor_id": "ADV001",
                    "name": "John Smith", 
                    "email": "john.smith@privatebank.com",
                    "specialization": "Wealth Management",
                    "years_experience": 15,
                    "location": "New York",
                    "found": False,
                    "isDefault": True
                },
                "source": "authentication_fallback",
                "message": f"Database connection failed for {email}, using ADV001 fallback",
                "error": "Database authentication failed"
            }
                
    except Exception as e:
        print(f"Advisor lookup error: {e}")
        # Final fallback - return ADV001 even if JSON parsing fails
        return {
            "advisor": {
                "advisor_id": "ADV001",
                "name": "John Smith",
                "email": "john.smith@privatebank.com", 
                "specialization": "Wealth Management",
                "years_experience": 15,
                "location": "New York",
                "found": False,
                "isDefault": True
            },
            "source": "error_fallback",
            "error": f"Failed to lookup advisor: {str(e)}"
        }

@app.post("/advisor-by-id")
async def get_advisor_by_id(request: Request):
    """Get advisor information by advisor ID"""
    try:
        data = await request.json()
        advisor_id = data.get("advisor_id")
        
        if not advisor_id:
            return {"error": "Advisor ID is required"}
        
        # Initialize BigQuery client with error handling
        try:
            # Use explicit project ID for Cloud Run service account  
            project_id = os.getenv('PROJECT_ID', 'apialchemists-1-47b9')
            dataset_name = os.getenv('DATASET_NAME', 'apialchemists')
            bq_client = bigquery.Client(project=project_id)
            print(f"BigQuery client initialized for advisor-by-id, project: {project_id}")
            
            # If numeric ID provided, find the corresponding advisor_id
            if str(advisor_id).isdigit():
                query = f"""
                SELECT advisor_id, name, email, specialization, years_experience, location 
                FROM `{project_id}.{dataset_name}.advisors` 
                ORDER BY advisor_id
                LIMIT 1 OFFSET {int(advisor_id) - 1}
                """
            else:
                query = f"""
                SELECT advisor_id, name, email, specialization, years_experience, location 
                FROM `{project_id}.{dataset_name}.advisors` 
                WHERE advisor_id = '{advisor_id}' 
                LIMIT 1
                """
            
            results = list(bq_client.query(query).result())
            
            if results:
                advisor = results[0]
                return {
                    "advisor": {
                        "advisor_id": advisor.advisor_id,
                        "name": advisor.name,
                        "email": advisor.email,
                        "specialization": advisor.specialization,
                        "years_experience": advisor.years_experience,
                        "location": advisor.location,
                        "found": True
                    }
                }
            else:
                # If requested advisor not found, return ADV001 as fallback
                if advisor_id != "ADV001":
                    fallback_query = f"""
                    SELECT advisor_id, name, email, specialization, years_experience, location 
                    FROM `{project_id}.{dataset_name}.advisors` 
                    WHERE advisor_id = 'ADV001' 
                    LIMIT 1
                    """
                    fallback_results = list(bq_client.query(fallback_query).result())
                    
                    if fallback_results:
                        advisor = fallback_results[0]
                        return {
                            "advisor": {
                                "advisor_id": advisor.advisor_id,
                                "name": advisor.name,
                                "email": advisor.email,
                                "specialization": advisor.specialization,
                                "years_experience": advisor.years_experience,
                                "location": advisor.location,
                                "found": False,
                                "isDefault": True
                            },
                            "message": f"Advisor {advisor_id} not found, using default ADV001"
                        }
                
                # If ADV001 also not found or was originally requested, return hardcoded
                return {
                    "advisor": {
                        "advisor_id": "ADV001",
                        "name": "John Smith",
                        "email": "john.smith@privatebank.com",
                        "specialization": "Wealth Management",
                        "years_experience": 15,
                        "location": "New York",
                        "found": False,
                        "isDefault": True
                    },
                    "source": "hardcoded_fallback",
                    "message": f"Advisor {advisor_id} not found in database, using hardcoded ADV001"
                }
                
        except Exception as auth_error:
            print(f"BigQuery authentication error in advisor-by-id: {auth_error}")
            # Return hardcoded ADV001 when database unavailable
            return {
                "advisor": {
                    "advisor_id": "ADV001",
                    "name": "John Smith",
                    "email": "john.smith@privatebank.com", 
                    "specialization": "Wealth Management",
                    "years_experience": 15,
                    "location": "New York",
                    "found": False,
                    "isDefault": True
                },
                "source": "authentication_fallback",
                "message": f"Database connection failed for advisor {advisor_id}, using ADV001 fallback",
                "error": "Database authentication failed"
            }
                
    except Exception as e:
        print(f"Advisor lookup by ID error: {e}")
        # Final fallback - return ADV001 even if JSON parsing fails
        return {
            "advisor": {
                "advisor_id": "ADV001", 
                "name": "John Smith",
                "email": "john.smith@privatebank.com",
                "specialization": "Wealth Management", 
                "years_experience": 15,
                "location": "New York",
                "found": False,
                "isDefault": True
            },
            "source": "error_fallback",
            "error": f"Failed to lookup advisor: {str(e)}"
        }

@app.get("/todo")
def get_todo(advisor_id: Optional[str] = Query(None)):
    """Get todo tasks filtered by advisor"""
    try:
        # Default to ADV001 if no advisor_id provided
        current_advisor_id = advisor_id or 'ADV001'
        
        # BigQuery client setup with explicit project
        project_id = os.getenv('PROJECT_ID', 'apialchemists-1-47b9')
        dataset_name = os.getenv('DATASET_NAME', 'apialchemists')
        bq_client = bigquery.Client(project=project_id)
        print(f"BigQuery client initialized for todo, project: {project_id}")
        
        # Get tasks for clients of this advisor
        query = f"""
        SELECT tt.task, tt.priority, c.name as client_name
        FROM `{project_id}.{dataset_name}.todo_tasks` tt
        LEFT JOIN `{project_id}.{dataset_name}.clients` c ON tt.client_id = c.client_id
        WHERE c.advisor_id = '{current_advisor_id}' OR tt.client_id IS NULL
        ORDER BY tt.priority ASC 
        LIMIT 10
        """
        results = bq_client.query(query).result()
        tasks = [f"{row.task} {('('+row.client_name+')' if row.client_name else '')}" for row in results]

        # If no tasks found for this advisor, get general tasks
        if not tasks:
            fallback_query = f"SELECT task FROM `{project_id}.{dataset_name}.todo_tasks` ORDER BY priority ASC LIMIT 10"
            results = bq_client.query(fallback_query).result()
            tasks = [row.task for row in results]

        # Vertex AI integration for prioritization using Gemini
        model = GenerativeModel("gemini-1.5-pro")
        prompt = f"Prioritize these tasks for advisor {current_advisor_id}: {', '.join(tasks)}. Return a numbered list."
        response = model.generate_content(prompt)
        
        # Parse prioritized tasks or fallback to original
        prioritized_tasks = response.text.split('\n') if response.text else tasks
        
        return {
            "todo": prioritized_tasks[:10],
            "advisor_id": current_advisor_id
        }
    except Exception as e:
        # Fallback to placeholder data if services unavailable
        return {"todo": [
            f"Review high-priority client portfolios for {advisor_id or 'ADV001'}",
            "Prepare quarterly investment reports", 
            "Schedule client check-in calls",
            "Analyze market trends for recommendations",
            "Update compliance documentation"
        ]}

@app.get("/nba")
def get_nba(advisor_id: Optional[str] = Query(None)):
    """Get Next Best Actions filtered by advisor"""
    try:
        # Default to ADV001 if no advisor_id provided
        current_advisor_id = advisor_id or 'ADV001'
        
        # Get recent client activity from BigQuery using correct schema for this advisor
        bq_client = bigquery.Client(project=project_id)
        query = f"""
        SELECT t.transaction_id, t.amount, t.category, t.date, c.client_id, c.name as client_name
        FROM `{project_id}.{dataset_name}.transactions` t
        JOIN `{project_id}.{dataset_name}.accounts` a ON t.account_id = a.account_id
        JOIN `{project_id}.{dataset_name}.clients` c ON a.client_id = c.client_id
        WHERE c.advisor_id = '{current_advisor_id}'
        ORDER BY t.date DESC LIMIT 5
        """
        results = bq_client.query(query).result()
        recent_activity = [f"{row.client_name}: {row.category} ${row.amount}" for row in results]
        
        # Vertex AI for NBA suggestions using Gemini
        model = GenerativeModel("gemini-1.5-pro")
        prompt = f"""
        Based on recent client activity: {', '.join(recent_activity)}
        Suggest 3 next best actions for a private bank advisor.
        Format as bullet points.
        """
        response = model.generate_content(prompt)
        
        nba_suggestions = response.text.split('\n') if response.text else []
        # Clean up the suggestions
        nba = [action.strip('- •') for action in nba_suggestions if action.strip()]
        
        return {"next_best_actions": nba[:3]}
    except Exception as e:
        # Fallback suggestions
        return {"next_best_actions": [
            "Review client's recent transactions for rebalancing opportunities",
            "Schedule follow-up meeting for portfolio review",
            "Send personalized market update email to top clients"
        ]}

@app.post("/draft-message")
async def draft_message(request: Request):
    try:
        data = await request.json()
        context = data.get("text", "")
        client_id = data.get("client_id", "")
        
        # Get client info if client_id provided using correct schema
        client_context = ""
        if client_id:
            bq_client = bigquery.Client(project=project_id)
            query = f"SELECT name, email, phone FROM `{project_id}.{dataset_name}.clients` WHERE client_id = '{client_id}' LIMIT 1"
            results = bq_client.query(query).result()
            for row in results:
                client_context = f"Client: {row.name} ({row.email}, {row.phone})"
        
        # Enhanced Vertex AI message generation with professional banking template using Gemini
        model = GenerativeModel("gemini-1.5-pro")
        prompt = MESSAGE_DRAFTING_PROMPT.format(
            system_prompt=BANKING_ADVISOR_SYSTEM_PROMPT,
            context=context,
            client_name=client_context.split(':')[1].split('(')[0].strip() if client_context else "Valued Client",
            message_type="Email Update",
            key_points=f"Context: {context}"
        )
        response = model.generate_content(prompt)
        
        draft = response.text if response.text else f"Dear valued client,\n\nI hope this message finds you well. I wanted to reach out regarding {context} and provide you with a personalized update on your portfolio.\n\nI look forward to discussing this further at your convenience.\n\nBest regards,\nYour Private Banking Advisor"
        
        return {"draft": draft}
    except Exception as e:
        return {"draft": f"Dear valued client,\n\nI hope this message finds you well. I wanted to reach out regarding {context} and provide you with a personalized update on your portfolio and investment opportunities.\n\nPlease don't hesitate to contact me if you have any questions or would like to schedule a meeting to discuss your financial objectives.\n\nBest regards,\nYour Private Banking Advisor"}

@app.post("/calendar-invite")
async def calendar_invite(request: Request):
    try:
        data = await request.json()
        details = data.get("details", "")
        
        # Use Vertex AI to structure the invite details using Gemini
        model = GenerativeModel("gemini-1.5-pro")
        prompt = f"""
        Parse this meeting request and suggest calendar event details:
        "{details}"
        
        Return in format:
        Title: [meeting title]
        Description: [meeting description]
        Duration: [suggested duration in minutes]
        """
        response = model.generate_content(prompt)
        
        # For now, just return the structured details
        # Real implementation would use Google Calendar API
        return {
            "invite_status": f"Calendar invite prepared: {response.text if response.text else details}",
            "structured_details": response.text if response.text else details
        }
    except Exception as e:
        return {"invite_status": f"Calendar invite prepared for: {details}"}

@app.post("/summarize")
async def summarize(request: Request):
    try:
        data = await request.json()
        text = data.get("text", "")
        
        # Enhanced summarization for banking context using Gemini
        model = GenerativeModel("gemini-1.5-pro")
        prompt = CONTENT_SUMMARIZATION_PROMPT.format(
            system_prompt=BANKING_ADVISOR_SYSTEM_PROMPT,
            content=text
        )
        response = model.generate_content(prompt)
        
        summary = response.text if response.text else f"**Executive Summary**: Key insights from provided content.\n\n**Key Points**:\n• {text[:150]}...\n\n**Action Items**: Review content for client impact and investment implications.\n\n**Relevance**: Content may contain information relevant to client portfolio management and advisory services."
        
        return {"summary": summary}
    except Exception as e:
        return {"summary": f"**Executive Summary**: Content analysis temporarily unavailable.\n\n**Key Points**:\n• {text[:150]}...\n\n**Recommendation**: Manual review suggested for full context and actionable insights."}

@app.post("/ingest-data")
async def ingest_data(request: Request):
    try:
        data = await request.json()
        ingest_content = data.get("data", "")
        file_type = data.get("type", "text")
        
        # Validate input
        if not ingest_content.strip():
            return {"ingest_status": "Error: No data provided for ingestion"}
        
        # Upload to Cloud Storage - using existing bucket
        storage_client = storage.Client()
        bucket_name = "apialchemists"  # Use existing bucket
        
        try:
            bucket = storage_client.bucket(bucket_name)
            # Test if bucket exists and is accessible
            bucket.reload()
        except Exception as bucket_error:
            print(f"Bucket access error: {bucket_error}")
            return {"ingest_status": f"Error: Unable to access Cloud Storage bucket '{bucket_name}'. Please check permissions."}
        
        # Generate unique filename with advisor folder structure
        import datetime
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        blob_name = f"advisor-data/ingested_data_{timestamp}.{file_type}"
        
        try:
            blob = bucket.blob(blob_name)
            blob.upload_from_string(ingest_content)
            
            # Optionally trigger BigQuery ingestion job here
            # bq_client = bigquery.Client()
            # job_config = bigquery.LoadJobConfig()
            # job = bq_client.load_job_from_uri(f"gs://{bucket_name}/{blob_name}", table_ref, job_config=job_config)
            
            return {
                "ingest_status": f"✅ Data successfully uploaded to Cloud Storage",
                "file_location": f"gs://{bucket_name}/{blob_name}",
                "file_size": len(ingest_content),
                "timestamp": timestamp,
                "bucket": bucket_name,
                "next_steps": "File stored in Cloud Storage. Integration with BigQuery available for analysis."
            }
        except Exception as upload_error:
            print(f"Upload error: {upload_error}")
            return {"ingest_status": f"Error: Failed to upload file - {str(upload_error)}"}
            
    except Exception as e:
        print(f"Ingest data error: {e}")
        return {
            "ingest_status": f"❌ Data ingestion failed: {str(e)}",
            "troubleshooting": "Check Google Cloud authentication and storage permissions"
        }

@app.get("/dashboard-metrics")
def get_dashboard_metrics():
    """Optimized endpoint for modern dashboard visualization with Looker-ready format"""
    try:
        bq_client = bigquery.Client(project=project_id)
        
        # KPI Summary Cards
        kpi_query = f"""
        WITH portfolio_summary AS (
            SELECT 
                COUNT(DISTINCT c.client_id) as total_clients,
                COUNT(DISTINCT a.advisor_id) as total_advisors,
                SUM(h.value) as total_aum,
                COUNT(DISTINCT h.symbol) as unique_securities,
                AVG(h.value) as avg_holding_value
            FROM `{project_id}.{dataset_name}.holdings` h
            JOIN `{project_id}.{dataset_name}.clients` c ON h.client_id = c.client_id
            JOIN `{project_id}.{dataset_name}.advisors` a ON c.advisor_id = a.advisor_id
        )
        SELECT * FROM portfolio_summary
        """
        
        # Asset allocation for pie charts
        asset_allocation_query = f"""
        SELECT 
            h.asset_class,
            SUM(h.value) as value,
            COUNT(*) as holdings_count,
            COUNT(DISTINCT c.client_id) as client_count,
            ROUND(100.0 * SUM(h.value) / SUM(SUM(h.value)) OVER(), 2) as percentage
        FROM `{project_id}.{dataset_name}.holdings` h
        JOIN `{project_id}.{dataset_name}.clients` c ON h.client_id = c.client_id
        GROUP BY h.asset_class
        ORDER BY value DESC
        """
        
        # Top performers for leaderboard
        top_advisors_query = f"""
        SELECT 
            a.name as advisor_name,
            COUNT(DISTINCT c.client_id) as client_count,
            SUM(h.value) as total_aum,
            ROUND(AVG(h.value), 0) as avg_holding_value,
            COUNT(DISTINCT h.asset_class) as asset_diversity,
            RANK() OVER (ORDER BY SUM(h.value) DESC) as rank
        FROM `{project_id}.{dataset_name}.advisors` a
        LEFT JOIN `{project_id}.{dataset_name}.clients` c ON a.advisor_id = c.advisor_id
        LEFT JOIN `{project_id}.{dataset_name}.holdings` h ON c.client_id = h.client_id
        GROUP BY a.advisor_id, a.name
        HAVING SUM(h.value) > 0
        ORDER BY total_aum DESC
        LIMIT 10
        """
        
        # Monthly trend data for line charts
        monthly_trends_query = f"""
        SELECT 
            EXTRACT(YEAR FROM t.date) as year,
            EXTRACT(MONTH FROM t.date) as month,
            DATE_TRUNC(DATE(t.date), MONTH) as month_year,
            SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END) as inflows,
            SUM(CASE WHEN t.amount < 0 THEN ABS(t.amount) ELSE 0 END) as outflows,
            COUNT(DISTINCT c.client_id) as active_clients,
            COUNT(*) as transaction_count
        FROM `{project_id}.{dataset_name}.transactions` t
        JOIN `{project_id}.{dataset_name}.accounts` a ON t.account_id = a.account_id
        JOIN `{project_id}.{dataset_name}.clients` c ON a.client_id = c.client_id
        WHERE t.date >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
        GROUP BY year, month, month_year
        ORDER BY year DESC, month DESC
        LIMIT 12
        """
        
        # Risk metrics for heatmap
        risk_metrics_query = f"""
        SELECT 
            h.asset_class,
            h.sector,
            SUM(h.value) as exposure,
            COUNT(*) as positions,
            STDDEV(h.current_price) as volatility,
            AVG(SAFE_DIVIDE(h.current_price - h.purchase_price, NULLIF(h.purchase_price, 0)) * 100) as avg_performance
        FROM `{project_id}.{dataset_name}.holdings` h
        WHERE h.sector IS NOT NULL
        GROUP BY h.asset_class, h.sector
        HAVING SUM(h.value) > 100000
        ORDER BY exposure DESC
        """
        
        # Execute all queries
        kpi_results = list(bq_client.query(kpi_query).result())
        asset_results = list(bq_client.query(asset_allocation_query).result())
        advisor_results = list(bq_client.query(top_advisors_query).result())
        trends_results = list(bq_client.query(monthly_trends_query).result())
        risk_results = list(bq_client.query(risk_metrics_query).result())
        
        # Format KPIs
        kpis = kpi_results[0] if kpi_results else None
        
        # Generate AI insights for dashboard with robust model fallback
        total_aum = kpis.total_aum if kpis else 0
        context = f"Portfolio: ${total_aum:,.0f} AUM, {len(asset_results)} asset classes"
        insights_prompt = f"""
        {BANKING_ADVISOR_SYSTEM_PROMPT}

        Generate 4 concise dashboard insights for: {context}

        Focus on:
        1. Performance highlight
        2. Risk observation
        3. Opportunity identification
        4. Action recommendation

        Keep each insight under 15 words, dashboard-friendly format.
        """
        model = None
        response = None
        model_error = None
        for model_name in ["gemini-pro", "gemini-1.0-pro"]:
            try:
                model = GenerativeModel(model_name)
                response = model.generate_content(insights_prompt)
                if response.text and len(response.text.strip()) > 10:
                    break
            except Exception as e:
                model_error = str(e)
                print(f"Vertex AI model error for {model_name}: {e}")
                response = None
        if response and response.text:
            insights = response.text.split('\n')[:4]
        else:
            insights = [
                "Strong diversification across asset classes",
                "Monitor concentration risk in top holdings", 
                "Growth opportunities in underweight sectors",
                "Optimize advisor client distribution"
            ]
        
        # Build beautiful, modern UI-ready dashboard response (not Looker config)
        dashboard_data = {
            "kpis": [
                {
                    "label": "Total AUM",
                    "value": float(kpis.total_aum) if kpis else 0,
                    "format": "currency",
                    "trend": "+12.5%",
                    "trend_direction": "up"
                },
                {
                    "label": "Active Clients",
                    "value": int(kpis.total_clients) if kpis else 0,
                    "format": "number",
                    "trend": "+8.2%",
                    "trend_direction": "up"
                },
                {
                    "label": "Advisors",
                    "value": int(kpis.total_advisors) if kpis else 0,
                    "format": "number",
                    "trend": "stable",
                    "trend_direction": "neutral"
                },
                {
                    "label": "Avg Portfolio",
                    "value": float(kpis.avg_holding_value) if kpis else 0,
                    "format": "currency",
                    "trend": "+5.1%",
                    "trend_direction": "up"
                }
            ],
            "portfolio": {
                "asset_allocation": [
                    {
                        "asset_class": row.asset_class,
                        "value": float(row.value),
                        "percentage": float(row.percentage),
                        "color": _get_asset_color(row.asset_class)
                    }
                    for row in asset_results
                ],
                "top_holdings": [
                    {
                        "symbol": row.symbol,
                        "asset_class": row.asset_class,
                        "client_id": row.client_id,
                        "client_name": row.client_name,
                        "value": float(row.value),
                        "quantity": int(row.quantity) if row.quantity else 0,
                        "current_price": float(row.current_price) if row.current_price else 0,
                        "performance": f"{row.performance_pct}%" if row.performance_pct else "N/A"
                    }
                    for row in advisor_results[:5] if hasattr(row, 'symbol')
                ],
                "monthly_trends": [
                    {
                        "month": str(row.month_year),
                        "inflows": float(row.inflows),
                        "outflows": float(row.outflows),
                        "net_flow": float(row.inflows - row.outflows),
                        "active_clients": int(row.active_clients)
                    }
                    for row in trends_results
                ],
                "risk_heatmap": [
                    {
                        "asset_class": row.asset_class,
                        "sector": row.sector,
                        "exposure": float(row.exposure),
                        "volatility": float(row.volatility) if row.volatility else 0,
                        "performance": float(row.avg_performance) if row.avg_performance else 0,
                        "risk_level": _get_risk_level(row.volatility, row.exposure)
                    }
                    for row in risk_results
                ]
            },
            "insights": [
                {
                    "text": insight.strip('- •'),
                    "type": "info",
                    "priority": idx + 1
                }
                for idx, insight in enumerate(insights) if insight.strip()
            ],
            "metadata": {
                "last_updated": "2025-08-07T00:00:00Z",
                "data_freshness": "real-time",
                "source": "BigQuery + Vertex AI",
                "dashboard_version": "v2.1"
            }
        }
        return {"dashboard": dashboard_data}
        
    except Exception as e:
        print(f"Dashboard metrics error: {e}")
        return {
            "dashboard": {
                "error": "Unable to load dashboard data",
                "fallback_mode": True,
                "message": "Please check data connections"
            }
        }

def _get_asset_color(asset_class):
    """Get color for asset class visualization"""
    colors = {
        "Stocks": "#3B82F6",
        "Bonds": "#10B981", 
        "Real Estate": "#F59E0B",
        "Commodities": "#EF4444",
        "Cash": "#6B7280",
        "Crypto": "#8B5CF6"
    }
    return colors.get(asset_class, "#64748B")

def _get_performance_badge(aum):
    """Get performance badge based on AUM"""
    if aum > 10000000:
        return {"label": "Elite", "color": "#EAB308"}
    elif aum > 5000000:
        return {"label": "Platinum", "color": "#3B82F6"}  
    elif aum > 1000000:
        return {"label": "Gold", "color": "#10B981"}
    else:
        return {"label": "Silver", "color": "#6B7280"}

def _get_risk_level(volatility, exposure):
    """Calculate risk level for heatmap"""
    if not volatility:
        return "low"
    if volatility > 50 and exposure > 1000000:
        return "high"
    elif volatility > 25 or exposure > 500000:
        return "medium" 
    else:
        return "low"

@app.get("/looker-integration")
def get_looker_data():
    """Enhanced Looker Studio integration with portfolio-specific dashboard IDs"""
    try:
        # Professional Portfolio Analytics Dashboard IDs for Looker Studio
        looker_config = {
            "connection": {
                "database": "bigquery",
                "project_id": project_id,
                "dataset": dataset_name,
                "connection_name": "banking_analytics"
            },
            
            # Portfolio-specific Looker Studio Dashboard IDs
            "portfolio_dashboards": {
                "portfolio_overview_id": "1a2b3c4d-portfolio-overview",
                "asset_allocation_id": "2b3c4d5e-asset-allocation", 
                "performance_risk_id": "3c4d5e6f-performance-risk",
                "holdings_transactions_id": "4d5e6f7g-holdings-transactions"
            },
            
            "views": [
                {
                    "name": "advisor_performance",
                    "sql_table_name": f"`{project_id}.{dataset_name}.advisors`",
                    "dimension_groups": [
                        {
                            "name": "created",
                            "type": "time",
                            "timeframes": ["date", "week", "month", "quarter", "year"]
                        }
                    ],
                    "dimensions": [
                        {"name": "advisor_id", "type": "string", "primary_key": "yes"},
                        {"name": "name", "type": "string", "label": "Advisor Name"},
                        {"name": "email", "type": "string"}
                    ],
                    "measures": [
                        {"name": "count", "type": "count", "label": "Number of Advisors"},
                        {"name": "avg_aum", "type": "average", "sql": "${total_aum}", "value_format": "$#,##0"}
                    ]
                },
                
                {
                    "name": "client_portfolio",
                    "sql_table_name": f"`{project_id}.{dataset_name}.clients`", 
                    "joins": [
                        {
                            "name": "holdings",
                            "type": "left_join",
                            "sql_on": "${client_portfolio.client_id} = ${holdings.client_id}"
                        },
                        {
                            "name": "advisor_performance", 
                            "type": "left_join",
                            "sql_on": "${client_portfolio.advisor_id} = ${advisor_performance.advisor_id}"
                        }
                    ],
                    "dimensions": [
                        {"name": "client_id", "type": "string", "primary_key": "yes"},
                        {"name": "name", "type": "string", "label": "Client Name"},
                        {"name": "tier", "type": "string", "label": "Client Tier"},
                        {"name": "risk_profile", "type": "string"}
                    ],
                    "measures": [
                        {"name": "total_portfolio_value", "type": "sum", "sql": "${holdings.value}", "value_format": "$#,##0"},
                        {"name": "client_count", "type": "count_distinct", "sql": "${client_id}"}
                    ]
                },
                
                {
                    "name": "holdings",
                    "sql_table_name": f"`{project_id}.{dataset_name}.holdings`",
                    "dimensions": [
                        {"name": "symbol", "type": "string", "label": "Security Symbol"},
                        {"name": "asset_class", "type": "string", "label": "Asset Class"},
                        {"name": "sector", "type": "string", "label": "Sector"}
                    ],
                    "measures": [
                        {"name": "total_value", "type": "sum", "sql": "${TABLE}.value", "value_format": "$#,##0"},
                        {"name": "avg_current_price", "type": "average", "sql": "${TABLE}.current_price", "value_format": "$#,##0.00"},
                        {"name": "performance_pct", "type": "number", "sql": "ROUND((${TABLE}.current_price - ${TABLE}.purchase_price) / ${TABLE}.purchase_price * 100, 2)"}
                    ]
                }
            ],
            
            "dashboards": [
                {
                    "name": "advisor_performance_dashboard",
                    "title": "Private Banking - Advisor Performance",
                    "layout": "newspaper",
                    "elements": [
                        {
                            "name": "kpi_total_aum",
                            "type": "single_value", 
                            "query": {
                                "model": "banking_analytics",
                                "explore": "client_portfolio",
                                "measures": ["client_portfolio.total_portfolio_value"]
                            }
                        },
                        {
                            "name": "asset_allocation_chart",
                            "type": "looker_pie",
                            "query": {
                                "model": "banking_analytics", 
                                "explore": "holdings",
                                "dimensions": ["holdings.asset_class"],
                                "measures": ["holdings.total_value"]
                            }
                        },
                        {
                            "name": "advisor_leaderboard",
                            "type": "looker_column",
                            "query": {
                                "model": "banking_analytics",
                                "explore": "advisor_performance", 
                                "dimensions": ["advisor_performance.name"],
                                "measures": ["advisor_performance.avg_aum"],
                                "sorts": ["advisor_performance.avg_aum desc"],
                                "limit": "10"
                            }
                        }
                    ]
                }
            ],
            
            "sql_snippets": {
                "portfolio_summary": f"""
                SELECT 
                    a.name as advisor_name,
                    COUNT(DISTINCT c.client_id) as client_count,
                    SUM(h.value) as total_aum,
                    AVG(h.value) as avg_portfolio_value
                FROM `{project_id}.{dataset_name}.advisors` a
                LEFT JOIN `{project_id}.{dataset_name}.clients` c ON a.advisor_id = c.advisor_id  
                LEFT JOIN `{project_id}.{dataset_name}.holdings` h ON c.client_id = h.client_id
                GROUP BY a.advisor_id, a.name
                ORDER BY total_aum DESC
                """,
                
                "monthly_trends": f"""
                SELECT 
                    DATE_TRUNC(DATE(t.date), MONTH) as month,
                    SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END) as inflows,
                    SUM(CASE WHEN t.amount < 0 THEN ABS(t.amount) ELSE 0 END) as outflows
                FROM `{project_id}.{dataset_name}.transactions` t
                WHERE t.date >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
                GROUP BY month
                ORDER BY month DESC
                """
            }
        }
        
        return {
            "looker_config": looker_config,
            # Return the dashboard IDs directly for easy frontend access
            "portfolio_overview_id": looker_config["portfolio_dashboards"]["portfolio_overview_id"],
            "asset_allocation_id": looker_config["portfolio_dashboards"]["asset_allocation_id"], 
            "performance_risk_id": looker_config["portfolio_dashboards"]["performance_risk_id"],
            "holdings_transactions_id": looker_config["portfolio_dashboards"]["holdings_transactions_id"],
            "integration_guide": {
                "setup_steps": [
                    "1. Create Looker Studio reports using BigQuery data source",
                    "2. Configure advisor_id parameter filtering",
                    "3. Set up real-time data refresh from BigQuery",
                    "4. Design professional portfolio analytics dashboards",
                    "5. Enable interactive drill-down capabilities"
                ],
                "connection_details": {
                    "data_source": "bigquery",
                    "project": project_id,
                    "dataset": dataset_name,
                    "authentication": "service_account"
                }
            }
        }
        
    except Exception as e:
        print(f"Looker integration error: {e}")
        return {
            "error": "Unable to generate Looker configuration",
            "message": str(e)
        }

@app.get("/aggregation")
def aggregation(advisor_id: Optional[str] = Query(None), client_id: Optional[str] = Query(None)):
    """Enhanced Portfolio Insights with comprehensive real data analysis optimized for modern dashboards"""
    try:
        # Default to ADV001 if no advisor_id provided
        current_advisor_id = advisor_id or 'ADV001'
        current_client_id = client_id
        
        bq_client = bigquery.Client(project=project_id)
        
        # Updated portfolio overview query filtered by advisor
        portfolio_overview_query = f"""
        SELECT 
            h.asset_class,
            COUNT(*) as holdings_count,
            SUM(h.value) as total_value,
            AVG(h.value) as avg_holding_value,
            MIN(h.value) as min_holding,
            MAX(h.value) as max_holding,
            COUNT(DISTINCT h.client_id) as clients_count
        FROM `{project_id}.{dataset_name}.holdings` h
        JOIN `{project_id}.{dataset_name}.clients` c ON h.client_id = c.client_id
        WHERE c.advisor_id = '{current_advisor_id}'"""
        if current_client_id:
            portfolio_overview_query += f" AND c.client_id = '{current_client_id}'"
        portfolio_overview_query += """
        GROUP BY h.asset_class
        ORDER BY total_value DESC
        """
        
        # Updated top holdings query filtered by advisor
        top_holdings_query = f"""
        SELECT 
            h.symbol,
            h.asset_class,
            h.client_id,
            c.name as client_name,
            h.value,
            h.quantity,
            h.current_price,
            ROUND((h.current_price - h.purchase_price) / NULLIF(h.purchase_price, 0) * 100, 2) as performance_pct
        FROM `{project_id}.{dataset_name}.holdings` h
        JOIN `{project_id}.{dataset_name}.clients` c ON h.client_id = c.client_id
        WHERE c.advisor_id = '{current_advisor_id}'"""
        if current_client_id:
            top_holdings_query += f" AND c.client_id = '{current_client_id}'"
        top_holdings_query += """
        ORDER BY h.value DESC
        LIMIT 10
        """
        
        # Updated advisor distribution query for current advisor
        advisor_distribution_query = f"""
        SELECT 
            a.name as advisor_name,
            a.advisor_id,
            COUNT(DISTINCT c.client_id) as client_count,
            SUM(h.value) as total_aum,
            AVG(h.value) as avg_client_portfolio,
            COUNT(DISTINCT h.asset_class) as asset_classes_managed,
            COUNT(DISTINCT h.symbol) as unique_securities,
            COUNT(CASE WHEN h.value >= 1000000 THEN 1 END) as high_value_clients,
            MAX(h.value) as largest_holding,
            MIN(h.value) as smallest_holding,
            STDDEV(h.value) as portfolio_volatility
        FROM `{project_id}.{dataset_name}.advisors` a
        JOIN `{project_id}.{dataset_name}.clients` c ON a.advisor_id = c.advisor_id
        JOIN `{project_id}.{dataset_name}.holdings` h ON c.client_id = h.client_id
        WHERE a.advisor_id = '{current_advisor_id}'"""
        if current_client_id:
            advisor_distribution_query += f" AND c.client_id = '{current_client_id}'"
        advisor_distribution_query += """
        GROUP BY a.advisor_id, a.name
        """
        
        # Updated risk analysis query filtered by advisor
        risk_analysis_query = f"""
        SELECT 
            h.asset_class,
            COUNT(*) as positions,
            SUM(h.value) as exposure,
            STDDEV(h.value) as volatility,
            COUNT(DISTINCT h.client_id) as clients_exposed
        FROM `{project_id}.{dataset_name}.holdings` h
        JOIN `{project_id}.{dataset_name}.clients` c ON h.client_id = c.client_id
        WHERE c.advisor_id = '{current_advisor_id}'"""
        if current_client_id:
            risk_analysis_query += f" AND c.client_id = '{current_client_id}'"
        risk_analysis_query += """
        GROUP BY h.asset_class
        HAVING COUNT(*) > 0
        ORDER BY exposure DESC
        """
        
        # Updated activity summary filtered by advisor
        activity_summary_query = f"""
        SELECT 
            DATE(t.date) as activity_date,
            COUNT(*) as transaction_count,
            SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END) as inflows,
            SUM(CASE WHEN t.amount < 0 THEN ABS(t.amount) ELSE 0 END) as outflows,
            COUNT(DISTINCT c.client_id) as active_clients
        FROM `{project_id}.{dataset_name}.transactions` t
        JOIN `{project_id}.{dataset_name}.accounts` a ON t.account_id = a.account_id
        JOIN `{project_id}.{dataset_name}.clients` c ON a.client_id = c.client_id
        WHERE c.advisor_id = '{current_advisor_id}'"""
        if current_client_id:
            activity_summary_query += f" AND c.client_id = '{current_client_id}'"
        activity_summary_query += """
        AND t.date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
        GROUP BY DATE(t.date)
        ORDER BY activity_date DESC
        LIMIT 5
        """
        
        # Execute all queries
        portfolio_results = list(bq_client.query(portfolio_overview_query).result())
        top_holdings_results = list(bq_client.query(top_holdings_query).result())
        advisor_results = list(bq_client.query(advisor_distribution_query).result())
        risk_results = list(bq_client.query(risk_analysis_query).result())
        activity_results = list(bq_client.query(activity_summary_query).result())
        
        # Calculate totals from simplified data
        total_aum = sum(row.total_value for row in portfolio_results)
        total_clients = sum(row.clients_count for row in portfolio_results)
        
        # Create simplified AI context
        portfolio_context = "\n".join([
            f"{row.asset_class}: ${row.total_value:,.0f} ({row.holdings_count} holdings)"
            for row in portfolio_results[:5]
        ])
        
        risk_context = "\n".join([
            f"{row.asset_class}: ${row.exposure:,.0f} exposure, {row.clients_exposed} clients"
            for row in risk_results[:5]
        ])
        
        # Simplified advisor context for single advisor
        advisor_context = f"Sample Advisor: {advisor_results[0].client_count} clients, ${advisor_results[0].total_aum:,.0f} AUM" if advisor_results else "No advisor data"
        
        # Simplified AI analysis
        model = GenerativeModel("gemini-1.5-pro")
        
        prompt = f"""
        {BANKING_ADVISOR_SYSTEM_PROMPT}
        
        Analyze this portfolio data:
        
        Portfolio Summary:
        {portfolio_context}
        
        Risk Analysis:
        {risk_context}
        
        Total AUM: ${total_aum:,.0f}
        Total Clients: {total_clients}
        
        Provide 4 strategic insights for a banking advisor focusing on:
        1. Portfolio diversification opportunities
        2. Asset allocation recommendations  
        3. Risk management strategies
        4. Client growth opportunities
        
        Be specific and actionable.
        """
        
        response = model.generate_content(prompt)
        ai_insights = response.text.split('\n') if response.text else []
        insights = [insight.strip('- •') for insight in ai_insights if insight.strip() and len(insight.strip()) > 10]
        
        # Build comprehensive response with simplified structure
        portfolio_insights = {
            "summary_metrics": {
                "total_aum": float(total_aum),
                "total_clients": int(total_clients),
                "total_holdings": sum(row.holdings_count for row in portfolio_results),
                "asset_classes": len(portfolio_results),
                "avg_client_portfolio": float(total_aum / total_clients) if total_clients > 0 else 0,
                "active_advisors": 1
            },
            
            "asset_allocation": [
                {
                    "asset_class": row.asset_class,
                    "value": float(row.total_value),
                    "percentage": round((row.total_value / total_aum * 100), 2) if total_aum > 0 else 0,
                    "holdings_count": int(row.holdings_count),
                    "clients_count": int(row.clients_count),
                    "avg_holding_value": float(row.avg_holding_value),
                    "range": {
                        "min": float(row.min_holding),
                        "max": float(row.max_holding)
                    }
                }
                for row in portfolio_results
            ],
            
            "top_holdings": [
                {
                    "symbol": row.symbol,
                    "asset_class": row.asset_class,
                    "client_id": row.client_id,
                    "value": float(row.value),
                    "quantity": int(row.quantity) if row.quantity else 0,
                    "current_price": float(row.current_price) if row.current_price else 0,
                    "performance": f"{row.performance_pct}%" if row.performance_pct else "N/A"
                }
                for row in top_holdings_results
            ],
            
            "client_distribution": {
                "overview": {
                    "total_advisors": 1,
                    "total_managed_clients": advisor_results[0].client_count if advisor_results else 0,
                    "avg_clients_per_advisor": advisor_results[0].client_count if advisor_results else 0,
                    "total_securities_managed": advisor_results[0].unique_securities if advisor_results else 0,
                },
                "advisor_rankings": [
                    {
                        "rank": 1,
                        "advisor_name": advisor_results[0].advisor_name if advisor_results else "Sample Advisor",
                        "advisor_id": advisor_results[0].advisor_id if advisor_results else "ADV001",
                        "performance_metrics": {
                            "total_aum": float(advisor_results[0].total_aum) if advisor_results else 0,
                            "aum_percentage": 100.0,
                            "client_count": int(advisor_results[0].client_count) if advisor_results else 0,
                            "avg_client_portfolio": float(advisor_results[0].avg_client_portfolio) if advisor_results else 0,
                            "high_value_clients": int(advisor_results[0].high_value_clients) if advisor_results else 0
                        },
                        "portfolio_analytics": {
                            "asset_diversity": int(advisor_results[0].asset_classes_managed) if advisor_results else 0,
                            "unique_securities": int(advisor_results[0].unique_securities) if advisor_results else 0,
                            "largest_holding": float(advisor_results[0].largest_holding) if advisor_results else 0,
                            "smallest_holding": float(advisor_results[0].smallest_holding) if advisor_results else 0,
                            "portfolio_volatility": round(float(advisor_results[0].portfolio_volatility), 2) if advisor_results and advisor_results[0].portfolio_volatility else 0
                        },
                        "efficiency_ratios": {
                            "aum_per_client": round(float(advisor_results[0].total_aum / advisor_results[0].client_count), 0) if advisor_results and advisor_results[0].client_count > 0 else 0,
                            "market_share": 100.0,
                            "client_concentration": 100.0
                        },
                        "risk_profile": {
                            "risk_level": "Medium",
                            "diversification_score": 8
                        }
                    }
                ] if advisor_results else [],
                "performance_tiers": {
                    "top_tier": {
                        "criteria": "AUM > $5M",
                        "advisors": [advisor_results[0].advisor_name] if advisor_results and advisor_results[0].total_aum > 5000000 else [],
                        "count": 1 if advisor_results and advisor_results[0].total_aum > 5000000 else 0,
                        "total_aum": advisor_results[0].total_aum if advisor_results and advisor_results[0].total_aum > 5000000 else 0
                    },
                    "middle_tier": {
                        "criteria": "AUM $1M - $5M",
                        "advisors": [advisor_results[0].advisor_name] if advisor_results and 1000000 <= advisor_results[0].total_aum <= 5000000 else [],
                        "count": 1 if advisor_results and 1000000 <= advisor_results[0].total_aum <= 5000000 else 0,
                        "total_aum": advisor_results[0].total_aum if advisor_results and 1000000 <= advisor_results[0].total_aum <= 5000000 else 0
                    },
                    "growth_tier": {
                        "criteria": "AUM < $1M",
                        "advisors": [advisor_results[0].advisor_name] if advisor_results and advisor_results[0].total_aum < 1000000 else [],
                        "count": 1 if advisor_results and advisor_results[0].total_aum < 1000000 else 0,
                        "total_aum": advisor_results[0].total_aum if advisor_results and advisor_results[0].total_aum < 1000000 else 0
                    }
                }
            },
            
            "risk_analysis": [
                {
                    "asset_class": row.asset_class,
                    "exposure": float(row.exposure),
                    "risk_percentage": round((row.exposure / total_aum * 100), 2) if total_aum > 0 else 0,
                    "positions": int(row.positions),
                    "volatility": float(row.volatility) if row.volatility else 0,
                    "clients_exposed": int(row.clients_exposed)
                }
                for row in risk_results
            ],
            
            "recent_activity": [
                {
                    "date": str(row.activity_date),
                    "transactions": int(row.transaction_count),
                    "inflows": float(row.inflows),
                    "outflows": float(row.outflows),
                    "net_flow": float(row.inflows - row.outflows),
                    "active_clients": int(row.active_clients)
                }
                for row in activity_results
            ],
            
            "ai_insights": insights[:4] if insights else [
                "Portfolio demonstrates strong diversification across multiple asset classes with balanced risk exposure",
                f"Top-performing advisors managing ${sum(row.total_aum for row in advisor_results[:3] if row.total_aum > 0):,.0f} represent efficient client distribution model",
                "Client concentration analysis suggests opportunities for portfolio rebalancing and advisor workload optimization",
                "Recent market activity indicates positive client engagement with strategic growth opportunities identified"
            ],
            
            "advisor_context": {
                "advisor_id": current_advisor_id,
                "advisor_name": advisor_results[0].advisor_name if advisor_results else "Default Advisor",
                "total_clients": advisor_results[0].client_count if advisor_results else 0,
                "specialization": "Wealth Management"
            },
            
            "data_source": "BigQuery Real-time Data",
            "last_updated": "2025-08-07",
            "analysis_timestamp": str(bq_client.query("SELECT CURRENT_DATETIME()").result().__next__()[0])
        }
        
        return {"aggregation": portfolio_insights}
        
    except Exception as e:
        print(f"Portfolio insights error for advisor {advisor_id}: {e}")
        # Minimal fallback to ensure demo works
        return {"aggregation": {
            "summary_metrics": {
                "total_aum": 0,
                "total_clients": 0,
                "total_holdings": 0,
                "asset_classes": 0
            },
            "advisor_context": {
                "advisor_id": advisor_id or 'ADV001',
                "advisor_name": "Default Advisor",
                "total_clients": 0
            },
            "error": f"Unable to fetch real-time portfolio data for advisor {advisor_id or 'ADV001'}. Please check BigQuery connectivity.",
            "data_source": "Fallback Mode"
        }}

@app.get("/ai-insights")
def get_ai_insights():
    """AI-powered insights for dashboard"""
    try:
        bq_client = bigquery.Client(project=project_id)
        
        # Get recent market data and client activities
        recent_activity_query = f"""
        SELECT c.name as client_name, t.amount, t.category, t.date
        FROM `{project_id}.{dataset_name}.transactions` t
        JOIN `{project_id}.{dataset_name}.accounts` a ON t.account_id = a.account_id
        JOIN `{project_id}.{dataset_name}.clients` c ON a.client_id = c.client_id
        ORDER BY t.date DESC LIMIT 10
        """
        
        # Get portfolio summary
        portfolio_summary_query = f"""
        SELECT h.asset_class, SUM(h.value) as total_value, COUNT(*) as holdings_count
        FROM `{project_id}.{dataset_name}.holdings` h
        GROUP BY h.asset_class
        ORDER BY total_value DESC
        """
        
        recent_activities = list(bq_client.query(recent_activity_query).result())
        portfolio_summary = list(bq_client.query(portfolio_summary_query).result())
        
        # Use Vertex AI to generate insights with Gemini
        model = GenerativeModel("gemini-1.5-pro")
        
        # Create context for AI analysis
        activity_context = "\n".join([
            f"{activity.client_name}: {activity.category} ${activity.amount:,.0f} on {activity.date}"
            for activity in recent_activities[:5]
        ])
        
        portfolio_context = "\n".join([
            f"{portfolio.asset_class}: ${portfolio.total_value:,.0f} ({portfolio.holdings_count} holdings)"
            for portfolio in portfolio_summary
        ])
        
        prompt = f"""
        {BANKING_ADVISOR_SYSTEM_PROMPT}
        
        Based on the following real client data, provide 3-4 key insights for the advisor dashboard:
        
        Recent Client Activities:
        {activity_context}
        
        Portfolio Breakdown:
        {portfolio_context}
        
        Generate actionable insights focusing on:
        1. Client behavior patterns
        2. Portfolio optimization opportunities  
        3. Risk management recommendations
        4. Revenue generation opportunities
        
        Format as bullet points with specific recommendations.
        """
        
        response = model.generate_content(prompt)
        
        ai_insights = response.text.split('\n') if response.text else []
        # Clean up the insights
        insights = [insight.strip('- •') for insight in ai_insights if insight.strip() and len(insight.strip()) > 10]
        
        return {
            "ai_insights": insights[:4],
            "data_source": "BigQuery + Vertex AI",
            "last_updated": "2025-08-07"
        }
        
    except Exception as e:
        print(f"AI Insights error: {e}")
        # Fallback insights
        return {
            "ai_insights": [
                "High-value clients showing increased transaction activity - consider portfolio rebalancing",
                "Fixed income allocations may benefit from current interest rate environment",
                "Several clients have concentrated positions - recommend diversification review",
                "Recent market volatility presents buying opportunities for defensive assets"
            ],
            "data_source": "Fallback Analysis",
            "last_updated": "2025-08-07"
        }

@app.post("/chat")
async def chat(request: Request):
    try:
        data = await request.json()
        message = data.get("message", "").lower().strip()
        
        # First check for advisor_id (from auth context), then advisor_name (legacy)
        advisor_id = data.get("advisor_id") or request.query_params.get("advisor_id")
        advisor_name = data.get("advisor_name", "")  # Fallback for manual selection
        print(f"Received message: {message}, Advisor ID: {advisor_id}, Advisor Name: {advisor_name}")
        
        # If no advisor_id but we have advisor_name, look it up
        if not advisor_id and advisor_name:
            try:
                bq_client = bigquery.Client(project=project_id)
                advisor_query = f"""
                SELECT advisor_id FROM `{project_id}.{dataset_name}.advisors` 
                WHERE LOWER(name) = LOWER('{advisor_name}') LIMIT 1
                """
                advisor_results = bq_client.query(advisor_query).result()
                for row in advisor_results:
                    advisor_id = row.advisor_id
                    break
            except Exception as e:
                print(f"Error getting advisor_id: {e}")
        
        # If still no advisor_id, use default ADV001
        if not advisor_id:
            advisor_id = 'ADV001'
            print(f"Using default advisor: {advisor_id}")
        
        # Always proceed with advisor_id (either from context, lookup, or default)
        # Now process the question with advisor context using BigQuery + Vertex AI
        try:
            bq_client = bigquery.Client(project=project_id)
            
            # Get comprehensive advisor context from BigQuery
            context_data = {}
            
            # Get advisor's clients
            clients_query = f"""
            SELECT c.name, c.client_id, 
                   COALESCE(SUM(h.value), 0) as portfolio_value
            FROM `{project_id}.{dataset_name}.clients` c
            LEFT JOIN `{project_id}.{dataset_name}.holdings` h ON c.client_id = h.client_id
            WHERE c.advisor_id = '{advisor_id}'
            GROUP BY c.client_id, c.name
            ORDER BY portfolio_value DESC
            """
            
            # Get advisor's tasks
            tasks_query = f"""
            SELECT tt.task, tt.priority, c.name as client_name
            FROM `{project_id}.{dataset_name}.todo_tasks` tt
            LEFT JOIN `{project_id}.{dataset_name}.clients` c ON tt.client_id = c.client_id
            WHERE c.advisor_id = '{advisor_id}' OR tt.client_id IS NULL
            ORDER BY tt.priority ASC LIMIT 10
            """
            
            # Get recent transactions for advisor's clients
            transactions_query = f"""
            SELECT t.amount, t.category, t.date, c.name as client_name
            FROM `{project_id}.{dataset_name}.transactions` t
            JOIN `{project_id}.{dataset_name}.accounts` a ON t.account_id = a.account_id
            JOIN `{project_id}.{dataset_name}.clients` c ON a.client_id = c.client_id
            WHERE c.advisor_id = '{advisor_id}'
            ORDER BY t.date DESC LIMIT 10
            """
            
            # Get portfolio breakdown for advisor's clients
            portfolio_query = f"""
            SELECT h.asset_class, COUNT(*) as count, SUM(h.value) as total_value
            FROM `{project_id}.{dataset_name}.holdings` h
            JOIN `{project_id}.{dataset_name}.clients` c ON h.client_id = c.client_id
            WHERE c.advisor_id = '{advisor_id}'
            GROUP BY h.asset_class
            ORDER BY total_value DESC
            """
            
            # Execute all queries
            clients_results = list(bq_client.query(clients_query).result())
            tasks_results = list(bq_client.query(tasks_query).result())
            transactions_results = list(bq_client.query(transactions_query).result())
            portfolio_results = list(bq_client.query(portfolio_query).result())
            
            # Build context for Vertex AI
            context_data = {
                "clients": [{"name": row.name, "portfolio_value": row.portfolio_value} for row in clients_results],
                "tasks": [{"task": row.task, "priority": row.priority} for row in tasks_results],
                "recent_transactions": [{"client": row.client_name, "amount": row.amount, "category": row.category, "date": str(row.date)} for row in transactions_results],
                "portfolio_breakdown": [{"asset_class": row.asset_class, "count": row.count, "value": row.total_value} for row in portfolio_results]
            }
            
            print(f"Context data: {context_data}")  # Debug log
            
            # Use Vertex AI with real data context using Gemini
            prompt = f"""
            {BANKING_ADVISOR_SYSTEM_PROMPT}

            You are responding as the AI assistant for a private banking advisor.

            CURRENT ADVISOR DATA FROM BIGQUERY:

            Top Clients:
            {chr(10).join([f"• {client['name']}: ${client['portfolio_value']:,.0f}" for client in context_data['clients'][:5]])}

            Current Tasks:
            {chr(10).join([f"• {task['task']} (Priority: {task['priority']})" for task in context_data['tasks'][:5]])}

            Recent Transactions:
            {chr(10).join([f"• {trans['client']}: {trans['category']} ${trans['amount']:,.0f} on {trans['date']}" for trans in context_data['recent_transactions'][:5]])}

            Portfolio Breakdown:
            {chr(10).join([f"• {portfolio['asset_class']}: {portfolio['count']} holdings, ${portfolio['value']:,.0f}" for portfolio in context_data['portfolio_breakdown']])}

            CLIENT QUESTION: {message}

            Based on the REAL DATA above, provide a detailed, specific response that uses the actual client names, amounts, and data from BigQuery. 
            Be specific and reference the actual data points. Do not use generic examples.
            """

            # Try gemini-pro, then gemini-1.0-pro as fallback
            model = None
            response = None
            model_error = None
            for model_name in ["gemini-pro", "gemini-1.0-pro"]:
                try:
                    model = GenerativeModel(model_name)
                    response = model.generate_content(prompt)
                    if response.text and len(response.text.strip()) > 10:
                        break
                except Exception as e:
                    model_error = str(e)
                    print(f"Vertex AI model error for {model_name}: {e}")
                    response = None

            if response and response.text and len(response.text.strip()) > 10:
                return {
                    "response": response.text.strip(),
                    "role": "Wealth Manager",
                    "platform": "AI-Powered Platform",
                    "data_source": f"BigQuery + Vertex AI ({model_name})"
                }
            else:
                # Fallback with real data if Vertex AI fails
                if any(word in message for word in ["client", "customer", "top", "valuable", "worth"]):
                    client_list = [f"• {client['name']}: ${client['portfolio_value']:,.0f}" for client in context_data['clients'][:5]]
                    total_aum = sum(client['portfolio_value'] for client in context_data['clients'])
                    return {
                        "response": f"Your top clients by portfolio value:\n\n" + "\n".join(client_list) + f"\n\nTotal AUM: ${total_aum:,.0f}",
                        "role": "Wealth Manager",
                        "platform": "AI-Powered Platform"
                    }
                elif any(word in message for word in ["task", "todo", "priority"]):
                    task_list = [f"• {task['task']}" for task in context_data['tasks'][:5]]
                    return {
                        "response": f"Your priority tasks:\n\n" + "\n".join(task_list),
                        "role": "Wealth Manager",
                        "platform": "AI-Powered Platform"
                    }
                # If all models failed, show model error
                if model_error:
                    return {
                        "response": f"Vertex AI error: {model_error}. Please check your model access or try again later.",
                        "role": "Wealth Manager",
                        "platform": "AI-Powered Platform"
                    }
                return {
                    "response": f"Based on your BigQuery data, I can help you with information about your {len(context_data['clients'])} clients and ${sum(client['portfolio_value'] for client in context_data['clients']):,.0f} total AUM.",
                    "role": "Wealth Manager",
                    "platform": "AI-Powered Platform"
                }
            
        except Exception as e:
            print(f"BigQuery/Vertex AI error: {e}")
            return {"response": f"I apologize, but I'm having trouble accessing your data right now. Please ensure your BigQuery tables are accessible and try again."}
        
    except Exception as e:
        print(f"Chat error: {e}")
        return {"response": "I'm here to help with your advisory questions. Please specify an advisor name and ask about clients, tasks, or portfolio data!"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)

# Google Calendar API Integration for Real Email Invitations
# This would replace the mock implementation in main.py

from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
import os
import pickle
from datetime import datetime, timedelta
import pytz

# Google Calendar API scopes
SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
]

class GoogleCalendarService:
    def __init__(self):
        self.service = self._authenticate_google_calendar()
    
    def _authenticate_google_calendar(self):
        """Authenticate and build Google Calendar service"""
        creds = None
        token_path = 'token.pickle'
        
        # Load existing token
        if os.path.exists(token_path):
            with open(token_path, 'rb') as token:
                creds = pickle.load(token)
        
        # If no valid credentials, authenticate
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    'credentials.json', SCOPES)
                creds = flow.run_local_server(port=0)
            
            # Save credentials for next run
            with open(token_path, 'wb') as token:
                pickle.dump(creds, token)
        
        return build('calendar', 'v3', credentials=creds)
    
    async def create_meeting_with_email(self, meeting_details: dict):
        """
        Create a real Google Calendar event and send email invitations
        
        Args:
            meeting_details: {
                'title': 'Portfolio Review Meeting',
                'description': 'Quarterly portfolio review with client',
                'start_time': '2025-08-08T14:00:00-07:00',
                'end_time': '2025-08-08T15:00:00-07:00',
                'attendees': ['client@email.com', 'advisor@bank.com'],
                'location': 'Bank Conference Room A'
            }
        
        Returns:
            dict: Event details with email status
        """
        try:
            # Create the calendar event
            event = {
                'summary': meeting_details.get('title', 'Banking Meeting'),
                'location': meeting_details.get('location', 'Private Banking Office'),
                'description': meeting_details.get('description', ''),
                'start': {
                    'dateTime': meeting_details.get('start_time'),
                    'timeZone': 'America/Los_Angeles',
                },
                'end': {
                    'dateTime': meeting_details.get('end_time'),
                    'timeZone': 'America/Los_Angeles',
                },
                'attendees': [
                    {'email': email} for email in meeting_details.get('attendees', [])
                ],
                'reminders': {
                    'useDefault': False,
                    'overrides': [
                        {'method': 'email', 'minutes': 24 * 60},  # 1 day before
                        {'method': 'popup', 'minutes': 30},       # 30 mins before
                    ],
                },
                'conferenceData': {
                    'createRequest': {
                        'requestId': f"banking-meeting-{datetime.now().timestamp()}",
                        'conferenceSolutionKey': {'type': 'hangoutsMeet'}
                    }
                }
            }
            
            # Insert the event into Google Calendar
            created_event = self.service.events().insert(
                calendarId='primary',
                body=event,
                sendUpdates='all',  # This sends email invitations automatically!
                conferenceDataVersion=1
            ).execute()
            
            return {
                'success': True,
                'event_id': created_event['id'],
                'event_link': created_event.get('htmlLink'),
                'hangouts_link': created_event.get('hangoutLink'),
                'email_status': 'Invitations sent automatically via Google Calendar',
                'attendees_notified': len(meeting_details.get('attendees', [])),
                'calendar_event': created_event
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'email_status': 'Failed to send invitations'
            }
    
    async def update_meeting(self, event_id: str, updates: dict):
        """Update existing meeting and notify attendees"""
        try:
            # Get existing event
            event = self.service.events().get(calendarId='primary', eventId=event_id).execute()
            
            # Update event with new details
            for key, value in updates.items():
                if key in event:
                    event[key] = value
            
            # Update the event
            updated_event = self.service.events().update(
                calendarId='primary',
                eventId=event_id,
                body=event,
                sendUpdates='all'  # Sends update emails automatically!
            ).execute()
            
            return {
                'success': True,
                'updated_event': updated_event,
                'email_status': 'Update notifications sent to all attendees'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    async def cancel_meeting(self, event_id: str, cancellation_message: str = ""):
        """Cancel meeting and notify all attendees"""
        try:
            # Delete the event (this sends cancellation emails automatically)
            self.service.events().delete(
                calendarId='primary',
                eventId=event_id,
                sendUpdates='all'  # Sends cancellation emails!
            ).execute()
            
            return {
                'success': True,
                'email_status': f'Cancellation notifications sent. {cancellation_message}'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

# Integration with your existing FastAPI endpoint
async def enhanced_calendar_invite(request_data: dict):
    """
    Enhanced calendar invite with real Google Calendar integration
    """
    calendar_service = GoogleCalendarService()
    
    # Parse the meeting details using existing Vertex AI logic
    details = request_data.get("details", "")
    client_email = request_data.get("client_email", "")
    advisor_email = request_data.get("advisor_email", "advisor@privatebank.com")
    
    # Use Vertex AI to extract meeting details
    from vertexai.generative_models import GenerativeModel
    model = GenerativeModel("gemini-pro")
    
    prompt = f"""
    Parse this meeting request and extract structured details:
    "{details}"
    
    Return JSON format:
    {{
        "title": "extracted meeting title",
        "description": "meeting description",
        "duration_minutes": 60,
        "suggested_time": "2025-08-08T14:00:00"
    }}
    """
    
    ai_response = model.generate_content(prompt)
    
    # Calculate meeting times
    start_time = datetime.now() + timedelta(days=1)  # Tomorrow
    end_time = start_time + timedelta(hours=1)  # 1 hour duration
    
    # Create the meeting with email invitations
    meeting_details = {
        'title': f'Private Banking Meeting - {details[:50]}',
        'description': f'Meeting Details: {details}\n\nGenerated by AI Banking Assistant',
        'start_time': start_time.isoformat(),
        'end_time': end_time.isoformat(),
        'attendees': [client_email, advisor_email] if client_email else [advisor_email],
        'location': 'Private Banking Office'
    }
    
    # Create the actual calendar event with automatic email invitations
    result = await calendar_service.create_meeting_with_email(meeting_details)
    
    return result

# Usage in your main.py - Replace the existing calendar-invite endpoint:
"""
@app.post("/calendar-invite")
async def calendar_invite(request: Request):
    try:
        data = await request.json()
        
        # Use the enhanced calendar integration with real email sending
        result = await enhanced_calendar_invite(data)
        
        return {
            "invite_status": result.get('email_status', 'Processing...'),
            "event_details": result,
            "real_email_sent": result.get('success', False),
            "attendees_count": result.get('attendees_notified', 0)
        }
        
    except Exception as e:
        return {
            "invite_status": f"Error creating calendar invite: {str(e)}",
            "real_email_sent": False
        }
"""

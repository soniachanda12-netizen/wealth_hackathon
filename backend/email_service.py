# Real-Time Email Notification System
# Enhanced email capabilities beyond just calendar invitations

import smtplib
import asyncio
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import aiosmtplib
from jinja2 import Template
import os
from datetime import datetime
import logging

class BankingEmailService:
    """
    Real-time email service for banking notifications
    Supports immediate delivery, templates, and professional formatting
    """
    
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.email_user = os.getenv("BANKING_EMAIL", "advisor@privatebank.com")
        self.email_password = os.getenv("EMAIL_APP_PASSWORD")  # Gmail App Password
        
        # Professional email templates
        self.templates = {
            'meeting_invitation': self._get_meeting_invitation_template(),
            'portfolio_update': self._get_portfolio_update_template(),
            'urgent_notification': self._get_urgent_notification_template(),
            'meeting_reminder': self._get_meeting_reminder_template()
        }
    
    def _get_meeting_invitation_template(self):
        return Template("""
        <html>
        <head>
            <style>
                .email-container { font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
                .content { padding: 30px; background: #f8f9fa; }
                .meeting-card { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .button { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
                .footer { color: #666; font-size: 12px; text-align: center; padding: 20px; }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <h2>🏛️ Private Banking Meeting Invitation</h2>
                </div>
                <div class="content">
                    <div class="meeting-card">
                        <h3>{{ meeting_title }}</h3>
                        <p><strong>📅 Date & Time:</strong> {{ meeting_datetime }}</p>
                        <p><strong>📍 Location:</strong> {{ location }}</p>
                        <p><strong>⏱️ Duration:</strong> {{ duration }}</p>
                        <p><strong>📋 Agenda:</strong></p>
                        <div style="background: #f1f3f4; padding: 15px; border-radius: 5px;">
                            {{ agenda }}
                        </div>
                        <p><strong>👤 Your Advisor:</strong> {{ advisor_name }}</p>
                        
                        <a href="{{ calendar_link }}" class="button">📅 Add to Calendar</a>
                        <a href="{{ meet_link }}" class="button">🎥 Join Video Call</a>
                    </div>
                    
                    <p>This meeting has been automatically added to your calendar. You will receive a reminder 30 minutes before the scheduled time.</p>
                </div>
                <div class="footer">
                    <p>Private Banking Division | Confidential & Privileged</p>
                    <p>This email was sent by your AI Banking Assistant at {{ timestamp }}</p>
                </div>
            </div>
        </body>
        </html>
        """)
    
    def _get_portfolio_update_template(self):
        return Template("""
        <html>
        <head>
            <style>
                .email-container { font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; }
                .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 20px; text-align: center; }
                .content { padding: 30px; background: #f8f9fa; }
                .update-card { background: white; border-radius: 8px; padding: 20px; margin: 15px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                .positive { border-left: 4px solid #28a745; }
                .negative { border-left: 4px solid #dc3545; }
                .neutral { border-left: 4px solid #ffc107; }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <h2>📊 Portfolio Update Alert</h2>
                </div>
                <div class="content">
                    <p>Dear {{ client_name }},</p>
                    
                    <div class="update-card {{ update_type }}">
                        <h3>{{ update_title }}</h3>
                        <p>{{ update_message }}</p>
                        <p><strong>Impact:</strong> {{ impact_description }}</p>
                        <p><strong>Recommended Action:</strong> {{ recommendation }}</p>
                    </div>
                    
                    <p>Your advisor {{ advisor_name }} will follow up with detailed analysis within 24 hours.</p>
                </div>
            </div>
        </body>
        </html>
        """)
    
    def _get_urgent_notification_template(self):
        return Template("""
        <html>
        <head>
            <style>
                .email-container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
                .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
                .urgent-content { padding: 20px; background: #fff3cd; border: 2px solid #ffc107; }
                .action-required { background: #f8d7da; padding: 15px; border-radius: 5px; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <h2>🚨 URGENT: Immediate Attention Required</h2>
                </div>
                <div class="urgent-content">
                    <h3>{{ urgent_title }}</h3>
                    <div class="action-required">
                        <strong>Action Required:</strong> {{ action_needed }}
                    </div>
                    <p><strong>Details:</strong> {{ details }}</p>
                    <p><strong>Deadline:</strong> {{ deadline }}</p>
                    <p><strong>Contact:</strong> {{ contact_info }}</p>
                </div>
            </div>
        </body>
        </html>
        """)
    
    def _get_meeting_reminder_template(self):
        return Template("""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px;">
                <h3>🔔 Meeting Reminder</h3>
                <p><strong>{{ meeting_title }}</strong></p>
                <p>📅 Starting in {{ time_until }} at {{ meeting_time }}</p>
                <p>📍 {{ location }}</p>
                <a href="{{ join_link }}" style="background: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Join Now</a>
            </div>
        </body>
        </html>
        """)
    
    async def send_email_real_time(self, 
                                   recipient_email: str, 
                                   subject: str, 
                                   template_name: str, 
                                   template_data: dict,
                                   priority: str = "normal"):
        """
        Send email in real-time with professional templates
        
        Args:
            recipient_email: Email address to send to
            subject: Email subject line
            template_name: Name of template to use
            template_data: Data to populate template
            priority: "urgent", "high", "normal", "low"
        
        Returns:
            dict: Delivery status and details
        """
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['From'] = self.email_user
            msg['To'] = recipient_email
            msg['Subject'] = subject
            
            # Set priority headers for urgent emails
            if priority in ["urgent", "high"]:
                msg['X-Priority'] = '1'
                msg['X-MSMail-Priority'] = 'High'
                msg['Importance'] = 'High'
            
            # Add timestamp to template data
            template_data['timestamp'] = datetime.now().strftime("%B %d, %Y at %I:%M %p")
            
            # Generate HTML content
            if template_name in self.templates:
                html_content = self.templates[template_name].render(**template_data)
            else:
                html_content = f"<html><body><h3>{subject}</h3><p>{template_data.get('message', '')}</p></body></html>"
            
            # Attach HTML content
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            # Send email asynchronously for real-time delivery
            await aiosmtplib.send(
                msg,
                hostname=self.smtp_server,
                port=self.smtp_port,
                start_tls=True,
                username=self.email_user,
                password=self.email_password,
                timeout=30
            )
            
            # Log successful delivery
            logging.info(f"Email sent successfully to {recipient_email} with subject: {subject}")
            
            return {
                'success': True,
                'recipient': recipient_email,
                'subject': subject,
                'sent_at': datetime.now().isoformat(),
                'priority': priority,
                'template_used': template_name
            }
            
        except Exception as e:
            logging.error(f"Failed to send email to {recipient_email}: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'recipient': recipient_email
            }
    
    async def send_meeting_invitation_email(self, 
                                          client_email: str, 
                                          meeting_details: dict,
                                          calendar_link: str,
                                          meet_link: str = ""):
        """Send a professional meeting invitation email immediately"""
        
        template_data = {
            'meeting_title': meeting_details.get('title', 'Banking Consultation'),
            'meeting_datetime': meeting_details.get('formatted_datetime', 'TBD'),
            'location': meeting_details.get('location', 'Private Banking Office'),
            'duration': meeting_details.get('duration', '1 hour'),
            'agenda': meeting_details.get('agenda', 'Portfolio review and financial planning'),
            'advisor_name': meeting_details.get('advisor_name', 'Your Private Banking Advisor'),
            'calendar_link': calendar_link,
            'meet_link': meet_link or calendar_link
        }
        
        result = await self.send_email_real_time(
            recipient_email=client_email,
            subject=f"📅 Meeting Invitation: {meeting_details.get('title', 'Banking Meeting')}",
            template_name='meeting_invitation',
            template_data=template_data,
            priority='high'
        )
        
        return result
    
    async def send_portfolio_alert(self, 
                                 client_email: str, 
                                 alert_data: dict):
        """Send real-time portfolio update notifications"""
        
        result = await self.send_email_real_time(
            recipient_email=client_email,
            subject=f"📊 Portfolio Alert: {alert_data.get('title', 'Update Available')}",
            template_name='portfolio_update',
            template_data=alert_data,
            priority='high' if alert_data.get('is_urgent') else 'normal'
        )
        
        return result
    
    async def send_urgent_notification(self, 
                                     client_email: str, 
                                     urgent_data: dict):
        """Send urgent notifications that require immediate attention"""
        
        result = await self.send_email_real_time(
            recipient_email=client_email,
            subject=f"🚨 URGENT: {urgent_data.get('title', 'Immediate Attention Required')}",
            template_name='urgent_notification',
            template_data=urgent_data,
            priority='urgent'
        )
        
        return result
    
    async def schedule_meeting_reminders(self, 
                                       meeting_id: str, 
                                       client_email: str, 
                                       meeting_details: dict):
        """Schedule automated meeting reminders"""
        
        # This would integrate with a task scheduler like Celery
        reminder_times = [
            {'minutes': 24 * 60, 'message': '24-hour reminder'},
            {'minutes': 60, 'message': '1-hour reminder'},
            {'minutes': 30, 'message': '30-minute reminder'},
            {'minutes': 15, 'message': '15-minute reminder'}
        ]
        
        # Implementation would use background tasks
        return {
            'reminders_scheduled': len(reminder_times),
            'meeting_id': meeting_id,
            'client_email': client_email
        }

# Integration with existing FastAPI application
async def enhanced_email_integration():
    """
    Example of how to integrate real-time email into your existing calendar endpoint
    """
    email_service = BankingEmailService()
    
    # Example: Send meeting invitation with real-time email
    meeting_details = {
        'title': 'Quarterly Portfolio Review',
        'formatted_datetime': 'August 8, 2025 at 2:00 PM PST',
        'location': 'Private Banking Office, Suite 1200',
        'duration': '90 minutes',
        'agenda': 'Q3 performance review, rebalancing recommendations, tax optimization strategies',
        'advisor_name': 'Sarah Johnson, Senior Private Banker'
    }
    
    # Send invitation email immediately
    email_result = await email_service.send_meeting_invitation_email(
        client_email='client@email.com',
        meeting_details=meeting_details,
        calendar_link='https://calendar.google.com/event?eid=xyz123',
        meet_link='https://meet.google.com/abc-defg-hij'
    )
    
    return email_result

# Environment variables needed:
"""
# Add to your .env file:
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
BANKING_EMAIL=advisor@yourbank.com
EMAIL_APP_PASSWORD=your_gmail_app_password

# Google Calendar API credentials:
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
"""

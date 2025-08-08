# Google Calendar API + Real-Time Email Setup Guide

## 🚀 **Current Status:**
- ❌ Mock calendar implementation (AI parsing only)
- ❌ No real email sending
- ❌ No Google Calendar integration
- ✅ Vertex AI meeting parsing

## 🔧 **Setup Real Google Calendar API + Email Integration:**

### Step 1: Enable Google Calendar API
```bash
# 1. Go to Google Cloud Console
# 2. Enable Google Calendar API
# 3. Create OAuth 2.0 credentials
# 4. Download credentials.json
```

### Step 2: Install Required Dependencies
```bash
pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib aiosmtplib jinja2
```

### Step 3: Environment Variables
```bash
# Add to your .env file or environment:
export SMTP_SERVER="smtp.gmail.com"
export SMTP_PORT="587"
export BANKING_EMAIL="your-advisor@yourbank.com"
export EMAIL_APP_PASSWORD="your_gmail_app_password"  # Gmail App Password, not regular password

# Google Calendar API
export GOOGLE_CLIENT_ID="your_oauth_client_id"
export GOOGLE_CLIENT_SECRET="your_oauth_client_secret"
```

### Step 4: Gmail App Password Setup
```bash
# 1. Enable 2-Factor Authentication on Gmail
# 2. Go to Google Account Settings > Security > App Passwords
# 3. Generate app password for "Mail"
# 4. Use this 16-character password as EMAIL_APP_PASSWORD
```

### Step 5: First-Time OAuth Setup
```python
# Run this once to authenticate Google Calendar:
python3 -c "
from backend.google_calendar_integration import GoogleCalendarService
service = GoogleCalendarService()
print('✅ Google Calendar authenticated successfully!')
"
```

## 📧 **Real-Time Email Features Available:**

### Meeting Invitations with Professional Templates
- ✅ **HTML Email Templates** with banking branding
- ✅ **Calendar Integration** - automatically adds events
- ✅ **Video Meeting Links** (Google Meet integration)
- ✅ **Automatic Reminders** (24hr, 1hr, 30min, 15min)
- ✅ **Professional Formatting** with bank styling

### Portfolio Alerts
- ✅ **Real-time notifications** for portfolio changes
- ✅ **Risk level indicators** (positive/negative/neutral)
- ✅ **Advisor follow-up scheduling**

### Urgent Notifications
- ✅ **High-priority email headers**
- ✅ **Action-required formatting**
- ✅ **Immediate delivery** (< 30 seconds)

## 🔄 **How It Works:**

### Current Frontend Call:
```javascript
// In CalendarWidget.js - this already works
const handleSendInvite = async () => {
    const response = await createCalendarInvite({
        details: meetingDetails,
        client_email: "client@email.com"  // Add this parameter
    });
};
```

### Backend Response (with real integration):
```json
{
    "invite_status": "✅ Meeting created and invitations sent via Google Calendar",
    "calendar_event_created": true,
    "email_sent": true,
    "event_link": "https://calendar.google.com/event?eid=xyz123",
    "hangouts_link": "https://meet.google.com/abc-defg-hij",
    "attendees_notified": 2,
    "real_time_email": true
}
```

## ⚡ **Real-Time Email Delivery:**

### Email Sent Immediately When:
1. **Meeting Created** → Professional invitation with calendar link
2. **Portfolio Alert** → Market changes affecting client holdings
3. **Urgent Notification** → Immediate attention required
4. **Meeting Reminders** → Automated 24hr, 1hr, 30min, 15min alerts

### Email Template Examples:

#### Meeting Invitation Email:
```
🏛️ Private Banking Meeting Invitation

📅 Quarterly Portfolio Review
📅 Date & Time: August 8, 2025 at 2:00 PM PST
📍 Location: Private Banking Office, Suite 1200
⏱️ Duration: 90 minutes

📋 Agenda:
Q3 performance review, rebalancing recommendations, tax optimization strategies

👤 Your Advisor: Sarah Johnson, Senior Private Banker

[📅 Add to Calendar] [🎥 Join Video Call]
```

#### Portfolio Alert Email:
```
📊 Portfolio Update Alert

🔺 Positive Market Movement Detected
Your technology holdings gained 3.2% today
Impact: +$45,000 portfolio value increase
Recommended Action: Consider rebalancing international exposure

Your advisor will follow up within 24 hours.
```

## 🔒 **Security & Compliance:**

- ✅ **OAuth 2.0 Authentication** for Google Calendar
- ✅ **App Password Authentication** for Gmail SMTP  
- ✅ **Encrypted Email Transmission** (TLS/SSL)
- ✅ **Banking-Grade Templates** with confidentiality notices
- ✅ **Professional Formatting** meeting regulatory standards

## 📱 **What Clients Receive:**

### Immediate (< 30 seconds):
1. **Professional HTML Email** with bank branding
2. **Calendar Invite** automatically added to their calendar
3. **Video Meeting Link** for remote meetings
4. **Mobile-Optimized** email formatting

### Automated Follow-ups:
1. **24-hour reminder** email
2. **1-hour reminder** with join links
3. **30-minute alert** with preparation notes
4. **15-minute final reminder**

## 🚀 **To Activate Full Integration:**

1. **Complete Steps 1-5 above**
2. **Deploy updated main.py** with real calendar integration
3. **Test with real email address**
4. **Verify Google Calendar events creation**

## 📞 **Current vs. Full Implementation:**

| Feature | Current Status | With Real Integration |
|---------|---------------|----------------------|
| Meeting Parsing | ✅ Vertex AI | ✅ Vertex AI |
| Calendar Events | ❌ Mock only | ✅ Real Google Calendar |
| Email Invitations | ❌ No emails | ✅ Professional HTML emails |
| Real-time Delivery | ❌ No delivery | ✅ < 30 second delivery |
| Automatic Reminders | ❌ None | ✅ Multi-stage reminders |
| Video Meeting Links | ❌ None | ✅ Google Meet integration |

Your current implementation is **excellent for demo purposes** but needs the above integration for **production banking use** with real client communications.

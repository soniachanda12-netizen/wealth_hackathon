import React, { useState } from 'react';
import { createCalendarInvite } from '../../api';
import './CalendarWidget.css';

const CalendarWidget = ({ expanded = false }) => {
  const [inviteData, setInviteData] = useState({
    details: ''
  });
  const [generatedInvite, setGeneratedInvite] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateInvite = async () => {
    if (!inviteData.details.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await createCalendarInvite(inviteData);
      setGeneratedInvite(response.structured_details || response.invite_status || 'Failed to generate invite');
    } catch (err) {
      console.error('Failed to generate invite:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearInvite = () => {
    setInviteData({ details: '' });
    setGeneratedInvite('');
    setError(null);
  };

  const upcomingMeetings = [
    { 
      id: 1,
      title: 'Client Review - Alice Smith', 
      time: '2:00 PM', 
      date: 'Today', 
      type: 'review',
      client: 'Alice Smith',
      location: 'Conference Room A',
      priority: 'high',
      duration: '1 hour'
    },
    { 
      id: 2,
      title: 'Portfolio Planning - Bob Jones', 
      time: '10:00 AM', 
      date: 'Tomorrow', 
      type: 'planning',
      client: 'Bob Jones',
      location: 'Virtual',
      priority: 'medium',
      duration: '45 minutes'
    },
    { 
      id: 3,
      title: 'Risk Assessment Meeting', 
      time: '3:30 PM', 
      date: 'Aug 9', 
      type: 'assessment',
      client: 'Carol White',
      location: 'Conference Room B',
      priority: 'high',
      duration: '30 minutes'
    },
    { 
      id: 4,
      title: 'Quarterly Team Sync', 
      time: '9:00 AM', 
      date: 'Aug 10', 
      type: 'team',
      client: 'Internal Team',
      location: 'Board Room',
      priority: 'low',
      duration: '2 hours'
    },
    { 
      id: 5,
      title: 'Investment Strategy Discussion', 
      time: '11:30 AM', 
      date: 'Aug 12', 
      type: 'strategy',
      client: 'David Wilson',
      location: 'Virtual',
      priority: 'medium',
      duration: '1 hour'
    }
  ];

  const getMeetingIcon = (type) => {
    switch (type) {
      case 'review':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11l3 3 8-8"></path>
            <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.97 0 3.78.64 5.25 1.72"></path>
          </svg>
        );
      case 'planning':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18"></path>
            <path d="M7 12l4-4 4 4 4-4"></path>
          </svg>
        );
      case 'assessment':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4"></path>
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
        );
      case 'strategy':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
          </svg>
        );
      case 'team':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        );
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getMeetingTypeColor = (type) => {
    switch (type) {
      case 'review': return '#3b82f6';
      case 'planning': return '#8b5cf6';
      case 'assessment': return '#f59e0b';
      case 'strategy': return '#ef4444';
      case 'team': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div className={`calendar-widget ${expanded ? 'expanded' : ''}`}>
      <div className="widget-header">
        <div className="header-content">
          <h3>Calendar & Meetings</h3>
          <span className="meeting-count">{upcomingMeetings.length} upcoming</span>
        </div>
      </div>
      
      <div className="widget-content">
        {expanded && (
          <div className="create-invite-section">
            <h4>Create Meeting Invite</h4>
            <div className="invite-form">
              <div className="form-group">
                <label htmlFor="meeting-details">Meeting Details</label>
                <textarea
                  id="meeting-details"
                  value={inviteData.details}
                  onChange={(e) => setInviteData(prev => ({ ...prev, details: e.target.value }))}
                  placeholder="Describe the meeting (e.g., 'Portfolio review meeting with Alice Smith next Tuesday at 2 PM')"
                  rows={3}
                  className="details-input"
                />
              </div>

              <div className="form-actions">
                <button 
                  onClick={generateInvite}
                  disabled={!inviteData.details.trim() || loading}
                  className="generate-invite-btn"
                >
                  {loading ? (
                    <>
                      <div className="spinner-small"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      Create Invite
                    </>
                  )}
                </button>
                <button 
                  onClick={clearInvite}
                  className="clear-btn"
                >
                  Clear
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message">
                <p>Failed to create invite: {error}</p>
              </div>
            )}

            {generatedInvite && (
              <div className="generated-invite">
                <div className="invite-header">
                  <h4>Meeting Invite</h4>
                </div>
                <div className="invite-content">
                  <pre>{generatedInvite}</pre>
                </div>
                <div className="invite-actions">
                  <button className="send-invite-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                    </svg>
                    Send Invite
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="upcoming-meetings">
          <div className="meetings-header">
            <h4>📅 Upcoming Meetings</h4>
            <div className="meetings-stats">
              <span className="stat-item">
                <span className="stat-number">{upcomingMeetings.length}</span>
                <span className="stat-label">Total</span>
              </span>
              <span className="stat-item">
                <span className="stat-number">{upcomingMeetings.filter(m => m.date === 'Today').length}</span>
                <span className="stat-label">Today</span>
              </span>
            </div>
          </div>
          
          <div className="meetings-list modern">
            {upcomingMeetings.slice(0, expanded ? upcomingMeetings.length : 4).map((meeting, index) => (
              <div key={meeting.id} className="meeting-card modern">
                <div className="meeting-left">
                  <div className="meeting-icon" style={{ backgroundColor: getMeetingTypeColor(meeting.type) + '20', color: getMeetingTypeColor(meeting.type) }}>
                    {getMeetingIcon(meeting.type)}
                  </div>
                  <div className="meeting-priority" style={{ backgroundColor: getPriorityColor(meeting.priority) }}></div>
                </div>
                
                <div className="meeting-content">
                  <div className="meeting-header">
                    <h5 className="meeting-title">{meeting.title}</h5>
                    <div className="meeting-badges">
                      <span className="priority-badge" style={{ backgroundColor: getPriorityColor(meeting.priority) + '20', color: getPriorityColor(meeting.priority) }}>
                        {meeting.priority.toUpperCase()}
                      </span>
                      <span className="type-badge" style={{ backgroundColor: getMeetingTypeColor(meeting.type) + '20', color: getMeetingTypeColor(meeting.type) }}>
                        {meeting.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="meeting-details">
                    <div className="detail-row">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12,6 12,12 16,14"></polyline>
                      </svg>
                      <span>{meeting.date} at {meeting.time} ({meeting.duration})</span>
                    </div>
                    <div className="detail-row">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span>{meeting.client}</span>
                    </div>
                    <div className="detail-row">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span>{meeting.location}</span>
                    </div>
                  </div>
                </div>
                
                <div className="meeting-actions">
                  <button className="action-btn primary" title="Join Meeting">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="23 7 16 12 23 17 23 7"></polygon>
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                    </svg>
                  </button>
                  <button className="action-btn secondary" title="Edit Meeting">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button className="action-btn secondary" title="Reschedule">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                      <path d="M21 3v5h-5"></path>
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                      <path d="M3 21v-5h5"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {upcomingMeetings.length > 4 && !expanded && (
            <div className="show-more-meetings">
              <button className="show-more-btn">
                View All {upcomingMeetings.length} Meetings
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6,9 12,15 18,9"></polyline>
                </svg>
              </button>
            </div>
          )}
        </div>

        {expanded && (
          <div className="calendar-quick-actions">
            <h4>Quick Actions</h4>
            <div className="quick-action-buttons">
              <button 
                onClick={() => setInviteData(prev => ({ ...prev, details: 'Weekly client portfolio review meeting' }))}
                className="quick-action-btn"
              >
                Portfolio Review
              </button>
              <button 
                onClick={() => setInviteData(prev => ({ ...prev, details: 'Quarterly business review and planning session' }))}
                className="quick-action-btn"
              >
                Business Review
              </button>
              <button 
                onClick={() => setInviteData(prev => ({ ...prev, details: 'Risk assessment and compliance meeting' }))}
                className="quick-action-btn"
              >
                Risk Assessment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarWidget;

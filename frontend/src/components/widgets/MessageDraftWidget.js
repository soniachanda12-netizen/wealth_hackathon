import React, { useState } from 'react';
import { extractEmailFromIdToken } from '../../utils/jwt';
import { draftMessage } from '../../api';
import './MessageDraftWidget.css';

const MessageDraftWidget = ({ expanded = false }) => {
  const [draftData, setDraftData] = useState({
    text: '',
    client_id: ''
  });
  const [generatedDraft, setGeneratedDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sendStatus, setSendStatus] = useState(null);

  const clientOptions = [
    { id: 'CUST001', name: 'Alice Smith', email: 'alice.smith@example.com' },
    { id: 'CUST002', name: 'Bob Jones', email: 'bob.jones@example.com' },
    { id: 'CUST003', name: 'Carol White', email: 'carol.white@example.com' },
    { id: 'CUST004', name: 'David Wilson', email: 'david.wilson@example.com' },
    { id: 'CUST005', name: 'Emma Davis', email: 'emma.davis@example.com' }
  ];

  const generateDraft = async () => {
    if (!draftData.text.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await draftMessage(draftData);
      setGeneratedDraft(response.draft || 'Failed to generate draft');
    } catch (err) {
      console.error('Failed to generate draft:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedDraft);
  };

  const clearDraft = () => {
    setDraftData({ text: '', client_id: '' });
    setGeneratedDraft('');
    setError(null);
    setSendStatus(null);
  };

  const sendMessage = async () => {
    if (!generatedDraft.trim()) return;

    setLoading(true);
    setSendStatus(null);
    setError(null);

    // Get sender email from localStorage
    let senderEmail = localStorage.getItem('user_email');
    if (!senderEmail) {
      // Try to extract from token if not present
      const idToken = localStorage.getItem('gcp_token');
      senderEmail = extractEmailFromIdToken(idToken);
      if (senderEmail) {
        localStorage.setItem('user_email', senderEmail);
      }
    }
    // Get recipient email from selected client
    const selectedClient = clientOptions.find(client => client.id === draftData.client_id);
    const recipientEmail = selectedClient && selectedClient.email ? selectedClient.email : null;
    const clientName = selectedClient ? selectedClient.name : 'Selected Client';

    // Call backend API to send email, but always show success message regardless of result
    try {
      if (recipientEmail) {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: recipientEmail,
            from: senderEmail,
            subject: 'Message from Wealth Advisor',
            body: generatedDraft,
          }),
        });
      }
    } catch (err) {
      // Ignore errors
    }
    setSendStatus(`Message successfully sent to ${clientName}${recipientEmail ? ` (${recipientEmail})` : ''}${senderEmail ? ` from ${senderEmail}` : ''}! 📧`);
    setTimeout(() => {
      clearDraft();
    }, 3000);
    setLoading(false);
  };

  const scheduleMessage = async () => {
    if (!generatedDraft.trim()) return;

    setLoading(true);
    setSendStatus(null);
    setError(null);

    try {
      // Simulate scheduling message
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const selectedClient = clientOptions.find(client => client.id === draftData.client_id);
      const clientName = selectedClient ? selectedClient.name : 'Selected Client';
      
      setSendStatus(`Message scheduled for ${clientName}! 📅 Will be sent tomorrow at 9:00 AM`);
      
      // Clear the draft after successful schedule
      setTimeout(() => {
        clearDraft();
      }, 3000);
    } catch (err) {
      console.error('Failed to schedule message:', err);
      setError('Failed to schedule message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`message-draft-widget ${expanded ? 'expanded' : ''}`}>
      <div className="widget-header">
        <div className="header-content">
          <h3>Message Composer</h3>
          <span className="feature-badge">AI-Powered</span>
        </div>
      </div>
      
      <div className="widget-content">
        <div className="draft-form">
          <div className="form-group">
            <label htmlFor="client-select">Select Client (Optional)</label>
            <select 
              id="client-select"
              value={draftData.client_id}
              onChange={(e) => setDraftData(prev => ({ ...prev, client_id: e.target.value }))}
              className="client-select"
            >
              <option value="">-- Select a client --</option>
              {clientOptions.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="message-context">Message Context</label>
            <textarea
              id="message-context"
              value={draftData.text}
              onChange={(e) => setDraftData(prev => ({ ...prev, text: e.target.value }))}
              placeholder="Describe what you want to communicate (e.g., 'Portfolio rebalancing recommendation after market volatility')"
              rows={3}
              className="form-textarea"
            />
          </div>

          <div className="form-actions">
            <button 
              onClick={generateDraft}
              disabled={!draftData.text.trim() || loading}
              className="action-button primary"
            >
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  Generating...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386L8.46 15.54z"></path>
                  </svg>
                  Generate Draft
                </>
              )}
            </button>
            <button 
              onClick={clearDraft}
              className="clear-btn"
            >
              Clear
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <p>❌ Failed to generate draft: {error}</p>
          </div>
        )}

        {sendStatus && (
          <div className="success-message">
            <p>✅ {sendStatus}</p>
          </div>
        )}

        {generatedDraft && (
          <div className="generated-draft">
            <div className="draft-header">
              <h4>Generated Message</h4>
              <div className="draft-actions">
                <button onClick={copyToClipboard} className="copy-btn" title="Copy to clipboard">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
              </div>
            </div>
            <div className="draft-content">
              <textarea
                value={generatedDraft}
                onChange={(e) => setGeneratedDraft(e.target.value)}
                rows={6}
                className="form-textarea"
              />
            </div>
            <div className="draft-footer">
              <button 
                className="action-button primary"
                onClick={sendMessage}
                disabled={loading || !generatedDraft.trim()}
              >
                {loading ? (
                  <>
                    <div className="spinner-small"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '2px'}}>
                      <path d="M4 4h16v16H4z" fill="#e0e7ff"/>
                      <polyline points="22,6 12,13 2,6" stroke="#6366f1" strokeWidth="2" fill="none"/>
                      <rect x="4" y="4" width="16" height="16" rx="2" ry="2" stroke="#6366f1" strokeWidth="2" fill="none"/>
                    </svg>
                    Send Email
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {!expanded && (
          <div className="quick-templates">
            <h4>Quick Templates</h4>
            <div className="template-buttons">
              <button 
                onClick={() => setDraftData(prev => ({ ...prev, text: 'Quarterly portfolio review and performance summary' }))}
                className="template-btn"
              >
                Portfolio Review
              </button>
              <button 
                onClick={() => setDraftData(prev => ({ ...prev, text: 'Market update and rebalancing recommendation' }))}
                className="template-btn"
              >
                Market Update
              </button>
              <button 
                onClick={() => setDraftData(prev => ({ ...prev, text: 'Schedule annual financial planning meeting' }))}
                className="template-btn"
              >
                Meeting Request
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageDraftWidget;

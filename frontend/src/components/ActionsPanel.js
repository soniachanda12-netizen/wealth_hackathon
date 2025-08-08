import React, { useState } from 'react';
import { draftMessage, createCalendarInvite, summarize, ingestData } from '../api';

function ActionsPanel() {
  const [messageInput, setMessageInput] = useState('');
  const [draft, setDraft] = useState('');
  const [calendarInput, setCalendarInput] = useState('');
  const [calendarStatus, setCalendarStatus] = useState('');
  const [summaryInput, setSummaryInput] = useState('');
  const [summary, setSummary] = useState('');
  const [ingestInput, setIngestInput] = useState('');
  const [ingestStatus, setIngestStatus] = useState('');
  const [loading, setLoading] = useState({});

  const setLoadingState = (action, isLoading) => {
    setLoading(prev => ({ ...prev, [action]: isLoading }));
  };

  const handleDraft = async () => {
    if (!messageInput.trim()) return;
    
    try {
      setLoadingState('draft', true);
      const res = await draftMessage({ text: messageInput });
      setDraft(res.draft || 'Draft created successfully');
    } catch (err) {
      setDraft('Error: Failed to draft message');
    } finally {
      setLoadingState('draft', false);
    }
  };

  const handleCalendar = async () => {
    if (!calendarInput.trim()) return;
    
    try {
      setLoadingState('calendar', true);
      const res = await createCalendarInvite({ details: calendarInput });
      setCalendarStatus(res.invite_status || 'Calendar invite created successfully');
    } catch (err) {
      setCalendarStatus('Error: Failed to create calendar invite');
    } finally {
      setLoadingState('calendar', false);
    }
  };

  const handleSummary = async () => {
    if (!summaryInput.trim()) return;
    
    try {
      setLoadingState('summary', true);
      const res = await summarize({ text: summaryInput });
      setSummary(res.summary || 'Summary created successfully');
    } catch (err) {
      setSummary('Error: Failed to create summary');
    } finally {
      setLoadingState('summary', false);
    }
  };

  const handleIngest = async () => {
    if (!ingestInput.trim()) return;
    
    try {
      setLoadingState('ingest', true);
      const res = await ingestData({ data: ingestInput });
      setIngestStatus(res.ingest_status || 'Data ingested successfully');
    } catch (err) {
      setIngestStatus('Error: Failed to ingest data');
    } finally {
      setLoadingState('ingest', false);
    }
  };

  return (
    <div className="actions-panel">
      <h2>Advisor Actions</h2>
      
      <div className="action-buttons">
        <button 
          className="action-btn"
          onClick={handleDraft}
          disabled={!messageInput.trim() || loading.draft}
        >
          {loading.draft ? 'Drafting...' : 'Draft Message'}
        </button>
        
        <button 
          className="action-btn"
          onClick={handleCalendar}
          disabled={!calendarInput.trim() || loading.calendar}
        >
          {loading.calendar ? 'Creating...' : 'Create Calendar Invite'}
        </button>
        
        <button 
          className="action-btn"
          onClick={handleSummary}
          disabled={!summaryInput.trim() || loading.summary}
        >
          {loading.summary ? 'Summarizing...' : 'Summarize Content'}
        </button>
        
        <button 
          className="action-btn"
          onClick={handleIngest}
          disabled={!ingestInput.trim() || loading.ingest}
        >
          {loading.ingest ? 'Ingesting...' : 'Ingest Data'}
        </button>
      </div>

      <div className="action-forms">
        <div className="form-group">
          <label>Message Context:</label>
          <textarea
            value={messageInput}
            onChange={e => setMessageInput(e.target.value)}
            placeholder="Enter context for personalized message (e.g., 'portfolio update for high-net-worth client')"
            rows="3"
          />
          {draft && <div className="result">{draft}</div>}
        </div>

        <div className="form-group">
          <label>Calendar Details:</label>
          <textarea
            value={calendarInput}
            onChange={e => setCalendarInput(e.target.value)}
            placeholder="Enter meeting details (e.g., 'portfolio review meeting tomorrow at 2pm with Alice Smith')"
            rows="3"
          />
          {calendarStatus && <div className="result">{calendarStatus}</div>}
        </div>

        <div className="form-group">
          <label>Content to Summarize:</label>
          <textarea
            value={summaryInput}
            onChange={e => setSummaryInput(e.target.value)}
            placeholder="Paste meeting notes, emails, or documents to summarize..."
            rows="4"
          />
          {summary && <div className="result">{summary}</div>}
        </div>

        <div className="form-group">
          <label>Data to Ingest:</label>
          <textarea
            value={ingestInput}
            onChange={e => setIngestInput(e.target.value)}
            placeholder="Enter client data, documents, or other information to ingest..."
            rows="3"
          />
          {ingestStatus && <div className="result">{ingestStatus}</div>}
        </div>
      </div>
    </div>
  );
}

export default ActionsPanel;

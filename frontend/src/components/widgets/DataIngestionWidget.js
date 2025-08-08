import React, { useState } from 'react';
import { ingestData, summarize } from '../../api';
import './DataIngestionWidget.css';

const DataIngestionWidget = ({ expanded = false }) => {
  const [activeTab, setActiveTab] = useState('ingest');
  const [ingestForm, setIngestForm] = useState({
    data: '',
    type: 'text'
  });
  const [summarizeForm, setSummarizeForm] = useState({
    text: ''
  });
  const [ingestResult, setIngestResult] = useState('');
  const [summarizeResult, setSummarizeResult] = useState('');
  const [loading, setLoading] = useState({ ingest: false, summarize: false });
  const [error, setError] = useState({ ingest: null, summarize: null });

  const handleIngestData = async () => {
    if (!ingestForm.data.trim()) return;

    setLoading(prev => ({ ...prev, ingest: true }));
    setError(prev => ({ ...prev, ingest: null }));

    try {
      const response = await ingestData(ingestForm);
      setIngestResult(response.ingest_status || 'Data ingested successfully');
    } catch (err) {
      console.error('Failed to ingest data:', err);
      setError(prev => ({ ...prev, ingest: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, ingest: false }));
    }
  };

  const handleSummarizeData = async () => {
    if (!summarizeForm.text.trim()) return;

    setLoading(prev => ({ ...prev, summarize: true }));
    setError(prev => ({ ...prev, summarize: null }));

    try {
      const response = await summarize(summarizeForm);
      setSummarizeResult(response.summary || 'Failed to generate summary');
    } catch (err) {
      console.error('Failed to summarize data:', err);
      setError(prev => ({ ...prev, summarize: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, summarize: false }));
    }
  };

  const clearIngestForm = () => {
    setIngestForm({ data: '', type: 'text' });
    setIngestResult('');
    setError(prev => ({ ...prev, ingest: null }));
  };

  const clearSummarizeForm = () => {
    setSummarizeForm({ text: '' });
    setSummarizeResult('');
    setError(prev => ({ ...prev, summarize: null }));
  };

  const recentIngestions = [
    { name: 'Client emails batch', type: 'email', status: 'processed', time: '2 hours ago' },
    { name: 'Meeting transcripts', type: 'text', status: 'processing', time: '4 hours ago' },
    { name: 'Market research docs', type: 'pdf', status: 'completed', time: '1 day ago' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'processing': return '#f59e0b';
      case 'processed': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'email':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
        );
      case 'pdf':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14,2 14,8 20,8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10,9 9,9 8,9"></polyline>
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14,2 14,8 20,8"></polyline>
          </svg>
        );
    }
  };

  return (
    <div className={`data-ingestion-widget ${expanded ? 'expanded' : ''}`}>
      <div className="widget-header">
        <div className="header-content">
          <h3>Data Management</h3>
          <span className="feature-badge">AI Analytics</span>
        </div>
      </div>

      {expanded && (
        <div className="widget-tabs">
          <button 
            className={`tab-btn ${activeTab === 'ingest' ? 'active' : ''}`}
            onClick={() => setActiveTab('ingest')}
          >
            Data Ingestion
          </button>
          <button 
            className={`tab-btn ${activeTab === 'summarize' ? 'active' : ''}`}
            onClick={() => setActiveTab('summarize')}
          >
            Summarize
          </button>
          <button 
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>
      )}
      
      <div className="widget-content">
        {(activeTab === 'ingest' || !expanded) && (
          <div className="ingest-section">
            <h4>Data Ingestion</h4>
            <div className="ingest-form">
              <div className="form-group">
                <label htmlFor="data-type">Data Type</label>
                <select 
                  id="data-type"
                  value={ingestForm.type}
                  onChange={(e) => setIngestForm(prev => ({ ...prev, type: e.target.value }))}
                  className="type-select"
                >
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="pdf">PDF</option>
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="data-content">Data Content</label>
                <textarea
                  id="data-content"
                  value={ingestForm.data}
                  onChange={(e) => setIngestForm(prev => ({ ...prev, data: e.target.value }))}
                  placeholder="Paste your data here or describe the data source..."
                  rows={4}
                  className="data-input"
                />
              </div>

              <div className="form-actions">
                <button 
                  onClick={handleIngestData}
                  disabled={!ingestForm.data.trim() || loading.ingest}
                  className="ingest-btn"
                >
                  {loading.ingest ? (
                    <>
                      <div className="spinner-small"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7,10 12,15 17,10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Ingest Data
                    </>
                  )}
                </button>
                <button 
                  onClick={clearIngestForm}
                  className="clear-btn"
                >
                  Clear
                </button>
              </div>
            </div>

            {error.ingest && (
              <div className="error-message">
                <p>Ingestion failed: {error.ingest}</p>
              </div>
            )}

            {ingestResult && (
              <div className="success-message">
                <div className="result-header">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22,4 12,14.01 9,11.01"></polyline>
                  </svg>
                  Ingestion Status
                </div>
                <p>{ingestResult}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'summarize' && expanded && (
          <div className="summarize-section">
            <h4>Text Summarization</h4>
            <div className="summarize-form">
              <div className="form-group">
                <label htmlFor="summarize-text">Text to Summarize</label>
                <textarea
                  id="summarize-text"
                  value={summarizeForm.text}
                  onChange={(e) => setSummarizeForm(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Paste meeting notes, emails, or documents to summarize..."
                  rows={6}
                  className="summarize-input"
                />
              </div>

              <div className="form-actions">
                <button 
                  onClick={handleSummarizeData}
                  disabled={!summarizeForm.text.trim() || loading.summarize}
                  className="summarize-btn"
                >
                  {loading.summarize ? (
                    <>
                      <div className="spinner-small"></div>
                      Summarizing...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14,2 14,8 20,8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                      </svg>
                      Generate Summary
                    </>
                  )}
                </button>
                <button 
                  onClick={clearSummarizeForm}
                  className="clear-btn"
                >
                  Clear
                </button>
              </div>
            </div>

            {error.summarize && (
              <div className="error-message">
                <p>Summarization failed: {error.summarize}</p>
              </div>
            )}

            {summarizeResult && (
              <div className="summary-result">
                <div className="result-header">
                  <h4>AI Summary</h4>
                  <button 
                    onClick={() => navigator.clipboard.writeText(summarizeResult)}
                    className="copy-btn"
                    title="Copy summary"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                </div>
                <div className="summary-content">
                  <pre>{summarizeResult}</pre>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && expanded && (
          <div className="history-section">
            <h4>Recent Ingestions</h4>
            <div className="history-list">
              {recentIngestions.map((item, index) => (
                <div key={index} className="history-item">
                  <div className="item-icon">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="item-info">
                    <div className="item-name">{item.name}</div>
                    <div className="item-meta">
                      <span className="item-type">{item.type.toUpperCase()}</span>
                      <span className="item-time">{item.time}</span>
                    </div>
                  </div>
                  <div className="item-status">
                    <div 
                      className="status-dot"
                      style={{ backgroundColor: getStatusColor(item.status) }}
                    ></div>
                    <span className="status-text">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!expanded && (
          <div className="widget-summary">
            <div className="quick-stats">
              <div className="stat-item">
                <div className="stat-value">12</div>
                <div className="stat-label">Files Processed</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">3</div>
                <div className="stat-label">In Progress</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataIngestionWidget;

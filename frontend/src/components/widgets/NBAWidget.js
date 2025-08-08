import React, { useState, useEffect } from 'react';
import { fetchNBA } from '../../api';
import './NBAWidget.css';

const NBAWidget = ({ expanded = false }) => {
  const [nbaActions, setNbaActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionStatuses, setActionStatuses] = useState(new Map());

  useEffect(() => {
    loadNBAActions();
  }, []);

  const loadNBAActions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchNBA();
      setNbaActions(response.next_best_actions || []);
    } catch (err) {
      console.error('Failed to fetch NBA actions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markActionAsCompleted = (index) => {
    const newStatuses = new Map(actionStatuses);
    newStatuses.set(index, 'completed');
    setActionStatuses(newStatuses);
  };

  const markActionAsInProgress = (index) => {
    const newStatuses = new Map(actionStatuses);
    newStatuses.set(index, 'in-progress');
    setActionStatuses(newStatuses);
  };

  const getActionIcon = (action, index) => {
    const actionLower = action.toLowerCase();
    
    if (actionLower.includes('call') || actionLower.includes('phone')) {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
      );
    } else if (actionLower.includes('email') || actionLower.includes('message')) {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
      );
    } else if (actionLower.includes('meeting') || actionLower.includes('schedule')) {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      );
    } else if (actionLower.includes('review') || actionLower.includes('analyze')) {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11l3 3 8-8"></path>
          <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.97 0 3.78.64 5.25 1.72"></path>
        </svg>
      );
    }
    
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    );
  };

  const getPriorityScore = (action, index) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('urgent') || actionLower.includes('asap') || index === 0) return 'high';
    if (actionLower.includes('today') || actionLower.includes('call') || index <= 1) return 'medium';
    return 'low';
  };

  if (loading) {
    return (
      <div className={`nba-widget ${expanded ? 'expanded' : ''}`}>
        <div className="widget-header">
          <h3>Next Best Actions</h3>
          <div className="loading-spinner">
            <div className="spinner-small"></div>
          </div>
        </div>
        <div className="widget-content">
          <div className="loading-state">Loading recommendations...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`nba-widget ${expanded ? 'expanded' : ''}`}>
        <div className="widget-header">
          <h3>Next Best Actions</h3>
          <button onClick={loadNBAActions} className="refresh-btn" title="Retry">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
            </svg>
          </button>
        </div>
        <div className="widget-content">
          <div className="error-state">
            <p>Failed to load recommendations</p>
            <small>{error}</small>
          </div>
        </div>
      </div>
    );
  }

  const displayActions = expanded ? nbaActions : nbaActions.slice(0, 3);

  return (
    <div className={`nba-widget ${expanded ? 'expanded' : ''}`}>
      <div className="widget-header">
        <div className="header-content">
          <h3>Next Best Actions</h3>
          <span className="action-count">{nbaActions.length} recommendations</span>
        </div>
        <button onClick={loadNBAActions} className="refresh-btn" title="Refresh">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
          </svg>
        </button>
      </div>
      
      <div className="widget-content">
        {nbaActions.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386L8.46 15.54z"></path>
            </svg>
            <p>No recommendations available</p>
          </div>
        ) : (
          <div className="nba-list">
            {displayActions.map((action, index) => {
              const priority = getPriorityScore(action, index);
              const status = actionStatuses.get(index) || 'pending';
              
              return (
                <div
                  key={index}
                  className={`nba-item ${priority} ${status}`}
                >
                  <div className="nba-icon">
                    {getActionIcon(action, index)}
                  </div>
                  <div className="nba-content">
                    <p className="nba-text">{action}</p>
                    <div className="nba-meta">
                      <span className={`priority-badge ${priority}`}>
                        {priority.toUpperCase()} IMPACT
                      </span>
                      <span className="estimated-time">Est. 15-30 min</span>
                    </div>
                  </div>
                  <div className="nba-actions">
                    {status === 'pending' && (
                      <>
                        <button 
                          onClick={() => markActionAsInProgress(index)}
                          className="action-btn start"
                          title="Start Action"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="5,3 19,12 5,21"></polygon>
                          </svg>
                        </button>
                        <button 
                          onClick={() => markActionAsCompleted(index)}
                          className="action-btn complete"
                          title="Mark Complete"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20,6 9,17 4,12"></polyline>
                          </svg>
                        </button>
                      </>
                    )}
                    {status === 'in-progress' && (
                      <div className="status-indicator in-progress">
                        <div className="pulse-dot"></div>
                        In Progress
                      </div>
                    )}
                    {status === 'completed' && (
                      <div className="status-indicator completed">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22,4 12,14.01 9,11.01"></polyline>
                        </svg>
                        Completed
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {!expanded && nbaActions.length > 3 && (
          <div className="widget-footer">
            <button className="view-all-btn">
              View all {nbaActions.length} recommendations
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NBAWidget;

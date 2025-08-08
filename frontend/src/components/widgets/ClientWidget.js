
import React, { useState, useEffect } from 'react';
import { fetchClients } from '../../api';
import { useAuth } from '../../AuthContextSimple';
import './ClientWidget.css';

const ClientWidget = ({ expanded = false }) => {
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const { advisorData } = useAuth();

  useEffect(() => {
    loadClientData();
  }, [advisorData]);

  const loadClientData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchClients();
      setClientData(response);
    } catch (err) {
      console.error('Failed to fetch client data:', err);
      setError(err.message);
      // Fallback data
      setClientData({
        clients: [
          { 
            name: "Alice Smith", 
            location: "New York",
            portfolio_value: 800000, 
            net_worth: 5000000,
            risk_tolerance: "Conservative", 
            last_contact: "2024-08-05",
            client_tier: "Platinum"
          },
          { 
            name: "Carol White", 
            location: "San Francisco",
            portfolio_value: 900000, 
            net_worth: 8000000,
            risk_tolerance: "Moderate", 
            last_contact: "2024-08-04",
            client_tier: "Platinum"
          },
          { 
            name: "Bob Jones", 
            location: "Boston",
            portfolio_value: 600000, 
            net_worth: 2500000,
            risk_tolerance: "Aggressive", 
            last_contact: "2024-08-06",
            client_tier: "Gold"
          }
        ],
        total_clients: 3
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNetWorth = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    } else {
      return formatCurrency(amount);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'conservative': return '#10b981'; // green
      case 'moderate': return '#f59e0b'; // yellow
      case 'aggressive': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  const getTierColor = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'platinum': return '#e5e7eb'; // platinum
      case 'gold': return '#fbbf24'; // gold
      case 'silver': return '#9ca3af'; // silver
      default: return '#6b7280'; // gray
    }
  };

  const getContactStatus = (lastContact) => {
    if (!lastContact) return 'unknown';
    const contactDate = new Date(lastContact);
    const today = new Date();
    const diffDays = Math.floor((today - contactDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return 'recent';
    if (diffDays <= 7) return 'week';
  };

  const topClients = clientData?.clients || [];
  const displayClients = expanded ? topClients : topClients.slice(0, 4);

  return (
    <div className={`client-widget ${expanded ? 'expanded' : ''}`}>
      {loading && (
        <>
          <div className="widget-header">
            <h3>Client Management</h3>
            <div className="loading-spinner">
              <div className="spinner-small"></div>
            </div>
          </div>
          <div className="widget-content">
            <div className="loading-state">Loading client data...</div>
          </div>
        </>
      )}
      {!loading && error && !clientData && (
        <>
          <div className="widget-header">
            <h3>Client Management</h3>
            <button onClick={loadClientData} className="refresh-btn" title="Retry">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
              </svg>
            </button>
          </div>
          <div className="widget-content">
            <div className="error-state">
              <p>Failed to load client data</p>
              <small>{error}</small>
            </div>
          </div>
        </>
      )}
      {!loading && clientData && (
        <>
          <div className="widget-header">
            <div className="header-content">
              <h3>Client Management</h3>
              <span className="client-count">
                {clientData?.total_clients || 0} client{(clientData?.total_clients || 0) !== 1 ? 's' : ''}
              </span>
            </div>
            <button onClick={loadClientData} className="refresh-btn" title="Refresh">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
              </svg>
            </button>
          </div>
          <div className="widget-content">
            {!clientData?.clients || clientData.clients.length === 0 ? (
              <div className="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <p>No clients found for this advisor</p>
              </div>
            ) : (
              <div className="client-list">
                {displayClients.map((client, index) => {
                  const contactStatus = getContactStatus(client.last_contact);
                  return (
                    <div
                      key={client.client_id || client.name}
                      className={`client-item ${selectedClient === index ? 'selected' : ''}`}
                      onClick={() => setSelectedClient(selectedClient === index ? null : index)}
                    >
                      <div className="client-avatar">
                        <div className={`tier-badge ${client.client_tier?.toLowerCase() || 'silver'}`}> 
                          {client.client_tier?.charAt(0) || 'S'}
                        </div>
                      </div>
                      <div className="client-info">
                        <div className="client-header">
                          <div className="client-name-location">
                            <span className="client-name">{client.name}</span>
                            {client.location && (
                              <span className="client-location">{client.location}</span>
                            )}
                          </div>
                          <div className="client-badges">
                            <span 
                              className="risk-badge" 
                              style={{ backgroundColor: getRiskColor(client.risk_tolerance) }}
                            >
                              {client.risk_tolerance}
                            </span>
                            <span className={`contact-status ${contactStatus}`}>
                              {contactStatus === 'recent' && '🟢'}
                              {contactStatus === 'week' && '🟡'}
                              {contactStatus === 'overdue' && '🔴'}
                              {!client.last_contact && '⚪'}
                            </span>
                          </div>
                        </div>
                        <div className="client-details">
                          <div className="client-financial">
                            <div className="portfolio-value">
                              Portfolio: {formatCurrency(client.portfolio_value || 0)}
                            </div>
                            <div className="net-worth">
                              Net Worth: {formatNetWorth(client.net_worth || 0)}
                            </div>
                          </div>
                        </div>
                        {expanded && (
                          <div className="client-meta">
                            <div className="client-additional-info">
                              <span className="investment-objective">
                                Objective: {client.investment_objective || 'Not specified'}
                              </span>
                              {client.last_contact && (
                                <span className="last-contact">
                                  Last contact: {new Date(client.last_contact).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="client-actions">
                        <button className="action-btn" title="Call Client">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                          </svg>
                        </button>
                        <button className="action-btn" title="Send Message">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {/* Footer and summary section */}
            {!expanded && topClients.length > 4 && (
              <div className="widget-footer">
                <button className="view-all-btn">
                  View all {topClients.length} clients
                </button>
              </div>
            )}
            {expanded && clientData?.summary && (
              <div className="summary-section">
                <h4>Portfolio Summary</h4>
                <div className="summary-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total AUM:</span>
                    <span className="stat-value">{formatCurrency(clientData.summary.total_portfolio_value || 0)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Avg Portfolio:</span>
                    <span className="stat-value">{formatCurrency(clientData.summary.avg_portfolio_value || 0)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">High Value Clients:</span>
                    <span className="stat-value">{clientData.summary.high_value_clients || 0}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ClientWidget;

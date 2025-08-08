import React, { useState, useEffect } from 'react';
import { fetchAggregation } from '../../api';
import { useAuth } from '../../AuthContextSimple';
import './PortfolioWidget.css';

const PortfolioWidget = ({ expanded = false }) => {
  const { advisorData } = useAuth();
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadPortfolioData();
  }, [advisorData]);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchAggregation();
      setPortfolioData(response.aggregation || {});
    } catch (err) {
      console.error('Failed to fetch portfolio data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num) => {
    if (!num) return '0.0%';
    return `${parseFloat(num).toFixed(1)}%`;
  };

  const getGradientStyle = (index) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    ];
    return { background: gradients[index % gradients.length] };
  };

  // Enhanced data processing
  const getAssetAllocation = () => {
    if (!portfolioData?.asset_allocation) return [];
    
    return portfolioData.asset_allocation.map((asset, index) => ({
      ...asset,
      gradient: getGradientStyle(index),
      changeClass: asset.change_24h >= 0 ? 'positive' : 'negative'
    }));
  };

  const getTopHoldings = () => {
    if (!portfolioData?.top_holdings) return [];
    return portfolioData.top_holdings.slice(0, 8);
  };

  const getSummaryMetrics = () => {
    return portfolioData?.summary_metrics || {};
  };

  const getRiskMetrics = () => {
    return portfolioData?.risk_analysis || [];
  };

  const getPerformanceData = () => {
    return portfolioData?.performance_trends || [];
  };

  if (loading) {
    return (
      <div className={`portfolio-widget modern ${expanded ? 'expanded' : ''}`}>
        <div className="widget-header">
          <div className="header-content">
            <h3>Portfolio Analytics</h3>
            <div className="advisor-badge">
              {advisorData?.name || 'Loading...'}
            </div>
          </div>
          <div className="loading-spinner">
            <div className="spinner-modern"></div>
          </div>
        </div>
        <div className="widget-content">
          <div className="loading-skeleton">
            <div className="skeleton-row"></div>
            <div className="skeleton-row short"></div>
            <div className="skeleton-row medium"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`portfolio-widget modern error ${expanded ? 'expanded' : ''}`}>
        <div className="widget-header">
          <h3>Portfolio Analytics</h3>
          <button onClick={loadPortfolioData} className="refresh-btn modern" title="Retry">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 013.5-7.06l1.5 1.5M21 12a9 9 0 01-3.5 7.06l-1.5-1.5"/>
              <path d="M12 3v3m0 12v3"/>
            </svg>
          </button>
        </div>
        <div className="widget-content">
          <div className="error-state modern">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p>Unable to load portfolio data</p>
            <small>{error}</small>
          </div>
        </div>
      </div>
    );
  }

  const assetAllocation = getAssetAllocation();
  const topHoldings = getTopHoldings();
  const summaryMetrics = getSummaryMetrics();
  const riskMetrics = getRiskMetrics();
  const performanceData = getPerformanceData();

  return (
    <div className={`portfolio-widget modern ${expanded ? 'expanded' : ''}`}>
      <div className="widget-header modern">
        <div className="header-content">
          <h3>Portfolio Analytics</h3>
          <div className="header-metrics">
            <div className="metric-item">
              <span className="metric-label">Total AUM</span>
              <span className="metric-value primary">{formatCurrency(summaryMetrics.total_aum)}</span>
            </div>
            <div className="advisor-badge">
              {advisorData?.name || 'Banking Advisor'}
            </div>
          </div>
        </div>
        <button onClick={loadPortfolioData} className="refresh-btn modern" title="Refresh">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 013.5-7.06l1.5 1.5M21 12a9 9 0 01-3.5 7.06l-1.5-1.5"/>
            <path d="M12 3v3m0 12v3"/>
          </svg>
        </button>
      </div>

      {expanded && (
        <div className="widget-tabs modern">
          <button 
            className={`tab-btn modern ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="9"/>
              <rect x="14" y="3" width="7" height="5"/>
              <rect x="14" y="12" width="7" height="9"/>
              <rect x="3" y="16" width="7" height="5"/>
            </svg>
            Overview
          </button>
          <button 
            className={`tab-btn modern ${activeTab === 'allocation' ? 'active' : ''}`}
            onClick={() => setActiveTab('allocation')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20"/>
              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
            </svg>
            Allocation
          </button>
          <button 
            className={`tab-btn modern ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3v18h18"/>
              <path d="M7 12l4-4 4 4 4-4"/>
            </svg>
            Performance
          </button>
          <button 
            className={`tab-btn modern ${activeTab === 'risk' ? 'active' : ''}`}
            onClick={() => setActiveTab('risk')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 003 3 3 3 0 003-3 3 3 0 00-3 3 3 3 0 00-3-3z"/>
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
              <path d="M8 12l2 2 4-4"/>
            </svg>
            Risk
          </button>
        </div>
      )}
      
      <div className="widget-content modern">{/* Content will be filled in next part */}
    );
  }

  const assetAllocation = getAssetAllocation();
  const topClients = getTopClients();
  const totalAUM = portfolioData?.total_aum || 0;

  return (
    <div className={`portfolio-widget ${expanded ? 'expanded' : ''}`}>
      <div className="widget-header">
        <div className="header-content">
          <h3>Portfolio Analytics</h3>
          <div className="aum-summary">
            <span className="aum-label">Total AUM:</span>
            <span className="aum-value">{formatCurrency(totalAUM)}</span>
          </div>
        </div>
        <button onClick={loadPortfolioData} className="refresh-btn" title="Refresh">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
          </svg>
        </button>
      </div>

      {expanded && (
        <div className="widget-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'allocation' ? 'active' : ''}`}
            onClick={() => setActiveTab('allocation')}
          >
            Asset Allocation
          </button>
          <button 
            className={`tab-btn ${activeTab === 'advisors' ? 'active' : ''}`}
            onClick={() => setActiveTab('advisors')}
          >
            By Advisor
          </button>
        </div>
      )}
      
      <div className="widget-content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <div className="kpi-content">
                  <div className="kpi-value">{formatCurrency(totalAUM)}</div>
                  <div className="kpi-label">Total AUM</div>
                </div>
              </div>
              
              <div className="kpi-card">
                <div className="kpi-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className="kpi-content">
                  <div className="kpi-value">{formatNumber(topClients.reduce((sum, c) => sum + c.count, 0))}</div>
                  <div className="kpi-label">Total Clients</div>
                </div>
              </div>
              
              <div className="kpi-card">
                <div className="kpi-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <rect x="9" y="9" width="6" height="6"></rect>
                  </svg>
                </div>
                <div className="kpi-content">
                  <div className="kpi-value">{assetAllocation.length}</div>
                  <div className="kpi-label">Asset Classes</div>
                </div>
              </div>
            </div>
            
            {!expanded && assetAllocation.length > 0 && (
              <div className="quick-allocation">
                <h4>Asset Breakdown</h4>
                <div className="allocation-bars">
                  {assetAllocation.slice(0, 3).map((asset, index) => (
                    <div key={asset.name} className="allocation-bar">
                      <div className="bar-header">
                        <span className="asset-name">{asset.name}</span>
                        <span className="asset-percentage">{asset.percentage}%</span>
                      </div>
                      <div className="bar-track">
                        <div 
                          className="bar-fill" 
                          style={{ 
                            width: `${asset.percentage}%`,
                            backgroundColor: `hsl(${index * 120}, 70%, 50%)`
                          }}
                        ></div>
                      </div>
                      <div className="bar-value">{formatCurrency(asset.value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'allocation' && expanded && (
          <div className="allocation-content">
            <div className="allocation-chart">
              <h4>Asset Allocation Details</h4>
              <div className="allocation-table">
                <div className="table-header">
                  <div>Asset Class</div>
                  <div>Holdings</div>
                  <div>Total Value</div>
                  <div>Avg Value</div>
                  <div>%</div>
                </div>
                {assetAllocation.map((asset, index) => (
                  <div key={asset.name} className="table-row">
                    <div className="asset-info">
                      <div 
                        className="asset-color-dot" 
                        style={{ backgroundColor: `hsl(${index * 120}, 70%, 50%)` }}
                      ></div>
                      {asset.name}
                    </div>
                    <div>{formatNumber(asset.count)}</div>
                    <div>{formatCurrency(asset.value)}</div>
                    <div>{formatCurrency(asset.avgValue)}</div>
                    <div className="percentage">{asset.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'advisors' && expanded && (
          <div className="advisors-content">
            <h4>Client Distribution by Advisor</h4>
            <div className="advisors-list">
              {topClients.map((advisor, index) => (
                <div key={advisor.advisor} className="advisor-item">
                  <div className="advisor-avatar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div className="advisor-info">
                    <div className="advisor-name">{advisor.advisor}</div>
                    <div className="advisor-clients">{advisor.count} clients</div>
                  </div>
                  <div className="advisor-bar">
                    <div 
                      className="advisor-bar-fill"
                      style={{ 
                        width: `${(advisor.count / Math.max(...topClients.map(c => c.count))) * 100}%`,
                        backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioWidget;

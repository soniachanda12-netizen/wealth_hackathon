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
      changeClass: (asset.change_24h || 0) >= 0 ? 'positive' : 'negative'
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
      
      <div className="widget-content modern">
        {activeTab === 'overview' && (
          <div className="overview-content modern">
            <div className="metrics-grid">
              <div className="metric-card premium">
                <div className="metric-icon" style={getGradientStyle(0)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
                <div className="metric-content">
                  <div className="metric-value large">{formatCurrency(summaryMetrics.total_aum)}</div>
                  <div className="metric-label">Assets Under Management</div>
                  <div className="metric-change positive">+2.4% from last month</div>
                </div>
              </div>
              
              <div className="metric-card premium">
                <div className="metric-icon" style={getGradientStyle(1)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div className="metric-content">
                  <div className="metric-value large">{formatNumber(summaryMetrics.total_clients)}</div>
                  <div className="metric-label">Active Clients</div>
                  <div className="metric-change positive">+5 new this month</div>
                </div>
              </div>
              
              <div className="metric-card premium">
                <div className="metric-icon" style={getGradientStyle(2)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3v18h18"/>
                    <path d="M7 12l4-4 4 4 4-4"/>
                  </svg>
                </div>
                <div className="metric-content">
                  <div className="metric-value large">{formatCurrency(summaryMetrics.avg_client_portfolio)}</div>
                  <div className="metric-label">Avg Portfolio Size</div>
                  <div className="metric-change positive">+1.8% growth</div>
                </div>
              </div>
              
              <div className="metric-card premium">
                <div className="metric-icon" style={getGradientStyle(3)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <rect x="9" y="9" width="6" height="6"/>
                  </svg>
                </div>
                <div className="metric-content">
                  <div className="metric-value large">{summaryMetrics.asset_classes}</div>
                  <div className="metric-label">Asset Classes</div>
                  <div className="metric-change neutral">Well diversified</div>
                </div>
              </div>
            </div>
            
            {!expanded && assetAllocation.length > 0 && (
              <div className="quick-allocation modern">
                <h4>Asset Allocation</h4>
                <div className="allocation-grid compact">
                  {assetAllocation.slice(0, 4).map((asset, index) => (
                    <div key={asset.asset_class} className="allocation-card compact">
                      <div className="asset-header">
                        <div className="asset-dot" style={asset.gradient}></div>
                        <span className="asset-name">{asset.asset_class}</span>
                      </div>
                      <div className="asset-value">{formatCurrency(asset.value)}</div>
                      <div className="asset-percentage">{formatPercentage(asset.percentage)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'allocation' && expanded && (
          <div className="allocation-content modern">
            <div className="allocation-header">
              <h4>Asset Allocation Analysis</h4>
              <div className="allocation-summary">
                <span>Diversification Score: <strong>8.5/10</strong></span>
              </div>
            </div>
            
            <div className="allocation-visualization">
              <div className="allocation-details">
                <div className="allocation-table modern">
                  <div className="table-header">
                    <div>Asset Class</div>
                    <div>Holdings</div>
                    <div>Value</div>
                    <div>Weight</div>
                    <div>Performance</div>
                  </div>
                  {assetAllocation.map((asset, index) => (
                    <div key={asset.asset_class} className="table-row modern">
                      <div className="asset-cell">
                        <div className="asset-indicator" style={asset.gradient}></div>
                        <div className="asset-info">
                          <div className="asset-name">{asset.asset_class}</div>
                          <div className="asset-count">{asset.holdings_count} positions</div>
                        </div>
                      </div>
                      <div className="holdings-cell">{formatNumber(asset.holdings_count)}</div>
                      <div className="value-cell">{formatCurrency(asset.value)}</div>
                      <div className="weight-cell">
                        <div className="weight-bar">
                          <div className="weight-fill" style={{ width: `${asset.percentage}%`, ...asset.gradient }}></div>
                        </div>
                        <span className="weight-text">{formatPercentage(asset.percentage)}</span>
                      </div>
                      <div className={`performance-cell ${asset.changeClass}`}>
                        {asset.change_24h ? `${asset.change_24h > 0 ? '+' : ''}${asset.change_24h.toFixed(2)}%` : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && expanded && (
          <div className="performance-content modern">
            <div className="performance-header">
              <h4>Portfolio Performance</h4>
              <div className="performance-period">
                <button className="period-btn active">1M</button>
                <button className="period-btn">3M</button>
                <button className="period-btn">1Y</button>
                <button className="period-btn">All</button>
              </div>
            </div>
            
            <div className="holdings-grid">
              <h4>Top Holdings</h4>
              <div className="holdings-list">
                {topHoldings.map((holding, index) => (
                  <div key={`${holding.symbol}-${index}`} className="holding-card">
                    <div className="holding-info">
                      <div className="holding-symbol">{holding.symbol}</div>
                      <div className="holding-name">{holding.asset_class}</div>
                    </div>
                    <div className="holding-metrics">
                      <div className="holding-value">{formatCurrency(holding.value)}</div>
                      <div className={`holding-change ${(holding.performance_pct || 0) >= 0 ? 'positive' : 'negative'}`}>
                        {holding.performance_pct ? `${holding.performance_pct > 0 ? '+' : ''}${holding.performance_pct}%` : 'N/A'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'risk' && expanded && (
          <div className="risk-content modern">
            <div className="risk-header">
              <h4>Risk Analysis</h4>
              <div className="risk-score">
                <div className="score-gauge">
                  <svg width="120" height="60" className="gauge-svg">
                    <path d="M10 50 A 50 50 0 0 1 110 50" fill="none" stroke="#e5e7eb" strokeWidth="8"/>
                    <path d="M10 50 A 50 50 0 0 1 85 20" fill="none" stroke="#10b981" strokeWidth="8"/>
                  </svg>
                  <div className="gauge-value">7.2</div>
                  <div className="gauge-label">Risk Score</div>
                </div>
              </div>
            </div>
            
            <div className="risk-metrics-grid">
              <div className="risk-metric-card">
                <div className="risk-icon moderate">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </div>
                <div className="risk-content">
                  <div className="risk-value">Moderate</div>
                  <div className="risk-label">Portfolio Risk</div>
                  <div className="risk-description">Balanced risk-return profile</div>
                </div>
              </div>
              
              <div className="risk-metric-card">
                <div className="risk-icon low">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a3 3 0 003 3 3 3 0 003-3 3 3 0 00-3 3 3 3 0 00-3-3z"/>
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                  </svg>
                </div>
                <div className="risk-content">
                  <div className="risk-value">12.5%</div>
                  <div className="risk-label">Volatility</div>
                  <div className="risk-description">30-day rolling</div>
                </div>
              </div>
              
              <div className="risk-metric-card">
                <div className="risk-icon high">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 2v20M14 2v20M4 7h16M4 17h16"/>
                  </svg>
                </div>
                <div className="risk-content">
                  <div className="risk-value">0.85</div>
                  <div className="risk-label">Sharpe Ratio</div>
                  <div className="risk-description">Risk-adjusted returns</div>
                </div>
              </div>
            </div>
            
            <div className="risk-breakdown">
              <h4>Risk by Asset Class</h4>
              <div className="risk-bars">
                {riskMetrics.map((risk, index) => (
                  <div key={risk.asset_class} className="risk-bar-item">
                    <div className="risk-bar-header">
                      <span className="risk-asset-name">{risk.asset_class}</span>
                      <span className="risk-exposure">{formatCurrency(risk.exposure)}</span>
                    </div>
                    <div className="risk-bar-track">
                      <div 
                        className="risk-bar-fill" 
                        style={{ 
                          width: `${((risk.volatility || 0) / 50) * 100}%`,
                          backgroundColor: (risk.volatility || 0) > 20 ? '#ef4444' : (risk.volatility || 0) > 10 ? '#f59e0b' : '#10b981'
                        }}
                      ></div>
                    </div>
                    <div className="risk-bar-footer">
                      <span className="risk-volatility">{(risk.volatility || 0).toFixed(1)}% volatility</span>
                      <span className="risk-clients">{risk.clients_exposed} clients</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioWidget;

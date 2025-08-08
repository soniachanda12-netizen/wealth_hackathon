import React, { useState, useEffect } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer,
    ScatterChart, Scatter
} from 'recharts';
import './Dashboard.css';
import {
  fetchTodo,
  fetchNBA,
  draftMessage,
  createCalendarInvite,
  summarize,
  ingestData,
  fetchAggregation,
  chat,
  fetchDashboardMetrics,
  fetchLookerIntegration,
  fetchAIInsights
} from '../api';

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    // Removed Looker integration
    const [legacyData, setLegacyData] = useState({
        todo: [],
        nba: [],
        aggregation: {},
        chatInput: '',
        chatResponse: '',
        chatLoading: false,
        error: ''
    });

    useEffect(() => {
        fetchDashboardData();
        loadLegacyData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const data = await fetchDashboardMetrics();
            setDashboardData(data.dashboard);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    // Removed fetchLookerConfig and Looker API calls

    const loadLegacyData = async () => {
        try {
            setLoading(true);
            const [todoData, nbaData, aggregationData] = await Promise.all([
                fetchTodo().catch(e => ({ todo: ['Failed to load tasks'] })),
                fetchNBA().catch(e => ({ next_best_actions: ['Failed to load actions'] })),
                fetchAggregation().catch(e => ({ aggregation: { error: 'Failed to load data' } }))
            ]);
            
            setLegacyData(prev => ({
                ...prev,
                todo: todoData.todo || [],
                nba: nbaData.next_best_actions || [],
                aggregation: aggregationData.aggregation || {}
            }));
        } catch (err) {
            setLegacyData(prev => ({
                ...prev,
                error: 'Failed to load dashboard data'
            }));
        } finally {
            setLoading(false);
        }
    };

    const handleChat = async () => {
        if (!legacyData.chatInput.trim() || legacyData.chatLoading) return;
        
        setLegacyData(prev => ({ ...prev, chatLoading: true }));
        try {
            const res = await chat({ message: legacyData.chatInput });
            setLegacyData(prev => ({
                ...prev,
                chatResponse: res.response || 'No response received',
                chatInput: ''
            }));
        } catch (err) {
            setLegacyData(prev => ({
                ...prev,
                chatResponse: 'Error: Failed to get response from advisor'
            }));
        } finally {
            setLegacyData(prev => ({ ...prev, chatLoading: false }));
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatNumber = (value) => {
        return new Intl.NumberFormat('en-US').format(value);
    };

    const getTrendIcon = (direction) => {
        switch (direction) {
            case 'up':
                return <span className="trend-up">📈</span>;
            case 'down':
                return <span className="trend-down">📉</span>;
            default:
                return <span className="trend-neutral">➖</span>;
        }
    };

    // Removed Looker config download

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Loading analytics dashboard...</p>
            </div>
        );
    }

    // Legacy view for existing functionality
    if (activeTab === 'legacy') {
        return (
            <div className="dashboard">
                {legacyData.error && <div className="error">{legacyData.error}</div>}
                <div className="dashboard-grid">
                    {/* Client Management (Advisor Chat) */}
                    <div className="card">
                        <h3>Advisor Chat</h3>
                        <div className="chat-input">
                            <input 
                                value={legacyData.chatInput} 
                                onChange={e => setLegacyData(prev => ({...prev, chatInput: e.target.value}))} 
                                placeholder="Ask your advisor anything..."
                                onKeyPress={e => e.key === 'Enter' && handleChat()}
                                disabled={legacyData.chatLoading}
                            />
                            <button 
                                onClick={handleChat} 
                                disabled={!legacyData.chatInput.trim() || legacyData.chatLoading}
                                style={{
                                    opacity: legacyData.chatLoading ? 0.7 : 1,
                                    cursor: legacyData.chatLoading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {legacyData.chatLoading ? 'Sending...' : 'Send'}
                            </button>
                        </div>
                        {legacyData.chatResponse && (
                            <div className="chat-response">{legacyData.chatResponse}</div>
                        )}
                    </div>
                    {/* Portfolio Insights */}
                    <div className="card">
                        <h3>Portfolio Insights</h3>
                        {dashboardData && dashboardData.portfolio && (
                            <>
                                {/* Asset Allocation Pie Chart */}
                                <div style={{ width: '100%', height: 250 }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie
                                                data={dashboardData.portfolio.asset_allocation}
                                                dataKey="value"
                                                nameKey="asset_class"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                label
                                            >
                                                {dashboardData.portfolio.asset_allocation.map((entry, idx) => (
                                                    <Cell key={entry.asset_class} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={formatCurrency} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                {/* Top Holdings Table */}
                                <div style={{ marginTop: 16 }}>
                                    <h4>Top Holdings</h4>
                                    <table style={{ width: '100%', fontSize: 14 }}>
                                        <thead>
                                            <tr>
                                                <th>Symbol</th>
                                                <th>Asset Class</th>
                                                <th>Client</th>
                                                <th>Value</th>
                                                <th>Performance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(dashboardData.portfolio.top_holdings || []).map((row, idx) => (
                                                <tr key={idx}>
                                                    <td>{row.symbol}</td>
                                                    <td>{row.asset_class}</td>
                                                    <td>{row.client_name}</td>
                                                    <td>{formatCurrency(row.value)}</td>
                                                    <td>{row.performance}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Monthly Trends Bar Chart */}
                                <div style={{ marginTop: 16, width: '100%', height: 200 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={dashboardData.portfolio.monthly_trends}>
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip formatter={formatCurrency} />
                                            <Legend />
                                            <Bar dataKey="inflows" fill="#3B82F6" name="Inflows" />
                                            <Bar dataKey="outflows" fill="#EF4444" name="Outflows" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </>
                        )}
                        {(!dashboardData || !dashboardData.portfolio) && <p>No portfolio data available</p>}
                    </div>
                    {/* Priority List (To-Do) */}
                    <div className="card">
                        <h3>Daily To-Do List</h3>
                        <ul>
                            {legacyData.todo.length > 0 ? legacyData.todo.map((item, i) => (
                                <li key={i}>{item}</li>
                            )) : <li>No tasks available</li>}
                        </ul>
                    </div>
                    {/* Next Best Actions */}
                    <div className="card">
                        <h3>Next Best Actions</h3>
                        <ul>
                            {legacyData.nba.length > 0 ? legacyData.nba.map((action, i) => (
                                <li key={i}>{action}</li>
                            )) : <li>No actions available</li>}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="modern-dashboard">
            {/* Header Section */}
            <div className="dashboard-header">
                <div className="header-content">
                    <h1>Private Banking Analytics</h1>
                    <div className="header-actions">
                        <div className="last-updated">
                            Last updated: {new Date().toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="dashboard-nav">
                <button 
                    className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    📊 Overview
                </button>
                <button 
                    className={`nav-tab ${activeTab === 'portfolios' ? 'active' : ''}`}
                    onClick={() => setActiveTab('portfolios')}
                >
                    💼 Portfolios
                </button>
                <button 
                    className={`nav-tab ${activeTab === 'advisors' ? 'active' : ''}`}
                    onClick={() => setActiveTab('advisors')}
                >
                    👥 Advisors
                </button>
                <button 
                    className={`nav-tab ${activeTab === 'risk' ? 'active' : ''}`}
                    onClick={() => setActiveTab('risk')}
                >
                    ⚠️ Risk
                </button>
                <button 
                    className={`nav-tab ${activeTab === 'legacy' ? 'active' : ''}`}
                    onClick={() => setActiveTab('legacy')}
                >
                    🔧 Legacy
                </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && dashboardData && (
                <div className="tab-content">
                    {/* KPI Cards */}
                    <div className="kpi-grid">
                        {Object.entries(dashboardData.kpis || {}).map(([key, kpi]) => (
                            <div key={key} className="kpi-card">
                                <div className="kpi-header">
                                    <h3>{kpi.label}</h3>
                                    {getTrendIcon(kpi.trend_direction)}
                                </div>
                                <div className="kpi-value">
                                    {kpi.format === 'currency' 
                                        ? formatCurrency(kpi.value)
                                        : formatNumber(kpi.value)
                                    }
                                </div>
                                <div className="kpi-trend">
                                    {kpi.trend}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* AI Insights */}
                    <div className="insights-section">
                        <h2>🤖 AI Insights</h2>
                        <div className="insights-grid">
                            {(dashboardData.insights || []).map((insight, idx) => (
                                <div key={idx} className="insight-card">
                                    <div className="insight-priority">#{insight.priority}</div>
                                    <div className="insight-text">{insight.text}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Asset Allocation Chart */}
                    <div className="chart-section">
                        <h2>Asset Allocation</h2>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={400}>
                                <PieChart>
                                    <Pie
                                        data={dashboardData.charts?.asset_allocation?.data || []}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({label, percentage}) => `${label}: ${percentage}%`}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {(dashboardData.charts?.asset_allocation?.data || []).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Monthly Trends */}
                    <div className="chart-section">
                        <h2>Monthly Flow Trends</h2>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={dashboardData.charts?.monthly_trends?.data || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis tickFormatter={(value) => `$${value/1000000}M`} />
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Legend />
                                    <Line type="monotone" dataKey="inflows" stroke="#10B981" name="Inflows" />
                                    <Line type="monotone" dataKey="outflows" stroke="#EF4444" name="Outflows" />
                                    <Line type="monotone" dataKey="net_flow" stroke="#3B82F6" name="Net Flow" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* Portfolios Tab */}
            {activeTab === 'portfolios' && dashboardData && (
                <div className="tab-content">
                    <h2>Portfolio Performance</h2>
                    <div className="portfolio-metrics">
                        <div className="metric-card">
                            <h3>Total AUM</h3>
                            <div className="metric-value">
                                {formatCurrency(dashboardData.kpis?.total_aum?.value || 0)}
                            </div>
                        </div>
                        <div className="metric-card">
                            <h3>Average Portfolio</h3>
                            <div className="metric-value">
                                {formatCurrency(dashboardData.kpis?.avg_portfolio?.value || 0)}
                            </div>
                        </div>
                        <div className="metric-card">
                            <h3>Active Clients</h3>
                            <div className="metric-value">
                                {formatNumber(dashboardData.kpis?.total_clients?.value || 0)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Advisors Tab */}
            {activeTab === 'advisors' && dashboardData && (
                <div className="tab-content">
                    <h2>Advisor Leaderboard</h2>
                    <div className="leaderboard">
                        {(dashboardData.charts?.advisor_leaderboard?.data || []).map((advisor, idx) => (
                            <div key={idx} className="advisor-card">
                                <div className="advisor-rank">#{advisor.rank}</div>
                                <div className="advisor-info">
                                    <h3>{advisor.name}</h3>
                                    <div className="advisor-stats">
                                        <span>AUM: {formatCurrency(advisor.aum)}</span>
                                        <span>Clients: {advisor.clients}</span>
                                        <span>Diversity: {advisor.diversity_score}</span>
                                    </div>
                                </div>
                                <div className="advisor-badge" style={{backgroundColor: advisor.performance_badge?.color}}>
                                    {advisor.performance_badge?.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Risk Tab */}
            {activeTab === 'risk' && dashboardData && (
                <div className="tab-content">
                    <h2>Risk Heatmap</h2>
                    <div className="risk-grid">
                        {(dashboardData.charts?.risk_heatmap?.data || []).map((item, idx) => (
                            <div 
                                key={idx} 
                                className={`risk-cell risk-${item.risk_level}`}
                                title={`${item.asset_class} - ${item.sector}`}
                            >
                                <div className="risk-label">{item.asset_class}</div>
                                <div className="risk-sector">{item.sector}</div>
                                <div className="risk-value">{formatCurrency(item.exposure)}</div>
                                <div className="risk-perf">{item.performance?.toFixed(1)}%</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Looker integration removed: all analytics now use backend data and modern React charts */}
        </div>
    );
};

export default Dashboard;

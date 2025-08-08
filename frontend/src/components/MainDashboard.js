import React, { useState } from 'react';
import { useAuth } from '../AuthContextSimple';
import Sidebar from './Sidebar';
import Header from './Header';
import TodoWidget from './widgets/TodoWidget';
import NBAWidget from './widgets/NBAWidget';
import PortfolioWidget from './widgets/PortfolioWidget';
import ClientWidget from './widgets/ClientWidget';
import ChatWidget from './widgets/ChatWidget';
import MessageDraftWidget from './widgets/MessageDraftWidget';
import CalendarWidget from './widgets/CalendarWidget';
import DataIngestionWidget from './widgets/DataIngestionWidget';
import './MainDashboard.css';

const MainDashboard = () => {
  const { user, signOut, advisorData } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeCalendarTab, setActiveCalendarTab] = useState('meetings');

  // Create user object with advisor email for header display
  const displayUser = {
    email: advisorData?.email || user?.email || 'advisor@privatebank.com',
    name: advisorData?.name || 'Banking Advisor'
  };

  // Static greeting for all times
  const getGreeting = () => {
    const advisorName = advisorData?.name || 'Banking Advisor';
    return `Good Day, ${advisorName}`;
  };

  return (
    <div className="main-dashboard">
      <Header 
        user={displayUser} 
        onSignOut={signOut}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className="dashboard-container">
        <Sidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          collapsed={sidebarCollapsed}
        />
        
        <main className={`dashboard-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="dashboard-content">
            <h1>{getGreeting()}</h1>
            
            {activeSection === 'dashboard' && (
              <div className="dashboard-grid">
                {/* Client Management - Top */}
                <div className="client-management">
                  <h2>Client Management</h2>
                  <ClientWidget />
                </div>

                {/* Portfolio Overview - Top */}
                <div className="portfolio-overview">
                  <h2>Portfolio Insights</h2>
                  <PortfolioWidget />
                </div>

                {/* Priority Alerts - Bottom */}
                <div className="priority-alerts">
                  <h2>Priority Alerts</h2>
                  <TodoWidget />
                </div>

                {/* Next Best Actions - Bottom */}
                <div className="nba-section">
                  <h2>Next Best Actions</h2>
                  <NBAWidget />
                </div>
              </div>
            )}

            {activeSection === 'todo' && (
              <div className="section-content">
                <h2>Daily To-Do List</h2>
                <TodoWidget expanded={true} />
              </div>
            )}

            {activeSection === 'clients' && (
              <div className="section-content">
                <ClientWidget expanded={true} />
              </div>
            )}

            {activeSection === 'calendar' && (
              <div className="section-content">
                <h2>Calendar & Meetings</h2>
                <div className="calendar-section-tabs">
                  <div className="tab-buttons">
                    <button 
                      className={`tab-btn ${activeCalendarTab === 'meetings' ? 'active' : ''}`}
                      onClick={() => setActiveCalendarTab('meetings')}
                    >
                      📅 Upcoming Meetings
                    </button>
                    <button 
                      className={`tab-btn ${activeCalendarTab === 'messages' ? 'active' : ''}`}
                      onClick={() => setActiveCalendarTab('messages')}
                    >
                      ✉️ Message Center
                    </button>
                  </div>
                </div>
                
                {activeCalendarTab === 'meetings' && (
                  <CalendarWidget />
                )}
                
                {activeCalendarTab === 'messages' && (
                  <div className="message-center-section">
                    <h3>Client Communications</h3>
                    <MessageDraftWidget />
                  </div>
                )}
              </div>
            )}

            {activeSection === 'chat' && (
              <div className="section-content">
                <h2>Advisor Assistant</h2>
                <ChatWidget />
              </div>
            )}

            {activeSection === 'analytics' && (
              <div className="section-content">
                <h2>Analytics Dashboard</h2>
                <PortfolioWidget expanded={true} />
                <DataIngestionWidget />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainDashboard;

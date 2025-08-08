import React, { useState } from 'react';
import { useAuth } from '../AuthContextSimple';
import Sidebar from './Sidebar';
import Header from './Header';
import TodoWidget from './widgets/TodoWidget';
import NBAWidget from './widgets/NBAWidget';
import PortfolioWidget from './widgets/PortfolioWidget';
import ClientPortfolioPage from './ClientPortfolioPage';
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


  // Toggle state for merged right-side widget
  const [rightTab, setRightTab] = useState('priority');

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
              <>
                {/* Looker Studio Embed on Top */}
                <div className="dashboard-looker-embed">
                  <iframe
                    title="Banking Dashboard Overview"
                    width="100%"
                    height="110"
                    style={{ border: 'none', borderRadius: '12px', marginBottom: '1.2rem', minHeight: '90px', maxHeight: '130px' }}
                    src="https://lookerstudio.google.com/embed/u/0/reporting/f78b3bce-4809-49db-b820-1d9323a3eca7/page/Hr3TF"
                    allowFullScreen
                  ></iframe>
                </div>

                {/* Two-column layout below embed */}
                <div className="dashboard-row-2col">
                  {/* Left: Client Management */}
                  <div className="dashboard-col dashboard-col-left">
                    <ClientWidget />
                  </div>
                  {/* Right: Toggle between Priority Alerts and Next Best Actions */}
                  <div className="dashboard-col dashboard-col-right">
                    <div className="dashboard-toggle-tabs">
                      <button
                        className={rightTab === 'priority' ? 'active' : ''}
                        onClick={() => setRightTab('priority')}
                      >
                        Priority Actions
                      </button>
                      <button
                        className={rightTab === 'nba' ? 'active' : ''}
                        onClick={() => setRightTab('nba')}
                      >
                        Next Best Actions
                      </button>
                    </div>
                    <div className="dashboard-toggle-content">
                      {rightTab === 'priority' ? <TodoWidget /> : <NBAWidget />}
                    </div>
                  </div>
                </div>
              </>
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

            {activeSection === 'client-portfolio' && (
              <ClientPortfolioPage />
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

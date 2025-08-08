import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContextSimple';
import './Auth.css';

const SimpleAuth = () => {
  const { user, signInWithToken, signOut, loading } = useAuth();
  const [tokenInput, setTokenInput] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-loading">
          <div className="spinner"></div>
          <p>Initializing authentication...</p>
          <small>Checking for service account credentials...</small>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>🔐 Authentication Required</h2>
            <p>This application requires authentication to access the backend services.</p>
          </div>
          
          <div className="auth-body">
            {!showTokenInput ? (
              <div>
                <div className="auth-info">
                  <p><strong>🌐 Cloud Run Deployment:</strong> Authentication handled automatically</p>
                  <p><strong>💻 Local Development:</strong> Manual token required for testing</p>
                  <p><strong>🔑 Backend URL:</strong> {process.env.REACT_APP_API_URL}</p>
                </div>
                
                <button 
                  className="auth-button"
                  onClick={() => setShowTokenInput(true)}
                >
                  🔧 Manual Token Entry (Development)
                </button>
                
                <div className="token-instructions">
                  <p>To get an identity token for testing:</p>
                  <code>gcloud auth print-identity-token --audiences={process.env.REACT_APP_API_URL}</code>
                </div>
              </div>
            ) : (
              <div>
                <textarea
                  className="token-input"
                  placeholder="Paste your identity token here..."
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  rows={6}
                />
                <div className="token-actions">
                  <button 
                    className="auth-button"
                    onClick={() => {
                      if (tokenInput.trim()) {
                        signInWithToken(tokenInput.trim());
                      }
                    }}
                    disabled={!tokenInput.trim()}
                  >
                    Sign In with Token
                  </button>
                  <button 
                    className="auth-button-secondary"
                    onClick={() => setShowTokenInput(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-header-bar">
      <div className="auth-user-info">
        <span className="auth-status">✅ Authenticated</span>
        <span className="auth-mode">
          {user.serviceAccount ? '🤖 Service Account' : '👤 User Token'}
        </span>
        {!user.serviceAccount && (
          <button 
            className="auth-signout"
            onClick={signOut}
          >
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
};

export default SimpleAuth;

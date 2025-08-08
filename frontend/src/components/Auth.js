import React from 'react';
import { useAuth } from '../AuthContext';
import './Auth.css';

const AuthComponent = () => {
  const { user, signIn, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-loading">
          <div className="spinner"></div>
          <p>Initializing authentication...</p>
          <small>Checking service account credentials...</small>
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
            <p>Service account authentication failed. Please sign in with your Google account.</p>
          </div>
          
          <div className="auth-body">
            <button 
              className="auth-button"
              onClick={signIn}
            >
              <img 
                src="https://developers.google.com/identity/images/g-logo.png" 
                alt="Google"
                className="google-logo"
              />
              Sign in with Google
            </button>
            
            <div className="auth-info">
              <p><strong>Service-to-Service:</strong> This frontend authenticates with the backend automatically when deployed</p>
              <p><strong>Local Development:</strong> Requires your Google account for testing</p>
              <p><strong>Your Organization:</strong> gc-trial-0041.orgtrials.ongcp.co</p>
              <p><strong>Required Account:</strong> Use your authorized Google account</p>
            </div>
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
          {user.serviceAccount ? 'Service Account' : 'User Account'}
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

export default AuthComponent;

import React, { createContext, useContext, useEffect, useState } from 'react';
import { extractEmailFromIdToken } from './utils/jwt';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize service account authentication
    const initializeAuth = async () => {
      try {
        // Get identity token for the backend service
        const backendUrl = process.env.REACT_APP_API_URL || 'https://apialchemistproject-backend-608187465720.us-central1.run.app';
        
        // Try to get identity token from the metadata server (works in Cloud Run)
        const identityToken = await getIdentityToken(backendUrl);
        
        if (identityToken) {
          setToken(identityToken);
          setUser({ authenticated: true, serviceAccount: true });
          console.log('Service account authentication successful');
        } else {
          // Fallback to user authentication for local development
          await initializeUserAuth();
        }
      } catch (error) {
        console.error('Service account auth failed, trying user auth:', error);
        // Fallback to user authentication
        await initializeUserAuth();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const getIdentityToken = async (audience) => {
    try {
      // Try to get identity token from Google Cloud metadata server
      const response = await fetch(`http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=${encodeURIComponent(audience)}`, {
        headers: {
          'Metadata-Flavor': 'Google'
        }
      });
      
      if (response.ok) {
        const token = await response.text();
        return token;
      }
    } catch (error) {
      console.log('Metadata server not available, likely running locally');
    }
    return null;
  };

  const initializeUserAuth = async () => {
    try {
      // Load Google Identity Services for user authentication
      if (!window.google) {
        await loadGoogleScript();
      }

      // Initialize Google OAuth for user authentication
      window.google.accounts.id.initialize({
        client_id: '608187465720-compute@developer.gserviceaccount.com',
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: false
      });

      // Check if user is already authenticated
      const savedToken = localStorage.getItem('gcp_token');
      if (savedToken) {
        setToken(savedToken);
        setUser({ authenticated: true, serviceAccount: false });
      }
    } catch (error) {
      console.error('User auth initialization failed:', error);
    }
  };

  const loadGoogleScript = () => {
    return new Promise((resolve, reject) => {
      if (document.getElementById('google-identity-script')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-identity-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const handleGoogleResponse = async (response) => {
    try {
      // Get identity token from Google
      const idToken = response.credential;
      // Extract email from token
      const email = extractEmailFromIdToken(idToken);
      // Store token and user info
      localStorage.setItem('gcp_token', idToken);
      if (email) {
        localStorage.setItem('user_email', email);
      }
      setToken(idToken);
      setUser({ authenticated: true, serviceAccount: false, email });
      console.log('User authentication successful');
    } catch (error) {
      console.error('User authentication failed:', error);
    }
  };

  const signIn = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    }
  };

  const signOut = () => {
    localStorage.removeItem('gcp_token');
    setToken(null);
    setUser(null);
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  const getAuthHeaders = () => {
    if (!token) return {};
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const value = {
    user,
    token,
    loading,
    signIn,
    signOut,
    getAuthHeaders,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
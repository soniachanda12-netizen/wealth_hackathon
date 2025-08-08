import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

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
  const [authError, setAuthError] = useState(null);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true);
      setAuthError(null);

      // First, check if we have a saved token
      const savedToken = localStorage.getItem('gcp_identity_token');
      if (savedToken) {
        console.log('Found saved token, validating...');
        const isValid = await validateToken(savedToken);
        if (isValid) {
          setToken(savedToken);
          setUser({ 
            authenticated: true, 
            email: localStorage.getItem('user_email') || 'demo-advisor@bankingcorp.com',
            name: 'Banking Advisor'
          });
          setTokenValid(true);
          setLoading(false);
          return;
        } else {
          // Clear invalid token
          localStorage.removeItem('gcp_identity_token');
          localStorage.removeItem('user_email');
        }
      }

      // For demo purposes, we'll skip Google services loading 
      // and just show the authentication screen
      console.log('No saved token found, showing authentication screen');
      
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setAuthError('Authentication system initialization failed. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token) => {
    try {
      // Since backend is now public, we'll do a simple connectivity test
      // In production, this should validate the actual Google ID token
      const backendUrl = process.env.REACT_APP_API_URL || 'https://apialchemistproject-backend-608187465720.us-central1.run.app';
      
      const response = await fetch(`${backendUrl}/auth-check`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
          // Note: Removed Authorization header since backend is now public
        }
      });

      if (response.ok) {
        console.log('Backend connectivity successful');
        return true;
      } else {
        console.log('Backend connectivity failed:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Backend connectivity error:', error);
      return false;
    }
  };

  // const loadGoogleScript = () => {
  //   return new Promise((resolve, reject) => {
  //     if (window.google) {
  //       resolve();
  //       return;
  //     }

  //     const script = document.createElement('script');
  //     script.src = 'https://accounts.google.com/gsi/client';
  //     script.async = true;
  //     script.defer = true;
  //     script.onload = resolve;
  //     script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
  //     document.head.appendChild(script);
  //   });
  // };

  // const setupGoogleAuth = () => {
  //   if (!window.google) {
  //     throw new Error('Google Identity Services not loaded');
  //   }

  //   // Use the project's OAuth client ID - update this with your actual client ID
  //   const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '869426294559-2hqgspvo8nqm0h2c8rq1qfn7htvrkfnm.apps.googleusercontent.com';
    
  //   // Initialize Google Sign-In
  //   window.google.accounts.id.initialize({
  //     client_id: clientId,
  //     callback: handleGoogleSignIn,
  //     auto_select: false,
  //     cancel_on_tap_outside: false,
  //     ux_mode: 'popup'
  //   });
  // };

  const handleGoogleSignIn = async (response) => {
    try {
      setLoading(true);
      setAuthError(null);

      // The response.credential contains the ID token
      const idToken = response.credential;
      
      // Decode the token to get user info (for display purposes)
      const payload = JSON.parse(atob(idToken.split('.')[1]));
      const userEmail = payload.email;

      console.log('Google Sign-In successful for:', userEmail);

      // Since backend is public, we just need to verify connectivity
      const isValid = await validateToken(idToken);
      
      if (isValid) {
        // Store the token and user info
        localStorage.setItem('gcp_identity_token', idToken);
        localStorage.setItem('user_email', userEmail);
        
        setToken(idToken);
        setUser({ authenticated: true, email: userEmail });
        setTokenValid(true);
        
        console.log('Authentication successful - redirecting to dashboard');
      } else {
        throw new Error('Backend connectivity failed. Please check your internet connection and try again.');
      }
      
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      setAuthError(error.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const signIn = () => {
    try {
      setAuthError(null);
      setLoading(true);
      
      // For demo purposes, create a mock authentication 
      // In production, this would handle real Google OAuth
      console.log('Starting demo authentication...');
      
      // Simulate a successful authentication
      setTimeout(() => {
        const mockUser = {
          authenticated: true,
          email: 'demo-advisor@bankingcorp.com',
          name: 'Demo Banking Advisor'
        };
        
        // Create a mock token
        const mockToken = 'demo-banking-advisor-token-' + Date.now();
        
        // Store the authentication data
        localStorage.setItem('gcp_identity_token', mockToken);
        localStorage.setItem('user_email', mockUser.email);
        
        // Set authentication state
        setToken(mockToken);
        setUser(mockUser);
        setTokenValid(true);
        setLoading(false);
        
        console.log('Demo authentication successful - loading dashboard');
      }, 1500); // Show loading for 1.5 seconds
      
    } catch (error) {
      console.error('Sign-in error:', error);
      setAuthError('Sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem('gcp_identity_token');
    localStorage.removeItem('user_email');
    setToken(null);
    setUser(null);
    setTokenValid(false);
    setAuthError(null);
    
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  const getAuthHeaders = () => {
    if (!token || !tokenValid) {
      return {
        'Content-Type': 'application/json'
      };
    }
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const value = {
    user,
    token,
    loading,
    authError,
    tokenValid,
    signIn,
    signOut,
    getAuthHeaders,
    isAuthenticated: !!user && tokenValid,
    retryAuth: initializeAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

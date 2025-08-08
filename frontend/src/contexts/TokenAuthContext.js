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

  // Define validateToken first
  const validateToken = async (token) => {
    try {
      // Test backend connectivity instead of validating Google token
      const response = await fetch('https://apialchemistproject-backend-608187465720.us-central1.run.app/auth-check', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Backend connectivity test passed:', data);
        return true;
      } else {
        console.log('Backend connectivity test failed:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Backend connectivity error:', error);
      return false;
    }
  };

  // Define initializeAuth with proper dependencies
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

      // No valid token found - user needs to authenticate
      console.log('No valid token found, user needs to sign in');
      setLoading(false);
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setAuthError('Authentication system initialization failed. Please refresh the page.');
      setLoading(false);
    }
  }, []); // Empty dependency array since validateToken doesn't use state

  // Now we can safely use initializeAuth in useEffect
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Simplified sign-in function for demo authentication
  const signIn = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      
      // Simulate loading time for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create mock user and token for demo
      const mockToken = 'demo-token-' + Date.now();
      const mockUser = {
        authenticated: true,
        email: 'demo-advisor@bankingcorp.com',
        name: 'Banking Advisor'
      };
      
      // Save to localStorage
      localStorage.setItem('gcp_identity_token', mockToken);
      localStorage.setItem('user_email', mockUser.email);
      
      // Update state
      setToken(mockToken);
      setUser(mockUser);
      setTokenValid(true);
      
      console.log('Demo authentication successful');
    } catch (error) {
      console.error('Sign in error:', error);
      setAuthError('Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    setToken(null);
    setTokenValid(false);
    setAuthError(null);
    
    // Clear localStorage
    localStorage.removeItem('gcp_identity_token');
    localStorage.removeItem('user_email');
    
    console.log('User signed out successfully');
  };

  const value = {
    user,
    token,
    loading,
    authError,
    tokenValid,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

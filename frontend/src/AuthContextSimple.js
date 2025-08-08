import React, { createContext, useContext, useEffect, useState } from 'react';

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
  const [advisorData, setAdvisorData] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First, check if we're running in Cloud Run by testing the metadata server
        const isCloudRun = await checkCloudRunEnvironment();
        
        if (isCloudRun) {
          // Get service account identity token for the backend
          const backendUrl = process.env.REACT_APP_API_URL || 'https://apialchemistproject-backend-608187465720.us-central1.run.app';
          const identityToken = await getServiceAccountToken(backendUrl);
          
          if (identityToken) {
            setToken(identityToken);
            setUser({ authenticated: true, serviceAccount: true });
            console.log('Service account authentication successful');
          } else {
            throw new Error('Failed to get service account token');
          }
        } else {
          // Local development - use stored token or require sign in
          const savedToken = localStorage.getItem('gcp_token');
          if (savedToken) {
            setToken(savedToken);
            setUser({ authenticated: true, serviceAccount: false });
          }
          // If no saved token, user will need to sign in manually
        }
      } catch (error) {
        console.log('Service account auth not available:', error.message);
        // Fall back to checking for saved user token
        const savedToken = localStorage.getItem('gcp_token');
        if (savedToken) {
          setToken(savedToken);
          setUser({ authenticated: true, serviceAccount: false });
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const checkCloudRunEnvironment = async () => {
    try {
      // Check if we're on Cloud Run by hostname instead of metadata service
      const isCloudRun = window.location.hostname.includes('run.app');
      console.log('🔍 Environment check - Cloud Run:', isCloudRun);
      return isCloudRun;
    } catch (error) {
      return false;
    }
  };

  const getServiceAccountToken = async (audience) => {
    try {
      const response = await fetch(
        `http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=${encodeURIComponent(audience)}`,
        {
          headers: { 'Metadata-Flavor': 'Google' }
        }
      );
      
      if (response.ok) {
        return await response.text();
      } else {
        throw new Error(`Failed to get token: ${response.status}`);
      }
    } catch (error) {
      console.error('Error getting service account token:', error);
      return null;
    }
  };

  // Function to fetch advisor data by email from BigQuery
  const fetchAdvisorByEmail = async (email) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://apialchemistproject-backend-608187465720.us-central1.run.app';
      console.log('Fetching advisor for email:', email, 'from API:', apiUrl);
      const response = await fetch(`${apiUrl}/advisor-by-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.advisor && result.advisor.advisor_id && result.advisor.advisor_id !== 'ADV001') {
          // Use the advisor from the DB if not default
          console.log('✅ Found advisor in database:', result.advisor);
          setAdvisorData(result.advisor);
          localStorage.setItem('advisor_data', JSON.stringify(result.advisor));
          return result.advisor;
        } else if (result.advisor && result.advisor.advisor_id === 'ADV001') {
          // Only fallback to ADV001 if no other advisor is found
          console.warn('⚠️  Only default advisor (ADV001) found for this email.');
          setAdvisorData(result.advisor);
          localStorage.setItem('advisor_data', JSON.stringify(result.advisor));
          return result.advisor;
        } else {
          throw new Error('Advisor not found in database response');
        }
      } else {
        console.error('API Error:', response.status, response.statusText);
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error fetching advisor data for email:', email, error);
      // Fallback logic unchanged
      try {
        console.log('🔄 Attempting to fetch default advisor (ADV001)...');
        const apiUrl = process.env.REACT_APP_API_URL || 'https://apialchemistproject-backend-608187465720.us-central1.run.app';
        const defaultResponse = await fetch(`${apiUrl}/advisor-by-id`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ advisor_id: "ADV001" })
        });
        if (defaultResponse.ok) {
          const defaultResult = await defaultResponse.json();
          if (defaultResult.advisor) {
            console.log('✅ Using default advisor ID 1:', defaultResult.advisor);
            setAdvisorData(defaultResult.advisor);
            localStorage.setItem('advisor_data', JSON.stringify(defaultResult.advisor));
            return defaultResult.advisor;
          }
        } else {
          console.error('Default advisor API Error:', defaultResponse.status);
        }
      } catch (defaultError) {
        console.error('❌ Error fetching default advisor:', defaultError);
      }
      // Final fallback if database calls fail - use real ADV001 data
      const fallbackAdvisor = {
        advisor_id: 'ADV001',
        full_name: 'John Smith',
        email: 'john.smith@privatebank.com',
        specialization: 'Wealth Management',
        years_experience: 15,
        location: 'New York',
        isDefault: true,
        isFallback: true
      };
      console.log('⚠️  Using hardcoded fallback advisor (ADV001 - John Smith):', fallbackAdvisor);
      setAdvisorData(fallbackAdvisor);
      localStorage.setItem('advisor_data', JSON.stringify(fallbackAdvisor));
      return fallbackAdvisor;
    }
  };

  // Enhanced sign-in with Google OAuth to capture email
  const signInWithGoogle = () => {
    return new Promise((resolve, reject) => {
      // COMPREHENSIVE EXCEPTION HANDLING: Multiple fallback layers
      
      try {
        // Try Google OAuth first - this should work on both local and Cloud Run
        console.log('🔄 Attempting Google OAuth authentication...');
        handleGoogleOAuth(resolve, reject);
        
      } catch (globalError) {
        console.error('❌ CRITICAL: Global authentication error:', globalError);
        handleFallbackAuthentication(resolve, 'Global error occurred');
      }
    });
  };

  // Demo authentication handler with fallbacks
  const handleDemoAuthentication = (resolve) => {
    try {
      // Use ADV001 (John Smith) as default instead of Sarah Johnson
      const demoUserEmail = 'john.smith@privatebank.com';
      const demoUser = {
        email: demoUserEmail,
        name: 'John Smith',
        credential: 'demo_token_' + Date.now()
      };
      
      localStorage.setItem('gcp_token', demoUser.credential);
      localStorage.setItem('user_email', demoUser.email);
      localStorage.setItem('user_name', demoUser.name);
      
      setToken(demoUser.credential);
      setUser({
        authenticated: true,
        email: demoUser.email,
        name: demoUser.name,
        serviceAccount: false
      });
      
      // Fetch real advisor data from database based on email
      fetchAdvisorByEmail(demoUserEmail)
        .then((advisor) => {
          console.log('✅ Demo authentication successful with advisor:', advisor?.name);
          resolve({
            email: demoUser.email,
            name: demoUser.name,
            advisor: advisor
          });
        })
        .catch((error) => {
          console.error('⚠️  Demo advisor fetch failed, using fallback:', error);
          handleFallbackAuthentication(resolve, 'Demo advisor fetch failed');
        });
        
    } catch (demoError) {
      console.error('❌ Demo authentication failed:', demoError);
      handleFallbackAuthentication(resolve, 'Demo authentication failed');
    }
  };

  // Google OAuth handler with comprehensive error handling
  const handleGoogleOAuth = (resolve, reject) => {
    try {
      // Set a timeout to fallback if Google OAuth doesn't respond
      const oauthTimeout = setTimeout(() => {
        console.warn('⏰ Google OAuth timeout - falling back to default authentication');
        handleFallbackAuthentication(resolve, 'OAuth timeout');
      }, 10000); // 10 second timeout

      if (!window.google) {
        // Load Google Identity Services
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = () => {
          clearTimeout(oauthTimeout);
          initializeGoogleAuth(resolve, reject);
        };
        script.onerror = () => {
          clearTimeout(oauthTimeout);
          console.error('❌ Failed to load Google Identity Services script');
          handleFallbackAuthentication(resolve, 'Google script load failed');
        };
        document.head.appendChild(script);
      } else {
        clearTimeout(oauthTimeout);
        initializeGoogleAuth(resolve, reject);
      }
    } catch (oauthError) {
      console.error('❌ Google OAuth setup error:', oauthError);
      handleFallbackAuthentication(resolve, 'OAuth setup error');
    }
  };

  // Initialize Google Auth with error handling
  const initializeGoogleAuth = (resolve, reject) => {
    try {
      window.google.accounts.id.initialize({
        client_id: '608187465720-e05scpovhq83mkose0ucmarghctejqdg.apps.googleusercontent.com',
        callback: async (response) => {
          try {
            console.log('🔄 Processing Google authentication response...');
            
            // Decode JWT to get user info
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            const userEmail = payload.email;
            const userName = payload.name;

            // Store user token and email
            localStorage.setItem('gcp_token', response.credential);
            localStorage.setItem('user_email', userEmail);
            localStorage.setItem('user_name', userName);

            setToken(response.credential);
            setUser({
              authenticated: true,
              email: userEmail,
              name: userName,
              serviceAccount: false
            });

            // Fetch advisor data from BigQuery based on email
            try {
              const advisor = await fetchAdvisorByEmail(userEmail);
              console.log('✅ Google authentication successful with advisor:', advisor?.name);
              
              resolve({
                email: userEmail,
                name: userName,
                advisor: advisor
              });
            } catch (advisorError) {
              console.error('⚠️  Advisor fetch failed after Google auth, using fallback:', advisorError);
              // Still resolve with user data, advisor will be fallback
              resolve({
                email: userEmail,
                name: userName,
                advisor: null
              });
            }
            
          } catch (callbackError) {
            console.error('❌ Error processing Google sign-in callback:', callbackError);
            handleFallbackAuthentication(resolve, 'Google callback processing failed');
          }
        },
        error_callback: (error) => {
          console.error('❌ Google OAuth error callback:', error);
          handleFallbackAuthentication(resolve, `Google OAuth error: ${error?.type || 'unknown'}`);
        },
        auto_select: false,
      });

      // Try to show the prompt, with fallback if it fails
      try {
        window.google.accounts.id.prompt((notification) => {
          console.log('Google OAuth prompt notification:', notification);
          
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Show the One Tap UI manually
            try {
              const buttonElement = document.getElementById('google-signin-button');
              if (buttonElement) {
                window.google.accounts.id.renderButton(buttonElement, {
                  type: 'standard',
                  size: 'large',
                  text: 'signin_with',
                  theme: 'outline',
                  logo_alignment: 'left',
                });
                console.log('✅ Google sign-in button rendered successfully');
              } else {
                console.warn('⚠️  Google sign-in button element not found');
              }
            } catch (renderError) {
              console.error('❌ Error rendering Google sign-in button:', renderError);
            }
          }
        });
      } catch (promptError) {
        console.error('❌ Error showing Google OAuth prompt:', promptError);
        handleFallbackAuthentication(resolve, 'Google prompt failed');
      }
      
    } catch (initError) {
      console.error('❌ Error initializing Google OAuth:', initError);
      handleFallbackAuthentication(resolve, 'Google OAuth initialization failed');
    }
  };

  // Ultimate fallback authentication - always succeeds
  const handleFallbackAuthentication = async (resolve, reason) => {
    console.log('🛡️  FALLBACK AUTHENTICATION ACTIVATED - Reason:', reason);
    
    try {
      // Use ADV001 user info as fallback instead of generic fallback
      const fallbackUser = {
        email: 'john.smith@privatebank.com', // Use ADV001 email
        name: 'John Smith', // Use ADV001 name
        credential: 'fallback_token_' + Date.now()
      };
      
      localStorage.setItem('gcp_token', fallbackUser.credential);
      localStorage.setItem('user_email', fallbackUser.email);
      localStorage.setItem('user_name', fallbackUser.name);
      
      setToken(fallbackUser.credential);
      setUser({
        authenticated: true,
        email: fallbackUser.email,
        name: fallbackUser.name,
        serviceAccount: false,
        isFallback: true
      });
      
      // **FIRST TRY: Fetch advisor ADV001 from database**
      try {
        console.log('🔄 FALLBACK: Attempting to fetch advisor ADV001 from database...');
        const apiUrl = process.env.REACT_APP_API_URL || 'https://apialchemistproject-backend-608187465720.us-central1.run.app';
        
        const response = await fetch(`${apiUrl}/advisor-by-id`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ advisor_id: "ADV001" })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.advisor) {
            console.log('✅ FALLBACK SUCCESS: Using advisor ADV001 from database:', result.advisor);
            setAdvisorData(result.advisor);
            localStorage.setItem('advisor_data', JSON.stringify(result.advisor));
            
            resolve({
              email: fallbackUser.email,
              name: fallbackUser.name,
              advisor: result.advisor,
              isFallback: true,
              fallbackReason: reason,
              advisorSource: 'Database advisor ADV001'
            });
            return;
          }
        }
        console.warn('⚠️  Could not fetch advisor ID 1 from database, using hardcoded fallback');
      } catch (dbError) {
        console.warn('⚠️  Database unavailable for advisor ID 1, using hardcoded fallback:', dbError);
      }
      
      // **SECOND TRY: Use hardcoded fallback advisor only if database fails**
      const fallbackAdvisor = {
        advisor_id: 'ADV001',
        full_name: 'John Smith',
        email: 'john.smith@privatebank.com',
        specialization: 'Wealth Management',
        years_experience: 15,
        location: 'New York',
        isDefault: true,
        isFallback: true,
        isHardcoded: true
      };
      
      setAdvisorData(fallbackAdvisor);
      localStorage.setItem('advisor_data', JSON.stringify(fallbackAdvisor));
      
      console.log('✅ HARDCODED FALLBACK SUCCESSFUL: ADV001 - John Smith');
      
      resolve({
        email: fallbackUser.email,
        name: fallbackUser.name,
        advisor: fallbackAdvisor,
        isFallback: true,
        fallbackReason: reason,
        advisorSource: 'Hardcoded ADV001 - John Smith'
      });
      
    } catch (fallbackError) {
      console.error('❌ CRITICAL: Even fallback authentication failed!', fallbackError);
      // Last resort - minimal authentication
      resolve({
        email: 'emergency@privatebank.com',
        name: 'Emergency User',
        advisor: {
          advisor_id: 'EMERGENCY',
          name: 'Emergency Advisor',
          email: 'emergency@privatebank.com',
          isEmergency: true
        },
        isEmergency: true,
        fallbackReason: 'All authentication methods failed',
        advisorSource: 'Emergency mode'
      });
    }
  };

  // Manual sign-in for development/testing
  const signInWithToken = (idToken) => {
    localStorage.setItem('gcp_token', idToken);
    setToken(idToken);
    setUser({ authenticated: true, serviceAccount: false });
  };

  const signOut = () => {
    localStorage.removeItem('gcp_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_name');
    localStorage.removeItem('advisor_data');
    setToken(null);
    setUser(null);
    setAdvisorData(null);
  };

  const getAuthHeaders = () => {
    if (!token) return { 'Content-Type': 'application/json' };
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Initialize with saved data on load
  useEffect(() => {
    const savedAdvisor = localStorage.getItem('advisor_data');
    const savedEmail = localStorage.getItem('user_email');
    
    if (savedAdvisor) {
      setAdvisorData(JSON.parse(savedAdvisor));
    } else if (savedEmail) {
      // Re-fetch advisor data if we have email but no advisor data
      fetchAdvisorByEmail(savedEmail);
    }
  }, [user]);

  const value = {
    user,
    token,
    loading,
    advisorData,
    signInWithToken,
    signInWithGoogle,
    signOut,
    getAuthHeaders,
    fetchAdvisorByEmail,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

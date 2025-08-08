// api.js - helper for backend API calls with authentication and advisor context

const API_BASE = process.env.REACT_APP_API_URL || 'https://apialchemistproject-backend-608187465720.us-central1.run.app';

// Helper function to get auth headers with advisor context
const getAuthHeaders = () => {
  const token = localStorage.getItem('gcp_token');
  const advisorData = localStorage.getItem('advisor_data');
  const userEmail = localStorage.getItem('user_email');
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (advisorData) {
    const advisor = JSON.parse(advisorData);
    headers['X-Advisor-ID'] = advisor.advisor_id;
    headers['X-Advisor-Email'] = advisor.email;
  }
  
  if (userEmail) {
    headers['X-User-Email'] = userEmail;
  }
  
  return headers;
};

// Helper function to get current advisor ID
const getCurrentAdvisorId = () => {
  const advisorData = localStorage.getItem('advisor_data');
  if (advisorData) {
    const advisor = JSON.parse(advisorData);
    return advisor.advisor_id;
  }
  return 'ADV001'; // Default advisor
};

// Helper function to handle API responses with better error messages
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMessage += ` - ${errorData.detail}`;
      }
    } catch (e) {
      // Response might not be JSON
    }
    
    if (response.status === 401 || response.status === 403) {
      errorMessage += ' - Please check your authentication token';
      // Clear invalid token
      localStorage.removeItem('gcp_token');
      localStorage.removeItem('user_email');
    }
    
    throw new Error(errorMessage);
  }
  return response.json();
};

export async function fetchTodo() {
  const advisorId = getCurrentAdvisorId();
  const res = await fetch(`${API_BASE}/todo?advisor_id=${advisorId}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

export async function fetchNBA() {
  const advisorId = getCurrentAdvisorId();
  const res = await fetch(`${API_BASE}/nba?advisor_id=${advisorId}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

export async function draftMessage(data) {
  const res = await fetch(`${API_BASE}/draft-message`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}

export async function createCalendarInvite(data) {
  const res = await fetch(`${API_BASE}/calendar-invite`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}

export async function summarize(data) {
  const res = await fetch(`${API_BASE}/summarize`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}

export async function ingestData(data) {
  const res = await fetch(`${API_BASE}/ingest-data`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}

export async function fetchClients() {
  const advisorId = getCurrentAdvisorId();
  const res = await fetch(`${API_BASE}/clients?advisor_id=${advisorId}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}


// Optionally pass clientId for per-client analytics
export async function fetchAggregation(clientId) {
  const advisorId = getCurrentAdvisorId();
  let url = `${API_BASE}/aggregation?advisor_id=${advisorId}`;
  if (clientId) {
    url += `&client_id=${clientId}`;
  }
  const res = await fetch(url, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

export async function chat(data) {
  const advisorId = getCurrentAdvisorId();
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      ...data,
      advisor_id: advisorId
    })
  });
  return handleResponse(res);
}

export async function fetchDashboardMetrics() {
  const res = await fetch(`${API_BASE}/dashboard-metrics`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

export async function fetchLookerIntegration() {
  const res = await fetch(`${API_BASE}/looker-integration`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

export async function fetchAIInsights() {
  const res = await fetch(`${API_BASE}/ai-insights`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

const configuredApiUrl = import.meta.env.VITE_API_URL;
const hostname = window.location.hostname;
const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
const isDevTunnel = hostname.endsWith('.devtunnels.ms');
const API_URL = isDevTunnel
  ? '/api'
  : configuredApiUrl || (isLocalhost ? 'http://localhost:5000/api' : '/api');

export const fetchApi = async (endpoint, options = {}) => {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    // This ensures our HTTP-only JWT cookie is sent with every request
    credentials: 'include', 
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'API request failed');
  }
  
  return res.json();
};
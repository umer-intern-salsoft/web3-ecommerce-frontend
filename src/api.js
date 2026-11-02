const API_URL = import.meta.env.VITE_API_URL;

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
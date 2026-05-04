export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://whisperbox.koyeb.app";

const apiFetch = async (path: string, opts: RequestInit = {}, token: string | null = null) => {
  const headers: Record<string, string> = { 
    "Content-Type": "application/json",
    ...((opts.headers as Record<string, string>) || {})
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, { 
    ...opts, 
    headers 
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Handle FastAPI style validation errors (422)
    if (response.status === 422 && Array.isArray(errorData.detail)) {
      const detail = errorData.detail[0];
      const field = detail.loc?.[detail.loc.length - 1] || "field";
      const message = detail.msg || "validation error";
      throw new Error(`Validation Error (${field}): ${message}`);
    }

    // Try to extract detail, error, or message from the response
    const errorMessage = typeof errorData.detail === 'string' 
      ? errorData.detail 
      : errorData.error || errorData.message || `Server error ${response.status}`;
      
    throw new Error(errorMessage);
  }

  return response.json();
};

export const ApiService = {
  BASE_URL,
  register: (data: any) => 
    apiFetch("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    
  login: (data: any) => 
    apiFetch("/auth/login", { method: "POST", body: JSON.stringify(data) }),
    
  refresh: (refreshToken: string) => 
    apiFetch("/auth/refresh", { method: "POST", body: JSON.stringify({ refresh_token: refreshToken }) }),
    
  logout: (token: string | null, refreshToken: string | null) => 
    apiFetch("/auth/logout", { method: "POST", body: JSON.stringify({ refresh_token: refreshToken }) }, token),
    
  search: (query: string, token: string | null) => 
    apiFetch(`/users/search?q=${encodeURIComponent(query)}`, {}, token),
    
  getPublicKey: (userId: string, token: string | null) => 
    apiFetch(`/users/${userId}/public-key`, {}, token),
    
  getConversations: (token: string | null) => 
    apiFetch("/conversations", {}, token),
    
  getMessages: (userId: string, token: string | null, before?: string) =>
    apiFetch(`/conversations/${userId}/messages?limit=50${before ? `&before=${before}` : ""}`, {}, token),
    
  sendMessage: (data: any, token: string | null) => 
    apiFetch("/messages", { method: "POST", body: JSON.stringify(data) }, token),
};

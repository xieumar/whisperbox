export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://whisperbox.koyeb.app";

let _tokenUpdateCallback: ((newToken: string) => void) | null = null;

export function registerTokenUpdater(callback: (newToken: string) => void) {
  _tokenUpdateCallback = callback;
}

let _refreshPromise: Promise<string> | null = null;

async function doRefresh(): Promise<string> {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    const rt = localStorage.getItem("wb_rt");
    if (!rt) throw new Error("No refresh token available");

    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: rt }),
    });

    if (!response.ok) {
      localStorage.clear();
      window.location.href = "/login";
      throw new Error("Session expired");
    }

    const data = await response.json();
    const newToken = data.access_token;

    localStorage.setItem("wb_at", newToken);
    if (data.refresh_token) {
      localStorage.setItem("wb_rt", data.refresh_token);
    }

    if (_tokenUpdateCallback) {
      _tokenUpdateCallback(newToken);
    }

    return newToken;
  })();

  try {
    return await _refreshPromise;
  } finally {
    _refreshPromise = null;
  }
}

const apiFetch = async (path: string, opts: RequestInit = {}, token: string | null = null, _retried = false) => {
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
    
    if (response.status === 401 && !_retried && token) {
      try {
        const newToken = await doRefresh();
        return apiFetch(path, opts, newToken, true);
      } catch (refreshErr: any) {
        throw refreshErr;
      }
    }
    
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

const BASE = "https://whisperbox.koyeb.app";

const apiFetch = async (path: string, opts: RequestInit = {}, tok: string | null = null) => {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (tok) h.Authorization = `Bearer ${tok}`;
    const r = await fetch(BASE + path, { ...opts, headers: { ...h, ...(opts.headers || {}) } });
    if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.detail || `Server error ${r.status}`);
    }
    return r.json();
};

export const API = {
    register: (d: any) => apiFetch("/auth/register", { method: "POST", body: JSON.stringify(d) }),
    login: (d: any) => apiFetch("/auth/login", { method: "POST", body: JSON.stringify(d) }),
    refresh: (rt: string) => apiFetch("/auth/refresh", { method: "POST", body: JSON.stringify({ refresh_token: rt }) }),
    logout: (t: string | null, rt: string | null) => apiFetch("/auth/logout", { method: "POST", body: JSON.stringify({ refresh_token: rt }) }, t),
    search: (q: string, t: string | null) => apiFetch(`/users/search?q=${encodeURIComponent(q)}`, {}, t),
    pubkey: (id: string, t: string | null) => apiFetch(`/users/${id}/public-key`, {}, t),
    convos: (t: string | null) => apiFetch("/conversations", {}, t),
    messages: (id: string, t: string | null, before?: string) =>
        apiFetch(`/conversations/${id}/messages?limit=50${before ? `&before=${before}` : ""}`, {}, t),
    send: (d: any, t: string | null) => apiFetch("/messages", { method: "POST", body: JSON.stringify(d) }, t),
};
// API client for the Design CRM frontend. One place for the base URL, the auth
// token, and every backend endpoint. Set VITE_API_URL to point at the backend
// (defaults to http://localhost:5006/api for local dev).
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5006/api';

const TOKEN_KEY = 'design_crm_token';
const USER_KEY = 'design_crm_user';

// "Remember Me": when checked the session is stored in localStorage (survives
// browser/tab close); when unchecked it goes to sessionStorage (cleared when the
// tab/browser closes). Reads check both so either kind of session works.
export const getToken = () => { try { return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY); } catch { return null; } };
export const getUser = () => { try { return JSON.parse(localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY) || 'null'); } catch { return null; } };
export const setSession = (token, user, remember = true) => {
  try {
    const store = remember ? localStorage : sessionStorage;
    const other = remember ? sessionStorage : localStorage;
    other.removeItem(TOKEN_KEY); other.removeItem(USER_KEY);   // avoid a stale copy in the other store
    store.setItem(TOKEN_KEY, token); store.setItem(USER_KEY, JSON.stringify(user || null));
  } catch { /* ignore */ }
};
export const clearSession = () => {
  try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); sessionStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(USER_KEY); } catch { /* ignore */ }
};
export const isAuthenticated = () => !!getToken();

// Core request helper. Attaches the bearer token, parses JSON, throws on !ok.
export async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error('Cannot reach the server. Please check your connection and that the backend is running.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) clearSession();
    const e = new Error(data.message || 'Request failed.');
    e.status = res.status; e.details = data.details;
    throw e;
  }
  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  login: async (email, password, remember = true) => {
    const data = await api('/auth/login', { method: 'POST', body: { email, password } });
    if (data.token) setSession(data.token, data.user, remember);
    return data;
  },
  me: () => api('/auth/me'),
  updateMe: (payload) => api('/auth/me', { method: 'PUT', body: payload }),
  changePassword: (payload) => api('/auth/password', { method: 'PUT', body: payload }),
  listUsers: () => api('/auth/users'),
  createUser: (payload) => api('/auth/users', { method: 'POST', body: payload }),
  updateUser: (id, payload) => api(`/auth/users/${encodeURIComponent(id)}`, { method: 'PUT', body: payload }),
  resetUserPassword: (id, newPassword) => api(`/auth/users/${encodeURIComponent(id)}/password`, { method: 'PUT', body: { newPassword } }),
  setUserActive: (id, isActive) => api(`/auth/users/${encodeURIComponent(id)}/active`, { method: 'PUT', body: { isActive } }),
  deleteUser: (id) => api(`/auth/users/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  logout: () => clearSession(),
};

// ── Generic resource factory (list/get/create/update/remove) ────────────────
const resource = (base) => ({
  list: (params) => api(base + (params ? `?${new URLSearchParams(params)}` : '')),
  get: (id) => api(`${base}/${encodeURIComponent(id)}`),
  create: (payload) => api(base, { method: 'POST', body: payload }),
  update: (id, payload) => api(`${base}/${encodeURIComponent(id)}`, { method: 'PUT', body: payload }),
  remove: (id) => api(`${base}/${encodeURIComponent(id)}`, { method: 'DELETE' }),
});

// ── Requests (with workflow actions) ────────────────────────────────────────
export const requestsApi = {
  ...resource('/requests'),
  assign: (id, payload) => api(`/requests/${encodeURIComponent(id)}/assign`, { method: 'POST', body: payload }),
  setDesigner: (id, body) => api(`/requests/${encodeURIComponent(id)}/designer`, { method: 'PUT', body: body || {} }),
  setStatus: (id, status, note) => api(`/requests/${encodeURIComponent(id)}/status`, { method: 'PUT', body: { status, note } }),
  addComment: (id, payload) => api(`/requests/${encodeURIComponent(id)}/comments`, { method: 'POST', body: payload }),
  saveRequirement: (id, payload) => api(`/requests/${encodeURIComponent(id)}/requirement`, { method: 'PUT', body: payload }),
  addAttachment: (id, payload) => api(`/requests/${encodeURIComponent(id)}/attachments`, { method: 'POST', body: payload }),
  approve: (id, feedback) => api(`/requests/${encodeURIComponent(id)}/approve`, { method: 'POST', body: { feedback: feedback || '' } }),
  reject: (id, reason) => api(`/requests/${encodeURIComponent(id)}/reject`, { method: 'POST', body: { reason } }),
  requestChanges: (id, remarks) => api(`/requests/${encodeURIComponent(id)}/request-changes`, { method: 'POST', body: { remarks } }),
  project: (id) => api(`/requests/${encodeURIComponent(id)}/project`), // live project details from Procurement
  mine: () => api('/requests/mine'), // requests assigned to the logged-in team member
  submitForApproval: (id, payload) => api(`/requests/${encodeURIComponent(id)}/submit`, { method: 'POST', body: payload || {} }),
};

export const designersApi = {
  ...resource('/designers'),
  requests: (id) => api(`/designers/${encodeURIComponent(id)}/requests`),
};
export const boqsApi = resource('/boqs');
export const submittalsApi = {
  ...resource('/submittals'),
  setStatus: (id, status) => api(`/submittals/${encodeURIComponent(id)}/status`, { method: 'PUT', body: { status } }),
};
export const drawingsApi = resource('/drawings');
export const documentsApi = resource('/documents');
export const revisionsApi = resource('/revisions');

export const activitiesApi = {
  list: (limit = 50) => api(`/activities?limit=${limit}`),
  create: (payload) => api('/activities', { method: 'POST', body: payload }),
};

export const notificationsApi = {
  list: (audience) => api(`/notifications${audience ? `?audience=${audience}` : ''}`),
  create: (payload) => api('/notifications', { method: 'POST', body: payload }),
  markRead: (id, read = true) => api(`/notifications/${encodeURIComponent(id)}/read`, { method: 'PUT', body: { read } }),
  markAllRead: (audience) => api(`/notifications/read-all${audience ? `?audience=${audience}` : ''}`, { method: 'PUT' }),
  remove: (id) => api(`/notifications/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};

export const statsApi = {
  head: () => api('/stats/head'),
  team: (designer) => api(`/stats/team${designer ? `?designer=${encodeURIComponent(designer)}` : ''}`),
};

// ── Files (stored in MongoDB) ───────────────────────────────────────────────
const readAsBase64 = (file) => new Promise((resolve, reject) => {
  const fr = new FileReader();
  fr.onerror = () => reject(new Error('Could not read the file.'));
  fr.onload = () => resolve(String(fr.result || '').split(',').pop());
  fr.readAsDataURL(file);
});

export const filesApi = {
  // Upload a File object; returns { fileId, name, type, size }.
  upload: async (file, { entity = '', entityId = '', uploadedBy = '' } = {}) => {
    const dataBase64 = await readAsBase64(file);
    return api('/files', { method: 'POST', body: { entity, entityId, name: file.name, type: file.type || '', size: file.size, uploadedBy, dataBase64 } });
  },
  list: (entity, entityId) => api(`/files?${new URLSearchParams({ ...(entity ? { entity } : {}), ...(entityId ? { entityId } : {}) })}`),
  url: (fileId, { download = false } = {}) => `${API_BASE}/files/${encodeURIComponent(fileId)}${download ? '?download=1' : ''}`,
  // Fetch bytes WITH auth as a blob, then open or download (so the token is sent).
  blob: async (fileId, { download = false } = {}) => {
    const res = await fetch(`${API_BASE}/files/${encodeURIComponent(fileId)}${download ? '?download=1' : ''}`, { headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {} });
    if (!res.ok) throw new Error('Could not load the file.');
    return res.blob();
  },
  open: async (fileId, name) => {
    try {
      const blob = await filesApi.blob(fileId, { download: false });
      const href = URL.createObjectURL(blob);
      window.open(href, '_blank', 'noopener');
      setTimeout(() => URL.revokeObjectURL(href), 60000);
    } catch (e) { alert(e.message || 'Could not open the file.'); }
  },
  download: async (fileId, name) => {
    try {
      const blob = await filesApi.blob(fileId, { download: true });
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href; a.download = name || 'file';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(href), 2000);
    } catch (e) { alert(e.message || 'Could not download the file.'); }
  },
  remove: (fileId) => api(`/files/${encodeURIComponent(fileId)}`, { method: 'DELETE' }),
};

export { API_BASE };

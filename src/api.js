// In development, Vite proxy forwards these to http://localhost:5001
// In production, set VITE_API_URL to your deployed backend URL
const RAILWAY_BACKEND = 'https://facial-recognition-backend-production.up.railway.app';
export const API_BASE = import.meta.env.VITE_API_URL || RAILWAY_BACKEND;

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const getStatus       = ()     => request('/status');
export const getKnownFaces   = ()     => request('/known_faces');
export const getDetectionLog = ()     => request('/detection_log');
export const removeFace = (name, token) => request(`/remove_face/${encodeURIComponent(name)}`, { 
  method: 'DELETE',
  headers: { 'Authorization': `Bearer ${token}` }
});

export async function adminLogin(password) {
  return request('/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
}

export async function registerFace(name, imageFile) {
  const form = new FormData();
  form.append('name', name);
  form.append('image', imageFile);
  return request('/register_face', { method: 'POST', body: form });
}

export async function detectFaces(base64Image) {
  return request('/detect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image })
  });
}

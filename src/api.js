// In development, Vite proxy forwards these to http://localhost:5000
// In production, set VITE_API_URL to your deployed Flask URL
export const API_BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const getStatus       = ()     => request('/status');
export const getKnownFaces   = ()     => request('/known_faces');
export const getDetectionLog = ()     => request('/detection_log');
export const removeFace      = (name) => request(`/remove_face/${encodeURIComponent(name)}`, { method: 'DELETE' });

export async function registerFace(name, imageFile) {
  const form = new FormData();
  form.append('name', name);
  form.append('image', imageFile);
  return request('/register_face', { method: 'POST', body: form });
}

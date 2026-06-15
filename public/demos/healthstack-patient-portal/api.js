/**
 * HealthStack API client
 * All calls go to https://api.michaelwegter.com/healthstack
 */

const BASE = 'https://api.michaelwegter.com/healthstack';

function authHeaders() {
  const token = localStorage.getItem('hs_token');
  return token
    ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({ error: 'Invalid response' }));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export async function login(email, password) {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse(res);
  // Persist session
  localStorage.setItem('hs_token', data.token);
  localStorage.setItem('hs_role', data.role);
  localStorage.setItem('hs_name', data.name);
  return data;
}

export function logout() {
  localStorage.removeItem('hs_token');
  localStorage.removeItem('hs_role');
  localStorage.removeItem('hs_name');
}

export function getSession() {
  const token = localStorage.getItem('hs_token');
  const role  = localStorage.getItem('hs_role');
  const name  = localStorage.getItem('hs_name');
  return token ? { token, role, name } : null;
}

export async function getServices() {
  const res = await fetch(`${BASE}/services`);
  return handleResponse(res);
}

export async function bookSlot(providerId, slot) {
  const res = await fetch(`${BASE}/book`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ provider_id: providerId, slot }),
  });
  return handleResponse(res);
}

export async function checkout(bookingId, cardLast4) {
  const res = await fetch(`${BASE}/checkout`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ booking_id: bookingId, card_last4: cardLast4 }),
  });
  return handleResponse(res);
}

export async function getPatientDashboard() {
  const res = await fetch(`${BASE}/dashboard/patient`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function getAdminDashboard() {
  const res = await fetch(`${BASE}/dashboard/admin`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function uploadFile(file) {
  const form = new FormData();
  form.append('file', file);
  const token = localStorage.getItem('hs_token');
  const res = await fetch(`${BASE}/upload`, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: form,
  });
  return handleResponse(res);
}

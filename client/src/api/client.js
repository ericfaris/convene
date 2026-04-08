const BASE = '/api/events';

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export function createEvent(body) {
  return request(BASE, { method: 'POST', body: JSON.stringify(body) });
}

export function getEvent(participantToken) {
  return request(`${BASE}/${participantToken}`);
}

export function getAdminDashboard(adminToken) {
  return request(`${BASE}/${adminToken}/admin`);
}

export function getSummary(participantToken) {
  return request(`${BASE}/${participantToken}/summary`);
}

export function submitResponse(participantToken, body) {
  return request(`${BASE}/${participantToken}/respond`, {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

export function finalizeEvent(adminToken, body) {
  return request(`${BASE}/${adminToken}/finalize`, {
    method: 'PATCH',
    body: JSON.stringify(body)
  });
}

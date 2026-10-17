/** A consistent JSON request helper for every frontend page. */
export async function request(action, body, method = 'POST', params = {}) {
  const query = new URLSearchParams({ action, ...params });
  const response = await fetch(`/api/?${query}`, {
    method,
    credentials: 'same-origin',
    headers: method === 'GET' ? {} : { 'Content-Type': 'application/json' },
    body: method === 'GET' ? undefined : JSON.stringify(body || {}),
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw Error('Could not connect to the server. Please try again.');
  }

  if (!response.ok) throw Error(data.error || 'Something went wrong');
  return data;
}

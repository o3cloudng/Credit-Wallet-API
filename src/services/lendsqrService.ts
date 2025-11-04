import fetch from 'node-fetch';

const API_URL = process.env.LENDSQR_API_URL;
const API_KEY = process.env.LENDSQR_API_KEY;

export async function isBlacklistedByLendsqr(email: string): Promise<boolean> {
  if (!API_URL || !API_KEY) return false; // fail-open for dev
  const url = `${API_URL}?email=${encodeURIComponent(email)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${API_KEY}`, Accept: 'application/json' } });
  if (!res.ok) return false;
  const data: any = await res.json();
  if (Array.isArray(data)) return data.length > 0;
  return data.blacklisted === true;
}

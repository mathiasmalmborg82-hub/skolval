// Minimal Supabase REST client (no dependencies). Runs only on the server with the
// service-role key, so the tables can keep RLS on with no public policies.
const BASE = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function sb(path, opts = {}) {
  const res = await fetch(`${BASE}/rest/v1/${path}`, {
    method: opts.method || "GET",
    headers: Object.assign({
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    }, opts.headers || {}),
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`supabase ${res.status}: ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
}

module.exports = { sb };

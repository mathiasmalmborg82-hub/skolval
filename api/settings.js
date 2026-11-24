const { requireAuth } = require("../lib/auth");
const { sb } = require("../lib/supabase");

// Settings live in skolval_settings: "profile" holds Charlie's merit value (editable from the
// page), "origin" holds the home address and coordinates travel is measured from. The home
// address is kept in the database, not in this public repository.
module.exports = async (req, res) => {
  if (!requireAuth(req, res)) return;
  res.setHeader("Cache-Control", "no-store");
  try {
    if (req.method === "GET") {
      const rows = await sb("skolval_settings?select=key,value&key=in.(profile,origin)");
      const by = Object.fromEntries(rows.map(r => [r.key, r.value]));
      return res.status(200).json(Object.assign({}, by.profile || {}, by.origin ? { origin: by.origin } : {}));
    }
    if (req.method === "PUT") {
      const m = req.body && req.body.merit;
      const merit = typeof m === "number" && isFinite(m) && m > 0 && m <= 340 ? m : null;
      await sb("skolval_settings?on_conflict=key", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates" },
        body: { key: "profile", value: { merit }, updated_at: new Date().toISOString() },
      });
      return res.status(204).end();
    }
    res.status(405).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "storage error" });
  }
};

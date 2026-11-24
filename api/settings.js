const { requireAuth } = require("../lib/auth");
const { sb } = require("../lib/supabase");

module.exports = async (req, res) => {
  if (!requireAuth(req, res)) return;
  res.setHeader("Cache-Control", "no-store");
  try {
    if (req.method === "GET") {
      const rows = await sb("skolval_settings?select=value&key=eq.profile");
      return res.status(200).json(rows[0] ? rows[0].value : {});
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

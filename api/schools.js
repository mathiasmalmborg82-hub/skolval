const crypto = require("crypto");
const { requireAuth } = require("../lib/auth");
const { sb } = require("../lib/supabase");
const { clean } = require("../lib/fields");

module.exports = async (req, res) => {
  if (!requireAuth(req, res)) return;
  res.setHeader("Cache-Control", "no-store");
  try {
    if (req.method === "GET") {
      const rows = await sb("skolval_schools?select=id,data&order=id");
      return res.status(200).json(rows.map(r => Object.assign({ id: r.id }, r.data)));
    }
    if (req.method === "POST") {
      const data = Object.assign({ fav: 0, visited: false, comment: "" }, clean(req.body));
      if (!data.name) return res.status(400).json({ error: "name required" });
      const id = data.name.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40)
        + "-" + crypto.randomBytes(3).toString("hex");
      await sb("skolval_schools", { method: "POST", body: { id, data } });
      return res.status(201).json(Object.assign({ id }, data));
    }
    if (req.method === "PATCH") {
      const id = String(req.query.id || "");
      const patch = clean(req.body);
      if (!id || !Object.keys(patch).length) return res.status(400).json({ error: "bad request" });
      await sb("rpc/skolval_patch_school", { method: "POST", body: { p_id: id, p_patch: patch } });
      return res.status(204).end();
    }
    res.status(405).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "storage error" });
  }
};

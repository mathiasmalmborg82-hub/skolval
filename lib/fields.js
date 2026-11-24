// Which fields the page may write, and simple type checks, so the API never stores
// arbitrary data.
const FIELDS = {
  name: "string", area: "string", track: "string", type: "string", addr: "string",
  min: "number", avg: "number", travel: "number", lat: "number", lng: "number",
  year: "string", src: "string", oh: "string", ohSrc: "string", comment: "string",
  fav: "number", visited: "boolean", hidden: "boolean", url: "string",
};

function clean(input) {
  const out = {};
  if (!input || typeof input !== "object") return out;
  for (const [k, t] of Object.entries(FIELDS)) {
    if (!(k in input)) continue;
    const v = input[k];
    if (v === null && t === "number") out[k] = null;
    else if (t === "string" && typeof v === "string") out[k] = v.slice(0, 4000);
    else if (t === "number" && typeof v === "number" && isFinite(v)) out[k] = v;
    else if (t === "boolean" && typeof v === "boolean") out[k] = v;
  }
  return out;
}

module.exports = { clean };

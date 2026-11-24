// Family-password protection: one shared password (SITE_PASSWORD on Vercel).
// After login the browser gets an HttpOnly cookie holding an HMAC derived from the
// password, so changing SITE_PASSWORD logs everyone out.
const crypto = require("crypto");

const COOKIE = "skolval_auth";
const ONE_YEAR = 60 * 60 * 24 * 365;

function expectedToken() {
  return crypto.createHmac("sha256", process.env.SITE_PASSWORD || "").update("skolval-v1").digest("hex");
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

function isAuthed(req) {
  if (!process.env.SITE_PASSWORD) return false;
  const m = (req.headers.cookie || "").match(/(?:^|;\s*)skolval_auth=([a-f0-9]+)/);
  return !!m && safeEqual(m[1], expectedToken());
}

function checkPassword(pw) {
  return !!process.env.SITE_PASSWORD && safeEqual(pw || "", process.env.SITE_PASSWORD);
}

function setAuthCookie(res) {
  res.setHeader("Set-Cookie", `${COOKIE}=${expectedToken()}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${ONE_YEAR}`);
}

function requireAuth(req, res) {
  if (isAuthed(req)) return true;
  res.status(401).json({ error: "unauthorized" });
  return false;
}

module.exports = { isAuthed, checkPassword, setAuthCookie, requireAuth };

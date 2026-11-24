const { checkPassword, setAuthCookie } = require("../lib/auth");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  const pw = req.body && req.body.password;
  if (!checkPassword(pw)) {
    await new Promise(r => setTimeout(r, 800)); // slow down guessing
    return res.status(401).json({ error: "wrong password" });
  }
  setAuthCookie(res);
  res.status(204).end();
};

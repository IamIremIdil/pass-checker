const express = require("express");
const cors    = require("cors");
const path    = require("path");
const { analyze } = require("./src/analyzer");

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ─── API route ────────────────────────────────────────────────────────────────
app.post("/api/analyze", (req, res) => {
  const { password } = req.body;

  if (typeof password !== "string") {
    return res.status(400).json({ error: "password must be a string" });
  }

  // Never log the actual password
  const result = analyze(password);
  return res.json(result);
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_, res) => res.json({ status: "ok" }));

// ─── Serve frontend ───────────────────────────────────────────────────────────
app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`VaultCheck running → http://localhost:${PORT}`);
});
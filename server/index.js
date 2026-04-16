/**
 * MeetIQ — API Proxy Server
 *
 * Why this exists:
 *   The Anthropic API key must NEVER be exposed in the browser bundle.
 *   The React frontend calls /api/ai (same origin), and this server
 *   forwards the request to api.anthropic.com with the key attached.
 *
 * Run:  node index.js   (or: npm start)
 * Port: 3001  (Vite dev server proxies /api/* here automatically)
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });      // reads root-level .env

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.ANTHROPIC_API_KEY;

if (!API_KEY) {
  console.error("❌  ANTHROPIC_API_KEY is not set. Add it to your .env file.");
  process.exit(1);
}

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:4173"] }));
app.use(express.json({ limit: "1mb" }));

// ─── Health check ─────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "MeetIQ API proxy", version: "2.0.0" });
});

// ─── Claude AI proxy ──────────────────────────────────────────────────────
// Accepts the same body shape as api.anthropic.com/v1/messages
// and forwards it with the server-side API key.
app.post("/api/ai/messages", async (req, res) => {
  try {
    const { model, max_tokens, messages, system } = req.body;

    // Basic validation
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array is required" });
    }

    const body = {
      model: model || "claude-sonnet-4-20250514",
      max_tokens: max_tokens || 1000,
      messages,
    };
    if (system) body.system = system;

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    const data = await upstream.json();

    // Forward the exact upstream status code
    res.status(upstream.status).json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy request failed", detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅  MeetIQ proxy server running on http://localhost:${PORT}`);
  console.log(`    API key: ${API_KEY.slice(0, 8)}…`);
});

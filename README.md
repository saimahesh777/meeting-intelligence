# MeetIQ — AI Meeting Intelligence Platform

A production-ready frontend for an AI-powered meeting intelligence platform. Records, transcribes, and extracts decisions, action items, and open questions from any meeting in real time — powered by the Claude API.

---

## What's Built

| Feature | Status |
|---|---|
| Meeting Dashboard (stats, schedule, recent summaries) | ✅ Complete |
| Meeting Setup (form, consent config, integrations toggle) | ✅ Complete |
| Live Meeting — consent wall | ✅ Complete |
| Live Meeting — real-time simulated transcription | ✅ Complete |
| Live Meeting — AI extraction panel (auto-fires Claude API at end) | ✅ Complete |
| Post-meeting Summary (static + live AI tab) | ✅ Complete |
| AI Transcript Analyzer (paste any transcript → Claude extracts) | ✅ Complete |
| Action Tracker (filterable table, click-to-cycle status) | ✅ Complete |
| Meeting Library (searchable archive) | ✅ Complete |
| Analytics (bar chart, donut chart, topic/person breakdowns) | ✅ Complete |
| Reminders & Notification Rules (toggle switches, channel status) | ✅ Complete |
| API proxy server (keeps Anthropic key server-side) | ✅ Complete |
| Docker + Docker Compose (one-command startup) | ✅ Complete |

---

## Project Structure

```
meetiq/
├── src/
│   ├── App.jsx          # Full React app (all screens, ~1,300 lines)
│   └── main.jsx         # React entry point
├── server/
│   ├── index.js         # Express API proxy (hides Anthropic key)
│   ├── package.json
│   └── Dockerfile
├── index.html           # HTML shell
├── vite.config.js       # Vite + /api proxy config
├── package.json
├── Dockerfile           # Frontend Docker image
├── docker-compose.yml   # One-command full-stack startup
├── .env.example         # Environment variable template
└── .gitignore
```

---

## Quick Start (Local Dev)

### Prerequisites
- Node.js 18+
- An Anthropic API key — get one at https://console.anthropic.com

### 1. Clone and install

```bash
git clone https://github.com/your-org/meetiq.git
cd meetiq

# Install frontend dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..
```

### 2. Set up environment

```bash
cp .env.example .env
# Open .env and set ANTHROPIC_API_KEY=sk-ant-api03-...
```

### 3. Start both servers

```bash
# Run frontend (port 5173) and proxy server (port 3001) together
npm start
```

Open http://localhost:5173

---

## Quick Start (Docker)

```bash
cp .env.example .env
# Edit .env and set your ANTHROPIC_API_KEY

docker compose up --build
```

Open http://localhost:5173

The frontend and proxy server both start in containers. The frontend's `/api/*` requests are routed through nginx to the proxy server, which forwards them to the Anthropic API with your key attached.

---

## How the AI Works

All AI features call the Anthropic Claude API (`claude-sonnet-4-20250514`) via your local proxy server.

### AI Transcript Analyzer
1. User pastes a meeting transcript into the input
2. On click, the frontend sends `POST /api/ai/messages` to the proxy server
3. The proxy forwards the request to the Anthropic API
4. Claude returns structured JSON: summary, decisions, action items (with assignee + priority + due date), open questions, topics
5. Results render in real time; action items can be pushed to the Action Tracker

### Live Meeting Auto-Analysis
When the simulated transcript finishes streaming, the live meeting panel automatically fires a Claude API call. The AI-extracted results replace the heuristic-detected items in the sidebar panels.

### Summary View — AI Tab
The "Eng Review · Today (AI)" tab has a manual "Generate AI summary" button that runs Claude analysis on the Engineering Review transcript.

---

## API Reference

The proxy server exposes two endpoints:

```
GET  /api/health
POST /api/ai/messages    # same body shape as Anthropic /v1/messages
```

The proxy accepts:
```json
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 1000,
  "messages": [{ "role": "user", "content": "..." }],
  "system": "optional system prompt"
}
```

And returns the raw Anthropic API response.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 + Vite |
| UI | Custom component library (zero external UI deps) |
| Icons | Lucide React |
| AI | Anthropic Claude API (claude-sonnet-4-20250514) |
| Proxy server | Node.js + Express |
| Containerisation | Docker + Docker Compose |
| Production serving | nginx (SPA + API proxy) |

---

## Planned / Backend Scope

The following were specified in the original brief and are frontend-ready (UI screens built) but require a dedicated backend:

| Feature | What's needed |
|---|---|
| Real-time audio transcription | Deepgram or Whisper WebSocket integration |
| Speaker diarization | pyannote.audio or AWS Transcribe |
| Google Calendar sync | OAuth2 + Calendar API |
| Jira / Asana push | Task API integrations |
| Persistent action item storage | PostgreSQL + REST API |
| JWT authentication + RBAC | Spring Boot or Node auth service |
| Reminder email/Slack delivery | Cron scheduler + SendGrid / Slack API |
| Kafka event streaming | For real-time multi-user sync |

A Spring Boot microservices backend, Kafka, Redis, and PostgreSQL schema design are documented in `docs/backend-architecture.md` (see that file for the full design).

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key |
| `PORT` | No | Proxy server port (default: 3001) |

---

## Security Notes

- The Anthropic API key is **never** sent to the browser. It lives only in the proxy server's environment.
- CORS is restricted to localhost origins in development. For production, update the `cors` config in `server/index.js` to your deployed domain.
- The `.env` file is in `.gitignore` — never commit it.
- For production, use a secrets manager (AWS Secrets Manager, Doppler, etc.) instead of a `.env` file.

---

## License

MIT

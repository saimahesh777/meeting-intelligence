import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, Video, FileText, CheckSquare, BookOpen, BarChart2, Bell,
  Search, Plus, Mic, AlertCircle, CheckCircle2, Sparkles, Play, Square,
  ChevronRight, Loader2, Settings, ArrowRight, X, Send, RefreshCw,
  Clock, Users, Zap, TrendingUp, Filter
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════
// STEP 1 — THEME & DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════════
const T = {
  bg0: "#07090f", bg1: "#0d1017", bg2: "#121620", bg3: "#181d2b", bg4: "#1e2538",
  border: "rgba(255,255,255,0.065)", borderMed: "rgba(255,255,255,0.11)",
  teal: "#2dd4bf", tealFade: "rgba(45,212,191,0.08)",
  blue: "#60a5fa", blueFade: "rgba(96,165,250,0.08)",
  amber: "#fbbf24", amberFade: "rgba(251,191,36,0.09)",
  red: "#f87171", redFade: "rgba(248,113,113,0.09)",
  green: "#4ade80", greenFade: "rgba(74,222,128,0.09)",
  purple: "#c084fc", purpleFade: "rgba(192,132,252,0.09)",
  text: "#f1f5f9", textSub: "#8b97ab", textFaint: "#3d4a5c",
  r: "9px", rLg: "13px",
};

// ═══════════════════════════════════════════════════════════════════════
// STEP 2 — MOCK DATA
// ═══════════════════════════════════════════════════════════════════════
const TRANSCRIPT = [
  { speaker: "Maya", color: T.teal, text: "Let's start with the API performance issues from last sprint. Auth endpoint latency is hitting 800ms in production." },
  { speaker: "Raj", color: T.purple, text: "I've found the root cause — three database round-trips on every token validation. I'll refactor the auth middleware to use Redis caching by Thursday." },
  { speaker: "Alex", color: T.blue, text: "That should get us well under the 200ms target. Should we also look at the mobile endpoints while we're at it?" },
  { speaker: "Priya", color: T.amber, text: "On mobile, the biggest bottleneck is the image compression pipeline. We decided to move image processing to a dedicated worker queue instead of the main thread." },
  { speaker: "Maya", color: T.teal, text: "Good call. Alex, can you coordinate with design to finalize loading and error states for the mobile app by end of week?" },
  { speaker: "Alex", color: T.blue, text: "Sure. Should that cover just loading states or error states too?" },
  { speaker: "Priya", color: T.amber, text: "Both — users are confused by our generic error messages. Has anyone benchmarked what competitors are doing on error UX?" },
  { speaker: "Raj", color: T.purple, text: "Not yet — still open from the last sync. Priya, can you pull together a quick competitive analysis on error UX patterns by Wednesday?" },
  { speaker: "Maya", color: T.teal, text: "Perfect. Let's wrap up. Summary: Redis caching for auth, worker queue for images, two new action items for Alex and Priya. I'll confirm the mobile release date with the PM team." },
];

const MEETINGS = [
  { id: "m1", title: "Q2 Planning Session", date: "2026-04-11", duration: 60, participants: 6, platform: "Google Meet", status: "completed", decisions: 4, actions: 11, questions: 2, topics: ["Architecture", "Release planning", "Mobile", "Hiring"] },
  { id: "m2", title: "Sprint Retrospective W14", date: "2026-04-10", duration: 45, participants: 8, platform: "Zoom", status: "completed", decisions: 3, actions: 8, questions: 0, topics: ["Sprint review", "Blockers", "Process"] },
  { id: "m3", title: "GDPR Compliance Sync", date: "2026-04-09", duration: 30, participants: 4, platform: "Teams", status: "completed", decisions: 2, actions: 5, questions: 1, topics: ["Compliance", "Legal", "Data privacy"] },
  { id: "m4", title: "User Research Planning", date: "2026-04-08", duration: 30, participants: 3, platform: "Google Meet", status: "completed", decisions: 1, actions: 4, questions: 0, topics: ["Research", "UX", "Interviews"] },
  { id: "m5", title: "Mobile Performance Review", date: "2026-04-07", duration: 45, participants: 5, platform: "Zoom", status: "completed", decisions: 4, actions: 7, questions: 2, topics: ["Performance", "Mobile", "Metrics"] },
  { id: "m6", title: "Sprint Planning W15", date: "2026-04-07", duration: 60, participants: 7, platform: "Google Meet", status: "completed", decisions: 5, actions: 12, questions: 1, topics: ["Sprint planning", "Priorities", "Capacity"] },
];

const Q2_SUMMARY = {
  decisions: [
    "Adopt micro-frontend architecture for the dashboard module — rollout begins Q2 week 3",
    "Feature freeze for v2.4 on April 25. No new feature requests after April 18",
    "Prioritize mobile performance improvements over web for Q2 based on usage data (78% mobile users)",
    "Budget approved for 2 backend contractors — HR begins sourcing immediately",
  ],
  openQuestions: [
    "Should micro-frontend architecture also apply to the admin portal or only the customer dashboard?",
    "What is the exact SLA for contractor onboarding once candidates are identified?",
  ],
  topics: ["Architecture decisions", "Release planning", "Mobile performance", "Hiring & resourcing"],
};

const INIT_ACTIONS = [
  { id: "a1", text: "Draft micro-frontend integration spec and share with team", assignee: "Raj Kumar", initials: "RK", color: T.purple, meeting: "Q2 Planning", due: "2026-04-15", priority: "high", status: "in-progress" },
  { id: "a2", text: "Send v2.4 scope freeze notice to all stakeholders", assignee: "Maya Chen", initials: "MC", color: T.teal, meeting: "Q2 Planning", due: "2026-04-13", priority: "high", status: "overdue" },
  { id: "a3", text: "Refactor auth middleware with Redis caching", assignee: "Raj Kumar", initials: "RK", color: T.purple, meeting: "Eng Review", due: "2026-04-17", priority: "high", status: "todo" },
  { id: "a4", text: "Competitive analysis on error UX patterns", assignee: "Priya Desai", initials: "PD", color: T.amber, meeting: "Eng Review", due: "2026-04-16", priority: "medium", status: "todo" },
  { id: "a5", text: "Finalize loading and error states for mobile app", assignee: "Alex Torres", initials: "AT", color: T.blue, meeting: "Eng Review", due: "2026-04-18", priority: "medium", status: "todo" },
  { id: "a6", text: "Prepare contractor job descriptions for HR", assignee: "Alex Torres", initials: "AT", color: T.blue, meeting: "Q2 Planning", due: "2026-04-14", priority: "medium", status: "todo" },
  { id: "a7", text: "Benchmark mobile app performance vs v2.3 baseline", assignee: "Priya Desai", initials: "PD", color: T.amber, meeting: "Q2 Planning", due: "2026-04-16", priority: "medium", status: "in-progress" },
  { id: "a8", text: "Review GDPR compliance checklist and update docs", assignee: "Alex Torres", initials: "AT", color: T.blue, meeting: "GDPR Sync", due: "2026-04-14", priority: "high", status: "todo" },
  { id: "a9", text: "Update product roadmap document to reflect Q2 decisions", assignee: "Maya Chen", initials: "MC", color: T.teal, meeting: "Q2 Planning", due: "2026-04-18", priority: "low", status: "in-progress" },
  { id: "a10", text: "Setup staging environment for v2.4 release", assignee: "Raj Kumar", initials: "RK", color: T.purple, meeting: "Sprint Planning", due: "2026-04-11", priority: "high", status: "done" },
  { id: "a11", text: "Draft user research interview guide", assignee: "Priya Desai", initials: "PD", color: T.amber, meeting: "Research Sync", due: "2026-04-16", priority: "low", status: "todo" },
  { id: "a12", text: "Update CI/CD pipeline for new branch strategy", assignee: "Raj Kumar", initials: "RK", color: T.purple, meeting: "Sprint Planning", due: "2026-04-12", priority: "medium", status: "done" },
];

// ═══════════════════════════════════════════════════════════════════════
// STEP 3 — SHARED UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════
function Avatar({ initials, color, size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color + "1e", border: `1px solid ${color}40`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.3, fontWeight: 500, color, flexShrink: 0,
    }}>{initials}</div>
  );
}

function Badge({ children, color, fade }) {
  return (
    <span style={{
      padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 500,
      background: fade || color + "15", color, border: `1px solid ${color}30`, whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

function StatCard({ label, value, sub, subColor, icon: Icon, iconColor }) {
  return (
    <div style={{ background: T.bg2, borderRadius: T.r, padding: "16px 18px", border: `1px solid ${T.border}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: T.textSub, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
        {Icon && <Icon size={14} color={iconColor || T.textFaint} style={{ opacity: 0.6 }} />}
      </div>
      <div style={{ fontSize: 26, fontWeight: 600, color: T.text, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: subColor || T.textFaint, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function PriorityDot({ priority }) {
  const c = { high: T.red, medium: T.amber, low: T.green }[priority] || T.textFaint;
  return <div style={{ width: 7, height: 7, borderRadius: "50%", background: c, flexShrink: 0 }} />;
}

function StatusBadge({ status }) {
  const map = {
    done: { label: "Done", color: T.green },
    "in-progress": { label: "In progress", color: T.blue },
    todo: { label: "To do", color: T.textSub },
    overdue: { label: "Overdue", color: T.red },
    scheduled: { label: "Scheduled", color: T.amber },
    completed: { label: "Completed", color: T.green },
    live: { label: "Live", color: T.red },
  };
  const s = map[status] || map.todo;
  return <Badge color={s.color}>{s.label}</Badge>;
}

function Toggle({ value, onChange, label, sub }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${T.border}`, gap: 16 }}>
      <div>
        <div style={{ fontSize: 13, color: T.text }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: T.textFaint, marginTop: 2 }}>{sub}</div>}
      </div>
      <div onClick={() => onChange(!value)} style={{
        width: 38, height: 21, borderRadius: 11, background: value ? T.teal : T.bg4,
        border: `1px solid ${value ? T.teal : T.border}`, cursor: "pointer",
        position: "relative", flexShrink: 0, transition: "all 0.2s",
      }}>
        <div style={{ position: "absolute", top: 2, left: value ? 17 : 2, width: 15, height: 15, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }} />
      </div>
    </div>
  );
}

function Section({ title, children, last = false }) {
  return (
    <div style={{ marginBottom: last ? 0 : 24 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: T.textFaint, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${T.border}` }}>{title}</div>
      {children}
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: T.bg2, borderRadius: T.rLg, padding: 20, border: `1px solid ${T.border}`, ...style }}>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// STEP 4 — SIDEBAR NAVIGATION
// ═══════════════════════════════════════════════════════════════════════
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "setup", label: "New Meeting", icon: Plus },
  { id: "live", label: "Live Meeting", icon: Video, dot: true },
  { id: "summary", label: "Summary", icon: FileText },
  { id: "tracker", label: "Action Tracker", icon: CheckSquare },
  { id: "analyze", label: "AI Analyzer", icon: Sparkles },
  { id: "library", label: "Library", icon: BookOpen },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
  { id: "reminders", label: "Reminders", icon: Bell },
];

function Sidebar({ current, onNav, overdueCount }) {
  return (
    <div style={{
      width: 216, flexShrink: 0, background: T.bg1, borderRight: `1px solid ${T.border}`,
      display: "flex", flexDirection: "column", padding: "14px 8px",
    }}>
      <div style={{ padding: "6px 12px 18px", display: "flex", alignItems: "center", gap: 9 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: T.teal, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Mic size={13} color="#0d1017" />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, letterSpacing: "-0.03em", lineHeight: 1 }}>MeetIQ</div>
          <div style={{ fontSize: 10, color: T.textFaint, marginTop: 1 }}>v2.0 · Enterprise</div>
        </div>
      </div>
      <div style={{ fontSize: 10, color: T.textFaint, padding: "0 12px 6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Workspace</div>
      {NAV.map(({ id, label, icon: Icon, dot }) => (
        <button key={id} onClick={() => onNav(id)} style={{
          display: "flex", alignItems: "center", gap: 9, padding: "9px 12px",
          borderRadius: 8, border: "none", cursor: "pointer", width: "100%", textAlign: "left",
          background: current === id ? T.bg4 : "transparent",
          color: current === id ? T.text : T.textSub,
          fontSize: 13, fontWeight: current === id ? 500 : 400, marginBottom: 1,
          transition: "all 0.12s", outline: "none",
        }}>
          <Icon size={14} style={{ opacity: current === id ? 1 : 0.55, flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{label}</span>
          {dot && <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.red, animation: "pulse 1.5s ease-in-out infinite" }} />}
          {id === "tracker" && overdueCount > 0 && (
            <span style={{ fontSize: 10, background: T.redFade, color: T.red, borderRadius: 4, padding: "1px 5px", border: `1px solid ${T.red}30` }}>{overdueCount}</span>
          )}
          {id === "analyze" && <span style={{ fontSize: 10, background: T.tealFade, color: T.teal, borderRadius: 4, padding: "1px 5px", border: `1px solid ${T.teal}30` }}>AI</span>}
        </button>
      ))}
      <div style={{ marginTop: "auto", padding: "12px 10px", borderTop: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Avatar initials="YO" color={T.teal} size={28} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>You</div>
            <div style={{ fontSize: 10, color: T.textFaint }}>Product Manager</div>
          </div>
          <Settings size={13} color={T.textFaint} style={{ cursor: "pointer" }} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// STEP 5 — DASHBOARD
// ═══════════════════════════════════════════════════════════════════════
function Dashboard({ onNav, actions }) {
  const open = actions.filter(a => a.status !== "done").length;
  const overdue = actions.filter(a => a.status === "overdue").length;
  const done = actions.filter(a => a.status === "done").length;
  const rate = Math.round((done / actions.length) * 100);
  const todayItems = actions.filter(a => a.due === "2026-04-13" && a.status !== "done");

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 21, fontWeight: 600, color: T.text, margin: 0, letterSpacing: "-0.02em" }}>Dashboard</h1>
        <p style={{ color: T.textSub, fontSize: 13, marginTop: 4 }}>Monday, April 13, 2026 · Engineering Review starts in 20 minutes</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 22 }}>
        <StatCard label="Meetings this week" value="12" sub="↑ +3 vs last week" subColor={T.green} icon={Video} iconColor={T.blue} />
        <StatCard label="Open action items" value={open} sub={overdue > 0 ? `${overdue} overdue` : "All on track"} subColor={overdue > 0 ? T.amber : T.green} icon={CheckSquare} iconColor={T.teal} />
        <StatCard label="Completion rate" value={`${rate}%`} sub="↑ +6% this month" subColor={T.green} icon={TrendingUp} iconColor={T.green} />
        <StatCard label="Avg summary time" value="3.2m" sub="Target: under 5 min" subColor={T.teal} icon={Zap} iconColor={T.amber} />
      </div>

      {/* AI Analyzer CTA */}
      <div onClick={() => onNav("analyze")} style={{
        background: `linear-gradient(135deg, ${T.tealFade}, ${T.blueFade})`,
        border: `1px solid ${T.teal}30`, borderRadius: T.rLg, padding: "14px 20px",
        display: "flex", alignItems: "center", gap: 14, marginBottom: 16, cursor: "pointer",
        transition: "border-color 0.2s",
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = T.teal + "60"}
        onMouseLeave={e => e.currentTarget.style.borderColor = T.teal + "30"}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: T.teal + "20", border: `1px solid ${T.teal}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Sparkles size={16} color={T.teal} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>AI Transcript Analyzer — New</div>
          <div style={{ fontSize: 12, color: T.textSub, marginTop: 2 }}>Paste any meeting transcript and get real-time AI extraction of decisions, actions, and open questions</div>
        </div>
        <ArrowRight size={14} color={T.teal} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>Today's meetings</span>
            <Badge color={T.blue}>3 scheduled</Badge>
          </div>
          {[
            { title: "Product Roadmap Q2", time: "9:00 AM", count: 5, status: "completed" },
            { title: "Engineering Review", time: "2:00 PM", count: 8, status: "scheduled" },
            { title: "Design Sprint Kickoff", time: "4:30 PM", count: 4, status: "scheduled" },
          ].map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: i === 0 ? "none" : `1px solid ${T.border}` }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: T.bg4, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Video size={14} color={T.textSub} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{m.title}</div>
                <div style={{ fontSize: 11, color: T.textFaint }}>{m.time} · {m.count} participants</div>
              </div>
              <StatusBadge status={m.status} />
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>Due today</span>
            <Badge color={T.amber}>{todayItems.length} items</Badge>
          </div>
          {todayItems.slice(0, 4).map((a, i) => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: i === 0 ? "none" : `1px solid ${T.border}` }}>
              <PriorityDot priority={a.priority} />
              <div style={{ flex: 1, fontSize: 13, color: T.text, lineHeight: 1.4 }}>{a.text}</div>
              <Avatar initials={a.initials} color={a.color} size={22} />
            </div>
          ))}
          {todayItems.length === 0 && <div style={{ fontSize: 13, color: T.textFaint, textAlign: "center", padding: "16px 0" }}>Nothing due today</div>}
        </Card>
      </div>
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>Recent summaries</span>
          <button onClick={() => onNav("library")} style={{ fontSize: 12, color: T.teal, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            View all <ChevronRight size={11} />
          </button>
        </div>
        {MEETINGS.slice(0, 3).map((m, i) => (
          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderTop: i === 0 ? "none" : `1px solid ${T.border}` }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: T.bg4, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FileText size={14} color={T.textSub} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{m.title}</div>
              <div style={{ fontSize: 11, color: T.textFaint }}>{m.date} · {m.decisions} decisions · {m.actions} action items{m.questions > 0 ? ` · ${m.questions} open questions` : ""}</div>
            </div>
            <button onClick={() => onNav("summary")} style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${T.borderMed}`, background: "none", color: T.textSub, fontSize: 12, cursor: "pointer" }}>
              View
            </button>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// STEP 6 — MEETING SETUP + CONSENT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════
function MeetingSetup({ onNav }) {
  const [form, setForm] = useState({
    title: "", date: "2026-04-14", time: "10:00", duration: "60",
    platform: "Google Meet", participants: "", agenda: "",
    recording: true, transcription: true, aiSummary: true, consentRequired: true,
    pushAsana: true, pushSlack: true, calendarSync: true,
  });
  const [saved, setSaved] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const InputEl = ({ k, type = "text", placeholder = "", rows }) => {
    const base = { width: "100%", background: T.bg4, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13, outline: "none", fontFamily: "inherit", transition: "border-color 0.15s" };
    if (rows) return <textarea value={form[k]} onChange={e => set(k, e.target.value)} placeholder={placeholder} rows={rows} style={{ ...base, padding: "10px 14px", resize: "vertical" }} />;
    return <input type={type} value={form[k]} onChange={e => set(k, e.target.value)} placeholder={placeholder} style={{ ...base, padding: "10px 14px", height: 38 }} />;
  };

  const SelectEl = ({ k, options }) => (
    <select value={form[k]} onChange={e => set(k, e.target.value)} style={{ width: "100%", height: 38, padding: "0 14px", background: T.bg4, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13, outline: "none" }}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );

  const Field = ({ label, children }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 11, color: T.textSub, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
      {children}
    </div>
  );

  if (saved) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "64vh", gap: 14 }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: T.greenFade, border: `1px solid ${T.green}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CheckCircle2 size={26} color={T.green} />
      </div>
      <h2 style={{ color: T.text, fontSize: 20, margin: 0, fontWeight: 600 }}>Meeting scheduled</h2>
      <p style={{ color: T.textSub, fontSize: 13, margin: 0 }}>"{form.title || "Untitled"}" · {form.date} at {form.time}</p>
      <p style={{ color: T.textFaint, fontSize: 12, margin: 0 }}>Invites sent · Consent requests queued · Calendar updated</p>
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button onClick={() => setSaved(false)} style={{ padding: "9px 20px", borderRadius: 8, border: `1px solid ${T.border}`, background: "none", color: T.textSub, cursor: "pointer", fontSize: 13 }}>Schedule another</button>
        <button onClick={() => onNav("dashboard")} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: T.teal, color: "#0d1017", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Go to dashboard</button>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 21, fontWeight: 600, color: T.text, margin: 0, letterSpacing: "-0.02em" }}>Schedule Meeting</h1>
        <p style={{ color: T.textSub, fontSize: 13, marginTop: 4 }}>Configure recording, transcription consent, and task integrations</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.textSub, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 16 }}>Meeting details</div>
            <Field label="Title"><InputEl k="title" placeholder="e.g. Q2 Planning Session" /></Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Date"><InputEl k="date" type="date" /></Field>
              <Field label="Time"><InputEl k="time" type="time" /></Field>
            </div>
            <Field label="Duration"><SelectEl k="duration" options={["30", "45", "60", "90", "120"]} /></Field>
            <Field label="Platform"><SelectEl k="platform" options={["Google Meet", "Zoom", "Microsoft Teams", "Webex", "In-person"]} /></Field>
            <Field label="Participants (emails)"><InputEl k="participants" placeholder="raj@co.com, alex@co.com" /></Field>
            <Field label="Agenda (optional)"><InputEl k="agenda" placeholder="Key topics to be discussed..." rows={3} /></Field>
          </Card>
        </div>
        <div>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.textSub, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Recording & AI</div>
            <Toggle value={form.recording} onChange={v => set("recording", v)} label="Enable meeting recording" sub="Audio/video captured and encrypted at rest" />
            <Toggle value={form.transcription} onChange={v => set("transcription", v)} label="Real-time transcription" sub="Live captions with speaker diarization" />
            <Toggle value={form.aiSummary} onChange={v => set("aiSummary", v)} label="AI-generated summary" sub="Delivered to all participants within 5 min" />
            <Toggle value={form.consentRequired} onChange={v => set("consentRequired", v)} label="Require participant consent" sub="Recording only starts after all participants confirm" />
          </Card>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.textSub, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Task integrations</div>
            <Toggle value={form.pushAsana} onChange={v => set("pushAsana", v)} label="Push action items to Asana" />
            <Toggle value={form.pushSlack} onChange={v => set("pushSlack", v)} label="Post summary to Slack" />
            <Toggle value={form.calendarSync} onChange={v => set("calendarSync", v)} label="Sync with Google Calendar" />
          </Card>
          <div style={{ background: T.amberFade, borderRadius: T.r, padding: "13px 15px", border: `1px solid ${T.amber}30`, marginBottom: 16, display: "flex", gap: 10 }}>
            <AlertCircle size={14} color={T.amber} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 12, color: T.amber, lineHeight: 1.65 }}>
              Recording only starts after all participants confirm consent. All data encrypted and deletable on request.
            </div>
          </div>
          <button onClick={() => setSaved(true)} style={{
            width: "100%", padding: "13px", borderRadius: 9, border: "none",
            background: form.title ? T.teal : T.bg4, color: form.title ? "#0d1017" : T.textFaint,
            fontSize: 14, fontWeight: 600, cursor: form.title ? "pointer" : "not-allowed", transition: "all 0.2s",
          }}>
            Schedule meeting & send invites
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// STEP 7 — LIVE MEETING + REAL-TIME AI PANEL
// ═══════════════════════════════════════════════════════════════════════
function LiveMeeting({ onEnd, onAddActions }) {
  const [phase, setPhase] = useState("consent");
  const [consented, setConsented] = useState({ Maya: false, Raj: false, Alex: false, Priya: false });
  const [lines, setLines] = useState([]);
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [detectedActions, setDetectedActions] = useState([]);
  const [detectedDecisions, setDetectedDecisions] = useState([]);
  const [openQuestions, setOpenQuestions] = useState([]);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const scrollRef = useRef(null);

  const ACTION_MAP = {
    1: { text: "Refactor auth middleware with Redis caching", assignee: "Raj", due: "Thu Apr 17" },
    4: { text: "Finalize loading + error states for mobile app", assignee: "Alex", due: "Fri Apr 18" },
    7: { text: "Competitive analysis on error UX patterns", assignee: "Priya", due: "Wed Apr 16" },
  };
  const DECISION_MAP = { 3: "Move image processing to dedicated worker queue" };
  const QUESTION_MAP = { 6: "Should that cover just loading states or error states too?" };

  useEffect(() => {
    if (phase !== "live") return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "live" || lineIdx >= TRANSCRIPT.length) return;
    const cur = TRANSCRIPT[lineIdx];
    if (charIdx < cur.text.length) {
      const t = setTimeout(() => {
        setLines(prev => {
          const n = [...prev];
          if (n.length <= lineIdx) n.push({ ...cur, displayText: cur.text.slice(0, charIdx + 1) });
          else n[lineIdx] = { ...cur, displayText: cur.text.slice(0, charIdx + 1) };
          return n;
        });
        setCharIdx(c => c + 1);
      }, 22 + Math.random() * 18);
      return () => clearTimeout(t);
    } else {
      if (ACTION_MAP[lineIdx]) setTimeout(() => setDetectedActions(d => [...d, ACTION_MAP[lineIdx]]), 500);
      if (DECISION_MAP[lineIdx]) setTimeout(() => setDetectedDecisions(d => [...d, DECISION_MAP[lineIdx]]), 500);
      if (QUESTION_MAP[lineIdx]) setTimeout(() => setOpenQuestions(q => [...q, QUESTION_MAP[lineIdx]]), 500);
      const t = setTimeout(() => { setLineIdx(i => i + 1); setCharIdx(0); }, 900);
      return () => clearTimeout(t);
    }
  }, [phase, lineIdx, charIdx]);

  // When all transcript lines are done, auto-trigger real AI analysis
  useEffect(() => {
    if (phase === "live" && lineIdx >= TRANSCRIPT.length && !aiAnalyzing && !aiDone) {
      setAiAnalyzing(true);
      const transcript = TRANSCRIPT.map(l => `${l.speaker}: ${l.text}`).join("\n");
      fetch("/api/ai/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Analyze this meeting transcript. Return ONLY a JSON object (no markdown, no explanation):
{
  "decisions": ["string"],
  "actionItems": [{"text":"string","assignee":"string","due":"string"}],
  "openQuestions": ["string"],
  "topics": ["string"]
}
Transcript:\n${transcript}`,
          }],
        }),
      })
        .then(r => r.json())
        .then(data => {
          const text = data.content?.filter(c => c.type === "text").map(c => c.text).join("") || "";
          const clean = text.replace(/```json|```/g, "").trim();
          const parsed = JSON.parse(clean);
          // Merge AI results into panels
          if (parsed.decisions) setDetectedDecisions(parsed.decisions);
          if (parsed.openQuestions) setOpenQuestions(parsed.openQuestions);
          if (parsed.actionItems) {
            setDetectedActions(parsed.actionItems.map(a => ({ text: a.text, assignee: a.assignee, due: a.due })));
          }
          setAiDone(true);
        })
        .catch(() => setAiDone(true))
        .finally(() => setAiAnalyzing(false));
    }
  }, [lineIdx, phase]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines]);

  const allConsented = Object.values(consented).every(Boolean);
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const speakers = [{ n: "Maya", c: T.teal }, { n: "Raj", c: T.purple }, { n: "Alex", c: T.blue }, { n: "Priya", c: T.amber }];

  if (phase === "consent") return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 21, fontWeight: 600, color: T.text, margin: 0, letterSpacing: "-0.02em" }}>Engineering Review</h1>
        <p style={{ color: T.textSub, fontSize: 13, marginTop: 4 }}>April 13, 2026 · 2:00 PM · Waiting for all participants to consent</p>
      </div>
      <div style={{ maxWidth: 540 }}>
        <div style={{ background: T.amberFade, border: `1px solid ${T.amber}30`, borderRadius: T.r, padding: "13px 15px", marginBottom: 22, display: "flex", gap: 10 }}>
          <AlertCircle size={14} color={T.amber} style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 13, color: T.amber, lineHeight: 1.6 }}>
            Recording and transcription will not start until all participants confirm consent. Covered by your organization's 90-day data retention policy.
          </div>
        </div>
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>Participant consent</span>
            <span style={{ fontSize: 12, color: T.textSub }}>{Object.values(consented).filter(Boolean).length} / 4 confirmed</span>
          </div>
          <div style={{ width: "100%", height: 4, background: T.bg4, borderRadius: 2, marginBottom: 18, overflow: "hidden" }}>
            <div style={{ height: "100%", background: allConsented ? T.green : T.teal, borderRadius: 2, width: `${(Object.values(consented).filter(Boolean).length / 4) * 100}%`, transition: "width 0.4s" }} />
          </div>
          {Object.entries(consented).map(([name, agreed]) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
              <Avatar initials={name.slice(0, 2).toUpperCase()} color={agreed ? T.green : T.textFaint} size={36} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{name}</div>
                <div style={{ fontSize: 11, color: T.textFaint }}>This meeting will be recorded and transcribed by AI</div>
              </div>
              {agreed
                ? <Badge color={T.green}>Consented ✓</Badge>
                : <button onClick={() => setConsented(c => ({ ...c, [name]: true }))} style={{ padding: "6px 14px", borderRadius: 7, border: `1px solid ${T.teal}40`, background: T.tealFade, color: T.teal, fontSize: 12, cursor: "pointer" }}>I consent</button>}
            </div>
          ))}
        </Card>
        <button disabled={!allConsented} onClick={() => setPhase("live")} style={{
          width: "100%", padding: 13, borderRadius: 9, border: "none",
          background: allConsented ? T.teal : T.bg4, color: allConsented ? "#0d1017" : T.textFaint,
          fontSize: 14, fontWeight: 600, cursor: allConsented ? "pointer" : "not-allowed",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s",
        }}>
          <Play size={15} /> Start recording & transcription
        </button>
      </div>
    </div>
  );

  if (phase === "ending") return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "64vh", gap: 14 }}>
      <Loader2 size={32} color={T.teal} style={{ animation: "spin 1s linear infinite" }} />
      <h2 style={{ color: T.text, fontSize: 20, margin: 0, fontWeight: 600 }}>Generating AI summary…</h2>
      <p style={{ color: T.textSub, fontSize: 13 }}>Extracting decisions · action items · open questions · topics</p>
      <p style={{ color: T.textFaint, fontSize: 12 }}>Summary delivered to all 4 participants within 5 minutes</p>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 21, fontWeight: 600, color: T.text, margin: 0, letterSpacing: "-0.02em" }}>Engineering Review</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
            <span style={{ fontSize: 13, color: T.textSub }}>{fmt(elapsed)}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 5, background: T.redFade, border: `1px solid ${T.red}30` }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: T.red, animation: "pulse 1s infinite" }} />
              <span style={{ fontSize: 10, color: T.red, fontWeight: 600, letterSpacing: "0.05em" }}>RECORDING</span>
            </div>
            <span style={{ fontSize: 11, color: T.green }}>All 4 consented · &lt;3s lag</span>
            {aiAnalyzing && <span style={{ fontSize: 11, color: T.teal, display: "flex", alignItems: "center", gap: 5 }}><Loader2 size={10} style={{ animation: "spin 1s linear infinite" }} /> AI analyzing…</span>}
            {aiDone && <span style={{ fontSize: 11, color: T.teal }}>✓ AI extraction complete</span>}
          </div>
        </div>
        <button onClick={() => { setPhase("ending"); setTimeout(onEnd, 2800); }} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${T.red}40`, background: T.redFade, color: T.red, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <Square size={12} /> End meeting
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, height: "calc(100vh - 210px)" }}>
        <Card style={{ display: "flex", flexDirection: "column", padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: T.textSub, textTransform: "uppercase", letterSpacing: "0.07em" }}>Live transcript</span>
            <div style={{ display: "flex", gap: 6 }}>
              {speakers.map(s => <Avatar key={s.n} initials={s.n.slice(0, 2)} color={s.c} size={22} />)}
            </div>
          </div>
          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
            {lines.map((line, i) => (
              <div key={i} style={{ display: "flex", gap: 10 }}>
                <Avatar initials={line.speaker.slice(0, 2)} color={line.color} size={26} />
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: line.color, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>{line.speaker}</div>
                  <div style={{ fontSize: 13, color: T.text, lineHeight: 1.65 }}>
                    {line.displayText}
                    {i === lines.length - 1 && lineIdx < TRANSCRIPT.length && <span style={{ animation: "blink 1s step-end infinite", color: T.teal }}>█</span>}
                  </div>
                </div>
              </div>
            ))}
            {lines.length === 0 && <div style={{ fontSize: 13, color: T.textFaint, textAlign: "center", paddingTop: 40 }}>Listening…</div>}
          </div>
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
          <Card style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.textSub, textTransform: "uppercase", letterSpacing: "0.07em" }}>Action items</span>
              <Badge color={T.teal}>{detectedActions.length}</Badge>
            </div>
            {detectedActions.length === 0
              ? <p style={{ fontSize: 12, color: T.textFaint }}>Listening for commitments…</p>
              : detectedActions.map((a, i) => (
                <div key={i} style={{ background: T.bg4, borderRadius: 8, padding: "10px 12px", marginBottom: 8, borderLeft: `2px solid ${T.teal}` }}>
                  <div style={{ fontSize: 9, color: T.teal, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Detected</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: T.text, marginBottom: 3, lineHeight: 1.4 }}>{a.text}</div>
                  <div style={{ fontSize: 10, color: T.textFaint }}>{a.assignee} · {a.due}</div>
                </div>
              ))
            }
          </Card>
          <Card style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.textSub, textTransform: "uppercase", letterSpacing: "0.07em" }}>Decisions</span>
              <Badge color={T.green}>{detectedDecisions.length}</Badge>
            </div>
            {detectedDecisions.length === 0
              ? <p style={{ fontSize: 12, color: T.textFaint }}>No decisions yet…</p>
              : detectedDecisions.map((d, i) => (
                <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: T.text, lineHeight: 1.5, marginBottom: 6 }}>
                  <CheckCircle2 size={13} color={T.green} style={{ flexShrink: 0, marginTop: 1 }} />{d}
                </div>
              ))
            }
          </Card>
          <Card style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.textSub, textTransform: "uppercase", letterSpacing: "0.07em" }}>Open questions</span>
              <Badge color={T.amber}>{openQuestions.length}</Badge>
            </div>
            {openQuestions.length === 0
              ? <p style={{ fontSize: 12, color: T.textFaint }}>No unresolved questions…</p>
              : openQuestions.map((q, i) => (
                <div key={i} style={{ fontSize: 12, color: T.textSub, lineHeight: 1.5, marginBottom: 4 }}>→ {q}</div>
              ))
            }
          </Card>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// STEP 8 — AI SUMMARY (real Anthropic API integration)
// ═══════════════════════════════════════════════════════════════════════
function SummaryView() {
  const [tab, setTab] = useState("q2");
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const generateSummary = async () => {
    setLoading(true); setError(false); setAiResult(null);
    try {
      const transcript = TRANSCRIPT.map(l => `${l.speaker}: ${l.text}`).join("\n");
      const res = await fetch("/api/ai/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Analyze this meeting transcript. Return ONLY a JSON object (no markdown, no extra text):
{
  "decisions": ["string"],
  "actionItems": [{"text":"string","assignee":"string","due":"string"}],
  "openQuestions": ["string"],
  "topics": ["string"]
}
Transcript:\n${transcript}`,
          }],
        }),
      });
      const data = await res.json();
      const text = data.content.filter(c => c.type === "text").map(c => c.text).join("");
      setAiResult(JSON.parse(text.replace(/```json|```/g, "").trim()));
    } catch { setError(true); }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 21, fontWeight: 600, color: T.text, margin: 0, letterSpacing: "-0.02em" }}>Meeting Summary</h1>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          {[{ id: "q2", label: "Q2 Planning · Apr 11" }, { id: "eng", label: "Eng Review · Today (AI)" }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "6px 14px", borderRadius: 7, border: `1px solid ${tab === t.id ? T.teal + "50" : T.border}`,
              background: tab === t.id ? T.tealFade : "none", color: tab === t.id ? T.teal : T.textSub,
              fontSize: 12, cursor: "pointer", fontWeight: tab === t.id ? 500 : 400,
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {tab === "q2" && (
        <Card>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
            <Badge color={T.blue}>{Q2_SUMMARY.decisions.length} decisions</Badge>
            <Badge color={T.green}>11 action items</Badge>
            <Badge color={T.amber}>{Q2_SUMMARY.openQuestions.length} open questions</Badge>
            <Badge color={T.teal}>Delivered in 3.8 min</Badge>
            <Badge color={T.textFaint}>60 min · 6 participants</Badge>
          </div>
          <Section title="Key decisions">
            {Q2_SUMMARY.decisions.map((d, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: i < Q2_SUMMARY.decisions.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <CheckCircle2 size={14} color={T.green} style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 13, color: T.text, lineHeight: 1.6 }}>{d}</span>
              </div>
            ))}
          </Section>
          <Section title="Action items">
            {[
              { text: "Draft micro-frontend integration spec", i: "RK", c: T.purple, a: "Raj", due: "Apr 15", p: "high", s: "in-progress" },
              { text: "Send v2.4 scope freeze notice to stakeholders", i: "MC", c: T.teal, a: "Maya", due: "Apr 13", p: "high", s: "overdue" },
              { text: "Prepare contractor job descriptions for HR", i: "AT", c: T.blue, a: "Alex", due: "Apr 14", p: "medium", s: "todo" },
              { text: "Benchmark mobile performance vs v2.3 baseline", i: "PD", c: T.amber, a: "Priya", due: "Apr 16", p: "medium", s: "in-progress" },
              { text: "Update product roadmap document", i: "MC", c: T.teal, a: "Maya", due: "Apr 18", p: "low", s: "todo" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                <PriorityDot priority={item.p} />
                <span style={{ flex: 1, fontSize: 13, color: T.text }}>{item.text}</span>
                <Avatar initials={item.i} color={item.c} size={22} />
                <span style={{ fontSize: 11, color: T.textFaint, width: 52, textAlign: "right" }}>{item.due}</span>
                <StatusBadge status={item.s} />
              </div>
            ))}
          </Section>
          <Section title="Open questions">
            {Q2_SUMMARY.openQuestions.map((q, i) => (
              <div key={i} style={{ padding: "8px 0", fontSize: 13, color: T.textSub, lineHeight: 1.6, borderBottom: i < Q2_SUMMARY.openQuestions.length - 1 ? `1px solid ${T.border}` : "none" }}>→ {q}</div>
            ))}
          </Section>
          <Section title="Topics covered" last>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {Q2_SUMMARY.topics.map(t => <Badge key={t} color={T.textSub}>{t}</Badge>)}
            </div>
          </Section>
        </Card>
      )}

      {tab === "eng" && (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: T.text, marginBottom: 6 }}>AI Summary Engine</div>
                <div style={{ fontSize: 13, color: T.textSub, lineHeight: 1.7, maxWidth: 520 }}>
                  Click to run live AI extraction on the Engineering Review transcript using the Claude API. Detects decisions, extracts action items with assignees, identifies unresolved questions, and tags topics.
                </div>
              </div>
              <button onClick={generateSummary} disabled={loading} style={{
                padding: "10px 18px", borderRadius: 8, border: "none", cursor: loading ? "wait" : "pointer",
                background: loading ? T.bg4 : T.teal, color: loading ? T.textFaint : "#0d1017",
                fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, flexShrink: 0, transition: "all 0.2s",
              }}>
                {loading ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Sparkles size={13} />}
                {loading ? "Analyzing…" : "Generate AI summary"}
              </button>
            </div>
          </Card>
          {error && <div style={{ background: T.redFade, borderRadius: T.r, padding: 14, border: `1px solid ${T.red}30`, color: T.red, fontSize: 13 }}>Failed to generate summary. Please check your connection and try again.</div>}
          {aiResult && (
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 22 }}>
                <Sparkles size={14} color={T.teal} />
                <span style={{ fontSize: 13, fontWeight: 600, color: T.teal }}>AI-extracted summary · Engineering Review · April 13, 2026</span>
              </div>
              {aiResult.decisions?.length > 0 && (
                <Section title="Decisions detected">
                  {aiResult.decisions.map((d, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: i < aiResult.decisions.length - 1 ? `1px solid ${T.border}` : "none" }}>
                      <CheckCircle2 size={13} color={T.green} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: 13, color: T.text, lineHeight: 1.6 }}>{d}</span>
                    </div>
                  ))}
                </Section>
              )}
              {aiResult.actionItems?.length > 0 && (
                <Section title="Action items extracted">
                  {aiResult.actionItems.map((a, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px solid ${T.border}` }}>
                      <PriorityDot priority="medium" />
                      <span style={{ flex: 1, fontSize: 13, color: T.text }}>{a.text}</span>
                      {a.assignee && <span style={{ fontSize: 11, color: T.textFaint }}>{a.assignee}</span>}
                      {a.due && <span style={{ fontSize: 11, color: T.textFaint }}>{a.due}</span>}
                    </div>
                  ))}
                </Section>
              )}
              {aiResult.openQuestions?.length > 0 && (
                <Section title="Open questions">
                  {aiResult.openQuestions.map((q, i) => (
                    <div key={i} style={{ padding: "8px 0", fontSize: 13, color: T.textSub, lineHeight: 1.6 }}>→ {q}</div>
                  ))}
                </Section>
              )}
              {aiResult.topics?.length > 0 && (
                <Section title="Topics" last>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {aiResult.topics.map(t => <Badge key={t} color={T.textSub}>{t}</Badge>)}
                  </div>
                </Section>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// STEP 9 — ACTION TRACKER
// ═══════════════════════════════════════════════════════════════════════
function ActionTracker({ actions, setActions }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const FILTERS = [
    { id: "all", label: "All" }, { id: "mine", label: "Mine" }, { id: "overdue", label: "Overdue" },
    { id: "high", label: "High priority" }, { id: "active", label: "Active" }, { id: "done", label: "Completed" },
  ];
  const filtered = actions.filter(a => {
    const matchSearch = !search || a.text.toLowerCase().includes(search.toLowerCase()) || a.assignee.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === "overdue") return a.status === "overdue";
    if (filter === "high") return a.priority === "high";
    if (filter === "done") return a.status === "done";
    if (filter === "active") return a.status !== "done";
    if (filter === "mine") return a.assignee === "Maya Chen";
    return true;
  });

  const cycleStatus = id => {
    const cycle = { todo: "in-progress", "in-progress": "done", done: "todo", overdue: "in-progress" };
    setActions(prev => prev.map(a => a.id === id ? { ...a, status: cycle[a.status] || "todo" } : a));
  };

  const open = actions.filter(a => a.status !== "done").length;
  const overdue = actions.filter(a => a.status === "overdue").length;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 21, fontWeight: 600, color: T.text, margin: 0, letterSpacing: "-0.02em" }}>Action Tracker</h1>
        <p style={{ color: T.textSub, fontSize: 13, marginTop: 4 }}>{open} open · {overdue} overdue · {actions.filter(a => a.status === "done").length} completed · Click a status badge to update it</p>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
          <Search size={13} color={T.textFaint} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search actions or assignees…" style={{ width: "100%", height: 36, paddingLeft: 34, paddingRight: 12, background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 12, outline: "none", fontFamily: "inherit" }} />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: "5px 12px", borderRadius: 7, border: `1px solid ${filter === f.id ? T.teal + "50" : T.border}`,
              background: filter === f.id ? T.tealFade : "none", color: filter === f.id ? T.teal : T.textSub,
              fontSize: 11, cursor: "pointer", fontWeight: filter === f.id ? 500 : 400,
            }}>{f.label}</button>
          ))}
        </div>
      </div>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              {["Action item", "Assignee", "Source meeting", "Due date", "Priority", "Status"].map(h => (
                <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 10, color: T.textFaint, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((a, i) => (
              <tr key={a.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none", opacity: a.status === "done" ? 0.55 : 1 }}>
                <td style={{ padding: "12px 16px", fontSize: 13, color: T.text, textDecoration: a.status === "done" ? "line-through" : "none", maxWidth: 280 }}>{a.text}</td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <Avatar initials={a.initials} color={a.color} size={22} />
                    <span style={{ fontSize: 12, color: T.textSub }}>{a.assignee.split(" ")[0]}</span>
                  </div>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: T.textFaint }}>{a.meeting}</td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: a.status === "overdue" ? T.red : T.textSub, fontWeight: a.status === "overdue" ? 500 : 400 }}>{a.due}</td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <PriorityDot priority={a.priority} />
                    <span style={{ fontSize: 11, color: T.textFaint, textTransform: "capitalize" }}>{a.priority}</span>
                  </div>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <button onClick={() => cycleStatus(a.id)} style={{ border: "none", background: "none", cursor: "pointer", padding: 0 }} title="Click to cycle status">
                    <StatusBadge status={a.status} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ padding: "32px 16px", textAlign: "center", color: T.textFaint, fontSize: 13 }}>No action items match this filter</div>}
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// STEP 10 — AI TRANSCRIPT ANALYZER (NEW — real Claude API)
// ═══════════════════════════════════════════════════════════════════════
const EXAMPLE_TRANSCRIPT = `Alice: Good morning everyone. Let's kick off the budget review. Finance needs our Q2 projections by Friday.
Bob: I'll own the engineering budget breakdown. I can have that ready by Wednesday.
Alice: Perfect. Charlie, can you consolidate the marketing numbers from your team by Thursday?
Charlie: Sure. One question — should we include the contractor costs in marketing or keep them separate under headcount?
Alice: Good question. Let's keep contractors under headcount for consistency. That's a decision.
Bob: Agreed. We also decided last week to cut the conference budget by 30% for Q3.
Charlie: We still haven't resolved whether to renew the Salesforce contract — that needs to go to legal.
Alice: Right, that's still open. I'll follow up with legal this week. Bob, once you send the engineering numbers, please also flag any tools we're underutilizing.
Bob: Will do. That gives us a cleaner view for the cost optimization pass.`;

function AIAnalyzer({ onAddActions }) {
  const [transcript, setTranscript] = useState(EXAMPLE_TRANSCRIPT);
  const [meetingTitle, setMeetingTitle] = useState("Budget Review Q2");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pushed, setPushed] = useState(false);

  const analyze = async () => {
    if (!transcript.trim()) return;
    setLoading(true); setError(null); setResult(null); setPushed(false);
    try {
      const res = await fetch("/api/ai/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1200,
          messages: [{
            role: "user",
            content: `You are a meeting intelligence AI. Analyze the transcript below and extract structured information.
Return ONLY a valid JSON object with no markdown fences, no preamble, no explanation — just the JSON.

{
  "summary": "2-3 sentence executive summary",
  "decisions": ["array of decisions made"],
  "actionItems": [
    {"text": "task description", "assignee": "person name or null", "due": "due date or null", "priority": "high|medium|low"}
  ],
  "openQuestions": ["unresolved questions needing follow-up"],
  "topics": ["main topic tags"],
  "speakerCount": number
}

Meeting transcript:
${transcript}`,
          }],
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content?.filter(c => c.type === "text").map(c => c.text).join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      setResult(JSON.parse(clean));
    } catch (e) {
      setError(e.message || "Failed to analyze. Please try again.");
    }
    setLoading(false);
  };

  const pushToTracker = () => {
    if (!result?.actionItems) return;
    const newActions = result.actionItems.map((a, i) => ({
      id: `ai-${Date.now()}-${i}`,
      text: a.text,
      assignee: a.assignee || "Unassigned",
      initials: a.assignee ? a.assignee.slice(0, 2).toUpperCase() : "UN",
      color: [T.teal, T.purple, T.blue, T.amber][i % 4],
      meeting: meetingTitle,
      due: a.due || "TBD",
      priority: a.priority || "medium",
      status: "todo",
    }));
    onAddActions(newActions);
    setPushed(true);
  };

  const priorityColor = p => ({ high: T.red, medium: T.amber, low: T.green }[p] || T.textFaint);

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 21, fontWeight: 600, color: T.text, margin: 0, letterSpacing: "-0.02em" }}>AI Transcript Analyzer</h1>
        <p style={{ color: T.textSub, fontSize: 13, marginTop: 4 }}>Paste any meeting transcript — Claude extracts decisions, actions, questions and topics in real time</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Input Panel */}
        <div>
          <Card style={{ marginBottom: 12 }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: T.textSub, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>Meeting title</label>
              <input value={meetingTitle} onChange={e => setMeetingTitle(e.target.value)} style={{ width: "100%", height: 36, padding: "0 12px", background: T.bg4, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 13, outline: "none", fontFamily: "inherit" }} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <label style={{ fontSize: 11, color: T.textSub, textTransform: "uppercase", letterSpacing: "0.06em" }}>Transcript</label>
                <span style={{ fontSize: 10, color: T.textFaint }}>{transcript.split("\n").filter(Boolean).length} lines</span>
              </div>
              <textarea
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
                rows={14}
                placeholder={`Speaker: text\nSpeaker: text\n...`}
                style={{ width: "100%", background: T.bg4, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 12, lineHeight: 1.65, outline: "none", fontFamily: "inherit", padding: "10px 14px", resize: "vertical" }}
              />
            </div>
          </Card>
          <button
            onClick={analyze}
            disabled={loading || !transcript.trim()}
            style={{
              width: "100%", padding: "12px", borderRadius: 9, border: "none",
              background: transcript.trim() && !loading ? T.teal : T.bg4,
              color: transcript.trim() && !loading ? "#0d1017" : T.textFaint,
              fontSize: 14, fontWeight: 600, cursor: transcript.trim() && !loading ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 9, transition: "all 0.2s",
            }}>
            {loading
              ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Claude is analyzing…</>
              : <><Sparkles size={15} /> Analyze with Claude AI</>
            }
          </button>
          {error && (
            <div style={{ marginTop: 10, background: T.redFade, borderRadius: T.r, padding: "11px 14px", border: `1px solid ${T.red}30`, color: T.red, fontSize: 12 }}>
              {error}
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 200px)" }}>
          {!result && !loading && (
            <div style={{ background: T.bg2, borderRadius: T.rLg, border: `1px dashed ${T.border}`, padding: 40, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, minHeight: 320 }}>
              <Sparkles size={28} color={T.textFaint} />
              <div style={{ fontSize: 14, color: T.textFaint, textAlign: "center" }}>Results appear here after analysis</div>
              <div style={{ fontSize: 12, color: T.textFaint + "99", textAlign: "center", maxWidth: 220 }}>Try the example transcript on the left or paste your own</div>
            </div>
          )}
          {loading && (
            <div style={{ background: T.bg2, borderRadius: T.rLg, border: `1px solid ${T.border}`, padding: 40, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, minHeight: 320 }}>
              <Loader2 size={32} color={T.teal} style={{ animation: "spin 1s linear infinite" }} />
              <div style={{ fontSize: 14, color: T.text, fontWeight: 500 }}>Analyzing transcript…</div>
              <div style={{ fontSize: 12, color: T.textSub, textAlign: "center", lineHeight: 1.6 }}>
                Extracting decisions · action items<br />open questions · speaker patterns
              </div>
            </div>
          )}
          {result && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Summary */}
              <Card>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <Sparkles size={13} color={T.teal} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.teal, textTransform: "uppercase", letterSpacing: "0.06em" }}>AI Summary</span>
                </div>
                <p style={{ fontSize: 13, color: T.text, lineHeight: 1.75, margin: 0 }}>{result.summary}</p>
                <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                  <Badge color={T.blue}>{result.decisions?.length || 0} decisions</Badge>
                  <Badge color={T.teal}>{result.actionItems?.length || 0} actions</Badge>
                  <Badge color={T.amber}>{result.openQuestions?.length || 0} open questions</Badge>
                  {result.speakerCount && <Badge color={T.textFaint}>{result.speakerCount} speakers</Badge>}
                  {result.topics?.slice(0, 2).map(t => <Badge key={t} color={T.purple}>{t}</Badge>)}
                </div>
              </Card>

              {/* Decisions */}
              {result.decisions?.length > 0 && (
                <Card>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.textSub, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>Decisions ({result.decisions.length})</div>
                  {result.decisions.map((d, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: i < result.decisions.length - 1 ? `1px solid ${T.border}` : "none" }}>
                      <CheckCircle2 size={13} color={T.green} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: 13, color: T.text, lineHeight: 1.6 }}>{d}</span>
                    </div>
                  ))}
                </Card>
              )}

              {/* Action Items */}
              {result.actionItems?.length > 0 && (
                <Card>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: T.textSub, textTransform: "uppercase", letterSpacing: "0.07em" }}>Action items ({result.actionItems.length})</div>
                    {!pushed
                      ? <button onClick={pushToTracker} style={{ padding: "5px 12px", borderRadius: 7, border: `1px solid ${T.teal}40`, background: T.tealFade, color: T.teal, fontSize: 11, cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}>
                        <ArrowRight size={10} /> Push to tracker
                      </button>
                      : <Badge color={T.green}>✓ Added to tracker</Badge>
                    }
                  </div>
                  {result.actionItems.map((a, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: i < result.actionItems.length - 1 ? `1px solid ${T.border}` : "none" }}>
                      <PriorityDot priority={a.priority} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: T.text, lineHeight: 1.5 }}>{a.text}</div>
                        <div style={{ fontSize: 11, color: T.textFaint, marginTop: 3 }}>
                          {a.assignee && <span>{a.assignee}</span>}
                          {a.assignee && a.due && <span> · </span>}
                          {a.due && <span>{a.due}</span>}
                        </div>
                      </div>
                      <Badge color={priorityColor(a.priority)}>{a.priority}</Badge>
                    </div>
                  ))}
                </Card>
              )}

              {/* Open Questions */}
              {result.openQuestions?.length > 0 && (
                <Card>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.textSub, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>Open questions ({result.openQuestions.length})</div>
                  {result.openQuestions.map((q, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: i < result.openQuestions.length - 1 ? `1px solid ${T.border}` : "none" }}>
                      <AlertCircle size={13} color={T.amber} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: 13, color: T.textSub, lineHeight: 1.6 }}>{q}</span>
                    </div>
                  ))}
                </Card>
              )}

              {/* Topics */}
              {result.topics?.length > 0 && (
                <Card>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.textSub, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Topics</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {result.topics.map(t => <Badge key={t} color={T.textSub}>{t}</Badge>)}
                  </div>
                </Card>
              )}

              <button onClick={() => { setResult(null); setTranscript(""); setMeetingTitle(""); setPushed(false); }} style={{
                padding: "9px", borderRadius: 8, border: `1px solid ${T.border}`, background: "none", color: T.textSub, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                <RefreshCw size={11} /> Analyze another transcript
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// STEP 11 — MEETING LIBRARY
// ═══════════════════════════════════════════════════════════════════════
function Library({ onNav }) {
  const [q, setQ] = useState("");
  const results = MEETINGS.filter(m =>
    !q || m.title.toLowerCase().includes(q.toLowerCase()) ||
    m.topics.some(t => t.toLowerCase().includes(q.toLowerCase())) ||
    m.platform.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 21, fontWeight: 600, color: T.text, margin: 0, letterSpacing: "-0.02em" }}>Meeting Library</h1>
        <p style={{ color: T.textSub, fontSize: 13, marginTop: 4 }}>Searchable archive of all past meetings, summaries, and transcripts</p>
      </div>
      <div style={{ position: "relative", marginBottom: 18 }}>
        <Search size={14} color={T.textFaint} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by title, topic, participant, decision, or action item…" style={{ width: "100%", height: 40, paddingLeft: 38, paddingRight: 16, background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 9, color: T.text, fontSize: 13, outline: "none", fontFamily: "inherit" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {results.map(m => (
          <div key={m.id} onClick={() => onNav("summary")}
            style={{ background: T.bg2, borderRadius: T.rLg, padding: "16px 20px", border: `1px solid ${T.border}`, cursor: "pointer", transition: "border-color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.teal + "50"}
            onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: T.text, marginBottom: 3 }}>{m.title}</div>
                <div style={{ fontSize: 11, color: T.textFaint }}>{m.date} · {m.duration} min · {m.participants} participants · {m.platform}</div>
              </div>
              <ChevronRight size={14} color={T.textFaint} style={{ marginTop: 2 }} />
            </div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              <Badge color={T.blue}>{m.decisions} decisions</Badge>
              <Badge color={T.green}>{m.actions} actions</Badge>
              {m.questions > 0 && <Badge color={T.amber}>{m.questions} open {m.questions === 1 ? "question" : "questions"}</Badge>}
              {m.topics.slice(0, 3).map(t => <Badge key={t} color={T.textFaint}>{t}</Badge>)}
            </div>
          </div>
        ))}
        {results.length === 0 && <div style={{ padding: 40, textAlign: "center", color: T.textFaint, fontSize: 13 }}>No meetings found for "{q}"</div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// STEP 12 — ANALYTICS
// ═══════════════════════════════════════════════════════════════════════
function Analytics({ actions }) {
  const done = actions.filter(a => a.status === "done").length;
  const inProg = actions.filter(a => a.status === "in-progress").length;
  const overdue = actions.filter(a => a.status === "overdue").length;
  const todo = actions.filter(a => a.status === "todo").length;
  const total = actions.length;

  const weekly = [
    { w: "W10", meetings: 9, rate: 68 }, { w: "W11", meetings: 12, rate: 73 },
    { w: "W12", meetings: 8, rate: 71 }, { w: "W13", meetings: 11, rate: 69 },
    { w: "W14", meetings: 7, rate: 74 },
  ];
  const maxM = Math.max(...weekly.map(d => d.meetings));
  const topics = [
    { name: "Performance", count: 18 }, { name: "Architecture", count: 15 },
    { name: "Roadmap", count: 12 }, { name: "Compliance", count: 9 },
    { name: "Hiring", count: 7 }, { name: "Research", count: 5 },
  ];
  const people = [
    { name: "Maya", i: "MC", c: T.teal, rate: 84 }, { name: "Raj", i: "RK", c: T.purple, rate: 78 },
    { name: "Priya", i: "PD", c: T.amber, rate: 71 }, { name: "Alex", i: "AT", c: T.blue, rate: 63 },
  ];
  const donutItems = [
    { count: done, color: T.green, label: "Done", id: "done" },
    { count: inProg, color: T.blue, label: "In progress", id: "inprog" },
    { count: todo, color: T.textFaint, label: "To do", id: "todo" },
    { count: overdue, color: T.red, label: "Overdue", id: "over" },
  ];
  const circ = 2 * Math.PI * 32;
  let cumOffset = 0;

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 21, fontWeight: 600, color: T.text, margin: 0, letterSpacing: "-0.02em" }}>Analytics</h1>
        <p style={{ color: T.textSub, fontSize: 13, marginTop: 4 }}>Organization-wide meeting intelligence · Last 30 days</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 22 }}>
        <StatCard label="Total meetings" value="47" sub="5 this week" icon={Video} iconColor={T.blue} />
        <StatCard label="Action items" value="183" sub="Created this month" icon={CheckSquare} iconColor={T.teal} />
        <StatCard label="Completion rate" value={`${Math.round(done / total * 100)}%`} sub="↑ +6% vs last month" subColor={T.green} icon={TrendingUp} iconColor={T.green} />
        <StatCard label="Hrs in meetings" value="94h" sub="Saved 18h vs target" subColor={T.green} icon={Clock} iconColor={T.amber} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 500, color: T.text, marginBottom: 20 }}>Meetings per week</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100, padding: "0 4px" }}>
            {weekly.map((d, i) => (
              <div key={d.w} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, height: "100%", justifyContent: "flex-end" }}>
                <span style={{ fontSize: 10, color: T.textFaint }}>{d.meetings}</span>
                <div style={{ width: "100%", height: `${(d.meetings / maxM) * 70}px`, background: i === weekly.length - 1 ? T.teal + "cc" : T.blue + "60", borderRadius: "4px 4px 0 0" }} />
                <span style={{ fontSize: 10, color: T.textFaint }}>{d.w}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 500, color: T.text, marginBottom: 16 }}>Action item breakdown</div>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <svg width={80} height={80} viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke={T.bg4} strokeWidth="14" />
              {donutItems.map((item) => {
                const dash = (item.count / total) * circ;
                const el = (
                  <circle key={item.id} cx="40" cy="40" r="32" fill="none"
                    stroke={item.color} strokeWidth="13"
                    strokeDasharray={`${dash} ${circ - dash}`}
                    strokeDashoffset={-cumOffset}
                    transform="rotate(-90 40 40)" />
                );
                cumOffset += dash;
                return el;
              })}
              <text x="40" y="44" textAnchor="middle" fontSize="13" fontWeight="600" fill={T.text}>{total}</text>
            </svg>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              {donutItems.map(item => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: item.color }} />
                  <span style={{ flex: 1, color: T.textSub }}>{item.label}</span>
                  <span style={{ color: T.text, fontWeight: 500 }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 500, color: T.text, marginBottom: 16 }}>Most discussed topics</div>
          {topics.map(t => (
            <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}>
              <span style={{ fontSize: 12, color: T.textSub, width: 88, flexShrink: 0 }}>{t.name}</span>
              <div style={{ flex: 1, height: 5, background: T.bg4, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${(t.count / topics[0].count) * 100}%`, height: "100%", background: T.blue + "90", borderRadius: 3 }} />
              </div>
              <span style={{ fontSize: 11, color: T.textFaint, width: 20, textAlign: "right" }}>{t.count}</span>
            </div>
          ))}
        </Card>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 500, color: T.text, marginBottom: 16 }}>Completion rate by person</div>
          {people.map(p => (
            <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 13 }}>
              <Avatar initials={p.i} color={p.c} size={26} />
              <span style={{ fontSize: 12, color: T.textSub, width: 46 }}>{p.name}</span>
              <div style={{ flex: 1, height: 5, background: T.bg4, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${p.rate}%`, height: "100%", background: p.rate >= 75 ? T.green + "90" : T.amber + "90", borderRadius: 3 }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.text, width: 36, textAlign: "right" }}>{p.rate}%</span>
            </div>
          ))}
          <div style={{ marginTop: 6, padding: "10px 0", borderTop: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 12, color: T.textSub, flex: 1 }}>Team average</div>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.teal }}>{Math.round(people.reduce((a, p) => a + p.rate, 0) / people.length)}%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// STEP 13 — REMINDERS & NOTIFICATION RULES
// ═══════════════════════════════════════════════════════════════════════
function Reminders({ actions }) {
  const [rules, setRules] = useState([
    { id: "r1", name: "Due date reminder", trigger: "24 hours before due date", channels: ["Email", "Slack"], active: true },
    { id: "r2", name: "Overdue escalation", trigger: "1 day after due date", channels: ["Email", "Manager"], active: true },
    { id: "r3", name: "Weekly digest", trigger: "Every Monday at 8:00 AM", channels: ["Email"], active: false },
    { id: "r4", name: "Meeting summary delivery", trigger: "Within 5 min of meeting end", channels: ["Email", "Slack"], active: true },
    { id: "r5", name: "In-progress stale alert", trigger: "No update for 3 days", channels: ["Slack"], active: true },
  ]);
  const toggleRule = id => setRules(rs => rs.map(r => r.id === id ? { ...r, active: !r.active } : r));
  const upcoming = actions.filter(a => a.status !== "done" && a.status !== "overdue");
  const overdueItems = actions.filter(a => a.status === "overdue");

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 21, fontWeight: 600, color: T.text, margin: 0, letterSpacing: "-0.02em" }}>Reminders</h1>
        <p style={{ color: T.textSub, fontSize: 13, marginTop: 4 }}>Automated follow-up rules, escalation paths, and notification channels</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.textSub, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 16 }}>Reminder rules</div>
            {rules.map((rule, i) => (
              <div key={rule.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 0", borderBottom: i < rules.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <div onClick={() => toggleRule(rule.id)} style={{ width: 36, height: 20, borderRadius: 10, background: rule.active ? T.teal : T.bg4, border: `1px solid ${rule.active ? T.teal : T.border}`, cursor: "pointer", flexShrink: 0, position: "relative", transition: "all 0.2s", marginTop: 2 }}>
                  <div style={{ position: "absolute", top: 2, left: rule.active ? 16 : 2, width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{rule.name}</div>
                  <div style={{ fontSize: 11, color: T.textFaint, marginTop: 2 }}>{rule.trigger}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                    {rule.channels.map(ch => <Badge key={ch} color={T.textFaint}>{ch}</Badge>)}
                  </div>
                </div>
              </div>
            ))}
          </Card>
          <Card>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.textSub, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Notification channels</div>
            {[
              { name: "Email", detail: "you@company.com", connected: true },
              { name: "Slack", detail: "#action-items channel", connected: true },
              { name: "Asana", detail: "Tasks synced directly", connected: true },
              { name: "Jira", detail: "Not configured", connected: false },
              { name: "Google Calendar", detail: "Calendar events synced", connected: true },
            ].map((ch, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < 4 ? `1px solid ${T.border}` : "none" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: ch.connected ? T.green : T.textFaint, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: T.text }}>{ch.name}</div>
                  <div style={{ fontSize: 11, color: T.textFaint }}>{ch.detail}</div>
                </div>
                <Badge color={ch.connected ? T.green : T.textFaint}>{ch.connected ? "Connected" : "Setup required"}</Badge>
              </div>
            ))}
          </Card>
        </div>
        <div>
          {overdueItems.length > 0 && (
            <div style={{ background: T.redFade, borderRadius: T.r, padding: "13px 15px", border: `1px solid ${T.red}30`, marginBottom: 16, display: "flex", gap: 10 }}>
              <AlertCircle size={14} color={T.red} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: T.red }}>{overdueItems.length} items overdue</div>
                <div style={{ fontSize: 12, color: T.red + "aa", marginTop: 3, lineHeight: 1.55 }}>
                  Escalation reminders sent to assignees and managers. Items: {overdueItems.map(a => a.text.slice(0, 30) + "…").join(", ")}
                </div>
              </div>
            </div>
          )}
          <Card>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.textSub, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 16 }}>Upcoming reminders</div>
            {upcoming.slice(0, 6).map((a, i) => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 0", borderBottom: i < Math.min(5, upcoming.length - 1) ? `1px solid ${T.border}` : "none" }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: T.amberFade, border: `1px solid ${T.amber}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Bell size={13} color={T.amber} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.text}</div>
                  <div style={{ fontSize: 11, color: T.textFaint }}>{a.assignee.split(" ")[0]} · Due {a.due}</div>
                </div>
                <span style={{ fontSize: 11, color: T.amber, flexShrink: 0 }}>24h notice</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// STEP 14 — MAIN APP (wires everything together)
// ═══════════════════════════════════════════════════════════════════════
export default function App() {
  const [view, setView] = useState("dashboard");
  const [actions, setActions] = useState(INIT_ACTIONS);

  const navigate = v => setView(v);
  const handleMeetingEnd = () => setView("summary");

  // Allows AI Analyzer to push new actions into the tracker
  const addActions = newActions => setActions(prev => [...newActions, ...prev]);

  const overdueCount = actions.filter(a => a.status === "overdue").length;

  return (
    <div style={{ display: "flex", height: "100vh", background: T.bg0, overflow: "hidden", fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif', fontSize: 14 }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.25} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes blink { 0%,100%{opacity:1}50%{opacity:0} }
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(0.5)}
        input[type=time]::-webkit-calendar-picker-indicator{filter:invert(0.5)}
        select option{background:#121620;color:#f1f5f9}
        button{font-family:inherit}
        textarea{font-family:inherit}
      `}</style>
      <Sidebar current={view} onNav={navigate} overdueCount={overdueCount} />
      <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
        {view === "dashboard" && <Dashboard onNav={navigate} actions={actions} />}
        {view === "setup" && <MeetingSetup onNav={navigate} />}
        {view === "live" && <LiveMeeting onEnd={handleMeetingEnd} onAddActions={addActions} />}
        {view === "summary" && <SummaryView />}
        {view === "tracker" && <ActionTracker actions={actions} setActions={setActions} />}
        {view === "analyze" && <AIAnalyzer onAddActions={addActions} />}
        {view === "library" && <Library onNav={navigate} />}
        {view === "analytics" && <Analytics actions={actions} />}
        {view === "reminders" && <Reminders actions={actions} />}
      </main>
    </div>
  );
}

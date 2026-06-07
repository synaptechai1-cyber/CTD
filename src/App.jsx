import { useState } from "react";

// ── Proxy URL — update this after deploying your Cloudflare Worker ──
export const PROXY_URL = "https://ctd-africa-proxy.YOUR-SUBDOMAIN.workers.dev";


import Dashboard from "./components/Dashboard";
import LeadFinder from "./components/LeadFinder";
import CRM from "./components/CRM";
import OutreachWriter from "./components/OutreachWriter";
import ContentGenerator from "./components/ContentGenerator";
import Settings from "./components/Settings";

const NAV = [
  { id: "dashboard", label: "Dashboard",        icon: "⚡" },
  { id: "leads",     label: "Lead Finder",       icon: "🎯" },
  { id: "crm",       label: "CRM",               icon: "📊" },
  { id: "outreach",  label: "Outreach",           icon: "✉️" },
  { id: "content",   label: "Content Generator", icon: "✍️" },
  { id: "settings",  label: "Settings",           icon: "⚙️" },
];

export default function App() {
  const [active, setActive]   = useState("dashboard");
  const [leads,  setLeads]    = useState([]);
  const [apiKey, setApiKey]   = useState(localStorage.getItem("claude_key") || "");

  const addLeads   = (nl)  => setLeads(p => [...p, ...nl]);
  const updateLead = (id, u) => setLeads(p => p.map(l => l.id === id ? { ...l, ...u } : l));

  const pages = { dashboard: Dashboard, leads: LeadFinder, crm: CRM,
                  outreach: OutreachWriter, content: ContentGenerator, settings: Settings };
  const Page = pages[active];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
              <circle cx="20" cy="20" r="19" stroke="#F5A623" strokeWidth="2"/>
              <circle cx="12" cy="24" r="5" fill="#F5A623"/>
              <circle cx="22" cy="14" r="3.5" fill="#F5A623"/>
              <circle cx="30" cy="22" r="3" fill="#F5A623"/>
              <line x1="12" y1="24" x2="22" y2="14" stroke="#F5A623" strokeWidth="2"/>
              <line x1="22" y1="14" x2="30" y2="22" stroke="#F5A623" strokeWidth="2"/>
            </svg>
          </div>
          <div>
            <p className="brand-name">CTD Africa</p>
            <p className="brand-sub">Growth Engine</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(n => (
            <button key={n.id}
              className={`nav-item ${active === n.id ? "active" : ""}`}
              onClick={() => setActive(n.id)}>
              <span className="nav-icon">{n.icon}</span>
              <span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="status-dot" />
          <span>Engine Active</span>
        </div>
      </aside>
      <main className="main">
        <Page leads={leads} addLeads={addLeads} updateLead={updateLead}
              apiKey={apiKey} setApiKey={setApiKey} setActive={setActive} />
      </main>
    </div>
  );
}

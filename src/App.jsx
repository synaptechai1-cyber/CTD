import { useState } from "react";
import Dashboard from "./components/Dashboard";
import LeadFinder from "./components/LeadFinder";
import CRM from "./components/CRM";
import OutreachWriter from "./components/OutreachWriter";
import Settings from "./components/Settings";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "⚡" },
  { id: "leads", label: "Lead Finder", icon: "🎯" },
  { id: "crm", label: "CRM", icon: "📊" },
  { id: "outreach", label: "Outreach", icon: "✉️" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

export default function App() {
  const [active, setActive] = useState("dashboard");
  const [leads, setLeads] = useState([]);
  const [apiKey, setApiKey] = useState(localStorage.getItem("claude_key") || "");

  const addLeads = (newLeads) => setLeads(prev => [...prev, ...newLeads]);
  const updateLead = (id, updates) =>
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));

  const pages = { dashboard: Dashboard, leads: LeadFinder, crm: CRM, outreach: OutreachWriter, settings: Settings };
  const Page = pages[active];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">D</div>
          <div>
            <p className="brand-name">Dasha P</p>
            <p className="brand-sub">Outreach Engine</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(n => (
            <button
              key={n.id}
              className={`nav-item ${active === n.id ? "active" : ""}`}
              onClick={() => setActive(n.id)}
            >
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
        <Page
          leads={leads}
          addLeads={addLeads}
          updateLead={updateLead}
          apiKey={apiKey}
          setApiKey={setApiKey}
          setActive={setActive}
        />
      </main>
    </div>
  );
}

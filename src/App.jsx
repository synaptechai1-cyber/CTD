import { useState } from "react";
import Dashboard        from "./components/Dashboard";
import LeadFinder       from "./components/LeadFinder";
import CRM              from "./components/CRM";
import OutreachWriter   from "./components/OutreachWriter";
import ContentGenerator from "./components/ContentGenerator";
import Settings         from "./components/Settings";

const NAV = [
  { id: "dashboard", label: "Dashboard",         icon: "⚡" },
  { id: "leads",     label: "Lead Finder",        icon: "🎯" },
  { id: "crm",       label: "CRM",                icon: "📊" },
  { id: "outreach",  label: "Outreach Writer",    icon: "✉️" },
  { id: "content",   label: "Content Generator",  icon: "✍️" },
  { id: "settings",  label: "Settings",           icon: "⚙️" },
];

const PAGES = { dashboard: Dashboard, leads: LeadFinder, crm: CRM,
                outreach: OutreachWriter, content: ContentGenerator, settings: Settings };

export default function App() {
  const [active,     setActive]     = useState("dashboard");
  const [leads,      setLeads]      = useState([]);
  const [sidebarOpen,setSidebarOpen]= useState(false);

  const addLeads   = (nl) => setLeads(p => [...p, ...nl]);
  const updateLead = (id, u) => setLeads(p => p.map(l => l.id === id ? { ...l, ...u } : l));
  const Page = PAGES[active];

  return (
    <div className="app">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="22" r="6"  fill="#F5A623" opacity="0.9"/>
              <circle cx="22" cy="10" r="4"  fill="#F5A623" opacity="0.7"/>
              <circle cx="30" cy="24" r="3"  fill="#F5A623" opacity="0.6"/>
              <line x1="10" y1="22" x2="22" y2="10" stroke="#F5A623" strokeWidth="2" opacity="0.8"/>
              <line x1="22" y1="10" x2="30" y2="24" stroke="#F5A623" strokeWidth="2" opacity="0.8"/>
              <line x1="10" y1="22" x2="30" y2="24" stroke="#F5A623" strokeWidth="1.5" opacity="0.4"/>
            </svg>
          </div>
          <div className="brand-text">
            <p className="brand-name">CTD Africa</p>
            <p className="brand-sub">Growth Engine</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(n => (
            <button key={n.id}
              className={`nav-item ${active === n.id ? "active" : ""}`}
              onClick={() => { setActive(n.id); setSidebarOpen(false); }}>
              <span className="nav-icon">{n.icon}</span>
              <span className="nav-label">{n.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="pulse-dot" />
          <span>Engine Active</span>
        </div>
      </aside>

      <div className="main-wrap">
        <header className="topbar">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(s => !s)}>☰</button>
          <span className="topbar-title">{NAV.find(n => n.id === active)?.label}</span>
          <span className="topbar-brand">CTD Africa</span>
        </header>
        <main className="main">
          <Page leads={leads} addLeads={addLeads} updateLead={updateLead} setActive={setActive} />
        </main>
      </div>
    </div>
  );
}

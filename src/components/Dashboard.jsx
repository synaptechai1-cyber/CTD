import { CTD_SERVICES, CTD_INFO } from "../config";

export default function Dashboard({ leads, setActive }) {
  const total     = leads.length;
  const qualified = leads.filter(l => l.score >= 7).length;
  const contacted = leads.filter(l => l.status === "contacted").length;
  const replied   = leads.filter(l => l.status === "replied").length;
  const converted = leads.filter(l => l.status === "converted").length;
  const followups = leads.filter(l => l.followupDate && new Date(l.followupDate) <= new Date()).length;

  const stats = [
    { label: "Total Leads",  value: total,     color: "#F5A623", icon: "🎯" },
    { label: "Qualified",    value: qualified, color: "#00d4aa", icon: "⭐" },
    { label: "Contacted",    value: contacted, color: "#45aaf2", icon: "✉️" },
    { label: "Replied",      value: replied,   color: "#26de81", icon: "💬" },
    { label: "Converted",    value: converted, color: "#fd9644", icon: "🏆" },
    { label: "Follow-ups",   value: followups, color: followups > 0 ? "#fc5c65" : "#94a3b8", icon: "📅" },
  ];

  const pipeline = [
    { label: "New",         count: leads.filter(l => !l.status || l.status === "new").length, color: "#F5A623" },
    { label: "Qualified",   count: qualified,   color: "#00d4aa" },
    { label: "Contacted",   count: contacted,   color: "#45aaf2" },
    { label: "Followed Up", count: leads.filter(l => l.status === "followup").length, color: "#a29bfe" },
    { label: "Replied",     count: replied,     color: "#26de81" },
    { label: "Converted",   count: converted,   color: "#fd9644" },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Command Centre</h1>
          <p className="page-sub">{CTD_INFO.full} · {CTD_INFO.email}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setActive("leads")}>+ Find Leads</button>
      </div>

      <div className="stats-grid">
        {stats.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.color + "20", color: s.color }}>{s.icon}</div>
            <div>
              <p className="stat-num" style={{ color: s.color }}>{s.value}</p>
              <p className="stat-label">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        {/* Pipeline */}
        <div className="card">
          <div className="card-header"><h3>Sales Pipeline</h3></div>
          <div className="pipeline-body">
            {pipeline.map(p => (
              <div className="pipeline-row" key={p.label}>
                <span className="pl-label">{p.label}</span>
                <div className="pl-track">
                  <div className="pl-bar" style={{
                    width: total ? `${Math.max(5, (p.count / total) * 100)}%` : "5%",
                    background: p.color
                  }} />
                </div>
                <span className="pl-count" style={{ color: p.color }}>{p.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent leads */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Leads</h3>
            <button className="btn-link" onClick={() => setActive("crm")}>View all →</button>
          </div>
          {leads.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎯</div>
              <p>No leads yet</p>
              <button className="btn btn-primary btn-sm" onClick={() => setActive("leads")}>Find Leads</button>
            </div>
          ) : (
            <div className="lead-list">
              {[...leads].reverse().slice(0, 6).map(l => (
                <div className="lead-row" key={l.id}>
                  <div className="avatar">{l.name?.[0] || "?"}</div>
                  <div className="lead-info">
                    <p className="lead-name">{l.name}</p>
                    <p className="lead-sub">{l.title} · {l.company}</p>
                  </div>
                  <div style={{ display: "flex", gap: ".4rem", alignItems: "center", flexShrink: 0 }}>
                    <span className={`badge badge-${l.status || "new"}`}>{l.status || "new"}</span>
                    <span className={`score-chip ${l.score >= 8 ? "high" : l.score >= 6 ? "mid" : "low"}`}>{l.score}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Services */}
        <div className="card">
          <div className="card-header"><h3>CTD Services Portfolio</h3></div>
          <div className="services-list">
            {CTD_SERVICES.map(s => (
              <div className="service-row" key={s.id}>
                <div>
                  <p className="service-name">{s.label}</p>
                  <p className="service-desc">{s.desc}</p>
                </div>
                <span className="service-price">{s.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Follow-ups due */}
        <div className="card">
          <div className="card-header"><h3>Follow-ups Due</h3></div>
          {followups === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <p>All clear — no follow-ups overdue</p>
            </div>
          ) : (
            <div className="lead-list">
              {leads.filter(l => l.followupDate && new Date(l.followupDate) <= new Date()).map(l => (
                <div className="lead-row" key={l.id}>
                  <div className="avatar">{l.name?.[0]}</div>
                  <div className="lead-info">
                    <p className="lead-name">{l.name}</p>
                    <p className="lead-sub" style={{ color: "#fc5c65" }}>⚠️ Follow-up overdue</p>
                  </div>
                  <button className="btn btn-sm btn-outline" onClick={() => setActive("crm")}>View</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

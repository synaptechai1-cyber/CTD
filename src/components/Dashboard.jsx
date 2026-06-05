export default function Dashboard({ leads, setActive }) {
  const total = leads.length;
  const qualified = leads.filter(l => l.score >= 7).length;
  const contacted = leads.filter(l => l.status === "contacted").length;
  const replied = leads.filter(l => l.status === "replied").length;
  const converted = leads.filter(l => l.status === "converted").length;

  const recentLeads = [...leads].reverse().slice(0, 5);

  const stats = [
    { label: "Total Leads", value: total, icon: "🎯", color: "#6c63ff" },
    { label: "Qualified", value: qualified, icon: "⭐", color: "#00d4aa" },
    { label: "Contacted", value: contacted, icon: "✉️", color: "#f7b731" },
    { label: "Replied", value: replied, icon: "💬", color: "#45aaf2" },
    { label: "Converted", value: converted, icon: "🏆", color: "#26de81" },
    { label: "Conv. Rate", value: total ? `${Math.round((converted/total)*100)}%` : "0%", icon: "📈", color: "#fd9644" },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Command Centre</h1>
          <p className="page-sub">Dasha P · Executive Communication Coaching · UK / EU / Americas</p>
        </div>
        <button className="btn btn-primary" onClick={() => setActive("leads")}>
          + Find New Leads
        </button>
      </div>

      <div className="stats-grid">
        {stats.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.color + "22", color: s.color }}>{s.icon}</div>
            <div>
              <p className="stat-value" style={{ color: s.color }}>{s.value}</p>
              <p className="stat-label">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <div className="card">
          <div className="card-header">
            <h3>Pipeline Overview</h3>
          </div>
          <div className="pipeline">
            {[
              { label: "New Leads", count: leads.filter(l => l.status === "new").length, color: "#6c63ff" },
              { label: "Qualified", count: qualified, color: "#00d4aa" },
              { label: "Contacted", count: contacted, color: "#f7b731" },
              { label: "Followed Up", count: leads.filter(l => l.status === "followup").length, color: "#45aaf2" },
              { label: "Replied", count: replied, color: "#26de81" },
              { label: "Converted", count: converted, color: "#fd9644" },
            ].map(p => (
              <div className="pipeline-row" key={p.label}>
                <span className="pipeline-label">{p.label}</span>
                <div className="pipeline-bar-wrap">
                  <div
                    className="pipeline-bar"
                    style={{
                      width: total ? `${Math.max(4, (p.count / total) * 100)}%` : "4%",
                      background: p.color
                    }}
                  />
                </div>
                <span className="pipeline-count" style={{ color: p.color }}>{p.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Recent Leads</h3>
            <button className="btn-link" onClick={() => setActive("crm")}>View all →</button>
          </div>
          {recentLeads.length === 0 ? (
            <div className="empty-state">
              <p>🎯</p>
              <p>No leads yet — start the engine</p>
              <button className="btn btn-primary" onClick={() => setActive("leads")}>Find Leads</button>
            </div>
          ) : (
            <div className="lead-list">
              {recentLeads.map(l => (
                <div className="lead-row" key={l.id}>
                  <div className="lead-avatar">{l.name?.[0] || "?"}</div>
                  <div className="lead-info">
                    <p className="lead-name">{l.name}</p>
                    <p className="lead-title">{l.title} · {l.company}</p>
                  </div>
                  <div className="lead-meta">
                    <span className={`badge badge-${l.status || "new"}`}>{l.status || "new"}</span>
                    <span className="score-pill">{l.score}/10</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header"><h3>Target Profile</h3></div>
          <div className="target-profile">
            <div className="tp-item"><span className="tp-label">Client</span><span>Dasha P</span></div>
            <div className="tp-item"><span className="tp-label">Service</span><span>Executive Communication Coaching</span></div>
            <div className="tp-item"><span className="tp-label">Target Titles</span><span>VP, Director, C-Suite, Head of</span></div>
            <div className="tp-item"><span className="tp-label">Industries</span><span>Finance, Tech, Consulting, Healthcare</span></div>
            <div className="tp-item"><span className="tp-label">Regions</span><span>🇬🇧 UK · 🇪🇺 EU · 🇺🇸 US · 🌎 LatAm</span></div>
            <div className="tp-item"><span className="tp-label">Goal</span><span>10 qualified clients / month</span></div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Follow-ups Due</h3></div>
          {leads.filter(l => l.followupDate && new Date(l.followupDate) <= new Date()).length === 0 ? (
            <div className="empty-state"><p>✅</p><p>No follow-ups due</p></div>
          ) : (
            <div className="lead-list">
              {leads.filter(l => l.followupDate && new Date(l.followupDate) <= new Date()).map(l => (
                <div className="lead-row" key={l.id}>
                  <div className="lead-avatar">{l.name?.[0]}</div>
                  <div className="lead-info">
                    <p className="lead-name">{l.name}</p>
                    <p className="lead-title">Follow-up overdue</p>
                  </div>
                  <span className="badge badge-followup">Due</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

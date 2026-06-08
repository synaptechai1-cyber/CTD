import { useState } from "react";

const STATUSES = ["new","qualified","contacted","followup","replied","converted","rejected"];
const STATUS_COLORS = {
  new: "#F5A623", qualified: "#00d4aa", contacted: "#45aaf2",
  followup: "#a29bfe", replied: "#26de81", converted: "#fd9644", rejected: "#fc5c65",
};

export default function CRM({ leads, updateLead, setActive }) {
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterScore,  setFilterScore]  = useState("all");
  const [drawer,       setDrawer]       = useState(null);
  const [editNotes,    setEditNotes]    = useState("");

  const filtered = leads.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      l.name?.toLowerCase().includes(q) ||
      l.company?.toLowerCase().includes(q) ||
      l.title?.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || l.status === filterStatus;
    const matchScore  = filterScore  === "all" ||
      (filterScore === "high" && l.score >= 8) ||
      (filterScore === "mid"  && l.score >= 6 && l.score < 8) ||
      (filterScore === "low"  && l.score < 6);
    return matchSearch && matchStatus && matchScore;
  });

  const openDrawer = (l) => { setDrawer(l); setEditNotes(l.notes || ""); };
  const closeDrawer = () => setDrawer(null);

  const changeStatus = (id, status) => {
    updateLead(id, { status });
    if (drawer?.id === id) setDrawer(p => ({ ...p, status }));
  };

  const saveNotes = () => {
    updateLead(drawer.id, { notes: editNotes });
    setDrawer(p => ({ ...p, notes: editNotes }));
  };

  const setFollowup = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    updateLead(drawer.id, { followupDate: d.toISOString() });
    setDrawer(p => ({ ...p, followupDate: d.toISOString() }));
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>CRM</h1>
          <p className="page-sub">{leads.length} leads · {leads.filter(l => l.status === "converted").length} converted</p>
        </div>
        <button className="btn btn-primary" onClick={() => setActive("leads")}>+ Find More</button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <input className="search-box" placeholder="🔍 Search name, company, title..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select value={filterScore} onChange={e => setFilterScore(e.target.value)}>
          <option value="all">All Scores</option>
          <option value="high">High (8-10)</option>
          <option value="mid">Mid (6-7)</option>
          <option value="low">Low (1-5)</option>
        </select>
        <span className="filter-count">{filtered.length} results</span>
      </div>

      {leads.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: "4rem" }}>
            <div className="empty-icon">📊</div>
            <p>No leads in CRM yet</p>
            <button className="btn btn-primary" onClick={() => setActive("leads")}>Go to Lead Finder</button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th><th>Title</th><th>Company</th>
                  <th>Region</th><th>Score</th><th>Status</th>
                  <th>Follow-up</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id} className={drawer?.id === l.id ? "row-active" : ""}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                        <div className="avatar sm">{l.name?.[0]}</div>
                        <div>
                          <p className="lead-name">{l.name}</p>
                          <p className="lead-sub">{l.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>{l.title}</td>
                    <td>{l.company}</td>
                    <td>{l.region}</td>
                    <td>
                      <span className={`score-chip ${l.score >= 8 ? "high" : l.score >= 6 ? "mid" : "low"}`}>
                        {l.score}/10
                      </span>
                    </td>
                    <td>
                      <select className="status-sel"
                        value={l.status || "new"}
                        onChange={e => changeStatus(l.id, e.target.value)}
                        style={{ borderColor: STATUS_COLORS[l.status || "new"] }}>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      {l.followupDate ? (
                        <span className={new Date(l.followupDate) <= new Date() ? "followup-due" : "followup-ok"}>
                          {new Date(l.followupDate) <= new Date() ? "⚠️ " : "📅 "}
                          {new Date(l.followupDate).toLocaleDateString()}
                        </span>
                      ) : <span style={{ color: "var(--text3)" }}>—</span>}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: ".3rem" }}>
                        <button className="icon-btn" title="View" onClick={() => openDrawer(l)}>👁️</button>
                        <button className="icon-btn" title="Outreach" onClick={() => setActive("outreach")}>✉️</button>
                        <a className="icon-btn" href={l.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn">🔗</a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drawer */}
      {drawer && (
        <div className="drawer-overlay" onClick={closeDrawer}>
          <div className="drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-top">
              <div className="avatar lg">{drawer.name?.[0]}</div>
              <div style={{ flex: 1 }}>
                <h3>{drawer.name}</h3>
                <p>{drawer.title} · {drawer.company}</p>
                <p style={{ color: "var(--text3)", fontSize: ".78rem" }}>{drawer.region} · {drawer.industry}</p>
              </div>
              <button className="close-btn" onClick={closeDrawer}>✕</button>
            </div>

            <div className="drawer-body">
              <div className="drawer-section">
                <label>Status</label>
                <select className="status-sel full-w"
                  value={drawer.status || "new"}
                  onChange={e => changeStatus(drawer.id, e.target.value)}
                  style={{ borderColor: STATUS_COLORS[drawer.status || "new"] }}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="drawer-section">
                <label>Contact</label>
                <p style={{ fontSize: ".84rem", color: "var(--text2)" }}>📧 {drawer.email}</p>
                <a href={drawer.linkedin} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: ".84rem", color: "var(--orange)" }}>🔗 LinkedIn Profile</a>
              </div>

              <div className="drawer-section">
                <label>AI Score — {drawer.score}/10</label>
                <div className="score-bar-wrap">
                  <div className="score-bar-track">
                    <div className="score-bar-fill" style={{
                      width: `${drawer.score * 10}%`,
                      background: drawer.score >= 8 ? "#26de81" : drawer.score >= 6 ? "#F5A623" : "#fc5c65"
                    }} />
                  </div>
                </div>
                {drawer.qualificationReason && (
                  <p style={{ fontSize: ".78rem", color: "var(--text3)", fontStyle: "italic", marginTop: ".4rem" }}>
                    "{drawer.qualificationReason}"
                  </p>
                )}
              </div>

              <div className="drawer-section">
                <label>Set Follow-up</label>
                <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                  {[3, 7, 14, 30].map(d => (
                    <button key={d} className="btn btn-sm btn-outline" onClick={() => setFollowup(d)}>+{d} days</button>
                  ))}
                </div>
                {drawer.followupDate && (
                  <p style={{ fontSize: ".78rem", color: "var(--blue)", marginTop: ".4rem" }}>
                    📅 Set for {new Date(drawer.followupDate).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="drawer-section">
                <label>Notes</label>
                <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)}
                  placeholder="Notes about this lead..." rows={4} />
                <button className="btn btn-sm btn-primary" style={{ marginTop: ".5rem" }} onClick={saveNotes}>
                  Save Notes
                </button>
              </div>

              {drawer.emailDraft && (
                <div className="drawer-section">
                  <label>Last Email Draft</label>
                  <div className="email-preview-box">{drawer.emailDraft}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

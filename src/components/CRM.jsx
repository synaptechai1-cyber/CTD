import { useState } from "react";

const STATUSES = ["new", "qualified", "contacted", "followup", "replied", "converted", "rejected"];

const STATUS_COLORS = {
  new: "#6c63ff",
  qualified: "#00d4aa",
  contacted: "#f7b731",
  followup: "#45aaf2",
  replied: "#26de81",
  converted: "#fd9644",
  rejected: "#fc5c65",
};

export default function CRM({ leads, updateLead, setActive }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterScore, setFilterScore] = useState("all");
  const [selected, setSelected] = useState(null);
  const [editNotes, setEditNotes] = useState("");

  const filtered = leads.filter(l => {
    const matchSearch = !search || l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.company?.toLowerCase().includes(search.toLowerCase()) ||
      l.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || l.status === filterStatus;
    const matchScore = filterScore === "all" ||
      (filterScore === "high" && l.score >= 8) ||
      (filterScore === "mid" && l.score >= 6 && l.score < 8) ||
      (filterScore === "low" && l.score < 6);
    return matchSearch && matchStatus && matchScore;
  });

  const openLead = (l) => { setSelected(l); setEditNotes(l.notes || ""); };
  const closeDrawer = () => setSelected(null);

  const saveNotes = () => {
    updateLead(selected.id, { notes: editNotes });
    setSelected(prev => ({ ...prev, notes: editNotes }));
  };

  const changeStatus = (id, status) => {
    updateLead(id, { status });
    if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
  };

  const setFollowup = (id, days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    updateLead(id, { followupDate: d.toISOString() });
    if (selected?.id === id) setSelected(prev => ({ ...prev, followupDate: d.toISOString() }));
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>CRM</h1>
          <p className="page-sub">{leads.length} total leads · {leads.filter(l => l.status === "converted").length} converted</p>
        </div>
        <button className="btn btn-primary" onClick={() => setActive("leads")}>+ Find More Leads</button>
      </div>

      {/* Filters */}
      <div className="crm-filters">
        <input
          className="search-input"
          placeholder="🔍 Search by name, company, title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
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
        <div className="card empty-page">
          <p style={{ fontSize: "3rem" }}>🎯</p>
          <h3>No leads yet</h3>
          <p>Use the Lead Finder to discover and qualify your first prospects</p>
          <button className="btn btn-primary" onClick={() => setActive("leads")}>Go to Lead Finder</button>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Title</th>
                  <th>Company</th>
                  <th>Region</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Follow-up</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id} className={selected?.id === l.id ? "row-selected" : ""}>
                    <td>
                      <div className="name-cell">
                        <div className="lead-avatar sm">{l.name?.[0]}</div>
                        <div>
                          <p className="lead-name">{l.name}</p>
                          <p className="lead-email">{l.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>{l.title}</td>
                    <td>{l.company}</td>
                    <td>{l.region}</td>
                    <td>
                      <span className={`score-pill score-${l.score >= 8 ? "high" : l.score >= 6 ? "mid" : "low"}`}>
                        {l.score}/10
                      </span>
                    </td>
                    <td>
                      <select
                        className="status-select"
                        value={l.status || "new"}
                        onChange={e => changeStatus(l.id, e.target.value)}
                        style={{ borderColor: STATUS_COLORS[l.status || "new"] }}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      {l.followupDate ? (
                        <span className={`followup-date ${new Date(l.followupDate) <= new Date() ? "overdue" : ""}`}>
                          {new Date(l.followupDate) <= new Date() ? "⚠️ " : "📅 "}
                          {new Date(l.followupDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="no-followup">—</span>
                      )}
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn-icon" title="View Details" onClick={() => openLead(l)}>👁️</button>
                        <button className="btn-icon" title="Write Email" onClick={() => { setActive("outreach"); }}>✉️</button>
                        <a className="btn-icon" href={l.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn">🔗</a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lead Drawer */}
      {selected && (
        <div className="drawer-overlay" onClick={closeDrawer}>
          <div className="drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="drawer-avatar">{selected.name?.[0]}</div>
              <div>
                <h3>{selected.name}</h3>
                <p>{selected.title} · {selected.company}</p>
                <p className="drawer-region">{selected.region} · {selected.industry}</p>
              </div>
              <button className="drawer-close" onClick={closeDrawer}>✕</button>
            </div>

            <div className="drawer-body">
              <div className="drawer-section">
                <label>Status</label>
                <select
                  value={selected.status || "new"}
                  onChange={e => changeStatus(selected.id, e.target.value)}
                  className="status-select full"
                  style={{ borderColor: STATUS_COLORS[selected.status || "new"] }}
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="drawer-section">
                <label>Contact</label>
                <p className="drawer-email">📧 {selected.email}</p>
                <a href={selected.linkedin} target="_blank" rel="noopener noreferrer" className="drawer-linkedin">🔗 View LinkedIn Profile</a>
              </div>

              <div className="drawer-section">
                <label>Qualification Score</label>
                <div className="score-bar-wrap">
                  <div className="score-bar" style={{ width: `${selected.score * 10}%`, background: selected.score >= 8 ? "#26de81" : selected.score >= 6 ? "#f7b731" : "#fc5c65" }} />
                  <span>{selected.score}/10</span>
                </div>
                {selected.qualificationReason && <p className="qual-reason">"{selected.qualificationReason}"</p>}
              </div>

              <div className="drawer-section">
                <label>Set Follow-up Reminder</label>
                <div className="followup-btns">
                  {[3, 7, 14].map(d => (
                    <button key={d} className="btn btn-sm btn-outline" onClick={() => setFollowup(selected.id, d)}>
                      +{d} days
                    </button>
                  ))}
                </div>
                {selected.followupDate && (
                  <p className="followup-set">📅 Set for {new Date(selected.followupDate).toLocaleDateString()}</p>
                )}
              </div>

              <div className="drawer-section">
                <label>Notes</label>
                <textarea
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  placeholder="Add notes about this lead..."
                  rows={4}
                />
                <button className="btn btn-sm btn-primary" onClick={saveNotes}>Save Notes</button>
              </div>

              {selected.emailDraft && (
                <div className="drawer-section">
                  <label>Last Email Draft</label>
                  <div className="email-preview">{selected.emailDraft}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

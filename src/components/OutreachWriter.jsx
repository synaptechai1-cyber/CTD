import { useState } from "react";
import { callClaude, CTD_INFO, CTD_SERVICES } from "../config";

const EMAIL_TYPES = [
  { id: "cold",      label: "Cold Outreach",       desc: "First contact — personalised intro" },
  { id: "followup1", label: "Follow-up #1 (Day 3)", desc: "Gentle nudge, no reply yet" },
  { id: "followup2", label: "Follow-up #2 (Day 7)", desc: "Value-add, share an insight" },
  { id: "followup3", label: "Follow-up #3 (Day 14)", desc: "Final email — leaves door open" },
  { id: "event",     label: "Event Hook",           desc: "Tie to upcoming launch or campaign" },
];

export default function OutreachWriter({ leads, updateLead, setActive }) {
  const [selectedLead, setSelectedLead] = useState(null);
  const [emailType,    setEmailType]    = useState("cold");
  const [context,      setContext]      = useState("");
  const [generating,   setGenerating]  = useState(false);
  const [draft,        setDraft]        = useState({ subject: "", body: "" });
  const [copied,       setCopied]       = useState(false);
  const [errMsg,       setErrMsg]       = useState("");
  const [batchMode,    setBatchMode]    = useState(false);
  const [batchSel,     setBatchSel]     = useState([]);
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchResults, setBatchResults] = useState([]);
  const [batchProgress,setBatchProgress]= useState(0);

  const qualified = leads.filter(l => l.score >= 6);

  const buildPrompt = (lead, type, ctx) => {
    const svc = CTD_SERVICES.find(s => s.id === lead.service) || CTD_SERVICES[0];
    const typeContext = {
      cold:      `Write a first-touch cold outreach email from CTD Africa to ${lead.name}.`,
      followup1: `Write a gentle day-3 follow-up — no reply received yet — from CTD Africa to ${lead.name}.`,
      followup2: `Write a day-7 value-add follow-up from CTD Africa to ${lead.name}. Include one useful insight about digital marketing or brand growth in their industry.`,
      followup3: `Write a final day-14 "last email" from CTD Africa to ${lead.name}. Polite, no pressure, leaves the door open permanently.`,
      event:     `Write an outreach email from CTD Africa to ${lead.name} connecting their business to an upcoming event, campaign season, or relevant industry moment.`,
    };

    return `You write outreach emails for CTD Africa (Connect The Dots Africa).

About CTD Africa:
- Pan-African digital marketing agency, Boksburg, Gauteng
- Division of Pretean (Pty) Ltd
- Mission: Connecting traditional media problems with digital solutions
- Services: Social media management, brand management (Gold R499/mo, Platinum R5,500/mo), PR across 7 African countries, broadcast licensing (Mini Football SA, Teqball SA, Outré Productions), talent management (Nazneen Khan 1M+ TikTok)
- Clients: Flying Fish, Soweto TV, Altitude Beach Club, Gauteng Champions of Champions, Alpha Appeal Clothing
- Contact: ${CTD_INFO.email} | ${CTD_INFO.website}

Service being pitched to this lead: ${svc.label} — ${svc.desc} — ${svc.price}

Lead:
- Name: ${lead.name}
- Title: ${lead.title}
- Company: ${lead.company}
- Industry: ${lead.industry}
- Region: ${lead.region}
${ctx ? `- Additional context: ${ctx}` : ""}

Task: ${typeContext[type]}

Rules:
- Subject line: punchy, personalised, under 10 words — NO generic phrases like "Quick question" or "Hope this finds you well"
- Opening hook: reference something specific about their title, company or industry
- Body: 3 short paragraphs max — conversational, peer-to-peer tone
- Pain point: digital presence and brand visibility challenges in ${lead.industry}
- CTA: soft — suggest a 20-minute discovery call
- Sign off: CTD Africa team | ${CTD_INFO.email} | ${CTD_INFO.website}
- No buzzwords: no "synergy", "leverage", "game-changer", "reach out"
- Warm, confident, professional — NOT salesy

Return ONLY valid JSON — no markdown:
{"subject": "...", "body": "..."}`;
  };

  const handleGenerate = async () => {
    if (!selectedLead) { alert("Select a lead first."); return; }
    setGenerating(true);
    setDraft({ subject: "", body: "" });
    setErrMsg("");
    try {
      const text = await callClaude([{ role: "user", content: buildPrompt(selectedLead, emailType, context) }], 1200);
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setDraft(parsed);
      updateLead(selectedLead.id, {
        emailDraft: `Subject: ${parsed.subject}\n\n${parsed.body}`,
        status: "contacted",
      });
    } catch (e) {
      setErrMsg("❌ " + (e.message || "Failed to generate. Check worker connection."));
    }
    setGenerating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${draft.subject}\n\n${draft.body}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const toggleBatch = (id) => setBatchSel(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const handleBatch = async () => {
    if (!batchSel.length) { alert("Select at least one lead."); return; }
    setBatchRunning(true); setBatchResults([]); setBatchProgress(0);
    const selected = leads.filter(l => batchSel.includes(l.id));
    const results = [];
    for (let i = 0; i < selected.length; i++) {
      const lead = selected[i];
      setBatchProgress(Math.round(((i + 1) / selected.length) * 100));
      try {
        const text = await callClaude([{ role: "user", content: buildPrompt(lead, emailType, context) }], 1000);
        const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
        results.push({ lead, ...parsed });
        updateLead(lead.id, { emailDraft: `Subject: ${parsed.subject}\n\n${parsed.body}`, status: "contacted" });
      } catch {
        results.push({ lead, subject: "Generation failed", body: "Please try again." });
      }
    }
    setBatchResults(results);
    setBatchRunning(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Outreach Writer</h1>
          <p className="page-sub">AI writes personalised emails for CTD Africa — you review and send</p>
        </div>
        <div className="tab-group">
          <button className={`tab-btn ${!batchMode ? "active" : ""}`} onClick={() => setBatchMode(false)}>Single</button>
          <button className={`tab-btn ${batchMode ? "active" : ""}`} onClick={() => setBatchMode(true)}>Batch</button>
        </div>
      </div>

      {!batchMode ? (
        <div className="two-col">
          {/* Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div className="card">
              <div className="card-header"><h3>1. Select Lead</h3></div>
              {qualified.length === 0 ? (
                <div className="empty-state" style={{ padding: "2rem" }}>
                  <p>No qualified leads yet</p>
                  <button className="btn btn-primary btn-sm" onClick={() => setActive("leads")}>Find Leads</button>
                </div>
              ) : (
                <div className="picker-list">
                  {qualified.map(l => (
                    <div key={l.id}
                      className={`picker-item ${selectedLead?.id === l.id ? "picked" : ""}`}
                      onClick={() => { setSelectedLead(l); setDraft({ subject: "", body: "" }); setErrMsg(""); }}>
                      <div className="avatar sm">{l.name?.[0]}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="lead-name">{l.name}</p>
                        <p className="lead-sub">{l.title} · {l.company}</p>
                      </div>
                      <span className={`score-chip ${l.score >= 8 ? "high" : "mid"}`}>{l.score}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-header"><h3>2. Email Type</h3></div>
              <div className="picker-list" style={{ padding: ".5rem" }}>
                {EMAIL_TYPES.map(t => (
                  <div key={t.id}
                    className={`picker-item ${emailType === t.id ? "picked" : ""}`}
                    onClick={() => setEmailType(t.id)}>
                    <div style={{ flex: 1 }}>
                      <p className="lead-name">{t.label}</p>
                      <p className="lead-sub">{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header"><h3>3. Extra Context</h3></div>
              <div className="card-body">
                <textarea placeholder="e.g. They just launched a new product. They posted about rebranding. They're expanding to new markets..."
                  value={context} onChange={e => setContext(e.target.value)} rows={3} />
                <button className="btn btn-primary btn-full" style={{ marginTop: ".8rem" }}
                  onClick={handleGenerate} disabled={generating || !selectedLead}>
                  {generating ? "✍️ Writing email..." : "✨ Generate Email"}
                </button>
                {errMsg && <p className="error-msg" style={{ marginTop: ".6rem" }}>{errMsg}</p>}
              </div>
            </div>
          </div>

          {/* Draft panel */}
          <div className="card" style={{ display: "flex", flexDirection: "column" }}>
            <div className="card-header">
              <h3>Email Draft</h3>
              {draft.subject && (
                <button className="btn btn-sm btn-outline" onClick={handleCopy}>
                  {copied ? "✅ Copied!" : "📋 Copy"}
                </button>
              )}
            </div>

            {!draft.subject && !generating && (
              <div className="empty-state" style={{ flex: 1, padding: "4rem" }}>
                <div className="empty-icon">✉️</div>
                <p>Select a lead and click Generate</p>
                <p style={{ fontSize: ".78rem", color: "var(--text3)", maxWidth: "240px", textAlign: "center" }}>
                  Claude writes a fully personalised email based on the lead's role, company and industry
                </p>
              </div>
            )}

            {generating && (
              <div className="empty-state" style={{ flex: 1 }}>
                <div className="typing-dots"><span /><span /><span /></div>
                <p style={{ color: "var(--text2)" }}>Writing for {selectedLead?.name}...</p>
              </div>
            )}

            {draft.subject && !generating && (
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <div className="draft-meta-row">
                  <span className="draft-field-label">To:</span>
                  <span style={{ color: "var(--text2)", fontSize: ".85rem" }}>{selectedLead?.email}</span>
                </div>
                <div className="draft-meta-row">
                  <span className="draft-field-label">Subject:</span>
                  <input className="subject-input" value={draft.subject}
                    onChange={e => setDraft(p => ({ ...p, subject: e.target.value }))} />
                </div>
                <div style={{ flex: 1, padding: "1rem 1.4rem" }}>
                  <textarea className="body-textarea" value={draft.body}
                    onChange={e => setDraft(p => ({ ...p, body: e.target.value }))}
                    rows={16} />
                </div>
                <div className="draft-footer">
                  <span>✅ Review before sending</span>
                  <span>·</span>
                  <span>📧 Copy → paste into your email client</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Batch mode */
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="card">
            <div className="card-header">
              <h3>Batch Email Generator</h3>
              <span className="count-badge">{batchSel.length} selected</span>
            </div>
            <div className="card-body">
              <p style={{ fontSize: ".85rem", color: "var(--text2)", marginBottom: "1rem" }}>
                Select multiple leads and generate unique personalised emails for all of them at once.
              </p>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label>Email Type</label>
                <select value={emailType} onChange={e => setEmailType(e.target.value)}>
                  {EMAIL_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
              <div className="picker-list" style={{ maxHeight: "320px", overflowY: "auto", marginBottom: "1rem" }}>
                {qualified.map(l => (
                  <div key={l.id}
                    className={`picker-item ${batchSel.includes(l.id) ? "picked" : ""}`}
                    onClick={() => toggleBatch(l.id)}>
                    <span style={{ fontSize: "1rem" }}>{batchSel.includes(l.id) ? "✅" : "⬜"}</span>
                    <div className="avatar sm">{l.name?.[0]}</div>
                    <div style={{ flex: 1 }}>
                      <p className="lead-name">{l.name}</p>
                      <p className="lead-sub">{l.title} · {l.company}</p>
                    </div>
                    <span className={`score-chip ${l.score >= 8 ? "high" : "mid"}`}>{l.score}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
                <button className="btn btn-sm btn-outline" onClick={() => setBatchSel(qualified.map(l => l.id))}>Select All</button>
                <button className="btn btn-sm btn-outline" onClick={() => setBatchSel([])}>Clear</button>
                <button className="btn btn-primary" style={{ marginLeft: "auto" }}
                  onClick={handleBatch} disabled={batchRunning || !batchSel.length}>
                  {batchRunning ? `⚡ Generating... ${batchProgress}%` : `✨ Generate ${batchSel.length} Emails`}
                </button>
              </div>
              {batchRunning && (
                <div style={{ marginTop: "1rem" }}>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${batchProgress}%`, transition: "width .3s" }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {batchResults.length > 0 && batchResults.map((r, i) => (
            <div className="card" key={i}>
              <div className="card-header">
                <div style={{ display: "flex", alignItems: "center", gap: ".7rem" }}>
                  <div className="avatar sm">{r.lead.name?.[0]}</div>
                  <div>
                    <p className="lead-name">{r.lead.name} · {r.lead.company}</p>
                    <p className="lead-sub">{r.lead.email}</p>
                  </div>
                </div>
                <button className="btn btn-sm btn-outline"
                  onClick={() => navigator.clipboard.writeText(`Subject: ${r.subject}\n\n${r.body}`)}>
                  📋 Copy
                </button>
              </div>
              <div className="card-body">
                <p style={{ fontSize: ".82rem", fontWeight: 600, marginBottom: ".5rem" }}>Subject: {r.subject}</p>
                <p style={{ fontSize: ".82rem", color: "var(--text2)", whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{r.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

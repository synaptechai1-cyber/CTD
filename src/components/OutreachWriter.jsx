import { useState } from "react";

const TEMPLATES = [
  { id: "cold", label: "Cold Outreach", desc: "First touch — personalised intro" },
  { id: "followup1", label: "Follow-up #1 (Day 3)", desc: "Gentle nudge after no reply" },
  { id: "followup2", label: "Follow-up #2 (Day 7)", desc: "Value-add follow up" },
  { id: "followup3", label: "Follow-up #3 (Day 14)", desc: "Final breakup email" },
  { id: "event", label: "Event / Speaking Hook", desc: "Tie to an upcoming event or announcement" },
];

export default function OutreachWriter({ leads, updateLead, apiKey, setActive }) {
  const [selectedLead, setSelectedLead] = useState(null);
  const [template, setTemplate] = useState("cold");
  const [customContext, setCustomContext] = useState("");
  const [generating, setGenerating] = useState(false);
  const [draft, setDraft] = useState({ subject: "", body: "" });
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [batchLeads, setBatchLeads] = useState([]);
  const [batchResults, setBatchResults] = useState([]);
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);

  const qualifiedLeads = leads.filter(l => l.score >= 6);

  const generateEmail = async (lead, tmpl, context) => {
    if (!apiKey) { alert("Please add your Claude API key in Settings."); setActive("settings"); return null; }

    const templatePrompts = {
      cold: `Write a cold outreach email from Dasha P to ${lead.name}, ${lead.title} at ${lead.company} in ${lead.region}.`,
      followup1: `Write a gentle follow-up email (day 3, no reply yet) from Dasha P to ${lead.name} at ${lead.company}.`,
      followup2: `Write a value-add follow-up email (day 7) from Dasha P to ${lead.name} at ${lead.company}. Include a useful insight about executive communication.`,
      followup3: `Write a final "breakup" style follow-up (day 14) from Dasha P to ${lead.name} at ${lead.company}. Polite, leaves door open.`,
      event: `Write an outreach email from Dasha P to ${lead.name} at ${lead.company} connecting their role to an upcoming high-stakes business event or period (Q4 presentations, annual reviews, conference season).`,
    };

    const prompt = `You are writing on behalf of Dasha P, an executive communication and public speaking coach.

About Dasha P:
- Helps leaders and executives master communication, presentation skills, and leadership presence
- Specialises in helping naturally introverted leaders get promotions and excel
- Also helps with high-stakes presentations, limiting beliefs, and confidence
- Operates in UK, EU, North and South America
- Personal, warm, results-driven coaching style

${templatePrompts[tmpl]}

Lead details:
- Name: ${lead.name}
- Title: ${lead.title}  
- Company: ${lead.company}
- Industry: ${lead.industry}
- Region: ${lead.region}
${context ? `- Additional context: ${context}` : ""}

Requirements:
- Subject line: punchy, personalised, under 10 words, no generic phrases like "Quick question"
- Body: 3-4 short paragraphs, conversational but professional
- Reference something specific about their title/industry/company that makes it feel personalised
- Pain point: the pressure executives in ${lead.industry} face with high-stakes communication
- Clear but soft CTA — a 20-minute discovery call
- Sign off as Dasha P
- Do NOT use buzzwords like "synergy", "leverage", "reach out"
- Tone: warm, confident, peer-to-peer — not salesy

Return ONLY valid JSON: {"subject": "...", "body": "..."}
No markdown, no explanation.`;

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await resp.json();
    const text = data.content?.[0]?.text || "";
    try {
      return JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch {
      return { subject: "Follow up from Dasha P", body: text };
    }
  };

  const handleGenerate = async () => {
    if (!selectedLead) { alert("Please select a lead first."); return; }
    setGenerating(true);
    setDraft({ subject: "", body: "" });
    const result = await generateEmail(selectedLead, template, customContext);
    if (result) {
      setDraft(result);
      updateLead(selectedLead.id, { emailDraft: `Subject: ${result.subject}\n\n${result.body}`, status: "contacted" });
    }
    setGenerating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${draft.subject}\n\n${draft.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (selectedLead) updateLead(selectedLead.id, { emailDraft: `Subject: ${draft.subject}\n\n${draft.body}` });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleBatchLead = (id) => {
    setBatchLeads(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBatchGenerate = async () => {
    if (!batchLeads.length) { alert("Select at least one lead."); return; }
    setBatchGenerating(true);
    setBatchResults([]);
    setBatchProgress(0);
    const selected = leads.filter(l => batchLeads.includes(l.id));
    const results = [];
    for (let i = 0; i < selected.length; i++) {
      const lead = selected[i];
      setBatchProgress(Math.round(((i + 1) / selected.length) * 100));
      const result = await generateEmail(lead, template, customContext);
      if (result) {
        results.push({ lead, ...result });
        updateLead(lead.id, { emailDraft: `Subject: ${result.subject}\n\n${result.body}`, status: "contacted" });
      }
    }
    setBatchResults(results);
    setBatchGenerating(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Outreach Writer</h1>
          <p className="page-sub">AI writes personalised emails for each lead — you review and send</p>
        </div>
        <div className="header-tabs">
          <button className={`tab-btn ${!batchMode ? "active" : ""}`} onClick={() => setBatchMode(false)}>Single</button>
          <button className={`tab-btn ${batchMode ? "active" : ""}`} onClick={() => setBatchMode(true)}>Batch</button>
        </div>
      </div>

      {!batchMode ? (
        <div className="outreach-layout">
          {/* Left panel */}
          <div className="outreach-controls">
            <div className="card">
              <div className="card-header"><h3>1. Select Lead</h3></div>
              {qualifiedLeads.length === 0 ? (
                <div className="empty-state">
                  <p>No qualified leads yet</p>
                  <button className="btn btn-primary" onClick={() => setActive("leads")}>Find Leads</button>
                </div>
              ) : (
                <div className="lead-picker">
                  {qualifiedLeads.map(l => (
                    <div
                      key={l.id}
                      className={`lead-pick-item ${selectedLead?.id === l.id ? "picked" : ""}`}
                      onClick={() => { setSelectedLead(l); setDraft({ subject: "", body: "" }); }}
                    >
                      <div className="lead-avatar sm">{l.name?.[0]}</div>
                      <div className="lead-pick-info">
                        <p className="lead-name">{l.name}</p>
                        <p className="lead-title">{l.title} · {l.company}</p>
                      </div>
                      <span className={`score-pill score-${l.score >= 8 ? "high" : "mid"}`}>{l.score}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-header"><h3>2. Email Type</h3></div>
              <div className="template-list">
                {TEMPLATES.map(t => (
                  <div
                    key={t.id}
                    className={`template-item ${template === t.id ? "selected" : ""}`}
                    onClick={() => setTemplate(t.id)}
                  >
                    <p className="template-label">{t.label}</p>
                    <p className="template-desc">{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header"><h3>3. Extra Context (optional)</h3></div>
              <textarea
                placeholder="e.g. They just announced a merger. They spoke at a conference last week. They posted about imposter syndrome..."
                value={customContext}
                onChange={e => setCustomContext(e.target.value)}
                rows={3}
              />
              <button
                className="btn btn-primary big"
                onClick={handleGenerate}
                disabled={generating || !selectedLead}
              >
                {generating ? "✍️ Claude is writing..." : "✨ Generate Email"}
              </button>
            </div>
          </div>

          {/* Right panel — draft */}
          <div className="outreach-draft">
            <div className="card draft-card">
              <div className="card-header">
                <h3>Email Draft</h3>
                {draft.subject && (
                  <div className="draft-actions">
                    <button className="btn btn-sm btn-outline" onClick={handleCopy}>{copied ? "✅ Copied!" : "📋 Copy"}</button>
                    <button className="btn btn-sm btn-outline" onClick={handleSave}>{saved ? "✅ Saved!" : "💾 Save"}</button>
                  </div>
                )}
              </div>

              {!draft.subject && !generating && (
                <div className="empty-draft">
                  <p style={{ fontSize: "3rem" }}>✉️</p>
                  <p>Select a lead and click Generate Email</p>
                  <p className="empty-sub">Claude will write a fully personalised email based on the lead's title, company, industry and region</p>
                </div>
              )}

              {generating && (
                <div className="generating-state">
                  <div className="typing-dots"><span /><span /><span /></div>
                  <p>Claude is crafting a personalised email for {selectedLead?.name}...</p>
                </div>
              )}

              {draft.subject && !generating && (
                <div className="draft-content">
                  <div className="draft-field">
                    <label>To:</label>
                    <span>{selectedLead?.email}</span>
                  </div>
                  <div className="draft-field">
                    <label>Subject:</label>
                    <input
                      value={draft.subject}
                      onChange={e => setDraft(p => ({ ...p, subject: e.target.value }))}
                      className="subject-input"
                    />
                  </div>
                  <div className="draft-body">
                    <textarea
                      value={draft.body}
                      onChange={e => setDraft(p => ({ ...p, body: e.target.value }))}
                      rows={16}
                    />
                  </div>
                  <div className="draft-meta">
                    <span>✅ Reviewed by you before sending</span>
                    <span>·</span>
                    <span>📧 Copy and send via your email client</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Batch Mode */
        <div className="batch-layout">
          <div className="card">
            <div className="card-header">
              <h3>Batch Email Generation</h3>
              <span className="badge-count">{batchLeads.length} selected</span>
            </div>
            <p className="batch-info">Select multiple leads and generate personalised emails for all of them at once. Each email will be unique.</p>

            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label>Email Type for All</label>
              <select value={template} onChange={e => setTemplate(e.target.value)}>
                {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>

            <div className="batch-lead-list">
              {qualifiedLeads.map(l => (
                <div
                  key={l.id}
                  className={`batch-lead-item ${batchLeads.includes(l.id) ? "checked" : ""}`}
                  onClick={() => toggleBatchLead(l.id)}
                >
                  <div className="batch-checkbox">{batchLeads.includes(l.id) ? "✅" : "⬜"}</div>
                  <div className="lead-avatar sm">{l.name?.[0]}</div>
                  <div className="lead-pick-info">
                    <p className="lead-name">{l.name}</p>
                    <p className="lead-title">{l.title} · {l.company}</p>
                  </div>
                  <span className={`score-pill score-${l.score >= 8 ? "high" : "mid"}`}>{l.score}</span>
                </div>
              ))}
            </div>

            <div className="batch-actions">
              <button className="btn btn-sm btn-outline" onClick={() => setBatchLeads(qualifiedLeads.map(l => l.id))}>Select All</button>
              <button className="btn btn-sm btn-outline" onClick={() => setBatchLeads([])}>Clear</button>
              <button className="btn btn-primary" onClick={handleBatchGenerate} disabled={batchGenerating || !batchLeads.length}>
                {batchGenerating ? `⚡ Generating... ${batchProgress}%` : `✨ Generate ${batchLeads.length} Emails`}
              </button>
            </div>

            {batchGenerating && (
              <div className="batch-progress-wrap">
                <div className="batch-progress-bar" style={{ width: `${batchProgress}%` }} />
                <p>{batchProgress}% complete</p>
              </div>
            )}
          </div>

          {batchResults.length > 0 && (
            <div className="batch-results">
              <h3>Generated Emails ({batchResults.length})</h3>
              {batchResults.map((r, i) => (
                <div className="card batch-result-card" key={i}>
                  <div className="batch-result-header">
                    <div className="lead-avatar sm">{r.lead.name?.[0]}</div>
                    <div>
                      <p className="lead-name">{r.lead.name} · {r.lead.company}</p>
                      <p className="lead-title">{r.lead.email}</p>
                    </div>
                    <button className="btn btn-sm btn-outline" onClick={() => {
                      navigator.clipboard.writeText(`Subject: ${r.subject}\n\n${r.body}`);
                    }}>📋 Copy</button>
                  </div>
                  <div className="batch-email-preview">
                    <p className="batch-subject"><strong>Subject:</strong> {r.subject}</p>
                    <p className="batch-body">{r.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

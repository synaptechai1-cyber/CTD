import { useState } from "react";
import { callClaude, CTD_INFO, CTD_TALENTS, CTD_CLIENTS } from "../config";

const PLATFORMS = [
  { id: "instagram",   label: "Instagram",     icon: "📸", limit: 2200 },
  { id: "facebook",    label: "Facebook",      icon: "📘", limit: 63000 },
  { id: "twitter",     label: "X / Twitter",   icon: "🐦", limit: 280 },
  { id: "linkedin",    label: "LinkedIn",      icon: "💼", limit: 3000 },
  { id: "tiktok",      label: "TikTok",        icon: "🎵", limit: 2200 },
  { id: "press",       label: "Press Release", icon: "📰", limit: 99999 },
];

const CONTENT_TYPES = [
  { id: "service",   label: "Service Promo",      desc: "Promote a CTD service offering" },
  { id: "talent",    label: "Talent Feature",     desc: "Spotlight a CTD talent" },
  { id: "thought",   label: "Thought Leadership", desc: "Industry insight or opinion" },
  { id: "client",    label: "Client Win",         desc: "Celebrate a client success" },
  { id: "event",     label: "Event Hype",         desc: "Mini Football, Teqball, campaigns" },
  { id: "brand",     label: "Brand Story",        desc: "CTD origin, mission, vision" },
  { id: "cta",       label: "Direct CTA",         desc: "Drive enquiries and bookings" },
];

const TONES = [
  "Professional & authoritative",
  "Energetic & exciting",
  "Warm & conversational",
  "Bold & provocative",
  "Inspirational",
  "Informative & educational",
];

export default function ContentGenerator({ setActive }) {
  const [platform,    setPlatform]    = useState("instagram");
  const [contentType, setContentType] = useState("service");
  const [tone,        setTone]        = useState("Professional & authoritative");
  const [talent,      setTalent]      = useState("");
  const [brief,       setBrief]       = useState("");
  const [generating,  setGenerating]  = useState(false);
  const [result,      setResult]      = useState(null);
  const [copied,      setCopied]      = useState(false);
  const [errMsg,      setErrMsg]      = useState("");
  const [batchMode,   setBatchMode]   = useState(false);
  const [batchRunning,setBatchRunning]= useState(false);
  const [batchResults,setBatchResults]= useState([]);

  const plat = PLATFORMS.find(p => p.id === platform);
  const type = CONTENT_TYPES.find(c => c.id === contentType);

  const buildPrompt = (pId, tId, tn, tal, br) => {
    const p = PLATFORMS.find(x => x.id === pId);
    const t = CONTENT_TYPES.find(x => x.id === tId);
    return `You are a world-class social media content writer for CTD Africa.

About CTD Africa:
- Full name: Connect The Dots Africa | Division of Pretean (Pty) Ltd
- Location: Boksburg, Gauteng, South Africa
- Mission: Connecting the bridge between traditional media problems and digital solutions
- Services: Social media management, brand packages (Gold R499/mo, Platinum R5,500/mo), PR across 7 African countries, broadcast licensing (Mini Football SA, Teqball SA, Outré Productions), talent management
- Talents: ${CTD_TALENTS.map(t => `${t.name} (${t.followers})`).join(", ")}
- Past clients: ${CTD_CLIENTS.join(", ")}
- Socials: ${CTD_INFO.instagram} (Instagram) · ${CTD_INFO.twitter} (Twitter)
- Contact: ${CTD_INFO.email} | ${CTD_INFO.website}

Platform: ${p?.label} (character limit: ${p?.limit >= 99999 ? "none" : p?.limit})
Content type: ${t?.label} — ${t?.desc}
Tone: ${tn}
${tal ? `Feature this talent: ${tal}` : ""}
${br ? `Brief / topic: ${br}` : ""}

Write ${p?.label} content for CTD Africa. Requirements:
- First line MUST be a scroll-stopping hook
- Relevant, value-driven body content
- Clear call to action
- ${pId === "twitter" ? "Max 2 hashtags" : "5-10 relevant hashtags"}
- Appropriate emoji use for ${p?.label}
- Stay under ${p?.limit >= 99999 ? "no limit" : p?.limit + " characters"}
${pId === "press" ? "- Format as a proper press release with headline, dateline, body paragraphs, and boilerplate" : ""}

Return ONLY valid JSON — no markdown:
{"caption": "...", "hashtags": "...", "hook": "first line only", "cta": "the call to action", "charCount": 123}`;
  };

  const handleGenerate = async () => {
    setGenerating(true); setResult(null); setErrMsg("");
    try {
      const text = await callClaude(
        [{ role: "user", content: buildPrompt(platform, contentType, tone, talent, brief) }], 1500
      );
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setResult(parsed);
    } catch (e) {
      setErrMsg("❌ " + (e.message || "Generation failed. Check Settings."));
    }
    setGenerating(false);
  };

  const handleBatch = async () => {
    setBatchRunning(true); setBatchResults([]);
    const combos = [
      { pId: "instagram", tId: "service",  tn: "Energetic & exciting" },
      { pId: "facebook",  tId: "service",  tn: "Professional & authoritative" },
      { pId: "linkedin",  tId: "thought",  tn: "Professional & authoritative" },
      { pId: "twitter",   tId: "cta",      tn: "Bold & provocative" },
    ];
    const results = [];
    for (const c of combos) {
      try {
        const text = await callClaude([{ role: "user", content: buildPrompt(c.pId, c.tId, c.tn, "", brief) }], 1000);
        const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
        results.push({ platform: c.pId, ...parsed });
      } catch {
        results.push({ platform: c.pId, caption: "Generation failed — try again", hashtags: "" });
      }
    }
    setBatchResults(results);
    setBatchRunning(false);
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Content Generator</h1>
          <p className="page-sub">AI creates platform-optimised content in CTD Africa's brand voice</p>
        </div>
        <div className="tab-group">
          <button className={`tab-btn ${!batchMode ? "active" : ""}`} onClick={() => setBatchMode(false)}>Single Post</button>
          <button className={`tab-btn ${batchMode ? "active" : ""}`} onClick={() => setBatchMode(true)}>All Platforms</button>
        </div>
      </div>

      {!batchMode ? (
        <div className="two-col">
          {/* Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div className="card">
              <div className="card-header"><h3>1. Platform</h3></div>
              <div className="picker-list" style={{ padding: ".5rem" }}>
                {PLATFORMS.map(p => (
                  <div key={p.id} className={`picker-item ${platform === p.id ? "picked" : ""}`}
                    onClick={() => setPlatform(p.id)}>
                    <span style={{ fontSize: "1.2rem" }}>{p.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p className="lead-name">{p.label}</p>
                      <p className="lead-sub">{p.limit >= 99999 ? "No char limit" : `Max ${p.limit.toLocaleString()} chars`}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header"><h3>2. Content Type</h3></div>
              <div className="picker-list" style={{ padding: ".5rem" }}>
                {CONTENT_TYPES.map(c => (
                  <div key={c.id} className={`picker-item ${contentType === c.id ? "picked" : ""}`}
                    onClick={() => setContentType(c.id)}>
                    <div style={{ flex: 1 }}>
                      <p className="lead-name">{c.label}</p>
                      <p className="lead-sub">{c.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header"><h3>3. Options</h3></div>
              <div className="card-body">
                <div className="form-group">
                  <label>Tone</label>
                  <select value={tone} onChange={e => setTone(e.target.value)}>
                    {TONES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Feature a Talent (optional)</label>
                  <select value={talent} onChange={e => setTalent(e.target.value)}>
                    <option value="">No specific talent</option>
                    {CTD_TALENTS.map(t => (
                      <option key={t.name} value={`${t.name} — ${t.role} (${t.followers})`}>
                        {t.name} — {t.followers}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Brief / Topic</label>
                  <textarea placeholder="e.g. Teqball SA just won at the Africa championships. Mini Football SA season launch. New client onboarded..."
                    value={brief} onChange={e => setBrief(e.target.value)} rows={3} />
                </div>
                <button className="btn btn-primary btn-full" onClick={handleGenerate} disabled={generating}>
                  {generating ? "✍️ Generating..." : "✨ Generate Content"}
                </button>
                {errMsg && <p className="error-msg" style={{ marginTop: ".6rem" }}>{errMsg}</p>}
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="card" style={{ display: "flex", flexDirection: "column" }}>
            <div className="card-header">
              <h3>{plat?.icon} {plat?.label} — {type?.label}</h3>
              {result && (
                <button className="btn btn-sm btn-outline"
                  onClick={() => copyText(`${result.caption}\n\n${result.hashtags}`)}>
                  {copied ? "✅ Copied!" : "📋 Copy All"}
                </button>
              )}
            </div>

            {!result && !generating && (
              <div className="empty-state" style={{ flex: 1, padding: "4rem" }}>
                <div className="empty-icon">✍️</div>
                <p>Configure your post and click Generate</p>
                <p style={{ fontSize: ".78rem", color: "var(--text3)", maxWidth: "240px", textAlign: "center" }}>
                  Claude writes platform-optimised content in CTD Africa's brand voice
                </p>
              </div>
            )}

            {generating && (
              <div className="empty-state" style={{ flex: 1 }}>
                <div className="typing-dots"><span /><span /><span /></div>
                <p style={{ color: "var(--text2)" }}>Writing {plat?.label} content...</p>
              </div>
            )}

            {result && !generating && (
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                {result.hook && (
                  <div style={{ padding: "1rem 1.4rem", borderBottom: "1px solid var(--border)", background: "rgba(245,166,35,.06)" }}>
                    <p style={{ fontSize: ".68rem", textTransform: "uppercase", letterSpacing: ".1em", color: "var(--orange)", marginBottom: ".3rem" }}>Hook</p>
                    <p style={{ fontSize: ".9rem", fontWeight: 600 }}>{result.hook}</p>
                  </div>
                )}
                <div style={{ flex: 1, padding: "1.2rem 1.4rem" }}>
                  <p style={{ fontSize: ".68rem", textTransform: "uppercase", letterSpacing: ".1em", color: "var(--text3)", marginBottom: ".5rem" }}>Caption</p>
                  <textarea className="body-textarea"
                    value={result.caption}
                    onChange={e => setResult(r => ({ ...r, caption: e.target.value }))}
                    rows={12} />
                </div>
                {result.hashtags && (
                  <div style={{ padding: "1rem 1.4rem", borderTop: "1px solid var(--border)" }}>
                    <p style={{ fontSize: ".68rem", textTransform: "uppercase", letterSpacing: ".1em", color: "var(--text3)", marginBottom: ".4rem" }}>Hashtags</p>
                    <p style={{ fontSize: ".82rem", color: "var(--orange)", lineHeight: 1.7 }}>{result.hashtags}</p>
                  </div>
                )}
                {result.cta && (
                  <div style={{ padding: "1rem 1.4rem", borderTop: "1px solid var(--border)" }}>
                    <p style={{ fontSize: ".68rem", textTransform: "uppercase", letterSpacing: ".1em", color: "var(--text3)", marginBottom: ".3rem" }}>CTA</p>
                    <p style={{ fontSize: ".82rem", color: "var(--teal)" }}>{result.cta}</p>
                  </div>
                )}
                <div className="draft-footer">
                  <span style={{ color: result.charCount >= (plat?.limit || 99999) ? "var(--red)" : "var(--green)" }}>
                    {result.charCount >= (plat?.limit || 99999) ? "⚠️ Over limit" : "✅ Within limit"}
                  </span>
                  <span>~{result.charCount} chars</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* All platforms batch */
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="card">
            <div className="card-header"><h3>📅 Generate for All 4 Platforms</h3></div>
            <div className="card-body">
              <p style={{ fontSize: ".85rem", color: "var(--text2)", marginBottom: "1rem" }}>
                Generates unique posts for Instagram, Facebook, LinkedIn and X simultaneously — each optimised for its platform.
              </p>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label>Brief / Topic</label>
                <textarea placeholder="e.g. Promote CTD Africa's Gold brand management package. R499/mo. 200+ publications..."
                  value={brief} onChange={e => setBrief(e.target.value)} rows={3} />
              </div>
              <button className="btn btn-primary btn-full" onClick={handleBatch} disabled={batchRunning}>
                {batchRunning ? "⚡ Generating all platforms..." : "✨ Generate for All 4 Platforms"}
              </button>
            </div>
          </div>

          {batchResults.map((r, i) => {
            const p = PLATFORMS.find(x => x.id === r.platform);
            return (
              <div className="card" key={i}>
                <div className="card-header">
                  <h3>{p?.icon} {p?.label}</h3>
                  <button className="btn btn-sm btn-outline"
                    onClick={() => copyText(`${r.caption}\n\n${r.hashtags}`)}>
                    📋 Copy
                  </button>
                </div>
                <div className="card-body">
                  <p style={{ whiteSpace: "pre-wrap", fontSize: ".88rem", color: "var(--text)", lineHeight: 1.8, marginBottom: ".8rem" }}>{r.caption}</p>
                  {r.hashtags && <p style={{ fontSize: ".8rem", color: "var(--orange)" }}>{r.hashtags}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";

const PLATFORMS = [
  { id:"instagram", label:"Instagram",  icon:"📸", charLimit:2200 },
  { id:"facebook",  label:"Facebook",   icon:"📘", charLimit:63206 },
  { id:"twitter",   label:"X/Twitter",  icon:"🐦", charLimit:280 },
  { id:"linkedin",  label:"LinkedIn",   icon:"💼", charLimit:3000 },
  { id:"tiktok",    label:"TikTok",     icon:"🎵", charLimit:2200 },
  { id:"pressrelease", label:"Press Release", icon:"📰", charLimit:99999 },
];

const CONTENT_TYPES = [
  { id:"service_promo",  label:"Service Promotion",     desc:"Promote a CTD service offering" },
  { id:"talent_feature", label:"Talent Feature",        desc:"Spotlight one of CTD's talents" },
  { id:"thought_leader", label:"Thought Leadership",    desc:"Industry insight or opinion piece" },
  { id:"case_study",     label:"Client Success Story",  desc:"Highlight a client win" },
  { id:"event_hype",     label:"Event / Match Hype",    desc:"Build buzz around Mini Football, Teqball etc." },
  { id:"brand_story",    label:"Brand Story",           desc:"CTD's origin, mission, vision" },
  { id:"call_to_action", label:"Direct CTA",            desc:"Get enquiries, drive bookings" },
];

const TALENTS = ["Nazneen Khan (1M+ followers, football & lifestyle)","Gcinuhlanga Dibi (actor, musician, 370k+ streams)","Mbali Sigidi (award-winning sportscaster, Supersport)","Malwandla Hlekane (sportscaster, Soweto TV)","Zigi Ndlovu (actor & director, SABC1)","Itumeleng Banda (broadcaster, Power FM & SABC 1)","Tidimalo Sehlako (actress, Miss SA Top 5)","Thato Molomo (entrepreneur & pro athlete)"];

const TONES = ["Professional & authoritative","Energetic & exciting","Warm & conversational","Bold & provocative","Inspirational","Informative & educational"];

export default function ContentGenerator({ apiKey, setActive }) {
  const [platform,    setPlatform]    = useState("instagram");
  const [contentType, setContentType] = useState("service_promo");
  const [tone,        setTone]        = useState("Professional & authoritative");
  const [talent,      setTalent]      = useState("");
  const [brief,       setBrief]       = useState("");
  const [generating,  setGenerating]  = useState(false);
  const [result,      setResult]      = useState(null);
  const [copied,      setCopied]      = useState(false);
  const [batchResults,setBatchResults]= useState([]);
  const [batchMode,   setBatchMode]   = useState(false);
  const [batchGenerating, setBatchGenerating] = useState(false);

  const selectedPlatform = PLATFORMS.find(p=>p.id===platform);
  const selectedType     = CONTENT_TYPES.find(c=>c.id===contentType);

  const buildPrompt = (plat, type, t, tal, br) => {
    const platInfo = PLATFORMS.find(p=>p.id===plat);
    const typeInfo = CONTENT_TYPES.find(c=>c.id===type);
    return `You are a world-class social media content writer for CTD Africa (Connect The Dots Africa).

About CTD Africa:
- Pan-African digital marketing agency, Boksburg, Gauteng, South Africa
- Division of Pretean (Pty) Ltd
- Mission: Connecting the bridge between traditional media problems and digital solutions
- Key strengths: Broadcast licensing (Mini Football SA, Teqball SA, Outré Productions), Talent management (8 stars incl. Nazneen Khan with 1M+ TikTok followers), PR distribution across 7 African countries, Social media management, Brand packages (Gold R499/mo, Platinum R5,500/mo)
- Clients include: Shadowball, Flying Fish, Soweto TV, Altitude Beach Club, Gauteng Champions of Champions, Audio Militia, Alpha Appeal Clothing
- Social: @CTD_Africa (Instagram), @ctd_africa (Twitter), info@connectthedots.africa
- Website: ctd-africa.com

Platform: ${platInfo?.label} (max ${platInfo?.charLimit} characters)
Content type: ${typeInfo?.label} — ${typeInfo?.desc}
Tone: ${t}
${tal ? `Talent to feature: ${tal}` : ""}
${br ? `Brief / specific requirements: ${br}` : ""}

Write compelling ${platInfo?.label} content for CTD Africa. Include:
- A strong opening hook (first line must stop the scroll)
- Relevant body content
- Clear CTA
- Relevant hashtags (${plat==="twitter"?"max 2":"5-10 relevant ones"})
- Emoji usage appropriate for the platform and tone
- Keep strictly under ${platInfo?.charLimit} characters

Return ONLY JSON: {"caption":"...","hashtags":"...","charCount":123,"hook":"first line of caption","cta":"the call to action used"}
No markdown. No explanation.`;
  };

  const handleGenerate = async () => {
    if (!apiKey) { alert("Add your Claude API key in Settings first."); setActive("settings"); return; }
    setGenerating(true); setResult(null);
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1500,
          messages:[{role:"user",content:buildPrompt(platform,contentType,tone,talent,brief)}]
        })
      });
      const data = await resp.json();
      const text = data.content?.[0]?.text||"{}";
      try { setResult(JSON.parse(text.replace(/```json|```/g,"").trim())); }
      catch { setResult({caption:text,hashtags:"",charCount:text.length,hook:"",cta:""}); }
    } catch(e) { alert("API error: "+e.message); }
    setGenerating(false);
  };

  const handleBatchGenerate = async () => {
    if (!apiKey) { alert("Add your Claude API key in Settings first."); setActive("settings"); return; }
    setBatchGenerating(true); setBatchResults([]);
    const combos = [
      {plat:"instagram", type:"service_promo",  tone:"Energetic & exciting"},
      {plat:"facebook",  type:"service_promo",  tone:"Professional & authoritative"},
      {plat:"linkedin",  type:"thought_leader", tone:"Professional & authoritative"},
      {plat:"twitter",   type:"call_to_action", tone:"Bold & provocative"},
    ];
    const results = [];
    for (const c of combos) {
      try {
        const resp = await fetch("https://api.anthropic.com/v1/messages",{
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({
            model:"claude-sonnet-4-20250514", max_tokens:1000,
            messages:[{role:"user",content:buildPrompt(c.plat,c.type,c.tone,"",brief)}]
          })
        });
        const data = await resp.json();
        const text = data.content?.[0]?.text||"{}";
        try {
          const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
          results.push({platform:c.plat, type:c.type, tone:c.tone,...parsed});
        } catch { results.push({platform:c.plat,type:c.type,tone:c.tone,caption:text,hashtags:""}); }
      } catch{}
    }
    setBatchResults(results); setBatchGenerating(false);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div><h1>Content Generator</h1><p className="page-sub">AI writes platform-optimised content for CTD Africa's social media and PR</p></div>
        <div className="header-tabs">
          <button className={`tab-btn ${!batchMode?"active":""}`} onClick={()=>setBatchMode(false)}>Single Post</button>
          <button className={`tab-btn ${batchMode?"active":""}`} onClick={()=>setBatchMode(true)}>All Platforms</button>
        </div>
      </div>

      {!batchMode ? (
        <div className="outreach-layout">
          <div className="outreach-controls">
            <div className="card">
              <div className="card-header"><h3>1. Platform</h3></div>
              <div className="template-list">
                {PLATFORMS.map(p=>(
                  <div key={p.id} className={`template-item ${platform===p.id?"selected":""}`} onClick={()=>setPlatform(p.id)}>
                    <p className="template-label">{p.icon} {p.label}</p>
                    <p className="template-desc">Max {p.charLimit>=99999?"unlimited":p.charLimit.toLocaleString()} chars</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-header"><h3>2. Content Type</h3></div>
              <div className="template-list">
                {CONTENT_TYPES.map(c=>(
                  <div key={c.id} className={`template-item ${contentType===c.id?"selected":""}`} onClick={()=>setContentType(c.id)}>
                    <p className="template-label">{c.label}</p>
                    <p className="template-desc">{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-header"><h3>3. Tone & Options</h3></div>
              <div style={{padding:"0 1.2rem 1rem",display:"flex",flexDirection:"column",gap:"1rem"}}>
                <div className="form-group">
                  <label>Tone</label>
                  <select value={tone} onChange={e=>setTone(e.target.value)}>
                    {TONES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Feature Talent (optional)</label>
                  <select value={talent} onChange={e=>setTalent(e.target.value)}>
                    <option value="">No specific talent</option>
                    {TALENTS.map(t=><option key={t} value={t}>{t.split("(")[0].trim()}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Brief / Context (optional)</label>
                  <textarea placeholder="e.g. Teqball SA just won at the Africa championship. Write hype content..." value={brief} onChange={e=>setBrief(e.target.value)} rows={3}/>
                </div>
              </div>
              <div style={{padding:"0 1.2rem 1.2rem"}}>
                <button className="btn btn-primary big" onClick={handleGenerate} disabled={generating}>
                  {generating?"✍️ Generating...":"✨ Generate Content"}
                </button>
              </div>
            </div>
          </div>

          <div className="outreach-draft">
            <div className="card draft-card">
              <div className="card-header">
                <h3>{selectedPlatform?.icon} {selectedPlatform?.label} — {selectedType?.label}</h3>
                {result && (
                  <div className="draft-actions">
                    <button className="btn btn-sm btn-outline" onClick={()=>handleCopy(`${result.caption}\n\n${result.hashtags}`)}>
                      {copied?"✅ Copied!":"📋 Copy"}
                    </button>
                  </div>
                )}
              </div>

              {!result && !generating && (
                <div className="empty-draft">
                  <p style={{fontSize:"3rem"}}>✍️</p>
                  <p>Configure your post and click Generate</p>
                  <p className="empty-sub">Claude will write platform-optimised content using CTD Africa's brand voice, services, and assets</p>
                </div>
              )}

              {generating && (
                <div className="generating-state">
                  <div className="typing-dots"><span/><span/><span/></div>
                  <p>Writing {selectedPlatform?.label} content for CTD Africa...</p>
                </div>
              )}

              {result && !generating && (
                <div className="draft-content">
                  {result.hook && (
                    <div style={{padding:"1rem 1.4rem",borderBottom:"1px solid var(--border)",background:"rgba(245,166,35,.06)"}}>
                      <label style={{fontSize:".7rem",color:"var(--orange)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:".3rem",display:"block"}}>Hook (Opening Line)</label>
                      <p style={{fontSize:".9rem",fontWeight:600,color:"var(--text)"}}>{result.hook}</p>
                    </div>
                  )}
                  <div style={{flex:1,padding:"1.2rem 1.4rem"}}>
                    <label style={{fontSize:".7rem",color:"var(--text3)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:".5rem",display:"block"}}>Caption</label>
                    <textarea
                      value={result.caption}
                      onChange={e=>setResult(r=>({...r,caption:e.target.value}))}
                      rows={14}
                      style={{border:"none",background:"none",fontSize:".88rem",color:"var(--text)",lineHeight:1.8,resize:"none",padding:0,width:"100%",outline:"none"}}
                    />
                  </div>
                  {result.hashtags && (
                    <div style={{padding:"1rem 1.4rem",borderTop:"1px solid var(--border)"}}>
                      <label style={{fontSize:".7rem",color:"var(--text3)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:".4rem",display:"block"}}>Hashtags</label>
                      <p style={{fontSize:".82rem",color:"var(--orange)",lineHeight:1.7}}>{result.hashtags}</p>
                    </div>
                  )}
                  {result.cta && (
                    <div style={{padding:"1rem 1.4rem",borderTop:"1px solid var(--border)"}}>
                      <label style={{fontSize:".7rem",color:"var(--text3)",textTransform:"uppercase",letterSpacing:".1em",marginBottom:".4rem",display:"block"}}>CTA Used</label>
                      <p style={{fontSize:".82rem",color:"var(--teal)"}}>{result.cta}</p>
                    </div>
                  )}
                  <div className="draft-meta">
                    <span>~{result.charCount} chars</span>
                    <span>·</span>
                    <span style={{color:result.charCount>=(selectedPlatform?.charLimit||99999)?"var(--red)":"var(--green)"}}>
                      {result.charCount>=(selectedPlatform?.charLimit||99999)?"⚠️ Over limit":"✅ Within limit"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="batch-layout">
          <div className="card">
            <div className="card-header"><h3>📅 Generate for All Platforms at Once</h3></div>
            <p className="batch-info">Generates 4 unique posts simultaneously — Instagram, Facebook, LinkedIn & X — all optimised for their respective platforms.</p>
            <div style={{padding:"0 1.4rem 1rem"}}>
              <div className="form-group" style={{marginBottom:"1rem"}}>
                <label>Brief / Topic (optional)</label>
                <textarea placeholder="e.g. Promote CTD Africa's Gold Brand Management package. Highlight the 200+ publication reach and R499/mo price..." value={brief} onChange={e=>setBrief(e.target.value)} rows={3}/>
              </div>
              <button className="btn btn-primary" onClick={handleBatchGenerate} disabled={batchGenerating} style={{width:"100%"}}>
                {batchGenerating?"⚡ Generating all platforms...":"✨ Generate for All 4 Platforms"}
              </button>
            </div>
          </div>

          {batchResults.length>0 && (
            <div className="batch-results" style={{marginTop:"1.5rem"}}>
              <h3 style={{marginBottom:"1rem",color:"var(--text)"}}>Generated Content ({batchResults.length} posts)</h3>
              {batchResults.map((r,i)=>{
                const plat = PLATFORMS.find(p=>p.id===r.platform);
                return (
                  <div className="card batch-result-card" key={i} style={{marginBottom:"1rem"}}>
                    <div className="batch-result-header">
                      <div>
                        <p className="lead-name">{plat?.icon} {plat?.label}</p>
                        <p className="lead-title">{r.tone}</p>
                      </div>
                      <button className="btn btn-sm btn-outline" onClick={()=>handleCopy(`${r.caption}\n\n${r.hashtags}`)}>📋 Copy</button>
                    </div>
                    <div className="batch-email-preview">
                      <p style={{marginBottom:".6rem",color:"var(--text)"}}>{r.caption}</p>
                      {r.hashtags && <p style={{color:"var(--orange)",fontSize:".8rem"}}>{r.hashtags}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

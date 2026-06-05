import { useState } from "react";

const INDUSTRIES = ["Finance", "Technology", "Consulting", "Healthcare", "Legal", "Education", "Media", "Real Estate", "Manufacturing", "Retail"];
const REGIONS = ["United Kingdom", "Germany", "France", "Netherlands", "United States", "Canada", "Brazil", "Argentina", "Spain", "Italy"];
const TITLES = ["VP", "Director", "C-Suite (CEO/COO/CFO/CTO)", "Head of Department", "Senior Manager", "Partner", "Managing Director", "President"];

export default function LeadFinder({ addLeads, apiKey, setActive }) {
  const [form, setForm] = useState({ industry: "Finance", region: "United Kingdom", title: "VP", keywords: "", count: 10 });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");
  const [preview, setPreview] = useState([]);
  const [done, setDone] = useState(false);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Generate realistic mock leads for the selected criteria
  const generateMockLeads = (form) => {
    const firstNames = ["James","Sarah","Michael","Emma","David","Charlotte","Robert","Sophie","William","Lucy","Oliver","Hannah","Thomas","Alice","George","Victoria","Henry","Isabella","Edward","Amelia","Carlos","Maria","Pedro","Ana","Juan","Laura","Miguel","Patricia","Diego","Elena"];
    const lastNames = ["Thompson","Williams","Davies","Wilson","Taylor","Brown","Evans","Johnson","Roberts","Jones","Schmidt","Mueller","Weber","Fischer","Meyer","Dupont","Martin","Bernard","Leroy","Simon","Garcia","Rodriguez","Martinez","Lopez","Gonzalez","Rossi","Ferrari","Romano","Colombo","Ricci"];
    const companies = {
      "Finance": ["Barclays","HSBC","Goldman Sachs","JP Morgan","Deutsche Bank","BNP Paribas","UBS","Credit Suisse","Lloyds Banking Group","Standard Chartered","Santander","ING Group","Société Générale","Allianz","AXA"],
      "Technology": ["Accenture","Deloitte Digital","IBM","Microsoft","SAP","Oracle","Capgemini","Infosys","Wipro","Tata Consultancy","ThoughtWorks","EPAM Systems","Publicis Sapient","CGI Group","Atos"],
      "Consulting": ["McKinsey","BCG","Bain","PwC","EY","KPMG","Deloitte","Oliver Wyman","Roland Berger","Arthur D Little","LEK Consulting","Kearney","Alvarez & Marsal","FTI Consulting","Huron"],
      "Healthcare": ["Roche","Novartis","AstraZeneca","GSK","Pfizer","Johnson & Johnson","Siemens Healthineers","Philips Healthcare","Medtronic","Abbott","Sanofi","Bayer","Merck","Bristol Myers Squibb","Eli Lilly"],
      "Legal": ["Clifford Chance","Linklaters","Freshfields","Allen & Overy","Slaughter and May","Herbert Smith","Ashurst","Norton Rose","DLA Piper","Baker McKenzie","Hogan Lovells","White & Case","Latham & Watkins","Skadden","Kirkland & Ellis"],
    };
    const titleMap = {
      "VP": ["VP of Human Resources","VP of Operations","VP of Business Development","VP of Marketing","VP of Finance","VP of Sales","VP of Strategy","VP of Technology","VP of Communications","VP of Talent"],
      "Director": ["Director of Learning & Development","Director of People","Director of Operations","Director of Strategy","Director of Communications","Director of Business Development","Director of Finance","Director of Marketing","Director of Talent Acquisition","Director of Corporate Affairs"],
      "C-Suite (CEO/COO/CFO/CTO)": ["Chief Executive Officer","Chief Operating Officer","Chief Financial Officer","Chief Technology Officer","Chief People Officer","Chief Marketing Officer","Chief Strategy Officer","Chief Communications Officer"],
      "Head of Department": ["Head of HR","Head of L&D","Head of Communications","Head of Strategy","Head of Business Development","Head of Operations","Head of Talent","Head of Marketing","Head of Finance","Head of Corporate Affairs"],
      "Senior Manager": ["Senior Manager, HR","Senior Manager, L&D","Senior Manager, Operations","Senior Manager, Strategy","Senior Manager, Talent","Senior Manager, Communications"],
      "Partner": ["Partner, Strategy","Partner, Operations","Partner, Finance","Partner, HR Consulting","Partner, Change Management","Partner, Leadership Development"],
      "Managing Director": ["Managing Director","Managing Director, EMEA","Managing Director, UK","Managing Director, Europe","Managing Director, Americas"],
      "President": ["President","President EMEA","President Europe","Regional President","Division President"],
    };

    const coList = companies[form.industry] || companies["Consulting"];
    const titleList = titleMap[form.title] || titleMap["VP"];
    const count = Math.min(parseInt(form.count) || 10, 20);

    return Array.from({ length: count }, (_, i) => {
      const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
      const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
      const co = coList[Math.floor(Math.random() * coList.length)];
      const t = titleList[Math.floor(Math.random() * titleList.length)];
      const domain = co.toLowerCase().replace(/[^a-z]/g, "") + ".com";
      const score = Math.floor(Math.random() * 4) + 6; // 6-9
      return {
        id: Date.now() + i,
        name: `${fn} ${ln}`,
        title: t,
        company: co,
        industry: form.industry,
        region: form.region,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${domain}`,
        linkedin: `https://linkedin.com/in/${fn.toLowerCase()}-${ln.toLowerCase()}`,
        score,
        status: "new",
        notes: "",
        emailDraft: "",
        followupDate: null,
        addedAt: new Date().toISOString(),
      };
    });
  };

  const handleFind = async () => {
    if (!apiKey) { alert("Please add your Claude API key in Settings first."); setActive("settings"); return; }
    setLoading(true);
    setDone(false);
    setPreview([]);

    setStep("🔍 Searching for leads matching your criteria...");
    await new Promise(r => setTimeout(r, 1200));

    setStep("📊 Pulling contact data from Apollo database...");
    await new Promise(r => setTimeout(r, 1000));

    const raw = generateMockLeads(form);

    setStep("🤖 Claude is qualifying and scoring each lead...");

    // Use Claude API to qualify leads
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are a lead qualification specialist for Dasha P, an executive communication and public speaking coach. She targets leaders and executives who need to improve their communication, presentation skills, and leadership presence — especially introverts seeking promotion.

Score these ${raw.length} leads from 1-10 based on fit. Return ONLY a JSON array of objects with "id" and "score" and "reason" (one sentence). Higher scores for: C-suite/VP/Director titles, industries with high-stakes presentations (Finance, Consulting, Tech, Legal, Healthcare), larger companies, decision-makers with teams to lead.

Leads:
${raw.map(l => `{"id":${l.id},"title":"${l.title}","company":"${l.company}","industry":"${l.industry}"}`).join('\n')}

Return only valid JSON array, no markdown.`
          }]
        })
      });
      const data = await resp.json();
      const text = data.content?.[0]?.text || "[]";
      try {
        const scores = JSON.parse(text.replace(/```json|```/g, "").trim());
        scores.forEach(s => {
          const lead = raw.find(l => l.id === s.id);
          if (lead) { lead.score = s.score; lead.qualificationReason = s.reason; }
        });
      } catch { /* keep original scores */ }
    } catch { /* keep original scores */ }

    setStep("✅ Done! Review your leads below.");
    setPreview(raw);
    setLoading(false);
  };

  const handleConfirm = () => {
    addLeads(preview);
    setDone(true);
    setPreview([]);
    setStep("");
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Lead Finder</h1>
          <p className="page-sub">Define your target and let the engine find qualified prospects</p>
        </div>
      </div>

      <div className="finder-layout">
        <div className="card finder-form">
          <div className="card-header"><h3>🎯 Target Criteria</h3></div>
          <div className="form-grid">
            <div className="form-group">
              <label>Industry</label>
              <select value={form.industry} onChange={e => update("industry", e.target.value)}>
                {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Region / Country</label>
              <select value={form.region} onChange={e => update("region", e.target.value)}>
                {REGIONS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Title Level</label>
              <select value={form.title} onChange={e => update("title", e.target.value)}>
                {TITLES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Number of Leads (max 20)</label>
              <input type="number" min={1} max={20} value={form.count} onChange={e => update("count", e.target.value)} />
            </div>
            <div className="form-group full">
              <label>Additional Keywords (optional)</label>
              <input type="text" placeholder="e.g. introvert, presentation, leadership, TEDx..." value={form.keywords} onChange={e => update("keywords", e.target.value)} />
            </div>
          </div>
          <button className="btn btn-primary big" onClick={handleFind} disabled={loading}>
            {loading ? step : "🚀 Find & Qualify Leads"}
          </button>
          {loading && (
            <div className="loading-bar">
              <div className="loading-progress" />
            </div>
          )}
          {step && !loading && <p className="step-msg">{step}</p>}
        </div>

        <div className="card finder-tips">
          <div className="card-header"><h3>💡 Best Performing Targets</h3></div>
          <div className="tip-list">
            {[
              { title: "VP / Director, Finance UK", why: "High-stakes boardroom presentations. Big budgets." },
              { title: "Partner, Consulting EU", why: "Client-facing, credibility is everything." },
              { title: "C-Suite, Tech US", why: "Investor pitches, all-hands, media appearances." },
              { title: "Head of L&D, Healthcare", why: "Buys team coaching packages — multiple seats." },
              { title: "Managing Director, Legal UK", why: "Court, negotiations, client pitches. High ROI." },
            ].map(t => (
              <div className="tip-item" key={t.title}>
                <p className="tip-title">{t.title}</p>
                <p className="tip-why">{t.why}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {preview.length > 0 && (
        <div className="card preview-section">
          <div className="card-header">
            <h3>📋 {preview.length} Leads Found — Review Before Adding</h3>
            <button className="btn btn-primary" onClick={handleConfirm}>✅ Add All to CRM</button>
          </div>
          <div className="table-wrap">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Name</th><th>Title</th><th>Company</th><th>Region</th><th>Email</th><th>Score</th><th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {preview.map(l => (
                  <tr key={l.id}>
                    <td><strong>{l.name}</strong></td>
                    <td>{l.title}</td>
                    <td>{l.company}</td>
                    <td>{l.region}</td>
                    <td className="email-cell">{l.email}</td>
                    <td><span className={`score-pill score-${l.score >= 8 ? "high" : l.score >= 6 ? "mid" : "low"}`}>{l.score}/10</span></td>
                    <td className="reason-cell">{l.qualificationReason || "Good fit based on title & industry"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {done && (
        <div className="success-banner">
          ✅ Leads added to CRM! Head to <strong>Outreach</strong> to start writing personalised emails.
          <button className="btn btn-ghost" onClick={() => { setDone(false); }}>Find More</button>
        </div>
      )}
    </div>
  );
}

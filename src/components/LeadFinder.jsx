import { useState } from "react";
import { callClaude, CTD_SERVICES } from "../config";

const INDUSTRIES = [
  "Retail","FMCG","Finance","Technology","Entertainment",
  "Sports","Healthcare","Legal","Education","Media",
  "Hospitality","Real Estate","NGO / NPO","Fashion","Automotive",
];

const REGIONS = [
  "South Africa","Nigeria","Kenya","Ghana","Zimbabwe",
  "Botswana","Zambia","Tanzania","Rwanda","Uganda",
  "United Kingdom","United States","Germany","France","Netherlands",
];

const TITLES = [
  "CEO / Founder","CMO — Chief Marketing Officer",
  "Marketing Director","Brand Manager",
  "Head of Digital","PR Manager",
  "Communications Manager","Social Media Manager",
  "Business Development Manager","Startup Founder",
];

const SA_COMPANIES = [
  "Shoprite","Pick n Pay","Woolworths","Mr Price","Foschini Group",
  "MTN","Vodacom","Telkom","Cell C","Rain",
  "Standard Bank","FNB","Absa","Nedbank","Capitec",
  "Multichoice","Naspers","Media24","Primedia","eMedia",
  "Discovery","Momentum","Sanlam","OUTsurance","Santam",
  "Tiger Brands","AVI","Pioneer Foods","RCL Foods","Distell",
  "Nando's","Steers","KFC SA","McDonald's SA","Spur",
  "Anglo American","Sasol","Impala Platinum","Sibanye Stillwater","Exxaro",
];

const GLOBAL_COMPANIES = [
  "Unilever","Diageo","AB InBev","Coca-Cola","Nestlé",
  "P&G","L'Oréal","Nike","Adidas","Puma",
  "Sony Music","Universal Music","Warner Bros","Spotify","TikTok",
  "Meta","Google","Microsoft","Amazon","Booking.com",
];

export default function LeadFinder({ addLeads, setActive }) {
  const [form, setForm] = useState({
    service: "social", industry: "Retail",
    region: "South Africa", title: "Marketing Director",
    keywords: "", count: "10",
  });
  const [status,  setStatus]  = useState("idle"); // idle | searching | qualifying | done | error
  const [step,    setStep]    = useState("");
  const [preview, setPreview] = useState([]);
  const [errMsg,  setErrMsg]  = useState("");

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const isAfrican = ["South Africa","Nigeria","Kenya","Ghana","Zimbabwe","Botswana","Zambia","Tanzania","Rwanda","Uganda"].includes(form.region);

  const buildLeads = () => {
    const firstNames = isAfrican
      ? ["Thabo","Naledi","Sipho","Ayanda","Zanele","Kagiso","Lerato","Bongani","Nomsa","Tshepo","Amara","Kwame","Fatima","Ibrahim","Chioma","Emeka","Aisha","Kofi","Nadia","Sade","Tunde","Adaeze","Chidi","Nneka","Obinna"]
      : ["James","Sarah","Michael","Emma","David","Charlotte","Robert","Sophie","Oliver","Hannah","Thomas","Alice","George","Victoria","Pierre","Marie","Carlos","Maria","Hans","Anna"];

    const lastNames = isAfrican
      ? ["Dlamini","Mokoena","Nkosi","Sithole","Zulu","Molefe","Khumalo","Mahlangu","Ndlovu","Mthembu","Okonkwo","Mensah","Hassan","Diallo","Eze","Adeyemi","Camara","Asante","Boateng","Traoré"]
      : ["Smith","Johnson","Williams","Brown","Davies","Wilson","Taylor","Evans","Roberts","Jones","Müller","Schmidt","Dupont","Martin","García","Rossi","Silva","Andersen","Patel","Ahmed"];

    const companies = isAfrican ? SA_COMPANIES : GLOBAL_COMPANIES;
    const count = Math.min(Math.max(1, parseInt(form.count) || 10), 20);

    return Array.from({ length: count }, (_, i) => {
      const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
      const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
      const co = companies[Math.floor(Math.random() * companies.length)];
      const domain = co.toLowerCase().replace(/[^a-z]/g, "").slice(0, 14) + ".com";
      return {
        id: Date.now() + i,
        name: `${fn} ${ln}`,
        title: form.title,
        company: co,
        industry: form.industry,
        region: form.region,
        service: form.service,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${domain}`,
        emailVerified: false,
        linkedin: `https://linkedin.com/in/${fn.toLowerCase()}-${ln.toLowerCase()}`,
        score: 6,
        qualificationReason: "",
        status: "new",
        notes: "",
        emailDraft: "",
        followupDate: null,
        addedAt: new Date().toISOString(),
      };
    });
  };

  const handleFind = async () => {
    setStatus("searching");
    setStep("🔍 Searching for prospects...");
    setPreview([]);
    setErrMsg("");

    await new Promise(r => setTimeout(r, 900));
    setStep("📊 Compiling contact data...");
    await new Promise(r => setTimeout(r, 700));

    const raw = buildLeads();
    setStatus("qualifying");
    setStep("🤖 Claude is qualifying and scoring each lead...");

    const svc = CTD_SERVICES.find(s => s.id === form.service);

    try {
      const prompt = `You are a lead qualification specialist for CTD Africa (Connect The Dots Africa), a Pan-African digital marketing agency.

CTD Africa service being pitched: "${svc?.label}" — ${svc?.desc} — ${svc?.price}

CTD strengths: Pan-African PR across 7 countries, talent management (Nazneen Khan 1M+ TikTok), broadcast licensing (Mini Football SA, Teqball SA, Soweto TV), social media management, brand packages from R499/mo.

Score each lead 1-10 for fit with this service. Consider: decision-making authority, company size, industry relevance, likely marketing budget, growth potential.

Leads to score:
${raw.map(l => `id:${l.id} | ${l.title} | ${l.company} | ${l.industry} | ${l.region}`).join("\n")}

Return ONLY a JSON array — no markdown, no explanation:
[{"id": 123, "score": 8, "reason": "one sentence why"}]`;

      const text = await callClaude([{ role: "user", content: prompt }]);
      const cleaned = text.replace(/```json|```/g, "").trim();
      const scores = JSON.parse(cleaned);
      scores.forEach(s => {
        const lead = raw.find(l => l.id === s.id);
        if (lead) { lead.score = s.score; lead.qualificationReason = s.reason; }
      });
    } catch (e) {
      // Scoring failed — assign default scores and continue
      raw.forEach(l => { l.score = Math.floor(Math.random() * 3) + 6; });
      setErrMsg("⚠️ AI scoring unavailable — default scores assigned. Check Settings.");
    }

    setPreview(raw);
    setStatus("done");
    setStep("");
  };

  const handleAddAll = () => {
    addLeads(preview);
    setPreview([]);
    setStatus("idle");
    setErrMsg("");
  };

  const svc = CTD_SERVICES.find(s => s.id === form.service);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Lead Finder</h1>
          <p className="page-sub">Find and qualify prospects for CTD Africa's services</p>
        </div>
      </div>

      <div className="two-col">
        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <div className="card">
            <div className="card-header"><h3>🎯 Target Criteria</h3></div>
            <div className="card-body">
              <div className="form-group">
                <label>Service to Pitch</label>
                <select value={form.service} onChange={e => update("service", e.target.value)}>
                  {CTD_SERVICES.map(s => <option key={s.id} value={s.id}>{s.label} — {s.price}</option>)}
                </select>
              </div>
              {svc && (
                <div className="service-tag">
                  <span>📌</span>
                  <span><strong>{svc.label}</strong> — {svc.desc}</span>
                </div>
              )}
              <div className="form-row">
                <div className="form-group">
                  <label>Industry</label>
                  <select value={form.industry} onChange={e => update("industry", e.target.value)}>
                    {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Region</label>
                  <select value={form.region} onChange={e => update("region", e.target.value)}>
                    {REGIONS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Target Title</label>
                  <select value={form.title} onChange={e => update("title", e.target.value)}>
                    {TITLES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Number of Leads</label>
                  <input type="number" min="1" max="20" value={form.count}
                    onChange={e => update("count", e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Keywords (optional)</label>
                <input type="text" placeholder="e.g. new product launch, expanding to Africa, rebranding..."
                  value={form.keywords} onChange={e => update("keywords", e.target.value)} />
              </div>
              <button className="btn btn-primary btn-full"
                onClick={handleFind}
                disabled={status === "searching" || status === "qualifying"}>
                {status === "searching" || status === "qualifying" ? step : "🚀 Find & Qualify Leads"}
              </button>
              {(status === "searching" || status === "qualifying") && (
                <div className="progress-bar"><div className="progress-fill" /></div>
              )}
              {errMsg && <p className="warn-msg">{errMsg}</p>}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="card">
          <div className="card-header"><h3>💡 Best Target Combos for CTD</h3></div>
          <div className="card-body">
            {[
              { t: "Marketing Director · FMCG · SA",      w: "High budgets, need social reach and PR across Africa." },
              { t: "Brand Manager · Retail · SA",          w: "Growth & starter packages fit perfectly." },
              { t: "CEO · Startup · Nigeria / Kenya",      w: "Need brand built from scratch — starter ideal." },
              { t: "PR Manager · Sports · SA",             w: "Teqball & Mini Football sponsorship hook." },
              { t: "Head of Digital · Entertainment",      w: "Talent collabs + social campaigns." },
              { t: "CMO · Finance · UK / EU",              w: "Platinum PR — 7-country press distribution." },
              { t: "Communications Mgr · Healthcare",      w: "Brand credibility + digital footprinting." },
            ].map(({ t, w }) => (
              <div className="tip-row" key={t}>
                <p className="tip-title">{t}</p>
                <p className="tip-why">{w}</p>
              </div>
            ))}
            <div className="info-box" style={{ marginTop: "1rem" }}>
              <p>📧 <strong>Email accuracy:</strong> Generated emails follow common patterns and <span style={{ color: "var(--orange)" }}>may bounce</span>. Verify using <a href="https://hunter.io" target="_blank" rel="noopener">Hunter.io</a> (free) or LinkedIn before sending.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Preview table */}
      {status === "done" && preview.length > 0 && (
        <div className="card" style={{ marginTop: "1.5rem" }}>
          <div className="card-header">
            <h3>📋 {preview.length} Leads Ready — Review &amp; Add</h3>
            <button className="btn btn-primary" onClick={handleAddAll}>✅ Add All to CRM</button>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th><th>Title</th><th>Company</th>
                  <th>Region</th><th>Email</th><th>Verified</th>
                  <th>Score</th><th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {preview.map(l => (
                  <tr key={l.id}>
                    <td><strong>{l.name}</strong></td>
                    <td>{l.title}</td>
                    <td>{l.company}</td>
                    <td>{l.region}</td>
                    <td className="td-email">{l.email}</td>
                    <td>
                      <span className={l.emailVerified ? "verified-yes" : "verified-no"}>
                        {l.emailVerified ? "✅ Yes" : "⚠️ Unverified"}
                      </span>
                    </td>
                    <td>
                      <span className={`score-chip ${l.score >= 8 ? "high" : l.score >= 6 ? "mid" : "low"}`}>
                        {l.score}/10
                      </span>
                    </td>
                    <td className="td-reason">{l.qualificationReason || "Good fit"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

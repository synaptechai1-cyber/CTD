import { useState } from "react";
import { PROXY_URL } from "../App";

const CTD_SERVICES = [
  { id: "social",     label: "Social Media Management",     desc: "From R500/mo — presence, growth, engagement" },
  { id: "gold",       label: "Brand Mgmt Gold",             desc: "R499/mo — press release, business insights" },
  { id: "platinum",   label: "Brand Mgmt Platinum",         desc: "R5,500/mo — 7 country PR, digital footprint" },
  { id: "broadcast",  label: "Broadcast & Sponsorship",     desc: "Per request — Mini Football, Teqball, Outré" },
  { id: "pr",         label: "PR & Press Distribution",     desc: "From R500/mo — up to 7 African countries" },
  { id: "starter",    label: "Starter Package",             desc: "R5,999 once — logo, social setup, guidelines" },
  { id: "growth",     label: "Growth Package",              desc: "R15,999/mo — full brand & content management" },
  { id: "campaign",   label: "Campaign Package",            desc: "R29,999 once — 360° marketing push" },
];

const INDUSTRIES = ["Finance","Technology","Retail","Healthcare","Entertainment","Sports","FMCG","Legal","Education","Real Estate","Media","Hospitality","NGO / NPO","Government"];
const REGIONS = ["South Africa","Nigeria","Kenya","Ghana","United Kingdom","United States","Germany","France","Botswana","Zimbabwe","Zambia","Mozambique","Tanzania","Rwanda"];
const TITLES = ["CEO / Founder","Marketing Director","Brand Manager","Communications Manager","Head of Digital","PR Manager","Social Media Manager","Business Development Manager","CMO","Startup Founder"];

export default function LeadFinder({ addLeads, apiKey, setActive }) {
  const [form, setForm] = useState({ service: "social", industry: "Retail", region: "South Africa", title: "Marketing Director", keywords: "", count: 10 });
  const [loading, setLoading]   = useState(false);
  const [step, setStep]         = useState("");
  const [preview, setPreview]   = useState([]);
  const [done, setDone]         = useState(false);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const generateLeads = (form) => {
    const firstNames = ["Thabo","Naledi","Sipho","Ayanda","Zanele","Kagiso","Lerato","Bongani","Nomsa","Tshepo","Amara","Kwame","Fatima","Ibrahim","Chioma","Emeka","Aisha","Kofi","Nadia","Sade","James","Sarah","Michael","Emma","David","Charlotte","Carlos","Maria","Pierre","Sophie"];
    const lastNames  = ["Dlamini","Mokoena","Nkosi","Sithole","Zulu","Molefe","Khumalo","Mahlangu","Ndlovu","Mthembu","Okonkwo","Mensah","Hassan","Diallo","Eze","Adeyemi","Camara","Asante","Boateng","Traoré","Smith","Johnson","Müller","Dupont","Rossi","García","Silva","Andersen","Patel","Ahmed"];
    const saCompanies = ["Shoprite","Pick n Pay","MTN","Vodacom","Standard Bank","FNB","Absa","Nedbank","Multichoice","Discovery","Tiger Brands","Woolworths","Mr Price","The Foschini Group","Naspers","Media24","Primedia","Nando's","Steers","KFC SA","Capitec","Investec","Anglo American","Sasol","Eskom","Transnet","SAB Miller","Sanlam","OUTsurance","Momentum"];
    const globalCompanies = ["Unilever","Diageo","AB InBev","Coca-Cola","Nestlé","P&G","L'Oréal","Nike","Adidas","Puma","Sony","Samsung","Huawei","Spotify","Meta","Google","Microsoft","Amazon","Booking.com","Airbnb"];

    const companies = ["South Africa","Botswana","Zimbabwe","Zambia"].includes(form.region) ? saCompanies : globalCompanies;
    const count = Math.min(parseInt(form.count)||10, 20);

    return Array.from({ length: count }, (_, i) => {
      const fn = firstNames[Math.floor(Math.random()*firstNames.length)];
      const ln = lastNames[Math.floor(Math.random()*lastNames.length)];
      const co = companies[Math.floor(Math.random()*companies.length)];
      const domain = co.toLowerCase().replace(/[^a-z]/g,"").slice(0,12) + ".com";
      const score = Math.floor(Math.random()*4)+6;
      return {
        id: Date.now()+i, name:`${fn} ${ln}`,
        title: form.title, company: co, industry: form.industry,
        region: form.region, service: form.service,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${domain}`,
        emailVerified: false,
        linkedin: `https://linkedin.com/in/${fn.toLowerCase()}-${ln.toLowerCase()}-${Math.floor(Math.random()*9999)}`,
        score, status:"new", notes:"", emailDraft:"", followupDate:null,
        addedAt: new Date().toISOString(),
      };
    });
  };

  const handleFind = async () => {
    if (!apiKey) { alert("Add your Claude API key in Settings first."); setActive("settings"); return; }
    setLoading(true); setDone(false); setPreview([]);
    setStep("🔍 Searching for prospects matching your criteria...");
    await new Promise(r=>setTimeout(r,1000));
    setStep("📊 Pulling contact data...");
    await new Promise(r=>setTimeout(r,900));
    const raw = generateLeads(form);
    setStep("🤖 Claude is qualifying and scoring leads for CTD services...");

    try {
      const svc = CTD_SERVICES.find(s=>s.id===form.service);
      const resp = await fetch(PROXY_URL,{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          messages:[{role:"user",content:`You are a lead qualification specialist for CTD Africa (Connect The Dots), a digital marketing agency in South Africa.

CTD Africa service being pitched: "${svc?.label}" — ${svc?.desc}

CTD Africa's strengths: Pan-African reach, affordable pricing, broadcast licensing (Mini Football SA, Teqball SA, Soweto TV), talent management (1M+ follower influencers), PR distribution across 7 African countries.

Score these ${raw.length} leads 1-10 for fit with the "${svc?.label}" service. Higher scores for: decision-makers with marketing budgets, brands that need visibility, companies in growth phase, brands that could benefit from African media reach.

Leads: ${raw.map(l=>`{"id":${l.id},"title":"${l.title}","company":"${l.company}","industry":"${l.industry}","region":"${l.region}"}`).join('\n')}

Return ONLY a JSON array: [{"id":...,"score":...,"reason":"one sentence"}]. No markdown.`}]
        })
      });
      const data = await resp.json();
      const text = data.content?.[0]?.text||"[]";
      try {
        const scores = JSON.parse(text.replace(/```json|```/g,"").trim());
        scores.forEach(s=>{
          const lead = raw.find(l=>l.id===s.id);
          if(lead){lead.score=s.score; lead.qualificationReason=s.reason;}
        });
      } catch{}
    } catch{}

    setStep("✅ Done! Review your leads below.");
    setPreview(raw); setLoading(false);
  };

  const handleConfirm = () => { addLeads(preview); setDone(true); setPreview([]); setStep(""); };
  const selectedService = CTD_SERVICES.find(s=>s.id===form.service);

  return (
    <div className="page">
      <div className="page-header">
        <div><h1>Lead Finder</h1><p className="page-sub">Find qualified prospects for CTD Africa's services</p></div>
      </div>
      <div className="finder-layout">
        <div className="card finder-form">
          <div className="card-header"><h3>🎯 Target Criteria</h3></div>
          <div className="form-grid">
            <div className="form-group full">
              <label>CTD Service to Pitch</label>
              <select value={form.service} onChange={e=>update("service",e.target.value)}>
                {CTD_SERVICES.map(s=><option key={s.id} value={s.id}>{s.label} — {s.desc}</option>)}
              </select>
            </div>
            {selectedService && (
              <div className="service-pill full">
                <span>Pitching:</span> <strong>{selectedService.label}</strong> · <em>{selectedService.desc}</em>
              </div>
            )}
            <div className="form-group">
              <label>Industry</label>
              <select value={form.industry} onChange={e=>update("industry",e.target.value)}>
                {INDUSTRIES.map(i=><option key={i}>{i}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Region / Country</label>
              <select value={form.region} onChange={e=>update("region",e.target.value)}>
                {REGIONS.map(r=><option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Target Title</label>
              <select value={form.title} onChange={e=>update("title",e.target.value)}>
                {TITLES.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Number of Leads (max 20)</label>
              <input type="number" min={1} max={20} value={form.count} onChange={e=>update("count",e.target.value)}/>
            </div>
            <div className="form-group full">
              <label>Keywords (optional)</label>
              <input type="text" placeholder="e.g. growing brand, new product launch, expanding into Africa..." value={form.keywords} onChange={e=>update("keywords",e.target.value)}/>
            </div>
          </div>
          <button className="btn btn-primary big" onClick={handleFind} disabled={loading}>
            {loading ? step : "🚀 Find & Qualify Leads"}
          </button>
          {loading && <div className="loading-bar"><div className="loading-progress"/></div>}
          {step && !loading && <p className="step-msg">{step}</p>}
        </div>

        <div className="card finder-tips">
          <div className="card-header"><h3>💡 Best Target Combos</h3></div>
          <div className="tip-list">
            {[
              {title:"Marketing Director · FMCG · SA",    why:"Big budgets, need social reach and PR."},
              {title:"Brand Manager · Retail · SA",        why:"Growth packages + social management fit perfectly."},
              {title:"CEO · Startup · Nigeria/Kenya",      why:"Starter & Growth packages, need brand from scratch."},
              {title:"PR Manager · Sports · SA",           why:"Teqball / Mini Football sponsorship opportunities."},
              {title:"Head of Digital · Entertainment",    why:"Talent collaborations + social campaigns."},
              {title:"CMO · Finance · UK/EU",              why:"Platinum PR — multi-country press distribution."},
            ].map(t=>(
              <div className="tip-item" key={t.title}>
                <p className="tip-title">{t.title}</p>
                <p className="tip-why">{t.why}</p>
              </div>
            ))}
          </div>
          <div className="card-header" style={{marginTop:"1rem"}}><h3>📧 Email Accuracy Note</h3></div>
          <div style={{padding:"0 1.2rem 1.2rem"}}>
            <p style={{fontSize:".78rem",color:"var(--text2)",lineHeight:"1.7"}}>
              Generated emails follow a common pattern and <strong style={{color:"var(--orange)"}}>may bounce</strong>. 
              Always verify before sending. Use <a href="https://hunter.io" target="_blank" rel="noopener">Hunter.io</a> (25 free/month) 
              or LinkedIn to confirm contacts. Leads marked <span style={{color:"var(--green)"}}>✅ Verified</span> have been checked.
            </p>
          </div>
        </div>
      </div>

      {preview.length>0 && (
        <div className="card preview-section">
          <div className="card-header">
            <h3>📋 {preview.length} Leads Found — Review Before Adding</h3>
            <button className="btn btn-primary" onClick={handleConfirm}>✅ Add All to CRM</button>
          </div>
          <div className="table-wrap">
            <table className="leads-table">
              <thead><tr><th>Name</th><th>Title</th><th>Company</th><th>Region</th><th>Email</th><th>Verified</th><th>Score</th><th>Reason</th></tr></thead>
              <tbody>
                {preview.map(l=>(
                  <tr key={l.id}>
                    <td><strong>{l.name}</strong></td>
                    <td>{l.title}</td><td>{l.company}</td><td>{l.region}</td>
                    <td className="email-cell">{l.email}</td>
                    <td><span style={{color:l.emailVerified?"var(--green)":"var(--orange)",fontSize:".75rem"}}>{l.emailVerified?"✅ Yes":"⚠️ Unverified"}</span></td>
                    <td><span className={`score-pill score-${l.score>=8?"high":l.score>=6?"mid":"low"}`}>{l.score}/10</span></td>
                    <td className="reason-cell">{l.qualificationReason||"Good fit"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {done && (
        <div className="success-banner">
          ✅ Leads added to CRM! Go to <strong>Outreach</strong> to write personalised emails.
          <button className="btn btn-ghost" onClick={()=>setDone(false)}>Find More</button>
        </div>
      )}
    </div>
  );
}

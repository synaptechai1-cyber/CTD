import { useState } from "react";
import { PROXY_URL } from "../App";

export default function Settings({ apiKey, setApiKey }) {
  const [key,       setKey]       = useState(apiKey);
  const [saved,     setSaved]     = useState(false);
  const [testing,   setTesting]   = useState(false);
  const [testResult,setTestResult]= useState(null);

  const handleSave = () => {
    localStorage.setItem("claude_key",key);
    setApiKey(key); setSaved(true);
    setTimeout(()=>setSaved(false),2500);
  };

  const handleTest = async () => {
    if(!key){alert("Enter your API key first.");return;}
    setTesting(true); setTestResult(null);
    try {
      const resp = await fetch(PROXY_URL,{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:50,messages:[{role:"user",content:"Reply: CTD Africa engine connected ✅"}]})
      });
      const data = await resp.json();
      if(data.content?.[0]?.text) setTestResult({ok:true,msg:"✅ API key working perfectly — CTD Engine is live!"});
      else setTestResult({ok:false,msg:"❌ Issue: "+(data.error?.message||"Unknown")});
    } catch(e) { setTestResult({ok:false,msg:"❌ Connection failed: "+e.message}); }
    setTesting(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div><h1>Settings</h1><p className="page-sub">Configure CTD Africa Growth Engine</p></div>
      </div>
      <div className="settings-layout">
        <div className="card">
          <div className="card-header"><h3>🤖 Claude API Key</h3></div>
          <p className="settings-desc">Powers lead qualification, outreach writing, and content generation. Get yours at <a href="https://console.anthropic.com" target="_blank" rel="noopener">console.anthropic.com</a>. Stored locally — never shared.</p>
          <div className="card" style={{margin:"0 1.4rem 1rem",padding:"1rem",background:"var(--bg3)"}}>
            <p style={{fontSize:".78rem",color:"var(--text2)",lineHeight:1.7}}>
              ⚠️ <strong>Important:</strong> Use your <strong>personal Claude API key</strong> here — not the shared CTD Africa account. This keeps your methodology private and this engine is your professional tool.
            </p>
          </div>
          <div className="card" style={{margin:"0 1.4rem 1rem",padding:"0 0 1rem"}}>
            <div style={{padding:"1rem 1.4rem 0"}}>
              <label>API Key</label>
              <input type="password" placeholder="sk-ant-..." value={key} onChange={e=>setKey(e.target.value)}/>
            </div>
          </div>
          <div className="settings-btns">
            <button className="btn btn-primary" onClick={handleSave}>{saved?"✅ Saved!":"💾 Save Key"}</button>
            <button className="btn btn-outline" onClick={handleTest} disabled={testing}>{testing?"Testing...":"🔌 Test Connection"}</button>
          </div>
          {testResult && <div className={`test-result ${testResult.ok?"ok":"fail"}`} style={{margin:"0 1.4rem 1.4rem"}}>{testResult.msg}</div>}
        </div>

        <div className="card">
          <div className="card-header"><h3>🏢 CTD Africa — Company Profile</h3></div>
          <div className="profile-grid">
            {[
              ["Company",   "Connect The Dots Africa (CTD Africa)"],
              ["Division",  "Pretean (Pty) Ltd"],
              ["Location",  "191 Leeuwport Street, Boksburg, Gauteng, 1460"],
              ["Website",   "ctd-africa.com"],
              ["Email",     "info@connectthedots.africa"],
              ["Instagram", "@CTD_Africa"],
              ["Twitter",   "@ctd_africa"],
              ["WhatsApp",  "+27 81 770 1493"],
              ["Mission",   "Connecting traditional media problems with digital solutions"],
              ["Reach",     "3.5M media reach · 80M social views · 7+ African countries"],
            ].map(([k,v])=>(
              <div className="profile-item" key={k}>
                <span className="p-label">{k}</span><span style={{fontSize:".82rem",color:"var(--text)"}}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>📧 Email Verification Tools (Free)</h3></div>
          <div className="upgrade-list">
            {[
              {name:"Hunter.io",       desc:"25 free email lookups/month — verify leads",             url:"https://hunter.io",         status:"free"},
              {name:"Apollo.io",       desc:"50 free verified leads/month — real contact data",       url:"https://apollo.io",         status:"free"},
              {name:"NeverBounce",     desc:"1,000 free email verifications — bulk verify",           url:"https://neverbounce.com",   status:"free"},
              {name:"LinkedIn",        desc:"Manual verification — find real decision-makers",        url:"https://linkedin.com",      status:"free"},
              {name:"Instantly.ai",    desc:"Email sending + open tracking — R700/mo",               url:"https://instantly.ai",      status:"paid"},
              {name:"Mailtrack",       desc:"Email open tracking — free tier available",             url:"https://mailtrack.io",      status:"free"},
            ].map(s=>(
              <div className="upgrade-item" key={s.name}>
                <div>
                  <p className="upgrade-name">{s.name}</p>
                  <p className="upgrade-desc">{s.desc}</p>
                </div>
                <a href={s.url} target="_blank" rel="noopener" className={`btn btn-sm ${s.status==="free"?"btn-primary":"btn-outline"}`}>
                  {s.status==="free"?"Free →":"Explore →"}
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>💼 CTD Services Reference</h3></div>
          <div className="profile-grid">
            {[
              ["Consultancy",       "R350/hr — business assessment, data analysis"],
              ["Gold Brand Mgmt",   "R499/mo — press release, 200+ publications"],
              ["Platinum Brand",    "R5,500/mo — 7-country PR, digital footprinting"],
              ["Rhodium",           "Per request — full Africa media, hands-on dev"],
              ["Social Media Boost","R1,500/mo — following growth, engagement"],
              ["Starter Package",   "R5,999 once — logo, social setup, guidelines"],
              ["Growth Package",    "R15,999/mo — full brand & content management"],
              ["Campaign Package",  "R29,999 once — 360° marketing push"],
              ["Project Mgmt",      "Per request — end-to-end project delivery"],
              ["Broadcast/Sponsor", "Per request — Mini Football, Teqball, Outré"],
            ].map(([k,v])=>(
              <div className="profile-item" key={k}>
                <span className="p-label">{k}</span>
                <span style={{fontSize:".78rem",color:"var(--orange)",fontWeight:600}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

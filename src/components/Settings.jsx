import { useState } from "react";
import { callClaude, PROXY_URL, CTD_INFO, CTD_SERVICES } from "../config";

export default function Settings() {
  const [testing,    setTesting]    = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTest = async () => {
    setTesting(true); setTestResult(null);
    try {
      const text = await callClaude([{
        role: "user",
        content: "Reply with exactly this text: CTD Africa Growth Engine is connected and operational ✅"
      }], 60);
      setTestResult({ ok: true, msg: text });
    } catch (e) {
      setTestResult({ ok: false, msg: e.message || "Connection failed" });
    }
    setTesting(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="page-sub">CTD Africa Growth Engine configuration</p>
        </div>
      </div>

      <div className="settings-col">

        {/* Worker status */}
        <div className="card">
          <div className="card-header"><h3>🔌 Engine Connection</h3></div>
          <div className="card-body">
            <div className="info-box" style={{ marginBottom: "1rem" }}>
              <p>This engine routes all AI requests through a secure Cloudflare Worker proxy. The API key is stored safely in the worker — not in the browser.</p>
            </div>
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label>Worker URL</label>
              <input type="text" value={PROXY_URL} readOnly
                style={{ opacity: .7, cursor: "default" }} />
            </div>
            <button className="btn btn-primary" onClick={handleTest} disabled={testing}>
              {testing ? "Testing..." : "🔌 Test Connection"}
            </button>
            {testResult && (
              <div className={`result-box ${testResult.ok ? "ok" : "fail"}`} style={{ marginTop: ".8rem" }}>
                {testResult.ok ? "✅ " : "❌ "}{testResult.msg}
              </div>
            )}
            {testResult && !testResult.ok && (
              <div className="info-box" style={{ marginTop: ".8rem" }}>
                <p><strong>Troubleshooting:</strong></p>
                <p>1. Go to Cloudflare Workers dashboard</p>
                <p>2. Open <strong>ctd-africa-proxy</strong></p>
                <p>3. Settings → Variables and Secrets</p>
                <p>4. Make sure <strong>ANTHROPIC_API_KEY</strong> is saved as a Secret</p>
                <p>5. Make sure your engine URL is in the <strong>ALLOWED_ORIGINS</strong> list in worker.js</p>
              </div>
            )}
          </div>
        </div>

        {/* Company profile */}
        <div className="card">
          <div className="card-header"><h3>🏢 CTD Africa Company Profile</h3></div>
          <div className="card-body">
            {[
              ["Company",   CTD_INFO.full],
              ["Division",  CTD_INFO.division],
              ["Address",   CTD_INFO.address],
              ["Website",   CTD_INFO.website],
              ["Email",     CTD_INFO.email],
              ["WhatsApp",  CTD_INFO.whatsapp],
              ["Instagram", CTD_INFO.instagram],
              ["Twitter",   CTD_INFO.twitter],
              ["Reach",     CTD_INFO.reach],
            ].map(([k, v]) => (
              <div className="profile-row" key={k}>
                <span className="profile-key">{k}</span>
                <span className="profile-val">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Services */}
        <div className="card">
          <div className="card-header"><h3>💼 Services Reference</h3></div>
          <div className="card-body">
            {CTD_SERVICES.map(s => (
              <div className="profile-row" key={s.id}>
                <div>
                  <p style={{ fontSize: ".85rem", fontWeight: 600, color: "var(--text)" }}>{s.label}</p>
                  <p style={{ fontSize: ".75rem", color: "var(--text3)" }}>{s.desc}</p>
                </div>
                <span style={{ color: "var(--orange)", fontWeight: 700, fontSize: ".82rem", flexShrink: 0 }}>{s.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Email verification tools */}
        <div className="card">
          <div className="card-header"><h3>📧 Email Verification Tools</h3></div>
          <div className="card-body">
            <p style={{ fontSize: ".83rem", color: "var(--text2)", marginBottom: "1rem" }}>
              Generated emails may bounce. Always verify before sending bulk outreach.
            </p>
            {[
              { name: "Hunter.io",      desc: "25 free lookups/month — find & verify emails",     url: "https://hunter.io",        free: true },
              { name: "Apollo.io",      desc: "50 free verified leads/month — real contact data", url: "https://apollo.io",        free: true },
              { name: "NeverBounce",    desc: "1,000 free verifications — bulk email checking",   url: "https://neverbounce.com",  free: true },
              { name: "Instantly.ai",   desc: "Email sending + open tracking",                    url: "https://instantly.ai",     free: false },
            ].map(t => (
              <div className="tool-row" key={t.name}>
                <div>
                  <p style={{ fontSize: ".88rem", fontWeight: 600, color: "var(--text)" }}>{t.name}</p>
                  <p style={{ fontSize: ".75rem", color: "var(--text3)" }}>{t.desc}</p>
                </div>
                <a href={t.url} target="_blank" rel="noopener noreferrer"
                  className={`btn btn-sm ${t.free ? "btn-primary" : "btn-outline"}`}>
                  {t.free ? "Free →" : "Explore →"}
                </a>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

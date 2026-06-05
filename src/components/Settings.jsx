import { useState } from "react";

export default function Settings({ apiKey, setApiKey }) {
  const [key, setKey] = useState(apiKey);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleSave = () => {
    localStorage.setItem("claude_key", key);
    setApiKey(key);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleTest = async () => {
    if (!key) { alert("Enter your API key first."); return; }
    setTesting(true);
    setTestResult(null);
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 50,
          messages: [{ role: "user", content: "Reply with only: API connection successful" }]
        })
      });
      const data = await resp.json();
      if (data.content?.[0]?.text) {
        setTestResult({ ok: true, msg: "✅ API key is working perfectly!" });
      } else {
        setTestResult({ ok: false, msg: "❌ API key issue: " + (data.error?.message || "Unknown error") });
      }
    } catch (e) {
      setTestResult({ ok: false, msg: "❌ Connection failed: " + e.message });
    }
    setTesting(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="page-sub">Configure your engine</p>
        </div>
      </div>

      <div className="settings-layout">
        <div className="card">
          <div className="card-header"><h3>🤖 Claude API Key</h3></div>
          <p className="settings-desc">
            Your Claude API key powers the lead qualification and email generation. Get yours at{" "}
            <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer">console.anthropic.com</a>.
            Your key is stored locally in your browser only — never sent anywhere except directly to Anthropic.
          </p>
          <div className="form-group">
            <label>API Key</label>
            <input
              type="password"
              placeholder="sk-ant-..."
              value={key}
              onChange={e => setKey(e.target.value)}
            />
          </div>
          <div className="settings-btns">
            <button className="btn btn-primary" onClick={handleSave}>{saved ? "✅ Saved!" : "💾 Save Key"}</button>
            <button className="btn btn-outline" onClick={handleTest} disabled={testing}>
              {testing ? "Testing..." : "🔌 Test Connection"}
            </button>
          </div>
          {testResult && (
            <div className={`test-result ${testResult.ok ? "ok" : "fail"}`}>{testResult.msg}</div>
          )}
        </div>

        <div className="card">
          <div className="card-header"><h3>🎯 Client Profile — Dasha P</h3></div>
          <div className="profile-grid">
            <div className="profile-item"><span className="p-label">Client</span><span>Dasha P</span></div>
            <div className="profile-item"><span className="p-label">Service</span><span>Executive Communication &amp; Public Speaking Coaching</span></div>
            <div className="profile-item"><span className="p-label">Target</span><span>Leaders, executives, introverts seeking promotion</span></div>
            <div className="profile-item"><span className="p-label">Regions</span><span>UK · EU · North America · South America</span></div>
            <div className="profile-item"><span className="p-label">Goal</span><span>10 qualified clients per month</span></div>
            <div className="profile-item"><span className="p-label">Managed by</span><span>CTD Africa — Head of Engines</span></div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>📊 Data &amp; Privacy</h3></div>
          <p className="settings-desc">All lead data is stored in your browser's memory for this session. To persist data between sessions, export regularly.</p>
          <div className="settings-btns">
            <button className="btn btn-outline" onClick={() => {
              const data = localStorage.getItem("leads") || "{}";
              const blob = new Blob([data], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url; a.download = "dasha-leads.json"; a.click();
            }}>📥 Export Data</button>
            <button className="btn btn-outline btn-danger" onClick={() => {
              if (window.confirm("Clear all leads? This cannot be undone.")) {
                localStorage.removeItem("leads");
                window.location.reload();
              }
            }}>🗑️ Clear All Data</button>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>🚀 Upgrade Lead Sources</h3></div>
          <p className="settings-desc">Currently using generated lead data. To connect real data sources:</p>
          <div className="upgrade-list">
            {[
              { name: "Apollo.io", desc: "50 free leads/month · $49/mo for unlimited", url: "https://apollo.io", status: "free" },
              { name: "Hunter.io", desc: "25 free searches/month · email finder", url: "https://hunter.io", status: "free" },
              { name: "LinkedIn Sales Navigator", desc: "Best quality leads · $99/mo", url: "https://business.linkedin.com/sales-solutions", status: "paid" },
              { name: "Instantly.ai", desc: "Email sending + tracking · $37/mo", url: "https://instantly.ai", status: "paid" },
            ].map(s => (
              <div className="upgrade-item" key={s.name}>
                <div>
                  <p className="upgrade-name">{s.name}</p>
                  <p className="upgrade-desc">{s.desc}</p>
                </div>
                <a href={s.url} target="_blank" rel="noopener noreferrer"
                  className={`btn btn-sm ${s.status === "free" ? "btn-primary" : "btn-outline"}`}>
                  {s.status === "free" ? "Free →" : "Explore →"}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

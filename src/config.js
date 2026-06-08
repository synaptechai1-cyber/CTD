// ── CTD Africa Growth Engine — Config ──────────────────
// All API calls go through the Cloudflare Worker proxy.
// The API key lives securely in the Worker — not in the browser.

export const PROXY_URL = "https://ctd-africa-proxy.mzombilini.workers.dev";

export const CTD_INFO = {
  name:      "CTD Africa",
  full:      "Connect The Dots Africa",
  division:  "Pretean (Pty) Ltd",
  email:     "info@connectthedots.africa",
  accounts:  "accounts@connectthedots.africa",
  whatsapp:  "+27817701493",
  website:   "ctd-africa.com",
  address:   "191 Leeuwport Street, Boksburg, Gauteng, 1460",
  instagram: "@CTD_Africa",
  twitter:   "@ctd_africa",
  reach:     "3.5M media reach · 80M social views · 7 African countries",
};

export const CTD_SERVICES = [
  { id: "social",    label: "Social Media Management",      price: "R500/mo",     desc: "Presence, growth & engagement across all platforms" },
  { id: "gold",      label: "Brand Management — Gold",      price: "R499/mo",     desc: "Press release to 200+ publications, business insights" },
  { id: "platinum",  label: "Brand Management — Platinum",  price: "R5,500/mo",   desc: "7-country PR, digital footprinting, deep insights" },
  { id: "rhodium",   label: "Brand Management — Rhodium",   price: "Per Request", desc: "Full Africa media list, PR & project management" },
  { id: "boost",     label: "Social Media Boost",           price: "R1,500/mo",   desc: "Grow following, boost Instagram engagement" },
  { id: "starter",   label: "Starter Package",              price: "R5,999",      desc: "Logo, social setup, brand guidelines" },
  { id: "growth",    label: "Growth Package",               price: "R15,999/mo",  desc: "Full brand management, weekly content, analytics" },
  { id: "campaign",  label: "Campaign Package",             price: "R29,999",     desc: "360° marketing push, paid ads, performance tracking" },
  { id: "consult",   label: "Consultancy Session",          price: "R350/hr",     desc: "Business assessment, data analysis, strategy" },
  { id: "broadcast", label: "Broadcast & Sponsorship",      price: "Per Request", desc: "Mini Football SA, Teqball SA, Outré Productions" },
];

export const CTD_TALENTS = [
  { name: "Nazneen Khan",        role: "Football & lifestyle creator",      followers: "1M+ TikTok" },
  { name: "Gcinuhlanga Dibi",    role: "Actor, musician",                   followers: "370k+ streams" },
  { name: "Mbali Sigidi",        role: "Award-winning sportscaster",        followers: "Supersport" },
  { name: "Malwandla Hlekane",   role: "Sportscaster",                      followers: "Soweto TV" },
  { name: "Zigi Ndlovu",         role: "Actor & director",                  followers: "SABC1" },
  { name: "Itumeleng Banda",     role: "Broadcaster",                       followers: "Power FM & SABC1" },
  { name: "Tidimalo Sehlako",    role: "Actress, Miss SA Top 5",            followers: "Multi-platform" },
  { name: "Thato Molomo",        role: "Entrepreneur & pro athlete",        followers: "Multi-platform" },
];

export const CTD_CLIENTS = [
  "Shadowball", "Audio Militia", "Gauteng Champions of Champions",
  "PPC Food Group", "Flying Fish", "Altitude Beach Club",
  "Soweto TV", "Clavon Leonard / Clavon Models", "Alpha Appeal Clothing",
];

// ── Claude API call helper ────────────────────────────
// All components use this — never call Anthropic directly
export async function callClaude(messages, maxTokens = 1000) {
  const response = await fetch(PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  if (data.error) throw new Error(data.error.message || "API error");
  return data.content?.[0]?.text || "";
}

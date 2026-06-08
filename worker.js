/**
 * CTD Africa — Anthropic API Proxy
 * Cloudflare Worker
 * 
 * Proxies requests from the browser to Anthropic's API,
 * bypassing CORS restrictions on hosted frontends.
 */

const ANTHROPIC_API_URL = "https://api.anthropic.com";
const ALLOWED_ORIGINS = [
  "https://ctdafrica.pages.dev",
  "https://ctd-africa.com",
  "https://www.ctd-africa.com",
  "https://ctd-3zl.pages.dev",
  "http://localhost:5173",
  "http://localhost:4173",
];

export default {
  async fetch(request, env) {

    const origin = request.headers.get("Origin") || "";

    // ── Handle CORS preflight ──────────────────────────
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }

    // ── Only allow POST ────────────────────────────────
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    // ── Parse incoming body ────────────────────────────
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    // ── Get API key — from body or environment variable ─
    // Priority: env variable (more secure) > body field
    const apiKey = env.ANTHROPIC_API_KEY || body.apiKey;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "No API key provided" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    // ── Remove apiKey from body before forwarding ──────
    const { apiKey: _removed, ...cleanBody } = body;

    // ── Forward to Anthropic ───────────────────────────
    try {
      const anthropicResponse = await fetch(`${ANTHROPIC_API_URL}/v1/messages`, {
        method: "POST",
        headers: {
          "Content-Type":         "application/json",
          "x-api-key":            apiKey,
          "anthropic-version":    "2023-06-01",
        },
        body: JSON.stringify(cleanBody),
      });

      const data = await anthropicResponse.json();

      return new Response(JSON.stringify(data), {
        status: anthropicResponse.status,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders(origin),
        },
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: "Proxy error: " + err.message }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }
  },
};

// ── CORS headers helper ────────────────────────────────
function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin":  allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age":       "86400",
  };
}

/**
 * Cloudflare Worker – Succulent Course AI Assistant
 * Uses Cloudflare Workers AI (free tier)
 * 
 * Deploy this as a Worker, then put the Worker URL into the course.
 */

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders()
      });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders() });
    }

    try {
      const { message, history = [] } = await request.json();

      if (!message || typeof message !== "string") {
        return jsonResponse({ error: "Please send a message." }, 400);
      }

      // Keep history short to stay within free limits and context window
      const recentHistory = history.slice(-6);

      const messages = [
        {
          role: "system",
          content: `You are an experienced horticultural specialist focusing on succulents and cacti, with particular knowledge of growing them successfully in the UK climate (cool, humid winters, lower light levels, indoor culture).

Your role is to give accurate, detailed, adult-level specialist advice while remaining clear and practical. The user may be a motivated beginner or intermediate grower who wants proper understanding, not just quick tips.

Core principles:
- Prioritise plant health and long-term success. Overwatering and poor drainage are the most common causes of failure – always address these first when relevant.
- Give detailed, structured answers. Explain the “why” behind recommendations (e.g. root physiology, seasonal growth cycles, light intensity effects).
- Use correct horticultural terminology when useful, but briefly explain it so the reader learns.
- Tailor advice to UK conditions: shorter days and cooler temperatures in winter, higher ambient humidity, typical windowsill light levels, peat-free compost availability, etc.
- Cover differences between major groups when relevant (e.g. Echeveria vs Haworthia vs Crassula vs Aloe vs true cacti).
- For problems, work through diagnosis: symptoms → likely causes → step-by-step recovery actions → prevention.
- Propagation advice should include timing, callusing, aftercare, and common failure points.
- Be honest about uncertainty. If a question is highly specific to a rare species or unusual situation, say what is generally true and what would need further observation.
- Never invent chemical treatments, brand claims, or medical/psychological advice. Plant care can support wellbeing, but do not position it as treatment.
- Keep a calm, respectful, non-judgemental tone. Learning involves trial and error.
- Structure longer answers with short paragraphs or clear steps so they are easy to follow.

Topics you handle in depth: substrate composition and drainage, watering regimes and seasonal adjustment, light quantity/quality and etiolation, temperature and dormancy, pot selection and root health, propagation techniques (leaf, stem, offset, seed), pest and disease identification and management, common physiological disorders, and designing simple collections or displays.`
        },
        ...recentHistory,
        { role: "user", content: message }
      ];

      const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
        messages,
        max_tokens: 900,
        temperature: 0.35
      });

      const reply = response.response || "Sorry, I couldn't generate a reply. Please try again.";

      return jsonResponse({ reply });
    } catch (err) {
      console.error(err);
      return jsonResponse({ error: "Something went wrong. Please try again in a moment." }, 500);
    }
  }
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders()
  });
}

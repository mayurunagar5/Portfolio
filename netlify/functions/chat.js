// ============================================================
// netlify/functions/chat.js
// Serverless replacement for server/server.js's /api/chat route.
// Netlify runs this on demand — no long-running server needed.
// Keeps NVIDIA_API_KEY out of the browser, same as before.
// ============================================================

const OpenAI = require("openai");
const resume = require("./resume.json");

function buildSystemPrompt() {
  return `You are the assistant embedded in Mayur Unagar's personal portfolio website.
Answer only questions about Mayur Unagar — his skills, experience, projects, and education —
using the resume data below as your source of truth. If asked something not covered by this
data, say you don't have that information rather than guessing. Keep answers concise (2-5
sentences), friendly, and in third person ("Mayur has..." / "He is currently...").

RESUME DATA (JSON):
${JSON.stringify(resume, null, 2)}`;
}

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const { message, history } = body;

  if (!message || typeof message !== "string") {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing 'message' string in request body." }),
    };
  }

  const priorTurns = Array.isArray(history) ? history.slice(-8) : [];

  try {
    const client = new OpenAI({
      baseURL: "https://integrate.api.nvidia.com/v1",
      apiKey: process.env.NVIDIA_API_KEY,
    });

    const completion = await client.chat.completions.create({
      model: "meta/llama-3.1-8b-instruct",
      messages: [
        { role: "system", content: buildSystemPrompt() },
        ...priorTurns,
        { role: "user", content: message },
      ],
      temperature: 0.2,
      top_p: 0.7,
      max_tokens: 1024,
      stream: false,
    });

    const reply = completion.choices[0].message.content ?? "I'm not sure how to answer that.";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    console.error("Chat function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong reaching the model. Please try again." }),
    };
  }
};
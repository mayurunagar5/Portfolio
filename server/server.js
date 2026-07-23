// ============================================================
// server/server.js
// Small proxy server: browser -> this server -> build.nvidia.com
// Keeps NVIDIA_API_KEY out of the browser entirely.
// ============================================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve the static site (index.html, style.css, script.js, chatbot.*)
// from the project root, one level up from /server.
app.use(express.static(path.join(__dirname, "..")));

// Load resume data once at startup.
const resume = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "resume.json"), "utf-8")
);

// Build a system prompt that grounds the model in the resume data
// and tells it to stay strictly on-topic.
function buildSystemPrompt() {
  return `You are the assistant embedded in Mayur Unagar's personal portfolio website.
Answer only questions about Mayur Unagar — his skills, experience, projects, and education —
using the resume data below as your source of truth. If asked something not covered by this
data, say you don't have that information rather than guessing. Keep answers concise (2-5
sentences), friendly, and in third person ("Mayur has..." / "He is currently...").

RESUME DATA (JSON):
${JSON.stringify(resume, null, 2)}`;
}

// NVIDIA's API is OpenAI-compatible, so the official openai SDK works
// by pointing baseURL at NVIDIA's endpoint.
const client = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY,
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing 'message' string in request body." });
    }

    // history: optional array of prior {role, content} turns from the widget,
    // so the bot keeps short-term context within a session.
    const priorTurns = Array.isArray(history) ? history.slice(-8) : [];

    const completion = await client.chat.completions.create({
      model: "meta/llama-3.1-70b-instruct",
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
    res.json({ reply });
  } catch (err) {
    console.error("Chat proxy error:", err);
    res.status(500).json({ error: "Something went wrong reaching the model. Please try again." });
  }
});

app.listen(PORT, () => {
  console.log(`Portfolio + chat proxy running at http://localhost:${PORT}`);
});
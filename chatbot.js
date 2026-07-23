// ============================================================
// chatbot.js
// Floating widget frontend. Sends messages to /api/chat (our
// own server) — NEVER calls build.nvidia.com directly, since
// that would require exposing the API key in the browser.
// ============================================================

(function () {
  "use strict";

  var chatbot = document.getElementById("chatbot");
  var toggle = document.getElementById("chatbotToggle");
  var panel = document.getElementById("chatbotPanel");
  var messagesEl = document.getElementById("chatbotMessages");
  var form = document.getElementById("chatbotForm");
  var input = document.getElementById("chatbotInput");

  if (!chatbot || !toggle || !panel || !messagesEl || !form || !input) return;

  // Short-term memory for this session only (cleared on reload).
  var history = [];
  var isSending = false;

  /* ---------- Open / close ---------- */
  function openChat() {
    chatbot.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    panel.setAttribute("aria-hidden", "false");
    setTimeout(function () { input.focus(); }, 200);
  }
  function closeChat() {
    chatbot.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    panel.setAttribute("aria-hidden", "true");
  }
  toggle.addEventListener("click", function () {
    chatbot.classList.contains("open") ? closeChat() : openChat();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && chatbot.classList.contains("open")) closeChat();
  });

  /* ---------- Rendering ---------- */

  // Escapes HTML special characters so user-provided text or literal
  // characters inside the bot's reply can never break out as markup.
  function escapeHTML(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // Converts simple markdown-style text from the model (bullet lines
  // starting with "-", "*", or "1.", plus **bold** and `code`) into
  // safe HTML: paragraphs, <ul>/<ol> lists, <strong>, <code>.
  function formatBotReply(text) {
    var escaped = escapeHTML(text.trim());

    // Inline formatting: **bold** and `code`
    escaped = escaped
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`(.+?)`/g, "<code>$1</code>");

    var lines = escaped.split(/\r?\n/);
    var html = "";
    var listType = null; // "ul" | "ol" | null
    var paragraphBuffer = [];

    function flushParagraph() {
      if (paragraphBuffer.length) {
        html += "<p>" + paragraphBuffer.join(" ") + "</p>";
        paragraphBuffer = [];
      }
    }
    function closeList() {
      if (listType) {
        html += "</" + listType + ">";
        listType = null;
      }
    }

    lines.forEach(function (rawLine) {
      var line = rawLine.trim();

      if (!line) {
        flushParagraph();
        closeList();
        return;
      }

      var bulletMatch = line.match(/^[-*•]\s+(.*)/);
      var numberedMatch = line.match(/^\d+[.)]\s+(.*)/);

      if (bulletMatch) {
        flushParagraph();
        if (listType !== "ul") { closeList(); html += "<ul>"; listType = "ul"; }
        html += "<li>" + bulletMatch[1] + "</li>";
      } else if (numberedMatch) {
        flushParagraph();
        if (listType !== "ol") { closeList(); html += "<ol>"; listType = "ol"; }
        html += "<li>" + numberedMatch[1] + "</li>";
      } else {
        closeList();
        paragraphBuffer.push(line);
      }
    });

    flushParagraph();
    closeList();

    return html || "<p>" + escaped + "</p>";
  }

  function addMessage(text, role) {
    var el = document.createElement("div");
    el.className = "chatbot-msg " + role;

    if (role === "bot") {
      el.innerHTML = formatBotReply(text);
    } else {
      el.textContent = text;
    }

    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }

  function showTyping() {
    var el = document.createElement("div");
    el.className = "chatbot-typing";
    el.id = "chatbotTyping";
    el.innerHTML = "<span></span><span></span><span></span>";
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  function hideTyping() {
    var el = document.getElementById("chatbotTyping");
    if (el) el.remove();
  }

  /* ---------- Sending ---------- */
  async function sendMessage(text) {
    isSending = true;
    input.disabled = true;

    addMessage(text, "user");
    showTyping();

    try {
      var res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: history }),
      });

      if (!res.ok) throw new Error("Request failed with status " + res.status);

      var data = await res.json();
      hideTyping();

      var reply = data.reply || "I couldn't generate a response just now.";
      addMessage(reply, "bot");

      history.push({ role: "user", content: text });
      history.push({ role: "assistant", content: reply });
    } catch (err) {
      hideTyping();
      addMessage(
        "I couldn't reach the assistant right now. Please try again in a moment.",
        "error"
      );
      console.error("Chatbot error:", err);
    } finally {
      isSending = false;
      input.disabled = false;
      input.focus();
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text || isSending) return;
    input.value = "";
    sendMessage(text);
  });
})();
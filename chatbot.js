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
  function addMessage(text, role) {
    var el = document.createElement("div");
    el.className = "chatbot-msg " + role;
    el.textContent = text;
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
/**
 * Succulent Course AI Chat
 * Talks to a Cloudflare Worker that uses Workers AI
 */

const WORKER_URL = "PASTE_YOUR_WORKER_URL_HERE";   // <-- change this after deploying the Worker

let chatHistory = [];

function initChat() {
  const chatContainer = document.getElementById("chatContainer");
  if (!chatContainer) return;

  chatContainer.innerHTML = `
    <div class="chat-header">
      <h2>Specialist Succulent Assistant</h2>
      <p>Detailed, adult-level advice on succulent care, propagation, problems and UK growing conditions. Powered by free Cloudflare Workers AI.</p>
    </div>

    <div class="chat-messages" id="chatMessages">
      <div class="message bot">
        <div class="bubble">
          Hello. I can give detailed specialist guidance on succulents and cacti, including the reasoning behind recommendations.<br><br>
          Examples of good questions:<br>
          • “My Echeveria has soft lower leaves and the stem feels soft near the soil – what is the likely cause and how should I recover it?”<br>
          • “Explain the best substrate mix and watering approach for Haworthia in a UK winter on a north-east windowsill.”<br>
          • “Step-by-step leaf propagation for Graptopetalum, including aftercare and common failure points.”<br>
          • “How does light intensity affect etiolation and colouration in Echeveria, and what can I realistically achieve indoors in the UK?”<br><br>
          Ask as specifically as you like – more detail in the question usually produces more useful answers.
        </div>
      </div>
    </div>

    <div class="chat-input-area">
      <textarea id="chatInput" rows="3" placeholder="Type a detailed question about your succulents..."></textarea>
      <button id="sendBtn" class="btn">Send</button>
    </div>

    <p class="chat-note">Answers are AI-generated using a free model with a specialist horticultural prompt. They are detailed and usually accurate for common and intermediate questions, but treat them as informed guidance rather than absolute authority. Course module progress is separate from this chat.</p>
  `;

  const input = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendBtn");

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
}

async function sendMessage() {
  const input = document.getElementById("chatInput");
  const messagesDiv = document.getElementById("chatMessages");
  const sendBtn = document.getElementById("sendBtn");

  const text = input.value.trim();
  if (!text) return;

  // Add user message
  appendMessage("user", text);
  input.value = "";
  sendBtn.disabled = true;
  sendBtn.textContent = "Thinking...";

  // Show temporary "typing" indicator
  const typingId = appendMessage("bot", "…", true);

  try {
    if (WORKER_URL.includes("PASTE_YOUR_WORKER")) {
      throw new Error("Worker URL not set. Please follow the deployment instructions.");
    }

    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        history: chatHistory
      })
    });

    const data = await res.json();

    // Remove typing indicator
    document.getElementById(typingId)?.remove();

    if (data.error) {
      appendMessage("bot", "Sorry – " + data.error);
    } else {
      const reply = data.reply || "No reply received.";
      appendMessage("bot", reply);

      // Keep short history for context
      chatHistory.push({ role: "user", content: text });
      chatHistory.push({ role: "assistant", content: reply });
      if (chatHistory.length > 12) {
        chatHistory = chatHistory.slice(-12);
      }
    }
  } catch (err) {
    document.getElementById(typingId)?.remove();
    appendMessage("bot", "Could not reach the AI helper. Check that the Worker URL is correct and the Worker is deployed. Error: " + err.message);
  }

  sendBtn.disabled = false;
  sendBtn.textContent = "Send";
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function appendMessage(role, text, isTemp = false) {
  const messagesDiv = document.getElementById("chatMessages");
  const id = "msg-" + Date.now() + Math.random().toString(36).slice(2, 7);

  const div = document.createElement("div");
  div.className = `message ${role}`;
  div.id = id;
  div.innerHTML = `<div class="bubble">${formatText(text)}</div>`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  return id;
}

function formatText(text) {
  // Very simple formatting: turn line breaks into <br>
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");
}

// Auto-init when the page loads
document.addEventListener("DOMContentLoaded", initChat);

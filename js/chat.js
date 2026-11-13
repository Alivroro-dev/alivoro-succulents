
/**
 * SUCCULENT SUCCESS
 * Specialist AI Assistant, Version 2
 *
 * Features:
 * - Saved conversations
 * - Automatic subject titles
 * - Searchable history
 * - Continue old discussions
 * - Delete and export conversations
 * - Lesson-aware questions
 * - Mobile-friendly interface
 *
 * Storage: browser localStorage
 * AI: existing Cloudflare Worker
 */

const WORKER_URL =
  "https://succulent-ai.shiny-credit-7871.workers.dev";

const CHAT_STORAGE_KEY = "succulent-success-chats-v2";
const CHAT_CONTEXT_LIMIT = 12;

let conversations = [];
let activeConversationId = null;
let isSending = false;

// ---------- STORAGE ----------

function loadConversations() {
  try {
    const saved = localStorage.getItem(CHAT_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];

    conversations = Array.isArray(parsed)
      ? parsed.filter(c =>
          c &&
          typeof c.id === "string" &&
          Array.isArray(c.messages)
        )
      : [];
  } catch (error) {
    console.error("Unable to load chat history:", error);
    conversations = [];
  }
}

function saveConversations() {
  try {
    localStorage.setItem(
      CHAT_STORAGE_KEY,
      JSON.stringify(conversations)
    );
    return true;
  } catch (error) {
    console.error("Unable to save conversations:", error);
    showStatus(
      "Storage unavailable or full. Export your history.",
      true
    );
    return false;
  }
}

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return crypto.randomUUID();
  }

  return Date.now() + "-" +
    Math.random().toString(36).slice(2);
}

function getActiveConversation() {
  return conversations.find(
    c => c.id === activeConversationId
  );
}

function makeTitle(question) {
  const cleaned = question
    .replace(/\s+/g, " ")
    .replace(/[?!.]+$/, "")
    .trim();

  const words = cleaned.split(" ");
  const short = words.slice(0, 9).join(" ");

  return short.length > 65
    ? short.slice(0, 62) + "..."
    : short || "New plant discussion";
}

function createConversation() {
  const conversation = {
    id: createId(),
    title: "New plant discussion",
    category: getCurrentLesson(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: []
  };

  conversations.unshift(conversation);
  activeConversationId = conversation.id;

  saveConversations();
  renderHistory();
  renderMessages();

  return conversation;
}

// ---------- LESSON CONTEXT ----------

function getCurrentLesson() {
  const heading = document.querySelector(
    ".module-page h1"
  );

  if (heading) {
    return heading.textContent.trim().slice(0, 120);
  }

  return "General succulent care";
}

// ---------- INTERFACE ----------

function addChatStyles() {
  if (document.getElementById("chatV2Styles")) return;

  const style = document.createElement("style");
  style.id = "chatV2Styles";

  style.textContent = `
    .ai-workspace {
      display: grid;
      grid-template-columns: 260px minmax(0, 1fr);
      gap: 16px;
      margin: 20px 0;
    }

    .ai-sidebar {
      background: #f0f7f2;
      border: 1px solid #d8e2dc;
      border-radius: 12px;
      padding: 15px;
      min-width: 0;
    }

    .ai-sidebar h3 {
      margin-bottom: 12px;
      color: #1b4332;
    }

    .ai-search {
      width: 100%;
      padding: 11px;
      margin: 10px 0;
      border: 1px solid #d8e2dc;
      border-radius: 8px;
      font: inherit;
    }

    .ai-history {
      max-height: 430px;
      overflow-y: auto;
    }

    .ai-history-item {
      display: block;
      width: 100%;
      text-align: left;
      background: white;
      color: #1b4332;
      border: 1px solid #d8e2dc;
      border-radius: 8px;
      padding: 11px;
      margin-bottom: 8px;
      cursor: pointer;
      overflow-wrap: anywhere;
    }

    .ai-history-item.active {
      border: 2px solid #2d6a4f;
      background: #e8f5ec;
    }

    .ai-history-item small {
      display: block;
      color: #52796f;
      margin-top: 5px;
    }

    .ai-main {
      min-width: 0;
    }

    .ai-toolbar {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin: 10px 0;
    }

    .ai-action {
      background: #2d6a4f;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 10px 13px;
      cursor: pointer;
      font: inherit;
    }

    .ai-action.secondary {
      background: #eef7f0;
      color: #1b4332;
      border: 1px solid #d8e2dc;
    }

    .ai-action:disabled {
      opacity: .5;
      cursor: not-allowed;
    }

    .ai-status {
      font-size: 13px;
      color: #52796f;
      padding: 8px 0;
    }

    .ai-status.error {
      color: #a32626;
    }

    .ai-empty {
      padding: 20px;
      color: #52796f;
      text-align: center;
    }

    .chat-messages {
      height: 420px;
      overflow-y: auto;
    }

    .message .bubble {
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }

    @media (max-width: 700px) {
      .ai-workspace {
        grid-template-columns: minmax(0, 1fr);
      }

      .ai-history {
        max-height: 170px;
      }

      .chat-messages {
        height: 350px;
      }

      .chat-input-area {
        flex-wrap: wrap;
      }

      .chat-input-area textarea {
        flex-basis: 100%;
        min-width: 0;
      }

      .chat-input-area button {
        width: 100%;
      }
    }
  `;

  document.head.appendChild(style);
}

function initChat() {
  const container = document.getElementById(
    "chatContainer"
  );

  if (!container) return;

  loadConversations();
  addChatStyles();

  container.innerHTML = `
    <div class="chat-header">
      <h2>🌵 Specialist Succulent Assistant</h2>
      <p>
        Expert-level plant guidance, saved discussions
        and searchable learning history.
      </p>
    </div>

    <div class="ai-workspace">

      <aside class="ai-sidebar">
        <h3>My Plant Knowledge</h3>

        <button
          id="newChatBtn"
          class="ai-action"
          type="button">
          + New Discussion
        </button>

        <input
          id="chatSearch"
          class="ai-search"
          type="search"
          placeholder="Search plant topics..."
          aria-label="Search conversations">

        <div
          id="chatHistoryList"
          class="ai-history">
        </div>

        <div class="ai-toolbar">
          <button
            id="exportChatsBtn"
            class="ai-action secondary"
            type="button">
            Export History
          </button>
        </div>
      </aside>

      <div class="ai-main">

        <div class="ai-toolbar">
          <button
            id="deleteChatBtn"
            class="ai-action secondary"
            type="button">
            Delete Discussion
          </button>
        </div>

        <div
          id="chatMessages"
          class="chat-messages"
          role="log"
          aria-live="polite">
        </div>

        <div class="chat-input-area">
          <textarea
            id="chatInput"
            rows="3"
            placeholder="Ask about succulent care, identification, propagation or plant problems..."
            aria-label="Your plant question">
          </textarea>

          <button
            id="sendBtn"
            class="btn"
            type="button">
            Send
          </button>
        </div>

        <p id="aiStatus" class="ai-status"></p>

        <p class="chat-note">
          AI advice is educational and may contain
          mistakes. Check plant identification and
          important treatments before acting.
          Conversations are saved in this browser.
        </p>

      </div>
    </div>
  `;

  document.getElementById("sendBtn")
    .addEventListener("click", sendMessage);

  document.getElementById("newChatBtn")
    .addEventListener("click", () => {
      if (!isSending) createConversation();
    });

  document.getElementById("deleteChatBtn")
    .addEventListener("click", deleteConversation);

  document.getElementById("exportChatsBtn")
    .addEventListener("click", exportConversations);

  document.getElementById("chatSearch")
    .addEventListener("input", renderHistory);

  document.getElementById("chatInput")
    .addEventListener("keydown", event => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    });

  if (conversations.length) {
    activeConversationId = conversations
      .slice()
      .sort((a, b) => b.updatedAt - a.updatedAt)[0].id;
  } else {
    createConversation();
  }

  renderHistory();
  renderMessages();
}

// ---------- HISTORY ----------

function renderHistory() {
  const list = document.getElementById(
    "chatHistoryList"
  );

  if (!list) return;

  const search = (
    document.getElementById("chatSearch")?.value || ""
  ).toLowerCase().trim();

  list.replaceChildren();

  const matches = conversations
    .filter(conversation => {
      const searchable = [
        conversation.title,
        conversation.category,
        ...conversation.messages.map(m => m.content)
      ].join(" ").toLowerCase();

      return searchable.includes(search);
    })
    .sort((a, b) => b.updatedAt - a.updatedAt);

  if (!matches.length) {
    const empty = document.createElement("p");
    empty.className = "ai-empty";
    empty.textContent = "No matching discussions.";
    list.appendChild(empty);
    return;
  }

  matches.forEach(conversation => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "ai-history-item";

    if (conversation.id === activeConversationId) {
      button.classList.add("active");
    }

    const title = document.createElement("strong");
    title.textContent = conversation.title;

    const detail = document.createElement("small");
    detail.textContent =
      conversation.category + " • " +
      new Date(conversation.updatedAt)
        .toLocaleDateString("en-GB");

    button.append(title, detail);

    button.addEventListener("click", () => {
      if (isSending) return;

      activeConversationId = conversation.id;
      renderHistory();
      renderMessages();
    });

    list.appendChild(button);
  });
}

// ---------- MESSAGES ----------

function renderMessages() {
  const messagesDiv = document.getElementById(
    "chatMessages"
  );

  if (!messagesDiv) return;

  messagesDiv.replaceChildren();

  const conversation = getActiveConversation();

  if (!conversation || !conversation.messages.length) {
    appendMessage(
      "bot",
      "Welcome to Succulent Success.\n\n" +
      "Ask about plant identification, watering, " +
      "substrates, propagation, pests, diseases " +
      "or UK growing conditions.\n\n" +
      "Your discussions will be saved automatically."
    );
    return;
  }

  conversation.messages.forEach(message => {
    appendMessage(message.role, message.content);
  });
}

function appendMessage(role, text) {
  const messagesDiv = document.getElementById(
    "chatMessages"
  );

  if (!messagesDiv) return null;

  const wrapper = document.createElement("div");
  wrapper.className =
    "message " + (role === "user" ? "user" : "bot");

  const bubble = document.createElement("div");
  bubble.className = "bubble";

  // Safe text rendering. No HTML injection.
  bubble.textContent = String(text);

  wrapper.appendChild(bubble);
  messagesDiv.appendChild(wrapper);

  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  return wrapper;
}

function showStatus(message, isError = false) {
  const status = document.getElementById("aiStatus");

  if (!status) return;

  status.textContent = message;
  status.classList.toggle("error", isError);
}

// ---------- SEND TO CLOUDFLARE ----------

async function sendMessage() {
  if (isSending) return;

  const input = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendBtn");

  const text = input.value.trim();

  if (!text) return;

  let conversation = getActiveConversation();

  if (!conversation) {
    conversation = createConversation();
  }

  const previousHistory = conversation.messages
    .filter(m =>
      m.role === "user" || m.role === "assistant"
    )
    .slice(-CHAT_CONTEXT_LIMIT)
    .map(m => ({
      role: m.role,
      content: m.content
    }));

  if (!conversation.messages.length) {
    conversation.title = makeTitle(text);
    conversation.category = getCurrentLesson();
  }

  conversation.messages.push({
    role: "user",
    content: text,
    timestamp: Date.now()
  });

  conversation.updatedAt = Date.now();

  saveConversations();

  input.value = "";
  appendMessage("user", text);
  renderHistory();

  isSending = true;
  sendBtn.disabled = true;
  sendBtn.textContent = "Thinking...";

  showStatus("The specialist assistant is preparing a reply.");

  const typing = appendMessage("bot", "Thinking...");

  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: text,
        history: previousHistory
      })
    });

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error("The server returned invalid JSON.");
    }

    if (!response.ok || data.error) {
      throw new Error(
        data.error || "Server error " + response.status
      );
    }

    const reply = typeof data.reply === "string"
      ? data.reply.trim()
      : "";

    if (!reply) {
      throw new Error("No answer was returned.");
    }

    conversation.messages.push({
      role: "assistant",
      content: reply,
      timestamp: Date.now()
    });

    conversation.updatedAt = Date.now();

    saveConversations();

    typing?.remove();
    appendMessage("bot", reply);

    showStatus("Answer saved in your plant knowledge history.");

  } catch (error) {
    typing?.remove();

    appendMessage(
      "bot",
      "Your question has been saved, but the AI " +
      "could not answer it. Please try again.\n\n" +
      error.message
    );

    showStatus("AI request failed.", true);

  } finally {
    isSending = false;
    sendBtn.disabled = false;
    sendBtn.textContent = "Send";

    renderHistory();
  }
}

// ---------- DELETE ----------

function deleteConversation() {
  if (isSending) return;

  const conversation = getActiveConversation();
  if (!conversation) return;

  const approved = confirm(
    "Delete this discussion and all its answers? " +
    "This cannot be undone."
  );

  if (!approved) return;

  conversations = conversations.filter(
    c => c.id !== conversation.id
  );

  activeConversationId = null;

  if (conversations.length) {
    activeConversationId = conversations[0].id;
  }

  saveConversations();

  if (!activeConversationId) {
    createConversation();
  }

  renderHistory();
  renderMessages();

  showStatus("Discussion deleted.");
}

// ---------- EXPORT ----------

function exportConversations() {
  const exportData = {
    application: "Succulent Success",
    exportedAt: new Date().toISOString(),
    conversations
  };

  const blob = new Blob(
    [JSON.stringify(exportData, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download =
    "succulent-success-history-" +
    new Date().toISOString().slice(0, 10) +
    ".json";

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---------- START ----------

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initChat
  );
} else {
  initChat();
}

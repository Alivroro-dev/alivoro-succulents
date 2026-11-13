
/*
 * Succulent Success
 * Floating AI Assistant
 *
 * Opens the existing AI page without leaving
 * the current course lesson.
 */

(function () {
  "use strict";

  function initAIWidget() {
    if (document.getElementById("succulent-ai-widget")) {
      return;
    }

    const script = document.currentScript ||
      document.querySelector('script[src*="ai-widget.js"]');

    const scriptURL = script
      ? new URL(script.getAttribute("src"), document.baseURI)
      : new URL("js/ai-widget.js", document.baseURI);

    const aiURL = new URL("../ai.html", scriptURL).href;

    const widget = document.createElement("div");
    widget.id = "succulent-ai-widget";

    const button = document.createElement("button");
    button.id = "succulent-ai-toggle";
    button.type = "button";
    button.textContent = "🌵 Ask AI";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", "succulent-ai-panel");

    const panel = document.createElement("section");
    panel.id = "succulent-ai-panel";
    panel.hidden = true;

    const header = document.createElement("div");
    header.className = "succulent-ai-panel-header";

    const title = document.createElement("strong");
    title.textContent = "🌵 Succulent AI";

    const actions = document.createElement("div");

    const fullLink = document.createElement("a");
    fullLink.href = aiURL;
    fullLink.textContent = "Full AI";
    fullLink.title = "Open your full AI knowledge library";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.textContent = "✕";
    closeButton.setAttribute("aria-label", "Close AI");

    actions.append(fullLink, closeButton);
    header.append(title, actions);

    const frame = document.createElement("iframe");
    frame.title = "Specialist Succulent Assistant";
    frame.dataset.src = aiURL;
    frame.setAttribute("loading", "lazy");

    panel.append(header, frame);
    widget.append(button, panel);
    document.body.appendChild(widget);

    function openAI() {
      if (!frame.src) {
        frame.src = frame.dataset.src;
      }

      panel.hidden = false;
      button.setAttribute("aria-expanded", "true");
      button.textContent = "✕ Close AI";
    }

    function closeAI() {
      panel.hidden = true;
      button.setAttribute("aria-expanded", "false");
      button.textContent = "🌵 Ask AI";
    }

    button.addEventListener("click", function () {
      if (panel.hidden) {
        openAI();
      } else {
        closeAI();
      }
    });

    closeButton.addEventListener("click", closeAI);

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !panel.hidden) {
        closeAI();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAIWidget);
  } else {
    initAIWidget();
  }
})();

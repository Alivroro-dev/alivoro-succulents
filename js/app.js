const modules = [
  {
    id: 1,
    title: "What Are Succulents?",
    description: "Understand these special plants and why they suit beginners",
    file: "modules/01-what-are-succulents.html"
  },
  {
    id: 2,
    title: "Choosing Plants & Tools",
    description: "Simple shopping list and how to pick healthy plants",
    file: "modules/02-choosing-plants.html"
  },
  {
    id: 3,
    title: "Light, Water & Soil",
    description: "The three most important care rules",
    file: "modules/03-light-water-soil.html"
  },
  {
    id: 4,
    title: "Pots & Planting",
    description: "How to pot or repot your succulents safely",
    file: "modules/04-pots-planting.html"
  },
  {
    id: 5,
    title: "Propagation – Making New Plants",
    description: "Easy leaf and stem cuttings (very rewarding)",
    file: "modules/05-propagation.html"
  },
  {
    id: 6,
    title: "Common Problems",
    description: "Overwatering, pests, leggy growth – and how to fix them",
    file: "modules/06-problems.html"
  },
  {
    id: 7,
    title: "Seasonal Care in the UK",
    description: "Winter rest, summer growth, and window-sill tips",
    file: "modules/07-seasonal-uk.html"
  },
  {
    id: 8,
    title: "Simple Projects & Mindful Care",
    description: "Easy arrangements + using plants for calm focus",
    file: "modules/08-projects-mindful.html"
  }
];

function getProgress() {
  const saved = localStorage.getItem("succulentProgress");
  return saved ? JSON.parse(saved) : [];
}

function saveProgress(completed) {
  localStorage.setItem("succulentProgress", JSON.stringify(completed));
}

function updateProgressUI() {
  const completed = getProgress();
  const fill = document.getElementById("progressFill");
  const text = document.getElementById("progressText");
  if (!fill || !text) return;

  const percent = (completed.length / modules.length) * 100;
  fill.style.width = percent + "%";
  text.textContent = `${completed.length} of ${modules.length} modules completed`;
}

function renderModules() {
  const grid = document.getElementById("moduleGrid");
  if (!grid) return;

  const completed = getProgress();
  grid.innerHTML = "";

  modules.forEach(mod => {
    const isDone = completed.includes(mod.id);
    const card = document.createElement("a");
    card.href = mod.file;
    card.className = "module-link";
    card.innerHTML = `
      <div class="module-card ${isDone ? "completed" : ""}">
        <div class="module-number">${isDone ? "✓" : mod.id}</div>
        <div class="module-info">
          <h3>${mod.title}</h3>
          <p>${mod.description}</p>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function markComplete(moduleId) {
  const completed = getProgress();
  if (!completed.includes(moduleId)) {
    completed.push(moduleId);
    saveProgress(completed);
  }
  // Optional: go back to index after a short delay
  setTimeout(() => {
    window.location.href = "../index.html";
  }, 600);
}

// Run on index page
document.addEventListener("DOMContentLoaded", () => {
  updateProgressUI();
  renderModules();

  const resetBtn = document.getElementById("resetProgress");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (confirm("Reset all progress?")) {
        localStorage.removeItem("succulentProgress");
        updateProgressUI();
        renderModules();
      }
    });
  }
});

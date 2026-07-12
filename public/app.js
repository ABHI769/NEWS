const form = document.getElementById("searchForm");
const input = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const btnText = searchBtn.querySelector(".btn-text");
const btnLoader = searchBtn.querySelector(".btn-loader");
const results = document.getElementById("results");
const resultsTitle = document.getElementById("resultsTitle");
const resultsCount = document.getElementById("resultsCount");
const newsList = document.getElementById("newsList");
const emptyState = document.getElementById("emptyState");
const errorState = document.getElementById("errorState");
const errorMessage = document.getElementById("errorMessage");
const retryBtn = document.getElementById("retryBtn");
const topicChips = document.getElementById("topicChips");
const searchProgress = document.getElementById("searchProgress");
const dataStream = document.getElementById("dataStream");
const currentTimeEl = document.getElementById("currentTime");
const particlesContainer = document.getElementById("particles");

let lastQuery = "";

// ═══════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════

initParticles();
initClock();
initDataStream();

// ═══════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const query = input.value.trim();
  if (query) searchNews(query);
});

topicChips.addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  const topic = chip.dataset.topic;
  input.value = topic;
  searchNews(topic);
});

retryBtn.addEventListener("click", () => {
  if (lastQuery) searchNews(lastQuery);
});

// ═══════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════

async function searchNews(query) {
  lastQuery = query;
  setLoading(true);
  hideAllStates();
  animateProgress();

  try {
    const res = await fetch(`/api/news?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Connection to data source failed.");
    }

    if (!data.articles || data.articles.length === 0) {
      showEmpty(query);
      return;
    }

    renderResults(data);
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
    completeProgress();
  }
}

function renderResults(data) {
  resultsTitle.textContent = `SCAN: "${data.query.toUpperCase()}"`;
  resultsCount.textContent = `${data.count} SIGNAL${data.count !== 1 ? "S" : ""} INTERCEPTED`;

  newsList.innerHTML = data.articles
    .map(
      (article, i) => `
    <li class="news-item" style="animation-delay: ${i * 0.06}s">
      <a href="${escapeAttr(article.link)}" target="_blank" rel="noopener noreferrer">
        <div class="news-item-index">ENTRY_${String(i + 1).padStart(3, "0")}</div>
        <h3 class="news-title">${escapeHtml(article.title)}</h3>
        <div class="news-meta">
          <span class="news-source">${escapeHtml(article.source)}</span>
          ${article.published ? `<span class="news-date">${formatDate(article.published)}</span>` : ""}
        </div>
        <span class="read-link">
          ACCESS FULL REPORT
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 17L17 7M17 7H7M17 7V17"/>
          </svg>
        </span>
      </a>
    </li>
  `
    )
    .join("");

  results.hidden = false;
  emptyState.hidden = true;
  errorState.hidden = true;

  // Scroll to results
  results.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showEmpty(query) {
  emptyState.innerHTML = `
    <div class="empty-icon">
      <div class="empty-hex">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </div>
    </div>
    <p class="empty-text">No signals found for "<strong>${escapeHtml(query)}</strong>".<br>
    <span class="text-muted">Adjust parameters and re-execute scan.</span></p>
  `;
  emptyState.hidden = false;
  results.hidden = true;
  errorState.hidden = true;
}

function showError(message) {
  errorMessage.textContent = message;
  errorState.hidden = false;
  results.hidden = true;
  emptyState.hidden = true;
}

function hideAllStates() {
  results.hidden = true;
  errorState.hidden = true;
}

function setLoading(loading) {
  searchBtn.disabled = loading;
  btnText.hidden = loading;
  btnLoader.hidden = !loading;
}

// ═══════════════════════════════════════
// PROGRESS BAR
// ═══════════════════════════════════════

function animateProgress() {
  searchProgress.style.transition = "width 2s ease-out";
  searchProgress.style.width = "70%";
}

function completeProgress() {
  searchProgress.style.transition = "width 0.3s ease";
  searchProgress.style.width = "100%";
  setTimeout(() => {
    searchProgress.style.transition = "width 0.5s ease";
    searchProgress.style.width = "0%";
  }, 600);
}

// ═══════════════════════════════════════
// AMBIENT EFFECTS
// ═══════════════════════════════════════

function initParticles() {
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement("div");
    particle.classList.add("particle");
    particle.style.left = Math.random() * 100 + "%";
    particle.style.top = Math.random() * 100 + "%";
    particle.style.animationDelay = Math.random() * 6 + "s";
    particle.style.animationDuration = (4 + Math.random() * 4) + "s";
    particlesContainer.appendChild(particle);
  }
}

function initClock() {
  function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const date = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).toUpperCase();
    currentTimeEl.textContent = `${date} • ${time}`;
  }
  updateClock();
  setInterval(updateClock, 1000);
}

function initDataStream() {
  const chars = "░▒▓█▄▀■□◊◈◆●○";
  function updateStream() {
    let str = "";
    for (let i = 0; i < 12; i++) {
      str += chars[Math.floor(Math.random() * chars.length)];
    }
    dataStream.textContent = str;
  }
  setInterval(updateStream, 100);
}

// ═══════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════

function formatDate(dateStr) {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return "JUST NOW";
    if (diffHours < 24) return `${diffHours}H AGO`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}D AGO`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    }).toUpperCase();
  } catch {
    return "";
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return str.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

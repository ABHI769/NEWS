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

let lastQuery = "";

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

async function searchNews(query) {
  lastQuery = query;
  setLoading(true);
  hideAllStates();

  try {
    const res = await fetch(`/api/news?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Something went wrong.");
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
  }
}

function renderResults(data) {
  resultsTitle.textContent = `News about "${data.query}"`;
  resultsCount.textContent = `${data.count} article${data.count !== 1 ? "s" : ""} found`;

  newsList.innerHTML = data.articles
    .map(
      (article, i) => `
    <li class="news-item">
      <a href="${escapeAttr(article.link)}" target="_blank" rel="noopener noreferrer">
        <h3 class="news-title">${escapeHtml(article.title)}</h3>
        <div class="news-meta">
          <span class="news-source">${escapeHtml(article.source)}</span>
          ${article.published ? `<span class="news-date">${formatDate(article.published)}</span>` : ""}
        </div>
        <span class="read-link">
          Read full article
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
}

function showEmpty(query) {
  emptyState.innerHTML = `
    <div class="empty-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    </div>
    <p>No news found for "<strong>${escapeHtml(query)}</strong>". Try a different topic or broader keywords.</p>
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

function formatDate(dateStr) {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
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

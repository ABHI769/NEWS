const express = require("express");
const path = require("path");
const Parser = require("rss-parser");

const app = express();
const parser = new Parser({
  customFields: {
    item: ["source"],
  },
});

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/news", async (req, res) => {
  const query = (req.query.q || "").trim();

  if (!query) {
    return res.status(400).json({ error: "Please provide a search topic." });
  }

  try {
    const encoded = encodeURIComponent(query);
    const feedUrl = `https://news.google.com/rss/search?q=${encoded}&hl=en-US&gl=US&ceid=US:en`;
    const feed = await parser.parseURL(feedUrl);

    const articles = (feed.items || []).map((item) => ({
      title: item.title || "Untitled",
      link: item.link || "#",
      published: item.pubDate || item.isoDate || null,
      source: extractSource(item),
    }));

    res.json({
      query,
      count: articles.length,
      articles,
    });
  } catch (err) {
    console.error("News fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch news. Please try again." });
  }
});

function extractSource(item) {
  if (item.source && typeof item.source === "object" && item.source._) {
    return item.source._;
  }
  if (typeof item.source === "string") {
    return item.source;
  }

  const match = (item.title || "").match(/ - ([^-]+)$/);
  return match ? match[1].trim() : "Unknown";
}

app.listen(PORT, () => {
  console.log(`News Finder running at http://localhost:${PORT}`);
});

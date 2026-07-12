# News Finder

Search the latest news on any topic. Enter a subject and get headlines with links to read the full articles.

## How it works

- Type any topic (e.g. "artificial intelligence", "India elections", "climate change")
- The app fetches live headlines from Google News RSS
- Each result shows a **heading**, **source**, **date**, and a **link** to the full article

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the server:

   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech stack

- **Backend:** Node.js + Express
- **News source:** Google News RSS (no API key required)
- **Frontend:** HTML, CSS, JavaScript

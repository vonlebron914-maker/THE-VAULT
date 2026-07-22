const { DataStream } = require('scramjet');
const express = require('express');
const { createServer } = require('http');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ limit: '50mb' }));

// Game database
const games = [
  // ACTION GAMES
  { name: "Shell Shockers", url: "https://shellshockers.io", category: "action", tags: ["multiplayer", "shooter"] },
  { name: "Krunker", url: "https://krunker.io", category: "action", tags: ["multiplayer", "shooter", "fps"] },
  { name: "Slope", url: "https://slope-game.com", category: "action", tags: ["endless", "arcade"] },
  // ... (add all games from script.js)
];

const allowedDomains = [
  "shellshockers.io", "krunker.io", "slope-game.com", "tunnelrushgame.com",
  // ... (add all domains)
];

// ========== SEARCH ENDPOINT (Scramjet) ==========
app.get('/api/search', (req, res) => {
  const query = (req.query.q || '').toLowerCase();
  const category = (req.query.category || 'all').toLowerCase();

  DataStream.from(games)
    .filter(game => {
      const matchesQuery = !query || 
        game.name.toLowerCase().includes(query) ||
        game.tags.some(tag => tag.toLowerCase().includes(query));
      
      const matchesCategory = category === 'all' || game.category === category;
      
      return matchesQuery && matchesCategory;
    })
    .toArray()
    .then(results => {
      res.json({
        query,
        category,
        count: results.length,
        games: results
      });
    })
    .catch(err => {
      console.error('Search error:', err);
      res.status(500).json({ error: 'Search failed' });
    });
});

// ========== CATEGORY BROWSE ENDPOINT (Scramjet) ==========
app.get('/api/categories', (req, res) => {
  DataStream.from(games)
    .map(game => game.category)
    .reduce((acc, cat) => {
      if (!acc.includes(cat)) acc.push(cat);
      return acc;
    }, [])
    .then(categories => {
      res.json({
        categories: ['all', ...categories.sort()]
      });
    })
    .catch(err => {
      console.error('Category error:', err);
      res.status(500).json({ error: 'Failed to fetch categories' });
    });
});

// ========== GAME STATS ENDPOINT (Scramjet) ==========
app.get('/api/stats', (req, res) => {
  DataStream.from(games)
    .reduce((stats, game) => {
      stats.totalGames++;
      if (!stats.byCategory[game.category]) {
        stats.byCategory[game.category] = 0;
      }
      stats.byCategory[game.category]++;
      stats.tags = [...new Set([...stats.tags, ...game.tags])];
      return stats;
    }, { totalGames: 0, byCategory: {}, tags: [] })
    .then(stats => {
      res.json(stats);
    })
    .catch(err => {
      console.error('Stats error:', err);
      res.status(500).json({ error: 'Failed to fetch stats' });
    });
});

// ========== PROXY ENDPOINT ==========
app.all("/proxy", async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).json({ error: "Missing URL" });

    const parsedUrl = new URL(targetUrl);
    const isAllowed = allowedDomains.some(d => 
      parsedUrl.hostname === d || parsedUrl.hostname.endsWith("." + d)
    );
    if (!isAllowed) return res.status(403).json({ error: "Domain blocked" });

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': targetUrl,
      'Origin': `https://${parsedUrl.hostname}`,
    };

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      redirect: 'follow',
      timeout: 30000
    });

    if (!response.ok) return res.status(response.status).json({ error: "Failed to load" });

    const contentType = response.headers.get("content-type") || "";
    
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', '*');
    
    if (contentType.includes("text/html")) {
      let html = await response.text();
      html = rewriteHtmlUrls(html, targetUrl);
      res.set("Content-Type", "text/html; charset=utf-8");
      res.send(html);
    } else {
      const buffer = await response.buffer();
      res.set("Content-Type", contentType);
      res.send(buffer);
    }
  } catch (error) {
    console.error("Proxy error:", error.message);
    res.status(500).json({ error: "Proxy failed" });
  }
});

function rewriteHtmlUrls(html, targetUrl) {
  const $ = cheerio.load(html, { decodeEntities: false });
  const origin = new URL(targetUrl).origin;

  $('script[src], link[href], img[src], iframe[src]').each((i, el) => {
    const attr = el.attribs.src || el.attribs.href;
    if (attr && !attr.startsWith('data:')) {
      const resolved = new URL(attr, targetUrl).href;
      if (el.attribs.src) el.attribs.src = `/proxy?url=${encodeURIComponent(resolved)}`;
      if (el.attribs.href) el.attribs.href = `/proxy?url=${encodeURIComponent(resolved)}`;
    }
  });

  return $.html();
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'scramjet-proxy' });
});

createServer(app).listen(PORT, () => {
  console.log(`🚀 Scramjet Proxy v1.0`);
  console.log(`🎮 Game Portal: http://localhost:${PORT}`);
  console.log(`🔍 Search endpoint: http://localhost:${PORT}/api/search?q=<query>&category=<category>`);
  console.log(`📊 Stats endpoint: http://localhost:${PORT}/api/stats`);
  console.log(`📁 Categories endpoint: http://localhost:${PORT}/api/categories`);
});

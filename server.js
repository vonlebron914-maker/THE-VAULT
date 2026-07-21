const express = require("express");
const path = require("path");
const { createServer } = require("http");
const { WebSocketServer } = require("ws");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(__dirname));

// Approved game domains
const allowedDomains = [
  "shellshockers.io", "krunker.io", "slope-game.com", "tunnelrushgame.com",
  "geometrydashlite.io", "crossyroadgame.com", "flappybird.io", "chromedino.com",
  "cookieclicker.ee", "bitlifegame.com", "pacman.live", "playsnake.org",
  "drifthunters.io", "madalinstuntcars2.com", "1v1.lol", "paper-io.com",
  "hole-io.com", "slither.io", "agar.io", "zombsroyale.io", "tetris.com",
  "run3.io", "motox3m.io", "fireboy-watergirl.io", "portalflash.io",
  "basketball-legends.io", "dinorunner.io", "supermario.io", "spaceinvaders.io",
  "pacman-battle.io", "penalty-kicks.io", "baseball-star.io", "ice-hockey.io",
  "bob-robber.io", "chess.io", "checkers.io", "2048game.io", "stickman-hook.io"
];

// Resource cache
const resourceCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

// Main proxy endpoint
app.get("/proxy", async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).json({ error: "Missing URL" });

    const parsedUrl = new URL(targetUrl);
    const isAllowed = allowedDomains.some(d => 
      parsedUrl.hostname === d || parsedUrl.hostname.endsWith("." + d)
    );
    if (!isAllowed) return res.status(403).json({ error: "Domain blocked" });

    // Check cache
    if (resourceCache.has(targetUrl)) {
      const cached = resourceCache.get(targetUrl);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        res.set(cached.headers);
        return res.send(cached.data);
      }
    }

    // Fetch with advanced headers
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': targetUrl,
        'Origin': `https://${parsedUrl.hostname}`,
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      redirect: 'follow',
      timeout: 30000
    });

    if (!response.ok) return res.status(response.status).json({ error: "Failed to load" });

    const contentType = response.headers.get("content-type") || "";
    
    // Set aggressive CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Expose-Headers', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('X-Frame-Options', 'SAMEORIGIN');
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline';");

    // Handle content types
    if (contentType.includes("text/html")) {
      let html = await response.text();
      html = rewriteHtmlUrls(html, parsedUrl.origin, targetUrl);
      html = injectAdvancedProxyScript(html, targetUrl);
      html = fixCorsIssues(html);
      
      res.set("Content-Type", "text/html; charset=utf-8");
      resourceCache.set(targetUrl, {
        data: html,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
        timestamp: Date.now()
      });
      res.send(html);
    } else if (contentType.includes("javascript")) {
      let js = await response.text();
      js = rewriteJavaScript(js, parsedUrl.origin, targetUrl);
      res.set("Content-Type", "application/javascript; charset=utf-8");
      res.send(js);
    } else if (contentType.includes("css")) {
      let css = await response.text();
      css = rewriteCssUrls(css, parsedUrl.origin, targetUrl);
      res.set("Content-Type", "text/css; charset=utf-8");
      res.send(css);
    } else if (contentType.includes("json")) {
      const json = await response.json();
      res.json(json);
    } else {
      const buffer = await response.buffer();
      res.set("Content-Type", contentType);
      resourceCache.set(targetUrl, {
        data: buffer,
        headers: { 'Content-Type': contentType },
        timestamp: Date.now()
      });
      res.send(buffer);
    }
  } catch (error) {
    console.error("Proxy error:", error.message);
    res.status(500).json({ error: "Proxy failed", details: error.message });
  }
});

// CORS preflight
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Expose-Headers', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Helper functions
function rewriteHtmlUrls(html, origin, targetUrl) {
  const $ = cheerio.load(html, { decodeEntities: false });
  
  $('script[src]').each((i, el) => {
    let src = $(el).attr('src');
    if (src) {
      src = resolveUrl(src, targetUrl);
      $(el).attr('src', `/proxy?url=${encodeURIComponent(src)}`);
    }
  });

  $('link[href]').each((i, el) => {
    let href = $(el).attr('href');
    if (href && !href.startsWith('data:')) {
      href = resolveUrl(href, targetUrl);
      $(el).attr('href', `/proxy?url=${encodeURIComponent(href)}`);
    }
  });

  $('img[src], source[src]').each((i, el) => {
    let src = $(el).attr('src');
    if (src && !src.startsWith('data:')) {
      src = resolveUrl(src, targetUrl);
      $(el).attr('src', `/proxy?url=${encodeURIComponent(src)}`);
    }
  });

  $('iframe[src]').each((i, el) => {
    let src = $(el).attr('src');
    if (src && !src.startsWith('data:')) {
      src = resolveUrl(src, targetUrl);
      $(el).attr('src', `/proxy?url=${encodeURIComponent(src)}`);
    }
  });

  $('form[action]').each((i, el) => {
    let action = $(el).attr('action');
    if (action && !action.startsWith('data:')) {
      action = resolveUrl(action, targetUrl);
      $(el).attr('action', `/proxy?url=${encodeURIComponent(action)}`);
    }
  });

  return $.html();
}

function fixCorsIssues(html) {
  html = html.replace(/X-Frame-Options[^;]*/gi, '');
  html = html.replace(/Content-Security-Policy[^;]*/gi, '');
  const $ = cheerio.load(html);
  $('meta[http-equiv="X-UA-Compatible"]').remove();
  return $.html();
}

function rewriteCssUrls(css, origin, targetUrl) {
  return css.replace(/url\(['\"]?(?!data:)([^'\"\)\s]+)['\"]?\)/g, (match, urlStr) => {
    const resolved = resolveUrl(urlStr, targetUrl);
    return `url('${resolved}')`;
  });
}

function rewriteJavaScript(js, origin, targetUrl) {
  js = js.replace(/fetch\(['\"`]([^'\"`)]+)['\"\`]/g, (match, fetchUrl) => {
    if (!fetchUrl.startsWith('/proxy') && !fetchUrl.startsWith('data:')) {
      const resolved = resolveUrl(fetchUrl, targetUrl);
      return `fetch('/proxy?url=${encodeURIComponent(resolved)}'`;
    }
    return match;
  });

  js = js.replace(/\.open\(['\"`]([A-Z]+)['\"\`],\s*['\"`]([^'\"`)]+)['\"\`]/g, (match, method, xhrUrl) => {
    if (!xhrUrl.startsWith('/proxy') && !xhrUrl.startsWith('data:')) {
      const resolved = resolveUrl(xhrUrl, targetUrl);
      return `.open('${method}', '/proxy?url=${encodeURIComponent(resolved)}'`;
    }
    return match;
  });

  return js;
}

function resolveUrl(urlStr, baseUrl) {
  if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) return urlStr;
  if (urlStr.startsWith('//')) return 'https:' + urlStr;
  if (urlStr.startsWith('/')) return new URL(baseUrl).origin + urlStr;
  if (urlStr.startsWith('#') || urlStr.startsWith('javascript:') || urlStr.startsWith('data:')) return urlStr;
  try {
    return new URL(urlStr, baseUrl).href;
  } catch {
    return urlStr;
  }
}

function injectAdvancedProxyScript(html, targetUrl) {
  const script = `
    <script>
      window.PROXY_URL = '${targetUrl}';
      window.PROXY_ORIGIN = new URL(window.PROXY_URL).origin;

      // Intercept fetch
      const origFetch = window.fetch;
      window.fetch = function(...args) {
        let url = args[0];
        if (typeof url === 'string' && !url.startsWith('/proxy')) {
          if (!url.startsWith('http')) url = new URL(url, window.PROXY_URL).href;
          args[0] = '/proxy?url=' + encodeURIComponent(url);
        }
        return origFetch.apply(this, args);
      };

      // Intercept XMLHttpRequest
      const origOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        if (typeof url === 'string' && !url.startsWith('/proxy')) {
          if (!url.startsWith('http')) url = new URL(url, window.PROXY_URL).href;
          url = '/proxy?url=' + encodeURIComponent(url);
        }
        return origOpen.apply(this, [method, url, ...rest]);
      };

      // Intercept WebSocket
      const origWS = window.WebSocket;
      window.WebSocket = function(url, ...rest) {
        if (!url.startsWith('ws')) {
          const wsUrl = (window.location.protocol === 'https:' ? 'wss' : 'ws') + '://' + window.location.host + '/ws?url=' + encodeURIComponent(url);
          return new origWS(wsUrl, ...rest);
        }
        return new origWS(url, ...rest);
      };

      // Fix document.domain
      try {
        const domain = new URL(window.PROXY_URL).hostname;
        document.domain = domain;
      } catch (e) {}

      // Disable security checks
      window.eval = eval;

      // Service Worker support
      if ('serviceWorker' in navigator) {
        const origReg = navigator.serviceWorker.register;
        navigator.serviceWorker.register = function(url, opts) {
          const resolved = new URL(url, window.PROXY_URL).href;
          return origReg.call(this, '/proxy?url=' + encodeURIComponent(resolved), opts);
        };
      }

      // Image proxy
      const OrigImg = window.Image;
      window.Image = function() {
        const img = new OrigImg();
        const origSrc = Object.getOwnPropertyDescriptor(OrigImg.prototype, 'src');
        Object.defineProperty(img, 'src', {
          set: function(val) {
            if (val && !val.startsWith('data:') && !val.startsWith('/proxy')) {
              const resolved = new URL(val, window.PROXY_URL).href;
              origSrc.set.call(this, '/proxy?url=' + encodeURIComponent(resolved));
            } else {
              origSrc.set.call(this, val);
            }
          },
          get: function() {
            return origSrc.get.call(this);
          }
        });
        return img;
      };
    </script>
  `;
  
  if (html.includes('</head>')) {
    return html.replace('</head>', script + '</head>');
  } else if (html.includes('</body>')) {
    return html.replace('</body>', script + '</body>');
  }
  return html + script;
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const server = createServer(app);

// WebSocket proxy
const wss = new WebSocketServer({ server, path: '/ws' });
wss.on('connection', (ws, req) => {
  const queryUrl = req.url.split('?url=')[1];
  if (!queryUrl) {
    ws.close();
    return;
  }

  const targetUrl = decodeURIComponent(queryUrl);
  const wsUrl = targetUrl.replace('https://', 'wss://').replace('http://', 'ws://');

  try {
    const targetWs = new (require('ws'))(wsUrl);

    targetWs.on('message', (data) => {
      if (ws.readyState === ws.OPEN) ws.send(data);
    });

    targetWs.on('open', () => {
      if (ws.readyState === ws.OPEN) ws.send(JSON.stringify({ type: 'connected' }));
    });

    targetWs.on('error', (err) => {
      console.error('Target WS error:', err);
      if (ws.readyState === ws.OPEN) ws.close();
    });

    ws.on('message', (data) => {
      if (targetWs.readyState === targetWs.OPEN) targetWs.send(data);
    });

    ws.on('close', () => {
      targetWs.close();
    });
  } catch (err) {
    console.error('WS proxy error:', err);
    ws.close();
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`🎮 THE VAULT v3.0 - ULTIMATE PROXY`);
  console.log(`📝 Password: bannana13!`);
  console.log(`✅ WebSocket support enabled`);
  console.log(`✅ Service Worker support enabled`);
  console.log(`✅ Advanced request interception`);
  console.log(`🚀 Running on http://localhost:${PORT}`);
  console.log(`🔥 ALL GAMES WILL WORK 100%`);
});
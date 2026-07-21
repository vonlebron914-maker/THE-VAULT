const express = require("express");
const path = require("path");
const { createServer } = require("http");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(__dirname));

// Approved game domains
const allowedDomains = [
  "shellshockers.io",
  "krunker.io",
  "slope-game.com",
  "tunnelrushgame.com",
  "geometrydashlite.io",
  "crossyroadgame.com",
  "flappybird.io",
  "chromedino.com",
  "cookieclicker.ee",
  "bitlifegame.com",
  "pacman.live",
  "playsnake.org",
  "drifthunters.io",
  "madalinstuntcars2.com",
  "1v1.lol",
  "paper-io.com",
  "hole-io.com",
  "slither.io",
  "agar.io",
  "zombsroyale.io",
  "tetris.com",
  "run3.io",
  "motox3m.io",
  "fireboy-watergirl.io",
  "portalflash.io",
  "basketball-legends.io",
  "dinorunner.io",
  "supermario.io",
  "spaceinvaders.io",
  "pacman-battle.io",
  "penalty-kicks.io",
  "baseball-star.io",
  "ice-hockey.io",
  "bob-robber.io",
  "chess.io",
  "checkers.io",
  "2048game.io"
];

// CORS Proxy Endpoint
app.get("/proxy", async (req, res) => {
  try {
    const targetUrl = req.query.url;

    if (!targetUrl) {
      return res.status(400).json({ error: "Missing URL parameter" });
    }

    const url = new URL(targetUrl);

    // Validate domain
    const isAllowed = allowedDomains.some(domain => {
      return url.hostname === domain || url.hostname.endsWith("." + domain);
    });

    if (!isAllowed) {
      return res.status(403).json({ error: "Domain not approved" });
    }

    // Fetch the resource
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Referer': targetUrl,
        'Origin': `https://${url.hostname}`
      },
      redirect: 'follow'
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Failed to load: ${response.statusText}` });
    }

    const contentType = response.headers.get("content-type") || "";
    
    // Set CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('X-Frame-Options', 'ALLOWALL');
    res.header('Content-Security-Policy', "default-src *; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline';");

    // Handle different content types
    if (contentType.includes("text/html")) {
      let html = await response.text();
      
      // Rewrite URLs in HTML
      html = rewriteHtmlUrls(html, url.origin, targetUrl);
      
      // Inject proxy helper script
      html = injectProxyScript(html, url.origin);
      
      res.set("Content-Type", "text/html; charset=utf-8");
      res.send(html);
    } else if (contentType.includes("application/javascript") || contentType.includes("text/javascript")) {
      let js = await response.text();
      
      // Rewrite fetch/XHR calls in JS
      js = rewriteJavaScript(js, url.origin);
      
      res.set("Content-Type", "application/javascript; charset=utf-8");
      res.send(js);
    } else if (contentType.includes("text/css")) {
      let css = await response.text();
      
      // Rewrite URLs in CSS
      css = rewriteCssUrls(css, url.origin);
      
      res.set("Content-Type", "text/css; charset=utf-8");
      res.send(css);
    } else if (contentType.includes("application/json")) {
      const json = await response.json();
      res.json(json);
    } else {
      // For images, fonts, and other binary data
      const buffer = await response.buffer();
      res.set("Content-Type", contentType);
      res.send(buffer);
    }

  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Proxy request failed", details: error.message });
  }
});

// Rewrite HTML URLs
function rewriteHtmlUrls(html, origin, targetUrl) {
  const $ = cheerio.load(html, { decodeEntities: false });

  // Rewrite script sources
  $('script[src]').each((i, elem) => {
    let src = $(elem).attr('src');
    if (src && !src.startsWith('http') && !src.startsWith('data:')) {
      src = new URL(src, targetUrl).href;
      $(elem).attr('src', `/proxy?url=${encodeURIComponent(src)}`);
    } else if (src && src.startsWith('http')) {
      $(elem).attr('src', `/proxy?url=${encodeURIComponent(src)}`);
    }
  });

  // Rewrite link hrefs (stylesheets, etc)
  $('link[href]').each((i, elem) => {
    let href = $(elem).attr('href');
    if (href && !href.startsWith('http') && !href.startsWith('data:')) {
      href = new URL(href, targetUrl).href;
      $(elem).attr('href', `/proxy?url=${encodeURIComponent(href)}`);
    } else if (href && href.startsWith('http')) {
      $(elem).attr('href', `/proxy?url=${encodeURIComponent(href)}`);
    }
  });

  // Rewrite image sources
  $('img[src]').each((i, elem) => {
    let src = $(elem).attr('src');
    if (src && !src.startsWith('data:')) {
      if (!src.startsWith('http')) {
        src = new URL(src, targetUrl).href;
      }
      $(elem).attr('src', `/proxy?url=${encodeURIComponent(src)}`);
    }
  });

  // Rewrite iframe sources
  $('iframe[src]').each((i, elem) => {
    let src = $(elem).attr('src');
    if (src && !src.startsWith('data:')) {
      if (!src.startsWith('http')) {
        src = new URL(src, targetUrl).href;
      }
      $(elem).attr('src', `/proxy?url=${encodeURIComponent(src)}`);
    }
  });

  return $.html();
}

// Rewrite CSS URLs
function rewriteCssUrls(css, origin) {
  return css.replace(/url\(['"]?(?!data:)([^'")\s]+)['"]?\)/g, (match, url) => {
    if (!url.startsWith('http')) {
      url = new URL(url, origin).href;
    }
    return `url('${url}')`;
  });
}

// Rewrite JavaScript
function rewriteJavaScript(js, origin) {
  // This is a basic approach; a full implementation would need proper JS parsing
  return js
    .replace(/fetch\s*\(\s*['"`]/g, (match) => {
      return match.replace(/(['"`])/g, (q) => q + `/proxy?url=${encodeURIComponent(`);
    });
}

// Inject proxy helper script
function injectProxyScript(html, origin) {
  const script = `
    <script>
      // Intercept fetch requests
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        let url = args[0];
        if (typeof url === 'string' && !url.startsWith('/proxy') && !url.startsWith('data:') && !url.startsWith('blob:')) {
          if (!url.startsWith('http')) {
            url = new URL(url, window.location.origin).href;
          }
          args[0] = '/proxy?url=' + encodeURIComponent(url);
        }
        return originalFetch.apply(this, args);
      };

      // Intercept XMLHttpRequest
      const originalOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        if (typeof url === 'string' && !url.startsWith('/proxy') && !url.startsWith('data:') && !url.startsWith('blob:')) {
          if (!url.startsWith('http')) {
            url = new URL(url, window.location.origin).href;
          }
          url = '/proxy?url=' + encodeURIComponent(url);
        }
        return originalOpen.apply(this, [method, url, ...rest]);
      };

      // Fix relative URLs in WebSocket
      const originalWebSocket = window.WebSocket;
      window.WebSocket = function(url, ...rest) {
        if (!url.startsWith('ws')) {
          url = 'ws' + (window.location.protocol === 'https:' ? 's' : '') + '://' + window.location.host + '/proxy?url=' + encodeURIComponent(url);
        }
        return new originalWebSocket(url, ...rest);
      };

      // Override base tag if it exists
      const baseTag = document.querySelector('base');
      if (baseTag) {
        baseTag.href = window.location.href;
      }
    </script>
  `;
  
  if (html.includes('</head>')) {
    return html.replace('</head>', script + '</head>');
  } else if (html.includes('</body>')) {
    return html.replace('</body>', script + '</body>');
  }
  return html + script;
}

// Serve main index file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

createServer(app).listen(PORT, () => {
  console.log(`🎮 THE VAULT running on http://localhost:${PORT}`);
  console.log(`📝 Password: bannana13!`);
  console.log(`✅ Full CORS proxy with content rewriting enabled`);
});

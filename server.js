const express = require("express");
const path = require("path");
const { createServer } = require("http");
const { exec } = require("child_process");
const fs = require("fs");

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

// Ultraviolet Proxy Endpoint
app.get("/uv/service/:url", async (req, res) => {
  try {
    const targetUrl = Buffer.from(decodeURIComponent(req.params.url), 'base64').toString('utf-8');
    const url = new URL(targetUrl);

    // Validate domain
    const isAllowed = allowedDomains.some(domain => {
      return url.hostname === domain || url.hostname.endsWith("." + domain);
    });

    if (!isAllowed) {
      return res.status(403).send("Domain not approved");
    }

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      return res.status(response.status).send("Failed to load game");
    }

    const contentType = response.headers.get("content-type") || "";
    let content = await response.text();

    // Inject Ultraviolet client
    if (contentType.includes("text/html")) {
      content = injectUltravioletClient(content, targetUrl);
    }

    res.set("Content-Type", contentType);
    res.send(content);

  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).send("Proxy error");
  }
});

// Legacy proxy endpoint for backward compatibility
app.get("/proxy", async (req, res) => {
  try {
    const target = req.query.url;

    if (!target) {
      return res.status(400).send("Missing URL");
    }

    const url = new URL(target);
    const isAllowed = allowedDomains.some(domain => {
      return url.hostname === domain || url.hostname.endsWith("." + domain);
    });

    if (!isAllowed) {
      return res.status(403).send("Domain not approved");
    }

    const response = await fetch(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      return res.status(response.status).send("Failed to load game");
    }

    const contentType = response.headers.get("content-type") || "";
    let content = await response.text();

    if (contentType.includes("text/html")) {
      content = injectUltravioletClient(content, target);
    }

    res.set("Content-Type", contentType);
    res.send(content);

  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).send("Proxy request failed");
  }
});

// Ultraviolet client injection
function injectUltravioletClient(html, pageUrl) {
  const ultravioletScript = `
    <script src="https://cdn.jsdelivr.net/gh/titaniumnetwork-dev/Ultraviolet@0.3.0/uv.bundle.js"></script>
    <script>
      Ultraviolet.init();
      
      // Proxy all fetch requests
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        args[0] = Ultraviolet.encodeUrl(args[0]);
        return originalFetch.apply(this, args);
      };
      
      // Proxy XHR requests
      const xhr = XMLHttpRequest.prototype;
      const originalOpen = xhr.open;
      xhr.open = function(method, url, ...rest) {
        url = Ultraviolet.encodeUrl(url);
        return originalOpen.apply(this, [method, url, ...rest]);
      };
    </script>
  `;

  // Inject before closing body tag
  if (html.includes("</body>")) {
    return html.replace("</body>", ultravioletScript + "</body>");
  }
  
  // If no body tag, append to end
  return html + ultravioletScript;
}

// Serve main index file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 404 handler
app.use((req, res) => {
  res.status(404).send("Not found");
});

createServer(app).listen(PORT, () => {
  console.log(`🎮 THE VAULT running on http://localhost:${PORT}`);
  console.log(`Password: bannana13!`);
});

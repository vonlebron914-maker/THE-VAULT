const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

// Serve your index.html
app.use(express.static(__dirname));

// Approved game domains for the project
const allowedDomains = [
  "slope-game.com",
  "tunnelrushgame.com",
  "run3.io",
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
  "shellshock.io",
  "krunker.io",
  "paper-io.com",
  "hole-io.com",
  "slither.io",
  "agar.io",
  "zombsroyale.io"
];

// Proxy demonstration endpoint
app.get("/proxy", async (req, res) => {

  const target = req.query.url;

  if (!target) {
    return res.status(400).send("Missing URL");
  }

  try {

    const url = new URL(target);

    const isAllowed = allowedDomains.some(domain => {
      return url.hostname === domain ||
             url.hostname.endsWith("." + domain);
    });

    if (!isAllowed) {
      return res.status(403).send("This domain is not approved.");
    }

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).send("The game could not be loaded.");
    }

    const contentType =
      response.headers.get("content-type") || "";

    if (!contentType.includes("text/html")) {
      return res.status(415).send("Unsupported content type.");
    }

    const html = await response.text();

    res.send(html);

  } catch (error) {

    res.status(500).send("Proxy request failed.");

  }

});


app.get("/", (req, res) => {

  res.sendFile(
    path.join(__dirname, "index.html")
  );

});


app.listen(PORT, () => {

  console.log(
    `THE VAULT running on port ${PORT}`
  );

});

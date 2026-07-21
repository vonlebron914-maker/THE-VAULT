const games = [
  // ACTION GAMES
  { name: "Shell Shockers", url: "https://shellshockers.io", category: "action", tags: ["multiplayer", "shooter"] },
  { name: "Krunker", url: "https://krunker.io", category: "action", tags: ["multiplayer", "shooter", "fps"] },
  { name: "Slope", url: "https://slope-game.com", category: "action", tags: ["endless", "arcade"] },
  { name: "Tunnel Rush", url: "https://tunnelrushgame.com", category: "action", tags: ["endless", "arcade"] },
  { name: "Madalin Stunt Cars", url: "https://madalinstuntcars2.com", category: "action", tags: ["racing", "stunts"] },
  { name: "Drift Hunters", url: "https://drifthunters.io", category: "action", tags: ["racing", "drifting"] },
  { name: "1v1.LOL", url: "https://1v1.lol", category: "action", tags: ["multiplayer", "shooter", "building"] },
  { name: "Moto X3M", url: "https://motox3m.io", category: "action", tags: ["racing", "bikes", "stunts"] },

  // PUZZLE GAMES
  { name: "Geometry Dash", url: "https://geometrydashlite.io", category: "puzzle", tags: ["rhythm", "platformer"] },
  { name: "Tetris", url: "https://tetris.com/play-tetris", category: "puzzle", tags: ["classic", "blocks"] },
  { name: "Run 3", url: "https://run3.io", category: "puzzle", tags: ["platformer", "endless"] },
  { name: "Fireboy & Watergirl", url: "https://fireboy-watergirl.io", category: "puzzle", tags: ["platformer", "coop"] },
  { name: "Portal Flash", url: "https://portalflash.io", category: "puzzle", tags: ["physics", "platformer"] },

  // STRATEGY GAMES
  { name: "Zombs Royale", url: "https://zombsroyale.io", category: "strategy", tags: ["battle-royale", "multiplayer"] },
  { name: "Agar.io", url: "https://agar.io", category: "strategy", tags: ["multiplayer", "survival"] },
  { name: "Slither.io", url: "https://slither.io", category: "strategy", tags: ["multiplayer", "snake"] },
  { name: "Paper.io", url: "https://paper-io.com", category: "strategy", tags: ["multiplayer", "territorial"] },
  { name: "Hole.io", url: "https://hole-io.com", category: "strategy", tags: ["multiplayer", "arcade"] },

  // CASUAL GAMES
  { name: "Flappy Bird", url: "https://flappybird.io", category: "casual", tags: ["classic", "arcade"] },
  { name: "Chrome Dino", url: "https://chromedino.com", category: "casual", tags: ["endless", "arcade"] },
  { name: "Cookie Clicker", url: "https://cookieclicker.ee", category: "casual", tags: ["idle", "clicker"] },
  { name: "Snake", url: "https://playsnake.org", category: "casual", tags: ["classic", "arcade"] },
  { name: "Crossy Road", url: "https://crossyroadgame.com", category: "casual", tags: ["platformer", "arcade"] },

  // MULTIPLAYER GAMES
  { name: "Pac-Man", url: "https://pacman.live", category: "multiplayer", tags: ["classic", "arcade"] },
  { name: "BitLife", url: "https://bitlifegame.com", category: "multiplayer", tags: ["simulation", "life"] },
  { name: "Stickman Hook", url: "https://stickman-hook.io", category: "casual", tags: ["platformer", "physics"] },
  { name: "Basketball Legends", url: "https://basketball-legends.io", category: "sports", tags: ["sports", "multiplayer"] },
  { name: "Dino Runner", url: "https://dinorunner.io", category: "casual", tags: ["endless", "arcade"] },

  // RETRO GAMES
  { name: "Super Mario", url: "https://supermario.io", category: "retro", tags: ["classic", "platformer"] },
  { name: "Space Invaders", url: "https://spaceinvaders.io", category: "retro", tags: ["classic", "shooter"] },
  { name: "Pac-Man Battle", url: "https://pacman-battle.io", category: "retro", tags: ["classic", "multiplayer"] },

  // SPORTS GAMES
  { name: "Penalty Kicks", url: "https://penalty-kicks.io", category: "sports", tags: ["sports", "soccer"] },
  { name: "Baseball Star", url: "https://baseball-star.io", category: "sports", tags: ["sports", "baseball"] },
  { name: "Ice Hockey", url: "https://ice-hockey.io", category: "sports", tags: ["sports", "hockey"] },

  // ADDITIONAL GAMES
  { name: "Bob the Robber", url: "https://bob-robber.io", category: "action", tags: ["stealth", "puzzle"] },
  { name: "Chess", url: "https://chess.io", category: "strategy", tags: ["board", "classic"] },
  { name: "Checkers", url: "https://checkers.io", category: "strategy", tags: ["board", "classic"] },
  { name: "2048", url: "https://2048game.io", category: "puzzle", tags: ["puzzle", "numbers"] },
];

let allGames = [...games];
let currentCategory = "all";


// LOGIN
function login() {
  const password = document.getElementById("password").value;

  if (password === "bannana13!") {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("site").style.display = "block";

    buildGames(allGames);
  } else {
    const errorDiv = document.getElementById("error");

    errorDiv.style.display = "block";

    setTimeout(() => {
      errorDiv.style.display = "none";
    }, 3000);
  }
}


// LOGOUT
function logout() {
  document.getElementById("login-screen").style.display = "flex";
  document.getElementById("site").style.display = "none";
  document.getElementById("player").style.display = "none";

  document.getElementById("password").value = "";
}


// BUILD GAME CARDS
function buildGames(list) {
  const container = document.getElementById("games");

  container.innerHTML = "";

  document.getElementById("game-count").textContent =
    `${list.length} games available`;

  if (list.length === 0) {
    container.innerHTML =
      '<div style="grid-column: 1/-1; text-align: center; color: #aaa; padding: 40px;">No games found</div>';

    return;
  }

  list.forEach((game, index) => {
    const card = document.createElement("div");

    card.className = "game-card";

    const categoryBadge =
      game.category.charAt(0).toUpperCase() +
      game.category.slice(1);

    card.innerHTML = `
      <div class="game-card-header">
        <div class="game-number">
          #${String(index + 1).padStart(2, "0")}
        </div>

        <div class="game-name">
          ${game.name}
        </div>

        <span class="game-category">
          ${categoryBadge}
        </span>
      </div>

      <div class="game-card-footer">
        <span style="font-size: 11px; color: #888;">
          ${game.tags.join(", ")}
        </span>

        <button class="play-btn" type="button">
          PLAY
        </button>
      </div>
    `;

    // PLAY BUTTON
    const playButton = card.querySelector(".play-btn");

    playButton.addEventListener("click", (event) => {
      event.stopPropagation();

      playGame(game);
    });


    // CLICKING THE CARD
    card.addEventListener("click", () => {
      playGame(game);
    });


    container.appendChild(card);
  });
}


// PLAY GAME
function playGame(game) {
  if (!game || !game.url) {
    console.error("Game URL is missing");

    return;
  }

  const playerTitle =
    document.getElementById("player-title");

  const playerCategory =
    document.getElementById("player-category");

  const player =
    document.getElementById("player");

  const iframe =
    document.getElementById("game-frame");


  playerTitle.textContent = game.name;

  playerCategory.textContent =
    game.category.toUpperCase();


  // Proxy URL
  const proxyUrl =
    `/proxy?url=${encodeURIComponent(game.url)}`;


  showLoadingIndicator();


  iframe.onload = () => {
    hideLoadingIndicator();
  };


  iframe.onerror = () => {
    hideLoadingIndicator();

    console.error("Game failed to load");
  };


  iframe.src = proxyUrl;

  player.style.display = "block";


  // Hide loading screen after 5 seconds
  setTimeout(() => {
    hideLoadingIndicator();
  }, 5000);
}


// CLOSE GAME
function closeGame() {
  const iframe =
    document.getElementById("game-frame");

  const player =
    document.getElementById("player");


  iframe.src = "";

  player.style.display = "none";

  hideLoadingIndicator();
}


// FULLSCREEN
function toggleFullscreen() {
  const iframe =
    document.getElementById("game-frame");

  const container =
    document.getElementById("iframe-container");

  const player =
    document.getElementById("player");


  if (iframe.classList.contains("fullscreen")) {

    iframe.classList.remove("fullscreen");

    player.style.position = "fixed";

    player.style.inset = "";

    container.style.height =
      "calc(100vh - 70px)";

  } else {

    iframe.classList.add("fullscreen");

    player.style.position = "fixed";

    player.style.inset = "0";
  }
}


// SEARCH GAMES
function searchGames() {
  const query =
    document.getElementById("search").value.toLowerCase();


  let filtered =
    allGames.filter((game) => {

      const matchesName =
        game.name.toLowerCase().includes(query);

      const matchesTags =
        game.tags.some((tag) =>
          tag.toLowerCase().includes(query)
        );


      return matchesName || matchesTags;
    });


  if (currentCategory !== "all") {

    filtered =
      filtered.filter(
        (game) =>
          game.category === currentCategory
      );
  }


  buildGames(filtered);
}


// FILTER BY CATEGORY
function filterByCategory() {
  currentCategory =
    document.getElementById("category").value;


  const query =
    document.getElementById("search").value.toLowerCase();


  let filtered = allGames;


  if (currentCategory !== "all") {

    filtered =
      allGames.filter(
        (game) =>
          game.category === currentCategory
      );
  }


  if (query) {

    filtered =
      filtered.filter((game) => {

        const matchesName =
          game.name.toLowerCase().includes(query);

        const matchesTags =
          game.tags.some((tag) =>
            tag.toLowerCase().includes(query)
          );


        return matchesName || matchesTags;
      });
  }


  buildGames(filtered);
}


// LOADING INDICATOR
function showLoadingIndicator() {
  document
    .getElementById("loading")
    .classList.add("show");
}


function hideLoadingIndicator() {
  document
    .getElementById("loading")
    .classList.remove("show");
}


// KEYBOARD SHORTCUTS
document.addEventListener("keydown", (e) => {

  if (e.key === "Escape") {

    const player =
      document.getElementById("player");


    if (player.style.display === "block") {
      closeGame();
    }
  }
});

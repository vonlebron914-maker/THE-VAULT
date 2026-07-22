const games = [
  { name: "Shell Shockers", url: "https://shellshockers.io", category: "action", tags: ["multiplayer", "shooter"] },
  { name: "Krunker", url: "https://krunker.io", category: "action", tags: ["multiplayer", "shooter", "fps"] },
  { name: "Slope", url: "https://slope-game.com", category: "action", tags: ["endless", "arcade"] },
  { name: "Tunnel Rush", url: "https://tunnelrushgame.com", category: "action", tags: ["endless", "arcade"] },
  { name: "Madalin Stunt Cars", url: "https://madalinstuntcars2.com", category: "action", tags: ["racing", "stunts"] },
  { name: "Drift Hunters", url: "https://drifthunters.io", category: "action", tags: ["racing", "drifting"] },
  { name: "1v1.LOL", url: "https://1v1.lol", category: "action", tags: ["multiplayer", "shooter"] },
  { name: "Moto X3M", url: "https://motox3m.io", category: "action", tags: ["racing", "bikes"] },

  { name: "Geometry Dash", url: "https://geometrydashlite.io", category: "puzzle", tags: ["rhythm", "platformer"] },
  { name: "Tetris", url: "https://tetris.com/play-tetris", category: "puzzle", tags: ["classic"] },
  { name: "Run 3", url: "https://run3.io", category: "puzzle", tags: ["platformer"] },
  { name: "Fireboy & Watergirl", url: "https://fireboy-watergirl.io", category: "puzzle", tags: ["coop"] },

  { name: "Zombs Royale", url: "https://zombsroyale.io", category: "strategy", tags: ["battle royale"] },
  { name: "Agar.io", url: "https://agar.io", category: "strategy", tags: ["multiplayer"] },
  { name: "Slither.io", url: "https://slither.io", category: "strategy", tags: ["snake"] },

  { name: "Flappy Bird", url: "https://flappybird.io", category: "casual", tags: ["arcade"] },
  { name: "Chrome Dino", url: "https://chromedino.com", category: "casual", tags: ["endless"] },
  { name: "Cookie Clicker", url: "https://cookieclicker.ee", category: "casual", tags: ["idle"] },

  { name: "Basketball Legends", url: "https://basketball-legends.io", category: "sports", tags: ["sports"] },
  { name: "Penalty Kicks", url: "https://penalty-kicks.io", category: "sports", tags: ["soccer"] },

  { name: "Chess", url: "https://chess.io", category: "strategy", tags: ["board"] },
  { name: "Checkers", url: "https://checkers.io", category: "strategy", tags: ["board"] },
  { name: "2048", url: "https://2048game.io", category: "puzzle", tags: ["numbers"] }
];

let allGames = [...games];
let currentCategory = "all";

function login() {
    const password = document.getElementById("password").value;

    if (password === "bannana13!") {
        document.getElementById("login-screen").style.display = "none";
        document.getElementById("site").style.display = "block";
        buildGames(allGames);
    } else {
        const error = document.getElementById("error");

        error.style.display = "block";

        setTimeout(() => {
            error.style.display = "none";
        }, 3000);
    }
}

function logout() {
    closeGame();

    document.getElementById("login-screen").style.display = "flex";
    document.getElementById("site").style.display = "none";
    document.getElementById("password").value = "";
}

function buildGames(list) {
    const container = document.getElementById("games");

    container.innerHTML = "";

    document.getElementById("game-count").textContent =
        `${list.length} games available`;

    list.forEach((game, index) => {
        const card = document.createElement("div");

        card.className = "game-card";

        card.innerHTML = `
            <div class="game-card-header">
                <div class="game-number">
                    #${String(index + 1).padStart(2, "0")}
                </div>

                <div class="game-name">
                    ${game.name}
                </div>

                <span class="game-category">
                    ${game.category}
                </span>
            </div>

            <div class="game-card-footer">
                <span style="font-size:11px;color:#888">
                    ${game.tags.join(", ")}
                </span>

                <button class="play-btn">
                    PLAY
                </button>
            </div>
        `;

        card.querySelector(".play-btn").onclick = (event) => {
            event.stopPropagation();
            playGame(game);
        };

        card.onclick = () => {
            playGame(game);
        };

        container.appendChild(card);
    });
}

function playGame(game) {
    const iframe = document.getElementById("game-frame");
    const player = document.getElementById("player");

    document.getElementById("player-title").textContent = game.name;
    document.getElementById("player-category").textContent =
        game.category.toUpperCase();

    showLoadingIndicator();

    iframe.onload = () => {
        hideLoadingIndicator();
    };

    iframe.onerror = () => {
        hideLoadingIndicator();
        alert("This game failed to load.");
    };

    player.style.display = "block";

    iframe.src =
        `/proxy?url=${encodeURIComponent(game.url)}`;

    setTimeout(() => {
        hideLoadingIndicator();
    }, 15000);
}

function closeGame() {
    const iframe = document.getElementById("game-frame");

    iframe.onload = null;
    iframe.onerror = null;
    iframe.src = "about:blank";

    document.getElementById("player").style.display = "none";

    hideLoadingIndicator();
}

function toggleFullscreen() {
    const iframe = document.getElementById("game-frame");

    if (document.fullscreenElement) {
        document.exitFullscreen();
        return;
    }

    if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
    }
}

function searchGames() {
    const query = document
        .getElementById("search")
        .value
        .toLowerCase()
        .trim();

    let filtered = allGames.filter(game => {
        const matchesSearch =
            game.name.toLowerCase().includes(query) ||
            game.tags.some(tag =>
                tag.toLowerCase().includes(query)
            );

        const matchesCategory =
            currentCategory === "all" ||
            game.category === currentCategory;

        return matchesSearch && matchesCategory;
    });

    buildGames(filtered);
}

function filterByCategory() {
    currentCategory =
        document.getElementById("category").value;

    searchGames();
}

function showLoadingIndicator() {
    document
        .getElementById("loading")
        .classList
        .add("show");
}

function hideLoadingIndicator() {
    document
        .getElementById("loading")
        .classList
        .remove("show");
}

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeGame();
    }
});

"use strict";

const games = [

    {
        name: "Shell Shockers",
        url: "https://shellshockers.io",
        category: "action",
        tags: ["multiplayer", "shooter"]
    },

    {
        name: "Krunker",
        url: "https://krunker.io",
        category: "action",
        tags: ["multiplayer", "shooter", "fps"]
    },

    {
        name: "Slope",
        url: "https://slope-game.com",
        category: "action",
        tags: ["endless", "arcade"]
    },

    {
        name: "Tunnel Rush",
        url: "https://tunnelrushgame.com",
        category: "action",
        tags: ["endless", "arcade"]
    },

    {
        name: "Madalin Stunt Cars",
        url: "https://madalinstuntcars2.com",
        category: "action",
        tags: ["racing", "stunts"]
    },

    {
        name: "Drift Hunters",
        url: "https://drifthunters.io",
        category: "action",
        tags: ["racing", "drifting"]
    },

    {
        name: "1v1.LOL",
        url: "https://1v1.lol",
        category: "action",
        tags: ["multiplayer", "shooter"]
    },

    {
        name: "Moto X3M",
        url: "https://motox3m.io",
        category: "action",
        tags: ["racing", "bikes"]
    },

    {
        name: "Geometry Dash",
        url: "https://geometrydashlite.io",
        category: "puzzle",
        tags: ["rhythm", "platformer"]
    },

    {
        name: "Tetris",
        url: "https://tetris.com/play-tetris",
        category: "puzzle",
        tags: ["classic"]
    },

    {
        name: "Run 3",
        url: "https://run3.io",
        category: "puzzle",
        tags: ["platformer"]
    },

    {
        name: "Fireboy & Watergirl",
        url: "https://fireboy-watergirl.io",
        category: "puzzle",
        tags: ["coop"]
    },

    {
        name: "Zombs Royale",
        url: "https://zombsroyale.io",
        category: "strategy",
        tags: ["battle royale"]
    },

    {
        name: "Agar.io",
        url: "https://agar.io",
        category: "strategy",
        tags: ["multiplayer"]
    },

    {
        name: "Slither.io",
        url: "https://slither.io",
        category: "strategy",
        tags: ["snake"]
    },

    {
        name: "Flappy Bird",
        url: "https://flappybird.io",
        category: "casual",
        tags: ["arcade"]
    },

    {
        name: "Chrome Dino",
        url: "https://chromedino.com",
        category: "casual",
        tags: ["endless"]
    },

    {
        name: "Cookie Clicker",
        url: "https://cookieclicker.ee",
        category: "casual",
        tags: ["idle"]
    },

    {
        name: "Basketball Legends",
        url: "https://basketball-legends.io",
        category: "sports",
        tags: ["sports"]
    },

    {
        name: "Penalty Kicks",
        url: "https://penalty-kicks.io",
        category: "sports",
        tags: ["soccer"]
    },

    {
        name: "Chess",
        url: "https://chess.io",
        category: "strategy",
        tags: ["board"]
    },

    {
        name: "Checkers",
        url: "https://checkers.io",
        category: "strategy",
        tags: ["board"]
    },

    {
        name: "2048",
        url: "https://2048game.io",
        category: "puzzle",
        tags: ["numbers"]
    }

];


let currentCategory = "all";
let currentGame = null;


const loginScreen = document.getElementById("login-screen");
const site = document.getElementById("site");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("login-button");
const logoutButton = document.getElementById("logout-button");
const errorMessage = document.getElementById("error");

const searchInput = document.getElementById("search");
const categorySelect = document.getElementById("category");
const gamesContainer = document.getElementById("games");
const gameCount = document.getElementById("game-count");

const player = document.getElementById("player");
const gameFrame = document.getElementById("game-frame");

const playerTitle = document.getElementById("player-title");
const playerCategory = document.getElementById("player-category");

const loading = document.getElementById("loading");

const fullscreenButton =
    document.getElementById("fullscreen-button");

const closeButton =
    document.getElementById("close-button");


function login() {

    const password = passwordInput.value;

    if (password === "bannana13!") {

        loginScreen.style.display = "none";
        site.style.display = "block";

        buildGames(games);

        return;
    }

    errorMessage.style.display = "block";

    setTimeout(() => {
        errorMessage.style.display = "none";
    }, 3000);

}


function logout() {

    closeGame();

    loginScreen.style.display = "flex";
    site.style.display = "none";

    passwordInput.value = "";

}


function buildGames(list) {

    gamesContainer.innerHTML = "";

    gameCount.textContent =
        `${list.length} games available`;

    if (list.length === 0) {

        gamesContainer.innerHTML = `
            <div class="no-results">
                No games found.
            </div>
        `;

        return;
    }


    list.forEach((game, index) => {

        const card = document.createElement("div");

        card.className = "game-card";

        card.innerHTML = `

            <div class="game-card-header">

                <div class="game-number">
                    #${String(index + 1).padStart(2, "0")}
                </div>

                <div class="game-name">
                    ${escapeHTML(game.name)}
                </div>

                <span class="game-category">
                    ${escapeHTML(game.category)}
                </span>

            </div>

            <div class="game-card-footer">

                <span class="game-tags">
                    ${game.tags.map(escapeHTML).join(", ")}
                </span>

                <button class="play-btn">
                    PLAY
                </button>

            </div>
        `;


        card.addEventListener("click", () => {
            playGame(game);
        });


        card.querySelector(".play-btn")
            .addEventListener("click", event => {

                event.stopPropagation();

                playGame(game);

            });


        gamesContainer.appendChild(card);

    });

}


function playGame(game) {

    currentGame = game;

    playerTitle.textContent = game.name;
    playerCategory.textContent =
        game.category.toUpperCase();

    player.style.display = "block";

    showLoadingIndicator();

    gameFrame.src =
        `/proxy?url=${encodeURIComponent(game.url)}`;

}


function closeGame() {

    gameFrame.src = "about:blank";

    player.style.display = "none";

    hideLoadingIndicator();

    currentGame = null;

}


function toggleFullscreen() {

    if (document.fullscreenElement) {

        document.exitFullscreen();

        return;
    }

    if (gameFrame.requestFullscreen) {

        gameFrame.requestFullscreen();

    }

}


function searchGames() {

    const query =
        searchInput.value
            .trim()
            .toLowerCase();


    const filtered = games.filter(game => {

        const matchesSearch =
            !query ||
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
        categorySelect.value;

    searchGames();

}


function showLoadingIndicator() {

    loading.classList.add("show");

}


function hideLoadingIndicator() {

    loading.classList.remove("show");

}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


gameFrame.addEventListener("load", () => {

    hideLoadingIndicator();

});


gameFrame.addEventListener("error", () => {

    hideLoadingIndicator();

});


loginButton.addEventListener("click", login);

logoutButton.addEventListener("click", logout);

closeButton.addEventListener("click", closeGame);

fullscreenButton.addEventListener(
    "click",
    toggleFullscreen
);

searchInput.addEventListener(
    "input",
    searchGames
);

categorySelect.addEventListener(
    "change",
    filterByCategory
);

passwordInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {
            login();
        }

    }
);

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            player.style.display === "block"
        ) {

            closeGame();

        }

    }
);

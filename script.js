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

  // PUZZLE
  { name: "Geometry Dash", url: "https://geometrydashlite.io", category: "puzzle", tags: ["rhythm", "platformer"] },
  { name: "Tetris", url: "https://tetris.com/play-tetris", category: "puzzle", tags: ["classic", "blocks"] },
  { name: "Run 3", url: "https://run3.io", category: "puzzle", tags: ["platformer", "endless"] },
  { name: "Fireboy & Watergirl", url: "https://fireboy-watergirl.io", category: "puzzle", tags: ["platformer", "coop"] },
  { name: "Portal Flash", url: "https://portalflash.io", category: "puzzle", tags: ["physics", "platformer"] },

  // STRATEGY
  { name: "Zombs Royale", url: "https://zombsroyale.io", category: "strategy", tags: ["battle-royale", "multiplayer"] },
  { name: "Agar.io", url: "https://agar.io", category: "strategy", tags: ["multiplayer", "survival"] },
  { name: "Slither.io", url: "https://slither.io", category: "strategy", tags: ["multiplayer", "snake"] },
  { name: "Paper.io", url: "https://paper-io.com", category: "strategy", tags: ["multiplayer", "territorial"] },
  { name: "Hole.io", url: "https://hole-io.com", category: "strategy", tags: ["multiplayer", "arcade"] },

  // CASUAL
  { name: "Flappy Bird", url: "https://flappybird.io", category: "casual", tags: ["classic", "arcade"] },
  { name: "Chrome Dino", url: "https://chromedino.com", category: "casual", tags: ["endless", "arcade"] },
  { name: "Cookie Clicker", url: "https://cookieclicker.ee", category: "casual", tags: ["idle", "clicker"] },
  { name: "Snake", url: "https://playsnake.org", category: "casual", tags: ["classic", "arcade"] },
  { name: "Crossy Road", url: "https://crossyroadgame.com", category: "casual", tags: ["platformer", "arcade"] },

  // SPORTS
  { name: "Basketball Legends", url: "https://basketball-legends.io", category: "sports", tags: ["sports", "multiplayer"] },
  { name: "Penalty Kicks", url: "https://penalty-kicks.io", category: "sports", tags: ["sports", "soccer"] },

  // MORE
  { name: "Chess", url: "https://chess.io", category: "strategy", tags: ["board", "classic"] },
  { name: "Checkers", url: "https://checkers.io", category: "strategy", tags: ["board", "classic"] },
  { name: "2048", url: "https://2048game.io", category: "puzzle", tags: ["numbers", "puzzle"] }
];


let allGames = [...games];
let currentCategory = "all";


// LOGIN
function login() {

  const password =
    document.getElementById("password").value;


  if (password === "bannana13!") {

    document.getElementById("login-screen").style.display = "none";

    document.getElementById("site").style.display = "block";

    buildGames(allGames);

  } else {

    const error =
      document.getElementById("error");

    error.style.display = "block";


    setTimeout(() => {
      error.style.display = "none";
    }, 3000);

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

  const container =
    document.getElementById("games");


  container.innerHTML = "";


  document.getElementById("game-count").textContent =
    `${list.length} games available`;


  if (list.length === 0) {

    container.innerHTML =
      `<div style="
        grid-column:1/-1;
        text-align:center;
        color:#aaa;
        padding:40px;
      ">
      No games found
      </div>`;

    return;

  }



  list.forEach((game, index) => {


    const card =
      document.createElement("div");


    card.className =
      "game-card";



    const category =
      game.category.charAt(0).toUpperCase()
      +
      game.category.slice(1);



    card.innerHTML = `

      <div class="game-card-header">

        <div class="game-number">
          #${String(index + 1).padStart(2,"0")}
        </div>


        <div class="game-name">
          ${game.name}
        </div>


        <span class="game-category">
          ${category}
        </span>

      </div>


      <div class="game-card-footer">

        <span style="font-size:11px;color:#888;">
          ${game.tags.join(", ")}
        </span>


        <button class="play-btn">
          PLAY
        </button>

      </div>

    `;



    const button =
      card.querySelector(".play-btn");


    button.onclick = (event) => {

      event.stopPropagation();

      playGame(game);

    };



    card.onclick = () => {

      playGame(game);

    };


    container.appendChild(card);


  });


}




// PLAY GAME USING LOADER
function playGame(game) {


  if (!game || !game.url) {

    console.error(
      "Missing game URL"
    );

    return;

  }



  const player =
    document.getElementById("player");


  const iframe =
    document.getElementById("game-frame");


  const title =
    document.getElementById("player-title");


  const category =
    document.getElementById("player-category");



  title.textContent =
    game.name;


  category.textContent =
    game.category.toUpperCase();



  showLoadingIndicator();



  iframe.onload = () => {

    hideLoadingIndicator();

  };



  iframe.onerror = () => {

    console.error(
      "Loader failed"
    );

    hideLoadingIndicator();

  };



  /*
      IMPORTANT CHANGE

      Before:
      iframe.src = /proxy?url=

      Now:
      loader.html handles proxy loading
  */


  iframe.src =
    "loader.html?url="
    +
    encodeURIComponent(game.url);



  player.style.display =
    "block";



  setTimeout(() => {

    hideLoadingIndicator();

  },8000);


}





// CLOSE GAME
function closeGame() {


  const iframe =
    document.getElementById("game-frame");


  const player =
    document.getElementById("player");



  iframe.src =
    "about:blank";


  player.style.display =
    "none";


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



  if (
    iframe.classList.contains("fullscreen")
  ) {


    iframe.classList.remove(
      "fullscreen"
    );


    player.style.position =
      "fixed";


    container.style.height =
      "calc(100vh - 70px)";



  } else {


    iframe.classList.add(
      "fullscreen"
    );


    player.style.position =
      "fixed";


    player.style.inset =
      "0";


  }


}
  
// SEARCH GAMES
function searchGames() {

  const query =
    document.getElementById("search")
      .value
      .toLowerCase();


  let filtered =
    allGames.filter((game) => {


      const nameMatch =
        game.name
          .toLowerCase()
          .includes(query);


      const tagMatch =
        game.tags.some(tag =>
          tag
            .toLowerCase()
            .includes(query)
        );


      return nameMatch || tagMatch;


    });



  if (currentCategory !== "all") {

    filtered =
      filtered.filter(game =>
        game.category === currentCategory
      );

  }



  buildGames(filtered);


}




// CATEGORY FILTER
function filterByCategory() {


  currentCategory =
    document.getElementById("category")
      .value;



  const query =
    document.getElementById("search")
      .value
      .toLowerCase();



  let filtered =
    allGames;



  if (currentCategory !== "all") {

    filtered =
      filtered.filter(game =>
        game.category === currentCategory
      );

  }



  if (query) {

    filtered =
      filtered.filter(game => {


        const nameMatch =
          game.name
            .toLowerCase()
            .includes(query);



        const tagMatch =
          game.tags.some(tag =>
            tag
              .toLowerCase()
              .includes(query)
          );



        return nameMatch || tagMatch;


      });


  }



  buildGames(filtered);


}





// LOADING SCREEN

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





// ESCAPE CLOSE

document.addEventListener(
  "keydown",
  (event) => {


    if (event.key === "Escape") {


      const player =
        document.getElementById("player");



      if (
        player.style.display === "block"
      ) {

        closeGame();

      }


    }


  }
);

}

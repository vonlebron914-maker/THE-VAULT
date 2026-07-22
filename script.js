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

}

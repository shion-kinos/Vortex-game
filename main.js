let world = document.querySelector("#world");
let context = world.getContext("2d");
context.imageSmoothingEnabled = false;
let world_i = 8;
let world_j = 12;
let tileSize = 32;


// https://stackoverflow.com/questions/880512/prevent-text-selection-after-double-click
document.querySelector("#game").addEventListener('mousedown', () => {
  if (event.detail > 1) {
    event.preventDefault();
  }
});


let textures = {
  dirt: "textures/dirt.png",
  farm: "textures/farmland.png",
  seedlings: "textures/wheat_seedlings.png",
  wheat: "textures/wheat_mature.png",
  shop: "textures/shop.png",
  condenser: "textures/machine.png",
  condenser_on: "textures/machine_on.png",
  singularity: "textures/singularity.png"
};

let images = {};
(() => {
  let numImages = Object.keys(textures).length;
  let loaded = 0;
  for (let i in textures) {
    images[i] = new Image();
    images[i].src = textures[i];
    images[i].onload = () => {
      loaded += 1;
      if (loaded === numImages) {
        startGame();
      }
    };
  }
})();


function wheat(num) {
  let wheat = document.querySelector("#wheat");
  if (typeof num === "undefined") {
    return parseInt(wheat.innerText);
  }
  wheat.innerText = parseInt(wheat.innerText) + num;
}
let message = document.querySelector("#message");
let interface = document.querySelector("#interface");

function drawTile(tile, i, j) {
  context.drawImage(tile, j * tileSize, i * tileSize, tileSize, tileSize);
}
function clearTile(i, j) {
  context.clearRect(j * tileSize, i * tileSize, tileSize, tileSize);
}


var map = [];


function startGame() {
  for (let i = 0; i < world_i; i++) {
    map.push([]);
    for (let j = 0; j < world_j; j++) {
      map[i].push('dirt');
      drawTile(images.dirt, i, j);
    }
  }
  let random_i = Math.floor(Math.random() * 8);
  let random_j = Math.floor(Math.random() * 12);
  map[random_i][random_j] = 'shop';
  drawTile(images.shop, random_i, random_j);
  world.addEventListener("click", tileAction);
}


function tileAction(event) {
  let i = Math.floor((event.pageY - world.offsetTop) / 32);
  let j = Math.floor((event.pageX - world.offsetLeft) / 32);
  switch (map[i][j]) {
    case 'dirt':
      till(i, j);
      break;
    case'farm':
      plant(i, j);
      break;
    case 'seedlings':
      grow(i, j);
      break;
    case 'wheat':
      harvest(i, j);
      break;
    case 'shop':
      machineShop();
      break;
    case 'condenser':
      matterCondenser();
      break;
    case 'singularity':
      activateSingularity(i, j);
      break;
  }
}


function till(i, j) {
  map[i][j] = 'farm';
  drawTile(images.farm, i, j);
}
function plant(i, j) {
  map[i][j] = 'seedlings';
  drawTile(images.seedlings, i, j);
}
function grow(i, j) {
  map[i][j] = 'wheat';
  clearTile(i, j);
  drawTile(images.farm, i, j);
  drawTile(images.wheat, i, j);
}
function harvest(i, j) {
  wheat(1);
  map[i][j] = 'farm';
  clearTile(i, j);
  drawTile(images.farm, i, j);
}

function machineShop() {
  interface.hidden = false;
  interface.addEventListener("click", machineShopAction);
  document.querySelector("#machine-shop").hidden = false;
  function machineShopAction(event) {
    switch (event.target.id) {
      case 'interface':
        interface.removeEventListener("click", machineShopAction);
        interface.hidden = true;
        break;
      case 'buy-condenser':
        if (wheat() >= 4) {
          wheat(-4);
          interface.removeEventListener("click", machineShopAction);
          document.querySelector("#machine-shop").hidden = true;
          placeObject('condenser');
        } else {
          message.innerHTML = "Not enough wheat";
          setTimeout(() => {
            message.innerHTML = "";
          }, 3000);
        }
        break;
    }
  }
}

function matterCondenser() {
  interface.hidden = false;
  interface.addEventListener("click", matterCondenserAction);
  document.querySelector("#matter-condenser").hidden = false;
  function matterCondenserAction(event) {
    switch (event.target.id) {
      case 'interface':
        interface.removeEventListener("click", matterCondenserAction);
        interface.hidden = true;
        break;
      case 'condense-singularity':
        if (wheat() >= 16) {
          wheat(-16);
          interface.removeEventListener("click", matterCondenserAction);
          document.querySelector("#matter-condenser").hidden = true;
          placeObject('singularity');
        } else {
          message.innerHTML = "Not enough wheat";
          setTimeout(() => {
            message.innerHTML = "";
          }, 3000);
        }
        break;
    }
  }
}

function placeObject(object) {
  interface.hidden = false;
  message.innerHTML = "Click on a tile to place the " + object;
  interface.addEventListener("click", () => {
    interface.hidden = true;
    message.innerHTML = "";
    message.innerHTML = "";
    let i = Math.floor((event.pageY - world.offsetTop) / tileSize);
    let j = Math.floor((event.pageX - world.offsetLeft) / tileSize);
    map[i][j] = object;
    drawTile(images[object], i, j);
  }, {once: true});
}

function activateSingularity(i, j) {
  map[i][j] = 'blackHole';
  context.fillStyle = "#000000";
  context.fillRect(j * tileSize, i * tileSize, tileSize, tileSize);
  message.style["background-color"] = "red";
  message.innerHTML = "SINGULARITY ACTIVATED"
  for (let n = 1; i - n >= 0 || i + n < world_i || j - n >= 0 || j + n < world_j; n++) {
    setTimeout(() => {
      context.fillRect((j - n) * tileSize, (i - n) * tileSize, (2 * n + 1) * tileSize, (2 * n + 1) * tileSize);
    }, n * 1000);
    if (!(i - n + 1 >= 0 || i + n + 1 < world_i || j - n + 1 >= 0 || j + n + 1 < world_j)) {
      message.innerHTML = "";
    }
  }
}

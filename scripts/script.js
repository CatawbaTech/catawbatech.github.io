/*
 Toy Ski Ultimate
 Author: Titus
 12/3/2024
 */
/*
Future:
- add special abilities
- add ski upgrades
*/
import SC from "/scripts/sortacanvas.js";
const worker = new Worker("scripts/perlin_worker.js", { type: "module" });
const divVal = 0.915; // tree generating frequency. Higher number, less trees.
const divVal2 = 0.91; // present generating frequency
let SortaCanvas = new SC();
let canvas = document.getElementById("canvas");
let elf,
  skiTrail,
  skiTrailBacking,
  skis,
  elfHitbox,
  oddEvenCounter = 0,
  readyForTrees = false,
  canRequestTrees = false,
  defaultLastY = [{ y: 0 }],
  treeStartY = 200,
  playerScore = 0,
  playerStartTime = 0,
  gameDeltaTime = 0,
  musicTracks = [],
  musicQueue = [],
  flyingTrees = [],
  musicPlaybackIndex = 0,
  skiingEffect = new Audio("tracks/skiing.mp3"),
  crashEffect = new Audio("tracks/crash.mp3"),
  helperLabel,
  label2,
  timeLabel,
  snowball,
  prevRelativeY = 0,
  relativeY = 0,
  relativeX = 0,
  angleToElf = 0,
  gamemode = 0,
  keys = new Set(),
  loadedThings = 0,
  gamePlaying = false,
  gameFreeze = false,
  mouseButtonDown = false,
  firstClick = false,
  cDate,
  christmasDay = new Date(
    "Wed Dec 25 2024 00:00:00 GMT-0500 (Eastern Standard Time)"
  ),
  trees = [],
  presents = [],
  imageSet = [new Image(), new Image(), new Image(), new Image(), new Image()],
  imagePresentSet = [new Image(), new Image(), new Image(), new Image(), new Image()],
  daycounter = document.getElementById("daycounter"),
  gamemodeButton = document.getElementById("gamemodebutton"),
  frostPane = document.getElementById("frostpane"),
  healthbar = document.getElementById("healthbar"),
  finalScore = document.getElementById("finalScore"),
  deathPanel = document.getElementById("deathScreen"),
  oofMessage = document.getElementById("deathMessage"),
  tutorialPane = document.getElementById("tutorialPane"),
  characterCustomizer = document.getElementById("characterCustomizer"),
  leftCharacter = document.getElementById("leftCharacter"),
  centerCharacter = document.getElementById("centerCharacter"),
  rightCharacter = document.getElementById("rightCharacter"),
  characterTitle = document.getElementById("characterName"),
  characterHealth = document.getElementById("health"),
  characterAgility = document.getElementById("agility"),
  characterSpecial = document.getElementById("special"),
  deathMessages = [
    "Sorry!",
    "Game over!",
    "Oof!",
    "Kachow!",
    "Yowzers!",
    "Ouch!",
  ],
  treeRange = 800,
  mRange = 0,
  bottomTree,
  characterURLs = [
    "images/elf.png",
    "images/nutcracker.png",
    "images/rudolph.png",
    "images/santaclaus.png",
    "images/snowman.png",
    "images/wisemen.png",
  ],
  skiURLs = ["images/red_skis.png"],
  characterNames = [
    "Elf",
    "Nutcracker",
    "Rudolph",
    "Santa Claus",
    "Frosty",
    "Wise Man",
  ],
  characterHealths = [1, 2, 3, 4, 2, 3],
  characterAgilities = [4, 3, 4, 2, 2, 3],
  characterSpecials = [
    "Present Magnet",
    "Tree Crusher",
    "Phone a Reindeer",
    "Time Freeze",
    "Ice Slide",
    "GPS",
  ],
  currentCharacter = 1,
  elfHealth = 2,
  imageURLs = [
    "images/blue_nostripes_tree.png",
    "images/blue_stripes_tree.png",
    "images/extralightblue_stripes_tree.png",
    "images/green_stripes_tree.png",
    "images/lightblue_stripes_tree.png",
  ];
const init = () => {
  SortaCanvas.init(canvas);
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
  SortaCanvas.background = "ivory";
  elf = new SortaCanvas.Image(200, 100, 48, 32, "images/snowman.png", "Toy");
  elfHitbox = new SortaCanvas.Rectangle(200, 100, 44, 28, "gray", "ToyHitbox");
  skis = new SortaCanvas.Image(200, 100, 54, 10, skiURLs[0], "Skis");
  skiTrail = new SortaCanvas.Line(
    [{ x: 0, y: 0, toX: 0, toY: 0 }],
    10,
    "white",
    "Trail"
  );
  skiTrailBacking = new SortaCanvas.Line(
    [{ x: 0, y: 0, toX: 0, toY: 0 }],
    12,
    "lightgray",
    "Trail2"
  );
  skiingEffect.loop = true;
  fillMusicTracks();
  helperLabel = new SortaCanvas.Text(
    canvas.width / 2,
    65,
    "Toy Ski Ultimate",
    "40px arial",
    "gray",
    false,
    ""
  );
  helperLabel.drawLast = true;
  helperLabel.x -= helperLabel.width / 2;
  label2 = new SortaCanvas.Text(
    canvas.width / 2,
    0,
    "0",
    "16px arial",
    "red",
    false,
    ""
  );
  timeLabel = new SortaCanvas.Text(
    canvas.width / 2,
    -20,
    "0s",
    "14px arial",
    "red",
    false,
    ""
  );
  label2.drawLastest = true;
  timeLabel.drawLastest = true;
  elf.drawLast = true;
  SortaCanvas.add(label2);
  SortaCanvas.add(timeLabel);
  snowball = new SortaCanvas.Circle(elf.x, elf.y, 1, "white", "");
  // LOAD PRESENT IMAGE
  for(let a = 0; a < 5; a++) {
	  imagePresentSet[a].src = "images/present_"+(a+1)+".png";
	  imagePresentSet[a].onload = function() {
		  loadedThings += 1;
		  checkEverythingLoaded();
	  }
  }
  // LOAD TREES
  for (let i = 0; i < imageURLs.length; i++) {
    imageSet[i].src = imageURLs[i];
    imageSet[i].onload = function () {
      loadedThings += 1;
	  checkEverythingLoaded();
    };
  }
  SortaCanvas.add(skiTrailBacking);
  SortaCanvas.add(skiTrail);
  SortaCanvas.add(helperLabel);
  SortaCanvas.add(skis);
  SortaCanvas.add(elf);
  elf.x = canvas.width / 2 - elf.width / 2;
  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let resizeDiff = elf.x;
    elf.x = canvas.width / 2 - elf.width / 2;
    followPieces(elf.x - resizeDiff);
  });
  document.body.addEventListener("keydown", ({ key }) => {
    keys.add(key.toLowerCase());
  });
  document.body.addEventListener("keyup", ({ key }) => {
    keys.delete(key.toLowerCase());
  });
  document.body.addEventListener("mousemove", updateMouse);
  document.body.addEventListener("mousedown", updateMouse);
  document.body.addEventListener("mouseup", () => {
    mouseButtonDown = false;
  });
  elf.dy = elf.dx = 0;
  setTimeout(() => {
    document.getElementById("presentScreen").style.display = "none";
  }, 2000);
  window.changeCharacter(0, false);
  updateLocalStorage();
};

const checkEverythingLoaded = () => {
    if (loadedThings == imageURLs.length + 4) { // length - 1 + 5 (items present)
      // Things are done
		prepareWorker();
        render();
    }
}

const updateLocalStorage = () => {
  let storedGamemode = localStorage.getItem("gamemode");
  let storedCharacter = localStorage.getItem("character");
  let storedTutorial = localStorage.getItem("tutorial");
  if (storedGamemode == "0" || storedGamemode == "1") {
    gamemode = parseInt(storedGamemode, 0);
    changeGamemode(0);
  }
  if (storedCharacter != null) {
    currentCharacter = parseInt(storedCharacter, 0);
    changeCharacter(0);
  }
  if (storedTutorial == "1") {
    closeTutorial();
  }
};

window.changeGamemode = (amt = 1) => {
  gamemode += amt;
  if (gamemode > 1) gamemode = 0;
  if (gamemode == 1) {
    gamemodeButton.innerText = "Hardcore";
  } else {
    gamemodeButton.innerText = "Normal";
  }
  localStorage.setItem("gamemode", gamemode);
  changeCharacter(0, false);
  //modeChange(); **Not needed in this version**
};

const modeChange = () => {
  for (let i = 0; i < trees.length; i++) {
    removeATree(trees[i]);
    trees.splice(i, 1);
    i--;
  }
  bottomTree = [0,0, {y:200}];
};

window.changeCharacter = (n, st = true) => {
  currentCharacter += n;
  currentCharacter =
    currentCharacter > characterURLs.length - 1
      ? characterURLs.length - 1
      : currentCharacter;
  currentCharacter = currentCharacter < 0 ? 0 : currentCharacter;
  centerCharacter.src = characterURLs[currentCharacter];
  if (currentCharacter > 0) {
    leftCharacter.src = characterURLs[currentCharacter - 1];
  } else {
    leftCharacter.src = "images/blank.png";
  }
  if (currentCharacter < characterURLs.length - 1) {
    rightCharacter.src = characterURLs[currentCharacter + 1];
  } else {
    rightCharacter.src = "images/blank.png";
  }
  elf.img.src = characterURLs[currentCharacter];
  characterTitle.innerText =
    currentCharacter + 1 + " - " + characterNames[currentCharacter];
  if (gamemode == 0) {
    appendEmoji(characterHealths[currentCharacter], "🌲", characterHealth);
    appendEmoji(characterHealths[currentCharacter], "🌲", healthbar);
    elfHealth = characterHealths[currentCharacter];
  } else {
    healthbar.innerText = "";
    characterHealth.innerText = "One Life";
    elfHealth = 0;
  }
  appendEmoji(characterAgilities[currentCharacter], "🔄", characterAgility);
  //characterSpecial.innerText = characterSpecials[currentCharacter];
  if (st) localStorage.setItem("character", currentCharacter);
};

const appendEmoji = (lst, emoji, ele) => {
  ele.innerText = "";
  for (let i = 0; i < lst; i++) {
    ele.innerText += emoji;
  }
};

const fillMusicTracks = () => {
  for (let i = 0; i < 4; i++) {
    musicTracks.push(new Audio("tracks/jingle" + (i + 1) + ".mp3"));
  }
  let tempList = musicTracks.slice();
  for (let i = 0; i < musicTracks.length; i++) {
    let idx = Math.floor(Math.random() * tempList.length);
    tempList[idx].volume = 0.3;
    musicQueue.push(tempList[idx]);
    tempList.splice(idx, 1);
  }
};

const updateAudio = () => {
  if (musicQueue[musicPlaybackIndex].readyState == 4) {
    if (musicQueue[musicPlaybackIndex].currentTime == 0 && firstClick == true) {
      musicQueue[musicPlaybackIndex].play();
    } else if (musicQueue[musicPlaybackIndex].ended) {
      musicQueue[musicPlaybackIndex].currentTime = 0;
      if (musicPlaybackIndex < musicQueue.length - 1) {
        musicPlaybackIndex += 1;
      } else {
        musicPlaybackIndex = 0;
      }
    }
  }
};

const makeATree = (x, y, h, treeType) => {
  let aTree = new SortaCanvas.Image(x, y, h, h * 0.8, undefined, "");
  let treeShadow = new SortaCanvas.Circle(
    x + (h * 0.8) / 2,
    y + h + 2,
    8,
    "rgba(0, 0, 0, 0.1)",
    ""
  );
  let treeBottom = new SortaCanvas.Rectangle(
    x + (h * 0.8) / 2 - 2.5,
    y + h,
    7,
    5,
    "sienna",
    ""
  );
  // Tree bottom.. tree trunk.. oops
  aTree.drawLast = treeShadow.drawLast = treeBottom.drawLast = true;
  aTree.img = imageSet[treeType];
  SortaCanvas.add(treeShadow);
  SortaCanvas.add(treeBottom);
  SortaCanvas.add(aTree);
  return [aTree, treeShadow, treeBottom];
};

const removeATree = (tree) => {
  for (let i of tree) {
    SortaCanvas.remove(i);
  }
};

const showATree = (tree, vis) => {
  for (let i of tree) {
    i.visible = vis;
  }
};

const prepareWorker = () => {
  worker.onmessage = function (e) {
    // Map worker has been loaded
    if (e.data != null) {
      makeTrees(e.data[1], treeStartY);
    } else {
      canRequestTrees = true;
	  readyForTrees = true;
	  bottomTree = [0,0,{y: 200}];
    }
  };
};

const requestTrees = (sy) => {
  readyForTrees = false;
  treeStartY = sy;
  worker.postMessage([
    "gen",
    0, // min X
    relativeY, // min Y
    canvas.width * 4, // maxX
    5 + relativeY, // maxY
  ]);
};

const makeTrees = (arr, sy) => { // and presents too!
  defaultLastY.y = sy + 340;
  let lastY = defaultLastY;
  for (let x = 0; x < arr.length; x++) {
    for (let y = 0; y < arr[x].length; y++) {
		if(arr[x][y][2] > divVal2) {
		  let thePresent = new SortaCanvas.Image(
		  x - canvas.width / 2.5 + Math.random() * 40,
		  y * 68 + sy + Math.random()*200,
		  16,
		  16,
		  undefined,
		  "present"
		  );
		  thePresent.img = imagePresentSet[Math.floor(Math.random()*imagePresentSet.length)];
		  SortaCanvas.add(thePresent);
		  presents.push(thePresent);
		  
	  }
      if (arr[x][y][0] > divVal) {
        let theTree = makeATree(
          x - canvas.width / 2.5,
          y * 68 + sy,
          Math.random() * 50 + 35,//Math.abs(arr[x][y][1]+0.5)*40 + 35, **pattern**
          Math.floor(((arr[x][y][1] + 1) * imageSet.length) / 2)
        );
        if (
          lastY == defaultLastY ||
          (theTree[0].y > lastY[0].y && lastY != defaultLastY)
        ) {
          lastY = theTree;
        }
        trees.push(theTree);
      }

    }
  }
  bottomTree = lastY;
  readyForTrees = true;
};

const fadeElement = (ele, customTime = 1100) => {
  ele.style.opacity = 0;
  setTimeout(() => {
    ele.style.display = "none";
  }, customTime);
};

window.startGame = () => {
  firstClick = true;
  elf.dy = 0.12;
  playerStartTime = Date.now();
  skiingEffect.play();
  fadeElement(characterCustomizer);
  gamePlaying = true;
};

window.closeTutorial = () => {
  fadeElement(tutorialPane, 500);
  characterCustomizer.style.height = "300px";
  characterCustomizer.style.opacity = 1;
  characterCustomizer.style.display = "block";
  localStorage.setItem("tutorial", "1");
};

window.showTutorial = () => {
  tutorialPane.style.opacity = 1;
  tutorialPane.style.display = "block";
};

const updateMouse = (e) => {
  if (e.buttons == 1) {
    angleToElf =
      -(Math.atan2(e.clientX - elf.x, e.clientY - elf.y) * 180) / Math.PI;
    angleToElf = angleToElf > 88 ? 88 : angleToElf < -88 ? -88 : angleToElf;
    mouseButtonDown = true;
  }
};

const updateMovement = () => {
  if (mouseButtonDown) {
    elf.rotation -=
      (elf.rotation - angleToElf) /
      (20 / (characterAgilities[currentCharacter] / 4));
  }
  if (keys.has("a")) {
    // left movement
    if (elf.rotation < 88) {
      elf.rotation += 2 * (characterAgilities[currentCharacter] / 2.5);
    }
  }
  if (keys.has("d")) {
    if (elf.rotation > -88) {
      elf.rotation -= 2 * (characterAgilities[currentCharacter] / 2.5);
    }
  }
  if (!firstClick) return;
  skiingEffect.volume = elf.dy / 5;
  if (!gameFreeze) {
    elf.dx = (-elf.rotation / 45) * elf.dy;
    elf.dy *= Math.cos(elf.rotation / 160) + 0.03; // Created with Desmos
    elf.dy = elf.dy > 5 ? 5 : elf.dy;
    elf.dy = elf.dy < 0.02 ? 0.02 : elf.dy;
    followPieces();
  } else {
    elf.dx *= 0.97;
    elf.dy *= 0.97;
    elf.x += elf.dx;
    elf.y += elf.dy;
    skis.x = elf.x + 11;
    skis.y = elf.y;
    elf.rotation += 2;
    skis.rotation = elf.rotation;
    snowball.radius += 0.5;
    snowball.x = elf.x + elf.width / 2;
    snowball.y = elf.y + elf.height / 2;
  }
};

const followPieces = (resizeAdjustment = 0) => {
  if (resizeAdjustment == 0) {
    relativeY += elf.dy;
    helperLabel.y -= elf.dy;
    label2.y += label2.y < 40 ? elf.dy : 0;
    timeLabel.y += timeLabel.y < 60 ? elf.dy / 2 : 0;
  }
  for (let i = 0; i < trees.length; i++) {
    let tree = trees[i];
    for (let z = 0; z < tree.length; z++) {
      if (resizeAdjustment == 0) {
        tree[z].y -= elf.dy;
        tree[z].x -= elf.dx;
      } else {
        tree[z].x += resizeAdjustment;
      }
    }
  }
  for(let i = 0 ; i < presents.length; i++) {
	  if(resizeAdjustment == 0) {
		presents[i].y -= elf.dy;
		presents[i].x -= elf.dx;
	  } else {
		  presents[i].x += resizeAdjustment;
	  }
  }
  for (let i = 0; i < flyingTrees.length; i++) {
    let tree = flyingTrees[i];
    for (let z = 0; z < tree.length; z++) {
      if (resizeAdjustment == 0) {
        tree[z].y -= elf.dy;
        tree[z].x -= elf.dx;
        tree[z].x += tree.dx;
        tree[z].y += tree.dy;
        tree[z].rotation += tree.dx;
      } else {
        tree[z].x += resizeAdjustment;
      }
    }
    tree.dx *= 0.97;
    tree.dy *= 0.97;
    if (Math.abs(tree.dx) < 0.05) {
      removeATree(tree);
      flyingTrees.splice(flyingTrees.indexOf(tree), 1);
      i--;
    }
  }
  for (let i = 0; i < skiTrail.points.length; i++) {
    let trailPart = skiTrail.points[i];
    if (resizeAdjustment == 0) {
      trailPart.y -= elf.dy;
      trailPart.x -= elf.dx;
      trailPart.toY -= elf.dy;
      trailPart.toX -= elf.dx;
    } else {
      trailPart.x += resizeAdjustment;
      trailPart.toX += resizeAdjustment;
    }
    if (trailPart.toY < -10 && skiTrail.points.length > 1) {
      skiTrail.points.splice(i, 1);
      i--;
    }
    skiTrailBacking.points[i] = skiTrail.points[i];
  }
};

const flingTree = (tr) => {
  tr.dx = elf.rotation > 0 ? -2 : 2;
  tr.dy = 2;
  flyingTrees.push(tr);
};

const dumpTrees = () => { // and presents
  // Remove them! We need memory!
  for(let i =0; i < presents.length; i++) { // remove the presents
	  if(presents[i].x < -30 || presents[i].x > canvas.width + 30) {
		  presents[i].visible = false;
	  } else if (presents[i].visible == false) {
		  presents[i].visible = true;
	  }
	  if(presents[i].y < -30) {
		  SortaCanvas.remove(presents[i]);
		  presents.splice(i, 1);
		  i--;
	  } else {
		  if(SortaCanvas.collision(presents[i], elfHitbox) == true && gameFreeze == false) {
			  SortaCanvas.remove(presents[i]);
			  presents.splice(i, 1);
			  i--;
			  playerScore += 20;
		  }
	  }
  }
  for (let i = 0; i < trees.length; i++) {
    if (trees[i][1].x < -30 || trees[i][1].x > canvas.width + 30) {
      showATree(trees[i], false);
    } else if (trees[i][1].visible == false) {
      showATree(trees[i], true);
    }
    if (trees[i][1].y < -30) {
      removeATree(trees[i]);
      trees.splice(i, 1);
      i--;
    } else {
      if (
        SortaCanvas.collision(trees[i][2], elfHitbox) == true &&
        gameFreeze == false
      ) {
        frostPane.style.opacity = 1;
        frostPane.style.height = "100%";
        crashEffect.currentTime = 0;
        crashEffect.play();
        elfHealth -= 1;
        elf.dy *= 0.25;
        flingTree(trees[i]);
        appendEmoji(elfHealth, "🌲", healthbar);
        setTimeout(() => {
          frostPane.style.opacity = 0;
          setTimeout(() => {
            frostPane.style.height = 0;
          }, 300);
        }, 500);
        if (elfHealth == -1) {
          gameFreeze = true;
		  snowball.drawLast = true;
          SortaCanvas.add(snowball);
          elf.dy *= 4;
          setTimeout(() => {
            gamePlaying = false;
            skiingEffect.pause();
            finalScore.innerHTML =
              "Final Score: <br><h1>" +
              Math.round(playerScore) +
              `</h1>Time: ${timeLabel.text}<br>${
                gamemode == 1 ? 2 : 1
              }x Score (${gamemode == 1 ? "Hardcore" : "Normal"} Mode)`;
            oofMessage.innerText =
              deathMessages[
                Math.round(Math.random() * (deathMessages.length - 1))
              ];
            setTimeout(() => {
              deathPanel.style.height = "100%";
              deathPanel.style.opacity = 1;
              deathPanel.style.pointerEvents = "auto";
			  document.getSelection().removeAllRanges();
            }, 1000);
          }, 1000);
        } else {
          trees.splice(i, 1);
        }
      }
    }
  }
};

const updateDayCounter = () => {
  cDate = Date.now();
  let dif = (christmasDay - cDate) / 1000; // ms to s
  if (dif < 0) {
    daycounter.innerText = "Merry Christmas 2024!";
  }
  let days = Math.floor(dif / (3600 * 24));
  dif -= days * 3600 * 24;
  let hours = Math.floor(dif / 3600);
  dif -= hours * 3600;
  let minutes = Math.floor(dif / 60);
  dif -= minutes * 60;
  dif = Math.floor(dif);
  daycounter.innerText = "";
  if (days > 0) daycounter.innerText += days + (days > 1 ? " days" : " day");
  if (hours > 0)
    daycounter.innerText +=
      (days > 0 ? ", " : "") + hours + (hours > 1 ? " hours" : " hour");
  if (minutes > 0)
    daycounter.innerText +=
      (hours > 0 || (hours == 0 && days > 0) ? ", " : "") +
      minutes +
      (minutes > 1 ? " minutes" : " minute");
  if (dif > 0)
    daycounter.innerText +=
      (minutes > 0 ||
      (minutes == 0 && hours > 0) ||
      (minutes == 0 && hours == 0 && days > 0)
        ? " and "
        : "") +
      dif +
      (dif > 1 ? " seconds" : " second");
};

const updateGameTimer = () => {
  let nowTime = Date.now();
  if (elfHealth > -1) {
    let deltaTime = Math.floor((nowTime - playerStartTime) / 1000);
    gameDeltaTime = deltaTime;
    let min = Math.floor(deltaTime / 60);
    deltaTime -= min * 60;
    timeLabel.text = (min > 0 ? min + "m " : "") + deltaTime + "s";
  }
};


const extendSkiTrail = () => {
  let calcElfY =
    elf.y - (Math.abs(elf.rotation / 88) * elf.height) / 4 + elf.height;
  let calcElfX = elf.x + elf.width / 2 - ((elf.rotation / 88) * elf.height) / 2;
  let lastPt =
    skiTrail.points.length > 1
      ? skiTrail.points[skiTrail.points.length - 2]
      : skiTrail.points[0];
  if (skiTrail.points[0]) {
    if (skiTrail.points[0].x == 0 && skiTrail.points[0].toX == 0) {
      skiTrail.points[0].x = calcElfX;
      skiTrail.points[0].y = calcElfY;
    }
    skiTrail.points[skiTrail.points.length - 1].toX = calcElfX;
    skiTrail.points[skiTrail.points.length - 1].toY = calcElfY;
    if (oddEvenCounter == 2 && skiTrail.points.length < 75) {
      skiTrail.points.push({
        x: lastPt.toX,
        y: lastPt.toY,
        toX: calcElfX,
        toY: calcElfY,
      });
    }
  }
};

const render = () => {
  requestAnimationFrame(render);
  oddEvenCounter++;
  if (oddEvenCounter > 2) oddEvenCounter = 0;
  updateDayCounter();
  timeLabel.x = canvas.width / 2 - timeLabel.width / 2;
  label2.x = canvas.width / 2 - label2.width / 2;
  helperLabel.x = canvas.width / 2 - helperLabel.width / 2;

  if (gamePlaying === true) {
    treeRange = canvas.height;
    updateMovement();
    updateAudio();
    extendSkiTrail();
    updateGameTimer();
    playerScore += ((relativeY - prevRelativeY) * (gamemode == 1 ? 2 : 1)) / 30;
    label2.text = Math.round(playerScore).toString();
    prevRelativeY = relativeY;
  }
  if (!gameFreeze) {
    elfHitbox.x = elf.x;
    elfHitbox.y = elf.y;
    skis.x = elf.x + 11;
    skis.y = elf.y;
    skis.rotation = elf.rotation;
    dumpTrees();
    if (canRequestTrees && readyForTrees && bottomTree[2].y < treeRange) {
      // make more trees
      requestTrees(bottomTree[2].y);
    }
  }
  SortaCanvas.render();
};
init();

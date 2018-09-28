var frameCount = 0,
  frameIndex = 0,
  score = 0,
  gameOver = false,
  won = false;//Various global variables that probably shouldn't exist.

// The keycodes that will be mapped when a user presses a button.
// Original code by Doug McInnes
KEY_CODES = {
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
}
// Creates the array to hold the KEY_CODES and sets all their values
// to false. Checking true/flase is the quickest way to check status
// of a key press and which one was pressed when determining
// when to move and which direction.
KEY_STATUS = {};
for (code in KEY_CODES) {
  KEY_STATUS[KEY_CODES[code]] = false;
}
/**
 * Sets up the document to listen to onkeydown events (fired when
 * any key on the keyboard is pressed down). When a key is pressed,
 * it sets the appropriate direction to true to let us know which
 * key it was.
 */
document.onkeydown = function(e) {
  // Firefox and opera use charCode instead of keyCode to
  // return which key was pressed.
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
    e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = true;
  }
}
/**
 * Sets up the document to listen to ownkeyup events (fired when
 * any key on the keyboard is released). When a key is released,
 * it sets teh appropriate direction to false to let us know which
 * key it was.
 */
document.onkeyup = function(e) {
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
    e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = false;
  }
}


var imageRepository = new function() { //store images here so we don't have to load files multiple times

  this.background = new Image();
  this.emcee = new Image();
  this.glob = new Image();
  this.urchin = new Image();
  this.spike = new Image();
  var numImages = 5;
  var imagesLoaded = 0;

  function imageLoad() {
    imagesLoaded++;
    if (imagesLoaded === numImages) {
      window.init();
    }
  }
  this.background.onload = function() {
    imageLoad();
  }
  this.emcee.onload = function() {
    imageLoad();
  }
  this.glob.onload = function() {
    imageLoad();
  }
  this.spike.onload = function() {
    imageLoad();
  }
  this.urchin.onload = function() {
    imageLoad();
  }

  // Set image sources
  this.background.src = "imgs/bg.png";
  this.emcee.src = "imgs/MCss2.png";
  this.glob.src = "imgs/Globss.png"
  this.urchin.src = "imgs/Urchinss.png"
  this.spike.src = "imgs/spikeSS.png"


}

function Drawable() { //prototype object for anything we end up throwing on the canvas, provides useful tools.
  this.init = function(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  this.speed = 0;
  this.canvasWidth = 0;
  this.canvasHeight = 0;
  this.draw = function() {};
}

function Background() { //scrolling background
  this.speed = 1;
  this.draw = function() {
    this.y += this.speed;
    this.context.drawImage(imageRepository.background, this.x, this.y);
    this.context.drawImage(imageRepository.background, this.x, this.y - this.canvasHeight);
    if (this.y >= this.canvasHeight) {
      this.y = 0;
    }
  };
}
Background.prototype = new Drawable();

/**
 * Custom Pool object. Holds projectives, enemies, whatever we want. Used to prevent garbage collection.
 */
function Pool(maxSize) {
  var size = maxSize; // Max bullets objects in the pool
  var pool = [];
  /*
   * Populates the pool array with various objects
   */
  this.init = function(object) {
    if (object != "urchin") {   //messy code used to customize our pool based on what we want
      for (var i = 0; i < size; i++) {
        var glob = new Glob(object);
        if (object.includes("spiker")) {
          glob.init(-200, -200, imageRepository.spike.width / 4,
            imageRepository.spike.height);
        } else {
          glob.init(1000, 1000, imageRepository.glob.width / 5,
            imageRepository.glob.height);
        }
        pool[i] = glob;
      }
    } else { //isUrchin
      for (var i = 0; i < size; i++) {
        var urchin = new Urchin();
        urchin.init(-200, -200, imageRepository.urchin.width / 4, imageRepository.urchin.height);
        pool[i] = urchin;
      }
    }



  };
  // pulls the last item in our pool & initializes it

  this.get = function(x, y, speed) {

    if (!pool[size - 1].alive) {
      pool[size - 1].spawn(x, y, speed);
      pool.unshift(pool.pop());
    }
  };

  //A function that probably shouldn't exist, made as a workaround because of bugs I was getting
  this.grabAll = function() {
    return pool;
  };

  //Draws our stuff. Clears away off-screen objects
  this.animate = function() {
    for (var i = 0; i < size; i++) {
      // Draw until we find a dead object.
      if (pool[i].alive) {
        if (pool[i].draw()) {
          pool[i].clear();
          pool.push((pool.splice(i, 1))[0]);
        }
      } else
        break;
    }
  };
}

function Glob(object) {
  this.alive = false; // Is true if projectile is in use.
  this.image = imageRepository.glob;
  var me = object;
  this.itsAHit = false;


  this.spawn = function(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.alive = true;
  };
  /*
   * Uses a "dirty rectangle" to erase the bullet and moves it.
   * Returns true if the bullet moved off the screen, indicating that
   * the bullet is ready to be cleared by the pool, otherwise draws
   * the bullet.
   *      In hindsight, I regret using the dirty rectangle method.
   *      My game design choices made this a bad fit and I'm not sure how efficient it is.
   *      Incoming VERY messy code.
   */
  this.draw = function() {
    this.context.clearRect(this.x, this.y, this.width, this.height); //Dirty rectangle
    if (this.itsAHit) {
      this.clear();
    }
    if (me === "globster") {
      this.y -= this.speed;
      if (this.y <= 0 - this.height) {
        return true;
      } else {
        this.context.drawImage(this.image, frameIndex * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);
      }
    } else if (me === "spiker1") {
      this.y -= this.speed / 1.4;
      this.x += this.speed / 1.4;
      if (this.y <= 0 - this.height || this.x > this.canvasWidth) {
        return true;
      } else {
        this.context.drawImage(imageRepository.spike, 0 * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);
      }
    } else if (me === "spiker2") {
      this.y += this.speed / 1.4;
      this.x += this.speed / 1.4;
      if (this.y >= this.canvasHeight || this.x > this.canvasWidth) {
        return true;
      } else {
        this.context.drawImage(imageRepository.spike, 1 * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);
      }
    } else if (me === "spiker3") {
      this.y += this.speed / 1.4;
      this.x -= this.speed / 1.4;
      if (this.y >= this.canvasHeight || this.x < 0 - this.width) {
        return true;
      } else {
        this.context.drawImage(imageRepository.spike, 2 * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);
      }
    } else if (me === "spiker4") {
      this.y -= this.speed / 1.4;
      this.x -= this.speed / 1.4;
      if (this.y < 0 - this.height || this.x < 0 - this.width) {
        return true;
      } else {
        this.context.drawImage(imageRepository.spike, 3 * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);
      }
    }
  };

  this.clear = function() {
    this.x = 1000;
    this.y = 2000;
    this.speed = 0;
    this.alive = false;
    itsAHit = false;
  };
}
Glob.prototype = new Drawable();

function Emcee() {
  this.speed = 5;
  this.globPool = new Pool(30);
  this.globPool.init("globster");
  this.image = imageRepository.emcee;
  var pewRate = 15;
  var counter = 0;
  this.draw = function() {
    this.context.drawImage(this.image, frameIndex * this.width / 4, 0, this.width / 4, this.height, this.x, this.y, this.width / 4, this.height);
  };
  this.move = function() {
    counter++;
    // Determine if the action is move action
    if (KEY_STATUS.left || KEY_STATUS.right ||
      KEY_STATUS.down || KEY_STATUS.up) {
      //Dirty rectangle!! Time to move our Globby guy
      this.context.clearRect(this.x, this.y, this.width, this.height);
      // Update x and y according to the direction to move and
      // redraw the ship. Allows multiple inputs for diagonal movement.
      if (!gameOver) {
        if (KEY_STATUS.left) {
          this.x -= this.speed
          if (this.x <= 0) // Keep player within the screen
            this.x = 0;
        }
        if (KEY_STATUS.right) {
          this.x += this.speed
          if (this.x >= this.canvasWidth - this.width / 5) {

            this.x = this.canvasWidth - this.width / 5;
          }
        }
        if (KEY_STATUS.up) {
          this.y -= this.speed * .8;
          if (this.y <= this.canvasHeight / 8 * 1)
            this.y = this.canvasHeight / 8 * 1;
        }
        if (KEY_STATUS.down) {
          this.y += this.speed * .8;
          if (this.y >= this.canvasHeight - this.height)
            this.y = this.canvasHeight - this.height;
        }
        // Finish by redrawing the ship
        this.draw();
      }

    }
    if (KEY_STATUS.space && counter >= pewRate && !gameOver) {
      this.pew();
      counter = 0;
    }
  };
  /*
   * Fires a glob
   */
  this.pew = function() {
    this.globPool.get(this.x + 24, this.y - 2, 6);
  };
}
Emcee.prototype = new Drawable();

/**
 * Create the Enemy ship object.
 */
function Urchin() {
  var percentFire = .01;
  var chance = 0;
  this.alive = false;
  this.itsAHit = false;
  /*
   * Sets the Enemy values
   */
  this.spawn = function(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.speedX = 1.5;
    this.speedY = speed;
    this.alive = true;
    this.leftEdge = 20;
    this.rightEdge = this.canvasWidth - 50;
    this.bottomEdge = this.canvasHeight / 2;
    this.topEdge = 0;
  };
  /*
   * Move the enemy
   */
  this.draw = function() {
    if (!this.itsAHit) {

      this.context.clearRect(this.x - 1, this.y, this.width + 1, this.height);
      this.x += this.speedX;
      this.y += this.speedY;
      randSpd = Math.random() * 2;
      this.speed = randSpd;
      if (this.x <= this.leftEdge)
        this.speedX = this.speed;
      if (this.x >= this.rightEdge)
        this.speedX = -this.speed;
      if (this.y >= this.bottomEdge) {
        this.speedY = -this.speed;
      }
      if (this.y <= this.topEdge) {
        this.speedY = this.speed;

      }

      this.context.drawImage(imageRepository.urchin, frameIndex * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);

      // Enemy has a chance to shoot
      chance = Math.floor(Math.random() * 101);
      if (chance / 100 < percentFire || !frameCount % 250) {
        this.fire();
      }
    }
  };
  /*
   * Shoots out 4 sick spikes. This particular part of code makes decent use of our pool object.
   */
  this.fire = function() {
    game.spikeOnePool.get(this.x + this.width, this.y, 1.5);
    game.spikeTwoPool.get(this.x + this.width, this.y + this.height, 1.5);
    game.spikeThreePool.get(this.x, this.y + this.height, 1.5);
    game.spikeFourPool.get(this.x, this.y, 1.5);



  }
  /*
   * Resets the urchins values
   */
  this.clear = function() {
    this.context.clearRect(this.x - 1, this.y, this.width + 1, this.height);

    this.x = -200;
    this.y = -200;
    this.speed = 0;
    this.speedX = 0;
    this.speedY = 0;
    this.alive = false;

  };
}
Urchin.prototype = new Drawable();




function Game() { //Our Game holds all of our important stuff and initializes/starts the whole she-bang.
  this.init = function() {
    this.bgCanvas = document.getElementById('background');
    this.bgContext = this.bgCanvas.getContext('2d');
    this.fgCanvas = document.getElementById('foreground');
    this.fgContext = this.fgCanvas.getContext('2d');
    this.mcCanvas = document.getElementById('mcground');
    this.mcContext = this.mcCanvas.getContext('2d');
    Background.prototype.context = this.bgContext;
    Background.prototype.canvasWidth = this.bgCanvas.width;
    Background.prototype.canvasHeight = this.bgCanvas.height;
    Glob.prototype.context = this.fgContext;
    Glob.prototype.canvasWidth = this.fgCanvas.width;
    Glob.prototype.canvasHeight = this.fgCanvas.height;
    Urchin.prototype.context = this.fgContext;
    Urchin.prototype.canvasWidth = this.fgCanvas.width;
    Urchin.prototype.canvasHeight = this.fgCanvas.height;
    Emcee.prototype.context = this.mcContext;
    Emcee.prototype.canvasWidth = this.mcCanvas.width;
    Emcee.prototype.canvasHeight = this.mcCanvas.height;


    this.background = new Background();
    this.background.init(0, 0);

    this.emcee = new Emcee();
    this.emcee.init(230, 400, imageRepository.emcee.width, imageRepository.emcee.height);


    //Code to spawn our wave of enemies. Tried to work on multiple waves of enemies, but couldn't quite figure it out.
    this.urchinPool = new Pool(30);
    this.urchinPool.init("urchin");
    var height = imageRepository.urchin.height;
    var width = imageRepository.urchin.width / 4;
    var x = 100;
    var y = -height;
    var spacer = y * 1.5;
    for (var i = 1; i <= 18; i++) {
      this.urchinPool.get(x, y, 2);
      x += width + 25;
      if (i % 6 == 0) {
        x = 100;
        y += spacer
      }
    }
    this.spikeOnePool = new Pool(50);
    this.spikeOnePool.init("spiker1");
    this.spikeTwoPool = new Pool(50);
    this.spikeTwoPool.init("spiker2");
    this.spikeThreePool = new Pool(50);
    this.spikeThreePool.init("spiker3");
    this.spikeFourPool = new Pool(50);
    this.spikeFourPool.init("spiker4");


  };

  this.start = function() {
    this.emcee.draw();
    animate();
  };
}

function animate() {
  frameCount += 1;  //Limited myself to 4 animation frames per animated object to reduce complexity.
  if (frameCount % 15 === 0) { //switches sprites every 15 frames.
    frameIndex += 1;
    if (frameIndex === 4) {
      frameIndex = 0;
    }
  }

  requestAnimFrame(animate);
  game.background.draw();
  game.emcee.move();
  game.emcee.globPool.animate();
  game.urchinPool.animate();
  game.spikeOnePool.animate();
  game.spikeTwoPool.animate();
  game.spikeThreePool.animate();
  game.spikeFourPool.animate();
  if (!gameOver && !won) { //doesn't continue to run collision checks after we win/lose.
    checkAllCollisions();
  }
}

function checkAllCollisions() {
  var urchins = game.urchinPool.grabAll();
  var myglobs = game.emcee.globPool.grabAll();
  var spikes1 = game.spikeOnePool.grabAll();
  var spikes2 = game.spikeTwoPool.grabAll();
  var spikes3 = game.spikeThreePool.grabAll();
  var spikes4 = game.spikeFourPool.grabAll();
  var allSpikes = spikes1.concat(spikes2, spikes3, spikes4);
  if (frameCount % 2 === 0) {
    checkForDestruction(myglobs, urchins, "points");
    checkForDestruction(allSpikes, game.emcee, "You Died");
  }
}

function checkForDestruction(objA, objB, outcome) {


  for (var i = 0; i < objA.length; i++) {
    if (outcome != "You Died") {
      for (var j = 0; j < objB.length; j++) {

        if (objA[i].x < objB[j].x + objB[j].width && objA[i].x + objA[i].width > objB[j].x &&
          objA[i].y < objB[j].y + objB[j].height && objA[i].y + objA[i].height > objB[j].y) {
          if (objB[j].itsAHit || objA[i].itsAHit) {
            return true;
          }
          objA[i].itsAHit = true;
          objB[j].itsAHit = true;
          if (outcome === "points") {
            score += 100;
            if (score === 1800) {
              updateText("You WIN! Score: " + score);
              won = true;
            } else {
              updateText("Score: " + score);
            }
          }

        }

      }
    } else {
      if (objA[i].x < objB.x + 10 + objB.width / 7 && objA[i].x + objA[i].width > objB.x + 10 &&
        objA[i].y < objB.y + objB.height * .7 && objA[i].y + objA[i].height > objB.y) {
        console.log("boofed: " + objA[i].x + ", " + objA[i].y + "; me: " + objB.x + ", " + objB.y);
        console.log("objaW: " + objA[i].width + "; objBW: " + objB.width);
        gameOver = true;
        updateText("GAME OVER! Score: " + score);
      }

    }
  }

}

function updateText(text) {
  console.log("update with this: " + text);
  var mcvas = document.getElementById('mcground');
  var mctext = mcvas.getContext('2d');
  mctext.clearRect(0, 0, mcvas.width, 30);
  mctext.font = "10pt Arial";
  mctext.fillStyle = "red";
  mctext.fillText(text, 10, 20);

}
/**
 * requestAnim shim layer by Paul Irish
 * Finds the first API that works to optimize the animation loop,
 * otherwise defaults to setTimeout().
 */
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function( /* function */ callback, /* DOMElement */ element) {
      window.setTimeout(callback, 1000 / 60);
    };
})();

var game = new Game();

function init() {
  game.init();

  game.start();
}

var frameCount = 0,
  frameIndex = 0;


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


var imageRepository = new function() {
  // Define images
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

  // Set images src
  this.background.src = "imgs/bg.png";
  this.emcee.src = "imgs/MCss2.png";
  this.glob.src = "imgs/Globss.png"
  this.urchin.src = "imgs/Urchinss.png"
  this.spike.src = "imgs/spikeSS.png"


}

function Drawable() {
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

function Background() {
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
 * Custom Pool object. Holds Bullet objects to be managed to prevent
 * garbage collection.
 */
function Pool(maxSize) {
  var size = maxSize; // Max bullets allowed in the pool
  var pool = [];
  /*
   * Populates the pool array with Bullet objects
   */
  this.init = function(object) {
    if (object != "urchin") {
      for (var i = 0; i < size; i++) {
        // Initalize the bullet object
        var glob = new Glob(object);
        if (object.includes("spiker")) {
          glob.init(0, 0, imageRepository.spike.width / 4,
            imageRepository.spike.height);
        } else {
          glob.init(0, 0, imageRepository.glob.width / 5,
            imageRepository.glob.height);
        }
        pool[i] = glob;
      }
    } else { //isUrchin
      for (var i = 0; i < size; i++) {
        var urchin = new Urchin();
        urchin.init(0, 0, imageRepository.urchin.width / 4, imageRepository.urchin.height);
        pool[i] = urchin;
      }
    }



  };
  /*
   * Grabs the last item in the list and initializes it and
   * pushes it to the front of the array.
   */

  this.get = function(x, y, speed) {

    if (!pool[size - 1].alive) {
      pool[size - 1].spawn(x, y, speed);
      pool.unshift(pool.pop());
    }
  };
  /*
   * Used for the ship to be able to get two bullets at once. If
   * only the get() function is used twice, the ship is able to
   * fire and only have 1 bullet spawn instead of 2.
   */
  this.grabAll = function() {
    return pool;
  };
  /*
   * Draws any in use Bullets. If a bullet goes off the screen,
   * clears it and pushes it to the front of the array.
   */
  this.animate = function() {
    for (var i = 0; i < size; i++) {
      // Only draw until we find a bullet that is not alive
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
  this.alive = false; // Is true if the bullet is currently in use
  this.image = imageRepository.glob;
  var me = object;
  /*
   * Sets the bullet values
   */
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
   */
  this.draw = function() {
    this.context.clearRect(this.x, this.y, this.width, this.height); //Dirty rectangle
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
  /*
   * Resets the bullet values
   */
  this.clear = function() {
    this.x = 0;
    this.y = 0;
    this.speed = 0;
    this.alive = false;
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
    //console.log(this.context);
    this.context.drawImage(this.image, frameIndex * this.width / 4, 0, this.width / 4, this.height, this.x, this.y, this.width / 4, this.height);
  };
  this.move = function() {
    counter++;
    // Determine if the action is move action
    if (KEY_STATUS.left || KEY_STATUS.right ||
      KEY_STATUS.down || KEY_STATUS.up) {
      // The ship moved, so erase it's current image so it can
      // be redrawn in it's new location
      this.context.clearRect(this.x, this.y, this.width, this.height);
      // Update x and y according to the direction to move and
      // redraw the ship. Change the else if's to if statements
      // to have diagonal movement.
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
    if (KEY_STATUS.space && counter >= pewRate) {
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
  /*
   * Sets the Enemy values
   */
  this.spawn = function(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.speedX = 0;
    this.speedY = speed;
    this.alive = true;
    this.leftEdge = this.x - 90;
    this.rightEdge = this.x + 90;
    this.bottomEdge = this.y + 140;
  };
  /*
   * Move the enemy
   */
  this.draw = function() {
    this.context.clearRect(this.x - 1, this.y, this.width + 1, this.height);
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x <= this.leftEdge) {
      this.speedX = this.speed;
    } else if (this.x >= this.rightEdge + this.width) {
      this.speedX = -this.speed;
    } else if (this.y >= this.bottomEdge) {
      this.speed = 1.5;
      this.speedY = 0;
      this.y -= 5;
      this.speedX = -this.speed;
    }
    this.context.drawImage(imageRepository.urchin, frameIndex * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);
    // Enemy has a chance to shoot every movement
    chance = Math.floor(Math.random() * 101);
    if (chance / 100 < percentFire) {
      this.fire();
    }
  };
  /*
   * Fires a bullet
   */
  this.fire = function() {
    game.spikeOnePool.get(this.x + this.width, this.y, 1.5);
    game.spikeTwoPool.get(this.x + this.width, this.y + this.height, 1.5);
    game.spikeThreePool.get(this.x, this.y + this.height, 1.5);
    game.spikeFourPool.get(this.x, this.y, 1.5);



  }
  /*
   * Resets the enemy values
   */
  this.clear = function() {
    this.x = 0;
    this.y = 0;
    this.speed = 0;
    this.speedX = 0;
    this.speedY = 0;
    this.alive = false;
  };
}
Urchin.prototype = new Drawable();




function Game() {
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

    this.urchinPool = new Pool(30);
    this.urchinPool.init("urchin");
    var height = imageRepository.urchin.height;
    var width = imageRepository.urchin.width / 4;
    var x = 100;
    var y = -height;
    //this.urchinPool.get(200, 80, 1);
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
  frameCount += 1;
  if (frameCount % 15 === 0) {
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
  checkAllCollisions();

}

function checkAllCollisions() {
  console.log(game.urchinPool);
  //var urchinCount = game.urchinPool.pool.length;
  //game.emcee.globPool.pool.forEach(checkForGlobHit(element, urchinCount));
}

function checkForGlobHit(glob, uC) {
  for (var i = 0; i < uC; i++) {
    if (tempUrch = game.urchinPool.pool[i]) {
      if (glob.x < tempUrch.x + tempUrch.width && glob.x + glob.width > tempUrch.x &&
        glob.y < tempUrch.y + tempUrch.height && glob.y + glob.height > tempUrch.y) {
        game.urchinPool.pool[i].clear();
        glob.clear();
      }
    }
  }
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

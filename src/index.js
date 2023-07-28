//jshint esversion:6
let canvas = document.getElementById("gameScreen");
let ctx = canvas.getContext("2d");

class Attacker {
  constructor() {
    this.width = 20;
    this.height = 20;
    this.position = {
      x: 180,
      y: 370,
    };
    this.speed = 0;
    this.image = document.getElementById("img_attacker");
  }

  update() {
    this.position.x += this.speed;
    if (this.position.x < 0) {
      this.position.x = 0;
    } else if (this.position.x + this.width > 400) {
      this.position.x = 400 - this.width;
    }
  }
  moveLeft() {
    this.speed = -3;
  }
  moveRight() {
    this.speed = 3;
  }
  stop() {
    this.speed = 0;
  }
  draw(ctx) {
    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }
}

class Bullet {
  constructor(attacker) {
    this.position = {
      x: attacker.position.x + attacker.width / 2,
      y: attacker.position.y,
    };

    this.size = {
      width: 3,
      height: -5,
    };
    this.fired = false;
    this.speed = 0;
    this.maxSpeed = 5;
    this.collide = false;
  }
  update(position_x) {
    if (this.fired == false) {
      this.position.x = position_x + attacker.width / 2 - this.size.width / 2;
    } else {
      this.speed = this.maxSpeed;
    }

    this.position.y -= this.speed;
  }
  draw(ctx) {
    ctx.fillStyle = "#0ff";
    ctx.fillRect(
      this.position.x,
      this.position.y,
      this.size.width,
      this.size.height
    );
  }
  reset() {
    this.position = {
      x: attacker.position.x + attacker.width / 2,
      y: attacker.position.y,
    };
    this.fired = false;
    this.speed = 0;
  }
}

class Invader {
  constructor(position, bullet) {
    this.position = position;
    this.speed = 0.7;
    this.size = {
      width: 20,
      height: 20,
    };
    this.collide = false;
    this.image = document.getElementById("img_invader");
  }

  update() {
    this.position.x += this.speed;
    if (collisionHit(bullet, this)) {
      this.collide = true;
      bullet.reset();
      audio_explosion.play();
    }
  }

  loseCheck(attacker) {
    if (this.position.y >= attacker.position.y - this.size.height) {
      return true;
    }
  }

  draw(ctx) {
    ctx.drawImage(
      this.image,
      this.position.x,
      this.position.y,
      this.size.width,
      this.size.height
    );
  }
}

class EventHandler {
  constructor() {
    document.addEventListener("keydown", (event) => {
      if (!gameState.gameStarted) {
        gameLoop();
        gameState.gameStarted = true;
      } else {
        switch (event.code) {
          case "ArrowLeft":
            attacker.moveLeft();
            break;

          case "ArrowRight":
            attacker.moveRight();
            break;

          case "Space":
            if (!bullet.fired) {
              audio_laser.play();
            }
            bullet.fired = true;
            break;

          case "Enter":
            if (gameState.gameStarted && !gameState.gameOver) {
              if (!gameState.gamePaused) {
                gameState.gamePaused = true;
                console.log("gamePaused");
                console.log(gameState);
              } else {
                gameState.gamePaused = false;
                console.log("gamecontinued");
                console.log(gameState);
                gameLoop();
              }
            }
            break;

          case "Escape":
            if (gameState.gameOver) {
              console.log("gameRestart");
              console.log(gameState);
              gameReset();
              gameLoop();
              console.log("restarted");
            }

            break;
        }
      }
    });
    document.addEventListener("keyup", (event) => {
      switch (event.keyCode) {
        case 37:
          if (attacker.speed < 0) attacker.stop();
          break;

        case 39:
          if (attacker.speed > 0) attacker.stop();
          break;
      }
    });
  }
}

function collision(bullet) {
  if (bullet.position.y < 0) {
    return true;
  }
}

function enemies(enemyCounts) {
  let invaders = [];
  enemyCounts.forEach((row, rowIndex) => {
    row.forEach((enemy, enemyIndex) => {
      if (enemy == 1) {
        let position = {
          x: 30 + enemyIndex * 43,
          y: 30 + rowIndex * 37,
        };
        let invader = new Invader(position);
        invaders.push(invader);
      }
    });
  });
  return invaders;
}

function collisionWall(invaders) {
  let invadersCopy = invaders;
  invadersCopy.forEach((object) => {
    if (object.position.x > 380 || object.position.x < 0) {
      invaders.forEach((object) => {
        object.position.x -= object.speed;
        object.speed *= -1;
        object.position.y += 4;
      });
      return invaders;
    }
  });
  return invaders;
}

function collisionHit(bullet, invader) {
  let bottomOfBullet = bullet.position.y + bullet.size.height;
  let topOfBullet = bullet.position.y;
  let rightOfBullet = bullet.position.x + bullet.size.width;
  let leftOfBullet = bullet.position.x;

  let bottomOfInvader = invader.position.y + invader.size.height;
  let topOfInvader = invader.position.y;
  let rightOfInvader = invader.position.x + invader.size.width;
  let leftOfInvader = invader.position.x;

  if (
    topOfBullet <= bottomOfInvader &&
    bottomOfBullet >= topOfInvader &&
    leftOfBullet <= rightOfInvader &&
    rightOfBullet >= leftOfInvader
  ) {
    return true;
  } else {
    return false;
  }
}

function gameLoop() {
  ctx.clearRect(0, 0, 400, 400);
  attacker.draw(ctx);
  bullet.draw(ctx);
  attacker.update();
  bullet.update(attacker.position.x);

  if (collision(bullet) == true) {
    bullet.reset();
  }

  let invader = collisionWall(invaders);
  invader = invader.filter((object) => !object.collide);

  if (invader.length == 0) {
    gameState.gameOver = true;
    ctx.fillStyle = "white";
    ctx.fillText("You Won The Game!", 100, 170);
    ctx.fillText("Press ESC Keys To Play Again", 100, 200);
    return;
  } else {
    Array.prototype.forEach.call(invader, (object) => {
      object.draw(ctx);
      object.update();
      if (object.loseCheck(attacker)) {
        gameOver();
        return;
      }
    });
  }

  if (gameState.gameOver == true) {
    return;
  }

  if (gameState.gamePaused) {
    ctx.clearRect(0, 0, 400, 400);
    ctx.fillStyle = "white";
    ctx.font = "15px Arial";
    ctx.fillText("Press Enter To Continue The Game", 100, 200);
    ctx.font = "30px Arial";
    ctx.fillText("Paused", 100, 170);
    return;
  }
  requestAnimationFrame(gameLoop);
}

function gameOver() {
  gameState.gameOver = true;
  ctx.clearRect(0, 0, 400, 400);
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Game Over", 100, 160);
  ctx.font = "15px Arial";
  ctx.fillText("Press The ESC Key To Play Again", 100, 200);
}

function gameReset() {
  enemyCounts = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ];
  invaders = enemies(enemyCounts);
  attacker = new Attacker();
  bullet = new Bullet(attacker);
  gameState = {
    gameStarted: true,
    gameOver: false,
    gamePaused: false,
  };
}

let audio_laser = new Audio("assests/sounds/laser_sound.mp3");
let audio_explosion = new Audio("assests/sounds/explosion_sound.mp3");
let enemyCounts = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
];
let invaders = enemies(enemyCounts);
let attacker = new Attacker();
let bullet = new Bullet(attacker);
let handler = new EventHandler();

let gameState = {
  gameStarted: false,
  gameOver: false,
  gamePaused: false,
};

ctx.fillStyle = "white";
ctx.font = "15px Arial";
ctx.fillText("Press Any Keys To Start The Game", 70, 170);
ctx.fillText("Press Enter To Pause/Continue The Game", 70, 200);

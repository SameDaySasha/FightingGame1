const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;
c.fillRect(0, 0, canvas.width, canvas.height);
const gravity = 0.7;

const background = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  imageSrc: "./img/background.png",
});

const shop = new Sprite({
  position: {
    x: 600,
    y: 129,
  },
  imageSrc: "./img/shop.png",
  scale: 2.75,
  framesMax: 6,
});

const player = new Fighter({
  position: {
    x: 0,
    y: 0,
  },

  velocity: {
    x: 0,
    y: 0,
  },
  imageSrc: "./img/samuraiMack/Idle.png",
  framesMax: 8,
  scale: 2.2,
  offset: { x: 190, y: 120 },
  sprites: {
    idle: {
      imageSrc: "./img/samuraiMack/Idle.png",
      framesMax: 8,
    },
    attack1: {
      imageSrc: "./img/samuraiMack/Attack1.png",
      framesMax: 6,
    },
    run: {
      imageSrc: "./img/samuraiMack/Run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./img/samuraiMack/Jump.png",
      framesMax: 2,
    },
    fall: { imageSrc: "./img/samuraiMack/Fall.png", framesMax: 2 },
    takeHit: {
      imageSrc: "./img/samuraiMack/Take Hit - white silhouette.png", // Replace with the correct file path
      framesMax: 4, // Adjust the framesMax value as needed
    },
    
    death: {
      imageSrc: "./img/samuraiMack/Death.png",
      framesMax: 6,
    },
  },
  attackBox: {
    offset: { x: -45, y: 0 },
    width: 100,
    height: 50,
  },
});

const enemy = new Fighter({
  hasAttacked: false,
  position: {
    x: 800,
    y: 100,
  },

  velocity: {
    x: 0,
    y: 0,
  },
  color: "blue",
  offset: { x: 0, y: 0 },
  imageSrc: "./img/kenji/Idle.png",
  framesMax: 4,
  scale: 2.2,
  offset: { x: 74, y: 130 },
  sprites: {
    idle: {
      imageSrc: "./img/kenji/Idle.png",
      framesMax: 4,
    },
    attack1: {
      imageSrc: "./img/kenji/Attack1.png",
      framesMax: 4,
    },
    run: {
      imageSrc: "./img/kenji/Run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./img/kenji/Jump.png",
      framesMax: 2,
    },
    fall: { imageSrc: "./img/kenji/Fall.png", framesMax: 2 },

    takeHit: {
      imageSrc: "./img/kenji/Take hit.png",
      framesMax: 3,
    },
    death: {
      imageSrc: "./img/kenji/Death.png",
      framesMax: 7,
    },
    
  },
  attackBox: {
    offset: { x: 0, y: 0 },
    width: 100,
    height: 50,
  },
});

console.log(player);
const keys = {
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
  w: {
    pressed: false,
  },
  ArrowRight: {
    pressed: false,
  },
  ArrowLeft: {
    pressed: false,
  },
  ArrowUp: {
    pressed: false,
  },
};
let lastKey;

decreaseTimer();

function getDistance(x1, y1, x2, y2) {
  let xDistance = x2 - x1;
  let yDistance = y2 - y1;
  return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

// Simple AI for enemy
function enemyAI() {
    if (enemy.dead || player.dead) {
        return; // Stops AI actions if either character is dead
    }
  const distance = getDistance(player.position.x, player.position.y, enemy.position.x, enemy.position.y);

  // Current time in milliseconds
  if (distance < 130 && !enemy.hasAttacked) {
    enemy.attack();
    enemy.hasAttacked = true;

    // Reset hasAttacked back to false after 1000ms cooldown
    setTimeout(() => {
      enemy.hasAttacked = false;
    }, 1000);
  }
  
  // Basic movement towards or away from the player
  if (player.position.x < enemy.position.x - 100) {
    enemy.velocity.x = -5; // Move left
    enemy.switchSprite("run");
  } else if (player.position.x > enemy.position.x + 100) {
    enemy.velocity.x = 5; // Move right
    enemy.switchSprite("run");
  } else {
    enemy.velocity.x = 0; // Stop moving
    enemy.switchSprite("idle");
  }

  // Simple jumping logic
  if (distance < 100 && Math.random() < 0.1) {
    enemy.velocity.y = -10; // Jump
  }
}


function animate() {
  window.requestAnimationFrame(animate);
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);
  background.update();
  shop.update();
  player.update();
  enemy.update();
  player.velocity.x = 0;
  // enemy.velocity.x = 0;
  enemyAI();
  // movement keys

  if (keys.a.pressed && player.lastKey === "a") {
    player.velocity.x = -5;
    player.switchSprite("run");
  } else if (keys.d.pressed && player.lastKey === "d") {
    player.velocity.x = 5;
    player.switchSprite("run");
  } else {
    player.switchSprite("idle");
  }
  // jumping

  if (player.velocity.y < 0) {
    player.switchSprite("jump");
  } else if (player.velocity.y > 0) {
    player.switchSprite("fall");
  }
  // enemy keys
  if (keys.ArrowLeft.pressed && enemy.lastKey === "ArrowLeft") {
    enemy.velocity.x = -5;
    enemy.switchSprite("run");
  } else if (keys.ArrowRight.pressed && enemy.lastKey === "ArrowRight") {
    enemy.velocity.x = 5;
    enemy.switchSprite("run");
  } else {
    enemy.switchSprite("idle");
  }
  if (enemy.velocity.y < 0) {
    enemy.switchSprite("jump");
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite("fall");
  }

  // hitDetector
  if (
    rectangularCollision({
      rectangle1: player,
      rectangle2: enemy,
    }) &&
    player.isAttacking &&
    player.framesCurrent === 4
  ) {
    enemy.takeHit();
    player.isAttacking = false;
    gsap.to("#enemyHealth",{
      width: enemy.health + "%",
      duration: 0.5
    })
  }

  // if player misses
  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false;
  }

  //enemy hitDetector
  if (
    rectangularCollision({
      rectangle1: enemy,
      rectangle2: player,
    }) &&
    enemy.isAttacking &&
    enemy.framesCurrent === 2
  ) {
    player.takeHit();
    player.isAttacking = false;
    gsap.to("#playerHealth",{
      width: player.health + "%",
      duration: 0.5
    })
  }
  // end game based on health
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId });
  }
  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false;
  }
}

animate();

window.addEventListener("keydown", (event) => {
  if(!player.dead){
    switch (event.key) {
    case "d":
      keys.d.pressed = true;
      player.lastKey = "d";
      break;
    case "a":
      keys.a.pressed = true;
      player.lastKey = "a";
      break;
    case "w":
      player.velocity.y = -20;
      break;
    case " ":
      player.attack();
      break;
}
 }
  if (!enemy.dead){
    switch(event.key){
     // enemy keys
     case "ArrowRight":
      keys.ArrowRight.pressed = true;
      enemy.lastKey = "ArrowRight";
      break;
    case "ArrowLeft":
      keys.ArrowLeft.pressed = true;
      enemy.lastKey = "ArrowLeft";
      break;
    case "ArrowUp":
      enemy.velocity.y = -20;
      break;
    case "ArrowDown":
      enemy.attack();
      break;
  }
 
  }
  console.log(event.key);
});

window.addEventListener("keyup", (event) => {
  console.log(event.key);
  switch (event.key) {
    case "d":
      keys.d.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
    case "w":
      keys.w.pressed = false;
      lastKey = "w";
      break;
    // enemy keys

    case "ArrowRight":
      keys.ArrowRight.pressed = false;

      break;
    case "ArrowLeft":
      keys.ArrowLeft.pressed = false;

      break;
    case "ArrowUp":
      enemy.lastKey = "ArrowUp";
      break;
  }
});

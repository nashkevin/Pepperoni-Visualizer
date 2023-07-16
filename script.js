/** @type {HTMLInputElement} */
const pizzaSize = document.getElementById("pizza-size");
/** @type {HTMLInputElement} */
const pepperoniCount = document.getElementById("pepperoni-count");
/** @type {HTMLInputElement} */
const pepperoniSize = document.getElementById("pepperoni-size");

const visualizer = document.getElementById("visualizer");

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const TAU = 2 * Math.PI;

var originX;
var originY;
var pizzaOuterRadius;
var pizzaInnerRadius;
var pepperoniRadius;
var ringCount;

window.onresize = resizeWindow;

function drawPizza() {
  pizzaOuterRadius = canvas.width * pizzaSize.valueAsNumber;
  pizzaInnerRadius = pizzaOuterRadius * 0.9;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.arc(originX, originY, pizzaOuterRadius, 0, TAU);
  ctx.fillStyle = "#DA7E1F";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(originX, originY, pizzaInnerRadius, 0, TAU);
  ctx.fillStyle = "#FCBD50";
  ctx.fill();

  drawAllPepperoni();
}

function drawAllPepperoni() {
  pepperoniRadius = canvas.width * 0.2 * pepperoniSize.valueAsNumber;
  ringCount = Math.trunc(pizzaInnerRadius / (pepperoniRadius * 2));
  let theta = TAU / pepperoniCount.valueAsNumber;

  if (pepperoniCount.valueAsNumber == 1)  {
    drawPepperoni(0, 0);
  }
  else
  {
    let test = pizzaInnerRadius / ringCount;
    let ringCounter = 1;
    for (let i = 0; i < pepperoniCount.valueAsNumber; i++) {
      let r = test * ringCounter++;
      let x = r * Math.cos(theta * i);
      let y = r * Math.sin(theta * i);
      drawPepperoni(x, y);
      // drawDebugDot(x, y);
      if (ringCount < ringCounter)
      {
        ringCounter = 1;
      }
    }
  }
}

function drawDebugDot(x, y) {
  ctx.fillStyle = "green";
  ctx.fillRect(originX + x, originY + y, 2, 2);
}

function drawPepperoni(x, y) {
  ctx.beginPath();
  ctx.arc(originX + x, originY + y, pepperoniRadius, 0, TAU);
  ctx.fillStyle = "red";
  ctx.fill();
}

function resizeWindow() {
  canvas.height = 0;
  canvas.width = 0;
  canvas.height = visualizer.clientHeight;
  canvas.width = visualizer.clientWidth;
  
  originX = canvas.width * 0.5;
  originY = canvas.height * 0.5;

  drawPizza();
}

resizeWindow();

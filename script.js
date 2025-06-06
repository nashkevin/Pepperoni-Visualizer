/** @type {HTMLInputElement} */
const debugValue1 = document.getElementById("debug-value-1");
/** @type {HTMLInputElement} */
const debugValue2 = document.getElementById("debug-value-2");
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

function pizzaSizeInput() {
  updateDependentVars()
  if (pizzaInnerRadius < pepperoniRadius)
  {
    pepperoniSize.value = pizzaInnerRadius / (0.2 * canvas.width);
  }
  drawPizza();
}

function pepperoniCountInput() {
  drawPizza();
}

function pepperoniSizeInput() {
  updateDependentVars()
  if (pizzaInnerRadius < pepperoniRadius)
  {
    pizzaSize.value = pepperoniRadius / (0.9 * canvas.width);
  }
  drawPizza();
}

function updateDependentVars() {
  pizzaOuterRadius = canvas.width * pizzaSize.valueAsNumber;
  pizzaInnerRadius = pizzaOuterRadius * 0.9;
  pepperoniRadius = canvas.width * 0.2 * pepperoniSize.valueAsNumber;
}

function drawPizza() {
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
  calculate();
}

function drawAllPepperoni() {
  ringCount = Math.trunc(pizzaInnerRadius / (pepperoniRadius * 2));
  let theta = TAU / pepperoniCount.valueAsNumber;

  if (0 < pepperoniCount.valueAsNumber)
  {
    drawPepperoni(0, 0);

    let test = pizzaInnerRadius / ringCount;
    let ringCounter = 1;
    for (let i = 1; i < pepperoniCount.valueAsNumber; i++) {
      let r = test * ringCounter++ - pepperoniRadius;
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
  ctx.fillStyle = "#880D1A";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(originX + x, originY + y, pepperoniRadius * 0.9, 0, TAU);
  ctx.fillStyle = "#AF0D1A";
  ctx.fill();
}

function resizeWindow() {
  canvas.height = 0;
  canvas.width = 0;
  canvas.height = visualizer.clientHeight;
  canvas.width = visualizer.clientWidth;
  
  originX = canvas.width * 0.5;
  originY = canvas.height * 0.5;

  updateDependentVars();
  drawPizza();
}

function calculate() {
  let pizzaRadius = 10;
  let pepperoniRadius = 1;

  let radiusDifference = pizzaRadius - pepperoniRadius;

  let count1 = Math.floor((TAU * radiusDifference) / (2 * pepperoniRadius));
  let count2 = Math.floor(Math.PI * (pizzaRadius - pepperoniRadius) / pepperoniRadius);

  debugValue1.innerText = count1;
  debugValue2.innerText = count2;
}

resizeWindow();

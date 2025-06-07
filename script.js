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

const pizzaBaseColor     = "#FCBD50";
const pizzaCrustColor    = "#DA7E1F";
const pepperoniBaseColor = "#AF0D1A";
const pepperoniTrimColor = "#880D1A";

const TAU = 2 * Math.PI;

const getDistance = (x0, y0, x1, y1) => Math.hypot(x1 - x0, y1 - y0);

window.onresize = resizeWindow;

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}


var originX;
var originY;
var pizzaRadius; // excludes crust
var pepperoniRadius;
var ringCount;
var points = [];

function pizzaSizeInput() {
  updateDependentVars()
  if (pizzaRadius < pepperoniRadius)
  {
    pepperoniSize.value = pizzaRadius / (0.2 * canvas.width);
  }
  drawPizza();
}

function pepperoniCountInput() {
  drawPizza();
}

function pepperoniSizeInput() {
  updateDependentVars()
  if (pizzaRadius < pepperoniRadius)
  {
    pizzaSize.value = pepperoniRadius / (0.9 * canvas.width);
  }
  drawPizza();
}

function updateDependentVars() {
  pizzaRadius = canvas.width * pizzaSize.valueAsNumber * 0.9;
  pepperoniRadius = canvas.width * 0.2 * pepperoniSize.valueAsNumber;
}

function drawPizza() {
  points = [];

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  // realistic crust does not scale linearly
  // these parameters I arrived at are magic to me though
  ctx.arc(originX, originY, pizzaRadius + pizzaRadius * 0.2 * (1.5 - pizzaSize.value / pizzaSize.max), 0, TAU);
  ctx.fillStyle = pizzaCrustColor;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(originX, originY, pizzaRadius, 0, TAU);
  ctx.fillStyle = pizzaBaseColor;
  ctx.fill();

  //drawAllPepperoni();
  drawAllPepperoni2();
}

function drawAllPepperoni() {
  ringCount = Math.floor(pizzaRadius / (pepperoniRadius * 2));
  let theta = TAU / pepperoniCount.valueAsNumber;

  if (0 < pepperoniCount.valueAsNumber)
  {
    drawPepperoni(0, 0);

    let test = pizzaRadius / ringCount;
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

function drawAllPepperoni2() {
  populatePepperoni();
  let lastIndex = -1;
  //for (let i = Math.min(pepperoniCount.valueAsNumber, points.length) - 1; 0 <= i; i -= points.length / pepperoniCount.valueAsNumber) {
  for (let i = points.length - 1; 0 <= i; i -= points.length / pepperoniCount.valueAsNumber) {
    if (lastIndex != Math.floor(i)) {
      drawPepperoni(points[Math.floor(i)].x, points[Math.floor(i)].y);
    }
    lastIndex = Math.floor(i);
  }
}

function drawDebugDot(x, y) {
  ctx.fillStyle = "green";
  ctx.fillRect(originX + x, originY + y, 2, 2);
}

function drawPepperoni(x, y) {
  ctx.beginPath();
  ctx.arc(originX + x, originY + y, pepperoniRadius, 0, TAU);
  ctx.fillStyle = pepperoniTrimColor;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(originX + x, originY + y, pepperoniRadius * 0.9, 0, TAU);
  ctx.fillStyle = pepperoniBaseColor;
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

function populatePepperoni() {
  ringCount = pizzaRadius / (pepperoniRadius * 2);
  let interRingSpacing = ((pizzaRadius / ringCount) % 1) / (ringCount * 2);
  let finalRingRadius = 0;
  for (let ringRadius = pizzaRadius - (pepperoniRadius + interRingSpacing); pepperoniRadius < ringRadius; ringRadius -= (2 * pepperoniRadius + interRingSpacing)) {
    let countMax = (TAU * ringRadius) / (2 * pepperoniRadius);
    
    let theta = TAU / Math.floor(countMax);
    let intraRingSpacing = ((TAU / theta) % 1) / (theta * 2);
    for (let i = 0; i < countMax; i++) {
      let x = ringRadius * Math.sin((theta + intraRingSpacing) * i);
      let y = ringRadius * -Math.cos((theta + intraRingSpacing) * i);
      points.push(new Point(x, y));
    }
    finalRingRadius = ringRadius;
  }

  if (2 * pepperoniRadius < finalRingRadius) {
    points.push(new Point(0, 0));
  }
}

resizeWindow();

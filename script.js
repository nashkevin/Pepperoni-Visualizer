/** @type {HTMLInputElement} */
const pizzaSizeHtml = document.getElementById("pizza-size");
/** @type {HTMLInputElement} */
const pepperoniCountHtml = document.getElementById("pepperoni-count");
/** @type {HTMLInputElement} */
const pepperoniSizeHtml = document.getElementById("pepperoni-size");

const visualizerHtml = document.getElementById("visualizer");

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

class PointCartesian {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class PointPolar {
  constructor(r, t) {
    this.r = r;
    this.t = t;
  }

  static getCartesian(r, t) {
    return new PointCartesian(r * Math.sin(t), -r * Math.cos(t));
  }
}

class Ring {
  radius = 0;
  count = 0;
  capacity = 0;
  quota = 0;

  constructor(radius) {
    this.radius = radius;
  }

  getPoints(isOffset) {
    !!isOffset;
    let points = [];
    let theta = TAU / Math.floor(this.quota);
    for (let i = isOffset ? 0.5 : 0; i < this.quota; i++) {
      points.push(PointPolar.getCartesian(this.radius, (theta * i)));
    }
    return points;
  }
}

const minRadii = [
  1, // 0
  1, // 1
  2, // 2
  1 + 2 / Math.sqrt(3), // 3
  1 + Math.sqrt(2), // 4
  1 + Math.sqrt(2 * (1 + 1/Math.sqrt(5))), // 5
  3, // 6
  3, // 7
  1 + 1 / Math.sin(Math.PI / 7), // 8
  1 + Math.sqrt(2 * (2 + Math.sqrt(2))), // 9
];

var originX;
var originY;
var pizzaRadius; // excludes crust
var pepperoniRadius;
var pepperoniCount;
var points = [];

function pizzaSizeInput() {
  updateDependentVars()
  if (pizzaRadius < pepperoniRadius)
  {
    pepperoniSizeHtml.value = pizzaRadius / (0.2 * canvas.width);
  }
  drawPizza();
}

function pepperoniCountInput() {
  pepperoniCount = pepperoniCountHtml.valueAsNumber;
  drawPizza();
}

function pepperoniSizeInput() {
  updateDependentVars()
  if (pizzaRadius < pepperoniRadius)
  {
    pizzaSizeHtml.value = pepperoniRadius / (0.9 * canvas.width);
  }
  drawPizza();
}

function updateDependentVars() {
  pizzaRadius = canvas.width * pizzaSizeHtml.valueAsNumber * 0.9;
  pepperoniRadius = canvas.width * 0.2 * pepperoniSizeHtml.valueAsNumber;
  pepperoniCount = pepperoniCountHtml.valueAsNumber;
}

function drawPizza() {
  points = [];

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  // realistic crust does not scale linearly
  // these parameters I arrived at are magic to me though
  ctx.arc(originX, originY, pizzaRadius + pizzaRadius * 0.2 * (1.5 - pizzaSizeHtml.value / pizzaSizeHtml.max), 0, TAU);
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
  let theta = TAU / pepperoniCount;

  if (0 < pepperoniCount)
  {
    drawPepperoni(0, 0);

    let test = pizzaRadius / ringCount;
    let ringCounter = 1;
    for (let i = 1; i < pepperoniCount; i++) {
      let r = test * ringCounter++ - pepperoniRadius;
      let x = r * Math.cos(theta * i);
      let y = r * Math.sin(theta * i);
      drawPepperoni(x, y);
      drawDebugDot(x, y);
      if (ringCount < ringCounter)
      {
        ringCounter = 1;
      }
    }
  }
}

function drawAllPepperoni2() {
  fillPepperoni();
  let lastIndex = -1;
  //for (let i = Math.min(pepperoniCount.valueAsNumber, points.length) - 1; 0 <= i; i -= points.length / pepperoniCount.valueAsNumber) {
  //for (let i = points.length - 1; 0 <= i; i -= points.length / pepperoniCount.valueAsNumber) {
  for (let i = points.length - 1; 0 <= i; i--) {
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
  canvas.height = visualizerHtml.clientHeight;
  canvas.width = visualizerHtml.clientWidth;
  
  originX = canvas.width * 0.5;
  originY = canvas.height * 0.5;

  updateDependentVars();
  drawPizza();
}

function populatePepperoni() {
  //let ringCount = pizzaRadius / (pepperoniRadius * 2);
  //let interRingSpacing = ((pizzaRadius / ringCount) % 1) / (ringCount * 2);
  let finalRingRadius = 0;
  let tester = 0;
  console.clear();
  let prevTheta = 0;
  //for (let ringRadius = pizzaRadius - (pepperoniRadius + interRingSpacing); pepperoniRadius < ringRadius; ringRadius -= (2 * pepperoniRadius + interRingSpacing)) {
  for (let ringRadius = pizzaRadius - pepperoniRadius; pepperoniRadius < ringRadius; ringRadius -= (2 * pepperoniRadius)) {
    let countMax = (TAU * ringRadius) / (2 * pepperoniRadius);
    // if (getDistance(0, ringRadius, ringRadius * Math.cos(TAU / countMax), ringRadius * Math.sin(TAU / countMax)) < 2 * pepperoniRadius) {
    //   countMax--;
    // }
    let theta = TAU / Math.floor(countMax);
    //let intraRingSpacing = ((TAU / theta) % 1) / (theta * 2);
    for (let i = 0; i < countMax; i++) {
      //let x = ringRadius * Math.sin((theta + intraRingSpacing) * i + prevTheta);
      let x = ringRadius * Math.sin(theta * i);
      //let y = ringRadius * Math.cos((theta + intraRingSpacing) * i + prevTheta);
      let y = ringRadius * Math.cos(theta * i);
      points.push(new PointCartesian(x, y));
      tester++;
    }
    console.log("Count in ring: " + tester);
    tester = 0;
    finalRingRadius = ringRadius;
    prevTheta = theta;
  }

  // if (2 * pepperoniRadius < finalRingRadius) {
  //   points.push(new Point(0, 0));
  // }
}

function populatePepperoni2() {
  let radiusRatio = pizzaRadius / pepperoniRadius;
  let n = Math.min(pepperoniCount, minRadii.length - 1);
  let r = (minRadii[n] * pepperoniRadius) - pepperoniRadius;

  if (minRadii[n] <= radiusRatio * 1.01 /*fudge*/) {
    for (let i = 0; i < n; i++) {
      if (i == 0 && 7 <= n) {
        points.push(new PointCartesian(0, 0));
        n--;
      }
      let theta = TAU / n;
      let x = r * Math.cos(theta * i);
      let y = r * Math.sin(theta * i);
      points.push(new PointCartesian(x, y));
    }
  }
}

function fillPepperoni() {
  if (pepperoniCount == 1) {
    points.push(new PointCartesian(0, 0));
    return;
  }

  let rings = [];

  // define rings from outer edge inward
  for (let ringRadius = pizzaRadius - pepperoniRadius; pepperoniRadius <= ringRadius; ringRadius -= (2 * pepperoniRadius)) {
    const ring = new Ring(ringRadius);
    // approximate capacity by pepperoni diameters per ring circumference
    ring.capacity = Math.floor((TAU * ringRadius) / (2 * pepperoniRadius));

    // let theta = TAU / Math.floor(countMax);
    // for (let i = 0; i < ring.capacity; i++) {
    //   points.push(new PointPolar(ring.radius, theta * i));
    //   ring.count++;
    // }

    rings.push(ring);
  }

  // remove any extra points, FIFO
  // points.reverse();
  // let excess = points.length - pepperoniCount;
  // let ringIndex = -1;
  // let previousRadius = pizzaRadius;
  // for (let i = 0; i < excess; i++) {
  //   const point = points.pop();
  //   if (point.r * 1.001 < previousRadius) {
  //     ringIndex++;
  //     previousRadius = point.r;
  //   }
  //   rings[ringIndex].count--;
  // }
  
  let capacityOfRingsInUse = 0;
  let countOfRingsInUse = 0;
  let unassignedPepperoniCount = pepperoniCount;
  for (let i = rings.length - 1; 0 <= i; i--) {
    if (unassignedPepperoniCount < 1) {
      rings.splice(0, i + 1);
      break;
    }
    capacityOfRingsInUse += rings[i].capacity;
    rings[i].count += Math.min(unassignedPepperoniCount, rings[i].capacity);
    unassignedPepperoniCount -= rings[i].count;
    countOfRingsInUse += rings[i].count;
  }

  // radially distribute rings
  if (0 < rings.length && 0 < rings[0].radius) {
    let outwardScale = (pizzaRadius - pepperoniRadius) / rings[0].radius;
    for (let i = 0; i < rings.length; i++) {
      rings[i].radius *= outwardScale;
    }
  }

  for (let i = 0; i < rings.length; i++) {
    // TODO - this will be off by one for even splits (e.g. 7.5 + 4.5 != 8 + 5)
    rings[i].quota = Math.round(rings[i].capacity / capacityOfRingsInUse * countOfRingsInUse);
    points = points.concat(rings[i].getPoints(i % 2));
  }
}

resizeWindow();

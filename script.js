/** @type {HTMLInputElement} */
const pizzaSizeHtml = document.getElementById("pizza-size");
/** @type {HTMLInputElement} */
const pepperoniCountHtml = document.getElementById("pepperoni-count");
/** @type {HTMLInputElement} */
const pepperoniCountBoxHtml = document.getElementById("pepperoni-count-box");
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

window.onresize = resizeWindow;

class PointCartesian {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  getPolar() {
    return new PointPolar(Math.hypot(this.x, this.y), Math.atan(this.y / this.x));
  }
}

class PointPolar {
  constructor(r, t) {
    this.r = r;
    this.t = t;
  }

  getCartesian() {
    return new PointCartesian(this.r * Math.sin(this.t), this.r * -Math.cos(this.t));
  }
}

class Ring {
  radius = -1;
  count = -1;
  capacity = -1;
  quota = -1;

  constructor(radius) {
    this.radius = radius;
  }

  getPointsByCapacity(isOffset) {
    return this.#getPoints(this.capacity, !!isOffset);
  }

  getPointsByCount(isOffset) {
    return this.#getPoints(this.count, !!isOffset);
  }

  getPointsByQuota(isOffset) {
    return this.#getPoints(this.quota, !!isOffset);
  }

  // toggling offset prevents stacking in a straight line
  #getPoints(workingCount, isOffset) {
    let points = [];
    
    if (workingCount < 1) {
      return [];
    }
    if (workingCount == 1) {
      return [new PointCartesian(0, 0)];
    }

    let theta = TAU / Math.floor(workingCount);
    for (let i = isOffset ? 0.5 : 0; i < workingCount; i++) {
      points.push(new PointPolar(this.radius, (theta * i)).getCartesian());
    }
    return points;
  }
}

var originX;
var originY;
var pizzaRadius; // excludes crust
var pepperoniRadius;
var pepperoniCount;
var points = [];

function pizzaSizeInput() {
  updateDependentVars();
  if (pizzaRadius < pepperoniRadius) {
    pepperoniSizeHtml.value = pizzaRadius / (0.2 * canvas.width);
  }
  drawPizza();
  updateCountDisplay();
}

function pepperoniCountInput() {
  updateDependentVars();
  drawPizza();
  updateCountDisplay();
}

function pepperoniSizeInput() {
  updateDependentVars();
  if (pizzaRadius < pepperoniRadius) {
    pizzaSizeHtml.value = pepperoniRadius / (0.9 * canvas.width);
  }
  drawPizza();
  updateCountDisplay();
}

// TODO - this no longer handles most cases, revise clamping
function updateDependentVars() {
  pizzaRadius = canvas.width * pizzaSizeHtml.valueAsNumber * 0.9;
  pepperoniRadius = canvas.width * 0.2 * pepperoniSizeHtml.valueAsNumber;
  pepperoniCount = pepperoniCountHtml.valueAsNumber;
}

function updateCountDisplay() {
  // TODO - allowing off-by-one here is cheating, need to figure out source of discrepancy
  // if (2 < pepperoniCountHtml.valueAsNumber - points.length) {
  //   pepperoniCountBoxHtml.value = pepperoniCountHtml.valueAsNumber + " (" + points.length + ")";
  // } else {
  //   pepperoniCountBoxHtml.value = points.length;
  // }
  pepperoniCountBoxHtml.value = points.length;
  pepperoniCountHtml.value = points.length;
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
  ctx.arc(originX, originY, pizzaRadius * 1.02, 0, TAU); // slight visual buffer between crust and pepperoni
  ctx.fillStyle = pizzaBaseColor;
  ctx.fill();

  drawAllPepperoni();
}

function drawAllPepperoni() {
  let rings = fillPepperoni();
  for (let i = 0; i < points.length; i++) {
    drawPepperoni(points[i].x, points[i].y);    
  }
  /* DEBUG */
  // for (let i = 0; i < rings.length; i++) {
  //   rings[i];
  //   ctx.beginPath();
  //   ctx.arc(originX, originY, rings[i].radius, 0, TAU);
  //   ctx.strokeStyle = "magenta";
  //   ctx.lineWidth = 2;
  //   ctx.stroke();
  // }
  /* DEBUG */
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

function fillPepperoni() {
  let rings = [];

  // define rings from outer edge inward
  for (let ringRadius = pizzaRadius - pepperoniRadius; 0 < ringRadius; ringRadius -= (2 * pepperoniRadius)) {
    const ring = new Ring(ringRadius);
    // approximate capacity by pepperoni diameters per ring circumference
    ring.capacity = Math.floor((TAU * ringRadius) / (2 * pepperoniRadius));
    // verify capacity with an overlap check
    const testPoints = ring.getPointsByCapacity();
    if (2 <= ring.capacity && Math.hypot(testPoints[1].x - testPoints[0].x, testPoints[1].y - testPoints[0].y) < 2 * pepperoniRadius) {
      ring.capacity--;
    }
    if (0 < ring.capacity) {
      rings.push(ring);
    }    
  }
  
  let capacityOfRingsInUse = 0;
  let countOfRingsInUse = 0;
  let unassignedPepperoniCount = pepperoniCount;
  for (let i = rings.length - 1; 0 <= i; i--) {
    if (unassignedPepperoniCount < 1) {
      rings.splice(0, i + 1); // remove unused outer rings
      break;
    }
    capacityOfRingsInUse += rings[i].capacity;
    rings[i].count += Math.min(unassignedPepperoniCount, rings[i].capacity);
    unassignedPepperoniCount -= rings[i].count;
    countOfRingsInUse += rings[i].count;
  }

  // distribute radial space among rings
  if (0 < rings.length && 0 < rings[0].radius) {
    let outwardScale = (pizzaRadius - pepperoniRadius) / rings[0].radius;
    for (let i = 0; i < rings.length; i++) {
      rings[i].radius *= outwardScale;
    }
  }

  // redistribute counts to keep ring fill roughly even
  let remainders = 0;
  for (let i = 0; i < rings.length; i++) {
    // TODO - this will be off by one for even splits (e.g. 7.5 + 4.5 != 8 + 5)
    let quota = rings[i].capacity / capacityOfRingsInUse * countOfRingsInUse;
    remainders += quota % 1;
    rings[i].quota = Math.floor(quota);
    points = points.concat(rings[i].getPointsByQuota(i % 2));
  }
  if (pepperoniCount < points.length) {
    console.log("OFF BY ONE");
    for (let i = 0; i < rings.length; i++) {
      rings[i].getPointsByQuota(i % 2);
    }
  }

  /* DEBUG */
  return rings;
  /* DEBUG */
}

resizeWindow();

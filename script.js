/** @type {HTMLInputElement} */
const pizzaSizeHtml = document.getElementById("pizza-size");
/** @type {HTMLInputElement} */
const pizzaSizeBoxHtml = document.getElementById("pizza-size-box");
/** @type {HTMLInputElement} */
const pepperoniCountHtml = document.getElementById("pepperoni-count");
/** @type {HTMLInputElement} */
const pepperoniCountBoxHtml = document.getElementById("pepperoni-count-box");
/** @type {HTMLInputElement} */
const pepperoniSizeHtml = document.getElementById("pepperoni-size");
/** @type {HTMLInputElement} */
const pepperoniSizeBoxHtml = document.getElementById("pepperoni-size-box");

const visualizerHtml = document.getElementById("visualizer");

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

var isFunMode = false;
var isDebugMode = false;

const pizzaBaseColor  = "#FCBD50";
const pizzaCrustColor = "#DA7E1F";

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
  radius = 0;
  count = 0;
  capacity = 0;
  quota = 0;

  constructor(radius) {
    this.radius = radius;
  }

  getFill() {
    return this.quota / this.capacity;
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
var preferredPepperoniCount;
var points = [];
/**
 * allows colors to be assigned in the same order,
 * which gives a better sense of continuity than random
 */
var pepperoniColors = [];

function init() {
  preferredPepperoniCount = pepperoniCountHtml.valueAsNumber;
  populateColors();
  resizeWindow();
}


function pizzaSizeInput() {
  updateDependentVars();
  if (pizzaRadius < pepperoniRadius) {
    pepperoniSizeHtml.value = pizzaRadius / (0.2 * canvas.width);
  }
  drawPizza();
  updateCountDisplay();
}

// special handler for clicks because the slider cap can
// potentially mask user intent
function pepperoniCountClick() {
  preferredPepperoniCount = pepperoniCountHtml.valueAsNumber;
}

function pepperoniCountInput() {
  preferredPepperoniCount = pepperoniCountHtml.valueAsNumber;
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

function toggleFunMode() {
  isFunMode = !isFunMode;
  populateColors();
  drawPizza();
}

function populateColors() {
  pepperoniColors.length = 0;
  for (let i = 0; i < pepperoniCountHtml.max; i++) {
    pepperoniColors.push(isFunMode ? getRandomColorPair() : getPepperoniColorPair());
  }
}


// TODO - normalize units and clarify formulae, adjust to have max count be a round number
function updateDependentVars() {
  pizzaRadius = canvas.width * pizzaSizeHtml.valueAsNumber * 0.9;
  pizzaSizeBoxHtml.value = Math.round(pizzaSizeHtml.valueAsNumber * 40 * 10) / 10;
  pepperoniRadius = canvas.width * 0.2 * pepperoniSizeHtml.valueAsNumber;
  pepperoniSizeBoxHtml.value = Math.round(pepperoniSizeHtml.valueAsNumber * 40 * 0.2 * 10) / 10;
  pepperoniCount = preferredPepperoniCount;
}

function updateCountDisplay() {
  pepperoniCountBoxHtml.value = points.length;
  pepperoniCountHtml.value = points.length;
}

function updateCount(n) {
  pepperoniCount = n;
  pepperoniCountBoxHtml.value = n;
  pepperoniCountHtml.value = n;
}

function drawPizza() {
  points = [];
  // realistic crust does not scale linearly
  // these parameters I arrived at are magic to me though
  let crustRadius = pizzaRadius + pizzaRadius * 0.2 * (1.5 - pizzaSizeHtml.value / pizzaSizeHtml.max);
  // slight visual buffer between crust and pepperoni
  let baseRadius = pizzaRadius * 1.02;

  if (isFunMode) {
    ctx.filter = "saturate(150%)"
  } else {
    ctx.filter = "saturate(100%)";
    ctx.filter = "";
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.globalAlpha = 0.2;
  ctx.beginPath();
  ctx.arc(originX * 1.04, originY * 1.04, crustRadius, 0, TAU);
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.globalAlpha = 1.0;

  ctx.beginPath();
  ctx.arc(originX, originY, crustRadius, 0, TAU);
  ctx.fillStyle = isFunMode ? " #B0B0B0" : pizzaCrustColor; // maybe pastel pink + cream instead of grays...
  ctx.fill();

  ctx.beginPath();
  ctx.arc(originX, originY, baseRadius, 0, TAU);
  ctx.fillStyle = isFunMode ? " #DCDCDC" : pizzaBaseColor;
  ctx.fill();

  drawAllPepperoni();
}

function drawAllPepperoni() {
  let rings = fillPepperoni();
  for (let i = 0; i < points.length; i++) {
    drawPepperoni(points[i].x, points[i].y, i);
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

function drawPepperoni(x, y, i) {
  ctx.beginPath();
  ctx.arc(originX + x, originY + y, pepperoniRadius, 0, TAU);
  ctx.fillStyle = pepperoniColors[i].dark;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(originX + x, originY + y, pepperoniRadius * 0.9, 0, TAU);
  ctx.fillStyle = pepperoniColors[i].light;
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

  // TODO - necessary for slider reducing pizza size, still... needs double checking
  updateCount(pepperoniCount - unassignedPepperoniCount);

  // distribute radial space among rings
  if (0 < rings.length && 0 < rings[0].radius) {
    let outwardScale = (pizzaRadius - pepperoniRadius) / rings[0].radius;
    for (let i = 0; i < rings.length; i++) {
      rings[i].radius *= outwardScale;
    }
  }

  // redistribute pepperoni to keep ring fill roughly even
  let remainderSum = 0;
  for (let i = 0; i < rings.length; i++) {
    let quota = rings[i].capacity / capacityOfRingsInUse * countOfRingsInUse;
    remainderSum += quota % 1;
    rings[i].quota = Math.floor(quota);
  }
  // redistribute remainder to least-filled rings
  while (0 < Math.round(remainderSum)) { // always a whole number, rounding needed to correct float errors
    let minFillIndex = 0;
    for (let i = 0; i < rings.length; i++) {
      if (rings[i].getFill() < rings[minFillIndex].getFill()) {
        minFillIndex = i;
      }
    }
    rings[minFillIndex].quota++;
    remainderSum--;
  }
  for (let i = 0; i < rings.length; i++) {
    let newPoints = rings[i].getPointsByQuota(i % 2);
    rings[i].count = newPoints.length;
    points = points.concat(newPoints);
  }

  // we're barricaded against no-pepperoni-fit scenarios,
  // so if we didn't generate any, it's a failing of the algorithm (TODO)
  if (points.length < 1) {
    pepperoniCount = 1;
    points.push(new PointCartesian(0, 0));
  }

  /* DEBUG */
  return rings;
  /* DEBUG */
}

function getPepperoniColorPair() {
  const red = { max: 200, min: 155, };
  const green = { max: 50, min: 10, };
  const blue = { max: 40, min: 0, };
  
  let rgb = [
    Math.floor(Math.random() * (red.max - red.min)) + red.min,
    Math.floor(Math.random() * (green.max - green.min)) + green.min,
    Math.floor(Math.random() * (blue.max - blue.min)) + blue.min,
  ];

  return {
    light: rgbToHex(rgb),
    dark: rgbToHex(darkenRgb(rgb)),
  };
}

function getRandomColorPair() {
  const minValueLimit = 64;  // inclusive
  const maxValueLimit = 256; // exclusive
  const targetSaturation = 0.4;

  let rgb = [];
  let minValue = 0;
  let maxValue = 0;
  do {
    rgb.length = 0;
    for (let i = 0; i < 3; i++) {
      rgb.push(Math.floor(Math.random() * (maxValueLimit - minValueLimit)) + minValueLimit);
    }
    minValue = Math.min(...rgb);
    maxValue = Math.max(...rgb);
  } while ((maxValue - minValue) / maxValue < targetSaturation); // TODO - generate needed saturation instead of bogosorting
  
  return {
    light: rgbToHex(rgb),
    dark: rgbToHex(darkenRgb(rgb)),
  }
}

function rgbToHex(rgb) {
  let hex = "#";
  rgb.forEach(component => {
    if (component < 16) {
      hex += "0";
    }
    hex += Math.floor(component).toString(16);
  });
  return hex;
}

function darkenRgb(rgb) {
  let darkRgb = [];
  rgb.forEach(component => {
    darkRgb.push(Math.floor(component * 0.75));
  });
  return darkRgb;
}

/** @type {HTMLInputElement} */
const pizzaSize = document.getElementById("pizza-size");

const visualizer = document.getElementById("visualizer");

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

window.onresize = resizeWindow;

function drawPizza() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  var originX = canvas.width * 0.5;
  var originY = canvas.height * 0.5;

  ctx.beginPath();
  ctx.arc(originX, originY, canvas.width * pizzaSize.valueAsNumber, 0, 2 * Math.PI);
  ctx.fillStyle = "#DA7E1F";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(originX, originY, canvas.width * pizzaSize.valueAsNumber * 0.9, 0, 2 * Math.PI);
  ctx.fillStyle = "#FCBD50";
  ctx.fill();

  drawPepperoni();
}

function drawPepperoni() {
  // TODO
}

function resizeWindow() {
  canvas.height = 0;
  canvas.width = 0;
  canvas.height = visualizer.clientHeight;
  canvas.width = visualizer.clientWidth;
  drawPizza();
}

resizeWindow();

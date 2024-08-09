import {
  graficoDeUnaVariable,
  graficoDosVariables,
  graficoTresVariables,
  graficoUnaVariable,
} from "./auxiliaries/charts.js";
import {
  deDiscretoAContinuo,
  derivada,
  dividirEnGroups,
  dividirPorMarcador,
  filtrarRepetidosMarcadores,
  filtrarRepetidosMarcadoresJump,
  getIntervalRealArray,
  getSecondsIntervalRealArray,
  gota,
  obtenerAngulos,
  // savitzkyGolay,
  obtenerTiempoEIntervaloReal,
} from "./auxiliaries/functions.js";

var array = JSON.parse(localStorage.getItem("jump_array"));
var fps = JSON.parse(localStorage.getItem("fps"));

const frames = document.getElementById("frames");
frames.textContent = fps.toFixed(2);

let duration = array[array.length - 1].milliseconds - array[0].milliseconds;

const spanDuration = document.getElementById("span-duration");
spanDuration.textContent = duration / 1000;

let videoWidth = JSON.parse(localStorage.getItem("videoWidth"));
const spanVideoWidth = document.getElementById("video-width");
spanVideoWidth.textContent = videoWidth;

let videoHeight = JSON.parse(localStorage.getItem("videoHeight"));
const spanVideoHeight = document.getElementById("video-height");
spanVideoHeight.textContent = videoHeight;

// dividimos en grupos

const groups = dividirEnGroups(array);

// crear arrays por marcador

const { alpha, beta, gamma, lambda, epsilon } = dividirPorMarcador(array);

// obtenemos los grupos corregidos, el intervalo real y el tiempo real

const { realTime, correctedInterval, correctedGroups } =
  obtenerTiempoEIntervaloReal(groups, duration);

const spanRealTime = document.getElementById("span-real-duration");
spanRealTime.textContent = realTime.toFixed(2);

const spanInterval = document.getElementById("interval");
spanInterval.textContent = correctedInterval.toFixed(4);

// aliminamos los repetidos de alpha ...

const { newAlpha, newBeta, newGamma, newLambda, newEpsilon } =
  filtrarRepetidosMarcadoresJump(
    alpha,
    beta,
    gamma,
    lambda,
    epsilon,
    correctedGroups
  );
console.log(
  newAlpha.length,
  newBeta.length,
  newGamma.length,
  newGamma.length,
  newEpsilon.length
);

// generamos los nuevos news a partir del index 0

// array con los milisegundos de cada elemento de alpha

const intervalRealArray = getIntervalRealArray(newAlpha);

const intervalSecondsRealArray = getSecondsIntervalRealArray(
  intervalRealArray,
  fps
);

// igual que el anterior pero en segundos

// angulos de las articulaciones

const { hipAngle, kneeAngle, ankleAngle } = obtenerAngulos(
  newAlpha,
  newBeta,
  newGamma,
  newLambda,
  newEpsilon
);
// grafico
const angulos = document.getElementById("angulos");

graficoTresVariables(
  angulos,
  intervalSecondsRealArray,
  hipAngle,
  "Cadera",
  kneeAngle,
  "Rodilla",
  ankleAngle,
  "Tobillo"
);

// componentes en x e y de cada marcador

const {
  alphaX,
  alphaY,
  betaX,
  betaY,
  gammaX,
  gammaY,
  lambdaX,
  lambdaY,
  epsilonX,
  epsilonY,
} = gota(newAlpha, newBeta, newGamma, newLambda, newEpsilon);

// lado del registro del video
// de la vista del video:
let ladoVista = "";

if (newBeta[0].x - newBeta[10].x < 0) {
  ladoVista = "derecho";
} else {
  ladoVista = "izquierdo";
}
const vistaVideo = document.getElementById("vista-video");
vistaVideo.textContent = ladoVista;

// obtenemos la distancia en pixeles del marcador de cadera al de rodilla para calibrar

const hipKneeDistancePixeles = Number(
  Math.sqrt(
    Math.pow(betaX[0] - alphaX[0], 2) + Math.pow(betaY[0] - alphaY[0], 2)
  ).toFixed(2)
);

// tenemos que hacer la calibracion y en adelante generar un input con la distancia torcanter-condilo. en este caso vamos a hacerlo manualmente en 0.39 m

const hipKneeDistance = 0.39;

const relPixM = Number((hipKneeDistance / hipKneeDistancePixeles).toFixed(5));

// trayectoria en y de alpa y

const alphaYChartCanvas = document.getElementById("alphaY-time");

// pasamos de pixeles a metros
const alphaYM = alphaY.map((el) =>
  Number(((el - alphaY[0]) * relPixM).toFixed(4))
);

// -------------------------------------------------
function movingAverage(data, windowSize) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    let sum = 0;
    let count = 0;
    for (
      let j = -Math.floor(windowSize / 2);
      j <= Math.floor(windowSize / 2);
      j++
    ) {
      if (i + j >= 0 && i + j < data.length) {
        sum += data[i + j];
        count++;
      }
    }
    result.push(sum / count);
  }
  return result;
}

function calculateDerivative(data, interval) {
  const derivative = [];
  for (let i = 1; i < data.length; i++) {
    derivative.push((data[i] - data[i - 1]) / interval);
  }
  return derivative;
}

// -------------------------------------------------

// derivamos para obtener la velocidad, utilizamos el intervalo regular

// ------------- VENTANAS PARA SUAVIZAR LAS CURVAS -------------

// const windowSize = alphaYM.length * 0.015;
const alphaYMS = movingAverage(alphaYM, 1);
const vel = derivada(alphaYMS, correctedInterval);
const velS = movingAverage(vel, 3);
const acc = derivada(velS, correctedInterval);

const accS = movingAverage(acc, acc.length * 0.05);

// const vel2 = savitzkyGolay(velocity, 21, 6);

// const acc2 = savitzkyGolay(acc, 21, 6);
graficoTresVariables(
  alphaYChartCanvas,
  intervalSecondsRealArray,
  alphaYMS,
  "posición - y ",
  velS,
  "velocidad - y ",
  accS,
  "aceleración - y "
);

// altura
alphaYM.splice(-2);
const maxHeight = Math.max(...alphaYM);

const spanMaxHeight = document.getElementById("max-height");
spanMaxHeight.textContent = maxHeight;

// ------------ ARRAY DE OBJETOS DE DATOS ---------------

const maxHeightPixel = Math.max(...alphaY);

const maxHeightIndex = newAlpha.findIndex((el) => el.y === maxHeightPixel);
let maxHeightTime, maxHeightV, maxHeightA;

const array0ToMaxY = [];
newAlpha.map((el, index) => {
  if (index === maxHeightIndex) {
    maxHeightTime = intervalSecondsRealArray[index];
    maxHeightV = vel[index];
    maxHeightA = accS[index];
  }
  if (index < maxHeightIndex) {
    array0ToMaxY.push(alphaY[index]);
  }
});

let minHeightTime = 0;
let minHeight = 0;
let minHeightIndex = 0,
  minHeightV,
  minHeightA;

const minHeightPixel = Math.min(...array0ToMaxY);

newAlpha.map((el, index) => {
  if (el.y === minHeightPixel) {
    minHeightTime = intervalSecondsRealArray[index];
    minHeight = alphaYM[index];
    minHeightIndex = index;
    minHeightV = vel[index];
    minHeightA = accS[index];
  }
});

// --------- DESPEGUE ------------------
// consideremos el despegue como el momento donde la aceleración baja por debajo de los -5 m/s2
let toeoff, toeoffTime, toeoffV, toeoffA;

const toeoffIndex = accS.findIndex(
  (el, index) => el < -5 && index > minHeightIndex && index < maxHeightIndex
);

accS.map((el, index) => {
  if (index === toeoffIndex) {
    toeoffTime = intervalSecondsRealArray[index];
    toeoff = alphaYM[index];
    toeoffV = vel[index];
    toeoffA = accS[index];
  }
});

// aterrizaje, buscamos el primer valor mayor a -5 y menor a 0, a ese le restamos 3 intervalos por la zona gomosa, para generar el objeto landing

const landingIndex = accS.findIndex(
  (el, index) => el > 0 && index > toeoffIndex
);
let landingPosition, landingV, landingA, landingTime;
alphaYM.map((el, index) => {
  if (index === landingIndex - 3) {
    (landingPosition = el), (landingV = vel[index]);
    landingA = accS[index];
    landingTime = intervalSecondsRealArray[index];
  }
});

// velocidad
// Buscamos la maxima velocidad
vel.splice(-3);

const maxVel = Math.max(...vel);
const maxVelIndex = vel.findIndex((el, index) => el === maxVel);

let maxVelPosition, maxVelA, maxVelTime;
vel.map((el, index) => {
  if (index === maxVelIndex) {
    (maxVelPosition = alphaYM[index]),
      (maxVelA = accS[index]),
      (maxVelTime = intervalSecondsRealArray[index]);
  }
});
// buscamos la minima velocidad antes de la máxima

// generamos un array hasta el minimo
const dataArray = [
  {
    name: "minHeight",
    position: minHeight,
    velocity: minHeightV,
    aceleration: minHeightA,
    time: minHeightTime,
    index: minHeightIndex,
  },
  {
    name: "maxVel",
    position: maxVelPosition,
    velocity: maxVel,
    aceleration: maxVelA,
    time: maxVelTime,
    index: maxVelIndex,
  },
  {
    name: "takeoff",
    position: toeoff,
    velocity: toeoffV,
    aceleration: toeoffA,
    time: toeoffTime,
    index: toeoffIndex,
  },

  {
    name: "maxHeight",
    position: maxHeight,
    velocity: maxHeightV,
    aceleration: maxHeightA,
    time: maxHeightTime,
    index: maxHeightIndex,
  },
  {
    name: "landing",
    position: landingPosition,
    velocity: landingV,
    aceleration: landingA,
    time: landingTime,
    index: landingIndex,
  },
];

console.log(dataArray);

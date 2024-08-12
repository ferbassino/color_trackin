import {
  dividirEnGroups,
  dividirPorMarcador,
  gota,
  obtenerTiempoEIntervaloReal,
  obtenerIndexRamaAscendente,
  filtrarRepetidosMarcadores,
  getIntervalRealArray,
  getSecondsIntervalRealArray,
  findCrossingPoints,
  graficoDerivadas,
  ladoDelVideo,
  getMinToMax,
  getArraysBetweenCrosess,
  getMaxEpsilonXOddIndexes,
  getArrayOddEvenIndexes,
  getArrayXMaxToEven,
  getInitialContactType,
  getFiveElementsGroups,
  getAverageDeleteExtremes,
  getInitialcontact,
  getHorizontalVector,
  getHorizontalFootAngleArray,
  getToeoffTime,
  getHipFootAngleAndDistance,
} from "./auxiliaries/functions.js";
import { obtenerAngulos } from "./auxiliaries/angulos.js";
import {
  graficoDeDispersión,
  graficoDosVariables,
  graficoTresVariables,
} from "./auxiliaries/charts.js";

var array = JSON.parse(localStorage.getItem("array"));

// datos que vienen con la captura e imprimimos
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

// GRUPOS DE 5 OBJETOS A PARTIR DEL ARRAY
const groups = dividirEnGroups(array);

// GRUPOS CON 5 OBJETOS Y MENOS DE 10 MILISEGUNDOS ENTRE ELLOS
const fiveElementsGroups = getFiveElementsGroups(groups);

// DIVIDIMOS EL ARRAY POR MARCADOR
const { alpha, beta, gamma, lambda, epsilon } = dividirPorMarcador(array);

// GRUPOS CORREGIDOS SIN REPETIDOS, INTERVALO DE TIEMPO Y EL TIEMPO REAL
const { realTime, correctedInterval, correctedGroups } =
  obtenerTiempoEIntervaloReal(fiveElementsGroups);

// ARRAYS DE MARCADORES SIN REPETIDOS
const { newAlpha, newBeta, newGamma, newLambda, newEpsilon } =
  filtrarRepetidosMarcadores(
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

// ARRAY DE TIEMPO EN MILISEGUNDOS Y EN SEGUNDOS
const intervalRealArray = getIntervalRealArray(newAlpha);

const intervalSecondsRealArray = getSecondsIntervalRealArray(
  intervalRealArray,
  fps
);

// ANGULO DE LAS ARTICULACIONES SEGUN EL LADO DEL REGISTRO

const { hipAngle, kneeAngle, ankleAngle } = obtenerAngulos(
  newAlpha,
  newBeta,
  newGamma,
  newLambda,
  newEpsilon
);
// grafico
const angulos = document.getElementById("angulos");

// Arrays de datos

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

// ---------------- inserciones en el html ---------------
// Obtener el elemento h1 por su id
const time = document.getElementById("time");
const intervalo = document.getElementById("interval");

// Insertar un nuevo texto dentro del elemento h1
time.textContent = realTime.toFixed(2);
intervalo.textContent = Number(correctedInterval.toFixed(4));

// de la vista del video:

const ladoVista = ladoDelVideo(alpha);
const vistaVideo = document.getElementById("vista-video");
vistaVideo.textContent = ladoVista;

// ARRAYS DE X E Y POR MARCADOR

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

// grafico gota

const graficoGota = document.getElementById("gota");

graficoDeDispersión(
  graficoGota,
  alphaX,
  alphaY,
  betaX,
  betaY,
  gammaX,
  gammaY,
  lambdaX,
  lambdaY,
  epsilonX,
  epsilonY
);

// BUSCAMOS LA MÍNIMA DE LA MÁXIMA EN Y PARA BUSCAR LOS INDEX
const meanValue = getMinToMax(epsilonY);

const meanSpan = document.getElementById("mean");
const meanChart = document.getElementById("mean-chart");

meanSpan.textContent = meanValue;

const meanArray = [];
epsilonY.map((el) => meanArray.push(meanValue));

graficoTresVariables(
  meanChart,
  intervalSecondsRealArray,
  epsilonY,
  "Trayectoria y quinto ",
  epsilonX,
  "Trayectoria x quinto ",
  meanArray,
  "media"
);

// CORTES EN EPSILON Y

let crossings = findCrossingPoints(epsilonY, meanValue);

// inserción en el dom
const dataTableEpsilon = [];

crossings.map((el, index) => {
  dataTableEpsilon.push([
    `index${index}`,
    el,
    intervalSecondsRealArray[el],
    epsilonY[el],
    epsilonX[el],
  ]);
});

document.addEventListener("DOMContentLoaded", function () {
  const tbody = document.querySelector("#dynamicTable tbody");

  dataTableEpsilon.forEach((rowData) => {
    const row = document.createElement("tr");

    rowData.forEach((cellData) => {
      const cell = document.createElement("td");
      cell.textContent = cellData;
      row.appendChild(cell);
    });

    tbody.appendChild(row);
  });
});

// ARRAYS ENTRE LOS INDICES
const {
  epsilonYIndexesArrays,
  epsilonXIndexesArrays,
  lambdaYIndexesArrays,
  lambdaXIndexesArrays,
  epsilonYIndexesArraysIndex,
  epsilonXIndexesArraysIndex,
  lambdaYIndexesArraysIndex,
  lambdaXIndexesArraysIndex,
} = getArraysBetweenCrosess(crossings, epsilonX, epsilonX, lambdaX, lambdaY);

// ARRAYS ENTRE EL MÁXIMO DE EPSILON Y EL ÍNDICE
const { maxEpsilonXOddIndex, maxEpsilonXOddIndex2 } = getMaxEpsilonXOddIndexes(
  epsilonXIndexesArrays,
  crossings
);

//  ARRAYS ENTRE INDEX IMPAR - PAR

const {
  chartXmaxYtoEvenTime,
  chartXmaxXtoEven,
  chartXmaxYtoEven,
  xOddIndexEvenIndexEpsilon,
  yOddIndexEvenIndexEpsilon,
  xOddIndexEvenIndexLambda,
  yOddIndexEvenIndexLambda,
  oddIndexEvenIndexEpsilonTime,
} = getArrayOddEvenIndexes(
  maxEpsilonXOddIndex2,
  intervalRealArray,
  crossings,
  epsilonX,
  epsilonY,
  lambdaX,
  lambdaY,
  intervalSecondsRealArray
);

// gráfico entre el maximo y el par posterior
const posiciones = document.getElementById("posiciones");
graficoTresVariables(
  posiciones,
  chartXmaxYtoEvenTime[0],
  chartXmaxYtoEven[0],
  "Trayectoria en y quinto",
  chartXmaxXtoEven[0],
  "Trayectoria en x quinto",
  meanArray,
  "mean value"
);

// DERIVADAS

const {
  xMaxToEvenEpsilon,
  yMaxToEvenEpsilon,
  xMaxToEvenLambda,
  yMaxToEvenLambda,
  xMaxToEvenDerivadaEpsilon,
  yMaxToEvenDerivadaEpsilon,
  xMaxToEvenDerivadaLambda,
  yMaxToEvenDerivadaLambda,
} = getArrayXMaxToEven(
  maxEpsilonXOddIndex2,
  crossings,
  epsilonX,
  epsilonY,
  lambdaX,
  lambdaY,
  correctedInterval
);

// ----------- ANÁLISIS DE LA DERIVADA / TOE OFF Y CI
graficoDerivadas(
  "derivada-epsilon",
  chartXmaxYtoEvenTime,
  xMaxToEvenDerivadaEpsilon,
  "épsilon - x",
  yMaxToEvenDerivadaEpsilon,
  "épsilon - y"
);

// FUNCIÓN PARA EL TOE-OFF: retorna un arreglo con los tiempos del toeoff

const toeoffTime = getToeoffTime(
  xMaxToEvenDerivadaEpsilon,
  maxEpsilonXOddIndex,
  intervalSecondsRealArray
);

// -------------------- CONTACTO INICIAL -------------------------
// TIPO DE CONTACTO INICIAL
const { initialContactType, oddCrossings } = getInitialContactType(
  yOddIndexEvenIndexEpsilon,
  yOddIndexEvenIndexLambda,
  crossings,
  epsilonY,
  lambdaY,
  intervalSecondsRealArray,
  correctedInterval,
  xOddIndexEvenIndexEpsilon
);
const initialContactTypeSpan = document.getElementById("initial-contact");
initialContactTypeSpan.textContent = initialContactType;
// Mostrar el artículo correspondiente
document.getElementById(initialContactType).style.display = "block";
console.log("initial contact", initialContactType);

// grafico de la derivada lambda

graficoDerivadas(
  "derivada-lambda",
  chartXmaxYtoEvenTime,
  xMaxToEvenDerivadaLambda,
  "lambda - x",
  yMaxToEvenDerivadaLambda,
  "lambda - y"
);

//  Consideramos el contacto inicial como el momento en que las trayectorias se estabilizan: y en velocidad 0 y x en velocidad constante

// función que detecta el contacto inicial según el tipo de contacto y el tiempo de contacto, ademas da un arreglo con los datos del contacto inicial y la horizontal

const {
  dataTableContact,
  dataTableContactArray,
  initialContactArray,
  initialContactIndexEpsilon,
  initialContactFootVector,
} = getInitialcontact(
  xMaxToEvenDerivadaEpsilon,
  yMaxToEvenDerivadaEpsilon,
  xMaxToEvenDerivadaLambda,
  yMaxToEvenDerivadaLambda,
  maxEpsilonXOddIndex,
  intervalSecondsRealArray,
  toeoffTime,
  initialContactType,
  lambdaX,
  lambdaY,
  epsilonX,
  epsilonY,
  oddCrossings,
  alphaX,
  alphaY
);

// ---------- initialContactArray ---------- es un arreglo con todos los datos de alpha, epsxilon y lambda del momento del contacto inicial
// Función para determinar valores de cero en epsilon y y obtener el vector horizontal en el momento del contacto inicial, obtenido con los valores 0 de las derivadas

// ---------------- HORIZONTAL ---------------------

const { yMaxToEvennZerosArray, horizontalVextor } = getHorizontalVector(
  maxEpsilonXOddIndex2,
  crossings,
  intervalSecondsRealArray,
  epsilonX,
  epsilonY,
  initialContactIndexEpsilon,
  yMaxToEvenDerivadaEpsilon
);

// ANGULO ENTRE LA CADERA Y EL PIE Y DISTANCIA CADERA-PIE  EN EL CONTACTO INICIAL

const initialContactAngleArray = getHipFootAngleAndDistance(
  initialContactArray,
  initialContactType
);

console.log(initialContactAngleArray);

// funcion para obtener los angulos entre el vector horizontal y el vector de pie

const { footAngleArray, footAngleMean, dataTableContactAngle } =
  getHorizontalFootAngleArray(
    horizontalVextor,
    initialContactFootVector,
    dataTableContact,
    initialContactAngleArray
  );

// -----------------------------------------------------------------
// ---------------------------------------------------------
//  ------------------- FILTRO Y PROMEDIO DE TIEMPOS

const result = getAverageDeleteExtremes(dataTableContactArray);

// otro método para filtar

// ----------------------------------------------------
function calcularMediana(datos) {
  // Ordenar los datos
  datos.sort((a, b) => a - b);

  // Calcular la mediana
  let mitad = Math.floor(datos.length / 2);
  if (datos.length % 2 === 0) {
    // Si la longitud del array es par, promedio de los dos valores centrales
    return (datos[mitad - 1] + datos[mitad]) / 2;
  } else {
    // Si la longitud del array es impar, el valor central
    return datos[mitad];
  }
}

function calcularMADModificado(datos) {
  // Calcular la mediana
  let mediana = calcularMediana(datos);

  // Calcular las desviaciones absolutas respecto a la mediana
  let desviacionesAbsolutas = datos.map((dato) => Math.abs(dato - mediana));

  // Calcular el MAD (Median Absolute Deviation)
  let mad = calcularMediana(desviacionesAbsolutas);

  // Calcular la desviación estándar modificada (basada en MAD)
  let desviacionEstandarModificada = mad * 1.4826;

  return desviacionEstandarModificada;
}

// Función que aplica el método MAD Modificado a un arreglo de objetos con una propiedad específica
function aplicarMADModificado(arrayDeObjetos, propiedad) {
  // Extraer los valores de la propiedad especificada en un arreglo
  let datos = arrayDeObjetos.map((objeto) => {
    objeto[3].contcactTime;
  });

  // Calcular la desviación estándar modificada usando el método MAD Modificado
  let desviacionEstandarModificada = calcularMADModificado(datos);

  return desviacionEstandarModificada;
}

let desviacionEstandarModificada = aplicarMADModificado(
  dataTableContactArray,
  "contcactTime"
);

// ---------------------------------------------------------

document.addEventListener("DOMContentLoaded", function () {
  const tbody = document.querySelector("#contact tbody");

  dataTableContactAngle.forEach((rowData) => {
    const row = document.createElement("tr");

    rowData.forEach((cellData) => {
      const cell = document.createElement("td");
      cell.textContent = cellData;
      row.appendChild(cell);
    });

    tbody.appendChild(row);
  });
});

const TESTER = document.getElementById("tester");

const TESTER2 = document.getElementById("tester2");

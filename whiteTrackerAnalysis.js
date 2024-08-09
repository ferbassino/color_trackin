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
} from "./auxiliaries/functions.js";
import { obtenerAngulos } from "./auxiliaries/angulos.js";
import {
  graficoDeUnaVariable,
  graficoDeDispersión,
  graficoDosVariables,
  graficoCuatroVariables,
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

// ---------------------  ARRAY -----------------------
// corresponde a los datos que vienen del rastreo y que se almacenan en el local storage, el array contiene objetos con posiciones en x, posición en y los milisegundos en que son capturados. las capturas vienen en grupos de cinco (dados por la marca de tiempo en milisegundos) que corresponde a los marcadores de trocanter, condilo, maleolo, talon y quinto met.

// -------------  Dividir en grupos / intervalo de tiempo --------------------

// Vamos a crear una funcion  para capturar en grupos de cinco para conocer los instantes y poder calcular los tiempos
// invocamos a la funcion para dividir en grupos de cinco

const groups = dividirEnGroups(array);

// groups entrega un array de objetos con cinco posiciones:

[
  { x: 309, y: 668, milliseconds: 1719446522954 },
  { x: 367, y: 501, milliseconds: 1719446522955 },
  { x: 389, y: 332, milliseconds: 1719446522955 },
  { x: 384, y: 310, milliseconds: 1719446522955 },
  { x: 447, y: 309, milliseconds: 1719446522955 },
];
console.log(groups);

// llega un momento en el traqueo que los tiempos son mas largos y no permiten diferenciar los grupos, el length se hace mas corto. entonces creamos una funcion para crear un arreglo solo con los grupos que tienen cinco elementos

// función para eliminar los grupos con menos de 5 elementos

const fiveElementsGroups = getFiveElementsGroups(groups);
console.log("fiveelement", fiveElementsGroups);
// -------------  CREAR ARRAYS POR MARCADOR  --------------------

// creamos una función que agrupa por marcadores, nos va a dar cinco arreglos con objetos pero por marcador, los arreglos son
// alpha para trocanter
// beta para condilo
// gamma para maleolo
// lambda para talon
// epsilon para quinto met

const { alpha, beta, gamma, lambda, epsilon } = dividirPorMarcador(array);

// ------------- INTERVALO DE TIEMPO

// el video tiene los cuadros propios pero el listener de captura dispara mas rápido, por lo menos para los 240 cuadros, por lo que vamos a tener mas muestras que los cuadros del video, entonces tenemos que corregir para que el intervalo de tiempo sea el correcto

// la cantidad de mustras capturadas por el listener está representada por el length del array groups, pero como dispara antes hay valores repetidos. creamos un ciclo para obtener un length real que se aproxime a los 240 cuadros

// función que obtiene el tiempo real del video evaluado y el intervalo a 240 cuadros. la función elimina grupos repetidos, tambien devuelve el array de grupos sin la repeticiones
console.log(fiveElementsGroups);

const { realTime, correctedInterval, correctedGroups } =
  obtenerTiempoEIntervaloReal(fiveElementsGroups, duration);

// una vez que tenemos corregidos los grupos vamos a usar el length de este para igualarlo al length de los arrays de los marcadores, o sea que alpha, beta, gamma, etc no tengan valores repetidos

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
// array de tiempo para los news

const intervalRealArray = getIntervalRealArray(newAlpha);

const intervalSecondsRealArray = getSecondsIntervalRealArray(
  intervalRealArray,
  fps
);
// const arrayBetweenIndexes = getIntervalBetweenIndexes(10, 20);

// -------------  ANGULOS DE LAS ARTICULACIONES  --------------------

// calculo de los angulos a través del producto escalar: coseno del angulo igual a la division entre el producto escalar y el producto de los módulos

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
intervalo.textContent = `Intervalo de tiempo: ${Number(
  correctedInterval.toFixed(4)
)} s`;

// de la vista del video:

const ladoVista = ladoDelVideo(alpha);
const vistaVideo = document.getElementById("vista-video");
vistaVideo.textContent = ladoVista;
// ---------------- fin inserciones en el html ---------------

// ---------------------------- FIN TIEMPO ---------------------

// ------------------ GOTA ----------------
// creamos una funcion  para obtener las coordenadas en x y y  de cada marcador en

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
// -------------------- fin gota

// --- ANALISIS GOTA MARCADOR 5° METATARSIANO (EPSILON): TOEOFF / CI ----

// 1. buscamos el maximo y el mínimo para luego obtener la media y que nos de un valor aproximadamente que corte por la mitad de la curva.

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

// 2. Busqueda de los indices (corte entre la media y el array y)

let crossings = findCrossingPoints(epsilonY, meanValue);

// INDEX0: buscamos el indice del primer elemento mayor al valor medio (mean value). IMPORTANTE: cuando comienza el análisis el pie debe estar en apoyo medio

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

// función para encontrar los índices

// Como el contacto inicial se va a encontrar despues del punto mas anterior de la trayectoria de epsilonx , vamos a generar arrays posteriores a los index impares. primero creamos un array con los index impares

// generamos un array con arrays entre los índices, recorremos los puntos de corte y dentro mapeamos epsilonx para generar un array entre los puntos de corte. lo hacemos tanto para épsilon como para lambda

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

// Arreglos entre el x maximo y el indice par siguiente

// generamos dos arreglos : uno con todos los ciclos y otro solo con los impares. se genera un arreglo con objetos: cada objeto es un arreglo impar con cuatro elementos: el indice propio del arreglo que se está generando de los arrays entre indices, el indice local, el índice en el array y el máximo

// OBTENER ARRAYS ENTRE LOS MAXIMOS DE EPSILON Y EL PAR POSTERIOR, DE TODOS Y DE LOS IMPARES (maxEpsilonXOddIndex2) Y OTRO CON EL DE LOS INDICES IMPARES (maxEpsilonXOddIndex)

// maxEpsilonXOddIndex, es un  objeto
const { maxEpsilonXOddIndex, maxEpsilonXOddIndex2 } = getMaxEpsilonXOddIndexes(
  epsilonXIndexesArrays,
  crossings
);

//  ARRAYS ENTRE INDEX IMPAR - PAR : tambien aprovechamos y sacamos los arrays con los tiempos entre index impar y par

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
// fin grafico xmax par

// DERIVADA
// Cálculo de la derivada las trayectorias para determinar toeoff y contacto inicial. primero vamos a obtener el intervalo entre el máximo de x y el index par posterior.

// recordemos como viene el arreglo con los objetos donde tenemos los maximos maxEpsilonXOddIndex2:

// 1 : {
//   currentIndex: 151, Es el indice donde se encuentra el maximo
//   index: 1, es el indice del objeto
//   localIndex: 50, es el indice local, el que tiene el máximo dentro de el array del ciclo
//   x: 419: es el valor máximo del ciclo
// };

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

const toeOffLocalIndex = [];

// para el toeoff primero buscamos el instante ddonde deja de ser contante la velocidad en x y determinamos un indice local dentro del array que itera

xMaxToEvenDerivadaEpsilon.map((el) => {
  toeOffLocalIndex.push(obtenerIndexRamaAscendente(el));
});

// ahora con el indice local  obtenemos el índice en el array general
const toeOffIndex = [];
maxEpsilonXOddIndex.map((el, index) => {
  toeOffIndex.push(toeOffLocalIndex[index] + el.currentIndex);
});

// y con el indice en el array general obtenemos el instante del despegue

// creamos un array con los tiempos de toeofff

const toeoffTime = toeOffIndex.map((el, index) => intervalSecondsRealArray[el]);

// ++++++++++++++++CONTACTO INICIAL+++++++++++++++++++++++
// determinamos si es contacto de antepié o talon

// grafico de las trayectorias en y de epsilon y lambda
const epsilonLambdaY = document.getElementById("epsilon-lambda-y");
graficoDosVariables(
  epsilonLambdaY,
  intervalSecondsRealArray,
  epsilonY,
  "epsilon-y",
  lambdaY,
  "lambda-y"
);

// grafico para ver como se cruzan
// graficoDerivadas(
//   "cruce-equis",
//   oddIndexEvenIndexEpsilonTime,
//   yOddIndexEvenIndexEpsilon,
//   "épsilon - y",
//   yOddIndexEvenIndexLambda,
//   "lambday - y"
// );
// graficoDerivadas(
//   "cruce-equis",
//   oddIndexEvenIndexEpsilonTime,
//   yOddIndexEvenIndexEpsilon,
//   "épsilon - y",
//   xOddIndexEvenIndexEpsilon,
//   "epsilon - x"
// );
// determinación del tipo de contacto:

// función para determina si el contacto es de talon o mediopie

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

// Mostrar el artículo correspondiente
document.getElementById(initialContactType).style.display = "block";
console.log("initial contact", initialContactType);

// grafico de los cruces derivados para antepié

// graficoDerivadas(
//   "cruces-derivados",
//   crossTimeArray,
//   crossDerivadaEpsilon,
//   "derivada epsilon - y ",
//   crossDerivadaLambda,
//   "derivada lambda - y"
// );

// gafico para antepié sin cruces
graficoDerivadas(
  "sin-cruces",
  oddIndexEvenIndexEpsilonTime,
  yOddIndexEvenIndexEpsilon,
  "épsilon - y",
  yOddIndexEvenIndexLambda,
  "lambday - y"
);

// grafico de las derivadas con contacto de antepié
graficoDerivadas(
  "sin-cruces-derivado",
  chartXmaxYtoEvenTime,
  xMaxToEvenDerivadaEpsilon,
  "derivada épsilon - x",
  yMaxToEvenDerivadaEpsilon,
  "derivada epsilon -y "
);
// graficoDerivadas(
//   "sin-cruces-derivado",
//   chartXmaxYtoEvenTime,
//   xMaxToEvenDerivadaLambda,
//   "derivada épsilon - x",
//   yMaxToEvenDerivadaLambda,
//   "derivada epsilon -y "
// );

// *****************************************************************
// graficamos dinámicamente los cruces

// graficoDosVariablesConfHeight(
//   "cruces",
//   crossTimeArray,
//   crossYEpsilonArray,
//   "epsilon - x",
//   crossYLambdaArray,
//   "lambda - y"
// );
// *****************************************************************

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

// función que detecta el contacto inicial con talon y el tiempo de contacto, ademas da un arreglo con los datos del contacto inicial y la horizontal

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
  oddCrossings
);

// initialContactArray es un arreglo con todos los datos de epsxilon y lambda del momento del contacto inicial
// Función para determinar valores de cero en epsilon y y obtener el vector horizontal
console.log("toeoffindex", intervalSecondsRealArray[toeOffIndex[1]]);

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

// funcion para obtener los angulos entre el vector horizontal y el vector de pie

const { footAngleArray, footAngleMean } = getHorizontalFootAngleArray(
  horizontalVextor,
  initialContactFootVector
);

console.log("foot angle array", footAngleArray);
console.log("foot angle mean", footAngleMean);

// -----------------------------------------------------------------
// ---------------------------------------------------------
//  ------------------- FILTRO Y PROMEDIO DE TIEMPOS
const result = getAverageDeleteExtremes(dataTableContactArray);
console.log(result.filtered);
console.log(result.averages);

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
// console.log(desviacionEstandarModificada);

// ---------------------------------------------------------

document.addEventListener("DOMContentLoaded", function () {
  const tbody = document.querySelector("#contact tbody");

  dataTableContact.forEach((rowData) => {
    const row = document.createElement("tr");

    rowData.forEach((cellData) => {
      const cell = document.createElement("td");
      cell.textContent = cellData;
      row.appendChild(cell);
    });

    tbody.appendChild(row);
  });
});

// const ctx2 = document.getElementById("myChart2");

const TESTER = document.getElementById("tester");

// graficoDeDispersión(
//   TESTER,
//   alphaX,
//   alphaY,
//   betaX,
//   betaY,
//   gammaX,
//   gammaY,
//   lambdaX,
//   lambdaY,
//   epsilonX,
//   epsilonY
// );
const TESTER2 = document.getElementById("tester2");

// graficoDeUnaVariable(TESTER2, derivadaX34, derivadaYTimeArray);
// graficoDeDispersión(
//   TESTER2,
//   alphaX,
//   alphaY,
//   betaX,
//   betaY,
//   gammaX,
//   gammaY,
//   lambdaX,
//   lambdaY,
//   epsilonX,
//   epsilonY
// );

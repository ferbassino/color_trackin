import {
  dividirEnGroups,
  dividirPorMarcador,
  obtenerAngulos,
  gota,
  deDiscretoAContinuo,
  derivada,
  savitzkyGolay,
  getTimeArray,
  obtenerTiempoEIntervaloReal,
  obtenerIndexRamaAscendente,
  filtrarRepetidosMarcadores,
  getIntervalRealArray,
  getSecondsIntervalRealArray,
  getIntervalBetweenIndexes,
  findCrossingPoints,
  obtenerImpares,
} from "./auxiliaries/functions.js";
import {
  graficoDeUnaVariable,
  graficoDeDispersión,
  graficoDosVariables,
  graficoCuatroVariables,
  graficoTresVariables,
} from "./auxiliaries/charts.js";

var array = JSON.parse(localStorage.getItem("array"));

// ingresamos la calibración
const pixelEnMetros = 0.0022;

const data = {
  datasets: [
    {
      label: "Scatter Dataset",
      data: array,
      backgroundColor: "rgb(255, 99, 132)",
    },
  ],
};

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

const { realTime, correctedInterval, correctedGroups } =
  obtenerTiempoEIntervaloReal(groups, duration);

// const timeArray = [];
// let timeCount = 0;
// for (let i = 0; i < correctedGroups.length - 1; i++) {
//   timeArray.push(
//     (timeCount +=
//       correctedGroups[i + 1][0].milliseconds -
//       correctedGroups[i][0].milliseconds) / 1000
//   );
// }

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

// eliminar esta
const arrayTiempoNews = getTimeArray(newAlpha, correctedInterval);
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

// array de tiempo para todos los valores de las gotas

const arrayTiempoGota = getTimeArray(alphaX, 0.004);
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

// const alphaY0 = [];
// const alphaYFirstValue = alphaY[0];
// alphaY.map((el) => {
//   alphaY0.push(el - alphaYFirstValue);
// });

// --- ANALISIS GOTA MARCADOR 5° METATARSIANO (EPSILON): TOEOFF / CI ----

// 1. buscamos el maximo y el mínimo para luego obtener la media y que nos de un valor aproximadamente que corte por la mitad de la curva

const epsilonYMax = Math.max(...epsilonY);
const epsilonYMin = Math.min(...epsilonY);

const meanValue = (epsilonYMax - epsilonYMin) / 2 + epsilonYMin;
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
let initialValue = 0;
let initialValueIndex = 0;

// 2. Busqueda de los indices (corte entre la media y el array y)

let crossings = findCrossingPoints(epsilonY, meanValue);

console.log("crossing", crossings);
// INDEX0: buscamos el indice del primer elemento mayor al valor medio (mean value). IMPORTANTE: cuando comienza el análisis el pie debe estar en apoyo medio

// inserción en el dom
const dataTableEpsilon = [];
const indexesArray = [];

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

const index0 = epsilonY.findIndex((el, index) => el > meanValue);

// función para encontrar los índices

// Como el contacto inicial se va a encontrar despues del punto mas anterior de la trayectoria de epsilonx , vamos a generar arrays posteriores a los index impares. primero creamos un array con los index impares

// generamos un array con arrays entre los índices, recorremos los puntos de corte y dentro mapeamos epsilonx para generar un array entre los puntos de corte. lo hacemos tanto para épsilon como para lambda

const epsilonYIndexesArrays = [];
const epsilonXIndexesArrays = [];
const lambdaYIndexesArrays = [];
const lambdaXIndexesArrays = [];
const epsilonYIndexesArraysIndex = [];
const epsilonXIndexesArraysIndex = [];
const lambdaYIndexesArraysIndex = [];
const lambdaXIndexesArraysIndex = [];

crossings.map((element, index) => {
  const eYarray = [];
  const eXarray = [];
  const lYarray = [];
  const lXarray = [];
  const eYarrayIndex = [];
  const eXarrayIndex = [];
  const lYarrayIndex = [];
  const lXarrayIndex = [];

  epsilonX.map((el, i) => {
    if (i >= element && i <= crossings[index + 1]) {
      eYarray.push(epsilonY[i]);
      eXarray.push(el);
      lYarray.push(lambdaY[i]);
      lXarray.push(lambdaX[i]);
      eYarrayIndex.push({ index: i, y: epsilonY[i] });
      eXarrayIndex.push({ index: i, x: el });
      lYarrayIndex.push({ index: i, y: lambdaY[i] });
      lXarrayIndex.push({ index: i, x: lambdaX[i] });
    }
  });

  epsilonYIndexesArrays.push(eYarray);
  epsilonXIndexesArrays.push(eXarray);
  lambdaYIndexesArrays.push(lYarray);
  lambdaXIndexesArrays.push(lXarray);
  epsilonYIndexesArraysIndex.push(eYarrayIndex);
  epsilonXIndexesArraysIndex.push(eXarrayIndex);
  lambdaYIndexesArraysIndex.push(lYarrayIndex);
  lambdaXIndexesArraysIndex.push(lXarrayIndex);
});
// console.log(epsilonXIndexesArraysIndex);

// guardar en un arreglo solo los máximos de los impares. se genera un arreglo con objetos: cada objeto es un arreglo impar con tres elementos: el indice original de los arrays entre indices, el indice local, y el máximo
const maxEpsilonXOdd = [];

// epsilonXIndexesArrays.map((el, index) => {
//   if (index % 2 !== 0) {
//     maxEpsilonXOdd.push({
//       index,
//       currentindex: el.findIndex((element) => element === Math.max(...el)),
//       x: Math.max(...el),
//     });
//   }
// });

const maxEpsilonXOddIndex = [];
const maxEpsilonXOddIndex2 = [];

epsilonXIndexesArrays.map((el, index) => {
  if (index % 2 !== 0) {
    const localIndex = el.findIndex(
      (elemento, i) => elemento === Math.max(...el)
    );

    maxEpsilonXOddIndex.push({
      index,
      localIndex,
      currentIndex: localIndex + crossings[index],
      x: Math.max(...epsilonXIndexesArrays[index]),
    });
  }
  const localIndex = el.findIndex(
    (elemento, i) => elemento === Math.max(...el)
  );

  maxEpsilonXOddIndex2.push({
    index,
    localIndex,
    currentIndex: localIndex + crossings[index],
    x: Math.max(...epsilonXIndexesArrays[index]),
  });
});

const xMaxToEven = [];
const xMaxToEvenDerivada = [];
maxEpsilonXOddIndex2.map((el, index) => {
  const currentArray = [];
  if (index % 2 !== 0) {
    epsilonX.map((element, i) => {
      if (i >= el.currentIndex && i <= crossings[index + 1]) {
        currentArray.push(element);
      }
    });
    xMaxToEvenDerivada.push(derivada(currentArray, correctedInterval));
    xMaxToEven.push(currentArray);
  }
});
console.log("derivada", xMaxToEvenDerivada);

console.log("xmax", xMaxToEven);
console.log("odindex", maxEpsilonXOddIndex);
console.log(epsilonX);

// maxEpsilonXOddIndex2.map((el, index) => {
//   const xMaxToEven = [];
//   epsilonX.map((element, i) => {
//     if (i > el.currentIndex && i < crossings[index + 1]) {
//       console.log("entra");
//       xMaxToEven.push(element);
//     }
//   });
// });

// ahora hacemos arreglos entre el máximo y el posterior par
const epsilonXmaxEven = [];

// obtenemos el índice de los máximos en spsilonX

// buscamos los máximos de epsilon x entre los índex

// INDEX1: buscamos el indice del primer elemento menor a la media pero con el indice mayor a index0
const index1 = epsilonY.findIndex(
  (el, index) => el < meanValue && index > index0
);

// INDEX2: buscamos el indice del primer elemento mayor a la medioa pero con el indice mayor a index1. el resto respeta el mismo patrón
const index2 = epsilonY.findIndex(
  (el, index) => el > meanValue && index > index1
);
const index3 = epsilonY.findIndex(
  (el, index) => el < meanValue && index > index2
);
const index4 = epsilonY.findIndex(
  (el, index) => el > meanValue && index > index3
);

const index5 = epsilonY.findIndex(
  (el, index) => el < meanValue && index > index4
);
const index6 = epsilonY.findIndex(
  (el, index) => el > meanValue && index > index5
);

console.log(index0, index1, index2, index3, index4, index5, index6);

// 3. arreglos entre los índices
// creamos los arreglos entre los indices anteriores. cada array es un ciclo con una curva de concavidad hacia abajo que corresponde aproximadamente a la fase de recobro, y una curva de concavidad superior que contiene a la fase de apoyo

const array02 = [];
const array24 = [];
const array46 = [];

//

epsilonY.map((el, index) => {
  index >= index0 && index < index2 && array02.push(el);
  index >= index2 && index < index4 && array24.push(el);
  index >= index4 && index < index6 && array46.push(el);
});

// 5. aislamos la parte de la curva que contiene a la fase de apoyo, tanto de los datos en y y en x

const arrayY12 = [];
const arrayY34 = [];
const arrayY56 = [];

epsilonY.map((el, index) => {
  index >= index1 && index < index2 && arrayY12.push(el);
  index >= index3 && index < index4 && arrayY34.push(el);
  index >= index5 && index < index6 && arrayY56.push(el);
});

const arrayX12 = [];
const arrayX34 = [];
const arrayX56 = [];

epsilonX.map((el, index) => {
  index >= index1 && index < index2 && arrayX12.push(el);
  index >= index3 && index < index4 && arrayX34.push(el);
  index >= index5 && index < index6 && arrayX56.push(el);
});

// 6. VALOR MÁXIMO DE X: obtenemos el valor máximo de x porque es el punto mas adelantado del pie. y luego buscamos el índice

const x12max = Math.max(...arrayX12);

const x12maxIndex = arrayX12.findIndex((el) => el === x12max);

// 7. cremos un arreglo para x y para y para obtener los valores  se encuentran luego de que el pie comienza a ir hacia atras que corresponde al valor maximo de x

const arrayY12XMax = [];
const arrayX12XMax = [];

arrayX12.map((el, index) => {
  if (index >= x12maxIndex) {
    arrayX12XMax.push(el);
    arrayY12XMax.push(arrayY12[index]);
  }
});

// El array arrayY12XMax solo contiene datos discretos pasamos el array arrayY12XMax de discreto a continuo para obtener valores mas claros en la derivada

const arrayY12XMaxContinuo = deDiscretoAContinuo(arrayY12XMax);
const arrayX12XMaxContinuo = deDiscretoAContinuo(arrayX12XMax);

// derivamos para obtener donde la derivada se aproxima a 0 que corresponde al periodo de contacto del pie sobre el suelo

const derivadaY = derivada(arrayY12XMaxContinuo, correctedInterval);
const derivadaX = derivada(arrayX12XMaxContinuo, correctedInterval);
const median12DerivadaX = parseInt(numbers.statistic.median(derivadaX));

const toeOffXIndex = obtenerIndexRamaAscendente(derivadaX);

const derivadaYTimeArray = getTimeArray(derivadaY, correctedInterval);
// filtro de la derivada (no lo estamos aplicando)

const ventana = 3; // Tamaño de la ventana (debe ser impar)
const gradoPolinomio = 2; // Grado del polinomio de ajuste (puedes ajustarlo según tus necesidades)
const derivadaFiltrada = savitzkyGolay(derivadaY, ventana, gradoPolinomio);

//  ---------------fin filtro ---------------------------

// ----------- ANÁLISIS DE LA DERIVADA / TOE OFF Y CI

// la función obtiene  la mediana de la derivada que va a estar próximo a 0 y luego capturamos el primer valor de la curva ascendente que corresponde al toeoff

const toeOffIndex = obtenerIndexRamaAscendente(derivadaY);

// ahora buscamos el contacto inicial que seria el primer valor igual a la mediana + - 20 y que tenga los 10 valores anteriores que sean menores
const median = numbers.statistic.median(derivadaY);

const initialContactIndex = derivadaY.findIndex(
  (el, index) =>
    el < median &&
    el > derivadaY[index - 1] &&
    el > derivadaY[index - 3] &&
    el > derivadaY[index - 5] &&
    el > derivadaY[index - 7] &&
    el > derivadaY[index - 9] &&
    el > derivadaY[index - 10]
);

const arrayTiempoY = [];
let countTY = 0;
arrayX12.map((el) => {
  countTY += correctedInterval;
  arrayTiempoY.push(countTY);
});

// obtenemos el indice del array original mediante la suma de el toeOffIndex + x12maxIndex + index 1

const toeOff2 = toeOffXIndex + x12maxIndex + index1;

let toeoffTime = 0;

correctedGroups.map((el, index) => {
  if (index === toeOff2) {
    toeoffTime =
      (el[0].milliseconds - correctedGroups[0][0].milliseconds) / 1000;
  }
});

// toeofftime es el tiempo en milisegundos pero en camara lenta entonces lo pasamos a segundos lo multiplicamos por los fps y lo dividimos por 240

const toeoffTimeCorregido = (toeoffTime * 30) / 240;

// ----------- segundo ciclo (index 3-4)
// 6. VALOR MÁXIMO DE X: obtenemos el valor máximo de x porque es el punto mas adelantado del pie. y luego buscamos el índice

const x34max = Math.max(...arrayX34);

const x34maxIndex = arrayX34.findIndex((el) => el === x34max);

// 7. cremos un arreglo para x y para y para obtener los valores  se encuentran luego de que el pie comienza a ir hacia atras que corresponde al valor maximo de x

const arrayY34XMax = [];
const arrayX34XMax = [];

arrayX34.map((el, index) => {
  if (index > x34maxIndex) {
    arrayX34XMax.push(el);
    arrayY34XMax.push(arrayY34[index]);
  }
});

// El array arrayY12XMax solo contiene datos discretos pasamos el array arrayY12XMax de discreto a continuo para obtener valores mas claros en la derivada

const arrayY34XMaxContinuo = deDiscretoAContinuo(arrayY34XMax);
const arrayX34XMaxContinuo = deDiscretoAContinuo(arrayX34XMax);

// derivamos para obtener donde la derivada se aproxima a 0 que corresponde al periodo de contacto del pie sobre el suelo
const arrayTimeDerivada34 = getIntervalBetweenIndexes(
  intervalSecondsRealArray,
  x34maxIndex + index3,
  index4
);
const derivadaY34 = derivada(arrayY34XMaxContinuo, correctedInterval);
const derivadaX34 = derivada(arrayX34XMaxContinuo, correctedInterval);

const derivadaYTimeArray34 = getTimeArray(derivadaY34, correctedInterval);

// filtro de la derivada (no lo estamos aplicando)

const ventana34 = 3; // Tamaño de la ventana (debe ser impar)
const gradoPolinomio34 = 2; // Grado del polinomio de ajuste (puedes ajustarlo según tus necesidades)
const derivadaFiltrada34 = savitzkyGolay(
  derivadaY34,
  ventana34,
  gradoPolinomio34
);

//  ---------------fin filtro ---------------------------

// ----------- ANÁLISIS DE LA DERIVADA / TOE OFF Y CI

// la función obtiene  la mediana de la derivada que va a estar próximo a 0 y luego capturamos el primer valor de la curva ascendente que corresponde al toeoff

const toeOffIndex34 = obtenerIndexRamaAscendente(derivadaY34);
const toeOffXIndex34 = obtenerIndexRamaAscendente(derivadaX34);

// console.log(derivadaX34);

const posiciones = document.getElementById("posiciones");
graficoDosVariables(
  posiciones,
  intervalSecondsRealArray,
  epsilonY,
  "Trayectoria en y quinto",
  lambdaY,
  "Trayectoria en y talon"
);

// graficoCuatroVariables(
//   posiciones,
//   intervalSecondsRealArray,
//   epsilonY,
//   "Trayectoria en y",
//   epsilonX,
//   "Trayectoria en x",
//   lambdaY,
//   "trayectoria talon y",
//   lambdaX,
//   "trayectoria talonx"
// );
const posicionesLambda = document.getElementById("posiciones-lambda");
graficoDosVariables(
  posicionesLambda,
  intervalSecondsRealArray,
  lambdaY,
  "Trayectoria en y",
  lambdaX,
  "Trayectoria en x"
);

// ahora buscamos el contacto inicial que seria el primer valor igual a la mediana + - 20 y que tenga los 10 valores anteriores que sean menores

const arrayTiempoY34 = [];
let countTY34 = 0;
arrayX34.map((el) => {
  countTY34 += correctedInterval;
  arrayTiempoY34.push(countTY34);
});

// obtenemos el indice del array original mediante la suma de el toeOffIndex + x12maxIndex + index 1

const toeOff234 = toeOffXIndex34 + x34maxIndex + index3;

let toeoffTime34 = 0;

correctedGroups.map((el, index) => {
  if (index === toeOff234) {
    toeoffTime34 =
      (el[0].milliseconds - correctedGroups[0][0].milliseconds) / 1000;
  }
});

// toeofftime es el tiempo en milisegundos pero en camara lenta entonces lo pasamos a segundos lo multiplicamos por los fps y lo dividimos por 240

const toeoffTimeCorregido34 = (toeoffTime34 * 30) / 240;
// LAMBDA
// obtnenemos la derivada entre index3 y toeoff234

const lambdaYIndex3Toeoff2 = [];
const lambdaXIndex3Toeoff2 = [];
lambdaY.map((el, index) => {
  if (index >= x34maxIndex + index3 && index <= toeOff234) {
    lambdaYIndex3Toeoff2.push(el);
    lambdaXIndex3Toeoff2.push(lambdaX[index]);
  }
});
const derivadaLambdaYIndex3Toeoff2 = derivada(
  lambdaYIndex3Toeoff2,
  correctedInterval
);
const derivadaLambdaXIndex3Toeoff2 = derivada(
  lambdaXIndex3Toeoff2,
  correctedInterval
);

const arrayDerivadaLambdaXIndex3Toeoff2 = getIntervalBetweenIndexes(
  intervalSecondsRealArray,
  x34maxIndex + index3,
  toeOff234
);
// grafico de la derivada lambda
const graficoDerivadaLambda = document.getElementById("derivada-lambda");
// const ctx2 = document.getElementById("myChart2");

graficoDosVariables(
  graficoDerivadaLambda,
  arrayDerivadaLambdaXIndex3Toeoff2,
  derivadaLambdaYIndex3Toeoff2,
  "",
  derivadaLambdaXIndex3Toeoff2,
  ""
);
const medianADLambdaIndexTO2 = numbers.statistic.median(
  derivadaLambdaXIndex3Toeoff2
);
const arrayResta = [];
derivadaLambdaXIndex3Toeoff2.map((el, index) => {
  arrayResta.push(
    derivadaLambdaYIndex3Toeoff2[index] - derivadaLambdaXIndex3Toeoff2[index]
  );
});

const initialContactIndex34 = arrayResta.findIndex((el) => el > 200);

const initialContact234Index = index3 + x34maxIndex + initialContactIndex34;

const contacTime34 = getIntervalBetweenIndexes(
  intervalSecondsRealArray,
  initialContact234Index,
  toeOff234
);
console.log(contacTime34[contacTime34.length - 1] - contacTime34[0]);
// ----------- fin  segundo ciclo
// -------------  GRAFICOS -----------------

const graficoDerivada = document.getElementById("derivada");
// const ctx2 = document.getElementById("myChart2");

graficoCuatroVariables(
  graficoDerivada,
  arrayTimeDerivada34,
  xMaxToEvenDerivada[0],
  "",
  xMaxToEvenDerivada[1],
  "",
  xMaxToEvenDerivada[3],
  "",
  xMaxToEvenDerivada[4],
  ""
);
// graficoDosVariables(
//   ctx,
//   arrayTimeDerivada34,
//   derivadaY34,
//   "derivadaY",
//   derivadaX34,
//   "derivadaX"
// );

// graficoUnaVariable(ctx, derivadaYTimeArray, derivadaX34, "derivadaY");

// graficoCuatroVariables(
//   ctx,
//   intervalSecondsRealArray,
//   hipAngle,
//   "epsilonY",
//   kneeAngle,
//   "LamndaY",
//   ankleAngle,
//   "epsilonX"
//   // lambdaX,
//   // "lamndaX"
// );
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

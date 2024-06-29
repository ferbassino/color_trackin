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
} from "./auxiliaries/functions.js";
import {
  graficoUnaVariable,
  graficoDeDispersión,
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

// -------------  ANGULOS DE LAS ARTICULACIONES  --------------------

// calculo de los angulos a través del producto escalar: coseno del angulo igual a la division entre el producto escalar y el producto de los módulos

const { hipAngle, kneeAngle, ankleAngle } = obtenerAngulos(
  alpha,
  beta,
  gamma,
  lambda,
  epsilon
);

// tiempo

const timeArray = [];
let timeCount = 0;
for (let i = 0; i < groups.length - 1; i++) {
  timeArray.push(
    (timeCount += groups[i + 1][0].milliseconds - groups[i][0].milliseconds) /
      1000
  );
}

// ------------- INTERVALO DE TIEMPO

// el video tiene los cuadros propios pero el listener de captura dispara mas rápido, por lo menos para los 240 cuadros, por lo que vamos a tener mas muestras que los cuadros del video, entonces tenemos que corregir para que el intervalo de tiempo sea el correcto

// la cantidad de mustras capturadas por el listener está representada por el length del array groups, pero como dispara antes hay valores repetidos. creamos un ciclo para obtener un length real que se aproxime a los 240 cuadros

// función que obtiene el tiempo real del video evaluado y el intervalo a 240 cuadros. la función elimina grupos repetidos, tambien devuelve el array de grupos sin la repeticiones

const { realTime, correctedInterval, correctedGroups } =
  obtenerTiempoEIntervaloReal(groups);

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

// array de tiempo para los news

const arrayTiempoNews = getTimeArray(newAlpha, correctedInterval);

// ---------------- inserciones en el html ---------------
// Obtener el elemento h1 por su id
const time = document.getElementById("time");
const frames = document.getElementById("frames");
const intervalo = document.getElementById("interval");

// Insertar un nuevo texto dentro del elemento h1
time.textContent = `Tiempo corregido: ${Number(realTime.toFixed(2))} s`;
intervalo.textContent = `Intervalo de tiempo: ${Number(
  correctedInterval.toFixed(4)
)} s`;
var fps = JSON.parse(localStorage.getItem("fps"));
frames.textContent = `Cuadros por segundo originales: ${Number(
  fps.toFixed(2)
)} fps`;

// ---------------- fin inserciones en el html ---------------

let intervalArray = [];
let intervalCount = 0;
groups.map((el) => {
  intervalCount += correctedInterval;
  intervalArray.push(Number(intervalCount.toFixed(3)));
});
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

const arrayTiempoGota = getTimeArray(alphaX, correctedInterval);

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

let initialValue = 0;
let initialValueIndex = 0;

// 2. Busqueda de los indices

// INDEX0: buscamos el indice del primer elemento mayor al valor medio (mean value). IMPORTANTE: cuando comienza el análisis el pie debe estar en apoyo medio

const index0 = epsilonY.findIndex((el, index) => el > meanValue);

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

// 4. capturamos los milisegundos de los indices para poder determinar los tiempos del ciclo

let index0Mili = 0;
let index1Mili = 0;
let index2Mili = 0;
let index3Mili = 0;
let index4Mili = 0;
let index5Mili = 0;
let index6Mili = 0;

alpha.map((el, index) => {
  if (index === index0) {
    index0Mili = el.milliseconds;
  }
  if (index === index1) {
    index1Mili = el.milliseconds;
  }
  if (index === index2) {
    index2Mili = el.milliseconds;
  }
  if (index === index3) {
    index3Mili = el.milliseconds;
  }
  if (index === index4) {
    index4Mili = el.milliseconds;
  }
  if (index === index5) {
    index5Mili = el.milliseconds;
  }
  if (index === index6) {
    index6Mili = el.milliseconds;
  }
});

const array02Min = Math.min(...array02);
const array24Min = Math.min(...array24);
const array46Min = Math.min(...array46);

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
  if (index > x12maxIndex) {
    arrayX12XMax.push(el);
    arrayY12XMax.push(arrayY12[index]);
  }
});

// El array arrayY12XMax solo contiene datos discretos pasamos el array arrayY12XMax de discreto a continuo para obtener valores mas claros en la derivada

const arrayY12XMaxContinuo = deDiscretoAContinuo(arrayY12XMax);

// derivamos para obtener donde la derivada se aproxima a 0 que corresponde al periodo de contacto del pie sobre el suelo

const derivadaY = derivada(arrayY12XMaxContinuo, correctedInterval);

const derivadaYTimeArray = getTimeArray(derivadaY, correctedInterval);
// filtro de la derivada (no lo estamos aplicando)

const ventana = 3; // Tamaño de la ventana (debe ser impar)
const gradoPolinomio = 2; // Grado del polinomio de ajuste (puedes ajustarlo según tus necesidades)
const derivadaFiltrada = savitzkyGolay(derivadaY, ventana, gradoPolinomio);

//  ---------------fin filtro ---------------------------

// ----------- ANÁLISIS DE LA DERIVADA / TOE OFF Y CI

// la función obtiene  la mediana de la derivada que va a estar próximo a 0 y luego capturamos el primer valor de la curva ascendente que corresponde al toeoff

const toeOffIndex = obtenerIndexRamaAscendente(derivadaY);
console.log(toeOffIndex);
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

const toeOff2 = toeOffIndex + x12maxIndex + index1;

let toeoffTime = 0;

groups.map((el, index) => {
  if (index === toeOff2) {
    toeoffTime = (el[0].milliseconds - groups[0][0].milliseconds) / 1000;
  }
});

// toeofftime es el tiempo en milisegundos pero en camara lenta entonces lo pasamos a segundos lo multiplicamos por los fps y lo dividimos por 240

const toeoffTimeCorregido = (toeoffTime * 30) / 240;

// -------------  GRAFICOS -----------------

const ctx = document.getElementById("myChart");

graficoUnaVariable(ctx, derivadaYTimeArray, derivadaY, "derivadaY");

const TESTER = document.getElementById("tester");

graficoDeDispersión(
  TESTER,
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

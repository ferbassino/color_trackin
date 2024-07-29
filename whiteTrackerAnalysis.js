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

// de la vista del video:
let ladoVista = "";
if (alpha[0].x - alpha[10].x < 0) {
  ladoVista = "izquierda";
} else {
  ladoVista = "derecha";
}
const vistaVideo = document.getElementById("vista-video");
console.log(vistaVideo);
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

const meanValue = (epsilonYMax + 50 - epsilonYMin) / 2 + epsilonYMin;
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
    if (i > element && i < crossings[index + 1]) {
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

// Arreglos entre el x maximo y el indice par siguiente

// generamos dos arreglos : uno con todos los ciclos y otro solo con los impares. se genera un arreglo con objetos: cada objeto es un arreglo impar con cuatro elementos: el indice propio del arreglo que se está generando de los arrays entre indices, el indice local, el índice en el array y el máximo

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

// para graficar un ejemplo de intervalo entre el maximo y el par posterior

console.log(maxEpsilonXOddIndex2);
console.log(crossings);
const chartXmaxXtoEven = [];
const chartXmaxYtoEven = [];
const chartXmaxYtoEvenTime = [];

epsilonX.map((el, index) => {
  if (index > maxEpsilonXOddIndex2[1].currentIndex && index < crossings[2]) {
    chartXmaxXtoEven.push(el);
    chartXmaxYtoEven.push(epsilonY[index]);
    chartXmaxYtoEvenTime.push(intervalSecondsRealArray[index]);
  }
});
const posiciones = document.getElementById("posiciones");
graficoTresVariables(
  posiciones,
  chartXmaxYtoEvenTime,
  chartXmaxYtoEven,
  "Trayectoria en y quinto",
  chartXmaxXtoEven,
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

const xMaxToEven = [];
const yMaxToEven = [];
const xMaxToEvenLambda = [];
const yMaxToEvenLambda = [];
const xMaxToEvenDerivada = [];
const yMaxToEvenDerivada = [];
const xMaxToEvenDerivadaLambda = [];
const yMaxToEvenDerivadaLambda = [];

// itermos maxEpsilonXOddIndex2 y dentro de este crossings que tiene los cruces e indica los indices. Aprovechamos  el mapeo tambien para derivar

maxEpsilonXOddIndex2.map((el, index) => {
  const currentArray = [];
  const currentYArray = [];
  const currentArrayLambda = [];
  const currentYArrayLambda = [];
  if (index % 2 !== 0) {
    epsilonX.map((element, i) => {
      if (i > el.currentIndex && i < crossings[index + 1]) {
        currentArray.push(element);
      }
    });
    epsilonY.map((element, i) => {
      if (i > el.currentIndex && i < crossings[index + 1]) {
        currentYArray.push(element);
      }
    });
    lambdaX.map((element, i) => {
      if (i > el.currentIndex && i < crossings[index + 1]) {
        currentArrayLambda.push(element);
      }
    });
    lambdaY.map((element, i) => {
      if (i > el.currentIndex && i < crossings[index + 1]) {
        currentYArrayLambda.push(element);
      }
    });
    xMaxToEvenDerivada.push(derivada(currentArray, correctedInterval));
    yMaxToEvenDerivada.push(derivada(currentYArray, correctedInterval));
    xMaxToEvenDerivadaLambda.push(
      derivada(currentArrayLambda, correctedInterval)
    );
    yMaxToEvenDerivadaLambda.push(
      derivada(currentYArrayLambda, correctedInterval)
    );
    // xMaxToEvenDerivada.push(
    //   savitzkyGolay(derivada(currentArray, correctedInterval), 3, 2)
    // );
    xMaxToEven.push(currentArray);
    yMaxToEven.push(currentYArray);
    xMaxToEvenLambda.push(currentArrayLambda);
    yMaxToEvenLambda.push(currentYArrayLambda);
  }
});

// grafico de la derivada
const graficoDerivada = document.getElementById("derivada");
// const ctx2 = document.getElementById("myChart2");

graficoDosVariables(
  graficoDerivada,
  chartXmaxYtoEvenTime,
  xMaxToEvenDerivada[0],
  "Derivada x",
  yMaxToEvenDerivada[0],
  "Derivada y"
);
// toeoff

// ----------- ANÁLISIS DE LA DERIVADA / TOE OFF Y CI

const toeOffLocalIndex = [];

// para el toeoff primero buscamos el instante ddonde deja de ser contante la velocidad en x y determinamos un indice local dentro del array que itera
xMaxToEvenDerivada.map((el) =>
  toeOffLocalIndex.push(obtenerIndexRamaAscendente(el))
);

// ahora con el indice local  obtenemos el índice en el array general
const toeOffIndex = [];
maxEpsilonXOddIndex.map((el, index) => {
  toeOffIndex.push(toeOffLocalIndex[index] + el.currentIndex);
});

// y con el indice en el array general obtenemos el instante del despegue

// creamos un array con los tiempos de toeofff

const toeoffTime = toeOffIndex.map((el, index) => intervalSecondsRealArray[el]);
console.log("toe off time", toeoffTime);

// ahora teniendo el contacto inicial y el toeoff calculamos el tiempo de contacto restando los dos instantes

// CONTACTO INICIAL

// grafico de la derivada lambda
const graficoDerivadaLambda = document.getElementById("derivada-lambda");
graficoDosVariables(
  graficoDerivadaLambda,
  chartXmaxYtoEvenTime,
  xMaxToEvenDerivadaLambda[0],
  "Derivada x Lambda",
  yMaxToEvenDerivadaLambda[0],
  "Derivada y Lambda"
);

//  Consideramos el contacto inicial como el momento en que las trayectorias se separan mas de 200 px/s

// entonces restamos las derivadas, en este caso de lambda porque es contacto inicial

const maxToEvenDerivadaLambdaSubstraction = [];
xMaxToEvenDerivadaLambda.map((el, i) => {
  const array = [];
  el.map((element, index) => {
    array.push(
      yMaxToEvenDerivadaLambda[i][index] - xMaxToEvenDerivadaLambda[i][index]
    );
  });
  maxToEvenDerivadaLambdaSubstraction.push(array);
});

// ahora buscamos el indice donde la diferencia es mayor a 200px

const derivadaSubstractionLambda = [];

maxToEvenDerivadaLambdaSubstraction.map((el) =>
  derivadaSubstractionLambda.push(el.findIndex((el) => el > 200))
);

// ahora derivadaSubstractionLambda tiene los índices locales, o sea a partir de x max de contacto inicial con talon (lambda)

const initialContactIndex = [];
maxEpsilonXOddIndex.map((el, index) => {
  initialContactIndex.push(derivadaSubstractionLambda[index] + el.currentIndex);
});

// y con el indice en el array general obtenemos el instante del despegue

// creamos un array con los tiempos de toeofff
console.log(initialContactIndex);
const initialContactTime = initialContactIndex.map(
  (el, index) => intervalSecondsRealArray[el]
);
console.log("toe off time", initialContactTime);

// tenemos que encontrar a que tiempo corresponde para saber el contacto inicial y el tiempo de concacto
console.log(initialContactTime, toeoffTime);
const contactTime = toeoffTime.map((el, index) =>
  Number((el - initialContactTime[index]).toFixed(4))
);

// inserción en el dom de los datos de contacto
const dataTableContact = [];
// const indexesArray = [];

toeoffTime.map((el, index) => {
  dataTableContact.push([
    `ciclo ${index + 1}`,
    `${initialContactTime[index]} s`,
    `${toeoffTime[index]} s`,
    `${contactTime[index]} s`,
  ]);
});

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

var fps = JSON.parse(localStorage.getItem("fps"));

// funcion para dividir el array en cinco grupos segun el intervalo de tiempo y poder determinar los instantes

export function dividirEnGroups(array) {
  function splitIntoGroups(array) {
    const groups = [];
    let currentGroup = [];

    for (let i = 0; i < array.length; i++) {
      if (
        currentGroup.length === 0 ||
        Math.abs(
          array[i].milliseconds -
            currentGroup[currentGroup.length - 1].milliseconds
        ) <= 10
      ) {
        currentGroup.push(array[i]);
      } else {
        groups.push(currentGroup);
        currentGroup = [array[i]];
      }
    }

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }

  function checkGroups(groups) {
    for (const group of groups) {
      for (let i = 1; i < group.length; i++) {
        if (Math.abs(group[i].milliseconds - group[i - 1].milliseconds) > 50) {
          return false;
        }
      }
    }
    return true;
  }

  let groups = splitIntoGroups(array);

  while (!checkGroups(groups)) {
    groups = splitIntoGroups(array);
  }
  return groups;
}

// funcion dividir por marcador, agrupa los datos que son de un mismo marcador,
// la funcion va siguiendo cada marcador en x e y y agrupa los que tienen distancia minima entre ellos

export function dividirPorMarcador(array) {
  const alpha = [array[0]];
  const beta = [array[1]];
  const gamma = [array[2]];
  const lambda = [array[3]];
  const epsilon = [array[4]];
  let dif = [];

  for (let i = 5; i < array.length - 1; i++) {
    let lastPositionArray = [
      alpha[alpha.length - 1],
      beta[beta.length - 1],
      gamma[gamma.length - 1],
      lambda[lambda.length - 1],
      epsilon[epsilon.length - 1],
    ];

    dif = [
      Math.abs(lastPositionArray[0].x - array[i].x) +
        Math.abs(lastPositionArray[0].y - array[i].y),
      Math.abs(lastPositionArray[1].x - array[i].x) +
        Math.abs(lastPositionArray[1].y - array[i].y),
      Math.abs(lastPositionArray[2].x - array[i].x) +
        Math.abs(lastPositionArray[2].y - array[i].y),
      Math.abs(lastPositionArray[3].x - array[i].x) +
        Math.abs(lastPositionArray[3].y - array[i].y),
      Math.abs(lastPositionArray[4].x - array[i].x) +
        Math.abs(lastPositionArray[4].y - array[i].y),
    ];

    let min = Math.min(...dif);

    if (min === dif[0]) {
      alpha.push(array[i]);
    }

    if (min === dif[1]) {
      beta.push(array[i]);
    }
    if (min === dif[2]) {
      gamma.push(array[i]);
    }
    if (min === dif[3]) {
      lambda.push(array[i]);
    }
    if (min === dif[4]) {
      epsilon.push(array[i]);
    }
  }

  if (
    alpha.length !== beta.length &&
    beta.length !== gamma.length &&
    gamma.length !== lambda.length &&
    lambda.length !== beta.length - 1
  ) {
    alert(
      "An error occurred while tracking the trajectory. Please try again. Remember to start tracking when the foot is flat on the ground."
    );
  }
  return { alpha, beta, gamma, lambda, epsilon };
}

// calculo de los angulos a través del producto escalar: coseno del angulo igual a la division entre el producto escalar y el producto de los módulos

// funcion para obtener los puntos en x y y de cada marcador
// console.log(alpha, beta, gamma, lambda, epsilon);
export function gota(alpha, beta, gamma, lambda, epsilon) {
  if (alpha[0].x - alpha[10].x < 0) {
    const alphaX = [];
    const alphaY = [];
    alpha.map((el) => {
      alphaX.push(el.xr);
      alphaY.push(el.y);
    });
    const betaX = [];
    const betaY = [];
    beta.map((el) => {
      betaX.push(el.xr);
      betaY.push(el.y);
    });
    const gammaX = [];
    const gammaY = [];
    gamma.map((el) => {
      gammaX.push(el.xr);
      gammaY.push(el.y);
    });
    const lambdaX = [];
    const lambdaY = [];
    lambda.map((el) => {
      lambdaX.push(el.xr);
      lambdaY.push(el.y);
    });
    const epsilonX = [];
    const epsilonY = [];
    epsilon.map((el) => {
      epsilonX.push(el.xr);
      epsilonY.push(el.y);
    });

    return {
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
    };
  } else {
    const alphaX = [];
    const alphaY = [];
    alpha.map((el) => {
      alphaX.push(el.x);
      alphaY.push(el.y);
    });
    const betaX = [];
    const betaY = [];
    beta.map((el) => {
      betaX.push(el.x);
      betaY.push(el.y);
    });
    const gammaX = [];
    const gammaY = [];
    gamma.map((el) => {
      gammaX.push(el.x);
      gammaY.push(el.y);
    });
    const lambdaX = [];
    const lambdaY = [];
    lambda.map((el) => {
      lambdaX.push(el.x);
      lambdaY.push(el.y);
    });
    const epsilonX = [];
    const epsilonY = [];
    epsilon.map((el) => {
      epsilonX.push(el.x);
      epsilonY.push(el.y);
    });

    return {
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
    };
  }
}

// funcion para pasar de array con datos continuos a discretos
export function deDiscretoAContinuo(arr) {
  const result = [];
  let currentGroup = [arr[0]];

  for (let i = 1; i <= arr.length; i++) {
    if (arr[i] === arr[i - 1]) {
      // Continuamos agregando al grupo actual
      currentGroup.push(arr[i]);
    } else {
      // Detectamos el final del grupo
      const groupLength = currentGroup.length;
      const increment = (arr[i] - currentGroup[0]) / (groupLength + 1);

      // Calculamos los valores intermedios y los agregamos al resultado
      for (let j = 1; j < groupLength; j++) {
        result.push(Number((currentGroup[0] + j * increment).toFixed(2)));
      }
      // Agregamos el valor final del grupo
      result.push(arr[i]);

      // Reiniciamos el grupo actual
      currentGroup = [arr[i]];
    }
  }

  return result;
}

// función para derivar
export function derivada(pixeles, interval) {
  const n = pixeles.length;
  const h = interval;
  const derivada = [];
  for (let i = 1; i < n - 1; i++) {
    const f_i1 = pixeles[i + 1];
    const f_i_1 = pixeles[i - 1];
    const derivada_i = (f_i1 - f_i_1) / (2 * h);
    derivada.push(derivada_i);
  }

  return derivada;
}

// filtro para la derivada
export function savitzkyGolay(datos, ventana, gradoPolinomio) {
  // Asegurémonos de que la ventana sea impar
  if (ventana % 2 === 0) {
    ventana++;
  }

  const mitadVentana = Math.floor(ventana / 2);
  const coeficientes = [];

  // Calculamos los coeficientes del polinomio de ajuste
  for (let i = -mitadVentana; i <= mitadVentana; i++) {
    const coef = [];
    for (let j = 0; j <= gradoPolinomio; j++) {
      coef.push(Math.pow(i, j));
    }
    coeficientes.push(coef);
  }

  // Aplicamos el filtro Savitzky-Golay
  const suavizado = [];
  for (let i = mitadVentana; i < datos.length - mitadVentana; i++) {
    let suma = 0;
    for (let j = -mitadVentana; j <= mitadVentana; j++) {
      suma += coeficientes[j + mitadVentana][0] * datos[i + j];
    }
    suavizado.push(suma);
  }

  return suavizado;
}

// array de tiempo

export function getTimeArray(array, interval) {
  let count = 0;
  const timeArray = [];
  array.map((el) => timeArray.push(Number((count += interval).toFixed(2))));
  return timeArray;
}

// obtener tiempo real e intervalo de tiempo corregido
export function obtenerTiempoEIntervaloReal(groups, duration) {
  const correctedGroups = [];

  let repoitedGroups = 0;

  for (let index = 0; index < groups.length - 1; index++) {
    if (
      groups[index][0].x === groups[index + 1][0].x &&
      groups[index][0].y === groups[index + 1][0].y &&
      groups[index][1].x === groups[index + 1][1].x &&
      groups[index][1].y === groups[index + 1][1].y &&
      groups[index][2].x === groups[index + 1][2].x &&
      groups[index][2].y === groups[index + 1][2].y &&
      groups[index][3].x === groups[index + 1][3].x &&
      groups[index][3].y === groups[index + 1][3].y &&
      groups[index][4].x === groups[index + 1][4].x &&
      groups[index][4].y === groups[index + 1][4].y
    ) {
      repoitedGroups += 1;
    } else {
      correctedGroups.push(groups[index]);
    }
  }

  const realTime = ((duration / 1000) * fps) / 240;

  const correctedInterval = realTime / correctedGroups.length;

  return { realTime, correctedInterval, correctedGroups };
}

// obtener primer indice rama ascendente
export function obtenerIndexRamaAscendente(array) {
  const median = numbers.statistic.mode(array);

  const primerIndexRamaAscendente = array.findIndex(
    (el, index) =>
      el > median &&
      el < array[index + 1] &&
      el < array[index + 2] &&
      el < array[index + 3] &&
      el < array[index + 4] &&
      el > median * 0.9
  );
  return primerIndexRamaAscendente;
}

// filtrar valores repetidos en array de marcadores

export function filtrarRepetidosMarcadores(
  alpha,
  beta,
  gamma,
  lambda,
  epsilon,
  correctedGroups
) {
  const newAlpha = [];
  const newBeta = [];
  const newGamma = [];
  const newLambda = [];
  const newEpsilon = [];

  correctedGroups.map((el, i) => {
    alpha.map((element, index) => {
      if (element.milliseconds === el[0].milliseconds) {
        newAlpha.push(alpha[index]);
        newBeta.push(beta[index]);
        newGamma.push(gamma[index]);
        newLambda.push(lambda[index]);
        newEpsilon.push(epsilon[index]);
      }
    });
  });

  return { newAlpha, newBeta, newGamma, newLambda, newEpsilon };
}
export function filtrarRepetidosMarcadoresJump(
  alpha,
  beta,
  gamma,
  lambda,
  epsilon,
  correctedGroups
) {
  const newAlpha0 = [];
  const newBeta0 = [];
  const newGamma0 = [];
  const newLambda0 = [];
  const newEpsilon0 = [];

  correctedGroups.map((el, i) => {
    alpha.map((element, index) => {
      if (element.milliseconds === el[0].milliseconds) {
        newAlpha0.push(alpha[index]);
        newBeta0.push(beta[index]);
        newGamma0.push(gamma[index]);
        newLambda0.push(lambda[index]);
        newEpsilon0.push(epsilon[index]);
      }
    });
  });
  const newAlpha = [];
  const newBeta = [];
  const newGamma = [];
  const newLambda = [];
  const newEpsilon = [];

  const index0 = newAlpha0.findIndex(
    (el, index) =>
      el.y > newAlpha0[index + 2].y &&
      el.y > newAlpha0[index + 4].y &&
      el.y > newAlpha0[index + 6].y &&
      el.y > newAlpha0[index + 8].y &&
      el.y > newAlpha0[index + 10].y
  );
  newAlpha0.map((el, index) => {
    if (index > index0) {
      newAlpha.push(newAlpha0[index]);
      newBeta.push(newBeta0[index]);
      newGamma.push(newGamma0[index]);
      newLambda.push(newLambda0[index]);
      newEpsilon.push(newEpsilon0[index]);
    }
  });

  return { newAlpha, newBeta, newGamma, newLambda, newEpsilon };
}

export const getIntervalRealArray = (array) => {
  let intervalTimeCount = 0;
  const intervalRealArray = [];
  for (let index = 0; index < array.length - 1; index++) {
    intervalTimeCount +=
      array[index + 1].milliseconds - array[index].milliseconds;

    intervalRealArray.push(intervalTimeCount);
  }

  return intervalRealArray;
};
export const getSecondsIntervalRealArray = (array, fps) => {
  const intervalSecondsRealArray = [];
  array.map((el) =>
    intervalSecondsRealArray.push(
      Number((((el / 1000) * fps) / 240).toFixed(4))
    )
  );

  return intervalSecondsRealArray;
};
export const getIntervalBetweenIndexes = (array, aIndex, bIndex) => {
  const arrayBetweenIndexes = [];

  array.map((el, index) => {
    if (index >= aIndex && index <= bIndex) {
      arrayBetweenIndexes.push(el);
    }
  });
  return arrayBetweenIndexes;
};

export function findCrossingPoints(arr, mean) {
  let crossingPoints = [];

  for (let i = 1; i < arr.length; i++) {
    if (
      (arr[i - 1] < mean && arr[i] >= mean) ||
      (arr[i - 1] > mean && arr[i] <= mean)
    ) {
      // Encontrar el punto exacto de cruce usando interpolación lineal
      let x0 = i - 1;
      let x1 = i;
      let y0 = arr[x0];
      let y1 = arr[x1];

      // La fórmula de interpolación lineal para encontrar el punto exacto de cruce
      let xCross = x0 + (mean - y0) / (y1 - y0);
      crossingPoints.push(Math.ceil(xCross));
    }
  }

  return crossingPoints;
}

export function obtenerImpares(array) {
  return array.filter(function (numero) {
    return numero % 2 !== 0;
  });
}

export function graficoDerivadas(
  containerId,
  timeArray,
  xMaxToEvenDerivada,
  xMaxToEvenDerivadaName,
  yMaxToEvenDerivada,
  yMaxToEvenDerivadaName
) {
  // Obtener el contenedor donde se agregarán los canvas
  const container = document.getElementById(containerId);

  // Limpiar el contenedor antes de agregar nuevos canvas
  container.innerHTML = "";

  // Iterar sobre los arrays para crear gráficos individuales

  for (let index = 0; index < xMaxToEvenDerivada.length - 1; index++) {
    const variable1 = xMaxToEvenDerivada[index];
    const variable2 = yMaxToEvenDerivada[index];

    // Crear un nuevo elemento canvas
    const canvas = document.createElement("canvas");
    canvas.id = `canvas${index}`;
    canvas.width = 400;
    canvas.height = 200;
    container.appendChild(canvas);

    // Obtener el contexto del nuevo canvas
    const ctx = canvas.getContext("2d");

    // Crear el gráfico con Chart.js
    new Chart(ctx, {
      type: "line",
      data: {
        labels: timeArray[index],
        datasets: [
          {
            label: xMaxToEvenDerivadaName,
            data: variable1,
            borderWidth: 1,
          },
          {
            label: yMaxToEvenDerivadaName,
            data: variable2,
            borderWidth: 1,
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: `ciclo ${index + 1}`,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }
}
export function graficoDosVariablesConfHeight(
  containerId,
  timeArray,
  xMaxToEvenDerivada,
  xMaxToEvenDerivadaName,
  yMaxToEvenDerivada,
  yMaxToEvenDerivadaName
) {
  // Obtener el contenedor donde se agregarán los canvas
  const container = document.getElementById(containerId);

  // Limpiar el contenedor antes de agregar nuevos canvas
  container.innerHTML = "";

  // Iterar sobre los arrays para crear gráficos individuales

  for (let index = 0; index < xMaxToEvenDerivada.length - 1; index++) {
    const variable1 = xMaxToEvenDerivada[index];
    const variable2 = yMaxToEvenDerivada[index];
    const max = Math.max(...xMaxToEvenDerivada[index]);
    const min = Math.min(...xMaxToEvenDerivada[index]);
    // Crear un nuevo elemento canvas
    const canvas = document.createElement("canvas");
    canvas.id = `canvas${index}`;
    canvas.width = 400;
    canvas.height = 200;
    container.appendChild(canvas);

    // Obtener el contexto del nuevo canvas
    const ctx = canvas.getContext("2d");

    // Crear el gráfico con Chart.js
    new Chart(ctx, {
      type: "line",
      data: {
        labels: timeArray[index],
        datasets: [
          {
            label: xMaxToEvenDerivadaName,
            data: variable1,
            borderWidth: 1,
          },
          {
            label: yMaxToEvenDerivadaName,
            data: variable2,
            borderWidth: 1,
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: `ciclo ${index + 1}`,
          },
        },
        scales: {
          y: {
            max: min - 5, // Ajusta el valor máximo del eje Y
            min: max + 5, // Ajusta el valor mínimo del eje Y
          },
        },
      },
    });
  }
}

export function integrateByTrapezoid(data, intervals) {
  if (data.length !== intervals.length) {
    throw new Error(
      "Los arrays de datos y de intervalos deben tener la misma longitud."
    );
  }

  let integral = 0;

  for (let i = 1; i < data.length; i++) {
    let h = intervals[i] - intervals[i - 1];
    integral += 0.5 * h * (data[i] + data[i - 1]);
  }

  return integral;
}

// detectar detectar el mínimo de los maximos

export const getMinToMax = (array) => {
  const epsilonYMax = Math.max(...array);
  const epsilonYMin = Math.min(...array);
  const meanValue0 = (epsilonYMax + 20 - epsilonYMin) / 2 + epsilonYMin;
  // seleccionamos los máximos por arriba del meanValue y de esos deleccionamos el mínimo para ajustar el corte lo mas arriba posible
  const maxValues = [];
  for (let i = 0; i < array.length - 10; i++) {
    if (array[i] > meanValue0) {
      if (
        array[i] >= array[i - 1] &&
        array[i] >= array[i - 2] &&
        array[i] >= array[i - 3] &&
        array[i] >= array[i + 1] &&
        array[i] >= array[i + 2] &&
        array[i] >= array[i + 3]
      )
        maxValues.push(array[i]);
    }
  }

  const minimoDeMaximos = Math.min(...maxValues);
  // le restamos 5 al minimo de maximos para que corte el ciclo y no sea tangente
  const meanValue = minimoDeMaximos - 5;

  return meanValue;
};

export const ladoDelVideo = (alpha) => {
  let ladoVista = "";
  if (alpha[0].x - alpha[10].x < 0) {
    ladoVista = "izquierda";
  } else {
    ladoVista = "derecha";
  }
  return ladoVista;
};

export const getArraysBetweenCrosess = (
  crossings,
  epsilonX,
  epsilonY,
  lambdaX,
  lambdaY
) => {
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
        eXarray.push(epsilonX[i]);
        lYarray.push(lambdaY[i]);
        lXarray.push(lambdaX[i]);
        eYarrayIndex.push({ index: i, y: epsilonY[i] });
        eXarrayIndex.push({ index: i, x: epsilonX[i] });
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

  return {
    epsilonYIndexesArrays,
    epsilonXIndexesArrays,
    lambdaYIndexesArrays,
    lambdaXIndexesArrays,
    epsilonYIndexesArraysIndex,
    epsilonXIndexesArraysIndex,
    lambdaYIndexesArraysIndex,
    lambdaXIndexesArraysIndex,
  };
};

export const getMaxEpsilonXOddIndexes = (epsilonXIndexesArrays, crossings) => {
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
        nextIndex: crossings[index + 1],
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

  return { maxEpsilonXOddIndex, maxEpsilonXOddIndex2 };
};

// obtener array entre impar y par
export const getArrayOddEvenIndexes = (
  maxEpsilonXOddIndex2,
  intervalRealArray,
  crossings,
  epsilonX,
  epsilonY,
  lambdaX,
  lambdaY,
  intervalSecondsRealArray
) => {
  // para graficar vamos a obtener el array de tiempo que corresponde a cada derivada

  const chartXmaxXtoEven = [];
  const chartXmaxYtoEven = [];
  const chartXmaxYtoEvenTime = [];
  const xOddIndexEvenIndexEpsilon = [];
  const yOddIndexEvenIndexEpsilon = [];
  const xOddIndexEvenIndexLambda = [];
  const yOddIndexEvenIndexLambda = [];
  const oddIndexEvenIndexEpsilonTime = [];

  maxEpsilonXOddIndex2.map((element, index) => {
    let currentChartXmaxYtoEvenTime = [];
    let currentChartXmaxXtoEven = [];
    let currentChartXmaxYtoEven = [];

    const currentXOddIndexEvenIndexEpsilon = [];
    const currentYOddIndexEvenIndexEpsilon = [];
    const currentXOddIndexEvenIndexLambda = [];
    const currentYOddIndexEvenIndexLambda = [];
    const currentOddIndexEvenIndexEpsilonTime = [];

    if (index % 2 !== 0) {
      intervalRealArray.map((el, i) => {
        if (
          i > maxEpsilonXOddIndex2[index].currentIndex &&
          i < crossings[index + 1]
        ) {
          currentChartXmaxYtoEvenTime.push(intervalSecondsRealArray[i]);
          currentChartXmaxXtoEven.push(epsilonX[i]);
          currentChartXmaxYtoEven.push(epsilonY[i]);
        }
        if (i > crossings[index] && i < crossings[index + 1]) {
          currentXOddIndexEvenIndexEpsilon.push(epsilonX[i]);
          currentYOddIndexEvenIndexEpsilon.push(epsilonY[i]);
          currentXOddIndexEvenIndexLambda.push(lambdaX[i]);
          currentYOddIndexEvenIndexLambda.push(lambdaY[i]);
          currentOddIndexEvenIndexEpsilonTime.push(intervalSecondsRealArray[i]);
        }
      });

      chartXmaxYtoEvenTime.push(currentChartXmaxYtoEvenTime);
      chartXmaxXtoEven.push(currentChartXmaxXtoEven);
      chartXmaxYtoEven.push(currentChartXmaxYtoEven);

      xOddIndexEvenIndexEpsilon.push(currentXOddIndexEvenIndexEpsilon);
      yOddIndexEvenIndexEpsilon.push(currentYOddIndexEvenIndexEpsilon);
      xOddIndexEvenIndexLambda.push(currentXOddIndexEvenIndexLambda);
      yOddIndexEvenIndexLambda.push(currentYOddIndexEvenIndexLambda);
      oddIndexEvenIndexEpsilonTime.push(currentOddIndexEvenIndexEpsilonTime);
    }
  });

  return {
    chartXmaxYtoEvenTime,
    chartXmaxXtoEven,
    chartXmaxYtoEven,
    xOddIndexEvenIndexEpsilon,
    yOddIndexEvenIndexEpsilon,
    xOddIndexEvenIndexLambda,
    yOddIndexEvenIndexLambda,
    oddIndexEvenIndexEpsilonTime,
  };
};

export const getArrayXMaxToEven = (
  maxEpsilonXOddIndex2,
  crossings,
  epsilonX,
  epsilonY,
  lambdaX,
  lambdaY,
  correctedInterval
) => {
  const xMaxToEvenEpsilon = [];
  const yMaxToEvenEpsilon = [];
  const xMaxToEvenLambda = [];
  const yMaxToEvenLambda = [];
  const xMaxToEvenDerivadaEpsilon = [];
  const yMaxToEvenDerivadaEpsilon = [];
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
      // xMaxToEvenDerivadaEpsilon.push(derivada(currentArray, correctedInterval));
      xMaxToEvenDerivadaEpsilon.push(
        movingAverage(derivada(currentArray, correctedInterval), 2)
      );
      yMaxToEvenDerivadaEpsilon.push(
        derivada(currentYArray, correctedInterval)
      );
      xMaxToEvenDerivadaLambda.push(
        derivada(currentArrayLambda, correctedInterval)
      );
      yMaxToEvenDerivadaLambda.push(
        derivada(currentYArrayLambda, correctedInterval)
      );

      xMaxToEvenEpsilon.push(currentArray);
      yMaxToEvenEpsilon.push(currentYArray);
      xMaxToEvenLambda.push(currentArrayLambda);
      yMaxToEvenLambda.push(currentYArrayLambda);
    }
  });

  return {
    xMaxToEvenEpsilon,
    yMaxToEvenEpsilon,
    xMaxToEvenLambda,
    yMaxToEvenLambda,
    xMaxToEvenDerivadaEpsilon,
    yMaxToEvenDerivadaEpsilon,
    xMaxToEvenDerivadaLambda,
    yMaxToEvenDerivadaLambda,
  };
};

export const getInitialContactType = (
  yOddIndexEvenIndexEpsilon,
  yOddIndexEvenIndexLambda,
  crossings,
  epsilonY,
  lambdaY,
  intervalSecondsRealArray,
  correctedInterval,
  xOddIndexEvenIndexEpsilon
) => {
  // restamos los intervaloe entre los indices impar-par. no utilizamos xmax porqur no agarra el cruce

  yOddIndexEvenIndexEpsilon.pop();
  const epsilonLambdaYDiff = [];
  yOddIndexEvenIndexEpsilon.map((element, index) => {
    let currentEpsilonLambdaYDiff = [];

    element.map((el, i) => {
      currentEpsilonLambdaYDiff.push(
        yOddIndexEvenIndexLambda[index][i] - yOddIndexEvenIndexEpsilon[index][i]
      );
    });
    epsilonLambdaYDiff.push(currentEpsilonLambdaYDiff);
  });
  // buscamos los índices donde se encuentra el primer valor negativo
  const firstNegativeIndex = [];
  epsilonLambdaYDiff.map((element, index) => {
    let currentIndex = 0;
    currentIndex = element.findIndex(
      (el, i) => epsilonLambdaYDiff[index][i] < 0
    );
    firstNegativeIndex.push(currentIndex);
  }); // o creamos arrays que contengan los valores negativos para integrarlos
  const epsilonLambdaYDiffArray = [];
  yOddIndexEvenIndexEpsilon.map((element, index) => {
    let currentEpsilonLambdaYDiffArray = [];

    element.map((el, i) => {
      if (
        yOddIndexEvenIndexLambda[index][i] -
          yOddIndexEvenIndexEpsilon[index][i] <
        0
      ) {
        currentEpsilonLambdaYDiffArray.push(
          yOddIndexEvenIndexLambda[index][i] -
            yOddIndexEvenIndexEpsilon[index][i]
        );
      }
    });
    epsilonLambdaYDiffArray.push(currentEpsilonLambdaYDiffArray);
  });
  // ahora sabemos cual es el primer valor negativo de cada array entre index impar y par , sabemos el length y los valores que incluye

  // antes creamos un oddCrosing para obtener los cruces impares

  const oddCrossings = [];
  crossings.map((el, index) => {
    if (index % 2 !== 0) {
      oddCrossings.push(el);
    }
  });

  const crossYEpsilonArray = [];
  const crossYLambdaArray = [];
  const crossTimeArray = [];

  oddCrossings.map((element, index) => {
    const currentsEpsilonCrossArrays = [];
    const currentsLambdaCrossArrays = [];
    const currentsTimeCrossArrays = [];

    epsilonY.map((el, i) => {
      if (
        i > oddCrossings[index] + firstNegativeIndex[index] &&
        i <=
          oddCrossings[index] +
            firstNegativeIndex[index] +
            epsilonLambdaYDiffArray[index].length
      ) {
        currentsEpsilonCrossArrays.push(epsilonY[i]);
        currentsLambdaCrossArrays.push(lambdaY[i]);
        currentsTimeCrossArrays.push(intervalSecondsRealArray[i]);
      }
    });
    crossYEpsilonArray.push(currentsEpsilonCrossArrays);
    crossYLambdaArray.push(currentsLambdaCrossArrays);
    crossTimeArray.push(currentsTimeCrossArrays);
  });
  // vamos a sacar un par de datos de interes como el area que queda bajo el cruce el tiempo que dura y la velocidad a traves de la derivada

  // tiempo que dura el cruce
  const crossTime = [];

  crossTimeArray.map((el, index) => {
    let currentCrossTime =
      crossTimeArray[index][crossTimeArray.length - 1] -
      crossTimeArray[index][0];

    crossTime.push(Number(currentCrossTime.toFixed(4)));
  });

  // área bajo la curva, vamos integrar las curvas y obtener un área

  const crossArea = [];
  epsilonLambdaYDiffArray.map((el, i) => {
    let currentCrossArea = 0;
    el.map((element, index) => {
      currentCrossArea = integrateByTrapezoid(
        epsilonLambdaYDiffArray[i],
        crossTimeArray[i]
      );
    });
    crossArea.push(Number(Math.abs(currentCrossArea.toFixed(4))));
  });

  // obtenemos la media del cruce para ver si es contacto talón o antepié, y planteamos un condicional para renderizar condicionalmente
  crossArea.pop();
  let crossAreaMean = numbers.statistic.mean(crossArea);

  let initialContactType = "";
  if (crossAreaMean < 0.05) {
    initialContactType = "midfoot";
  } else {
    initialContactType = "rearfoot";
  }
  // ahora derivamos para ver el comportamiento durante el contacto inicial

  const crossDerivadaEpsilon = [];
  const crossDerivadaLambda = [];
  crossYEpsilonArray.map((element, index) => {
    let currentCrossDerivadaEpsilon = [];
    let currentCrossDerivadaLambda = [];

    currentCrossDerivadaEpsilon = derivada(
      crossYEpsilonArray[index],
      correctedInterval
    );

    currentCrossDerivadaLambda = derivada(
      crossYLambdaArray[index],
      correctedInterval
    );

    crossDerivadaEpsilon.push(currentCrossDerivadaEpsilon);
    crossDerivadaLambda.push(currentCrossDerivadaLambda);
  });
  // derivamos la zona de apoyo pero no tenemos referencia de cruces, entonces derivamos todo el intervalo entre el index impar y par
  const notCrossDerivadaEpsilon = [];
  const xNotCrossDerivadaEpsilon = [];
  const notCrossDerivadaLambda = [];

  yOddIndexEvenIndexEpsilon.map((element, index) => {
    let currentNotCrossDerivadaEpsilon = [];
    let currentXNotCrossDerivadaEpsilon = [];
    let currentNotCrossDerivadaLambda = [];

    currentNotCrossDerivadaEpsilon = derivada(
      yOddIndexEvenIndexEpsilon[index],
      correctedInterval
    );
    currentXNotCrossDerivadaEpsilon = derivada(
      xOddIndexEvenIndexEpsilon[index],
      correctedInterval
    );

    currentNotCrossDerivadaLambda = derivada(
      yOddIndexEvenIndexLambda[index],
      correctedInterval
    );

    notCrossDerivadaEpsilon.push(currentNotCrossDerivadaEpsilon);
    xNotCrossDerivadaEpsilon.push(currentXNotCrossDerivadaEpsilon);
    notCrossDerivadaLambda.push(currentNotCrossDerivadaLambda);
  });

  return { initialContactType, oddCrossings };
};

export const getInitialcontact = (
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
) => {
  // como las velocidades constantes tienen mayor frecuencia vamos a sacar el modo de ambas velocdadesm, los vamos a restar y vamos a tomar un porcentaje de esa diferencia para localizar el punto de separación próximo a la estabilización

  // creamos un array con las diferencias y un array con los modos de cada array
  const xYMaxToEvenDerivadaLambdaDiff = [];
  const xYMaxToEvenDerivadaLambda = [];

  // para midfoot
  const xYMaxToEvenDerivadaEpsilonDiff = [];
  const xYMaxToEvenDerivadaEpsilon = [];

  xMaxToEvenDerivadaLambda.map((el, i) => {
    xYMaxToEvenDerivadaLambdaDiff.push(
      numbers.statistic.mode(yMaxToEvenDerivadaLambda[i]) -
        numbers.statistic.mode(xMaxToEvenDerivadaLambda[i])
    );
  });
  xMaxToEvenDerivadaEpsilon.map((el, i) => {
    console.log(
      `ciclo ${i + 1}`,
      0 - numbers.statistic.mode(xMaxToEvenDerivadaEpsilon[i])
    );

    xYMaxToEvenDerivadaEpsilonDiff.push(
      0 - numbers.statistic.mode(xMaxToEvenDerivadaEpsilon[i])
    );
  });

  xMaxToEvenDerivadaLambda.map((el, i) => {
    const currentArrayLambda = [];

    el.map((element, index) => {
      currentArrayLambda.push(
        yMaxToEvenDerivadaLambda[i][index] - xMaxToEvenDerivadaLambda[i][index]
      );
    });
    xYMaxToEvenDerivadaLambda.push(currentArrayLambda);
  });

  xMaxToEvenDerivadaEpsilon.map((el, i) => {
    const currentArrayEpsilon = [];
    el.map((element, index) => {
      currentArrayEpsilon.push(
        yMaxToEvenDerivadaEpsilon[i][index] -
          xMaxToEvenDerivadaEpsilon[i][index]
      );
    });

    xYMaxToEvenDerivadaEpsilon.push(currentArrayEpsilon);
  });

  // Ahora buscamos el índice donde la diferenca es del 80%

  const localInitialContactIndexLambda = [];

  xYMaxToEvenDerivadaLambda.map((el, i) => {
    const currentIndexLambda = el.findIndex(
      (element, index) => element > xYMaxToEvenDerivadaLambdaDiff[i] * 0.9
    );
    localInitialContactIndexLambda.push(currentIndexLambda);
  });

  const localInitialContactIndexEpsilon = [];
  xYMaxToEvenDerivadaEpsilon.map((el, i) => {
    const currentIndexEpsilon = el.findIndex(
      (element, index) => element > xYMaxToEvenDerivadaEpsilonDiff[i] * 0.8
    );
    localInitialContactIndexEpsilon.push(currentIndexEpsilon);
  });

  // ahora localInitialContactIndex tiene los índices locales, o sea a partir de x max de contacto inicial con talon (lambda)
  const initialContactIndexLambda = [];
  const initialContactIndexEpsilon = [];

  maxEpsilonXOddIndex.map((el, index) => {
    initialContactIndexLambda.push(
      localInitialContactIndexLambda[index] + el.currentIndex
    );
    initialContactIndexEpsilon.push(
      localInitialContactIndexEpsilon[index] + el.currentIndex
    );
  });

  // y con el indice en el array general obtenemos el instante del despegue

  // buscamos los angulos lambdaépsilon, construyamos un objeto con todos los datos de x y y en el contacto inicial, tanto para lambda como para epsilo. enfoque vista izquierda

  const initialContactArray = [];
  const initialContactFootVector = [];
  intervalSecondsRealArray.map((element, index) => {
    initialContactIndexLambda.map((el, i) => {
      if (index === el) {
        initialContactFootVector.push([
          epsilonX[index] - lambdaX[index],
          epsilonY[index] - lambdaY[index],
        ]);
        initialContactArray.push([
          {
            index: el,
            lambdaX: lambdaX[index],
            lambdaY: lambdaY[index],
            epsilonX: epsilonX[index],
            epsilonY: epsilonY[index],
            time: intervalSecondsRealArray[index],
          },
        ]);
      }
    });
  });

  // para la horizontal: tenemos initialContactIndexEpsilon que tiene los indices del contacto inicial, y maxEpsilonXOddIndex que tiene un array de objetos donde next index es el indice

  // generamos un arreglo con los valores de derivada y de epsilon que son ingual a cero, capturamos donde está el primer cero y el último de cada arreglo

  // intervalSecondsRealArray.map((element, index)=>{
  //   maxEpsilonXOddIndex.map
  // })

  // intervalSecondsRealArray.map((element, index) => {
  //   maxEpsilonXOddIndex.map((el, i) => {
  //     console.log(el.currentIndex);
  //   });
  // });

  // para vista izquierda

  // creamos un array con los tiempos de toeofff

  const initialContactTimeLambda = initialContactIndexLambda.map(
    (el, index) => intervalSecondsRealArray[el]
  );
  const initialContactTimeEpsilon = initialContactIndexEpsilon.map(
    (el, index) => intervalSecondsRealArray[el]
  );
  // console.log("toe off time", initialContactTime);

  // tenemos que encontrar a que tiempo corresponde para saber el contacto inicial y el tiempo de concacto

  const contactTimeLambda = toeoffTime.map((el, index) =>
    Number((el - initialContactTimeLambda[index]).toFixed(4))
  );
  const contactTimeEpsilon = toeoffTime.map((el, index) =>
    Number((el - initialContactTimeEpsilon[index]).toFixed(4))
  );

  // inserción en el dom de los datos de contacto
  const dataTableContact = [];
  // const indexesArray = [];
  const dataTableContactArray = [];
  toeoffTime.map((el, index) => {
    // cambiar este a talon
    if (initialContactType === "midfoot") {
      dataTableContact.push([
        `ciclo ${index + 1}`,
        `${initialContactTimeLambda[index]} s`,
        `${toeoffTime[index]} s`,
        `${contactTimeLambda[index]} s`,
      ]);
      dataTableContactArray.push([
        { ciclo: index + 1 },
        {
          initialContactTime: initialContactTimeLambda[index],
        },
        { toeoffTime: toeoffTime[index] },
        { contcactTime: contactTimeLambda[index] },
      ]);
    }
    // descometar este
    // if (initialContactType === "midfoot") {
    //   dataTableContact.push([
    //     `ciclo ${index + 1}`,
    //     `${initialContactTimeEpsilon[index]} s`,
    //     `${toeoffTime[index]} s`,
    //     `${contactTimeEpsilon[index]} s`,
    //   ]);
    //   dataTableContactArray.push([
    //     { type: initialContactType },
    //     { ciclo: index + 1 },
    //     {
    //       initialContactTime: initialContactTimeEpsilon[index],
    //     },
    //     { toeoffTime: toeoffTime[index] },
    //     { contcactTime: contactTimeEpsilon[index] },
    //   ]);
    // }
  });

  return {
    dataTableContact,
    dataTableContactArray,
    initialContactArray,
    initialContactIndexEpsilon,
    initialContactFootVector,
  };
};

export function movingAverage(data, windowSize) {
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

export const getFiveElementsGroups = (groups) => {
  const lastFiveLengthGroupsIndex = groups.findIndex((el) => el.length < 5);
  let fiveElementsGroups = [];

  let newGroups = [];
  if (lastFiveLengthGroupsIndex !== -1) {
    groups.map((el, index) => {
      if (index < lastFiveLengthGroupsIndex) {
        fiveElementsGroups.push(el);
      }
    });
  } else {
    fiveElementsGroups = groups;
  }

  newGroups = fiveElementsGroups.filter(
    (el, index) => el[4].milliseconds - el[0].milliseconds <= 10
  );

  return newGroups;
};

export const getAverageDeleteExtremes = (data) => {
  // Filtramos los elementos que tienen contactTime negativo o cero
  let filteredData = data.filter((item) => {
    const contactTime = item[3]?.contcactTime;
    return contactTime > 0;
  });

  // Si el arreglo filtrado está vacío después del primer filtro, devolvemos el arreglo vacío y los promedios calculados
  if (filteredData.length === 0) {
    return {
      filtered: [],
      averages: { initialContactTime: 0, toeoffTime: 0, contactTime: 0 },
    };
  }

  // Encontrar los valores extremos de contactTime
  let contactTimes = filteredData.map((item) => item[3].contcactTime);
  let maxContactTime = Math.max(...contactTimes);
  let minContactTime = Math.min(...contactTimes);

  // Filtrar los elementos con los valores extremos de contactTime
  filteredData = filteredData.filter((item) => {
    const contactTime = item[3].contcactTime;
    return contactTime !== maxContactTime && contactTime !== minContactTime;
  });

  // Calcular los promedios de initialContactTime, toeoffTime y contactTime

  let contactTimesFiltered = filteredData.map((item) => item[3].contcactTime);

  let averageContactTime =
    contactTimesFiltered.reduce((a, b) => a + b, 0) /
      contactTimesFiltered.length || 0;

  // Retornar el arreglo filtrado y los promedios
  return {
    filtered: filteredData,
    averages: {
      contactTime: averageContactTime,
    },
  };
};

export const getHorizontalVector = (
  maxEpsilonXOddIndex2,
  crossings,
  intervalSecondsRealArray,
  epsilonX,
  epsilonY,
  initialContactIndexEpsilon,
  yMaxToEvenDerivadaEpsilon
) => {
  const maxToEvenEpsilonArray = [];
  maxEpsilonXOddIndex2.map((element, index) => {
    let currentMaxToEvenEpsilonArray = [];
    if (index % 2 !== 0) {
      intervalSecondsRealArray.map((el, i) => {
        if (
          i > maxEpsilonXOddIndex2[index].currentIndex &&
          i < crossings[index + 1]
        ) {
          currentMaxToEvenEpsilonArray.push({
            index: i,
            xPosition: epsilonX[i],
            yPosition: epsilonY[i],
            time: intervalSecondsRealArray[i],
          });
        }
      });
      maxToEvenEpsilonArray.push(currentMaxToEvenEpsilonArray);
    }
  });
  const initialContactIndexEpsilonTime = [];
  initialContactIndexEpsilon.map((el, index) => {
    intervalSecondsRealArray.map((int, i) => {
      if (i === el) {
        initialContactIndexEpsilonTime.push(int);
      }
    });
  });

  const yMaxToEvennZerosArray = [];

  yMaxToEvenDerivadaEpsilon.map((element, index) => {
    const zeroArray = [];

    element.map((el, i) => {
      if (
        el === 0 &&
        maxToEvenEpsilonArray[index][i].time >
          initialContactIndexEpsilonTime[index]
      ) {
        zeroArray.push({
          value: el,
          xPosition: maxToEvenEpsilonArray[index][i].xPosition,
          yPosition: maxToEvenEpsilonArray[index][i].yPosition,
          time: maxToEvenEpsilonArray[index][i].time,
        });
      }
    });
    yMaxToEvennZerosArray.push(zeroArray);
  });

  // vista izquierda
  const horizontalVextor = [];
  yMaxToEvennZerosArray.map((array, arrayIndex) => {
    if (array.length !== 0) {
      horizontalVextor.push([
        array[0].xPosition - array[array.length - 1].xPosition,
        array[0].yPosition - array[array.length - 1].yPosition,
      ]);
    }
  });

  return { yMaxToEvennZerosArray, horizontalVextor };
};

export const getHorizontalFootAngleArray = (
  horizontalVextor,
  initialContactFootVector
) => {
  const footAngleArray = [];

  let currentAngle = 0;
  horizontalVextor.map((el, index) => {
    const dotProduct =
      initialContactFootVector[index][0] * horizontalVextor[index][0] +
      initialContactFootVector[index][1] * horizontalVextor[index][1];

    const uModule = Math.sqrt(
      Math.pow(initialContactFootVector[index][0], 2) +
        Math.pow(initialContactFootVector[index][1], 2)
    );
    const wModule = Math.sqrt(
      Math.pow(horizontalVextor[index][0], 2) +
        Math.pow(horizontalVextor[index][1], 2)
    );
    const moduleProducts = uModule * wModule;

    const radianAngle = Math.acos(dotProduct / moduleProducts);
    const gradAngle = parseInt((radianAngle * 180) / Math.PI);

    footAngleArray.push(gradAngle);
  });

  footAngleArray.pop();

  let suma = footAngleArray.reduce((acumulador, numero) => {
    return acumulador + numero;
  }, 0);

  // Calculamos el promedio dividiendo la suma entre la cantidad de elementos
  let footAngleMean = parseInt(suma / footAngleArray.length);
  return { footAngleArray, footAngleMean };
};

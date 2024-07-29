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

export function obtenerAngulos(alpha, beta, gamma, lambda, epsilon) {
  const el = [
    { x: 291, y: 590, milliseconds: 1717380326188 },
    { x: 360, y: 397, milliseconds: 1717380326188 },
    { x: 303, y: 195, milliseconds: 1717380326188 },
  ];
  const VerticalVector = [0, el[0].y - el[1].y];
  const hipDopProduct = (el[0].y - el[1].y) * (el[0].y - el[1].y);
  const VericalModule = Math.sqrt(Math.pow(Math.pow(el[0].y - el[1].y, 2)));

  const musloVector = [el[0].x - el[1].x, el[0].y - el[1].y];
  const piernaVector = [el[2].x - el[1].x, el[2].y - el[1].y];
  const dotProduct =
    (el[0].x - el[1].x) * (el[2].x - el[1].x) +
    (el[0].y - el[1].y) * (el[2].y - el[1].y);
  const musloModule = Math.sqrt(
    Math.pow(el[0].x - el[1].x, 2) + Math.pow(el[0].y - el[1].y, 2)
  );
  const piernaModule = Math.sqrt(
    Math.pow(el[1].x - el[2].x, 2) + Math.pow(el[1].y - el[2].y, 2)
  );

  // angles----------------
  const hipAngle = [];
  const kneeAngle = [];
  const ankleAngle = [];

  for (let index = 0; index < alpha.length - 1; index++) {
    if (alpha[0].x - alpha[10].x < 0) {
      kneeAngle.push(
        (Math.acos(
          ((beta[index].xr - alpha[index].xr) *
            (gamma[index].xr - beta[index].xr) +
            (beta[index].y - alpha[index].y) *
              (gamma[index].y - beta[index].y)) /
            (Math.sqrt(
              Math.pow(alpha[index].xr - beta[index].xr, 2) +
                Math.pow(alpha[index].y - beta[index].y, 2)
            ) *
              Math.sqrt(
                Math.pow(beta[index].xr - gamma[index].xr, 2) +
                  Math.pow(beta[index].y - gamma[index].y, 2)
              ))
        ) *
          180) /
          Math.PI
      );
      ankleAngle.push(
        (Math.acos(
          ((epsilon[index].xr - lambda[index].xr) *
            (gamma[index].xr - beta[index].xr) +
            (epsilon[index].y - lambda[index].y) *
              (gamma[index].y - beta[index].y)) /
            (Math.sqrt(
              Math.pow(epsilon[index].xr - lambda[index].xr, 2) +
                Math.pow(epsilon[index].y - lambda[index].y, 2)
            ) *
              Math.sqrt(
                Math.pow(beta[index].xr - gamma[index].xr, 2) +
                  Math.pow(beta[index].y - gamma[index].y, 2)
              ))
        ) *
          180) /
          Math.PI
      );

      hipAngle.push(
        ((Math.asin(
          (alpha[index].xr - beta[index].xr) /
            Math.sqrt(
              Math.pow(alpha[index].xr - beta[index].xr, 2) +
                Math.pow(alpha[index].y - beta[index].y, 2)
            )
        ) *
          180) /
          Math.PI) *
          -1
      );
    } else {
      kneeAngle.push(
        (Math.acos(
          ((beta[index].x - alpha[index].x) * (gamma[index].x - beta[index].x) +
            (beta[index].y - alpha[index].y) *
              (gamma[index].y - beta[index].y)) /
            (Math.sqrt(
              Math.pow(alpha[index].x - beta[index].x, 2) +
                Math.pow(alpha[index].y - beta[index].y, 2)
            ) *
              Math.sqrt(
                Math.pow(beta[index].x - gamma[index].x, 2) +
                  Math.pow(beta[index].y - gamma[index].y, 2)
              ))
        ) *
          180) /
          Math.PI
      );
      ankleAngle.push(
        (Math.acos(
          ((epsilon[index].x - lambda[index].x) *
            (gamma[index].x - beta[index].x) +
            (epsilon[index].y - lambda[index].y) *
              (gamma[index].y - beta[index].y)) /
            (Math.sqrt(
              Math.pow(epsilon[index].x - lambda[index].x, 2) +
                Math.pow(epsilon[index].y - lambda[index].y, 2)
            ) *
              Math.sqrt(
                Math.pow(beta[index].x - gamma[index].x, 2) +
                  Math.pow(beta[index].y - gamma[index].y, 2)
              ))
        ) *
          180) /
          Math.PI
      );

      hipAngle.push(
        ((Math.asin(
          (alpha[index].x - beta[index].x) /
            Math.sqrt(
              Math.pow(alpha[index].x - beta[index].x, 2) +
                Math.pow(alpha[index].y - beta[index].y, 2)
            )
        ) *
          180) /
          Math.PI) *
          -1
      );
    }
  }
  return { hipAngle, kneeAngle, ankleAngle };
}

// funcion para obtener los puntos en x y y de cada marcador
// console.log(alpha, beta, gamma, lambda, epsilon);
export function gota(alpha, beta, gamma, lambda, epsilon) {
  console.log(alpha[0].x - alpha[10].x);

  if (alpha[0].x - alpha[10].x < 0) {
    console.log("invertido");
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
  const median = numbers.statistic.median(array);

  const primerIndexRamaAscendente = array.findIndex(
    (el, index) =>
      el > median &&
      el < array[index + 1] &&
      el < array[index + 2] &&
      el < array[index + 3] &&
      el < array[index + 4] &&
      el < array[index + 5] &&
      el < array[index + 6] &&
      el < array[index + 7] &&
      el < array[index + 8]
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

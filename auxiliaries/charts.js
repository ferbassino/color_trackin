export function graficoUnaVariable(ctx, timeArray, variable, variableName) {
  new Chart(ctx, {
    type: "line",
    data: {
      labels: timeArray,
      datasets: [
        {
          label: variableName,
          data: variable,
          borderWidth: 1,
        },
        // {
        //   label: "hip",
        //   data: hipAngle,
        //   borderWidth: 1,
        // },
        // {
        //   label: "ankle",
        //   data: ankleAngle,
        //   borderWidth: 1,
        // },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

export function graficoDosVariables(
  ctx,
  timeArray,
  variable1,
  variable1Name,
  variable2,
  variable2Name
) {
  new Chart(ctx, {
    type: "line",
    data: {
      labels: timeArray,
      datasets: [
        {
          label: variable1Name,
          data: variable1,
          borderWidth: 1,
        },
        {
          label: variable2Name,
          data: variable2,
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}
export function graficoTresVariables(
  ctx,
  timeArray,
  variable1,
  variable1Name,
  variable2,
  variable2Name,
  variable3,
  variable3Name
) {
  new Chart(ctx, {
    type: "line",
    data: {
      labels: timeArray,
      datasets: [
        {
          label: variable1Name,
          data: variable1,
          borderWidth: 3,
          pointRadius: 0,
        },
        {
          label: variable2Name,
          data: variable2,
          borderWidth: 3,
          pointRadius: 0,
        },
        {
          label: variable3Name,
          data: variable3,
          borderWidth: 3,
          pointRadius: 0,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}
export function graficoCuatroVariables(
  ctx,
  timeArray,
  variable1,
  variable1Name,
  variable2,
  variable2Name,
  variable3,
  variable3Name,
  variable4,
  variable4Name
) {
  new Chart(ctx, {
    type: "line",
    data: {
      labels: timeArray,
      datasets: [
        {
          label: variable1Name,
          data: variable1,
          borderWidth: 3,
          pointRadius: 0,
        },
        {
          label: variable2Name,
          data: variable2,
          borderWidth: 3,
          pointRadius: 0,
        },
        {
          label: variable3Name,
          data: variable3,
          borderWidth: 3,
          pointRadius: 0,
        },
        {
          label: variable4Name,
          data: variable4,
          borderWidth: 3,
          pointRadius: 0,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

// grafico de dispersión

export function graficoDeDispersión(
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
) {
  var layout = {
    width: 1000,
    height: 800,
    xaxis: { range: [0, 430] },
    yaxis: { range: [200, 700] },
  };

  Plotly.newPlot(
    TESTER,
    [
      {
        x: alphaX,
        y: alphaY,
        type: "scatter",
        mode: "markers",
        name: "trocanter",
        marker: {
          size: 2,
        },
      },
      {
        x: betaX,
        y: betaY,
        type: "scatter",
        mode: "markers",
        name: "cóndilo",
        marker: {
          size: 2,
        },
      },
      {
        x: gammaX,
        y: gammaY,
        type: "scatter",
        mode: "markers",
        name: "maleolo",
        marker: {
          size: 1,
        },
      },
      {
        x: lambdaX,
        y: lambdaY,
        type: "scatter",
        mode: "markers",
        name: "calcaneo",
        marker: {
          size: 2,
        },
      },
      {
        x: epsilonX,
        y: epsilonY,
        type: "scatter",
        mode: "markers",
        name: "quinto m",
        marker: {
          size: 2,
        },
      },
    ],
    layout,

    {
      margin: { t: 0 },
    }
  );
}

export function graficoDeUnaVariable(TESTER2, dataArray, timeArray) {
  var trace1 = {
    x: timeArray,
    y: dataArray,
    type: "scatter",
  };

  var data = [trace1];

  Plotly.newPlot(TESTER2, data);
}

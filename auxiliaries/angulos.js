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

window.onload = function () {
  // stats---------------------------------
  var fps = 0;
  var Frames = function () {
    var l = Date.now(),
      m = l,
      g = 0,
      n = Infinity,
      o = 0,
      p = Infinity,
      q = 0,
      r = 0;

    return {
      REVISION: 11,

      begin: function () {
        l = Date.now();
      },
      end: function () {
        var b = Date.now();
        g = b - l;
        n = Math.min(n, g);
        o = Math.max(o, g);
        var a = Math.min(30, 30 - 30 * (g / 200));
        r++;
        b > m + 1e3 &&
          ((fps = Math.round((1e3 * r) / (b - m))),
          (p = Math.min(p, fps)),
          (q = Math.max(q, fps)),
          (a = Math.min(30, 30 - 30 * (frames / 100))),
          (m = b),
          (r = 0));

        return b;
      },
      update: function () {
        l = this.end();
      },
    };
  };

  var frames = new Frames();

  frames.begin();

  tracking.ColorTracker.prototype.emit = function () {
    frames.end();
    colorEmit_.apply(this, arguments);
  };

  // stats---------------------------------
  // const elbowAngle = document.getElementById("codo");
  const velocidadY = document.getElementById("velocidad");
  const distanciaY = document.getElementById("distancia");

  var video = document.getElementById("video");
  var canvas = document.getElementById("canvas");
  var context = canvas.getContext("2d");
  var tracker = new tracking.ColorTracker();

  // puntos
  var xYellow;
  var yYellow;
  var xCyan;
  var yCyan;
  var xMagenta;
  var yMagenta;

  //vectores
  var arm;
  var foreArm;

  //angulo
  var angle;
  tracking.track("#video", tracker, { camera: true });

  //calibracion
  const pixelCm = 0.0033;
  var y;
  let array = [];
  tracker.on("track", function (event) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    event.data.forEach(function (rect) {
      if (rect.color === "custom") {
        rect.color = tracker.customColor;
      }
      if (rect.color === "yellow") {
        xYellow = rect.x;
        yYellow = rect.y;
      }
      if (rect.color === "cyan") {
        xCyan = rect.x;
        yCyan = rect.y;
      }
      if (rect.color === "magenta") {
        xMagenta = rect.x;
        yMagenta = rect.y;
      }

      arm = [xYellow - xCyan, yYellow - yCyan];
      foreArm = [xMagenta - xCyan, yMagenta - yCyan];

      // dot
      var dotProduct = arm[0] * foreArm[0] + arm[1] * foreArm[1];
      var armModuleProduct = Math.sqrt(
        Math.pow(arm[0], 2) + Math.pow(arm[1], 2)
      );
      var foreArmModuleProduct = Math.sqrt(
        Math.pow(foreArm[0], 2) + Math.pow(foreArm[1], 2)
      );
      var modulesProduct = armModuleProduct * foreArmModuleProduct;
      angle = parseInt(
        (Math.acos(dotProduct / modulesProduct) * 180) / Math.PI
      );

      // velocidad

      array.push(Number((rect.y * pixelCm).toFixed(4)));
      // elbowAngle.innerHTML = angle;
      let fourInterval = (1 / fps) * 4;
      let yVelocity = Number(((array[3] - array[0]) / fourInterval).toFixed(2));
      console.log(yVelocity);

      if (array.length > 3) {
        array.shift();
      }
      distanciaY.innerHTML = (rect.y * pixelCm).toFixed(2);
      velocidadY.innerHTML = yVelocity;
      context.strokeStyle = rect.color;
      context.strokeRect(rect.x, rect.y, rect.width, rect.height);
      context.font = "11px Helvetica";
      context.fillStyle = "#fff";
      // context.fillText(
      //   "x: " + parseInt(rect.x * pixelCm) + "cm",
      //   rect.x + rect.width + 5,
      //   rect.y + 11 * pixelCm
      // );
      context.fillText(
        "y: " + (rect.y * pixelCm).toFixed(2) + "cm",
        rect.x + rect.width + 5,
        rect.y + 22
      );
      // context.fillText(
      //   "color: " + rect.color,
      //   rect.x + rect.width + 5,
      //   rect.y + 33
      // );
    });
  });
  initGUIControllers(tracker);
};

window.onload = function () {
  const elbowAngle = document.getElementById("codo");

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
      console.log(angle);
      elbowAngle.innerHTML = angle;
      context.strokeStyle = rect.color;
      context.strokeRect(rect.x, rect.y, rect.width, rect.height);
      context.font = "11px Helvetica";
      context.fillStyle = "#fff";
      context.fillText(
        "x: " + rect.x + "px",
        rect.x + rect.width + 5,
        rect.y + 11
      );
      context.fillText(
        "y: " + rect.y + "px",
        rect.x + rect.width + 5,
        rect.y + 22
      );
      context.fillText(
        "color: " + rect.color,
        rect.x + rect.width + 5,
        rect.y + 33
      );
    });
  });

  initGUIControllers(tracker);
};

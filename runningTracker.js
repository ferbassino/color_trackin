document.addEventListener("DOMContentLoaded", function () {
  const button = document.getElementById("init_buton");

  button.addEventListener("click", startTracking);
});

const startButton = document.getElementById("init_buton");
const stopButton = document.getElementById("stopButton");

var video = document.getElementById("videoPlayer");

video.addEventListener("loadedmetadata", function (event) {
  var videoWidth = event.target.videoWidth;
  var videoHeight = event.target.videoHeight;

  localStorage.setItem("videoWidth", JSON.stringify(videoWidth));
  localStorage.setItem("videoHeight", JSON.stringify(videoHeight));
});

document.addEventListener("DOMContentLoaded", function () {
  const fileInput = document.getElementById("fileInput");
  const loadButton = document.getElementById("loadButton");
  const videoSource = document.getElementById("videoSource");

  // Evento de clic en el botón para cargar el video
  loadButton.addEventListener("click", function () {
    fileInput.click(); // Simular clic en el input de tipo file
  });

  // Evento de cambio en el input de tipo file
  fileInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      cargarVideo(file);
    }
  });

  // Función para cargar el video y establecer la URL en la etiqueta source
  function cargarVideo(file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      // Generar la URL del archivo cargado
      const videoURL = event.target.result;

      // Establecer la URL en el atributo src de la etiqueta source
      videoSource.src = videoURL;

      // Opcionalmente, cargar automáticamente el video
      const videoPlayer = document.getElementById("videoPlayer");
      videoPlayer.load();
    };
    // Leer el contenido del archivo como una URL de datos (data URL)
    reader.readAsDataURL(file);

    // initGUIControllers(tracker);
  }
});

const startTracking = () => {
  // ----------frames-----------------------
  var v = document.getElementById("videoPlayer");
  var c = 0; // time of last frame
  var framelength = 1; // length of one frame
  var fps;
  function check(t, m) {
    var diff = Math.abs(m.mediaTime - c); // difference between this frame and the last
    if (diff && diff < framelength) {
      framelength = diff;
      fps = Number((1 / framelength).toFixed(2));
    }
    c = m.mediaTime;
    v.requestVideoFrameCallback(check);

    localStorage.setItem("fps", JSON.stringify(fps));
  }
  v.requestVideoFrameCallback(check);
  // ----------frames-----------------------
  var canvas = document.getElementById("canvas");
  var context = canvas.getContext("2d");

  tracking.ColorTracker.registerColor("white", function (r, g, b) {
    if (r > 200 && g > 200 && b > 200) {
      return true;
    }
    return false;
  });

  var tracker = new tracking.ColorTracker(["white"]);
  tracker.setMinDimension(1);

  const trackingTask = tracking.track("#videoPlayer", tracker);

  trackingTask.run();

  document.getElementById("stopButton").addEventListener("click", function () {
    trackingTask.stop();
  });

  const array = [];
  const init = document.getElementById("init_buton");

  let yPositionInnit = 0;
  let yPositionInnitState = false;

  tracker.on("track", function (event) {
    var videoWidth = JSON.parse(localStorage.getItem("videoWidth"));
    var videoHeight = JSON.parse(localStorage.getItem("videoHeight"));

    context.clearRect(0, 0, videoWidth, videoHeight);

    event.data.forEach(function (rect) {
      array.push({
        x: rect.x,
        y: videoHeight - rect.y,
        milliseconds: Date.now(),
        xr: videoWidth - rect.x,
      });

      localStorage.setItem("array", JSON.stringify(array));

      context.strokeStyle = rect.color;
      context.strokeRect(rect.x, rect.y, rect.width, rect.height);
      context.font = "11px Helvetica";
      context.fillStyle = "#fff";
    });
  });
};
const stopTracking = () => {
  const trackingTask = tracking.track("#videoPlayer", tracker);
  trackingTask.stop();
};

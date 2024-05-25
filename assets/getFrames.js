const getFrames = () => {
  var Frames = function () {
    var l = Date.now(),
      m = l,
      g = 0,
      n = Infinity,
      o = 0,
      frames = 0,
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
          ((frames = Math.round((1e3 * r) / (b - m))),
          (p = Math.min(p, frames)),
          (q = Math.max(q, frames)),
          (a = Math.min(30, 30 - 30 * (frames / 100))),
          (m = b),
          (r = 0));
        console.log(frames);
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
  return frames;
};
export default getFrames;

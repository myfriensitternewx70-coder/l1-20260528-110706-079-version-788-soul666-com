(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('[data-play-button]');
      var cover = shell.querySelector('.player-cover');
      var stream = shell.getAttribute('data-stream');
      var attached = false;
      var hls = null;

      function attach() {
        if (!video || !stream || attached) {
          return;
        }
        attached = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function start() {
        if (!video) {
          return;
        }
        attach();
        shell.classList.add('is-playing');
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener('click', start);
      }
      if (cover) {
        cover.addEventListener('click', start);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!attached) {
            start();
          }
        });
        video.addEventListener('emptied', function () {
          if (hls) {
            hls.destroy();
            hls = null;
          }
          attached = false;
        });
      }
    });
  });
})();

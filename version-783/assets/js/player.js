(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var shell = document.querySelector('[data-player]');

    if (!shell) {
      return;
    }

    var video = shell.querySelector('video');
    var cover = shell.querySelector('[data-play]');
    var stream = shell.getAttribute('data-stream');
    var prepared = false;
    var hlsInstance = null;

    function attachStream() {
      if (prepared || !video || !stream) {
        return;
      }

      prepared = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = stream;
    }

    function startPlay() {
      attachStream();

      if (cover) {
        cover.classList.add('is-hidden');
      }

      if (video) {
        video.controls = true;
        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }
    }

    if (cover) {
      cover.addEventListener('click', startPlay);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlay();
        }
      });

      video.addEventListener('play', function () {
        if (cover) {
          cover.classList.add('is-hidden');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  });
})();

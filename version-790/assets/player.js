(function () {
  function setupPlayer(player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var url = player.getAttribute('data-stream');
    var hls = null;
    var loaded = false;

    function loadVideo() {
      if (loaded || !video || !url) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function playVideo() {
      loadVideo();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        if (cover) {
          cover.classList.add('is-hidden');
        }
      });
      video.addEventListener('emptied', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
          hls = null;
        }
        loaded = false;
      });
    }
  }

  document.querySelectorAll('.js-player').forEach(setupPlayer);
})();

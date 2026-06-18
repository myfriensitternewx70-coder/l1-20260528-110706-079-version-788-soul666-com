(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initFilters() {
    var grid = document.querySelector('[data-search-grid]');
    var empty = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var keyword = normalize(params.get('q'));
    var filters = {
      region: '',
      type: '',
      year: ''
    };

    function cardText(card) {
      return [
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.tags,
        card.textContent
      ].join(' ').toLowerCase();
    }

    function apply() {
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
      var shown = 0;
      cards.forEach(function (card) {
        var text = cardText(card);
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchRegion = !filters.region || card.dataset.region === filters.region;
        var matchType = !filters.type || card.dataset.type === filters.type;
        var matchYear = !filters.year || card.dataset.year === filters.year;
        var visible = matchKeyword && matchRegion && matchType && matchYear;
        card.hidden = !visible;
        if (visible) {
          shown += 1;
        }
      });
      if (empty) {
        empty.hidden = shown !== 0;
      }
    }

    var forms = document.querySelectorAll('[data-search-form]');
    forms.forEach(function (form) {
      var input = form.querySelector('input[name="q"]');
      if (input && keyword) {
        input.value = keyword;
      }
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = input ? input.value.trim() : '';
        if (grid) {
          keyword = normalize(query);
          var nextUrl = window.location.pathname + (keyword ? '?q=' + encodeURIComponent(keyword) : '');
          window.history.replaceState(null, '', nextUrl);
          apply();
        } else {
          window.location.href = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
        }
      });
    });

    var filterPanel = document.querySelector('[data-filter-panel]');
    if (filterPanel) {
      filterPanel.addEventListener('click', function (event) {
        var button = event.target.closest('button[data-filter]');
        if (!button) {
          return;
        }
        var key = button.dataset.filter;
        filters[key] = button.dataset.value || '';
        Array.prototype.slice.call(filterPanel.querySelectorAll('button[data-filter="' + key + '"]')).forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        apply();
      });
    }

    apply();
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initPlayers() {
    var players = document.querySelectorAll('[data-player]');
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');
      var stream = player.dataset.stream;
      var hlsInstance = null;
      var started = false;

      function startVideo() {
        if (!video || !stream) {
          return;
        }
        if (!started) {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls();
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
          } else {
            video.src = stream;
          }
          started = true;
        }
        if (button) {
          button.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener('click', startVideo);
      }
      player.addEventListener('click', function (event) {
        if (event.target === video && !started) {
          startVideo();
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initFilters();
    initHero();
    initPlayers();
  });
})();

(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (menuButton && mobileNav) {
      menuButton.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (slides.length > 1) {
      var index = 0;
      var setSlide = function (next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === index);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          setSlide(i);
        });
      });
      window.setInterval(function () {
        setSlide(index + 1);
      }, 5200);
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function (scope) {
      var input = scope.querySelector('[data-filter-input]');
      var year = scope.querySelector('[data-filter-year]');
      var region = scope.querySelector('[data-filter-region]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      var update = function () {
        var q = normalize(input && input.value);
        var y = year ? year.value : '';
        var r = normalize(region && region.value);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-genre')
          ].join(' '));
          var movieYear = Number(card.getAttribute('data-year') || 0);
          var regionText = normalize(card.getAttribute('data-region'));
          var ok = true;
          if (q && haystack.indexOf(q) === -1) {
            ok = false;
          }
          if (y === '2010') {
            ok = ok && movieYear >= 2010 && movieYear < 2020;
          } else if (y === '2000') {
            ok = ok && movieYear >= 2000 && movieYear < 2010;
          } else if (y === 'older') {
            ok = ok && movieYear < 2000;
          } else if (y) {
            ok = ok && String(movieYear) === y;
          }
          if (r) {
            ok = ok && regionText.indexOf(r) !== -1;
          }
          card.style.display = ok ? '' : 'none';
        });
      };
      [input, year, region].forEach(function (node) {
        if (node) {
          node.addEventListener('input', update);
          node.addEventListener('change', update);
        }
      });
    });

    var searchRoot = document.querySelector('[data-search-page]');
    if (searchRoot && window.SEARCH_MOVIES) {
      var params = new URLSearchParams(window.location.search);
      var input = searchRoot.querySelector('[data-search-box]');
      var results = searchRoot.querySelector('[data-search-results]');
      var form = searchRoot.querySelector('form');
      var render = function (query) {
        if (!results) {
          return;
        }
        var q = normalize(query);
        var pool = window.SEARCH_MOVIES;
        var matched = q ? pool.filter(function (item) {
          return normalize([item.title, item.region, item.type, item.genre, item.tags].join(' ')).indexOf(q) !== -1;
        }) : pool.slice(0, 48);
        matched = matched.slice(0, 96);
        if (!matched.length) {
          results.innerHTML = '<div class="search-results-empty">没有找到匹配内容，可尝试更换片名、地区或类型关键词。</div>';
          return;
        }
        results.innerHTML = matched.map(function (item, i) {
          var title = escapeHtml(item.title);
          var region = escapeHtml(item.region);
          var type = escapeHtml(item.type);
          var genre = escapeHtml(item.genre);
          var oneLine = escapeHtml(item.oneLine);
          var file = escapeHtml(item.file);
          var cover = escapeHtml(item.cover);
          return '<article class="movie-card" data-title="' + title + '" data-year="' + item.year + '" data-region="' + region + '" data-genre="' + genre + '">' +
            '<a class="movie-poster" href="' + file + '" style="background-image: url(\'./' + cover + '.jpg\');"><b class="rank-badge">' + (i + 1) + '</b><span class="play-dot">▶</span></a>' +
            '<div class="movie-info"><div class="movie-meta"><span>' + item.year + '</span><span>' + region + '</span><span>' + type + '</span></div>' +
            '<h3><a href="' + file + '">' + title + '</a></h3><p>' + oneLine + '</p><div class="tag-row"><span>' + genre + '</span></div></div>' +
            '</article>';
        }).join('');
      };
      if (input) {
        input.value = params.get('q') || '';
        input.addEventListener('input', function () {
          render(input.value);
        });
      }
      if (form) {
        form.addEventListener('submit', function (event) {
          event.preventDefault();
          render(input ? input.value : '');
        });
      }
      render(input ? input.value : '');
    }
  });
})();

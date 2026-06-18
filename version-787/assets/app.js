(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-site-nav]');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var searchInput = document.querySelector('[data-global-search]');
  var searchResults = document.querySelector('[data-search-results]');
  var searchIndex = window.SEARCH_INDEX || [];

  function clearSearch() {
    if (searchResults) {
      searchResults.innerHTML = '';
      searchResults.classList.remove('open');
    }
  }

  function createResult(item) {
    var link = document.createElement('a');
    link.className = 'search-result-item';
    link.href = item.url;

    var image = document.createElement('img');
    image.src = item.cover;
    image.alt = item.title;
    image.loading = 'lazy';

    var text = document.createElement('span');
    var title = document.createElement('strong');
    var meta = document.createElement('span');
    title.textContent = item.title;
    meta.textContent = item.year + ' · ' + item.region + ' · ' + item.type;
    text.appendChild(title);
    text.appendChild(meta);

    link.appendChild(image);
    link.appendChild(text);
    return link;
  }

  if (searchInput && searchResults) {
    searchInput.addEventListener('input', function () {
      var value = searchInput.value.trim().toLowerCase();
      searchResults.innerHTML = '';
      if (!value) {
        clearSearch();
        return;
      }
      var matched = searchIndex.filter(function (item) {
        return [item.title, item.region, item.type, item.category, item.year, item.tags].join(' ').toLowerCase().indexOf(value) !== -1;
      }).slice(0, 12);
      if (!matched.length) {
        var empty = document.createElement('div');
        empty.className = 'search-result-item';
        empty.textContent = '暂无匹配内容';
        searchResults.appendChild(empty);
      } else {
        matched.forEach(function (item) {
          searchResults.appendChild(createResult(item));
        });
      }
      searchResults.classList.add('open');
    });

    document.addEventListener('click', function (event) {
      if (!event.target.closest('.global-search')) {
        clearSearch();
      }
    });
  }

  var hero = document.querySelector('[data-hero-carousel]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function setSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        setSlide(current + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        setSlide(current - 1);
        startTimer();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        setSlide(current + 1);
        startTimer();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        setSlide(index);
        startTimer();
      });
    });
    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    setSlide(0);
    startTimer();
  }

  var localSearch = document.querySelector('[data-local-filter]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var regionFilter = document.querySelector('[data-region-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-grid] .movie-card'));
  var emptyState = document.querySelector('[data-empty-state]');

  function applyLocalFilter() {
    if (!cards.length) {
      return;
    }
    var keyword = localSearch ? localSearch.value.trim().toLowerCase() : '';
    var year = yearFilter ? yearFilter.value : 'all';
    var region = regionFilter ? regionFilter.value : 'all';
    var visible = 0;

    cards.forEach(function (card) {
      var matchesKeyword = !keyword || card.dataset.title.toLowerCase().indexOf(keyword) !== -1 || card.dataset.region.toLowerCase().indexOf(keyword) !== -1 || card.dataset.type.toLowerCase().indexOf(keyword) !== -1;
      var matchesYear = year === 'all' || card.dataset.year === year;
      var matchesRegion = region === 'all' || card.dataset.region === region;
      var show = matchesKeyword && matchesYear && matchesRegion;
      card.style.display = show ? '' : 'none';
      if (show) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('open', visible === 0);
    }
  }

  if (localSearch) {
    localSearch.addEventListener('input', applyLocalFilter);
  }
  if (yearFilter) {
    yearFilter.addEventListener('change', applyLocalFilter);
  }
  if (regionFilter) {
    regionFilter.addEventListener('change', applyLocalFilter);
  }
})();

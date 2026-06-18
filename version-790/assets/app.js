(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
      document.body.classList.toggle('menu-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startHero() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    startHero();
  }

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage) {
    var input = searchPage.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(searchPage.querySelectorAll('[data-card]'));
    var filters = {};
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input) {
      input.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function matchesFilter(card, name, value) {
      if (!value || value === 'all') {
        return true;
      }
      return normalize(card.getAttribute('data-' + name)) === normalize(value);
    }

    function applyFilters() {
      var query = normalize(input ? input.value : '');
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-category')
        ].join(' '));
        var visible = (!query || haystack.indexOf(query) !== -1) &&
          matchesFilter(card, 'region', filters.region) &&
          matchesFilter(card, 'type', filters.type) &&
          matchesFilter(card, 'year', filters.year);
        card.classList.toggle('is-hidden', !visible);
      });
    }

    searchPage.querySelectorAll('[data-filter]').forEach(function (button) {
      button.addEventListener('click', function () {
        var name = button.getAttribute('data-filter');
        var value = button.getAttribute('data-value');
        filters[name] = value;
        searchPage.querySelectorAll('[data-filter="' + name + '"]').forEach(function (peer) {
          peer.classList.toggle('is-active', peer === button);
        });
        applyFilters();
      });
    });

    if (input) {
      input.addEventListener('input', applyFilters);
    }

    var clearButton = searchPage.querySelector('[data-clear-search]');
    if (clearButton) {
      clearButton.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        filters = {};
        searchPage.querySelectorAll('[data-filter]').forEach(function (button) {
          button.classList.toggle('is-active', button.getAttribute('data-value') === 'all');
        });
        applyFilters();
      });
    }

    applyFilters();
  }
})();

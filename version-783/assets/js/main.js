(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
      menuButton.addEventListener('click', function () {
        mobileMenu.classList.toggle('open');
      });
    }

    document.querySelectorAll('[data-backtop]').forEach(function (button) {
      button.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide-dot]'));
      var prev = carousel.querySelector('[data-slide-prev]');
      var next = carousel.querySelector('[data-slide-next]');
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === index);
        });
      }

      function start() {
        if (timer) {
          window.clearInterval(timer);
        }

        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
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

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          show(dotIndex);
          start();
        });
      });

      show(0);
      start();
    });

    var filterInput = document.querySelector('[data-filter-input]');
    var filterList = document.querySelector('[data-filter-list]');
    var tagButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-tag]'));

    if (filterInput && filterList) {
      var cards = Array.prototype.slice.call(filterList.querySelectorAll('[data-filter-card]'));
      var currentTag = '';

      function applyFilter() {
        var query = filterInput.value.trim().toLowerCase();

        cards.forEach(function (card) {
          var text = (card.getAttribute('data-index') || '').toLowerCase();
          var category = (card.getAttribute('data-category') || '').toLowerCase();
          var matchesText = !query || text.indexOf(query) !== -1 || category.indexOf(query) !== -1;
          var matchesTag = !currentTag || text.indexOf(currentTag.toLowerCase()) !== -1 || category.indexOf(currentTag.toLowerCase()) !== -1;
          card.classList.toggle('is-hidden', !(matchesText && matchesTag));
        });
      }

      filterInput.addEventListener('input', applyFilter);

      tagButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          var nextTag = button.getAttribute('data-filter-tag') || '';
          currentTag = currentTag === nextTag ? '' : nextTag;

          tagButtons.forEach(function (item) {
            item.classList.toggle('active', item === button && currentTag);
          });

          applyFilter();
        });
      });
    }
  });
})();

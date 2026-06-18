(function() {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");
  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function() {
      mobilePanel.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
      current = index;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        showSlide(i);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function() {
        showSlide((current + 1) % slides.length);
      }, 5200);
    }
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function filterCards(root, query) {
    var cards = Array.prototype.slice.call(root.querySelectorAll(".searchable-card"));
    var empty = root.querySelector("[data-empty]");
    var text = normalize(query);
    var visible = 0;

    cards.forEach(function(card) {
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags")
      ].join(" "));
      var matched = !text || haystack.indexOf(text) !== -1;
      card.classList.toggle("hidden-card", !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]")).forEach(function(root) {
    var input = root.querySelector("[data-filter-input]");
    if (!input) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q && !input.value) {
      input.value = q;
    }

    filterCards(root, input.value);
    input.addEventListener("input", function() {
      filterCards(root, input.value);
    });

    Array.prototype.slice.call(root.querySelectorAll("[data-filter-chip]")).forEach(function(chip) {
      chip.addEventListener("click", function() {
        input.value = chip.getAttribute("data-filter-chip") || "";
        filterCards(root, input.value);
      });
    });
  });
})();

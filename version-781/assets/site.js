(function() {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function() {
      mobileNav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero-slider]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    var nextButton = document.querySelector("[data-hero-next]");
    var prevButton = document.querySelector("[data-hero-prev]");

    if (nextButton) {
      nextButton.addEventListener("click", function() {
        showSlide(current + 1);
      });
    }

    if (prevButton) {
      prevButton.addEventListener("click", function() {
        showSlide(current - 1);
      });
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener("click", function() {
        showSlide(index);
      });
    });

    window.setInterval(function() {
      showSlide(current + 1);
    }, 5200);
  }

  var filterPanels = document.querySelectorAll("[data-filter-panel]");

  filterPanels.forEach(function(panel) {
    var input = panel.querySelector("[data-filter-input]");
    var select = panel.querySelector("[data-filter-year]");
    var scopeSelector = panel.getAttribute("data-filter-panel");
    var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
    var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll("[data-card]")) : [];
    var emptyMessage = document.querySelector("[data-empty-message]");

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var year = select ? select.value : "";
      var visible = 0;

      cards.forEach(function(card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-year")
        ].join(" ").toLowerCase();

        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesYear = !year || card.getAttribute("data-year") === year;
        var show = matchesKeyword && matchesYear;

        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });

      if (emptyMessage) {
        emptyMessage.style.display = visible ? "none" : "block";
      }
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    if (select) {
      select.addEventListener("change", applyFilter);
    }
  });

  function startVideo(player) {
    var video = player.querySelector("video");
    var source = player.getAttribute("data-src");

    if (!video || !source) {
      return;
    }

    if (!player.dataset.ready) {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        player._hls = hls;
      } else {
        video.src = source;
      }

      player.dataset.ready = "true";
    }

    video.controls = true;
    player.classList.add("is-playing");

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function() {
        video.controls = true;
      });
    }
  }

  document.querySelectorAll("[data-player]").forEach(function(player) {
    var button = player.querySelector("[data-play-button]");

    if (button) {
      button.addEventListener("click", function(event) {
        event.preventDefault();
        event.stopPropagation();
        startVideo(player);
      });
    }

    player.addEventListener("click", function(event) {
      if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === "video") {
        return;
      }

      startVideo(player);
    });
  });

  function buildSearchCard(movie) {
    return [
      '<article class="movie-card" data-card data-title="' + escapeHtml(movie.title) + '" data-region="' + escapeHtml(movie.region) + '" data-genre="' + escapeHtml(movie.genre) + '" data-year="' + escapeHtml(movie.year) + '" data-tags="' + escapeHtml(movie.tags.join(" ")) + '">',
      '  <a class="poster-link" href="' + movie.href + '" aria-label="' + escapeHtml(movie.title) + '">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '封面" loading="lazy">',
      '    <span class="duration-pill">' + escapeHtml(movie.duration) + '</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <a class="movie-title" href="' + movie.href + '">' + escapeHtml(movie.title) + '</a>',
      '    <p class="movie-line">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="movie-meta">',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.type) + '</span>',
      '    </div>',
      '    <div class="tag-row">' + movie.tags.slice(0, 4).map(function(tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join("") + '</div>',
      '  </div>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  var searchRoot = document.querySelector("[data-search-root]");

  if (searchRoot && window.MOVIE_INDEX) {
    var searchInput = document.querySelector("[data-global-search]");
    var resultGrid = document.querySelector("[data-search-results]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    function renderResults(query) {
      var keyword = query.trim().toLowerCase();
      var source = window.MOVIE_INDEX;

      var results = keyword ? source.filter(function(movie) {
        return [
          movie.title,
          movie.region,
          movie.genre,
          movie.type,
          movie.year,
          movie.tags.join(" "),
          movie.oneLine
        ].join(" ").toLowerCase().indexOf(keyword) !== -1;
      }) : source.slice(0, 80);

      resultGrid.innerHTML = results.slice(0, 240).map(buildSearchCard).join("");
    }

    if (searchInput) {
      searchInput.value = initialQuery;
      searchInput.addEventListener("input", function() {
        renderResults(searchInput.value);
      });
    }

    renderResults(initialQuery);
  }
})();

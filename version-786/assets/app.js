(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".main-nav");

    if (menuButton && nav) {
        menuButton.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var current = 0;
        var timer = null;

        function activate(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                activate(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                activate(Number(dot.getAttribute("data-hero-index")) || 0);
                startTimer();
            });
        });

        activate(0);
        startTimer();
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var filters = Array.prototype.slice.call(document.querySelectorAll(".page-filter"));
    var chips = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
    var params = new URLSearchParams(window.location.search);
    var pageInput = document.querySelector(".search-page-input");
    var query = params.get("q") || "";

    function applyFilter(text) {
        var value = (text || "").trim().toLowerCase();

        cards.forEach(function (card) {
            var haystack = card.innerText.toLowerCase() + " " +
                (card.getAttribute("data-title") || "").toLowerCase() + " " +
                (card.getAttribute("data-year") || "").toLowerCase() + " " +
                (card.getAttribute("data-region") || "").toLowerCase() + " " +
                (card.getAttribute("data-genre") || "").toLowerCase();

            card.classList.toggle("is-hidden", value && haystack.indexOf(value) === -1);
        });
    }

    if (pageInput && query) {
        pageInput.value = query;
    }

    filters.forEach(function (input) {
        if (query) {
            input.value = query;
        }

        input.addEventListener("input", function () {
            applyFilter(input.value);
        });
    });

    chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
            var value = chip.getAttribute("data-filter") || chip.innerText;
            filters.forEach(function (input) {
                input.value = value;
            });
            applyFilter(value);
        });
    });

    if (query) {
        applyFilter(query);
    }

    Array.prototype.slice.call(document.querySelectorAll("img")).forEach(function (image) {
        image.addEventListener("error", function () {
            image.classList.add("image-hidden");
        });
    });
})();

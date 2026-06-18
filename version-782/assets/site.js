(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function initMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        if (!slides.length) {
            return;
        }
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        function move(step) {
            show(current + step);
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                move(1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                move(-1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                move(1);
                start();
            });
        }
        start();
    }

    function initFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll(".filter-input"));
        inputs.forEach(function (input) {
            var scope = input.closest(".section-wrap") || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-text]"));
            input.addEventListener("input", function () {
                var q = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-filter-text") || "").toLowerCase();
                    card.classList.toggle("is-hidden-by-filter", q && text.indexOf(q) === -1);
                });
            });
        });
    }

    function initPlayer() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".video-player"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var overlay = player.querySelector(".player-overlay");
            var url = player.getAttribute("data-video-url");
            if (!video || !overlay || !url) {
                return;
            }

            function load() {
                if (video.getAttribute("data-ready") !== "true") {
                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = url;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls();
                        hls.loadSource(url);
                        hls.attachMedia(video);
                        video._hls = hls;
                    } else {
                        video.src = url;
                    }
                    video.setAttribute("data-ready", "true");
                }
                overlay.classList.add("is-hidden");
                video.setAttribute("controls", "controls");
                var playPromise = video.play();
                if (playPromise && playPromise.catch) {
                    playPromise.catch(function () {});
                }
            }

            overlay.addEventListener("click", load);
            video.addEventListener("click", function () {
                if (video.getAttribute("data-ready") !== "true") {
                    load();
                }
            });
        });
    }

    function escapeHTML(value) {
        return String(value || "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    function renderCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHTML(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\" data-filter-text=\"" + escapeHTML(movie.title + " " + movie.region + " " + movie.genre + " " + movie.year) + "\">" +
            "<a class=\"poster\" href=\"" + escapeHTML(movie.url) + "\" aria-label=\"" + escapeHTML(movie.title) + "\">" +
            "<img src=\"" + escapeHTML(movie.cover) + "\" alt=\"" + escapeHTML(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"duration\">" + escapeHTML(movie.duration) + "</span>" +
            "</a>" +
            "<div class=\"movie-card-body\">" +
            "<h3><a href=\"" + escapeHTML(movie.url) + "\">" + escapeHTML(movie.title) + "</a></h3>" +
            "<p>" + escapeHTML(movie.oneLine) + "</p>" +
            "<div class=\"card-meta\"><span>" + escapeHTML(movie.year) + "</span><span>" + escapeHTML(movie.region) + "</span><span>" + escapeHTML(movie.type) + "</span></div>" +
            "<div class=\"tag-list\">" + tags + "</div>" +
            "</div>" +
            "</article>";
    }

    function initSearchPage() {
        var input = document.getElementById("site-search-input");
        var button = document.getElementById("site-search-button");
        var results = document.getElementById("search-results");
        var list = window.MOVIE_INDEX || [];
        if (!input || !button || !results || !list.length) {
            return;
        }

        function getQueryFromURL() {
            var params = new URLSearchParams(window.location.search);
            return params.get("q") || "";
        }

        function search() {
            var q = input.value.trim().toLowerCase();
            if (!q) {
                results.innerHTML = list.slice(0, 24).map(renderCard).join("");
                return;
            }
            var words = q.split(/\s+/).filter(Boolean);
            var matched = list.filter(function (movie) {
                var text = (movie.title + " " + movie.region + " " + movie.type + " " + movie.year + " " + movie.genre + " " + (movie.tags || []).join(" ") + " " + movie.oneLine).toLowerCase();
                return words.every(function (word) {
                    return text.indexOf(word) !== -1;
                });
            }).slice(0, 120);
            if (!matched.length) {
                results.innerHTML = "<div class=\"empty-result\">没有找到匹配影片</div>";
                return;
            }
            results.innerHTML = matched.map(renderCard).join("");
        }

        var initial = getQueryFromURL();
        if (initial) {
            input.value = initial;
        }
        button.addEventListener("click", search);
        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                search();
            }
        });
        input.addEventListener("input", function () {
            if (!input.value.trim()) {
                search();
            }
        });
        search();
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayer();
        initSearchPage();
    });
}());

(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let current = 0;
        let timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('is-active', itemIndex === current);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('is-active', itemIndex === current);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        start();
    }

    const panels = Array.from(document.querySelectorAll('[data-filter-panel]'));
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';

    panels.forEach(function (panel) {
        const input = panel.querySelector('[data-filter-input]');
        const type = panel.querySelector('[data-filter-type]');
        const region = panel.querySelector('[data-filter-region]');
        const year = panel.querySelector('[data-filter-year]');
        const section = panel.closest('section') || document;
        const cards = Array.from(section.querySelectorAll('[data-movie-card]'));

        if (input && query) {
            input.value = query;
        }

        function valueOf(element) {
            return element ? element.value.trim().toLowerCase() : '';
        }

        function apply() {
            const keyword = valueOf(input);
            const currentType = valueOf(type);
            const currentRegion = valueOf(region);
            const currentYear = valueOf(year);

            cards.forEach(function (card) {
                const text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
                const cardType = (card.getAttribute('data-type') || '').toLowerCase();
                const cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
                const cardYear = (card.getAttribute('data-year') || '').toLowerCase();
                const matched = (!keyword || text.indexOf(keyword) !== -1)
                    && (!currentType || cardType === currentType)
                    && (!currentRegion || cardRegion === currentRegion)
                    && (!currentYear || cardYear === currentYear);
                card.classList.toggle('is-hidden', !matched);
            });
        }

        [input, type, region, year].forEach(function (element) {
            if (element) {
                element.addEventListener('input', apply);
                element.addEventListener('change', apply);
            }
        });

        apply();
    });
})();

function initMoviePlayer(streamUrl) {
    const video = document.getElementById('movie-video');
    const cover = document.querySelector('.player-cover');
    const button = document.querySelector('[data-play-button]');
    let loaded = false;
    let hls = null;

    if (!video || !streamUrl) {
        return;
    }

    function load() {
        if (loaded) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
        } else {
            video.src = streamUrl;
        }

        loaded = true;
    }

    function start() {
        load();
        if (cover) {
            cover.classList.add('is-hidden');
        }
        const request = video.play();
        if (request && typeof request.catch === 'function') {
            request.catch(function () {});
        }
    }

    if (button) {
        button.addEventListener('click', start);
    }

    if (cover) {
        cover.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}

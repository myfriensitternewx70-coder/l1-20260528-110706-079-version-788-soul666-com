(function () {
    var video = document.querySelector(".js-player-video");
    var button = document.querySelector(".js-player-start");
    var instance = null;

    if (!video || !button) {
        return;
    }

    function bindStream() {
        var stream = video.getAttribute("data-stream");

        if (!stream) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            if (video.getAttribute("src") !== stream) {
                video.setAttribute("src", stream);
            }
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (!instance) {
                instance = new window.Hls({ enableWorker: true });
                instance.loadSource(stream);
                instance.attachMedia(video);
            }
            return;
        }

        if (video.getAttribute("src") !== stream) {
            video.setAttribute("src", stream);
        }
    }

    function playVideo() {
        bindStream();
        button.classList.add("is-hidden");
        video.setAttribute("controls", "controls");

        var result = video.play();

        if (result && typeof result.catch === "function") {
            result.catch(function () {
                button.classList.remove("is-hidden");
            });
        }
    }

    button.addEventListener("click", playVideo);

    video.addEventListener("click", function () {
        if (video.paused) {
            playVideo();
        }
    });
})();

import { FxsActivatable } from './fxs-activatable.js';

function parseVTT(content) {
  function convertToMS(h, m, s, f) {
    return h * 36e5 + m * 6e4 + s * 1e3 + f / 1e3;
  }
  function parseTimeStamp(m1, m2, m3, m4) {
    const n1 = Number(m1);
    const n2 = Number(m2);
    const n4 = Number(m4);
    if (m3) {
      return convertToMS(n1, n2, Number(m3.replace(":", "")), n4);
    } else {
      return n1 > 59 ? convertToMS(n1, n2, 0, n4) : convertToMS(0, n1, n2, n4);
    }
  }
  let offset = 0;
  if (content[0] == "\uFEFF") {
    offset = 1;
  }
  if (!content.startsWith("WEBVTT", offset)) {
    throw new Error("Missing 'WEBVTT' signature.");
  }
  content = content.replaceAll("\0", "�");
  content = content.replaceAll("\r\n", "\n");
  content = content.replaceAll("\r", "\n");
  const lines = content.split("\n");
  const lineCount = lines.length;
  const results = [];
  if (lines.length == 1) {
    return [];
  } else {
    const CUETIMINGS = /\s*(\d+):(\d{2})(:\d{2})?\.(\d{3})\s*-->\s*(\d+):(\d{2})(:\d{2})?\.(\d{3})\s*(.+)?/;
    let line = 1;
    while (line < lineCount) {
      const text = lines[line];
      if (text == "") {
        line++;
        continue;
      }
      const ch = text.charAt(0);
      switch (ch) {
        case "N":
          if (text.startsWith("NOTE")) {
            line++;
            while (line < lineCount && lines[line] != "") {
              line++;
            }
            continue;
          }
          break;
        case "R":
          if (text.startsWith("REGION")) {
            line++;
            while (line < lineCount && lines[line] != "") {
              line++;
            }
            continue;
          }
          break;
        case "S":
          if (text.startsWith("STYLE")) {
            line++;
            while (line < lineCount && lines[line] != "") {
              line++;
            }
            continue;
          }
          break;
      }
      let id = "";
      if (text.indexOf("-->") == -1) {
        id = text;
        line++;
        if (line >= lineCount) {
          break;
        }
      }
      const m = lines[line].match(CUETIMINGS);
      if (m == null) {
        throw new Error(`Cannot parse cue timings. ${lines[line]}`);
      } else {
        const start = parseTimeStamp(m[1], m[2], m[3], m[4]);
        const stop = parseTimeStamp(m[5], m[6], m[7], m[8]);
        if (isNaN(start) || isNaN(stop)) {
          throw new Error(`Could not parse timestamps for cue. ${lines[line]}.`);
        } else {
          const cueTextLines = [];
          line++;
          let cueText = lines[line];
          while (line < lineCount && cueText.length > 0) {
            cueTextLines.push(cueText);
            line++;
            cueText = lines[line];
          }
          let text2 = cueTextLines.join("[N]");
          text2 = text2.replaceAll(/<(\/)?([bBiI])>/g, "[$1$2]");
          text2 = text2.replaceAll(/(<.*>)/g, "");
          const cue = {
            id,
            start,
            stop,
            text: text2
          };
          results.push(cue);
        }
      }
    }
  }
  return results;
}
const STOP_MOVIE_AUDIO_EVENT = "stop_webm";
class Subtitle {
  addSubtitleElementCallback = null;
  htmlElement = null;
  cue = null;
  constructor(addSubtitleElementCallback) {
    this.addSubtitleElementCallback = addSubtitleElementCallback;
  }
  set(cue) {
    if (!this.addSubtitleElementCallback) {
      return;
    }
    this.htmlElement = this.addSubtitleElementCallback(cue.text);
    this.cue = cue;
  }
  isSet() {
    return this.cue != null && this.htmlElement != null;
  }
  clear() {
    this.htmlElement?.remove();
    this.htmlElement = null;
    this.cue = null;
  }
  didExpire(currentTimeMS) {
    if (!this.cue) {
      return false;
    }
    return currentTimeMS > this.cue.stop;
  }
}
class FxsMovie extends FxsActivatable {
  readyStateListener = this.onCheckReadyState.bind(this);
  movieSkipListener = this.onActivated.bind(this);
  moviePlayingListener = this.onMoviePlaying.bind(this);
  movieEndedListener = this.onMovieEnded.bind(this);
  playbackStalledListener = this.onPlaybackStalled.bind(this);
  playbackResumedListener = this.onPlaybackResumed.bind(this);
  movieTimeUpdateListener = this.onMovieTimeUpdate.bind(this);
  movieErrorListener = this.onMovieError.bind(this);
  rafCheckReadyState = 0;
  // Toggle to enable some debug features
  currentMovie = null;
  currentMovieSubtitles = null;
  currentMovieType = null;
  currentDisplayedSubtitle = new Subtitle(this.addSubtitleElement.bind(this));
  displayLocale;
  displayResolution;
  videoElement = null;
  subtitleElement = null;
  movieVariants = null;
  showSubtitles = true;
  constructor(root) {
    super(root);
    this.updateBackdrop();
    if (UI.favorSpeedOverQuality()) {
      this.displayResolution = 720;
    } else {
      this.displayResolution = window.innerHeight;
    }
    const attrShowSubtitles = this.Root.getAttribute("data-force-subtitles");
    if (attrShowSubtitles != null) {
      this.showSubtitles = attrShowSubtitles[0] == "t" || attrShowSubtitles[0] == "T" || attrShowSubtitles[0] == "1";
    } else {
      const subtitleOption = UI.getOption("audio", "Sound", "Subtitles");
      this.showSubtitles = subtitleOption == 1;
    }
    this.displayLocale = "en_US";
  }
  onAttach() {
    super.onAttach();
    engine.on("AppInBackground", this.onAppInBackground, this);
    engine.on("AppInForeground", this.onAppInForeground, this);
    this.Root.addEventListener("action-activate", this.movieSkipListener);
    if (!this.Root.classList.contains("absolute")) {
      this.Root.classList.add("relative");
    }
    const movieId = this.Root.getAttribute("data-movie-id");
    if (movieId) {
      this.onSkipMovie(true);
      this.playMovie(movieId);
    }
  }
  onDetach() {
    if (this.rafCheckReadyState) {
      cancelAnimationFrame(this.rafCheckReadyState);
      this.rafCheckReadyState = 0;
    }
    this.clearMovie();
    this.Root.removeEventListener("action-activate", this.movieSkipListener);
    engine.off("AppInBackground", this.onAppInBackground, this);
    engine.off("AppInForeground", this.onAppInForeground, this);
    super.onDetach();
  }
  onAttributeChanged(name, _oldValue, newValue) {
    if (name == "data-movie-id") {
      if (newValue) {
        if (newValue != this.currentMovieType) {
          this.onSkipMovie(true);
          this.playMovie(newValue);
        }
      } else {
        this.onSkipMovie(true);
      }
    } else if (name == "data-hide-backdrop") {
      this.updateBackdrop();
    }
  }
  onActivated() {
    if (UI.canSkipMovies()) {
      this.onSkipMovie();
    }
  }
  onSkipMovie(force = false) {
    let preventSkipping = false;
    const attrPreventSkipping = this.Root.getAttribute("data-prevent-skipping");
    if (attrPreventSkipping != null) {
      preventSkipping = attrPreventSkipping[0] == "t" || attrPreventSkipping[0] == "1";
    }
    if ((force || !preventSkipping) && this.currentMovie) {
      this.onMovieEnded();
    }
  }
  onCheckReadyState() {
    this.rafCheckReadyState = 0;
    if (this.videoElement) {
      if (this.videoElement.readyState > 2) {
        this.onMovieReadyToPlay();
      } else {
        this.rafCheckReadyState = requestAnimationFrame(this.readyStateListener);
      }
    }
  }
  onMovieReadyToPlay() {
    if (this.videoElement) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const videoWidth = this.videoElement.videoWidth;
      const videoHeight = this.videoElement.videoHeight;
      console.debug(
        `Video loaded, adjusting size to fit video. Window ${width}x${height} Video: ${videoWidth}x${videoHeight}`
      );
      const movieRatio = videoWidth / videoHeight;
      const movieRatioInverse = videoHeight / videoWidth;
      const displayRatio = width / height;
      let cover = false;
      if (this.currentMovie?.UseCoverFitMode) {
        cover = true;
      }
      const attrFitMode = this.Root.getAttribute("data-movie-fit-mode");
      if (attrFitMode) {
        if (attrFitMode == "cover") {
          cover = true;
        } else {
          cover = false;
        }
      }
      if (movieRatio < displayRatio || cover) {
        this.videoElement.style.height = "100%";
        const newWidth = height * movieRatio;
        const newWidthPct = newWidth / width;
        this.videoElement.style.width = `${newWidthPct * 100}%`;
      } else {
        this.videoElement.style.width = "100%";
        const newHeight = width * movieRatioInverse;
        const newHeightPct = newHeight / height;
        this.videoElement.style.height = `${newHeightPct * 100}%`;
      }
      delayByFrame(() => {
        const videoElement = this.videoElement;
        if (videoElement) {
          console.debug("Adjustments made, begin playback.");
          const movie = this.currentMovie;
          if (movie) {
            if (movie.Audio) {
              UI.sendAudioEvent(movie.Audio);
            }
          }
          videoElement.play();
        }
      }, 2);
    }
  }
  onMoviePlaying() {
    const movie = this.currentMovie;
    if (movie) {
      console.debug(`Movie '${this.currentMovie?.MovieType}' - '${this.currentMovie?.Url}' playing!`);
      delayByFrame(() => {
        const event = new CustomEvent("movie-playing");
        this.Root.dispatchEvent(event);
      }, 6);
    }
  }
  onMovieTimeUpdate() {
    if (!this.videoElement) {
      return;
    }
    if (!this.currentMovieSubtitles) {
      return;
    }
    const currentTimeMS = this.videoElement.currentTime * 1e3;
    if (this.currentDisplayedSubtitle.isSet() && this.currentDisplayedSubtitle.didExpire(currentTimeMS)) {
      this.currentDisplayedSubtitle.clear();
      this.currentMovieSubtitles.shift();
    }
    this.currentMovieSubtitles = this.currentMovieSubtitles.filter((subtitle) => subtitle.stop > currentTimeMS);
    if (this.currentMovieSubtitles.length == 0) {
      return;
    }
    const cue = this.currentMovieSubtitles[0];
    if (currentTimeMS >= cue.start) {
      if (!this.currentDisplayedSubtitle.isSet()) {
        this.currentDisplayedSubtitle.set(cue);
      }
    }
  }
  onMovieEnded() {
    if (this.currentMovie) {
      this.clearMovie();
      const event = new CustomEvent("movie-ended");
      this.Root.dispatchEvent(event);
    }
  }
  onPlaybackStalled() {
    console.warn(`Movie '${this.currentMovie?.Url}' stalled.`);
  }
  onPlaybackResumed() {
    console.warn(`Movie '${this.currentMovie?.Url}' resuming after a stall.`);
  }
  onMovieError() {
    console.error(`Movie '${this.currentMovie?.Url}' failed to play. Trying the next variant.`);
    this.playNextVariant();
  }
  addVideoElement(url) {
    this.videoElement = document.createElement("video");
    this.videoElement.autoplay = false;
    this.videoElement.style.pointerEvents = "none";
    this.videoElement.addEventListener("ended", this.movieEndedListener);
    this.videoElement.addEventListener("playing", this.moviePlayingListener);
    this.videoElement.addEventListener("cohplaybackstalled", this.playbackStalledListener);
    this.videoElement.addEventListener("cohplaybackresumed", this.playbackResumedListener);
    this.videoElement.addEventListener("error", this.movieErrorListener);
    this.videoElement.addEventListener("timeupdate", this.movieTimeUpdateListener);
    this.videoElement.src = url;
    this.Root.appendChild(this.videoElement);
  }
  removeVideoElement() {
    if (this.videoElement) {
      this.videoElement.removeEventListener("ended", this.movieEndedListener);
      this.videoElement.removeEventListener("playing", this.moviePlayingListener);
      this.videoElement.removeEventListener("cohplaybackstalled", this.playbackStalledListener);
      this.videoElement.removeEventListener("cohplaybackresumed", this.playbackResumedListener);
      this.videoElement.removeEventListener("error", this.movieErrorListener);
      this.videoElement.removeEventListener("timeupdate", this.movieTimeUpdateListener);
      this.videoElement.pause();
      this.videoElement.src = "";
      this.videoElement = null;
    }
    this.subtitleElement = null;
    this.Root.innerHTML = "";
  }
  addSubtitleElement(text) {
    if (this.subtitleElement == null) {
      const subbyRoot = document.createElement("div");
      subbyRoot.classList.add(
        "absolute",
        "inset-6",
        "flex",
        "flex-col-reverse",
        "justify-flex-start",
        "items-center",
        "fullscreen"
      );
      this.subtitleElement = subbyRoot;
      this.Root.appendChild(subbyRoot);
    }
    const el = document.createElement("div");
    el.setAttribute("aria-hidden", "true");
    el.classList.add("fxs-movie-subtitle", "relative", "text-2xl");
    el.style.cssText = "text-stroke: 4px black; color:white;";
    el.innerHTML = Locale.stylize(text);
    this.subtitleElement.appendChild(el);
    return el;
  }
  clearMovie() {
    if (this.currentMovie) {
      const stopAudioEvent = this.currentMovie.StopAudio ?? STOP_MOVIE_AUDIO_EVENT;
      UI.sendAudioEvent(stopAudioEvent);
    }
    this.removeVideoElement();
    this.currentMovie = null;
    this.currentMovieType = null;
    this.currentMovieSubtitles = null;
    this.movieVariants = null;
  }
  movieSort(a, b) {
    if (a.Locale == b.Locale) {
      const resolution = this.displayResolution;
      if (a.Resolution == b.Resolution) {
        return 0;
      } else if (a.Resolution <= resolution) {
        if (b.Resolution <= resolution) {
          return a.Resolution > b.Resolution ? -1 : 1;
        } else {
          return -1;
        }
      } else if (a.Resolution > resolution) {
        if (b.Resolution > resolution) {
          return a.Resolution > b.Resolution ? 1 : -1;
        } else {
          return 1;
        }
      } else {
        return -1;
      }
    } else {
      const locale = this.displayLocale;
      if (a.Locale == locale) {
        return -1;
      } else if (b.Locale == locale) {
        return 1;
      } else if (a.Locale == "en_US") {
        return -1;
      } else if (b.Locale == "en_US") {
        return 1;
      } else {
        return 0;
      }
    }
  }
  getMovieVariants(movieType, movieResolution, movieLocale) {
    const movieVariants = [];
    const configMovies = Database.query("config", "select * from Movies");
    if (configMovies) {
      for (const m of configMovies) {
        if (m.MovieType == movieType && (movieResolution == null || m.Resolution == movieResolution) && (movieLocale == null || m.Locale == movieLocale)) {
          movieVariants.push(m);
        }
      }
    }
    if (UI.isInGame()) {
      const inGameMovies = Database.query("gameplay", "select * from Movies");
      if (inGameMovies) {
        for (const m of inGameMovies) {
          if (m.MovieType == movieType && (movieResolution == null || m.Resolution == movieResolution) && (movieLocale == null || m.Locale == movieLocale)) {
            movieVariants.push(m);
          }
        }
      }
    }
    movieVariants.sort(this.movieSort.bind(this));
    return movieVariants;
  }
  playNextVariant() {
    const movie = this.movieVariants ? this.movieVariants[0] : null;
    if (movie) {
      this.removeVideoElement();
      this.movieVariants?.splice(0, 1);
      this.currentMovie = movie;
      this.currentMovieSubtitles = null;
      this.addVideoElement(this.currentMovie.Url);
      if (this.showSubtitles && movie.Subtitles) {
        this.fetchSubtitles(movie.Subtitles).then((cues) => {
          this.currentMovieSubtitles = cues;
        }).catch((e) => void e).finally(() => {
          this.rafCheckReadyState = requestAnimationFrame(this.readyStateListener);
        });
      } else {
        this.rafCheckReadyState = requestAnimationFrame(this.readyStateListener);
      }
    } else {
      console.error(`No valid movie found for ${this.currentMovieType}`);
      this.onMovieEnded();
    }
  }
  playMovie(movieType) {
    const attrSelectResolution = this.Root.getAttribute("data-movie-select-resolution");
    const attrSelectLocale = this.Root.getAttribute("data-movie-select-locale");
    let movieResolution;
    if (attrSelectResolution) {
      movieResolution = Number.parseInt(attrSelectResolution);
    }
    let movieLocale;
    if (attrSelectLocale) {
      movieLocale = attrSelectLocale;
    }
    this.movieVariants = this.getMovieVariants(movieType, movieResolution, movieLocale);
    if (!this.movieVariants || this.movieVariants.length == 0) {
      console.error(`No movie definitions found for ${movieType}`);
      this.onMovieEnded();
    }
    this.currentMovieType = movieType;
    this.playNextVariant();
  }
  updateBackdrop() {
    const attrNoBackdrop = this.Root.getAttribute("data-hide-backdrop");
    const useBackdrop = attrNoBackdrop == null || attrNoBackdrop[0] != "t" && attrNoBackdrop[0] != "1";
    if (useBackdrop) {
      this.Root.style.backgroundColor = "black";
    } else {
      this.Root.style.backgroundColor = "";
    }
  }
  onAppInBackground() {
    if (this.videoElement) {
      this.videoElement.pause();
    }
  }
  onAppInForeground() {
    if (this.videoElement) {
      this.videoElement.play();
    }
  }
  async fetchSubtitles(url) {
    const content = await asyncLoad(url);
    return parseVTT(content);
  }
}
Controls.define("fxs-movie", {
  createInstance: FxsMovie,
  description: "Full-screen movie player",
  classNames: ["flex", "justify-center", "items-center", "pointer-events-auto"],
  attributes: [
    {
      name: "data-movie-id",
      description: "The ID of the movie to play.  This component will pick the URL based on display resolution and locale.",
      required: true
    },
    {
      name: "data-movie-select-resolution",
      description: "The component will use only this resolution to select movies from.",
      required: false
    },
    {
      name: "data-movie-select-locale",
      description: "The component will use only this locale to select movies from.",
      required: false
    },
    {
      name: "data-movie-fit-mode",
      description: "Supported values are either contain (default) or cover.  Behaves similar to object-fit."
    },
    {
      name: "data-force-subtitles",
      description: "Force subtitles to be shown or hidden, regardless of user options."
    },
    {
      name: "data-hide-backdrop",
      description: "Do not use a solid black backdrop for the movie.  NOTE: A backdrop may still exist in order to support skipping."
    },
    {
      name: "data-prevent-skipping",
      description: "The movie cannot be skipped.  By default it is skippable"
    }
  ]
});

export { FxsMovie as default };
//# sourceMappingURL=fxs-movie.js.map

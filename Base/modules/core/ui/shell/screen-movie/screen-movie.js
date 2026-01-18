import { b as InputEngineEventName } from '../../input/input-support.chunk.js';
import { P as Panel } from '../../panel-support.chunk.js';
import { MustGetElement } from '../../utilities/utilities-dom.chunk.js';
import { L as Layout } from '../../utilities/utilities-layout.chunk.js';
import '../../framework.chunk.js';

const content = "<div class=\"screen-movie-container absolute fullscreen\">\r\n\t<fxs-movie class=\"screen-movie-player fullscreen absolute inset-0\"></fxs-movie>\r\n</div>";

const MovieScreenOpenedEventName = "screen-movie-opened";
class MovieScreenOpenedEvent extends CustomEvent {
  constructor() {
    super(MovieScreenOpenedEventName, { bubbles: false, cancelable: true });
  }
}
const MovieScreenClosedEventName = "screen-movie-closed";
class MovieScreenClosedEvent extends CustomEvent {
  constructor() {
    super(MovieScreenClosedEventName, { bubbles: false, cancelable: true });
  }
}
class ScreenMovie extends Panel {
  movieEngineInputListener = this.onMovieEngineInput.bind(this);
  movieEndedListener = this.onMovieEnded.bind(this);
  moviePlayerElement;
  onAttach() {
    this.moviePlayerElement = MustGetElement(".screen-movie-player", this.Root);
    if (UI.getViewExperience() == UIViewExperience.Mobile && Layout.isCompact()) {
      this.moviePlayerElement.setAttribute("data-movie-fit-mode", "cover");
    }
    this.Root.addEventListener(InputEngineEventName, this.movieEngineInputListener);
    this.moviePlayerElement.addEventListener("movie-ended", this.movieEndedListener);
    window.dispatchEvent(new MovieScreenOpenedEvent());
  }
  onDetach() {
    this.Root.removeEventListener(InputEngineEventName, this.movieEngineInputListener);
    this.moviePlayerElement.removeEventListener("movie-ended", this.movieEndedListener);
    window.dispatchEvent(new MovieScreenClosedEvent());
  }
  setPanelOptions(screenMovieOptions) {
    this.moviePlayerElement.setAttribute("data-movie-id", screenMovieOptions.movieId);
  }
  onMovieEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    switch (inputEvent.detail.name) {
      case "accept":
      case "shell-action-1":
      case "shell-action-2":
      case "sys-menu":
      case "mousebutton-left":
      case "touch-tap":
      case "cancel":
      case "escape":
      case "keyboard-escape":
      case "keyboard-enter":
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
        this.EndIntroMoviePlayback();
        break;
      default:
        break;
    }
  }
  onMovieEnded() {
    this.EndIntroMoviePlayback();
  }
  EndIntroMoviePlayback() {
    this.close();
  }
}
Controls.define("screen-movie", {
  createInstance: ScreenMovie,
  description: "Movie screen.",
  classNames: ["screen-movie", "w-full", "h-full", "flex", "justify-center"],
  innerHTML: [content],
  opens: ["screen-movie"],
  attributes: []
});

export { MovieScreenClosedEventName, MovieScreenOpenedEventName };
//# sourceMappingURL=screen-movie.js.map

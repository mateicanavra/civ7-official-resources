import { ActionActivateEventName } from './fxs-activatable.js';

const FrameCloseEventName = "frame-closed";
class FrameCloseEvent extends CustomEvent {
  constructor(x, y) {
    super(FrameCloseEventName, { bubbles: false, cancelable: true, detail: { x, y } });
  }
}
class FxsFrame extends Component {
  _content = null;
  frameBg;
  get content() {
    if (!this._content) {
      this._content = document.createElement(this.contentAs);
      this._content.className = this.contentClass;
      this.Root.appendChild(this._content);
    }
    return this._content;
  }
  contentAs = "div";
  contentClass = "";
  onInitialize() {
    super.onInitialize();
    const contentAs = this.Root.getAttribute("content-as");
    const contentClass = this.Root.getAttribute("content-class");
    this.contentAs = contentAs || this.contentAs;
    this.contentClass = contentClass ?? this.contentClass;
    let closeButton = this.Root.querySelector("fxs-close-button");
    if (!closeButton && (this.Root.getAttribute("can-close") ?? "false") == "true") {
      closeButton = document.createElement("fxs-close-button");
      closeButton.addEventListener(ActionActivateEventName, (event) => {
        this.Root.dispatchEvent(new FrameCloseEvent(event.detail.x, event.detail.y));
      });
    }
    if (closeButton) {
      this.Root.appendChild(closeButton);
      closeButton.classList.add("right-1", "top-1");
    }
    const originalfragment = document.createDocumentFragment();
    while (this.Root.hasChildNodes()) {
      const c = this.Root.firstChild;
      if (c == closeButton) {
        break;
      }
      if (c && c != closeButton) {
        originalfragment.appendChild(c);
      }
    }
    this.content.appendChild(originalfragment);
    this.updateOverrideStyling();
    const style = this.Root.getAttribute("frame-style") ?? "f1";
    const noFiligree = this.Root.getAttribute("no-filigree") == "true";
    if (style !== "simple" && !noFiligree) {
      const filigreeClass = this.Root.getAttribute("filigree-class") ?? "mt-8";
      this.Root.insertAdjacentHTML(
        "afterbegin",
        `
				<div class="absolute top-0 left-4 bottom-0 h-1\\/2 w-64 ${filigreeClass} img-frame-filigree pointer-events-none"></div>
				<div class="absolute top-0 right-4 bottom-0 h-1\\/2 w-64 ${filigreeClass} rotate-y-180 img-frame-filigree pointer-events-none"></div>
			`
      );
    }
    this.frameBg = document.createElement("div");
    this.Root.appendChild(this.frameBg);
    this.updateFrameBg();
    const borderStyle = this.Root.getAttribute("top-border-style");
    if (borderStyle) {
      const borderContainer = document.createElement("div");
      borderContainer.classList.value = "flex absolute -left-1\\.5 -right-1\\.5";
      const borderImage = document.createElement("div");
      this.Root.appendChild(borderContainer);
      borderContainer.appendChild(borderImage);
      switch (borderStyle) {
        case "b1":
          borderImage.classList.value = "flex -mt-7 filigree-panel-top-pedia grow";
          break;
        case "b2":
          borderImage.classList.value = "flex -mt-3 filigree-panel-top-simplified grow";
          break;
        default:
          break;
      }
    }
    this.content.classList.value = "flex flex-col flex-auto" + (this.contentClass ? " " + this.contentClass : "");
    this.Root.appendChild(this.content);
  }
  onAttach() {
    super.onAttach();
    this.Root.redirectChildrenToContent(this.content);
  }
  onAttributeChanged(name, _oldValue, _newValue) {
    switch (name) {
      case "outside-safezone-mode":
        this.updateFrameBg();
        break;
      case "frame-style":
        this.updateFrameBg();
        break;
      case "override-styling":
        this.updateOverrideStyling();
        break;
    }
  }
  updateOverrideStyling() {
    this.Root.classList.remove(
      "z-0",
      "pointer-events-auto",
      "relative",
      "flex",
      "max-w-full",
      "max-h-full",
      "pt-14",
      "px-10",
      "pb-10"
    );
    const overrideStyling = this.Root.getAttribute("override-styling") ?? "relative flex max-w-full max-h-full pt-14 px-10 pb-10";
    this.Root.classList.add("z-0", "pointer-events-auto", ...overrideStyling.split(" "));
  }
  updateFrameBg() {
    const style = this.Root.getAttribute("frame-style") ?? "f1";
    const outsideSafezoneMode = this.Root.getAttribute("outside-safezone-mode") ?? "none";
    this.frameBg.className = `-z-1 absolute inset-0 ${this.Root.getAttribute("bg-class") ?? ""}`;
    switch (style) {
      case "f1":
        this.frameBg.classList.add("img-frame-f1");
        break;
      case "f2":
        this.frameBg.classList.add("img-frame-f2");
        break;
      case "simple":
        this.frameBg.classList.add("img-frame-f2");
        break;
      case "modal":
        this.frameBg.classList.add("img-modal-frame");
        break;
    }
    switch (outsideSafezoneMode) {
      case "vertical":
        this.frameBg.classList.add("fullscreen-outside-safezone-y");
        break;
      case "horizontal":
        this.frameBg.classList.add("fullscreen-outside-safezone-x");
        break;
      case "full":
        this.frameBg.classList.add("fullscreen-outside-safezone");
        break;
    }
  }
}
Controls.define("fxs-frame", {
  createInstance: FxsFrame,
  description: "A visual frame container.",
  classNames: ["fxs-frame"],
  images: [
    "fs://game/base_frame-filigree.png",
    "fs://game/base_frame-bg.png",
    "fs://game/hud_squarepanel-bg.png",
    "fs://game/pedia_top_header.png"
  ],
  attributes: [
    {
      name: "outside-safezone-mode"
    },
    {
      name: "frame-style"
    },
    {
      name: "can-close"
    },
    {
      name: "override-styling"
    }
  ]
});

export { FrameCloseEvent, FrameCloseEventName, FxsFrame };
//# sourceMappingURL=fxs-frame.js.map

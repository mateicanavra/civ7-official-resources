import { a as ActionActivateEventName } from './fxs-activatable.chunk.js';
import ActionHandler, { ActiveDeviceTypeChangedEventName } from '../input/action-handler.js';
import { b as InputEngineEventName } from '../input/input-support.chunk.js';

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
    const frameAdditionalStyling = this.Root.getAttribute("override-styling") ?? "relative flex max-w-full max-h-full pt-14 px-10 pb-10";
    this.Root.classList.add("z-0", "pointer-events-auto", ...frameAdditionalStyling.split(" "));
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
      borderContainer.classList.value = "flex absolute self-stretch w-full";
      const borderImage = document.createElement("div");
      this.Root.appendChild(borderContainer);
      borderContainer.appendChild(borderImage);
      switch (borderStyle) {
        case "b1":
          borderImage.classList.value = "flex -mt-7 filigree-panel-top-pedia grow -mr-20";
          break;
        case "b2":
          borderImage.classList.value = "flex -mt-3 filigree-panel-top-simplified grow -ml-6 -mr-22";
          break;
        default:
          break;
      }
    }
    this.content.classList.value = "flex flex-col flex-auto" + (this.contentClass ? " " + this.contentClass : "");
    this.Root.appendChild(this.content);
  }
  onAttributeChanged(name, _oldValue, _newValue) {
    switch (name) {
      case "outside-safezone-mode":
        this.updateFrameBg();
        break;
      case "frame-style":
        this.updateFrameBg();
        break;
    }
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
    }
  ]
});

class FxsHeader extends Component {
  /**
   * Whether or not a render was queued to for the component due to modifications.
   */
  renderQueued = false;
  get titleText() {
    return this.Root.getAttribute("title");
  }
  get filigreeStyle() {
    return this.Root.getAttribute("filigree-style") ?? "h3";
  }
  get truncate() {
    return this.Root.getAttribute("truncate") === "true" ? "truncate" : "";
  }
  get bgGlow() {
    return this.Root.getAttribute("header-bg-glow") === "true" ? true : false;
  }
  get fontFitClassName() {
    const mode = this.Root.getAttribute("font-fit-mode");
    switch (mode) {
      case "shrink":
        return "font-fit-shrink";
      case "fit":
        return "font-fit";
      default:
        return null;
    }
  }
  get whitespaceWrapClassName() {
    const mode = this.Root.getAttribute("wrap");
    switch (mode) {
      case "nowrap":
        return "whitespace-nowrap";
      case "break":
        return "break-words";
      default:
        return null;
    }
  }
  get fontMinSize() {
    return this.Root.getAttribute("font-min-size");
  }
  onInitialize() {
    super.onInitialize();
    this.Root.role = "heading";
  }
  onAttach() {
    let needsDefaultTextClasses = true;
    for (const className of this.Root.classList) {
      if (className.startsWith("text") || className.startsWith("font")) {
        needsDefaultTextClasses = false;
        break;
      }
    }
    this.Root.classList.add(
      "uppercase",
      "tracking-100",
      "text-center",
      "justify-center",
      "max-w-full",
      "pointer-events-auto",
      "font-bold"
    );
    if (needsDefaultTextClasses) {
      this.Root.classList.add("font-title", "text-lg");
    }
    this.render();
  }
  onDetach() {
    this.Root.innerHTML = "";
  }
  onAttributeChanged(_name, _oldValue, _newValue) {
    if (!this.renderQueued) {
      this.renderQueued = true;
      queueMicrotask(this.render.bind(this));
    }
  }
  render() {
    this.renderQueued = false;
    if (this.Root.isConnected) {
      this.Root.innerHTML = this.getStyleHtml(this.filigreeStyle, this.titleText, this.bgGlow);
    }
  }
  generateText(text) {
    const textClass = [
      this.truncate,
      this.fontFitClassName,
      this.whitespaceWrapClassName,
      this.bgGlow ? "text-shadow-subtle z-1" : "fxs-header",
      "flex-auto",
      "max-w-full",
      this.Root.getAttribute("text-class") ?? ""
    ].filter(Boolean).join(" ");
    return `<div class="${textClass}" ${this.fontMinSize ? `style="coh-font-fit-min-size: ${this.fontMinSize};"` : ""} data-l10n-id="${text}"></div>`;
  }
  generateGlow(bgGlow) {
    if (bgGlow) {
      return `<div class="h-24 absolute -top-7 img-fxs-header-glow pointer-events-none"></div>`;
    }
    return "";
  }
  getStyleHtml(style, text, bgGlow) {
    if (!text || text?.length === 0) {
      return "";
    }
    switch (style) {
      case "none":
        return this.generateText(text);
      case "h1":
        this.Root.ariaLevel = "1";
        return `
					<div class="flex flex-col items-center max-w-full relative">
                        ${this.generateGlow(bgGlow)}
						${this.generateText(text)}
						<div class="filigree-divider-h1"></div>
					</div>
				`;
      case "h2":
        this.Root.ariaLevel = "2";
        return `
					<div class="flex flex-col items-center max-w-full relative">
                        ${this.generateGlow(bgGlow)}
						${this.generateText(text)}
						<div class="filigree-divider-h2 mt-1"></div>
					</div>
				`;
      case "h3":
        this.Root.ariaLevel = "3";
        return `
                    <div class="flex flex-col items-center justify-center max-w-full relative">
                        ${this.generateGlow(bgGlow)}
						${this.generateText(text)}
						<div class="filigree-divider-h3"></div>
					</div>
				`;
      case "h4":
        this.Root.ariaLevel = "4";
        return `
					<div class="flex justify-center max-w-full items-center relative">
						<div class="filigree-h4-left"></div>
						<div class="flow-row justify-center">
                            ${this.generateGlow(bgGlow)}
							${this.generateText(text)}
						</div>
						<div class="filigree-h4-right"></div>
					</div>
				`;
      case "small":
        this.Root.ariaLevel = "5";
        return `
					<div class="flex flex-col items-center max-w-full relative">
                        ${this.generateGlow(bgGlow)}
						${this.generateText(text)}
						<div class="filigree-shell-small mt-2\\.5"></div>
					</div>
				`;
      default:
        console.warn(`fxs-header - Invalid header style "${style}" for text ${text}`);
    }
    return "";
  }
}
Controls.define("fxs-header", {
  createInstance: FxsHeader,
  description: "A basic header",
  skipPostOnAttach: true,
  classNames: ["fxs-header"],
  attributes: [
    {
      name: "title"
    },
    {
      name: "filigree-style",
      description: "The style of the title from the following list: none, h1, h2, h3, h4, small. Default value: h3"
    },
    {
      name: "font-fit-mode",
      description: "Whether to grow or shrink the text to fit the header."
    },
    {
      name: "wrap",
      description: "Wheter to wrap or not the text (default: wrap)"
    },
    {
      name: "font-min-size",
      description: "overwrite the text min shrink size (default: 14px)"
    }
  ],
  images: [
    "fs://game/header_filigree.png",
    "fs://game/hud_divider-h2.png",
    "fs://game/hud_sidepanel_divider.png",
    "fs://game/hud_fleur.png",
    "fs://game/hud_fleur.png",
    "fs://game/shell_small-filigree.png",
    "fs://game/hud_paneltop-simple.png"
  ]
});

const EditableHeaderTextChangedEventName = "editable-header-text-changed";
class EditableHeaderTextChangedEvent extends CustomEvent {
  constructor(newStr) {
    super(EditableHeaderTextChangedEventName, { bubbles: false, cancelable: true, detail: { newStr } });
  }
}
const EditableHeaderExitEditEventName = "editable-header-exit-edit";
class EditableHeaderExitEditEvent extends CustomEvent {
  constructor() {
    super(EditableHeaderExitEditEventName, { bubbles: false, cancelable: true });
  }
}
class FxsEditableHeader extends FxsHeader {
  inputHandler = this.Root;
  editableTextBox = document.createElement("fxs-textbox");
  staticText = document.createElement("div");
  textEditToggleButton = document.createElement("fxs-edit-button");
  textEditToggleNavHelp = document.createElement("fxs-nav-help");
  disable = false;
  onEditToggleActivatedListener = this.onEditToggleActivated.bind(this);
  onTextEditStoppedListener = this.onTextEditStopped.bind(this);
  engineInputListener = this.onEngineInput.bind(this);
  activeDeviceChangedListener = this.onActiveDeviceChange.bind(this);
  bPreventRecursion = false;
  textboxMaxLength = 32;
  onAttach() {
    const tabForSelector = this.Root.getAttribute("tab-for") ?? "fxs-frame";
    if (tabForSelector !== "") {
      const inputHandler = this.Root.closest(tabForSelector);
      if (!inputHandler) {
        console.error(`fxs-editable-header: onAttach - no valid input handler found!`);
      } else {
        this.inputHandler = inputHandler;
      }
    }
    this.textEditToggleNavHelp.setAttribute("action-key", "inline-shell-action-3");
    this.textEditToggleNavHelp.classList.add("absolute", "left-0");
    this.inputHandler.addEventListener(InputEngineEventName, this.engineInputListener);
    this.staticText.classList.add(
      "font-fit-shrink",
      "max-w-84",
      "text-center",
      "truncate",
      "relative",
      this.bgGlow ? "text-shadow-subtle" : ""
    );
    this.editableTextBox.setAttribute("has-background", "false");
    this.editableTextBox.setAttribute("has-border", "false");
    this.editableTextBox.setAttribute("enabled", "false");
    this.editableTextBox.setAttribute("max-length", this.textboxMaxLength.toString());
    this.editableTextBox.addEventListener("text-edit-stop", this.onTextEditStoppedListener);
    this.editableTextBox.classList.add("max-w-84", "relative");
    this.textEditToggleButton.classList.add("size-8", "bg-contain", "bg-no-repeat", "absolute", "right-0");
    this.textEditToggleButton.addEventListener("action-activate", this.onEditToggleActivatedListener);
    this.textEditToggleButton.classList.toggle("hidden", ActionHandler.isGamepadActive);
    window.addEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceChangedListener);
    super.onAttach();
  }
  onDetach() {
    this.inputHandler.removeEventListener(InputEngineEventName, this.engineInputListener);
    this.textEditToggleButton.removeEventListener("action-activate", this.onEditToggleActivatedListener);
    this.editableTextBox.removeEventListener("text-edit-stop", this.onTextEditStoppedListener);
    window.removeEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceChangedListener);
    super.onDetach();
  }
  render() {
    this.renderQueued = false;
    while (this.Root.firstChild) {
      this.Root.removeChild(this.Root.firstChild);
    }
    this.editableTextBox.classList.add("hidden");
    this.staticText.setAttribute("data-l10n-id", this.titleText ?? "");
    this.editableTextBox.setAttribute("value", this.titleText ?? "");
    const outerDiv = document.createElement("div");
    if (this.bgGlow) {
      this.Root.insertAdjacentHTML("afterbegin", this.generateGlow(true));
    }
    switch (this.filigreeStyle) {
      case "none":
        outerDiv.append(this.editableTextBox);
        outerDiv.insertBefore(this.staticText, outerDiv.firstChild);
        break;
      case "h1":
        outerDiv.classList.add("flex", "flex-col", "items-center", "max-w-full");
        outerDiv.innerHTML = `<div class="filigree-divider-h1"></div>`;
        outerDiv.insertBefore(this.editableTextBox, outerDiv.firstChild);
        outerDiv.insertBefore(this.staticText, outerDiv.firstChild);
        break;
      case "h2":
        outerDiv.classList.add("flex", "flex-col", "items-center", "max-w-full");
        outerDiv.innerHTML = `<div class="filigree-divider-h2"></div>`;
        outerDiv.insertBefore(this.editableTextBox, outerDiv.firstChild);
        outerDiv.insertBefore(this.staticText, outerDiv.firstChild);
        break;
      case "h3":
        outerDiv.classList.add("flex", "flex-col", "items-center", "max-w-full");
        outerDiv.innerHTML = `<div class="filigree-divider-h3"></div>`;
        outerDiv.insertBefore(this.editableTextBox, outerDiv.firstChild);
        outerDiv.insertBefore(this.staticText, outerDiv.firstChild);
        break;
      case "h4":
        outerDiv.classList.add("flex", "justify-center", "max-w-full", "items-center");
        const leftDiv = document.createElement("div");
        leftDiv.classList.add("filigree-h4-left");
        outerDiv.appendChild(leftDiv);
        const midDiv = document.createElement("div");
        midDiv.classList.add("flow-row");
        midDiv.appendChild(this.editableTextBox);
        outerDiv.appendChild(midDiv);
        const rightDiv = document.createElement("div");
        rightDiv.classList.add("filigree-h4-right");
        outerDiv.appendChild(rightDiv);
        break;
      case "small":
        outerDiv.classList.add("flex", "flex-col", "items-center", "max-w-full");
        outerDiv.insertAdjacentHTML("afterbegin", `<div class="filigree-shell-small mt-2\\.5"></div>`);
        outerDiv.insertBefore(this.editableTextBox, outerDiv.firstChild);
        outerDiv.insertBefore(this.staticText, outerDiv.firstChild);
        break;
      default:
        console.warn(`fxs-editable-header - Invalid header style`);
    }
    this.Root.appendChild(outerDiv);
    this.Root.appendChild(this.textEditToggleButton);
    this.Root.appendChild(this.textEditToggleNavHelp);
  }
  onActiveDeviceChange(event) {
    this.textEditToggleButton.classList.toggle("hidden", event.detail.gamepadActive);
  }
  onTextEditStopped(event) {
    if (event.detail.confirmed) {
      this.textEditEnd();
    } else {
      this.onCancelEdit();
      this.Root.dispatchEvent(new EditableHeaderExitEditEvent());
    }
  }
  onEngineInput(event) {
    if (event.detail.status != InputActionStatuses.FINISH || this.disable) {
      return;
    }
    if (event.detail.name == "shell-action-3" || event.detail.name == "accept") {
      this.onEditToggleActivated();
      event.preventDefault();
      event.stopPropagation();
    }
  }
  onCancelEdit() {
    this.bPreventRecursion = true;
    this.editableTextBox.classList.add("hidden");
    this.staticText.classList.remove("hidden");
    this.editableTextBox.setAttribute("value", this.staticText.innerHTML);
    this.editableTextBox.setAttribute("enabled", "false");
    this.textEditToggleButton.setAttribute("is-confirm", "false");
    this.bPreventRecursion = false;
  }
  onEditToggleActivated() {
    const shouldEnable = this.editableTextBox.getAttribute("enabled") != "true";
    if (shouldEnable) {
      this.textEditBegin();
    } else {
      this.textEditEnd();
    }
  }
  textEditBegin() {
    this.editableTextBox.classList.remove("hidden");
    this.editableTextBox.setAttribute("value", this.staticText.innerHTML);
    this.staticText.classList.add("hidden");
    if (UI.canDisplayKeyboard()) {
      this.editableTextBox.setAttribute("activated", "true");
    } else {
      this.editableTextBox.setAttribute("enabled", "true");
    }
    this.textEditToggleButton.setAttribute("is-confirm", "true");
  }
  textEditEnd() {
    this.bPreventRecursion = true;
    this.editableTextBox.setAttribute("enabled", "false");
    const textboxValue = this.editableTextBox.getAttribute("value") ?? "";
    if (textboxValue.trim().length != 0) {
      this.Root.setAttribute("title", Locale.fromUGC("LOC_CITY_CUSTOM_NAME", textboxValue));
      this.Root.dispatchEvent(new EditableHeaderTextChangedEvent(textboxValue));
      this.Root.dispatchEvent(new EditableHeaderExitEditEvent());
      this.textEditToggleButton.setAttribute("is-confirm", "false");
      this.bPreventRecursion = false;
    } else {
      this.textEditBegin();
    }
  }
  onAttributeChanged(_name, _oldValue, _newValue) {
    switch (_name) {
      case "title":
        if (!this.bPreventRecursion) {
          this.onCancelEdit();
        }
        this.staticText.setAttribute("data-l10n-id", _newValue);
        break;
      case "disable":
        this.disable = _newValue == "true" ? true : false;
        break;
      default:
        super.onAttributeChanged(_name, _oldValue, _newValue);
    }
  }
}
Controls.define("fxs-editable-header", {
  createInstance: FxsEditableHeader,
  description: "An editable header",
  skipPostOnAttach: true,
  classNames: ["fxs-editable-header", "relative"],
  attributes: [
    {
      name: "title"
    },
    {
      name: "filigree-style",
      description: "The style of the title from the following list: none, h1, h2, h3, h4, small. Default value: h3"
    },
    {
      name: "font-fit-mode",
      description: "Whether to grow or shrink the text to fit the header."
    },
    {
      name: "font-min-size",
      description: "overwrite the text min shrink size (default: 14px)"
    },
    {
      name: "text-edit-enabled",
      description: "toggle if text is being edited or not"
    },
    {
      name: "disable"
    }
  ],
  images: [
    "fs://game/header_filigree.png",
    "fs://game/hud_divider-h2.png",
    "fs://game/hud_sidepanel_divider.png",
    "fs://game/hud_fleur.png",
    "fs://game/shell_small-filigree.png",
    "fs://game/hud_paneltop-simple.png"
  ]
});

export { EditableHeaderTextChangedEventName as E, FrameCloseEventName as F, FrameCloseEvent as a, FxsFrame as b, FxsHeader as c, EditableHeaderTextChangedEvent as d, EditableHeaderExitEditEventName as e, EditableHeaderExitEditEvent as f, FxsEditableHeader as g };
//# sourceMappingURL=fxs-editable-header.chunk.js.map

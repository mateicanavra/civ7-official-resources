import ActionHandler from '../input/action-handler.js';
import Cursor from '../input/cursor.js';
import { ActiveDeviceTypeChangedEventName } from '../input/input-events.js';
import { TooltipController } from './tooltip-controller.js';
import { SetTransformTranslateScale } from '../utilities/utilities-css.js';
import { RecursiveGetAttribute } from '../utilities/utilities-dom.js';
import { Layout } from '../utilities/utilities-layout.js';
import { FocusManager } from '../../ui-next/services/focus-manager.js';
import styles from './tooltip-manager.scss.js';

var Anchor = /* @__PURE__ */ ((Anchor2) => {
  Anchor2[Anchor2["None"] = 0] = "None";
  Anchor2["Right"] = "right";
  Anchor2["Left"] = "left";
  Anchor2["Top"] = "top";
  Anchor2["Bottom"] = "bottom";
  return Anchor2;
})(Anchor || {});
const DEFAULT_DELAY = 200;
const INVALID = -1;
class HidePlotTooltipEvent extends CustomEvent {
  constructor() {
    super("ui-hide-plot-tooltips", {
      bubbles: false
    });
  }
}
class ShowPlotTooltipEvent extends CustomEvent {
  constructor() {
    super("ui-show-plot-tooltips", {
      bubbles: false
    });
  }
}
class TooltipManagerSingleton {
  static Instance;
  timeShowStart;
  isShownByTimeout = true;
  // Will the tooltip auto-show based on timeout?
  isToggledOn = ActionHandler.deviceType != InputDeviceType.Touch;
  // Is the tooltip forced into an on position? (via key/button press)
  currentIsToggleOn = false;
  // isToggledOn after onUpdate
  isAnimating = false;
  // Is the tooltip in the process of animating?
  ttTypeName = "none";
  // What is the currently showing tooltip type
  x = INVALID;
  y = INVALID;
  root = document.createElement("div");
  // Root element for tooltips
  _tooltip = null;
  get tooltip() {
    return this._tooltip;
  }
  set tooltip(newTooltip) {
    if (this._tooltip == newTooltip) return;
    if (this._tooltip) {
      if (newTooltip && this._tooltip.classList.contains("tooltip--no-anim")) {
        newTooltip.classList.add("tooltip--no-anim");
      }
      this.root.removeChild(this._tooltip);
      this.tooltipResizeObserver.unobserve(this._tooltip);
    }
    if (newTooltip) {
      this.tooltipResizeObserver.observe(newTooltip);
      this.root.appendChild(newTooltip);
    }
    this._tooltip = newTooltip;
  }
  types = {};
  closeOnNextMove = false;
  plotTooltipGlobalHidden = false;
  plotTooltipTutorialHidden = false;
  // Needs to be separate from plotTooltipGlobalHidden because the view mode will change many times during tutorial and change that setting
  touchPosition = null;
  touchTarget = document.body;
  tooltipResizeObserver = new ResizeObserver(this.updateTooltipPosition.bind(this));
  // Used by the debug widget to shutdown tooltips temporarilly.
  tooltipsDisabled = false;
  disabledPlaceholder = null;
  // Used in conjunction with polling to determine if the user is dragging the camera.
  cameraWasDragging = false;
  globalPlotTooltipHideListener = this.onGlobalPlotTooltipHide.bind(this);
  globalPlotTooltipShowListener = this.onGlobalPlotTooltipShow.bind(this);
  tooltipAnimationListener = this.onTooltipAnimationFinished.bind(this);
  constructor() {
    this.timeShowStart = performance.now();
    this.root = document.createElement("div");
    this.isShownByTimeout = ActionHandler.deviceType == InputDeviceType.Mouse || ActionHandler.deviceType == InputDeviceType.Keyboard;
    engine.whenReady.then(() => {
      this.onReady();
    });
  }
  get currentTooltip() {
    return this.tooltipsDisabled || this.tooltip == this.disabledPlaceholder || this.tooltip?.classList.contains("invisible") ? null : this.tooltip;
  }
  /**
   * Singleton accessor
   */
  static getInstance() {
    if (!TooltipManagerSingleton.Instance) {
      TooltipManagerSingleton.Instance = new TooltipManagerSingleton();
    }
    return TooltipManagerSingleton.Instance;
  }
  onReady() {
    if (this.tooltip == void 0) {
      this.tooltip = document.createElement("fxs-tooltip");
    }
    this.root.style.pointerEvents = "none";
    this.root.style.position = "absolute";
    this.root.appendChild(this.tooltip);
    const tooltipsDiv = document.getElementById("tooltips");
    if (tooltipsDiv) {
      tooltipsDiv.appendChild(this.root);
    } else {
      console.error(
        "Root is missing a div with label `tooltips` to host the tool tip manager!  Making one off of the document; this may have overlap issues when they show."
      );
      document.body.appendChild(this.root);
    }
    engine.on("InputAction", this.onEngineInput);
    window.addEventListener("camera-drag-mouse-start", () => this.onMouseDragStart());
    window.addEventListener("camera-drag-mouse-end", () => this.onMouseDragEnd());
    window.addEventListener(
      ActiveDeviceTypeChangedEventName,
      (event) => this.onActiveDeviceTypeChanged(event)
    );
    window.addEventListener("ui-hide-plot-tooltips", this.globalPlotTooltipHideListener);
    window.addEventListener("ui-show-plot-tooltips", this.globalPlotTooltipShowListener);
    this.root.addEventListener("animationend", this.tooltipAnimationListener);
    engine.on("UpdateFrame", this.onUpdate, this);
    const disablePlotTooltips = {
      id: "disablePlotTooltips",
      category: "Systems",
      caption: "Disable Plot Tooltips",
      domainType: "bool",
      value: false
    };
    UI.Debug.registerWidget(disablePlotTooltips);
    engine.on("DebugWidgetUpdated", (id, value) => {
      console.log(`DebugWidgetUpdated! ${id} ${value}`);
      if (id == "disablePlotTooltips") {
        const toolTipsWereDisabled = this.tooltipsDisabled;
        this.tooltipsDisabled = value;
        if (!toolTipsWereDisabled && value) {
          if (this.disabledPlaceholder == null) {
            const el = document.createElement("div");
            el.setAttribute("data-placeholder", "tooltip-root");
            el.style.display = "none";
            this.disabledPlaceholder = el;
          }
          if (this.root && this.disabledPlaceholder) {
            const parent = this.root.parentElement;
            if (parent) {
              parent.insertBefore(this.disabledPlaceholder, this.root);
              parent.removeChild(this.root);
            }
          }
        }
        if (toolTipsWereDisabled && !value) {
          if (this.root && this.disabledPlaceholder) {
            const parent = this.disabledPlaceholder.parentElement;
            if (parent) {
              parent.insertBefore(this.root, this.disabledPlaceholder);
              parent.removeChild(this.disabledPlaceholder);
            }
          }
        }
      }
    });
  }
  reset() {
    this.ttTypeName = "none";
    this.closeOnNextMove = false;
    this.touchPosition = null;
    this.touchTarget = document.body;
    if (!this.isShownByTimeout) {
      this.hideTooltips();
    }
  }
  handleInput(inputEvent) {
    let live = true;
    switch (inputEvent.detail.name) {
      case "touch-press":
        this.isToggledOn = true;
        this.touchPosition = { x: inputEvent.detail.x, y: inputEvent.detail.y };
        const target = document.elementFromPoint(this.touchPosition.x, this.touchPosition.y);
        this.touchTarget = target instanceof HTMLElement && !(target instanceof HTMLHtmlElement) ? target : document.body;
        live = false;
        break;
    }
    return live;
  }
  handleNavigation(_navigationEvent) {
    return true;
  }
  onEngineInput = (name) => {
    const keyboardActions = ["keyboard-nav-up", "keyboard-nav-down", "keyboard-nav-left", "keyboard-nav-right"];
    if (this.ttTypeName === "plot" && keyboardActions.includes(name)) {
      this.hideTooltips();
    }
    if (this.touchPosition && name != "touch-complete" && name != "touch-press") {
      this.isToggledOn = false;
      this.reset();
    }
  };
  hideTooltips() {
    this.tooltip?.classList.add("invisible");
    this.isAnimating = false;
    this.tooltip = null;
  }
  fadeIn() {
    this.tooltip?.classList.remove("invisible");
    this.timeShowStart = performance.now();
    this.isAnimating = true;
  }
  onMouseDragStart() {
    this.hideTooltips();
  }
  onMouseDragEnd() {
    this.reset();
  }
  /** Input has switch to gamepad or kbm */
  onActiveDeviceTypeChanged(event) {
    this.isToggledOn = event.detail.deviceType != InputDeviceType.Touch;
    this.reset();
  }
  /**
   * Per-frame check if tooltip needs update.
   */
  onUpdate() {
    const cameraIsDragging = Camera.isWorldDragging();
    if (cameraIsDragging != this.cameraWasDragging) {
      if (cameraIsDragging) {
        this.onMouseDragStart();
      } else {
        this.onMouseDragEnd();
      }
      this.cameraWasDragging = cameraIsDragging;
    }
    if (this.isAnimating) {
      const now = performance.now();
      const delta = now - this.timeShowStart;
      const delay = this.isShownByTimeout ? Configuration.getUser().tooltipDelay : DEFAULT_DELAY;
      if (delta < delay) {
      } else {
        const amount = (delta - delay) * 0.01;
        if (amount >= 1) {
          this.isAnimating = false;
        }
      }
    }
    if (this.isToggledOn && !this.tooltipsDisabled && !this.cameraWasDragging) {
      this.cursorTooltipCheck();
    } else {
      this.hideTooltips();
    }
    this.currentIsToggleOn = this.isToggledOn;
  }
  getAnchorPos(element) {
    const pos = { x: 0, y: 0 };
    const elementRect = element.getBoundingClientRect();
    const anchor = RecursiveGetAttribute(element, "data-tooltip-anchor") ?? 0 /* None */;
    const anchorOffset = Layout.pixelsToScreenPixels(
      parseInt(RecursiveGetAttribute(element, "data-tooltip-anchor-offset") ?? "0")
    );
    switch (anchor) {
      case "right" /* Right */:
        pos.x = elementRect.right + anchorOffset;
        break;
      case "left" /* Left */:
        pos.x = elementRect.left - anchorOffset;
        break;
      default:
        pos.x = elementRect.left + (elementRect.right - elementRect.left) / 2;
    }
    switch (anchor) {
      case "top" /* Top */:
        pos.y = elementRect.top - anchorOffset;
        break;
      case "bottom" /* Bottom */:
        pos.y = elementRect.bottom + anchorOffset;
        break;
      default:
        pos.y = elementRect.top + (elementRect.bottom - elementRect.top) / 2;
    }
    return pos;
  }
  /**
   * Performs the checks necessary to set a new tooltip.
   */
  cursorTooltipCheck() {
    let targetElement;
    const focusManager = FocusManager.get();
    if (this.touchPosition) {
      targetElement = this.touchTarget;
    } else if (ActionHandler.isGamepadActive && !this.closeOnNextMove) {
      targetElement = focusManager.currentFocus();
    } else {
      targetElement = Cursor.target instanceof HTMLElement ? Cursor.target : void 0;
      if (!targetElement) {
        targetElement = document.body;
      }
    }
    const alternativeTargetClass = targetElement.getAttribute("data-tooltip-alternative-target");
    if (alternativeTargetClass) {
      targetElement = this.root.querySelector(`.${alternativeTargetClass}`) ?? targetElement;
    }
    const ttTypeName = RecursiveGetAttribute(targetElement, "data-tooltip-style") ?? "none";
    const isTypeChanged = this.ttTypeName != ttTypeName;
    this.ttTypeName = ttTypeName;
    if (ttTypeName == "none") {
      this.hideTooltips();
      return;
    }
    let isUpdateNeeded = false;
    const ttType = this.types[ttTypeName];
    if (ttType) {
      isUpdateNeeded = this.currentIsToggleOn != this.isToggledOn || targetElement && ttType.isUpdateNeeded(targetElement);
    }
    if (!ttType) {
      if (UI.isInGame() && ttTypeName != "none") {
      }
      if (isTypeChanged) {
        this.hideTooltips();
      }
      return;
    }
    let position = Cursor.position;
    if (ActionHandler.isGamepadActive) {
      position = ttTypeName == "plot" ? Cursor.gamepad : this.getAnchorPos(targetElement);
    } else if (ActionHandler.deviceType == InputDeviceType.Touch && this.touchPosition) {
      position = ttTypeName == "plot" ? this.touchPosition : this.getAnchorPos(targetElement);
    }
    const isPositionChanged = position.x != this.x || position.y != this.y;
    if (isPositionChanged && position.x > 0 && position.y > 0 && !this.currentTooltip) {
      isUpdateNeeded = true;
    }
    if (isTypeChanged || isUpdateNeeded) {
      if (ttType.isBlank()) {
        if (!UI.isCursorLocked()) {
          if (!(Cursor.target instanceof HTMLElement)) {
            UI.setCursorByType(UIHTMLCursorTypes.Default);
          } else if (Cursor.target.tagName == "BODY") {
            UI.setCursorByType(UIHTMLCursorTypes.Default);
          }
        }
        this.hideTooltips();
        return;
      }
      ttType.reset();
      ttType.update();
      this.tooltip = ttType.getHTML();
      this.fadeIn();
    }
    if (isPositionChanged) {
      this.setLocation(position.x, position.y);
      if (position.x < 0 || position.y < 0) {
        this.hideTooltips();
      } else {
        this.updateTooltipPosition();
        this.fadeIn();
      }
    }
    if (this.closeOnNextMove && isPositionChanged) {
      this.hideTooltips();
      this.isToggledOn = false;
      this.closeOnNextMove = false;
    }
  }
  onGlobalPlotTooltipHide() {
    if (this.ttTypeName == "plot") {
      this.hideTooltips();
    }
    this.plotTooltipGlobalHidden = true;
  }
  onGlobalPlotTooltipShow() {
    this.plotTooltipGlobalHidden = false;
  }
  /**
   * Register a tooltip style type that can accept an html element.
   * @param type Name of the tooltip style type.
   * @param tooltipInstance Instance of type to use when that style if found. (Instance is recycled for each tooltip of that type.)
   */
  registerType(type, tooltipInstance) {
    if (this.types[type] != null && type != "default") {
      console.warn("Redefining tooltip style '" + type + "', is that the intention?");
    }
    this.types[type] = tooltipInstance;
  }
  setLocation(point_x, point_y) {
    this.x = point_x;
    this.y = point_y;
  }
  updateTooltipPosition() {
    if (!this.tooltip || this.tooltip.offsetWidth === 0 || this.tooltip.offsetHeight === 0) {
      return;
    }
    const right = this.x + this.tooltip.offsetWidth;
    const bottom = this.y + this.tooltip.offsetHeight;
    const position = { x: 0, y: 0 };
    const scale = Math.min(
      1,
      window.innerWidth / this.tooltip.offsetWidth,
      window.innerHeight / this.tooltip.offsetHeight
    );
    const xOffset = (1 - scale) * this.tooltip.offsetWidth / 2;
    const yOffset = (1 - scale) * this.tooltip.offsetHeight / 2;
    if (right > window.innerWidth) {
      position.x = Math.max(0, this.x - this.tooltip.offsetWidth) - xOffset;
      this.tooltip.classList.add("right");
    } else {
      position.x = this.x + xOffset;
      this.tooltip.classList.remove("right");
    }
    if (bottom > window.innerHeight) {
      position.y = Math.max(0, this.y - this.tooltip.offsetHeight) - yOffset;
      this.tooltip.classList.add("above");
    } else {
      position.y = this.y + yOffset;
      this.tooltip.classList.remove("above");
    }
    SetTransformTranslateScale(this.root, position.x, position.y, scale, scale);
  }
  onTooltipAnimationFinished(event) {
    if (!this.tooltip) return;
    if (event.animationName.includes("tooltip-reveal")) {
      this.tooltip.classList.add("tooltip--no-anim");
      this.tooltip.style.animationName = "tooltip-fade";
      this.tooltip.style.animationDuration = "1s";
      this.tooltip.style.animationDelay = "0s";
    }
    if (event.animationName == "tooltip-fade") {
      this.tooltip.classList.remove("tooltip--no-anim");
    }
  }
}
class Tooltip extends Component {
  shortDelayThreshold = 500;
  onInitialize() {
    super.onInitialize();
    const childNodes = this.Root.children;
    const content = document.createElement("div");
    const showBorderAttr = this.Root.getAttribute("data-show-border");
    if (!showBorderAttr || showBorderAttr === "true") {
      content.classList.add("img-tooltip-border");
    }
    content.classList.add("tooltip__content", "img-tooltip-bg");
    for (let i = 0; i < childNodes.length; i++) {
      content.appendChild(childNodes[i]);
    }
    this.Root.appendChild(content);
    const tooltipDelay = Input.isShiftDown() ? 1 : Configuration.getUser().tooltipDelay;
    const progressContainer = document.createElement("div");
    progressContainer.classList.add("tooltip__progress");
    const progressBar = document.createElement("div");
    progressBar.classList.add("tooltip__progress-bar");
    progressContainer.appendChild(progressBar);
    if (this.Root.classList.contains("tooltip--no-anim")) {
      content.style.animationDelay = `0ms`;
      content.style.animationDuration = `0ms`;
      progressContainer.style.animationDuration = "0s";
      progressContainer.style.animationDelay = `0s`;
      progressContainer.style.animationName = "none";
      progressBar.style.animationDuration = `0ms`;
      progressBar.style.animationDelay = `0s`;
      this.Root.style.animationName = "tooltip-fade";
      this.Root.style.animationDuration = "1s";
      this.Root.style.animationDelay = "0s";
    } else {
      content.style.animationDelay = `${tooltipDelay}ms`;
      progressContainer.style.animationDelay = `0.25s, ${tooltipDelay}ms`;
      progressBar.style.animationDuration = `${tooltipDelay}ms`;
    }
    this.Root.appendChild(progressContainer);
    if (tooltipDelay <= this.shortDelayThreshold) {
      progressContainer.style.animationName = "none";
      content.style.animationName = "tooltip-progress-show";
    }
  }
  // Override
  getSoundTags() {
  }
}
Controls.define("fxs-tooltip", {
  createInstance: Tooltip,
  description: "Tooltip",
  classNames: ["tooltip"],
  styles: [styles]
});
const TooltipManager = TooltipManagerSingleton.getInstance();
let ttInstance = null;
function initialize() {
  const ttContainer = document.getElementById("tooltip-container") ?? document.body;
  const ttRoot = document.getElementById("tooltip-root");
  const ttContent = document.getElementById("tooltip-root-content");
  if (!ttContainer) {
    throw new Error("Could not find element with id 'tooltip-container'!");
  }
  if (!ttRoot) {
    throw new Error("Could not find element with id 'tooltip-root'!");
  }
  if (!ttContent) {
    throw new Error("Could not find element with id 'tooltip-root-content'!");
  }
  const options = {
    containerElement: ttContainer,
    tooltipRootElement: ttRoot,
    tooltipContentElement: ttContent,
    transitionDelay: 0,
    expirationDelay: 3e3,
    // show tooltip for 3 seconds after expiration
    resetDelay: 800,
    pointerOffsetX: 16,
    pointerOffsetY: 16
  };
  ttInstance = new TooltipController(options);
  ttInstance.connect();
  const disableTooltips = {
    id: "disableTooltips",
    category: "Systems",
    caption: "Disable Tooltips (except Plot)",
    domainType: "bool",
    value: false
  };
  UI.Debug.registerWidget(disableTooltips);
  engine.on("DebugWidgetUpdated", (id, value) => {
    console.log(`DebugWidgetUpdated! ${id} ${value}`);
    if (id == "disableTooltips") {
      if (value) {
        ttInstance?.disconnect();
      } else {
        ttInstance?.connect();
      }
    }
  });
}
engine.whenReady.then(() => {
  initialize();
});

export { HidePlotTooltipEvent, ShowPlotTooltipEvent, Tooltip, TooltipManager as default };
//# sourceMappingURL=tooltip-manager.js.map

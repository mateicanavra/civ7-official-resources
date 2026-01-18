import ActionHandler, { ActiveDeviceTypeChangedEventName } from '../input/action-handler.js';
import Cursor, { CursorUpdatedEventName } from '../input/cursor.js';
import FocusManager from '../input/focus-manager.js';
import { PlotCursor } from '../input/plot-cursor.js';
import { RecursiveGetAttribute } from '../utilities/utilities-dom.chunk.js';
import { L as Layout } from '../utilities/utilities-layout.chunk.js';
import '../framework.chunk.js';
import '../input/input-support.chunk.js';
import '../utilities/utilities-update-gate.chunk.js';
import '../audio-base/audio-support.chunk.js';
import '../views/view-manager.chunk.js';
import '../panel-support.chunk.js';
import '../context-manager/context-manager.js';
import '../context-manager/display-queue-manager.js';
import '../dialog-box/manager-dialog-box.chunk.js';

var Alignment = /* @__PURE__ */ ((Alignment2) => {
  Alignment2["TopLeft"] = "top-left";
  Alignment2["TopRight"] = "top-right";
  Alignment2["BottomLeft"] = "bottom-left";
  Alignment2["BottomRight"] = "bottom-right";
  return Alignment2;
})(Alignment || {});
const DEFAULT_ALIGNMENT = "bottom-right" /* BottomRight */;
var Anchor$1 = /* @__PURE__ */ ((Anchor2) => {
  Anchor2[Anchor2["None"] = 0] = "None";
  Anchor2[Anchor2["Right"] = 1] = "Right";
  Anchor2[Anchor2["Left"] = 2] = "Left";
  Anchor2[Anchor2["Top"] = 3] = "Top";
  Anchor2[Anchor2["Bottom"] = 4] = "Bottom";
  return Anchor2;
})(Anchor$1 || {});
const DEFAULT_ANCHOR = 0 /* None */;
const CURSOR_WIDTH = 24;
const CURSOR_HEIGHT = 24;
class DefaultTooltipDriver {
  controller;
  /**
   * The root containing all of the elements that we care about for the tooltip.
   */
  root;
  cursorUpdatedListener = this.onCursorUpdated.bind(this);
  targetMouseLeaveListener = this.handleMouseLeave.bind(this);
  scrollIntoViewListener = this.handleScrollIntoView.bind(this);
  cameraChangedListener = this.onCameraChanged.bind(this);
  currentFocusListener = this.onCurrentFocusChanged.bind(this);
  blurListener = this.onBlur.bind(this);
  mouseLeaveTimeout = 0;
  scratchContent = "";
  scratchElement = null;
  /** The previous event target.  Used to early out. */
  previousEventTarget = null;
  /** The previous target.  Used to early out. */
  previousTarget = null;
  previousContent = "";
  isTouchTooltip = false;
  tooltipAttributeUpdatedObserver = new MutationObserver(this.onTooltipAttributeMutated.bind(this));
  constructor(controller, root) {
    this.controller = controller;
    this.root = root;
  }
  onTooltipAttributeMutated() {
    if (!this.scratchElement) {
      return;
    }
    this.scratchContent = this.scratchElement.getAttribute("data-tooltip-content") ?? "";
    this.previousContent = this.scratchContent;
    this.controller.showTooltipElement(this.scratchElement, this.scratchContent);
  }
  recursiveGetTooltipContent(target) {
    if (target == null || target == document.body) {
      return false;
    }
    const alternativeTargetClass = target.getAttribute("data-tooltip-alternative-target");
    let alternativeTarget = null;
    if (alternativeTargetClass != null) {
      alternativeTarget = this.root.querySelector("." + alternativeTargetClass);
      if (alternativeTarget == null) {
        console.warn(
          `tooltip-controller: recursiveGetTooltipContent(): No element with ${alternativeTargetClass} class was found!`
        );
      }
    }
    const finalTarget = alternativeTarget ?? target;
    const content = finalTarget.getAttribute("data-tooltip-content");
    if (content) {
      this.scratchContent = content;
      this.scratchElement = finalTarget;
      this.tooltipAttributeUpdatedObserver.observe(this.scratchElement, {
        attributes: true,
        attributeFilter: ["data-tooltip-content"]
      });
      return true;
    }
    return this.recursiveGetTooltipContent(target.parentElement);
  }
  connect() {
    window.addEventListener("focus", this.currentFocusListener, true);
    window.addEventListener("blur", this.blurListener, true);
    window.addEventListener("scroll-into-view", this.scrollIntoViewListener, true);
    window.addEventListener(CursorUpdatedEventName, this.cursorUpdatedListener);
    engine.on("CameraChanged", this.cameraChangedListener);
    engine.on("InputAction", this.onEngineInput);
  }
  disconnect() {
    this.previousTarget?.removeEventListener("mouseleave", this.targetMouseLeaveListener);
    window.removeEventListener("focus", this.currentFocusListener, true);
    window.removeEventListener("blur", this.blurListener, true);
    window.removeEventListener("scroll-into-view", this.scrollIntoViewListener, true);
    window.removeEventListener(CursorUpdatedEventName, this.cursorUpdatedListener);
    engine.off("CameraChanged", this.cameraChangedListener);
    engine.off("InputAction", this.onEngineInput);
  }
  onEngineInput = (name, status, x, y) => {
    if (this.isTouchTooltip && name != "touch-complete") {
      this.hideTooltip();
    }
    if (name == "toggle-tooltip" && status == InputActionStatuses.FINISH) {
      this.controller.toggleTooltip();
    }
    if (name == "touch-press") {
      const element = document.elementFromPoint(x, y);
      if (element instanceof HTMLElement) {
        if (this.recursiveGetTooltipContent(element)) {
          if (!this.scratchElement) {
            throw new Error("RecursiveGetTooltipContent returned true, but no element was set.");
          }
          if (!this.scratchContent) {
            throw new Error("RecursiveGetTooltipContent returned true, but no content was set.");
          }
          this.controller.showTooltipElement(this.scratchElement, this.scratchContent);
          this.isTouchTooltip = true;
        }
      }
    }
  };
  onCurrentFocusChanged(event) {
    if (event.target instanceof HTMLElement) {
      if (!ActionHandler.isGamepadActive || !FocusManager.isFocusActive()) {
        this.hideTooltip();
        return;
      }
      const focusedElement = event.target;
      if (!this.previousTarget || this.previousTarget != focusedElement) {
        this.hideTooltip();
        if (this.recursiveGetTooltipContent(focusedElement)) {
          if (!this.scratchElement) {
            throw new Error("RecursiveGetTooltipContent returned true, but no element was set.");
          }
          if (!this.scratchContent) {
            throw new Error("RecursiveGetTooltipContent returned true, but no content was set.");
          }
          if (this.scratchElement != this.previousTarget) {
            this.controller.showTooltipElement(this.scratchElement, this.scratchContent);
            this.previousTarget = this.scratchElement;
            this.previousContent = this.scratchContent;
          }
        }
      }
    }
  }
  onCameraChanged() {
    if (!ActionHandler.isGamepadActive || !this.scratchElement || this.scratchContent == "") {
      return;
    }
    this.controller.hideTooltip();
    this.controller.showTooltipElement(this.scratchElement, this.scratchContent);
  }
  onBlur() {
    this.hideTooltip();
  }
  hideTooltip() {
    this.previousTarget?.removeEventListener("mouseleave", this.targetMouseLeaveListener);
    this.controller.hideTooltip();
    this.previousEventTarget = null;
    this.previousTarget = null;
    this.previousContent = "";
    this.scratchElement = null;
    this.scratchContent = "";
    this.isTouchTooltip = false;
  }
  handleMouseLeave(event) {
    event.target?.removeEventListener("mouseleave", this.targetMouseLeaveListener);
    if (event.target == this.previousTarget) {
      this.hideTooltip();
    }
  }
  handleScrollIntoView(event) {
    waitForLayout(() => {
      if (this.previousTarget) {
        this.controller.showTooltipElement(this.previousTarget, this.previousContent);
      }
    });
    event.stopPropagation();
  }
  onCursorUpdated(event) {
    if (event.detail.target instanceof HTMLElement) {
      if (event.detail.target == this.previousEventTarget && this.previousTarget && this.previousContent) {
        if (this.controller.anchor == 0 /* None */) {
          this.controller.showTooltipCoord(
            event.detail.x,
            event.detail.y,
            this.previousTarget,
            this.previousContent
          );
        }
      } else {
        if (this.recursiveGetTooltipContent(event.detail.target)) {
          if (!this.scratchElement) {
            throw new Error("RecursiveGetTooltipContent returned true, but no element was set.");
          }
          if (!this.scratchContent) {
            throw new Error("RecursiveGetTooltipContent returned true, but no content was set.");
          }
          if (this.scratchElement != this.previousTarget) {
            this.controller.showTooltipCoord(
              event.detail.x,
              event.detail.y,
              this.scratchElement,
              this.scratchContent
            );
          }
          if (this.mouseLeaveTimeout != 0) {
            clearTimeout(this.mouseLeaveTimeout);
            this.mouseLeaveTimeout = 0;
          }
          this.previousTarget?.removeEventListener("mouseleave", this.targetMouseLeaveListener);
          this.scratchElement.addEventListener("mouseleave", this.targetMouseLeaveListener);
          this.previousEventTarget = event.detail.target;
          this.previousTarget = this.scratchElement;
          this.previousContent = this.scratchContent;
        } else {
          this.hideTooltip();
        }
      }
    } else {
      this.hideTooltip();
    }
  }
  mutatePreviousContent(newContent) {
    this.previousContent = newContent;
  }
}
class DefaultTooltipRenderer {
  /** Cached element for stylized text. */
  textElement;
  previousElement;
  previousElementTag = "";
  constructor() {
    this.textElement = document.createElement("div");
    this.textElement.style.pointerEvents = "none";
  }
  render(context, content) {
    const customElement = context.getAttribute("data-tooltip-component");
    if (customElement) {
      if (this.previousElementTag != customElement) {
        const div = document.createElement(customElement);
        div.setAttribute("data-tooltip-content", content);
        this.previousElement = div;
        this.previousElementTag = customElement;
        return div;
      }
      if (!this.previousElement) {
        throw new Error("Expected this.previousElement to not be null.");
      }
      const prevContent = this.previousElement.getAttribute("data-tooltip-content");
      if (prevContent != content) {
        this.previousElement.setAttribute("data-tooltip-content", content);
      }
    } else {
      this.textElement.innerHTML = Locale.stylize(content);
      if (this.previousElement != this.textElement) {
        this.previousElement = this.textElement;
        this.previousElementTag = "";
        return this.textElement;
      }
    }
    return null;
  }
  release() {
  }
}
var ToolTipVisibilityState = /* @__PURE__ */ ((ToolTipVisibilityState2) => {
  ToolTipVisibilityState2[ToolTipVisibilityState2["Hidden"] = 0] = "Hidden";
  ToolTipVisibilityState2[ToolTipVisibilityState2["WaitingToShow"] = 1] = "WaitingToShow";
  ToolTipVisibilityState2[ToolTipVisibilityState2["Shown"] = 2] = "Shown";
  ToolTipVisibilityState2[ToolTipVisibilityState2["WaitingToExpire"] = 3] = "WaitingToExpire";
  ToolTipVisibilityState2[ToolTipVisibilityState2["WaitingToReset"] = 4] = "WaitingToReset";
  return ToolTipVisibilityState2;
})(ToolTipVisibilityState || {});
class TooltipController {
  observer = null;
  observerConfig = { attributes: true, childList: true, subtree: true };
  pointerOffsetX = 0;
  pointerOffsetY = 0;
  fixedPosition = false;
  resetDelay = 0;
  transitionDelay = 0;
  expirationDelay = 0;
  useTransitionDelay = true;
  /** Timeout handle for when waiting to 'reset' state. */
  resetTimeout = 0;
  /** Timeout handle for when waiting to 'show' tooltip. */
  showTimeout = 0;
  /** Timeout handle for when waiting to 'expire' tooltip. */
  expirationTimeout = 0;
  /** Timeout handle for when waiting to actually hide tooltip. */
  hideTimeout = 0;
  /** Animation frame handle for when the controller detects mutations in the tool-tip content. Queue a reposition in 2 frames. */
  mutateRepositionHandle = 0;
  /** Animation frame handle for when the controller is showing a fresh tool-tip.  Delay 2 frames to position properly. */
  showingHandle = 0;
  root;
  content;
  container;
  driver;
  renderer;
  state = 0 /* Hidden */;
  isToggledOn = true;
  tooltipX = 0;
  tooltipY = 0;
  tooltipContext = null;
  tooltipContent = "";
  tooltipAlignment = "bottom-right" /* BottomRight */;
  tooltipAnchor = 0 /* None */;
  get anchor() {
    return this.tooltipAnchor;
  }
  transitionToShownHandler = () => {
    this.transitionToShown();
  };
  resetStateHandler = () => {
    this.resetState();
  };
  expirationHandler = () => {
    this.expiration();
  };
  repositionFunction = this.reposition;
  activeDeviceChangeListener = this.onActiveDeviceTypeChanged.bind(this);
  transitionToShown() {
    this.showTimeout = 0;
    this.immediatelyShowTooltip();
    this.state = 2 /* Shown */;
  }
  resetState() {
    this.resetTimeout = 0;
    this.state = 0 /* Hidden */;
  }
  expiration() {
    this.expirationTimeout = 0;
    this.hideTooltip();
  }
  constructor(params) {
    if (!this.checkParams(params)) {
      throw new Error("Invalid parameters when constructing TooltipController.");
    }
    this.driver = new DefaultTooltipDriver(this, params.inputRootElement ?? document.body);
    this.renderer = new DefaultTooltipRenderer();
    this.root = params.tooltipRootElement;
    this.content = params.tooltipContentElement ?? params.tooltipRootElement;
    this.container = params.containerElement ?? document.body;
    this.resetDelay = params.resetDelay ?? 0;
    this.transitionDelay = params.transitionDelay ?? 0;
    this.expirationDelay = params.expirationDelay ?? 0;
    this.fixedPosition = params.fixedPosition ?? false;
    this.pointerOffsetX = params.pointerOffsetX ?? 0;
    this.pointerOffsetY = params.pointerOffsetY ?? 0;
  }
  checkParams(params) {
    if (params.tooltipRootElement == null || !(params.tooltipRootElement instanceof HTMLElement)) {
      throw new Error(`tooltipRootElement is a required value.`);
    }
    if (params.fixedPosition == true && params.containerElement != null) {
      throw new Error(`'containerElement' must remain null if 'fixedPosition' is true.`);
    }
    const checkDelay = (v, s) => {
      if (v && (v < 0 || v > 1e4)) {
        throw new Error(`Invalid value for ${s}.`);
      }
    };
    checkDelay(params.showDelay, "showDelay");
    checkDelay(params.transitionDelay, "transitionDelay");
    checkDelay(params.resetDelay, "resetDelay");
    checkDelay(params.expirationDelay, "expirationDelay");
    if (params.resetDelay && params.transitionDelay && params.resetDelay < params.transitionDelay) {
      throw new Error(`'resetDelay' must not be less than 'transitionDelay'`);
    }
    return true;
  }
  connect() {
    this.hideTooltip();
    if (!this.fixedPosition) {
      this.observer = new MutationObserver((mutations) => this.onMutate(mutations));
      if (!this.observer) {
        throw new Error("Could not instantiate MutationObserver.");
      } else {
        this.observer.observe(this.content, this.observerConfig);
      }
    }
    window.addEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceChangeListener);
    this.driver.connect();
  }
  onActiveDeviceTypeChanged(_event) {
    const forceTooltipOn = true;
    this.toggleTooltip(forceTooltipOn);
  }
  onMutate(_mutations) {
    this.root.style.visibility = "hidden";
    this.mutateRepositionHandle = requestAnimationFrame(() => {
      this.mutateRepositionHandle = requestAnimationFrame(() => {
        this.mutateRepositionHandle = 0;
        if (this.state != 2 /* Shown */) {
          throw new Error("Expected State to be 'Shown'!");
        }
        this.repositionFunction();
        this.root.style.visibility = "visible";
      });
    });
  }
  disconnect() {
    this.hideTooltip();
    this.renderer.release();
    this.driver.disconnect();
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    window.removeEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceChangeListener);
  }
  setElementToolTipCoords(contextRect) {
    if (!this.tooltipContext) {
      return;
    }
    switch (this.tooltipAlignment) {
      case "bottom-left" /* BottomLeft */:
        this.tooltipX = contextRect.x + contextRect.width;
        this.tooltipY = contextRect.y + contextRect.height + this.pointerOffsetY;
        break;
      case "top-right" /* TopRight */:
        this.tooltipX = contextRect.x;
        this.tooltipY = contextRect.y - this.pointerOffsetY;
        break;
      case "top-left" /* TopLeft */:
        this.tooltipX = contextRect.x + contextRect.width;
        this.tooltipY = contextRect.y - this.pointerOffsetY;
        break;
      case "bottom-right" /* BottomRight */:
        this.tooltipX = contextRect.x;
        this.tooltipY = contextRect.y + contextRect.height + this.pointerOffsetY;
        break;
    }
  }
  repositionTooltipElement() {
    if (!this.tooltipContext) {
      return;
    }
    const rect = this.root.getBoundingClientRect();
    const contextRect = this.tooltipContext.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();
    this.setElementToolTipCoords(contextRect);
    const prevAlignment = this.tooltipAlignment;
    const newAlignment = this.verifyAlignment(
      this.tooltipAlignment,
      this.tooltipX,
      this.tooltipY,
      rect.width,
      rect.height,
      containerRect
    );
    if (newAlignment != this.tooltipAlignment) {
      this.tooltipAlignment = newAlignment;
      this.setElementToolTipCoords(contextRect);
    }
    const adjustedTipOffset = this.constrainTipToRect(containerRect);
    this.setTooltipStyle(adjustedTipOffset, prevAlignment);
  }
  showTooltipElement(element, content) {
    this.root.style.maxWidth = "21.333rem";
    this.content.classList.remove("text-2xs");
    this.content.classList.add("text-xs");
    this.repositionFunction = this.repositionTooltipElement;
    this.useTransitionDelay = false;
    let x = 0;
    let y = 0;
    const anchorAttr = RecursiveGetAttribute(element, "data-tooltip-anchor");
    this.tooltipAnchor = anchorAttr ? this.parseAnchor(anchorAttr) : 0 /* None */;
    if (this.tooltipAnchor != 0 /* None */) {
      const anchorPosition = this.getAnchorPos(element);
      x = anchorPosition.x;
      y = anchorPosition.y;
      this.repositionFunction = this.repositionAnchored;
    }
    this.showTooltip(x, y, element, content);
  }
  showTooltipCoord(x, y, context, content) {
    this.repositionFunction = this.reposition;
    this.useTransitionDelay = true;
    const anchorAttr = RecursiveGetAttribute(context, "data-tooltip-anchor");
    this.tooltipAnchor = anchorAttr ? this.parseAnchor(anchorAttr) : 0 /* None */;
    if (this.tooltipAnchor != 0 /* None */) {
      this.showTooltipElement(context, content);
    } else {
      this.showTooltip(x, y, context, content);
    }
  }
  getAnchorPos(element) {
    const pos = { x: 0, y: 0 };
    const elementRect = element.getBoundingClientRect();
    const anchorOffsetAttr = RecursiveGetAttribute(element, "data-tooltip-anchor-offset");
    const tooltipAnchorOffset = anchorOffsetAttr ? Layout.pixelsToScreenPixels(parseInt(anchorOffsetAttr)) : 0;
    switch (this.tooltipAnchor) {
      case 1 /* Right */:
        pos.x = elementRect.right + tooltipAnchorOffset;
        break;
      case 2 /* Left */:
        pos.x = elementRect.left - tooltipAnchorOffset;
        break;
      default:
        pos.x = elementRect.left + elementRect.width / 2;
    }
    switch (this.tooltipAnchor) {
      case 3 /* Top */:
        pos.y = elementRect.top - tooltipAnchorOffset;
        break;
      case 4 /* Bottom */:
        pos.y = elementRect.bottom + tooltipAnchorOffset;
        break;
      default:
        pos.y = elementRect.top + elementRect.height / 2;
    }
    return pos;
  }
  showTooltip(x, y, context, content) {
    this.tooltipX = x;
    this.tooltipY = y;
    const showDelay = Input.isShiftDown() ? 1 : Configuration.getUser().tooltipDelay;
    if (this.hideTimeout != 0) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = 0;
    }
    if (this.state == 0 /* Hidden */ || this.state == 2 /* Shown */ || this.state == 3 /* WaitingToExpire */ || this.state == 4 /* WaitingToReset */) {
      if (this.tooltipContext != context || this.tooltipContent != content || showDelay > 0) {
        const alignmentAttr = RecursiveGetAttribute(context, "data-tooltip-alignment");
        if (alignmentAttr) {
          this.tooltipAlignment = this.parseAlignment(alignmentAttr);
        } else if (this.state == 0 /* Hidden */) {
          this.tooltipAlignment = DEFAULT_ALIGNMENT;
        } else if (context.parentElement != this.tooltipContext?.parentElement) {
          this.tooltipAlignment = DEFAULT_ALIGNMENT;
        }
        const delay = !this.useTransitionDelay || this.state == 0 /* Hidden */ ? showDelay : this.transitionDelay;
        if (delay > 0) {
          this.immediatelyHideTooltip();
        } else {
          if (this.observer) {
            this.observer.disconnect();
          }
          if (this.mutateRepositionHandle > 0) {
            window.cancelAnimationFrame(this.mutateRepositionHandle);
            this.mutateRepositionHandle = 0;
          }
          if (this.showingHandle != 0) {
            cancelAnimationFrame(this.showingHandle);
            this.showingHandle = 0;
          }
        }
        this.tooltipContext = context;
        this.tooltipContent = content;
        if (this.expirationTimeout != 0) {
          clearTimeout(this.expirationTimeout);
          this.expirationTimeout = 0;
        }
        if (this.resetTimeout != 0) {
          clearTimeout(this.resetTimeout);
          this.resetTimeout = 0;
        }
        if (this.showTimeout != 0) {
          clearTimeout(this.showTimeout);
          this.showTimeout = 0;
        }
        if (delay > 0) {
          this.showTimeout = setTimeout(this.transitionToShownHandler, delay);
          this.state = 1 /* WaitingToShow */;
        } else {
          this.immediatelyShowTooltip();
          this.state = 2 /* Shown */;
        }
      } else {
        this.repositionFunction();
      }
    } else if (this.state == 1 /* WaitingToShow */) {
      this.tooltipContext = context;
      this.tooltipContent = content;
    } else {
      throw new Error("TooltipController - Unhandled state.");
    }
  }
  hideTooltip() {
    this.tooltipContext = null;
    this.tooltipContent = "";
    switch (this.state) {
      case 3 /* WaitingToExpire */:
      case 2 /* Shown */:
        {
          this.immediatelyHideTooltip();
          if (this.hideTimeout != 0) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = 0;
          }
          if (this.showTimeout != 0) {
            clearTimeout(this.showTimeout);
            this.showTimeout = 0;
          }
          if (this.expirationTimeout != 0) {
            clearTimeout(this.expirationTimeout);
            this.expirationTimeout = 0;
          }
          if (this.resetDelay > 0) {
            this.state = 4 /* WaitingToReset */;
            this.resetTimeout = setTimeout(this.resetStateHandler, this.resetDelay);
          } else {
            this.state = 0 /* Hidden */;
          }
        }
        break;
      case 1 /* WaitingToShow */:
        {
          clearTimeout(this.showTimeout);
          this.showTimeout = 0;
          this.state = 0 /* Hidden */;
        }
        break;
      case 0 /* Hidden */:
      case 4 /* WaitingToReset */:
        break;
      default:
        throw new Error("Unhandled state in TooltipController.");
    }
  }
  expireTooltip() {
    this.tooltipContext = null;
    this.tooltipContent = "";
    switch (this.state) {
      case 2 /* Shown */:
        {
          if (this.expirationDelay > 0) {
            this.state = 3 /* WaitingToExpire */;
            this.expirationTimeout = setTimeout(this.expirationHandler, this.expirationDelay);
          } else {
            this.hideTooltip();
          }
          this.immediatelyHideTooltip();
          if (this.resetDelay > 0) {
            this.state = 4 /* WaitingToReset */;
            this.resetTimeout = setTimeout(this.resetStateHandler, this.resetDelay);
          } else {
            this.state = 0 /* Hidden */;
          }
        }
        break;
      case 1 /* WaitingToShow */:
        {
          clearTimeout(this.showTimeout);
          this.showTimeout = 0;
          this.state = 0 /* Hidden */;
        }
        break;
      case 0 /* Hidden */:
      case 3 /* WaitingToExpire */:
      case 4 /* WaitingToReset */:
        break;
      default:
        throw new Error("Unhandled state in TooltipController.");
    }
  }
  toggleTooltip(force) {
    this.isToggledOn = force ?? !this.isToggledOn;
    if (this.isToggledOn) {
      if (this.tooltipContext) {
        this.immediatelyShowTooltip();
        this.state = 2 /* Shown */;
      }
    } else {
      this.immediatelyHideTooltip();
      this.state = 0 /* Hidden */;
    }
  }
  parseAlignment(alignment) {
    switch (alignment) {
      case "top-left":
        return "top-left" /* TopLeft */;
      case "top-right":
        return "top-right" /* TopRight */;
      case "bottom-left":
        return "bottom-left" /* BottomLeft */;
      case "bottom-right":
        return "bottom-right" /* BottomRight */;
      default:
        return DEFAULT_ALIGNMENT;
    }
  }
  parseAnchor(anchor) {
    switch (anchor) {
      case "right":
        return 1 /* Right */;
      case "left":
        return 2 /* Left */;
      case "top":
        return 3 /* Top */;
      case "bottom":
        return 4 /* Bottom */;
      default:
        console.error(`tooltip-controller: Unrecognized 'data-tooltip-anchor' value: ${anchor}`);
        return DEFAULT_ANCHOR;
    }
  }
  verifyAlignment(alignment, x, y, width, height, containerRect) {
    const cursorOffset = !ActionHandler.isGamepadActive ? { x: CURSOR_WIDTH, y: CURSOR_HEIGHT } : { x: 0, y: 0 };
    const intersectRight = x + width + cursorOffset.x > containerRect.right;
    const intersectBottom = y + height + cursorOffset.y > containerRect.bottom;
    const intersectTop = y - height < containerRect.top;
    const intersectLeft = x - width < containerRect.left;
    switch (alignment) {
      case "bottom-right" /* BottomRight */:
        if (intersectRight) {
          if (intersectBottom) {
            return "top-left" /* TopLeft */;
          }
          return "bottom-left" /* BottomLeft */;
        }
        if (intersectBottom) {
          return "top-right" /* TopRight */;
        }
        break;
      case "bottom-left" /* BottomLeft */:
        if (intersectLeft) {
          if (intersectBottom) {
            return "top-right" /* TopRight */;
          }
          return "bottom-right" /* BottomRight */;
        }
        if (intersectBottom) {
          return "top-left" /* TopLeft */;
        }
        break;
      case "top-right" /* TopRight */:
        if (intersectRight) {
          if (intersectTop) {
            return "bottom-left" /* BottomLeft */;
          }
          return "top-left" /* TopLeft */;
        }
        if (intersectTop) {
          return "bottom-right" /* BottomRight */;
        }
        break;
      case "top-left" /* TopLeft */:
        if (intersectLeft) {
          if (intersectTop) {
            return "bottom-right" /* BottomRight */;
          }
          return "top-right" /* TopRight */;
        }
        if (intersectTop) {
          return "bottom-left" /* BottomLeft */;
        }
        break;
      default:
        throw new Error("Unhandled alignment value!");
    }
    return alignment;
  }
  reposition() {
    if (this.fixedPosition) {
      return;
    }
    const root = this.root;
    const offsetX = this.pointerOffsetX;
    const offsetY = this.pointerOffsetY;
    const rect = root.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();
    const prevAlignment = this.tooltipAlignment;
    this.tooltipAlignment = this.verifyAlignment(
      this.tooltipAlignment,
      this.tooltipX,
      this.tooltipY,
      rect.width + offsetX,
      rect.height + offsetY,
      containerRect
    );
    const adjustedTipOffset = this.constrainTipToRect(containerRect);
    this.setTooltipStyle(adjustedTipOffset, prevAlignment);
  }
  repositionAnchored() {
    if (this.fixedPosition || !this.tooltipContext) {
      return;
    }
    const anchorPosition = this.getAnchorPos(this.tooltipContext);
    this.tooltipX = anchorPosition.x;
    this.tooltipY = anchorPosition.y;
    const root = this.root;
    const tipRect = root.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();
    switch (this.tooltipAnchor) {
      case 1 /* Right */:
        this.tooltipY = this.tooltipY - tipRect.height / 2;
        break;
      case 2 /* Left */:
        this.tooltipY = this.tooltipY - tipRect.height / 2;
        this.tooltipX = this.tooltipX - tipRect.width;
        break;
      case 3 /* Top */:
        this.tooltipX = this.tooltipX - tipRect.width / 2;
        this.tooltipY = this.tooltipY - tipRect.height;
        break;
      case 4 /* Bottom */:
        this.tooltipX = this.tooltipX - tipRect.width / 2;
        break;
      default:
        console.error(
          `tooltip-controller: Unrecognized anchor type in repositionAnchored ${this.tooltipAnchor}`
        );
    }
    const prevAlignment = this.tooltipAlignment;
    this.tooltipAlignment = this.verifyAlignment(
      this.tooltipAlignment,
      this.tooltipX,
      this.tooltipY,
      tipRect.width,
      tipRect.height,
      containerRect
    );
    const adjustedTipOffset = this.constrainTipToRect(containerRect);
    this.setTooltipStyle(adjustedTipOffset, prevAlignment);
    waitForLayout(() => {
      const isOverflowing = this.checkOverflow(containerRect);
      if (isOverflowing) {
        this.setTooltipStyle({ x: -1, y: -1 }, prevAlignment);
      }
    });
  }
  // Constrains the final placement of a tip's rect to the passed in rect. In most cases this will be the screen.
  constrainTipToRect(constrainRect) {
    const safeAreaMargins = UI.getSafeAreaMargins();
    const safeAreaConstrainRect = {
      top: constrainRect.top + safeAreaMargins.top,
      bottom: constrainRect.bottom - safeAreaMargins.bottom,
      left: constrainRect.left + safeAreaMargins.left,
      right: constrainRect.right - safeAreaMargins.right
    };
    const cursorOffset = !ActionHandler.isGamepadActive && this.tooltipAnchor == 0 /* None */ ? { x: CURSOR_WIDTH, y: CURSOR_HEIGHT } : { x: 0, y: 0 };
    const tipRect = this.root.getBoundingClientRect();
    const offset = { x: this.tooltipX + cursorOffset.x, y: this.tooltipY + cursorOffset.y };
    if (this.tooltipY < safeAreaConstrainRect.top) {
      offset.y = Math.min(safeAreaConstrainRect.top, this.tooltipY + tipRect.height);
    }
    if (this.tooltipY + tipRect.height + cursorOffset.y > safeAreaConstrainRect.bottom) {
      offset.y = Math.max(safeAreaConstrainRect.bottom - tipRect.height, this.tooltipY - tipRect.height);
    }
    if (this.tooltipX < safeAreaConstrainRect.left) {
      offset.x = Math.min(safeAreaConstrainRect.left, this.tooltipX + tipRect.width);
    }
    if (this.tooltipX + tipRect.width + cursorOffset.x > safeAreaConstrainRect.right) {
      offset.x = Math.max(safeAreaConstrainRect.left - tipRect.width, this.tooltipX - tipRect.width);
    }
    return offset;
  }
  checkOverflow(constrainRect) {
    const safeAreaMargins = UI.getSafeAreaMargins();
    const safeAreaConstrainRect = {
      top: constrainRect.top + safeAreaMargins.top,
      bottom: constrainRect.bottom - safeAreaMargins.bottom,
      left: constrainRect.left + safeAreaMargins.left,
      right: constrainRect.right - safeAreaMargins.right
    };
    const cursorOffset = !ActionHandler.isGamepadActive && this.tooltipAnchor == 0 /* None */ ? { x: CURSOR_WIDTH, y: CURSOR_HEIGHT } : { x: 0, y: 0 };
    const tipRect = this.root.getBoundingClientRect();
    const offset = { x: this.tooltipX + cursorOffset.x, y: this.tooltipY + cursorOffset.y };
    const intersectRight = this.tooltipX + offset.x + tipRect.width > safeAreaConstrainRect.right;
    const intersectBottom = this.tooltipY + offset.y + tipRect.height > safeAreaConstrainRect.bottom;
    const intersectTop = this.tooltipY + offset.y < safeAreaConstrainRect.top;
    const intersectLeft = this.tooltipX + offset.x < safeAreaConstrainRect.left;
    if (intersectBottom && intersectTop || intersectLeft && intersectRight) {
      console.error(
        `tooltip-controller: ERROR - tip does not fit on the screen! Start conversation with game design or UI design for alternate solutions!`
      );
      return true;
    }
    return false;
  }
  adjustOverflow(callback) {
    if (!this.tooltipContext) {
      return;
    }
    const tipRect = this.root.getBoundingClientRect();
    const containerRect = this.container.getBoundingClientRect();
    const anchorPosition = this.getAnchorPos(this.tooltipContext);
    const overflowHeight = Math.max(tipRect.height - containerRect.bottom, 0);
    if (overflowHeight > 0) {
      const overflowWidth = overflowHeight / containerRect.bottom * containerRect.right;
      const newWidth = Math.min(anchorPosition.x, overflowWidth + GlobalScaling.remToScreenPixels(21.333));
      this.root.style.maxWidth = newWidth + "px";
    }
    requestAnimationFrame(() => {
      const tipRect2 = this.root.getBoundingClientRect();
      const overflowHeight2 = Math.max(tipRect2.height - containerRect.bottom, 0);
      if (overflowHeight2 > 0) {
        this.content.classList.remove("text-xs");
        this.content.classList.add("text-2xs");
        requestAnimationFrame(() => {
          callback();
        });
      } else {
        callback();
      }
    });
  }
  setTooltipStyle(offset, prevAlignment) {
    if (this.tooltipAlignment != prevAlignment) {
      this.root.classList.remove(
        "tooltip-align--top-left",
        "tooltip-align--top-right",
        "tooltip-align--bottom-left",
        "tooltip-align--bottom-right"
      );
      switch (this.tooltipAlignment) {
        case "top-left" /* TopLeft */:
          this.root.classList.add("tooltip-align--top-left");
          break;
        case "top-right" /* TopRight */:
          this.root.classList.add("tooltip-align--top-right");
          break;
        case "bottom-left" /* BottomLeft */:
          this.root.classList.add("tooltip-align--bottom-left");
          break;
        case "bottom-right" /* BottomRight */:
          this.root.classList.add("tooltip-align--bottom-right");
          break;
        default:
          throw new Error("Unhandled alignment value.");
      }
    }
    this.root.style.leftPX = offset.x;
    this.root.style.topPX = offset.y;
  }
  immediatelyHideTooltip() {
    this.renderer.release();
    this.root.style.visibility = "hidden";
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.mutateRepositionHandle > 0) {
      window.cancelAnimationFrame(this.mutateRepositionHandle);
      this.mutateRepositionHandle = 0;
    }
    if (this.showingHandle != 0) {
      cancelAnimationFrame(this.showingHandle);
      this.showingHandle = 0;
    }
  }
  immediatelyShowTooltip() {
    if (!this.tooltipContext) {
      throw new Error(`Showing tooltip with no context??`);
    }
    if (!this.isToggledOn) {
      return;
    }
    if (this.showingHandle != 0) {
      cancelAnimationFrame(this.showingHandle);
      this.showingHandle = 0;
    }
    const newElement = this.renderer.render(this.tooltipContext, this.tooltipContent);
    if (newElement) {
      if (this.observer) {
        this.observer.disconnect();
      }
      this.root.style.visibility = "hidden";
      while (this.content.hasChildNodes()) {
        this.content.removeChild(this.content.lastChild);
      }
      this.content.appendChild(newElement);
      this.showingHandle = requestAnimationFrame(() => {
        this.showingHandle = requestAnimationFrame(() => {
          this.showingHandle = 0;
          if (this.state != 2 /* Shown */) {
            throw new Error("Expected visibility state to be shown!");
          }
          this.repositionFunction();
          this.root.style.visibility = "visible";
          if (this.observer) {
            this.observer.observe(this.content, this.observerConfig);
          }
        });
      });
    } else {
      this.showingHandle = requestAnimationFrame(() => {
        this.showingHandle = requestAnimationFrame(() => {
          this.showingHandle = 0;
          const adjustCallback = () => {
            this.repositionFunction();
            this.root.style.visibility = "visible";
          };
          this.adjustOverflow(adjustCallback);
        });
      });
    }
  }
}

const SetTransformTranslateScale = (element, translateX, translateY, scaleX, scaleY) => {
  let transform = element.attributeStyleMap.get("transform");
  if (transform) {
    if (transform instanceof CSSTransformValue) {
      if (transform[1] instanceof CSSTranslate) {
        transform[1].x = CSS.px(translateX);
        transform[1].y = CSS.px(translateY);
      } else {
        transform[1] = new CSSTranslate(CSS.px(translateX), CSS.px(translateY));
      }
      if (transform[0] instanceof CSSScale) {
        transform[0].x = scaleX;
        transform[0].y = scaleY;
      } else {
        transform[0] = new CSSScale(scaleX, scaleY);
      }
    }
  } else {
    transform = new CSSTransformValue([
      new CSSScale(scaleX, scaleY),
      new CSSTranslate(CSS.px(translateX), CSS.px(translateY))
    ]);
  }
  element.attributeStyleMap.set("transform", transform);
};

const styles = "fs://game/core/ui/tooltips/tooltip-manager.css";

var Anchor = /* @__PURE__ */ ((Anchor2) => {
  Anchor2[Anchor2["None"] = 0] = "None";
  Anchor2["Right"] = "right";
  Anchor2["Left"] = "left";
  Anchor2["Top"] = "top";
  Anchor2["Bottom"] = "bottom";
  return Anchor2;
})(Anchor || {});
const DEFAULT_DELAY = 200;
var PlotTooltipPriority = /* @__PURE__ */ ((PlotTooltipPriority2) => {
  PlotTooltipPriority2[PlotTooltipPriority2["HIGH"] = 0] = "HIGH";
  PlotTooltipPriority2[PlotTooltipPriority2["LOW"] = 1] = "LOW";
  return PlotTooltipPriority2;
})(PlotTooltipPriority || {});
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
  plotTooltipTypes = {};
  orderedPlotTooltipTypes = [];
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
      case "toggle-tooltip":
        this.onToggleTooltip(inputEvent.detail.status);
        live = false;
        break;
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
  onToggleTooltip(status) {
    if (status == InputActionStatuses.FINISH) {
      this.isToggledOn = !this.isToggledOn;
    }
  }
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
  getTooltipTypeName(targetElement) {
    if (targetElement == document.body && PlotCursor.plotCursorCoords) {
      for (const type of this.orderedPlotTooltipTypes) {
        const ttInstance2 = this.plotTooltipTypes[type].instance;
        if (ttInstance2 == null || ttInstance2 == void 0) {
          console.error("tooltip-manager: unregistered 'type': ", type);
          continue;
        }
        const isUpdateNeeded = ttInstance2.isUpdateNeeded(PlotCursor.plotCursorCoords);
        if (isUpdateNeeded) {
          ttInstance2.reset();
          ttInstance2.update();
        }
        if (!ttInstance2.isBlank()) {
          return type;
        }
      }
      return "none";
    } else {
      return RecursiveGetAttribute(targetElement, "data-tooltip-style") ?? "none";
    }
  }
  /**
   * Performs the checks necessary to set a new tooltip.
   */
  cursorTooltipCheck() {
    let targetElement;
    if (this.touchPosition) {
      targetElement = this.touchTarget;
    } else if (ActionHandler.isGamepadActive && !this.closeOnNextMove) {
      targetElement = FocusManager.getFocus();
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
    const ttTypeName = this.getTooltipTypeName(targetElement);
    const isTypeChanged = this.ttTypeName != ttTypeName;
    this.ttTypeName = ttTypeName;
    const isPlotType = this.ttTypeName in this.plotTooltipTypes;
    if (isPlotType && (!this.isToggledOn || this.plotTooltipGlobalHidden || this.plotTooltipTutorialHidden)) {
      this.hideTooltips();
      return;
    }
    if (ttTypeName == "none") {
      this.hideTooltips();
      return;
    }
    let ttType;
    let isUpdateNeeded;
    if (ttTypeName in this.plotTooltipTypes && targetElement == document.body) {
      ttType = this.plotTooltipTypes[ttTypeName].instance;
      isUpdateNeeded = this.currentIsToggleOn != this.isToggledOn;
    } else {
      ttType = this.types[ttTypeName];
      isUpdateNeeded = this.currentIsToggleOn != this.isToggledOn || targetElement && ttType.isUpdateNeeded(targetElement);
    }
    if (!ttType) {
      if (UI.isInGame() && ttTypeName != "none") {
        console.warn(
          "Unable to show tooltips on '" + targetElement + "' due to unknown TooltipType: " + ttTypeName
        );
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
  /**
   * Register a tooltip style type that can accept a PlotCoord as a target.
   * @param type Name of the tooltip style type.
   * @param tooltipInstance Instance of type to use when that style if found. (Instance is recycled for each tooltip of that type.)
   */
  registerPlotType(type, priority, instance) {
    if (this.plotTooltipTypes[type] != null && type != "default") {
      console.warn("Redefining tooltip style '" + type + "', is that the intention?");
    }
    this.plotTooltipTypes[type] = {
      instance,
      priority
    };
    this.orderedPlotTooltipTypes = Object.keys(this.plotTooltipTypes).sort(
      (a, b) => this.plotTooltipTypes[a].priority - this.plotTooltipTypes[b].priority
    );
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

export { HidePlotTooltipEvent, PlotTooltipPriority, ShowPlotTooltipEvent, Tooltip, TooltipManager as default };
//# sourceMappingURL=tooltip-manager.js.map

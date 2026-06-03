import ActionHandler from '../input/action-handler.js';
import { CursorUpdatedEventName } from '../input/cursor.js';
import { ActiveDeviceTypeChangedEventName } from '../input/input-events.js';
import { RecursiveGetAttribute } from '../utilities/utilities-dom.js';
import { Layout } from '../utilities/utilities-layout.js';
import { FocusManager } from '../../ui-next/services/focus-manager.js';

var Alignment = /* @__PURE__ */ ((Alignment2) => {
  Alignment2["TopLeft"] = "top-left";
  Alignment2["TopRight"] = "top-right";
  Alignment2["BottomLeft"] = "bottom-left";
  Alignment2["BottomRight"] = "bottom-right";
  return Alignment2;
})(Alignment || {});
const DEFAULT_ALIGNMENT = "bottom-right" /* BottomRight */;
var Anchor = /* @__PURE__ */ ((Anchor2) => {
  Anchor2[Anchor2["None"] = 0] = "None";
  Anchor2[Anchor2["Right"] = 1] = "Right";
  Anchor2[Anchor2["Left"] = 2] = "Left";
  Anchor2[Anchor2["Top"] = 3] = "Top";
  Anchor2[Anchor2["Bottom"] = 4] = "Bottom";
  return Anchor2;
})(Anchor || {});
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
      if (!ActionHandler.isGamepadActive || !FocusManager.get().isFocusActive()) {
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
    let effectiveAnchor = this.tooltipAnchor;
    const elementRect = this.tooltipContext.getBoundingClientRect();
    const anchorOffsetAttr = RecursiveGetAttribute(this.tooltipContext, "data-tooltip-anchor-offset");
    const anchorOffset = anchorOffsetAttr ? Layout.pixelsToScreenPixels(parseInt(anchorOffsetAttr)) : 0;
    switch (effectiveAnchor) {
      case 2 /* Left */:
        if (this.tooltipX - tipRect.width < containerRect.left) {
          this.tooltipX = elementRect.right + anchorOffset;
          effectiveAnchor = 1 /* Right */;
        }
        break;
      case 1 /* Right */:
        if (this.tooltipX + tipRect.width > containerRect.right) {
          this.tooltipX = elementRect.left - anchorOffset;
          effectiveAnchor = 2 /* Left */;
        }
        break;
      case 3 /* Top */:
        if (this.tooltipY - tipRect.height < containerRect.top) {
          this.tooltipY = elementRect.bottom + anchorOffset;
          effectiveAnchor = 4 /* Bottom */;
        }
        break;
      case 4 /* Bottom */:
        if (this.tooltipY + tipRect.height > containerRect.bottom) {
          this.tooltipY = elementRect.top - anchorOffset;
          effectiveAnchor = 3 /* Top */;
        }
        break;
    }
    switch (effectiveAnchor) {
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
        console.error(`tooltip-controller: Unrecognized anchor type in repositionAnchored ${effectiveAnchor}`);
    }
    const prevAlignment = this.tooltipAlignment;
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
    this.showingHandle = requestAnimationFrame(() => {
      const tipRect2 = this.root.getBoundingClientRect();
      const overflowHeight2 = Math.max(tipRect2.height - containerRect.bottom, 0);
      if (overflowHeight2 > 0) {
        this.content.classList.remove("text-xs");
        this.content.classList.add("text-2xs");
        this.showingHandle = requestAnimationFrame(() => {
          this.showingHandle = 0;
          callback();
        });
      } else {
        this.showingHandle = 0;
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
      if (this.root.style.visibility == "visible") {
        this.repositionFunction();
      }
      this.showingHandle = requestAnimationFrame(() => {
        this.showingHandle = requestAnimationFrame(() => {
          this.showingHandle = 0;
          const adjustCallback = () => {
            this.repositionFunction();
            if (this.root.style.visibility != "visible") {
              this.root.style.visibility = "visible";
            }
          };
          this.adjustOverflow(adjustCallback);
        });
      });
    }
  }
}

export { TooltipController };
//# sourceMappingURL=tooltip-controller.js.map

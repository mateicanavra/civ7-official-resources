import { Audio } from '../audio-base/audio-support.js';
import { utils } from '../graph-layout/utils.js';
import Cursor from '../input/cursor.js';
import { InputEngineEventName, NavigateInputEventName } from '../input/input-support.js';
import { Layout } from '../utilities/utilities-layout.js';

var resizeThumb = /* @__PURE__ */ ((resizeThumb2) => {
  resizeThumb2["NONE"] = "0";
  resizeThumb2["RESIZE"] = "1";
  return resizeThumb2;
})(resizeThumb || {});
class ScrollIntoViewEvent extends CustomEvent {
  constructor() {
    super("scroll-into-view", { bubbles: true, cancelable: false });
  }
}
class ScrollAtBottomEvent extends CustomEvent {
  constructor() {
    super("scroll-at-bottom", { bubbles: true, cancelable: false });
  }
}
class ScrollExitBottomEvent extends CustomEvent {
  constructor() {
    super("scroll-exit-bottom", { bubbles: true, cancelable: false });
  }
}
class FxsScrollable extends Component {
  static MIN_SIZE_PIXELS = 24;
  static MIN_SIZE_OVERFLOW = 2;
  static DECORATION_SIZE = 24;
  /** scrollArea is the container that grows unbounded (important for ResizeObserver) */
  scrollArea;
  /** scrollAreaContainer is the container that scrolls and is the max height of its parent. */
  scrollAreaContainer;
  scrollbarTrack;
  scrollbarThumb;
  thumbHighlight;
  thumbActive;
  navHelp = null;
  isDraggingScroll = false;
  isMouseOver = false;
  allowScroll = true;
  scrollbarPrevVisibility = false;
  isHandleGamepadPan = false;
  isHandleNavPan = false;
  allowMousePan = false;
  allowScrollOnResizeWhenBottom = false;
  // #region Gamepad Pan Data
  isPanning = false;
  gamepadPanAnimationId = -1;
  gamepadPanY = 0;
  isStillPanningCheck = 0;
  lastPanTimestamp = 0;
  panRate = 0.75;
  // #endregion
  mouseMoveListener = this.onMouseMove.bind(this);
  mouseUpListener = this.onMouseUp.bind(this);
  mouseEnterListener = this.onMouseEnter.bind(this);
  mouseLeaveListener = this.onMouseLeave.bind(this);
  engineInputListener = this.onEngineInput.bind(this);
  engineInputProxyListener = this.onEngineInputProxy.bind(this);
  navigationInputListener = this.onNavigationInput.bind(this);
  scrollBarEngineInputListener = this.onScrollBarEngineInput.bind(this);
  gamepadPanAnimationCallback = this.onGamepadPanUpdate.bind(this);
  resizeObserver = new ResizeObserver(this.onResize.bind(this));
  windowEngineInputListener = this.onWindowEngineInput.bind(this);
  engineInputProxy;
  navigationInputProxy;
  scrollableAreaSize = 0;
  scrollableContentSize = 0;
  thumbRect;
  thumbSize = 0;
  thumbDelta = {
    x: 0,
    y: 0
  };
  maxScroll = 0;
  scrollPosition = 0;
  maxThumbPosition = 0;
  thumbScrollPosition = 0;
  dragInProgress = false;
  touchDragY = 0;
  isScrollAtBottom = true;
  get proxyMouse() {
    return this.Root.getAttribute("proxy-mouse") == "true";
  }
  constructor(root) {
    super(root);
    const flexAttribute = this.Root.getAttribute("flex");
    const flexClass = flexAttribute && flexAttribute == "initial" ? "flex-initial" : "flex-auto";
    this.Root.setAttribute("resize-thumb", "0" /* NONE */);
    this.scrollPosition = 0;
    this.thumbScrollPosition = 0;
    this.scrollbarThumb = document.createElement("div");
    this.scrollbarThumb.classList.add("fxs-scrollbar__thumb--vertical");
    this.scrollbarThumb.style.transform = "none";
    const thumbInner = document.createElement("div");
    thumbInner.classList.add("fxs-scrollbar__thumb-bg--vertical", "absolute", "inset-0");
    this.scrollbarThumb.appendChild(thumbInner);
    this.thumbHighlight = document.createElement("div");
    this.thumbHighlight.classList.add("fxs-scrollbar__thumb-bg-highlight--vertical", "absolute", "inset-0");
    this.scrollbarThumb.appendChild(this.thumbHighlight);
    this.thumbActive = document.createElement("div");
    this.thumbActive.classList.add("fxs-scrollbar__thumb-bg-active--vertical", "absolute", "inset-0");
    this.scrollbarThumb.appendChild(this.thumbActive);
    this.scrollbarTrack = document.createElement("div");
    this.scrollbarTrack.className = "fxs-scrollbar__track--vertical w-4 my-6";
    this.scrollbarTrack.appendChild(this.scrollbarThumb);
    const contentClass = this.Root.getAttribute("content-class") ?? "";
    this.scrollArea = document.createElement("div");
    this.scrollArea.classList.add(
      "flex",
      "flex-col",
      "justify-start",
      "pointer-events-auto",
      "fxs-scrollable-content",
      "pointer-events-auto"
    );
    this.scrollArea.style.flexShrink = "0";
    if (contentClass) {
      this.scrollArea.classList.add(...contentClass.split(" "));
    }
    this.scrollAreaContainer = document.createElement("div");
    this.scrollAreaContainer.classList.add(
      "flex",
      "flex-col",
      flexClass,
      "fxs-scrollable-content-container",
      "max-w-full",
      "max-h-full",
      "overflow-y-scroll"
    );
    this.scrollAreaContainer.appendChild(this.scrollArea);
    this.attachChildEventListeners();
  }
  onInitialize() {
    while (this.Root.hasChildNodes()) {
      const node = this.Root.firstChild;
      if (node) {
        this.scrollArea.appendChild(node);
      } else {
        break;
      }
    }
    this.Root.classList.add("relative", "max-h-full", "max-w-full", "pointer-events-auto");
    if (this.scrollArea.lastElementChild) {
      this.scrollArea.lastElementChild.classList.add("fxs-scrollable-content--last");
    }
    this.Root.append(this.scrollAreaContainer, this.scrollbarTrack);
    if (!this.Root.hasAttribute("handle-gamepad-pan")) {
      this.Root.setAttribute("handle-gamepad-pan", "true");
    }
    if (!this.Root.hasAttribute("attached-scrollbar")) {
      this.Root.setAttribute("attached-scrollbar", "false");
    }
  }
  onAttach() {
    super.onAttach();
    this.hide();
    delayByFrame(this.resizeScrollThumb.bind(this), 2);
    this.resizeObserver.observe(this.scrollArea, { box: "border-box" });
    this.Root.listenForWindowEvent(InputEngineEventName, this.windowEngineInputListener);
    this.Root.redirectChildrenToContent(this.scrollArea);
    const engineInputProxy = this.engineInputProxy?.deref();
    if (engineInputProxy) {
      engineInputProxy.addEventListener("engine-input", this.engineInputProxyListener);
    }
  }
  onAttributeChanged(name, oldValue, newValue) {
    if (name == "scrollpercent") {
      const value = newValue ? parseFloat(newValue) : 0;
      this.scrollToPercentage(value * this.maxScroll);
    } else if (name == "handle-gamepad-pan") {
      this.isHandleGamepadPan = newValue == "true";
      this.showScrollNavHelpElement(this.isHandleGamepadPan);
    } else if (name == "handle-nav-pan") {
      this.isHandleNavPan = newValue == "true";
      this.showScrollNavHelpElement(this.isHandleGamepadPan);
    } else if (name == "attached-scrollbar" && oldValue != newValue) {
      this.setIsAttachedLayout(newValue == "true");
    } else if (name == "allow-mouse-panning" && oldValue != newValue) {
      this.allowMousePan = newValue == "true";
    } else if (name == "scroll-on-resize-when-bottom") {
      this.allowScrollOnResizeWhenBottom = newValue == "true";
    }
  }
  onDetach() {
    this.resizeObserver.disconnect();
    if (this.engineInputProxy) {
      this.engineInputProxy.deref()?.removeEventListener("engine-input", this.engineInputProxyListener);
    }
    if (this.navigationInputProxy) {
      this.navigationInputProxy.removeEventListener(NavigateInputEventName, this.navigationInputListener);
    }
    super.onDetach();
  }
  /**
   * Sets a proxy for engine input events so they can be listened to without this element being in the focus tree.
   * @param proxy The element to listen to engine input events on
   */
  setEngineInputProxy(proxy) {
    const oldProxy = this.engineInputProxy?.deref();
    if (oldProxy) {
      oldProxy.removeEventListener("engine-input", this.engineInputProxyListener);
      this.engineInputProxy = void 0;
    }
    if (proxy) {
      this.engineInputProxy = new WeakRef(proxy);
      proxy.addEventListener("engine-input", this.engineInputProxyListener);
    }
  }
  /**
   * Sets a proxy for navigation input events so they can be listened to without this element being in the focus tree.
   * @param proxy The element to listen to engine input events on
   */
  setNavigationInputProxy(proxy) {
    if (this.navigationInputProxy) {
      this.navigationInputProxy.removeEventListener(NavigateInputEventName, this.navigationInputListener);
    }
    if (proxy) {
      this.navigationInputProxy = proxy;
      this.navigationInputProxy.addEventListener(NavigateInputEventName, this.navigationInputListener);
    }
  }
  get currentScrollOnScrollAreaInPixels() {
    return this.scrollAreaContainer.scrollTop;
  }
  set currentScrollOnScrollAreaInPixels(value) {
    this.scrollAreaContainer.scrollTop = value;
  }
  get maxScrollOnScrollAreaInPixels() {
    return this.scrollArea.scrollHeight;
  }
  get maxScrollTop() {
    return this.scrollAreaContainer.scrollHeight - this.scrollAreaContainer.clientHeight;
  }
  getActiveDimension(rect) {
    return rect.height;
  }
  onResize(_entries, _observer) {
    const scrollWasAtbottom = this.isScrollAtBottom;
    this.isScrollAtBottom = false;
    delayByFrame(() => {
      this.resizeScrollThumb();
      if (this.allowScrollOnResizeWhenBottom && scrollWasAtbottom) {
        delayByFrame(() => {
          this.scrollToPercentage(1);
        }, 4);
      }
    }, 2);
  }
  /**
   * Converts the mouse coordinates to a scroll percentage.
   * @param event
   */
  mouseCoordinatesToScroll(event) {
    const mouseAreaRect = this.scrollbarTrack.getBoundingClientRect();
    return (event.clientY - mouseAreaRect.y + this.thumbDelta.y) / mouseAreaRect.height;
  }
  onWindowEngineInput(inputEvent) {
    let handled = false;
    switch (inputEvent.detail.name) {
      case "touch-complete":
        this.thumbActive.classList.remove("opacity-100");
        this.isDraggingScroll = false;
        this.dragInProgress = false;
        handled = true;
        break;
      case "mousebutton-left":
      case "touch-pan":
        if (inputEvent.detail.status == InputActionStatuses.DRAG) {
          if (inputEvent.detail.name == "mousebutton-left" && !this.allowMousePan) {
            return;
          }
          if (inputEvent.detail.isMouse && Cursor.target instanceof HTMLElement && Cursor.target.closest(".no-pan")) {
            return;
          }
          const scrollAreaRect = this.scrollArea.getBoundingClientRect();
          const x = inputEvent.detail.x;
          const y = inputEvent.detail.y;
          if (x < scrollAreaRect.left || x > scrollAreaRect.right) {
            this.dragInProgress = false;
          }
          if (this.isDraggingScroll) {
            handled = true;
            if (inputEvent.detail.name == "touch-pan") {
              if (this.thumbSize == 0) {
                this.setScrollBoundaries();
              }
              const trackRect = this.scrollbarTrack.getBoundingClientRect();
              const scrollPercentage = (inputEvent.detail.y - trackRect.y + this.thumbDelta.y) / trackRect.height;
              this.scrollToPercentage(scrollPercentage);
            }
          } else if (this.dragInProgress) {
            this.currentScrollOnScrollAreaInPixels += this.touchDragY - y;
            this.setScrollThumbPosition();
            this.touchDragY = y;
            handled = true;
          }
        } else if (this.allowMousePan && (this.isDraggingScroll || this.dragInProgress) && inputEvent.detail.name == "mousebutton-left" && inputEvent.detail.status == InputActionStatuses.FINISH) {
          this.thumbActive.classList.remove("opacity-100");
          this.isDraggingScroll = false;
          this.dragInProgress = false;
          handled = true;
        }
        break;
    }
    if (handled) {
      inputEvent.preventDefault();
      inputEvent.stopPropagation();
    }
  }
  onEngineInputProxy(inputEvent) {
    this.onEngineInput(inputEvent);
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.name == "scroll-pan" && this.isHandleGamepadPan && !this.isHandleNavPan) {
      if (this.allowScroll) {
        this.onGamepadPan(inputEvent);
      }
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
      return;
    }
    if (inputEvent.detail.name == "touch-pan" || this.allowMousePan && inputEvent.detail.name == "mousebutton-left") {
      if (Cursor.target instanceof HTMLElement && Cursor.target.closest(".no-pan")) {
        this.dragInProgress = false;
        return;
      }
      this.onTouchOrMousePan(inputEvent);
      return;
    }
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    const isProxy = inputEvent.target == this.engineInputProxy?.deref();
    const shouldHandleMouseWheel = this.isMouseOver || this.proxyMouse && isProxy;
    const isMouseWheelEvent = inputEvent.detail.name == "mousewheel-up" || inputEvent.detail.name == "mousewheel-down";
    if (shouldHandleMouseWheel && isMouseWheelEvent) {
      if (this.allowScroll) {
        if (isProxy) {
          const oldScroll = this.currentScrollOnScrollAreaInPixels;
          const newScroll = utils.clamp(oldScroll - inputEvent.detail.x, 0, this.maxScrollTop);
          this.currentScrollOnScrollAreaInPixels = newScroll;
        }
        this.setScrollThumbPosition();
        inputEvent.stopPropagation();
      }
      inputEvent.preventDefault();
    }
    if (isProxy) {
      return;
    }
    if (inputEvent.detail.name == "mousebutton-left") {
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  onNavigationInput(inputEvent) {
    if (!this.isHandleNavPan) {
      return;
    }
    switch (inputEvent.detail.name) {
      case "nav-move":
        if (this.allowScroll) {
          this.onGamepadPan(inputEvent);
        }
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
        break;
    }
  }
  onScrollBarEngineInput(inputEvent) {
    if (inputEvent.detail.name != "touch-pan") {
      return;
    }
    switch (inputEvent.detail.status) {
      case InputActionStatuses.START:
        this.thumbActive.classList.add("opacity-100");
        const thumbRect = this.scrollbarThumb.getBoundingClientRect();
        this.thumbDelta.x = thumbRect.x - inputEvent.detail.x;
        this.thumbDelta.y = thumbRect.y - inputEvent.detail.y;
        this.isDraggingScroll = true;
        inputEvent.preventDefault();
        inputEvent.stopPropagation();
        break;
      default:
        break;
    }
  }
  /**
   * Attaches all event listeners for the component.
   */
  attachChildEventListeners() {
    this.scrollbarTrack.addEventListener("click", (event) => {
      event.stopImmediatePropagation();
    });
    this.Root.addEventListener("engine-input", this.engineInputListener);
    this.Root.addEventListener("mouseenter", this.mouseEnterListener);
    this.Root.addEventListener("mouseleave", this.mouseLeaveListener);
    this.scrollbarTrack.addEventListener("mousedown", (event) => {
      const scrollPercentage = this.mouseCoordinatesToScroll(event);
      this.scrollToPercentage(scrollPercentage);
    });
    this.scrollbarTrack.addEventListener(InputEngineEventName, this.scrollBarEngineInputListener);
    this.scrollbarThumb.addEventListener("mousedown", (event) => {
      Audio.playSound("data-audio-scroll-thumb-down");
      this.scrollbarThumb.classList.add("fxs-scrollable-thumb--active");
      this.isDraggingScroll = true;
      const thumbRect = this.scrollbarThumb.getBoundingClientRect();
      this.thumbDelta.x = thumbRect.x - event.clientX;
      this.thumbDelta.y = thumbRect.y - event.clientY;
      window.addEventListener("mousemove", this.mouseMoveListener);
      window.addEventListener("mouseup", this.mouseUpListener, true);
    });
    this.scrollbarThumb.addEventListener("mouseleave", () => {
      if (!this.isDraggingScroll) {
        this.scrollbarThumb.classList.add("fxs-scrollable-thumb--hover-off");
      }
    });
    this.scrollArea.addEventListener(
      "focus",
      (event) => {
        const target = event.target;
        if (target) {
          if (!target.hasAttribute("slot")) {
            this.scrollIntoView(target);
          }
        }
      },
      true
    );
  }
  /**
   * Shows the scrollbar
   */
  show() {
    this.allowScroll = true;
    this.scrollbarTrack.classList.remove("hidden");
    this.scrollbarPrevVisibility = true;
  }
  /**
   * Hides the scrollbar
   */
  hide() {
    this.allowScroll = false;
    this.scrollbarTrack.classList.add("hidden");
    this.scrollbarPrevVisibility = false;
  }
  /**
   * On key down we scroll by the needed amount.
   * @param {KeyboardEvent} event
   */
  /** //TODO: When we update action-handler input cascade, we need to actually flow in to the
  	  scrollables, to be able to scroll when not dependent on focus.  */
  /*onKeydown(event: KeyboardEvent) {
  		if (event.target instanceof HTMLTextAreaElement) {
  			this.setScrollThumbPosition();
  			return;
  		}
  
  		if (event.keyCode === KeyboardKeys.Home) {
  			this.scrollToPercentage(0);
  			return;
  		}
  
  		if (event.keyCode === KeyboardKeys.End) {
  			this.scrollToPercentage(1);
  			return;
  		}
  
  		const verticalScroll = Number(event.keyCode === KeyboardKeys.DownArrow) - Number(event.keyCode === KeyboardKeys.UpArrow);
  		const horizontalScroll = Number(event.keyCode === KeyboardKeys.RightArrow) - Number(event.keyCode === KeyboardKeys.LeftArrow);
  
  		const scrollChange = this.isVertical ? verticalScroll : horizontalScroll;
  
  		if (scrollChange == 0) {
  			return;
  		}
  
  		this.scrollToPercentage(this.scrollPosition + scrollChange / 100);
  	}*/
  onMouseMove(event) {
    if (this.isDraggingScroll) {
      if (this.thumbSize == 0) {
        this.setScrollBoundaries();
      }
      const scrollPercentage = this.mouseCoordinatesToScroll(event);
      this.scrollToPercentage(scrollPercentage);
    }
  }
  onMouseUp(event) {
    Audio.playSound("data-audio-scroll-thumb-up");
    window.removeEventListener("mousemove", this.mouseMoveListener);
    window.removeEventListener("mouseup", this.mouseUpListener);
    event.stopPropagation();
    this.reset();
  }
  onMouseEnter() {
    this.isMouseOver = true;
  }
  onMouseLeave() {
    this.isMouseOver = false;
  }
  setIsAttachedLayout(isAttached) {
    this.Root.classList.toggle("flex", isAttached);
    this.Root.classList.toggle("flex-row", isAttached);
    this.scrollbarTrack.classList.toggle("absolute", !isAttached);
    this.scrollbarTrack.classList.toggle("inset-y-0", !isAttached);
    this.scrollbarTrack.classList.toggle("-right-1\\.5", !isAttached);
    this.scrollbarTrack.classList.toggle("relative", isAttached);
    this.scrollAreaContainer.classList.toggle("flex-auto", isAttached);
  }
  /**
   * Scrolls to a given percentage.
   * @param {number} position - Position in percentage - from 0 to 1.
   */
  scrollToPercentage(position) {
    this.scrollPosition = utils.clamp(position, 0, isNaN(this.maxScroll) ? 0 : this.maxScroll);
    this.thumbScrollPosition = utils.clamp(position, 0, isNaN(this.maxThumbPosition) ? 0 : this.maxThumbPosition);
    const calcScrollPosition = this.scrollPosition / this.maxScroll;
    if (!isNaN(calcScrollPosition)) {
      this.scrollArea.setAttribute("current-scroll-position", calcScrollPosition.toString());
    }
    const scrollPositionInPixels = ~~(this.maxScrollOnScrollAreaInPixels * this.scrollPosition);
    this.currentScrollOnScrollAreaInPixels = scrollPositionInPixels;
    requestAnimationFrame(() => {
      const parentRect = this.scrollbarThumb.parentElement?.getBoundingClientRect();
      const offset = this.thumbScrollPosition * (parentRect?.height ?? 0);
      this.scrollbarThumb.style.transform = `translateY(${offset}px)`;
    });
    this.resolveIsScrollAtBottom();
  }
  setScrollThumbPosition() {
    if (this.maxScrollOnScrollAreaInPixels > 0 && !isNaN(this.maxThumbPosition)) {
      this.scrollPosition = this.currentScrollOnScrollAreaInPixels / this.maxScrollOnScrollAreaInPixels;
      this.thumbScrollPosition = utils.clamp(this.scrollPosition, 0, this.maxThumbPosition);
      const parentRect = this.scrollbarThumb.parentElement?.getBoundingClientRect();
      const offset = this.thumbScrollPosition * (parentRect?.height ?? 0);
      this.scrollbarThumb.style.transform = `translateY(${offset}px)`;
      this.scrollbarThumb.classList.remove("hidden");
    } else {
      this.scrollbarThumb.classList.add("hidden");
    }
    this.resolveIsScrollAtBottom();
  }
  scrollIntoView(target) {
    const areaRect = this.Root.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    if (this.scrollableContentSize === 0) {
      this.resizeScrollThumb();
    }
    if (targetRect.top < areaRect.top || targetRect.bottom > areaRect.bottom) {
      let distToMove = 0;
      if (targetRect.top < areaRect.top) {
        distToMove = targetRect.top - areaRect.top;
      }
      if (targetRect.bottom > areaRect.bottom) {
        distToMove = targetRect.bottom - areaRect.bottom;
      }
      const anchorAsPercent = distToMove / this.scrollableContentSize;
      this.scrollToPercentage(this.scrollPosition + anchorAsPercent);
      target.dispatchEvent(new ScrollIntoViewEvent());
    }
  }
  /**
   * Resets the styles and thumb delta.
   */
  reset() {
    if (this.isDraggingScroll) {
      this.scrollbarThumb.classList.remove("fxs-scrollable-thumb--active");
      this.isDraggingScroll = false;
    }
    this.thumbDelta.x = 0;
    this.thumbDelta.y = 0;
  }
  setScrollBoundaries() {
    this.thumbRect = this.scrollbarThumb.getBoundingClientRect();
    this.thumbSize = this.getActiveDimension(this.thumbRect);
    this.maxScroll = (this.scrollableContentSize - this.thumbSize) / this.scrollableContentSize;
    const scrollTrackAreaSize = this.getActiveDimension(this.scrollbarTrack.getBoundingClientRect());
    this.maxThumbPosition = (scrollTrackAreaSize - this.thumbSize) / scrollTrackAreaSize;
    this.Root.dispatchEvent(new CustomEvent("scroll-is-ready", { bubbles: true }));
  }
  setScrollData() {
    this.setScrollBoundaries();
    this.setScrollThumbPosition();
  }
  /**
   * Resizes the scrollbar thumb
   * @param shouldSetScrollPositionFromLayout
   *
   */
  resizeScrollThumb() {
    const newScrollSize = this.scrollAreaContainer.clientHeight;
    if (this.scrollableAreaSize != newScrollSize) {
      this.scrollableAreaSize = newScrollSize;
    }
    this.scrollableContentSize = this.getActiveDimension({
      width: this.scrollAreaContainer.scrollWidth,
      height: this.scrollAreaContainer.scrollHeight
    });
    const scrollTrackAreaSize = newScrollSize - Layout.pixelsToScreenPixels(FxsScrollable.DECORATION_SIZE) * 2;
    const scrollbarRatio = this.scrollableAreaSize / this.maxScrollOnScrollAreaInPixels;
    const scrollbarSize = Math.max(
      scrollTrackAreaSize * scrollbarRatio,
      Layout.pixelsToScreenPixels(FxsScrollable.MIN_SIZE_PIXELS)
    );
    const showScrollbar = scrollTrackAreaSize - scrollbarSize >= FxsScrollable.MIN_SIZE_OVERFLOW;
    if (showScrollbar != this.scrollbarPrevVisibility) {
      if (showScrollbar) {
        this.show();
      } else {
        this.hide();
      }
    }
    if (showScrollbar) {
      this.scrollbarThumb.style.heightPERCENT = scrollbarRatio * 100;
    }
    delayByFrame(() => {
      if (this.Root.isConnected) {
        this.setScrollData();
      }
    }, 3);
  }
  onTouchOrMousePan(inputEvent) {
    const x = inputEvent.detail.x;
    const y = inputEvent.detail.y;
    const status = inputEvent.detail.status;
    switch (status) {
      case InputActionStatuses.START:
        const scrollAreaRect = this.scrollArea.getBoundingClientRect();
        if (x >= scrollAreaRect.left && x <= scrollAreaRect.right && y >= scrollAreaRect.top && y <= scrollAreaRect.bottom) {
          this.touchDragY = y;
          this.dragInProgress = true;
          inputEvent.preventDefault();
          inputEvent.stopPropagation();
        }
        break;
      default:
        break;
    }
  }
  onGamepadPan(inputEvent) {
    switch (inputEvent.detail.status) {
      case InputActionStatuses.START:
        this.lastPanTimestamp = performance.now();
        this.isPanning = true;
        this.gamepadPanY = inputEvent.detail.y;
        if (this.gamepadPanAnimationId == -1) {
          this.gamepadPanAnimationId = requestAnimationFrame(this.gamepadPanAnimationCallback);
        }
        break;
      case InputActionStatuses.UPDATE:
        this.gamepadPanY = inputEvent.detail.y;
        break;
      case InputActionStatuses.FINISH:
        this.isPanning = false;
        this.gamepadPanY = 0;
        this.isStillPanningCheck = 0;
        break;
    }
    return false;
  }
  stopPanning() {
    this.isPanning = false;
  }
  /**
   * onGamepadPanUpdate updates the scroll position at every frame until the pan is finished
   *
   * This results in smoother scrolling when using a gamepad, as UPDATE input events are not sent out every frame.
   */
  onGamepadPanUpdate(timestamp) {
    if (this.isStillPanningCheck >= 10) {
      this.isPanning = this.Root == document.activeElement || this.Root.contains(document.activeElement);
      this.isStillPanningCheck = 0;
    }
    if (this.isPanning) {
      if (this.engineInputProxy == void 0 && this.navigationInputProxy == void 0) {
        this.isStillPanningCheck += 1;
      }
      this.gamepadPanAnimationId = requestAnimationFrame(this.gamepadPanAnimationCallback);
      const diff = timestamp - this.lastPanTimestamp;
      this.lastPanTimestamp = timestamp;
      this.currentScrollOnScrollAreaInPixels -= this.gamepadPanY * diff * this.panRate;
      this.setScrollThumbPosition();
    } else {
      this.isStillPanningCheck = 0;
      this.gamepadPanY = 0;
      this.gamepadPanAnimationId = -1;
    }
  }
  getIsScrollAtBottom() {
    return this.isScrollAtBottom;
  }
  resolveIsScrollAtBottom() {
    if (this.isScrollAtBottom && this.currentScrollOnScrollAreaInPixels < this.maxScrollTop) {
      this.isScrollAtBottom = false;
      this.Root.dispatchEvent(new ScrollExitBottomEvent());
    } else if (!this.isScrollAtBottom && this.currentScrollOnScrollAreaInPixels >= this.maxScrollTop) {
      this.isScrollAtBottom = true;
      this.Root.dispatchEvent(new ScrollAtBottomEvent());
    }
  }
  showScrollNavHelpElement(enabled) {
    if (enabled) {
      if (!this.navHelp) {
        this.navHelp = document.createElement("fxs-nav-help");
        this.navHelp.setAttribute("hide-if-not-allowed", "true");
        this.navHelp.classList.add("absolute", "top-1\\/2", "-left-1\\.5", "-translate-y-1\\/2");
      }
      this.scrollbarThumb.append(this.navHelp);
      this.navHelp.setAttribute("action-key", this.isHandleNavPan ? "inline-nav-move" : "inline-scroll-pan");
    } else {
      this.navHelp?.remove();
    }
  }
}
Controls.define("fxs-scrollable", {
  createInstance: FxsScrollable,
  description: "A scrollable container that shows a scrollbar",
  classNames: ["fxs-scrollable", "fxs-scrollable-container"],
  attributes: [
    {
      name: "scrollpercent"
    },
    {
      name: "handle-gamepad-pan"
    },
    {
      name: "handle-nav-pan",
      description: "If set to 'true', this will enable scrolling by the move navigation event"
    },
    {
      name: "allow-mouse-panning",
      description: "If set to 'true', this will enable scrolling by dragging with the mosue on the background"
    },
    {
      name: "attached-scrollbar",
      description: "if set to 'true', the scrollbar will be attached to the container and take up space, instead of floating a set distance away"
    },
    {
      name: "scroll-on-resize-when-bottom",
      description: "if the scroll is at bottom, we auto scroll at bottom on resize mutation observer"
    },
    {
      name: "scroll-on-child-change-when-bottom",
      description: "if the scroll is at bottom, we auto scroll at bottom on child change mutation observer"
    }
  ],
  images: [
    "fs://game/base_scrollbar-track.png",
    "fs://game/base_scrollbar-handle-focus.png",
    "fs://game/base_scrollbar-handle.png"
  ]
});

export { FxsScrollable, ScrollAtBottomEvent, ScrollExitBottomEvent, ScrollIntoViewEvent, resizeThumb };
//# sourceMappingURL=fxs-scrollable.js.map

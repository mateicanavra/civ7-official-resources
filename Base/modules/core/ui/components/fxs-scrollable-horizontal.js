import { Audio } from '../audio-base/audio-support.js';
import { resizeThumb, ScrollExitBottomEvent, ScrollAtBottomEvent } from './fxs-scrollable.js';
import { utils } from '../graph-layout/utils.js';
import { InputEngineEventName } from '../input/input-support.js';
import { Layout } from '../utilities/utilities-layout.js';
import { FocusManager } from '../../ui-next/services/focus-manager.js';

class FxsScrollableHorizontal extends Component {
  static MIN_SIZE_PIXELS = 24;
  static MIN_SIZE_OVERFLOW = 2;
  static DECORATION_SIZE = 24;
  scrollArea;
  scrollAreaContainer;
  scrollbarTrack;
  scrollbarThumb;
  scrollBarContainer;
  thumbActive;
  navHelp = null;
  isDraggingScroll = false;
  isMouseOver = false;
  isPanning = false;
  gamepadPanX = 0;
  gamepadPanAnimationId = -1;
  allowScroll = true;
  scrollbarPrevVisibility = false;
  isHandleGamepadPan = false;
  allowMousePan = false;
  lastPanTimestamp = 0;
  panRate = 0.75;
  mouseMoveListener = this.onMouseMove.bind(this);
  mouseUpListener = this.onMouseUp.bind(this);
  mouseEnterListener = this.onMouseEnter.bind(this);
  mouseLeaveListener = this.onMouseLeave.bind(this);
  engineInputListener = this.onEngineInput.bind(this);
  gamepadPanAnimationCallback = this.onGamepadPanUpdate.bind(this);
  scrollBarEngineInputListener = this.onScrollBarEngineInput.bind(this);
  resizeObserver = new ResizeObserver(this.onResize.bind(this));
  windowEngineInputListener = this.onWindowEngineInput.bind(this);
  engineInputProxy;
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
  touchDragX = 0;
  isScrollAtEnd = true;
  get maxScrollLeft() {
    return this.scrollAreaContainer.scrollWidth - this.scrollAreaContainer.clientWidth;
  }
  constructor(root) {
    super(root);
    const flexAttribute = this.Root.getAttribute("flex");
    const flexClass = flexAttribute && flexAttribute == "initial" ? "flex-initial" : "flex-auto";
    this.Root.setAttribute("resize-thumb", resizeThumb.NONE);
    this.scrollPosition = 0;
    this.thumbScrollPosition = 0;
    this.scrollBarContainer = document.createElement("div");
    this.scrollBarContainer.classList.add(
      "absolute",
      "-bottom-3",
      "inset-x-6",
      "h-4",
      "flex",
      "text-2xs",
      "justify-center",
      "pointer-events-auto"
    );
    this.scrollbarThumb = document.createElement("div");
    this.scrollbarThumb.classList.add("fxs-scrollbar__thumb--horizontal");
    this.scrollbarThumb.style.transform = "none";
    const thumbInner = document.createElement("div");
    thumbInner.classList.add("fxs-scrollbar__thumb-bg--horizontal", "absolute", "inset-0");
    this.scrollbarThumb.appendChild(thumbInner);
    const thumbHighlight = document.createElement("div");
    thumbHighlight.classList.add("fxs-scrollbar__thumb-bg-highlight--horizontal", "absolute", "inset-0");
    this.scrollbarThumb.appendChild(thumbHighlight);
    this.thumbActive = document.createElement("div");
    this.thumbActive.classList.add("fxs-scrollbar__thumb-bg-active--horizontal", "absolute", "inset-0");
    this.scrollbarThumb.appendChild(this.thumbActive);
    this.scrollbarTrack = document.createElement("div");
    this.scrollbarTrack.classList.add("fxs-scrollbar__track--horizontal", "absolute", "inset-0", "mx-6");
    this.scrollbarTrack.appendChild(this.scrollbarThumb);
    const contentClass = this.Root.getAttribute("content-class") ?? "";
    this.scrollArea = document.createElement("div");
    this.scrollArea.classList.add(
      "flex",
      "flex-row",
      "justify-start",
      "pl-6",
      "pr-9",
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
      flexClass,
      "max-w-full",
      "max-h-full",
      "overflow-x-scroll",
      "pointer-events-auto"
    );
    this.scrollAreaContainer.appendChild(this.scrollArea);
    this.scrollBarContainer.appendChild(this.scrollbarTrack);
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
      this.scrollArea.lastElementChild.classList.add("mr-6");
    }
    this.Root.append(this.scrollAreaContainer, this.scrollBarContainer);
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
  }
  onAttributeChanged(name, oldValue, newValue) {
    if (name == "scrollpercent") {
      const value = newValue ? parseFloat(newValue) : 0;
      this.scrollToPercentage(value * this.maxScroll);
    } else if (name == "handle-gamepad-pan" && oldValue != newValue) {
      this.isHandleGamepadPan = newValue == "true";
      this.showScrollNavHelpElement(this.isHandleGamepadPan);
    } else if (name == "attached-scrollbar" && oldValue != newValue) {
      this.setIsAttachedLayout(newValue == "true");
    } else if (name == "allow-mouse-panning") {
      this.allowMousePan = newValue == "true";
    }
  }
  onDetach() {
    this.resizeObserver.disconnect();
    super.onDetach();
  }
  /**
   * Sets a proxy for engine input events so they can be listened to without this element being in the focus tree.
   * @param proxy The element to listen to engine input events on
   */
  setEngineInputProxy(proxy) {
    if (this.engineInputProxy) {
      this.engineInputProxy.removeEventListener("engine-input", this.engineInputListener);
    }
    this.engineInputProxy = proxy;
    this.engineInputProxy.addEventListener("engine-input", this.engineInputListener);
  }
  get currentScrollOnScrollAreaInPixels() {
    return this.scrollAreaContainer.scrollLeft;
  }
  set currentScrollOnScrollAreaInPixels(value) {
    this.scrollAreaContainer.scrollLeft = value;
  }
  get maxScrollOnScrollAreaInPixels() {
    return this.scrollArea.scrollWidth;
  }
  getActiveDimension(rect) {
    return rect.width;
  }
  onResize(_entries, _observer) {
    this.isScrollAtEnd = false;
    delayByFrame(this.resizeScrollThumb.bind(this), 2);
  }
  /**
   * Converts the mouse coordinates to a scroll percentage.
   * @param event
   */
  mouseCoordinatesToScroll(event) {
    const mouseAreaRect = this.scrollbarTrack.getBoundingClientRect();
    return (event.clientX - mouseAreaRect.x + this.thumbDelta.x) / mouseAreaRect.width;
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
          const scrollAreaRect = this.scrollArea.getBoundingClientRect();
          const x = inputEvent.detail.x;
          const y = inputEvent.detail.y;
          if (y < scrollAreaRect.top || y > scrollAreaRect.bottom) {
            this.dragInProgress = false;
          }
          if (this.thumbSize == 0) {
            this.setScrollBoundaries();
          }
          if (this.isDraggingScroll) {
            const mouseAreaRect = this.scrollbarTrack.getBoundingClientRect();
            const scrollPercentage = (x - mouseAreaRect.x + this.thumbDelta.x) / mouseAreaRect.width;
            this.scrollToPercentage(scrollPercentage);
            handled = true;
          } else if (this.dragInProgress) {
            this.currentScrollOnScrollAreaInPixels += this.touchDragX - x;
            this.setScrollThumbPosition();
            this.resolveIsScrollAtEnd();
            this.touchDragX = x;
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
  onEngineInput(inputEvent) {
    if (inputEvent.detail.name == "scroll-pan" && this.isHandleGamepadPan) {
      if (this.allowScroll) {
        this.onGamepadPan(inputEvent);
      }
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
      return;
    }
    if (inputEvent.target == this.engineInputProxy) {
      return;
    }
    if (inputEvent.detail.name == "touch-pan" || this.allowMousePan && inputEvent.detail.name == "mousebutton-left") {
      this.onTouchOrMousePan(inputEvent);
      return;
    }
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (this.isMouseOver) {
      if (inputEvent.detail.name == "mousewheel-up" || inputEvent.detail.name == "mousewheel-down") {
        if (this.allowScroll) {
          const newScrollPos = (this.currentScrollOnScrollAreaInPixels - inputEvent.detail.x) / this.maxScrollOnScrollAreaInPixels;
          this.scrollToPercentage(newScrollPos);
          inputEvent.stopPropagation();
        }
        inputEvent.preventDefault();
      }
      if (inputEvent.detail.name == "mousewheel-left" || inputEvent.detail.name == "mousewheel-right") {
        if (this.allowScroll) {
          this.setScrollThumbPosition();
          inputEvent.stopPropagation();
        }
        inputEvent.preventDefault();
      }
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
    this.scrollBarContainer.classList.remove("hidden");
  }
  /**
   * Hides the scrollbar
   */
  hide() {
    this.allowScroll = false;
    this.scrollBarContainer.classList.add("hidden");
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
    if (isAttached) {
      this.Root.classList.add("flex", "flex-row");
      this.scrollbarTrack.classList.replace("absolute", "relative");
      this.scrollbarTrack.classList.add("flex-auto");
      this.scrollBarContainer.classList.add("relative", "bottom-0", "inset-x-auto");
      this.scrollAreaContainer.classList.add("flex-auto");
    } else {
      this.Root.classList.remove("flex", "flex-row");
      this.scrollbarTrack.classList.replace("relative", "absolute");
      this.scrollbarTrack.classList.remove("flex-auto");
      this.scrollBarContainer.classList.remove("relative", "bottom-0", "inset-x-auto");
      this.scrollAreaContainer.classList.remove("flex-auto");
    }
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
      const offset = this.thumbScrollPosition * (parentRect?.width ?? 0);
      this.scrollbarThumb.style.transform = `translateX(${offset}px)`;
    });
    this.resolveIsScrollAtEnd();
  }
  setScrollThumbPosition() {
    if (this.maxScrollOnScrollAreaInPixels > 0 && !isNaN(this.maxThumbPosition)) {
      this.scrollPosition = this.currentScrollOnScrollAreaInPixels / this.maxScrollOnScrollAreaInPixels;
      this.thumbScrollPosition = utils.clamp(
        this.scrollPosition,
        0,
        isNaN(this.maxThumbPosition) ? 0 : this.maxThumbPosition
      );
      const parentRect = this.scrollbarThumb.parentElement?.getBoundingClientRect();
      const offset = this.thumbScrollPosition * (parentRect?.width ?? 0);
      this.scrollbarThumb.style.transform = `translateX(${offset}px)`;
      this.scrollbarThumb.classList.remove("hidden");
    } else {
      this.scrollbarThumb.classList.add("hidden");
    }
    this.resolveIsScrollAtEnd();
  }
  scrollIntoView(target) {
    const areaRect = this.Root.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    if (this.scrollableContentSize === 0) {
      this.resizeScrollThumb();
    }
    if (targetRect.left < areaRect.left || targetRect.right > areaRect.right) {
      let distToMove = 0;
      if (targetRect.left < areaRect.left) {
        distToMove = targetRect.left - areaRect.left;
      }
      if (targetRect.right > areaRect.right) {
        distToMove = targetRect.right - areaRect.right;
      }
      const anchorAsPercent = distToMove / this.scrollableContentSize;
      this.scrollToPercentage(this.scrollPosition + anchorAsPercent);
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
   */
  resizeScrollThumb() {
    const newScrollSize = this.scrollAreaContainer.clientWidth;
    if (this.scrollableAreaSize != newScrollSize) {
      this.scrollableAreaSize = newScrollSize;
    }
    this.scrollableContentSize = this.getActiveDimension({
      width: this.scrollAreaContainer.scrollWidth,
      height: this.scrollAreaContainer.scrollHeight
    });
    const scrollTrackAreaSize = newScrollSize - Layout.pixelsToScreenPixels(FxsScrollableHorizontal.DECORATION_SIZE) * 2;
    const scrollbarRatio = this.scrollableAreaSize / this.maxScrollOnScrollAreaInPixels;
    const scrollbarSize = Math.max(scrollTrackAreaSize * scrollbarRatio, FxsScrollableHorizontal.MIN_SIZE_PIXELS);
    const showScrollbar = scrollTrackAreaSize - scrollbarSize >= FxsScrollableHorizontal.MIN_SIZE_OVERFLOW;
    if (showScrollbar != this.scrollbarPrevVisibility) {
      if (showScrollbar) {
        this.show();
      } else {
        this.hide();
      }
    }
    if (showScrollbar) {
      this.scrollbarThumb.style.widthPERCENT = scrollbarRatio * 100;
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
          this.touchDragX = x;
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
        this.gamepadPanX = inputEvent.detail.x;
        if (this.gamepadPanAnimationId == -1) {
          this.gamepadPanAnimationId = requestAnimationFrame(this.gamepadPanAnimationCallback);
        }
        break;
      case InputActionStatuses.UPDATE:
        this.gamepadPanX = inputEvent.detail.x;
        break;
      case InputActionStatuses.FINISH:
        this.isPanning = false;
        this.gamepadPanX = 0;
        break;
    }
    return false;
  }
  /**
   * onGamepadPanUpdate updates the scroll position at every frame until the pan is finished
   *
   * This results in smoother scrolling when using a gamepad, as UPDATE input events are not sent out every frame.
   */
  onGamepadPanUpdate(timestamp) {
    const diff = timestamp - this.lastPanTimestamp;
    this.lastPanTimestamp = timestamp;
    this.currentScrollOnScrollAreaInPixels += this.gamepadPanX * diff * this.panRate;
    this.setScrollThumbPosition();
    if (this.isPanning) {
      this.gamepadPanAnimationId = requestAnimationFrame(this.gamepadPanAnimationCallback);
    } else {
      this.gamepadPanAnimationId = -1;
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
  getIsScrollAtEnd() {
    return this.isScrollAtEnd;
  }
  stopPanning() {
    this.isPanning = false;
  }
  resolveIsScrollAtEnd() {
    if (this.isScrollAtEnd && (this.currentScrollOnScrollAreaInPixels < this.maxScrollLeft || this.scrollArea.lastChild != FocusManager.get().currentFocus())) {
      this.isScrollAtEnd = false;
      this.Root.dispatchEvent(new ScrollExitBottomEvent());
    } else if (!this.isScrollAtEnd && (this.currentScrollOnScrollAreaInPixels >= this.maxScrollLeft || this.scrollArea.lastChild == FocusManager.get().currentFocus())) {
      this.isScrollAtEnd = true;
      this.Root.dispatchEvent(new ScrollAtBottomEvent());
    }
  }
  showScrollNavHelpElement(enabled) {
    if (enabled) {
      if (!this.navHelp) {
        this.navHelp = document.createElement("fxs-nav-help");
        this.navHelp.setAttribute("hide-if-not-allowed", "true");
        this.navHelp.classList.add("absolute", "left-1\\/2", "-top-1\\.5", "-translate-x-1\\/2");
      }
      this.scrollbarThumb.append(this.navHelp);
      this.navHelp.setAttribute("action-key", "inline-scroll-pan");
    } else {
      this.navHelp?.remove();
    }
  }
}
Controls.define("fxs-scrollable-horizontal", {
  createInstance: FxsScrollableHorizontal,
  description: "A scrollable container that shows a scrollbar",
  classNames: ["fxs-scrollable", "relative", "pointer-events-auto"],
  attributes: [
    {
      name: "scrollpercent"
    },
    {
      name: "handle-gamepad-pan"
    },
    {
      name: "allow-mouse-panning",
      description: "If set to 'true', this will enable scrolling by dragging with the mosue on the background"
    },
    {
      name: "attached-scrollbar",
      description: "if set to 'true', the scrollbar will be attached to the container and take up space, instead of floating a set distance away"
    }
  ],
  images: [
    "fs://game/base_scrollbar-track_h.png",
    "fs://game/base_scrollbar-handle-focus_h.png",
    "fs://game/base_scrollbar-handle_h.png"
  ]
});

export { FxsScrollableHorizontal };
//# sourceMappingURL=fxs-scrollable-horizontal.js.map

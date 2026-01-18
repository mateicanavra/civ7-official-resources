import { t as template, h as createMemo, T as children, c as createSignal, y as useContext, U as EngineInputProxyContext, a as createEffect, l as on, o as onMount, d as onCleanup, u as use, k as spread, m as mergeProps, V as addEventListener, i as insert, e as createComponent, S as Show, f as createRenderEffect, C as ComponentRegistry } from './panel.chunk.js';
import { b as InputEngineEventName } from '../../ui/input/input-support.chunk.js';
import { N as NavHelp } from './l10n.chunk.js';

var _tmpl$ = /* @__PURE__ */ template(`<div><div class="flex flex-col flex-auto overflow-auto w-full"><div></div></div><div class="scroll-area_track mx-2 w-6 relative"><div class="scroll-area_thumb scroll-area_thumb-bg relative top-0 h-10 w-6"><div class="scroll-area_thumb-highlight absolute inset-0"></div><div class="scroll-area_thumb-active absolute inset-0"></div></div></div></div>`);
function getPercentageOffset(position, target) {
  const trackArea = target.getBoundingClientRect();
  return (position - trackArea.y) / trackArea.height * 100;
}
function clampToRange(percentage) {
  return Math.max(0, Math.min(100, percentage));
}
const ScrollAreaComponent = (props) => {
  let scrollWrapper;
  let content;
  let track;
  let resizeObserver = null;
  let lastPanTimestamp = 0;
  let isPanning = false;
  let panY = 0;
  let isStillPanningCheck = 0;
  let gamepadPanAnimationId = -1;
  const minThumbHeight = createMemo(() => props.minThumbHeight ?? 20);
  const scrollEndWithEpsilon = 99.99999;
  const trackedChildren = children(() => props.children);
  const [isDragging, setIsDragging] = createSignal(false);
  const [thumbHeight, setThumbHeight] = createSignal(minThumbHeight());
  const [thumbDelta, setThumbDelta] = createSignal(0);
  const [scrollPosition, setScrollPosition] = createSignal(props.initialScroll ?? 0);
  const isTrackVisible = createMemo(() => thumbHeight() <= scrollEndWithEpsilon);
  const panRate = createMemo(() => props.panRate ?? 0.75);
  const allowGamepadPan = createMemo(() => props.allowGamepadPan ?? true);
  const proxy = useContext(EngineInputProxyContext);
  createEffect(() => {
    const position = scrollPosition();
    const isBottom = position >= scrollEndWithEpsilon;
    const newScrollTop = Math.floor(position / 100 * Math.max(1, scrollWrapper.scrollHeight - scrollWrapper.clientHeight));
    if (scrollWrapper.scrollTop != newScrollTop) {
      scrollWrapper.scrollTop = newScrollTop;
    }
    props.setIsAtBottom?.(isBottom);
  });
  createEffect(() => props.setIsTrackVisible?.(isTrackVisible()));
  const thumbScrollPosition = createMemo(() => {
    return scrollPosition() / thumbHeight() * (100 - thumbHeight());
  });
  const scaleByThumbSize = (percentage, thumbOffsetPercent) => {
    return (100 * percentage - thumbHeight() * thumbOffsetPercent) / (100 - thumbHeight());
  };
  const scrollToPercent = (position) => {
    const clampedPosition = clampToRange(position);
    if (clampedPosition != scrollPosition()) {
    }
    setScrollPosition(clampedPosition);
    props.setScroll?.(clampedPosition);
  };
  const scrollToTrackPosition = (positionInPixels, thumbOffsetPercent = 50) => {
    const positionPercent = getPercentageOffset(positionInPixels, track);
    scrollToPercent(scaleByThumbSize(positionPercent, thumbOffsetPercent));
  };
  const scrollByPercent = (percentage) => {
    scrollToPercent(scrollPosition() + percentage);
  };
  const scrollByPixels = (pixels) => {
    scrollByPercent(pixels / scrollWrapper.scrollHeight * 100);
  };
  const scrollToElement = (element) => {
    if (!element) {
      return;
    }
    const areaRect = scrollWrapper.getBoundingClientRect();
    const targetRect = element.getBoundingClientRect();
    let distToMove = 0;
    if (targetRect.top < areaRect.top) {
      distToMove = targetRect.top - areaRect.top;
    } else if (targetRect.bottom > areaRect.bottom) {
      distToMove = targetRect.bottom - areaRect.bottom;
    }
    if (distToMove != 0) {
      scrollByPixels(distToMove);
    }
  };
  const updateScrollThumbPosition = () => {
    const positionPercentage = scrollWrapper.scrollTop / Math.max(1, scrollWrapper.scrollHeight - scrollWrapper.clientHeight) * 100;
    scrollToPercent(positionPercentage);
  };
  const dragStart = () => {
    if (!isDragging()) {
      setIsDragging(true);
    }
  };
  const dragEnd = () => {
    if (isDragging()) {
      setIsDragging(false);
    }
  };
  const handleTrackClick = (event) => {
    scrollToTrackPosition(event.clientY);
    event.stopPropagation();
  };
  const handleThumbMouseMove = (event) => {
    scrollToTrackPosition(event.clientY, thumbDelta());
    event.stopPropagation();
  };
  const handleThumbMouseUp = (event) => {
    dragEnd();
    window.removeEventListener("mousemove", handleThumbMouseMove);
    window.removeEventListener("mouseup", handleThumbMouseUp, true);
    event.stopPropagation();
  };
  const handleThumbMouseDown = (event) => {
    dragStart();
    setThumbDelta(getPercentageOffset(event.clientY, event.target));
    window.addEventListener("mousemove", handleThumbMouseMove);
    window.addEventListener("mouseup", handleThumbMouseUp, true);
    event.stopPropagation();
  };
  const handleThumbEngineInput = (inputEvent) => {
    let handled = false;
    if (inputEvent.detail.name == "touch-pan" && inputEvent.detail.status == InputActionStatuses.START) {
      dragStart();
      handled = true;
    }
    if (handled) {
      inputEvent.preventDefault();
      inputEvent.stopPropagation();
    }
  };
  const handleFocus = (event) => {
    scrollToElement(event.target);
  };
  const handleThumbResize = () => {
    waitForLayout(() => {
      const clientHeight = scrollWrapper.clientHeight;
      const calcThumbHeight = Math.max(1, clientHeight) / Math.max(1, scrollWrapper.scrollHeight) * 100;
      setThumbHeight(Math.max(calcThumbHeight, minThumbHeight()));
      updateScrollThumbPosition();
      props.setClientHeight?.(clientHeight);
      props.setClientWidth?.(content.clientWidth);
    });
  };
  const handleWindowEngineInput = (inputEvent) => {
    if (inputEvent.detail.name == "touch-complete") {
      dragEnd();
      inputEvent.preventDefault();
      inputEvent.stopPropagation();
    }
  };
  createEffect(on(() => trackedChildren, () => handleThumbResize()));
  const handleTouchOrMousePan = (inputEvent) => {
    const y = inputEvent.detail.y;
    let handled = false;
    switch (inputEvent.detail.status) {
      case InputActionStatuses.START:
        panY = y;
        handled = true;
        break;
      case InputActionStatuses.DRAG:
        if (isDragging()) {
          scrollToTrackPosition(y, thumbDelta());
        } else {
          scrollByPixels(panY - y);
          panY = y;
        }
        handled = true;
        break;
    }
    if (handled) {
      inputEvent.preventDefault();
      inputEvent.stopPropagation();
    }
  };
  const handleGamepadPanUpdate = (timestamp) => {
    if (isStillPanningCheck >= 10) {
      isPanning = props.useProxy || (scrollWrapper.contains(document.activeElement) ?? false);
      isStillPanningCheck = 0;
    }
    if (isPanning) {
      isStillPanningCheck += 1;
      gamepadPanAnimationId = requestAnimationFrame(handleGamepadPanUpdate);
      const diff = timestamp - lastPanTimestamp;
      lastPanTimestamp = timestamp;
      scrollByPixels(panY * diff * panRate());
    } else {
      isStillPanningCheck = 0;
      panY = 0;
      gamepadPanAnimationId = -1;
    }
  };
  const handleGamepadPan = (inputEvent) => {
    switch (inputEvent.detail.status) {
      case InputActionStatuses.START:
        lastPanTimestamp = performance.now();
        isPanning = true;
        panY = -inputEvent.detail.y;
        if (gamepadPanAnimationId == -1) {
          gamepadPanAnimationId = requestAnimationFrame(handleGamepadPanUpdate);
        }
        break;
      case InputActionStatuses.UPDATE:
        panY = -inputEvent.detail.y;
        break;
      case InputActionStatuses.FINISH:
        isPanning = false;
        panY = 0;
        isStillPanningCheck = 0;
        break;
    }
  };
  const handleEngineInput = (inputEvent) => {
    if (inputEvent.detail.name == "scroll-pan" && allowGamepadPan()) {
      handleGamepadPan(inputEvent);
    }
    if (inputEvent.detail.name == "touch-pan" && inputEvent.currentTarget == props.ref || props.allowMousePan && inputEvent.detail.name == "mousebutton-left") {
      handleTouchOrMousePan(inputEvent);
    }
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
  };
  createEffect(() => {
    if (props.useProxy) {
      proxy?.registerHandler(handleEngineInput);
    } else {
      proxy?.unregisterHandler(handleEngineInput);
    }
  });
  onMount(() => {
    resizeObserver = new ResizeObserver(handleThumbResize);
    resizeObserver.observe(content);
    scrollWrapper.addEventListener("focus", handleFocus, true);
    window.addEventListener(InputEngineEventName, handleWindowEngineInput);
    handleThumbResize();
  });
  onCleanup(() => {
    if (resizeObserver) {
      resizeObserver.unobserve(content);
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    scrollWrapper.removeEventListener("focus", handleFocus, true);
    window.removeEventListener(InputEngineEventName, handleWindowEngineInput);
  });
  return (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$2.nextSibling, _el$5 = _el$4.firstChild, _el$6 = _el$5.firstChild, _el$7 = _el$6.nextSibling;
    var _ref$ = props.ref;
    typeof _ref$ === "function" ? use(_ref$, _el$) : props.ref = _el$;
    spread(_el$, mergeProps(props, {
      get ["class"]() {
        return `flex flex-row overflow-hidden ${props.class ?? ""}`;
      },
      "on:engine-input": handleEngineInput,
      "data-name": "ScrollArea"
    }), false, true);
    addEventListener(_el$2, "scroll", updateScrollThumbPosition);
    use((ref) => scrollWrapper = ref, _el$2);
    use((ref) => content = ref, _el$3);
    insert(_el$3, trackedChildren);
    addEventListener(_el$4, "mousedown", handleTrackClick);
    use((ref) => track = ref, _el$4);
    addEventListener(_el$5, "engine-input", handleThumbEngineInput);
    addEventListener(_el$5, "mousedown", handleThumbMouseDown);
    _el$5.style.setProperty("top", "0px");
    insert(_el$5, createComponent(Show, {
      get when() {
        return allowGamepadPan();
      },
      get children() {
        return createComponent(NavHelp, {
          actionName: "inline-scroll-pan",
          "class": "absolute top-1\\/2 left-0 -translate-y-1\\/2"
        });
      }
    }), null);
    createRenderEffect((_p$) => {
      var _v$ = !!(!isTrackVisible() && !props.reserveSpace), _v$2 = !!(!isTrackVisible() && props.reserveSpace), _v$3 = `translateY(${thumbScrollPosition()}%)`, _v$4 = `${thumbHeight()}%`;
      _v$ !== _p$.e && _el$4.classList.toggle("hidden", _p$.e = _v$);
      _v$2 !== _p$.t && _el$4.classList.toggle("opacity-0", _p$.t = _v$2);
      _v$3 !== _p$.a && ((_p$.a = _v$3) != null ? _el$5.style.setProperty("transform", _v$3) : _el$5.style.removeProperty("transform"));
      _v$4 !== _p$.o && ((_p$.o = _v$4) != null ? _el$5.style.setProperty("height", _v$4) : _el$5.style.removeProperty("height"));
      return _p$;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0
    });
    return _el$;
  })();
};
const ScrollArea = ComponentRegistry.register({
  name: "ScrollArea",
  createInstance: ScrollAreaComponent,
  images: ["blp:base_scrollbar-track.png", "blp:base_scrollbar-handle.png", "blp:base_scrollbar-handle-focus.png", "blp:base_scrollbar-handle-focus.png"]
});

export { ScrollArea as S };
//# sourceMappingURL=scroll-area.chunk.js.map

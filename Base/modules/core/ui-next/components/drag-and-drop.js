import { template, insert, Portal, style, use, className, classList, delegateEvents } from '../../vendor/solid-js/web/dist/web.js';
import { createContext, useContext, createSignal, createMemo, onCleanup, untrack, createEffect, createComponent, createRenderEffect } from '../../vendor/solid-js/dist/solid.js';
import { ActiveInputDevice } from '../services/input.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="drag-and-drop flex-auto"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div></div>`);
var debugLevels = /* @__PURE__ */ ((debugLevels2) => {
  debugLevels2[debugLevels2["Log"] = 0] = "Log";
  debugLevels2[debugLevels2["Verbose"] = 1] = "Verbose";
  debugLevels2[debugLevels2["VeryVerbose"] = 2] = "VeryVerbose";
  return debugLevels2;
})(debugLevels || {});
const DEBUG_LEVEL = 0 /* Log */;
var DragEndStatus = /* @__PURE__ */ ((DragEndStatus2) => {
  DragEndStatus2[DragEndStatus2["Released"] = 0] = "Released";
  DragEndStatus2[DragEndStatus2["Cancelled"] = 1] = "Cancelled";
  DragEndStatus2[DragEndStatus2["AcceptedByDropzone"] = 2] = "AcceptedByDropzone";
  DragEndStatus2[DragEndStatus2["RejectedByDropzone"] = 3] = "RejectedByDropzone";
  return DragEndStatus2;
})(DragEndStatus || {});
const DragAndDropGlobalContext = createContext({
  disabled: false,
  overlayParent: document.body
});
const useDragAndDropGlobalContext = () => useContext(DragAndDropGlobalContext);
const DragAndDropContext = createContext({
  isDisabled: () => false,
  isDragging: () => null,
  isDropping: () => null,
  overDropzone: () => null
});
const useDragAndDropContext = () => useContext(DragAndDropContext);
const DoNothing = () => {
};
const DragAndDropInternalContext = createContext({
  captureDraggable: DoNothing,
  releaseDraggable: DoNothing,
  cancelDrag: DoNothing,
  enterDropzone: () => false,
  leaveDropzone: () => false,
  portalRoot: null,
  dropPredicate: () => null
});
const useDragAndDropInternalContext = () => useContext(DragAndDropInternalContext);
function setElementPositionViaTopLeft(el, x, y) {
  el.style.topPX = y;
  el.style.leftPX = x;
}
function setElementPositionViaTransform(el, x, y) {
  el.style.transform = `translate(${x}px, ${y}px)`;
}
const defaultSetElementPosition = setElementPositionViaTransform;
const DragAndDrop = (props) => {
  const [isCaptured, setIsCapture] = createSignal(null);
  const [isDragging, setIsDragging] = createSignal(null);
  const [isDropping, setIsDropping] = createSignal(null);
  const [draggableCanDropPredicate, setDraggableCanDropPredicate] = createSignal(null);
  const [dropzones, setDropzones] = createSignal([]);
  const dropzone = createMemo(() => {
    const items = dropzones();
    if (items.length > 0) {
      return items[items.length - 1];
    } else {
      return null;
    }
  });
  const activeCanDropPredicate = createMemo(() => {
    const draggable = isDragging();
    if (draggable) {
      const draggablePredicate = draggableCanDropPredicate();
      if (props.canDrop && draggablePredicate) {
        const topLevel = props.canDrop;
        const draggableLevel = draggablePredicate;
        const merged = (draggable2, dropzone2) => {
          const topLevelAccessor = topLevel(draggable2, dropzone2);
          const draggableAccessor = draggableLevel(draggable2, dropzone2);
          const memo = createMemo(() => {
            const top = topLevelAccessor();
            const drag = draggableAccessor();
            return top && drag;
          });
          return memo;
        };
        return merged;
      } else if (props.canDrop) {
        return props.canDrop;
      } else {
        return draggablePredicate;
      }
    } else {
      return null;
    }
  });
  const globalContext = useDragAndDropGlobalContext();
  const overlayRoot = document.createElement("div");
  overlayRoot.style.position = "absolute";
  overlayRoot.style.pointerEvents = "none";
  const overlayContent = document.createElement("div");
  overlayContent.style.transform = "translate(-50%, -50%)";
  overlayRoot.appendChild(overlayContent);
  let capturedStartCallback = null;
  let capturedEndCallback = null;
  let currentDropzoneElement;
  window.addEventListener("engine-input", onEngineInputCapture, {
    capture: true
  });
  onCleanup(() => {
    window.removeEventListener("engine-input", onEngineInputCapture, {
      capture: true
    });
  });
  function onEngineInputCapture(event) {
    let handled = false;
    debugTrace(2 /* VeryVerbose */, "onInputAction:", event.detail);
    if (event.detail.name === "touch-pan" && event.detail.status === InputActionStatuses.DRAG) {
      onMouseOrTouchMove(event.detail.x, event.detail.y);
      if (!isDragging()) {
        return;
      }
      debugTrace(2 /* VeryVerbose */, "onInputAction:", "touch-pan", InputActionStatuses.UPDATE, `[${event.detail.x}, ${event.detail.y}]`);
      const elementsAtPoint = document.elementsFromPoint(event.detail.x, event.detail.y);
      const el = elementsAtPoint.find((el2) => el2.classList.contains("dropzone")) ?? null;
      if (el !== currentDropzoneElement) {
        if (currentDropzoneElement && currentDropzoneElement.contains(el) === false) {
          debugTrace(0 /* Log */, "onInputAction: leaving dropzone", currentDropzoneElement, `[${event.detail.x}, ${event.detail.y}]`);
          currentDropzoneElement.dispatchEvent(new MouseEvent("mouseleave", {
            bubbles: true
          }));
        }
        currentDropzoneElement = el;
        if (currentDropzoneElement) {
          debugTrace(0 /* Log */, "onInputAction: entering dropzone", currentDropzoneElement, `[${event.detail.x}, ${event.detail.y}]`);
          currentDropzoneElement.dispatchEvent(new MouseEvent("mouseenter", {
            bubbles: true
          }));
        }
      }
      handled = true;
    }
    if (event.detail.name === "touch-complete" && event.detail.status === InputActionStatuses.FINISH) {
      debugTrace(1 /* Verbose */, "onInputAction:", "touch-complete", InputActionStatuses.FINISH, `[${event.detail.x}, ${event.detail.y}]`);
      releaseDraggable(event.detail.x, event.detail.y);
      handled = true;
    }
    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
  const isDisabled = createMemo(() => {
    const activeInputDevice = ActiveInputDevice();
    let inputSupportsDND = false;
    switch (activeInputDevice) {
      case InputDeviceType.Mouse:
      case InputDeviceType.Touch:
      case InputDeviceType.Hybrid:
        inputSupportsDND = true;
        break;
    }
    return inputSupportsDND == false || globalContext.disabled === true || props.disabled === true;
  });
  const overlayParent = createMemo(() => {
    return props.overlayParent ?? globalContext.overlayParent;
  });
  const initialPosition = {
    x: 0,
    y: 0
  };
  const shouldDebugTrace = untrack(() => props.debugTrace);
  function debugTrace(debugLevel, ...args) {
    if (!shouldDebugTrace || debugLevel > DEBUG_LEVEL) {
      return;
    }
    console.debug(`[${Date.now()}] DnD: DragAndDrop`, ...args);
  }
  function resetDrag() {
    debugTrace(1 /* Verbose */, "resetDrag");
    setIsCapture(null);
    setIsDropping(null);
    setIsDragging(null);
    setDropzones([]);
    overlayRoot.style.display = "none";
    overlayRoot.remove();
    currentDropzoneElement = null;
  }
  function startDrag(x, y) {
    debugTrace(1 /* Verbose */, "startDrag", `[${x}, ${y}]`);
    if (isDragging()) {
      throw new Error("Already in a dragging operation!");
    }
    const draggable = isCaptured();
    if (draggable == null) {
      throw new Error("Cannot start a drag operation when no draggable has been captured.");
    }
    debugTrace(1 /* Verbose */, "Starting drag operation.", draggable);
    setIsDragging(draggable);
    if (props.onDragStart) {
      props.onDragStart(draggable, initialPosition);
    }
    if (capturedStartCallback) {
      capturedStartCallback(draggable, initialPosition);
    }
    const setPosition = props.setElementPosition ?? defaultSetElementPosition;
    setPosition(overlayRoot, x, y);
    overlayRoot.style.display = "";
    overlayParent().appendChild(overlayRoot);
  }
  function captureDraggable(draggable, x, y, startCallback, endCallback, canDropPredicate) {
    debugTrace(1 /* Verbose */, "captureDraggable", draggable, `[${x}, ${y}]`);
    if (isDragging()) {
      throw new Error("Already in a dragging operation!");
    }
    if (props.disabled) {
      return;
    }
    setIsCapture(draggable);
    capturedStartCallback = startCallback;
    capturedEndCallback = endCallback;
    if (canDropPredicate) {
      setDraggableCanDropPredicate(() => canDropPredicate);
    } else {
      setDraggableCanDropPredicate(null);
    }
    const setPosition = props.setElementPosition ?? defaultSetElementPosition;
    setPosition(overlayRoot, x, y);
    initialPosition.x = x;
    initialPosition.y = y;
  }
  function releaseDraggable(x, y) {
    debugTrace(1 /* Verbose */, "releaseDraggable", `[${x}, ${y}]`);
    const draggable = isDragging();
    const position = {
      x,
      y
    };
    if (draggable == null) {
      resetDrag();
      return;
    }
    const dz = dropzone();
    let status = 0 /* Released */;
    if (dz) {
      if (dz.canDrop()) {
        status = 2 /* AcceptedByDropzone */;
      } else {
        status = 3 /* RejectedByDropzone */;
      }
    }
    if (props.debugTrace) {
      let statusText = "";
      switch (status) {
        case 0 /* Released */:
          statusText = "Released";
          break;
        /*case DragEndStatus.Cancelled:
        	statusText = "Cancelled";
        	break;*/
        case 2 /* AcceptedByDropzone */:
          statusText = "Accepted";
          break;
        case 3 /* RejectedByDropzone */:
          statusText = "Rejected";
          break;
      }
      debugTrace(0 /* Log */, "Ending Drag Operation.", statusText, draggable, dz?.dropzone);
    }
    if (dz && dz.canDrop()) {
      setIsDropping({
        draggable,
        dropzone: dz.dropzone,
        position
      });
      if (props.onDragDrop) {
        props.onDragDrop(draggable, dz.dropzone, position);
      }
    }
    if (capturedEndCallback) {
      capturedEndCallback(draggable, status, dz?.dropzone, position);
      capturedEndCallback = null;
    }
    if (props.onDragEnd) {
      props.onDragEnd(draggable, status, dz?.dropzone, position);
    }
    resetDrag();
  }
  function cancelDrag() {
    debugTrace(1 /* Verbose */, "cancelDrag");
    const draggable = isDragging();
    if (draggable) {
      if (capturedEndCallback) {
        capturedEndCallback(draggable, 1 /* Cancelled */);
        capturedEndCallback = null;
      }
    }
    resetDrag();
  }
  function enterDropzone(dropzone2, el, canDrop, _x, _y) {
    const original = dropzones();
    if (original.find((z) => z.dropzone.id === dropzone2.id)) {
      return false;
    }
    const zones = original.filter((z) => {
      const zoneIsChildOfElement = el.contains(z.ref);
      const elementIsChildOfZone = z.ref.contains(el);
      return !zoneIsChildOfElement && elementIsChildOfZone;
    });
    zones.push({
      dropzone: dropzone2,
      ref: el,
      canDrop
    });
    if (props.debugTrace) {
      const t = zones.length > 1 ? "nested dropzone" : "dropzone";
      debugTrace(0 /* Log */, `enterDropzone Entering ${t}.`, dropzone2, canDrop());
    }
    setDropzones(zones);
    return true;
  }
  function leaveDropzone(dz, _el, _x, _y) {
    const current_dz = dropzone();
    if (current_dz && current_dz.dropzone.id != dz.id) {
      console.warn("Leaving a drop zone that is not the active drop zone??");
    }
    const original = dropzones();
    const zones = original.filter((z) => z.dropzone.id != dz.id);
    if (original.length != zones.length) {
      if (props.debugTrace) {
        debugTrace(0 /* Log */, "leaveDropzone: Leaving Dropzone.", dz);
        if (zones.length > 0) {
          const newZone = zones[zones.length - 1];
          debugTrace(0 /* Log */, "leaveDropzone: Still within dropzone.", newZone.dropzone, newZone.canDrop());
        }
      }
      setDropzones(zones);
    } else {
      console.warn("Leaving a dropzone that we weren't inside?");
      return false;
    }
    return true;
  }
  function onMouseOrTouchMove(x, y) {
    debugTrace(2 /* VeryVerbose */, "onMouseOrTouchMove:", `[${x}, ${y}]`, "isDragging:", isDragging(), "isCaptured:", isCaptured());
    if (isDragging() == null && isCaptured()) {
      startDrag(x, y);
    }
    let newX = x;
    let newY = y;
    if (props.restrict === "x") {
      newY = initialPosition.y;
    } else if (props.restrict === "y") {
      newX = initialPosition.x;
    } else if (typeof props.restrict == "function") {
      const result = props.restrict(newX, newY);
      newX = result.x;
      newY = result.y;
    } else if (props.restrict) {
      const bounds = props.restrict;
      newX = Math.max(bounds.left, Math.min(newX, bounds.right));
      newY = Math.max(bounds.top, Math.min(newY, bounds.bottom));
    }
    const setPosition = props.setElementPosition ?? defaultSetElementPosition;
    setPosition(overlayRoot, x, y);
  }
  function handleMouseMove(event) {
    debugTrace(2 /* VeryVerbose */, "handleMouseMove");
    onMouseOrTouchMove(event.clientX, event.clientY);
  }
  function handleMouseUp(event) {
    debugTrace(1 /* Verbose */, "handleMouseUp");
    releaseDraggable(event.clientX, event.clientY);
  }
  createEffect(() => {
    if (isDisabled() && isDragging()) {
      cancelDrag();
    }
  });
  let listeningForMouseEvents = false;
  createEffect(() => {
    if (ActiveInputDevice() !== InputDeviceType.Mouse) {
      return;
    }
    if (isCaptured()) {
      debugTrace(1 /* Verbose */, "DragAndDrop: isCaptured changed to true. Adding mouse listeners for move and up");
      listeningForMouseEvents = true;
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      debugTrace(1 /* Verbose */, "DragAndDrop: isCaptured changed to false. Removing mouse listeners for move and up");
      listeningForMouseEvents = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }
    onCleanup(() => {
      if (listeningForMouseEvents) {
        debugTrace(1 /* Verbose */, "DragAndDrop: onCleanup. Removing mouse listeners for move and up");
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      }
    });
  });
  return createComponent(DragAndDropContext.Provider, {
    value: {
      isDisabled,
      isDragging,
      isDropping,
      overDropzone: dropzone
    },
    get children() {
      return createComponent(DragAndDropInternalContext.Provider, {
        value: {
          captureDraggable,
          releaseDraggable,
          cancelDrag,
          enterDropzone,
          leaveDropzone,
          portalRoot: overlayContent,
          dropPredicate: activeCanDropPredicate
        },
        get children() {
          var _el$ = _tmpl$();
          insert(_el$, () => props.children);
          return _el$;
        }
      });
    }
  });
};
const DraggableContext = createContext({
  draggable: null,
  isRenderingOverlay: false,
  isDragging: () => false
});
const useDraggableContext = () => useContext(DraggableContext);
const Draggable = (props) => {
  const id = Symbol();
  const context = useDragAndDropContext();
  const internalContext = useDragAndDropInternalContext();
  const draggableContext = useDraggableContext();
  if (draggableContext.draggable != null) {
    throw new Error("<Draggable> components must not be nested.");
  }
  const shouldDebugTrace = untrack(() => props.debugTrace);
  const debugId = untrack(() => props.debugId);
  function debugTrace(debugLevel, ...args) {
    if (!shouldDebugTrace || debugLevel > DEBUG_LEVEL) {
      return;
    }
    console.debug(`[${Date.now()}] DnD: Draggable ([${debugId ?? "no id"})`, ...args);
  }
  engine.on("InputAction", onInputAction);
  onCleanup(() => {
    engine.off("InputAction", onInputAction);
  });
  function onInputAction(name, status, x, y) {
    if (status !== InputActionStatuses.FINISH || name !== "touch-tap") {
      return;
    }
    if (name === "touch-tap") {
      debugTrace(0 /* Log */, "onInputAction:", name, status, `[${x}, ${y}]`);
      stopDrag(x, y);
    }
  }
  function startDrag(x, y) {
    debugTrace(1 /* Verbose */, "startDrag:", `[${x}, ${y}]`);
    if (isDisabled() || context.isDragging()) {
      return;
    }
    internalContext.captureDraggable({
      id,
      data: props.data,
      debugId: props.debugId
    }, x, y, props.onDragStart, props.onDragEnd, props.canDrop);
  }
  function stopDrag(x, y) {
    debugTrace(1 /* Verbose */, "stopDrag:", `[${x}, ${y}]`);
    internalContext.releaseDraggable(x, y);
  }
  function handleMouseDown(event) {
    debugTrace(1 /* Verbose */, "handleMouseDown");
    startDrag(event.clientX, event.clientY);
  }
  function handleTouchStart(event) {
    debugTrace(1 /* Verbose */, "handleTouchStart");
    if (event.touches.length > 0) {
      startDrag(event.touches[0].clientX, event.touches[0].clientY);
    }
  }
  function handleMouseClick(event) {
    debugTrace(1 /* Verbose */, "handleMouseClick");
    stopDrag(event.clientX, event.clientY);
  }
  const isDisabled = createMemo(() => {
    return context.isDisabled() || props.disabled === true;
  });
  const isDragging = createMemo(() => {
    const dragging = context.isDragging();
    return dragging != null && dragging.id == id;
  });
  const isDropping = createMemo(() => {
    const dropping = context.isDropping();
    if (dropping && dropping.draggable.id == id) {
      return dropping;
    } else {
      return null;
    }
  });
  createEffect(() => {
    if (props.onDragDrop) {
      const drop = isDropping();
      if (drop) {
        props.onDragDrop(drop.draggable, drop.dropzone, drop.position);
      }
    }
  });
  const draggable = createMemo(() => {
    return {
      id,
      data: props.data,
      debugId: props.debugId
    };
  });
  return createComponent(DraggableContext.Provider, {
    value: {
      draggable,
      isRenderingOverlay: false,
      isDragging
    },
    get children() {
      var _el$2 = _tmpl$2();
      _el$2.$$touchstart = handleTouchStart;
      _el$2.$$click = handleMouseClick;
      _el$2.$$mousedown = handleMouseDown;
      insert(_el$2, () => props.children, null);
      insert(_el$2, (() => {
        var _c$ = createMemo(() => !!isDragging());
        return () => _c$() && createComponent(Portal, {
          get mount() {
            return internalContext.portalRoot;
          },
          get children() {
            return createComponent(DraggableContext.Provider, {
              value: {
                draggable,
                isRenderingOverlay: true,
                isDragging
              },
              get children() {
                return props.children;
              }
            });
          }
        });
      })(), null);
      createRenderEffect((_$p) => style(_el$2, isDragging() ? props.ghostElementStyle : "", _$p));
      return _el$2;
    }
  });
};
const DropzoneContext = createContext({
  dropzone: () => null,
  canDrop: () => null
});
const useDropzoneContext = () => useContext(DropzoneContext);
const Dropzone = (props) => {
  const context = useDragAndDropContext();
  const internalContext = useDragAndDropInternalContext();
  const [_hovering, setHovering] = createSignal(null);
  const [localCanDrop, setLocalCanDrop] = createSignal(null);
  const [contextCanDrop, setContextCanDrop] = createSignal(null);
  const shouldDebugTrace = untrack(() => props.debugTrace);
  const debugId = untrack(() => props.debugId);
  function debugTrace(debugLevel, ...args) {
    if (!shouldDebugTrace || debugLevel > DEBUG_LEVEL) {
      return;
    }
    console.debug(`[${Date.now()}] DnD: Dropzone (${debugId ?? "no id"})`, ...args);
  }
  createEffect(() => {
    if (props.canDrop) {
      const draggable = context.isDragging();
      if (draggable) {
        const dropzone2 = {
          id,
          data: props.data,
          debugId: props.debugId
        };
        const signalAccessor = props.canDrop(draggable, dropzone2);
        setLocalCanDrop(() => signalAccessor);
      }
    } else {
      setLocalCanDrop(null);
    }
  });
  createEffect(() => {
    const predicate = internalContext.dropPredicate();
    if (predicate) {
      const draggable = context.isDragging();
      if (draggable) {
        const dropzone2 = {
          id,
          data: props.data,
          debugId: props.debugId
        };
        const signalAccessor = predicate(draggable, dropzone2);
        setContextCanDrop(() => signalAccessor);
      }
    } else {
      setContextCanDrop(null);
    }
  });
  const canDrop = createMemo(() => {
    const local = localCanDrop();
    const context2 = contextCanDrop();
    if (local && local() == false) {
      return false;
    }
    if (context2 && context2() == false) {
      return false;
    }
    return true;
  });
  const id = Symbol();
  let dropzoneDiv;
  const isDisabled = createMemo(() => {
    return context.isDisabled() || props.disabled === true;
  });
  createEffect(() => {
    if (context.isDragging() == null || props.disabled === true) {
      setHovering(null);
    }
  });
  createEffect(() => {
    if (props.onDragDrop) {
      const dropped = context.isDropping();
      if (dropped && dropped.dropzone.id == id) {
        props.onDragDrop(dropped.draggable, dropped.dropzone, dropped.position);
      }
    }
  });
  function onEnterDropzone(x, y) {
    debugTrace(1 /* Verbose */, "onEnterDropzone:", `[${x}, ${y}]`, "isDisabled:", isDisabled());
    if (isDisabled()) {
      return;
    }
    const dragging = context.isDragging();
    if (dragging != null && dropzoneDiv) {
      const dropzone2 = {
        id,
        data: props.data,
        debugId: props.debugId
      };
      if (internalContext.enterDropzone(dropzone2, dropzoneDiv, canDrop, x, y)) {
        setHovering(dragging);
      }
      if (props.onDragOver) {
        props.onDragOver(dragging, dropzone2, x, y);
      }
    }
  }
  function handleMouseEnter(event) {
    debugTrace(1 /* Verbose */, "handleMouseEnter");
    onEnterDropzone(event.clientX, event.clientY);
  }
  function onExitDropZone(x, y) {
    debugTrace(1 /* Verbose */, "onExitDropZone:", `[${x}, ${y}]`, "isDisabled:", isDisabled());
    if (isDisabled()) {
      return;
    }
    const dragging = context.isDragging();
    if (dragging != null && dropzoneDiv) {
      const dropzone2 = {
        id,
        data: props.data,
        debugId: props.debugId
      };
      if (internalContext.leaveDropzone(dropzone2, dropzoneDiv, x, y)) {
        if (props.onDragLeave) {
          props.onDragLeave(dragging, dropzone2, x, y);
        }
      }
    }
    setHovering(null);
  }
  function handleMouseLeave(event) {
    debugTrace(1 /* Verbose */, "handleMouseLeave");
    onExitDropZone(event.clientX, event.clientY);
  }
  const dropzone = createMemo(() => {
    return {
      id,
      data: props.data,
      debugId: props.debugId
    };
  });
  return createComponent(DropzoneContext.Provider, {
    value: {
      dropzone,
      canDrop
    },
    get children() {
      var _el$3 = _tmpl$2();
      _el$3.addEventListener("mouseleave", handleMouseLeave);
      _el$3.addEventListener("mouseenter", handleMouseEnter);
      var _ref$ = dropzoneDiv;
      typeof _ref$ === "function" ? use(_ref$, _el$3) : dropzoneDiv = _el$3;
      insert(_el$3, () => props.children);
      createRenderEffect((_p$) => {
        var _v$ = `${props.class ?? ""} dropzone`, _v$2 = props.classList;
        _v$ !== _p$.e && className(_el$3, _p$.e = _v$);
        _p$.t = classList(_el$3, _v$2, _p$.t);
        return _p$;
      }, {
        e: void 0,
        t: void 0
      });
      return _el$3;
    }
  });
};
function createTypedDraggable() {
  return (props) => Draggable(props);
}
function createTypedDropzone() {
  return (props) => Dropzone(props);
}
function createTypedDragAndDrop() {
  return [DragAndDrop, (props) => Draggable(props), (props) => Dropzone(props)];
}
delegateEvents(["mousedown", "click", "touchstart"]);

export { DragAndDrop, DragAndDropContext, DragAndDropGlobalContext, DragEndStatus, Draggable, DraggableContext, Dropzone, DropzoneContext, createTypedDragAndDrop, createTypedDraggable, createTypedDropzone, defaultSetElementPosition, setElementPositionViaTopLeft, setElementPositionViaTransform, useDragAndDropContext, useDragAndDropGlobalContext, useDraggableContext, useDropzoneContext };
//# sourceMappingURL=drag-and-drop.js.map

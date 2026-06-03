import { template, insert, Portal, style, use, className, classList, delegateEvents } from '../../vendor/solid-js/web/dist/web.js';
import { createContext, useContext, createSignal, createMemo, createEffect, onCleanup, createComponent, createRenderEffect } from '../../vendor/solid-js/dist/solid.js';
import { ActiveInputDevice } from '../services/input.js';

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`);
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
  function resetDrag() {
    setIsCapture(null);
    setIsDropping(null);
    setIsDragging(null);
    setDropzones([]);
    overlayRoot.style.display = "none";
    overlayRoot.remove();
  }
  function startDrag(event) {
    if (isDragging()) {
      throw new Error("Already in a dragging operation!");
    }
    const draggable = isCaptured();
    if (draggable == null) {
      throw new Error("Cannot start a drag operation when no draggable has been captured.");
    }
    if (props.debugTrace) {
      console.log("Starting drag operation.", draggable);
    }
    setIsDragging(draggable);
    if (props.onDragStart) {
      props.onDragStart(draggable, initialPosition);
    }
    if (capturedStartCallback) {
      capturedStartCallback(draggable, initialPosition);
    }
    const setPosition = props.setElementPosition ?? defaultSetElementPosition;
    setPosition(overlayRoot, event.clientX, event.clientY);
    overlayRoot.style.display = "";
    overlayParent().appendChild(overlayRoot);
  }
  function captureDraggable(draggable, event, startCallback, endCallback, canDropPredicate) {
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
    setPosition(overlayRoot, event.clientX, event.clientY);
    initialPosition.x = event.clientX;
    initialPosition.y = event.clientY;
  }
  function releaseDraggable(event) {
    const draggable = isDragging();
    const position = {
      x: event.clientX,
      y: event.clientY
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
      console.log("Ending Drag Operation.", statusText, draggable, dz?.dropzone);
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
    const draggable = isDragging();
    if (draggable) {
      if (capturedEndCallback) {
        capturedEndCallback(draggable, 1 /* Cancelled */);
        capturedEndCallback = null;
      }
    }
    resetDrag();
  }
  function enterDropzone(dropzone2, el, canDrop, _event) {
    const original = dropzones();
    if (original.length > 0 && original[original.length - 1].dropzone.id == dropzone2.id) {
      return false;
    }
    const zones = original.filter((z) => !el.contains(z.ref) && z.ref.contains(el));
    zones.push({
      dropzone: dropzone2,
      ref: el,
      canDrop
    });
    if (props.debugTrace) {
      const t = zones.length > 1 ? "nested dropzone" : "dropzone";
      console.log(`Entering ${t}.`, dropzone2, canDrop());
    }
    setDropzones(zones);
    return true;
  }
  function leaveDropzone(dz, _el, _event) {
    const current_dz = dropzone();
    if (current_dz && current_dz.dropzone.id != dz.id) {
      console.warn("Leaving a drop zone that is not the active drop zone??");
    }
    const original = dropzones();
    const zones = original.filter((z) => z.dropzone.id != dz.id);
    if (original.length != zones.length) {
      if (props.debugTrace) {
        console.log("Leaving Dropzone.", dz);
        if (zones.length > 0) {
          const newZone = zones[zones.length - 1];
          console.log("Still within dropzone.", newZone.dropzone, newZone.canDrop());
        }
      }
      setDropzones(zones);
    } else {
      console.warn("Leaving a dropzone that we weren't inside?");
      return false;
    }
    return true;
  }
  function handleMouseMove(event) {
    if (isDragging() == null && isCaptured()) {
      startDrag(event);
    }
    let newX = event.clientX;
    let newY = event.clientY;
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
    setPosition(overlayRoot, event.clientX, event.clientY);
  }
  function handleMouseUp(event) {
    releaseDraggable(event);
  }
  createEffect(() => {
    if (isDisabled() && isDragging()) {
      cancelDrag();
    }
  });
  createEffect(() => {
    if (isCaptured()) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }
    onCleanup(() => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
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
          return props.children;
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
  function handleMouseDown(event) {
    if (isDisabled() || context.isDragging()) {
      return;
    }
    internalContext.captureDraggable({
      id,
      data: props.data,
      debugId: props.debugId
    }, event, props.onDragStart, props.onDragEnd, props.canDrop);
  }
  function handleMouseClick(event) {
    internalContext.releaseDraggable(event);
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
      var _el$ = _tmpl$();
      _el$.$$click = handleMouseClick;
      _el$.$$mousedown = handleMouseDown;
      insert(_el$, () => props.children, null);
      insert(_el$, (() => {
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
      createRenderEffect((_$p) => style(_el$, isDragging() ? props.ghostElementStyle : "", _$p));
      return _el$;
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
  function handleMouseEnter(event) {
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
      if (internalContext.enterDropzone(dropzone2, dropzoneDiv, canDrop, event)) {
        setHovering(dragging);
      }
      if (props.onDragOver) {
        props.onDragOver(dragging, dropzone2, event);
      }
    }
  }
  function handleMouseLeave(event) {
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
      if (internalContext.leaveDropzone(dropzone2, dropzoneDiv, event)) {
        if (props.onDragLeave) {
          props.onDragLeave(dragging, dropzone2, event);
        }
      }
    }
    setHovering(null);
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
      var _el$2 = _tmpl$();
      _el$2.addEventListener("mouseleave", handleMouseLeave);
      _el$2.addEventListener("mouseenter", handleMouseEnter);
      var _ref$ = dropzoneDiv;
      typeof _ref$ === "function" ? use(_ref$, _el$2) : dropzoneDiv = _el$2;
      insert(_el$2, () => props.children);
      createRenderEffect((_p$) => {
        var _v$ = props.class, _v$2 = props.classList;
        _v$ !== _p$.e && className(_el$2, _p$.e = _v$);
        _p$.t = classList(_el$2, _v$2, _p$.t);
        return _p$;
      }, {
        e: void 0,
        t: void 0
      });
      return _el$2;
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
delegateEvents(["mousedown", "click"]);

export { DragAndDrop, DragAndDropContext, DragAndDropGlobalContext, DragEndStatus, Draggable, DraggableContext, Dropzone, DropzoneContext, createTypedDragAndDrop, createTypedDraggable, createTypedDropzone, defaultSetElementPosition, setElementPositionViaTopLeft, setElementPositionViaTransform, useDragAndDropContext, useDragAndDropGlobalContext, useDraggableContext, useDropzoneContext };
//# sourceMappingURL=drag-and-drop.js.map

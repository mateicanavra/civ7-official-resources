import { template, insert, Portal, className, spread, use } from '../../vendor/solid-js/web/dist/web.js';
import { createContext, useContext, createMemo, createSignal, onMount, onCleanup, createComponent, createEffect, on, Show, mergeProps, createRenderEffect, splitProps, children } from '../../vendor/solid-js/dist/solid.js';
import { Activatable } from './activatable.js';
import { L10n } from './l10n.js';
import { NavHelp, KBMNavHelp } from './nav-help.js';
import { Slot } from './slot.js';
import { NestedTooltipContext } from './tooltip-compat.js';
import { TooltipModel } from './tooltip-model.js';
import { TriggerActivationContext, TriggerActivationContextProvider, TriggerType } from './trigger.js';
import { ComponentRegistry } from '../services/component-registry.js';
import { FocusManager } from '../services/focus-manager.js';
import { useFocusContext } from '../services/focus.js';
import { IsMouseActive, IsKeyboardActive, IsTouchActive, ActiveInputDevice } from '../services/input.js';
import { createPropsRefSignal, createLayoutComplete } from '../utilities/solid-utilities.js';

var _tmpl$ = /* @__PURE__ */ template(`<span class=hidden></span>`), _tmpl$2 = /* @__PURE__ */ template(`<div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="flex flex-row items-center justify-center"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="flex flex-col flex-auto items-center justify-center"><div class="flex flex-row items-center justify-center"></div><div class="flex-auto tooltip-autolock-progress bg-secondary"></div></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="absolute top-1 left-1 rotate-180 size-4 bg-contain opacity-30"></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="absolute top-1 right-1 -rotate-90 size-4 bg-contain opacity-30"></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="absolute bottom-1 left-1 rotate-90 size-4 bg-contain opacity-30"></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class="absolute bottom-1 right-1 size-4 bg-contain opacity-30"></div>`), _tmpl$9 = /* @__PURE__ */ template(`<div role=heading></div>`);
const MAX_VISIBLE_TOOLTIPS = 10;
const TooltipNavigationRules = /* @__PURE__ */ new Map([[InputNavigationAction.UP, (context) => {
  const firstFocusable = context.children()[0];
  context.focusChild(firstFocusable);
}], [InputNavigationAction.LEFT, (context) => context.focusPrevious()], [InputNavigationAction.RIGHT, (context) => context.focusNext()], [InputNavigationAction.NONE, (context) => context.focusCurrent()]]);
var TooltipVerticalPosition = /* @__PURE__ */ ((TooltipVerticalPosition2) => {
  TooltipVerticalPosition2["AUTO"] = "auto";
  TooltipVerticalPosition2["TOP"] = "top";
  TooltipVerticalPosition2["CENTER"] = "center";
  TooltipVerticalPosition2["BOTTOM"] = "bottom";
  return TooltipVerticalPosition2;
})(TooltipVerticalPosition || {});
var TooltipHorizontalPosition = /* @__PURE__ */ ((TooltipHorizontalPosition2) => {
  TooltipHorizontalPosition2["AUTO"] = "auto";
  TooltipHorizontalPosition2["LEFT_COVER"] = "left_cover";
  TooltipHorizontalPosition2["LEFT"] = "left";
  TooltipHorizontalPosition2["CENTER"] = "center";
  TooltipHorizontalPosition2["RIGHT_COVER"] = "right_cover";
  TooltipHorizontalPosition2["RIGHT"] = "right";
  return TooltipHorizontalPosition2;
})(TooltipHorizontalPosition || {});
function inPx(value) {
  return value === void 0 ? void 0 : `${value}px`;
}
const TooltipContext = createContext();
function flipVertical(pos) {
  switch (pos) {
    case "top" /* TOP */:
      return "bottom" /* BOTTOM */;
    case "bottom" /* BOTTOM */:
      return "top" /* TOP */;
    default:
      return pos;
  }
}
function flipHorizontal(pos) {
  switch (pos) {
    case "left" /* LEFT */:
      return "right" /* RIGHT */;
    case "right" /* RIGHT */:
      return "left" /* LEFT */;
    case "left_cover" /* LEFT_COVER */:
      return "right_cover" /* RIGHT_COVER */;
    case "right_cover" /* RIGHT_COVER */:
      return "left_cover" /* LEFT_COVER */;
    default:
      return pos;
  }
}
function getTooltipEnterClass(vPosition, hPosition) {
  const vertical = vPosition === "top" /* TOP */ ? "top" : vPosition === "bottom" /* BOTTOM */ ? "bottom" : "center";
  const horizontal = hPosition === "left" /* LEFT */ || hPosition === "left_cover" /* LEFT_COVER */ ? "left" : hPosition === "right" /* RIGHT */ || hPosition === "right_cover" /* RIGHT_COVER */ ? "right" : "center";
  return `ui-next-tooltip-enter--${vertical}-${horizontal}`;
}
function computeTooltipPosition(targetRect, tooltip, desiredV, desiredH, offset) {
  const tooltipWidth = tooltip.offsetWidth;
  const tooltipHeight = tooltip.offsetHeight;
  const screenHeight = window.innerHeight;
  const screenWidth = window.innerWidth;
  const targetCenterX = targetRect.x + targetRect.width / 2;
  const targetCenterY = targetRect.y + targetRect.height / 2;
  const tooltipLocalCenterX = tooltipWidth / 2;
  let calcVPos = desiredV;
  let calcHPos = desiredH;
  if (calcVPos === "auto" /* AUTO */) {
    calcVPos = targetCenterY <= screenHeight / 2 ? "bottom" /* BOTTOM */ : "top" /* TOP */;
  }
  if (calcHPos === "auto" /* AUTO */) {
    const thirdWidth = screenWidth / 3;
    if (targetCenterX < thirdWidth) {
      calcHPos = calcVPos === "center" /* CENTER */ ? "right" /* RIGHT */ : "right_cover" /* RIGHT_COVER */;
    } else if (targetCenterX < thirdWidth * 2) {
      if (calcVPos === "center" /* CENTER */) {
        calcHPos = targetCenterY > screenWidth / 2 ? "right" /* RIGHT */ : "left" /* LEFT */;
      } else {
        calcHPos = "center" /* CENTER */;
      }
    } else {
      calcHPos = calcVPos === "center" /* CENTER */ ? "left" /* LEFT */ : "left_cover" /* LEFT_COVER */;
    }
  }
  let top = 0;
  let left = 0;
  switch (calcVPos) {
    case "top" /* TOP */:
      top = targetRect.top - tooltipHeight - offset;
      break;
    case "bottom" /* BOTTOM */:
      top = targetRect.bottom + offset;
      break;
    case "center" /* CENTER */:
      top = targetCenterY - tooltipHeight / 2;
      break;
    default:
      calcVPos;
  }
  switch (calcHPos) {
    case "center" /* CENTER */:
      left = targetCenterX - tooltipLocalCenterX;
      break;
    case "left_cover" /* LEFT_COVER */:
      left = targetRect.right - tooltipWidth - offset;
      break;
    case "left" /* LEFT */:
      left = targetRect.left - tooltipWidth - offset;
      break;
    case "right" /* RIGHT */:
      left = targetRect.right + offset;
      break;
    case "right_cover" /* RIGHT_COVER */:
      left = targetRect.left + offset;
      break;
    default:
      calcHPos;
  }
  const overflow = {
    above: top < 0,
    below: top + tooltipHeight > screenHeight,
    left: left < 0,
    right: left + tooltipWidth > screenWidth
  };
  return {
    top,
    left,
    appliedVPos: calcVPos,
    appliedHPos: calcHPos,
    overflow
  };
}
let curTooltip = 0;
const TooltipRootComponent = (props) => {
  const parentCtx = useContext(TooltipContext);
  const tooltipModel = TooltipModel.get();
  const name = createMemo(() => `tooltip-${curTooltip++}`);
  const [triggerContext, setTriggerContext] = createSignal(void 0);
  const [vPosition, setVPosition] = createSignal(props.initialVPosition);
  const [hPosition, setHPosition] = createSignal(props.initialHPosition);
  const [childTooltipCount, setChildTooltipCount] = createSignal(0);
  const offset = createMemo(() => props.offset ?? 0);
  const nestedCtx = useContext(NestedTooltipContext);
  if (!nestedCtx?.disabled) {
    onMount(() => {
      parentCtx?.setChildTooltipCount((count) => count + 1);
      onCleanup(() => {
        parentCtx?.setChildTooltipCount((count) => count - 1);
      });
    });
  }
  onMount(() => {
    const tooltipName = name();
    tooltipModel.register(tooltipName, childTooltipCount);
    onCleanup(() => {
      const tooltipName2 = name();
      tooltipModel.unregister(tooltipName2);
    });
  });
  return createComponent(TooltipContext.Provider, {
    get value() {
      return {
        /* eslint-disable solid/reactivity -- these don't need to be reactive */
        name: name(),
        offset,
        allowFlip: props.allowFlip ?? false,
        showFiligrees: props.showFiligrees ?? true,
        initialVPosition: props.initialVPosition,
        initialHPosition: props.initialHPosition,
        /* eslint-enable solid/reactivity */
        vPosition,
        setVPosition,
        hPosition,
        setHPosition,
        triggerContext,
        setTriggerContext,
        childTooltipCount,
        setChildTooltipCount
      };
    },
    get children() {
      return props.children;
    }
  });
};
const onMouseMove = (e) => {
  setMousePosition({
    x: e.clientX,
    y: e.clientY
  });
};
document.addEventListener("mousemove", onMouseMove, {
  capture: true
});
const [mousePosition, setMousePosition] = createSignal({
  x: 0,
  y: 0
});
const TooltipContentComponent = (props) => {
  const focusManager = FocusManager.get();
  const tooltipModel = TooltipModel.get();
  const tooltipRoot = document.getElementById("uinext-tooltips") ?? document.body;
  const [root, setRoot] = createPropsRefSignal(() => props.ref);
  const ctx = useContext(TooltipContext);
  if (!ctx) {
    throw new Error("Tooltip.Content must be used within a <Tooltip> root component");
  }
  const [top, setTop] = createSignal();
  const [left, setLeft] = createSignal();
  const [scale, setScale] = createSignal(1);
  const [isCalculatingPosition, setIsCalculatingPosition] = createSignal(true);
  const [didCalculatePosition, setDidCalculatePosition] = createSignal(false);
  const isLayoutComplete = createLayoutComplete();
  const isTop = createMemo(() => {
    const active = tooltipModel.active();
    return active.length > 0 && active[active.length - 1] === ctx.name;
  });
  createEffect(on(() => tooltipModel.isActive(ctx.name), () => {
    setDidCalculatePosition(false);
  }));
  const shouldActivate = createMemo(() => {
    const isLocked = tooltipModel.isLocked(ctx.name);
    const isActive = tooltipModel.isActive(ctx.name);
    const isHidden = tooltipModel.tooltipsHidden();
    return !isHidden && (isLocked || isActive);
  });
  const shouldShow = createMemo(() => {
    const activeStack = tooltipModel.active();
    const stackIndex = activeStack.indexOf(ctx.name);
    return stackIndex >= Math.max(0, activeStack.length - MAX_VISIBLE_TOOLTIPS);
  });
  const enterAnimationClass = createMemo(() => getTooltipEnterClass(ctx.vPosition() ?? "auto" /* AUTO */, ctx.hPosition() ?? "auto" /* AUTO */));
  const target = createMemo(() => tooltipModel.getTarget(ctx.name));
  const [targetRect, setTargetRect] = createSignal();
  const setTargetRectFromXY = (x, y) => {
    setTargetRect({
      x,
      y,
      width: 0,
      height: 0,
      top: y,
      right: x,
      bottom: y,
      left: x
    });
  };
  const onCameraChanged = (_state) => {
    const currentTarget = target();
    if (currentTarget && !(currentTarget instanceof HTMLElement) && isTop() && !tooltipModel.isLocked(ctx.name)) {
      const screenUV = WorldUI.getScreenPlotPos(currentTarget);
      if (screenUV) {
        const x = screenUV.x * window.innerWidth;
        const y = screenUV.y * window.innerHeight;
        setTargetRectFromXY(x, y);
      }
    }
  };
  createEffect(() => {
    if (!IsMouseActive() && isTop() && !tooltipModel.isLocked(ctx.name)) {
      engine.on("CameraChanged", onCameraChanged);
    } else {
      engine.off("CameraChanged", onCameraChanged);
    }
  });
  onCleanup(() => {
    engine.off("CameraChanged", onCameraChanged);
  });
  createEffect(() => {
    const currentTarget = target();
    if (currentTarget && !(currentTarget instanceof HTMLElement) && isTop()) {
      if (IsMouseActive() || IsKeyboardActive()) {
        setTargetRectFromXY(mousePosition().x, mousePosition().y);
      } else {
        const screenUV = WorldUI.getScreenPlotPos(currentTarget);
        if (screenUV) {
          const x = screenUV.x * window.innerWidth;
          const y = screenUV.y * window.innerHeight;
          setTargetRectFromXY(x, y);
        }
      }
    } else {
      if (currentTarget instanceof HTMLElement) {
        setTargetRect(currentTarget.getBoundingClientRect());
      }
    }
  });
  createEffect(() => {
    const tooltip = root();
    const currentTargetRect = targetRect();
    if (!currentTargetRect || !tooltip || !isLayoutComplete() || !shouldActivate() || tooltipModel.isLocked(ctx.name)) {
      return;
    }
    const offset = ctx.offset ?? 0;
    setIsCalculatingPosition(true);
    waitForLayout(() => {
      if (!shouldActivate()) {
        setIsCalculatingPosition(false);
        return;
      }
      if (tooltipModel.isLocked(ctx.name) && didCalculatePosition()) {
        setIsCalculatingPosition(false);
        return;
      }
      const initial = computeTooltipPosition(currentTargetRect, tooltip, ctx.initialVPosition ?? ctx.vPosition() ?? "auto" /* AUTO */, ctx.initialHPosition ?? ctx.hPosition() ?? "auto" /* AUTO */, offset());
      let final = initial;
      if (ctx.allowFlip) {
        const needFlipVertical = initial.overflow.above || initial.overflow.below;
        const needFlipHorizontal = initial.overflow.left || initial.overflow.right;
        if (needFlipVertical || needFlipHorizontal) {
          const flippedVPos = flipVertical(initial.appliedVPos);
          const flippedHPos = flipHorizontal(initial.appliedHPos);
          ctx.setVPosition(flippedVPos);
          ctx.setHPosition(flippedHPos);
          final = computeTooltipPosition(currentTargetRect, tooltip, flippedVPos, flippedHPos, offset());
        }
      }
      const tooltipWidth = tooltip.offsetWidth;
      const tooltipHeight = tooltip.offsetHeight;
      const screenHeight = window.innerHeight;
      const screenWidth = window.innerWidth;
      const scaleValue = Math.min(1, screenWidth / tooltipWidth, screenHeight / tooltipHeight);
      const xOffset = (1 - scaleValue) * tooltipWidth / 2;
      const yOffset = (1 - scaleValue) * tooltipHeight / 2;
      const scaledWidth = tooltipWidth * scaleValue;
      const scaledHeight = tooltipHeight * scaleValue;
      let idealVisualLeft = final.left;
      if (final.appliedHPos === "left" /* LEFT */ || final.appliedHPos === "left_cover" /* LEFT_COVER */) {
        idealVisualLeft += 2 * xOffset;
      } else if (final.appliedHPos === "center" /* CENTER */) {
        idealVisualLeft += xOffset;
      }
      let idealVisualTop = final.top;
      if (final.appliedVPos === "top" /* TOP */) {
        idealVisualTop += 2 * yOffset;
      } else if (final.appliedVPos === "center" /* CENTER */) {
        idealVisualTop += yOffset;
      }
      const clampedVisualTop = Math.min(Math.max(0, idealVisualTop), screenHeight - scaledHeight);
      const clampedVisualLeft = Math.min(Math.max(0, idealVisualLeft), screenWidth - scaledWidth);
      setTop(clampedVisualTop - yOffset);
      setLeft(clampedVisualLeft - xOffset);
      setScale(scaleValue);
      setIsCalculatingPosition(false);
      setDidCalculatePosition(true);
    });
  });
  createEffect(on(() => tooltipModel.isLocked(ctx.name), (locked) => {
    const currentRoot = root();
    if (locked && currentRoot) {
      FocusManager.get().setFocus(currentRoot);
      onCleanup(() => {
        if (focusManager.currentFocus() === currentRoot) {
          focusManager.setFocus(document.body);
        }
      });
    }
  }));
  const onEngineInput = (inputEvent) => {
    const {
      name,
      status
    } = inputEvent.detail;
    if (status === InputActionStatuses.FINISH) {
      let didHandleEvent = false;
      if (name === "keyboard-inspect-tooltip" || name === "toggle-tooltip") {
        tooltipModel.lock();
        didHandleEvent = true;
      } else if (inputEvent.isCancelInput() && tooltipModel.locked()) {
        tooltipModel.unlockAll();
        didHandleEvent = true;
      }
      if (didHandleEvent) {
        inputEvent.preventDefault();
      }
    }
  };
  createEffect(() => {
    if (isTop()) {
      window.addEventListener("engine-input", onEngineInput, true);
      onCleanup(() => {
        window.removeEventListener("engine-input", onEngineInput, true);
      });
    } else {
      window.removeEventListener("engine-input", onEngineInput, true);
    }
  });
  const [focusCtx, setFocusCtx] = createSignal(null);
  const onNavigate = (navigationEvent) => {
    if (navigationEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (focusCtx()?.navigate(navigationEvent.detail.navigation)) {
      navigationEvent.preventDefault();
      navigationEvent.stopPropagation();
    }
  };
  return (
    // Hidden span prevents empty text nodes being rendered as placeholders in the DOM tree
    (() => {
      var _el$ = _tmpl$();
      insert(_el$, createComponent(Show, {
        get when() {
          return shouldActivate();
        },
        get children() {
          return createComponent(Portal, {
            mount: tooltipRoot,
            get children() {
              return [createComponent(Show, {
                get when() {
                  return tooltipModel.locked() == ctx.name;
                },
                get children() {
                  return createComponent(Activatable, {
                    onActivate: () => tooltipModel.unlockAll(),
                    disableTrigger: true,
                    "class": "fixed inset-0 pointer-events-auto",
                    style: {
                      "background-color": "rgba(0 0 0 / .5)"
                    }
                  });
                }
              }), createComponent(Slot, mergeProps(props, {
                ref: setRoot,
                get disableFocus() {
                  return !tooltipModel.isLocked(ctx.name);
                },
                get ["class"]() {
                  return `absolute visible ${props.class ?? ""}`;
                },
                get classList() {
                  return {
                    "opacity-0": isCalculatingPosition() && !didCalculatePosition(),
                    hidden: !shouldShow(),
                    "pointer-events-auto": tooltipModel.isLocked(ctx.name) || IsTouchActive(),
                    "pointer-events-none": !tooltipModel.isLocked(ctx.name) && !IsTouchActive()
                  };
                },
                get style() {
                  return {
                    top: inPx(top()),
                    left: inPx(left()),
                    transform: `scale(${scale()})`
                  };
                },
                navRules: TooltipNavigationRules,
                lockNavigation: true,
                "on:navigate-input": onNavigate,
                "on:engine-input": (e) => {
                  if (e.detail.status === InputActionStatuses.FINISH && e.detail.name === "touch-tap" && !isTop()) {
                    e.stopPropagation();
                    tooltipModel.pop();
                  }
                },
                tabIndex: -1,
                children: () => {
                  onMount(() => {
                    const focusCtx2 = useFocusContext();
                    focusCtx2.register(root());
                    setFocusCtx(focusCtx2);
                  });
                  onCleanup(() => {
                    focusCtx()?.unregister(root());
                    setFocusCtx(null);
                  });
                  return (() => {
                    var _el$2 = _tmpl$2();
                    insert(_el$2, () => props.children);
                    createRenderEffect(() => className(_el$2, `ui-next-tooltip-enter ${enterAnimationClass()}`));
                    return _el$2;
                  })();
                }
              }))];
            }
          });
        }
      }));
      return _el$;
    })()
  );
};
const TooltipInspectHintComponent = (props) => {
  const tooltipModel = TooltipModel.get();
  const ctx = useContext(TooltipContext);
  const [local, other] = splitProps(props, ["class", "progressBarRef", "handlers"]);
  if (!ctx && local.handlers == void 0) {
    throw new Error("Tooltip.InspectHint must be used within a <Tooltip> root component or managed individually using handlers.");
  }
  const isLocked = () => {
    if (local.handlers) {
      return local.handlers.isLocked();
    }
    if (ctx) {
      return tooltipModel.isLocked(ctx.name);
    }
  };
  const tooltipCount = createMemo(() => {
    if (local.handlers) {
      return local.handlers.tooltipCount();
    }
    if (ctx) {
      return ctx.childTooltipCount();
    } else {
      console.error("Tooltip.InspectHint The tooltip count should be handled to show the tooltip.");
      return 0;
    }
  });
  const isTopLevelActiveAndLocked = createMemo(() => {
    if (local.handlers) {
      return local.handlers.isTopLevelActiveAndLocked();
    }
    const active = tooltipModel.active();
    if (ctx && active.length > 0) {
      return active[active.length - 1] == ctx.name && isLocked();
    } else {
      return isLocked();
    }
  });
  const strClose = Locale.toUpper("LOC_GENERIC_CLOSE");
  const inspectText = () => createComponent(L10n.Stylize, {
    get text() {
      return isTopLevelActiveAndLocked() ? strClose : "LOC_INSPECT_TOOLTIP";
    },
    "class": "text-sm font-body uppercase mr-2",
    get classList() {
      return {
        "text-accent-1": isLocked(),
        "text-accent-3": !isLocked()
      };
    },
    style: {
      "letter-spacing": "-0.5px"
    },
    role: "heading"
  });
  return createComponent(Show, {
    get when() {
      return createMemo(() => !!!IsTouchActive())() && tooltipCount() > 0;
    },
    get children() {
      var _el$3 = _tmpl$2();
      spread(_el$3, mergeProps(other, {
        get ["class"]() {
          return `flex flex-col justify-center mt-4 ${local.class ?? ""}`;
        }
      }), false, true);
      insert(_el$3, createComponent(Show, {
        get when() {
          return !isLocked() || isTopLevelActiveAndLocked();
        },
        get children() {
          var _el$4 = _tmpl$3();
          insert(_el$4, createComponent(Show, {
            get when() {
              return createMemo(() => ActiveInputDevice() != InputDeviceType.Mouse)() && ActiveInputDevice() != InputDeviceType.Keyboard;
            },
            get fallback() {
              return (() => {
                var _el$5 = _tmpl$4(), _el$6 = _el$5.firstChild, _el$7 = _el$6.nextSibling;
                insert(_el$6, inspectText, null);
                insert(_el$6, createComponent(KBMNavHelp, {
                  actionName: "keyboard-inspect-tooltip"
                }), null);
                var _ref$ = local.progressBarRef;
                typeof _ref$ === "function" ? use(_ref$, _el$7) : local.progressBarRef = _el$7;
                return _el$5;
              })();
            },
            get children() {
              return [createMemo(() => inspectText()), createComponent(NavHelp, {
                actionName: "toggle-tooltip",
                "class": "size-8"
              })];
            }
          }));
          return _el$4;
        }
      }));
      return _el$3;
    }
  });
};
const TooltipTriggerComponent = (props) => {
  const tooltipContext = useContext(TooltipContext);
  if (!tooltipContext) {
    throw new Error("Tooltip.Trigger must be used within a <Tooltip> root component");
  }
  const parentContext = useContext(TriggerActivationContext);
  const tooltipModel = TooltipModel.get();
  const reactiveName = createMemo(() => tooltipContext.name);
  const triggerContext = new TriggerActivationContextProvider(tooltipModel, void 0, reactiveName);
  tooltipContext.setTriggerContext(triggerContext);
  const [root, setRoot] = createSignal();
  const [needsWrapper, setNeedsWrapper] = createSignal(false);
  let tooltipDelayHandle;
  const clearTooltipDelay = () => {
    if (tooltipDelayHandle !== void 0) {
      clearTimeout(tooltipDelayHandle);
      tooltipDelayHandle = void 0;
    }
  };
  const triggerTooltipWithDelay = () => {
    clearTooltipDelay();
    const activeTooltips = tooltipModel.active();
    const delay = activeTooltips.length === 0 ? Configuration.getUser().tooltipDelay : 0;
    const triggerRoot = root();
    if (delay <= 0) {
      triggerContext?.trigger(TriggerType.Focus, triggerRoot);
      return;
    }
    tooltipDelayHandle = window.setTimeout(() => {
      tooltipDelayHandle = void 0;
      triggerContext?.trigger(TriggerType.Focus, triggerRoot);
    }, delay);
  };
  const onShowTooltip = (event) => {
    if (event instanceof MouseEvent && event.screenX === 0 && event.screenY === 0) {
      return;
    }
    const activeTooltips = tooltipModel.active();
    const top = activeTooltips.length > 0 ? activeTooltips[activeTooltips.length - 1] : null;
    if (top && tooltipModel.isLocked(top) && top !== parentContext?.name()) {
      return;
    }
    event.stopPropagation();
    triggerTooltipWithDelay();
  };
  const onShowTooltipTouch = (event) => {
    if (event.detail.name === "touch-complete" && event.detail.status === InputActionStatuses.FINISH) {
      if (!tooltipModel.touchPress()) {
        event.stopPropagation();
        tooltipModel.pop();
      }
      tooltipModel.gotTouchPress(false);
      return;
    }
    if (event.detail.name !== "touch-press" || event.detail.status !== InputActionStatuses.FINISH) {
      return;
    }
    tooltipModel.gotTouchPress(true);
    event.stopPropagation();
    const activeTooltips = tooltipModel.active();
    if (activeTooltips.length > 0 && activeTooltips[activeTooltips.length - 1] !== parentContext?.name()) {
      if (tooltipModel.locked() !== activeTooltips[activeTooltips.length - 1] && activeTooltips[activeTooltips.length - 2] === parentContext?.name()) {
        tooltipModel.pop();
      } else {
        return;
      }
    }
    triggerTooltipWithDelay();
  };
  const onMouseLeave = (_event) => {
    clearTooltipDelay();
    triggerContext?.trigger(TriggerType.Blur, root());
  };
  const onBlur = (event) => {
    event.stopPropagation();
    clearTooltipDelay();
    triggerContext?.trigger(TriggerType.Blur, root());
  };
  const resolved = children(() => props.children);
  createEffect(() => {
    const resolvedChildren = resolved();
    let element;
    if (resolvedChildren) {
      if (!Array.isArray(resolvedChildren) && resolvedChildren instanceof HTMLElement) {
        element = resolvedChildren;
      } else if (Array.isArray(resolvedChildren) && resolvedChildren.length === 1 && resolvedChildren[0] instanceof HTMLElement) {
        element = resolvedChildren[0];
      }
    }
    if (element) {
      element.addEventListener("mouseover", onShowTooltip);
      element.addEventListener("mouseleave", onMouseLeave);
      element.addEventListener("focus", onShowTooltip);
      element.addEventListener("blur", onBlur);
      element.addEventListener("engine-input", onShowTooltipTouch);
      onCleanup(() => {
        clearTooltipDelay();
        element.removeEventListener("mouseover", onShowTooltip);
        element.removeEventListener("mouseleave", onMouseLeave);
        element.removeEventListener("focus", onShowTooltip);
        element.removeEventListener("blur", onBlur);
        element.removeEventListener("engine-input", onShowTooltipTouch);
      });
      setRoot(element);
      setNeedsWrapper(false);
    } else {
      clearTooltipDelay();
      setNeedsWrapper(true);
    }
  });
  onCleanup(() => {
    clearTooltipDelay();
  });
  return createComponent(TriggerActivationContext.Provider, {
    value: triggerContext,
    get children() {
      return createComponent(Show, {
        get when() {
          return !needsWrapper();
        },
        get fallback() {
          return (() => {
            var _el$8 = _tmpl$2();
            use(setRoot, _el$8);
            spread(_el$8, mergeProps(props, {
              "on:mouseover": onShowTooltip,
              "on:mouseleave": onMouseLeave,
              "on:focus": onShowTooltip,
              "on:blur": onBlur,
              "on:engine-input": onShowTooltipTouch,
              "tabIndex": -1,
              get ["class"]() {
                return `tooltip-trigger-${tooltipContext.name}`;
              }
            }), false, true);
            insert(_el$8, resolved);
            return _el$8;
          })();
        },
        get children() {
          return resolved();
        }
      });
    }
  });
};
const AUTOLOCK_PROGRESS_ANIMATION_NAME = "tooltip-autolock-progress";
const AUTOLOCK_FRAME_ANIMATION_NAME = "tooltip-autolock-frame";
const AUTOLOCK_FRAME_GLOW_DURATION_MS = 300;
const AUTOLOCK_FRAME_GLOW_LEAD_MS = 5 / 9 * AUTOLOCK_FRAME_GLOW_DURATION_MS;
const TooltipFrameComponent = (props) => {
  const ctx = useContext(TooltipContext);
  const tooltipModel = TooltipModel.get();
  const [frameRef, setFrameRef] = createSignal(void 0);
  const [progressBarRef, setProgressBarRef] = createSignal(void 0);
  let currentProgressAnimation;
  let currentFrameAnimation;
  let frameGlowTimeout;
  const isAutoLocking = createMemo(() => ctx ? tooltipModel.isAutoLocking(ctx.name) : false);
  const startAutoLockAnimation = (element, animationName, durationMs) => {
    const animations = element.getAnimations();
    const animation = animations.find((a) => a.animationName === animationName);
    if (!animation) {
      return void 0;
    }
    element.style.animationDuration = `${durationMs}ms`;
    animation.currentTime = 0;
    animation.play();
    return animation;
  };
  const stopAutoLockAnimation = (animation) => {
    if (!animation) {
      return;
    }
    animation.pause();
    animation.currentTime = 0;
  };
  const stopAllAnimations = () => {
    stopAutoLockAnimation(currentProgressAnimation);
    stopAutoLockAnimation(currentFrameAnimation);
    currentProgressAnimation = void 0;
    currentFrameAnimation = void 0;
    if (frameGlowTimeout !== void 0) {
      clearTimeout(frameGlowTimeout);
      frameGlowTimeout = void 0;
    }
  };
  createEffect(on([isAutoLocking, progressBarRef, frameRef], ([autoLocking, progressBarRef2, frameRef2]) => {
    const autolockMs = Configuration.getUser().tooltipAutolock;
    if (autolockMs <= 100) {
      return;
    }
    if (!progressBarRef2 || !frameRef2) {
      stopAllAnimations();
      return;
    }
    if (autoLocking) {
      currentProgressAnimation = startAutoLockAnimation(progressBarRef2, AUTOLOCK_PROGRESS_ANIMATION_NAME, autolockMs);
      const glowDelayMs = Math.max(0, autolockMs - AUTOLOCK_FRAME_GLOW_LEAD_MS);
      frameGlowTimeout = window.setTimeout(() => {
        currentFrameAnimation = startAutoLockAnimation(frameRef2, AUTOLOCK_FRAME_ANIMATION_NAME, AUTOLOCK_FRAME_GLOW_DURATION_MS);
        frameGlowTimeout = void 0;
      }, glowDelayMs);
    } else {
      stopAllAnimations();
    }
  }));
  return (() => {
    var _el$9 = _tmpl$2();
    use(setFrameRef, _el$9);
    spread(_el$9, mergeProps(props, {
      get ["class"]() {
        return `img-tooltip-border img-tooltip-bg tooltip-autolock-frame p-4 min-w-48 ${props.class ?? ""}`;
      }
    }), false, true);
    insert(_el$9, createComponent(Show, {
      get when() {
        return ctx?.showFiligrees;
      },
      get children() {
        return [(() => {
          var _el$10 = _tmpl$5();
          _el$10.style.setProperty("background-image", "url(blp:mp_player_detail)");
          return _el$10;
        })(), (() => {
          var _el$11 = _tmpl$6();
          _el$11.style.setProperty("background-image", "url(blp:mp_player_detail)");
          return _el$11;
        })(), (() => {
          var _el$12 = _tmpl$7();
          _el$12.style.setProperty("background-image", "url(blp:mp_player_detail)");
          return _el$12;
        })(), (() => {
          var _el$13 = _tmpl$8();
          _el$13.style.setProperty("background-image", "url(blp:mp_player_detail)");
          return _el$13;
        })()];
      }
    }), null);
    insert(_el$9, () => props.children, null);
    insert(_el$9, createComponent(Tooltip.InspectHint, {
      "class": "relative mt-1",
      progressBarRef: setProgressBarRef
    }), null);
    return _el$9;
  })();
};
const TooltipTextComponent = (props) => {
  const [local, other] = splitProps(props, ["text", "args", "children", "header", "class", "headerClass", "bodyClass"]);
  return createComponent(Tooltip, mergeProps(other, {
    get showFiligrees() {
      return props.showFiligrees ?? false;
    },
    get children() {
      return [createComponent(Tooltip.Trigger, {
        get children() {
          return local.children;
        }
      }), createComponent(Tooltip.Content, {
        get children() {
          return createComponent(Tooltip.Frame, {
            get ["class"]() {
              return `relative flex flex-col pb-1 max-w-128 ${local.class ?? ""}`;
            },
            get children() {
              return [createComponent(Show, {
                get when() {
                  return local.header;
                },
                children: (header) => (() => {
                  var _el$15 = _tmpl$9();
                  insert(_el$15, createComponent(L10n.Compose, {
                    get text() {
                      return header();
                    }
                  }));
                  createRenderEffect(() => className(_el$15, `relative text-center font-title text-sm text-secondary mb-2 uppercase tracking-100 ${local.headerClass ?? ""}}`));
                  return _el$15;
                })()
              }), (() => {
                var _el$14 = _tmpl$2();
                insert(_el$14, createComponent(L10n.Stylize, {
                  get text() {
                    return local.text;
                  },
                  get args() {
                    return local.args;
                  },
                  "class": "relative"
                }));
                createRenderEffect(() => className(_el$14, `flex-auto p-3 img-base-ticket-bg ${local.bodyClass ?? ""}`));
                return _el$14;
              })()];
            }
          });
        }
      })];
    }
  }));
};
const Tooltip = ComponentRegistry.register("Tooltip", TooltipRootComponent);
Tooltip.Trigger = ComponentRegistry.register("Tooltip.Trigger", TooltipTriggerComponent);
Tooltip.Content = ComponentRegistry.register("Tooltip.Content", TooltipContentComponent);
Tooltip.Frame = ComponentRegistry.register("Tooltip.Frame", TooltipFrameComponent);
Tooltip.Text = ComponentRegistry.register("Tooltip.Text", TooltipTextComponent);
Tooltip.InspectHint = ComponentRegistry.register("Tooltip.InspectHint", TooltipInspectHintComponent);

export { Tooltip, TooltipContext, TooltipHorizontalPosition, TooltipNavigationRules, TooltipVerticalPosition };
//# sourceMappingURL=tooltip.js.map

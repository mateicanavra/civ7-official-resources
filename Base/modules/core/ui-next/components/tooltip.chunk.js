import { _ as createRoot, d as onCleanup, c as createSignal, a as createEffect, t as template, x as createContext, h as createMemo, e as createComponent, J as createPropsRefSignal, y as useContext, R as createLayoutComplete, $ as Portal, S as Show, u as use, k as spread, m as mergeProps, i as insert, f as createRenderEffect, T as children, C as ComponentRegistry } from './panel.chunk.js';
import { a as TriggerType, L as L10n, b as TriggerActivationContext, c as TriggerActivationContextProvider } from './l10n.chunk.js';

var ModelLifecycle = /* @__PURE__ */ ((ModelLifecycle2) => {
  ModelLifecycle2[ModelLifecycle2["Singleton"] = 0] = "Singleton";
  ModelLifecycle2[ModelLifecycle2["SharedInstance"] = 1] = "SharedInstance";
  ModelLifecycle2[ModelLifecycle2["PerInstance"] = 2] = "PerInstance";
  return ModelLifecycle2;
})(ModelLifecycle || {});
class ModelRegistryImpl {
  modelFactories = /* @__PURE__ */ new Map();
  rootDisposeFn;
  isInitialized = false;
  constructor() {
    engine.whenReady.then(() => {
      createRoot((dispose) => {
        this.rootDisposeFn = dispose;
        for (const modelFactory of this.modelFactories.values()) {
          this.resolveModel(modelFactory);
        }
        this.isInitialized = true;
      });
    });
  }
  /**
   * Registers a model with the model registry.
   * Models can be overriden (for example, by mods) by setting a higher priority in options
   * See {@link ModelRegistryImpl} for more info
   * ```ts
   * export const ExampleModel = ModelRegistry.register("ExampleModel", ModelLifecycle.PerInstance, createExampleModel), overridePriority: 0);
   * ```
   * @param name The name of the model - only used for registration and overrides
   * @param lifecycle Is the model a singleton or is it a per instance model?
   * @param factory The model factory function
   * @param overridePriority The model registered with the highest override priority will be used. Default: 0
   *
   * @returns The registered overridable component
   */
  register(name, lifecycle, factory, overridePriority) {
    let modelFactory = this.modelFactories.get(name);
    overridePriority ??= 0;
    if (modelFactory) {
      if (modelFactory.overridePriority < overridePriority) {
        modelFactory.overridePriority = overridePriority;
        modelFactory = this.updateModel(modelFactory, name, lifecycle, factory);
      }
    } else {
      const partialFactory = {
        name,
        overridePriority
      };
      modelFactory = this.updateModel(partialFactory, name, lifecycle, factory);
      this.modelFactories.set(name, modelFactory);
    }
    return modelFactory;
  }
  /**
   * Gets a registered model from the model registry.
   * Will return a model that points the model factory with the highest override priority.
   * @param name The name of the model to get
   * @returns The registered model or undefined if no registration was not found
   */
  get(name) {
    return this.modelFactories.get(name);
  }
  /**
   * Cleans up the model registry solid root
   */
  destroy() {
    this.rootDisposeFn?.();
    this.modelFactories.clear();
  }
  updateModel(modelFactory, name, lifecycle, factory) {
    modelFactory.lifecycle = lifecycle;
    modelFactory.instance = void 0;
    modelFactory.factory = factory;
    modelFactory.get = () => {
      throw new Error(`Model Registry - Unable to resolve model "${name}" before engine ready!`);
    };
    if (this.isInitialized) {
      this.resolveModel(modelFactory);
    }
    return modelFactory;
  }
  resolveModel(model) {
    switch (model.lifecycle) {
      case 2 /* PerInstance */:
        model.get = model.factory;
        break;
      case 0 /* Singleton */:
        model.instance = model.factory?.();
        model.get = () => model.instance;
        break;
      case 1 /* SharedInstance */:
        model.refCount = 0;
        model.get = () => {
          if (model.instance == void 0) {
            model.instance = model.factory?.();
          }
          model.refCount++;
          onCleanup(() => {
            model.refCount--;
            if (model.refCount <= 0) {
              model.instance = void 0;
              model.refCount = 0;
            }
          });
          return model.instance;
        };
        break;
    }
  }
}
const ModelRegistry = new ModelRegistryImpl();

function createTooltipModel() {
  const [target, setTarget] = createSignal();
  const [active, setActive] = createSignal([]);
  const [locked, setLocked] = createSignal();
  const tooltipRoot = document.getElementById("tooltip-root");
  const unlock = () => {
    console.log(`Unlocking tooltip: ${locked()}`);
    setLocked(void 0);
    setActive([]);
    setTarget(void 0);
  };
  const inputActionHandler = (name, status) => {
    if (name === "keyboard-inspect-tooltip" && status === InputActionStatuses.FINISH) {
      const currentActive = active();
      const currentTarget = target();
      const isCurrentActiveLocked = isLocked(currentActive[currentActive.length - 1]);
      if (currentActive.length > 0 && currentTarget && !isCurrentActiveLocked) {
        setLocked(currentActive[currentActive.length - 1]);
        console.log(`Locked tooltip: ${currentActive}`);
      }
    }
    if (name === "cancel" && status === InputActionStatuses.FINISH && locked()) {
      unlock();
    }
  };
  const onDocumentClick = (event) => {
    if (locked()) {
      if (tooltipRoot && !tooltipRoot.contains(event.target)) {
        unlock();
      }
    }
  };
  createEffect(() => {
    engine.on("InputAction", inputActionHandler);
    document.addEventListener("click", onDocumentClick);
    onCleanup(() => {
      engine.off("InputAction", inputActionHandler);
      document.removeEventListener("click", onDocumentClick);
    });
  });
  const isLocked = (name) => {
    if (name === void 0) {
      return false;
    }
    const currentLocked = locked();
    const activeTooltips = active();
    const isCurrentlyLocked = currentLocked === name;
    const activeIndex = activeTooltips.indexOf(name);
    const isInActiveButNotTop = activeIndex !== -1 && activeIndex !== activeTooltips.length - 1;
    return isCurrentlyLocked || isInActiveButNotTop;
  };
  return {
    active,
    target,
    locked,
    unlock,
    isActive: (name) => {
      if (name === void 0) {
        return false;
      }
      return active().includes(name);
    },
    isLocked,
    onTrigger: (name, type, triggerTarget) => {
      if (isLocked(name)) {
        return;
      }
      if (type === TriggerType.Focus) {
        const shouldNest = active().length > 0 && isLocked(active()[active().length - 1]);
        if (!shouldNest) {
          setActive([name]);
        } else {
          setActive((current) => [...current, name]);
        }
        setTarget(triggerTarget ?? void 0);
      } else if (type === TriggerType.Blur) {
        setTarget(void 0);
        setActive((current) => current.filter((n) => n !== name));
      }
    }
  };
}
const TooltipModel = ModelRegistry.register("TooltipModel", ModelLifecycle.Singleton, createTooltipModel);

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="flex flex-row items-center justify-center my-2"><div class="flex items-center justify-center size-6 border"><span class=leading-none>K</span></div></div>`);
var TooltipVerticalPosition = /* @__PURE__ */ ((TooltipVerticalPosition2) => {
  TooltipVerticalPosition2[TooltipVerticalPosition2["AUTO"] = 0] = "AUTO";
  TooltipVerticalPosition2[TooltipVerticalPosition2["TOP"] = 1] = "TOP";
  TooltipVerticalPosition2[TooltipVerticalPosition2["CENTER"] = 2] = "CENTER";
  TooltipVerticalPosition2[TooltipVerticalPosition2["BOTTOM"] = 3] = "BOTTOM";
  return TooltipVerticalPosition2;
})(TooltipVerticalPosition || {});
var TooltipHorizontalPosition = /* @__PURE__ */ ((TooltipHorizontalPosition2) => {
  TooltipHorizontalPosition2[TooltipHorizontalPosition2["AUTO"] = 0] = "AUTO";
  TooltipHorizontalPosition2[TooltipHorizontalPosition2["LEFT_COVER"] = 1] = "LEFT_COVER";
  TooltipHorizontalPosition2[TooltipHorizontalPosition2["LEFT"] = 2] = "LEFT";
  TooltipHorizontalPosition2[TooltipHorizontalPosition2["CENTER"] = 3] = "CENTER";
  TooltipHorizontalPosition2[TooltipHorizontalPosition2["RIGHT_COVER"] = 4] = "RIGHT_COVER";
  TooltipHorizontalPosition2[TooltipHorizontalPosition2["RIGHT"] = 5] = "RIGHT";
  return TooltipHorizontalPosition2;
})(TooltipHorizontalPosition || {});
function inPx(value) {
  return value === void 0 ? void 0 : `${value}px`;
}
const TooltipContext = createContext();
let curTooltip = 0;
const TooltipRootComponent = (props) => {
  const name = createMemo(() => `tooltip-${curTooltip++}`);
  return createComponent(TooltipContext.Provider, {
    get value() {
      return {
        name: name(),
        offset: props.offset,
        vPosition: props.vPosition,
        hPosition: props.hPosition
      };
    },
    get children() {
      return props.children;
    }
  });
};
const TooltipContentComponent = (props) => {
  const tooltipModel = TooltipModel.get();
  const tooltipRoot = document.getElementById("uinext-tooltips") ?? document.body;
  const [root, setRoot] = createPropsRefSignal(() => props.ref);
  const ctx = useContext(TooltipContext);
  if (!ctx) {
    throw new Error("Tooltip.Content must be used within a <Tooltip> root component");
  }
  const [top, setTop] = createSignal();
  const [left, setLeft] = createSignal();
  const [isCalculatingPosition, setIsCalculatingPosition] = createSignal(true);
  const [didCalculatePosition, setDidCalculatePosition] = createSignal(false);
  const isLayoutComplete = createLayoutComplete();
  const shouldShow = createMemo(() => {
    const isLocked = tooltipModel.locked() === ctx.name;
    const isActive = tooltipModel.isActive(ctx.name);
    return isLocked || isActive;
  });
  createEffect(() => {
    const target = tooltipModel.target();
    const tooltip = root();
    if (!target || !tooltip || !isLayoutComplete() || !shouldShow()) {
      return;
    }
    const offset = ctx.offset ?? 0;
    setIsCalculatingPosition(true);
    waitForLayout(() => {
      if (!shouldShow()) {
        setIsCalculatingPosition(false);
        return;
      }
      if (tooltipModel.isLocked(ctx.name)) {
        setIsCalculatingPosition(false);
        return;
      }
      const targetRect = target.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const screenHeight = window.innerHeight;
      const screenWidth = window.innerWidth;
      const targetCenterX = targetRect.x + targetRect.width / 2;
      const targetCenterY = targetRect.y + targetRect.height / 2;
      const tooltipLocalCenterX = tooltipRect.width / 2;
      let calcVPos = ctx.vPosition ?? 0 /* AUTO */;
      let calcHPos = ctx.hPosition ?? 0 /* AUTO */;
      let calcTop = 0;
      let calcLeft = 0;
      if (calcVPos == 0 /* AUTO */) {
        calcVPos = targetCenterY <= screenHeight / 2 ? 3 /* BOTTOM */ : 1 /* TOP */;
      }
      if (calcHPos == 0 /* AUTO */) {
        const thirdWidth = screenWidth / 3;
        if (targetCenterX < thirdWidth) {
          calcHPos = calcVPos == 2 /* CENTER */ ? 5 /* RIGHT */ : 4 /* RIGHT_COVER */;
        } else if (targetCenterX < thirdWidth + thirdWidth) {
          if (calcVPos == 2 /* CENTER */) {
            calcHPos = targetCenterY > screenWidth / 2 ? 5 /* RIGHT */ : 2 /* LEFT */;
          } else {
            calcHPos = 3 /* CENTER */;
          }
        } else {
          calcHPos = calcVPos == 2 /* CENTER */ ? 2 /* LEFT */ : 1 /* LEFT_COVER */;
        }
      }
      switch (calcVPos) {
        case 1 /* TOP */:
          calcTop = targetRect.top - tooltipRect.height - offset;
          break;
        case 3 /* BOTTOM */:
          calcTop = targetRect.bottom + offset;
          break;
        case 2 /* CENTER */:
          calcTop = targetCenterY - tooltipRect.height / 2;
          break;
        default:
          calcVPos;
      }
      switch (calcHPos) {
        case 3 /* CENTER */:
          calcLeft = targetCenterX - tooltipLocalCenterX;
          break;
        case 1 /* LEFT_COVER */:
          calcLeft = targetRect.right - tooltipRect.width - offset;
          break;
        case 2 /* LEFT */:
          calcLeft = targetRect.left - tooltipRect.width - offset;
          break;
        case 5 /* RIGHT */:
          calcLeft = targetRect.right + offset;
          break;
        case 4 /* RIGHT_COVER */:
          calcLeft = targetRect.left + offset;
          break;
        default:
          calcHPos;
      }
      calcTop = Math.min(Math.max(0, calcTop), screenHeight - tooltipRect.height);
      calcLeft = Math.min(Math.max(0, calcLeft), screenWidth - tooltipRect.width);
      setTop(calcTop);
      setLeft(calcLeft);
      setIsCalculatingPosition(false);
      setDidCalculatePosition(true);
    });
  });
  return createComponent(Portal, {
    mount: tooltipRoot,
    get children() {
      return createComponent(Show, {
        get when() {
          return shouldShow();
        },
        get children() {
          var _el$ = _tmpl$();
          use(setRoot, _el$);
          spread(_el$, mergeProps(props, {
            get ["class"]() {
              return `absolute visible ${tooltipModel.locked() === ctx.name ? "pointer-events-auto" : "pointer-events-none"} ${props.class ?? ""}`;
            },
            get classList() {
              return {
                "opacity-0": isCalculatingPosition() && !didCalculatePosition()
              };
            },
            get style() {
              return {
                top: inPx(top()),
                left: inPx(left())
              };
            }
          }), false, true);
          insert(_el$, () => props.children);
          return _el$;
        }
      });
    }
  });
};
const TooltipInspectHintComponent = () => {
  const tooltipModel = TooltipModel.get();
  const ctx = useContext(TooltipContext);
  if (!ctx) {
    throw new Error("Tooltip.InspectHint must be used within a <Tooltip> root component");
  }
  const isLocked = () => {
    return tooltipModel.isLocked(ctx.name);
  };
  return (() => {
    var _el$2 = _tmpl$2(), _el$3 = _el$2.firstChild;
    insert(_el$2, createComponent(L10n.Stylize, {
      text: "LOC_UI_INSPECT_TOOLTIP",
      "class": "text-sm font-body uppercase mr-2",
      get classList() {
        return {
          "text-white": isLocked(),
          "text-accent-4": !isLocked()
        };
      },
      style: {
        "letter-spacing": "-0.5px"
      }
    }), _el$3);
    _el$3.style.setProperty("border-radius", "7px");
    createRenderEffect((_p$) => {
      var _v$ = !!isLocked(), _v$2 = !!isLocked(), _v$3 = !isLocked(), _v$4 = !isLocked(), _v$5 = isLocked() ? "rgba(0, 0, 0, 0.58)" : "rgba(255, 255, 255, 0.4)";
      _v$ !== _p$.e && _el$3.classList.toggle("bg-white", _p$.e = _v$);
      _v$2 !== _p$.t && _el$3.classList.toggle("text-black", _p$.t = _v$2);
      _v$3 !== _p$.a && _el$3.classList.toggle("bg-black", _p$.a = _v$3);
      _v$4 !== _p$.o && _el$3.classList.toggle("text-accent-2", _p$.o = _v$4);
      _v$5 !== _p$.i && ((_p$.i = _v$5) != null ? _el$3.style.setProperty("border-color", _v$5) : _el$3.style.removeProperty("border-color"));
      return _p$;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0,
      i: void 0
    });
    return _el$2;
  })();
};
const TooltipTriggerComponent = (props) => {
  const tooltipContext = useContext(TooltipContext);
  if (!tooltipContext) {
    throw new Error("Tooltip.Trigger must be used within a <Tooltip> root component");
  }
  const parentContext = useContext(TriggerActivationContext);
  const tooltipModel = TooltipModel.get();
  const reactiveName = createMemo(() => tooltipContext.name);
  const triggerContext = new TriggerActivationContextProvider(tooltipModel, parentContext, reactiveName);
  if (!tooltipContext) {
    throw new Error("Tooltip.Trigger must be used within a <Tooltip> root component");
  }
  const [root, setRoot] = createSignal();
  const [needsWrapper, setNeedsWrapper] = createSignal(false);
  const onMouseOver = (event) => {
    event.stopPropagation();
    triggerContext?.trigger(TriggerType.Focus, root());
  };
  const onMouseLeave = (_event) => {
    triggerContext?.trigger(TriggerType.Blur, root());
  };
  const onFocus = (event) => {
    event.stopPropagation();
    triggerContext?.trigger(TriggerType.Focus, root());
  };
  const onBlur = (event) => {
    event.stopPropagation();
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
      element.addEventListener("mouseover", onMouseOver);
      element.addEventListener("mouseleave", onMouseLeave);
      element.addEventListener("focus", onFocus);
      element.addEventListener("blur", onBlur);
      onCleanup(() => {
        element.removeEventListener("mouseover", onMouseOver);
        element.removeEventListener("mouseleave", onMouseLeave);
        element.removeEventListener("focus", onFocus);
        element.removeEventListener("blur", onBlur);
      });
      setRoot(element);
      setNeedsWrapper(false);
    } else {
      setNeedsWrapper(true);
    }
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
            var _el$4 = _tmpl$();
            use(setRoot, _el$4);
            spread(_el$4, mergeProps(props, {
              "on:mouseover": onMouseOver,
              "on:mouseleave": onMouseLeave,
              "on:focus": onFocus,
              "on:blur": onBlur,
              "tabIndex": -1
            }), false, true);
            insert(_el$4, resolved);
            return _el$4;
          })();
        },
        get children() {
          return resolved();
        }
      });
    }
  });
};
const TooltipFrameComponent = (props) => {
  return (() => {
    var _el$5 = _tmpl$();
    spread(_el$5, mergeProps(props, {
      get ["class"]() {
        return `img-tooltip-border img-tooltip-bg p-2 w-96 ${props.class ?? ""}`;
      }
    }), false, true);
    insert(_el$5, () => props.children);
    return _el$5;
  })();
};
const TooltipTextComponent = (props) => {
  return createComponent(Tooltip, {
    get offset() {
      return props.offset ?? 4;
    },
    get vPosition() {
      return props.vPosition;
    },
    get hPosition() {
      return props.hPosition;
    },
    get children() {
      return [createComponent(Tooltip.Trigger, {
        get children() {
          return props.children;
        }
      }), createComponent(Tooltip.Content, {
        get children() {
          return createComponent(Tooltip.Frame, {
            get children() {
              return createComponent(L10n.Stylize, {
                get text() {
                  return props.text;
                },
                get args() {
                  return props.args;
                }
              });
            }
          });
        }
      })];
    }
  });
};
const Tooltip = ComponentRegistry.register("Tooltip", TooltipRootComponent);
Tooltip.Trigger = ComponentRegistry.register("Tooltip.Trigger", TooltipTriggerComponent);
Tooltip.Content = ComponentRegistry.register("Tooltip.Content", TooltipContentComponent);
Tooltip.Frame = ComponentRegistry.register("Tooltip.Frame", TooltipFrameComponent);
Tooltip.Text = ComponentRegistry.register("Tooltip.Text", TooltipTextComponent);
Tooltip.InspectHint = ComponentRegistry.register("Tooltip.InspectHint", TooltipInspectHintComponent);

export { ModelRegistry as M, Tooltip as T, ModelLifecycle as a };
//# sourceMappingURL=tooltip.chunk.js.map

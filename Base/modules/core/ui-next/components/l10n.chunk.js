import { x as createContext, y as useContext, h as createMemo, e as createComponent, D as createResource, a as createEffect, t as template, E as isFocusable, G as registerHotkey, H as registerNavTray, J as createPropsRefSignal, c as createSignal, o as onMount, d as onCleanup, u as use, k as spread, m as mergeProps, i as insert, K as HotkeyIconContext, C as ComponentRegistry, f as createRenderEffect, I as IsControllerActive, L as ActionButtonMap, p as createArraySignal, N as createSelector, O as Dynamic, Q as FocusContext, R as createLayoutComplete, S as Show, F as For } from './panel.chunk.js';
import { b as InputEngineEventName } from '../../ui/input/input-support.chunk.js';
import { Icon as Icon$1 } from '../../ui/utilities/utilities-image.chunk.js';

var TriggerType = /* @__PURE__ */ ((TriggerType2) => {
  TriggerType2[TriggerType2["Activate"] = 0] = "Activate";
  TriggerType2[TriggerType2["Focus"] = 1] = "Focus";
  TriggerType2[TriggerType2["Blur"] = 2] = "Blur";
  return TriggerType2;
})(TriggerType || {});
class TriggerActivationContextProvider {
  constructor(host, parent, name) {
    this.host = host;
    this.parent = parent;
    this.name = name;
  }
  trigger(type, element) {
    this.host?.onTrigger(this.name(), type, element);
    this.parent?.trigger(type, element);
  }
}
const TriggerActivationContext = createContext();
function createTrigger(context) {
  const triggerComponent = (props) => {
    const hostContext = useContext(context);
    const parentContext = useContext(TriggerActivationContext);
    const reactiveName = createMemo(() => props.name);
    const triggerContextProvider = new TriggerActivationContextProvider(hostContext, parentContext, reactiveName);
    return createComponent(TriggerActivationContext.Provider, {
      value: triggerContextProvider,
      get children() {
        return props.children;
      }
    });
  };
  return triggerComponent;
}

function asyncLoad(url) {
  const request = new XMLHttpRequest();
  const promise = new Promise(function(resolve, reject) {
    request.onload = () => {
      if (request.status == 0 || request.status == 200) {
        resolve(request.responseText);
      } else {
        reject(`${url} - ${request.statusText}`);
      }
    };
    request.onerror = () => reject(`${url} - ${request.statusText}`);
    request.onabort = () => reject(`${url} - Aborted`);
  });
  request.open("GET", url);
  request.send();
  return promise;
}
function createJsonResource(filename) {
  return createResource(async () => {
    const response = await asyncLoad(filename);
    return JSON.parse(response);
  });
}

const audioBase = "fs://game/core/ui/audio-base/audio-base.json";

const [audioData] = createJsonResource(audioBase);
createEffect(() => {
  if (audioData.error) {
    console.error("Error loading audio-base.json", audioData.error);
  }
});
function playSound(id, group) {
  if (audioData.loading || audioData.error) {
    return false;
  }
  const data = audioData();
  if (id.length == 0 || id == "none" || !data) {
    return false;
  }
  const soundTag = group ? data[group]?.[id] ?? data["audio-base"][id] : data["audio-base"][id];
  if (soundTag) {
    UI.sendAudioEvent(soundTag);
    return true;
  } else {
    console.error(`No sound tag found for ${id} with group ${group}`);
  }
  return false;
}
class AudioGroupProvider {
  constructor(groupName, parent) {
    this.groupName = groupName;
    this.parent = parent;
  }
  /**
   * Plays a sound for the given audio group context.
   * If the sound is overridden on the element, play it directly.
   * Otherwise, look it up in the audio data and play that.
   * If the sound is still unable to be played, try again in the parent context.
   * @param id The sound id to play
   * @param element the element playing the sound
   */
  playSound(id, element) {
    const resolvedId = element?.getAttribute(`${id}-ref`) ?? id;
    const resolvedGroup = element?.getAttribute("data-audio-group-ref") ?? this.groupName;
    if (!playSound(resolvedId, resolvedGroup)) {
      this.parent?.playSound(resolvedId, element);
    }
  }
}
const AudioGroupContext = createContext(() => new AudioGroupProvider("audio-base"));

var _tmpl$$5 = /* @__PURE__ */ template(`<div></div>`);
const PROTECTED_IMPORTS = [isFocusable, registerHotkey, registerNavTray];
const FEEDBACK_LOW = 20;
const FEEDBACK_HIGH = 20;
const FEEDBACK_DURATION = 100;
const EMPTY_ACTIVATABLE_AUDIO = {
  group: "",
  onActivate: "",
  onPress: "",
  onError: "",
  onFocus: ""
};
const ActivatableComponent = (props) => {
  const audioContext = useContext(AudioGroupContext);
  const triggerContext = useContext(TriggerActivationContext);
  const hotkeyIconProvider = createMemo(() => props.hotkeyAction ?? "accept");
  const [root, setRoot] = createPropsRefSignal(() => props.ref);
  const [isPressed, setIsPressed] = createSignal(false);
  const onMouseEnter = () => {
    audioContext().playSound("data-audio-focus", root());
  };
  const onFocus = () => {
    if (props.isFeedbackEnabled) {
      Input.triggerForceFeedback(FEEDBACK_LOW, FEEDBACK_HIGH, FEEDBACK_DURATION);
    }
  };
  const onTouchComplete = (inputEvent) => {
    if (inputEvent.detail.name == "touch-complete") {
      setIsPressed(false);
    }
  };
  onMount(() => {
    window.addEventListener(InputEngineEventName, onTouchComplete, true);
  });
  onCleanup(() => {
    window.removeEventListener(InputEngineEventName, onTouchComplete, true);
  });
  const onEngineInput = (inputEvent) => {
    const isStart = inputEvent.detail.status == InputActionStatuses.START;
    const isFinish = inputEvent.detail.status == InputActionStatuses.FINISH;
    if (!isStart && !isFinish) {
      return;
    }
    if (inputEvent.detail.name == "touch-touch") {
      setIsPressed(true);
      if (props.disabled) {
        audioContext().playSound("data-audio-error-press", root());
      } else {
        audioContext().playSound("data-audio-press", root());
      }
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
      return;
    }
    if (inputEvent.detail.name == "mousebutton-left" || inputEvent.detail.name == "accept" || inputEvent.detail.name == "touch-tap" || inputEvent.detail.name == "keyboard-enter") {
      if (props.disabled) {
        if (isStart) {
          audioContext().playSound("data-audio-error-press", root());
        }
      } else {
        if (isStart) {
          audioContext().playSound("data-audio-press", root());
        } else {
          audioContext().playSound("data-audio-activate", root());
          props.onActivate?.();
          triggerContext?.trigger(TriggerType.Activate, root());
          inputEvent.preventDefault();
          inputEvent.stopPropagation();
        }
      }
    }
  };
  return (() => {
    var _el$ = _tmpl$$5();
    use(registerNavTray, _el$, () => [props.hotkeyAction, props.disabled != true, props.navTrayText]);
    use(registerHotkey, _el$, () => [props.hotkeyAction, props.disabled != true, props.onActivate]);
    use(isFocusable, _el$, () => !props.disabled && !props.disableFocus);
    use(setRoot, _el$);
    spread(_el$, mergeProps(props, {
      get role() {
        return props.role ?? "button";
      },
      get ["class"]() {
        return `pointer-events-auto ${props.class ?? ""}`;
      },
      get classList() {
        return {
          ...props.classList,
          disabled: props.disabled,
          "cursor-not-allowed": props.disabled,
          "cursor-pointer": !props.disabled,
          pressed: isPressed()
        };
      },
      get tabIndex() {
        return props.tabIndex ?? -1;
      },
      get ["data-audio-group-ref"]() {
        return props.audio?.group;
      },
      get ["data-audio-press-ref"]() {
        return props.audio?.onPress;
      },
      get ["data-audio-activate-ref"]() {
        return props.audio?.onActivate;
      },
      get ["data-audio-error-press-ref"]() {
        return props.audio?.onError;
      },
      get ["data-audio-focus-ref"]() {
        return props.audio?.onFocus;
      },
      get ["data-name"]() {
        return props.name ?? "Activatable";
      },
      "data-activatable": "true",
      "on:focus": onFocus,
      "onMouseEnter": onMouseEnter,
      "on:engine-input": onEngineInput
    }), false, true);
    insert(_el$, createComponent(HotkeyIconContext.Provider, {
      value: hotkeyIconProvider,
      get children() {
        return props.children;
      }
    }));
    return _el$;
  })();
};
const Activatable = ComponentRegistry.register("Activatable", ActivatableComponent);

const ViewExperience = createMemo(() => UI.getViewExperience());

var _tmpl$$4 = /* @__PURE__ */ template(`<div class="img-radio-button cursor-pointer pointer-events-auto relative flex justify-center items-center"><div></div><div class="absolute inset-0 opacity-0 group-hover\\:opacity-100 group-focus\\:opacity-100 group-pressed\\:opacity-100 transition-opacity"></div></div>`), _tmpl$2$1 = /* @__PURE__ */ template(`<div class="flex flex-row justify-center items-center"></div>`);
const RadioButtonComponent = (props) => {
  props.audio ??= {};
  props.audio.group = "radio-button";
  const isLarge = createMemo(() => props.isLarge || ViewExperience() == UIViewExperience.Mobile);
  return createComponent(Activatable, mergeProps(props, {
    get ["class"]() {
      return `flex flex-row group justify-center items-center ${props.class ?? ""}`;
    },
    name: "RadioButton",
    get children() {
      return [(() => {
        var _el$ = _tmpl$$4(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling;
        createRenderEffect((_p$) => {
          var _v$ = !isLarge(), _v$2 = !!isLarge(), _v$3 = !isLarge(), _v$4 = !!isLarge(), _v$5 = !props.isChecked, _v$6 = !props.isChecked, _v$7 = !!props.isChecked;
          _v$ !== _p$.e && _el$.classList.toggle("size-8", _p$.e = _v$);
          _v$2 !== _p$.t && _el$.classList.toggle("size-10", _p$.t = _v$2);
          _v$3 !== _p$.a && _el$2.classList.toggle("img-radio-button-ball", _p$.a = _v$3);
          _v$4 !== _p$.o && _el$2.classList.toggle("img-radio-button-ball-lg", _p$.o = _v$4);
          _v$5 !== _p$.i && _el$2.classList.toggle("opacity-0", _p$.i = _v$5);
          _v$6 !== _p$.n && _el$3.classList.toggle("img-radio-button-focus", _p$.n = _v$6);
          _v$7 !== _p$.s && _el$3.classList.toggle("img-radio-button-on-focus", _p$.s = _v$7);
          return _p$;
        }, {
          e: void 0,
          t: void 0,
          a: void 0,
          o: void 0,
          i: void 0,
          n: void 0,
          s: void 0
        });
        return _el$;
      })(), (() => {
        var _el$4 = _tmpl$2$1();
        insert(_el$4, () => props.children);
        return _el$4;
      })()];
    }
  }));
};
const RadioButton = ComponentRegistry.register({
  name: "RadioButton",
  createInstance: RadioButtonComponent,
  images: ["blp:base_radio-bg.png", "blp:base_radio-ball.png", "blp:base_radio-ball.png", "blp:base_radio-bg-focus.png", "blp:base_radio-bg-on-focus.png"]
});

var _tmpl$$3 = /* @__PURE__ */ template(`<div class="absolute inset-0 img-arrow-disabled transition-opacity"></div>`);
const ArrowButtonComponent = (props) => {
  props.audio ??= {};
  props.audio.group ??= "audio-pager";
  const isHidden = createMemo(() => props.hideForController && IsControllerActive());
  return createComponent(Activatable, mergeProps(props, {
    get ["class"]() {
      return `img-arrow-hover relative ${props.class ?? ""}`;
    },
    get classList() {
      return {
        "-scale-x-100": props.right,
        hidden: isHidden()
      };
    },
    name: "ArrowButton",
    get children() {
      var _el$ = _tmpl$$3();
      createRenderEffect((_p$) => {
        var _v$ = !props.disabled, _v$2 = !!props.disabled, _v$3 = !!props.right;
        _v$ !== _p$.e && _el$.classList.toggle("opacity-0", _p$.e = _v$);
        _v$2 !== _p$.t && _el$.classList.toggle("opacity-1", _p$.t = _v$2);
        _v$3 !== _p$.a && _el$.classList.toggle("-scale-x-100", _p$.a = _v$3);
        return _p$;
      }, {
        e: void 0,
        t: void 0,
        a: void 0
      });
      return _el$;
    }
  }));
};
const ArrowButton = ComponentRegistry.register({
  name: "ArrowButton",
  createInstance: ArrowButtonComponent,
  images: ["blp:base_component-arrow.png", "blp:base_component-arrow_dis.png"]
});

var _tmpl$$2 = /* @__PURE__ */ template(`<div></div>`);
const IconComponent = (props) => {
  const iconUrl = createMemo(() => {
    if (!props.name) {
      return void 0;
    }
    return (props.isUrl ? props.name : UI.getIconCSS(props.name, props.context)) || props.name;
  });
  return (() => {
    var _el$ = _tmpl$$2();
    spread(_el$, mergeProps(props, {
      get ["class"]() {
        return `bg-center bg-contain bg-no-repeat ${props.class}`;
      },
      get style() {
        return {
          "background-image": iconUrl()
        };
      },
      "data-name": "Icon"
    }), false, true);
    insert(_el$, () => props.children);
    return _el$;
  })();
};
const Icon = ComponentRegistry.register("Icon", IconComponent);

const NavHelpComponent = (props) => {
  const iconContext = useContext(HotkeyIconContext);
  const iconCssUrl = createMemo(() => {
    const actionName = props.actionName ?? iconContext?.();
    if (!actionName) {
      return void 0;
    }
    const gamepadActionName = IsControllerActive() ? ActionButtonMap.get(actionName.toLowerCase()) ?? actionName : actionName;
    const iconUrl = Icon$1.getIconFromActionName(gamepadActionName) ?? void 0;
    return iconUrl ? `url(${iconUrl})` : void 0;
  });
  return createComponent(Icon, {
    get ["class"]() {
      return `size-8 ${props.class ?? ""} ${!IsControllerActive() || props.disabled ? "hidden" : ""}`;
    },
    get name() {
      return iconCssUrl();
    },
    isUrl: true,
    "data-name": "NavHelp"
  });
};
const NavHelp = ComponentRegistry.register("NavHelp", NavHelpComponent);

var _tmpl$$1 = /* @__PURE__ */ template(`<div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div><div class="absolute inset-0 img-tab-bar"></div><div class="absolute -left-1 img-tab-end-cap pointer-events-none left-border"></div><div class="absolute -right-1 rotate-y-180 img-tab-end-cap pointer-events-none right-border"></div><div class="absolute bottom-0 left-0 img-tab-selection-indicator bg-no-repeat bg-center min-h-6 bg-contain transition-left duration-150"></div></div>`);
class TabContextProvider {
  _active;
  _setActive;
  _tabs;
  _mutateTabs;
  _isActive;
  defaultTab;
  get active() {
    return this._active;
  }
  get tabs() {
    return this._tabs;
  }
  get isActive() {
    return this._isActive;
  }
  constructor() {
    const [active, setActive] = createSignal();
    this._active = active;
    this._setActive = setActive;
    const [tabs, mutateTabs] = createArraySignal();
    this._tabs = tabs;
    this._mutateTabs = mutateTabs;
    this._isActive = createSelector(() => this._active()?.name);
  }
  onTrigger(name, type) {
    if (type == TriggerType.Activate) {
      this.activate(name);
    }
  }
  register(tab) {
    const foundTabIndex = this._tabs().findIndex((t) => t.name == tab.name);
    if (foundTabIndex >= 0) {
      this._mutateTabs((tabs) => tabs[foundTabIndex] = tab);
    } else {
      this._mutateTabs((tabs) => tabs.push(tab));
    }
    if (!this._active() && (!this.defaultTab || tab.name == this.defaultTab)) {
      this._setActive(tab);
    }
  }
  unregister(tabName) {
    const foundTabIndex = this._tabs().findIndex((t) => t.name == tabName);
    if (foundTabIndex >= 0) {
      this._mutateTabs((tabs) => tabs.splice(foundTabIndex, 1));
    }
  }
  activate(tabName) {
    const tab = this._tabs().find((t) => t.name == tabName);
    if (tab) {
      this._setActive(tab);
    }
  }
  activateNext() {
    const active = this._active();
    if (active) {
      let activeIndex = this._tabs().indexOf(active) + 1;
      if (activeIndex >= this._tabs().length) {
        activeIndex = 0;
      }
      this._setActive(this._tabs()[activeIndex]);
    }
  }
  activatePrevious() {
    const active = this._active();
    if (active) {
      let activeIndex = this._tabs().indexOf(active) - 1;
      if (activeIndex < 0) {
        activeIndex = this._tabs().length - 1;
      }
      this._setActive(this._tabs()[activeIndex]);
    }
  }
  setDefaultTab(tabName) {
    this.activate(tabName);
    this.defaultTab = tabName;
  }
}
const TabContext = createContext();
function useTabContext() {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error("useTabContext - Unable to get tab context");
  }
  return context;
}
const TabComponent = (props) => {
  const contextProvider = new TabContextProvider();
  createEffect(() => {
    props.onTabChanged?.(contextProvider.active());
  });
  createEffect(() => {
    if (props.defaultTab) {
      contextProvider.setDefaultTab(props.defaultTab);
    }
  });
  return (() => {
    var _el$ = _tmpl$$1();
    var _ref$ = props.ref;
    typeof _ref$ === "function" ? use(_ref$, _el$) : props.ref = _el$;
    spread(_el$, mergeProps(props, {
      get ["class"]() {
        return props.class ?? "flex flex-row";
      },
      "data-name": "Tab"
    }), false, true);
    insert(_el$, createComponent(TabContext.Provider, {
      value: contextProvider,
      get children() {
        return props.children;
      }
    }));
    return _el$;
  })();
};
const TabOutputComponent = (props) => {
  const tabContext = useContext(TabContext);
  return createComponent(Dynamic, {
    ref(r$) {
      var _ref$2 = props.ref;
      typeof _ref$2 === "function" ? _ref$2(r$) : props.ref = r$;
    },
    get component() {
      return tabContext?.active()?.body;
    }
  });
};
const TabTitleComponent = () => {
  const tabContext = useContext(TabContext);
  return createComponent(Dynamic, {
    get component() {
      return tabContext?.active()?.title;
    }
  });
};
const TabItemComponent = (props) => {
  const tabContext = useContext(TabContext);
  onMount(() => tabContext?.register(props));
  onCleanup(() => tabContext?.unregister(props.name));
  return null;
};
const TabListItem = (props) => {
  return createComponent(Activatable, {
    ref(r$) {
      var _ref$3 = props.ref;
      typeof _ref$3 === "function" ? _ref$3(r$) : props.ref = r$;
    },
    "class": "relative flex items-center justify-center font-fit-shrink text-center flex-1 cursor-pointer",
    get classList() {
      return {
        "text-secondary": props.selected && !props.disabled,
        "text-accent-1": !props.selected && !props.disabled,
        "text-accent-5": props.disabled
      };
    },
    disableFocus: true,
    name: "TabListItem",
    get children() {
      return props.children;
    }
  });
};
const TabListComponent = (props) => {
  const tabContext = useContext(TabContext);
  const focusContext = useContext(FocusContext);
  const [root, setRoot] = createPropsRefSignal(() => props.ref);
  const layoutComplete = createLayoutComplete();
  let selectionIndicator;
  const showNavHelp = createMemo(() => props.showNavHelp ?? true);
  const nextHotkey = createMemo(() => props.nextHotkey ?? "nav-next");
  const prevHotkey = createMemo(() => props.previousHotkey ?? "nav-previous");
  createEffect(() => {
    const resolvedRoot = root();
    if (!resolvedRoot || !selectionIndicator || !layoutComplete()) {
      return;
    }
    const selectedTab = tabContext?.active()?.ref;
    if (!selectedTab) {
      return;
    }
    const rootRect = resolvedRoot.getBoundingClientRect();
    const tabRect = selectedTab.getBoundingClientRect();
    selectionIndicator.style.left = `${tabRect.left - rootRect.left}px`;
    selectionIndicator.style.width = `${tabRect.width}px`;
  });
  const navigateNextTab = () => {
    tabContext?.activateNext();
    focusContext.focusCurrent();
  };
  const navigatePreviousTab = () => {
    tabContext?.activatePrevious();
    focusContext.focusCurrent();
  };
  return (() => {
    var _el$2 = _tmpl$2(), _el$3 = _el$2.firstChild, _el$4 = _el$3.nextSibling, _el$5 = _el$4.nextSibling, _el$6 = _el$5.nextSibling;
    use(setRoot, _el$2);
    spread(_el$2, mergeProps(props, {
      get ["class"]() {
        return `flex flex-row items-stretch justify-stretch relative uppercase font-title text-base text-accent-2 tracking-150 min-h-16 px-4 ${props.class ?? ""}`;
      },
      "data-name": "TabList"
    }), false, true);
    insert(_el$2, createComponent(Show, {
      get when() {
        return showNavHelp();
      },
      get children() {
        return createComponent(Activatable, {
          "class": "absolute top-4 left-0",
          disableFocus: true,
          get disabled() {
            return props.disabled;
          },
          get hotkeyAction() {
            return prevHotkey();
          },
          onActivate: navigatePreviousTab,
          get children() {
            return createComponent(NavHelp, {});
          }
        });
      }
    }), _el$6);
    insert(_el$2, createComponent(For, {
      get each() {
        return tabContext?.tabs();
      },
      children: (tab) => createComponent(Tab.Trigger, {
        get name() {
          return tab.name;
        },
        get children() {
          return createComponent(TabListItem, {
            ref(r$) {
              var _ref$5 = tab.ref;
              typeof _ref$5 === "function" ? _ref$5(r$) : tab.ref = r$;
            },
            get disabled() {
              return (props.disabled || tab.disabled) ?? false;
            },
            get selected() {
              return tabContext?.isActive(tab.name) || false;
            },
            get children() {
              return tab.title();
            }
          });
        }
      })
    }), _el$6);
    insert(_el$2, createComponent(Show, {
      get when() {
        return showNavHelp();
      },
      get children() {
        return createComponent(Activatable, {
          "class": "absolute top-4 right-0",
          disableFocus: true,
          get disabled() {
            return props.disabled;
          },
          get hotkeyAction() {
            return nextHotkey();
          },
          onActivate: navigateNextTab,
          get children() {
            return createComponent(NavHelp, {});
          }
        });
      }
    }), _el$6);
    var _ref$4 = selectionIndicator;
    typeof _ref$4 === "function" ? use(_ref$4, _el$6) : selectionIndicator = _el$6;
    return _el$2;
  })();
};
const TabListPipsComponent = (props) => {
  const tabContext = useContext(TabContext);
  const focusContext = useContext(FocusContext);
  const showNavHelp = createMemo(() => props.showNavHelp ?? true);
  const nextHotkey = createMemo(() => props.nextHotkey ?? "nav-next");
  const prevHotkey = createMemo(() => props.previousHotkey ?? "nav-previous");
  const navigateNextTab = () => {
    tabContext?.activateNext();
    focusContext.focusCurrent();
  };
  const navigatePreviousTab = () => {
    tabContext?.activatePrevious();
    focusContext.focusCurrent();
  };
  return (() => {
    var _el$7 = _tmpl$$1();
    spread(_el$7, mergeProps(props, {
      get ["class"]() {
        return `flex flex-row items-center justify-center ${props.class ?? ""}`;
      },
      "data-name": "TabListPips"
    }), false, true);
    insert(_el$7, createComponent(ArrowButton, {
      "class": "mr-1 -my-1",
      hideForController: true,
      disableFocus: true,
      get disabled() {
        return props.disabled;
      },
      onActivate: navigatePreviousTab
    }), null);
    insert(_el$7, createComponent(Show, {
      get when() {
        return showNavHelp();
      },
      get children() {
        return createComponent(Activatable, {
          "class": "mr-1",
          disableFocus: true,
          get disabled() {
            return props.disabled;
          },
          get hotkeyAction() {
            return prevHotkey();
          },
          onActivate: navigatePreviousTab,
          get children() {
            return createComponent(NavHelp, {
              "class": "size-10"
            });
          }
        });
      }
    }), null);
    insert(_el$7, createComponent(For, {
      get each() {
        return tabContext?.tabs();
      },
      children: (tab) => createComponent(Tab.Trigger, {
        get name() {
          return tab.name;
        },
        get children() {
          return createComponent(RadioButton, {
            disableFocus: true,
            get isChecked() {
              return tabContext?.isActive(tab.name) || false;
            }
          });
        }
      })
    }), null);
    insert(_el$7, createComponent(Show, {
      get when() {
        return showNavHelp();
      },
      get children() {
        return createComponent(Activatable, {
          "class": "ml-1",
          disableFocus: true,
          get disabled() {
            return props.disabled;
          },
          get hotkeyAction() {
            return nextHotkey();
          },
          onActivate: navigateNextTab,
          get children() {
            return createComponent(NavHelp, {
              "class": "size-10"
            });
          }
        });
      }
    }), null);
    insert(_el$7, createComponent(ArrowButton, {
      "class": "ml-1 -my-1",
      hideForController: true,
      right: true,
      disableFocus: true,
      get disabled() {
        return props.disabled;
      },
      onActivate: navigateNextTab
    }), null);
    return _el$7;
  })();
};
const Tab = ComponentRegistry.register("Tab", TabComponent);
Tab.Item = ComponentRegistry.register("Tab.Item", TabItemComponent);
Tab.Output = ComponentRegistry.register("Tab.Output", TabOutputComponent);
Tab.Title = ComponentRegistry.register("Tab.Title", TabTitleComponent);
Tab.Trigger = ComponentRegistry.register("Tab.Trigger", createTrigger(TabContext));
Tab.TabList = ComponentRegistry.register({
  name: "Tab.TabList",
  createInstance: TabListComponent,
  images: ["blp:base_tabbar-selector.png"]
});
Tab.TabListPips = ComponentRegistry.register("Tab.TabListPips", TabListPipsComponent);

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`);
const Compose = (props) => {
  return createMemo(() => Locale.compose(props.text ?? "", ...props.args ?? []));
};
const Stylize = (props) => {
  const stylizedText = createMemo(() => Locale.stylize(props.text ?? "", ...props.args ?? []));
  return (() => {
    var _el$ = _tmpl$();
    spread(_el$, mergeProps(props, {
      get innerHTML() {
        return stylizedText();
      }
    }), false, false);
    return _el$;
  })();
};
const L10n = {
  /**
   * Compose text using the Locale.Compose.
   * Generate text given a localization-syntax string and additional optional arguments
   * ```tsx
   * <L10n.Compose text="LOC_EXAMPLE_STRING" args={["LOC_ARG_1", 2]} />
   * ```
   * Default implementation: {@link Compose}
   * @param {LocaleProps} props See {@link LocaleProps} for a full list of properties
   *
   * Commonly Used Properties:
   * @param {string} props.text The localization string to compose.
   * @param {LocalizedTextArgument[]} props.args A list of arguments to feed into the string. Default: undefined
   */
  Compose: ComponentRegistry.register("Compose", Compose),
  /**
   * Compose text using the Locale.Stylize.
   * Convert a string or localized text containing stylized markup into HTML formatted text.
   * ```tsx
   * <L10n.Stylize text="LOC_EXAMPLE_STRING" args={["LOC_ARG_1", 2]} />
   * ```
   * Default implementation: {@link Stylize}
   * @param {StylizeProps} props See {@link StylizeProps} for a full list of properties
   *
   * Commonly Used Properties:
   * @param {string} props.text The localization string to stylize.
   * @param {LocalizedTextArgument[]} props.args A list of arguments to feed into the string. Default: undefined
   */
  Stylize: ComponentRegistry.register("Stylize", Stylize)
};

export { Activatable as A, EMPTY_ACTIVATABLE_AUDIO as E, Icon as I, L10n as L, NavHelp as N, RadioButton as R, Tab as T, ViewExperience as V, TriggerType as a, TriggerActivationContext as b, TriggerActivationContextProvider as c, ArrowButton as d, createTrigger as e, TabContextProvider as f, TabContext as g, AudioGroupContext as h };
//# sourceMappingURL=l10n.chunk.js.map

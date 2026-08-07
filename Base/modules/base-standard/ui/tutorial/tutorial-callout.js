import { template, use, insert } from '../../../core/vendor/solid-js/web/dist/web.js';
import { createMemo, createEffect, createComponent, Show, createSignal, on, onMount, onCleanup, createRenderEffect, For } from '../../../core/vendor/solid-js/dist/solid.js';
import { FxsNavHelp } from '../../../core/ui/components/fxs-nav-help.js';
import ContextManager, { ContextManagerEvents } from '../../../core/ui/context-manager/context-manager.js';
import ActionHandler from '../../../core/ui/input/action-handler.js';
import { ActiveDeviceTypeChangedEventName } from '../../../core/ui/input/input-events.js';
import ViewManager from '../../../core/ui/views/view-manager.js';
import { Activatable } from '../../../core/ui-next/components/activatable.js';
import { AudioContextProvider } from '../../../core/ui-next/components/audio-context-provider.js';
import { Button } from '../../../core/ui-next/components/button.js';
import { defineLegacyComponent } from '../../../core/ui-next/components/fxs-solid-component.js';
import { InnerFrame } from '../../../core/ui-next/components/inner-frame.js';
import { L10n } from '../../../core/ui-next/components/l10n.js';
import { MinusPlusButton } from '../../../core/ui-next/components/minus-plus-button.js';
import { NavHelp } from '../../../core/ui-next/components/nav-help.js';
import { Slot, HSlot } from '../../../core/ui-next/components/slot.js';
import { TooltipModel } from '../../../core/ui-next/components/tooltip-model.js';
import { TooltipNavigationRules, Tooltip } from '../../../core/ui-next/components/tooltip.js';
import { useAudio } from '../../../core/ui-next/services/audio-support.js';
import { FocusManager } from '../../../core/ui-next/services/focus-manager.js';
import { useFocusContext } from '../../../core/ui-next/services/focus.js';
import { IsControllerActive, ActiveInputDevice } from '../../../core/ui-next/services/input.js';
import { ComponentUtilities } from '../../../core/ui-next/utilities/component-utilities.js';
import { TutorialCalloutMinimizeEventName, TutorialCalloutInspectEventName, LowerCalloutEvent } from './tutorial-events.js';
import { TutorialCalloutType } from './tutorial-item.js';
import TutorialManager from './tutorial-manager.js';
import { getTutorialPrompts } from './tutorial-support.js';
import WatchOutManager from '../watch-out/watch-out-manager.js';
import { SetIsPlotTooltipVisible } from '../../ui-next/tooltips/plot-tooltip/plot-tooltip.js';
import style from './tutorial-callout.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="absolute size-4 bg-contain -rotate-90 top-2 right-2"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="tutorial-callout-title-container relative flex flex-col items-center h-auto mt-3"><div class="tutorial-callout-title fxs-header font-title-xl pointer-events-auto mb-0 mt-1\\.5 relative justify-center text-center pb-2 -mr-1 tracking-100"></div><div class="absolute w-96 h-14 bg-center bg-contain bg-no-repeat -bottom-7"></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="relative flex items-center min-h-14"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="tutorial-callout-content absolute flex flex-col w-auto top-0 pointer-events-auto"><div class=tutorial-callout-bg><div class="absolute bg-center bg-contain bg-no-repeat -top-7 w-full h-16"></div><div class="absolute size-4 bg-contain rotate-180 top-2 left-2"></div><div class="absolute size-4 bg-contain rotate-90 bottom-2 left-2"></div><div class="absolute size-4 bg-contain rotate-0 bottom-2 right-2"></div></div><div class="tutorial-callout-body-advisor-topper absolute inset-0"><div class="relative w-full h-full"><div class="flex flex-row absolute"><div class="tutorial-callout-body-advisor-wrapper w-1\\\\/2 self-center"></div><div class="tutorial-callout-body-advisor-wrapper w-1\\\\/2 self-center -scale-x-100"></div></div><div class="flex flex-row absolute self-center tutorial-callout-body-advisor-image-container"><div class=relative><div class="tutorial-callout-body-advisor-bg bg-cover bg-no-repeat size-38"></div><div class="tutorial-callout-body-advisor-image absolute inset-0"></div></div></div></div></div><div class=tutorial-callout-overlay></div><div class="tutorial-callout-minimized flex-col items-center"><div class=tutorial-callout-min__advisor-image></div></div></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="advisor-text__content relative text-base text-primary-1 mt-3 mb-3 ml-6 mr-4"></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="tutorial-callout-body-advisor-container flex flex-row my-4 mx-2 items-center"></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="tutorial-callout-body-text img-base-ticket-bg text-base mt-3 mb-3 ml-6 mr-4 py-5 px-3 pointer-events-auto"></div>`);
function parseJSON(v, fallback) {
  if (!v) return fallback;
  try {
    return JSON.parse(v);
  } catch {
    return fallback;
  }
}
const CalloutOption = (props) => {
  const order = createMemo(() => props.order ?? 0);
  const definition = createMemo(() => props.definition ?? null);
  const caption = createMemo(() => props.definition?.text ?? "");
  const hotkey = createMemo(() => props.definition?.actionKey ?? "");
  const hasInteractibility = createMemo(() => hotkey().length > 0);
  createEffect(() => {
    if (hasInteractibility()) {
      props.onInteraction();
    }
  });
  return createComponent(Show, {
    get when() {
      return definition() != null;
    },
    get children() {
      return createComponent(AudioContextProvider, {
        segment: "TutorialPopup",
        get children() {
          return createComponent(Button, {
            get ["class"]() {
              return `tutorial-callout-button tutorial-callout-option${order()} p-6 relative leading-none break-words max-h-14 max-w-80 mb-2`;
            },
            get classList() {
              return {
                "trigger-nav-help": hasInteractibility()
              };
            },
            get hotkeyAction() {
              return hotkey();
            },
            onActivate: () => {
              props.onActivate(order(), definition());
            },
            get children() {
              return [createComponent(NavHelp, {
                "class": "relative mr-2"
              }), createMemo(() => caption())];
            }
          });
        }
      });
    }
  });
};
const TutorialCallout = (props) => {
  let root;
  const isMinimizeDisabled = createMemo(() => props.el.getAttribute("minimize-disabled") == "true");
  const id = createMemo(() => props.attrs["itemID"] ?? "");
  const value = createMemo(() => {
    const propsValue = parseJSON(props.attrs["value"], null) ?? null;
    if (propsValue == null) {
      throw Error("tutorial-callout: There's no body information to build the callout.");
    }
    return propsValue;
  });
  const isWatchOut = createMemo(() => value()?.type == TutorialCalloutType.NOTIFICATION);
  const handheld = createMemo(() => UI.getViewExperience() == UIViewExperience.Handheld);
  const title = createMemo(() => value().title);
  const options = createMemo(() => [value().option1, value().option2, value().option3]);
  const hasOptions = createMemo(() => options().some((option) => option != void 0));
  const audioTrigger = useAudio("TutorialPopup");
  const [focusSet, setFocusSet] = createSignal(false);
  const [isClosed, setIsClosed] = createSignal(false);
  const [selectedOptionNum, setSelectedOptionNum] = createSignal(0);
  const [nextID, setNextID] = createSignal("");
  const [isMinimized, setIsMinimized] = createSignal(false);
  const [maximizeCaption, setMaximizeCaption] = createSignal("LOC_TUTORIAL_REOPEN_KBM");
  const tooltipModel = TooltipModel.get();
  const [isInspecting, setIsInspecting] = createSignal(false);
  const [isTooltipInputChange, setIsTooltipInputChange] = createSignal(false);
  const [focusCtx, setFocusCtx] = createSignal(null);
  const isTooltipActive = createMemo(() => tooltipModel.active().length > 0 && !tooltipModel.tooltipsHidden());
  const isLocked = createMemo(() => isInspecting() || isTooltipActive());
  const isTopLevelActiveAndLocked = createMemo(() => isInspecting() && !isTooltipActive());
  const tooltipCount = createMemo(() => tooltipModel.active().length + 1);
  let slotBody;
  let buttons;
  let currentFocus = "buttons";
  const computedBodyText = () => {
    const item = TutorialManager.getCalloutItem(id()) || WatchOutManager.currentWatchOutPopupData?.item;
    if (!item) {
      console.error("tutorial-callout: getContentData(): Attempting to get tutorial item but not found, id: ", id());
      return;
    }
    const calloutDefine = item.callout;
    if (!calloutDefine) {
      console.error("tutorial-callout: getContentData(): Tutorial: Callout data missing; cannot raise. id: ", id());
      return;
    }
    let content = "";
    if (calloutDefine.body) {
      content = calloutDefine.body.text;
    }
    if (calloutDefine.body?.getLocParams) {
      TutorialManager.calloutBodyParams = calloutDefine.body.getLocParams(item);
    }
    let prompts = [];
    if (calloutDefine.actionPrompts) {
      prompts = getTutorialPrompts(calloutDefine.actionPrompts);
    }
    return Locale.stylize(content, ...TutorialManager.calloutBodyParams, ...prompts);
  };
  const computedAdvisorText = () => {
    const item = TutorialManager.getCalloutItem(id()) || WatchOutManager.currentWatchOutPopupData?.item;
    if (!item) {
      console.error("tutorial-callout: getContentData(): Attempting to get tutorial item but not found, id: ", id());
      return;
    }
    const calloutDefine = item.callout;
    if (!calloutDefine) {
      console.error("tutorial-callout: getContentData(): Tutorial: Callout data missing; cannot raise. id: ", id());
      return;
    }
    let content = "";
    if (calloutDefine.advisor?.text) {
      content = calloutDefine.advisor.text;
    }
    if (TutorialManager.calloutAdvisorParams.length <= 0 && calloutDefine.advisor?.getLocParams) {
      TutorialManager.calloutAdvisorParams = calloutDefine.advisor.getLocParams(item).filter(Boolean);
    }
    return Locale.stylize(content, ...TutorialManager.calloutAdvisorParams);
  };
  const [bodyText, setBodyText] = createSignal(computedBodyText());
  const [advisorText, setAdvisorText] = createSignal(computedAdvisorText());
  const hasTooltips = createMemo(() => bodyText()?.includes("fxs-tip") || advisorText()?.includes("fxs-tip"));
  const advisorType = createMemo(() => value().advisorType);
  const focusManager = FocusManager.get();
  const advisorURL = createMemo(() => {
    let url = "";
    if (advisorType()) {
      switch (advisorType()) {
        case "advisor-military":
          url = UI.getIconURL("ADVISOR_MILITARY");
          break;
        case "advisor-culture":
          url = UI.getIconURL("ADVISOR_CULTURE");
          break;
        case "advisor-science":
          url = UI.getIconURL("ADVISOR_SCIENCE");
          break;
        case "advisor-economic":
          url = UI.getIconURL("ADVISOR_ECONOMIC");
          break;
      }
    }
    props.el.classList.toggle("empty-advisor", url == "");
    return url;
  });
  const computeMaximizeCaption = () => {
    let caption = "LOC_TUTORIAL_REOPEN_KBM";
    switch (ActionHandler.deviceType) {
      case InputDeviceType.Controller:
        caption = "LOC_TUTORIAL_REOPEN_GAMEPAD";
        break;
      case InputDeviceType.Touch:
      case InputDeviceType.XR:
        caption = "LOC_TUTORIAL_REOPEN_TOUCH";
        break;
      default:
        break;
    }
    return caption;
  };
  createEffect(() => {
    props.el.classList.toggle("minimized", isMinimized());
    props.el.classList.toggle("trigger-nav-help", IsControllerActive() && !isMinimized());
    setMaximizeCaption(computeMaximizeCaption());
  }, {
    defer: true
  });
  const onOptionInteraction = () => {
    if (!isInspecting() && !isMinimized()) {
      focusManager.setFocus(buttons);
      currentFocus = "buttons";
      lockFocus("buttons");
    }
  };
  const onOptionActivate = (optionNum, definition) => {
    if (definition?.closes && !isClosed()) {
      setSelectedOptionNum(optionNum);
      setNextID(definition.nextID || "");
      close();
    }
  };
  const onContextChanged = () => {
    if (focusSet()) {
      ViewManager.getHarness()?.classList.remove("trigger-nav-help");
    }
  };
  const onActiveDeviceChanged = () => {
    setMaximizeCaption(computeMaximizeCaption());
    setBodyText(computedBodyText());
    setAdvisorText(computedAdvisorText());
  };
  const onCalloutMinimizeToggle = () => {
    if (isInspecting()) {
      return;
    }
    const wasMinimized = isMinimized();
    if (isMinimizeDisabled()) {
      setIsMinimized(false);
    } else {
      setIsMinimized(!isMinimized());
    }
    if (isMinimized()) {
      unlockFocus("buttons");
      if (!wasMinimized) {
        audioTrigger("popup-minimize");
      }
      SetIsPlotTooltipVisible(true);
    } else {
      if (hasOptions()) {
        lockFocus("buttons");
      }
      if (wasMinimized) {
        audioTrigger("popup-maximize");
      }
      SetIsPlotTooltipVisible(false);
    }
  };
  const onCalloutInspect = () => {
    if (!hasTooltips() || isMinimized()) {
      return;
    }
    setIsInspecting(!isInspecting());
  };
  const onNavigateInput = (navigationEvent) => {
    const {
      status
    } = navigationEvent.detail;
    if (status != InputActionStatuses.FINISH) {
      return;
    }
    if (FocusManager.get().isFocusLocked()) {
      navigationEvent.preventDefault();
      navigationEvent.stopImmediatePropagation();
    }
  };
  const onEngineInput = (inputEvent) => {
    const {
      name,
      status
    } = inputEvent.detail;
    if (status != InputActionStatuses.FINISH) {
      return;
    }
    if (name.startsWith("camera")) {
      return;
    } else if (name == "sys-menu") {
      props.el.classList.remove("trigger-nav-help");
      unlockFocus("buttons");
      return;
    } else if (name == "shell-action-1" || name == "shell-action-3" || name == "center-plot-cursor" || name === "toggle-tooltip" || name === "keyboard-inspect-tooltip") {
      return;
    } else if (inputEvent.isCancelInput() && isInspecting()) {
      setIsInspecting(false);
    }
    if (!hasOptions()) {
      if (IsControllerActive()) {
        console.error(`tutorial-callout: Attempt to handle input ${name} but callout doesn't take input.`);
      }
      return;
    }
    if (isMinimized()) {
      return;
    }
    if (isTooltipInputChange()) {
      return;
    }
    if (tryHandleInput(1, options()[0], inputEvent)) {
      return;
    }
    if (tryHandleInput(2, options()[1], inputEvent)) {
      return;
    }
    if (tryHandleInput(3, options()[2], inputEvent)) {
      return;
    }
    if (FocusManager.get().isFocusLocked()) {
      inputEvent.preventDefault();
      inputEvent.stopImmediatePropagation();
    }
  };
  const onNavigate = (navigationEvent) => {
    if (navigationEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (focusCtx()?.navigate(navigationEvent.detail.navigation)) {
      navigationEvent.preventDefault();
      navigationEvent.stopPropagation();
    }
  };
  const tryHandleInput = (optionNum, calloutOptionDef, inputEvent) => {
    if (calloutOptionDef) {
      const gamepadActionName = FxsNavHelp.getGamepadActionName(calloutOptionDef.actionKey.toLowerCase());
      if (gamepadActionName != void 0 && inputEvent.detail.name == gamepadActionName) {
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
        if (calloutOptionDef.closes && !isClosed()) {
          setSelectedOptionNum(optionNum);
          setNextID(calloutOptionDef.nextID || "");
          close();
        }
        return true;
      }
    }
    return false;
  };
  const lockFocus = (focus) => {
    if (!focusManager.isFocusLocked() && isInspecting() && currentFocus != focus || currentFocus == focus) {
      setFocusSet(focusManager.lockFocus(focusManager.currentFocus(), "tutorial-callout", "change of focus"));
      ViewManager.getHarness()?.classList.remove("trigger-nav-help");
    }
  };
  const unlockFocus = (focus) => {
    if (focusManager.isFocusLocked() && currentFocus == focus) {
      setFocusSet(!focusManager.unlockFocus(focusManager.currentFocus(), "tutorial-callout"));
    }
  };
  createEffect(on(tooltipModel.locked, (currentLocked) => {
    if (currentLocked != void 0) {
      setIsInspecting(true);
    } else {
      setIsInspecting(false);
    }
  }, {
    defer: true
  }));
  createEffect(on(isInspecting, (inspecting) => {
    if (inspecting) {
      setIsTooltipInputChange(true);
      if (hasTooltips()) {
        Input.setActiveContext(InputContext.Shell);
        ViewManager.getHarness()?.classList.remove("trigger-nav-help");
        unlockFocus("buttons");
        focusManager.setFocus(slotBody);
        currentFocus = "body";
      }
    } else {
      if (hasOptions()) {
        Input.setActiveContext(ViewManager.current.getInputContext());
        focusManager.setFocus(buttons);
        currentFocus = "buttons";
        lockFocus("buttons");
      } else {
        tryRegainFocus();
      }
      delayByFrame(() => {
        setIsTooltipInputChange(false);
      }, 3);
    }
  }, {
    defer: true
  }));
  onMount(() => {
    window.addEventListener("engine-input", onEngineInput);
    window.addEventListener("navigate-input", onNavigateInput);
    window.addEventListener(ActiveDeviceTypeChangedEventName, onActiveDeviceChanged, true);
    window.addEventListener(TutorialCalloutMinimizeEventName, onCalloutMinimizeToggle);
    window.addEventListener(TutorialCalloutInspectEventName, onCalloutInspect);
    engine.on(ContextManagerEvents.OnChanged, onContextChanged);
    engine.trigger("TutorialCallout");
    SetIsPlotTooltipVisible(false);
    if (!isWatchOut()) {
      audioTrigger("popup-open");
    } else {
      useAudio("AdvisorWatchoutPopup")("popup-open");
    }
  });
  onCleanup(() => {
    window.removeEventListener(TutorialCalloutInspectEventName, onCalloutInspect);
    window.removeEventListener(TutorialCalloutMinimizeEventName, onCalloutMinimizeToggle);
    window.removeEventListener(ActiveDeviceTypeChangedEventName, onActiveDeviceChanged, true);
    window.removeEventListener("navigate-input", onNavigateInput);
    window.removeEventListener("engine-input", onEngineInput);
    engine.off(ContextManagerEvents.OnChanged, onContextChanged);
    engine.trigger("TutorialCallout");
    SetIsPlotTooltipVisible(true);
    tryRegainFocus();
    if (!isWatchOut()) {
      audioTrigger("popup-close");
    } else {
      useAudio("AdvisorWatchoutPopup")("popup-close");
    }
  });
  const tryRegainFocus = () => {
    const currentTarget = ContextManager.getCurrentTarget();
    if (!currentTarget) {
      ViewManager.handleReceiveFocus();
      return;
    }
    const panel = currentTarget.component;
    if (panel.inputContext != null && panel.inputContext != InputContext.INVALID) {
      Input.setActiveContext(panel.inputContext);
      panel.onReceiveFocus();
    } else {
      FocusManager.get().setFocus(currentTarget);
    }
  };
  const close = () => {
    if (isClosed()) {
      console.error("tutorial-callout: close(): Tutorial callout being closed when already marked closed. id: ", id());
    }
    window.dispatchEvent(new LowerCalloutEvent({
      itemID: id(),
      optionNum: selectedOptionNum(),
      nextID: nextID(),
      closed: true
    }));
    setIsClosed(true);
    setFocusSet(false);
  };
  return [createComponent(Show, {
    get when() {
      return isInspecting();
    },
    get children() {
      return createComponent(Activatable, {
        onClick: () => {
          setIsInspecting(false);
        },
        "class": "callout-backdrop fixed inset-0 pointer-events-auto",
        style: {
          "background-color": "rgba(0 0 0 / .5)"
        },
        "on:engine-input": (e) => {
          if (e.detail.status === InputActionStatuses.FINISH && e.detail.name === "touch-tap") {
            e.stopPropagation();
            setIsInspecting(false);
          }
        }
      });
    }
  }), (() => {
    var _el$ = _tmpl$4(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$3.nextSibling, _el$6 = _el$4.nextSibling, _el$7 = _el$6.nextSibling, _el$8 = _el$2.nextSibling, _el$9 = _el$8.firstChild, _el$10 = _el$9.firstChild, _el$11 = _el$10.nextSibling, _el$12 = _el$11.firstChild, _el$13 = _el$12.firstChild, _el$14 = _el$13.nextSibling, _el$18 = _el$8.nextSibling, _el$20 = _el$18.nextSibling, _el$21 = _el$20.firstChild;
    var _ref$ = root;
    typeof _ref$ === "function" ? use(_ref$, _el$) : root = _el$;
    _el$3.style.setProperty("background-image", "url(blp:tutorial_Icon_header)");
    _el$4.style.setProperty("background-image", "url(blp:mp_player_detail)");
    insert(_el$2, createComponent(Show, {
      get when() {
        return isMinimizeDisabled() || isMinimized() || isInspecting();
      },
      get children() {
        var _el$5 = _tmpl$();
        _el$5.style.setProperty("background-image", "url(blp:mp_player_detail)");
        return _el$5;
      }
    }), _el$6);
    _el$6.style.setProperty("background-image", "url(blp:mp_player_detail)");
    _el$7.style.setProperty("background-image", "url(blp:mp_player_detail)");
    insert(_el$, createComponent(AudioContextProvider, {
      segment: "TutorialPopupMinimize",
      get children() {
        return createComponent(MinusPlusButton, {
          "class": "callout-min-button absolute top-3 right-3",
          get style() {
            return {
              display: isMinimizeDisabled() || isMinimized() || isInspecting() ? "none" : "flex"
            };
          },
          get dataDisabled() {
            return isMinimizeDisabled();
          },
          onActivate: onCalloutMinimizeToggle,
          type: "minus",
          hotkeyAction: "center-plot-cursor"
        });
      }
    }), _el$18);
    insert(_el$, createComponent(Show, {
      get when() {
        return title();
      },
      get children() {
        var _el$15 = _tmpl$2(), _el$16 = _el$15.firstChild, _el$17 = _el$16.nextSibling;
        insert(_el$16, createComponent(L10n.Stylize, {
          get text() {
            return Locale.toUpper(title() || "");
          }
        }));
        _el$17.style.setProperty("background-image", "url(blp:shell_small-filigree)");
        createRenderEffect(() => _el$15.classList.toggle("mt-8", !!(advisorURL() != "")));
        return _el$15;
      }
    }), _el$18);
    insert(_el$, createComponent(Slot, {
      "class": "tutorial-callout-body",
      ref(r$) {
        var _ref$2 = slotBody;
        typeof _ref$2 === "function" ? _ref$2(r$) : slotBody = r$;
      },
      "on:navigate-input": onNavigate,
      navRules: TooltipNavigationRules,
      lockNavigation: true,
      tabIndex: -1,
      children: () => {
        onMount(() => {
          const focusCtx2 = useFocusContext();
          focusCtx2.register(slotBody);
          setFocusCtx(focusCtx2);
        });
        onCleanup(() => {
          setFocusCtx(null);
          unlockFocus("buttons");
        });
        return [createComponent(Show, {
          get when() {
            return advisorType() != void 0;
          },
          get children() {
            var _el$22 = _tmpl$6();
            insert(_el$22, createComponent(InnerFrame, {
              "class": "tutorial-callout-advisor-text relative ml-6 mr-4",
              get children() {
                var _el$23 = _tmpl$5();
                insert(_el$23, createComponent(L10n.Stylize, {
                  get text() {
                    return advisorText() || "";
                  }
                }));
                return _el$23;
              }
            }));
            return _el$22;
          }
        }), createComponent(Show, {
          get when() {
            return advisorType() == void 0;
          },
          get children() {
            var _el$24 = _tmpl$7();
            insert(_el$24, createComponent(L10n.Stylize, {
              get text() {
                return bodyText() || "";
              }
            }));
            return _el$24;
          }
        })];
      }
    }), _el$18);
    insert(_el$, createComponent(HSlot, {
      ref(r$) {
        var _ref$3 = buttons;
        typeof _ref$3 === "function" ? _ref$3(r$) : buttons = r$;
      },
      "class": "tutorial-callout-buttons flex flex-row justify-center flex-wrap gap-2",
      lockNavigation: true,
      tabIndex: -1,
      get children() {
        return createComponent(Show, {
          get when() {
            return !isTooltipInputChange() || ActiveInputDevice() == InputDeviceType.Hybrid || ActiveInputDevice() == InputDeviceType.Mouse || ActiveInputDevice() == InputDeviceType.Keyboard;
          },
          get children() {
            return createComponent(For, {
              get each() {
                return options();
              },
              children: (option, index) => createComponent(CalloutOption, {
                get order() {
                  return index() + 1;
                },
                definition: option,
                onInteraction: onOptionInteraction,
                onActivate: onOptionActivate
              })
            });
          }
        });
      }
    }), _el$18);
    insert(_el$, createComponent(Show, {
      get when() {
        return createMemo(() => !!hasTooltips())() && !isMinimized();
      },
      get children() {
        var _el$19 = _tmpl$3();
        insert(_el$19, createComponent(Tooltip.InspectHint, {
          handlers: {
            isLocked,
            isTopLevelActiveAndLocked,
            tooltipCount
          }
        }));
        return _el$19;
      }
    }), _el$20);
    insert(_el$20, createComponent(AudioContextProvider, {
      segment: "TutorialMinimized",
      get children() {
        return createComponent(Button, {
          "class": "tutorial-callout-min__button mb-2",
          hotkeyAction: "center-plot-cursor",
          onActivate: onCalloutMinimizeToggle,
          get children() {
            return [createComponent(NavHelp, {
              "class": "relative mr-2"
            }), createMemo(() => maximizeCaption())];
          }
        });
      }
    }), null);
    createRenderEffect((_p$) => {
      var _v$ = !!handheld(), _v$2 = !!isWatchOut(), _v$3 = !!(advisorURL() != "" && UI.getViewExperience() == UIViewExperience.Mobile), _v$4 = !!isTooltipInputChange(), _v$5 = !!(advisorURL() == ""), _v$6 = !!(advisorURL() == ""), _v$7 = `url('${advisorURL()}')`;
      _v$ !== _p$.e && _el$.classList.toggle("handheld", _p$.e = _v$);
      _v$2 !== _p$.t && _el$.classList.toggle("type--notification", _p$.t = _v$2);
      _v$3 !== _p$.a && _el$.classList.toggle("tutorial-callout_has-advisor", _p$.a = _v$3);
      _v$4 !== _p$.o && _el$.classList.toggle("track-input-change", _p$.o = _v$4);
      _v$5 !== _p$.i && _el$8.classList.toggle("hidden", _p$.i = _v$5);
      _v$6 !== _p$.n && _el$14.classList.toggle("no-advisor", _p$.n = _v$6);
      _v$7 !== _p$.s && ((_p$.s = _v$7) != null ? _el$14.style.setProperty("background-image", _v$7) : _el$14.style.removeProperty("background-image"));
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
  })()];
};
ComponentUtilities.loadStyles(style);
defineLegacyComponent("tutorial-callout", {
  classNames: ["relative", "size-full"],
  attrs: {
    itemID: "",
    value: ""
  }
}, (attrs, el) => {
  return createComponent(TutorialCallout, {
    attrs,
    el
  });
});
//# sourceMappingURL=tutorial-callout.js.map

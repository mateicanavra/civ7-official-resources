import { template, insert, className, spread, classList } from '../../vendor/solid-js/web/dist/web.js';
import { useContext, createSignal, createMemo, onMount, onCleanup, createComponent, Show, createRenderEffect, splitProps, mergeProps } from '../../vendor/solid-js/dist/solid.js';
import { Icon } from '../../ui/utilities/utilities-image.js';
import { Icon as Icon$1 } from './icon.js';
import { RingMeter } from './ring-meter.js';
import { ActionButtonMap } from '../services/actionButtons.js';
import { ComponentRegistry } from '../services/component-registry.js';
import { HotkeyIconContext } from '../services/hotkey.js';
import { useActiveInputContext, IsControllerActive, IsHybridActive } from '../services/input.js';
import { createSignalFromExistingDebugWidget } from '../utilities/debug-widgets.js';

var _tmpl$ = /* @__PURE__ */ template(`<div data-name=NavHelp></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="absolute pointer-events-none origin-bottom"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<span class="relative uppercase text-xs text-center text-accent-1 leading-none"></span>`), _tmpl$4 = /* @__PURE__ */ template(`<div><div class="relative size-full flex items-center justify-center p-0\\.5 bg-contain overflow-hidden"></div></div>`);
UI.Debug.registerWidget({
  caption: "Show unknown icons in <NavHelp>",
  category: "Debug",
  domainType: "bool",
  id: "navHelpShowUnknownIcons",
  value: false
});
const WIDE_LOC_KEYS = ["LOC_OPTIONS_KEY_TAB", "LOC_OPTIONS_KEY_CAPSLOCK", "LOC_KEYBOARD_SHIFT", "LOC_OPTIONS_KEY_LSHIFT", "LOC_OPTIONS_KEY_RSHIFT", "LOC_KEYBOARD_CTRL", "LOC_OPTIONS_KEY_LCONTROL", "LOC_OPTIONS_KEY_RCONTROL", "LOC_KEYBOARD_ALT", "LOC_OPTIONS_KEY_LALT", "LOC_OPTIONS_KEY_RALT", "LOC_KEYBOARD_ENTER", "LOC_OPTIONS_KEY_BACKSPACE", "LOC_OPTIONS_KEY_SPACE", "LOC_OPTIONS_KEY_DELETE", "LOC_OPTIONS_KEY_INSERT", "LOC_OPTIONS_KEY_HOME", "LOC_OPTIONS_KEY_END", "LOC_OPTIONS_KEY_PAGEUP", "LOC_OPTIONS_KEY_PAGEDOWN", "LOC_KEYBOARD_ESCAPE", "LOC_OPTIONS_KEY_LWIN", "LOC_OPTIONS_KEY_RWIN", "LOC_OPTIONS_KEY_APPS", "LOC_OPTIONS_KEY_PRINTSCREEN", "LOC_OPTIONS_KEY_PAUSE", "LOC_OPTIONS_KEY_NUMLOCK", "LOC_OPTIONS_KEY_SCROLLLOCK"].map((key) => Locale.compose(key));
function getKBMInputInfo(actionName) {
  const actionId = Input.getActionIdByName(actionName);
  if (actionId === null) {
    return null;
  }
  const deviceType = Input.getActionDeviceType(actionId);
  if (deviceType !== InputDeviceType.Keyboard && deviceType !== InputDeviceType.Mouse) {
    return null;
  }
  const displayString = Input.getGestureDisplayString(actionId, 0, deviceType, InputContext.ALL);
  const iconUrl = Icon.getIconFromActionID(actionId, deviceType) ?? "";
  if (deviceType === InputDeviceType.Mouse) {
    return {
      deviceType,
      displayString,
      iconAsset: iconUrl,
      isWide: false
    };
  }
  const isWide = WIDE_LOC_KEYS.some((key) => key === displayString);
  const keyboardIcon = isWide ? "keyboard_icon_key_wide" : "keyboard_icon_key";
  return {
    deviceType,
    displayString,
    iconAsset: keyboardIcon,
    isWide
  };
}
const NavHelpComponent = (props) => {
  const showUnknownIcons = createSignalFromExistingDebugWidget("navHelpShowUnknownIcons");
  const activeInputContext = useActiveInputContext();
  const iconContext = useContext(HotkeyIconContext);
  const [holdValue, setHoldValue] = createSignal(0);
  let holdStartTime = 0;
  let rafId = null;
  const inputContext = createMemo(() => {
    return props.inputContext ?? activeInputContext();
  });
  const iconCssUrl = createMemo(() => {
    const actionName = props.actionName ?? iconContext?.actionName();
    if (!actionName) {
      return void 0;
    }
    const gamepadActionName = IsControllerActive() || IsHybridActive() ? ActionButtonMap.get(actionName.toLowerCase()) ?? actionName : actionName;
    const iconUrl = Icon.getIconFromActionName(gamepadActionName, void 0, inputContext()) ?? void 0;
    if (iconUrl && !showUnknownIcons() && iconUrl.includes("icon_mapping_unknown")) {
      return void 0;
    } else {
      return iconUrl ? `url(${iconUrl})` : void 0;
    }
  });
  const isHidden = createMemo(() => {
    const shouldHide = !IsControllerActive() && !IsHybridActive() || props.disabled || iconContext?.disabled() || iconCssUrl() === void 0;
    return shouldHide;
  });
  onMount(() => {
    if (!props.isHoldAction) {
      return;
    }
    const updateHoldProgress = () => {
      const elapsed = performance.now() - holdStartTime;
      const holdDuration = props.holdTimeMs ?? 1e3;
      const progress = Math.min(elapsed / holdDuration, 1) * 100;
      setHoldValue(progress);
      if (progress < 100) {
        rafId = requestAnimationFrame(updateHoldProgress);
      } else {
        rafId = null;
      }
    };
    const handleInputAction = (name, status) => {
      const actionName = props.actionName ?? iconContext?.actionName();
      if (name !== actionName) {
        return;
      }
      if (status === InputActionStatuses.START) {
        holdStartTime = performance.now();
        rafId = requestAnimationFrame(updateHoldProgress);
      } else if (status === InputActionStatuses.FINISH) {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        setHoldValue(0);
      }
    };
    engine.on("InputAction", handleInputAction);
    onCleanup(() => {
      engine.off("InputAction", handleInputAction);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    });
  });
  return (() => {
    var _el$ = _tmpl$();
    insert(_el$, createComponent(Show, {
      get when() {
        return props.isHoldAction;
      },
      get fallback() {
        return createComponent(Icon$1, {
          "class": "absolute inset-0 size-full",
          get name() {
            return iconCssUrl();
          },
          isUrl: true
        });
      },
      get children() {
        return createComponent(RingMeter, {
          "class": "absolute -inset-3",
          get value() {
            return holdValue();
          },
          max: 100,
          animationDuration: 32,
          get children() {
            return createComponent(Icon$1, {
              "class": "size-8",
              get name() {
                return iconCssUrl();
              },
              isUrl: true
            });
          }
        });
      }
    }));
    createRenderEffect((_p$) => {
      var _v$ = `relative size-8 ${props.class ?? ""}`, _v$2 = !!isHidden();
      _v$ !== _p$.e && className(_el$, _p$.e = _v$);
      _v$2 !== _p$.t && _el$.classList.toggle("hidden", _p$.t = _v$2);
      return _p$;
    }, {
      e: void 0,
      t: void 0
    });
    return _el$;
  })();
};
const KBMNavHelpComponent = (props) => {
  const [local, other] = splitProps(props, ["actionName", "isHoldAction", "holdTimeMs", "disabled"]);
  const inputInfo = createMemo(() => getKBMInputInfo(local.actionName));
  const [isHolding, setIsHolding] = createSignal(false);
  const iconCssUrl = createMemo(() => {
    const info = inputInfo();
    if (!info) {
      return void 0;
    }
    return `url(blp:${info.iconAsset})`;
  });
  onMount(() => {
    if (!local.isHoldAction) {
      return;
    }
    const handleInputAction = (name, status) => {
      if (name !== local.actionName) {
        return;
      }
      if (status === InputActionStatuses.START) {
        setIsHolding(true);
      } else if (status === InputActionStatuses.FINISH) {
        setIsHolding(false);
      }
    };
    engine.on("InputAction", handleInputAction);
    onCleanup(() => {
      engine.off("InputAction", handleInputAction);
      setIsHolding(false);
    });
  });
  const overlayAnimationDuration = () => {
    if (!local.isHoldAction) {
      return "0ms";
    }
    return `${local.holdTimeMs}ms`;
  };
  return createComponent(Show, {
    get when() {
      return inputInfo();
    },
    children: (info) => (() => {
      var _el$2 = _tmpl$4(), _el$3 = _el$2.firstChild;
      spread(_el$2, mergeProps(other, {
        get ["class"]() {
          return `relative h-8 flex items-center justify-center ${other.class ?? ""}`;
        },
        get classList() {
          return {
            hidden: local.disabled,
            "w-8": !info().isWide,
            "w-14": info().isWide,
            "px-px": info().isWide
          };
        },
        "data-name": "KBMNavHelp"
      }), false, true);
      insert(_el$3, createComponent(Show, {
        get when() {
          return local.isHoldAction;
        },
        get children() {
          var _el$4 = _tmpl$2();
          _el$4.style.setProperty("background-color", "rgba(255, 255, 255, 0.3)");
          _el$4.style.setProperty("transform", "scaleY(0)");
          _el$4.style.setProperty("animation-timing-function", "linear");
          _el$4.style.setProperty("animation-fill-mode", "forwards");
          createRenderEffect((_p$) => {
            var _v$3 = {
              "inset-1": info().deviceType === InputDeviceType.Keyboard,
              "inset-x-1 inset-y-0\\.5 mx-0\\.5 rounded-lg": info().deviceType === InputDeviceType.Mouse
            }, _v$4 = isHolding() ? "kbm-nav-help-hold-fill" : "none", _v$5 = overlayAnimationDuration();
            _p$.e = classList(_el$4, _v$3, _p$.e);
            _v$4 !== _p$.t && ((_p$.t = _v$4) != null ? _el$4.style.setProperty("animation-name", _v$4) : _el$4.style.removeProperty("animation-name"));
            _v$5 !== _p$.a && ((_p$.a = _v$5) != null ? _el$4.style.setProperty("animation-duration", _v$5) : _el$4.style.removeProperty("animation-duration"));
            return _p$;
          }, {
            e: void 0,
            t: void 0,
            a: void 0
          });
          return _el$4;
        }
      }), null);
      insert(_el$3, createComponent(Show, {
        get when() {
          return info().deviceType === InputDeviceType.Keyboard;
        },
        get children() {
          var _el$5 = _tmpl$3();
          _el$5.style.setProperty("coh-font-fit-mode", "shrink");
          insert(_el$5, () => info().displayString);
          return _el$5;
        }
      }), null);
      createRenderEffect((_$p) => (_$p = iconCssUrl()) != null ? _el$3.style.setProperty("background-image", _$p) : _el$3.style.removeProperty("background-image"));
      return _el$2;
    })()
  });
};
const NavHelp = ComponentRegistry.register("NavHelp", NavHelpComponent);
const KBMNavHelp = ComponentRegistry.register("KBMNavHelp", KBMNavHelpComponent);

export { KBMNavHelp, NavHelp };
//# sourceMappingURL=nav-help.js.map

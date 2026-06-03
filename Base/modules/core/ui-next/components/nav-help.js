import { template, spread, insert } from '../../vendor/solid-js/web/dist/web.js';
import { useContext, createMemo, createComponent, Show, mergeProps, createRenderEffect } from '../../vendor/solid-js/dist/solid.js';
import { Icon } from '../../ui/utilities/utilities-image.js';
import { Icon as Icon$1 } from './icon.js';
import { ActionButtonMap } from '../services/actionButtons.js';
import { ComponentRegistry } from '../services/component-registry.js';
import { HotkeyIconContext } from '../services/hotkey.js';
import { useActiveInputContext, IsControllerActive, IsHybridActive } from '../services/input.js';
import { createSignalFromExistingDebugWidget } from '../utilities/debug-widgets.js';

var _tmpl$ = /* @__PURE__ */ template(`<span class="uppercase text-xs text-center text-accent-1 leading-none"></span>`), _tmpl$2 = /* @__PURE__ */ template(`<div><div class="size-full flex items-center justify-center p-0\\.5 bg-contain"></div></div>`);
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
  return createComponent(Icon$1, {
    get ["class"]() {
      return `size-8 ${props.class ?? ""}`;
    },
    get classList() {
      return {
        hidden: isHidden()
      };
    },
    get name() {
      return iconCssUrl();
    },
    isUrl: true,
    "data-name": "NavHelp"
  });
};
const KBMNavHelpComponent = (props) => {
  const inputInfo = createMemo(() => getKBMInputInfo(props.actionName));
  const iconCssUrl = createMemo(() => {
    const info = inputInfo();
    if (!info) {
      return void 0;
    }
    return `url(blp:${info.iconAsset})`;
  });
  return createComponent(Show, {
    get when() {
      return inputInfo();
    },
    children: (info) => (() => {
      var _el$ = _tmpl$2(), _el$2 = _el$.firstChild;
      spread(_el$, mergeProps(props, {
        get ["class"]() {
          return `relative h-8 flex items-center justify-center ${props.class ?? ""}`;
        },
        get classList() {
          return {
            hidden: props.disabled,
            "w-8": !info().isWide,
            "w-14": info().isWide,
            "px-px": info().isWide
          };
        },
        "data-name": "KBMNavHelp"
      }), false, true);
      insert(_el$2, createComponent(Show, {
        get when() {
          return info().deviceType === InputDeviceType.Keyboard;
        },
        get children() {
          var _el$3 = _tmpl$();
          _el$3.style.setProperty("coh-font-fit-mode", "shrink");
          insert(_el$3, () => info().displayString);
          return _el$3;
        }
      }));
      createRenderEffect((_$p) => (_$p = iconCssUrl()) != null ? _el$2.style.setProperty("background-image", _$p) : _el$2.style.removeProperty("background-image"));
      return _el$;
    })()
  });
};
const NavHelp = ComponentRegistry.register("NavHelp", NavHelpComponent);
const KBMNavHelp = ComponentRegistry.register("KBMNavHelp", KBMNavHelpComponent);

export { KBMNavHelp, NavHelp };
//# sourceMappingURL=nav-help.js.map

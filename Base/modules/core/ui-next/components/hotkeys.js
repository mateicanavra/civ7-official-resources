import '../../vendor/solid-js/web/dist/web.js';
import { useContext, createEffect, on, onCleanup, createComponent, Show } from '../../vendor/solid-js/dist/solid.js';
import { Activatable } from './activatable.js';
import { NavHelp } from './nav-help.js';
import { ComponentRegistry } from '../services/component-registry.js';
import { HotkeyContext } from '../services/hotkey.js';
import { IsControllerActive } from '../services/input.js';

const HotkeysComponent = (props) => {
  const context = useContext(HotkeyContext);
  createEffect(on(() => props.hotkeys, (hotkeys, prevHotkeys) => {
    for (const hotkey of prevHotkeys ?? []) {
      context.unregisterHotkey(hotkey.hotkeyAction);
      if (hotkey.navTrayText) {
        context.unregisterNavtray(hotkey.hotkeyAction);
      }
    }
    for (const hotkey of hotkeys) {
      if (!hotkey.disabled) {
        context.registerHotkey(hotkey.hotkeyAction, hotkey.onActivate ?? (() => null));
        if (hotkey.navTrayText) {
          context.registerNavtray(hotkey.hotkeyAction, hotkey.navTrayText);
        }
      }
    }
  }));
  onCleanup(() => {
    for (const hotkey of props.hotkeys) {
      context.unregisterHotkey(hotkey.hotkeyAction);
      if (hotkey.navTrayText) {
        context.unregisterNavtray(hotkey.hotkeyAction);
      }
    }
  });
  return null;
};
const Hotkeys = ComponentRegistry.register("HotkeysComponent", HotkeysComponent);
const InlineHotkeyComponent = (props) => {
  return createComponent(Show, {
    get when() {
      return IsControllerActive();
    },
    get children() {
      return createComponent(Activatable, {
        get hotkeyAction() {
          return props.hotkeyAction;
        },
        get navTrayText() {
          return props.navTrayText;
        },
        get onActivate() {
          return props.onActivate;
        },
        get disabled() {
          return props.disabled;
        },
        disableFocus: true,
        get ["class"]() {
          return props.class;
        },
        get children() {
          return createComponent(NavHelp, {});
        }
      });
    }
  });
};
const InlineHotkey = ComponentRegistry.register("InlineHotkey", InlineHotkeyComponent);

export { Hotkeys, InlineHotkey };
//# sourceMappingURL=hotkeys.js.map

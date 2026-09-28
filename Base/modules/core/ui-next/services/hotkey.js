import { createContext, useContext, createEffect, onCleanup } from '../../vendor/solid-js/dist/solid.js';
import NavTray from '../../ui/navigation-tray/model-navigation-tray.js';

class HotkeyContextProvider {
  constructor(parentContext) {
    this.parentContext = parentContext;
  }
  hotkeyHandlers = /* @__PURE__ */ new Map();
  navTrays = /* @__PURE__ */ new Map();
  isActive = true;
  mount() {
    if (this.parentContext) {
      this.parentContext.hide();
    }
    this.show();
  }
  cleanup() {
    this.hide();
    NavTray.clear();
    if (this.parentContext) {
      this.parentContext.refresh();
    }
  }
  registerHotkey(eventName, handler) {
    const handlers = this.hotkeyHandlers.get(eventName);
    if (handlers) {
      handlers.push(handler);
      return;
    }
    this.hotkeyHandlers.set(eventName, [handler]);
  }
  unregisterHotkey(eventName) {
    const handlers = this.hotkeyHandlers.get(eventName);
    if (!handlers) {
      return;
    }
    handlers.pop();
    if (handlers.length === 0) {
      this.hotkeyHandlers.delete(eventName);
    }
  }
  registerNavtray(eventName, description) {
    const navTrayEntry = this.navTrays.get(eventName);
    if (navTrayEntry) {
      navTrayEntry.push(description);
    } else {
      this.navTrays.set(eventName, [description]);
    }
    NavTray.addOrUpdateEntry(description, eventName);
  }
  unregisterNavtray(eventName) {
    const navTrayEntry = this.navTrays.get(eventName);
    if (navTrayEntry) {
      navTrayEntry.pop();
      if (navTrayEntry.length == 0) {
        this.navTrays.delete(eventName);
      }
    }
    NavTray.removeEntry(eventName);
  }
  onInput(event) {
    if (!this.isActive || event.detail.status != InputActionStatuses.FINISH) {
      return false;
    }
    const handlers = this.hotkeyHandlers.get(event.detail.name);
    const hotkeyHandler = handlers?.[handlers.length - 1];
    if (hotkeyHandler) {
      hotkeyHandler();
      event.preventDefault();
      event.stopPropagation();
      return true;
    }
    return false;
  }
  hide() {
    if (!this.isActive) {
      return;
    }
    this.isActive = false;
    NavTray.clear();
  }
  show() {
    if (this.isActive) {
      return;
    }
    this.isActive = true;
    for (const [eventName, descriptions] of this.navTrays.entries()) {
      for (const description of descriptions) {
        NavTray.addOrUpdateEntry(description, eventName);
      }
    }
  }
  refresh() {
    this.hide();
    this.show();
  }
}
const HotkeyContext = createContext(new HotkeyContextProvider());
const HotkeyIconContext = createContext();
function useHotkeyContext() {
  const context = useContext(HotkeyContext);
  if (!context) {
    throw new Error("Unable to resolve hotkey context");
  }
  return context;
}
function registerHotkey(element, args) {
  const hotkeyContext = useContext(HotkeyContext);
  let registedHotkeyAction;
  createEffect(() => {
    const [actionName, isEnabled, hotkeyAction] = args();
    if (!actionName) {
      if (registedHotkeyAction) {
        hotkeyContext.unregisterHotkey(registedHotkeyAction);
        registedHotkeyAction = void 0;
      }
      return;
    }
    if (!element.isConnected) {
      return;
    }
    if (isEnabled()) {
      if (actionName && hotkeyAction) {
        hotkeyContext.registerHotkey(actionName, hotkeyAction);
        registedHotkeyAction = actionName;
      }
    } else if (registedHotkeyAction) {
      hotkeyContext.unregisterHotkey(registedHotkeyAction);
      registedHotkeyAction = void 0;
    }
  });
  onCleanup(() => {
    if (registedHotkeyAction) {
      hotkeyContext.unregisterHotkey(registedHotkeyAction);
      registedHotkeyAction = void 0;
    }
  });
}
function registerNavTray(element, args) {
  const hotkeyContext = useContext(HotkeyContext);
  let registedAction;
  createEffect(() => {
    const [actionName, isEnabled, description] = args();
    if (!element.isConnected) {
      return;
    }
    if (isEnabled()) {
      if (actionName && description) {
        hotkeyContext.registerNavtray(actionName, description);
        registedAction = actionName;
      }
    } else if (registedAction) {
      hotkeyContext.unregisterNavtray(registedAction);
      registedAction = void 0;
    }
  });
  onCleanup(() => {
    if (registedAction) {
      hotkeyContext.unregisterNavtray(registedAction);
      registedAction = void 0;
    }
  });
}

export { HotkeyContext, HotkeyContextProvider, HotkeyIconContext, registerHotkey, registerNavTray, useHotkeyContext };
//# sourceMappingURL=hotkey.js.map

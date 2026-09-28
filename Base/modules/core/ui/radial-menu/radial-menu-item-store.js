import { createStore } from '../../vendor/solid-js/store/dist/store.js';

var NavigationType = /* @__PURE__ */ ((NavigationType2) => {
  NavigationType2["NONE"] = "";
  NavigationType2["CONTEXT"] = "context";
  NavigationType2["DIPLOMACY"] = "diplomacy";
  NavigationType2["INTERFACE"] = "interface";
  NavigationType2["FOCUS"] = "focus";
  return NavigationType2;
})(NavigationType || {});
const [store, setStore] = createStore({ menus: [] });
const pendingItems = /* @__PURE__ */ new Map();
const getRadialMenus = () => store.menus;
function registerRadialMenu(definition) {
  const existingMenu = store.menus.find((m) => m.symbol === definition.symbol);
  if (existingMenu) {
    console.warn("Radial menu already registered. Ignoring.", definition.symbol.toString());
    return;
  }
  const pending = pendingItems.get(definition.symbol) ?? [];
  pendingItems.delete(definition.symbol);
  setStore(
    "menus",
    (menus) => [
      ...menus,
      {
        symbol: definition.symbol,
        title: definition.title,
        sortOrder: definition.sortOrder,
        items: pending.sort((a, b) => a.sortOrder - b.sortOrder)
      }
    ].sort((a, b) => a.sortOrder - b.sortOrder)
  );
}
function clearRadialMenuItems(menuSymbol) {
  pendingItems.delete(menuSymbol);
  const menuIndex = store.menus.findIndex((m) => m.symbol === menuSymbol);
  if (menuIndex !== -1) {
    setStore("menus", menuIndex, "items", []);
  }
}
function registerRadialMenuItem(menuSymbol, item) {
  const menuIndex = store.menus.findIndex((m) => m.symbol === menuSymbol);
  if (menuIndex === -1) {
    const pending = pendingItems.get(menuSymbol) ?? [];
    pending.push(item);
    pendingItems.set(menuSymbol, pending);
    return;
  }
  setStore("menus", menuIndex, "items", (items) => [...items, item].sort((a, b) => a.sortOrder - b.sortOrder));
}

export { NavigationType, clearRadialMenuItems, getRadialMenus, registerRadialMenu, registerRadialMenuItem };
//# sourceMappingURL=radial-menu-item-store.js.map

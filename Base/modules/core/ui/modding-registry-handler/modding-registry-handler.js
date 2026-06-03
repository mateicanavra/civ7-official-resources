import { MustGetElement } from '../utilities/utilities-dom.js';

class ModdingRegistryManager {
  modElements = [];
  static _Instance;
  static getInstance() {
    if (!ModdingRegistryManager._Instance) {
      ModdingRegistryManager._Instance = new ModdingRegistryManager();
    }
    return ModdingRegistryManager._Instance;
  }
  /**
   * Called by the addon components to register themselves with the manager
   * @param modElementData Data package for registering a mod element
   */
  add(modElementData) {
    if (this.modElements.find((data) => data == modElementData)) {
      console.error("ModdingRegistryManager: Attempting to add duplicate ModElementData");
      return;
    }
    this.modElements.push(modElementData);
  }
  /**
   * Called by the panel that modding components attach to
   * @param requestingPanelID Which panel/component is requesting mod elements
   */
  attachModElements(requestingPanelID) {
    this.modElements.forEach((element) => {
      if (element.parentID == requestingPanelID) {
        const modSlot = MustGetElement(`#${element.modSlot}`, document);
        modSlot.appendChild(document.createElement(element.componentTag));
      }
    });
  }
}
const ModdingRegistry = ModdingRegistryManager.getInstance();

export { ModdingRegistry };
//# sourceMappingURL=modding-registry-handler.js.map

import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { C as ComponentID } from '../../../core/ui/utilities/utilities-component-id.chunk.js';
import { C as CityDecorationSupport } from './support-city-decoration.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/panel-support.chunk.js';
import '../utilities/utilities-overlay.chunk.js';

class CityPurchaseInterfaceMode {
  requestedCityID = null;
  citySelectionChangedListener = () => {
    this.onCitySelectionChanged();
  };
  constructor() {
    CityDecorationSupport.manager.initializeOverlay();
  }
  transitionTo(_oldMode, _newMode, context) {
    this.requestedCityID = null;
    const cityPurchaseContext = context;
    if (cityPurchaseContext == void 0) {
      console.error("Failed to pass context object into the CityPurchaseInterfaceMode context.");
      InterfaceMode.switchToDefault();
      return;
    }
    if (cityPurchaseContext.CityID == void 0 || ComponentID.isInvalid(cityPurchaseContext.CityID)) {
      console.error("Failed to pass CityID into the CityPurchaseInterfaceMode context.");
      InterfaceMode.switchToDefault();
      return;
    }
    this.requestedCityID = cityPurchaseContext.CityID;
    this.updateDisplay();
    engine.on("CitySelectionChanged", this.citySelectionChangedListener);
  }
  updateDisplay() {
    if (this.requestedCityID != null && ComponentID.isValid(this.requestedCityID)) {
      CityDecorationSupport.manager.decoratePlots(this.requestedCityID);
    }
  }
  onCitySelectionChanged() {
    const selectedCityID = UI.Player.getHeadSelectedCity();
    if (selectedCityID) {
      this.updateDisplay();
    }
  }
  transitionFrom(_oldMode, _newMode) {
    CityDecorationSupport.manager.clearDecorations();
    engine.off("CitySelectionChanged", this.citySelectionChangedListener);
  }
  /** @interface Handler  */
  canEnterMode(parameters) {
    const cityID = parameters?.CityID;
    return cityID && ComponentID.isValid(cityID);
  }
  handleInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return true;
    }
    switch (inputEvent.detail.name) {
      case "shell-action-2":
        InterfaceMode.switchTo("INTERFACEMODE_CITY_PRODUCTION", { CityID: UI.Player.getHeadSelectedCity() });
        return false;
    }
    return true;
  }
}
InterfaceMode.addHandler("INTERFACEMODE_CITY_PURCHASE", new CityPurchaseInterfaceMode());
//# sourceMappingURL=interface-mode-city-purchase.js.map

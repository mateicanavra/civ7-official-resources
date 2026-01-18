import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { C as ComponentID } from '../../../core/ui/utilities/utilities-component-id.chunk.js';
import { C as CityDecorationSupport } from './support-city-decoration.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/panel-support.chunk.js';
import '../utilities/utilities-overlay.chunk.js';

class CityProductionInterfaceMode {
  requestedCityID = null;
  citySelectionChangedListener = (data) => {
    this.onCitySelectionChanged(data);
  };
  constructor() {
    CityDecorationSupport.manager.initializeOverlay();
  }
  canEnterMode(context) {
    const cityProductionContext = context;
    if (cityProductionContext == void 0) {
      console.error("Failed to pass context object into the CityProductionInterfaceMode context!");
      return false;
    }
    if (cityProductionContext.CityID == void 0 || ComponentID.isInvalid(cityProductionContext.CityID)) {
      console.error("Failed to pass CityID into the CityProductionInterfaceMode context!");
      return false;
    }
    return true;
  }
  transitionTo(_oldMode, _newMode, context) {
    this.requestedCityID = null;
    const cityProductionContext = context;
    if (cityProductionContext == void 0) {
      console.error("Failed to pass context object into the CityProductionInterfaceMode context!");
      return;
    }
    if (cityProductionContext.CityID == void 0 || ComponentID.isInvalid(cityProductionContext.CityID)) {
      console.error("Failed to pass CityID into the CityProductionInterfaceMode context!");
      return;
    }
    this.requestedCityID = cityProductionContext.CityID;
    this.updateDisplay();
    engine.on("CitySelectionChanged", this.citySelectionChangedListener);
  }
  updateDisplay() {
    if (ComponentID.isValid(this.requestedCityID)) {
      CityDecorationSupport.manager.decoratePlots(this.requestedCityID);
    } else {
      console.error("Failed find a head city in CityProductionInterfaceMode.updateDisplay().");
    }
  }
  onCitySelectionChanged(data) {
    this.requestedCityID = UI.Player.getHeadSelectedCity();
    if (data.selected) {
      this.updateDisplay();
    }
  }
  transitionFrom(_oldMode, _newMode) {
    CityDecorationSupport.manager.clearDecorations();
    engine.off("CitySelectionChanged", this.citySelectionChangedListener);
  }
}
InterfaceMode.addHandler("INTERFACEMODE_CITY_PRODUCTION", new CityProductionInterfaceMode());
//# sourceMappingURL=interface-mode-city-production.js.map

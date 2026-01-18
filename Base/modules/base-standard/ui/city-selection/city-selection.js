import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { C as ComponentID } from '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/panel-support.chunk.js';

var City;
((City2) => {
  function isQueueEmpty(cityID) {
    if (cityID && ComponentID.isValid(cityID)) {
      const city = Cities.get(cityID);
      if (city) {
        const numItemsInQueue = city.BuildQueue.getQueue().length;
        return numItemsInQueue == 0;
      } else {
        console.error(
          `Unable to determine if city queue is empty. city: '${ComponentID.toLogString(cityID)}'.`
        );
      }
    }
    return true;
  }
  City2.isQueueEmpty = isQueueEmpty;
  function isTown(cityID) {
    if (cityID && ComponentID.isValid(cityID)) {
      const city = Cities.get(cityID);
      if (city) {
        return city.isTown;
      }
    }
    return false;
  }
  City2.isTown = isTown;
})(City || (City = {}));
class CitySelection {
  location = { i: -1, j: -1 };
  constructor() {
    engine.whenReady.then(() => {
      this.onReady();
    });
  }
  onReady() {
    engine.on("CitySelectionChanged", (data) => {
      this.onCitySelectionChanged(data);
    });
  }
  /**
   * EVENT: selection has changed for a city in the game
   * @param data
   * @returns
   */
  onCitySelectionChanged(data) {
    let selectedCityID = UI.Player.getHeadSelectedCity();
    if (data.selected == false) {
      if (selectedCityID == null) {
        this.doUnselect();
        return;
      } else {
        return;
      }
    }
    this.location = data.location;
    this.doSelect(data.cityID);
    const localPlayer = GameContext.localPlayerID;
    if (selectedCityID) {
      const c = Cities.get(selectedCityID);
      if (!c || c.isTown || c.owner != localPlayer) {
        selectedCityID = null;
      }
    }
  }
  /**
   * Select a city.
   * @param {ComponentID} cityID City to be selected
   */
  doSelect(cityID) {
    const city = Cities.get(cityID);
    if (city == null) {
      console.error("Attempt to select a city but none found for cid: ", ComponentID.toLogString(cityID));
      return;
    }
    if (this.location.i != city.location.x || this.location.j != city.location.y) {
      console.warn(
        "City selection event fired but the location (" + this.location.i + "," + this.location.j + ") is different from the city location (" + city.location.x + "," + city.location.y + ")"
      );
    }
    if (this.shouldSwitchToCityView()) {
      InterfaceMode.switchTo("INTERFACEMODE_CITY_PRODUCTION", { CityID: cityID });
    }
  }
  /**
   * Determine if we should switch to INTERFACEMODE_CITY_PROUDCTION based on our
   * current interface mode or stay in the current one
   * @returns {boolean} If yes, we should switch to INTERFACEMODE_CITY_PROUDCTION
   */
  shouldSwitchToCityView() {
    switch (InterfaceMode.getCurrent()) {
      case "INTERFACEMODE_CITY_PRODUCTION":
      case "INTERFACEMODE_CITY_PURCHASE":
      case "INTERFACEMODE_RESOURCE_ALLOCATION":
        return false;
    }
    return true;
  }
  /** Deselect a city */
  doUnselect() {
    if (this.location.i < 0 || this.location.j < 0) {
      console.warn(
        "Unselecting a city but existing selection is invalid (" + this.location.i + "," + this.location.j + ")"
      );
    }
    InterfaceMode.switchToDefault();
    this.location = { i: -1, j: -1 };
  }
}
const citySelection = new CitySelection();

export { City, CitySelection, citySelection as default };
//# sourceMappingURL=city-selection.js.map

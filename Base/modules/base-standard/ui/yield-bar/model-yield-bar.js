import { U as UpdateGate } from '../../../core/ui/utilities/utilities-update-gate.chunk.js';

class YieldBarModel {
  cityYields = [];
  yieldBarUpdateEvent = new LiteEvent();
  constructor() {
    this.updateGate.call("constructor");
    engine.on("CitySelectionChanged", this.onCitySelectionChanged, this);
  }
  onUpdate;
  set updateCallback(callback) {
    this.onUpdate = callback;
  }
  updateGate = new UpdateGate(() => {
    const cityID = UI.Player.getHeadSelectedCity();
    if (!cityID) {
      return;
    }
    const city = Cities.get(cityID);
    const cityYields = city?.Yields;
    if (!cityYields) {
      console.error("model-yield-bar: Failed to find city yields!");
      return;
    }
    this.cityYields = [];
    const yields = cityYields.getYields();
    if (yields) {
      for (const [index, y] of yields.entries()) {
        const yieldDefinition = GameInfo.Yields[index];
        if (yieldDefinition) {
          this.cityYields.push({ type: yieldDefinition.YieldType, value: y.value });
        }
      }
    }
    if (this.onUpdate) {
      this.onUpdate(this);
    }
    this.yieldBarUpdateEvent.trigger();
  });
  onCitySelectionChanged(event) {
    if (!event.selected) {
      return;
    }
    const city = Cities.get(event.cityID);
    if (!city) {
      console.error(`model-yield-bar: Failed to find city despite 'selected' being true!`);
      return;
    }
    if (city.owner != GameContext.localPlayerID) {
      return;
    }
    this.updateGate.call("onCitySelectionChanged");
  }
}
const YieldBar = new YieldBarModel();
engine.whenReady.then(() => {
  const updateModel = () => {
    engine.updateWholeModel(YieldBar);
  };
  engine.createJSModel("g_YieldBar", YieldBar);
  YieldBar.updateCallback = updateModel;
});

export { YieldBar as default };
//# sourceMappingURL=model-yield-bar.js.map

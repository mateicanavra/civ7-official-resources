import '../city-trade/model-city-trade.chunk.js';

class CityHUDModel {
  static _Instance;
  _OnUpdate;
  citySelectionChangedListener = (data) => {
    this.onCitySelectionChanged(data);
  };
  SelectedCityID = null;
  constructor() {
    engine.whenReady.then(() => {
      engine.on("CitySelectionChanged", this.citySelectionChangedListener);
    });
  }
  /**
   * Singleton accessor
   */
  static getInstance() {
    if (!CityHUDModel._Instance) {
      CityHUDModel._Instance = new CityHUDModel();
    }
    return CityHUDModel._Instance;
  }
  set updateCallback(callback) {
    this._OnUpdate = callback;
  }
  update() {
    this.SelectedCityID = UI.Player.getHeadSelectedCity();
    if (this._OnUpdate) {
      this._OnUpdate(this);
    }
  }
  onCitySelectionChanged(data) {
    if (data.selected && this.SelectedCityID && data.cityID.id == this.SelectedCityID.id) {
      return;
    }
    this.update();
  }
}
const CityHUD = CityHUDModel.getInstance();
engine.whenReady.then(() => {
  const updateModel = () => {
    engine.updateWholeModel(CityHUD);
  };
  engine.createJSModel("g_CityHUD", CityHUD);
  CityHUD.updateCallback = updateModel;
});

export { CityHUD as default };
//# sourceMappingURL=model-city-hud.js.map

import LensManager from '../../../core/ui/lenses/lens-manager.js';

class MiniMapModel {
  static _Instance;
  static getInstance() {
    if (!MiniMapModel._Instance) {
      MiniMapModel._Instance = new MiniMapModel();
    }
    return MiniMapModel._Instance;
  }
  setLensDisplayOption(lens, value) {
    UI.setOption("user", "Interface", lens, value);
  }
  getLensDisplayOption(lens) {
    return UI.getOption("user", "Interface", lens);
  }
  setDecorationOption(decorLayer, value) {
    const convValue = value ? 1 : 0;
    UI.setOption("user", "Gameplay", LensManager.getLayerOption(decorLayer), convValue);
    Configuration.getUser().saveCheckpoint();
  }
  getDecorationOption(decorLayer) {
    const intval = UI.getOption(
      "user",
      "Gameplay",
      LensManager.getLayerOption(decorLayer)
    );
    return intval != 0;
  }
}
const MiniMapData = MiniMapModel.getInstance();
engine.whenReady.then(() => {
  engine.createJSModel("g_MiniMap", MiniMapData);
});

export { MiniMapData as default };
//# sourceMappingURL=model-mini-map.js.map

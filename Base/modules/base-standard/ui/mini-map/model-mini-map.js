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
}
const MiniMapData = MiniMapModel.getInstance();
engine.whenReady.then(() => {
  engine.createJSModel("g_MiniMap", MiniMapData);
});

export { MiniMapData as default };
//# sourceMappingURL=model-mini-map.js.map

import SpatialWrap from '../external/js-spatial-navigation/spatial-wrapper.js';

class SpatialManager {
  static _Instance;
  directionMap = /* @__PURE__ */ new Map([
    [InputNavigationAction.UP, "up"],
    [InputNavigationAction.DOWN, "down"],
    [InputNavigationAction.RIGHT, "right"],
    [InputNavigationAction.LEFT, "left"]
  ]);
  constructor() {
    engine.whenReady.then(() => {
      this.onReady();
    });
  }
  /**
   * Singleton accessor
   */
  static getInstance() {
    if (!SpatialManager._Instance) {
      SpatialManager._Instance = new SpatialManager();
    }
    return SpatialManager._Instance;
  }
  onReady() {
    SpatialWrap.init();
  }
  getDirection(inputDirection) {
    return this.directionMap.get(inputDirection);
  }
  navigate(sectionId, elements, direction) {
    return SpatialWrap.navigate(sectionId, elements, direction);
  }
}
const Spatial = SpatialManager.getInstance();

export { Spatial as default };
//# sourceMappingURL=spatial-manager.js.map

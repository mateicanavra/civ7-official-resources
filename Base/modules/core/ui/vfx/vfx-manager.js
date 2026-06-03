class UiVFXManager {
  static instance = null;
  uiVFXModelGroup = null;
  constructor() {
    if (UiVFXManager.instance) {
      console.error(
        "Only one instance of the UI VFX manager class exist at a time, second attempt to create one."
      );
    }
    UiVFXManager.instance = this;
    engine.whenReady.then(() => {
      this.onReady();
    });
  }
  onReady() {
    this.uiVFXModelGroup = WorldUI.createModelGroup("uiVFXModelGroup");
  }
  // Persistent VFX
  addScreenVFX(vfxName, minXY, maxXY, constants) {
    const uiGlobalScale = GlobalScaling.getCurrentScale() / 100;
    this.uiVFXModelGroup?.addScreenVFX(vfxName, minXY, maxXY, { UiGlobalScale: uiGlobalScale, ...constants });
  }
  addScreenVFXToRect(vfxName, controlRect, constants) {
    this.addScreenVFX(
      vfxName,
      { x: controlRect.left, y: controlRect.top },
      { x: controlRect.right, y: controlRect.bottom },
      constants
    );
  }
  clearScreenVFX() {
    this.uiVFXModelGroup?.clear();
  }
  // Fire and Forget VFX
  triggerScreenVFX(vfxName, minXY, maxXY, constants) {
    const uiGlobalScale = GlobalScaling.getCurrentScalePx() / BASE_FONT_SIZE;
    WorldUI.triggerScreenVFX(vfxName, minXY, maxXY, { UiGlobalScale: uiGlobalScale, ...constants });
  }
  triggerScreenVFXToRect(vfxName, controlRect, constants) {
    this.triggerScreenVFX(
      vfxName,
      { x: controlRect.left, y: controlRect.top },
      { x: controlRect.right, y: controlRect.bottom },
      constants
    );
  }
}
const UiVfx = new UiVFXManager();

export { UiVfx };
//# sourceMappingURL=vfx-manager.js.map

import { L as LensManager } from '../../../../core/ui/lenses/lens-manager.chunk.js';
import { O as OVERLAY_PRIORITY } from '../../utilities/utilities-overlay.chunk.js';

const hexGridColor = 1610612736;
class HexGridLensLayer {
  group = WorldUI.createOverlayGroup(
    "HexGirdLensLayerGroup",
    OVERLAY_PRIORITY.HEX_GRID
  );
  overlay = this.group.addHexGridOverlay();
  onLayerHotkeyListener = this.onLayerHotkey.bind(this);
  initLayer() {
    this.overlay.setColor(hexGridColor);
    window.addEventListener("layer-hotkey", this.onLayerHotkeyListener);
  }
  applyLayer() {
    this.group.setVisible(true);
  }
  removeLayer() {
    this.group.setVisible(false);
  }
  getOptionName() {
    return "ShowMapGrid";
  }
  onLayerHotkey(hotkey) {
    if (hotkey.detail.name == "toggle-grid-layer") {
      LensManager.toggleLayer("fxs-hexgrid-layer");
    }
  }
}
LensManager.registerLensLayer("fxs-hexgrid-layer", new HexGridLensLayer());
//# sourceMappingURL=hexgrid-layer.js.map

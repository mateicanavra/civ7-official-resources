import LensManager from '../../../../core/ui/lenses/lens-manager.js';
import { OVERLAY_PRIORITY } from '../../utilities/utilities-overlay.js';

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
    this.group.setVisible(false);
    window.addEventListener("layer-hotkey", this.onLayerHotkeyListener);
  }
  applyLayer() {
    this.group.setVisible(true);
  }
  removeLayer() {
    this.group.setVisible(false);
  }
  // Name of key written in UserOptions.txt
  getOptionName() {
    return "ShowMapGrid";
  }
  onLayerHotkey(hotkey) {
    if (hotkey.detail.name == "toggle-grid-layer") {
      LensManager.toggleLayer("fxs-hexgrid-layer", { serialize: true });
    }
  }
}
LensManager.registerLensLayer("fxs-hexgrid-layer", new HexGridLensLayer());
//# sourceMappingURL=hexgrid-layer.js.map

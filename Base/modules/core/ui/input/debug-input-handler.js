import Cursor from './cursor.js';

class DebugInputSingleton {
  sendTunerActionA() {
    if (!UI.isInGame()) {
      return true;
    }
    const plotCoords = Camera.pickPlotFromPoint(Cursor.position.x, Cursor.position.y);
    if (plotCoords) {
      return window.dispatchEvent(
        new CustomEvent("tuner-user-action-a", { cancelable: true, detail: { plotCoords } })
      );
    }
    return true;
  }
  sendTunerActionB() {
    if (!UI.isInGame()) {
      return true;
    }
    const plotCoords = Camera.pickPlotFromPoint(Cursor.position.x, Cursor.position.y);
    if (plotCoords) {
      return window.dispatchEvent(
        new CustomEvent("tuner-user-action-b", { cancelable: true, detail: { plotCoords } })
      );
    }
    return true;
  }
}
const DebugInput = new DebugInputSingleton();

export { DebugInput as default };
//# sourceMappingURL=debug-input-handler.js.map

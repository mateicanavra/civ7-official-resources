import ActionHandler from '../../../core/ui/input/action-handler.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { C as ComponentID } from '../../../core/ui/utilities/utilities-component-id.chunk.js';
import { U as UpdateGate } from '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import { V as ViewManager } from '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/panel-support.chunk.js';
import '../../../core/ui/input/input-support.chunk.js';

class RaiseUnitSelectionEvent extends CustomEvent {
  constructor(cid) {
    super("raise-unit-selection", { bubbles: true, cancelable: true, detail: { cid } });
  }
}
class LowerUnitSelectionEvent extends CustomEvent {
  constructor(cid) {
    super("lower-unit-selection", { bubbles: true, cancelable: true, detail: { cid } });
  }
}
class UnitSelectionSingleton {
  //@ts-ignore : remove if not use but there was an edge case there was necessary for mode changes (FTUE?)
  trySelectUnitID = null;
  currentVFXUnitID = null;
  selectionVFXModelGroup = null;
  lowerEvent = new LiteEvent();
  raiseEvent = new LiteEvent();
  onUnitHotkeyListener = this.onUnitHotkey.bind(this);
  constructor() {
    engine.whenReady.then(() => {
      this.onReady();
    });
  }
  updateGate = new UpdateGate(() => {
    this.onUpdate();
  });
  /** Debug only: (this part of the) DOM is reloading. */
  onUnload = () => {
    this.cleanup();
  };
  cleanup() {
    this.selectionVFXModelGroup?.destroy();
  }
  onReady() {
    this.selectionVFXModelGroup = WorldUI.createModelGroup("selectionVFXModelGroup");
    engine.on("PlayerTurnActivated", this.onPlayerTurnActivated);
    engine.on("UnitSelectionChanged", this.onUnitSelectionChanged);
    engine.on("UnitMoveComplete", this.onUnitMoveComplete);
    engine.on("BeforeUnload", this.onUnload);
    window.addEventListener("ui-hide-plot-vfx", (_event) => {
      this.onUIHidePlotVFX();
    });
    window.addEventListener("ui-show-plot-vfx", (_event) => {
      this.onUIShowPlotVFX();
    });
    window.addEventListener("ui-show-unit-info-panel", this.onGlobalShow);
    window.addEventListener("ui-hide-unit-info-panel", this.onGlobalHide);
    window.addEventListener("unit-hotkey", this.onUnitHotkeyListener);
    this.updateGate.call("onReady");
  }
  onUpdate() {
    if (!ViewManager.isUnitSelectingAllowed) {
      return;
    }
    const curtain = document.getElementById("loading-curtain");
    if (curtain) {
      if (!curtain.classList.contains("curtain-opened")) {
        window.requestAnimationFrame(() => {
          this.updateGate.call("deferredReady");
        });
        return;
      }
    }
    this.update();
  }
  /**
   * If an update is requested and the engine shows a unit is selected then
   * switch to the unit selected mode.
   */
  update() {
    const cid = UI.Player.getHeadSelectedUnit();
    if (cid) {
      if (ComponentID.isInvalid(cid)) {
        console.error(`Request to update unit on selection but invalid cid '${cid}' passed in.`);
        return;
      }
      const unit = Units.get(cid);
      if (unit != null) {
        if (this.trySwitchToUnitSelectedMode(unit.id)) {
          this.realizeVFX(unit);
          this.raiseEvent.trigger(cid);
        }
      } else {
        console.error(`Request to update unit on selection but no unit exists for cid '${cid}'.`);
      }
    }
  }
  realizeVFX(unit) {
    this.currentVFXUnitID = unit.id;
    WorldUI.triggerVFXAtPlot("VFX_UnitSelection_Ground_Burst_01", unit.location, { x: 0, y: 0, z: 0 });
    this.selectionVFXModelGroup?.clear();
    this.selectionVFXModelGroup?.addVFXAtPlot("VFX_3dUI_Unit_Selected_01", unit.location, { x: 0, y: 0, z: 0 });
  }
  trySwitchToUnitSelectedMode(unitID) {
    if (Units.get(unitID)?.owner != GameContext.localPlayerID) {
      return false;
    } else if (InterfaceMode.isInInterfaceMode("INTERFACEMODE_UNIT_SELECTED")) {
      return true;
    }
    if (!InterfaceMode.switchTo("INTERFACEMODE_UNIT_SELECTED", { UnitID: unitID })) {
      console.warn(`Unable to switch interface mode to selecte unit for ${ComponentID.toLogString(unitID)}`);
      this.trySelectUnitID = unitID;
      return false;
    }
    this.trySelectUnitID = null;
    return true;
  }
  // Events
  get onRaise() {
    return this.raiseEvent.expose();
  }
  get onLower() {
    return this.lowerEvent.expose();
  }
  // Event Handlers
  onUnitSelectionChanged = (data) => {
    if (data.selected) {
      this.updateGate.call("onUnitSelectionChanged");
    } else {
      this.currentVFXUnitID = null;
      this.lowerEvent.trigger(data.unit);
      const selectedUnit = UI.Player.getHeadSelectedUnit();
      if (!selectedUnit || !ComponentID.isValid(selectedUnit)) {
        this.selectionVFXModelGroup?.clear();
      }
    }
  };
  onPlayerTurnActivated = (data) => {
    const localPlayerID = GameContext.localPlayerID;
    if (data.player == localPlayerID) {
      this.updateGate.call("onPlayerTurnActivated");
    }
  };
  onUIHidePlotVFX() {
    this.selectionVFXModelGroup?.clear();
  }
  onUIShowPlotVFX() {
    const cid = UI.Player.getHeadSelectedUnit();
    if (cid) {
      if (ComponentID.isInvalid(cid)) {
        console.error(`Request to update unit on selection but invalid cid '${cid}' passed in.`);
        return;
      }
      const unit = Units.get(cid);
      if (unit != null) {
        this.realizeVFX(unit);
      } else {
        console.error(`Request to update unit on selection but no unit exists for cid '${cid}'.`);
      }
    }
  }
  onGlobalShow = () => {
    this.update();
  };
  // using view rules allows us to know when to lower instead of checking the interfaceMode's view
  onGlobalHide = () => {
    const selectedUnit = UI.Player.getHeadSelectedUnit();
    if (selectedUnit) {
      this.lowerEvent.trigger(selectedUnit);
    }
  };
  onUnitMoveComplete = (data) => {
    if (this.currentVFXUnitID && ComponentID.isMatch(this.currentVFXUnitID, data.unit)) {
      const unit = Units.get(this.currentVFXUnitID);
      if (unit != null) {
        this.trySwitchToUnitSelectedMode(unit.id);
        this.realizeVFX(unit);
      }
    }
  };
  /**
   * Allow a KBM next/previous to raise the unit selection.
   * @param hotkey, the hotkey based event.
   */
  onUnitHotkey(hotkey) {
    if (!InterfaceMode.isInDefaultMode || ActionHandler.isGamepadActive) {
      return;
    }
    switch (hotkey.detail.name) {
      case "cycle-prev":
        UI.Player.selectPreviousUnit();
        return;
      case "cycle-next":
        UI.Player.selectNextUnit();
        return;
    }
  }
}
const UnitSelection = new UnitSelectionSingleton();

export { LowerUnitSelectionEvent, RaiseUnitSelectionEvent, UnitSelection as default };
//# sourceMappingURL=unit-selection.js.map

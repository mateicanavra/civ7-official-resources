import { Audio } from '../../../core/ui/audio-base/audio-support.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { HighlightColors } from '../../../core/ui/utilities/utilities-color.js';
import ChoosePlotInterfaceMode from './interface-mode-choose-plot.js';
import { DialogBoxManager } from '../../../core/ui/dialog-box/manager-dialog-box.js';
import { displayRequestUniqueId } from '../../../core/ui/context-manager/display-handler.js';
import DiplomacyManager from '../diplomacy/diplomacy-manager.js';
import { DialogBoxAction } from '../../../core/ui/dialog-box/model-dialog-box.js';

class WMDStrikeInterfaceMode extends ChoosePlotInterfaceMode {
  dialogId = displayRequestUniqueId();
  _OperationResult = null;
  validPlots = /* @__PURE__ */ new Set();
  initialize() {
    const context = this.Context;
    const args = {};
    args.Type = Database.makeHash("WMD_NUCLEAR_DEVICE");
    const result = Game.UnitOperations.canStart(context.UnitID, "UNITOPERATION_WMD_STRIKE", args, false);
    this._OperationResult = result;
    result.Plots?.forEach((p) => this.validPlots.add(p));
    return this.validPlots.size > 0;
  }
  reset() {
    this._OperationResult = null;
    this.validPlots.clear();
  }
  decorate(overlay) {
    const result = this._OperationResult;
    if (result == null) {
      throw new ReferenceError("OperationResult is null");
    } else {
      if (result.Plots) {
        const plotOverlay = overlay.addPlotOverlay();
        plotOverlay?.addPlots(result.Plots, {
          fillColor: HighlightColors.wmdTargetRange,
          edgeColor: HighlightColors.wmdTargetRangeShadow
        });
        Audio.playSound("data-audio-plot-select-overlay", "interact-unit");
      }
    }
  }
  proposePlot(plot, accept, reject) {
    const plotIndex = GameplayMap.getIndexFromLocation(plot);
    if (this.validPlots.has(plotIndex)) {
      const unit = Units.get(this.Context.UnitID);
      if (unit) {
        const player = Players.get(unit.owner);
        if (player && player.Diplomacy) {
          const unitCombat = unit.Combat;
          var radius = 1;
          const unitStats = GameInfo.Unit_Stats.lookup(unit.typeName);
          const wmdTypeName = unitStats?.WMDType ?? "WMD_NUCLEAR_DEVICE";
          const wmdDef = GameInfo.WMDs.lookup(wmdTypeName);
          if (wmdDef && unitCombat) {
            radius = wmdDef?.BlastRadius + unitCombat?.combatModifiers.wMDBlastRadius;
          }
          const result = player.Diplomacy.willActionStartWarInArea(unit.id, plot, radius);
          if (result.Success) {
            const dbCallback = (eAction) => {
              if (eAction == DialogBoxAction.Confirm) {
                accept();
              } else {
                reject();
              }
              ;
            };
            if (result.Value === 1 && result.Player2 !== void 0) {
              const player2 = Players.get(result.Player2);
              DiplomacyManager.startWarFromMap(
                {
                  player: player2?.id ?? -1,
                  independentIndex: player2?.isIndependent ? player2.id : -1
                },
                () => {
                  dbCallback(DialogBoxAction.Confirm);
                }
              );
              InterfaceMode.switchToDefault();
            } else {
              DialogBoxManager.createDialog_ConfirmCancel({
                dialogId: this.dialogId,
                body: "LOC_UNITOPERATION_WMDSTRIKE_ACT_OF_WAR_SUMMARY",
                title: "LOC_DIPLOMACY_CONFIRM_DECLARE_WAR_TITLE",
                callback: dbCallback
              });
              InterfaceMode.switchToDefault();
            }
          } else {
            accept();
          }
        } else {
          accept();
        }
      }
    }
  }
  decorateHover(plotCoord, _overlay, modelGroup) {
    modelGroup.clear();
    _overlay.clearAll();
    const plotIndex = GameplayMap.getIndexFromLocation(plotCoord);
    const unit = Units.get(this.Context.UnitID);
    if (unit && this.validPlots.has(plotIndex)) {
      const unitStats = GameInfo.Unit_Stats.lookup(unit.typeName);
      const wmdTypeName = unitStats?.WMDType ?? "WMD_NUCLEAR_DEVICE";
      const wmdDef = GameInfo.WMDs.lookup(wmdTypeName);
      const unitCombat = unit.Combat;
      var radius = 1;
      if (wmdDef && unitCombat) {
        radius = wmdDef?.BlastRadius + unitCombat?.combatModifiers.wMDBlastRadius;
      }
      const blastRadius = radius ?? 1;
      const affectedPlots = GameplayMap.getPlotIndicesInRadius(plotCoord.x, plotCoord.y, blastRadius);
      const plotOverlay = _overlay.addPlotOverlay();
      plotOverlay?.addPlots(affectedPlots, {
        fillColor: HighlightColors.wmdDamageRadius,
        edgeColor: HighlightColors.wmdDamageRadiusShadow
      });
      const target_position = WorldUI.getPlotLocation(plotCoord, { x: 0, y: 0, z: 0 }, PlacementMode.TERRAIN);
      const source_position = WorldUI.getPlotLocation(unit.location, { x: 0, y: 0, z: 0 }, PlacementMode.TERRAIN);
      if (this.validPlots.has(plotIndex)) {
        modelGroup.addVFXAtPlot(
          "VFX_3DUI_Ranged_Attack_Preview",
          { i: plotCoord.x, j: plotCoord.y },
          { x: 0, y: 0, z: 0 },
          {
            angle: 0,
            constants: {
              target_position: [target_position.x, target_position.y, target_position.z],
              source_position: [source_position.x, source_position.y, source_position.z]
            }
          }
        );
      }
    }
  }
  commitPlot(plot) {
    const context = this.Context;
    const unitID = context.UnitID;
    const args = {};
    args.X = plot.x;
    args.Y = plot.y;
    args.Type = Database.makeHash("WMD_NUCLEAR_DEVICE");
    Game.UnitOperations.sendRequest(unitID, "UNITOPERATION_WMD_STRIKE", args);
    Audio.playSound("data-audio-drop-nuke-confirm-release", "interact-unit");
  }
}
InterfaceMode.addHandler("INTERFACEMODE_WMD_STRIKE", new WMDStrikeInterfaceMode());
//# sourceMappingURL=interface-mode-wmd-strike.js.map

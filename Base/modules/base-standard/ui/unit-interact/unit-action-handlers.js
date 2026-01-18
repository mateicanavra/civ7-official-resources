import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/panel-support.chunk.js';

var UnitActionHandlers;
((UnitActionHandlers2) => {
  const unitActionHandlers = /* @__PURE__ */ new Map();
  function setUnitActionHandler(actionType, handler) {
    const existingHandler = unitActionHandlers.get(actionType);
    if (existingHandler == void 0) {
      unitActionHandlers.set(actionType, handler);
    }
  }
  UnitActionHandlers2.setUnitActionHandler = setUnitActionHandler;
  function doesActionHaveHandler(actionType) {
    const handler = unitActionHandlers.get(actionType);
    if (handler != void 0) {
      return true;
    }
    return false;
  }
  UnitActionHandlers2.doesActionHaveHandler = doesActionHaveHandler;
  function useHandlerWithGamepad(actionType) {
    const handler = unitActionHandlers.get(actionType);
    if (handler != void 0 && handler.useHandlerWithGamepad) {
      return handler.useHandlerWithGamepad();
    }
    return false;
  }
  UnitActionHandlers2.useHandlerWithGamepad = useHandlerWithGamepad;
  function doesActionRequireTargetPlot(actionType) {
    const handler = unitActionHandlers.get(actionType);
    if (handler != void 0) {
      return handler.isTargetPlotOperation();
    }
    return false;
  }
  UnitActionHandlers2.doesActionRequireTargetPlot = doesActionRequireTargetPlot;
  function switchToActionInterfaceMode(actionType, context) {
    const handler = unitActionHandlers.get(actionType);
    if (handler != void 0) {
      if (context) {
        context.ActionType = actionType;
      }
      return handler.switchTo(context);
    }
  }
  UnitActionHandlers2.switchToActionInterfaceMode = switchToActionInterfaceMode;
})(UnitActionHandlers || (UnitActionHandlers = {}));
class MoveToHandler {
  isTargetPlotOperation() {
    return true;
  }
  switchTo(context) {
    InterfaceMode.switchTo("INTERFACEMODE_MOVE_TO", context);
  }
}
UnitActionHandlers.setUnitActionHandler("UNITOPERATION_MOVE_TO", new MoveToHandler());
class RangeAttackHandler {
  isTargetPlotOperation() {
    return true;
  }
  useHandlerWithGamepad() {
    return true;
  }
  switchTo(context) {
    InterfaceMode.switchTo("INTERFACEMODE_RANGE_ATTACK", context);
  }
}
UnitActionHandlers.setUnitActionHandler("UNITOPERATION_RANGE_ATTACK", new RangeAttackHandler());
class ReinforceArmyHandler {
  isTargetPlotOperation() {
    return true;
  }
  useHandlerWithGamepad() {
    return true;
  }
  switchTo(context) {
    InterfaceMode.switchTo("INTERFACEMODE_REINFORCE_ARMY", context);
  }
}
UnitActionHandlers.setUnitActionHandler("UNITOPERATION_REINFORCE_ARMY", new ReinforceArmyHandler());
class CallReinforcementsHandler {
  isTargetPlotOperation() {
    return true;
  }
  switchTo(context) {
    InterfaceMode.switchTo("INTERFACEMODE_COMMANDER_REINFORCEMENT", context);
  }
}
UnitActionHandlers.setUnitActionHandler("UNITOPERATION_CALL_REINFORCEMENTS", new CallReinforcementsHandler());
class AerialReconHandler {
  isTargetPlotOperation() {
    return true;
  }
  switchTo(context) {
    InterfaceMode.switchTo("INTERFACEMODE_AERIAL_RECON", context);
  }
  useHandlerWithGamepad() {
    return true;
  }
}
UnitActionHandlers.setUnitActionHandler("UNITOPERATION_AERIAL_RECON", new AerialReconHandler());
class CargoDropHandler {
  isTargetPlotOperation() {
    return true;
  }
  switchTo(context) {
    InterfaceMode.switchTo("INTERFACEMODE_CARGO_DROP", context);
  }
  useHandlerWithGamepad() {
    return true;
  }
}
UnitActionHandlers.setUnitActionHandler("UNITOPERATION_CARGO_DROP", new CargoDropHandler());
class UnitAirDropHandler {
  isTargetPlotOperation() {
    return true;
  }
  switchTo(context) {
    InterfaceMode.switchTo("INTERFACEMODE_UNIT_AIR_DROP", context);
  }
  useHandlerWithGamepad() {
    return true;
  }
}
UnitActionHandlers.setUnitActionHandler("UNITOPERATION_UNIT_AIR_DROP", new UnitAirDropHandler());
class CoastalRaidHandler {
  isTargetPlotOperation() {
    return true;
  }
  useHandlerWithGamepad() {
    return true;
  }
  switchTo(context) {
    InterfaceMode.switchTo("INTERFACEMODE_COASTAL_RAID", context);
  }
}
UnitActionHandlers.setUnitActionHandler("UNITOPERATION_COASTAL_RAID", new CoastalRaidHandler());
class PillageLandHandler {
  isTargetPlotOperation() {
    return true;
  }
  useHandlerWithGamepad() {
    return true;
  }
  switchTo(context) {
    InterfaceMode.switchTo("INTERFACEMODE_PILLAGE", context);
  }
}
UnitActionHandlers.setUnitActionHandler("UNITOPERATION_PILLAGE", new PillageLandHandler());
class PillageRouteHandler {
  isTargetPlotOperation() {
    return true;
  }
  switchTo(context) {
    InterfaceMode.switchTo("INTERFACEMODE_PILLAGE_ROUTE", context);
  }
}
UnitActionHandlers.setUnitActionHandler("UNITOPERATION_PILLAGE_ROUTE", new PillageRouteHandler());
class UnpackArmyHandler {
  isTargetPlotOperation() {
    return true;
  }
  switchTo(context) {
    InterfaceMode.switchTo("INTERFACEMODE_UNPACK_ARMY", context);
  }
  useHandlerWithGamepad() {
    return true;
  }
}
UnitActionHandlers.setUnitActionHandler("UNITCOMMAND_UNPACK_ARMY", new UnpackArmyHandler());
class ResettlePopulationHandler {
  isTargetPlotOperation() {
    return true;
  }
  useHandlerWithGamepad() {
    return true;
  }
  switchTo(context) {
    InterfaceMode.switchTo("INTERFACEMODE_ACQUIRE_TILE", context);
  }
}
UnitActionHandlers.setUnitActionHandler("UNITCOMMAND_RESETTLE", new ResettlePopulationHandler());
class EstablishBaseHandler {
  isTargetPlotOperation() {
    return true;
  }
  useHandlerWithGamepad() {
    return true;
  }
  switchTo(context) {
    InterfaceMode.switchTo("INTERFACEMODE_ESTABLISH_BASE", context);
  }
}
UnitActionHandlers.setUnitActionHandler("UNITOPERATION_ESTABLISH_BASE", new EstablishBaseHandler());
class FoundCityAdjacentPlotHandler {
  isTargetPlotOperation() {
    return true;
  }
  switchTo(context) {
    InterfaceMode.switchTo("INTERFACEMODE_FOUND_CITY_ADJACENT_PLOT", context);
  }
  useHandlerWithGamepad() {
    return true;
  }
}
UnitActionHandlers.setUnitActionHandler("UNITOPERATION_FOUND_CITY_ADJACENT_PLOT", new FoundCityAdjacentPlotHandler());
class ReBaseHandler {
  isTargetPlotOperation() {
    return true;
  }
  useHandlerWithGamepad() {
    return true;
  }
  switchTo(context) {
    InterfaceMode.switchTo("INTERFACEMODE_REBASE", context);
  }
}
UnitActionHandlers.setUnitActionHandler("UNITOPERATION_REBASE", new ReBaseHandler());
class ConstructInRangeHandler {
  isTargetPlotOperation() {
    return true;
  }
  switchTo(context) {
    context.CommandType = InterfaceMode.switchTo("INTERFACEMODE_CONSTRUCT_IN_RANGE", context);
  }
}
UnitActionHandlers.setUnitActionHandler("UNITCOMMAND_CONSTRUCT_IN_RANGE", new ConstructInRangeHandler());
UnitActionHandlers.setUnitActionHandler("UNITCOMMAND_ARMY_CONSTRUCT_IN_RANGE", new ConstructInRangeHandler());
class AddToArmyHandler {
  isTargetPlotOperation() {
    return true;
  }
  switchTo(context) {
    InterfaceMode.switchTo("INTERFACEMODE_ADD_TO_ARMY", context);
  }
  useHandlerWithGamepad() {
    return true;
  }
}
UnitActionHandlers.setUnitActionHandler("UNITCOMMAND_ADD_TO_ARMY", new AddToArmyHandler());
class RemoveFromArmyHandler {
  isTargetPlotOperation() {
    return true;
  }
  switchTo(context) {
    InterfaceMode.switchTo("INTERFACEMODE_REMOVE_FROM_ARMY", context);
  }
  useHandlerWithGamepad() {
    return true;
  }
}
UnitActionHandlers.setUnitActionHandler("UNITCOMMAND_REMOVE_FROM_ARMY", new RemoveFromArmyHandler());
class AirAttackHandler {
  isTargetPlotOperation() {
    return true;
  }
  switchTo(context) {
    InterfaceMode.switchTo("INTERFACEMODE_AIR_ATTACK", context);
  }
}
UnitActionHandlers.setUnitActionHandler("UNITOPERATION_AIR_ATTACK", new AirAttackHandler());
class NavalAttackHandler {
  isTargetPlotOperation() {
    return true;
  }
  useHandlerWithGamepad() {
    return true;
  }
  switchTo(context) {
    InterfaceMode.switchTo("INTERFACEMODE_NAVAL_ATTACK", context);
  }
}
UnitActionHandlers.setUnitActionHandler("UNITOPERATION_NAVAL_ATTACK", new NavalAttackHandler());
class WMDStrikeHandler {
  isTargetPlotOperation() {
    return true;
  }
  useHandlerWithGamepad() {
    return true;
  }
  switchTo(context) {
    InterfaceMode.switchTo("INTERFACEMODE_WMD_STRIKE", context);
  }
}
UnitActionHandlers.setUnitActionHandler("UNITOPERATION_WMD_STRIKE", new WMDStrikeHandler());
class TeleportToCityHandler {
  isTargetPlotOperation() {
    return true;
  }
  switchTo(context) {
    InterfaceMode.switchTo("INTERFACEMODE_TELEPORT_TO_CITY", context);
  }
}
UnitActionHandlers.setUnitActionHandler("UNITOPERATION_TELEPORT_TO_CITY", new TeleportToCityHandler());
class ArmyOverrunHandler {
  isTargetPlotOperation() {
    return true;
  }
  switchTo(context) {
    InterfaceMode.switchTo("INTERFACEMODE_ARMY_OVERRUN", context);
  }
}
UnitActionHandlers.setUnitActionHandler("UNITCOMMAND_ARMY_OVERRUN", new ArmyOverrunHandler());
class UnitPromotionHandler {
  isTargetPlotOperation() {
    return false;
  }
  switchTo(_context) {
    InterfaceMode.switchTo("INTERFACEMODE_UNIT_PROMOTION");
  }
}
UnitActionHandlers.setUnitActionHandler("UNITCOMMAND_PROMOTE", new UnitPromotionHandler());
class FocusedAttackLandMeleeHandler {
  isTargetPlotOperation() {
    return true;
  }
  useHandlerWithGamepad() {
    return true;
  }
  switchTo(context) {
    InterfaceMode.switchTo("INTERFACEMODE_FOCUSED_ATTACK_LAND_MELEE", context);
  }
}
UnitActionHandlers.setUnitActionHandler("UNITCOMMAND_FOCUSED_ATTACK_LAND_MELEE", new FocusedAttackLandMeleeHandler());
class FocusedAttackLandRangedHandler {
  isTargetPlotOperation() {
    return true;
  }
  useHandlerWithGamepad() {
    return true;
  }
  switchTo(context) {
    InterfaceMode.switchTo("INTERFACEMODE_FOCUSED_ATTACK_LAND_RANGED", context);
  }
}
UnitActionHandlers.setUnitActionHandler("UNITCOMMAND_FOCUSED_ATTACK_LAND_RANGED", new FocusedAttackLandRangedHandler());
class FocusedAttackSeaMeleeHandler {
  isTargetPlotOperation() {
    return true;
  }
  useHandlerWithGamepad() {
    return true;
  }
  switchTo(context) {
    InterfaceMode.switchTo("INTERFACEMODE_FOCUSED_ATTACK_SEA_MELEE", context);
  }
}
UnitActionHandlers.setUnitActionHandler("UNITCOMMAND_FOCUSED_ATTACK_SEA_MELEE", new FocusedAttackSeaMeleeHandler());
class FocusedAttackSeaRangedHandler {
  isTargetPlotOperation() {
    return true;
  }
  useHandlerWithGamepad() {
    return true;
  }
  switchTo(context) {
    InterfaceMode.switchTo("INTERFACEMODE_FOCUSED_ATTACK_SEA_RANGED", context);
  }
}
UnitActionHandlers.setUnitActionHandler("UNITCOMMAND_FOCUSED_ATTACK_SEA_RANGED", new FocusedAttackSeaRangedHandler());
class FocusedAttackAirToAirHandler {
  isTargetPlotOperation() {
    return true;
  }
  useHandlerWithGamepad() {
    return true;
  }
  switchTo(context) {
    InterfaceMode.switchTo("INTERFACEMODE_FOCUSED_ATTACK_AIR_TO_AIR", context);
  }
}
UnitActionHandlers.setUnitActionHandler("UNITCOMMAND_FOCUSED_ATTACK_AIR_TO_AIR", new FocusedAttackAirToAirHandler());
class FocusedAttackAirToLandHandler {
  isTargetPlotOperation() {
    return true;
  }
  useHandlerWithGamepad() {
    return true;
  }
  switchTo(context) {
    InterfaceMode.switchTo("INTERFACEMODE_FOCUSED_ATTACK_AIR_TO_LAND", context);
  }
}
UnitActionHandlers.setUnitActionHandler("UNITCOMMAND_FOCUSED_ATTACK_AIR_TO_LAND", new FocusedAttackAirToLandHandler());
class FocusedAttackAirBombHandler {
  isTargetPlotOperation() {
    return true;
  }
  useHandlerWithGamepad() {
    return true;
  }
  switchTo(context) {
    InterfaceMode.switchTo("INTERFACEMODE_FOCUSED_ATTACK_AIR_BOMB", context);
  }
}
UnitActionHandlers.setUnitActionHandler("UNITCOMMAND_FOCUSED_ATTACK_AIR_BOMB", new FocusedAttackAirBombHandler());
class ConnectWithRoadHandler {
  isTargetPlotOperation() {
    return true;
  }
  useHandlerWithGamepad() {
    return true;
  }
  switchTo(context) {
    InterfaceMode.switchTo("INTERFACEMODE_CONNECT_WITH_ROAD", context);
  }
}
UnitActionHandlers.setUnitActionHandler("UNITCOMMAND_CONNECT_WITH_ROAD", new ConnectWithRoadHandler());
class MoveByRailHandler {
  isTargetPlotOperation() {
    return true;
  }
  useHandlerWithGamepad() {
    return true;
  }
  switchTo(context) {
    InterfaceMode.switchTo("INTERFACEMODE_MOVE_BY_RAIL", context);
  }
}
UnitActionHandlers.setUnitActionHandler("UNITCOMMAND_MOVE_BY_RAIL", new MoveByRailHandler());
class GrantSecondWindHandler {
  isTargetPlotOperation() {
    return true;
  }
  useHandlerWithGamepad() {
    return true;
  }
  switchTo(context) {
    InterfaceMode.switchTo("INTERFACEMODE_GRANT_SECOND_WIND", context);
  }
}
UnitActionHandlers.setUnitActionHandler("UNITCOMMAND_GRANT_SECOND_WIND", new GrantSecondWindHandler());
class CommanderAttackHandler {
  isTargetPlotOperation() {
    return true;
  }
  useHandlerWithGamepad() {
    return true;
  }
  switchTo(context) {
    InterfaceMode.switchTo("INTERFACEMODE_COMMANDER_ATTACK", context);
  }
}
UnitActionHandlers.setUnitActionHandler("UNITCOMMAND_COMMANDER_ATTACK", new CommanderAttackHandler());

export { UnitActionHandlers };
//# sourceMappingURL=unit-action-handlers.js.map

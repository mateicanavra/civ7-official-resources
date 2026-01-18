import { A as Audio } from '../../../core/ui/audio-base/audio-support.chunk.js';
import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import ActionHandler from '../../../core/ui/input/action-handler.js';
import Cursor from '../../../core/ui/input/cursor.js';
import FocusManager from '../../../core/ui/input/focus-manager.js';
import { PlotCursor } from '../../../core/ui/input/plot-cursor.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { C as ComponentID } from '../../../core/ui/utilities/utilities-component-id.chunk.js';
import { NetworkUtilities } from '../../../core/ui/utilities/utilities-network.js';
import { V as ViewManager } from '../../../core/ui/views/view-manager.chunk.js';
import { RaiseDiplomacyEvent } from '../diplomacy/diplomacy-events.js';
import { U as UnitMapDecorationSupport } from '../interface-modes/support-unit-map-decoration.chunk.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/panel-support.chunk.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/shell/mp-legal/mp-legal.js';
import '../../../core/ui/events/shell-events.chunk.js';
import '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-dom.chunk.js';
import '../../../core/ui/utilities/utilities-liveops.js';
import '../../../core/ui/utilities/utilities-network-constants.chunk.js';
import '../utilities/utilities-overlay.chunk.js';

class WorldInputSingleton {
  selectedPlot = null;
  canUnitSelect = true;
  canCitySelect = true;
  defaultPlotSelectionHandler = (location, previousLocation) => {
    return this.handleSelectedPlot(location, previousLocation);
  };
  plotSelectionHandler = this.defaultPlotSelectionHandler;
  warHandlers = [];
  uiDisableWorldInputListener = () => {
    Camera.setPreventMouseCameraMovement(true);
  };
  // disable all input
  uiEnableWorldInputListener = () => {
    Camera.setPreventMouseCameraMovement(false);
  };
  // enable all input
  uiDisableWorldCityInputListener = () => {
    this.canCitySelect = false;
  };
  // disable city input only
  uiEnableWorldCityInputListener = () => {
    this.canCitySelect = true;
  };
  // enable city input
  uiDisableWorldUnitInputListener = () => {
    this.canUnitSelect = false;
  };
  // disable unit input only
  uiEnableWorldUnitInputListener = () => {
    this.canUnitSelect = true;
  };
  // enable unit input
  constructor() {
    engine.whenReady.then(() => {
      this.onReady();
    });
  }
  onReady() {
    window.addEventListener("ui-disable-world-input", this.uiDisableWorldInputListener);
    window.addEventListener("ui-enable-world-input", this.uiEnableWorldInputListener);
    window.addEventListener("ui-disable-world-city-input", this.uiDisableWorldCityInputListener);
    window.addEventListener("ui-enable-world-city-input", this.uiEnableWorldCityInputListener);
    window.addEventListener("ui-disable-world-unit-input", this.uiDisableWorldUnitInputListener);
    window.addEventListener("ui-enable-world-unit-input", this.uiEnableWorldUnitInputListener);
    ViewManager.isWorldInputAllowed = false;
    engine.on("GameStarted", this.onGameStarted, this);
  }
  /**
   * Should be raised when player hits the "start" button from the loading screen.
   * Also is raised during a hotload.
   */
  onGameStarted() {
    ViewManager.isWorldInputAllowed = true;
  }
  /**
   * @returns true if still live, false if input should stop.
   */
  handleInput(inputEvent) {
    switch (inputEvent.detail.name) {
      case "mousebutton-left":
        return this.actionActivate(inputEvent);
      case "accept":
        return this.actionActivate(inputEvent);
      case "touch-tap":
        return this.handleTouchTap(inputEvent);
      case "mousebutton-right":
        return this.actionMouseRightButton(inputEvent);
      case "swap-plot-selection":
        return this.swapPlotSelection(inputEvent);
      case "cancel":
        return this.actionCancel(inputEvent);
      case "shell-action-5":
        return this.onSocialPanel(inputEvent);
    }
    return true;
  }
  /**
   * @returns true if still live, false if input should stop.
   */
  handleNavigation(_navigationEvent) {
    return true;
  }
  trySelectPlot(isOnUI) {
    const coord = PlotCursor.plotCursorCoords;
    if (isOnUI || coord == null || !FocusManager.isWorldFocused() && InterfaceMode.isInInterfaceMode("INTERFACEMODE_DEFAULT")) {
      console.log(`World Input: Fail because isOnUI (${isOnUI}), plot (${PlotCursor.plotCursorCoords == null}) `);
      return true;
    }
    console.log(`World Input: Selected plot '${coord.x},${coord.y}'`);
    this.selectPlot(coord);
    return false;
  }
  /**
   * @returns true if still live, false if input should stop.
   */
  actionActivate(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return true;
    }
    return this.trySelectPlot(Cursor.isOnUI);
  }
  isOnUI(x, y) {
    const target = document.elementFromPoint(x, y);
    return !(target == document.documentElement || target == document.body || target == null || target.hasAttribute("data-pointer-passthrough"));
  }
  handleTouchTap(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return true;
    }
    const isOnUI = this.isOnUI(inputEvent.detail.x, inputEvent.detail.y);
    return this.trySelectPlot(isOnUI);
  }
  actionCancel(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return true;
    }
    if (Cursor.isOnUI) {
      return true;
    }
    InterfaceMode.switchToDefault();
    this.unselectPlot();
    return false;
  }
  /**
   * @returns true if still live, false if input should stop.
   */
  actionMouseRightButton(inputEvent) {
    if (UI.getViewExperience() == UIViewExperience.VR) {
      if (ActionHandler.isGamepadActive) {
        return true;
      }
    }
    if (PlotCursor.plotCursorCoords == null) {
      return true;
    }
    if (UI.getViewExperience() != UIViewExperience.VR) {
      if (!ContextManager.canUseInput("world-input", "action-target") || !ViewManager.isWorldInputAllowed) {
        return true;
      }
    }
    if (inputEvent.detail.status == InputActionStatuses.FINISH) {
      this.doActionOnPlot(PlotCursor.plotCursorCoords);
      UnitMapDecorationSupport.manager.showDesiredDestination = false;
      UnitMapDecorationSupport.manager.update(PlotCursor.plotCursorCoords);
    } else if (inputEvent.detail.status == InputActionStatuses.START) {
      const headSelectedUnit = UI.Player.getHeadSelectedUnit();
      if (headSelectedUnit) {
        UnitMapDecorationSupport.manager.showDesiredDestination = true;
        UnitMapDecorationSupport.manager.update(PlotCursor.plotCursorCoords);
      }
    }
    return false;
  }
  onSocialPanel(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return true;
    }
    if (ContextManager.canOpenPauseMenu()) {
      NetworkUtilities.openSocialPanel();
      return false;
    }
    return true;
  }
  /**
   * Swap the selection between units and city in the same plot.
   * @returns true if still live, false if input should stop.
   */
  swapPlotSelection(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return true;
    }
    const selectedUnit = UI.Player.getHeadSelectedUnit();
    if (!selectedUnit || selectedUnit.owner != GameContext.localPlayerID) {
      return true;
    }
    const unit = Units.get(selectedUnit);
    if (!unit) {
      return true;
    }
    let unitsList = MapUnits.getUnits(unit.location.x, unit.location.y);
    const districtId = MapCities.getDistrict(unit.location.x, unit.location.y);
    unitsList = unitsList.filter((u) => u.owner == GameContext.localPlayerID);
    if (selectedUnit && ComponentID.isValid(selectedUnit) && (unitsList.length > 1 || districtId)) {
      let targetIndex = 0;
      for (let i = 0; i < unitsList.length; i++) {
        if (unitsList[i].id == selectedUnit?.id) {
          targetIndex = i + 1;
          break;
        }
      }
      if (targetIndex > unitsList.length - 1) {
        if (districtId && ComponentID.isValid(districtId)) {
          if (this.isDistrictSelectable(districtId)) {
            const district = Districts.get(districtId);
            if (district) {
              if (district.cityId) {
                const city = Cities.get(district.cityId);
                if (city && city.owner == GameContext.localPlayerID) {
                  UI.Player.selectCity(district.cityId);
                } else {
                  this.handleSelectedPlotCity({ x: unit.location.x, y: unit.location.y });
                }
                return false;
              } else {
                this.handleSelectedPlotCity({ x: unit.location.x, y: unit.location.y });
                return false;
              }
            }
          }
        }
        targetIndex = 0;
      }
      UI.Player.selectUnit(unitsList[targetIndex]);
    }
    return false;
  }
  isDistrictSelectable(districtId) {
    if (districtId && ComponentID.isValid(districtId)) {
      const district = Districts.get(districtId);
      if (district) {
        const owningPlayer = Players.get(district.owner);
        if (owningPlayer) {
          if (district.cityId && district.type == DistrictTypes.CITY_CENTER || owningPlayer.isIndependent) {
            return true;
          }
        }
      }
    }
    return false;
  }
  setPlotSelectionHandler(handler) {
    this.plotSelectionHandler = handler;
  }
  useDefaultPlotSelectionHandler() {
    this.plotSelectionHandler = this.defaultPlotSelectionHandler;
  }
  unselectPlot() {
    this.selectedPlot = null;
  }
  selectPlot(location) {
    const previousPlot = this.selectedPlot;
    this.selectedPlot = location;
    this.plotSelectionHandler(location, previousPlot);
  }
  /**
   * Default handler for clicking a plot with a unit potentially in it.
   * @param {PlotCoord} location a plot's x/y location in the world map.
   * @param {PlotCoord|null} previousPlot is the previous plot's x/y location in the world map or NULL if no previous plot was selected
   * @returns {boolean} true if input is still "live", false if "handled" and/or consumed
   */
  handleSelectedPlotUnit(location, previousPlot) {
    const localPlayerID = GameContext.localPlayerID;
    if (ActionHandler.isGamepadActive) {
      if (previousPlot == null || location.x != previousPlot.x || location.y != previousPlot.y) {
        const selectedUnit = UI.Player.getHeadSelectedUnit();
        if (selectedUnit && selectedUnit.owner == localPlayerID) {
          const unit = Units.get(selectedUnit);
          if (unit) {
            if (unit.location.x != location.x || unit.location.y != location.y) {
              this.doActionOnPlot(location);
              return false;
            }
          }
        }
      }
    }
    let units = MapUnits.getUnits(location.x, location.y);
    units = units.filter((u) => u.owner == localPlayerID);
    let selectedIndex = -1;
    const prevUnit = UI.Player.getHeadSelectedUnit();
    if (prevUnit && prevUnit.owner == localPlayerID) {
      selectedIndex = units.findIndex((u) => u.id == prevUnit.id);
    }
    selectedIndex++;
    if (selectedIndex > 0) {
      const cancelled = !window.dispatchEvent(
        new CustomEvent("unit-reselected", { bubbles: false, cancelable: true, detail: location })
      );
      if (cancelled) {
        return false;
      }
    }
    if (selectedIndex < units.length) {
      const newSelection = units[selectedIndex];
      UI.Player.selectUnit(newSelection);
      UI.sendAudioEvent(Audio.getSoundTag("data-audio-activate"));
      return false;
    }
    return true;
  }
  /**
   * Handle selecting the city at the given plot
   * @param {PlotCoord} location a plot's x/y location in the world map.
   * @returns {boolean} true if input is still live, false otherwise
   */
  handleSelectedPlotCity(location) {
    const localPlayerID = GameContext.localPlayerID;
    const districtId = MapCities.getDistrict(location.x, location.y);
    if (districtId) {
      const district = Districts.get(districtId);
      if (district) {
        if (district.cityId && district.type == DistrictTypes.CITY_CENTER) {
          const city = Cities.get(district.cityId);
          if (city) {
            if (city.owner == localPlayerID) {
              UI.sendAudioEvent(Audio.getSoundTag("data-audio-activate"));
              UI.Player.selectCity(district.cityId);
              return false;
            } else {
              const otherPlayer = Players.get(city.owner);
              if (!otherPlayer) {
                console.error("world-input: Invalid player library for owner of clicked city.");
                return false;
              }
              if (otherPlayer.isMajor || otherPlayer.isMinor) {
                if (!Game.Diplomacy.hasMet(localPlayerID, city.owner)) {
                  return false;
                }
                window.dispatchEvent(new RaiseDiplomacyEvent(city.owner));
              }
              return false;
            }
          }
        } else if (Players.get(district.owner)?.isIndependent) {
          if (!Game.Diplomacy.hasMet(localPlayerID, district.owner)) {
            return false;
          }
          window.dispatchEvent(new RaiseDiplomacyEvent(district.owner));
          return false;
        }
      }
    }
    const prevUnit = UI.Player.getHeadSelectedUnit();
    if (prevUnit && prevUnit.owner == localPlayerID) {
      const unit = Units.get(prevUnit);
      if (!unit) {
        console.error(
          "world-input.ts: Unable to retrieve Unit object for unit with id: " + ComponentID.toLogString(prevUnit)
        );
        InterfaceMode.switchToDefault();
        return true;
      }
      if (unit.location.x != location.x || unit.location.y != location.y) {
        return false;
      }
    }
    InterfaceMode.switchToDefault();
    return true;
  }
  /**
   * Default handler if a player has clicked on the world.
   * Attempts to select a unit first, if all units in plot have had a chance, loops around to any city selection.
   * @param {PlotCoord} location a plot's x/y location in the world map.
   * @param {PlotCoord|null} previousPlot is the previous plot's x/y location in the world map or NULL if no previous plot was selected
   * @returns {boolean} true if input is still "live", false if "handled" and/or consumed
   */
  handleSelectedPlot(location, previousPlot) {
    if (!ViewManager.isWorldSelectingAllowed) {
      return true;
    }
    if (location.x == -1 || location.y == -1) {
      console.error(
        `World input: attempt to handle select plot with invalid coordinates (${location.x},${location.y})`
      );
      return true;
    }
    if (this.canUnitSelect && (ActionHandler.isGamepadActive || ActionHandler.deviceType == InputDeviceType.Touch)) {
      if (previousPlot == null || location.x != previousPlot.x || location.y != previousPlot.y) {
        const selectedUnit = UI.Player.getHeadSelectedUnit();
        if (selectedUnit && selectedUnit.owner == GameContext.localPlayerID) {
          const unit = Units.get(selectedUnit);
          if (unit && (unit.location.x != location.x || unit.location.y != location.y)) {
            this.doActionOnPlot(location);
            return false;
          }
        }
      }
    }
    if (GameplayMap.getRevealedState(GameContext.localPlayerID, location.x, location.y) == RevealedStates.HIDDEN) {
      return true;
    }
    let live = true;
    if (this.canUnitSelect) {
      live = this.handleSelectedPlotUnit(location, null);
    }
    if (live && this.canCitySelect) {
      live = this.handleSelectedPlotCity(location);
    }
    return live;
  }
  requestMoveOperation(unitComponentID, parameters) {
    const unit = Units.get(unitComponentID);
    if (!unit) {
      console.error("Request move on NULL unit at: ", parameters.X, ",", parameters.Y);
      return false;
    }
    parameters.Modifiers = UnitOperationMoveModifiers.NONE;
    const navalAttack = Game.UnitOperations?.canStart(
      unit.id,
      "UNITOPERATION_NAVAL_ATTACK",
      parameters,
      false
    );
    if (navalAttack.Success) {
      const operationCallback = () => {
        parameters.Modifiers = UnitOperationMoveModifiers.ATTACK + UnitOperationMoveModifiers.MOVE_IGNORE_UNEXPLORED_DESTINATION;
        UI.sendAudioEvent(Audio.getSoundTag("data-audio-unit-combat-confirmed", "interact-unit"));
        Game.UnitOperations?.sendRequest(unit.id, "UNITOPERATION_NAVAL_ATTACK", parameters);
      };
      if (this.checkDeclareWarAt(unit, parameters.X, parameters.Y, operationCallback)) {
        return true;
      }
      operationCallback();
    } else {
      const airAttack = Game.UnitOperations?.canStart(
        unit.id,
        "UNITOPERATION_AIR_ATTACK",
        parameters,
        false
      );
      if (airAttack.Success) {
        const operationCallback = () => {
          parameters.Modifiers = UnitOperationMoveModifiers.ATTACK + UnitOperationMoveModifiers.MOVE_IGNORE_UNEXPLORED_DESTINATION;
          UI.sendAudioEvent(Audio.getSoundTag("data-audio-unit-combat-confirmed", "interact-unit"));
          Game.UnitOperations?.sendRequest(unit.id, "UNITOPERATION_AIR_ATTACK", parameters);
        };
        if (this.checkDeclareWarAt(unit, parameters.X, parameters.Y, operationCallback)) {
          return true;
        }
        operationCallback();
      } else {
        const combatType = Game.Combat.testAttackInto(unit.id, parameters);
        if (combatType == CombatTypes.COMBAT_RANGED) {
          const operationCallback = () => {
            const result = Game.UnitOperations?.canStart(
              unit.id,
              "UNITOPERATION_RANGE_ATTACK",
              parameters,
              false
            );
            if (result.Success) {
              parameters.Modifiers = UnitOperationMoveModifiers.ATTACK + UnitOperationMoveModifiers.MOVE_IGNORE_UNEXPLORED_DESTINATION;
              Game.UnitOperations?.sendRequest(unit.id, "UNITOPERATION_RANGE_ATTACK", parameters);
              UI.sendAudioEvent(Audio.getSoundTag("data-audio-unit-combat-confirmed", "interact-unit"));
              return true;
            }
            return false;
          };
          if (this.checkDeclareWarAt(unit, parameters.X, parameters.Y, operationCallback)) {
            return true;
          }
          return operationCallback();
        } else {
          const canOverrun = Game.UnitCommands?.canStart(
            unit.id,
            "UNITCOMMAND_ARMY_OVERRUN",
            parameters,
            false
          );
          if (canOverrun.Success) {
            Game.UnitCommands?.sendRequest(unit.id, "UNITCOMMAND_ARMY_OVERRUN", parameters);
            UI.sendAudioEvent(Audio.getSoundTag("data-audio-unit-combat-confirmed", "interact-unit"));
          } else {
            if (parameters.X != unit.location.x || parameters.Y != unit.location.y) {
              const canSwap = Game.UnitOperations?.canStart(
                unit.id,
                "UNITOPERATION_SWAP_UNITS",
                parameters,
                false
              );
              if (canSwap.Success) {
                Game.UnitOperations?.sendRequest(unit.id, "UNITOPERATION_SWAP_UNITS", parameters);
              } else {
                if (combatType == CombatTypes.NO_COMBAT) {
                  UI.sendAudioEvent(
                    Audio.getSoundTag("data-audio-unit-move-confirmed", "interact-unit")
                  );
                } else {
                  UI.sendAudioEvent(
                    Audio.getSoundTag("data-audio-unit-combat-confirmed", "interact-unit")
                  );
                }
                const operationCallback = () => {
                  parameters.Modifiers = UnitOperationMoveModifiers.ATTACK + UnitOperationMoveModifiers.MOVE_IGNORE_UNEXPLORED_DESTINATION;
                  const result = Game.UnitOperations.canStart(
                    unit.id,
                    UnitOperationTypes.MOVE_TO,
                    parameters,
                    false
                  );
                  if (!result.Success) {
                    return false;
                  }
                  Game.UnitOperations?.sendRequest(unit.id, UnitOperationTypes.MOVE_TO, parameters);
                  return true;
                };
                if (this.checkDeclareWarAt(unit, parameters.X, parameters.Y, operationCallback)) {
                  return true;
                }
                return operationCallback();
              }
            }
          }
        }
      }
    }
    return false;
  }
  /**
   * Check for units and proceed to handleSelection, otherwise return to interface modes PlotSelectionHandler
   * @param {PlotCoord} location a plot's x/y location in the world map.
   * @param {PlotCoord|null} previousPlot is the previous plot's x/y location in the world map or NULL if no previous plot was selected
   */
  handleChoosePlotWithUnits(location, previousPlot) {
    let units = MapUnits.getUnits(location.x, location.y);
    units = units.filter((u) => u.owner == GameContext.localPlayerID);
    if (units.length > 0) {
      this.handleSelectedPlotUnit(location, previousPlot);
      return true;
    }
    return false;
  }
  checkDeclareWarAt(attackingUnit, x, y, postDeclareWarAction) {
    const warDeclarationTarget = {
      player: PlayerIds.NO_PLAYER,
      independentIndex: IndependentTypes.NO_INDEPENDENT
    };
    const playerDiplomacy = Players.get(attackingUnit.owner)?.Diplomacy;
    const targetLocation = { x, y };
    if (playerDiplomacy) {
      const result = playerDiplomacy.willMoveStartWar(attackingUnit.id, targetLocation);
      if (result.Success) {
        if (result.Player2 != void 0) {
          warDeclarationTarget.player = result.Player2;
        }
      }
    }
    if (warDeclarationTarget.player != PlayerIds.NO_PLAYER) {
      const length = this.warHandlers.length;
      for (let i = 0; i < length; i++) {
        const callback = this.warHandlers[i];
        if (callback(warDeclarationTarget, postDeclareWarAction)) {
          break;
        }
      }
      return true;
    }
    return false;
  }
  /**
   * Add a handler for when war may be declared.
   * @param warHandler callback function to raise.
   */
  addWarHandler(warHandler) {
    const found = this.warHandlers.some((existingHandler) => {
      if (existingHandler == warHandler) {
        return true;
      }
      return false;
    });
    if (!found) {
      this.warHandlers.push(warHandler);
    } else {
      console.error("Duplicate war handler registration attempted on the world input.");
    }
  }
  // Use the target as an action for any selected object
  doActionOnPlot(location) {
    const headSelectedUnit = UI.Player.getHeadSelectedUnit();
    let operationName = "UNITOPERATION_MOVE_TO";
    if (headSelectedUnit) {
      const args = {};
      args.X = location.x;
      args.Y = location.y;
      this.requestMoveOperation(headSelectedUnit, args);
    } else {
      operationName = "NONE";
    }
    const detail = {
      plotCoordinates: location,
      operation: operationName
    };
    window.dispatchEvent(new CustomEvent("action-on-plot", { bubbles: true, detail }));
    this.unselectPlot();
  }
}
const WorldInput = new WorldInputSingleton();

export { WorldInput as default };
//# sourceMappingURL=world-input.js.map

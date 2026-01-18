import { A as Audio } from '../../../core/ui/audio-base/audio-support.chunk.js';
import { F as FxsActivatable } from '../../../core/ui/components/fxs-activatable.chunk.js';
import FocusManager from '../../../core/ui/input/focus-manager.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { P as Panel } from '../../../core/ui/panel-support.chunk.js';
import { C as ComponentID } from '../../../core/ui/utilities/utilities-component-id.chunk.js';
import { a as formatStringArrayAsNewLineText } from '../../../core/ui/utilities/utilities-core-textprovider.chunk.js';
import { Icon } from '../../../core/ui/utilities/utilities-image.chunk.js';
import { U as UpdateGate } from '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import { V as ViewManager } from '../../../core/ui/views/view-manager.chunk.js';
import { UnitActionCategory } from '../unit-actions/unit-actions.js';
import { UnitActionHandlers } from '../unit-interact/unit-action-handlers.js';
import UnitSelection from '../unit-selection/unit-selection.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/input/focus-support.chunk.js';
import '../../../core/ui/components/fxs-slot.chunk.js';
import '../../../core/ui/spatial/spatial-manager.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/input/plot-cursor.js';
import '../../../core/ui/utilities/utilities-dom.chunk.js';
import '../../../core/ui/utilities/utilities-layout.chunk.js';
import '../lenses/layer/operation-target-layer.js';
import '../../../core/ui/lenses/lens-manager.chunk.js';
import '../unit-rename/unit-rename.js';
import '../../../core/ui/components/fxs-textbox.chunk.js';
import '../world-input/world-input.js';
import '../../../core/ui/utilities/utilities-network.js';
import '../../../core/ui/shell/mp-legal/mp-legal.js';
import '../../../core/ui/events/shell-events.chunk.js';
import '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import '../../../core/ui/utilities/utilities-liveops.js';
import '../../../core/ui/utilities/utilities-network-constants.chunk.js';
import '../diplomacy/diplomacy-events.js';
import '../interface-modes/support-unit-map-decoration.chunk.js';
import '../utilities/utilities-overlay.chunk.js';

class CommanderInteractModel {
  _registeredComponents = [];
  armyCommanders = [];
  availableReinforcementIDs = [];
  _index = 0;
  // Model Data
  _name = "";
  _experience = null;
  _hasExperience = false;
  _hasPackedUnits = false;
  _hasActions = false;
  _hasData = false;
  _currentArmyCommander = null;
  _availableReinforcements = [];
  _commanderActions = [];
  _OnUpdate;
  updateGate = new UpdateGate(() => {
    this.update();
  });
  constructor() {
    engine.whenReady.then(() => {
      this.updateGate.call("init");
      engine.on("UnitSelectionChanged", this.onUnitSelectionChanged, this);
    });
  }
  set updateCallback(callback) {
    this._OnUpdate = callback;
  }
  registerListener(c) {
    if (this._registeredComponents.length == 0) {
      engine.on("UnitAddedToMap", this.onUnitAddedRemoved, this);
      engine.on("UnitRemovedFromMap", this.onUnitAddedRemoved, this);
      engine.on("UnitAddedToArmy", this.onUnitArmyChange, this);
      engine.on("UnitRemovedFromArmy", this.onUnitArmyChange, this);
      engine.on("UnitExperienceChanged", this.onUnitExperienceChanged, this);
    }
    this._registeredComponents.push(c);
  }
  unregisterListener(c) {
    const raiseIndex = this._registeredComponents.findIndex((listener) => {
      return listener == c;
    });
    this._registeredComponents.splice(raiseIndex, 1);
    if (this._registeredComponents.length == 0) {
      engine.off("UnitAddedToMap", this.onUnitAddedRemoved, this);
      engine.off("UnitRemovedFromMap", this.onUnitAddedRemoved, this);
      engine.off("UnitAddedToArmy", this.onUnitArmyChange, this);
      engine.off("UnitRemovedFromArmy", this.onUnitArmyChange, this);
      engine.off("UnitExperienceChanged", this.onUnitExperienceChanged, this);
    }
  }
  get name() {
    return this._name;
  }
  get experience() {
    return this._experience;
  }
  get hasExperience() {
    return this._hasExperience;
  }
  get hasPackedUnits() {
    return this._hasPackedUnits;
  }
  get hasActions() {
    return this._hasActions;
  }
  get hasData() {
    return this._hasData;
  }
  get currentArmyCommander() {
    return this._currentArmyCommander;
  }
  get availableReinforcements() {
    return this._availableReinforcements;
  }
  get commanderActions() {
    return this._commanderActions;
  }
  update() {
    this.availableReinforcementIDs = [];
    this._availableReinforcements = [];
    const localPlayerID = GameContext.localPlayerID;
    const player = Players.get(localPlayerID);
    if (!player) {
      console.error("model-commander-interact: Local player not found");
      return;
    }
    const playerUnits = player.Units;
    if (playerUnits == void 0) {
      return;
    }
    this.updateArmyData();
    this._hasData = this.armyCommanders.length > 0;
    if (!this._hasData) {
      this._name = "LOC_UI_COMMANDER_NO_AVAILABLE";
      this._hasPackedUnits = false;
      this._hasActions = false;
      this._hasExperience = false;
      return;
    }
    this._currentArmyCommander = this.armyCommanders[this._index];
    this._name = this._currentArmyCommander.commander.name;
    this._hasPackedUnits = this._currentArmyCommander.packedUnits.length > 0;
    const commanderLocation = this._currentArmyCommander.commander.location;
    if (commanderLocation.x >= 0 && commanderLocation.y >= 0 && this.currentArmyCommander?.commander.isReadyToSelect) {
      UI.Player.selectUnit(this._currentArmyCommander.commander.id);
    }
    const experience = this._currentArmyCommander.commanderExperience;
    if (!experience) {
      this._hasExperience = false;
      this._experience = null;
    } else {
      this._hasExperience = true;
      const currentExperience = experience.experiencePoints;
      const experienceToNextLevel = experience.experienceToNextLevel;
      const normalizedXpProgress = Math.min(1, currentExperience / experienceToNextLevel);
      const experienceProgress = normalizedXpProgress * 100 + "%";
      const experienceCaption = `${Locale.compose("LOC_PROMOTION_EXPERIENCE")}: ${currentExperience}/${experienceToNextLevel}`;
      this._experience = {
        progress: experienceProgress,
        caption: experienceCaption
      };
    }
    if (!this.currentArmyCommander) {
      console.error("model-commander-interact: current army commander not set");
      return;
    }
    for (let i = 0; i < this.availableReinforcementIDs.length; i++) {
      const unitID = this.availableReinforcementIDs[i];
      const args = {};
      const result = Game.UnitOperations.canStart(
        unitID,
        "UNITOPERATION_REINFORCE_ARMY",
        args,
        false
      );
      if (result.Success && result.Units) {
        const commanderId = this.currentArmyCommander.commander.localId;
        const unitId = result.Units.find((id) => {
          return id == commanderId;
        });
        if (!unitId) {
          continue;
        }
      }
      const unit = Units.get(unitID);
      if (!unit) {
        console.error("model-commander-interact: No unit with id: " + unitID);
        return;
      }
      const playerArmies = player.Armies;
      if (!playerArmies) {
        console.error("model-commander-interact: No PlayerArmy defined for player with id: " + player.id);
        return;
      }
      const reinforcementPathPlots = playerArmies.getUnitReinforcementPath(unitID, localPlayerID);
      const reinforcementETA = playerArmies.getUnitReinforcementETA(unitID, localPlayerID);
      const startLocation = playerArmies.getUnitReinforcementStartLocation(unitID, localPlayerID);
      const armyId = playerArmies.getUnitReinforcementCommanderId(unitID, localPlayerID);
      const armyCommander = this.armyCommanders.find((c) => {
        return c.army.localId == armyId;
      });
      const unitCurrentLocation = unit.location;
      const pathToCommander = Units.getPathTo(
        unitID,
        this.currentArmyCommander.commander.location
      );
      const turnsToCurrentCommander = Math.max(...pathToCommander.turns, 0);
      const location = startLocation.x >= 0 && startLocation.y >= 0 ? startLocation : unitCurrentLocation;
      const arrivalTime = reinforcementETA > 0 ? reinforcementETA : turnsToCurrentCommander;
      const reinforcementPath = {
        plots: reinforcementPathPlots,
        turns: [reinforcementETA],
        obstacles: []
      };
      const path = pathToCommander.plots.length > 0 ? pathToCommander : reinforcementPath;
      const reinforcementItem = {
        unitID,
        armyID: armyId,
        startLocation: location,
        path,
        arrivalTime,
        commanderToReinforce: armyCommander?.commander,
        isTraveling: !unit.isOnMap
      };
      this._availableReinforcements.push(reinforcementItem);
    }
    const commander = this.currentArmyCommander.commander || null;
    if (!commander) {
      console.warn("model-commander-interact: Couldn't find commander unit");
      return;
    }
    const actions = this.getUnitActions(commander);
    const commanderActions = actions.filter((action) => {
      return action.UICategory == UnitActionCategory.COMMAND || action.type == "UNITCOMMAND_PROMOTE";
    });
    commanderActions.forEach((action, index) => action.priority = index);
    this._commanderActions = commanderActions;
    this._hasActions = this.commanderActions.length > 0;
    if (this._OnUpdate) {
      this._OnUpdate(this);
    }
    this._registeredComponents.forEach((c) => {
      c.updateCallback();
    });
  }
  setName(name) {
    this._name = name;
    if (this._OnUpdate) {
      this._OnUpdate(this);
    }
  }
  setArmyCommander(unitID) {
    const selectedIndex = this.armyCommanders.findIndex((c) => {
      return ComponentID.isMatch(c.commander.id, unitID);
    });
    if (selectedIndex != void 0 && selectedIndex >= 0) {
      this._index = selectedIndex;
      this.update();
    }
  }
  getCommanderReinforcementItem(unitID) {
    return this.availableReinforcements.find((r) => {
      return ComponentID.isMatch(unitID, r.unitID);
    });
  }
  // update reinforcements, packed units, and commander
  updateArmyData() {
    this.armyCommanders = [];
    const player = Players.get(GameContext.localPlayerID);
    if (!player) {
      console.error("model-commander-interact: Local player not found");
      return;
    }
    const playerUnits = player.Units;
    if (playerUnits == void 0) {
      return;
    }
    const unitIDs = playerUnits.getUnitIds();
    for (const unitID of unitIDs) {
      const unit = Units.get(unitID);
      const args = {};
      const result = Game.UnitOperations.canStart(
        unitID,
        "UNITOPERATION_REINFORCE_ARMY",
        args,
        false
      );
      const reinforcementId = player.Armies?.getUnitReinforcementCommanderId(
        unitID,
        GameContext.localPlayerID
      );
      if (result.Success || reinforcementId != -1) {
        this.availableReinforcementIDs.push(unitID);
      }
      if (unit != null && unit.isCommanderUnit) {
        const commanderExperience = unit.Experience;
        const armyId = unit.armyId;
        const army = Armies.get(armyId);
        if (!army) {
          console.error("model-commander-interact: No army defined for commander with id: " + unitID);
          return;
        }
        const armyUnitIds = army.getUnitIds();
        const packedUnits = armyUnitIds.reduce((result2, unitId) => {
          const unit2 = Units.get(unitId);
          if (unit2) {
            result2.push(unit2);
          }
          return result2;
        }, new Array());
        this.armyCommanders.push({
          commander: unit,
          commanderExperience,
          army,
          packedUnits
        });
      }
    }
  }
  onUnitAddedRemoved(data) {
    if (data.unit.owner == GameContext.localPlayerID) {
      this.updateGate.call("onUnitAddedRemoved");
    }
  }
  onUnitArmyChange(data) {
    if (ComponentID.isValid(data.initiatingUnit)) {
      const unit = Units.get(data.initiatingUnit);
      if (!unit) {
        console.error(
          "model-commander-interact: onUnitArmyChange: Unable to retrieve unit object for unit with id: " + data.initiatingUnit.id.toString()
        );
        return;
      }
      this.updateGate.call("onUnitArmyChange");
    }
  }
  onUnitExperienceChanged(data) {
    if (ComponentID.isMatch(data.unit, UI.Player.getHeadSelectedUnit())) {
      const unit = Units.get(data.unit);
      if (!unit) {
        console.error(
          "model-commander-interact: onUnitExperienceChanged: Unable to retrieve unit object for unit with id: " + data.unit.id.toString()
        );
        return;
      }
      this.updateGate.call("onUnitExperienceChanged");
    }
  }
  onUnitSelectionChanged(event) {
    if (!ViewManager.isUnitSelectingAllowed) {
      return;
    }
    if (event.unit.owner == GameContext.localPlayerID && event.selected) {
      const unitComponentID = UI.Player.getHeadSelectedUnit();
      if (!ComponentID.isValid(unitComponentID)) {
        console.warn(
          "model-commander-interact: onUnitSelectionChanged: Unit selected message signaled but no head selected unit!"
        );
        return;
      }
      if (ComponentID.isMatch(unitComponentID, event.unit)) {
        const unit = Units.get(event.unit);
        if (unit && unit.isCommanderUnit) {
          this.updateArmyData();
          this.setArmyCommander(event.unit);
        }
      }
    }
  }
  getUnitActions(unit) {
    const actions = [];
    const processOperation = (operation, unitAbility = null) => {
      const parameters = {
        X: -9999,
        // PlotCoord.Range.INVALID_X
        Y: -9999
        // PlotCoord.Range.INVALID_Y
      };
      parameters.UnitAbilityType = unitAbility ? unitAbility.$index : -1;
      if (operation.OperationType == "UNITOPERATION_WMD_STRIKE") {
        parameters.Type = Database.makeHash("WMD_NUCLEAR_DEVICE");
      }
      const result = Game.UnitOperations?.canStart(
        unit.id,
        operation.OperationType,
        parameters,
        true
      );
      const enabled = Game.UnitOperations?.canStart(
        unit.id,
        operation.OperationType,
        parameters,
        false
      );
      let annotation = "";
      switch (operation.OperationType) {
        case "UNITOPERATION_MOVE_TO":
          annotation = `${unit.Movement?.movementMovesRemaining.toString()}/${unit.Movement?.maxMoves.toString()}`;
          break;
        case "UNITOPERATION_RANGE_ATTACK":
          annotation = unit.Combat?.attacksRemaining.toString();
          break;
        default:
          annotation = "";
          break;
      }
      if (result.Success) {
        let name = "[ERR] Ability (Operation) Unknown";
        let icon = operation.Icon;
        if (unitAbility) {
          const keywordAbilityDef = unitAbility.KeywordAbilityType ? GameInfo.KeywordAbilities.lookup(unitAbility.KeywordAbilityType) : null;
          if (keywordAbilityDef?.IconString) {
            icon = keywordAbilityDef.IconString;
          }
          const nameKey = unitAbility.Name ?? keywordAbilityDef?.Summary ?? "";
          name = Locale.compose(nameKey, unitAbility.KeywordAbilityValue ?? -1);
          let abilityDesc = "";
          if (unitAbility.Description) {
            if (keywordAbilityDef) {
              abilityDesc = Locale.compose(keywordAbilityDef.Summary, unitAbility.KeywordAbilityValue ?? -1) + ": ";
            }
            abilityDesc += Locale.compose(unitAbility.Description, unitAbility.KeywordAbilityValue ?? -1);
          } else if (keywordAbilityDef) {
            abilityDesc = Locale.compose(
              keywordAbilityDef.FullDescription,
              unitAbility.KeywordAbilityValue ?? -1
            );
          }
          if (abilityDesc) {
            name += "<br><br>" + abilityDesc;
          }
        } else {
          name = Locale.compose(operation.Description);
        }
        if (enabled.AdditionalDescription) {
          const addlDescString = formatStringArrayAsNewLineText(enabled.AdditionalDescription);
          name += "<br><p>" + addlDescString + "</p>";
        }
        if (!enabled.Success) {
          if (enabled.FailureReasons) {
            const failureString = formatStringArrayAsNewLineText(enabled.FailureReasons);
            name += "<br><p style='color:orange;'>" + failureString + "</p>";
          }
        }
        if (this.isTargetPlotOperation(operation.OperationType)) {
          const unitAction = {
            name,
            icon,
            type: operation.OperationType,
            annotation,
            active: enabled.Success,
            requireConfirm: enabled.RequiresConfirmation ? enabled.RequiresConfirmation : false,
            confirmTitle: enabled.ConfirmDialogTitle,
            confirmBody: enabled.ConfirmDialogBody,
            UICategory: UnitActionCategory.NONE,
            priority: operation.PriorityInUI ? operation.PriorityInUI : 0,
            callback: (_location) => {
              if (enabled.Success) {
                parameters.X = _location.x;
                parameters.Y = _location.y;
                Game.UnitOperations?.sendRequest(unit.id, operation.OperationType, parameters);
              }
            }
          };
          if (UnitActionHandlers.doesActionHaveHandler(operation.OperationType)) {
            unitAction.callback = (_location) => {
              if (enabled.Success) {
                UnitActionHandlers.switchToActionInterfaceMode(operation.OperationType, {
                  UnitID: unit.id
                });
              }
            };
          }
          actions.push(unitAction);
        } else {
          actions.push({
            name,
            icon,
            type: operation.OperationType,
            annotation,
            active: enabled.Success,
            requireConfirm: enabled.RequiresConfirmation ? enabled.RequiresConfirmation : false,
            confirmTitle: enabled.ConfirmDialogTitle,
            confirmBody: enabled.ConfirmDialogBody,
            UICategory: UnitActionCategory.NONE,
            priority: operation.PriorityInUI ? operation.PriorityInUI : 0,
            callback: (_location) => {
              if (enabled.Success) {
                parameters.X = _location.x;
                parameters.Y = _location.y;
                Game.UnitOperations?.sendRequest(unit.id, operation.OperationType, parameters);
                InterfaceMode.switchToDefault();
              }
            }
          });
        }
      }
    };
    GameInfo.UnitOperations.forEach((operation) => {
      if (!operation.VisibleInUI) {
        return;
      }
      const unitAbilities = this.getUnitAbilitiesForOperationOrCommand(
        operation.OperationType
      );
      if (unitAbilities.length > 0) {
        for (const unitAbility of unitAbilities) {
          processOperation(operation, unitAbility);
        }
      } else {
        processOperation(operation);
      }
    });
    const processCommand = (command, unitAbility = null) => {
      let parameters = {
        X: -9999,
        // PlotCoord.Range.INVALID_X
        Y: -9999
        // PlotCoord.Range.INVALID_Y
      };
      parameters.UnitAbilityType = unitAbility ? unitAbility.$index : -1;
      const result = Game.UnitCommands?.canStart(unit.id, command.CommandType, parameters, true);
      const enabled = Game.UnitCommands?.canStart(
        unit.id,
        command.CommandType,
        parameters,
        false
      );
      let annotation;
      switch (command.CommandType) {
        case "UNITCOMMAND_CONSTRUCT":
          if (enabled.BestConstructible) {
            parameters = {
              ConstructibleType: enabled.BestConstructible
            };
          }
          break;
        //TODO: Convert Pack Army, Unpack Army, and Promote to always show but disabled when unavailable
        //TODO: Make available a way to keep more actions visible but disabled, so the player is aware of what a unit can do (even if it can't be done in the current context)
        // Always show these common Commander actions
        case "UNITCOMMAND_PACK_ARMY":
          if (unit.isCommanderUnit) {
            result.Success = true;
          }
          break;
        case "UNITCOMMAND_UNPACK_ARMY":
          if (unit.isCommanderUnit) {
            result.Success = true;
          }
          break;
        // Should be able to open Promotion window regardless of whether you can promote or not
        case "UNITCOMMAND_PROMOTE":
          if (unit.isCommanderUnit) {
            result.Success = true;
            enabled.Success = true;
          }
          break;
        default:
          annotation = "";
          break;
      }
      if (result.Success) {
        let commandText = command.Description ? Locale.compose(command.Description) : "";
        let icon = "";
        if (unitAbility?.KeywordAbilityType) {
          const keywordAbilityDef = GameInfo.KeywordAbilities.lookup(unitAbility.KeywordAbilityType);
          if (keywordAbilityDef) {
            commandText = Locale.compose(keywordAbilityDef.Summary, unitAbility.KeywordAbilityValue ?? -1);
            icon = keywordAbilityDef.IconString ?? command.Icon;
          } else {
            commandText = "[ERR] Unknown Keyword Ability";
          }
        } else {
          if (unitAbility?.Name) {
            commandText = Locale.compose(unitAbility.Name);
          }
          icon = command.Icon;
        }
        if (enabled.AdditionalDescription) {
          const addlDescString = formatStringArrayAsNewLineText(enabled.AdditionalDescription);
          commandText += "<br><p>" + addlDescString + "</p>";
        }
        if (!enabled.Success) {
          if (enabled.FailureReasons) {
            const failureString = formatStringArrayAsNewLineText(enabled.FailureReasons);
            commandText += "<br><p style='color:orange;'>" + failureString + "</p>";
          }
        } else {
          if (enabled.BestConstructible) {
            const constructibleInfo = GameInfo.Constructibles.lookup(
              enabled.BestConstructible
            );
            if (constructibleInfo) {
              let constructibleText = Locale.compose(constructibleInfo.Name);
              if (constructibleInfo.Description) {
                constructibleText += ": " + Locale.compose(constructibleInfo.Description);
              }
              commandText += "<br><p style='color:cyan;'>" + constructibleText + "</p>";
            }
          }
        }
        if (this.isTargetPlotOperation(command.CommandType)) {
          const unitAction = {
            name: commandText,
            icon,
            type: command.CommandType,
            annotation,
            active: enabled.Success,
            requireConfirm: enabled.RequiresConfirmation ? enabled.RequiresConfirmation : false,
            confirmTitle: enabled.ConfirmDialogTitle,
            confirmBody: enabled.ConfirmDialogBody,
            UICategory: UnitActionCategory.NONE,
            priority: command.PriorityInUI ? command.PriorityInUI : 0,
            callback: (_location) => {
              if (enabled.Success) {
                parameters.X = _location.x;
                parameters.Y = _location.y;
                Game.UnitCommands?.sendRequest(unit.id, command.CommandType, parameters);
              }
            }
          };
          if (UnitActionHandlers.doesActionHaveHandler(command.CommandType)) {
            unitAction.callback = (_location) => {
              if (enabled.Success) {
                UnitActionHandlers.switchToActionInterfaceMode(command.CommandType, {
                  UnitID: unit.id,
                  CommandArguments: parameters
                });
              }
            };
          }
          actions.push(unitAction);
        } else {
          if (UnitActionHandlers.doesActionHaveHandler(command.CommandType)) {
            actions.push({
              name: commandText,
              icon,
              type: command.CommandType,
              annotation,
              active: enabled.Success,
              requireConfirm: enabled.RequiresConfirmation ? enabled.RequiresConfirmation : false,
              confirmTitle: enabled.ConfirmDialogTitle,
              confirmBody: enabled.ConfirmDialogBody,
              UICategory: UnitActionCategory.NONE,
              priority: command.PriorityInUI ? command.PriorityInUI : 0,
              callback: (_location) => {
                if (enabled.Success) {
                  UnitActionHandlers.switchToActionInterfaceMode(command.CommandType, {
                    UnitID: unit.id,
                    CommandArguments: parameters
                  });
                }
              }
            });
            return;
          }
          actions.push({
            name: commandText,
            icon,
            type: command.CommandType,
            annotation,
            active: enabled.Success,
            requireConfirm: enabled.RequiresConfirmation ? enabled.RequiresConfirmation : false,
            confirmTitle: enabled.ConfirmDialogTitle,
            confirmBody: enabled.ConfirmDialogBody,
            UICategory: UnitActionCategory.NONE,
            priority: command.PriorityInUI ? command.PriorityInUI : 0,
            callback: (_location) => {
              if (enabled.Success) {
                parameters.X = _location.x;
                parameters.Y = _location.y;
                Game.UnitCommands?.sendRequest(unit.id, command.CommandType, parameters);
                if (command.CommandType == "UNITCOMMAND_WAKE" || command.CommandType == "UNITCOMMAND_CANCEL") {
                  const frameLimit = 5;
                  let framesLeft = frameLimit;
                  new Promise((resolve, reject) => {
                    const checkWakeStatus = () => {
                      framesLeft--;
                      requestAnimationFrame(() => {
                        if (Game.UnitOperations?.canStart(
                          unit.id,
                          "UNITOPERATION_SLEEP",
                          parameters,
                          true
                        ).Success) {
                          resolve();
                        } else if (framesLeft <= 0) {
                          console.error(
                            `Could not wake unit ${unit.name} after completing action ${command.CommandType} within ${frameLimit} frame(s)`
                          );
                          reject();
                        } else {
                          checkWakeStatus();
                        }
                      });
                    };
                    checkWakeStatus();
                  }).then(() => {
                  }).catch(() => {
                    InterfaceMode.switchToDefault();
                  });
                } else if (command.CommandType == "UNITCOMMAND_PACK_ARMY" || command.CommandType == "UNITCOMMAND_FORCE_MARCH") {
                  FocusManager.SetWorldFocused();
                } else {
                  InterfaceMode.switchToDefault();
                }
              }
            }
          });
        }
      }
    };
    GameInfo.UnitCommands.forEach((command) => {
      if (!command.VisibleInUI) {
        return;
      }
      const unitAbilities = this.getUnitAbilitiesForOperationOrCommand(
        command.CommandType
      );
      if (unitAbilities.length > 0) {
        for (const unitAbility of unitAbilities) {
          processCommand(command, unitAbility);
        }
      } else {
        processCommand(command);
      }
    });
    return actions;
  }
  /**
   * Does a particular unit operation require a targetPlot if selected?
   * @param type Game core unit operation as string name.
   * @returns true if this operation requires a plot to be targeted before exectuing.
   */
  isTargetPlotOperation(type) {
    if (UnitActionHandlers.doesActionHaveHandler(type.toString())) {
      return UnitActionHandlers.doesActionRequireTargetPlot(type.toString());
    }
    return false;
  }
  //TODO - Database Definitions Collections will make this irrelevant
  getUnitAbilitiesForOperationOrCommand(type) {
    const results = [];
    for (const unitAbility of GameInfo.UnitAbilities) {
      if (unitAbility.CommandType && unitAbility.CommandType == type) {
        results.push(unitAbility);
      } else if (unitAbility.OperationType && unitAbility.OperationType == type) {
        results.push(unitAbility);
      }
    }
    return results;
  }
}
const CommanderInteract = new CommanderInteractModel();
engine.whenReady.then(() => {
  const updateModel = () => {
    engine.updateWholeModel(CommanderInteract);
  };
  engine.createJSModel("g_CommanderInteract", CommanderInteract);
  CommanderInteract.updateCallback = updateModel;
});

const styles = "fs://game/base-standard/ui/army-panel/army-panel.css";

var UnitArmyPanelState = /* @__PURE__ */ ((UnitArmyPanelState2) => {
  UnitArmyPanelState2[UnitArmyPanelState2["HIDDEN"] = 0] = "HIDDEN";
  UnitArmyPanelState2[UnitArmyPanelState2["VISIBLE"] = 1] = "VISIBLE";
  return UnitArmyPanelState2;
})(UnitArmyPanelState || {});
const STARTING_INNER_HTML = `
<div class="army-panel__container-background flex">
	<div class="army-panel__main-container relative flex w-auto p-2">
		<fxs-vslot class="army-panel__main-column flex relative flex-col justify-start">
			<fxs-hslot class="army-panel__standard-actions flex relative flex-row justify-center mb-2" ignore-prior-focus>
			</fxs-hslot>
			<div class="army-panel__units-background relative pointer-events-none pl-5 h-49">
				<fxs-spatial-slot class="army-panel__portrait-row mt-1 flex flex-row" ignore-prior-focus>
					<div class="army-panel__commander-portrait-container flex center justify-center w-54 h-44 p-1\\.5">
					</div>
					<div class="army-panel__army-portraits-column flex flex-col pl-2">
						<div class="army-panel__top-army-row flex flex-row">
						</div>
						<div class="army-panel__bottom-army-row flex flex-row">
						</div>
					</div>
				</fxs-spatial-slot>
				<div class="army-panel__action-panel-decor absolute h-full flex items-center justify-end w-14 -right-9"></div>
			</div>
		</fxs-vslot>
	</div>
</div>
`;
const ARMY_BUTTON_INNER_HTML = `
<div class="army-panel__unit-portrait-container flex relative pointer-events-none center p-0\\.5 w-21 h-21">
	<div class="army-panel__unit-portrait-bg flex">
		<div class="army-panel__unit-portrait-image w-20 h-20">
			<div class="army-panel__unit-health-bar-container size-full flex self-end items-center pb-1 px-0\\.5">
				<div class="army-panel__unit-health-bar-bg h-3 w-full flex self-end p-0\\.5">
					<div class="army-panel__unit-health-bar-fill self-center h-full"></div>
				</div>
			</div>
		</div>
		<div class="army-panel__turn-counter-container flex absolute items-end justify-end w-full bottom-0">
			<div class="step-turn-container">
				<div class="step-turn-icon"></div>
				<div class="step-turn-number font-body-base font-bold text-shadow-br"></div>
			</div>
		</div>
		<div class="army-panel__lock-container size-full flex absolute items-center justify-center">
			<div class="army-panel__lock-icon self-center size-12"></div>
		</div>
	</div>
</div>
`;
const ARMY_ACTION_INNER_HTML = `
<div class="army-action-button__button-bg-container flex relative pointer-events-none w-9 h-7 justify-center">
	<div class="army-action-button__button-bg-highlight absolute pointer-events-none w-9 h-7"></div>
	<div class="army-action-button__button-icon relative self-center pointer-events-none w-8 h-8"></div>
</div>
`;
class ArmyPanel extends Panel {
  unitId = null;
  _currentState = 0 /* HIDDEN */;
  armyActions = [];
  armyActionContainer = null;
  armyActionButtons = [];
  commanderContainer = null;
  commanderButton = null;
  armyButtons = [];
  focusArea = null;
  MEDIUM_HEALTH_THRESHHOLD = 0.75;
  // thresholds for healthbar color changes in unit percentage
  LOW_HEALTH_THRESHHOLD = 0.5;
  updateGate = new UpdateGate(() => {
    this.onUpdate();
  });
  animationTimeout = 0;
  get currentState() {
    return this._currentState;
  }
  set currentState(_state) {
    switch (_state) {
      case 0 /* HIDDEN */:
        if (this._currentState == 1 /* VISIBLE */) {
          this.Root.classList.remove("army-panel--visible", "army-panel--hidden");
          this.animationTimeout = setTimeout(() => {
            this.animationTimeout = null;
            requestAnimationFrame(() => this.Root.classList.add("army-panel--hidden"));
          }, 150);
        } else {
          this.Root.style.display = "none";
        }
        break;
      case 1 /* VISIBLE */:
        if (this.animationTimeout) {
          clearTimeout(this.animationTimeout);
          this.animationTimeout = null;
        }
        this.Root.classList.remove("army-panel--visible", "army-panel--hidden");
        requestAnimationFrame(() => this.Root.classList.add("army-panel--visible"));
        this.Root.style.display = "flex";
        break;
      default:
        console.error(`Bad state enum of ${_state} attempting to be set to unit-actions->currentState`);
        return;
    }
    this._currentState = _state;
  }
  constructor(root) {
    super(root);
  }
  onUpdate() {
    delayByFrame(() => {
      this.updateArmyPanel();
    }, 1);
  }
  onInitialize() {
    super.onInitialize();
    this.Root.classList.add("army-panel");
  }
  onAttach() {
    super.onAttach();
    UnitSelection.onRaise.on(this.onRaiseArmyPanel);
    UnitSelection.onLower.on(this.onLowerArmyPanel);
    const unitComponentID = UI.Player.getHeadSelectedUnit();
    if (ComponentID.isValid(unitComponentID)) {
      const unit = Units.get(unitComponentID);
      if (unit) {
        if (ComponentID.isValid(unit.armyId)) {
          this.onRaiseArmyPanel(unitComponentID);
        }
      }
    }
  }
  onDetach() {
    super.onDetach();
    UnitSelection.onRaise.off(this.onRaiseArmyPanel);
    UnitSelection.onLower.off(this.onLowerArmyPanel);
  }
  onRaiseArmyPanel = (cid) => {
    if (cid && ComponentID.isValid(cid)) {
      this.unitId = cid;
    } else {
      console.error(`UIP received a bad component ID when raising the panel.`);
      return;
    }
    const unit = Units.get(this.unitId);
    if (!unit) {
      console.error(
        `UIP could not raise the panel due to missing unit for ${ComponentID.toLogString(this.unitId)}.`
      );
      return;
    }
    if (!ComponentID.isValid(unit.armyId)) {
      this.onLowerArmyPanel(cid);
      return;
    }
    CommanderInteract.registerListener({ updateCallback: this.updateArmyPanel });
    this.Root.innerHTML = STARTING_INNER_HTML;
    this.updateArmyPanel();
    if (this.currentState == 0 /* HIDDEN */) {
      Audio.playSound("data-audio-showing", "army-panel");
    }
    this.currentState = 1 /* VISIBLE */;
    this.focusArea = this.Root.querySelector(".army-panel__main_column");
    if (this.focusArea) {
      this.focusArea.setAttribute("data-navrule-up", "stop");
      this.focusArea.setAttribute("focus-rule", "last");
    }
  };
  onLowerArmyPanel = (_cid) => {
    CommanderInteract.unregisterListener({ updateCallback: this.updateArmyPanel });
    if (this.currentState != 0 /* HIDDEN */) {
      Audio.playSound("data-audio-hiding", "army-panel");
    }
    this.currentState = 0 /* HIDDEN */;
    this.unitId = null;
    this.clearArmyActions();
    this.clearArmyUnits();
  };
  updateArmyPanel = () => {
    this.clearArmyActions();
    this.clearArmyUnits();
    this.setupCommander();
    if (CommanderInteract.currentArmyCommander) {
      this.setupArmyActions(CommanderInteract.currentArmyCommander.commander);
    }
    this.setupArmy();
  };
  clearArmyActions() {
    this.armyActionButtons.forEach((button) => {
      button.parentElement?.removeChild(button);
    });
    this.armyActionButtons = [];
    this.armyActions = [];
  }
  clearArmyUnits() {
    this.commanderButton?.parentElement?.removeChild(this.commanderButton);
    this.commanderButton = null;
    this.armyButtons.forEach((button) => {
      button.parentElement?.removeChild(button);
    });
    this.armyButtons = [];
  }
  setupCommander() {
    this.commanderContainer = this.Root.querySelector(".army-panel__commander-portrait-container");
    if (!this.commanderContainer) {
      return;
    }
    if (CommanderInteract.currentArmyCommander) {
      this.commanderButton = this.createArmyUnitButton(CommanderInteract.currentArmyCommander.commander.id);
      this.setUnitButtonData(this.commanderButton, CommanderInteract.currentArmyCommander.commander);
      this.commanderContainer.appendChild(this.commanderButton);
    }
  }
  setupArmy() {
    const topRow = this.Root.querySelector(".army-panel__top-army-row");
    if (!topRow) {
      return;
    }
    const bottomRow = this.Root.querySelector(".army-panel__bottom-army-row");
    if (!bottomRow) {
      return;
    }
    if (!CommanderInteract.currentArmyCommander) {
      return;
    }
    const currentArmy = CommanderInteract.currentArmyCommander?.packedUnits;
    for (let index = 0; index < currentArmy.length; index++) {
      this.armyButtons.push(this.createArmyUnitButton(currentArmy[index].id));
      this.setUnitButtonData(this.armyButtons[index], currentArmy[index]);
      if (index < 3) {
        topRow.appendChild(this.armyButtons[index]);
      } else {
        bottomRow.appendChild(this.armyButtons[index]);
      }
    }
    const reinforcementItems = CommanderInteract.availableReinforcements;
    reinforcementItems.forEach((item) => {
      if (item.isTraveling && item.commanderToReinforce && CommanderInteract.currentArmyCommander) {
        if (ComponentID.isMatch(
          item.commanderToReinforce.id,
          CommanderInteract.currentArmyCommander?.commander.id
        )) {
          const reinforcementUnit = Units.get(item.unitID);
          if (reinforcementUnit) {
            this.armyButtons.push(this.createArmyUnitButton(item.unitID));
            this.setUnitButtonData(this.armyButtons[this.armyButtons.length - 1], reinforcementUnit);
            if (this.armyButtons.length <= 3) {
              topRow.appendChild(this.armyButtons[this.armyButtons.length - 1]);
            } else {
              bottomRow.appendChild(this.armyButtons[this.armyButtons.length - 1]);
            }
          }
        }
      }
    });
    for (let index = this.armyButtons.length; index < 6; index++) {
      this.armyButtons.push(this.createArmyUnitButton(ComponentID.getInvalidID()));
      this.setUnitButtonData(this.armyButtons[index], null);
      if (CommanderInteract.currentArmyCommander) {
        if (CommanderInteract.currentArmyCommander.army.combatUnitCapacity <= index) {
          this.armyButtons[index].classList.add("locked");
        }
      }
      if (index < 3) {
        topRow.appendChild(this.armyButtons[index]);
      } else {
        bottomRow.appendChild(this.armyButtons[index]);
      }
    }
  }
  createArmyUnitButton(unitId) {
    const unit = Units.get(unitId);
    const newUnitButton = document.createElement("unit-button");
    newUnitButton.innerHTML = ARMY_BUTTON_INNER_HTML;
    newUnitButton.setAttribute("tabindex", "-1");
    newUnitButton.setAttribute("disable-focus-allowed", "true");
    newUnitButton.setAttribute("data-audio-group-ref", "interact-unit");
    newUnitButton.setAttribute("data-audio-focus", "unit-info-hovered");
    if (ComponentID.isValid(unitId)) {
      const unitHealthbar = newUnitButton.querySelector(".army-panel__unit-health-bar-fill");
      if (unit) {
        const portraitImage = newUnitButton.querySelector(".army-panel__unit-portrait-image");
        if (portraitImage) {
          const unitDef = GameInfo.Units.lookup(unit.type);
          if (!unitDef) {
            console.error(`No unit definition found for ${unit.name}`);
          } else {
            const unitType = unitDef.UnitType;
            const isUnique = unitDef.TraitType != null;
            WorldUI.requestPortrait(
              unitType,
              unitType,
              isUnique ? "UnitPortraitsBG_UNIQUE" : "UnitPortraitsBG_BASE"
            );
            const portraitPath = `url("live:/${unitType}")`;
            portraitImage.style.backgroundImage = portraitPath;
            if (unitId.id != CommanderInteract.currentArmyCommander?.commander.id.id) {
              portraitImage.classList.add("border", "border-primary-2");
            } else {
              portraitImage.classList.add("bg-black");
            }
          }
        }
        if (unit?.Health) {
          const normalizedHealthValue = (unit.Health.maxDamage - unit.Health.damage) / unit.Health.maxDamage;
          unitHealthbar?.style.setProperty("--health-percentage", `${normalizedHealthValue * 100}%`);
          if (unit.Health.damage > 0) {
            if (normalizedHealthValue <= this.MEDIUM_HEALTH_THRESHHOLD && normalizedHealthValue >= this.LOW_HEALTH_THRESHHOLD) {
              unitHealthbar?.classList.toggle("army-panel__med-health-bar", true);
              unitHealthbar?.classList.toggle("army-panel__low-health-bar", false);
            } else if (normalizedHealthValue < this.LOW_HEALTH_THRESHHOLD) {
              unitHealthbar?.classList.toggle("army-panel__med-health-bar", false);
              unitHealthbar?.classList.toggle("army-panel__low-health-bar", true);
            }
          } else {
            unitHealthbar?.classList.toggle("army-panel__med-health-bar", false);
            unitHealthbar?.classList.toggle("army-panel__low-health-bar", false);
          }
        }
      }
    }
    return newUnitButton;
  }
  createArmyActionButton(action) {
    const newButton = document.createElement("army-action-button");
    newButton.innerHTML = ARMY_ACTION_INNER_HTML;
    newButton.setAttribute("tabindex", "-1");
    newButton.setAttribute("disable-focus-allowed", "true");
    newButton.setAttribute("data-audio-group-ref", "interact-unit");
    newButton.setAttribute("data-audio-focus", "unit-info-hovered");
    newButton.setAttribute("data-audio-activate", "unit-action-activated");
    this.setActionButtonData(newButton, action);
    this.armyActionButtons.push(newButton);
    this.armyActionContainer?.appendChild(newButton);
  }
  setUnitButtonData(button, unit) {
    if (button) {
      button.addEventListener("action-activate", (event) => {
        this.onArmyButtonActivated(event);
      });
      button.addEventListener("focus", (event) => {
        this.onButtonFocused(event);
      });
      button.addEventListener("blur", (event) => {
        this.onButtonFocused(event);
      });
      if (unit) {
        const reinforcementItems = CommanderInteract.availableReinforcements;
        let isTraveling = false;
        reinforcementItems.forEach((item) => {
          if (ComponentID.isMatch(item.unitID, unit.id)) {
            const turnValue = button.querySelector(".step-turn-number");
            if (turnValue) {
              turnValue.textContent = item.arrivalTime.toString();
            }
            button.classList.add("isTraveling");
            isTraveling = true;
          }
        });
        button.setAttribute("data-tooltip-content", unit.name);
        button.setAttribute("data-tooltip-hide-on-update", "");
        if (isTraveling) {
          button.setAttribute("play-error-sound", "true");
        } else {
          button.setAttribute("play-error-sound", "false");
        }
        const unitDefinition = GameInfo.Units.lookup(unit.type);
        if (!unitDefinition) {
          console.warn(
            "Cannot set army icon due to missing Unit Definition. type: ",
            unit.type,
            "  cid: ",
            ComponentID.toLogString(unit.id)
          );
        } else {
          const iconName = Icon.getUnitIconFromDefinition(unitDefinition);
          const iconCSS = iconName ? `url(${iconName})` : "";
          button.style.setProperty("--button-icon", iconCSS);
        }
      } else {
        button.classList.add("noUnit");
        button.setAttribute("play-error-sound", "true");
      }
    }
  }
  setActionButtonData(button, action) {
    button.addEventListener("action-activate", (event) => {
      this.onArmyActionActivated(event);
    });
    button.addEventListener("focus", (event) => {
      this.onButtonFocused(event);
    });
    button.addEventListener("blur", (event) => {
      this.onButtonFocused(event);
    });
    button.setAttribute("data-tooltip-content", action.name);
    button.setAttribute("data-tooltip-hide-on-update", "");
    if (!action.icon) {
      console.error(`army-panel: No icon URL associated with action ${action.name}.`);
    }
    const icon = action.icon ?? "";
    const iconCSS = icon ? `url("${icon}")` : "";
    button.style.setProperty("--button-icon", iconCSS);
    button.classList.toggle("inactive", !action.active);
  }
  onArmyButtonActivated(event) {
    if (event.target instanceof HTMLElement) {
      if (event.target == this.commanderButton) {
        if (CommanderInteract.currentArmyCommander) {
          UI.Player.selectUnit(CommanderInteract.currentArmyCommander.commander.id);
        }
      }
      const unitIndex = this.armyButtons.indexOf(event.target);
      const selectedUnit = CommanderInteract.currentArmyCommander?.packedUnits[unitIndex];
      if (selectedUnit != void 0) {
        UI.Player.selectUnit(selectedUnit.id);
      } else {
      }
    }
  }
  onArmyActionActivated(event) {
    if (event.target instanceof HTMLElement) {
      const index = this.armyActionButtons.indexOf(event.target);
      const armyAction = this.armyActions[index];
      armyAction.callback({ x: -9999, y: -9999 });
      engine.trigger("InteractUnitActionChosen");
    }
  }
  onButtonFocused(event) {
    if (event.target instanceof HTMLElement) {
      event.target.classList.toggle("focused", event.type == "focus");
    }
  }
  setupArmyActions(unit) {
    const processOperation = (operation) => {
      const parameters = {
        X: -9999,
        // PlotCoord.Range.INVALID_X
        Y: -9999
        // PlotCoord.Range.INVALID_Y
      };
      parameters.UnitAbilityType = -1;
      const enabled = Game.UnitOperations?.canStart(
        unit.id,
        operation.OperationType,
        parameters,
        false
      );
      let name = Locale.compose(operation.Description);
      const icon = operation.Icon;
      if (enabled.AdditionalDescription) {
        const addlDescString = formatStringArrayAsNewLineText(enabled.AdditionalDescription);
        name += "<br><p>" + addlDescString + "</p>";
      }
      if (!enabled.Success) {
        if (enabled.FailureReasons) {
          const failureString = formatStringArrayAsNewLineText(enabled.FailureReasons);
          name += "<br><p style='color:orange;'>" + failureString + "</p>";
        }
      }
      const armyAction = {
        name,
        icon,
        active: enabled.Success,
        callback: (_location) => {
          if (enabled.Success) {
            parameters.X = _location.x;
            parameters.Y = _location.y;
            Game.UnitOperations?.sendRequest(unit.id, operation.OperationType, parameters);
          }
        }
      };
      if (UnitActionHandlers.doesActionHaveHandler(operation.OperationType)) {
        armyAction.callback = (_location) => {
          if (enabled.Success) {
            UnitActionHandlers.switchToActionInterfaceMode(operation.OperationType, { UnitID: unit.id });
          }
        };
      }
      this.armyActions.push(armyAction);
    };
    const processCommand = (command) => {
      const parameters = {
        X: -9999,
        // PlotCoord.Range.INVALID_X
        Y: -9999
        // PlotCoord.Range.INVALID_Y
      };
      parameters.UnitAbilityType = -1;
      const enabled = Game.UnitCommands?.canStart(
        unit.id,
        command.CommandType,
        parameters,
        false
      );
      let commandText = command.Description ? Locale.compose(command.Description) : "";
      const icon = command.Icon;
      if (enabled.AdditionalDescription) {
        const addlDescString = formatStringArrayAsNewLineText(enabled.AdditionalDescription);
        commandText += "<br><p>" + addlDescString + "</p>";
      }
      if (!enabled.Success) {
        if (enabled.FailureReasons) {
          const failureString = formatStringArrayAsNewLineText(enabled.FailureReasons);
          commandText += "<br><p style='color:orange;'>" + failureString + "</p>";
        }
      }
      const armyAction = {
        name: commandText,
        icon,
        active: enabled.Success,
        callback: (_location) => {
          if (enabled.Success) {
            parameters.X = _location.x;
            parameters.Y = _location.y;
            Game.UnitCommands?.sendRequest(unit.id, command.CommandType, parameters);
            if (command.CommandType == "UNITCOMMAND_PACK_ARMY") {
              FocusManager.SetWorldFocused();
            } else {
              InterfaceMode.switchToDefault();
            }
            this.updateGate.call(`update`);
          }
        }
      };
      if (UnitActionHandlers.doesActionHaveHandler(command.CommandType)) {
        armyAction.callback = (_location) => {
          if (enabled.Success) {
            UnitActionHandlers.switchToActionInterfaceMode(command.CommandType, {
              UnitID: unit.id,
              CommandArguments: parameters
            });
          }
        };
      }
      this.armyActions.push(armyAction);
    };
    const reinforceArmy = GameInfo.UnitOperations.lookup(
      "UNITOPERATION_CALL_REINFORCEMENTS"
    );
    const packArmy = GameInfo.UnitCommands.lookup("UNITCOMMAND_PACK_ARMY");
    const unpackArmy = GameInfo.UnitCommands.lookup("UNITCOMMAND_UNPACK_ARMY");
    if (reinforceArmy) {
      processOperation(reinforceArmy);
    }
    if (packArmy) {
      processCommand(packArmy);
    }
    if (unpackArmy) {
      processCommand(unpackArmy);
    }
    this.armyActionContainer = this.Root.querySelector(".army-panel__standard-actions");
    this.armyActions.forEach((action) => {
      this.createArmyActionButton(action);
    });
  }
}
Controls.define("army-panel", {
  createInstance: ArmyPanel,
  description: "Panel for displaying and accessing armies",
  styles: [styles]
});
Controls.define("unit-button", {
  createInstance: FxsActivatable,
  description: "Army panel portrait button that includes a healthbar and reinforement timer",
  classNames: ["army-panel__unit-button"],
  styles: [styles],
  images: ["fs://game/hud_unit-panel_empty-slot"],
  attributes: [{ name: "play-error-sound" }]
});
Controls.define("army-action-button", {
  createInstance: FxsActivatable,
  description: "Army action",
  classNames: ["army-panel__action-button"],
  styles: [styles]
});
//# sourceMappingURL=army-panel.js.map

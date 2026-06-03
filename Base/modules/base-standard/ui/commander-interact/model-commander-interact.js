import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { ComponentID } from '../../../core/ui/utilities/utilities-component-id.js';
import { formatStringArrayAsNewLineText } from '../../../core/ui/utilities/utilities-core-textprovider.js';
import UpdateGate from '../../../core/ui/utilities/utilities-update-gate.js';
import ViewManager from '../../../core/ui/views/view-manager.js';
import { FocusManager } from '../../../core/ui-next/services/focus-manager.js';
import { UnitActionCategory } from '../unit-actions/unit-actions.js';
import { UnitActionHandlers } from '../unit-interact/unit-action-handlers.js';

class CommanderInteractModel {
  _registeredComponents = [];
  //All comanders and reinforcing units
  armyCommanders = [];
  unitReinforcementIDs = [];
  _index = 0;
  // Model Data
  _name = "";
  _experience = null;
  _hasExperience = false;
  _hasPackedUnits = false;
  _hasActions = false;
  _hasData = false;
  _currentArmyCommander = null;
  _currentReinforcements = [];
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
  get currentReinforcements() {
    return this._currentReinforcements;
  }
  get commanderActions() {
    return this._commanderActions;
  }
  update() {
    this.unitReinforcementIDs = [];
    this._currentReinforcements = [];
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
    for (let i = 0; i < this.unitReinforcementIDs.length; i++) {
      const unitID = this.unitReinforcementIDs[i];
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
      const armyId = playerArmies.getUnitReinforcementCommanderId(unitID, localPlayerID);
      if (this.currentArmyCommander) {
        if (armyId == this.currentArmyCommander.army.localId) {
          const reinforcementItem = {
            unitID,
            armyID: armyId,
            startLocation: playerArmies.getUnitReinforcementStartLocation(unitID, localPlayerID),
            arrivalTime: playerArmies.getUnitReinforcementETA(unitID, localPlayerID),
            commanderToReinforce: this.currentArmyCommander.commander,
            isTraveling: !unit.isOnMap
          };
          this._currentReinforcements.push(reinforcementItem);
        }
      }
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
    const assignPriority = (action, index) => {
      action.priority = index;
    };
    commanderActions.forEach(assignPriority);
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
    return this._currentReinforcements.find((r) => {
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
      {
        const reinforcementId = player.Armies?.getUnitReinforcementCommanderId(
          unitID,
          GameContext.localPlayerID
        );
        if (reinforcementId != -1) {
          this.unitReinforcementIDs.push(unitID);
        }
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
        const packedUnits = armyUnitIds.reduce((result, unitId) => {
          const unit2 = Units.get(unitId);
          if (unit2) {
            result.push(unit2);
          }
          return result;
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
      if (unit.owner == GameContext.localPlayerID) {
        this.updateGate.call("onUnitArmyChange");
      }
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
                  FocusManager.get().clearFocus();
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

export { CommanderInteract as default };
//# sourceMappingURL=model-commander-interact.js.map

import { Audio } from '../../../core/ui/audio-base/audio-support.js';
import { FxsActivatable } from '../../../core/ui/components/fxs-activatable.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import Panel from '../../../core/ui/panel-support.js';
import { ComponentID } from '../../../core/ui/utilities/utilities-component-id.js';
import { formatStringArrayAsNewLineText } from '../../../core/ui/utilities/utilities-core-textprovider.js';
import { Icon } from '../../../core/ui/utilities/utilities-image.js';
import UpdateGate from '../../../core/ui/utilities/utilities-update-gate.js';
import { FocusManager } from '../../../core/ui-next/services/focus-manager.js';
import CommanderInteract from '../commander-interact/model-commander-interact.js';
import { UnitActionHandlers } from '../unit-interact/unit-action-handlers.js';
import UnitSelection from '../unit-selection/unit-selection.js';
import styles from './army-panel.scss.js';

var UnitArmyPanelState = /* @__PURE__ */ ((UnitArmyPanelState2) => {
  UnitArmyPanelState2[UnitArmyPanelState2["HIDDEN"] = 0] = "HIDDEN";
  UnitArmyPanelState2[UnitArmyPanelState2["VISIBLE"] = 1] = "VISIBLE";
  return UnitArmyPanelState2;
})(UnitArmyPanelState || {});
const STARTING_INNER_HTML = `
<div class="army-panel__container-background flex">
	<div class="army-panel__main-container relative flex w-auto p-2">
		<fxs-vslot class="army-panel__main-column flex relative flex-col justify-start" focus-rule="last">
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
          this.Root.classList.remove("army-panel--visible");
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
        this.Root.classList.remove("army-panel--hidden");
        if (!this.Root.classList.contains("army-panel--visible")) {
          requestAnimationFrame(() => this.Root.classList.add("army-panel--visible"));
          this.Root.style.display = "flex";
        }
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
    if (this.Root.innerHTML == "" || this.Root.innerHTML == null) {
      this.Root.innerHTML = STARTING_INNER_HTML;
    }
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
    function selectTopRow(index) {
      if (index < 3) return true;
      if (index < 6) return false;
      return index % 2 == 0;
    }
    const currentArmy = CommanderInteract.currentArmyCommander?.packedUnits;
    for (let index = 0; index < currentArmy.length; index++) {
      this.armyButtons.push(this.createArmyUnitButton(currentArmy[index].id));
      this.setUnitButtonData(this.armyButtons[index], currentArmy[index]);
      if (selectTopRow(index)) {
        topRow.appendChild(this.armyButtons[index]);
      } else {
        bottomRow.appendChild(this.armyButtons[index]);
      }
    }
    const reinforcementItems = CommanderInteract.currentReinforcements;
    reinforcementItems.forEach((item) => {
      if (item.isTraveling && item.commanderToReinforce && CommanderInteract.currentArmyCommander) {
        if (ComponentID.isMatch(
          item.commanderToReinforce.id,
          CommanderInteract.currentArmyCommander?.commander.id
        )) {
          const reinforcementUnit = Units.get(item.unitID);
          if (reinforcementUnit) {
            const index = this.armyButtons.push(this.createArmyUnitButton(item.unitID)) - 1;
            this.setUnitButtonData(this.armyButtons[index], reinforcementUnit);
            if (selectTopRow(index)) {
              topRow.appendChild(this.armyButtons[index]);
            } else {
              bottomRow.appendChild(this.armyButtons[index]);
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
      if (selectTopRow(index)) {
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
            portraitImage.classList.add("border", "border-primary-2");
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
        const selectedUnitID = UI.Player.getHeadSelectedUnit();
        if (selectedUnitID?.id == unit.id.id) {
          newUnitButton.classList.add("focused");
          newUnitButton.classList.add("pressed");
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
        const reinforcementItems = CommanderInteract.currentReinforcements;
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
        this.Root.querySelector("pressed")?.classList.remove("pressed");
        event.target.classList.add("pressed");
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
      if (!event.target.classList.contains("focused") && event.type == "focus") {
        event.target.classList.add("focused");
      }
      if (event.type == "blur") {
        event.target.classList.remove("focused");
      }
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
              FocusManager.get().clearFocus();
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

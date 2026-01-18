import { A as Audio } from '../../audio-base/audio-support.chunk.js';
import ContextManager from '../../context-manager/context-manager.js';
import { D as DialogBoxAction, a as DialogBoxManager } from '../../dialog-box/manager-dialog-box.chunk.js';
import ActionHandler from '../../input/action-handler.js';
import FocusManager from '../../input/focus-manager.js';
import { N as NavTray } from '../../navigation-tray/model-navigation-tray.chunk.js';
import { CreateGameModel } from './create-game-model.js';
import { D as DropdownSelectionChangeEventName } from '../../components/fxs-dropdown.chunk.js';
import { MustGetElement } from '../../utilities/utilities-dom.chunk.js';
import { G as GameCreationPanelBase } from './game-creation-panel-base.chunk.js';
import { L as LiveEventManager } from '../live-event-logic/live-event-logic.chunk.js';
import { L as Layout } from '../../utilities/utilities-layout.chunk.js';

const booleanSelectorActionsList = [{ label: "LOC_UI_DISABLED" }, { label: "LOC_UI_ENABLED" }];
class OptionsBase {
  getParameterValueName(setupParam) {
    if (setupParam.value == null || setupParam.value.value == null) {
      console.warn(
        `game-creation-options: getParameterValueName - couldn't get a valid value for setupParam ${setupParam.ID}`
      );
      return "<null>";
    } else {
      return setupParam.value.name ? GameSetup.resolveString(setupParam.value.name) : setupParam.value.value.toString();
    }
  }
  setParameterCommonInfo(setupParam, parameterInteractable, defaultValue) {
    const description = GameSetup.resolveString(setupParam.description);
    let tooltip = "";
    if (description) {
      tooltip = Locale.compose(description);
    }
    if (defaultValue) {
      const defName = GameSetup.resolveString(defaultValue.name);
      const defDescription = GameSetup.resolveString(defaultValue.description);
      const warning = GameSetup.resolveString(defaultValue.warning);
      if (defName) {
        tooltip = tooltip + "[N] [N]" + Locale.compose(defName);
      }
      if (defDescription) {
        tooltip = tooltip + "[N] [N]" + Locale.compose(defDescription);
      }
      if (warning) {
        tooltip = tooltip + "[N] [N][ICON:attention]" + Locale.compose(warning);
      }
    }
    parameterInteractable.setAttribute("data-tooltip-content", tooltip);
    const parameterID = GameSetup.resolveString(setupParam.ID);
    if (parameterID) {
      parameterInteractable.setAttribute("data-parameter-id", parameterID);
    }
    parameterInteractable.classList.add("w-96");
  }
}
class BooleanOption extends OptionsBase {
  component = null;
  create(setupParam) {
    if (UI.isInGame()) {
      const selectedOption = document.createElement("div");
      selectedOption.classList.value = "advanced-options__option font-body-base w-96 mr-4 text-center pointer-events-auto";
      selectedOption.innerHTML = Locale.compose(
        this.castToBoolean(setupParam.value.value) ? "LOC_UI_ENABLED" : "LOC_UI_DISABLED"
      );
      selectedOption.setAttribute("tabIndex", "-1");
      this.setParameterCommonInfo(setupParam, selectedOption, null);
      this.component = selectedOption;
      return selectedOption;
    }
    const booleanSelector = document.createElement("fxs-selector");
    const parameterID = GameSetup.resolveString(setupParam.ID);
    booleanSelector.classList.add("advanced-options__option", "font-body-base", "w-96", "mr-4");
    booleanSelector.setAttribute("dropdown-items", JSON.stringify(booleanSelectorActionsList));
    booleanSelector.setAttribute(
      "selected-item-index",
      (this.castToBoolean(setupParam.value.value) ? 1 : 0).toString()
    );
    booleanSelector.addEventListener(DropdownSelectionChangeEventName, (event) => {
      const p = UI.beginProfiling("Boolean-Component-ValueChanged");
      const newValue = event.detail.selectedIndex;
      const booleanValue = newValue ? true : false;
      GameSetup.setGameParameterValue(parameterID, booleanValue);
      UI.endProfiling(p);
    });
    this.setParameterCommonInfo(setupParam, booleanSelector, null);
    this.component = booleanSelector;
    return booleanSelector;
  }
  processChange(setupParam, change) {
    if (change.readOnlyStatusChanged) {
      if (setupParam.readOnly) {
        this.component?.setAttribute("disabled", "true");
      } else {
        this.component?.removeAttribute("disabled");
      }
    }
    if (change.valueChanged) {
      const index = this.castToBoolean(setupParam.value.value) ? 1 : 0;
      this.component?.setAttribute("selected-item-index", index.toString());
    }
  }
  castToBoolean(value) {
    const t = typeof value;
    switch (t) {
      case "boolean":
        return value;
      case "number":
        return value != 0;
      // TODO - Handle string [tTfF]?
      default:
        return false;
    }
  }
}
class LabelOption extends OptionsBase {
  root = null;
  create(setupParam) {
    const labelElement = document.createElement("div");
    labelElement.classList.add("font-body-base", "flex", "justify-center", "items-center");
    labelElement.setAttribute("data-l10n-id", this.getParameterValueName(setupParam));
    const name = GameSetup.resolveString(setupParam.name);
    const description = GameSetup.resolveString(setupParam.description);
    let tooltip = "";
    if (name) {
      tooltip = Locale.compose(name);
    }
    if (description) {
      tooltip = tooltip + "[N]" + Locale.compose(description);
    }
    labelElement.setAttribute("data-tooltip-content", tooltip);
    this.setParameterCommonInfo(setupParam, labelElement, null);
    this.root = labelElement;
    return labelElement;
  }
  processChange(setupParam, change) {
    if (change.valueChanged) {
      this.root?.setAttribute("value", this.getParameterValueName(setupParam));
    }
  }
}
class NumericOption extends OptionsBase {
  root = null;
  parameterID;
  textboxElement = document.createElement("fxs-textbox");
  componentValueChangedEventListener = this.onComponentValueChanged.bind(this);
  create(setupParam) {
    if (UI.isInGame()) {
      const selectedOption = document.createElement("div");
      selectedOption.classList.value = "advanced-options__option font-body-base w-96 mr-4 text-center pointer-events-auto";
      selectedOption.innerHTML = Locale.compose(this.getParameterValueName(setupParam));
      selectedOption.setAttribute("tabIndex", "-1");
      this.setParameterCommonInfo(setupParam, selectedOption, null);
      return selectedOption;
    }
    this.parameterID = GameSetup.resolveString(setupParam.ID);
    this.textboxElement.classList.add("advanced-options__option", "font-body-base", "max-w-96", "mr-4");
    this.textboxElement.setAttribute("max-length", "11");
    this.textboxElement.setAttribute("value", this.getParameterValueName(setupParam));
    this.textboxElement.addEventListener(ComponentValueChangeEventName, this.componentValueChangedEventListener);
    this.setParameterCommonInfo(setupParam, this.textboxElement, null);
    this.root = this.textboxElement;
    return this.textboxElement;
  }
  onComponentValueChanged(event) {
    if (!this.parameterID) return;
    const p = UI.beginProfiling("NumericOption-Component-ValueChanged");
    const newValue = event.detail.value.toString();
    if (newValue) {
      const numericValue = Number.parseInt(newValue);
      if (numericValue) {
        const twoRaisedToThirtyOne = Math.pow(2, 31);
        const clampedNumericValue = Math.min(
          Math.max(numericValue, -1 * twoRaisedToThirtyOne),
          twoRaisedToThirtyOne - 1
        );
        GameSetup.setGameParameterValue(this.parameterID, clampedNumericValue);
        this.textboxElement.setAttribute("value", clampedNumericValue.toString());
      }
    }
    UI.endProfiling(p);
  }
  processChange(setupParam, change) {
    if (change.readOnlyStatusChanged) {
      if (setupParam.readOnly) {
        this.root?.setAttribute("disabled", "true");
      } else {
        this.root?.removeAttribute("disabled");
      }
    }
    if (change.valueChanged) {
      this.root?.setAttribute("value", this.getParameterValueName(setupParam));
    }
  }
}
class TextBoxOption extends OptionsBase {
  root = null;
  parameterID;
  defaultValue = "";
  componentValueChangedEventListener = this.onComponentValueChanged.bind(this);
  isTextBoxValueNull = false;
  create(setupParam) {
    if (UI.isInGame()) {
      const selectedOption = document.createElement("div");
      selectedOption.classList.value = "advanced-options__option font-body-base w-96 mr-4 text-center pointer-events-auto";
      selectedOption.innerHTML = Locale.compose(this.getParameterValueName(setupParam));
      selectedOption.setAttribute("tabIndex", "-1");
      this.setParameterCommonInfo(setupParam, selectedOption, null);
      return selectedOption;
    }
    this.parameterID = setupParam.ID;
    const textboxElement = document.createElement("fxs-textbox");
    textboxElement.classList.add("advanced-options__option", "font-body-base", "max-w-96", "mr-4");
    textboxElement.setAttribute("value", this.getParameterValueName(setupParam));
    textboxElement.setAttribute("max-length", "32");
    textboxElement.addEventListener(ComponentValueChangeEventName, this.componentValueChangedEventListener);
    this.setParameterCommonInfo(setupParam, textboxElement, null);
    this.root = textboxElement;
    return textboxElement;
  }
  processChange(setupParam, change) {
    if (change.readOnlyStatusChanged) {
      if (setupParam.readOnly) {
        this.root?.setAttribute("disabled", "true");
      } else {
        this.root?.removeAttribute("disabled");
      }
    }
    if (change.valueChanged && !this.isTextBoxValueNull) {
      this.root?.setAttribute("value", this.getParameterValueName(setupParam));
    }
  }
  onComponentValueChanged(event) {
    if (!this.parameterID) return;
    const parameterID = GameSetup.resolveString(this.parameterID);
    const p = UI.beginProfiling("TextBoxOption-Component-ValueChanged");
    const newValue = event.detail.value.toString();
    if (!this.defaultValue) {
      this.defaultValue = newValue;
    }
    this.isTextBoxValueNull = newValue == "";
    if (this.isTextBoxValueNull) {
      GameSetup.setGameParameterValue(parameterID, this.defaultValue);
    } else {
      GameSetup.setGameParameterValue(parameterID, newValue);
    }
    UI.endProfiling(p);
  }
}
class SelectorOption extends OptionsBase {
  root = null;
  create(setupParam) {
    if (UI.isInGame()) {
      const selectedOption = document.createElement("div");
      selectedOption.classList.value = "advanced-options__option font-body-base w-96 mr-4 text-center pointer-events-auto";
      selectedOption.innerHTML = Locale.compose(this.getParameterValueName(setupParam));
      selectedOption.setAttribute("tabIndex", "-1");
      this.setParameterCommonInfo(setupParam, selectedOption, null);
      return selectedOption;
    }
    const selector = document.createElement("fxs-selector");
    const paramName = GameSetup.resolveString(setupParam.name);
    selector.classList.add("advanced-options__option", "text-base", "mr-4");
    selector.setAttribute("label", paramName ?? "");
    selector.setAttribute("enable-shell-nav", "false");
    selector.setAttribute("direct-edit", "true");
    const shouldDisable = setupParam.readOnly || setupParam.domain.possibleValues?.length == 1;
    if (shouldDisable) {
      selector.setAttribute("disabled", "true");
    } else {
      selector.removeAttribute("disabled");
    }
    selector.addEventListener(DropdownSelectionChangeEventName, (event) => {
      const p = UI.beginProfiling("SelectOption-DropdownSelectionChanged");
      const targetElement = event.target;
      const parameterID = targetElement.getAttribute("data-parameter-id");
      if (parameterID) {
        const index = event.detail.selectedIndex;
        const parameter = GameSetup.findGameParameter(parameterID);
        if (parameter && parameter.domain.possibleValues && parameter.domain.possibleValues.length > index) {
          const value = parameter.domain.possibleValues[index];
          GameSetup.setGameParameterValue(parameterID, value.value);
          this.setParameterCommonInfo(setupParam, selector, value);
        }
      }
      UI.endProfiling(p);
    });
    const actionsList = [];
    if (setupParam.domain.possibleValues) {
      let selectedIndex = 0;
      let selectedPossibleValue = setupParam.domain.possibleValues[0];
      for (const [index, pv] of setupParam.domain.possibleValues.entries()) {
        let valueName = GameSetup.resolveString(pv.name);
        if (!valueName) {
          console.error(`game-setup.ts - Failed to resolve string for game option: ${pv.name}`);
          continue;
        }
        if (setupParam.value?.value == pv.value) {
          selectedIndex = index;
          selectedPossibleValue = pv;
        }
        const warning = GameSetup.resolveString(pv.warning);
        if (warning) {
          valueName = "[ICON:attention]" + Locale.compose(valueName);
        }
        actionsList.push({ label: Locale.compose(valueName) });
      }
      selector.setAttribute("dropdown-items", JSON.stringify(actionsList));
      selector.setAttribute("selected-item-index", selectedIndex.toString());
      this.setParameterCommonInfo(setupParam, selector, selectedPossibleValue);
    }
    this.root = selector;
    return selector;
  }
  processChange(setupParam, change) {
    if (change.readOnlyStatusChanged) {
      const shouldDisable = setupParam.readOnly || setupParam.domain.possibleValues?.length == 1;
      if (shouldDisable) {
        this.root?.setAttribute("disabled", "true");
      } else {
        this.root?.removeAttribute("disabled");
      }
    }
    if (change.possibleValuesChanged) {
      if (this.root && setupParam.domain.possibleValues) {
        const actionsList = [];
        let selectedIndex = 0;
        let selectedPossibleValue = setupParam.domain.possibleValues[0];
        for (const [index, pv] of setupParam.domain.possibleValues.entries()) {
          const valueName = GameSetup.resolveString(pv.name);
          if (!valueName) {
            console.error(`game-setup.ts - Failed to resolve string for game option: ${pv.name}`);
            continue;
          }
          if (setupParam.value?.value == pv.value) {
            selectedIndex = index;
            selectedPossibleValue = pv;
          }
          actionsList.push({ label: Locale.compose(valueName) });
        }
        this.root.setAttribute("dropdown-items", JSON.stringify(actionsList));
        this.root.setAttribute("selected-item-index", selectedIndex.toString());
        this.setParameterCommonInfo(setupParam, this.root, selectedPossibleValue);
        const shouldDisable = setupParam.readOnly || setupParam.domain.possibleValues?.length == 1;
        if (shouldDisable) {
          this.root?.setAttribute("disabled", "true");
        } else {
          this.root?.removeAttribute("disabled");
        }
      }
    } else if (change.valueChanged) {
      if (this.root && setupParam.domain.possibleValues) {
        for (const [index, pv] of setupParam.domain.possibleValues.entries()) {
          if (setupParam.value?.value == pv.value) {
            this.setParameterCommonInfo(setupParam, this.root, pv);
            this.root.setAttribute("selected-item-index", index.toString());
            break;
          }
        }
      }
    }
  }
}
class MultiSelectorOption extends OptionsBase {
  root = null;
  possibleValueElements = /* @__PURE__ */ new Map();
  strInvertSelection = GameSetup.makeString("InvertSelection");
  create(setupParam) {
    const optionElementRoot = document.createElement("div");
    this.root = optionElementRoot;
    optionElementRoot.classList.add("flex", "font-body-base", "flex-col", "flex-auto");
    if (!setupParam.domain.possibleValues) {
      console.warn(
        `advanced-options-panel: createMultiSelectorOption - setupParam ${setupParam.ID} had no possible values. Is this intentional?`
      );
      return optionElementRoot;
    }
    this.rebuildPossibleValues(optionElementRoot, setupParam);
    return optionElementRoot;
  }
  processChange(setupParam, change) {
    if (change.readOnlyStatusChanged) {
      const readOnly = setupParam.readOnly || UI.isInGame();
      if (readOnly) {
        for (const [_value, els] of this.possibleValueElements) {
          for (const el of els) {
            el.setAttribute("disabled", "true");
          }
        }
      } else {
        for (const [_value, els] of this.possibleValueElements) {
          for (const el of els) {
            el.removeAttribute("disabled");
          }
        }
      }
    }
    if (change.possibleValuesChanged) {
      if (this.root) {
        this.root.innerHTML = "";
        this.possibleValueElements.clear();
        this.rebuildPossibleValues(this.root, setupParam);
      }
    } else if (change.valueChanged) {
      const invertSelection = setupParam.uxHint == this.strInvertSelection;
      for (const [value, els] of this.possibleValueElements) {
        let hasValue = setupParam.values.some((pv) => pv.value == value);
        if (invertSelection) {
          hasValue = !hasValue;
        }
        for (const el of els) {
          el.setAttribute("selected-item-index", (hasValue ? 1 : 0).toString());
        }
      }
    }
  }
  onPossibleValueToggled(event, context, pv) {
    let includeValue = event.detail.selectedIndex == 1;
    const parameter = this.findParameter(context.parameterID, context.PlayerID, context.TeamID);
    if (parameter) {
      const invertSelection = parameter.uxHint == this.strInvertSelection;
      const index = parameter.values?.findIndex((v) => v.value == pv.value);
      if (invertSelection) {
        includeValue = !includeValue;
      }
      if (includeValue) {
        if (index == -1) {
          const newValues = parameter.values.concat(pv).map((v) => v.value);
          GameSetup.setGameParameterValue(parameter.ID, newValues);
        }
      } else {
        if (index != -1) {
          const valuesArray = parameter.values.map((v) => v);
          valuesArray.splice(index, 1);
          const newValues = valuesArray.map((v) => v.value);
          GameSetup.setGameParameterValue(parameter.ID, newValues);
        }
      }
    }
  }
  findParameter(parameterID, playerId, teamId) {
    if (teamId != null) {
      return GameSetup.findTeamParameter(teamId, parameterID);
    } else if (playerId != null) {
      return GameSetup.findPlayerParameter(playerId, parameterID);
    } else {
      return GameSetup.findGameParameter(parameterID);
    }
  }
  rebuildPossibleValues(root, setupParam) {
    const strCategory = GameSetup.makeString("Category");
    this.possibleValueElements.clear();
    const invertSelection = setupParam.uxHint == this.strInvertSelection;
    const strLegacyClassType = GameSetup.makeString("LegacyPathClassType");
    const readOnly = setupParam.readOnly;
    if (setupParam.domain.possibleValues) {
      const categoryParamMap = /* @__PURE__ */ new Map();
      for (const pv of setupParam.domain.possibleValues) {
        const additionalPropsValue = pv.additionalProperties?.find((ap) => ap.name == strCategory)?.value;
        let category = typeof additionalPropsValue === "string" ? additionalPropsValue : null;
        if (category == null) {
          const q = Database.query(
            "config",
            "SELECT Name from ParameterGroups where GroupID = ? LIMIT 1",
            GameSetup.resolveString(setupParam.group)
          );
          if (q && q.length > 0 && typeof q[0].Name == "string") {
            category = q[0].Name;
          }
        }
        if (category == null) {
          category = "LOC_ADVANCED_OPTIONS";
        }
        if (!categoryParamMap.get(category)) {
          categoryParamMap.set(category, [pv]);
        } else {
          categoryParamMap.get(category).push(pv);
        }
      }
      const parameterContext = {
        parameterID: setupParam.ID,
        playerID: setupParam.playerID,
        teamID: setupParam.teamID
      };
      for (const [key, value] of categoryParamMap) {
        const pvSettingsGroup = SettingsGroupData.addNewSettingsGroup(
          key,
          `${key} + ${setupParam.group.toString()}`,
          root,
          { isCollapsible: false }
        );
        for (const pv of value) {
          let hasValue = setupParam.values.some((v) => v.value == pv.value);
          if (invertSelection) {
            hasValue = !hasValue;
          }
          const pvRow = document.createElement("fxs-hslot");
          const pvLabelContainer = document.createElement("div");
          const pvLabel = document.createElement("div");
          const pvName = Locale.compose(GameSetup.resolveString(pv.name) ?? "");
          const pvDesc = Locale.compose(GameSetup.resolveString(pv.description) ?? "");
          const pvWarning = Locale.compose(GameSetup.resolveString(pv.warning) ?? "");
          let pvControl = null;
          if (UI.isInGame()) {
            pvControl = document.createElement("div");
            pvControl.classList.value = "text-center pointer-events-auto";
            pvControl.setAttribute("data-l10n-id", hasValue ? "LOC_UI_ENABLED" : "LOC_UI_DISABLED");
            pvControl.setAttribute("tabIndex", "-1");
          } else {
            pvControl = document.createElement("fxs-selector");
          }
          pvRow.classList.add("advanced-options-setting-row", "items-center", "justify-between", "h-14");
          pvLabelContainer.classList.add("flex", "items-center", "ml-4");
          if (pvWarning.length > 0) {
            pvControl.setAttribute(
              "data-tooltip-content",
              Locale.stylize(`[B]${pvName}[/B][N]${pvDesc}[N] [ICON:attention]${pvWarning}`)
            );
          } else {
            pvControl.setAttribute("data-tooltip-content", Locale.stylize(`[B]${pvName}[/B][N]${pvDesc}`));
          }
          pvControl.classList.add("advanced-options__option", "mr-4", "w-96");
          const legacyClassName = pv.additionalProperties?.find((ap) => ap.name == strLegacyClassType)?.value?.toString();
          if (legacyClassName) {
            const pvIcon = document.createElement("fxs-icon");
            pvIcon.classList.add("size-10", "mr-2");
            pvIcon.setAttribute("data-icon-context", "DEFAULT");
            pvIcon.setAttribute("data-icon-id", legacyClassName);
            pvLabelContainer.appendChild(pvIcon);
          }
          pvLabel.setAttribute("data-l10n-id", pvName);
          pvLabel.setAttribute("data-tooltip-content", Locale.stylize(`${pvDesc}`));
          pvLabel.classList.add("pointer-events-auto");
          pvLabel.setAttribute("role", "option");
          pvLabelContainer.appendChild(pvLabel);
          pvRow.appendChild(pvLabelContainer);
          pvRow.appendChild(pvControl);
          pvSettingsGroup.addOption(pvRow);
          if (readOnly) {
            pvControl.setAttribute("disabled", "true");
          }
          let els = this.possibleValueElements.get(pv.value);
          if (els == null) {
            els = [];
            this.possibleValueElements.set(pv.value, els);
          }
          els.push(pvControl);
          if (!UI.isInGame()) {
            pvControl.setAttribute("dropdown-items", JSON.stringify(booleanSelectorActionsList));
            pvControl.setAttribute("selected-item-index", (hasValue ? 1 : 0).toString());
            pvControl.addEventListener(
              DropdownSelectionChangeEventName,
              (event) => {
                this.onPossibleValueToggled(event, parameterContext, pv);
              }
            );
          }
        }
      }
    }
  }
}
class AdvancedOptionsParameter {
  option;
  rootElement;
  constructor(setupParameter) {
    switch (setupParameter.domain.type) {
      case GameSetupDomainType.Select:
        this.option = setupParameter.array ? new MultiSelectorOption() : new SelectorOption();
        break;
      case GameSetupDomainType.Boolean:
        this.option = new BooleanOption();
        break;
      case GameSetupDomainType.Integer:
      case GameSetupDomainType.UnsignedInteger:
        this.option = new NumericOption();
        break;
      case GameSetupDomainType.Text:
        this.option = new TextBoxOption();
        break;
      default:
        this.option = new LabelOption();
        break;
    }
    this.rootElement = this.option.create(setupParameter);
  }
  render() {
    return this.rootElement;
  }
  processChange(change) {
    let setupParameter = null;
    if (change.teamID != null) {
      setupParameter = GameSetup.findTeamParameter(change.teamID, change.parameterID);
    } else if (change.playerID != null) {
      setupParameter = GameSetup.findPlayerParameter(change.playerID, change.parameterID);
    } else {
      setupParameter = GameSetup.findGameParameter(change.parameterID);
    }
    if (setupParameter) {
      if (change.detailsChanged || change.hiddenStatusChanged || change.invalidReasonChanged || change.possibleValuesChanged || change.readOnlyStatusChanged || change.valueChanged) {
        this.option.processChange(setupParameter, change);
      }
    }
  }
}
const SettingsGroupHiddenToggledName = "toggle-settings-group-hidden";
class SettingsGroupHiddenToggled extends CustomEvent {
  constructor(id, hidden) {
    super(SettingsGroupHiddenToggledName, { bubbles: false, detail: { id, hidden } });
  }
}
class SettingsGroup {
  constructor(name, groupHandle, headerOptions) {
    this.name = name;
    this.groupHandle = groupHandle;
    this.headerOptions = headerOptions;
    const isCollapsible = headerOptions.isCollapsible ?? true;
    this._headerContainer = document.createElement(isCollapsible ? "fxs-activatable" : "div");
    this.paramGroupHandle = groupHandle;
    const settingsHeader = this.createSettingsHeader(name);
    this._headerContainer.appendChild(settingsHeader);
    this._headerContainer.id = `${this.paramGroupHandle}-header`;
    this._bodyElement.id = `${this.paramGroupHandle}-container`;
    this._headerContainer.classList.add("advanced-options__group-option-header", "group");
    this._bodyElement.classList.add("overflow-hidden", "ease-out", "advanced-options__group-option-container");
    const resizeObserver = new ResizeObserver((_entries) => {
      this.onInitialHeightSet(this._bodyElement, this._bodyElement.clientHeight, resizeObserver);
      waitForLayout(() => {
        this._bodyElement.classList.add("transition-height");
        this._settingsArrow?.classList.add("transition-transform");
      });
    });
    resizeObserver.observe(this._bodyElement);
    this._headerContainer.addEventListener("action-activate", () => {
      this.toggleCollapseOptionsSection();
    });
    if (isCollapsible) {
      this._headerContainer.setAttribute("tabindex", "-1");
      this._settingsArrow = document.createElement("div");
      this._settingsArrow.classList.add("img-arrow", "h-10", "w-16", "absolute", "right-1", "rotate-90");
      MustGetElement(".advanced-options__settings-header-content", this._headerContainer).appendChild(
        this._settingsArrow
      );
    }
  }
  _headerContainer;
  _bodyElement = document.createElement("div");
  _settingsArrow = void 0;
  paramGroupHandle;
  get headerElement() {
    return this._headerContainer;
  }
  get bodyElement() {
    return this._bodyElement;
  }
  get settingsArrow() {
    return this._settingsArrow;
  }
  createSettingsHeader(name) {
    const settingsHeader = document.createElement("div");
    settingsHeader.classList.add("my-1", "h-12", "flex", "relative");
    const settingsBGContainer = document.createElement("div");
    settingsBGContainer.classList.add(
      "absolute",
      "size-full",
      "flex",
      "group-focus\\:opacity-0",
      "group-hover\\:opacity-0",
      "group-pressed\\:opacity-0"
    );
    settingsHeader.appendChild(settingsBGContainer);
    const settingsBGLeft = document.createElement("div");
    settingsBGLeft.classList.add("advanced-options__dropdown-bg", "flex-auto", "-ml-1");
    settingsBGContainer.appendChild(settingsBGLeft);
    const settingsBGRight = document.createElement("div");
    settingsBGRight.classList.add("advanced-options__dropdown-bg", "flex-auto", "-mr-1", "-scale-x-100");
    settingsBGContainer.appendChild(settingsBGRight);
    const settingsBGHighlightContainer = document.createElement("div");
    settingsBGHighlightContainer.classList.add(
      "absolute",
      "size-full",
      "flex",
      "opacity-0",
      "group-focus\\:opacity-100",
      "group-hover\\:opacity-100",
      "group-pressed\\:opacity-100"
    );
    settingsHeader.appendChild(settingsBGHighlightContainer);
    const settingsBGHighlightLeft = document.createElement("div");
    settingsBGHighlightLeft.classList.add("advanced-options__dropdown-bg-highlight", "flex-auto", "-ml-1");
    settingsBGHighlightContainer.appendChild(settingsBGHighlightLeft);
    const settingsBGHighlightRight = document.createElement("div");
    settingsBGHighlightRight.classList.add(
      "advanced-options__dropdown-bg-highlight",
      "flex-auto",
      "-mr-1",
      "-scale-x-100"
    );
    settingsBGHighlightContainer.appendChild(settingsBGHighlightRight);
    const settingsHeaderContent = document.createElement("div");
    settingsHeaderContent.classList.add(
      "advanced-options__settings-header-content",
      "flex",
      "items-center",
      "justify-center",
      "size-full",
      "relative",
      "pointer-events-auto"
    );
    settingsHeaderContent.setAttribute("role", "option");
    settingsHeader.appendChild(settingsHeaderContent);
    const settingsHeaderLeftDecor = document.createElement("div");
    settingsHeaderLeftDecor.classList.add("advanced-options__header-decor", "w-5", "h-7", "rotate-90");
    settingsHeaderContent.appendChild(settingsHeaderLeftDecor);
    const settingsHeaderText = document.createElement("div");
    settingsHeaderText.setAttribute("data-l10n-id", name ?? "");
    settingsHeaderText.classList.add("font-title", "my-1", "uppercase", "mx-4", "tracking-150");
    settingsHeaderContent.appendChild(settingsHeaderText);
    const settingsHeaderRightDecor = document.createElement("div");
    settingsHeaderRightDecor.classList.add("advanced-options__header-decor", "w-5", "h-7", "-rotate-90");
    settingsHeaderContent.appendChild(settingsHeaderRightDecor);
    return settingsHeader;
  }
  onInitialHeightSet(dropdownContent, _height, observer) {
    const originalHeight = Array.from(dropdownContent.children).reduce(
      (accumulator, currentChild) => accumulator + currentChild.clientHeight,
      0
    );
    dropdownContent.attributeStyleMap.set("height", CSS.px(originalHeight));
    dropdownContent.setAttribute("original-height", originalHeight.toString());
    observer.unobserve(dropdownContent);
  }
  toggleCollapseOptionsSection() {
    const curHeight = this.bodyElement.clientHeight;
    const originalHeight = Number(this.bodyElement.getAttribute("original-height"));
    if (curHeight == originalHeight) {
      this.bodyElement.attributeStyleMap.set("height", CSS.px(0));
      Audio.playSound("data-audio-dropdown-close", "audio-base");
      const optionRows = this.bodyElement.querySelectorAll(
        ".advanced-options-setting-row"
      );
      for (const row of optionRows) {
        row.removeAttribute("tabindex");
      }
      const optionElements = this.bodyElement.querySelectorAll(".advanced-options__option");
      for (const element of optionElements) {
        element.removeAttribute("tabindex");
      }
      this.bodyElement.setAttribute("hidden-toggled", "true");
      this._settingsArrow?.classList.remove("rotate-90");
      this._settingsArrow?.classList.add("-rotate-90");
      dispatchEvent(new SettingsGroupHiddenToggled(this.groupHandle, true));
    } else {
      this.bodyElement.attributeStyleMap.set("height", CSS.px(originalHeight));
      Audio.playSound("data-audio-dropdown-open", "audio-base");
      const optionRows = this.bodyElement.querySelectorAll(
        ".advanced-options-setting-row"
      );
      for (const row of optionRows) {
        row.setAttribute("tabindex", "-1");
      }
      const optionElements = this.bodyElement.querySelectorAll(".advanced-options__option");
      for (const element of optionElements) {
        element.setAttribute("tabindex", "-1");
      }
      this.bodyElement.setAttribute("hidden-toggled", "false");
      this._settingsArrow?.classList.remove("-rotate-90");
      this._settingsArrow?.classList.add("rotate-90");
      dispatchEvent(new SettingsGroupHiddenToggled(this.groupHandle, false));
    }
  }
  addOption(option) {
    option.classList.add(this._bodyElement.children.length % 2 == 0 ? "bg-primary-4" : "bg-primary-5");
    this._bodyElement.appendChild(option);
    if (this._bodyElement.getAttribute("hidden-toggled") == "true") {
      option.removeAttribute("tabindex");
      option.querySelector(".advanced-options__option")?.removeAttribute("tabindex");
    }
    if (UI.isInGame()) {
      option.classList.add("advanced-options__highlight-border");
    }
  }
  remove() {
    this._bodyElement.remove();
    this._headerContainer.remove();
  }
}
class SettingsGroupManager {
  static _Instance;
  cachedHiddenContainerIDS = /* @__PURE__ */ new Set();
  static getInstance() {
    if (!SettingsGroupManager._Instance) {
      SettingsGroupManager._Instance = new SettingsGroupManager();
    }
    return SettingsGroupManager._Instance;
  }
  addNewSettingsGroup(name, groupHandle, addToContainer, headerOptions) {
    const newSettingsGroup = new SettingsGroup(name, groupHandle, headerOptions);
    addToContainer.appendChild(newSettingsGroup.headerElement);
    addToContainer.appendChild(newSettingsGroup.bodyElement);
    if (this.cachedHiddenContainerIDS.has(groupHandle)) {
      newSettingsGroup.bodyElement.attributeStyleMap.set("height", CSS.px(0));
      newSettingsGroup.bodyElement.setAttribute("hidden-toggled", "true");
      newSettingsGroup.settingsArrow?.classList.remove("rotate-90");
      newSettingsGroup.settingsArrow?.classList.add("-rotate-90");
    }
    addEventListener(SettingsGroupHiddenToggledName, (event) => {
      if (event.detail.hidden) {
        this.cachedHiddenContainerIDS.add(event.detail.id);
      } else {
        this.cachedHiddenContainerIDS.delete(event.detail.id);
      }
    });
    return newSettingsGroup;
  }
  clearCachedHiddenContainerIDs() {
    this.cachedHiddenContainerIDS.clear();
  }
}
const SettingsGroupData = SettingsGroupManager.getInstance();

class AdvancedOptionsBase extends GameCreationPanelBase {
  wasCompact = Layout.isCompact();
  frame = document.createElement("fxs-frame");
  headerText = "";
  setupSlotGroup = document.createElement("fxs-slot-group");
  gameSetupPanel = document.createElement("fxs-vslot");
  legacyPathSetupPanel = document.createElement("fxs-vslot");
  saveConfigAttributes = {
    "menu-type": "save_config",
    "server-type": ServerType.SERVER_TYPE_NONE,
    "save-type": SaveTypes.DEFAULT
  };
  loadConfigAttributes = {
    "menu-type": "load_config",
    "server-type": ServerType.SERVER_TYPE_NONE,
    "save-type": SaveTypes.DEFAULT
  };
  showSaveScreenListener = this.showSaveScreen.bind(this);
  showLoadScreenListener = this.showLoadScreen.bind(this);
  onConfirmButtonPressedListener = this.onConfirmButtonPressed.bind(this);
  onWindowResizeListener = this.onResize.bind(this);
  tooltipElements = [];
  confirmButton = document.createElement("fxs-hero-button");
  gameParamEles = [];
  gameOptionsHeaders = [];
  LegacyPathsParameterID;
  groupContainers = /* @__PURE__ */ new Map();
  activeGameParameters = /* @__PURE__ */ new Map();
  groupNames = /* @__PURE__ */ new Map();
  currentSlotIndex = 0;
  slotIDs = [];
  activePanel = this.gameSetupPanel;
  navControlButtonInfo = [];
  constructor(root) {
    super(root);
    this.slotIDs = ["advanced-setup__game", "advanced-setup__legacy", "advanced-setup__player"];
    this.enableCloseSound = true;
    this.LegacyPathsParameterID = GameSetup.makeString("LegacyPaths");
  }
  onInitialize() {
    const fragment = document.createDocumentFragment();
    this.frame.setAttribute("content-class", "mx-4");
    this.frame.setAttribute("outside-safezone-mode", "vertical");
    fragment.appendChild(this.frame);
    const header = document.createElement("fxs-header");
    header.classList.add("font-title", "text-lg", "text-center", "uppercase");
    header.setAttribute("title", this.headerText);
    header.setAttribute("filigree-style", "none");
    this.frame.appendChild(header);
    if (this.navControlButtonInfo.length > 1) {
      this.frame.appendChild(this.createTopNav());
    }
    this.createGameSetupPanel();
    this.createLegacyPathSetupPanel();
    this.setupSlotGroup.setAttribute("selected-slot", this.slotIDs[0]);
    this.setupSlotGroup.classList.add("flex-auto");
    this.frame.appendChild(this.setupSlotGroup);
    this.frame.appendChild(this.createBottomNav());
    this.Root.appendChild(fragment);
    this.Root.setAttribute("data-audio-group-ref", "audio-advanced-options");
    this.Root.listenForEngineEvent("UpdateFrame", this.onUpdate, this);
  }
  onAttach() {
    super.onAttach();
    window.addEventListener("resize", this.onWindowResizeListener);
  }
  onDetach() {
    window.removeEventListener("resize", this.onWindowResizeListener);
    SettingsGroupData.clearCachedHiddenContainerIDs();
    super.onDetach();
  }
  createTopNav() {
    const navControlEle = this.createNavControls(this.navControlButtonInfo);
    navControlEle.classList.add("advanced-options__top-nav", "my-4");
    navControlEle.classList.remove("flex-auto", "my-8");
    return navControlEle;
  }
  createBottomNav() {
    const footerContainer = document.createElement("div");
    footerContainer.classList.add("h-20", "mx-8");
    const footerContent = document.createElement("fxs-hslot");
    footerContent.classList.add("advanced-options__footer", "justify-center");
    footerContent.classList.toggle("hidden", ActionHandler.isGamepadActive);
    footerContainer.appendChild(footerContent);
    if (!UI.isInGame()) {
      const backButton = document.createElement("fxs-activatable");
      backButton.classList.add(
        "advanced-options__back-button",
        "mx-2",
        "mb-2",
        "mt-6",
        "size-12",
        "bg-contain",
        "bg-no-repeat"
      );
      backButton.addEventListener("action-activate", () => CreateGameModel.showPreviousPanel());
      footerContent.appendChild(backButton);
      const resetDefaultsButton = document.createElement("fxs-button");
      resetDefaultsButton.classList.add("mx-2", "mb-2", "mt-6");
      resetDefaultsButton.setAttribute("caption", "LOC_OPTIONS_RESET_TO_DEFAULTS");
      resetDefaultsButton.addEventListener("action-activate", this.resetToDefaults.bind(this));
      footerContent.appendChild(resetDefaultsButton);
      this.confirmButton.classList.add("mx-2", "mb-2", "grow");
      this.confirmButton.addEventListener("action-activate", this.onConfirmButtonPressedListener);
      footerContent.appendChild(this.confirmButton);
      const saveConfigButton = document.createElement("fxs-activatable");
      saveConfigButton.classList.add(
        "advanced-options__save-config",
        "mx-2",
        "mb-2",
        "mt-6",
        "size-12",
        "bg-no-repeat",
        "bg-contain"
      );
      saveConfigButton.setAttribute("data-tooltip-content", "LOC_UI_SAVE_CONFIG");
      saveConfigButton.addEventListener("action-activate", this.showSaveScreenListener);
      footerContent.appendChild(saveConfigButton);
      const loadConfigButton = document.createElement("fxs-activatable");
      loadConfigButton.classList.add(
        "advanced-options__load-config",
        "mx-2",
        "mb-2",
        "mt-6",
        "size-12",
        "bg-no-repeat",
        "bg-contain"
      );
      loadConfigButton.setAttribute("data-tooltip-content", "LOC_UI_LOAD_CONFIG");
      loadConfigButton.addEventListener("action-activate", this.showLoadScreenListener);
      footerContent.appendChild(loadConfigButton);
    } else {
      const backButton = document.createElement("fxs-button");
      backButton.classList.add("mb-2", "mt-6");
      backButton.setAttribute("caption", "LOC_GENERIC_BACK");
      backButton.addEventListener("action-activate", () => {
        this.close();
      });
      footerContent.appendChild(backButton);
    }
    return footerContainer;
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    waitForLayout(() => this.updateFocus());
    NavTray.clear();
    this.setupNavTray();
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  setupNavTray() {
    NavTray.addOrUpdateGenericBack();
    if (UI.isInGame()) {
      return;
    }
    NavTray.addOrUpdateNavShellPrevious("LOC_UI_SAVE_CONFIG");
    NavTray.removeAccept();
    NavTray.addOrUpdateNavShellNext("LOC_UI_LOAD_CONFIG");
    NavTray.addOrUpdateShellAction2("LOC_OPTIONS_RESET_TO_DEFAULTS");
  }
  onEngineInput(event) {
    if (event.detail.status != InputActionStatuses.FINISH || UI.isInGame()) {
      return;
    }
    if (event.detail.name === "sys-menu") {
      this.showProgression();
      event.stopPropagation();
      event.preventDefault();
    }
    if (event.detail.name === "shell-action-1") {
      this.onConfirmButtonPressed();
      event.stopPropagation();
      event.preventDefault();
    }
    if (event.detail.name === "shell-action-2") {
      this.resetToDefaults();
      event.stopPropagation();
      event.preventDefault();
    }
  }
  onActiveDeviceTypeChanged() {
    MustGetElement(".advanced-options__footer", this.Root).classList.toggle(
      "hidden",
      ActionHandler.isGamepadActive
    );
  }
  createGameSetupPanel() {
    this.gameSetupPanel.classList.add("game-setup", "flex", "flex-col");
    this.gameSetupPanel.id = this.slotIDs[0];
    const scrollableContent = document.createElement("fxs-scrollable");
    scrollableContent.classList.add("flex-auto");
    scrollableContent.setAttribute("allow-mouse-panning", "true");
    this.gameSetupPanel.appendChild(scrollableContent);
    const scrollableContentContainer = document.createElement("div");
    scrollableContentContainer.classList.add("advanced-setup__game-options-container", "flex-auto", "mx-8");
    scrollableContent.appendChild(scrollableContentContainer);
    this.setupSlotGroup.appendChild(this.gameSetupPanel);
  }
  createLegacyPathSetupPanel() {
    this.legacyPathSetupPanel.classList.add("legacy-setup", "flex", "flex-col");
    this.legacyPathSetupPanel.id = this.slotIDs[1];
    const scrollableContent = document.createElement("fxs-scrollable");
    scrollableContent.classList.add("flex-auto");
    scrollableContent.setAttribute("allow-mouse-panning", "true");
    this.legacyPathSetupPanel.appendChild(scrollableContent);
    const scrollableContentContainer = document.createElement("div");
    scrollableContentContainer.classList.add("advanced-setup__legacy-options-container", "flex-auto", "mx-8");
    scrollableContent.appendChild(scrollableContentContainer);
    this.setupSlotGroup.appendChild(this.legacyPathSetupPanel);
    const legacyPathsDisabledWarning = document.createElement("div");
    legacyPathsDisabledWarning.classList.add(
      "w-full",
      "bg-primary-3",
      "border-2",
      "border-primary",
      "flex",
      "items-center",
      "my-2"
    );
    const legacyPathsWarningIcon = document.createElement("div");
    legacyPathsWarningIcon.classList.add("img-unit-badge-warning", "size-14", "mx-2");
    legacyPathsDisabledWarning.appendChild(legacyPathsWarningIcon);
    const legacyPathsWarningText = document.createElement("div");
    legacyPathsWarningText.setAttribute("data-l10n-id", "LOC_ADVANCED_OPTIONS_LEGACY_PATHS_DISABLED_WARNING");
    legacyPathsWarningText.classList.add("flex-auto", "my-2", "pointer-events-auto");
    legacyPathsWarningText.setAttribute("role", "alert");
    legacyPathsDisabledWarning.appendChild(legacyPathsWarningText);
    scrollableContentContainer.appendChild(legacyPathsDisabledWarning);
  }
  createParamEleLabel(setupParam, paramEle) {
    const container = document.createElement(setupParam.array ? "fxs-spatial-slot" : "fxs-hslot");
    container.classList.add("advanced-options-setting-row", "items-center");
    if (!setupParam.array) {
      container.classList.add("h-14");
      const paramName = GameSetup.resolveString(setupParam.name);
      const label = document.createElement("div");
      label.classList.add("flex", "flex-auto", "justify-start", "font-body-base", "ml-4", "pointer-events-auto");
      label.setAttribute("data-l10n-id", paramName ?? "");
      label.setAttribute("role", "option");
      container.appendChild(label);
    } else {
      container.classList.add("mx-4");
    }
    container.appendChild(paramEle);
    this.gameParamEles.push(container);
    return container;
  }
  goToNewPanel(panel) {
    this.navControlTabs[this.currentSlotIndex].classList.remove("game-creator-nav-button-selected");
    this.currentSlotIndex = this.slotIDs.indexOf(panel.id);
    this.setupSlotGroup.setAttribute("selected-slot", this.slotIDs[this.currentSlotIndex]);
    this.navControlTabs[this.currentSlotIndex].classList.add("game-creator-nav-button-selected");
    this.activePanel = panel;
    this.updateFocus();
  }
  showGameSetupPanel() {
    this.goToNewPanel(this.gameSetupPanel);
  }
  showLegacyPathSetupPanel() {
    this.goToNewPanel(this.legacyPathSetupPanel);
  }
  updateFocus() {
    if (this.activePanel == this.gameSetupPanel && this.gameParamEles.length > 0) {
      FocusManager.setFocus(this.gameParamEles[0]);
    } else {
      FocusManager.setFocus(this.activePanel);
    }
    this.setupNavTray();
  }
  showSaveScreen() {
    ContextManager.push("screen-save-load", {
      singleton: true,
      createMouseGuard: true,
      attributes: this.saveConfigAttributes
    });
  }
  showLoadScreen() {
    ContextManager.push("screen-save-load", {
      singleton: true,
      createMouseGuard: true,
      attributes: this.loadConfigAttributes
    });
  }
  onNavigateInput(navigationEvent) {
    if (navigationEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (this.isNavigationEnabled == false) {
      return;
    }
    switch (navigationEvent.getDirection()) {
      case InputNavigationAction.PREVIOUS:
        this.navControlTabs[this.currentSlotIndex].classList.remove("game-creator-nav-button-selected");
        this.currentSlotIndex = (this.currentSlotIndex - 1) % this.slotIDs.length;
        if (this.currentSlotIndex < 0) {
          this.currentSlotIndex = this.slotIDs.length - 1;
        }
        this.setupSlotGroup.setAttribute("selected-slot", this.slotIDs[this.currentSlotIndex]);
        this.navControlTabs[this.currentSlotIndex].classList.add("game-creator-nav-button-selected");
        this.activePanel = MustGetElement(`#${this.slotIDs[this.currentSlotIndex]}`, this.Root);
        Audio.playSound("data-audio-activate", "game-creator");
        this.updateFocus();
        navigationEvent.preventDefault();
        navigationEvent.stopImmediatePropagation();
        break;
      case InputNavigationAction.NEXT:
        this.navControlTabs[this.currentSlotIndex].classList.remove("game-creator-nav-button-selected");
        this.currentSlotIndex = (this.currentSlotIndex + 1) % this.slotIDs.length;
        this.setupSlotGroup.setAttribute("selected-slot", this.slotIDs[this.currentSlotIndex]);
        this.navControlTabs[this.currentSlotIndex].classList.add("game-creator-nav-button-selected");
        this.activePanel = MustGetElement(`#${this.slotIDs[this.currentSlotIndex]}`, this.Root);
        Audio.playSound("data-audio-activate", "game-creator");
        this.updateFocus();
        navigationEvent.preventDefault();
        navigationEvent.stopImmediatePropagation();
        break;
      case InputNavigationAction.SHELL_NEXT:
        if (UI.isInGame()) {
          break;
        }
        this.showLoadScreen();
        navigationEvent.preventDefault();
        navigationEvent.stopImmediatePropagation();
        break;
      case InputNavigationAction.SHELL_PREVIOUS:
        if (UI.isInGame()) {
          break;
        }
        this.showSaveScreen();
        navigationEvent.preventDefault();
        navigationEvent.stopImmediatePropagation();
        break;
    }
  }
  refreshGameOptions() {
    const refreshGameOptionsProfilingHandle = UI.beginProfiling("refreshGameOptions");
    for (const element of this.gameParamEles) {
      element.remove();
    }
    for (const optionsHeader of this.gameOptionsHeaders) {
      optionsHeader.remove();
    }
    this.gameOptionsHeaders = [];
    for (const groups of this.groupContainers) {
      groups[1].remove();
    }
    this.groupContainers.clear();
    this.gameParamEles.length = 0;
    this.activeGameParameters = /* @__PURE__ */ new Map();
    const parameters = GameSetup.getGameParameters();
    for (const param of parameters) {
      if (!param.hidden && param.invalidReason == GameSetupParameterInvalidReason.Valid) {
        if (param.ID == GameSetup.makeString("Age")) {
          if (Online.Metaprogression.isPlayingActiveEvent() && LiveEventManager.skipAgeSelect()) {
            param.readOnly = true;
          }
        }
        const option = this.getOptionFromParam(param);
        let options = this.activeGameParameters.get(param.ID);
        if (options == null) {
          options = [];
          this.activeGameParameters.set(param.ID, options);
        }
        options.push(option);
        const paramEle = option.render();
        paramEle.id = param.ID.toString();
        const resolvedParamGroup = this.resolveParamGroup(param);
        const groupContainer = this.groupContainers.get(resolvedParamGroup);
        if (groupContainer) {
          groupContainer.addOption(this.createParamEleLabel(param, paramEle));
        } else {
          const groupName = GameSetup.resolveString(resolvedParamGroup);
          const newGroupContainer = SettingsGroupData.addNewSettingsGroup(
            this.groupNames.get(groupName) ?? "",
            resolvedParamGroup.toString(),
            this.getTabContainerForParam(param),
            { isCollapsible: groupName != "LegacyOptions" }
          );
          this.groupContainers.set(resolvedParamGroup, newGroupContainer);
          newGroupContainer.addOption(this.createParamEleLabel(param, paramEle));
        }
      }
    }
    UI.endProfiling(refreshGameOptionsProfilingHandle);
  }
  resolveParamGroup(param) {
    return param.group;
  }
  resetToDefaults() {
    const confirmCallback = (eAction) => {
      if (eAction == DialogBoxAction.Confirm) {
        this.onResetConfirmed();
      }
    };
    DialogBoxManager.createDialog_ConfirmCancel({
      body: "LOC_OPTIONS_ARE_YOU_SURE_DEFAULT",
      title: "LOC_OPTIONS_RESET_TO_DEFAULTS",
      canClose: false,
      displayQueue: "SystemMessage",
      addToFront: true,
      callback: confirmCallback
    });
  }
  onResize() {
    this.updateTooltipPosition();
    this.updateFrame();
  }
  updateTooltipPosition() {
    const isCompact = Layout.isCompact();
    if (isCompact != this.wasCompact) {
      for (const tooltipElement of this.tooltipElements) {
        tooltipElement.setAttribute("data-tooltip-alignment", isCompact ? "top-right" : "");
        tooltipElement.setAttribute("data-tooltip-anchor", isCompact ? "left" : "right");
      }
      this.wasCompact = isCompact;
    }
  }
  updateFrame() {
    this.frame.setAttribute(
      "outside-safezone-mode",
      UI.getViewExperience() == UIViewExperience.Mobile ? "full" : "vertical"
    );
  }
  getOptionFromParam(param) {
    return new AdvancedOptionsParameter(param);
  }
  //function prototypes meant to be overridden
  onResetConfirmed() {
    console.error("Base onResetConfirmed called from advanced-options-base. This should be overridden");
  }
  onConfirmButtonPressed() {
    console.error("Base onConfirmButtonPressed called from advanced-options-base. This should be overridden");
  }
  onUpdate() {
    console.error("Base onUpdate called from advanced-options-base. This should be overridden");
  }
  getTabContainerForParam(param) {
    const groupID = GameSetup.resolveString(param.group);
    const isLegacyOption = groupID == "LegacyOptions";
    return MustGetElement(
      isLegacyOption ? ".advanced-setup__legacy-options-container" : ".advanced-setup__game-options-container",
      this.Root
    );
  }
}

const styles = "fs://game/core/ui/shell/create-panels/advanced-options-panel.css";

export { AdvancedOptionsParameter as A, OptionsBase as O, AdvancedOptionsBase as a, styles as s };
//# sourceMappingURL=advanced-options-panel.chunk.js.map

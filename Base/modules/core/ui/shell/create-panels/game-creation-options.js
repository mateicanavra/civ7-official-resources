import { Audio } from '../../audio-base/audio-support.js';
import { DropdownSelectionChangeEventName } from '../../components/fxs-dropdown.js';
import { MustGetElement } from '../../utilities/utilities-dom.js';
import { Layout } from '../../utilities/utilities-layout.js';

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
    parameterInteractable.style.width = Layout.pixels(386);
  }
}
class BooleanOption extends OptionsBase {
  component = null;
  create(setupParam) {
    if (UI.isInGame()) {
      const selectedOption = document.createElement("div");
      selectedOption.classList.value = "advanced-options__option font-body-base mr-4 text-center pointer-events-auto";
      selectedOption.innerHTML = Locale.compose(
        this.castToBoolean(setupParam.value.value) ? "LOC_UI_ENABLED" : "LOC_UI_DISABLED"
      );
      selectedOption.setAttribute("tabIndex", "-1");
      selectedOption.style.width = Layout.pixels(386);
      this.setParameterCommonInfo(setupParam, selectedOption, null);
      this.component = selectedOption;
      return selectedOption;
    }
    const booleanSelector = document.createElement("fxs-selector");
    const parameterID = GameSetup.resolveString(setupParam.ID);
    booleanSelector.classList.add("advanced-options__option", "font-body-base", "mr-4");
    booleanSelector.style.width = Layout.pixels(386);
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
      selectedOption.classList.value = "advanced-options__option font-body-base mr-4 text-center pointer-events-auto";
      selectedOption.innerHTML = Locale.compose(this.getParameterValueName(setupParam));
      selectedOption.setAttribute("tabIndex", "-1");
      selectedOption.style.width = Layout.pixels(386);
      this.setParameterCommonInfo(setupParam, selectedOption, null);
      return selectedOption;
    }
    this.parameterID = GameSetup.resolveString(setupParam.ID);
    this.textboxElement.classList.add("advanced-options__option", "font-body-base", "mr-4");
    this.textboxElement.style.maxWidth = Layout.pixels(386);
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
      selectedOption.classList.value = "advanced-options__option font-body-base mr-4 text-center pointer-events-auto";
      selectedOption.innerHTML = Locale.compose(this.getParameterValueName(setupParam));
      selectedOption.setAttribute("tabIndex", "-1");
      selectedOption.style.width = Layout.pixels(386);
      this.setParameterCommonInfo(setupParam, selectedOption, null);
      return selectedOption;
    }
    this.parameterID = setupParam.ID;
    const textboxElement = document.createElement("fxs-textbox");
    textboxElement.classList.add("advanced-options__option", "font-body-base", "mr-4");
    textboxElement.style.maxWidth = Layout.pixels(386);
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
      selectedOption.classList.value = "advanced-options__option font-body-base mr-4 text-center pointer-events-auto";
      selectedOption.innerHTML = Locale.compose(this.getParameterValueName(setupParam));
      selectedOption.setAttribute("tabIndex", "-1");
      selectedOption.style.width = Layout.pixels(386);
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
          pvControl.classList.add("advanced-options__option", "mr-4");
          pvControl.style.width = Layout.pixels(386);
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

export { AdvancedOptionsParameter, BooleanOption, LabelOption, MultiSelectorOption, NumericOption, OptionsBase, SelectorOption, SettingsGroup, SettingsGroupData, TextBoxOption };
//# sourceMappingURL=game-creation-options.js.map

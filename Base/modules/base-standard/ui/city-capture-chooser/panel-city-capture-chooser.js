import { A as Audio } from '../../../core/ui/audio-base/audio-support.chunk.js';
import FocusManager from '../../../core/ui/input/focus-manager.js';
import { b as InputEngineEventName, a as NavigateInputEventName } from '../../../core/ui/input/input-support.chunk.js';
import { InterfaceModeChangedEventName, InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { N as NavTray } from '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel, A as AnchorType } from '../../../core/ui/panel-support.chunk.js';
import { C as ComponentID } from '../../../core/ui/utilities/utilities-component-id.chunk.js';
import { D as Databind } from '../../../core/ui/utilities/utilities-core-databinding.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { U as UpdateGate } from '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import { G as GetPrevCityID, a as GetNextCityID } from '../production-chooser/production-chooser-helpers.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../building-placement/building-placement-manager.js';
import '../../../core/ui/utilities/utilities-core-textprovider.chunk.js';
import '../tutorial/tutorial-support.chunk.js';
import '../../../core/ui/components/fxs-nav-help.chunk.js';
import '../../../core/ui/utilities/utilities-layout.chunk.js';
import '../quest-tracker/quest-item.js';
import '../quest-tracker/quest-tracker.js';
import '../tutorial/tutorial-item.js';
import '../tutorial/tutorial-manager.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/input/input-filter.chunk.js';
import '../tutorial/tutorial-events.chunk.js';
import '../utilities/utilities-tags.chunk.js';

var DirectiveTypes = /* @__PURE__ */ ((DirectiveTypes2) => {
  DirectiveTypes2[DirectiveTypes2["LIBERATE_FOUNDER"] = 0] = "LIBERATE_FOUNDER";
  DirectiveTypes2[DirectiveTypes2["LIBERATE_PREVIOUS_OWNER"] = 1] = "LIBERATE_PREVIOUS_OWNER";
  DirectiveTypes2[DirectiveTypes2["KEEP"] = 2] = "KEEP";
  DirectiveTypes2[DirectiveTypes2["RAZE"] = 3] = "RAZE";
  return DirectiveTypes2;
})(DirectiveTypes || {});
class CityCaptureChooserModel {
  _cityID = null;
  _OnUpdate;
  _isJustConqueredFrom = false;
  _isBeingRazed = false;
  _numWonders = 0;
  constructor() {
    engine.whenReady.then(() => {
      engine.on("CitySelectionChanged", () => {
        const localPlayer = GameContext.localPlayerID;
        let selectedCityID = UI.Player.getHeadSelectedCity();
        if (selectedCityID) {
          const c = Cities.get(selectedCityID);
          if (!c || c.owner != localPlayer) {
            selectedCityID = null;
          } else if (c) {
            this._isJustConqueredFrom = c.isJustConqueredFrom;
            this._isBeingRazed = c.isBeingRazed;
            if (c.Constructibles) {
              this._numWonders = c.Constructibles.getNumWonders();
            }
          }
        }
        this.cityID = selectedCityID;
      });
      this.updateGate.call("init");
    });
  }
  set updateCallback(callback) {
    this._OnUpdate = callback;
  }
  updateGate = new UpdateGate(() => {
    const player = Players.get(GameContext.localPlayerID);
    const cityID = this.cityID;
    if (player && cityID && !ComponentID.isInvalid(cityID)) {
      const city = Cities.get(cityID);
      if (!city) {
        console.error("model-city-capture: updateGate - no city found for cityID " + cityID);
        return;
      }
      this._isJustConqueredFrom = city.isJustConqueredFrom;
      this._isBeingRazed = city.isBeingRazed;
      if (!city.Constructibles) {
        console.error("model-city-capture: updateGate - no city constructibles found for cityID " + cityID);
        return;
      }
      this._numWonders = city.Constructibles.getNumWonders();
    }
    if (this._OnUpdate) {
      this._OnUpdate(this);
    }
  });
  set cityID(id) {
    this._cityID = id;
    if (id != null) {
      this.updateGate.call("cityID");
    }
  }
  get cityID() {
    return this._cityID;
  }
  get canDisplayPanel() {
    return this._isJustConqueredFrom;
  }
  get isBeingRazed() {
    return this._isBeingRazed;
  }
  get isNotBeingRazed() {
    return !this._isBeingRazed;
  }
  get containsWonder() {
    return this._numWonders > 0;
  }
  get numWonders() {
    return this._numWonders;
  }
  sendLiberateFounderRequest() {
    this.sendChoiceRequest(0 /* LIBERATE_FOUNDER */);
  }
  sendKeepRequest() {
    this.sendChoiceRequest(2 /* KEEP */);
  }
  sendRazeRequest() {
    this.sendChoiceRequest(3 /* RAZE */);
  }
  sendChoiceRequest(choice) {
    const args = { Directive: choice };
    if (this._cityID) {
      const result = Game.CityCommands.canStart(this._cityID, CityCommandTypes.DESTROY, args, false);
      if (result.Success) {
        Game.CityCommands.sendRequest(this._cityID, CityCommandTypes.DESTROY, args);
      } else {
        console.error("model-city-capture: sendChoiceRequest() - failed to start DESTROY operation");
      }
    }
  }
  getKeepCanStartResult() {
    const args = { Directive: 2 /* KEEP */ };
    if (this._cityID) {
      const result = Game.CityCommands.canStart(this._cityID, CityCommandTypes.DESTROY, args, false);
      return result;
    }
    return void 0;
  }
  getRazeCanStartResult() {
    const args = { Directive: 3 /* RAZE */ };
    if (this._cityID) {
      const result = Game.CityCommands.canStart(this._cityID, CityCommandTypes.DESTROY, args, false);
      return result;
    }
    return void 0;
  }
}
const CityCaptureChooser = new CityCaptureChooserModel();
engine.whenReady.then(() => {
  const updateModel = () => {
    engine.updateWholeModel(CityCaptureChooser);
  };
  engine.createJSModel("g_CityCaptureChooser", CityCaptureChooser);
  CityCaptureChooser.updateCallback = updateModel;
});

const content = "<div class=\"city-capture__frame-container flex-auto mt-32 mb-4\">\r\n\t<fxs-subsystem-frame\r\n\t\tclass=\"city-capture-subsystem-frame flex items-center grow pointer-events-auto\"\r\n\t\tbox-style=\"b1\"\r\n\t>\r\n\t\t<div\r\n\t\t\tdata-slot=\"header\"\r\n\t\t\tclass=\"flex justify-around items-center relative\"\r\n\t\t>\r\n\t\t\t<fxs-nav-help\r\n\t\t\t\taction-key=\"inline-cycle-prev\"\r\n\t\t\t\tclass=\"absolute left-12 flex\"\r\n\t\t\t></fxs-nav-help>\r\n\t\t\t<fxs-activatable class=\"img-arrow cap-chooser__prev-arrow\"></fxs-activatable>\r\n\t\t\t<fxs-header\r\n\t\t\t\tclass=\"cap-chooser__city-name mt-5 tracking-150 mb-3 max-w-96 text-center self-center font-title text-2xl text-gradient-secondary\"\r\n\t\t\t></fxs-header>\r\n\t\t\t<fxs-activatable class=\"img-arrow cap-chooser__next-arrow -scale-x-100\"></fxs-activatable>\r\n\t\t\t<fxs-nav-help\r\n\t\t\t\taction-key=\"inline-cycle-next\"\r\n\t\t\t\tclass=\"absolute right-12 flex\"\r\n\t\t\t></fxs-nav-help>\r\n\t\t</div>\r\n\t\t<div\r\n\t\t\tdata-slot=\"header\"\r\n\t\t\tclass=\"cap-chooser__city-yield-container flex items-center justify-center my-1\"\r\n\t\t></div>\r\n\t\t<div\r\n\t\t\tdata-l10n-id=\"LOC_UI_CITY_CAPTURE_SUBTITLE\"\r\n\t\t\tclass=\"city-capture__subtitle font-title text-lg text-center text-secondary self-center my-2 max-w-96\"\r\n\t\t\tdata-slot=\"header\"\r\n\t\t></div>\r\n\t\t<fxs-vslot class=\"cap-chooser__choice-container mx-8 flex-auto flex flex-col items-center\">\r\n\t\t\t<fxs-chooser-item\r\n\t\t\t\tclass=\"keep-button w-128 flex my-1 items-center\"\r\n\t\t\t\ttabindex=\"-1\"\r\n\t\t\t>\r\n\t\t\t\t<div\r\n\t\t\t\t\tclass=\"relative size-18 keep-icon-image bg-cover flex self-center mx-3 items-center justify-center pointer-events-none\"\r\n\t\t\t\t></div>\r\n\t\t\t\t<div class=\"flex flex-col relative shrink max-w-96 px-1 py-3\">\r\n\t\t\t\t\t<div\r\n\t\t\t\t\t\tclass=\"font-title text-sm mb-1\"\r\n\t\t\t\t\t\tdata-l10n-id=\"LOC_UI_CITY_CAPTURE_KEEP_SETTLEMENT\"\r\n\t\t\t\t\t></div>\r\n\t\t\t\t\t<div class=\"cap-chooser__keep-text font-body text-sm\"></div>\r\n\t\t\t\t</div>\r\n\t\t\t</fxs-chooser-item>\r\n\t\t\t<fxs-chooser-item\r\n\t\t\t\tclass=\"raze-button w-128 flex my-1 items-center\"\r\n\t\t\t\ttabindex=\"-1\"\r\n\t\t\t>\r\n\t\t\t\t<div\r\n\t\t\t\t\tclass=\"relative size-18 raze-icon-image bg-cover flex self-center mx-3 items-center justify-center pointer-events-none\"\r\n\t\t\t\t></div>\r\n\t\t\t\t<div class=\"flex flex-col relative shrink max-w-96 px-1 py-3\">\r\n\t\t\t\t\t<div\r\n\t\t\t\t\t\tclass=\"font-title text-sm mb-1\"\r\n\t\t\t\t\t\tdata-l10n-id=\"LOC_UI_CITY_CAPTURE_RAZE_SETTLEMENT\"\r\n\t\t\t\t\t></div>\r\n\t\t\t\t\t<div class=\"cap-chooser__raze-text font-body text-sm\"></div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class=\"relative mx-3 flex items-center self-start mt-1\">\r\n\t\t\t\t\t<div class=\"size-8 img-turn-icon\"></div>\r\n\t\t\t\t\t<div class=\"cap-chooser__turns-to-raze font-body text-sm\"></div>\r\n\t\t\t\t</div>\r\n\t\t\t</fxs-chooser-item>\r\n\t\t</fxs-vslot>\r\n\t\t<div\r\n\t\t\tclass=\"mt-1 mb-2\"\r\n\t\t\tdata-slot=\"footer\"\r\n\t\t>\r\n\t\t\t<fxs-hero-button\r\n\t\t\t\tclass=\"city-capture__confirm relative my-5 self-center\"\r\n\t\t\t\tcaption=\"LOC_UI_RESOURCE_ALLOCATION_CONFIRM\"\r\n\t\t\t\tdisabled=\"true\"\r\n\t\t\t></fxs-hero-button>\r\n\t\t</div>\r\n\t</fxs-subsystem-frame>\r\n</div>\r\n";

const styles = "fs://game/base-standard/ui/city-capture-chooser/panel-city-capture-chooser.css";

class CityCaptureChooserScreen extends Panel {
  confirmButton;
  keepButton;
  razeButton;
  selectedButton = null;
  prevArrow;
  nextArrow;
  turnsToRazeText;
  keepText;
  razeText;
  onConfirmListener = this.onConfirm.bind(this);
  onPrevArrowListener = this.onPrevArrow.bind(this);
  onNextArrowListener = this.onNextArrow.bind(this);
  onCitySelectionChangedListener = this.onCitySelectionChanged.bind(this);
  keepSettlementSelectedListener = this.keepSettlementSelected.bind(this);
  razeSettlementSelectedListener = this.razeSettlementSelected.bind(this);
  engineInputListener = this.onEngineInput.bind(this);
  navigateInputEventListener = this.onNavigateInput.bind(this);
  viewReceiveFocusListener = this.onViewReceiveFocus.bind(this);
  constructor(root) {
    super(root);
    this.animateInType = this.animateOutType = AnchorType.RelativeToRight;
  }
  onInitialize() {
    this.confirmButton = MustGetElement(".city-capture__confirm", this.Root);
    this.keepButton = MustGetElement(".keep-button", this.Root);
    this.razeButton = MustGetElement(".raze-button", this.Root);
    this.prevArrow = MustGetElement(".cap-chooser__prev-arrow", this.Root);
    this.nextArrow = MustGetElement(".cap-chooser__next-arrow", this.Root);
    this.turnsToRazeText = MustGetElement(".cap-chooser__turns-to-raze", this.Root);
    this.keepText = MustGetElement(".cap-chooser__keep-text", this.Root);
    this.razeText = MustGetElement(".cap-chooser__raze-text", this.Root);
  }
  onAttach() {
    super.onAttach();
    this.Root.addEventListener(InputEngineEventName, this.engineInputListener);
    this.Root.addEventListener(NavigateInputEventName, this.navigateInputEventListener);
    this.Root.addEventListener("view-receive-focus", this.viewReceiveFocusListener);
    engine.on("CitySelectionChanged", this.onCitySelectionChangedListener, this);
    const celebrationSubsystemFrame = MustGetElement(".city-capture-subsystem-frame", this.Root);
    celebrationSubsystemFrame.addEventListener("subsystem-frame-close", () => {
      this.onClose();
    });
    window.addEventListener(InterfaceModeChangedEventName, this.onInterfaceModeChanged);
    delayByFrame(this.onInterfaceModeChanged);
    this.prevArrow.addEventListener("action-activate", this.onPrevArrowListener);
    this.nextArrow.addEventListener("action-activate", this.onNextArrowListener);
    this.confirmButton.addEventListener("action-activate", this.onConfirmListener);
    this.confirmButton.setAttribute("data-audio-activate-ref", "none");
    this.keepButton.addEventListener("action-activate", this.keepSettlementSelectedListener);
    this.razeButton.addEventListener("action-activate", this.razeSettlementSelectedListener);
    Databind.classToggle(this.confirmButton, "hidden", `g_NavTray.isTrayRequired`);
    Databind.classToggle(this.prevArrow, "hidden", `g_NavTray.isTrayRequired`);
    Databind.classToggle(this.nextArrow, "hidden", `g_NavTray.isTrayRequired`);
  }
  onDetach() {
    engine.off("CitySelectionChanged", this.onCitySelectionChangedListener, this);
    this.Root.removeEventListener(InputEngineEventName, this.engineInputListener);
    this.Root.removeEventListener(NavigateInputEventName, this.navigateInputEventListener);
    this.Root.removeEventListener("view-receive-focus", this.viewReceiveFocusListener);
    window.removeEventListener(InterfaceModeChangedEventName, this.onInterfaceModeChanged);
    super.onDetach();
  }
  onViewReceiveFocus() {
    this.setFocus();
  }
  setFocus() {
    const focusElement = MustGetElement(".cap-chooser__choice-container", this.Root);
    FocusManager.setFocus(focusElement);
  }
  keepSettlementSelected() {
    if (this.selectedButton) {
      this.selectedButton.setAttribute("selected", "false");
    }
    this.selectedButton = this.keepButton;
    this.selectedButton.setAttribute("selected", "true");
    this.confirmButton.setAttribute("disabled", "false");
    NavTray.addOrUpdateShellAction1("LOC_UI_RESOURCE_ALLOCATION_CONFIRM");
  }
  razeSettlementSelected() {
    if (this.selectedButton) {
      this.selectedButton.setAttribute("selected", "false");
    }
    this.selectedButton = this.razeButton;
    this.selectedButton.setAttribute("selected", "true");
    this.confirmButton.setAttribute("disabled", "false");
    NavTray.addOrUpdateShellAction1("LOC_UI_RESOURCE_ALLOCATION_CONFIRM");
  }
  onConfirm() {
    if (this.selectedButton == this.keepButton) {
      Audio.playSound("data-audio-activate", "confirm-keep-settlement");
      CityCaptureChooser.sendKeepRequest();
      InterfaceMode.switchToDefault();
    } else if (this.selectedButton == this.razeButton) {
      Audio.playSound("data-audio-activate", "confirm-raze-settlement");
      CityCaptureChooser.sendRazeRequest();
      InterfaceMode.switchToDefault();
    }
  }
  onCitySelectionChanged(data) {
    if (!data.selected) {
      return;
    }
    const c = Cities.get(data.cityID);
    if (!c || c.owner != GameContext.localPlayerID) {
      return;
    } else if (c.isJustConqueredFrom) {
      this.setHidden(false);
      this.setFocus();
    } else {
      this.setHidden(true);
    }
  }
  onPrevArrow() {
    if (CityCaptureChooser.cityID) {
      const prevCityId = GetPrevCityID(CityCaptureChooser.cityID);
      if (ComponentID.isValid(prevCityId)) {
        UI.Player.selectCity(prevCityId);
      }
    }
  }
  onNextArrow() {
    if (CityCaptureChooser.cityID) {
      const nextCityId = GetNextCityID(CityCaptureChooser.cityID);
      if (ComponentID.isValid(nextCityId)) {
        UI.Player.selectCity(nextCityId);
      }
    }
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (this.Root.classList.contains("hidden")) {
      return;
    }
    if (inputEvent.isCancelInput() || inputEvent.detail.name == "sys-menu") {
      this.onClose();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
    if (inputEvent.detail.name == "shell-action-1") {
      if (this.selectedButton) {
        this.onConfirm();
      }
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  onNavigateInput(event) {
    if (event.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (this.Root.classList.contains("hidden")) {
      return;
    }
    const direction = event.getDirection();
    switch (direction) {
      case InputNavigationAction.PREVIOUS:
        this.onPrevArrow();
        break;
      case InputNavigationAction.NEXT:
        this.onNextArrow();
        break;
    }
  }
  onInterfaceModeChanged = () => {
    if (InterfaceMode.getCurrent() == "INTERFACEMODE_CITY_PRODUCTION" && CityCaptureChooser.canDisplayPanel) {
      this.setHidden(false);
      this.setFocus();
      NavTray.clear();
      NavTray.addOrUpdateGenericBack();
    } else {
      this.setHidden(true);
    }
  };
  setHidden(hidden) {
    this.Root.classList.toggle("hidden", hidden);
    if (!hidden) {
      this.update();
    }
  }
  update() {
    const header = MustGetElement(".cap-chooser__city-name", this.Root);
    if (CityCaptureChooser.cityID) {
      const selectedCity = Cities.get(CityCaptureChooser.cityID);
      if (!selectedCity) {
        console.error(
          `panel-city-capture-chooser: update - No city found for city ID ${CityCaptureChooser.cityID}!`
        );
        return;
      }
      const cityYields = selectedCity.Yields;
      if (!cityYields) {
        console.error(
          `panel-city-capture-chooser: update - No city yields found for city ID ${CityCaptureChooser.cityID}!`
        );
        return;
      }
      header.setAttribute("title", selectedCity.name);
      const allYieldContainer = MustGetElement(".cap-chooser__city-yield-container", this.Root);
      while (allYieldContainer.hasChildNodes()) {
        allYieldContainer.removeChild(allYieldContainer.firstChild);
      }
      for (const yieldType in YieldTypes) {
        if (yieldType == "NO_YIELD") continue;
        const yieldContainer = document.createElement("div");
        yieldContainer.classList.value = "flex flex-col items-center mx-2";
        const yieldIcon = document.createElement("fxs-icon");
        yieldIcon.setAttribute("data-icon-id", yieldType);
        yieldIcon.setAttribute("data-icon-context", "DEFAULT");
        yieldIcon.classList.add("size-10");
        yieldContainer.appendChild(yieldIcon);
        const yieldNumber = document.createElement("div");
        yieldNumber.classList.value = "font-body-sm";
        yieldNumber.setAttribute("data-l10n-id", Math.round(cityYields.getNetYield(yieldType)).toString());
        yieldContainer.appendChild(yieldNumber);
        allYieldContainer.appendChild(yieldContainer);
      }
      const cityReligion = selectedCity.Religion;
      if (!cityReligion) {
        console.error(
          `panel-city-capture-chooser: update - City with id ${CityCaptureChooser.cityID} has no religion library!`
        );
        return;
      }
      const keepOperationResult = CityCaptureChooser.getKeepCanStartResult();
      if (!keepOperationResult) {
        console.error(
          "panel-city-capture-chooser: update() - no canstart result for a city keeping operation!"
        );
        return;
      }
      this.keepText.innerHTML = Locale.stylize(keepOperationResult.AdditionalDescription?.[0] ?? "");
      const razeOperationResult = CityCaptureChooser.getRazeCanStartResult();
      if (!razeOperationResult) {
        console.error("panel-city-capture-chooser: update() - no canstart result for a city razing operation!");
        return;
      }
      if (razeOperationResult.Success) {
        const turnsToRaze = selectedCity.getTurnsUntilRazed;
        this.razeText.innerHTML = Locale.stylize(razeOperationResult.AdditionalDescription?.[0] ?? "");
        this.turnsToRazeText.innerHTML = turnsToRaze.toString();
      } else {
        this.razeButton.setAttribute("disabled", "true");
        this.razeText.setAttribute("data-l10n-id", razeOperationResult.FailureReasons?.[0] ?? "");
        this.razeText.classList.add("font-bold");
        MustGetElement(".img-turn-icon", this.razeButton).classList.add("hidden");
      }
    }
  }
  onClose() {
    InterfaceMode.switchToDefault();
  }
}
Controls.define("panel-city-capture-chooser", {
  createInstance: CityCaptureChooserScreen,
  description: "",
  classNames: ["city-capture-chooser", "flex", "flex-col"],
  styles: [styles],
  innerHTML: [content],
  attributes: []
});
//# sourceMappingURL=panel-city-capture-chooser.js.map

import { c as TextBoxTextEditStopEventName } from '../../../core/ui/components/fxs-textbox.chunk.js';
import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import { a as DialogBoxManager } from '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import ActionHandler from '../../../core/ui/input/action-handler.js';
import FocusManager from '../../../core/ui/input/focus-manager.js';
import { N as NavTray } from '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import { D as Databind } from '../../../core/ui/utilities/utilities-core-databinding.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { ScreenGeneralChooser } from '../general-chooser/screen-general-chooser.js';
import { HideMiniMapEvent } from '../mini-map/panel-mini-map.js';
import '../../../core/ui/components/fxs-activatable.chunk.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/panel-support.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../../core/ui/input/focus-support.chunk.js';
import '../../../core/ui/components/fxs-slot.chunk.js';
import '../../../core/ui/spatial/spatial-manager.js';
import '../../../core/ui/lenses/lens-manager.chunk.js';
import '../../../core/ui/shell/mp-staging/mp-friends.js';
import '../../../core/ui/shell/mp-staging/model-mp-friends.chunk.js';
import '../../../core/ui/social-notifications/social-notifications-manager.js';
import '../../../core/ui/utilities/utilities-layout.chunk.js';
import '../../../core/ui/utilities/utilities-liveops.js';
import '../../../core/ui/utilities/utilities-network.js';
import '../../../core/ui/shell/mp-legal/mp-legal.js';
import '../../../core/ui/events/shell-events.chunk.js';
import '../../../core/ui/utilities/utilities-network-constants.chunk.js';

const content = "<fxs-subsystem-frame\r\n\tclass=\"religion-picker_religion-window items-center left-1\"\r\n\tbackDrop=\"fs://game/rel_starrybg.png\"\r\n>\r\n\t<fxs-header\r\n\t\tclass=\"religion-picker_header mt-3 tracking-150\"\r\n\t\ttitle=\"LOC_UI_RADIAL_MENU_DETAILS_RELIGION_TITLE\"\r\n\t\tdata-slot=\"header\"\r\n\t>\r\n\t</fxs-header>\r\n\t<div\r\n\t\tclass=\"flex items-center my-4 self-center\"\r\n\t\tdata-slot=\"header\"\r\n\t>\r\n\t\t<div class=\"relative flex mr-2 items-center justify-center\">\r\n\t\t\t<div\r\n\t\t\t\tclass=\"religion-picker_religion-info-icon-container_holder absolute bg-contain bg-no-repeat size-32\"\r\n\t\t\t></div>\r\n\t\t\t<div\r\n\t\t\t\tclass=\"religion-picker_religion-info-icon-container_religion relative mb-3 bg-contain bg-no-repeat size-24\"\r\n\t\t\t></div>\r\n\t\t\t<div\r\n\t\t\t\tclass=\"religion-picker_religion-info-icon-container_glow absolute size-full bg-contain bg-no-repeat hidden\"\r\n\t\t\t></div>\r\n\t\t</div>\r\n\t\t<div class=\"flex flex-col ml-4 mb-6\">\r\n\t\t\t<p\r\n\t\t\t\tclass=\"religion-picker_religion-name-regular font-title text-2xl\"\r\n\t\t\t\tdata-l10n-id=\"LOC_UI_ESTABLISH_RELIGION_TITLE\"\r\n\t\t\t></p>\r\n\t\t\t<div\r\n\t\t\t\tclass=\"religion-picker_religion-info-name-edit-container border border-primary-2 hover\\:border-secondary focus\\:border-secondary bg-primary-5 flex h-10 mt-1\\.25 pointer-events-auto hidden\"\r\n\t\t\t>\r\n\t\t\t\t<fxs-textbox\r\n\t\t\t\t\tclass=\"religion-picker_religion-info-name font-body pl-2 pr-1 text-base text-accent-2 w-80\"\r\n\t\t\t\t\thas-border=\"false\"\r\n\t\t\t\t\tmax-length=\"16\"\r\n\t\t\t\t></fxs-textbox>\r\n\t\t\t\t<fxs-edit-button\r\n\t\t\t\t\tclass=\"religion-picker_religion-info-name-edit hidden relative flex size-9 bg-contain bg-no-repeat bg-center mt-px\"\r\n\t\t\t\t></fxs-edit-button>\r\n\t\t\t</div>\r\n\t\t\t<p class=\"religion-picker_religion-info-founder-name font-body-sm text-accent-2\"></p>\r\n\t\t\t<p class=\"religion-picker_religion-info-city-name font-body-sm text-accent-2\"></p>\r\n\t\t</div>\r\n\t</div>\r\n\t<div class=\"religion-picker_religion-choices relative ml-6 mr-5 h-128\">\r\n\t\t<div class=\"filigree-inner-frame-top absolute top-0 inset-x-0\"></div>\r\n\t\t<fxs-spatial-slot class=\"religion-picker_religions flex flex-wrap bg-primary-5\"> </fxs-spatial-slot>\r\n\t</div>\r\n\t<div\r\n\t\tclass=\"mt-5 mb-12 flex items-center justify-center religion-picker_confirm-container\"\r\n\t\tdata-slot=\"footer\"\r\n\t>\r\n\t\t<fxs-hero-button\r\n\t\t\tclass=\"religion-picker_confirm relative self-center\"\r\n\t\t\tcaption=\"LOC_UI_RESOURCE_ALLOCATION_CONFIRM\"\r\n\t\t\tdisabled=\"true\"\r\n\t\t></fxs-hero-button>\r\n\t</div>\r\n</fxs-subsystem-frame>\r\n";

const styles = "fs://game/base-standard/ui/panel-religion-picker/panel-religion-picker.css";

class ScreenReligionPicker extends ScreenGeneralChooser {
  religionConfirmButtonListener = this.onConfirm.bind(this);
  religionNameActivatedListener = this.onReligionNameActivated.bind(this);
  onReligionNameTextEntryStoppedListener = this.onReligionNameTextEntryStopped.bind(this);
  religionConfirmButton;
  religionNameRegularContainer;
  religionInfoNameContainer;
  religionInfoNameTextBox;
  religionInfoNameEditButton;
  playerObject;
  selectedReligionType = "";
  selectedReligionEntry = null;
  hasSelectedCustomReligion = false;
  onInitialize() {
    this.religionConfirmButton = MustGetElement(".religion-picker_confirm", this.Root);
    this.religionInfoNameContainer = MustGetElement(
      ".religion-picker_religion-info-name-edit-container",
      this.Root
    );
    this.religionInfoNameTextBox = MustGetElement(
      ".religion-picker_religion-info-name",
      this.religionInfoNameContainer
    );
    this.religionInfoNameEditButton = MustGetElement(
      ".religion-picker_religion-info-name-edit",
      this.religionInfoNameContainer
    );
    this.religionNameRegularContainer = MustGetElement(".religion-picker_religion-name-regular", this.Root);
    this.createCloseButton = false;
    this.enableOpenSound = true;
    this.enableCloseSound = true;
  }
  onAttach() {
    super.onAttach();
    const religionSubsystemFrame = MustGetElement(".religion-picker_religion-window", this.Root);
    religionSubsystemFrame.addEventListener("subsystem-frame-close", () => {
      this.close();
    });
    this.religionConfirmButton.addEventListener("action-activate", this.religionConfirmButtonListener);
    this.religionInfoNameTextBox.addEventListener(
      TextBoxTextEditStopEventName,
      this.onReligionNameTextEntryStoppedListener
    );
    const player = Players.get(GameContext.localPlayerID);
    if (!player) {
      console.error("panel-religion-picker: onAttach() - No player object found!");
      return;
    }
    this.playerObject = player;
    const pReligion = player.Religion;
    if (!pReligion) {
      console.error("panel-religion-picker: onAttach() - Player object had no religion!");
      return;
    }
    Databind.classToggle(this.religionConfirmButton, "hidden", `g_NavTray.isTrayRequired`);
    this.buildReligionContainer();
    window.dispatchEvent(new HideMiniMapEvent(true));
  }
  onDetach() {
    window.dispatchEvent(new HideMiniMapEvent(false));
    this.religionConfirmButton.removeEventListener("action-activate", this.religionConfirmButtonListener);
    this.religionInfoNameTextBox.removeEventListener(
      TextBoxTextEditStopEventName,
      this.onReligionNameTextEntryStoppedListener
    );
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    NavTray.addOrUpdateAccept("LOC_GENERIC_CONFIRM");
    const focusElement = MustGetElement(".religion-picker_religions", this.Root);
    FocusManager.setFocus(focusElement);
  }
  getHolyCityName() {
    if (!this.playerObject.Cities) {
      console.error("panel-religion-picker: getHolyCityName() - playerObject.Cities is undefined!");
      return "";
    }
    const foundCity = this.playerObject.Cities.getCities().find((city) => {
      return city.Constructibles?.hasConstructible("BUILDING_TEMPLE", false) || city.Constructibles?.hasConstructible("BUILDING_MOSQUE", false);
    });
    return foundCity?.name ?? "";
  }
  onReligionNameActivated() {
    if (this.hasSelectedCustomReligion && this.religionInfoNameTextBox.getAttribute("enabled") == "false") {
      this.toggleEditReligionName();
    }
  }
  toggleEditReligionName() {
    const inputEnabled = this.religionInfoNameTextBox.getAttribute("enabled") == "true";
    this.religionInfoNameEditButton.setAttribute("is-confirm", (!inputEnabled).toString());
    if (ActionHandler.isGamepadActive) {
      if (UI.canDisplayKeyboard()) {
        this.religionInfoNameTextBox.setAttribute("activated", (!inputEnabled).toString());
      } else {
        this.religionInfoNameTextBox.setAttribute("enabled", (!inputEnabled).toString());
        if (inputEnabled && ActionHandler.isGamepadActive) {
          this.onConfirm();
        }
      }
    } else {
      this.religionInfoNameTextBox.setAttribute("enabled", (!inputEnabled).toString());
      this.religionConfirmButton.setAttribute(
        "disabled",
        (!inputEnabled || this.religionInfoNameTextBox.getAttribute("value")?.length == 0).toString()
      );
    }
  }
  createReligionEntries(entryContainer) {
    let index = 0;
    for (const religion of GameInfo.Religions) {
      const newEntry = document.createElement("fxs-activatable");
      newEntry.classList.value = "religion-entry flex flex-col relative items-center w-16 h-24 mt-5 mx-9 mb-2\\.5";
      const newEntryIcon = document.createElement("div");
      newEntryIcon.classList.value = "religion-entry-icon size-16 bg-contain bg-no-repeat relative mb-2";
      const iconLink = UI.getIconCSS(religion.ReligionType, "RELIGION_DECO");
      newEntryIcon.style.backgroundImage = iconLink;
      newEntry.appendChild(newEntryIcon);
      if (!religion.RequiresCustomName) {
        const newEntryText = document.createElement("div");
        newEntryText.classList.value = "text-center font-body-sm text-accent-2 font-fit-shrink";
        newEntryText.setAttribute("data-l10n-id", religion.Name);
        newEntry.appendChild(newEntryText);
      }
      this.tagEntry(newEntry);
      newEntry.setAttribute("religion-name", religion.Name);
      newEntry.setAttribute("religion-type", religion.ReligionType);
      newEntry.setAttribute("religion-is-custom", religion.RequiresCustomName.toString());
      newEntry.setAttribute("religion-icon", iconLink);
      newEntry.setAttribute("tabindex", index.toString());
      const religionAlreadyTaken = Game.Religion.hasBeenFounded(religion.ReligionType);
      if (religionAlreadyTaken) {
        newEntry.setAttribute(
          "data-tooltip-content",
          Locale.compose("LOC_UI_ESTABLISH_RELIGION_RELIGION_ALREADY_TAKEN")
        );
        newEntry.setAttribute("disabled", "true");
      } else {
        const religionSelectedBorder = document.createElement("div");
        religionSelectedBorder.classList.add("religion-selected-border", "size-full", "mt-0\\.5");
        newEntryIcon.appendChild(religionSelectedBorder);
        const religionSelectedGlow = document.createElement("div");
        religionSelectedGlow.classList.add("religion-selected-glow", "size-full", "absolute", "opacity-90");
        newEntryIcon.appendChild(religionSelectedGlow);
      }
      if (religion.RequiresCustomName) {
        newEntry.classList.add("custom-entry");
      } else {
        newEntry.classList.add("traditional-entry");
      }
      newEntry.setAttribute("data-audio-group-ref", "audio-panel-religion-picker");
      newEntry.setAttribute("data-audio-activate-ref", "none");
      entryContainer.appendChild(newEntry);
      index++;
    }
  }
  entrySelected(entryElement) {
    const religionName = entryElement.getAttribute("religion-name");
    if (!religionName) {
      console.error("panel-religion-picker: entrySelected - religion attribute religion-name not found.");
      return;
    }
    const religionType = entryElement.getAttribute("religion-type");
    if (!religionType) {
      console.error("panel-religion-picker: entrySelected - religion attribute religion-type not found.");
      return;
    }
    const religionIconLink = entryElement.getAttribute("religion-icon");
    if (!religionIconLink) {
      console.error("panel-religion-picker: entrySelected - religion attribute religion-icon not found.");
      return;
    }
    let religionIsCustom = entryElement.getAttribute("religion-is-custom");
    if (!religionIsCustom) {
      console.error("panel-religion-picker: entrySelected - religion attribute religion-is-custom not found.");
      return;
    }
    const religionIcon = MustGetElement(
      ".religion-picker_religion-info-icon-container_religion",
      this.Root
    );
    religionIcon.style.backgroundImage = religionIconLink;
    if (UI.useDefaultCustomReligionName()) {
      religionIsCustom = "false";
    }
    if (this.selectedReligionEntry) {
      this.selectedReligionEntry.classList.remove("entry-selected");
    }
    this.selectedReligionEntry = entryElement;
    this.selectedReligionEntry.classList.add("entry-selected");
    this.selectedReligionType = religionType;
    const religionIconGlow = MustGetElement(
      ".religion-picker_religion-info-icon-container_glow",
      this.Root
    );
    religionIconGlow.classList.remove("hidden");
    if (religionIsCustom == "true") {
      this.religionNameRegularContainer.classList.add("hidden");
      this.religionInfoNameContainer.classList.remove("hidden");
      this.religionInfoNameTextBox.setAttribute("value", Locale.compose("LOC_UI_NAME_YOUR_RELIGION"));
      this.religionInfoNameTextBox.setAttribute("show-keyboard-on-activate", "true");
      this.religionInfoNameEditButton.setAttribute("disabled", "false");
      this.religionInfoNameEditButton.classList.remove("hidden");
      this.religionConfirmButton.setAttribute("disabled", "true");
      this.hasSelectedCustomReligion = true;
      if (ActionHandler.isGamepadActive) {
        this.toggleEditReligionName();
      }
    } else if (religionIsCustom == "false") {
      this.religionNameRegularContainer.classList.remove("hidden");
      this.religionInfoNameContainer.classList.add("hidden");
      this.religionNameRegularContainer.setAttribute("data-l10n-id", religionName);
      if (this.religionInfoNameTextBox.getAttribute("enabled") == "true") {
        this.toggleEditReligionName();
      }
      this.hasSelectedCustomReligion = false;
      this.religionConfirmButton.setAttribute("disabled", "false");
      if (ActionHandler.isGamepadActive) {
        this.goToBeliefChooser();
      }
    }
  }
  onConfirm() {
    const customReligionName = this.hasSelectedCustomReligion ? this.religionInfoNameTextBox.getAttribute("value") : null;
    const matchRegex = /[|<>\[\]]/;
    if (customReligionName && customReligionName.match(matchRegex)) {
      DialogBoxManager.createDialog_Confirm({
        title: "LOC_UI_TEXT_ENTRY_DENIAL"
      });
      return;
    }
    if (Game.Religion.hasBeenFounded(this.selectedReligionType)) {
      DialogBoxManager.createDialog_Confirm({
        title: "LOC_UI_ESTABLISH_RELIGION_RELIGION_ALREADY_TAKEN"
      });
      return;
    }
    this.goToBeliefChooser();
  }
  goToBeliefChooser() {
    const customReligionName = this.hasSelectedCustomReligion ? this.religionInfoNameTextBox.getAttribute("value") : "";
    ContextManager.push("panel-belief-picker", {
      singleton: true,
      attributes: {
        selectedReligionType: this.selectedReligionType,
        customReligionName
      }
    });
    this.close();
  }
  buildReligionContainer() {
    this.religionInfoNameTextBox.setAttribute("value", Locale.compose("LOC_UI_ESTABLISH_RELIGION_TITLE"));
    this.religionInfoNameTextBox.setAttribute("enabled", "false");
    this.religionInfoNameTextBox.addEventListener("action-activate", this.religionNameActivatedListener);
    this.religionInfoNameTextBox.addEventListener(
      "fxs-textbox-validate-virtual-keyboard",
      this.religionConfirmButtonListener
    );
    const religionInfoFounderName = MustGetElement(
      ".religion-picker_religion-info-founder-name",
      this.Root
    );
    religionInfoFounderName.setAttribute(
      "data-l10n-id",
      Locale.compose("LOC_UI_ESTABLISH_RELIGION_FOUNDER", this.playerObject.name)
    );
    const religioninfoHolyCityName = MustGetElement(
      ".religion-picker_religion-info-city-name",
      this.Root
    );
    religioninfoHolyCityName.setAttribute(
      "data-l10n-id",
      Locale.compose("LOC_UI_ESTABLISH_RELIGION_HOLY_CITY", this.getHolyCityName())
    );
    const religionsContainer = MustGetElement(".religion-picker_religions", this.Root);
    this.createReligionEntries(religionsContainer);
    this.religionInfoNameEditButton.addEventListener("action-activate", () => {
      this.toggleEditReligionName();
    });
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.isCancelInput() || inputEvent.detail.name == "sys-menu") {
      this.close();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  onReligionNameTextEntryStopped(event) {
    if (event.detail.confirmed) {
      if (ActionHandler.isGamepadActive) {
        this.onConfirm();
      } else {
        this.religionConfirmButton.setAttribute("disabled", "false");
        this.religionInfoNameTextBox.setAttribute("enabled", "false");
        this.religionInfoNameEditButton.setAttribute("is-confirm", "false");
      }
    } else {
      if (ActionHandler.isGamepadActive) {
        this.religionInfoNameTextBox.setAttribute("enabled", "false");
        this.selectedReligionEntry?.classList.remove("entry-selected");
        const focusElement = MustGetElement(".religion-picker_religions", this.Root);
        FocusManager.setFocus(focusElement);
      }
    }
  }
}
Controls.define("panel-religion-picker", {
  createInstance: ScreenReligionPicker,
  description: "Religion picker",
  classNames: ["panel-religion-picker", "absolute", "bottom-0", "top-44", "pointer-events-auto", "left-0", "w-200"],
  styles: [styles],
  innerHTML: [content],
  attributes: []
});
//# sourceMappingURL=panel-religion-picker.js.map

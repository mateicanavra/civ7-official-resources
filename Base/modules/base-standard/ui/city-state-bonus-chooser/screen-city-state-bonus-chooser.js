import { A as Audio } from '../../../core/ui/audio-base/audio-support.chunk.js';
import FocusManager from '../../../core/ui/input/focus-manager.js';
import { N as NavTray } from '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import { D as Databind } from '../../../core/ui/utilities/utilities-core-databinding.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { ScreenGeneralChooser } from '../general-chooser/screen-general-chooser.js';
import { HideMiniMapEvent } from '../mini-map/panel-mini-map.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/panel-support.chunk.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
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

const content = "<div class=\"suzerain-bonus__frame-container\">\r\n\t<fxs-subsystem-frame\r\n\t\tclass=\"suzerain-bonus__subsystem-frame flex items-center left-1\"\r\n\t\tbox-style=\"b2\"\r\n\t\tbackDrop=\"blp:city_state_bg\"\r\n\r\n\t>\r\n\t\t<fxs-header\r\n\t\t\tclass=\"suzerain-bonus-header mt-5 tracking-150 mb-8 w-96 text-center self-center font-title-xl text-shadow-subtle\"\r\n\t\t\tfiligree-style=\"h2\"\r\n\t\t\tdata-slot=\"header\"\r\n\t\t\ttitle=\"LOC_UI_CITYSTATE_BONUS_CHOOSER_TITLE\"\r\n\t\t></fxs-header>\r\n\t\t<fxs-vslot\r\n\t\t\tclass=\"suzerain-bonus__choices-container mx-5 flex flex-col w-128 grow\"\r\n\t\t\ttabIndex=\"-1\"\r\n\t\t>\r\n\t\t</fxs-vslot>\r\n\t\t<div\r\n\t\t\tclass=\"mt-1 mb-2\"\r\n\t\t\tdata-slot=\"footer\"\r\n\t\t>\r\n\t\t\t<fxs-hero-button\r\n\t\t\t\tclass=\"suzerain-bonus__confirm relative my-5 self-center\"\r\n\t\t\t\tcaption=\"LOC_UI_RESOURCE_ALLOCATION_CONFIRM\"\r\n\t\t\t\tdisabled=\"true\"\r\n\t\t\t></fxs-hero-button>\r\n\t\t</div>\r\n\t</fxs-subsystem-frame>\r\n</div>\r\n";

const styles = "fs://game/base-standard/ui/city-state-bonus-chooser/screen-city-state-bonus-chooser.css";

class ScreenCityStateBonusChooser extends ScreenGeneralChooser {
  confirmButtonListener = this.onConfirm.bind(this);
  currentlySelectedChoice = null;
  confirmButton;
  bonusEntryContainer;
  onInitialize() {
    this.confirmButton = MustGetElement(".suzerain-bonus__confirm", this.Root);
    this.bonusEntryContainer = MustGetElement(".suzerain-bonus__choices-container", this.Root);
    this.createCloseButton = false;
  }
  onAttach() {
    super.onAttach();
    this.confirmButton.addEventListener("action-activate", this.confirmButtonListener);
    const suzerainSubsystemFrame = MustGetElement(".suzerain-bonus__subsystem-frame", this.Root);
    suzerainSubsystemFrame.addEventListener("subsystem-frame-close", () => {
      this.close();
    });
    Databind.classToggle(this.confirmButton, "hidden", `g_NavTray.isTrayRequired`);
    window.dispatchEvent(new HideMiniMapEvent(true));
    this.createEntries(this.bonusEntryContainer);
    this.focusCityState();
  }
  onDetach() {
    window.dispatchEvent(new HideMiniMapEvent(false));
    this.confirmButton.removeEventListener("action-activate", this.confirmButtonListener);
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    FocusManager.setFocus(this.bonusEntryContainer);
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
    if (inputEvent.detail.name == "shell-action-1") {
      if (this.currentlySelectedChoice) {
        this.onConfirm();
      }
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  createEntries(entryContainer) {
    const cityState = Game.CityStates.getCityStateBonusToSelect(GameContext.localPlayerID);
    for (const item of GameInfo.CityStateBonuses) {
      if (Game.CityStates.canHaveBonus(GameContext.localPlayerID, cityState, item.CityStateBonusType)) {
        const bonusItem = document.createElement("fxs-chooser-item");
        bonusItem.setAttribute("select-on-activate", "true");
        bonusItem.setAttribute("bonus-item", item.CityStateBonusType);
        bonusItem.classList.add("mx-3", "my-1\\.5", "flex");
        this.tagEntry(bonusItem);
        const bonusItemContentContainer = document.createElement("div");
        bonusItemContentContainer.classList.value = "flex items-center flex-auto";
        bonusItem.appendChild(bonusItemContentContainer);
        const bonusItemImage = document.createElement("div");
        bonusItemImage.classList.value = "size-12 bg-no-repeat bg-contain bg-center ml-2";
        bonusItemImage.style.backgroundImage = UI.getIconCSS(item.CityStateBonusType, "CITY_STATE_BONUS");
        bonusItemContentContainer.appendChild(bonusItemImage);
        const bonusItemTextContainer = document.createElement("div");
        bonusItemTextContainer.classList.value = "flex flex-col m-3 flex-auto";
        bonusItemContentContainer.appendChild(bonusItemTextContainer);
        const bonusItemTitle = document.createElement("div");
        bonusItemTitle.classList.value = "text-base font-title mb-1 text-accent-2";
        bonusItemTitle.setAttribute("data-l10n-id", item.Name);
        bonusItemTextContainer.appendChild(bonusItemTitle);
        const bonusItemDescription = document.createElement("div");
        bonusItemDescription.classList.value = "text-sm font-body text-accent-3";
        bonusItemDescription.setAttribute("data-l10n-id", item.Description);
        bonusItemTextContainer.appendChild(bonusItemDescription);
        entryContainer.appendChild(bonusItem);
      }
    }
  }
  entrySelected(entryElement) {
    if (this.currentlySelectedChoice) {
      this.currentlySelectedChoice.setAttribute("selected", "false");
    }
    this.currentlySelectedChoice = entryElement;
    this.confirmButton.removeAttribute("disabled");
    NavTray.addOrUpdateShellAction1("LOC_UI_RESOURCE_ALLOCATION_CONFIRM");
  }
  focusCityState() {
    const cityState = Game.CityStates.getCityStateBonusToSelect(GameContext.localPlayerID);
    const cityStatePlayerLibrary = Players.get(cityState);
    if (!cityStatePlayerLibrary) {
      console.error(
        `screen-city-state-bonus-chooser: focusCityState() - No player library for city state with id ${cityState}`
      );
      return;
    }
    const cityStateCitiesLibrary = cityStatePlayerLibrary.Cities;
    if (!cityStateCitiesLibrary) {
      console.error(
        `screen-city-state-bonus-chooser: focusCityState() - No PlayerCities library for city state with id ${cityState}`
      );
      return;
    }
    const cityStateCities = cityStateCitiesLibrary.getCities();
    const cityStateSettlement = cityStateCities.length > 0 ? cityStateCities[0] : void 0;
    if (cityStateSettlement == void 0) {
      console.error(
        `screen-city-state-bonus-chooser: focusCityState() - City state with id ${cityState} has no settlements!`
      );
      return;
    }
    UI.Player.lookAtID(cityStateSettlement.id);
  }
  onConfirm() {
    if (!this.currentlySelectedChoice) {
      console.error("screen-city-state-bonus-chooser: onConfirm - no currently selected choice!");
      return;
    }
    const bonusType = this.currentlySelectedChoice.getAttribute("bonus-item");
    if (bonusType) {
      const args = {
        OtherPlayer: Game.CityStates.getCityStateBonusToSelect(GameContext.localPlayerID),
        CityStateBonusType: Database.makeHash(bonusType)
      };
      const result = Game.PlayerOperations.canStart(
        GameContext.localPlayerID,
        PlayerOperationTypes.CHOOSE_CITY_STATE_BONUS,
        args,
        false
      );
      if (result.Success) {
        Game.PlayerOperations.sendRequest(
          GameContext.localPlayerID,
          PlayerOperationTypes.CHOOSE_CITY_STATE_BONUS,
          args
        );
        Audio.playSound("data-audio-city-state-bonus-confirm", "city-state-diplomatic");
        this.close();
      }
    }
  }
}
Controls.define("screen-city-state-bonus-chooser", {
  createInstance: ScreenCityStateBonusChooser,
  description: "City-State Bonus Chooser screen.",
  classNames: ["city-state-bonus-chooser", "fullscreen", "pointer-events-auto"],
  innerHTML: [content],
  styles: [styles],
  attributes: []
});
//# sourceMappingURL=screen-city-state-bonus-chooser.js.map

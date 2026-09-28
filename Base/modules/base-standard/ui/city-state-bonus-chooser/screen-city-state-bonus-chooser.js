import { Audio } from '../../../core/ui/audio-base/audio-support.js';
import NavTray from '../../../core/ui/navigation-tray/model-navigation-tray.js';
import Databind from '../../../core/ui/utilities/utilities-core-databinding.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.js';
import { FocusManager } from '../../../core/ui-next/services/focus-manager.js';
import { ScreenGeneralChooser } from '../general-chooser/screen-general-chooser.js';
import { HideMiniMapEvent } from '../mini-map/panel-mini-map.js';
import content from './screen-city-state-bonus-chooser.html.js';
import styles from './screen-city-state-bonus-chooser.scss.js';

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
    waitForLayout(() => {
      FocusManager.get().setFocus(this.bonusEntryContainer);
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
    UI.Player.lookAtID(cityStateSettlement.id, 0);
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
  classNames: ["city-state-bonus-chooser", "fullscreen"],
  innerHTML: [content],
  styles: [styles],
  attributes: []
});
//# sourceMappingURL=screen-city-state-bonus-chooser.js.map

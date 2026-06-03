import { Audio } from '../../../core/ui/audio-base/audio-support.js';
import NavTray from '../../../core/ui/navigation-tray/model-navigation-tray.js';
import { applyPlayerColorsToElement } from '../../../core/ui/utilities/utilities-color.js';
import Databind from '../../../core/ui/utilities/utilities-core-databinding.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.js';
import { FocusManager } from '../../../core/ui-next/services/focus-manager.js';
import { ScreenGeneralChooser } from '../general-chooser/screen-general-chooser.js';
import { HideMiniMapEvent } from '../mini-map/panel-mini-map.js';
import content from './screen-pantheon-chooser.html.js';
import styles from './screen-pantheon-chooser.scss.js';

class ScreenPantheonChooser extends ScreenGeneralChooser {
  confirmButtonListener = this.onConfirm.bind(this);
  pantheonSubtitle;
  confirmButton;
  pantheonFrame;
  numPantheonsToAdd = -1;
  pantheonsToAdd = [];
  pantheonButtonsMap = /* @__PURE__ */ new Map();
  onInitialize() {
    this.pantheonSubtitle = MustGetElement(".pantheon-chooser_choose-x-pantheons", this.Root);
    this.confirmButton = MustGetElement(".pantheon-chooser_confirm", this.Root);
    this.pantheonFrame = MustGetElement(".pantheon-frame", this.Root);
    this.createCloseButton = false;
    this.enableOpenSound = true;
    this.enableCloseSound = true;
    this.Root.setAttribute("data-audio-group-ref", "audio-panel-pantheon-picker");
  }
  onAttach() {
    super.onAttach();
    this.pantheonFrame.addEventListener("subsystem-frame-close", () => {
      this.close();
    });
    this.pantheonFrame.setAttribute("data-audio-close-group-ref", "audio-panel-pantheon-picker");
    this.confirmButton.addEventListener("action-activate", this.confirmButtonListener);
    this.confirmButton.setAttribute("data-audio-group-ref", "audio-panel-pantheon-picker");
    this.confirmButton.setAttribute("data-audio-activate-ref", "data-audio-pantheon-confirm");
    const player = Players.get(GameContext.localPlayerID);
    if (!player) {
      console.error("screen-pantheon-chooser: onAttach() - no local player found!");
      return;
    }
    const playerCulture = player.Culture;
    if (!playerCulture) {
      console.error("screen-pantheon-chooser: onAttach() - no player culture found!");
      return;
    }
    const playerReligion = player.Religion;
    if (!playerReligion) {
      console.error("screen-pantheon-chooser: onAttach() - no player religion found!");
      return;
    }
    this.numPantheonsToAdd = playerReligion.getNumPantheonsUnlocked();
    this.pantheonSubtitle.innerHTML = Locale.compose("LOC_UI_PANTHEON_SUBTITLE", this.numPantheonsToAdd);
    window.dispatchEvent(new HideMiniMapEvent(true));
    Databind.classToggle(this.confirmButton, "hidden", `g_NavTray.isTrayRequired`);
  }
  onDetach() {
    window.dispatchEvent(new HideMiniMapEvent(false));
    this.confirmButton.removeEventListener("action-activate", this.confirmButtonListener);
    super.onDetach();
  }
  createEntries(_entryContainer) {
    const player = GameContext.localPlayerID;
    if (Players.isValid(player)) {
      applyPlayerColorsToElement(this.Root, player);
    } else {
      console.error(
        `screen-pantheon-chooser: createEntries() - player ${GameContext.localPlayerID} was invalid!`
      );
    }
    for (const pantheon of GameInfo.Beliefs) {
      const args = {
        BeliefType: pantheon.$hash
      };
      const result = Game.PlayerOperations.canStart(
        GameContext.localPlayerID,
        PlayerOperationTypes.FOUND_PANTHEON,
        args,
        false
      );
      const pantheonLocked = !result.Success;
      if (pantheon.BeliefClassType == "BELIEF_CLASS_PANTHEON") {
        const pantheonItem = document.createElement(
          "pantheon-chooser-item"
        );
        pantheonItem.classList.value = "pantheon-item bg-primary-4";
        pantheonItem.whenComponentCreated((chooser) => {
          chooser.pantheonChooserNode = this.createPantheonNode(pantheon, pantheonLocked);
        });
        pantheonItem.setAttribute("beliefType", pantheon.BeliefType);
        if (!pantheonLocked) {
          this.tagEntry(pantheonItem);
        } else {
          pantheonItem.setAttribute("data-tooltip-content", result.AdditionalDescription?.[0] ?? "");
        }
        this.pantheonButtonsMap.set(pantheon.BeliefType, pantheonItem);
        pantheonItem.setAttribute("data-audio-group-ref", "audio-panel-pantheon-picker");
        pantheonItem.setAttribute("data-audio-activate-ref", "none");
        _entryContainer.appendChild(pantheonItem);
      }
    }
    waitForLayout(() => {
      FocusManager.get().setFocus(_entryContainer);
    });
  }
  createPantheonNode(pantheon, pantheonLocked) {
    const primaryIcon = UI.getIconURL(pantheon.BeliefType, "PANTHEONS");
    return {
      name: Locale.compose(pantheon.Name),
      primaryIcon,
      description: Locale.stylize(pantheon.Description),
      isLocked: pantheonLocked
    };
  }
  /**
   * Called by the base general chooser when the user chooses an item in the list.
   * @param {element} entryElement - The HTML element chosen.
   */
  entrySelected(entryElement) {
    const beliefTypeSelected = entryElement.getAttribute("beliefType");
    if (!beliefTypeSelected) {
      console.error("screen-pantheon-chooser: entrySelected() - selected entry had no associated belief type!");
      return;
    }
    if (this.pantheonsToAdd.includes(beliefTypeSelected)) {
      entryElement.setAttribute("selected", "false");
      this.pantheonsToAdd.splice(this.pantheonsToAdd.indexOf(beliefTypeSelected), 1);
      this.confirmButton.setAttribute("disabled", "true");
      NavTray.removeShellAction1();
    } else {
      if (this.pantheonsToAdd.length < this.numPantheonsToAdd) {
        entryElement.setAttribute("selected", "true");
        this.pantheonsToAdd.push(beliefTypeSelected);
        if (this.pantheonsToAdd.length == this.numPantheonsToAdd) {
          this.confirmButton.setAttribute("disabled", "false");
          NavTray.addOrUpdateShellAction1("LOC_UI_RESOURCE_ALLOCATION_CONFIRM");
        }
      } else {
        this.pantheonButtonsMap.get(this.pantheonsToAdd[0])?.setAttribute("selected", "false");
        this.pantheonsToAdd.splice(0, 1);
        this.pantheonsToAdd.push(beliefTypeSelected);
        entryElement.setAttribute("selected", "true");
      }
    }
  }
  onEngineInput(inputEvent) {
    super.onEngineInput(inputEvent);
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.detail.name == "shell-action-1") {
      if (this.pantheonsToAdd.length == this.numPantheonsToAdd) {
        this.onConfirm();
        Audio.playSound("data-audio-pantheon-confirm", "audio-panel-pantheon-picker");
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
      }
    }
  }
  onConfirm() {
    this.addNextPantheon();
  }
  addNextPantheon() {
    const pantheonToAdd = this.pantheonsToAdd.pop();
    if (!pantheonToAdd) {
      this.close();
      return;
    }
    const args = {
      BeliefType: Database.makeHash(pantheonToAdd.toString())
    };
    const result = Game.PlayerOperations.canStart(
      GameContext.localPlayerID,
      PlayerOperationTypes.FOUND_PANTHEON,
      args,
      false
    );
    if (result.Success) {
      Game.PlayerOperations.sendRequest(GameContext.localPlayerID, PlayerOperationTypes.FOUND_PANTHEON, args);
      const eventHandle = engine.on("PantheonFounded", () => {
        this.addNextPantheon();
        eventHandle.clear();
      });
    } else {
      console.error(`screen-pantheon-chooser: addNextBelief() - Couldn't add pantheon ${pantheonToAdd}`);
    }
  }
}
Controls.define("screen-pantheon-chooser", {
  createInstance: ScreenPantheonChooser,
  description: "Pantheon Chooser screen.",
  classNames: ["screen-pantheon-chooser", "fullscreen", "pointer-events-auto", "flex"],
  styles: [styles],
  innerHTML: [content],
  attributes: []
});
//# sourceMappingURL=screen-pantheon-chooser.js.map

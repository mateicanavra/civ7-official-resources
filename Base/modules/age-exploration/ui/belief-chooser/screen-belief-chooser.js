import { ScreenGeneralChooser } from '../../../base-standard/ui/general-chooser/screen-general-chooser.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/panel-support.chunk.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';

const content = "<fxs-frame class=\"general-chooser-frame\">\r\n\t<div class=\"primary-window\">\r\n\t\t<fxs-vslot>\r\n\t\t\t<fxs-scrollable class=\"belief-chooser-scroll\">\r\n\t\t\t\t<fxs-vslot class=\"belief-chooser__content gen-chooser-content\"> </fxs-vslot>\r\n\t\t\t</fxs-scrollable>\r\n\t\t\t<fxs-button\r\n\t\t\t\tclass=\"belief-confirm-button\"\r\n\t\t\t\tcaption=\"LOC_UI_BELIEF_CHOOSER_CONFIRM\"\r\n\t\t\t></fxs-button>\r\n\t\t</fxs-vslot>\r\n\t</div>\r\n</fxs-frame>\r\n";

const styles = "fs://game/age-exploration/ui/belief-chooser/screen-belief-chooser.css";

class ScreenBeliefChooser extends ScreenGeneralChooser {
  chosenBelief = null;
  confirmListener = () => {
    this.confirmButton();
  };
  /**
   * Create the list of entries in this chooser. Called by the base general chooser.
   * @param {element} entryContainer - The HTML element that's the parent of all of the entries.
   */
  createEntries(entryContainer) {
    GameInfo.Beliefs.forEach((belief) => {
      if (Game.Religion.canHaveBelief(GameContext.localPlayerID, belief.$index)) {
        const newEntry = document.createElement("fxs-activatable");
        this.tagEntry(newEntry);
        newEntry.setAttribute("data-tooltip-content", Locale.compose(belief.Description));
        newEntry.setAttribute("religion-belief", belief.BeliefType);
        const iconContainer = document.createElement("div");
        iconContainer.classList.add("belief-chooser__selection-status");
        const iconImg = document.createElement("div");
        iconImg.classList.add("belief-chooser__selection-icon-img");
        iconImg.style.backgroundImage = "none";
        iconContainer.appendChild(iconImg);
        newEntry.appendChild(iconContainer);
        const text = document.createElement("div");
        text.classList.add("belief-chooser__selection-text");
        text.innerHTML = Locale.compose(belief.Name);
        newEntry.appendChild(text);
        entryContainer.appendChild(newEntry);
      }
    });
    const confirmButton = this.Root.querySelector(".belief-confirm-button");
    if (confirmButton) {
      confirmButton.addEventListener("action-activate", this.confirmListener);
    } else {
      console.error(
        "screen-belief-chooser: createEntries(): Missing confirmButton with '.belief-confirm-button'"
      );
    }
    this.updateButtonState();
  }
  /**
   * Called by the base general chooser when the user chooses an item in the list.
   * @param {element} entryElement - The HTML element chosen.
   */
  entrySelected(entryElement) {
    const iconImg = entryElement.querySelector(
      ".belief-chooser__selection-icon-img"
    );
    if (entryElement != this.chosenBelief) {
      if (this.chosenBelief) {
        const iconElement = this.chosenBelief.querySelector(".belief-chooser__selection-icon-img");
        if (iconElement) {
          iconElement.style.backgroundImage = "none";
        } else {
          console.error(
            "screen-belief-chooser: entrySelected - can't find belief-chooser__selection-icon-img for previously selected belief!"
          );
        }
      }
      this.chosenBelief = entryElement;
      if (iconImg) {
        const iconElement = this.chosenBelief.querySelector(".belief-chooser__selection-icon-img");
        if (iconElement) {
          iconElement.style.backgroundImage = "url('fs://game/core/ui/themes/default/img/mpicon_ready.png')";
        } else {
          console.error(
            "screen-belief-chooser: entrySelected - can't find belief-chooser__selection-icon-img for newly selected belief!"
          );
        }
      }
    }
    this.updateButtonState();
  }
  // Turn the confirm button on and off.
  updateButtonState() {
    const confirmButton = this.Root.querySelector(".belief-confirm-button");
    if (confirmButton) {
      if (this.chosenBelief) {
        confirmButton.classList.remove("disabled");
        confirmButton.classList.remove("hidden");
      } else {
        confirmButton.classList.add("disabled");
        confirmButton.classList.add("hidden");
      }
    }
  }
  confirmButton() {
    if (this.chosenBelief) {
      const beliefType = this.chosenBelief.getAttribute("religion-belief");
      if (beliefType) {
        const args = {
          BeliefType: Database.makeHash(beliefType)
        };
        const result = Game.PlayerOperations.canStart(
          GameContext.localPlayerID,
          PlayerOperationTypes.ADD_BELIEF,
          args,
          false
        );
        if (result.Success) {
          Game.PlayerOperations.sendRequest(GameContext.localPlayerID, PlayerOperationTypes.ADD_BELIEF, args);
          this.close();
        } else {
          console.error("screen-belief-chooser: ADD_BELIEF player operation failed!");
        }
      }
    } else {
      console.error("screen-belief-chooser: confirm button was activated without 1 beliefs selected");
    }
  }
}
Controls.define("screen-belief-chooser", {
  createInstance: ScreenBeliefChooser,
  description: "Religious Belief Chooser screen.",
  classNames: ["screen-general-chooser"],
  styles: [styles],
  innerHTML: [content],
  attributes: []
});
//# sourceMappingURL=screen-belief-chooser.js.map

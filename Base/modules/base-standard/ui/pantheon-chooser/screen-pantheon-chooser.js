import { A as Audio } from '../../../core/ui/audio-base/audio-support.chunk.js';
import FocusManager from '../../../core/ui/input/focus-manager.js';
import { N as NavTray } from '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import { a as realizePlayerColors } from '../../../core/ui/utilities/utilities-color.chunk.js';
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
import '../../../core/ui/graph-layout/utils.chunk.js';
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

const content = "<fxs-subsystem-frame\r\n\tclass=\"pantheon-frame items-center shrink pointer-events-auto\"\r\n\tbackDrop=\"fs://game/rel_starrybg.png\"\r\n>\r\n\t<div\r\n\t\tclass=\"flex flex-col items-center\"\r\n\t\tdata-slot=\"header\"\r\n\t>\r\n\t\t<fxs-header\r\n\t\t\tclass=\"tracking-150 flex justify-center w-96\"\r\n\t\t\ttitle=\"LOC_BELIEF_CLASS_PANTHEON_NAME\"\r\n\t\t\tdata-slot=\"header\"\r\n\t\t></fxs-header>\r\n\t\t<div\r\n\t\t\tclass=\"pantheon-chooser_choose-x-pantheons text-accent-2 max-w-96 mt-8 mb-3 text-center font-body-base\"\r\n\t\t\tdata-slot=\"header\"\r\n\t\t></div>\r\n\t</div>\r\n\t<fxs-vslot\r\n\t\tdisable-focus-allowed=\"true\"\r\n\t\tclass=\"pantheon-chooser_pantheon-container w-96 flex items-center pl-2 pr-3 flex-col flex-auto relative\"\r\n\t>\r\n\t</fxs-vslot>\r\n\t<fxs-hero-button\r\n\t\tclass=\"pantheon-chooser_confirm self-center h-12 w-80 bottom-5 mt-12\"\r\n\t\tdisabled=\"true\"\r\n\t\tcaption=\"LOC_UI_RESOURCE_ALLOCATION_CONFIRM\"\r\n\t\tdata-slot=\"footer\"\r\n\t></fxs-hero-button>\r\n</fxs-subsystem-frame>\r\n";

const styles = "fs://game/base-standard/ui/pantheon-chooser/screen-pantheon-chooser.css";

class ScreenPantheonChooser extends ScreenGeneralChooser {
  confirmButtonListener = this.onConfirm.bind(this);
  pantheonContainer;
  pantheonSubtitle;
  confirmButton;
  pantheonFrame;
  numPantheonsToAdd = -1;
  pantheonsToAdd = [];
  pantheonButtonsMap = /* @__PURE__ */ new Map();
  mustAddPantheons = false;
  onInitialize() {
    this.pantheonContainer = MustGetElement(".pantheon-chooser_pantheon-container", this.Root);
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
    this.mustAddPantheons = playerCulture.isNodeUnlocked("NODE_CIVIC_AQ_MAIN_MYSTICISM") && this.numPantheonsToAdd > 0;
    if (this.mustAddPantheons) {
      this.createEntries(this.pantheonContainer);
    }
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
      realizePlayerColors(this.Root, player);
    } else {
      console.error(
        `screen-pantheon-chooser: createEntries() - player ${GameContext.localPlayerID} was invalid!`
      );
    }
    for (const pantheon of GameInfo.Beliefs) {
      const pantheonLocked = !Game.Religion.isBeliefClaimable(pantheon.$index);
      if (pantheon.BeliefClassType == "BELIEF_CLASS_PANTHEON") {
        const pantheonItem = document.createElement(
          "pantheon-chooser-item"
        );
        pantheonItem.classList.value = "pantheon-item bg-primary-4";
        pantheonItem.whenComponentCreated((chooser) => {
          chooser.pantheonChooserNode = this.createPantheonNode(pantheon);
        });
        pantheonItem.setAttribute("beliefType", pantheon.BeliefType);
        if (!pantheonLocked) {
          this.tagEntry(pantheonItem);
        } else {
          pantheonItem.setAttribute("data-tooltip-content", Locale.compose("LOC_UI_PANTHEON_ALREADY_TAKEN"));
        }
        this.pantheonButtonsMap.set(pantheon.BeliefType, pantheonItem);
        pantheonItem.setAttribute("data-audio-group-ref", "audio-panel-pantheon-picker");
        pantheonItem.setAttribute("data-audio-activate-ref", "none");
        _entryContainer.appendChild(pantheonItem);
      }
    }
    FocusManager.setFocus(_entryContainer);
  }
  createPantheonNode(pantheon) {
    const primaryIcon = UI.getIconURL(pantheon.BeliefType, "PANTHEONS");
    return {
      name: Locale.compose(pantheon.Name),
      primaryIcon,
      description: Locale.stylize(pantheon.Description),
      isLocked: !Game.Religion.isBeliefClaimable(pantheon.$index)
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

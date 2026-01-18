import { A as Audio } from '../../../core/ui/audio-base/audio-support.chunk.js';
import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import { F as Focus } from '../../../core/ui/input/focus-support.chunk.js';
import { N as NavTray } from '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import { D as Databind } from '../../../core/ui/utilities/utilities-core-databinding.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { ChooserItem } from '../chooser-item/chooser-item.js';
import { ScreenGeneralChooser } from '../general-chooser/screen-general-chooser.js';
import { HideMiniMapEvent } from '../mini-map/panel-mini-map.js';
import { c as chooserItemStyles } from '../chooser-item/chooser-item.chunk.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/panel-support.chunk.js';
import '../../../core/ui/components/fxs-slot.chunk.js';
import '../../../core/ui/spatial/spatial-manager.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../../core/ui/components/fxs-activatable.chunk.js';
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

const content = "<div class=\"size-full relative\">\r\n\t<fxs-subsystem-frame\r\n\t\tclass=\"celebration-subsystem-frame absolute flex items-center left-1 bottom-2\"\r\n\t\tbox-style=\"b2\"\r\n\t\tbackDrop=\"blp:cele_chooser_bg\"\r\n\t>\r\n\t\t<fxs-header\r\n\t\t\tclass=\"celebrations__header mt-5 tracking-150 mb-8 w-80 text-center self-center font-title-xl text-shadow-subtle\"\r\n\t\t\tfiligree-style=\"h2\"\r\n\t\t\tdata-slot=\"header\"\r\n\t\t></fxs-header>\r\n\t\t<div class=\"celebrations__government-container flex flex-col items-center mt-10\">\r\n\t\t\t<div class=\"flex w-full bg-primary-4 flex max-w-128 justify-center items-center mb-2\">\r\n\t\t\t\t<fxs-icon\r\n\t\t\t\t\tclass=\"size-6 mr-1\"\r\n\t\t\t\t\tdata-icon-id=\"DEFAULT_TRADITION\"\r\n\t\t\t\t\tdata-icon-context=\"DEFAULT\"\r\n\t\t\t\t>\r\n\t\t\t\t</fxs-icon>\r\n\t\t\t\t<div\r\n\t\t\t\t\tdata-l10n-id=\"LOC_UI_CELEBRATION_CHOOSER_SLOT_UNLOCKED\"\r\n\t\t\t\t\tclass=\"font-title-base ml-1 text-accent-2\"\r\n\t\t\t\t></div>\r\n\t\t\t</div>\r\n\t\t\t<div class=\"celebrations__government\">\r\n\t\t\t\t<div class=\"celebrations__government-title text-center mb-3 font-title-xl tracking-150\"></div>\r\n\t\t\t\t<div\r\n\t\t\t\t\tclass=\"celebrations__government-desc-top font-body-base text-center self-center max-w-96\"\r\n\t\t\t\t\tdata-l10n-id=\"LOC_UI_CELEBRATION_DESC_1\"\r\n\t\t\t\t></div>\r\n\t\t\t\t<div class=\"celebrations__government-desc-bottom font-body-base text-center self-center max-w-96\"></div>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t\t<fxs-vslot\r\n\t\t\tclass=\"celebrations__choices-container mx-11 flex flex-col w-96\"\r\n\t\t\ttabIndex=\"-1\"\r\n\t\t>\r\n\t\t</fxs-vslot>\r\n\t\t<fxs-hero-button\r\n\t\t\tclass=\"celebrations__confirm relative my-5 self-center\"\r\n\t\t\tdata-slot=\"footer\"\r\n\t\t\tcaption=\"LOC_UI_RESOURCE_ALLOCATION_CONFIRM\"\r\n\t\t\tdisabled=\"true\"\r\n\t\t></fxs-hero-button>\r\n\t</fxs-subsystem-frame>\r\n</div>\r\n";

const panelCelebrationChooserStyles = "fs://game/base-standard/ui/celebration-chooser/panel-celebration-chooser.css";

class CelebrationChooser extends ScreenGeneralChooser {
  confirmButtonListener = this.onConfirm.bind(this);
  currentlySelectedChoice = null;
  confirmButton;
  bonusEntryContainer;
  onInitialize() {
    this.confirmButton = MustGetElement(".celebrations__confirm", this.Root);
    this.createCloseButton = false;
  }
  onAttach() {
    super.onAttach();
    this.confirmButton.addEventListener("action-activate", this.confirmButtonListener);
    const celebrationSubsystemFrame = MustGetElement(".celebration-subsystem-frame", this.Root);
    celebrationSubsystemFrame.addEventListener("subsystem-frame-close", () => {
      this.close();
    });
    UI.sendAudioEvent(Audio.getSoundTag("data-audio-golden-age-chooser-enter", "golden-age-chooser"));
    Databind.classToggle(this.confirmButton, "hidden", `g_NavTray.isTrayRequired`);
    window.dispatchEvent(new HideMiniMapEvent(true));
    this.realizeCelebrationPanel();
  }
  onDetach() {
    this.confirmButton.removeEventListener("action-activate", this.confirmButtonListener);
    UI.sendAudioEvent(Audio.getSoundTag("data-audio-golden-age-chooser-exit", "golden-age-chooser"));
    engine.off("TraditionSlotsAdded", this.onPolicySlotsAdded, this);
    window.dispatchEvent(new HideMiniMapEvent(false));
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    const focusElement = MustGetElement(".celebrations__choices-container", this.Root);
    Focus.setContextAwareFocus(focusElement, this.Root);
  }
  realizeCelebrationPanel() {
    const uiViewExperience = UI.getViewExperience();
    const playerObject = Players.get(GameContext.localPlayerID);
    if (!playerObject) {
      console.error(
        "panel-celebration-chooser: realizeCelebrationPanel - Unable to get player object for local player while trying to government info!"
      );
      return;
    }
    if (!playerObject.Culture) {
      console.error(
        "panel-celebration-chooser: realizeCelebrationPanel - No valid culture object attached to local player!"
      );
      return;
    }
    const playerHappiness = playerObject.Happiness;
    if (playerHappiness == void 0) {
      console.error("panel-celebration-chooser: realizeCelebrationPanel - No player happiness!");
      return;
    }
    const governmentDefinition = GameInfo.Governments.lookup(
      playerObject.Culture.getGovernmentType()
    );
    if (!governmentDefinition) {
      console.error(
        "panel-celebration-chooser: realizeCelebrationPanel - No valid GovernmentDefinition for local player!"
      );
      return;
    }
    if (!governmentDefinition.Description) {
      console.error(
        "panel-celebration-chooser: realizeCelebrationPanel - No description for government: " + governmentDefinition.GovernmentType
      );
      return;
    }
    const celebrationHeader = MustGetElement(".celebrations__header", this.Root);
    celebrationHeader.setAttribute("title", governmentDefinition.CelebrationName);
    const governmentType = MustGetElement(".celebrations__government-title", this.Root);
    governmentType.setAttribute("data-l10n-id", governmentDefinition.Name);
    const governmentDescriptionBottom = MustGetElement(".celebrations__government-desc-bottom", this.Root);
    governmentDescriptionBottom.innerHTML = Locale.stylize(
      "LOC_UI_CELEBRATION_DESC_2",
      playerHappiness.getGoldenAgeDuration()
    );
    this.bonusEntryContainer = MustGetElement(".celebrations__choices-container", this.Root);
    this.createEntries(this.bonusEntryContainer);
    const celebrationSubsystemFrame = MustGetElement(".celebration-subsystem-frame", this.Root);
    celebrationSubsystemFrame.classList.toggle("top-48", uiViewExperience != UIViewExperience.Mobile);
    if (uiViewExperience == UIViewExperience.Mobile) {
      celebrationSubsystemFrame.classList.add("top-10");
      this.bonusEntryContainer.classList.add("w-128");
      this.bonusEntryContainer.classList.add("mx-6");
      this.bonusEntryContainer.classList.remove("mx-11");
      this.bonusEntryContainer.classList.remove("h-80");
      this.bonusEntryContainer.classList.remove("w-96");
      celebrationHeader.classList.add("mb-4");
      celebrationHeader.classList.remove("w-80");
      celebrationHeader.classList.remove("mb-8");
      const governmentTopContainer = MustGetElement(".celebrations__government-container", this.Root);
      governmentTopContainer.classList.add("mt-2");
      governmentTopContainer.classList.remove("mt-10");
      const governmentDescriptionContainer = MustGetElement(".celebrations__government", this.Root);
      governmentDescriptionContainer.classList.add("mt-4");
      governmentDescriptionContainer.classList.add("mb-6");
      governmentDescriptionContainer.classList.remove("my-10");
      const governmentDescriptionTop = MustGetElement(".celebrations__government-desc-top", this.Root);
      governmentDescriptionTop.classList.add("max-w-128");
      governmentDescriptionTop.classList.remove("max-w-96");
      governmentDescriptionBottom.classList.add("max-w-128");
      governmentDescriptionBottom.classList.remove("max-w-96");
    }
  }
  /**
   * Create the list of entries in this chooser. Called by the base general chooser.
   * @param {element} entryContainer - The HTML element that's the parent of all of the entries.
   */
  createEntries(entryContainer) {
    const localPlayerID = GameContext.localPlayerID;
    if (!Players.isValid(localPlayerID)) {
      console.error(
        "panel-celebration-chooser: createEntries - GameContext.localPlayerID is not a valid player!"
      );
      return;
    }
    const player = Players.get(localPlayerID);
    if (player == null || player.Culture == void 0) {
      console.error("panel-celebration-chooser: createEntries - Couldn't get local player!");
      return;
    }
    const playerHappiness = player.Happiness;
    if (playerHappiness == void 0) {
      console.error("panel-celebration-chooser: createEntries - No player happiness!");
      return;
    }
    const playerCulture = player.Culture;
    if (!playerCulture) {
      console.error("panel-celebration-chooser: createEntries - No player culture!");
      return;
    }
    const choices = playerCulture.getGoldenAgeChoices();
    const numChoices = choices.length;
    const hasExtraChoices = numChoices > 2;
    const governmentContainer = MustGetElement(".celebrations__government", this.Root);
    governmentContainer.classList.add(hasExtraChoices ? "my-4" : "my-10");
    for (const choice of choices) {
      const celebrationItemDef = GameInfo.GoldenAges.lookup(choice);
      if (!celebrationItemDef) {
        console.error(
          `panel-celebration-chooser: createEntries - No golden age definition found for ${celebrationItemDef}!`
        );
        return;
      }
      const celebrationItem = document.createElement(
        "celebration-chooser-item"
      );
      celebrationItem.classList.add("bg-primary-4");
      celebrationItem.setAttribute("data-audio-group-ref", "golden-age-chooser");
      celebrationItem.setAttribute("data-audio-focus-ref", "data-audio-golden-age-chooser-focus");
      celebrationItem.setAttribute("data-audio-activate-ref", "data-audio-golden-age-chooser-activate");
      celebrationItem.whenComponentCreated((chooser) => {
        chooser.celebrationChooserNode = this.createCelebrationNode(
          celebrationItemDef,
          playerHappiness.getGoldenAgeDuration()
        );
      });
      celebrationItem.classList.add(hasExtraChoices ? "my-2" : "my-5");
      this.tagEntry(celebrationItem);
      celebrationItem.setAttribute("golden-age-type", celebrationItemDef.GoldenAgeType);
      entryContainer.appendChild(celebrationItem);
    }
  }
  createCelebrationNode(celebrationItemDef, celebrationDuration) {
    const primaryIcon = UI.getIconURL(celebrationItemDef.GoldenAgeType);
    console.log(primaryIcon);
    return {
      name: Locale.compose(celebrationItemDef.Name),
      primaryIcon,
      description: celebrationItemDef.Description,
      turnDuration: celebrationDuration,
      isLocked: false
    };
  }
  /**
   * Called by the base general chooser when the user chooses an item in the list.
   * @param {element} entryElement - The HTML element chosen.
   */
  entrySelected(entryElement) {
    if (this.currentlySelectedChoice) {
      this.currentlySelectedChoice.setAttribute("selected", "false");
    }
    entryElement.setAttribute("selected", "true");
    this.currentlySelectedChoice = entryElement;
    this.confirmButton.removeAttribute("disabled");
    NavTray.addOrUpdateShellAction1("LOC_UI_RESOURCE_ALLOCATION_CONFIRM");
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
  onConfirm() {
    if (!this.currentlySelectedChoice) {
      console.error("panel-celebration-chooser: onConfirm() - no golden age choice currently selected!");
      return;
    }
    const goldenAgeType = this.currentlySelectedChoice.getAttribute("golden-age-type");
    if (goldenAgeType) {
      const args = {
        GoldenAgeType: Database.makeHash(goldenAgeType)
      };
      const result = Game.PlayerOperations.canStart(
        GameContext.localPlayerID,
        PlayerOperationTypes.CHOOSE_GOLDEN_AGE,
        args,
        false
      );
      if (result.Success) {
        Game.PlayerOperations.sendRequest(
          GameContext.localPlayerID,
          PlayerOperationTypes.CHOOSE_GOLDEN_AGE,
          args
        );
        engine.on("TraditionSlotsAdded", this.onPolicySlotsAdded, this);
      }
    }
  }
  onPolicySlotsAdded(data) {
    if (data.player == GameContext.localPlayerID) {
      ContextManager.push("screen-policies", { singleton: true, createMouseGuard: true });
      this.close();
    }
  }
}
Controls.define("panel-celebration-chooser", {
  createInstance: CelebrationChooser,
  description: "Celebration Chooser",
  classNames: ["panel-celebration-chooser", "fullscreen"],
  styles: [panelCelebrationChooserStyles],
  innerHTML: [content],
  attributes: []
});
class CelebrationChooserItem extends ChooserItem {
  get celebrationChooserNode() {
    return this._chooserNode;
  }
  set celebrationChooserNode(value) {
    this._chooserNode = value;
  }
  render() {
    super.render();
    const chooserItem = document.createDocumentFragment();
    const node = this.celebrationChooserNode;
    if (!node) {
      console.error("celebration-chooser-item: render() - celebrationChooserNode was null!");
      return;
    }
    this.Root.classList.add("chooser-item_unlocked", "text-accent-2", "flex", "items-center", "min-h-20", "py-1");
    const primaryIcon = this.createChooserIcon(node.primaryIcon);
    chooserItem.appendChild(primaryIcon);
    const description = document.createElement("div");
    description.classList.value = "font-body-sm px-1 text-accent-3 max-w-76 relative";
    description.innerHTML = Locale.stylize(node.description, node.turnDuration);
    chooserItem.appendChild(description);
    this.Root.appendChild(chooserItem);
  }
}
Controls.define("celebration-chooser-item", {
  createInstance: CelebrationChooserItem,
  description: "A chooser item to be used with the celebration chooser",
  classNames: ["celebration-chooser-item", "relative", "group"],
  styles: [chooserItemStyles],
  images: [
    "fs://game/hud_sidepanel_list-bg.png",
    "fs://game/hud_list-focus_frame.png",
    "fs://game/hud_turn-timer.png",
    "fs://game/hud_civics-icon_frame.png"
  ],
  attributes: [{ name: "selected" }]
});
//# sourceMappingURL=panel-celebration-chooser.js.map

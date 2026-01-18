import FocusManager from '../../../core/ui/input/focus-manager.js';
import { b as InputEngineEventName } from '../../../core/ui/input/input-support.chunk.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { N as NavTray } from '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel } from '../../../core/ui/panel-support.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { L as Layout } from '../../../core/ui/utilities/utilities-layout.chunk.js';
import { N as NarrativePopupManager } from './narrative-popup-manager.chunk.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';

const content = "<div class=\"narrative_model__container flex\">\r\n\t<div class=\"narrative_model__column flex flex-col self-center px-1\">\r\n\t\t<div class=\"fxs-inner-frame-darker mx-4 my-6 relative flex-col items-center\">\r\n\t\t\t<div class=\"absolute inset-0 pointer-events-none\">\r\n\t\t\t\t<div class=\"absolute top-0 inset-x-0 filigree-inner-frame-top\"></div>\r\n\t\t\t\t<div class=\"absolute bottom-0 inset-x-0 filigree-inner-frame-bottom\"></div>\r\n\t\t\t</div>\r\n\t\t\t<div class=\"narrative_model__title-container flex flex-col pt-8 pb-3 items-center\">\r\n\t\t\t\t<fxs-header\r\n\t\t\t\t\tclass=\"narrative_model__title-text text-center font-title-xl mb-2 tracking-150 items-center\"\r\n\t\t\t\t\tfiligree-style=\"h2\"\r\n\t\t\t\t></fxs-header>\r\n\t\t\t\t<div class=\"filigree-shell-small flex justify-center\"></div>\r\n\t\t\t</div>\r\n\r\n\t\t\t<fxs-scrollable class=\"flex flex-auto\">\r\n\t\t\t\t<div class=\"narrative_model__text-container mb-5 mt-1 mx-12 p-2 text-center font-body-sm\"></div>\r\n\t\t\t\t<div class=\"narrative_model__button-positioning flex flex-shrink-1 mx-4\">\r\n\t\t\t\t\t<fxs-vslot class=\"narrative_model__button-container w-full px-5 mx-4 justify-center\"></fxs-vslot>\r\n\t\t\t\t</div>\r\n\t\t\t</fxs-scrollable>\r\n\t\t</div>\r\n\t</div>\r\n</div>\r\n";

const styles = "fs://game/base-standard/ui/narrative-event/graphic-narrative-event.css";

class GraphicNarrativeEvent extends Panel {
  closeButtonListener = () => (this.close(UIViewChangeMethod.PlayerInteraction), NarrativePopupManager.closePopup());
  entryListener = (event) => {
    this.onActivate(event);
  };
  engineInputListener = (inputEvent) => {
    this.onEngineInput(inputEvent);
  };
  turnEndListener = () => (this.close(UIViewChangeMethod.Automatic), NarrativePopupManager.closePopup());
  frame;
  panelOptions = null;
  targetStoryId = null;
  previousMode = null;
  previousModeContext = null;
  narrativeSceneModelGroup = null;
  Narrative3DModel = null;
  storyIdName = null;
  playerAge = "";
  playerCivilization = "";
  leaderCiv = "";
  playerPrimaryColor = 0;
  playerSecondaryColor = 0;
  constructor(root) {
    super(root);
    this.enableOpenSound = true;
    this.enableCloseSound = true;
    this.Root.setAttribute("data-audio-group-ref", "journal-quest-popup");
  }
  getNarrativeGameAssetName(narrative_id) {
    return "NARRATIVE_GAME_ASSET_" + narrative_id;
  }
  getFallbackNarrativeGameAssetName() {
    return "Narrative_Painting_Test_Scene";
  }
  getLighitngGameAssetName() {
    return "LEADER_LIGHTING_SCENE_DEFAULT_LEFT";
  }
  onAttach() {
    super.onAttach();
    const mobileViewExperience = UI.getViewExperience() == UIViewExperience.Mobile;
    this.frame = MustGetElement(".fxs-inner-frame-darker", this.Root);
    const closebutton = document.createElement("fxs-close-button");
    closebutton.addEventListener("action-activate", this.closeButtonListener);
    if (mobileViewExperience) {
      this.frame.appendChild(closebutton);
    } else {
      this.Root.appendChild(closebutton);
    }
    this.Root.classList.add("w-full", "h-full", "flex", "justify-center", "pointer-events-auto");
    this.Root.addEventListener(InputEngineEventName, this.engineInputListener);
    engine.on("LocalPlayerTurnEnd", this.turnEndListener);
    this.addElements();
    this.previousMode = InterfaceMode.getCurrent();
    this.previousModeContext = InterfaceMode.getParameters();
    InterfaceMode.switchTo("INTERFACEMODE_CINEMATIC");
  }
  onDetach() {
    if (!this.previousMode || !InterfaceMode.switchTo(this.previousMode, this.previousModeContext)) {
      InterfaceMode.switchToDefault();
    }
    if (this.narrativeSceneModelGroup) {
      this.narrativeSceneModelGroup.clear();
      this.narrativeSceneModelGroup.destroy();
    }
    engine.off("LocalPlayerTurnEnd", this.turnEndListener);
    this.Root.removeEventListener(InputEngineEventName, this.engineInputListener);
    super.onDetach();
  }
  getPanelContent() {
    return this.storyIdName ?? "";
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    NavTray.clear();
    NavTray.addOrUpdateGenericSelect();
    NavTray.addOrUpdateGenericClose();
    const entryContainer = this.Root.querySelector(
      ".narrative_model__button-container"
    );
    if (entryContainer) {
      FocusManager.setFocus(entryContainer);
    }
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  /** Handle getting options from the request to open. */
  setPanelOptions(options) {
    this.panelOptions = options;
    this.addElements();
    this.build3DPaintingScene();
  }
  build3DPaintingScene() {
    this.narrativeSceneModelGroup = WorldUI.createModelGroup("NarrativePaintingSceneModelGroup");
    let scale = 0.25;
    let yCoordinate = 31.8;
    const xCoordinate = 0;
    if (window.innerHeight <= Layout.pixelsToScreenPixels(768)) {
      yCoordinate = 36;
      scale = 0.38;
    }
    const marker = WorldUI.createFixedMarker({ x: 0, y: 0, z: 0 });
    if (marker != null) {
      this.narrativeSceneModelGroup.addModel(
        this.getLighitngGameAssetName(),
        { marker, offset: { x: -30 * scale, y: 6.45 * scale + yCoordinate, z: -14.7 } },
        { angle: 0, scale: 1, foreground: true }
      );
      if (this.storyIdName != null) {
        this.Narrative3DModel = this.narrativeSceneModelGroup.addModelAtPos(
          this.getNarrativeGameAssetName(this.storyIdName),
          { x: xCoordinate, y: yCoordinate, z: 0 },
          {
            scale,
            placement: PlacementMode.DEFAULT,
            foreground: true,
            initialState: "IDLE",
            tintColor1: this.playerPrimaryColor,
            tintColor2: this.playerSecondaryColor,
            selectionScriptParams: { age: this.playerAge, civilization: this.playerCivilization }
          }
        );
      }
      if (this.Narrative3DModel == null) {
        this.narrativeSceneModelGroup.addModelAtPos(
          this.getFallbackNarrativeGameAssetName(),
          { x: xCoordinate, y: yCoordinate, z: 0 },
          {
            scale,
            placement: PlacementMode.DEFAULT,
            foreground: true,
            initialState: "IDLE",
            tintColor1: this.playerPrimaryColor,
            tintColor2: this.playerSecondaryColor,
            selectionScriptParams: { age: this.playerAge, civilization: this.playerCivilization }
          }
        );
      }
    }
  }
  addElements() {
    if (!(this.panelOptions && this.panelOptions.notificationId)) {
      return;
    }
    const notification = Game.Notifications.find(this.panelOptions.notificationId);
    if (!notification) {
      return;
    }
    const player = Players.get(this.panelOptions.notificationId.owner);
    if (!player) {
      return;
    }
    const playerCiv = GameInfo.Civilizations.lookup(player.civilizationType);
    const playerAge = GameInfo.Ages.lookup(Game.age);
    if (playerCiv && playerAge) {
      this.playerCivilization = playerCiv.CivilizationType;
      this.playerAge = playerAge.AgeType;
      this.playerPrimaryColor = UI.Player.getPrimaryColorValueAsHex(player.id);
      this.playerSecondaryColor = UI.Player.getSecondaryColorValueAsHex(player.id);
    }
    const playerStories = player.Stories;
    if (playerStories == void 0) {
      return;
    }
    const targetStoryId = playerStories.getFirstPendingMetId();
    if (!targetStoryId) {
      return;
    }
    const story = playerStories.find(targetStoryId);
    if (!story) {
      return;
    }
    this.targetStoryId = targetStoryId;
    const storyDef = GameInfo.NarrativeStories.lookup(story.type);
    if (storyDef) {
      this.storyIdName = storyDef.NarrativeStoryType;
      const titleContainer = this.Root.querySelector(".narrative_model__title-text");
      if (titleContainer && storyDef.StoryTitle) {
        titleContainer.innerHTML = Locale.toUpper(storyDef.StoryTitle);
      }
      const bodyContainer = this.Root.querySelector(
        ".narrative_model__text-container"
      );
      if (bodyContainer) {
        if (storyDef.Completion) {
          bodyContainer.innerHTML = Locale.stylize(storyDef.Completion);
        } else {
          console.error(
            `Narrative event does not have a storyDef.Completion.  bodyContainer: '${bodyContainer.innerHTML}'`
          );
          bodyContainer.innerHTML = "ERROR: Missing storyDef completion";
        }
      }
      const entryContainer = this.Root.querySelector(
        ".narrative_model__button-container"
      );
      if (entryContainer) {
        while (entryContainer.lastChild) {
          entryContainer.removeChild(entryContainer.lastChild);
        }
        const storyLinks = GameInfo.NarrativeStory_Links.filter(
          (def) => def.FromNarrativeStoryType == storyDef.NarrativeStoryType
        );
        let links = 0;
        if (storyLinks && storyLinks.length > 0) {
          storyLinks.forEach((link) => {
            const linkDef = GameInfo.NarrativeStories.lookup(
              link.ToNarrativeStoryType
            );
            if (linkDef) {
              if (linkDef?.Activation.toUpperCase() === "LINKED" || linkDef?.Activation.toUpperCase() === "LINKED_REQUISITE" && playerStories.determineRequisiteLink(linkDef.NarrativeStoryType)) {
                links = links + 1;
                const icons = GameInfo.NarrativeRewardIcons.filter(
                  (item) => {
                    return item.NarrativeStoryType === link.ToNarrativeStoryType;
                  }
                );
                const toLinkDef = GameInfo.NarrativeStories.lookup(
                  linkDef.NarrativeStoryType
                );
                const action = playerStories.determineNarrativeInjection(
                  targetStoryId,
                  toLinkDef?.$hash ?? -1,
                  StoryTextTypes.IMPERATIVE
                );
                const reward = playerStories.determineNarrativeInjection(
                  targetStoryId,
                  toLinkDef?.$hash ?? -1,
                  StoryTextTypes.REWARD
                );
                const canAfford = linkDef?.Cost === 0 || playerStories.canAfford(linkDef.NarrativeStoryType);
                this.addEntry(
                  entryContainer,
                  Locale.stylize(
                    playerStories.determineNarrativeInjection(
                      targetStoryId,
                      toLinkDef?.$hash ?? -1,
                      StoryTextTypes.OPTION
                    )
                  ),
                  Locale.stylize(reward),
                  Locale.stylize(action),
                  link.ToNarrativeStoryType,
                  icons,
                  canAfford
                );
              }
            }
          });
        }
        if (links == 0) {
          const icons = GameInfo.NarrativeRewardIcons.filter((item) => {
            if (item.RewardIconType != "QUEST") {
              return item.NarrativeStoryType === storyDef.NarrativeStoryType;
            }
            return false;
          });
          this.addEntry(
            entryContainer,
            Locale.stylize("LOC_NARRATIVE_STORY_END_STORY_NAME"),
            Locale.stylize(
              playerStories.determineNarrativeInjectionComponentId(targetStoryId, StoryTextTypes.REWARD)
            ),
            "",
            "CLOSE",
            icons,
            true
          );
        }
      }
    }
  }
  addEntry(container, descriptiveText, reward, action, key, icons, canAfford) {
    const buttonFXS = document.createElement("fxs-reward-button");
    buttonFXS.addEventListener("action-activate", this.entryListener);
    buttonFXS.setAttribute("narrative-choice-key", key);
    buttonFXS.setAttribute("tabindex", "-1");
    buttonFXS.setAttribute("main-text", descriptiveText);
    buttonFXS.setAttribute("reward", reward);
    buttonFXS.setAttribute("action-text", action);
    buttonFXS.setAttribute("leader-civ", this.leaderCiv);
    buttonFXS.setAttribute("icons", JSON.stringify(icons));
    buttonFXS.setAttribute("story-type", "3DPANEL");
    buttonFXS.setAttribute("data-audio-group-ref", "small-narrative-event");
    if (!canAfford) {
      buttonFXS.classList.add("opacity-50");
    }
    container.appendChild(buttonFXS);
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.isCancelInput() || inputEvent.detail.name == "sys-menu") {
      this.close(UIViewChangeMethod.PlayerInteraction);
      NarrativePopupManager.closePopup();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  onActivate(event) {
    if (event.currentTarget instanceof HTMLElement) {
      if (event.currentTarget.classList.contains("fxs-reward-button")) {
        const answerKey = event.currentTarget.getAttribute("narrative-choice-key");
        if (answerKey) {
          const args = {
            TargetType: answerKey,
            Target: this.targetStoryId,
            Action: PlayerOperationParameters.Activate
          };
          const result = Game.PlayerOperations.canStart(
            GameContext.localPlayerID,
            PlayerOperationTypes.CHOOSE_NARRATIVE_STORY_DIRECTION,
            args,
            false
          );
          if (result.Success) {
            Game.PlayerOperations.sendRequest(
              GameContext.localPlayerID,
              PlayerOperationTypes.CHOOSE_NARRATIVE_STORY_DIRECTION,
              args
            );
            const iconString = event.currentTarget.getAttribute("icons");
            let sendAudioDefault = true;
            if (iconString) {
              const icons = JSON.parse(iconString);
              if (icons.length > 0) {
                const audioEvent = GameInfo.NarrativeStory_RewardIcons.lookup(
                  icons[0].RewardIconType
                )?.AudioName;
                if (audioEvent) {
                  sendAudioDefault = false;
                  UI.sendAudioEvent(audioEvent);
                }
              }
            }
            if (sendAudioDefault) {
              UI.sendAudioEvent("narrative-choice-default");
            }
            NarrativePopupManager.closePopup();
            this.close(UIViewChangeMethod.PlayerInteraction);
          }
        }
      }
    }
  }
}
Controls.define("graphic-narrative-event", {
  createInstance: GraphicNarrativeEvent,
  description: "Graphic Narrative Event screen.",
  classNames: ["graphic-narrative-event"],
  styles: [styles],
  innerHTML: [content]
});
//# sourceMappingURL=graphic-narrative-event.js.map

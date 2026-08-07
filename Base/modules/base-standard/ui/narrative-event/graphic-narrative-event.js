import { Audio } from '../../../core/ui/audio-base/audio-support.js';
import { InputEngineEventName } from '../../../core/ui/input/input-support.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import NavTray from '../../../core/ui/navigation-tray/model-navigation-tray.js';
import Panel from '../../../core/ui/panel-support.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.js';
import { Layout } from '../../../core/ui/utilities/utilities-layout.js';
import { FocusManager } from '../../../core/ui-next/services/focus-manager.js';
import { NarrativePopupManager } from './narrative-popup-manager.js';
import content from './graphic-narrative-event.html.js';
import styles from './graphic-narrative-event.scss.js';

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
  DefaultLeaderModel = null;
  storyIdName = null;
  playerAge = "";
  playerCivilization = "";
  leaderCiv = "";
  playerLeaderAssetName = "";
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
  getDefaultNarrativeLeaderName(LeaderName) {
    return "NARRATIVE_GAME_ASSET_" + LeaderName;
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
      UI.sendAudioEvent("narrative-event-trial-end");
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
      FocusManager.get().setFocus(entryContainer);
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
    WorldUI.ForegroundCamera.reset(35, { x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 0 });
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
        this.DefaultLeaderModel = this.narrativeSceneModelGroup.addModelAtPos(
          this.getDefaultNarrativeLeaderName(this.playerLeaderAssetName),
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
      if (this.DefaultLeaderModel == null) {
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
    const playerLeader = GameInfo.Leaders.lookup(player.leaderType);
    const civObj = GameInfo.Civilizations.lookup(player?.civilizationType ?? "");
    if (civObj != null) {
      Audio.playSound(civObj.CivilizationType, "narrative-event-trial");
    }
    if (playerCiv && playerAge && playerLeader) {
      this.playerCivilization = playerCiv.CivilizationType;
      this.playerAge = playerAge.AgeType;
      this.playerPrimaryColor = UI.Player.getPrimaryColorValueAsHex(player.id);
      this.playerSecondaryColor = UI.Player.getSecondaryColorValueAsHex(player.id);
      this.playerLeaderAssetName = playerLeader.LeaderType.toString();
    }
    const playerStories = player.Stories;
    if (playerStories == void 0) {
      return;
    }
    const targetStoryId = playerStories.getFirstPendingDiscoveryLastMetID();
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
        titleContainer.innerHTML = Locale.toUpper(
          Locale.stylize(
            playerStories.determineNarrativeInjectionComponentId(targetStoryId, StoryTextTypes.TITLE)
          )
        );
      }
      const bodyContainer = this.Root.querySelector(
        ".narrative_model__text-container"
      );
      if (bodyContainer) {
        if (storyDef.Completion) {
          bodyContainer.innerHTML = Locale.stylize(
            playerStories.determineNarrativeInjectionComponentId(targetStoryId, StoryTextTypes.BODY)
          );
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
        let links = 0;
        if (storyDef.VariableLinks) {
          const storyLinks = playerStories.getOrderedLinks(targetStoryId);
          if (storyLinks && storyLinks.length > 0) {
            storyLinks.forEach((link) => {
              if (this.populateLinkEntry(link, targetStoryId, entryContainer, playerStories)) {
                links = links + 1;
              }
            });
          }
        } else {
          const storyLinks = GameInfo.NarrativeStory_Links.filter(
            (def) => def.FromNarrativeStoryType == storyDef.NarrativeStoryType
          );
          if (storyLinks && storyLinks.length > 0) {
            storyLinks.forEach((link) => {
              if (this.populateLinkEntry(
                link.ToNarrativeStoryType,
                targetStoryId,
                entryContainer,
                playerStories
              )) {
                links = links + 1;
              }
            });
          }
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
  populateLinkEntry(link, targetStoryId, entryContainer, playerStories) {
    const linkDef = GameInfo.NarrativeStories.lookup(link);
    if (linkDef) {
      if (linkDef?.Activation.toUpperCase() === "LINKED" || (linkDef?.Activation.toUpperCase() === "LINKED_REQUISITE" || linkDef?.Activation.toUpperCase() === "LINKED_SUBJECT_REQUISITE") && playerStories.determineRequisiteLink(linkDef.NarrativeStoryType, targetStoryId)) {
        const icons = GameInfo.NarrativeRewardIcons.filter((item) => {
          return item.NarrativeStoryType === linkDef.NarrativeStoryType;
        });
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
          linkDef.NarrativeStoryType,
          icons,
          canAfford
        );
        return true;
      }
    }
    return false;
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
      buttonFXS.setAttribute("data-audio-press-ref", "data-audio-error-press");
      buttonFXS.setAttribute("data-audio-activate-ref", "none");
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

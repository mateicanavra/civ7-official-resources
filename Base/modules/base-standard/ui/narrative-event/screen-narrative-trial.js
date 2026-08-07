import { Audio } from '../../../core/ui/audio-base/audio-support.js';
import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import { InputEngineEventName } from '../../../core/ui/input/input-support.js';
import NavTray from '../../../core/ui/navigation-tray/model-navigation-tray.js';
import Panel from '../../../core/ui/panel-support.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.js';
import { FocusManager } from '../../../core/ui-next/services/focus-manager.js';
import { NarrativePopupManager } from './narrative-popup-manager.js';
import content from './screen-narrative-trial.html.js';
import styles from './screen-narrative-trial.scss.js';

class TrialOfTime extends Panel {
  closeButtonListener = () => {
    this.close(UIViewChangeMethod.PlayerInteraction), NarrativePopupManager.closePopup();
  };
  entryListener = (event) => {
    this.onActivate(event);
  };
  engineInputListener = (inputEvent) => {
    this.onEngineInput(inputEvent);
  };
  turnEndListener = () => {
    this.close(UIViewChangeMethod.Automatic), NarrativePopupManager.closePopup();
  };
  panelOptions = null;
  targetStoryId = null;
  leaderCiv = "";
  closebutton;
  constructor(root) {
    super(root);
    this.enableOpenSound = true;
    this.enableCloseSound = true;
    this.Root.setAttribute("data-audio-group-ref", "narrative-event");
  }
  onInitialize() {
    if (ContextManager.hasInstanceOf("panel-radial-menu")) {
      ContextManager.pop("panel-radial-menu");
    }
    const baseBg = MustGetElement(".trial-of-time-content", this.Root);
    const player = Players.get(GameContext.localPlayerID);
    const civObj = GameInfo.Civilizations.lookup(player?.civilizationType ?? "");
    const bgImageStr = (civObj?.CivilizationType ?? "").replace("CIVILIZATION_", "bg-panel-").toLowerCase();
    baseBg.style.backgroundImage = `url(${bgImageStr})`;
  }
  onAttach() {
    super.onAttach();
    const narrativeScreen = MustGetElement(".trial-of-time-content", this.Root);
    this.closebutton = document.createElement("fxs-close-button");
    this.closebutton.classList.add("mt-1");
    this.closebutton.addEventListener("action-activate", this.closeButtonListener);
    narrativeScreen.appendChild(this.closebutton);
    this.Root.addEventListener(InputEngineEventName, this.engineInputListener);
    engine.on("LocalPlayerTurnEnd", this.turnEndListener);
    this.addElements();
  }
  onDetach() {
    this.Root.removeEventListener(InputEngineEventName, this.engineInputListener);
    engine.off("LocalPlayerTurnEnd", this.turnEndListener);
    super.onDetach();
  }
  getPanelContent() {
    if (this.targetStoryId) {
      return this.targetStoryId.id.toString();
    }
    return "";
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    NavTray.clear();
    NavTray.addOrUpdateGenericSelect();
    NavTray.addOrUpdateGenericClose();
    const entryContainer = this.Root.querySelector(
      ".narrative-reg__button-container"
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
    const playerStories = player.Stories;
    if (playerStories == void 0) {
      return;
    }
    const targetStoryId = playerStories.getFirstPendingDiscoveryLastMetID();
    if (!targetStoryId) {
      this.close(UIViewChangeMethod.Automatic);
      return;
    }
    const story = playerStories.find(targetStoryId);
    if (!story) {
      return;
    }
    this.targetStoryId = targetStoryId;
    const storyDef = GameInfo.NarrativeStories.lookup(story.type);
    if (storyDef) {
      const titleContainer = this.Root.querySelector(".narrative-trial__title-text");
      if (storyDef.StoryTitle) {
        if (titleContainer) {
          titleContainer.setAttribute(
            "title",
            Locale.toUpper(
              Locale.stylize(
                playerStories.determineNarrativeInjectionComponentId(
                  targetStoryId,
                  StoryTextTypes.TITLE
                )
              )
            )
          );
        }
      } else {
        if (titleContainer) {
          titleContainer.style.display = "none";
        }
      }
      const civObj = GameInfo.Civilizations.lookup(player?.civilizationType ?? "");
      if (civObj != null) {
        Audio.playSound(civObj.CivilizationType, "narrative-event-trial");
      }
      const bodyContainer = this.Root.querySelector(
        ".narrative-reg__text-container"
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
        ".narrative-reg__button-container"
      );
      if (entryContainer) {
        while (entryContainer.lastChild) {
          entryContainer.removeChild(entryContainer.lastChild);
        }
        const storyLinks = GameInfo.NarrativeStory_Links.filter(
          (def) => def.FromNarrativeStoryType == storyDef.NarrativeStoryType
        );
        let links = 0;
        if (storyDef.VariableLinks) {
          let storyLinks2 = playerStories.getOrderedLinks(targetStoryId);
          if (storyLinks2 && storyLinks2.length > 0) {
            storyLinks2.forEach((link) => {
              if (this.populateLinkEntry(link, targetStoryId, entryContainer, playerStories)) {
                links = links + 1;
              }
            });
          }
        } else {
          const storyLinks2 = GameInfo.NarrativeStory_Links.filter(
            (def) => def.FromNarrativeStoryType == storyDef.NarrativeStoryType
          );
          if (storyLinks2 && storyLinks2.length > 0) {
            storyLinks2.forEach((link) => {
              if (this.populateLinkEntry(link.ToNarrativeStoryType, targetStoryId, entryContainer, playerStories)) {
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
        const icons = GameInfo.NarrativeRewardIcons.filter(
          (item) => {
            return item.NarrativeStoryType === linkDef.NarrativeStoryType;
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
    buttonFXS.setAttribute("story-type", "DEFAULT");
    buttonFXS.setAttribute("data-audio-group-ref", "narrative-event");
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
Controls.define("screen-narrative-trial", {
  createInstance: TrialOfTime,
  description: "Trial of Time Narrative Event Test",
  classNames: [],
  styles: [styles],
  innerHTML: [content]
});
//# sourceMappingURL=screen-narrative-trial.js.map

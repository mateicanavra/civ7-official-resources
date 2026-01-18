import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import FocusManager from '../../../core/ui/input/focus-manager.js';
import { b as InputEngineEventName } from '../../../core/ui/input/input-support.chunk.js';
import { N as NavTray } from '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel } from '../../../core/ui/panel-support.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { N as NarrativePopupManager } from './narrative-popup-manager.chunk.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';

const content = "<fxs-modal-frame\r\n\tdata-modal-style=\"narrative\"\r\n\tclass=\"narrative-modal flex-col\"\r\n>\r\n\t<div class=\"narrative-reg__content flex-col justify-start items-center w-full relative\">\r\n\t\t<div class=\"w-full absolute -bottom-6\">\r\n\t\t\t<div class=\"filigree-divider-h2 w-24 h-8 self-center\"></div>\r\n\t\t</div>\r\n\t\t<fxs-scrollable class=\"mt-4\">\r\n\t\t\t<div class=\"narrative-reg__title-container\">\r\n\t\t\t\t<fxs-header\r\n\t\t\t\t\tclass=\"narrative-reg__title-text text-center font-title-xl font-bold tracking-150 mt-12 mb-2\"\r\n\t\t\t\t\tfiligree-style=\"none\"\r\n\t\t\t\t></fxs-header>\r\n\t\t\t</div>\r\n\t\t\t<div\r\n\t\t\t\tclass=\"fxs-inner-frame nar-inner-frame mx-21 my-6 fxs-inner-frame inner-frame relative flex flex-col items-center\"\r\n\t\t\t>\r\n\t\t\t\t<div class=\"absolute inset-0 pointer-events-none\">\r\n\t\t\t\t\t<div class=\"absolute top-0 inset-x-0 filigree-inner-frame-top\"></div>\r\n\t\t\t\t\t<div class=\"absolute bottom-0 inset-x-0 filigree-inner-frame-bottom\"></div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class=\"narrative-reg__text-container w-187 my-5 mx-12 p-2 text-center font-body-sm\"></div>\r\n\t\t\t\t<fxs-vslot\r\n\t\t\t\t\tclass=\"narrative-reg__button-container flex flex-col w-full justify-start mt-4 px-12\"\r\n\t\t\t\t></fxs-vslot>\r\n\t\t\t</div>\r\n\t\t</fxs-scrollable>\r\n\t</div>\r\n</fxs-modal-frame>\r\n";

const styles = "fs://game/base-standard/ui/narrative-event/screen-narrative-event.css";

class ScreenNarrativeEvent extends Panel {
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
    this.Root.setAttribute("data-audio-group-ref", "narrative-event");
  }
  onInitialize() {
    if (ContextManager.hasInstanceOf("panel-radial-menu")) {
      ContextManager.pop("panel-radial-menu");
    }
  }
  onAttach() {
    super.onAttach();
    const narrativeScreen = MustGetElement(".narrative-reg__content", this.Root);
    this.closebutton = document.createElement("fxs-close-button");
    this.closebutton.classList.add("mt-1");
    this.closebutton.addEventListener("action-activate", this.closeButtonListener);
    narrativeScreen.appendChild(this.closebutton);
    const player = Players.get(GameContext.localPlayerID);
    let imagePath = ``;
    if (player) {
      const civ1 = GameInfo.Civilizations.lookup(player.civilizationType);
      if (civ1) {
        if (GameInfo.NarrativeDisplay_Civilizations.lookup(civ1.CivilizationType.toString())?.CivilizationImage) {
          imagePath = GameInfo.NarrativeDisplay_Civilizations.lookup(
            civ1.CivilizationType.toString()
          )?.CivilizationImage;
        }
      }
    }
    const modalWindow = MustGetElement(".narrative-modal", this.Root);
    modalWindow.setAttribute("data-bg-image", `url("fs://game/${imagePath}")`);
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
    const targetStoryId = playerStories.getFirstPendingMetId();
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
      if (storyDef.UIActivation === "SYSTEMIC" || storyDef.UIActivation === "CRISIS") {
        const header = MustGetElement(".narrative-header-container", this.Root);
        header.remove();
        const headerSys = MustGetElement(".narrative-header-container-sys", this.Root);
        headerSys.classList.toggle("hidden");
        const bottomFil = MustGetElement(".filigree-divider-h2", this.Root);
        bottomFil.remove();
        const imgbg = MustGetElement(".img-narrative-frame-bg", this.Root);
        if (storyDef.UIActivation === "CRISIS") {
          imgbg.style.backgroundImage = "url(fs://game/nar_bg_crisis)";
        } else {
          imgbg.style.backgroundImage = 'url("fs://game/nar_bg_systemic")';
        }
      }
      const titleContainer = this.Root.querySelector(".narrative-reg__title-text");
      if (storyDef.StoryTitle) {
        if (titleContainer) {
          titleContainer.innerHTML = Locale.toUpper(storyDef.StoryTitle);
          const dividerContainer = document.createElement("div");
          dividerContainer.classList.value = "flex justify-center";
          const divider = document.createElement("div");
          divider.classList.add(
            storyDef.UIActivation === "SYSTEMIC" ? "filigree-divider-h2" : "filigree-shell-small"
          );
          dividerContainer.appendChild(divider);
          titleContainer.parentElement?.appendChild(dividerContainer);
        }
      } else {
        if (titleContainer) {
          titleContainer.style.display = "none";
        }
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
    buttonFXS.setAttribute("story-type", "DEFAULT");
    buttonFXS.setAttribute("data-audio-group-ref", "narrative-event");
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
Controls.define("screen-narrative-event", {
  createInstance: ScreenNarrativeEvent,
  description: "Narrative Event screen.",
  classNames: ["screen-narrative-event"],
  styles: [styles],
  innerHTML: [content]
});
//# sourceMappingURL=screen-narrative-event.js.map

import FocusManager from '../../../core/ui/input/focus-manager.js';
import { b as InputEngineEventName } from '../../../core/ui/input/input-support.chunk.js';
import { N as NavTray } from '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel } from '../../../core/ui/panel-support.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { N as NarrativePopupManager } from '../narrative-event/narrative-popup-manager.chunk.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';

const content = "<fxs-modal-frame\r\n\tdata-modal-style=\"on-map\"\r\n\tclass=\"small-narrative__container w-full min-h-48\"\r\n>\r\n\t<div class=\"small-narrative__primary-window flex px-4 pt-5\">\r\n\t\t<div class=\"small-narrative__text-holder w-full text-center font-body-sm\">\r\n\t\t\t<div class=\"small-narrative__body-text pt-3 pb-2 pr-9 pl-4 text-center flex\"></div>\r\n\t\t\t<fxs-vslot class=\"small-narrative__content w-full mt-3 px-3\"> </fxs-vslot>\r\n\t\t</div>\r\n\t</div>\r\n</fxs-modal-frame>\r\n<div class=\"small-narrative__position h-96\"></div>\r\n";

const styles = "fs://game/base-standard/ui/small-narrative-event/small-narrative-event.css";

class SmallNarrativeEvent extends Panel {
  static SM_NAR_Z_PLACEMENT = { x: 0, y: 0, z: 18 };
  focusOverriden = false;
  closeOrCloseButtonListener = this.onClose.bind(this);
  entryListener = this.onActivate.bind(this);
  engineInputListener = this.onEngineInput.bind(this);
  turnEndListener = () => {
    this.close(UIViewChangeMethod.Automatic), NarrativePopupManager.closePopup();
  };
  updateListener = this.onUpdate.bind(this);
  globalHideListener = this.onGlobalHide.bind(this);
  panelOptions = null;
  targetStoryId = null;
  currentScreenPosition = { x: -1, y: -1 };
  _worldAnchorHandle = null;
  storyCoordinates = { x: 0, y: 0 };
  worldSpaceFocusOffset = 64;
  storyType = "LIGHT";
  leaderCiv = "";
  constructor(root) {
    super(root);
    this.inputContext = InputContext.Dual;
    this.enableOpenSound = true;
    this.Root.setAttribute("data-audio-group-ref", "small-narrative-event");
  }
  onAttach() {
    super.onAttach();
    this.Root.classList.add("absolute", "top-0", "left-0", "flex", "flex-col", "item-center");
    const closebutton = document.createElement("fxs-close-button");
    closebutton.addEventListener("action-activate", this.closeOrCloseButtonListener);
    closebutton.setAttribute("data-audio-group-ref", "small-narrative-event");
    closebutton.classList.add("top-1", "right-1");
    this.Root.appendChild(closebutton);
    this.Root.addEventListener(InputEngineEventName, this.engineInputListener);
    this.addElements();
    window.requestAnimationFrame(this.updateListener);
    engine.on("LocalPlayerTurnEnd", this.turnEndListener);
    window.addEventListener("ui-hide-small-narratives", this.globalHideListener);
  }
  getPanelContent() {
    if (this.targetStoryId) {
      return this.targetStoryId.id.toString();
    }
    return "";
  }
  setPanelOptions(options) {
    this.panelOptions = options;
    this.addElements();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    NavTray.clear();
    NavTray.addOrUpdateGenericBack();
    NavTray.addOrUpdateGenericSelect();
    waitForLayout(() => {
      const entryContainer = MustGetElement(".small-narrative__content", this.Root);
      FocusManager.setFocus(entryContainer);
    });
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  onGlobalHide() {
    this.close(UIViewChangeMethod.Automatic);
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
      return;
    }
    if (playerStories.getStoryPlotCoord(targetStoryId)) {
      this.storyCoordinates = playerStories.getStoryPlotCoord(targetStoryId);
      this.makeAnchorWithStoryCoordinates(this.storyCoordinates);
    }
    if (this.storyCoordinates) {
      const worldLocation = WorldUI.getPlotLocation(
        this.storyCoordinates,
        { x: 0, y: 0, z: 0 },
        PlacementMode.WATER
      );
      Camera.lookAt(worldLocation.x, worldLocation.y + this.worldSpaceFocusOffset);
    }
    const story = playerStories.find(targetStoryId);
    if (!story) {
      return;
    }
    this.targetStoryId = targetStoryId;
    const storyDef = GameInfo.NarrativeStories.lookup(story.type);
    if (storyDef) {
      if (storyDef.UIActivation === "DISCOVERY") {
        this.storyType = "DISCOVERY";
      }
      const bodyContainer = this.Root.querySelector(".small-narrative__body-text");
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
      const entryContainer = this.Root.querySelector(".small-narrative__content");
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
        if (this.storyType == "DISCOVERY") {
          FocusManager.setFocus(entryContainer);
        }
      }
    }
  }
  addEntry(container, descriptiveText, reward, action, key, icons, canAfford) {
    const buttonFXS = document.createElement("fxs-reward-button");
    buttonFXS.addEventListener("action-activate", this.entryListener);
    buttonFXS.setAttribute("small-narrative-choice-key", key);
    buttonFXS.setAttribute("tabindex", "-1");
    buttonFXS.setAttribute("main-text", descriptiveText);
    buttonFXS.setAttribute("reward", reward);
    buttonFXS.setAttribute("action-text", action);
    buttonFXS.setAttribute("leader-civ", this.leaderCiv);
    buttonFXS.setAttribute("icons", JSON.stringify(icons));
    buttonFXS.setAttribute("story-type", "LIGHT");
    buttonFXS.setAttribute("data-audio-group-ref", "small-narrative-event");
    buttonFXS.setAttribute("data-audio-focus-ref", "data-audio-choice-focus");
    if (!canAfford) {
      buttonFXS.classList.add("opacity-50");
    }
    container.appendChild(buttonFXS);
  }
  onDetach() {
    this.Root.removeEventListener(InputEngineEventName, this.engineInputListener);
    window.removeEventListener("ui-hide-small-narratives", this.globalHideListener);
    engine.off("LocalPlayerTurnEnd", this.turnEndListener);
    this.destroyWorldAnchor();
    NarrativePopupManager.closePopup();
    super.onDetach();
  }
  onEngineInput(inputEvent) {
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
        const answerKey = event.currentTarget.getAttribute("small-narrative-choice-key");
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
  onUpdate() {
    window.requestAnimationFrame(this.updateListener);
    this.realizeScreenPosition();
  }
  onClose(event) {
    event.stopPropagation();
    event.preventDefault();
    NarrativePopupManager.closePopup();
    this.close(UIViewChangeMethod.PlayerInteraction);
  }
  realizeScreenPosition() {
    if (!this._worldAnchorHandle) {
      return;
    }
    let targetLocation = this.storyCoordinates;
    if (!targetLocation) {
      targetLocation = { x: -1, y: -1 };
    }
    if (targetLocation.x == this.currentScreenPosition.x && targetLocation.y == this.currentScreenPosition.y) {
      return;
    }
    this.Root.style.topPX = -this.Root.offsetHeight;
  }
  makeWorldAnchor(location) {
    this._worldAnchorHandle = WorldAnchors.RegisterFixedWorldAnchor(
      location,
      SmallNarrativeEvent.SM_NAR_Z_PLACEMENT
    );
    if (this._worldAnchorHandle !== null && this._worldAnchorHandle >= 0) {
      this.Root.setAttribute(
        "data-bind-style-transform2d",
        `{{FixedWorldAnchors.offsetTransforms[${this._worldAnchorHandle}].value}}`
      );
    } else {
      console.error(`Failed to create world anchor for location`, location);
    }
  }
  destroyWorldAnchor() {
    if (this._worldAnchorHandle !== null) {
      this.Root.removeAttribute("data-bind-style-transform2d");
      WorldAnchors.UnregisterFixedWorldAnchor(this._worldAnchorHandle);
      this._worldAnchorHandle = null;
    }
  }
  //create the world anchor, if there is no coordinates it defaults to space next to the player's capitol city
  makeAnchorWithStoryCoordinates(storyCoordinates) {
    const player = Players.get(GameContext.localPlayerID);
    const cities = player?.Cities?.getCityIds();
    const defaultCoordinates = { x: -9999, y: -9999 };
    if (JSON.stringify(storyCoordinates) == JSON.stringify(defaultCoordinates)) {
      if (cities) {
        cities.some((cityID) => {
          const city = Cities.get(cityID);
          if (city) {
            if (city.isCapital) {
              const cityOffset = { x: city.location.x + 1, y: city.location.y };
              if (cityOffset) {
                this.makeWorldAnchor(cityOffset);
                this.storyCoordinates = cityOffset;
              }
            }
          }
        });
      }
    } else {
      if (storyCoordinates) {
        this.makeWorldAnchor(storyCoordinates);
      } else {
        console.error("storyCoordinates is null");
      }
    }
  }
}
Controls.define("small-narrative-event", {
  createInstance: SmallNarrativeEvent,
  description: "Small Narrative Event Screen.",
  classNames: ["small-narrative-event"],
  styles: [styles],
  innerHTML: [content],
  //	properties: [],
  attributes: []
});
//# sourceMappingURL=small-narrative-event.js.map

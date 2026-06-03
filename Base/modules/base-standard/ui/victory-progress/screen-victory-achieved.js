import { Audio } from '../../../core/ui/audio-base/audio-support.js';
import { DisplayHandlerBase } from '../../../core/ui/context-manager/display-handler.js';
import { DisplayQueueManager } from '../../../core/ui/context-manager/display-queue-manager.js';
import { Framework } from '../../../core/ui/framework.js';
import Panel, { AnchorType } from '../../../core/ui/panel-support.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.js';
import { FocusManager } from '../../../core/ui-next/services/focus-manager.js';
import { instance } from '../civilopedia/model-civilopedia.js';
import { VictoryAchievedScreenCategory } from './model-victory-progress.js';
import { VictoryProgressOpenTab } from './screen-victory-progress.js';
import styles from './screen-victory-achieved.scss.js';

const LOCAL_WINNER_INNER = `
<fxs-modal-frame data-modal-style="special" class="victory-achieved__victory-popup-container relative flex w-120 min-h-180 justify-center mt-42">
	<fxs-vslot class="victory-achieved__main-column items-center flex-auto">
		<fxs-header class="victory-achieved__header-text  min-h-12 w-96 font-title-lg uppercase relative self-center justify-center"></fxs-header>
		<div class="victory-achieved__victory-icon-container flex relative flex-row justify-center mt-8 mb-10">
			<div class="victory-achieved__icon-filigree img-victory-filagree mr-14 bg-contain bg-no-repeat"></div>
			<div class="victory-achieved__victory-icon-laurels flex absolute self-center justify-center img-victory-laurels bg-contain bg-no-repeat">
				<div class="victory-achieved__victory-icon bg-contain bg-no-repeat size-42 bg-center self-center"></div>
			</div>
			<div class="victory-achieved__icon-filigree -scale-x-100 img-victory-filagree ml-14 bg-contain bg-no-repeat"></div>
		</div>
	<div class="victory-achieved__victory-title font-title-xl font-bold text-accent-1 text-shadow-subtle tracking-100 uppercase my-1"></div>
		<div class="victory-achieved__rewards-container relative flex flex-col mx-5 self-stretch justify-center flex-auto">
			<div class="victory-achieved__rewards-container-background rounded flex flex-col justify-center relative py-1 w-113 my-6">
				<div class="victory-achieved__rewards-container-text tracking-100 text-accent-2 font-title-xs flex self-center pt-1 pb-2 uppercase" data-l10n-id="LOC_UI_VICTORY_REWARD_EARNED"></div>
				<fxs-spatial-slot class="victory-achieved__rewards-container-items flex flex-row self-stretch justify-center pb-1"></fxs-spatial-slot>
			</div>
		</div>
		<div class="victory-achieved__button-container flex flex-auto flex-col px-5 pb-3 justify-end self-stretch">			
			<fxs-button class="victory-achieved__view-victories-button mb-3 uppercase self-stretch"></fxs-hero-button>
			<fxs-button class="victory-achieved__continue-button uppercase self-stretch" caption="LOC_GENERIC_CONTINUE"></fxs-hero-button>
		</div>
	</fxs-vslot>
</fxs-modal-frame>
<div class="victory-achieved__top-frame-filigree absolute flex w-120 h-11 bg-contain bg-no-repeat"></div>
`;
class ScreenVictoryAchieved extends Panel {
  onVictoriesButtonActivatedListener = this.onVictoriesButtonActivated.bind(this);
  onCloseListener = this.onClose.bind(this);
  milestoneDefinition;
  legacyPathClass;
  rewardsDefs = [];
  engineInputListener = this.onEngineInput.bind(this);
  victoryClassMap = {
    LEGACY_PATH_CLASS_CULTURE: {
      soundID: "data-audio-culture-milestone",
      emblem: "img-emblem-cultural",
      pediaPage: instance.getPage("AGES", "AGES_37"),
      victoryProgressTab: VictoryProgressOpenTab.LegacyPathsCulture
    },
    LEGACY_PATH_CLASS_ECONOMIC: {
      soundID: "data-audio-economic-milestone",
      emblem: "img-emblem-economic",
      pediaPage: instance.getPage("AGES", "AGES_36"),
      victoryProgressTab: VictoryProgressOpenTab.LegacyPathsEconomic
    },
    LEGACY_PATH_CLASS_MILITARY: {
      soundID: "data-audio-military-milestone",
      emblem: "img-emblem-military",
      pediaPage: instance.getPage("AGES", "AGES_23"),
      victoryProgressTab: VictoryProgressOpenTab.LegacyPathsMilitary
    },
    LEGACY_PATH_CLASS_SCIENCE: {
      soundID: "data-audio-science-milestone",
      emblem: "img-emblem-scientific",
      pediaPage: instance.getPage("AGES", "AGES_38"),
      victoryProgressTab: VictoryProgressOpenTab.LegacyPathsScience
    },
    // TODO check to see how this is going to be done
    LEGACY_PATH_CLASS_LIVE_EVENT: { soundID: "", emblem: "victory_live_event" }
  };
  constructor(root) {
    super(root);
    this.animateInType = this.animateOutType = AnchorType.RelativeToCenter;
  }
  onAttach() {
    super.onAttach();
    const milestoneId = this.Root.getAttribute("data-milestone-id");
    console.log(`The milestone ID is ${milestoneId}`);
    const milestoneDef = GameInfo.AgeProgressionMilestones.lookup(Number(milestoneId));
    if (!milestoneDef) {
      console.error(
        `screen-victory-achieved: onAttach() - no milestone definition found for milestoneID ${milestoneId}!`
      );
      return;
    }
    this.milestoneDefinition = milestoneDef;
    this.Root.addEventListener("engine-input", this.engineInputListener);
    const legacyPathDefinition = GameInfo.LegacyPaths.lookup(this.milestoneDefinition.LegacyPathType);
    if (!legacyPathDefinition) {
      console.error(
        `screen-victory-achieved: no legacyPathDefinition found for legacy path type ${this.milestoneDefinition.LegacyPathType}`
      );
      return;
    }
    this.legacyPathClass = legacyPathDefinition.LegacyPathClassType;
    this.Root.innerHTML = LOCAL_WINNER_INNER;
    const rewardContainer = MustGetElement(".victory-achieved__rewards-container-items", this.Root);
    const milestoneType = this.milestoneDefinition.AgeProgressionMilestoneType;
    for (const reward of GameInfo.AgeProgressionMilestoneRewards) {
      if (reward.AgeProgressionMilestoneType == milestoneType) {
        const ageReward = GameInfo.AgeProgressionRewards.lookup(reward.AgeProgressionRewardType);
        if (ageReward) {
          this.rewardsDefs.push(ageReward);
        }
      }
    }
    const popupTitle = MustGetElement(".victory-achieved__header-text", this.Root);
    popupTitle.setAttribute("title", legacyPathDefinition.Name);
    const iconElement = MustGetElement(".victory-achieved__victory-icon", this.Root);
    iconElement.classList.add(`${this.victoryClassMap[this.legacyPathClass].emblem}`);
    for (const def of this.rewardsDefs) {
      if (def.Name && def.Description) {
        const tipName = Locale.compose(def.Name);
        let tipDescription = Locale.compose(def.Description);
        if (Game.AgeProgressManager.isFinalAge && def.DescriptionFinalAge) {
          tipDescription = Locale.compose(def.DescriptionFinalAge);
        }
        const currentRewardButton = document.createElement("fxs-activatable");
        currentRewardButton.classList.add("mx-3", "group", "relative");
        currentRewardButton.setAttribute("data-tooltip-content", `[B]${tipName}[/B][N]${tipDescription}`);
        currentRewardButton.setAttribute("tabindex", "-1");
        const currentRewardIcon = document.createElement("div");
        currentRewardIcon.classList.add("w-11", "h-11", "bg-contain", "bg-no-repeat");
        let css;
        if (def.Icon) {
          css = UI.getIconCSS(def.Icon) ?? UI.getIconCSS("DEFAULT_NOTIFICATION");
        }
        currentRewardIcon.style.backgroundImage = css ?? 'url("fs://game/unitflag_missingicon.png")';
        currentRewardButton.appendChild(currentRewardIcon);
        const unlockGlow = document.createElement("div");
        unlockGlow.classList.value = "absolute -inset-0\\.5 opacity-0 bg-center bg-contain bg-no-repeat group-pressed\\:opacity-100 group-hover\\:opacity-100 group-focus\\:opacity-100 transition-opacity";
        unlockGlow.style.backgroundImage = `url(memento_circle-focus)`;
        currentRewardButton.appendChild(unlockGlow);
        rewardContainer.appendChild(currentRewardButton);
      }
    }
    const laurels = MustGetElement(".victory-achieved__victory-icon-laurels", this.Root);
    laurels.style.backgroundImage = `url("fs://game/popup_gold_laurels")`;
    const progressButton = MustGetElement(".victory-achieved__view-victories-button", this.Root);
    progressButton.addEventListener("action-activate", this.onVictoriesButtonActivatedListener);
    const continueButton = MustGetElement(".victory-achieved__continue-button", this.Root);
    continueButton.addEventListener("action-activate", this.onCloseListener);
    UI.sendAudioEvent(
      Audio.getSoundTag(
        this.victoryClassMap[legacyPathDefinition.LegacyPathClassType].soundID,
        "audio-screen-victory-achieved"
      )
    );
    const victoryTitleElement = MustGetElement(".victory-achieved__victory-title", this.Root);
    if (this.milestoneDefinition.FinalMilestone && Game.AgeProgressManager.isFinalAge) {
      victoryTitleElement.setAttribute("data-l10n-id", "LOC_UI_VICTORY_VICTORY_UNLOCKED");
      const viewDetailsText = Locale.stylize("LOC_LEGACY_PATH_VIEW_DETAILS", "ADVISOR_CIVILOPEDIA");
      progressButton.setAttribute("caption", viewDetailsText);
    } else {
      victoryTitleElement.setAttribute("data-l10n-id", "LOC_UI_VICTORY_MILESTONE_COMPLETED");
      progressButton.setAttribute("caption", "LOC_UI_VICTORY_VIEW_PROGRESS");
    }
  }
  onDetach() {
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    super.onDetach();
  }
  onVictoriesButtonActivated(event) {
    if (event.target) {
      if (this.milestoneDefinition.FinalMilestone && Game.AgeProgressManager.isFinalAge) {
        const pediaPage = this.victoryClassMap[this.legacyPathClass].pediaPage;
        if (!pediaPage) {
          console.error(
            `screen-victory-achieved: onVictoriesButtonActivated - no page found for path type ${this.milestoneDefinition.LegacyPathType}`
          );
        } else {
          instance.navigateTo(pediaPage);
        }
        Framework.ContextManager.push("screen-civilopedia", { singleton: true, createMouseGuard: true });
      } else {
        Framework.ContextManager.push("screen-victory-progress", {
          singleton: true,
          createMouseGuard: true,
          panelOptions: { openTab: this.victoryClassMap[this.legacyPathClass].victoryProgressTab }
        });
      }
      this.onClose();
    }
  }
  onClose() {
    DisplayQueueManager.closeActive(VictoryAchievedScreenCategory);
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.isCancelInput() || inputEvent.detail.name == "sys-menu") {
      this.onClose();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    const viewProgressButton = MustGetElement(
      ".victory-achieved__view-victories-button",
      this.Root
    );
    FocusManager.get().setFocus(viewProgressButton);
  }
}
class VictoryAchievedScreenManager extends DisplayHandlerBase {
  VictoryAchievedScreenElement = null;
  constructor() {
    super(VictoryAchievedScreenCategory, 5e3);
  }
  show(_request) {
    this.VictoryAchievedScreenElement ??= Framework.ContextManager.push("screen-victory-achieved", {
      singleton: true,
      createMouseGuard: true,
      attributes: { "data-milestone-id": _request.milestoneDefinition.$hash }
    });
  }
  hide(_request, _options) {
    Framework.ContextManager.pop("screen-victory-achieved");
    this.VictoryAchievedScreenElement = null;
  }
}
Controls.define("screen-victory-achieved", {
  createInstance: ScreenVictoryAchieved,
  description: "Displays info for recently achieved victory.",
  styles: [styles],
  classNames: ["screen-victory-achieved"],
  attributes: []
});
const VictoryAchievedScreenManagerInstance = new VictoryAchievedScreenManager();
DisplayQueueManager.registerHandler(VictoryAchievedScreenManagerInstance);

export { VictoryAchievedScreenCategory, VictoryAchievedScreenManagerInstance as default };
//# sourceMappingURL=screen-victory-achieved.js.map

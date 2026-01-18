import { A as Audio } from '../../../core/ui/audio-base/audio-support.chunk.js';
import { b as DisplayHandlerBase } from '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import { DisplayQueueManager } from '../../../core/ui/context-manager/display-queue-manager.js';
import { F as Framework } from '../../../core/ui/framework.chunk.js';
import { P as Panel, A as AnchorType } from '../../../core/ui/panel-support.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { instance } from '../civilopedia/model-civilopedia.chunk.js';
import { a as VictoryAchievedScreenCategory } from './model-victory-progress.chunk.js';
import { VictoryProgressOpenTab } from './screen-victory-progress.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../cinematic/cinematic-manager.chunk.js';
import '../../../core/ui/interface-modes/interface-modes.js';
import '../endgame/screen-endgame.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import '../../../core/ui/tooltips/tooltip-manager.js';
import '../../../core/ui/input/plot-cursor.js';
import '../../../core/ui/utilities/utilities-layout.chunk.js';
import '../../../core/ui/utilities/utilities-color.chunk.js';
import '../../../core/ui/graph-layout/utils.chunk.js';
import '../end-results/end-results.js';
import '../endgame/model-endgame.js';
import '../victory-manager/victory-manager.chunk.js';

const styles = "fs://game/base-standard/ui/victory-progress/screen-victory-achieved.css";

const LOCAL_WINNER_INNER = `
<fxs-modal-frame data-modal-style="special" class="victory-achieved__victory-popup-container relative flex w-120 h-180 justify-center mt-42">
	<fxs-vslot class="victory-achieved__main-column items-center flex-auto">
		<fxs-header class="victory-achieved__header-text h-12 w-96 font-title-lg uppercase relative self-center justify-center"></fxs-header>
		<div class="victory-achieved__victory-icon-container flex relative flex-row justify-center mt-12 mb-10">
			<div class="victory-achieved__icon-filigree img-victory-filagree mr-14 bg-contain bg-no-repeat"></div>
			<div class="victory-achieved__victory-icon-laurels flex absolute self-center justify-center img-victory-laurels bg-contain bg-no-repeat">
				<div class="victory-achieved__victory-icon bg-contain bg-no-repeat size-42 bg-center self-center"></div>
			</div>
			<div class="victory-achieved__icon-filigree -scale-x-100 img-victory-filagree ml-14 bg-contain bg-no-repeat"></div>
		</div>
		<div class="victory-achieved__victory-title font-title-xl uppercase mb-3"></div>
		<div class="victory-achieved__rewards-container relative flex mx-5 self-stretch justify-center">
			<div class="victory-achieved__rewards-container-background flex flex-col justify-center relative mt-2 w-113 py-6">
			<div class="victory-achieved__rewards-container-bar absolute top-0 w-113 h-4"></div>
			<div class="victory-achieved__rewards-container-bar absolute bottom-0 bottom w-113 h-4"></div>
				<div class="victory-achieved__rewards-container-text font-title-xs flex self-center pb-6" data-l10n-id="LOC_UI_VICTORY_REWARD_EARNED"></div>
				<fxs-spatial-slot class="victory-achieved__rewards-container-items flex flex-row self-stretch justify-center"></fxs-spatial-slot>
			</div>
			<div class="victory-achieved__rewards-container-filigree absolute top-0 justify-center bg-contain bg-no-repeat w-16 h-4"></div>
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
    Framework.FocusManager.setFocus(viewProgressButton);
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

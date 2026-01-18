import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';

const styles = "fs://game/base-standard/ui/live-notice/live-notice.css";

var LiveNoticeType = /* @__PURE__ */ ((LiveNoticeType2) => {
  LiveNoticeType2[LiveNoticeType2["ChallengeCompleted"] = 0] = "ChallengeCompleted";
  LiveNoticeType2[LiveNoticeType2["LegendPathsUpdate"] = 1] = "LegendPathsUpdate";
  LiveNoticeType2[LiveNoticeType2["RewardReceived"] = 2] = "RewardReceived";
  return LiveNoticeType2;
})(LiveNoticeType || {});
const STARTING_INNER_HTML = `
<div class="live-notice-container-background">
	<div class="live-notice-main-container -mt-2">
		<fxs-hslot class="live-notice-main-hslot font-body text-base text-accent-2">
			<fxs-vslot class="live-notice-title-bar">
				<div class="live-notice-title font-title uppercase text-base text-secondary-1 text-right" data-l10n-id="LOC_CHALLENGE_COMPLETE"></div>
				<div class="live-notice-challenge-name font-body text-base text-primary-1 text-right"></div>
			</fxs-vslot>
			<fxs-hslot class="live-notice-main-info">
				<div class="live-notice-challenge-score font-body text-primary-1 text-center self-center pl-3"></div>
				<div class="live-notice-check pointer-events-auto bg-contain bg-center bg-no-repeat mr-2"></div>
				<div class="live-notice-filigree-right"></div>
			</fxs-hslot>
		</fxs-hslot>
	</div>
</div>`;
class LiveNoticePanel extends Component {
  isBusy = false;
  container = null;
  animationEndListener = this.onAnimationEnd.bind(this);
  updateRewardsListener = this.onUpdateRewards.bind(this);
  noticeQueue = [];
  ChallengeCompletedListener = (data) => {
    this.resolveChallengeCompleted(data);
  };
  LegendPathUpdatedListener = (data) => {
    this.resolveLegendPathUpdated(data);
  };
  RewardReceivedListener = (data) => {
    this.resolveRewardReceivedListener(data);
  };
  onAttach() {
    super.onAttach();
    engine.on("ChallengeCompleted", this.ChallengeCompletedListener);
    engine.on("LegendPathsDataUpdated", this.LegendPathUpdatedListener, this);
    this.Root.classList.add("absolute", "right-0");
    this.Root.innerHTML = STARTING_INNER_HTML;
    this.container = MustGetElement(".live-notice-container-background", this.Root);
    this.container?.addEventListener("animationend", this.animationEndListener);
    engine.on("EntitlementsUpdated", this.RewardReceivedListener);
    window.addEventListener("update-live-notice", this.updateRewardsListener);
    this.container?.classList.add("live-notice-off-screen");
  }
  onDetach() {
    super.onDetach();
    this.container?.removeEventListener("animationend", this.animationEndListener);
  }
  showNotice(notice) {
    if (this.isBusy) {
      this.noticeQueue.push(notice);
      return;
    }
    this.isBusy = true;
    const title = MustGetElement(".live-notice-title", this.Root);
    const name = MustGetElement(".live-notice-challenge-name", this.Root);
    const score = MustGetElement(".live-notice-challenge-score", this.Root);
    if (notice.liveNoticeType == 2 /* RewardReceived */) {
      title.setAttribute("data-l10n-id", "LOC_REWARD_RECEIVED");
      name.innerHTML = Locale.compose(notice.title);
      score.innerHTML = Locale.stylize(notice.description);
      score.classList.add("text-xs", "uppercase");
    } else if (notice.liveNoticeType == 0 /* ChallengeCompleted */) {
      title.setAttribute("data-l10n-id", "LOC_CHALLENGE_COMPLETE");
      name.innerHTML = Locale.compose(notice.title);
      score.innerHTML = Locale.compose("LOC_METAPROGRESSION_XP", notice.score);
      score.classList.add("text-base");
    } else if (notice.liveNoticeType == 1 /* LegendPathsUpdate */) {
      title.setAttribute("data-l10n-id", Locale.compose("LOC_LEVEL_ACHIEVE", notice.score));
      if (notice.title.includes("FOUNDATION")) {
        name.innerHTML = Locale.compose("LOC_METAPROGRESSION_PATH_FOUNDATION");
      } else {
        name.innerHTML = Locale.compose(notice.title.replace("LEGEND_PATH", "LOC_LEADER") + "_NAME");
      }
      score.innerHTML = " ";
      score.classList.add("text-base");
    }
    this.animateIn();
    this.runNotice();
  }
  runNotice = async () => {
    await new Promise((f) => setTimeout(f, 5e3));
    this.animateOut();
  };
  animateIn() {
    this.container?.classList.remove("live-notice-off-screen");
    this.container?.classList.remove("live-notice-animate-out");
    this.container?.classList.add("live-notice-animate-in");
  }
  animateOut() {
    this.container?.classList.remove("live-notice-animate-in");
    this.container?.classList.add("live-notice-animate-out");
  }
  onAnimationEnd(event) {
    if (event.animationName == "live-notice-animate-out") {
      this.container?.classList.add("live-notice-off-screen");
      this.isBusy = false;
      if (this.noticeQueue.length > 0) {
        const queuedNotice = this.noticeQueue[0];
        this.noticeQueue.splice(0, 1);
        if (queuedNotice) {
          this.showNotice(queuedNotice);
        }
      }
    }
  }
  resolveRewardReceivedListener(data) {
    this.onUpdateRewards();
    console.log(`Nofifying about ${data.keys.length} New Rewards!`);
  }
  onUpdateRewards() {
    const allRewards = Online.UserProfile.getRewardEntries();
    const newItems = Online.UserProfile.getNewlyUnlockedItems();
    if (newItems.length > 0) {
      newItems.forEach((dnaItemID) => {
        const item = allRewards.find((r) => r.dnaItemID === dnaItemID);
        if (item) {
          const liveNoticeObj = {
            title: item.name,
            score: 0,
            description: item.description,
            //TODO: plans to do an icon for the reward type instead
            liveNoticeType: 2 /* RewardReceived */
          };
          this.showNotice(liveNoticeObj);
        }
      });
    }
    console.log(`Received ${newItems.length} New Rewards!`);
  }
  resolveChallengeCompleted(data) {
    if (data.hidden) return;
    const liveNoticeObj = {
      title: data.name,
      score: data.rewardXp,
      description: data.description,
      liveNoticeType: 0 /* ChallengeCompleted */
    };
    this.showNotice(liveNoticeObj);
  }
  resolveLegendPathUpdated(data) {
    if (data.status == 0)
      return;
    const liveNoticeObj = {
      title: data.legendPathType,
      score: data.newLevel,
      description: "",
      liveNoticeType: 1 /* LegendPathsUpdate */
    };
    this.showNotice(liveNoticeObj);
  }
}
Controls.define("live-notice-panel", {
  createInstance: LiveNoticePanel,
  classNames: ["live-notice-panel", "pointer-events-none"],
  description: "Panel for displaying real-time notices",
  styles: [styles]
});

export { LiveNoticeType };
//# sourceMappingURL=live-notice.js.map

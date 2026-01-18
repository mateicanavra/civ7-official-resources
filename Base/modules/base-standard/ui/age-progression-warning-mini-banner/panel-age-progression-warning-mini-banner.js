import { P as Panel } from '../../../core/ui/panel-support.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { A as AgeProgressionMiniBannerShowEventName, a as AgeProgressionPopupManager } from '../age-progression-warning-popup/age-progression-warning-popup-manager.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';

const content = "<div class=\"progress-banner__container w-200 flex items-center justify-center\">\r\n\t<div class=\"progress-banner__text py-2 font-title font-bold uppercase text-shadow tracking-100\"></div>\r\n</div>\r\n";

const styles = "fs://game/base-standard/ui/age-progression-warning-mini-banner/panel-age-progression-warning-mini-banner.css";

class PanelAgeProgressionWarningMiniBanner extends Panel {
  textElement;
  _lifetimeSeconds = 1.5;
  onStayTimerEndedListener = this.onStayTimerEnded.bind(this);
  onAnimationEndListener = this.onAnimationEnd.bind(this);
  onMiniBannerShowListener = this.onMiniBannerShow.bind(this);
  waitTimerHandle = 0;
  onInitialize() {
    this.textElement = MustGetElement(".progress-banner__text", this.Root);
  }
  onAttach() {
    super.onAttach();
    window.addEventListener(AgeProgressionMiniBannerShowEventName, this.onMiniBannerShowListener);
  }
  onDetach() {
    this.Root.removeEventListener("animationend", this.onAnimationEndListener);
    window.removeEventListener(AgeProgressionMiniBannerShowEventName, this.onMiniBannerShowListener);
    super.onDetach();
  }
  onMiniBannerShow() {
    const ageCountdownStarted = Game.AgeProgressManager.ageCountdownStarted;
    if (ageCountdownStarted) {
      const currentAgeProgressionData = AgeProgressionPopupManager.currentAgeProgressionPopupData;
      if (!currentAgeProgressionData) {
        console.error(
          "panel-age-progression-warning-mini-banner.ts: onMiniBannerShow() - no age progression popup data was found!"
        );
        return;
      }
      const turnsRemaining = currentAgeProgressionData.turnsRemaining;
      if (turnsRemaining == 0) {
        this.textElement.setAttribute("data-l10n-id", "LOC_UI_GAME_FINAL_TURN_OF_AGE");
      } else {
        this.textElement.textContent = Locale.compose(
          "LOC_UI_X_TURNS_LEFT_UNTIL_AGE_END",
          currentAgeProgressionData.turnsRemaining
        );
      }
      if (this.waitTimerHandle > 0) {
        clearTimeout(this.waitTimerHandle);
        this.waitTimerHandle = 0;
      }
      this.Root.addEventListener("animationend", this.onAnimationEndListener);
      this.Root.classList.add("progress-banner__enter");
      this.Root.classList.remove("hidden", "progress-banner__exit");
      AgeProgressionPopupManager.closePopup();
    }
  }
  onStayTimerEnded() {
    this.Root.classList.add("progress-banner__exit");
  }
  onAnimationEnd() {
    if (this.Root.classList.contains("progress-banner__enter")) {
      this.Root.classList.remove("progress-banner__enter");
      this.waitTimerHandle = setTimeout(this.onStayTimerEndedListener, this._lifetimeSeconds * 1e3);
    } else if (this.Root.classList.contains("progress-banner__exit")) {
      this.Root.classList.remove("progress-banner__exit");
      this.Root.classList.add("hidden");
      this.Root.removeEventListener("animationend", this.onAnimationEndListener);
    }
  }
}
Controls.define("panel-age-progression-warning-mini-banner", {
  createInstance: PanelAgeProgressionWarningMiniBanner,
  description: "Displays a smaller warning that the age is about to end. Leaves by itself after a bit.",
  innerHTML: [content],
  styles: [styles],
  classNames: ["hidden"]
});
//# sourceMappingURL=panel-age-progression-warning-mini-banner.js.map

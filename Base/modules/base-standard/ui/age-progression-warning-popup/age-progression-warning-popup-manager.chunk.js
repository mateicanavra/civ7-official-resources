import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import { b as DisplayHandlerBase } from '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import { DisplayQueueManager } from '../../../core/ui/context-manager/display-queue-manager.js';

const AgeProgressionMiniBannerShowEventName = "age-progression-mini-banner-show";
class AgeProgressionMiniBannerShowEvent extends CustomEvent {
  constructor(numTurns) {
    super(AgeProgressionMiniBannerShowEventName, { bubbles: false, cancelable: true, detail: { numTurns } });
  }
}
class AgeProgressionPopupManagerClass extends DisplayHandlerBase {
  static instance = null;
  onAgeProgressionListener = this.onAgeProgression.bind(this);
  _ageCountdownTimerValue = -1;
  _currentAgeProgressionPopupData = null;
  get currentAgeProgressionPopupData() {
    return this._currentAgeProgressionPopupData;
  }
  constructor() {
    super("AgeProgressionPopup", 999999999);
    if (AgeProgressionPopupManagerClass.instance) {
      console.error("Only one instance of the AgeProgressionPopup manager class can exist at a time!");
    }
    AgeProgressionPopupManagerClass.instance = this;
    this._ageCountdownTimerValue = Game.AgeProgressManager.getAgeCountdownLength;
    engine.on("AgeProgressionChanged", this.onAgeProgressionListener);
  }
  /**
   * @implements {IDisplayQueue}
   */
  show(request) {
    this._currentAgeProgressionPopupData = request;
    if (this._ageCountdownTimerValue == request.turnsRemaining && this._ageCountdownTimerValue != 0) {
      ContextManager.push("panel-age-progression-warning-popup", { createMouseGuard: true, singleton: true });
    } else if (this._ageCountdownTimerValue > request.turnsRemaining) {
      window.dispatchEvent(new AgeProgressionMiniBannerShowEvent(request.turnsRemaining));
    }
  }
  /**
   * @implements {IDisplayQueue}
   */
  hide(_request, _options) {
    this._currentAgeProgressionPopupData = null;
    if (ContextManager.hasInstanceOf("panel-age-progression-warning-popup")) {
      ContextManager.pop("panel-age-progression-warning-popup");
    }
  }
  onAgeProgression() {
    const ageCountdownStarted = Game.AgeProgressManager.ageCountdownStarted;
    if (ageCountdownStarted) {
      if (ContextManager.shouldShowPopup(GameContext.localPlayerID)) {
        const curAgeProgress = Game.AgeProgressManager.getCurrentAgeProgressionPoints();
        const maxAgeProgress = Game.AgeProgressManager.getMaxAgeProgressionPoints();
        const ageProgressionPopupData = {
          category: this.getCategory(),
          turnsRemaining: maxAgeProgress - curAgeProgress
        };
        if (this._currentAgeProgressionPopupData) {
          DisplayQueueManager.closeMatching(this.getCategory());
        }
        this.addDisplayRequest(ageProgressionPopupData);
      }
    }
  }
  closePopup = () => {
    if (this.currentAgeProgressionPopupData) {
      DisplayQueueManager.close(this.currentAgeProgressionPopupData);
    }
  };
}
const AgeProgressionPopupManager = new AgeProgressionPopupManagerClass();
DisplayQueueManager.registerHandler(AgeProgressionPopupManager);

export { AgeProgressionMiniBannerShowEventName as A, AgeProgressionPopupManager as a };
//# sourceMappingURL=age-progression-warning-popup-manager.chunk.js.map

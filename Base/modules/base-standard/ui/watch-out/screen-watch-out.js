import FocusManager from '../../../core/ui/input/focus-manager.js';
import { P as Panel } from '../../../core/ui/panel-support.chunk.js';
import { L as LowerCalloutEvent } from '../tutorial/tutorial-events.chunk.js';
import WatchOutManager from './watch-out-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/utilities/utilities-plotcoord.chunk.js';
import '../notification-train/model-notification-train.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../tutorial/tutorial-item.js';

class ScreenWatchOut extends Panel {
  lowerTutorialCalloutListener = (event) => {
    this.onLowerTutorialCallout(event);
  };
  popupData = WatchOutManager.currentWatchOutPopupData;
  callout = document.createElement("tutorial-callout");
  onInitialize() {
    super.onInitialize();
    if (!this.popupData) {
      console.error("screen-watch-out: WatchOutPopupData was null/undefined.");
      WatchOutManager.closePopup();
      return;
    }
    this.render();
  }
  onAttach() {
    super.onAttach();
    window.addEventListener(LowerCalloutEvent.name, this.lowerTutorialCalloutListener);
  }
  onDetach() {
    window.removeEventListener(LowerCalloutEvent.name, this.lowerTutorialCalloutListener);
    FocusManager.unlockFocus(this.callout, "tutorial-callout");
    WatchOutManager.closePopup();
    super.onDetach();
  }
  render() {
    const item = this.popupData.item;
    const calloutDefine = item.callout;
    if (!calloutDefine) {
      console.error("Tutorial: Callout data missing; cannot raise. id: ", item.ID);
      return;
    }
    this.callout.setAttribute("value", JSON.stringify(calloutDefine));
    this.callout.setAttribute("itemID", item.ID);
    this.callout.setAttribute("minimize-disabled", "true");
    if (item.callout?.anchorPosition && !item.callout?.anchorHost) {
      this.callout.classList.add(item.callout.anchorPosition);
    }
    this.Root.appendChild(this.callout);
  }
  onLowerTutorialCallout(event) {
    const itemID = event.detail.itemID;
    if (itemID) {
      const item = this.popupData.item;
      if (item) {
        const isClosed = event.detail.closed;
        if (isClosed) {
          WatchOutManager.closePopup();
        }
        const idx = event.detail.optionNum;
        const key = "option" + idx;
        item.callout?.[key]?.callback?.();
        return;
      } else {
        console.error(
          `screen-watch-out: Screen received a lower callout event for '${itemID}' but there is no popupData with that ID.`
        );
      }
    }
    WatchOutManager.closePopup();
  }
}
Controls.define("screen-watch-out", {
  createInstance: ScreenWatchOut,
  classNames: ["fullscreen"],
  description: "Screen for displaying Watch Out moment callouts."
});
//# sourceMappingURL=screen-watch-out.js.map

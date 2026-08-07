import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import { DisplayHandlerBase } from '../../../core/ui/context-manager/display-handler.js';
import { DisplayHideReason, DisplayQueueManager } from '../../../core/ui/context-manager/display-queue-manager.js';
import { PopupPriority } from './popup-priority.js';

class PopupSequencerClass extends DisplayHandlerBase {
  static instance = null;
  currentPopupData = null;
  constructor() {
    super("PopupSequencer", PopupPriority.default);
    if (PopupSequencerClass.instance) {
      console.error("Only one instance of the PopupSequencerClass can exist at a time!");
    }
    PopupSequencerClass.instance = this;
    this.currentPopupData = null;
  }
  isShowing() {
    if (this.currentPopupData) {
      return ContextManager.hasInstanceOf(this.currentPopupData.screenId);
    }
    return false;
  }
  /**
   * @implements {IDisplayQueue}
   */
  show(request) {
    this.currentPopupData = request;
    if (request.showCallback) {
      request.showCallback(request.userData);
    }
    ContextManager.push(request.screenId, request.properties);
  }
  /**
   * @implements {IDisplayQueue}
   */
  hide(_request, options) {
    if (options?.reason == DisplayHideReason.Suspend) {
      ContextManager.pop(this.currentPopupData?.screenId);
      return;
    }
    ContextManager.pop(this.currentPopupData?.screenId);
    this.currentPopupData = null;
    if (DisplayQueueManager.findAll(this.getCategory()).length === 1) {
      this.currentPopupData = null;
    }
  }
  closePopup = (screenId) => {
    if (this.currentPopupData && this.currentPopupData.screenId == screenId) {
      DisplayQueueManager.close(this.currentPopupData);
    } else {
      if (this.currentPopupData) {
        console.error(
          `PopupSquencer: tried to close ${screenId}, but topmost screen is ${this.currentPopupData.screenId}`
        );
      }
    }
    this.currentPopupData = null;
  };
  addDisplayRequest(requestInfo, forceShow) {
    const popupInfo = requestInfo;
    if (popupInfo.popupId !== void 0) {
      if (DisplayQueueManager.findAll(this.getCategory()).some((request) => {
        const popupRequest = request;
        return popupRequest.popupId !== void 0 && popupInfo.popupId === popupRequest.popupId;
      })) {
        return requestInfo;
      }
    }
    return super.addDisplayRequest(requestInfo, forceShow);
  }
}
const PopupSequencer = new PopupSequencerClass();
DisplayQueueManager.registerHandler(PopupSequencer);

export { PopupSequencer as default };
//# sourceMappingURL=popup-sequencer.js.map

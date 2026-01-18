import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import { b as DisplayHandlerBase } from '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import { DisplayQueueManager } from '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/panel-support.chunk.js';

class PopupSequencerClass extends DisplayHandlerBase {
  static instance = null;
  currentPopupData = null;
  constructor() {
    super("PopupSequencer", 6e3);
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
  hide(_request, _options) {
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
}
const PopupSequencer = new PopupSequencerClass();
DisplayQueueManager.registerHandler(PopupSequencer);

export { PopupSequencer as default };
//# sourceMappingURL=popup-sequencer.js.map

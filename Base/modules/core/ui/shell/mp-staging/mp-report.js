import ContextManager from '../../context-manager/context-manager.js';
import { a as DialogBoxManager } from '../../dialog-box/manager-dialog-box.chunk.js';
import { F as Focus } from '../../input/focus-support.chunk.js';
import { N as NavTray } from '../../navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel, A as AnchorType } from '../../panel-support.chunk.js';
import { MustGetElement } from '../../utilities/utilities-dom.chunk.js';
import { abuseReasonToTooltip } from '../../utilities/utilities-online.js';
import '../../context-manager/display-queue-manager.js';
import '../../framework.chunk.js';
import '../../input/cursor.js';
import '../../input/focus-manager.js';
import '../../audio-base/audio-support.chunk.js';
import '../../views/view-manager.chunk.js';
import '../../components/fxs-slot.chunk.js';
import '../../spatial/spatial-manager.js';
import '../../input/action-handler.js';
import '../../input/input-support.chunk.js';
import '../../utilities/utilities-update-gate.chunk.js';
import '../../utilities/utilities-image.chunk.js';
import '../../utilities/utilities-component-id.chunk.js';

const content = "<fxs-frame>\r\n\t<fxs-vslot class=\"rules-container flex flex-auto mt-4 mb-10\">\r\n\t\t<div class=\"flex flex-col items-center -mt-10\">\r\n\t\t\t<div\r\n\t\t\t\tclass=\"font-title text-2xl text-secondary\"\r\n\t\t\t\tdata-l10n-id=\"LOC_UI_MP_REPORT_PLAYER_TITLE\"\r\n\t\t\t></div>\r\n\t\t\t<div class=\"filigree-divider-h3 w-64\"></div>\r\n\t\t</div>\r\n\t\t<div class=\"flex flex-row justify-between\">\r\n\t\t\t<fxs-textbox\r\n\t\t\t\tclass=\"enter-report-textbox\"\r\n\t\t\t\tmax-length=\"255\"\r\n\t\t\t></fxs-textbox>\r\n\t\t</div>\r\n\t</fxs-vslot>\r\n\r\n\t<div class=\"button-container flex flex-row justify-around\">\r\n\t\t<fxs-button\r\n\t\t\tclass=\"report\"\r\n\t\t\tcaption=\"LOC_UI_MP_REPORT_PLAYER_TITLE\"\r\n\t\t\taction-key=\"inline-shell-action-1\"\r\n\t\t></fxs-button>\r\n\t\t<fxs-button\r\n\t\t\tclass=\"cancel\"\r\n\t\t\tcaption=\"LOC_GENERIC_CANCEL\"\r\n\t\t\taction-key=\"inline-cancel\"\r\n\t\t></fxs-button>\r\n\t</div>\r\n</fxs-frame>\r\n";

const styles = "fs://game/core/ui/shell/mp-staging/mp-report.css";

class PanelMPReport extends Panel {
  cancelButtonListener = () => {
    this.close();
  };
  engineInputListener = (inputEvent) => {
    this.onEngineInput(inputEvent);
  };
  reportButton = null;
  reportTextbox = null;
  reportRoomId = -1;
  reportUserId = "";
  reportUserGamertag = "";
  reportReason = "";
  constructor(root) {
    super(root);
    this.animateInType = this.animateOutType = AnchorType.RelativeToRight;
    this.enableCloseSound = true;
    this.Root.setAttribute("data-audio-group-ref", "audio-mp-friends-popups");
  }
  executeReport() {
    if (this.reportTextbox) {
      const value = this.reportTextbox?.getAttribute("value");
      if (value) {
        this.Report(value);
      } else {
        this.Report("");
      }
    }
  }
  onAttach() {
    super.onAttach();
    const reportRoomIdAttribute = this.Root.getAttribute("reportRoomId");
    if (reportRoomIdAttribute) {
      this.reportRoomId = Number(reportRoomIdAttribute);
    }
    const reportUserIdAttribute = this.Root.getAttribute("reportUserId");
    if (reportUserIdAttribute) {
      this.reportUserId = reportUserIdAttribute;
    }
    const reportUserGamertagAttribute = this.Root.getAttribute("reportUserGamertag");
    if (reportUserGamertagAttribute) {
      this.reportUserGamertag = reportUserGamertagAttribute;
    }
    const reportReasonAttribute = this.Root.getAttribute("reportReason");
    if (reportReasonAttribute) {
      this.reportReason = reportReasonAttribute;
    }
    let placeholderText = "LOC_UI_MP_REPORT_PLAYER_TITLE";
    const abuseReasonName = abuseReasonToTooltip.get(this.reportReason);
    if (abuseReasonName != void 0) {
      placeholderText = abuseReasonName;
    }
    this.Root.addEventListener("engine-input", this.engineInputListener);
    this.reportButton = MustGetElement(".report", this.Root);
    const bgFrameSetOpacity = MustGetElement("fxs-frame", this.Root);
    bgFrameSetOpacity.classList.add("bg-black");
    this.reportButton?.addEventListener("action-activate", () => {
      this.executeReport();
    });
    this.reportTextbox = MustGetElement(".enter-report-textbox", this.Root);
    if (this.reportTextbox) {
      this.reportTextbox.setAttribute("placeholder", Locale.compose(placeholderText));
    }
    const cancelButton = this.Root.querySelector(".cancel");
    cancelButton?.addEventListener("action-activate", this.cancelButtonListener);
  }
  onDetach() {
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    const cancelButton = this.Root.querySelector(".cancel");
    cancelButton?.removeEventListener("action-activate", this.cancelButtonListener);
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    NavTray.clear();
    const rulesContainer = this.Root.querySelector(".rules-container");
    if (rulesContainer) {
      Focus.setContextAwareFocus(rulesContainer, this.Root);
    }
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    switch (inputEvent.detail.name) {
      case "cancel":
      case "keyboard-escape":
        this.close();
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
        break;
      case "shell-action-1":
        const disableAttribute = this.reportButton?.getAttribute("disabled");
        if (!disableAttribute || disableAttribute != "true") {
          this.executeReport();
        }
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
        break;
    }
  }
  Report(message) {
    if (ContextManager.hasInstanceOf("screen-mp-friends")) {
      Online.Social.reportUser(this.reportUserId, this.reportReason, message);
      DialogBoxManager.createDialog_Confirm({
        title: Locale.compose("LOC_UI_MP_REPORT_FEEDBACK_REPORTED", this.reportUserGamertag),
        body: ""
      });
      ContextManager.popUntil("screen-mp-friends");
    } else {
      Online.Social.reportMultiplayerRoom(this.reportRoomId, this.reportUserId, this.reportReason, message);
      ContextManager.popUntil("screen-mp-browser");
    }
  }
}
Controls.define("screen-mp-report", {
  createInstance: PanelMPReport,
  description: "Custom report reason input screen",
  classNames: ["mp-report"],
  styles: [styles],
  innerHTML: [content],
  attributes: []
});
//# sourceMappingURL=mp-report.js.map

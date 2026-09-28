import { Audio } from '../../audio-base/audio-support.js';
import { DialogBoxManager } from '../../dialog-box/manager-dialog-box.js';
import NavTray from '../../navigation-tray/model-navigation-tray.js';
import Panel from '../../panel-support.js';
import { MustGetElement } from '../../utilities/utilities-dom.js';
import { FocusManager } from '../../../ui-next/services/focus-manager.js';
import $2kCodeRedemptionResponseGenericContent from './2k-code-redemption-response-generic.html.js';
import $2kCodeRedemptionResponseGenericStyles from './2k-code-redemption-response-generic.scss.js';
import $2kCodeRedemptionContent from './2k-code-redemption.html.js';
import styles from './2k-code-redemption.scss.js';

class Panel2KCodeRedemption extends Panel {
  cancelButtonListener = () => {
    this.close();
  };
  engineInputListener = (inputEvent) => {
    this.onEngineInput(inputEvent);
  };
  redeemButton = null;
  codeTextbox = null;
  responseDialogBox = null;
  constructor(root) {
    super(root);
    this.enableOpenSound = true;
    this.enableCloseSound = true;
    this.Root.setAttribute("data-audio-group-ref", "redeem-popup");
  }
  onCodesRedeemUpdate() {
    const currentRedeemResult = Network.getRedeemCodeResult();
    if (currentRedeemResult == DnaCodeRedeemResult.UNSET || this.responseDialogBox != null) {
      return;
    }
    let title = "";
    let body = "";
    if (currentRedeemResult == DnaCodeRedeemResult.CODE_REDEEM_SUCCESSFULLY) {
      title = "LOC_UI_REDEEM_CODE_SUCCESS_TITLE";
      const codeRedeemResults = Network.getRedeemCodeResponse();
      let infoBoxText = "";
      const RewardsList = Online.UserProfile.getRewardEntries();
      codeRedeemResults.redeemChanges.entitlementChanges.forEach((entitlementChange) => {
        const DNAItemId = Network.getDNAItemIDFromEntitlementID(entitlementChange.id);
        const reward = RewardsList.find((reward2) => {
          return reward2.dnaItemID == DNAItemId;
        });
        if (reward) {
          infoBoxText += Locale.compose("LOC_UI_REDEEM_CODE_SUCCESS_INFO_ENTITLEMENT", reward.name);
        } else {
          infoBoxText += Locale.compose(
            "LOC_UI_REDEEM_CODE_SUCCESS_INFO_ENTITLEMENT",
            Locale.compose("LOC_UI_ERROR_DECODING_ENTITLEMENT_NAME")
          );
        }
      });
      codeRedeemResults.redeemChanges.currencyChanges.forEach((currencyChange) => {
        infoBoxText += Locale.compose(
          "LOC_UI_REDEEM_CODE_SUCCESS_INFO_CURRENCY",
          currencyChange.amount,
          currencyChange.currency
        );
      });
      body = Locale.compose("LOC_UI_REDEEM_CODE_SUCCESS_INFO", infoBoxText);
    } else if (currentRedeemResult == DnaCodeRedeemResult.CODE_ALREADY_REDEEMED) {
      title = "LOC_UI_REDEEM_CODE_ALREADY_REDEEMED_TITLE";
      body = "LOC_UI_REDEEM_CODE_ALREADY_REDEEMED_INFO";
    } else {
      title = "LOC_UI_REDEEM_CODE_FAILED_TITLE";
      const codeRedeemResults = Network.getRedeemCodeResponse();
      body = Locale.compose(
        "LOC_UI_REDEEM_CODE_FAILED_INFO",
        this.getErrorMessageLocString(codeRedeemResults.errorCode)
      );
    }
    this.responseDialogBox = DialogBoxManager.createDialog_MultiOption({
      body,
      title,
      canClose: false,
      options: [
        {
          actions: ["accept"],
          label: "LOC_GENERIC_YES",
          callback: this.onYesButtonPressed.bind(this)
        },
        {
          actions: ["cancel", "keyboard-escape"],
          label: "LOC_GENERIC_NO",
          callback: this.onNoButtonPressed.bind(this)
        }
      ]
    });
  }
  getErrorMessageLocString(errorCode) {
    switch (errorCode) {
      case 400:
        return "LOC_UI_CODE_REDEEM_ERROR_BAD_REQUEST";
      case 404:
        return "LOC_UI_CODE_REDEEM_ERROR_RESOURCE_NOT_FOUND";
      case 409:
        return "LOC_UI_CODE_REDEEM_ERROR_ALREADY_REDEEMED";
      case 415:
        return "LOC_UI_CODE_REDEEM_ERROR_UNSUPPORTED_MEDIA_TYPE";
      case 429:
        return "LOC_UI_CODE_REDEEM_ERROR_TOO_MANY_REQUESTS";
      case 500:
        return "LOC_UI_CODE_REDEEM_INTERNAL_SERVER_ERROR";
      default:
        return "LOC_UI_CODE_REDEEM_UNKOWN_ERROR";
    }
  }
  executeCodeRedemption() {
    if (this.codeTextbox && !this.responseDialogBox) {
      const value = this.codeTextbox?.getAttribute("value");
      if (value) {
        Network.redeemCode(value);
      }
    }
  }
  onYesButtonPressed() {
    this.codeTextbox?.setAttribute("value", "");
    this.responseDialogBox = null;
  }
  onNoButtonPressed() {
    this.close();
    this.responseDialogBox = null;
  }
  onAttach() {
    super.onAttach();
    this.Root.addEventListener("engine-input", this.engineInputListener);
    this.redeemButton = MustGetElement(".redeem", this.Root);
    this.redeemButton.addEventListener("action-activate", () => {
      this.executeCodeRedemption();
    });
    this.codeTextbox = MustGetElement(".enter-code-textbox", this.Root);
    this.codeTextbox.setAttribute("placeholder", Locale.compose("LOC_UI_REDEEM_CODE_TEXT_FIELD"));
    this.redeemButton.setAttribute("play-error-sound", "true");
    this.codeTextbox.addEventListener("component-value-changed", (event) => {
      this.redeemButton?.classList.toggle("disabled", !(event.detail.value && event.detail.value != ""));
      this.redeemButton?.setAttribute(
        "play-error-sound",
        (!(event.detail.value && event.detail.value != "")).toString()
      );
    });
    const cancelButton = this.Root.querySelector(".cancel");
    if (cancelButton) {
      cancelButton.addEventListener("action-activate", this.cancelButtonListener);
    }
    engine.on("RedeemCodeEventUpdate", this.onCodesRedeemUpdate, this);
  }
  onDetach() {
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    const cancelButton = this.Root.querySelector(".cancel");
    cancelButton?.removeEventListener("action-activate", this.cancelButtonListener);
    super.onDetach();
    engine.off("RedeemCodeEventUpdate", this.onCodesRedeemUpdate, this);
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    NavTray.clear();
    this.redeemButton?.classList.toggle(
      "disabled",
      !(this.codeTextbox?.nodeValue && this.codeTextbox.nodeValue != "")
    );
    const rulesContainer = this.Root.querySelector(".rules-container");
    if (rulesContainer) {
      FocusManager.get().setFocus(rulesContainer);
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
        if (this.redeemButton?.classList.contains("disabled")) {
          Audio.playSound("data-audio-error-press");
        } else {
          Audio.playSound("data-audio-primary-button-press");
        }
        this.executeCodeRedemption();
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
        break;
    }
  }
}
Controls.define("screen-twok-code-redemption", {
  createInstance: Panel2KCodeRedemption,
  description: "Handles code redemption.",
  classNames: ["twok-code-redemption"],
  styles: [styles],
  innerHTML: [$2kCodeRedemptionContent],
  attributes: []
});
Controls.define("screen-twok-code-redemption-generic", {
  createInstance: Panel,
  description: "Handles code redemption response.",
  classNames: ["twok-code-redemption-response-generic"],
  styles: [$2kCodeRedemptionResponseGenericStyles],
  innerHTML: [$2kCodeRedemptionResponseGenericContent],
  attributes: []
});
//# sourceMappingURL=2k-code-redemption.js.map

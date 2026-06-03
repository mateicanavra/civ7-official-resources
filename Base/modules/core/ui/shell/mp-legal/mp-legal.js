import { Audio } from '../../audio-base/audio-support.js';
import ContextManager from '../../context-manager/context-manager.js';
import { DialogBoxManager } from '../../dialog-box/manager-dialog-box.js';
import { MainMenuReturnEvent } from '../../events/shell-events.js';
import NavTray from '../../navigation-tray/model-navigation-tray.js';
import Panel from '../../panel-support.js';
import { MustGetElement } from '../../utilities/utilities-dom.js';
import { parseLegalDocument } from '../../utilities/utilities-liveops.js';
import { LoginResults } from '../../utilities/utilities-network-constants.js';
import { FocusManager } from '../../../ui-next/services/focus-manager.js';
import content from './mp-legal.html.js';
import styles from './mp-legal.scss.js';

const LegalDocsPlacementAcceptName = "AcceptLegalDocuments";
const LegalDocsPlacementReviewName = "ReviewLegalDocuments";
const LegalDocsAcceptedEventName = "legalDocsAccepted";
class LegalDocsAcceptedEvent extends CustomEvent {
  constructor(detail) {
    super(LegalDocsAcceptedEventName, { bubbles: false, cancelable: true, detail });
  }
}
class MpLegal extends Panel {
  documents = [];
  currentDocument = 0;
  engineInputListener = this.onEngineInput.bind(this);
  navigateInputListener = this.onNavigateInput.bind(this);
  legalDocumentAcceptedResultListener = this.onServerAcceptResults.bind(this);
  legalScrollableView;
  textField = null;
  textTitle = null;
  scrollable = null;
  acceptListener = this.acceptDocument.bind(this);
  cancelListener = this.onCancel.bind(this);
  nextListener = this.nextDocument.bind(this);
  previousListener = this.previousDocument.bind(this);
  acceptButton;
  cancelButton;
  nextButton;
  previousButton;
  forwardControllerSound = "data-audio-primary-button-press";
  backwardControllerSound = "data-audio-error-press";
  viewOnly = false;
  isGameCenter = Network.getLocalHostingPlatform() == HostingType.HOSTING_TYPE_GAMECENTER;
  onInitialize() {
    this.acceptButton = MustGetElement(".button-accept", this.Root);
    this.cancelButton = MustGetElement(".button-cancel", this.Root);
    this.nextButton = MustGetElement(".button-next", this.Root);
    this.previousButton = MustGetElement(".button-previous", this.Root);
    this.scrollable = MustGetElement(".mp-legal__scrollable", this.Root);
    this.textField = MustGetElement(".mp-legal__content", this.Root);
    const scrollable = MustGetElement(".mp-legal__scrollable", this.Root);
    scrollable.whenComponentCreated((component) => {
      component.setEngineInputProxy(this.Root);
    });
    if (!this.isGameCenter) {
      scrollable.classList.add("mp-legal__scrollable-regular-height");
    } else {
      const frame = MustGetElement("#screen-legal", this.Root);
      frame.setAttribute("frame-style", "modal");
      frame.classList.add("mp-legal__frame-small-width");
      const buttonContainer = MustGetElement(".mp-legal-button-container", this.Root);
      buttonContainer.classList.add("mt-8");
      this.textField.classList.add("text-center");
      this.Root.classList.add("flex", "items-center", "justify-center");
    }
  }
  /** Callback for when the HTML content for this screen has been loaded and DOM is ready. */
  onAttach() {
    super.onAttach();
  }
  setPanelOptions(options) {
    const legalOptions = options;
    if (legalOptions) {
      this.viewOnly = legalOptions.viewOnly;
      this.acceptButton.classList.toggle("hidden", this.viewOnly);
      this.nextButton.classList.toggle("hidden", this.isGameCenter || !this.viewOnly);
      this.previousButton.classList.toggle("hidden", this.isGameCenter || !this.viewOnly);
      this.cancelButton.classList.toggle("hidden", !this.viewOnly);
      this.documents = Network.getCachedLegalDocuments();
      this.currentDocument = 0;
      this.Root.addEventListener("engine-input", this.engineInputListener);
      this.Root.addEventListener("navigate-input", this.navigateInputListener);
      this.acceptButton.addEventListener("action-activate", this.acceptListener);
      this.cancelButton.addEventListener("action-activate", this.cancelListener);
      this.nextButton.addEventListener("action-activate", this.nextListener);
      this.previousButton.addEventListener("action-activate", this.previousListener);
      this.textTitle = MustGetElement(".mp-legal__title", this.Root);
      this.refreshDocument();
      this.updateButtonState();
      this.legalScrollableView = MustGetElement(".mp-legal__scrollable", this.Root);
      if (this.documents.length == 0) {
        const unavailableText = document.createElement("div");
        unavailableText.setAttribute("data-l10n-id", "LOC_OPTIONS_GFX_UNAVAILABLE");
        unavailableText.classList.value = "font-body-base self-center";
        this.legalScrollableView.appendChild(unavailableText);
        this.nextButton.classList.add("hidden");
        this.previousButton.classList.add("hidden");
      }
    }
    this.updateNavTray();
  }
  onDetach() {
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    this.Root.removeEventListener("navigate-input", this.navigateInputListener);
    super.onDetach();
    window.dispatchEvent(new MainMenuReturnEvent());
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    FocusManager.get().setFocus(this.Root);
    this.updateNavTray();
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  onCancel() {
    this.close();
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.isCancelInput() && this.viewOnly) {
      this.close();
      Audio.playSound("data-audio-primary-button-press");
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    } else if (inputEvent.detail.name == "accept" && !this.viewOnly) {
      this.acceptDocument();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  onNavigateInput(navigationEvent) {
    if (this.viewOnly) {
      const direction = navigationEvent.getDirection();
      switch (direction) {
        case InputNavigationAction.PREVIOUS:
          if (navigationEvent.detail.status == InputActionStatuses.FINISH) {
            this.previousDocument();
          }
          navigationEvent.preventDefault();
          navigationEvent.stopImmediatePropagation();
          if (navigationEvent.detail.status == InputActionStatuses.START) {
            Audio.playSound(this.backwardControllerSound);
          }
          break;
        case InputNavigationAction.NEXT:
          if (navigationEvent.detail.status == InputActionStatuses.FINISH) {
            this.nextDocument();
          }
          navigationEvent.preventDefault();
          navigationEvent.stopImmediatePropagation();
          if (navigationEvent.detail.status == InputActionStatuses.START) {
            Audio.playSound(this.forwardControllerSound);
          }
          break;
      }
    }
  }
  refreshDocument() {
    if (this.textField && this.textTitle) {
      this.documents = Network.getLegalDocuments(
        this.viewOnly ? LegalDocsPlacementReviewName : LegalDocsPlacementAcceptName
      );
      if (this.documents) {
        if (this.documents.length > 0) {
          this.currentDocument = -1;
          for (let documentNum = 0; documentNum < this.documents.length; documentNum++) {
            if (this.documents[documentNum].state != LegalState.ACCEPT_CONFIRMED) {
              this.currentDocument = documentNum;
              break;
            }
          }
          if (this.viewOnly) {
            this.currentDocument = 0;
          }
          if (this.currentDocument == -1) {
            this.closePanel();
            return;
          }
          this.refreshCurrentDocument();
        } else {
          this.closePanel();
        }
      } else {
        this.closePanel();
      }
    }
  }
  acceptDocument() {
    if (this.documents) {
      if (this.documents.length > 0) {
        engine.on("LegalDocumentAcceptedResult", this.legalDocumentAcceptedResultListener);
        Network.legalDocumentResponse(this.documents[this.currentDocument].documentId, true);
        window.dispatchEvent(new LegalDocsAcceptedEvent({ accepted: true }));
        return;
      }
    }
    this.closePanel();
  }
  nextDocument() {
    if (this.textField && this.textTitle) {
      if (this.documents) {
        if (this.documents.length > 1) {
          this.currentDocument++;
          this.backwardControllerSound = "data-audio-primary-button-press";
          if (this.currentDocument == this.documents.length) {
            this.currentDocument = this.documents.length - 1;
          }
          if (this.currentDocument >= this.documents.length - 1) {
            this.forwardControllerSound = "data-audio-error-press";
          } else {
            this.forwardControllerSound = "data-audio-primary-button-press";
          }
          this.refreshCurrentDocument();
          this.updateButtonState();
        }
      }
    }
  }
  previousDocument() {
    if (this.textField && this.textTitle) {
      if (this.documents) {
        if (this.documents.length > 1) {
          this.currentDocument--;
          this.forwardControllerSound = "data-audio-primary-button-press";
          if (this.currentDocument < 0) {
            this.currentDocument = 0;
          }
          if (this.currentDocument <= 0) {
            this.backwardControllerSound = "data-audio-error-press";
          } else {
            this.backwardControllerSound = "data-audio-primary-button-press";
          }
          this.refreshCurrentDocument();
          this.updateButtonState();
        }
      }
    }
  }
  refreshCurrentDocument() {
    if (this.scrollable) {
      this.scrollable.setAttribute("scrollpercent", "1");
      this.scrollable.setAttribute("scrollpercent", "0");
      this.scrollable.setAttribute("handle-gamepad-pan", "true");
    }
    this.acceptButton.setAttribute("caption", "LOC_TUTORIAL_NEXT_PAGE");
    const privacyInstructions = MustGetElement(".mp-legal-privacy-notice-instructions", this.Root);
    if (this.documents[this.currentDocument].type == 2 && !this.viewOnly) {
      privacyInstructions.classList.remove("hidden");
    } else {
      privacyInstructions.classList.add("hidden");
      if (this.documents[this.currentDocument].type == 1 && !this.viewOnly) {
        this.acceptButton.setAttribute("caption", "LOC_GENERIC_ACCEPT");
      }
    }
    if (this.isGameCenter) {
      const header = document.createElement("fxs-header");
      header.setAttribute("filigree-style", "h2");
      header.setAttribute("title", this.documents[this.currentDocument].title);
      header.classList.add("font-title-xl", "text-secondary");
      if (this.textTitle?.firstChild) {
        this.textTitle.removeChild(this.textTitle.firstChild);
      }
      this.textTitle.appendChild(header);
      this.textField.innerHTML = this.documents[this.currentDocument].content;
    } else {
      this.textTitle.setAttribute("data-l10n-id", this.documents[this.currentDocument].title);
      parseLegalDocument(this.textField, this.documents[this.currentDocument].content);
    }
    this.updateNavTray();
  }
  onServerAcceptResults(data) {
    engine.off("LegalDocumentAcceptedResult", this.legalDocumentAcceptedResultListener);
    if (data.data == LoginResults.SUCCESS) {
      this.currentDocument = -1;
      for (let documentNum = 0; documentNum < this.documents.length; documentNum++) {
        if (this.documents[documentNum].state != LegalState.ACCEPT_CONFIRMED) {
          this.currentDocument = documentNum;
          break;
        }
      }
      if (this.currentDocument != -1) {
        this.refreshDocument();
      } else {
        this.close();
      }
    } else {
      DialogBoxManager.createDialog_Confirm({
        body: Locale.compose("LOC_UI_LEGAL_ERROR", data.data),
        title: "LOC_UI_LEGAL_ACCEPT"
      });
    }
  }
  closePanel() {
    ContextManager.popUntil("main-menu");
    Audio.playSound("data-audio-popup-close");
    super.close();
  }
  updateButtonState() {
    if (this.viewOnly) {
      if (this.documents) {
        if (this.documents.length > 0) {
          if (this.currentDocument > 0) {
            this.previousButton.removeAttribute("disabled");
          } else {
            this.previousButton.setAttribute("disabled", "true");
          }
          if (this.currentDocument < this.documents.length - 1) {
            this.nextButton.removeAttribute("disabled");
          } else {
            this.nextButton.setAttribute("disabled", "true");
          }
        } else {
          this.previousButton.setAttribute("disabled", "true");
          this.nextButton.setAttribute("disabled", "true");
        }
      }
    } else {
      this.previousButton.classList.add("hidden");
      this.nextButton.classList.add("hidden");
    }
    this.updateNavTray();
  }
  updateNavTray() {
    NavTray.clear();
    if (this.documents) {
      if (this.documents.length > 0) {
        if (this.viewOnly) {
          NavTray.addOrUpdateCancel("LOC_GENERIC_BACK");
          if (this.currentDocument > 0) {
            NavTray.addOrUpdateNavPrevious("LOC_NAV_PREVIOUS");
          }
          if (this.currentDocument < this.documents.length - 1) {
            NavTray.addOrUpdateNavNext("LOC_NAV_NEXT");
          }
        } else {
          if (this.documents[this.currentDocument].type == 1) {
            NavTray.addOrUpdateAccept("LOC_GENERIC_ACCEPT");
          } else {
            NavTray.addOrUpdateAccept("LOC_TUTORIAL_NEXT_PAGE");
          }
        }
      }
    }
  }
}
Controls.define("screen-mp-legal", {
  createInstance: MpLegal,
  description: "Screen to review and accept 2K legal documents.",
  classNames: ["mp-legal", "fullscreen"],
  styles: [styles],
  innerHTML: [content]
});

export { LegalDocsAcceptedEvent, LegalDocsAcceptedEventName, LegalDocsPlacementAcceptName, LegalDocsPlacementReviewName };
//# sourceMappingURL=mp-legal.js.map

import { Framework } from '../../../core/ui/framework.js';
import Panel from '../../../core/ui/panel-support.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.js';
import { FocusManager } from '../../../core/ui-next/services/focus-manager.js';
import AgeProgressionPopupManager from './age-progression-warning-popup-manager.js';
import { instance } from '../civilopedia/model-civilopedia.js';
import content from './panel-age-progression-warning-popup.html.js';
import styles from './panel-age-progression-warning-popup.scss.js';

class PanelAgeProgressionWarningPopup extends Panel {
  onDetailsPressedListener = this.onDetailsPressed.bind(this);
  onContinuePressedListener = this.onContinuePressed.bind(this);
  engineInputListener = this.onEngineInput.bind(this);
  description;
  turnsRemainingText;
  detailsButton;
  continueButton;
  textScrollable;
  onInitialize() {
    this.description = MustGetElement(".progress-warning_description", this.Root);
    this.turnsRemainingText = MustGetElement(".progress-warning_turns-remaining", this.Root);
    this.detailsButton = MustGetElement(".progress-warning_details-button", this.Root);
    this.continueButton = MustGetElement(".progress-warning_continue-button", this.Root);
    this.textScrollable = MustGetElement(".progress-warning__scrollable", this.Root);
    this.Root.setAttribute("data-audio-group-ref", "age-progression-warning");
    this.enableOpenSound = true;
    this.enableCloseSound = true;
  }
  onAttach() {
    super.onAttach();
    this.detailsButton.addEventListener("action-activate", this.onDetailsPressedListener);
    this.continueButton.addEventListener("action-activate", this.onContinuePressedListener);
    this.Root.addEventListener("engine-input", this.engineInputListener.bind(this));
    this.detailsButton.setAttribute(
      "caption",
      Locale.stylize("LOC_LEGACY_PATH_VIEW_DETAILS", "ADVISOR_CIVILOPEDIA")
    );
    this.turnsRemainingText.innerHTML = Locale.compose(
      "LOC_UI_X_TURNS",
      AgeProgressionPopupManager.currentAgeProgressionPopupData?.turnsRemaining ?? -1
    );
    this.textScrollable.whenComponentCreated((c) => c.setEngineInputProxy(this.Root));
    if (Game.AgeProgressManager.isFinalAge) {
      this.description.setAttribute("data-l10n-id", "LOC_AGE_END_WARNING_DESC_FINAL_AGE");
    } else {
      this.description.setAttribute("data-l10n-id", "LOC_AGE_END_WARNING_DESC");
    }
  }
  onDetach() {
    AgeProgressionPopupManager.closePopup();
    this.Root.removeEventListener("engine-input", this.engineInputListener.bind(this));
    super.onDetach();
  }
  onDetailsPressed() {
    this.close();
    if (Game.AgeProgressManager.isFinalAge) {
      const pediaPage = instance.getPage("AGES", "AGES_8");
      if (!pediaPage) {
        console.error(
          `panel-age-progression-warning-popup: onDetailsPressed - no pedia page found for section "AGES" and page "AGES_8"!`
        );
        return;
      }
      instance.navigateTo(pediaPage);
    } else {
      const pediaPage = instance.getPage("AGES", "AGES_1");
      if (!pediaPage) {
        console.error(
          `panel-age-progression-warning-popup: onDetailsPressed - no pedia page found for section "AGES" and page "AGES_1"!`
        );
        return;
      }
      instance.navigateTo(pediaPage);
    }
    Framework.ContextManager.push("screen-civilopedia", { singleton: true, createMouseGuard: true });
  }
  onContinuePressed() {
    this.close();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    const detailsButton = MustGetElement(".progress-warning__button-container", this.Root);
    FocusManager.get().setFocus(detailsButton);
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.detail.name == "mousebutton-right") {
      this.close();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
}
Controls.define("panel-age-progression-warning-popup", {
  createInstance: PanelAgeProgressionWarningPopup,
  description: "Displays a warning that the age is about to end.",
  innerHTML: [content],
  styles: [styles],
  tabIndex: -1
});
//# sourceMappingURL=panel-age-progression-warning-popup.js.map

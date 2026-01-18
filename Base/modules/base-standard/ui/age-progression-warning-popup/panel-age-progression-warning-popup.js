import { F as Framework } from '../../../core/ui/framework.chunk.js';
import FocusManager from '../../../core/ui/input/focus-manager.js';
import { P as Panel } from '../../../core/ui/panel-support.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { a as AgeProgressionPopupManager } from './age-progression-warning-popup-manager.chunk.js';
import { instance } from '../civilopedia/model-civilopedia.chunk.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/views/view-manager.chunk.js';

const content = "<fxs-modal-frame data-modal-style=\"special\">\r\n\t<fxs-header\r\n\t\tclass=\"font-title-sm mx-4\"\r\n\t\ttitle=\"LOC_AGE_END_WARNING_TITLE\"\r\n\t\tfiligree-style=\"small\"\r\n\t></fxs-header>\r\n\t<div class=\"relative flex items-center justify-center\">\r\n\t\t<div class=\"absolute inset-0 flex items-center justify-center\">\r\n\t\t\t<img src=\"fs://game/popup_icon_glow\" />\r\n\t\t</div>\r\n\t\t<div class=\"absolute inset-x-0 flex justify-between\">\r\n\t\t\t<div class=\"img-popup-icon-decor\"></div>\r\n\t\t\t<div class=\"img-popup-icon-decor -scale-x-100\"></div>\r\n\t\t</div>\r\n\t\t<div class=\"relative size-38\">\r\n\t\t\t<div class=\"absolute inset-0 size-38 img-popup-icon-wood-bk\"></div>\r\n\t\t\t<div class=\"progress-warning__icon absolute inset-3\\.5\"></div>\r\n\t\t</div>\r\n\t</div>\r\n\t<div class=\"img-popup-header-bk w-full\">\r\n\t\t<div class=\"mt-6 mb-7\">\r\n\t\t\t<div class=\"progress-warning_turns-remaining text-center font-body-2xl uppercase text-shadow\"></div>\r\n\t\t\t<div\r\n\t\t\t\tdata-l10n-id=\"LOC_UI_GAME_UNTIL_END_OF_AGE\"\r\n\t\t\t\tclass=\"text-center\"\r\n\t\t\t></div>\r\n\t\t</div>\r\n\t</div>\r\n\t<fxs-inner-frame class=\"mx-4 my-2 p-6 text-primary-1 shrink\">\r\n\t\t<div class=\"absolute -top-1\\.5 img-popup-middle-decor\"></div>\r\n\t\t<fxs-scrollable\r\n\t\t\tclass=\"progress-warning__scrollable\"\r\n\t\t\tattached-scrollbar=\"true\"\r\n\t\t\thandle-gamepad-pan=\"true\"\r\n\t\t>\r\n\t\t\t<span class=\"progress-warning_description text-accent-3 text-base\"></span>\r\n\t\t</fxs-scrollable>\r\n\t</fxs-inner-frame>\r\n\t<fxs-vslot class=\"progress-warning__button-container\">\r\n\t\t<fxs-button\r\n\t\t\tcaption=\"LOC_LEGACY_PATH_VIEW_DETAILS\"\r\n\t\t\tclass=\"progress-warning_details-button mx-4 mb-2\"\r\n\t\t></fxs-button>\r\n\t\t<fxs-button\r\n\t\t\tcaption=\"LOC_GENERIC_CONTINUE\"\r\n\t\t\tclass=\"progress-warning_continue-button mx-4 mb-2\"\r\n\t\t></fxs-button>\r\n\t</fxs-vslot>\r\n</fxs-modal-frame>\r\n";

const styles = "fs://game/base-standard/ui/age-progression-warning-popup/panel-age-progression-warning-popup.css";

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
    FocusManager.setFocus(detailsButton);
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

import FocusManager from '../../../core/ui/input/focus-manager.js';
import { b as InputEngineEventName } from '../../../core/ui/input/input-support.chunk.js';
import { N as NavTray } from '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel } from '../../../core/ui/panel-support.chunk.js';
import { HidePlotTooltipEvent, ShowPlotTooltipEvent } from '../../../core/ui/tooltips/tooltip-manager.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { HideMiniMapEvent } from '../mini-map/panel-mini-map.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../../core/ui/input/plot-cursor.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/utilities/utilities-layout.chunk.js';
import '../../../core/ui/input/focus-support.chunk.js';
import '../../../core/ui/components/fxs-slot.chunk.js';
import '../../../core/ui/spatial/spatial-manager.js';
import '../../../core/ui/lenses/lens-manager.chunk.js';
import '../../../core/ui/shell/mp-staging/mp-friends.js';
import '../../../core/ui/shell/mp-staging/model-mp-friends.chunk.js';
import '../../../core/ui/social-notifications/social-notifications-manager.js';
import '../../../core/ui/utilities/utilities-liveops.js';
import '../../../core/ui/utilities/utilities-network.js';
import '../../../core/ui/shell/mp-legal/mp-legal.js';
import '../../../core/ui/events/shell-events.chunk.js';
import '../../../core/ui/utilities/utilities-network-constants.chunk.js';
import '../../../core/ui/utilities/utilities-core-databinding.chunk.js';

const content = "<fxs-subsystem-frame\r\n\tclass=\"pantheon-frame items-center shrink pointer-events-auto\"\r\n\ttabindex=\"-1\"\r\n\tbackDrop=\"fs://game/pant_altarbg.png\"\r\n>\r\n\t<div\r\n\t\tclass=\"flex flex-col items-center\"\r\n\t\tdata-slot=\"header\"\r\n\t>\r\n\t\t<fxs-header\r\n\t\t\tclass=\"tracking-150 justify-center flex w-96\"\r\n\t\t\ttitle=\"LOC_BELIEF_CLASS_PANTHEON_NAME\"\r\n\t\t\tdata-slot=\"header\"\r\n\t\t></fxs-header>\r\n\t\t<p\r\n\t\t\tclass=\"pantheon-chooser_your-pantheon mt-8 mb-3 text-center font-body-base text-accent-2\"\r\n\t\t\tdata-slot=\"header\"\r\n\t\t></p>\r\n\t</div>\r\n\t<div class=\"pantheon-finished-container mx-6 flex items-center flex-col flex-auto relative\"></div>\r\n</fxs-subsystem-frame>\r\n";

const styles = "fs://game/base-standard/ui/pantheon-complete/panel-pantheon-complete.css";

class ScreenPantheonComplete extends Panel {
  engineInputListener = this.onEngineInput.bind(this);
  pantheonFrame;
  yourPantheonText;
  onInitialize() {
    this.pantheonFrame = MustGetElement(".pantheon-frame", this.Root);
    this.yourPantheonText = MustGetElement(".pantheon-chooser_your-pantheon", this.Root);
    this.enableOpenSound = true;
    this.enableCloseSound = true;
  }
  onAttach() {
    this.playAnimateInSound();
    window.dispatchEvent(new HidePlotTooltipEvent());
    window.dispatchEvent(new HideMiniMapEvent(true));
    this.Root.addEventListener(InputEngineEventName, this.engineInputListener);
    this.pantheonFrame.addEventListener("subsystem-frame-close", () => {
      this.close();
    });
    const player = Players.get(GameContext.localPlayerID);
    if (!player) {
      console.error("panel-pantheon-complete: onAttach() - no local player found!");
      return;
    }
    const playerReligion = player.Religion;
    if (!playerReligion) {
      console.error("panel-pantheon-complete: onAttach() - no player religion found!");
      return;
    }
    this.yourPantheonText.innerHTML = Locale.compose(
      "LOC_UI_PANTHEON_YOUR_PANTHEON",
      playerReligion.getNumPantheons()
    );
    const playerPantheons = playerReligion.getPantheons();
    for (const pantheon of playerPantheons) {
      const pantheonDef = GameInfo.Beliefs.lookup(pantheon);
      if (!pantheonDef) {
        console.error(
          `panel-pantheon-complete: displayPantheonChoices() - No belief def found for type ${pantheon}`
        );
        continue;
      }
      const pantheonListContainer = MustGetElement(".pantheon-finished-container", this.Root);
      const pantheonListContainerItem = document.createElement("div");
      pantheonListContainerItem.classList.value = "pantheon-list-container-item max-w-72 flex flex-col items-center mt-4";
      const pantheonIconContainer = document.createElement("div");
      pantheonIconContainer.classList.value = "pantheon-list-container_icon flex items-center justify-center pointer-events-none bg-cover m-3";
      pantheonListContainerItem.appendChild(pantheonIconContainer);
      const pantheonIcon = document.createElement("div");
      pantheonIcon.classList.value = "pantheon-list-container_icon-image relative flex flex-col items-center size-14 bg-center";
      pantheonIcon.style.backgroundImage = UI.getIconCSS(pantheonDef.BeliefType, "PANTHEONS");
      pantheonIconContainer.appendChild(pantheonIcon);
      const pantheonListTitle = document.createElement("p");
      pantheonListTitle.classList.value = "pantheon-list_title font-title-base text-accent-2";
      pantheonListTitle.setAttribute("data-l10n-id", pantheonDef.Name);
      pantheonListContainerItem.appendChild(pantheonListTitle);
      const pantheonListDescription = document.createElement("div");
      pantheonListDescription.role = "paragraph";
      pantheonListDescription.classList.value = "pantheon-list_desc font-body-sm text-center flex flex-col text-accent-3 pointer-events-auto";
      pantheonListDescription.setAttribute("data-l10n-id", pantheonDef.Description);
      pantheonListContainerItem.appendChild(pantheonListDescription);
      pantheonListContainer.appendChild(pantheonListContainerItem);
      FocusManager.setFocus(this.Root);
    }
  }
  onDetach() {
    this.Root.removeEventListener(InputEngineEventName, this.engineInputListener);
    window.dispatchEvent(new ShowPlotTooltipEvent());
    window.dispatchEvent(new HideMiniMapEvent(false));
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    NavTray.clear();
    NavTray.addOrUpdateGenericBack();
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.isCancelInput() || inputEvent.detail.name == "sys-menu") {
      this.close();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
}
Controls.define("panel-pantheon-complete", {
  createInstance: ScreenPantheonComplete,
  description: "Screen to display pantheon choices after choosing them.",
  classNames: ["screen-pantheon-complete", "absolute", "pointer-events-none", "flex"],
  innerHTML: [content],
  styles: [styles],
  attributes: []
});
//# sourceMappingURL=panel-pantheon-complete.js.map

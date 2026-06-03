import { createSignal } from '../../../../core/vendor/solid-js/dist/solid.js';
import { render } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { InterfaceMode } from '../../../../core/ui/interface-modes/interface-modes.js';
import Panel from '../../../../core/ui/panel-support.js';
import { PauseMenu } from './pause-menu.js';

class ScreenPauseMenuBootstrap extends Panel {
  dispose = null;
  onInitialize() {
    this.enableOpenSound = true;
    this.enableCloseSound = true;
    this.Root.setAttribute("data-audio-group-ref", "pause-menu");
  }
  onEngineInput(event) {
    if (event.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (event.detail.name === "sys-menu" || event.detail.name === "keyboard-escape") {
      InterfaceMode.switchToDefault();
    }
  }
  onAttach() {
    Input.setActiveContext(InputContext.Shell);
    super.onAttach();
    this.Root.classList.add("w-full", "h-full");
    this.dispose = render(() => {
      const [_ref, setRef] = createSignal();
      return PauseMenu({ ref: setRef });
    }, this.Root);
  }
  onDetach() {
    super.onDetach();
    if (this.dispose) {
      this.dispose();
      this.dispose = null;
    }
  }
}
Controls.define("screen-pause-menu-bootstrap", {
  createInstance: ScreenPauseMenuBootstrap,
  description: "Pause Menu"
});

export { ScreenPauseMenuBootstrap };
//# sourceMappingURL=pause-menu-bootstrap.js.map

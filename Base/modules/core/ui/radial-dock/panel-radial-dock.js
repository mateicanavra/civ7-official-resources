import { P as Panel } from '../panel-support.chunk.js';
import { MustGetElement } from '../utilities/utilities-dom.chunk.js';
import { L as Layout } from '../utilities/utilities-layout.chunk.js';
import '../framework.chunk.js';

class PanelRadialDock extends Panel {
  SMALL_SCREEN_MODE_MAX_HEIGHT = 768;
  SMALL_SCREEN_MODE_MAX_WIDTH = 1800;
  container;
  navHelpContainer;
  resizeListener = this.onResize.bind(this);
  inputContextChangedListener = this.onInputContextChanged.bind(this);
  onInitialize() {
    super.onInitialize();
    this.Root.innerHTML = `
			<div class="panel-radial-dock__container relative w-96 h-24">
				<div class="absolute inset-0 flow-row -top-2\\.5 bottom-2\\.5">
					<div class="img-hud-dock flex-auto mt-px"></div>
					<div class="img-hud-dock -rotate-y-180 flex-auto mt-px"></div>
				</div>
				<div class="absolute inset-0 -top-2\\.5 bottom-2\\.5 px-18 pb-2 flow-row justify-center items-center">
					<div class="nav-help-container">
						<fxs-nav-help action-key="inline-toggle-radial-menu"></fxs-nav-help>
					</div>
					<div class="shrink leading-none">
						<div class="font-title-lg text-center" data-l10n-id="LOC_RADIAL_MENU_TITLE_TEXT"></div>
					</div>
				</div>
			</div>
		`;
    this.container = MustGetElement(".panel-radial-dock__container", this.Root);
    this.navHelpContainer = MustGetElement(".nav-help-container", this.Root);
    this.updateContainer();
  }
  onAttach() {
    window.addEventListener("resize", this.resizeListener);
    engine.on("InputContextChanged", this.inputContextChangedListener);
  }
  onDetach() {
    window.removeEventListener("resize", this.resizeListener);
    engine.off("InputContextChanged", this.inputContextChangedListener);
  }
  isScreenSmallMode() {
    return window.innerHeight <= Layout.pixelsToScreenPixels(this.SMALL_SCREEN_MODE_MAX_HEIGHT) || window.innerWidth <= Layout.pixelsToScreenPixels(this.SMALL_SCREEN_MODE_MAX_WIDTH);
  }
  onInputContextChanged(contextData) {
    if (contextData.newContext != InputContext.Dual) {
      this.navHelpContainer.classList.remove("hidden");
    } else {
      this.navHelpContainer.classList.add("hidden");
    }
  }
  onResize() {
    this.updateContainer();
  }
  updateContainer() {
    this.container.classList.toggle("hidden", this.isScreenSmallMode());
  }
}
Controls.define("panel-radial-dock", {
  createInstance: PanelRadialDock,
  description: "Radial dock area showing nav hint info.",
  classNames: ["panel-radial-dock", "fxs-nav-help"],
  attributes: []
});
//# sourceMappingURL=panel-radial-dock.js.map

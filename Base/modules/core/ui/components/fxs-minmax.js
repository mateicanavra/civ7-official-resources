import { FxsActivatable } from './fxs-activatable.js';

class FxsMinMaxButton extends FxsActivatable {
  arrowIsUp = true;
  mouseEnterEventListener = this.onMouseEnter.bind(this);
  mouseLeaveEventListener = this.onMouseLeave.bind(this);
  actionActivateEventListener = this.onActionActivate.bind(this);
  get disabled() {
    return this.Root.classList.contains("disabled");
  }
  constructor(root) {
    super(root);
    this.toggle(this.Root.classList.contains("minmax-button--up"));
  }
  onMouseEnter() {
    if (this.disabled) {
      UI.setCursorByType(UIHTMLCursorTypes.NotAllowed);
    }
  }
  onMouseLeave() {
    if (this.disabled) {
      UI.setCursorByType(UIHTMLCursorTypes.Default);
    }
  }
  onActionActivate() {
    if (this.disabled) {
      return;
    }
    this.toggle();
  }
  toggle(force = void 0) {
    this.arrowIsUp = force ?? !this.arrowIsUp;
    this.Root.classList.toggle("minmax-button--up", this.arrowIsUp);
  }
  onInitialize() {
    super.onInitialize();
    this.render();
  }
  onAttach() {
    super.onAttach();
    this.Root.addEventListener("mouseenter", this.mouseEnterEventListener);
    this.Root.addEventListener("mouseleave", this.mouseLeaveEventListener);
    this.Root.addEventListener("action-activate", this.actionActivateEventListener);
  }
  onDetach() {
    this.Root.removeEventListener("mouseenter", this.mouseEnterEventListener);
    this.Root.removeEventListener("mouseleave", this.mouseLeaveEventListener);
    this.Root.removeEventListener("action-activate", this.actionActivateEventListener);
    super.onDetach();
  }
  render() {
    this.Root.innerHTML = `
			<div class="minmax-button__shadow"></div>
			<div class="minmax-button__bg absolute inset-0"></div>
			<div class="minmax-button__highlight absolute inset-0"></div>
			<div class="minmax-button__arrow"></div>
			<div class="minmax-button__arrow minmax-button__arrow--highlight"></div>
			<div class="minmax-button__overlay absolute inset-0"></div>
		`;
  }
}
Controls.define("fxs-minmax-button", {
  createInstance: FxsMinMaxButton,
  description: "",
  classNames: ["fxs-minmax-button"],
  tabIndex: -1
});

export { FxsMinMaxButton };
//# sourceMappingURL=fxs-minmax.js.map

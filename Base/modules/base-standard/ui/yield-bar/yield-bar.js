import YieldBar from './model-yield-bar.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';

class YieldBarComponent extends Component {
  yieldBarUpdateListener = this.render.bind(this);
  onInitialize() {
    YieldBar.yieldBarUpdateEvent.on(this.yieldBarUpdateListener);
  }
  onAttach() {
    this.render();
  }
  onDetach() {
    YieldBar.yieldBarUpdateEvent.off(this.yieldBarUpdateListener);
  }
  render() {
    this.Root.innerHTML = "";
    for (const yieldData of YieldBar.cityYields) {
      const yieldDiv = document.createElement("div");
      yieldDiv.classList.add("flex", "flex-col", "mx-2");
      this.Root.appendChild(yieldDiv);
      const yieldIcon = document.createElement("fxs-icon");
      yieldIcon.classList.add("size-8");
      yieldIcon.setAttribute("data-icon-id", yieldData.type);
      yieldDiv.appendChild(yieldIcon);
      const yieldValue = document.createElement("div");
      yieldValue.classList.add("self-center");
      yieldValue.textContent = Locale.compose("LOC_UI_YIELD_ONE_DECIMAL_NO_PLUS", yieldData.value);
      yieldDiv.appendChild(yieldValue);
    }
  }
}
Controls.define("yield-bar", {
  createInstance: YieldBarComponent,
  description: "Displays a cities current yields",
  classNames: ["flex", "self-center"]
});
//# sourceMappingURL=yield-bar.js.map

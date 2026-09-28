class TownUnrestDisplay extends Component {
  // #region Component State
  get highestActiveUnrestDuration() {
    const attr = this.Root.getAttribute("data-highest-active-unrest-duration");
    return attr ? parseInt(attr) : 0;
  }
  get turnsOfUnrest() {
    const attr = this.Root.getAttribute("data-turns-of-unrest");
    return attr ? parseInt(attr) : 0;
  }
  // #endregion
  // #region Element References
  sliderFillElement = document.createElement("div");
  remainingTurnsElement = document.createElement("div");
  // #endregion
  onInitialize() {
    super.onInitialize();
    this.render();
  }
  onAttributeChanged(name, _oldValue, _newValue) {
    switch (name) {
      case "data-turns-of-unrest":
      case "data-highest-active-unrest-duration":
        this.updateUnrestDisplay(this.turnsOfUnrest, this.highestActiveUnrestDuration);
        break;
      default:
        break;
    }
  }
  updateUnrestDisplay(turnsOfUnrest, highestActiveUnrestDuration) {
    if (highestActiveUnrestDuration != 0) {
      const pct = Math.max(0, Math.min(1, turnsOfUnrest / highestActiveUnrestDuration));
      this.sliderFillElement.style.transform = `scaleX(${pct})`;
    } else {
      this.sliderFillElement.style.transform = `none`;
    }
    const turnsRemaining = Math.max(0, turnsOfUnrest);
    this.remainingTurnsElement.textContent = Locale.compose(
      "LOC_UI_PRODUCTION_UNREST_TURNS_REMAINING",
      turnsRemaining
    );
  }
  render() {
    this.Root.classList.add("flex", "flex-col", "items-center", "justify-center", "px-2");
    this.Root.innerHTML = `
			<div class="font-title font-bold text-lg mt-2 uppercase pulse-warn" data-l10n-id="LOC_UI_PRODUCTION_UNREST"></div>
		`;
    const slider = document.createElement("div");
    slider.classList.add("w-full", "h-1\\.5", "mb-2", "mt-2", "town-unrest-bg");
    this.sliderFillElement.classList.add("size-full", "origin-left", "town-unrest-fill", "transition-transform");
    slider.appendChild(this.sliderFillElement);
    this.Root.append(slider, this.remainingTurnsElement);
  }
}
Controls.define("town-unrest-display", {
  createInstance: TownUnrestDisplay,
  attributes: [{ name: "data-turns-of-unrest" }, { name: "data-highest-active-unrest-duration" }]
});

export { TownUnrestDisplay };
//# sourceMappingURL=town-unrest-display.js.map

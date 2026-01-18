class CivSelectBonus extends Component {
  bonusData = null;
  onInitialize() {
    super.onInitialize();
    this.Root.classList.add("flex", "flex-row", "item-center", "justify-center");
    this.Root.innerHTML = `
			<div class="img-simple-square size-18 mr-3\\.5">
				<fxs-icon class="size-18" data-icon-id="${this.bonusData.icon}" data-icon-context="CIV_BONUS"></fxs-icon>
			</div>
			<div role="paragraph" class="flex flex-col flex-auto pointer-events-auto">
				<fxs-header class="font-title-base uppercase" title="${this.bonusData.title}" filigree-style="none"></fxs-header>
				<div class="font-body-sm text-accent-2">${this.bonusData.text}</div>
			</div>
		`;
  }
  setBonusData(bonusData) {
    this.bonusData = bonusData;
  }
}
Controls.define("civ-select-bonus", {
  createInstance: CivSelectBonus,
  description: "Displays a civ bonus"
});

export { CivSelectBonus };
//# sourceMappingURL=civ-select-bonus.js.map

class FxsOrnament1 extends Component {
  onAttach() {
    super.onAttach();
    this.Root.innerHTML = `<div class='ornamentcontainer'>
		<div class='left'></div>
		<div class='right'></div>
		</div>`;
  }
}
Controls.define("fxs-ornament1", {
  createInstance: FxsOrnament1,
  description: "Ornament style 1, centered with curls and hex.",
  classNames: ["fxs-ornament1"],
  attributes: []
});
class FxsOrnament2 extends Component {
  onAttach() {
    super.onAttach();
    this.Root.innerHTML = `<img src='fs://game/core/ui/themes/default/img/Ornament_centerDivider_withHex.png'>`;
  }
}
Controls.define("fxs-ornament2", {
  createInstance: FxsOrnament2,
  description: "Ornament style 2, centered hex with flat wings fading to transparent.",
  classNames: ["fxs-ornament2"],
  attributes: []
});
class FxsOrnament3 extends Component {
  onAttach() {
    super.onAttach();
    this.Root.innerHTML = `<div class='ornamentcontainer'>
		<div class='left'></div>
		<div class='right'></div>
		</div>`;
  }
}
Controls.define("fxs-ornament3", {
  createInstance: FxsOrnament3,
  description: "Ornament style 3, simple centered line fading wings to transparent.",
  classNames: ["fxs-ornament3"],
  attributes: []
});

export { FxsOrnament1, FxsOrnament2, FxsOrnament3 };
//# sourceMappingURL=fxs-ornaments.js.map

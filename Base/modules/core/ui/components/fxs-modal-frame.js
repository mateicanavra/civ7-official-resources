class FxsModalFrame extends Component {
  _content = null;
  get content() {
    if (!this._content) {
      this._content = document.createElement(this.contentAs);
      this._content.className = this.contentClass;
      this.Root.appendChild(this._content);
    }
    return this._content;
  }
  contentAs = "div";
  contentClass = "";
  get modalStyle() {
    const modalStyle = this.Root.dataset.modalStyle;
    if (modalStyle === "generic" || modalStyle === "special" || modalStyle === "narrative" || modalStyle === "on-map") {
      return modalStyle;
    }
    return "generic";
  }
  onInitialize() {
    super.onInitialize();
    this.contentAs = this.Root.dataset.contentAs || this.contentAs;
    this.contentClass = this.Root.dataset.contentClass || this.contentClass;
    const originalfragment = document.createDocumentFragment();
    if (this.modalStyle == "on-map") {
      this.Root.classList.add("img-small-narrative-frame", "absolute", "w-full");
    }
    while (this.Root.hasChildNodes()) {
      const c = this.Root.firstChild;
      if (c) {
        originalfragment.appendChild(c);
      }
    }
    this.content.appendChild(originalfragment);
    this.render();
    this.content.classList.value = "flex flex-col flex-auto" + (this.contentClass ? " " + this.contentClass : "");
    this.Root.appendChild(this.content);
  }
  render() {
    this.Root.classList.add("relative", "flex", "flex-col", "max-w-full", "max-h-full", "pointer-events-auto");
    const modalStyle = this.modalStyle;
    if (modalStyle === "generic") {
      const backgroundStyle = this.Root.getAttribute("bg-style");
      this.Root.classList.add("p-8", backgroundStyle == "none" ? "" : "img-modal-frame");
      this.Root.insertAdjacentHTML(
        "afterbegin",
        `
				<div class="absolute top-2 left-2 bottom-0 w-1\\/2 img-frame-filigree pointer-events-none"></div>
				<div class="absolute top-2 right-2 bottom-0 w-1\\/2 rotate-y-180 img-frame-filigree pointer-events-none"></div>
			`
      );
    } else if (modalStyle === "narrative") {
      const backDropAttribute = this.Root.getAttribute("data-bg-image");
      const backgroundImageContainer = document.createElement("div");
      backgroundImageContainer.classList.value = "absolute size-full pointer-events-none";
      const bgImage = document.createElement("div");
      bgImage.classList.value = "img-narrative-frame-bg relative bg-no-repeat bg-cover grow";
      if (backDropAttribute) {
        bgImage.style.backgroundImage = backDropAttribute;
      }
      backgroundImageContainer.appendChild(bgImage);
      const overlay = document.createElement("div");
      overlay.classList.add("img-narrative-frame-overlay", "absolute", "inset-0");
      backgroundImageContainer.appendChild(overlay);
      this.Root.appendChild(backgroundImageContainer);
      const narrativeHeader = document.createElement("div");
      narrativeHeader.innerHTML = `
				<div class="narrative-header-container w-full">
					<div class="absolute flex -top-24 w-full justify-center">
						<div class="absolute top-2 left-0 bottom-0 w-1\\/2 min-h-28 img-narrative-reg-header"></div>
						<div class="absolute top-2 right-0 bottom-0 w-1\\/2 rotate-y-180 min-h-28 img-narrative-reg-header"></div>
						<div class="img-narrative-top-icon absolute mt-4"></div>
					</div>
				</div>
				<div class="narrative-header-container-sys width-full hidden top-0">
					<div class="absolute -top-2\\.5 -mt-px -right-3 -left-3 h-4 filigree-panel-top-simplified pointer-events-none">
				</div>
			`;
      this.Root.appendChild(narrativeHeader);
    } else if (modalStyle === "on-map") {
      this.Root.insertAdjacentHTML(
        "afterbegin",
        `
				<div class="w-full">
					<div class="flex absolute w-full -top-14 justify-center">
					<div class="absolute top-2 left-1 bottom-0 w-1\\/2 min-h-14 img-small-narrative-header"></div>
					<div class="absolute top-2 -right-0\\.5 bottom-0 w-1\\/2 rotate-y-180 min-h-14 img-small-narrative-header"></div>
					<div class="img-small-narrative-top-icon w-8 h-8 mt-3 ml-1 absolute"></div>
					</div>
				</div>`
      );
    } else {
      this.Root.classList.add("p-0\\.5", "img-unit-panelbox");
      this.Root.insertAdjacentHTML(
        "afterbegin",
        `
				<div class="flex items-center justify-center h-16 -mt-8 pb-1 w-full">
					<div class="grow img-top-filigree-left"></div>
					<div class="img-top-filigree-center"></div>
					<div class="grow img-top-filigree-right"></div>
				</div>
			`
      );
    }
  }
}
Controls.define("fxs-modal-frame", {
  createInstance: FxsModalFrame,
  attributes: [
    {
      name: "data-bg-image",
      description: "Set background image from narrative story info"
    }
  ],
  images: [
    "fs://game/base_frame-filigree.png",
    "fs://game/modal_bg.png",
    "fs://game/nar_reg_bg_overlay",
    "fs://game/nar_small_frame"
  ]
});

export { FxsModalFrame };
//# sourceMappingURL=fxs-modal-frame.js.map

import { a as LensActivationEventName, L as LensManager } from '../../../core/ui/lenses/lens-manager.chunk.js';
import { P as Panel } from '../../../core/ui/panel-support.chunk.js';
import { n as numberHexToStringRGB } from '../../../core/ui/utilities/utilities-color.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { ContinentLensLayer } from './layer/continent-layer.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/graph-layout/utils.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../../core/ui/plot-icons/plot-icons-manager.js';
import '../utilities/utilities-overlay.chunk.js';

const content = "<fxs-subsystem-frame\r\n\tclass=\"continent-frame flex flex-col items-center pointer-events-auto img-tooltip-bg pb-2\"\r\n\tno-close=\"true\"\r\n\tbox-style=\"b4\"\r\n>\r\n\t<fxs-header\r\n\t\ttitle=\"LOC_UI_CONTINENTS_PANEL_TITLE\"\r\n\t\tclass=\"continents__header flex mb-2 text-center self-center font-title text-base text-secondary\"\r\n\t\tfiligree-style=\"h4\"\r\n\t\tdata-slot=\"header\"\r\n\t></fxs-header>\r\n\t<div class=\"continents__subheader text-center self-center text-sm mb-2\"></div>\r\n\t<fxs-vslot\r\n\t\tclass=\"continents__info-container flex flex-col\"\r\n\t\ttabIndex=\"-1\"\r\n\t>\r\n\t</fxs-vslot>\r\n</fxs-subsystem-frame>\r\n";

const styles = "fs://game/base-standard/ui/lenses/panel-continents.css";

class ContinentLensInfo extends Panel {
  subsystemFrameCloseListener = this.close.bind(this);
  engineInputListener = this.onEngineInput.bind(this);
  activeLensChangedListener = this.onActiveLensChanged.bind(this);
  continentListContainer = null;
  frame = null;
  get isExplorationAge() {
    return Game.age == Game.getHash("AGE_EXPLORATION");
  }
  get isModernAge() {
    return Game.age == Game.getHash("AGE_MODERN");
  }
  inputContext = InputContext.World;
  constructor(root) {
    super(root);
  }
  onAttach() {
    this.frame = this.Root.querySelector(".continent-frame");
    this.Root.addEventListener("engine-input", this.engineInputListener);
    if (this.frame == void 0) {
      return;
    }
    this.frame.addEventListener("subsystem-frame-close", this.subsystemFrameCloseListener);
    window.addEventListener(LensActivationEventName, this.activeLensChangedListener);
  }
  onDetach() {
    if (this.frame) {
      this.frame.removeEventListener("subsystem-frame-close", this.subsystemFrameCloseListener);
    }
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    window.removeEventListener(LensActivationEventName, this.activeLensChangedListener);
    super.onDetach();
  }
  onActiveLensChanged(event) {
    const areWeVisible = event.detail.activeLens == "fxs-continent-lens";
    if (areWeVisible) {
      this.initPanel();
    }
    this.Root.classList.toggle("hidden", !areWeVisible);
  }
  initPanel() {
    if (this.isExplorationAge || this.isModernAge) {
      const subHeaderElement = MustGetElement(".continents__subheader", this.Root);
      subHeaderElement.setAttribute(
        "data-l10n-id",
        this.isExplorationAge ? Locale.compose("LOC_UI_CONTINENTS_EXPLORATION_SUBTITLE") : Locale.compose("LOC_UI_CONTINENTS_MODERN_SUBTITLE")
      );
    }
    this.continentListContainer = MustGetElement(".continents__info-container", this.Root);
    while (this.continentListContainer.firstChild) {
      this.continentListContainer.removeChild(this.continentListContainer.firstChild);
    }
    for (let i = 0; i < ContinentLensLayer.instance.continentsList.length; i++) {
      const continentPlotList = ContinentLensLayer.instance.continentsList[i];
      this.addContinentInfoRow(continentPlotList);
    }
    if (this.isExplorationAge) {
      this.addIconKeyRow("fs://game/res_treasurehex", "LOC_UI_CONTINENTS_HOMELANDS_RESOURCE_DESCRIPTION");
      this.addIconKeyRow(
        "fs://game/res_distanttreasurehex",
        "LOC_UI_CONTINENTS_DISTANT_LANDS_RESOURCE_DESCRIPTION"
      );
    }
  }
  addContinentInfoRow(contintentPlotList) {
    const rowContainer = document.createElement("div");
    rowContainer.classList.value = "continents__row-container flex my-2";
    const rowContent = document.createElement("div");
    rowContent.classList.value = "continents__row-container flex flex-row flex-auto";
    rowContainer.appendChild(rowContent);
    const colorBoxContainer = document.createElement("div");
    colorBoxContainer.classList.value = "continents__color-box-container flex size-10";
    colorBoxContainer.style.backgroundColor = "grey";
    rowContent.appendChild(colorBoxContainer);
    const colorBox = document.createElement("div");
    colorBox.classList.value = "continents__color-box flex m-px size-full";
    colorBox.style.backgroundColor = numberHexToStringRGB(contintentPlotList.color);
    colorBoxContainer.appendChild(colorBox);
    const continentsTextColumn = document.createElement("div");
    continentsTextColumn.classList.value = "continents__text-column flex flex-col font-fit-shrink whitespace-nowrap ml-4 w-62";
    rowContent.appendChild(continentsTextColumn);
    const continentsTextTitle = document.createElement("div");
    continentsTextTitle.classList.value = "continents__continent-title flex font-title text-base uppercase font-fit-shrink whitespace-nowrap";
    continentsTextTitle.innerHTML = Locale.compose(
      `${GameInfo.Continents.lookup(contintentPlotList.continent)?.Description}`
    );
    continentsTextColumn.appendChild(continentsTextTitle);
    const researchText = this.getContinentResearchState(contintentPlotList.continent, contintentPlotList.isDistant, contintentPlotList.availableResources);
    const continentsTextStatus = document.createElement("div");
    continentsTextStatus.classList.value = "continents__continent-status flex font-body text-base text-primary-1 font-fit-shrink";
    continentsTextColumn.appendChild(continentsTextStatus);
    if (this.isModernAge) {
      continentsTextStatus.innerHTML = `${researchText}`;
    }
    this.continentListContainer?.appendChild(rowContainer);
  }
  addIconKeyRow(iconURL, locTitle) {
    const rowContainer = document.createElement("div");
    rowContainer.classList.value = "continents__row-container flex my-2";
    const rowContent = document.createElement("div");
    rowContent.classList.value = "continents__row-container flex flex-row flex-auto";
    rowContainer.appendChild(rowContent);
    const iconContainer = document.createElement("div");
    iconContainer.classList.value = "continents__key-icon-container flex size-10";
    rowContent.appendChild(iconContainer);
    const keyIcon = document.createElement("fxs-icon");
    keyIcon.classList.value = "continents__key-icon flex m-px size-full";
    keyIcon.style.backgroundImage = `url(${iconURL})`;
    iconContainer.appendChild(keyIcon);
    const continentsTextColumn = document.createElement("div");
    continentsTextColumn.classList.value = "continents__text-column flex flex-col ml-4 w-64";
    rowContent.appendChild(continentsTextColumn);
    const continentsTextTitle = document.createElement("div");
    continentsTextTitle.classList.value = "continents__continent-title flex font-title text-base font-fit-shrink";
    continentsTextTitle.innerHTML = Locale.compose(locTitle);
    continentsTextColumn.appendChild(continentsTextTitle);
    this.continentListContainer?.appendChild(rowContainer);
  }
  getContinentResearchState(continentType, isDistant, amount) {
    let descriptionsText = "";
    if (this.isExplorationAge) {
      if (!isDistant) {
        descriptionsText = Locale.compose("LOC_UI_CONTINENTS_PANEL_HOMELAND", amount);
      } else {
        descriptionsText = Locale.compose("LOC_UI_CONTINENTS_PANEL_TREASURE_AVAILABLE", amount);
      }
    }
    if (this.isModernAge) {
      const numAgesResearched = Players.get(GameContext.localPlayerID)?.Culture?.getNumAgesResearched(
        continentType
      );
      if (numAgesResearched == void 0) {
        return descriptionsText;
      }
      if (numAgesResearched <= 0) {
        descriptionsText = Locale.compose("LOC_UI_CONTINENTS_PANEL_NOT_RESEARCHED");
      } else if (numAgesResearched <= 1) {
        descriptionsText = Locale.compose("LOC_UI_CONTINENTS_PANEL_AVAILABLE", amount);
      } else {
        descriptionsText = Locale.compose("LOC_UI_CONTINENTS_PANEL_COMPLETE", amount);
      }
    }
    return descriptionsText;
  }
  close() {
    if (LensManager.getActiveLens() != "fxs-default-lens") {
      LensManager.setActiveLens("fxs-default-lens");
    }
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.detail.name == "cancel" || inputEvent.detail.name == "sys-menu") {
      this.close();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
}
Controls.define("panel-continents", {
  createInstance: ContinentLensInfo,
  description: "Information about continents, exploration-age treasure convoys, and modern-age artifacts",
  styles: [styles],
  innerHTML: [content],
  classNames: ["panel-continents", "w-96", "pr-4", "hidden"]
});

export { ContinentLensInfo };
//# sourceMappingURL=panel-continents.js.map

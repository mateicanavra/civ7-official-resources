import { render } from '../../../core/vendor/solid-js/web/dist/web.js';
import { ComponentID } from '../../../core/ui/utilities/utilities-component-id.js';
import UpdateGate from '../../../core/ui/utilities/utilities-update-gate.js';
import { TooltipVerticalPosition, TooltipHorizontalPosition } from '../../../core/ui-next/components/tooltip.js';
import { UpdateCityDetailsEventName } from '../city-details/model-city-details.js';
import { ProductionPanelCategory, GetLastProductionData } from './production-chooser-helpers.js';
import { ProductionTooltip } from '../../ui-next/tooltips/production-tooltip.js';

class LastProductionSection extends Component {
  cityID = null;
  updateCityDetailsListener = this.onUpdateCityDetails.bind(this);
  headerElement = document.createElement("div");
  nameElement = document.createElement("div");
  iconElement = document.createElement("fxs-icon");
  yieldDiv = document.createElement("div");
  frame = null;
  onInitialize() {
    super.onInitialize();
    this.render();
  }
  onAttach() {
    super.onAttach();
    window.addEventListener(UpdateCityDetailsEventName, this.updateCityDetailsListener);
  }
  onDetach() {
    this.cityID = null;
    window.removeEventListener(UpdateCityDetailsEventName, this.updateCityDetailsListener);
    super.onDetach();
  }
  disposeTooltips = [];
  addProductionTooltip(parent, child, data) {
    const dispose = render(
      () => ProductionTooltip({
        children: child,
        name: data.name,
        type: data.type,
        category: data.isUnit ? ProductionPanelCategory.UNITS : data.isProject ? ProductionPanelCategory.PROJECTS : void 0,
        offset: 30,
        initialHPosition: TooltipHorizontalPosition.RIGHT,
        initialVPosition: TooltipVerticalPosition.CENTER
      }),
      parent
    );
    this.disposeTooltips.push(dispose);
    return dispose;
  }
  render() {
    this.Root.classList.add(
      "flex",
      "flex-col",
      "items-center",
      "justify-center",
      "px-14",
      "py-2",
      "pointer-events-auto"
    );
    this.frame = document.createElement("fxs-inner-frame");
    this.frame.classList.value = "";
    this.frame.classList.add("min-w-96", "items-start", "last-production-frame");
    this.frame.setAttribute("tabindex", "-1");
    const container = document.createElement("div");
    container.classList.add("flex", "items-center", "my-4", "ml-8");
    this.iconElement.classList.add("size-16");
    container.appendChild(this.iconElement);
    const details = document.createElement("div");
    details.classList.add("flex-col", "ml-4");
    this.nameElement.classList.add("font-title", "text-xs", "text-accent-2", "uppercase");
    details.appendChild(this.nameElement);
    this.yieldDiv.classList.add("flex");
    details.appendChild(this.yieldDiv);
    container.appendChild(details);
    const checkmarkBG = document.createElement("div");
    checkmarkBG.style.backgroundImage = 'url("fs://game/techtree-icon-empty")';
    checkmarkBG.classList.value = "check-icon flex absolute size-6 bg-no-repeat bg-center bg-contain -right-2 -top-2 justify-center items-center";
    this.frame.appendChild(checkmarkBG);
    const checkmark = document.createElement("div");
    checkmark.classList.value = "size-4 bg-center bg-contain bg-no-repeat";
    checkmark.style.backgroundImage = 'url("fs://game/techtree_icon-checkmark")';
    checkmarkBG.appendChild(checkmark);
    this.frame.appendChild(container);
    this.Root.appendChild(this.frame);
  }
  updateGate = new UpdateGate(() => {
    this.disposeTooltips.forEach((dispose) => dispose());
    this.disposeTooltips = [];
    if (!this.cityID || ComponentID.isInvalid(this.cityID)) {
      return;
    }
    const lastProductionData = GetLastProductionData(this.cityID);
    if (!lastProductionData) {
      this.Root.classList.add("hidden");
      return;
    }
    this.headerElement.classList.value = "font-title uppercase text-sm text-secondary-2 text-gradient-secondary mb-1";
    this.headerElement.setAttribute("data-l10n-id", "LOC_UI_JUST_COMPLETED");
    this.Root.appendChild(this.headerElement);
    this.nameElement.setAttribute("data-l10n-id", lastProductionData.name);
    this.iconElement.setAttribute("data-icon-id", lastProductionData.type);
    this.yieldDiv.innerHTML = "";
    for (const detailData of lastProductionData.details) {
      const yieldEntry = document.createElement("div");
      yieldEntry.classList.add("flex", "items-center", "pr-4");
      const yieldIcon = document.createElement("fxs-icon");
      yieldIcon.classList.add("size-8");
      if (lastProductionData.isUnit) {
        yieldIcon.style.backgroundImage = `url('blp:${detailData.icon}')`;
      } else {
        yieldIcon.setAttribute("data-icon-id", detailData.icon);
      }
      yieldEntry.appendChild(yieldIcon);
      const yieldValue = document.createElement("div");
      yieldValue.textContent = detailData.value;
      yieldEntry.appendChild(yieldValue);
      this.yieldDiv.appendChild(yieldEntry);
    }
    if (lastProductionData && this.frame) {
      this.addProductionTooltip(this.Root, this.frame, lastProductionData);
    } else {
      this.Root.appendChild(this.frame);
    }
    this.Root.setAttribute("data-type", lastProductionData.type);
    this.Root.classList.remove("hidden");
  });
  onAttributeChanged(name, oldValue, newValue) {
    switch (name) {
      case "data-cityid":
        this.cityID = JSON.parse(newValue);
        this.updateGate.call("onAttributeChanged");
        break;
      default:
        super.onAttributeChanged(name, oldValue, newValue);
        break;
    }
  }
  onUpdateCityDetails() {
    this.updateGate.call("onUpdateCityDetails");
  }
}
Controls.define("last-production-section", {
  createInstance: LastProductionSection,
  attributes: [
    {
      name: "data-cityid"
    }
  ]
});

export { LastProductionSection };
//# sourceMappingURL=last-production-section.js.map

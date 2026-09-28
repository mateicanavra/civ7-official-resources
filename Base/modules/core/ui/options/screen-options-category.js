import { FxsVSlot } from '../components/fxs-slot.js';
import { OptionType } from './model-options.js';
import { CreateOptionComponent, GetGroupLocKey } from './options-helpers.js';

class ScreenOptionsCategory extends FxsVSlot {
  groupHeaders = {};
  /**
   * appendOption adds the given option to the group.
   */
  appendOption(option) {
    const optionElement = CreateOptionComponent(option);
    const referenceNode = this.getOptionReferenceNode(option.group);
    const optionRow = document.createElement("div");
    optionRow.classList.value = "flex items-center justify-between mb-2 highlight-row";
    optionRow.addEventListener("mouseenter", this.playSound.bind(this, "data-audio-focus", "data-audio-focus-ref"));
    this.Root.insertBefore(optionRow, referenceNode);
    const optionLabel = document.createElement("p");
    optionLabel.classList.add("font-body", "text-base");
    optionLabel.setAttribute("data-l10n-id", option.label);
    optionRow.appendChild(optionLabel);
    if (option.description) {
      const description = Locale.compose(option.description);
      optionElement.setAttribute("data-tooltip-content", description);
      optionElement.setAttribute("data-tooltip-anchor", "left");
      optionLabel.setAttribute("data-tooltip-content", description);
    }
    const optionValue = document.createElement("div");
    optionValue.classList.add("flex", "flex-col", "items-end");
    optionValue.setAttribute("optionID", `${option.id}`);
    const optionValueInner = document.createElement("div");
    optionValueInner.classList.add("flex", "flex-row");
    optionValue.appendChild(optionValueInner);
    optionValueInner.appendChild(optionElement);
    optionRow.appendChild(optionValue);
    if (option.type == OptionType.Slider) {
      const optionNumberWrapper = document.createElement("div");
      optionNumberWrapper.classList.add(
        "screen-options-category_slider-text",
        "flex",
        "items-center",
        "justify-end"
      );
      const optionNumber = document.createElement("div");
      optionNumber.classList.add("font-body", "text-sm");
      optionNumberWrapper.appendChild(optionNumber);
      option.sliderValue = optionNumber;
      optionValueInner.appendChild(optionNumberWrapper);
    }
    return { optionRow, optionElement };
  }
  /**
   * getOptionReferenceNode finds the node to insert the option after.
   *
   * This should be the next group header, or if no group is specified, the first group header.
   */
  getOptionReferenceNode(group) {
    if (group) {
      this.groupHeaders[group] ??= this.createGroupHeader(group);
      return this.Root.querySelector(`[data-group="${group}"] ~ [data-group]`) ?? null;
    } else {
      return this.Root.querySelector(`[data-group] + .options-row`)?.previousSibling ?? null;
    }
  }
  createGroupHeader(group) {
    const groupTitle = document.createElement("fxs-header");
    groupTitle.setAttribute("title", GetGroupLocKey(group));
    groupTitle.setAttribute("data-group", group);
    return this.Root.appendChild(groupTitle);
  }
  onInitialize() {
    super.onInitialize();
    this.render();
    this.Root.setAttribute("data-audio-group-ref", "options");
  }
  render() {
    this.Root.classList.add("flex", "flex-col");
    this.Root.setAttribute("disable-focus-allowed", "true");
  }
}
const ScreenOptionsCategoryTagName = "screen-options-category";
Controls.define(ScreenOptionsCategoryTagName, {
  createInstance: ScreenOptionsCategory,
  attributes: [
    {
      name: "disable-focus-allowed",
      description: "Determines if focus is allowed to occur on disabled items."
    }
  ],
  tabIndex: -1
});

export { ScreenOptionsCategory };
//# sourceMappingURL=screen-options-category.js.map

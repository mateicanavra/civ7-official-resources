import { LensActivationEventName } from '../../../core/ui/lenses/lens-manager.js';
import styles from './panel-general-appeal-legend.scss.js';

const NATURAL_WONDER_COLOR = "rgb(100, 40, 250)";
const BREATHTAKING_THRESHOLD_COLOR = "rgb(26, 90, 0)";
const CHARMING_THRESHOLD_COLOR = "rgb(85, 164, 59)";
const AVERAGE_THRESHOLD_COLOR = "rgb(205, 189, 189)";
class TerrainLegend extends Component {
  activeLensChangedListener = this.onActiveLensChanged.bind(this);
  constructor(root) {
    super(root);
    this.render();
  }
  render() {
    const subsystemFrame = document.createElement("fxs-subsystem-frame");
    subsystemFrame.classList.add(
      "general-appeal-legend-container",
      "flex-col",
      "py-2",
      "pointer-events-auto",
      "img-tooltip-bg"
    );
    subsystemFrame.setAttribute("box-style", "b4");
    subsystemFrame.setAttribute("no-close", "true");
    this.Root.appendChild(subsystemFrame);
    const header = document.createElement("fxs-header");
    header.classList.add("mb-2", "font-title", "text-base", "text-secondary");
    header.setAttribute("filigree-style", "h4");
    header.setAttribute("title", "LOC_UI_GENERAL_APPEAL_LEGEND_HEADER");
    subsystemFrame.appendChild(header);
    subsystemFrame.appendChild(
      this.addRow(
        "LOC_UI_GENERAL_APPEAL_LEGEND_BREATHTAKING",
        "general-appeal-legend-hex",
        BREATHTAKING_THRESHOLD_COLOR
      )
    );
    subsystemFrame.appendChild(
      this.addRow("LOC_UI_GENERAL_APPEAL_LEGEND_CHARMING", "general-appeal-legend-hex", CHARMING_THRESHOLD_COLOR)
    );
    subsystemFrame.appendChild(
      this.addRow(
        "LOC_UI_GENERAL_APPEAL_LEGEND_NATURAL_WONDER",
        "general-appeal-legend-hex",
        NATURAL_WONDER_COLOR
      )
    );
    subsystemFrame.appendChild(
      this.addRow("LOC_UI_GENERAL_APPEAL_LEGEND_AVERAGE", "general-appeal-legend-hex", AVERAGE_THRESHOLD_COLOR)
    );
  }
  addRow(text, iconClass, color) {
    const container = document.createElement("div");
    container.classList.add("flex", "items-center");
    this.Root.appendChild(container);
    const iconElement = document.createElement("div");
    iconElement.classList.add(iconClass, "size-16", "bg-contain", "bg-no-repeat");
    if (color) {
      iconElement.style.fxsBackgroundImageTint = color;
    }
    container.appendChild(iconElement);
    const textElement = document.createElement("div");
    textElement.classList.add("general-appeal-legend-description", "font-body", "w-72", "text-xs");
    textElement.innerHTML = Locale.stylize(text);
    container.appendChild(textElement);
    return container;
  }
  onAttach() {
    super.onAttach();
    this.Root.listenForWindowEvent(LensActivationEventName, this.activeLensChangedListener);
  }
  onDetach() {
    super.onDetach();
  }
  onActiveLensChanged(event) {
    const areWeVisible = event.detail.activeLens == "fxs-general-appeal-lens";
    this.Root.classList.toggle("hidden", !areWeVisible);
  }
}
Controls.define("panel-general-appeal-legend", {
  createInstance: TerrainLegend,
  description: "Legend for the Terrain lens",
  styles: [styles],
  classNames: ["hidden", "absolute"]
});

export { TerrainLegend };
//# sourceMappingURL=panel-general-appeal-legend.js.map

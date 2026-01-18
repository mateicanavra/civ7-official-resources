import PlotIconsManager from './plot-icons-manager.js';
import PlotIcons, { s as styles } from './plot-icons.js';

class PlotIconsRootComponent extends Component {
  addIconListener = this.onAddIcon.bind(this);
  removeIconListener = this.onRemoveIcon.bind(this);
  globalHidden = false;
  globalHideListener = this.onGlobalHide.bind(this);
  globalShowListener = this.onGlobalShow.bind(this);
  onAttach() {
    super.onAttach();
    engine.on("PlotVisibilityChanged", this.onPlotVisibilityChanged, this);
    window.addEventListener("ui-hide-plot-icons", this.globalHideListener);
    window.addEventListener("ui-show-plot-icons", this.globalShowListener);
    this.Root.addEventListener("plot-icons-root-add", this.addIconListener);
    this.Root.addEventListener("plot-icons-root-remove", this.removeIconListener);
    PlotIconsManager.rootAttached(this.Root);
  }
  onDetach() {
    engine.off("PlotVisibilityChanged", this.onPlotVisibilityChanged, this);
    window.removeEventListener("ui-hide-plot-icons", this.globalHideListener);
    window.removeEventListener("ui-show-plot-icons", this.globalShowListener);
    this.Root.removeEventListener("plot-icons-root-add", this.addIconListener);
    this.Root.removeEventListener("plot-icons-root-remove", this.removeIconListener);
    this.Root.innerHTML = "";
    super.onDetach();
  }
  /// Gets the root element for a plot by it's plot coordinates
  getPlotRoot(x, y) {
    const plotIcons = PlotIconsManager.getPlotIcon(x, y);
    let plotIconsRoot = plotIcons?.Root;
    if (plotIconsRoot == void 0) {
      plotIconsRoot = document.createElement("plot-icons");
      plotIconsRoot.setAttribute("x", x.toFixed(0));
      plotIconsRoot.setAttribute("y", y.toFixed(0));
      this.Root.appendChild(plotIconsRoot);
    }
    return plotIconsRoot;
  }
  /// Create the plot icon on the desired root
  createIcon(plotData, root) {
    const existingIcons = root.querySelectorAll(plotData.iconType);
    existingIcons.forEach((child) => {
      root.removeChild(child);
    });
    const plotIcon = document.createElement(plotData.iconType);
    plotIcon.style.transform = `translateX(-50%) translateY(-50%)`;
    plotIcon.setAttribute("x", plotData.location.x.toFixed(0));
    plotIcon.setAttribute("y", plotData.location.y.toFixed(0));
    plotData.attributes?.forEach((value, key) => {
      plotIcon.setAttribute(key, value);
    });
    root.appendChild(plotIcon);
  }
  onAddIcon(event) {
    if (event.detail.plot == null) {
      console.error('plot-icons-root: onAddIcon event detail failed to contain valid "plot" member!');
      return;
    }
    const plotData = event.detail.plot;
    const plotIconsRoot = this.getPlotRoot(plotData.location.x, plotData.location.y);
    this.createIcon(plotData, plotIconsRoot);
  }
  onRemoveIcon(event) {
    const type = event.detail.plotType;
    if (type == null) {
      console.error('plot-icons-root: onRemoveIcon event detail failed to contain valid "plotType" member!');
      return;
    }
    const location = event.detail.plotLocation;
    if (location) {
      const query = `[x="${location.x}][y="${location.y}]`;
      const locationRoot = this.Root.querySelector(query);
      if (locationRoot) {
        const plotIcon = locationRoot.querySelector(type);
        if (plotIcon) {
          locationRoot.removeChild(plotIcon);
        }
      }
    } else {
      const plotIcons = this.Root.querySelectorAll(type);
      plotIcons.forEach((plotIcon) => {
        plotIcon.parentElement?.removeChild(plotIcon);
      });
    }
  }
  onPlotVisibilityChanged(data) {
    const plotIcons = PlotIconsManager.getPlotIcon(data.location.x, data.location.y);
    if (plotIcons != void 0 && plotIcons instanceof PlotIcons) {
      plotIcons.setVisibility(this.globalHidden ? RevealedStates.HIDDEN : data.visibility);
    }
  }
  onGlobalHide() {
    this.Root.style.display = "none";
    this.globalHidden = true;
  }
  onGlobalShow() {
    this.Root.style.display = "";
    this.globalHidden = false;
  }
}
Controls.define("plot-icons-root", {
  createInstance: PlotIconsRootComponent,
  description: "Plot Icons Root",
  requires: ["plot-icons"],
  styles: [styles]
});
//# sourceMappingURL=plot-icons-root.js.map

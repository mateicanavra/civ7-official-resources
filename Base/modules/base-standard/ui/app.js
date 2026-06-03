import { render } from '../../core/vendor/solid-js/web/dist/web.js';
import { createComponent, Show } from '../../core/vendor/solid-js/dist/solid.js';
import { FocusViewer } from '../../core/ui-next/debug/focus-viewer/focus-viewer.js';
import { createSignalFromDebugWidget } from '../../core/ui-next/utilities/debug-widgets.js';
import { PlotTooltip } from '../ui-next/tooltips/plot-tooltip/plot-tooltip.js';

function App() {
  const focusViewerEnabled = createSignalFromDebugWidget({
    caption: "Enable Focus Viewer",
    category: "Systems",
    domainType: "bool",
    id: "enableFocusViewer",
    value: false
  });
  return [createComponent(Show, {
    get when() {
      return focusViewerEnabled();
    },
    get children() {
      return createComponent(FocusViewer, {
        initialVisibility: true
      });
    }
  }), createComponent(PlotTooltip, {})];
}
function InitApp() {
  const root = document.getElementById("solidjs-root");
  if (!root) {
    console.error("app.tsx: Could not find #solidjs-root element to mount Solid.js app");
    return;
  }
  render(() => createComponent(App, {}), root);
}

export { InitApp };
//# sourceMappingURL=app.js.map

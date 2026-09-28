import { template, insert } from '../../../core/vendor/solid-js/web/dist/web.js';
import { L10n } from '../../../core/ui-next/components/l10n.js';
import { ComponentRegistry } from '../../../core/ui-next/services/component-registry.js';
import style from './mini-map-legend-panel.scss.js';
import { createComponent, createRenderEffect } from '../../../core/vendor/solid-js/dist/solid.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="flex flex-row items-center legend-description"><div class="size-12 bg-contain bg-no-repeat bg-center"></div><div class="flex-auto"></div></div>`);
const hexIconUrl = "blp:bg_hex-icon.png";
const MiniMapPlotLegendComponent = (props) => {
  return (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling;
    _el$2.style.setProperty("background-image", "url(blp:bg_hex-icon.png)");
    insert(_el$3, createComponent(L10n.Compose, {
      get text() {
        return props.text;
      }
    }));
    createRenderEffect((_$p) => (_$p = props.color) != null ? _el$2.style.setProperty("fxs-background-image-tint", _$p) : _el$2.style.removeProperty("fxs-background-image-tint"));
    return _el$;
  })();
};
const MiniMapPlotLegend = ComponentRegistry.register({
  name: "MiniMapPlotLegend",
  createInstance: MiniMapPlotLegendComponent,
  images: [hexIconUrl],
  styles: [style]
});

export { MiniMapPlotLegend };
//# sourceMappingURL=mini-map-plot-legend.js.map

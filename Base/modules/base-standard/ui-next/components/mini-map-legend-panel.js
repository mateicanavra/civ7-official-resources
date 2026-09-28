import { template, spread, insert } from '../../../core/vendor/solid-js/web/dist/web.js';
import { createSignal, splitProps, onMount, onCleanup, createComponent, Show, mergeProps, createMemo } from '../../../core/vendor/solid-js/dist/solid.js';
import { LensActivationEventName } from '../../../core/ui/lenses/lens-manager.js';
import { Filigree } from '../../../core/ui-next/components/filigree.js';
import { Frame } from '../../../core/ui-next/components/frame.js';
import { L10n } from '../../../core/ui-next/components/l10n.js';
import { ComponentRegistry } from '../../../core/ui-next/services/component-registry.js';
import style from './mini-map-legend-panel.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="uppercase font-title text-secondary"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="mini-map-legend-container"><div></div></div>`);
const MiniMapLegendPanelComponent = (props) => {
  const [lensIsActive, setLensIsActive] = createSignal(false);
  const [local, other] = splitProps(props, ["title", "lensName"]);
  onMount(() => {
    window.addEventListener(LensActivationEventName, onLensActivation);
  });
  onCleanup(() => {
    window.removeEventListener(LensActivationEventName, onLensActivation);
  });
  const onLensActivation = (event) => {
    setLensIsActive(event.detail.activeLens === local.lensName);
  };
  return createComponent(Show, {
    get when() {
      return lensIsActive();
    },
    get children() {
      var _el$ = _tmpl$2(), _el$2 = _el$.firstChild;
      spread(_el$2, mergeProps(other, {
        get ["class"]() {
          return `mini-map-legend-panel mx-3 my-4 absolute pointer-events-auto ${other.class ?? ""}`;
        }
      }), false, true);
      insert(_el$2, createComponent(Frame.Simple, {
        "class": "flex flex-col relative",
        contentClass: "px-3\\.5 py-4",
        get children() {
          return [createComponent(Filigree.H4, {
            get children() {
              var _el$3 = _tmpl$();
              insert(_el$3, createComponent(L10n.Compose, {
                get text() {
                  return local.title;
                }
              }));
              return _el$3;
            }
          }), createMemo(() => other.children)];
        }
      }));
      return _el$;
    }
  });
};
const MiniMapLegendPanel = ComponentRegistry.register({
  name: "MiniMapLegendPanel",
  createInstance: MiniMapLegendPanelComponent,
  styles: [style]
});

export { MiniMapLegendPanel };
//# sourceMappingURL=mini-map-legend-panel.js.map

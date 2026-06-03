import { template, insert, className } from '../../../vendor/solid-js/web/dist/web.js';
import { AudioContextProvider } from '../../components/audio-context-provider.js';
import { CloseButton } from '../../components/close-button.js';
import { ComponentRegistry } from '../../services/component-registry.js';
import { createComponent, createRenderEffect } from '../../../vendor/solid-js/dist/solid.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="img-frame-f1 relative h-full flex flex-row min-w-200 pointer-events-auto"><div class="img-frame-filigree absolute top-4 left-4 size-64"></div><div class="img-frame-filigree absolute top-4 right-4 size-64 -scale-x-100"></div><div></div></div>`);
const CreateGamePopupFrameComponent = (props) => {
  return (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling, _el$4 = _el$3.nextSibling;
    insert(_el$4, () => props.children);
    insert(_el$, createComponent(AudioContextProvider, {
      segment: "CloseButton",
      get children() {
        return createComponent(CloseButton, {
          get onActivate() {
            return props.onClose;
          },
          "class": "absolute top-4 right-4"
        });
      }
    }), null);
    createRenderEffect(() => className(_el$4, `absolute inset-0  ${props.class ?? ""}`));
    return _el$;
  })();
};
const CreateGamePopupFrame = ComponentRegistry.register({
  name: "CreateGamePopupFrame",
  createInstance: CreateGamePopupFrameComponent,
  styles: []
});

export { CreateGamePopupFrame };
//# sourceMappingURL=create-game-popup-frame.js.map

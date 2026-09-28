import { template, insert, className } from '../../../vendor/solid-js/web/dist/web.js';
import { AudioContextProvider } from '../../components/audio-context-provider.js';
import { CloseButton } from '../../components/close-button.js';
import { ComponentRegistry } from '../../services/component-registry.js';
import { isMobile } from '../../services/view-experience.js';
import { useIsSmallScreen } from '../../utilities/layout-utilities.js';
import { createComponent, createRenderEffect } from '../../../vendor/solid-js/dist/solid.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="relative h-full flex flex-row pointer-events-auto"><div class="img-frame-f1 absolute inset-0 fullscreen-outside-safezone-y"></div><div class="img-frame-filigree absolute top-4 left-4 size-64"></div><div class="img-frame-filigree absolute top-4 right-4 size-64 -scale-x-100"></div><div></div></div>`);
const CreateGamePopupFrameComponent = (props) => {
  const isSmallScreen = useIsSmallScreen()();
  return (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling, _el$4 = _el$3.nextSibling, _el$5 = _el$4.nextSibling;
    insert(_el$5, () => props.children);
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
    createRenderEffect((_p$) => {
      var _v$ = !isMobile(), _v$2 = !!(isMobile() && isSmallScreen), _v$3 = !!(isMobile() && !isSmallScreen), _v$4 = `absolute inset-0  ${props.class ?? ""}`;
      _v$ !== _p$.e && _el$.classList.toggle("min-w-200", _p$.e = _v$);
      _v$2 !== _p$.t && _el$.classList.toggle("w-2\\/3", _p$.t = _v$2);
      _v$3 !== _p$.a && _el$.classList.toggle("w-3\\/4", _p$.a = _v$3);
      _v$4 !== _p$.o && className(_el$5, _p$.o = _v$4);
      return _p$;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0
    });
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

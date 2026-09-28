import { template, insert, className } from '../../vendor/solid-js/web/dist/web.js';
import { ComponentRegistry } from '../services/component-registry.js';
import { createRenderEffect } from '../../vendor/solid-js/dist/solid.js';

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`);
const ModalFrameComponent = (props) => {
  return (() => {
    var _el$ = _tmpl$();
    insert(_el$, () => props.children);
    createRenderEffect(() => className(_el$, `img-modal-frame relative px-20 py-6 flex flex-col items-center pointer-events-auto ${props.class ?? ""}`));
    return _el$;
  })();
};
const ModalFrame = ComponentRegistry.register({
  name: "PopupFrameComponent",
  createInstance: ModalFrameComponent
});

export { ModalFrame };
//# sourceMappingURL=modal-frame.js.map

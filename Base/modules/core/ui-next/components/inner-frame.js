import { template, spread, insert } from '../../vendor/solid-js/web/dist/web.js';
import { ComponentRegistry } from '../services/component-registry.js';
import { mergeProps } from '../../vendor/solid-js/dist/solid.js';

var _tmpl$ = /* @__PURE__ */ template(`<div><div class="absolute inset-0 pointer-events-none"><div class="absolute top-0 inset-x-0 filigree-inner-frame-top"></div><div class="absolute bottom-0 inset-x-0 filigree-inner-frame-bottom"></div></div></div>`);
const InnerFrameComponent = (props) => {
  return (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild;
    spread(_el$, mergeProps(props, {
      get ["class"]() {
        return `fxs-inner-frame inner-frame relative flex flex-col items-center ${props.class ?? ""}`;
      }
    }), false, true);
    insert(_el$, () => props.children, null);
    return _el$;
  })();
};
const InnerFrame = ComponentRegistry.register({
  name: "InnerFrame",
  createInstance: InnerFrameComponent
});

export { InnerFrame };
//# sourceMappingURL=inner-frame.js.map

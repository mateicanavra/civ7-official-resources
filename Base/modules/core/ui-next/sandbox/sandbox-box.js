import { template, spread, insert } from '../../vendor/solid-js/web/dist/web.js';
import { mergeProps } from '../../vendor/solid-js/dist/solid.js';

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`);
const SandboxBox = (props) => {
  return (() => {
    var _el$ = _tmpl$();
    spread(_el$, mergeProps(props, {
      get ["class"]() {
        return `img-dropdown-box m-2 p-4 flex flex-col ${props.class}`;
      }
    }), false, true);
    insert(_el$, () => props.children);
    return _el$;
  })();
};

export { SandboxBox };
//# sourceMappingURL=sandbox-box.js.map

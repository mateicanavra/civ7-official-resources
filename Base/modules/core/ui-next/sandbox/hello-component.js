import { template, setAttribute } from '../../vendor/solid-js/web/dist/web.js';
import { getOwner, createRenderEffect } from '../../vendor/solid-js/dist/solid.js';

var _tmpl$ = /* @__PURE__ */ template(`<fxs-header class="mx-2 mt-2"filigree-style=h4></fxs-header>`, true, false, false);
const HelloComponent = (props) => {
  return (() => {
    var _el$ = _tmpl$();
    _el$._$owner = getOwner();
    createRenderEffect(() => setAttribute(_el$, "title", `Hello ${props.name}!`));
    return _el$;
  })();
};

export { HelloComponent };
//# sourceMappingURL=hello-component.js.map

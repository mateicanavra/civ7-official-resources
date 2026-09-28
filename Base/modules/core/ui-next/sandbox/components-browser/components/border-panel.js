import { template, insert, className } from '../../../../vendor/solid-js/web/dist/web.js';
import { Header } from '../../../components/header.js';
import { createComponent, createRenderEffect } from '../../../../vendor/solid-js/dist/solid.js';

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`);
const BorderPanel = (props) => {
  return (() => {
    var _el$ = _tmpl$();
    insert(_el$, createComponent(Header, {
      "class": "mb-2",
      get children() {
        return props.title;
      }
    }), null);
    insert(_el$, () => props.children, null);
    createRenderEffect(() => className(_el$, `img-dropdown-box m-2 p-4 flex flex-col justify-start ${props.class ?? ""}`));
    return _el$;
  })();
};

export { BorderPanel };
//# sourceMappingURL=border-panel.js.map

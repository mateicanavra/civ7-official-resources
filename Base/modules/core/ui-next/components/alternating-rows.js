import { template, insert, className } from '../../vendor/solid-js/web/dist/web.js';
import { createComponent, For, createRenderEffect } from '../../vendor/solid-js/dist/solid.js';
import { ComponentRegistry } from '../services/component-registry.js';

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`);
function AlternatingRowsComponent(props) {
  function getRowClass(index) {
    return index % 2 == 0 ? props.evenClass ?? "bg-primary-4" : props.oddClass ?? "bg-primary-5";
  }
  return createComponent(For, {
    get each() {
      return props.each;
    },
    children: (item, index) => (() => {
      var _el$ = _tmpl$();
      insert(_el$, () => props.children(item, index));
      createRenderEffect(() => className(_el$, `${props.rowClass ?? ""} ${getRowClass(index())}`));
      return _el$;
    })()
  });
}
const AlternatingRows = ComponentRegistry.register("AlternatingRows", AlternatingRowsComponent);

export { AlternatingRows };
//# sourceMappingURL=alternating-rows.js.map

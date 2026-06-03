import { template, insert } from '../../vendor/solid-js/web/dist/web.js';
import { EffectComponent } from './effect-component.js';
import { EffectModel } from './effect-model.js';
import { createComponent } from '../../vendor/solid-js/dist/solid.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="flex flex-col m-2"><div class="flex flex-row mb-2"></div><div class="img-dropdown-box p-2 w-128"></div></div>`);
const EffectExample = () => {
  return (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling;
    insert(_el$2, createComponent(EffectComponent, {
      action: (setter) => setter((value) => `${value} Foo`),
      name: "Add Foo"
    }), null);
    insert(_el$2, createComponent(EffectComponent, {
      action: (setter) => setter((value) => `${value} Bar`),
      name: "Add Bar"
    }), null);
    insert(_el$2, createComponent(EffectComponent, {
      action: (setter) => setter(""),
      name: "Clear Value"
    }), null);
    insert(_el$3, () => EffectModel.value());
    return _el$;
  })();
};

export { EffectExample };
//# sourceMappingURL=effect-example.js.map

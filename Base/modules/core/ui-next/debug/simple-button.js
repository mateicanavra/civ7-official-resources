import { template, insert } from '../../vendor/solid-js/web/dist/web.js';
import { Activatable } from '../components/activatable.js';
import { ComponentRegistry } from '../services/component-registry.js';
import { createComponent, mergeProps } from '../../vendor/solid-js/dist/solid.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="relative flex flex-auto items-center justify-center"></div>`);
const SimpleButtonComponent = (props) => {
  return createComponent(Activatable, mergeProps(props, {
    get ["class"]() {
      return `border-1 border-accent-5 bg-accent-4 hover\\:bg-accent-5 p-1 m-1 font-title text-base text-accent-1 uppercase tracking-150 ${props.class ?? ""}`;
    },
    name: "SimpleButton",
    get children() {
      var _el$ = _tmpl$();
      insert(_el$, () => props.children);
      return _el$;
    }
  }));
};
const SimpleButton = ComponentRegistry.register({
  name: "SimpleButton",
  createInstance: SimpleButtonComponent
});

export { SimpleButton };
//# sourceMappingURL=simple-button.js.map

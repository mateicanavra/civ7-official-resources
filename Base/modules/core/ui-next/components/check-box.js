import { template, className } from '../../vendor/solid-js/web/dist/web.js';
import { ComponentRegistry } from '../services/component-registry.js';
import { Activatable } from './activatable.js';
import { createComponent, mergeProps, createRenderEffect } from '../../vendor/solid-js/dist/solid.js';

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`);
const CheckBoxComponent = (props) => {
  return createComponent(Activatable, mergeProps(props, {
    get ["class"]() {
      return `flex flex-row group justify-center items-center ${props.class ?? ""}`;
    },
    name: "CheckBox",
    get children() {
      var _el$ = _tmpl$();
      createRenderEffect(() => className(_el$, `${props.isChecked ? "check-box-on" : "check-box-off"} cursor-pointer pointer-events-auto relative flex justify-center items-center size-full bg-contain`));
      return _el$;
    }
  }));
};
const CheckBox = ComponentRegistry.register({
  name: "CheckBox",
  createInstance: CheckBoxComponent,
  images: ["blp:base_checkbox-off", "blp:base_checkbox-off-highlight", "blp:base_checkbox-on-highlight"]
});

export { CheckBox };
//# sourceMappingURL=check-box.js.map

import { template } from '../../vendor/solid-js/web/dist/web.js';
import { createMemo, createComponent, mergeProps, createRenderEffect } from '../../vendor/solid-js/dist/solid.js';
import { ComponentRegistry } from '../services/component-registry.js';
import { IsControllerActive } from '../services/input.js';
import { Activatable } from './activatable.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="absolute inset-0 transition-opacity"></div>`);
const ArrowButtonComponent = (props) => {
  props.audio ??= {};
  props.audio.group ??= "audio-pager";
  const isHidden = createMemo(() => props.hideForController && IsControllerActive());
  return createComponent(Activatable, mergeProps(props, {
    get ["class"]() {
      return `relative ${props.class ?? ""}`;
    },
    get classList() {
      return {
        "img-arrow-highlight": !props.right,
        "img-arrow-highlight-flipped": props.right,
        hidden: isHidden()
      };
    },
    name: "ArrowButton",
    get children() {
      var _el$ = _tmpl$();
      createRenderEffect((_p$) => {
        var _v$ = !props.disabled, _v$2 = !!props.disabled, _v$3 = !props.right, _v$4 = !!props.right;
        _v$ !== _p$.e && _el$.classList.toggle("opacity-0", _p$.e = _v$);
        _v$2 !== _p$.t && _el$.classList.toggle("opacity-1", _p$.t = _v$2);
        _v$3 !== _p$.a && _el$.classList.toggle("img-arrow-disabled", _p$.a = _v$3);
        _v$4 !== _p$.o && _el$.classList.toggle("img-arrow-disabled-flipped", _p$.o = _v$4);
        return _p$;
      }, {
        e: void 0,
        t: void 0,
        a: void 0,
        o: void 0
      });
      return _el$;
    }
  }));
};
const ArrowButton = ComponentRegistry.register({
  name: "ArrowButton",
  createInstance: ArrowButtonComponent,
  images: ["blp:base_component-arrow", "blp:base_component-arrow_dis"]
});

export { ArrowButton };
//# sourceMappingURL=arrow-button.js.map

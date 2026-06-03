import { template, className, insert } from '../../vendor/solid-js/web/dist/web.js';
import { createMemo, createComponent, mergeProps, createRenderEffect } from '../../vendor/solid-js/dist/solid.js';
import { ComponentRegistry } from '../services/component-registry.js';
import { ViewExperience } from '../services/view-experience.js';
import { Activatable } from './activatable.js';

var _tmpl$ = /* @__PURE__ */ template(`<div><div></div><div class="absolute inset-0 opacity-0 group-hover\\:opacity-100 group-focus\\:opacity-100 group-pressed\\:opacity-100 transition-opacity"></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="flex flex-row justify-center items-center"></div>`);
var RadioButtonSize = /* @__PURE__ */ ((RadioButtonSize2) => {
  RadioButtonSize2["SMALL"] = "small";
  RadioButtonSize2["LARGE"] = "large";
  RadioButtonSize2["STANDARD"] = "standard";
  return RadioButtonSize2;
})(RadioButtonSize || {});
const RadioButtonComponent = (props) => {
  props.audio ??= {};
  props.audio.group = "radio-button";
  const isMobile = createMemo(() => ViewExperience() == UIViewExperience.Mobile);
  const isHighRes = createMemo(() => props.highRes == true);
  const sizeConfig = {
    ["small" /* SMALL */]: {
      button: "size-6",
      ball: "img-radio-button-ball-sm"
    },
    ["large" /* LARGE */]: {
      button: "size-10",
      ball: "img-radio-button-ball-lg"
    },
    ["standard" /* STANDARD */]: {
      button: "size-8",
      ball: "img-radio-button-ball"
    }
  };
  const sizeStyles = createMemo(() => {
    const mode = isMobile() ? "large" /* LARGE */ : props.size ?? "standard" /* STANDARD */;
    return sizeConfig[mode];
  });
  return createComponent(Activatable, mergeProps(props, {
    get ["class"]() {
      return `flex flex-row group justify-center items-center ${props.class ?? ""}`;
    },
    name: "RadioButton",
    get children() {
      return [(() => {
        var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling;
        createRenderEffect((_p$) => {
          var _v$ = "img-radio-button cursor-pointer pointer-events-auto relative flex justify-center items-center " + sizeStyles().button, _v$2 = !!isHighRes(), _v$3 = sizeStyles().ball, _v$4 = !props.isChecked, _v$5 = !!isHighRes(), _v$6 = !props.isChecked, _v$7 = !!props.isChecked, _v$8 = !!isHighRes();
          _v$ !== _p$.e && className(_el$, _p$.e = _v$);
          _v$2 !== _p$.t && _el$.classList.toggle("high-res", _p$.t = _v$2);
          _v$3 !== _p$.a && className(_el$2, _p$.a = _v$3);
          _v$4 !== _p$.o && _el$2.classList.toggle("opacity-0", _p$.o = _v$4);
          _v$5 !== _p$.i && _el$2.classList.toggle("high-res", _p$.i = _v$5);
          _v$6 !== _p$.n && _el$3.classList.toggle("img-radio-button-focus", _p$.n = _v$6);
          _v$7 !== _p$.s && _el$3.classList.toggle("img-radio-button-on-focus", _p$.s = _v$7);
          _v$8 !== _p$.h && _el$3.classList.toggle("high-res", _p$.h = _v$8);
          return _p$;
        }, {
          e: void 0,
          t: void 0,
          a: void 0,
          o: void 0,
          i: void 0,
          n: void 0,
          s: void 0,
          h: void 0
        });
        return _el$;
      })(), (() => {
        var _el$4 = _tmpl$2();
        insert(_el$4, () => props.children);
        return _el$4;
      })()];
    }
  }));
};
const RadioButton = ComponentRegistry.register({
  name: "RadioButton",
  createInstance: RadioButtonComponent,
  images: ["blp:base_radio-bg", "blp:base_radio-ball", "blp:base_radio-bg-focus", "blp:base_radio-bg-on-focus", "blp:base_radio-bg_highRes", "blp:base_radio-ball_highRes", "blp:base_radio-bg-focus_highRes", "blp:base_radio-bg-on-focus_highRes"]
});

export { RadioButton, RadioButtonSize };
//# sourceMappingURL=radio-button.js.map

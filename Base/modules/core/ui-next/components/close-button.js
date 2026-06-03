import { template } from '../../vendor/solid-js/web/dist/web.js';
import { Activatable } from './activatable.js';
import { ComponentRegistry } from '../services/component-registry.js';
import { IsControllerActive } from '../services/input.js';
import { createComponent, mergeProps } from '../../vendor/solid-js/dist/solid.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="close-button__bg absolute inset-0"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="close-button__bg-hover absolute inset-0 opacity-0 group-hover\\:opacity-100 group-focus\\:opacity-100 transition-opacity"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="close-button__bg-pressed absolute inset-0 opacity-0 group-active\\:opacity-100 group-pressed\\:opacity-100"></div>`);
const CloseButtonComponent = (props) => {
  return createComponent(Activatable, mergeProps(props, {
    get audio() {
      return {
        ...props.audio,
        onPress: props.audio?.onPress ?? "data-audio-primary-button-press",
        onFocus: props.audio?.onFocus ?? "data-audio-primary-button-focus"
      };
    },
    get ["class"]() {
      return `size-12 cursor-pointer group ${props.class ?? "relative"}`;
    },
    get classList() {
      return {
        hidden: IsControllerActive()
      };
    },
    get disableFocus() {
      return IsControllerActive();
    },
    hotkeyAction: "cancel",
    get navTrayText() {
      return props.navTrayText ?? "LOC_GENERIC_BACK";
    },
    name: "CloseButton",
    get children() {
      return [_tmpl$(), _tmpl$2(), _tmpl$3()];
    }
  }));
};
const CloseButton = ComponentRegistry.register({
  name: "CloseButton",
  createInstance: CloseButtonComponent,
  images: ["blp:hud_closebutton", "blp:hud_closebutton_hover", "blp:hud_closebutton_pressed"]
});

export { CloseButton };
//# sourceMappingURL=close-button.js.map

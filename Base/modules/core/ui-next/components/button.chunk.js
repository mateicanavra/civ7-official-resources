import { t as template, e as createComponent, m as mergeProps, i as insert, C as ComponentRegistry } from './panel.chunk.js';
import { A as Activatable } from './l10n.chunk.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="absolute inset-0"><div class="absolute inset-0 fxs-button__bg fxs-button__bg--base"></div><div class="absolute inset-0 opacity-0 fxs-button__bg fxs-button__bg--focus"></div><div class="absolute inset-0 opacity-0 fxs-button__bg fxs-button__bg--active"></div><div class="absolute inset-0 opacity-0 fxs-button__bg fxs-button__bg--disabled"></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="relative flex flex-auto items-center justify-center"></div>`);
const ButtonComponent = (props) => {
  props.audio ??= {};
  props.audio.onPress ??= "data-audio-primary-button-press";
  props.audio.onFocus ??= "data-audio-primary-button-focus";
  return createComponent(Activatable, mergeProps(props, {
    get ["class"]() {
      return `fxs-button relative flex min-h-11\\.5" items-center justify-center px-4 py-1 font-title text-base text-accent-1 uppercase tracking-150 text-shadow-subtle leading-none text-center ${props.class ?? ""}`;
    },
    name: "Button",
    get children() {
      return [_tmpl$(), (() => {
        var _el$2 = _tmpl$2();
        insert(_el$2, () => props.children);
        return _el$2;
      })()];
    }
  }));
};
const Button = ComponentRegistry.register({
  name: "Button",
  createInstance: ButtonComponent,
  images: ["blp:base_button-bg.png", "blp:base_button-bg-focus.png", "blp:base_button-bg-press.png", "blp:base_button-bg-dis.png"]
});

export { Button as B };
//# sourceMappingURL=button.chunk.js.map

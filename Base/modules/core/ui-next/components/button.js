import { template, insert } from '../../vendor/solid-js/web/dist/web.js';
import { createSignal, createEffect, mergeProps, createComponent } from '../../vendor/solid-js/dist/solid.js';
import { ComponentRegistry } from '../services/component-registry.js';
import { Activatable } from './activatable.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="absolute inset-0"><div class="absolute inset-0 fxs-button__bg fxs-button__bg--base"></div><div class="absolute inset-0 opacity-0 fxs-button__bg fxs-button__bg--focus"></div><div class="absolute inset-0 opacity-0 fxs-button__bg fxs-button__bg--active"></div><div class="absolute inset-0 opacity-0 fxs-button__bg fxs-button__bg--disabled"></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="relative flex flex-auto items-center justify-center"></div>`);
const ButtonComponent = (props) => {
  const [mergedProps, setMergedProps] = createSignal({
    size: "standard"
  });
  createEffect(() => {
    const audioObject = props.audio ?? {};
    audioObject.onPress ??= "data-audio-primary-button-press";
    audioObject.onFocus ??= "data-audio-primary-button-focus";
    const defaultProps = {
      audio: audioObject,
      size: "standard"
    };
    const finalPropsObject = mergeProps(defaultProps, props);
    setMergedProps(finalPropsObject);
  });
  return createComponent(Activatable, mergeProps(mergedProps, {
    get ["class"]() {
      return `fxs-button relative flex min-h-11\\.5" items-center justify-center font-title text-base text-accent-1 uppercase tracking-150 text-shadow-subtle leading-none text-center ${props.class ?? ""}`;
    },
    get classList() {
      return {
        "px-4 py-1": mergedProps().size == "standard",
        "px-3 fxs-button-small": mergedProps().size == "small"
      };
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

export { Button };
//# sourceMappingURL=button.js.map

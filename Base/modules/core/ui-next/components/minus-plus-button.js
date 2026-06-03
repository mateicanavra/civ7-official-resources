import { template } from '../../vendor/solid-js/web/dist/web.js';
import { createSignal, createEffect, mergeProps, createComponent, createRenderEffect, Show } from '../../vendor/solid-js/dist/solid.js';
import { Activatable } from './activatable.js';
import { NavHelp } from './nav-help.js';
import { ComponentRegistry } from '../services/component-registry.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="absolute inset-0"><div class="absolute -inset-1\\.5 img-questopen bg-no-repeat bg-center bg-contain"></div><div class="absolute -inset-1\\.5 bg-no-repeat bg-center bg-contain img-questopen-highlight transition-opacity opacity-0 group-hover\\:opacity-100 group-focus\\:opacity-100 group-pressed\\:opacity-100"></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="absolute inset-0"><div class="absolute -inset-1\\.5 img-questclose bg-no-repeat bg-center bg-contain"></div><div class="absolute -inset-1\\.5 bg-no-repeat bg-center bg-contain img-questclose-highlight transition-opacity opacity-0 group-hover\\:opacity-100 group-focus\\:opacity-100 group-pressed\\:opacity-100"></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="absolute -inset-3"></div>`);
const MinusPlusButtonComponent = (props) => {
  const [mergedProps, setMergedProps] = createSignal({
    type: "minus",
    dataDisabled: false
  });
  createEffect(() => {
    const audioObject = props.audio ?? {};
    audioObject.onPress ??= "data-audio-min-plus-button-press";
    audioObject.onFocus ??= "data-audio-min-plus-button-focus";
    const defaultProps = {
      audio: audioObject,
      type: "minus",
      dataDisabled: false
    };
    const finalPropsObject = mergeProps(defaultProps, props);
    setMergedProps(finalPropsObject);
  });
  return createComponent(Activatable, mergeProps(mergedProps, {
    get disabled() {
      return mergedProps().dataDisabled;
    },
    get ["class"]() {
      return `relative p-1 cursor-pointer pointer-events-auto group flex items-center justify-center ${props.class ?? ""}`;
    },
    get classList() {
      return {
        "size-5": UI.getViewExperience() != UIViewExperience.Mobile,
        "size-6": UI.getViewExperience() == UIViewExperience.Mobile,
        "opacity-50": mergedProps().dataDisabled,
        ...props.classList
      };
    },
    name: "MinusPlusButton",
    get children() {
      return [(() => {
        var _el$ = _tmpl$();
        createRenderEffect(() => _el$.classList.toggle("opacity-0", !!(mergedProps().type == "minus")));
        return _el$;
      })(), (() => {
        var _el$2 = _tmpl$2();
        createRenderEffect(() => _el$2.classList.toggle("opacity-0", !!(mergedProps().type == "plus")));
        return _el$2;
      })(), (() => {
        var _el$3 = _tmpl$3();
        createRenderEffect(() => _el$3.classList.toggle("hidden", !!(UI.getViewExperience() != UIViewExperience.Mobile)));
        return _el$3;
      })(), createComponent(Show, {
        get when() {
          return !mergedProps().dataDisabled;
        },
        get children() {
          return createComponent(NavHelp, {
            "class": "absolute"
          });
        }
      })];
    }
  }));
};
const MinusPlusButton = ComponentRegistry.register({
  name: "MinusPlusButton",
  createInstance: MinusPlusButtonComponent,
  images: ["blp:hud_quest_open", "blp:hud_quest_open_hov", "blp:hud_quest_close", "blp:hud_quest_close_hov"]
});

export { MinusPlusButton };
//# sourceMappingURL=minus-plus-button.js.map

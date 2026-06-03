import { template, insert } from '../../vendor/solid-js/web/dist/web.js';
import { createMemo, createComponent, mergeProps, createRenderEffect } from '../../vendor/solid-js/dist/solid.js';
import { ComponentRegistry } from '../services/component-registry.js';
import { Activatable } from './activatable.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="absolute inset-0 opacity-0 bg-herobutton-gradient"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="absolute inset-x-0 top-0 bottom-0 flex flex-row"><div class="flex-1 bg-herobutton-sideframe"></div><div class="flex-1 bg-herobutton-sideframe -rotate-y-180"></div><div class="absolute inset-0 flex justify-center"><div class="w-11 bg-herobutton-centerpiece"></div></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="relative flex flex-row py-3 px-5 justify-center items-center"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="absolute inset-0 opacity-0 hero-button-2-gradient"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="absolute inset-0 flex flex-row"><div class="flex-1 hero-button-2-sideframe"></div><div class="flex-1 hero-button-2-sideframe -rotate-y-180"></div><div class="absolute inset-0 flex justify-center"><div class=hero-button-2-centerpiece></div></div></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="relative flex flex-row py-3 px-7 justify-center items-center"></div>`);
const HeroButtonComponent = (props) => {
  props.audio ??= {};
  props.audio.onActivate ??= "data-audio-hero-activate";
  props.audio.onPress ??= "data-audio-hero-press";
  props.audio.onFocus ??= "data-audio-hero-focus";
  const widthClass = createMemo(() => props.class?.includes("min-w-") ? "" : "min-w-80");
  return createComponent(Activatable, mergeProps(props, {
    get ["class"]() {
      return `fxs-hero-button relative flex min-h-11\\.5 items-center justify-center ${widthClass()} font-title font-bold uppercase text-base text-accent-1 tracking-150 mt-6 text-shadow-subtle leading-none text-center
			${props.class ?? ""}`;
    },
    name: "HeroButton",
    get children() {
      return [_tmpl$(), _tmpl$2(), (() => {
        var _el$3 = _tmpl$3();
        insert(_el$3, () => props.children);
        return _el$3;
      })()];
    }
  }));
};
const HeroButton = ComponentRegistry.register({
  name: "HeroButton",
  createInstance: HeroButtonComponent,
  images: ["blp:hud_herobutton_centerpiece", "blp:hud_herobutton_centerpiece-dis", "blp:hud_herobutton_sideframe", "blp:hud_herobutton_sideframe-dis"]
});
const HeroButton2Component = (props) => {
  props.audio ??= {};
  props.audio.onActivate ??= "data-audio-hero-activate";
  props.audio.onPress ??= "data-audio-hero-press";
  props.audio.onFocus ??= "data-audio-hero-focus";
  const widthClass = createMemo(() => props.class?.includes("min-w-") ? "" : "min-w-80");
  return createComponent(Activatable, mergeProps(props, {
    get ["class"]() {
      return `hero-button-2 relative flex flex-col h-13 justify-center ${widthClass()} font-title uppercase text-base text-accent-1 tracking-150 mt-4 text-shadow-subtle leading-none text-center ${props.class ?? ""}`;
    },
    get classList() {
      return {
        ...props.classList,
        disabled: props.disabled
      };
    },
    name: "HeroButton2",
    get children() {
      return [_tmpl$4(), (() => {
        var _el$5 = _tmpl$5(), _el$6 = _el$5.firstChild, _el$7 = _el$6.nextSibling, _el$8 = _el$7.nextSibling, _el$9 = _el$8.firstChild;
        createRenderEffect((_p$) => {
          var _v$ = !!props.disabled, _v$2 = !!props.disabled, _v$3 = !!props.disabled;
          _v$ !== _p$.e && _el$6.classList.toggle("disabled", _p$.e = _v$);
          _v$2 !== _p$.t && _el$7.classList.toggle("disabled", _p$.t = _v$2);
          _v$3 !== _p$.a && _el$9.classList.toggle("disabled", _p$.a = _v$3);
          return _p$;
        }, {
          e: void 0,
          t: void 0,
          a: void 0
        });
        return _el$5;
      })(), (() => {
        var _el$10 = _tmpl$6();
        insert(_el$10, () => props.children);
        return _el$10;
      })()];
    }
  }));
};
const HeroButton2 = ComponentRegistry.register({
  name: "HeroButton2",
  createInstance: HeroButton2Component,
  images: ["blp:hud_herobutton_centerpiece2", "blp:hud_herobutton_centerpiece2-dis", "blp:hud_herobutton2_sideframe", "blp:hud_herobutton2_sideframe-dis"]
});

export { HeroButton, HeroButton2 };
//# sourceMappingURL=hero-button.js.map

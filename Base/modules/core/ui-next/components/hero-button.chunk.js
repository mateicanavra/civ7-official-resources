import { t as template, k as spread, m as mergeProps, i as insert, f as createRenderEffect, g as className, C as ComponentRegistry, e as createComponent } from './panel.chunk.js';
import { A as Activatable } from './l10n.chunk.js';

var _tmpl$$1 = /* @__PURE__ */ template(`<div></div>`), _tmpl$2$1 = /* @__PURE__ */ template(`<div><div></div><div></div></div>`);
const FiligreeH1 = (props) => {
  return (() => {
    var _el$ = _tmpl$$1();
    spread(_el$, mergeProps(props, {
      get ["class"]() {
        return `filigree-divider-h1 ${[props.class ?? ""]}`;
      },
      "data-name": "Filigree.H1"
    }), false, false);
    return _el$;
  })();
};
const FiligreeH2 = (props) => {
  return (() => {
    var _el$2 = _tmpl$$1();
    spread(_el$2, mergeProps(props, {
      get ["class"]() {
        return `filigree-divider-h2 ${[props.class ?? ""]}`;
      },
      "data-name": "Filigree.H2"
    }), false, false);
    return _el$2;
  })();
};
const FiligreeH3 = (props) => {
  return (() => {
    var _el$3 = _tmpl$$1();
    spread(_el$3, mergeProps(props, {
      get ["class"]() {
        return `filigree-divider-h3 ${[props.class ?? ""]}`;
      },
      "data-name": "Filigree.H3"
    }), false, false);
    return _el$3;
  })();
};
const FiligreeH4 = (props) => {
  return (() => {
    var _el$4 = _tmpl$2$1(), _el$5 = _el$4.firstChild, _el$6 = _el$5.nextSibling;
    spread(_el$4, mergeProps(props, {
      get ["class"]() {
        return `flex flex-row justify-center items-center ${[props.class ?? ""]}`;
      },
      "data-name": "Filigree.H4"
    }), false, true);
    insert(_el$4, () => props.children, _el$6);
    createRenderEffect((_p$) => {
      var _v$ = `filigree-h4-left ${props.filigreeClass}`, _v$2 = `filigree-h4-right ${props.filigreeClass}`;
      _v$ !== _p$.e && className(_el$5, _p$.e = _v$);
      _v$2 !== _p$.t && className(_el$6, _p$.t = _v$2);
      return _p$;
    }, {
      e: void 0,
      t: void 0
    });
    return _el$4;
  })();
};
const FiligreeSmall = (props) => {
  return (() => {
    var _el$7 = _tmpl$$1();
    spread(_el$7, mergeProps(props, {
      get ["class"]() {
        return `filigree-shell-small mt-2\\.5 ${[props.class ?? ""]}`;
      },
      "data-name": "Filigree.Small"
    }), false, false);
    return _el$7;
  })();
};
const Filigree = {
  /**
   * A filigree designed to be used beneath H1 text
   *
   * Default implementation: {@link FiligreeH1}
   */
  H1: ComponentRegistry.register({
    name: "Filigree.H1",
    createInstance: FiligreeH1,
    images: ["blp:header_filigree.png"]
  }),
  /**
   * A filigree designed to be used beneath H2 text
   *
   * Default implementation: {@link FiligreeH2}
   */
  H2: ComponentRegistry.register({
    name: "Filigree.H2",
    createInstance: FiligreeH2,
    images: ["blp:hud_divider-h2.png"]
  }),
  /**
   * A filigree designed to be used beneath H3 text
   *
   * Default implementation: {@link FiligreeH3}
   */
  H3: ComponentRegistry.register({
    name: "Filigree.H3",
    createInstance: FiligreeH3,
    images: ["blp:hud_sidepanel_divider.png"]
  }),
  /**
   * A filigree designed to be used around H4 text
   *
   * Default implementation: {@link FiligreeH4}
   */
  H4: ComponentRegistry.register({
    name: "Filigree.H4",
    createInstance: FiligreeH4,
    images: ["blp:hud_fleur.png"]
  }),
  /**
   * A filigree designed to be used as a small horizotnal divider
   *
   * Default implementation: {@link FiligreeSmall}
   */
  Small: ComponentRegistry.register({
    name: "Filigree.Small",
    createInstance: FiligreeSmall,
    images: ["blp:shell_small-filigree.png"]
  })
};

var _tmpl$ = /* @__PURE__ */ template(`<div class="absolute inset-0 opacity-0 bg-herobutton-gradient"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="absolute inset-x-0 top-0 bottom-0 flex flex-row"><div class="flex-1 bg-herobutton-sideframe"></div><div class="flex-1 bg-herobutton-sideframe -rotate-y-180"></div><div class="absolute inset-0 flex justify-center"><div class="w-11 bg-herobutton-centerpiece"></div></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="relative flex flex-row py-3 px-5 justify-center items-center"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="absolute inset-0 opacity-0 hero-button-2-gradient"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="absolute inset-0 flex flex-row"><div class="flex-1 hero-button-2-sideframe"></div><div class="flex-1 hero-button-2-sideframe -rotate-y-180"></div><div class="absolute inset-0 flex justify-center"><div class=hero-button-2-centerpiece></div></div></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="relative flex flex-row py-3 px-7 justify-center items-center"></div>`);
const HeroButtonComponent = (props) => {
  props.audio ??= {};
  props.audio.onActivate ??= "data-audio-hero-activate";
  props.audio.onPress ??= "data-audio-hero-press";
  props.audio.onFocus ??= "data-audio-hero-focus";
  return createComponent(Activatable, mergeProps(props, {
    get ["class"]() {
      return `fxs-hero-button relative flex min-h-11\\.5 items-center justify-center min-w-80 font-title font-bold uppercase text-base text-accent-1 tracking-150 mt-6 text-shadow-subtle leading-none text-center
			${props.class}`;
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
  return createComponent(Activatable, mergeProps(props, {
    get ["class"]() {
      return `hero-button-2 relative flex h-13 items-center justify-center min-w-80 font-title uppercase text-base text-accent-1 tracking-150 mt-4 text-shadow-subtle leading-none text-center ${props.class}`;
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

export { Filigree as F, HeroButton as H, HeroButton2 as a };
//# sourceMappingURL=hero-button.chunk.js.map

import { template, spread, insert, className } from '../../vendor/solid-js/web/dist/web.js';
import { mergeProps, createRenderEffect, createComponent, Show, createMemo } from '../../vendor/solid-js/dist/solid.js';
import { ComponentRegistry } from '../services/component-registry.js';

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div><div></div><div></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="w-64 bg-contain bg-no-repeat bg-center -mr-3"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="size-16 bg-contain bg-no-repeat bg-center absolute -top-5"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="size-20 bg-contain bg-no-repeat bg-center absolute flex justify-center items-center -mt-6"><div></div></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="w-64 bg-contain bg-no-repeat bg-center -ml-3"></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="w-16 bg-contain bg-no-repeat bg-center -mx-6"></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class=relative><div class="absolute bg-contain bg-no-repeat bg-center self-center"></div><div class="absolute bg-no-repeat bg-center -left-2"></div><div class="absolute bg-no-repeat bg-center -right-2"></div></div>`);
const FiligreeH1 = (props) => {
  return (() => {
    var _el$ = _tmpl$();
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
    var _el$2 = _tmpl$();
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
    var _el$3 = _tmpl$();
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
    var _el$4 = _tmpl$2(), _el$5 = _el$4.firstChild, _el$6 = _el$5.nextSibling;
    spread(_el$4, mergeProps(props, {
      get ["class"]() {
        return `flex flex-row justify-center items-center ${[props.class ?? ""]}`;
      },
      get ["data-name"]() {
        return props.name ?? "Filigree.H4";
      }
    }), false, true);
    insert(_el$4, () => props.children, _el$6);
    createRenderEffect((_p$) => {
      var _v$ = `filigree-h4-left ${props.filigreeClass ?? ""}`, _v$2 = `filigree-h4-right ${props.filigreeClass ?? ""}`;
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
    var _el$7 = _tmpl$();
    spread(_el$7, mergeProps(props, {
      get ["class"]() {
        return `filigree-shell-small mt-2\\.5 ${[props.class ?? ""]}`;
      },
      "data-name": "Filigree.Small"
    }), false, false);
    return _el$7;
  })();
};
const FiligreeTitleAccent = (props) => {
  return (() => {
    var _el$8 = _tmpl$2(), _el$9 = _el$8.firstChild, _el$10 = _el$9.nextSibling;
    spread(_el$8, mergeProps(props, {
      get ["class"]() {
        return `flex flex-row justify-center items-center ${[props.class ?? ""]}`;
      },
      get ["data-name"]() {
        return props.name ?? "Filigree.TitleAccent";
      }
    }), false, true);
    insert(_el$8, () => props.children, _el$10);
    createRenderEffect((_p$) => {
      var _v$3 = `filigree-title-accent-left mr-6 mt-1 ${props.filigreeClass ?? ""}`, _v$4 = `filigree-title-accent-right ml-6 mt-1${props.filigreeClass ?? ""}`;
      _v$3 !== _p$.e && className(_el$9, _p$.e = _v$3);
      _v$4 !== _p$.t && className(_el$10, _p$.t = _v$4);
      return _p$;
    }, {
      e: void 0,
      t: void 0
    });
    return _el$8;
  })();
};
const FiligreeGoldFrame = (props) => {
  return createComponent(Show, {
    get when() {
      return !props.hideDecoration;
    },
    get fallback() {
      return props.children;
    },
    get children() {
      return [(() => {
        var _el$11 = _tmpl$();
        createRenderEffect(() => className(_el$11, `${props.topClass ?? ""} filigree-inner-frame-top-gold`));
        return _el$11;
      })(), createMemo(() => props.children), (() => {
        var _el$12 = _tmpl$();
        createRenderEffect(() => className(_el$12, `${props.bottomClass ?? ""} filigree-inner-frame-bottom-gold`));
        return _el$12;
      })()];
    }
  });
};
const FiligreeTopIcon = (props) => {
  return [(() => {
    var _el$13 = _tmpl$3();
    _el$13.style.setProperty("background-image", "url(blp:base_top-filigree_left)");
    return _el$13;
  })(), createComponent(Show, {
    get when() {
      return props.topIconSrc !== void 0;
    },
    get fallback() {
      return (() => {
        var _el$18 = _tmpl$7();
        _el$18.style.setProperty("background-image", "url(blp:base_top-filigree_center)");
        return _el$18;
      })();
    },
    get children() {
      return [(() => {
        var _el$14 = _tmpl$4();
        _el$14.style.setProperty("background-image", "url(blp:subsystem_panel_header_icon_backing)");
        createRenderEffect((_$p) => (_$p = props.topIconBackgroundTint) != null ? _el$14.style.setProperty("fxs-background-image-tint", _$p) : _el$14.style.removeProperty("fxs-background-image-tint"));
        return _el$14;
      })(), (() => {
        var _el$15 = _tmpl$5(), _el$16 = _el$15.firstChild;
        _el$15.style.setProperty("background-image", "url(blp:pedia_circle_frame)");
        createRenderEffect((_p$) => {
          var _v$5 = `${props.topIconClass ?? "size-14"} bg-contain bg-no-repeat bg-center -mt-1`, _v$6 = props.topIconSrc, _v$7 = props.topIconTint;
          _v$5 !== _p$.e && className(_el$16, _p$.e = _v$5);
          _v$6 !== _p$.t && ((_p$.t = _v$6) != null ? _el$16.style.setProperty("background-image", _v$6) : _el$16.style.removeProperty("background-image"));
          _v$7 !== _p$.a && ((_p$.a = _v$7) != null ? _el$16.style.setProperty("fxs-background-image-tint", _v$7) : _el$16.style.removeProperty("fxs-background-image-tint"));
          return _p$;
        }, {
          e: void 0,
          t: void 0,
          a: void 0
        });
        return _el$15;
      })()];
    }
  }), (() => {
    var _el$17 = _tmpl$6();
    _el$17.style.setProperty("background-image", "url(blp:base_top-filigree_right)");
    return _el$17;
  })()];
};
const FiligreeWide = () => {
  return (() => {
    var _el$19 = _tmpl$8(), _el$20 = _el$19.firstChild, _el$21 = _el$20.nextSibling, _el$22 = _el$21.nextSibling;
    _el$19.style.setProperty("width", "100%");
    _el$19.style.setProperty("height", "5vh");
    _el$19.style.setProperty("margin-top", "-0.0vh");
    _el$20.style.setProperty("background-image", "url(blp:popup_paneltop_wide)");
    _el$20.style.setProperty("width", "40%");
    _el$20.style.setProperty("height", "5vh");
    _el$21.style.setProperty("background-image", "url(blp:popup_paneltop_wide)");
    _el$21.style.setProperty("width", "35%");
    _el$21.style.setProperty("height", "5vh");
    _el$21.style.setProperty("background-position", "left bottom");
    _el$21.style.setProperty("background-size", "500% 100%");
    _el$22.style.setProperty("background-image", "url(blp:popup_paneltop_wide)");
    _el$22.style.setProperty("width", "35%");
    _el$22.style.setProperty("height", "5vh");
    _el$22.style.setProperty("background-position", "right bottom");
    _el$22.style.setProperty("background-size", "500% 100%");
    return _el$19;
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
  }),
  /**
   * A filigree designed to be used around a title text to provide accent either side
   *
   * Default implementation: {@link FiligreeTitleAccent}
   */
  TitleAccent: ComponentRegistry.register({
    name: "Filigree.TitleAccent",
    createInstance: FiligreeTitleAccent,
    images: ["blp:title_accent_filigree"]
  }),
  /**
  /**
   * A filigree designed to be used as a gold frame around some content
   *
   * Default implementation: {@link FiligreeGoldFrame}
   */
  GoldFrame: ComponentRegistry.register({
    name: "Filigree.GoldFrame",
    createInstance: FiligreeGoldFrame,
    images: ["blp:hud_section-line_gold.png"]
  }),
  /**
   * A filigree that takes in an icon to display in the middle of itself with css parameters
   *
   * Default implementation: {@link FiligreeTopIcon}
   */
  TopIcon: ComponentRegistry.register({
    name: "Filigree.FiligreeTopIcon",
    createInstance: FiligreeTopIcon,
    images: ["blp:base_top-filigree_left", "blp:base_top-filigree_center", "blp:subsystem_panel_header_icon_backing", "blp:pedia_circle_frame", "blp:base_top-filigree_right"]
  }),
  /**
   * An extra long filigree for framing the top of a panel
   *
   * Default implementation: {@link FiligreeWide}
   */
  Wide: ComponentRegistry.register({
    name: "Filigree.FiligreeWide",
    createInstance: FiligreeWide,
    images: ["blp:popup_paneltop_wide"]
  })
};

export { Filigree };
//# sourceMappingURL=filigree.js.map

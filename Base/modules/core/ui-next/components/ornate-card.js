import { template, spread, insert } from '../../vendor/solid-js/web/dist/web.js';
import { splitProps, mergeProps, createComponent, Show, createRenderEffect } from '../../vendor/solid-js/dist/solid.js';
import { Icon } from './icon.js';
import { useImageCache } from './image-cache.js';
import { ComponentRegistry } from '../services/component-registry.js';

var _tmpl$ = /* @__PURE__ */ template(`<div><div class="absolute top-4 left-1 rotate-180 size-4 bg-contain"></div><div class="absolute top-4 right-1 -rotate-90 size-4 bg-contain"></div><div class="absolute bottom-1 left-1 rotate-90 size-4 bg-contain"></div><div class="absolute bottom-1 right-1 size-4 bg-contain"></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div><div class="absolute top-1 left-1 rotate-180 size-4 bg-contain opacity-50"></div><div class="absolute top-1 right-1 -rotate-90 size-4 bg-contain opacity-50"></div><div class="absolute bottom-1 left-1 rotate-90 size-4 bg-contain opacity-50"></div><div class="absolute bottom-1 right-1 size-4 bg-contain opacity-50"></div></div>`);
const OrnateCardSymbol = Symbol();
const OrnateCardComponent = (props) => {
  const [local, other] = splitProps(props, ["iconSrc", "iconElement", "childrenInFront", "class", "children"]);
  const images = {
    CornerAdornment: "blp:mp_player_detail"
  };
  const imageCache = useImageCache();
  imageCache.registerImages(OrnateCardSymbol, Object.values(images));
  const CornerAdornmentCSS = `url(${images.CornerAdornment})`;
  return (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling, _el$4 = _el$3.nextSibling, _el$5 = _el$4.nextSibling;
    spread(_el$, mergeProps(other, {
      get ["class"]() {
        return `ornate-card-bg relative ${local.iconSrc != void 0 ? "mt-7" : "pt-2"} ${local.class ?? ""}`;
      },
      "data-name": "Ornate-Card"
    }), false, true);
    CornerAdornmentCSS != null ? _el$2.style.setProperty("background-image", CornerAdornmentCSS) : _el$2.style.removeProperty("background-image");
    CornerAdornmentCSS != null ? _el$3.style.setProperty("background-image", CornerAdornmentCSS) : _el$3.style.removeProperty("background-image");
    CornerAdornmentCSS != null ? _el$4.style.setProperty("background-image", CornerAdornmentCSS) : _el$4.style.removeProperty("background-image");
    CornerAdornmentCSS != null ? _el$5.style.setProperty("background-image", CornerAdornmentCSS) : _el$5.style.removeProperty("background-image");
    insert(_el$, () => local.children, null);
    insert(_el$, createComponent(Show, {
      get when() {
        return local.iconSrc;
      },
      get fallback() {
        return createComponent(Show, {
          get when() {
            return local.iconElement;
          },
          get children() {
            return local.iconElement;
          }
        });
      },
      get children() {
        return createComponent(Icon, {
          "class": "size-12 absolute -top-6 self-center",
          get name() {
            return local.iconSrc;
          }
        });
      }
    }), null);
    insert(_el$, () => local.childrenInFront, null);
    return _el$;
  })();
};
const OrnateCard = ComponentRegistry.register({
  name: "OrnateCard",
  createInstance: OrnateCardComponent
});
const MinimalOrnateCardSymbol = Symbol();
const MinimalOrnateCardComponent = (props) => {
  const [local, other] = splitProps(props, ["iconElement", "isBright", "class", "children"]);
  const images = {
    CornerAdornmentCSS: "url(blp:mp_player_detail)"
  };
  const imageCache = useImageCache();
  imageCache.registerImages(MinimalOrnateCardSymbol, Object.values(images));
  return (() => {
    var _el$6 = _tmpl$2(), _el$7 = _el$6.firstChild, _el$8 = _el$7.nextSibling, _el$9 = _el$8.nextSibling, _el$10 = _el$9.nextSibling;
    spread(_el$6, mergeProps(other, {
      get ["class"]() {
        return `${local.isBright ? "minimal-card-bg-bright" : "minimal-card-bg"} relative ${local.class ?? ""}`;
      },
      "data-name": "Minimal-Card"
    }), false, true);
    insert(_el$6, () => local.children, null);
    insert(_el$6, createComponent(Show, {
      get when() {
        return local.iconElement;
      },
      get children() {
        return local.iconElement;
      }
    }), null);
    createRenderEffect((_p$) => {
      var _v$ = images.CornerAdornmentCSS, _v$2 = images.CornerAdornmentCSS, _v$3 = images.CornerAdornmentCSS, _v$4 = images.CornerAdornmentCSS;
      _v$ !== _p$.e && ((_p$.e = _v$) != null ? _el$7.style.setProperty("background-image", _v$) : _el$7.style.removeProperty("background-image"));
      _v$2 !== _p$.t && ((_p$.t = _v$2) != null ? _el$8.style.setProperty("background-image", _v$2) : _el$8.style.removeProperty("background-image"));
      _v$3 !== _p$.a && ((_p$.a = _v$3) != null ? _el$9.style.setProperty("background-image", _v$3) : _el$9.style.removeProperty("background-image"));
      _v$4 !== _p$.o && ((_p$.o = _v$4) != null ? _el$10.style.setProperty("background-image", _v$4) : _el$10.style.removeProperty("background-image"));
      return _p$;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0
    });
    return _el$6;
  })();
};
const MinimalOrnateCard = ComponentRegistry.register({
  name: "MinimalOrnateCard",
  createInstance: MinimalOrnateCardComponent
});

export { MinimalOrnateCard, OrnateCard };
//# sourceMappingURL=ornate-card.js.map

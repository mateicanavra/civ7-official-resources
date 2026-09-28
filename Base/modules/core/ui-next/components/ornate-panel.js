import { template, spread, use, insert, className } from '../../vendor/solid-js/web/dist/web.js';
import { mergeProps, splitProps, createMemo, onMount, createEffect, untrack, onCleanup, createComponent, Show, Switch, Match, createRenderEffect } from '../../vendor/solid-js/dist/solid.js';
import { Filigree } from './filigree.js';
import { ComponentRegistry } from '../services/component-registry.js';
import { ImageCache } from '../utilities/image-cache.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="w-full h-16 flex flex-row justify-center -mt-9 relative"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="size-64 absolute top-8 left-8 bg-contain bg-no-repeat"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="size-64 absolute top-8 right-8 bg-contain bg-no-repeat rotate-90"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="absolute inset-0 mx-4 my-5"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div><div><div class="size-full opacity-0 bg-center bg-no-repeat bg-cover"></div></div><div></div><div></div></div>`);
const OrnateFrameComponent = (props) => {
  const _mergedProps = mergeProps({
    backgroundImageOpacity: 80,
    showCornerFiligrees: true
  }, props);
  const [filigreeProps, mergedProps] = splitProps(_mergedProps, ["topIconClass", "topIconSrc", "topIconBackgroundTint", "topIconTint"]);
  let backgroundImageElement;
  const cache = new ImageCache();
  const backgroundImageUrl = createMemo(() => {
    let url = mergedProps.backgroundImageSrc ?? "blp:bg-panel-mughal";
    if (url.startsWith("url(")) {
      url = url.slice(4, -1).replace(/["']/g, "");
    }
    return url;
  });
  onMount(() => {
    if (backgroundImageElement) {
      createEffect(() => {
        const url = backgroundImageUrl();
        untrack(() => {
          cache.loadImage(url).then(() => {
            if (backgroundImageElement) {
              backgroundImageElement.style.backgroundImage = `url(${url})`;
              backgroundImageElement.classList.remove("opacity-0");
              backgroundImageElement.classList.add(`opacity-${_mergedProps.backgroundImageOpacity}`);
            }
          });
        });
      });
    }
  });
  onCleanup(() => {
    cache.unloadAllImages();
  });
  const adjustFrame = false;
  const frameinsetClasses = "px-4 py-5";
  return (() => {
    var _el$ = _tmpl$5(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$2.nextSibling, _el$5 = _el$4.nextSibling;
    spread(_el$, mergeProps(mergedProps, {
      "data-name": "OrnatePanel",
      get ["class"]() {
        return `pointer-events-auto relative ${props.hideTopIcon ? "" : "mt-12"} ${mergedProps.class ?? ""}`;
      }
    }), false, true);
    var _ref$ = backgroundImageElement;
    typeof _ref$ === "function" ? use(_ref$, _el$3) : backgroundImageElement = _el$3;
    _el$3.style.setProperty("transition", "opacity 0.5s ease-in-out");
    insert(_el$5, createComponent(Show, {
      get when() {
        return !props.hideTopIcon;
      },
      get children() {
        var _el$6 = _tmpl$();
        insert(_el$6, createComponent(Switch, {
          get fallback() {
            return createComponent(Filigree.TopIcon, filigreeProps);
          },
          get children() {
            return [createComponent(Match, {
              get when() {
                return mergedProps.filigreeType === "icon";
              },
              get children() {
                return createComponent(Filigree.TopIcon, filigreeProps);
              }
            }), createComponent(Match, {
              get when() {
                return mergedProps.filigreeType === "wide";
              },
              get children() {
                return createComponent(Filigree.Wide, {});
              }
            })];
          }
        }));
        return _el$6;
      }
    }), null);
    insert(_el$5, createComponent(Show, {
      get when() {
        return mergedProps.showFiligrees;
      },
      get children() {
        return [(() => {
          var _el$7 = _tmpl$2();
          _el$7.style.setProperty("background-image", "url(blp:base_frame-filigree)");
          _el$7.style.setProperty("opacity", "0.2");
          return _el$7;
        })(), (() => {
          var _el$8 = _tmpl$3();
          _el$8.style.setProperty("background-image", "url(blp:base_frame-filigree)");
          _el$8.style.setProperty("opacity", "0.2");
          return _el$8;
        })()];
      }
    }), null);
    insert(_el$5, createComponent(Show, {
      when: adjustFrame,
      get fallback() {
        return mergedProps.children;
      },
      get children() {
        var _el$9 = _tmpl$4();
        insert(_el$9, () => mergedProps.children);
        return _el$9;
      }
    }), null);
    createRenderEffect((_p$) => {
      var _v$ = `absolute ${props.isFullscreen ? "fullscreen-outside-safezone" : "inset-0"} ${props.useNoMarginFrame ? "" : frameinsetClasses} pointer-events-none`, _v$2 = `${props.useNoMarginFrame ? "ornate-panel-frame-no-margin" : "ornate-panel-frame"} ${props.isFullscreen ? "fullscreen-outside-safezone" : "size-full"} opacity-90 absolute`, _v$3 = `size-full ${props.useNoMarginFrame ? "" : frameinsetClasses} relative`;
      _v$ !== _p$.e && className(_el$2, _p$.e = _v$);
      _v$2 !== _p$.t && className(_el$4, _p$.t = _v$2);
      _v$3 !== _p$.a && className(_el$5, _p$.a = _v$3);
      return _p$;
    }, {
      e: void 0,
      t: void 0,
      a: void 0
    });
    return _el$;
  })();
};
const OrnateFrame = ComponentRegistry.register({
  name: "OrnateFrame",
  images: ["blp:base_frame-filigree"],
  createInstance: OrnateFrameComponent
});

export { OrnateFrame };
//# sourceMappingURL=ornate-panel.js.map

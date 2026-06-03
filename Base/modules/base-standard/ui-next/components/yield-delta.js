import { template, insert, classList } from '../../../core/vendor/solid-js/web/dist/web.js';
import { Icon } from '../../../core/ui-next/components/icon.js';
import { useImageCache } from '../../../core/ui-next/components/image-cache.js';
import { ComponentRegistry } from '../../../core/ui-next/services/component-registry.js';
import { createComponent, createRenderEffect } from '../../../core/vendor/solid-js/dist/solid.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="flex flex-col"data-name=Yield-Delta><div class="w-11 flex flex-row justify-center mb-1 font-fit-shrink"></div><div class="w-11 h-24"><div class="flex flex-col justify-center items-center size-full font-fit-shrink"></div></div></div>`);
const YieldDeltaSymbol = Symbol();
const YieldDeltaComponent = (props) => {
  const images = {
    positiveYieldCSS: "url(blp:yield_container_positive)",
    negativeYieldCSS: "url(blp:yield_container_negative)",
    neutralYieldCSS: "url(blp:yield_container_neutral)"
  };
  const imageCache = useImageCache();
  imageCache.registerImages(YieldDeltaSymbol, Object.values(images));
  return (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling, _el$4 = _el$3.firstChild;
    _el$2.style.setProperty("background-color", "rgba(0,0,0,0.3)");
    insert(_el$2, () => props.yieldDelta);
    _el$3.style.setProperty("border-image-slice", "17 21 fill");
    _el$3.style.setProperty("border-image-width", "17px 21px");
    insert(_el$4, createComponent(Icon, {
      "class": "size-8 mt-1 mb-1",
      get name() {
        return props.yieldIconSrc;
      },
      isUrl: true
    }), null);
    insert(_el$4, () => props.yieldTotal, null);
    createRenderEffect((_p$) => {
      var _v$ = props.classList, _v$2 = !!(props.yieldDelta > 0), _v$3 = !!(props.yieldDelta < 0), _v$4 = !!(props.yieldDelta === 0), _v$5 = props.yieldDelta > 0 ? images.positiveYieldCSS : props.yieldDelta < 0 ? images.negativeYieldCSS : images.neutralYieldCSS;
      _p$.e = classList(_el$, _v$, _p$.e);
      _v$2 !== _p$.t && _el$2.classList.toggle("text-positive", _p$.t = _v$2);
      _v$3 !== _p$.a && _el$2.classList.toggle("text-negative", _p$.a = _v$3);
      _v$4 !== _p$.o && _el$2.classList.toggle("hidden", _p$.o = _v$4);
      _v$5 !== _p$.i && ((_p$.i = _v$5) != null ? _el$3.style.setProperty("border-image-source", _v$5) : _el$3.style.removeProperty("border-image-source"));
      return _p$;
    }, {
      e: void 0,
      t: void 0,
      a: void 0,
      o: void 0,
      i: void 0
    });
    return _el$;
  })();
};
const YieldDelta = ComponentRegistry.register({
  name: "YieldDelta",
  createInstance: YieldDeltaComponent
});

export { YieldDelta, YieldDeltaComponent };
//# sourceMappingURL=yield-delta.js.map

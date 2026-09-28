import { template, insert, className } from '../../vendor/solid-js/web/dist/web.js';
import { createSignal, createMemo, createEffect, createComponent, mergeProps, For, createRenderEffect } from '../../vendor/solid-js/dist/solid.js';
import { ScrollArea } from './scroll-area.js';
import { ComponentRegistry } from '../services/component-registry.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="relative w-full"><div></div></div>`);
function VirtualScrollAreaComponent(props) {
  const [visibleItems, setVisibleItems] = createSignal([]);
  const [visibleItemsTop, setVisibleItemsTop] = createSignal(0);
  const [scrollPercent, setScrollPercent] = createSignal(0);
  const [clientWidth, setClientWidth] = createSignal(0);
  const [clientHeight, setClientHeight] = createSignal(0);
  const itemsPerRow = createMemo(() => {
    return props.itemWidth && clientWidth() ? Math.floor(clientWidth() / props.itemWidth) : 1;
  });
  const numRows = createMemo(() => Math.ceil(props.each.length / itemsPerRow()));
  const rowsHeight = createMemo(() => numRows() * props.itemHeight);
  createEffect(() => {
    const numVisibleRows = Math.floor((clientHeight() ?? 1) / props.itemHeight) + 2;
    const unitScroll = scrollPercent() / 100;
    const numRowItems = itemsPerRow();
    const firstVisibleRow = Math.max(0, Math.floor((numRows() - numVisibleRows) * unitScroll));
    const firstItem = firstVisibleRow * numRowItems;
    const top = firstVisibleRow * props.itemHeight;
    const lastItem = Math.min(props.each.length, firstItem + numVisibleRows * numRowItems);
    const items = props.each.slice(firstItem, lastItem);
    setVisibleItemsTop(top);
    setVisibleItems(() => items);
  });
  return createComponent(ScrollArea, mergeProps(() => props.scrollArea, {
    get ["class"]() {
      return props.class;
    },
    setScroll: setScrollPercent,
    setClientHeight,
    setClientWidth,
    get children() {
      var _el$ = _tmpl$(), _el$2 = _el$.firstChild;
      insert(_el$2, createComponent(For, {
        get each() {
          return visibleItems();
        },
        get children() {
          return props.children;
        }
      }));
      createRenderEffect((_p$) => {
        var _v$ = `${rowsHeight()}px`, _v$2 = `absolute ${props.itemWidth ? "flex flex-row flex-wrap w-full" : ""}`, _v$3 = `${visibleItemsTop()}px`;
        _v$ !== _p$.e && ((_p$.e = _v$) != null ? _el$.style.setProperty("height", _v$) : _el$.style.removeProperty("height"));
        _v$2 !== _p$.t && className(_el$2, _p$.t = _v$2);
        _v$3 !== _p$.a && ((_p$.a = _v$3) != null ? _el$2.style.setProperty("top", _v$3) : _el$2.style.removeProperty("top"));
        return _p$;
      }, {
        e: void 0,
        t: void 0,
        a: void 0
      });
      return _el$;
    }
  }));
}
const VirtualScrollArea = ComponentRegistry.register({
  name: "VirtualScrollArea",
  createInstance: VirtualScrollAreaComponent
});

export { VirtualScrollArea };
//# sourceMappingURL=virtual-scroll-area.js.map

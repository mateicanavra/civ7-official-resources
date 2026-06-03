import { template, insert } from '../../../vendor/solid-js/web/dist/web.js';
import { Icon } from '../../components/icon.js';
import { VirtualScrollArea } from '../../components/virtual-scroll-area.js';
import { createComponent } from '../../../vendor/solid-js/dist/solid.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="w-32 h-10 m-2 p-2 border border-secondary-3 flex flex-row"></div>`);
const VirtualScrollAreaExample = () => {
  const items = [...Array(1e5).keys()];
  return createComponent(VirtualScrollArea, {
    "class": "w-1\\/3 h-96 m-2 p-2 border border-secondary-3",
    itemWidth: 136,
    itemHeight: 48,
    each: items,
    children: (item) => (() => {
      var _el$ = _tmpl$();
      insert(_el$, createComponent(Icon, {
        "class": "size-8 -mt-1",
        name: "LEADER_BENJAMIN_FRANKLIN"
      }), null);
      insert(_el$, item, null);
      return _el$;
    })()
  });
};

export { VirtualScrollAreaExample };
//# sourceMappingURL=virtual-scroll-area-example.js.map

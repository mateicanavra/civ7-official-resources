import { template, insert } from '../../vendor/solid-js/web/dist/web.js';
import { createSignal, createComponent, createMemo, For } from '../../vendor/solid-js/dist/solid.js';
import { ScrollArea } from '../components/scroll-area.js';
import { Button } from '../components/button.js';
import { HeroButton } from '../components/hero-button.js';
import { ListItem } from './list-item.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="img-dropdown-box flex flex-col m-2 my-1 w-174 pb-2"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class=m-2>Please Add Items...</div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="flex flex-row"></div>`);
const [items, setItems] = createSignal([], {
  equals: false
});
const ListExample = () => {
  const [itemId, setItemId] = createSignal(1, {
    equals: false
  });
  function addItem() {
    const itemList = items();
    itemList.push(`Item ${setItemId((id) => id + 1)}`);
    setItems(itemList);
  }
  function removeItem(index) {
    const itemList = items();
    itemList.splice(index, 1);
    setItems(itemList);
  }
  return (() => {
    var _el$ = _tmpl$();
    insert(_el$, createComponent(HeroButton, {
      onActivate: () => addItem(),
      get children() {
        return ["Add Item ", createMemo(() => itemId() + 1)];
      }
    }), null);
    insert(_el$, createComponent(ScrollArea, {
      "class": "max-h-200",
      useProxy: true,
      get children() {
        return createComponent(For, {
          get each() {
            return items();
          },
          get fallback() {
            return _tmpl$2();
          },
          children: (item, index) => (() => {
            var _el$3 = _tmpl$3();
            insert(_el$3, createComponent(ListItem, {
              name: item,
              get value() {
                return index().toString();
              }
            }), null);
            insert(_el$3, createComponent(Button, {
              get ["class"]() {
                return `my-2 item-${index()}`;
              },
              onActivate: () => removeItem(index()),
              children: "Remove"
            }), null);
            return _el$3;
          })()
        });
      }
    }), null);
    return _el$;
  })();
};

export { ListExample };
//# sourceMappingURL=list-example.js.map

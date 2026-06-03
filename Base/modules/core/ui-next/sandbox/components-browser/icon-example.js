import { template, insert } from '../../../vendor/solid-js/web/dist/web.js';
import { createSignal, createComponent } from '../../../vendor/solid-js/dist/solid.js';
import { Icon } from '../../components/icon.js';
import { ScrollArea } from '../../components/scroll-area.js';
import { BoundString, BoundBoolean } from './components/bound-property.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="flex flex-row flex-auto mx-4"><div class="w-2\\/3 m-2 p-2 border border-secondary-3 flex flex-col justify-center items-center"><div class="flex flex-col my-4 items-center"></div></div></div>`);
const IconExample = () => {
  const [name, setName] = createSignal("LEADER_BENJAMIN_FRANKLIN");
  const [context, setContext] = createSignal("LEADER_HAPPY");
  const [isUrl, setIsUrl] = createSignal(false);
  const [className, setClassName] = createSignal("size-64");
  return (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild;
    insert(_el$, createComponent(ScrollArea, {
      "class": "w-1\\/3 m-2 p-2 border border-secondary-3",
      get children() {
        return [createComponent(BoundString, {
          name: "name",
          signal: [name, setName]
        }), createComponent(BoundString, {
          name: "context",
          signal: [context, setContext]
        }), createComponent(BoundBoolean, {
          name: "isUrl",
          signal: [isUrl, setIsUrl]
        }), createComponent(BoundString, {
          name: "class",
          signal: [className, setClassName]
        })];
      }
    }), _el$2);
    insert(_el$3, createComponent(Icon, {
      get ["class"]() {
        return className();
      },
      get name() {
        return name();
      },
      get context() {
        return context();
      },
      get isUrl() {
        return isUrl();
      }
    }));
    return _el$;
  })();
};

export { IconExample };
//# sourceMappingURL=icon-example.js.map

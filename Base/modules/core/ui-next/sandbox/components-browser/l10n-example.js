import { template, insert } from '../../../vendor/solid-js/web/dist/web.js';
import { createSignal, createComponent, For } from '../../../vendor/solid-js/dist/solid.js';
import { Button } from '../../components/button.js';
import { L10n } from '../../components/l10n.js';
import { ScrollArea } from '../../components/scroll-area.js';
import { BoundString } from './components/bound-property.js';
import { TextInput } from './components/text-input.js';
import { createArraySignal } from '../../utilities/solid-utilities.js';

var _tmpl$ = /* @__PURE__ */ template(`<span>Add args[<!>]</span>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="flex flex-row flex-auto mx-4"><div class="w-2\\/3 m-2 p-2 border border-secondary-3 flex flex-col justify-center items-center"><div class="flex flex-col my-4 items-center"><div>L10n.Compose</div><div class=mt-8>L10n.Stylize</div></div></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="flex flex-row items-center justify-center">args[<!>]</div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="relative h-10"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<span>Remove args[<!>]</span>`);
const L10nExample = () => {
  const [text, setText] = createSignal("LOC_TRAIT_AKSUM_ABILITY_DESCRIPTION");
  const [args, useArgs] = createArraySignal();
  return (() => {
    var _el$ = _tmpl$2(), _el$6 = _el$.firstChild, _el$7 = _el$6.firstChild, _el$8 = _el$7.firstChild, _el$9 = _el$8.nextSibling;
    insert(_el$, createComponent(ScrollArea, {
      "class": "w-1\\/3 m-2 p-2 border border-secondary-3",
      get children() {
        return [createComponent(BoundString, {
          name: "text",
          signal: [text, setText]
        }), createComponent(For, {
          get each() {
            return args();
          },
          children: (arg, index) => [(() => {
            var _el$10 = _tmpl$3(), _el$11 = _el$10.firstChild, _el$13 = _el$11.nextSibling, _el$12 = _el$13.nextSibling;
            insert(_el$10, index, _el$13);
            return _el$10;
          })(), (() => {
            var _el$14 = _tmpl$4();
            insert(_el$14, createComponent(TextInput, {
              "class": "flex-grow w-full absolute",
              value: arg,
              onInput: (e) => useArgs((a) => a[index()] = e.currentTarget.value)
            }));
            return _el$14;
          })(), createComponent(Button, {
            "class": "mb-4",
            onClick: () => useArgs((a) => a.splice(index(), 1)),
            get children() {
              var _el$15 = _tmpl$5(), _el$16 = _el$15.firstChild, _el$18 = _el$16.nextSibling, _el$17 = _el$18.nextSibling;
              insert(_el$15, index, _el$18);
              return _el$15;
            }
          })]
        }), createComponent(Button, {
          "class": "mb-4",
          onClick: () => useArgs((a) => a.push("")),
          get children() {
            var _el$2 = _tmpl$(), _el$3 = _el$2.firstChild, _el$5 = _el$3.nextSibling, _el$4 = _el$5.nextSibling;
            insert(_el$2, () => args().length, _el$5);
            return _el$2;
          }
        })];
      }
    }), _el$6);
    insert(_el$7, createComponent(L10n.Compose, {
      get text() {
        return text();
      },
      get args() {
        return args();
      }
    }), _el$9);
    insert(_el$7, createComponent(L10n.Stylize, {
      get text() {
        return text();
      },
      get args() {
        return args();
      }
    }), null);
    return _el$;
  })();
};

export { L10nExample };
//# sourceMappingURL=l10n-example.js.map

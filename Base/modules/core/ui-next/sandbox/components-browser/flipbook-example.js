import { template, insert } from '../../../vendor/solid-js/web/dist/web.js';
import { createSignal, createComponent, For, createMemo } from '../../../vendor/solid-js/dist/solid.js';
import { Button } from '../../components/button.js';
import { Flipbook } from '../../components/flipbook.js';
import { Header } from '../../components/header.js';
import { ScrollArea } from '../../components/scroll-area.js';
import { BoundNumber } from './components/bound-property.js';
import { TextInput } from './components/text-input.js';
import { createArraySignal } from '../../utilities/solid-utilities.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="flex flex-row flex-auto mx-4"><div class="w-2\\/3 m-2 p-2 border border-secondary-3 flex flex-col justify-center items-center"><div class="flex flex-col my-4 items-center"></div><div class="flex flex-col my-4 items-center"></div></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="my-2 flex flex-col"><div class=text-center>src</div><div class="relative h-10"></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="my-2 flex flex-col"><div class=text-center>spriteHeight</div><div class="relative h-10"></div></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="my-2 flex flex-col"><div class=text-center>spriteWidth</div><div class="relative h-10"></div></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="my-2 flex flex-col"><div class=text-center>size</div><div class="relative h-10"></div></div>`);
const FlipbookExample = () => {
  const [fps, setFps] = createSignal(30);
  const [atlas, useAtlas] = createArraySignal([{
    src: "blp:hourglasses01",
    spriteHeight: 128,
    spriteWidth: 128,
    size: 512,
    nFrames: 16
  }, {
    src: "blp:hourglasses02",
    spriteHeight: 128,
    spriteWidth: 128,
    size: 512,
    nFrames: 16
  }, {
    src: "blp:hourglasses03",
    spriteHeight: 128,
    spriteWidth: 128,
    size: 1024,
    nFrames: 13
  }]);
  return (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$3.nextSibling;
    insert(_el$, createComponent(ScrollArea, {
      "class": "w-1\\/3 m-2 p-2 border border-secondary-3",
      get children() {
        return [createComponent(BoundNumber, {
          name: "fps",
          signal: [fps, setFps]
        }), createComponent(For, {
          get each() {
            return atlas();
          },
          children: (entry, index) => [(() => {
            var _el$5 = _tmpl$2(), _el$6 = _el$5.firstChild, _el$7 = _el$6.nextSibling;
            insert(_el$7, createComponent(TextInput, {
              "class": "flex-grow w-full absolute",
              get value() {
                return entry.src;
              },
              onInput: (e) => {
                entry.src = e.currentTarget.value;
                useAtlas((a) => a);
              }
            }));
            return _el$5;
          })(), (() => {
            var _el$8 = _tmpl$3(), _el$9 = _el$8.firstChild, _el$10 = _el$9.nextSibling;
            insert(_el$10, createComponent(TextInput, {
              "class": "flex-grow w-full absolute",
              type: "number",
              get value() {
                return entry.spriteHeight;
              },
              onInput: (e) => {
                entry.spriteHeight = Number(e.currentTarget.value);
                useAtlas((a) => a);
              }
            }));
            return _el$8;
          })(), (() => {
            var _el$11 = _tmpl$4(), _el$12 = _el$11.firstChild, _el$13 = _el$12.nextSibling;
            insert(_el$13, createComponent(TextInput, {
              "class": "flex-grow w-full absolute",
              type: "number",
              get value() {
                return entry.spriteWidth;
              },
              onInput: (e) => {
                entry.spriteWidth = Number(e.currentTarget.value);
                useAtlas((a) => a);
              }
            }));
            return _el$11;
          })(), (() => {
            var _el$14 = _tmpl$5(), _el$15 = _el$14.firstChild, _el$16 = _el$15.nextSibling;
            insert(_el$16, createComponent(TextInput, {
              "class": "flex-grow w-full absolute",
              type: "number",
              get value() {
                return entry.size;
              },
              onInput: (e) => {
                entry.size = Number(e.currentTarget.value);
                useAtlas((a) => a);
              }
            }));
            return _el$14;
          })(), (() => {
            var _el$17 = _tmpl$5(), _el$18 = _el$17.firstChild, _el$19 = _el$18.nextSibling;
            insert(_el$19, createComponent(TextInput, {
              "class": "flex-grow w-full absolute",
              type: "number",
              get value() {
                return entry.nFrames;
              },
              onInput: (e) => {
                entry.nFrames = Number(e.currentTarget.value);
                useAtlas((a) => a);
              }
            }));
            return _el$17;
          })(), createComponent(Button, {
            "class": "mb-4",
            onClick: () => useAtlas((a) => a.splice(index(), 1)),
            get children() {
              return ["Remove Atlas ", createMemo(() => index())];
            }
          })]
        }), createComponent(Button, {
          "class": "mb-4",
          onClick: () => useAtlas((a) => a.push({
            src: "blp:hourglasses01",
            spriteHeight: 128,
            spriteWidth: 128,
            size: 512,
            nFrames: 16
          })),
          get children() {
            return ["Add Atlas ", createMemo(() => atlas().length)];
          }
        })];
      }
    }), _el$2);
    insert(_el$3, createComponent(Header, {
      "class": "text-2xl",
      children: "Flipbook"
    }), null);
    insert(_el$3, createComponent(Flipbook, {
      get fps() {
        return fps();
      },
      get atlas() {
        return atlas();
      },
      "class": "size-48"
    }), null);
    insert(_el$4, createComponent(Header, {
      "class": "text-2xl",
      children: "Flipbook.Hourglass"
    }), null);
    insert(_el$4, createComponent(Flipbook.Hourglass, {
      "class": "size-48"
    }), null);
    return _el$;
  })();
};

export { FlipbookExample };
//# sourceMappingURL=flipbook-example.js.map

import { template, insert, className, render, delegateEvents } from '../../../vendor/solid-js/web/dist/web.js';
import { createSignal, createMemo, createComponent, Show, For, createRenderEffect } from '../../../vendor/solid-js/dist/solid.js';
import { Button } from '../../components/button.js';
import { Header } from '../../components/header.js';
import { Panel } from '../../components/panel.js';
import { RadioButton } from '../../components/radio-button.js';
import { SandboxBox } from '../../sandbox/sandbox-box.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="flex flex-auto justify-center items-center font-body-2xl">Loading...</div>`), _tmpl$2 = /* @__PURE__ */ template(`<p class="font-title ml-4 mb-4">Enter or lookup text to preview the formatted result.</p>`), _tmpl$3 = /* @__PURE__ */ template(`<div></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="w-full flex flex-row justify-center"><div class="flex flex-1 flex-col p-4"><div class="flex flex-row"><textarea class="text-base flex flex-auto mb-4">Enter ID to lookup text.</textarea></div><textarea placeholder="Enter custom text or retrieved text will be displayed here"class="text-base w-full h-64 p-2 flex-auto"></textarea></div><div class="flex flex-2 flex-col p-4"><div><div class="flex flex-row items-center">Font:<div class="flex flex-row ml-2"></div></div><div class="flex flex-row items-center">Size:<div class="flex flex-row ml-2"></div></div><div class="flex flex-row items-center">Colorize Icon Backgrounds:</div><div class="flex flex-row items-center">Show HTML:</div></div><div class="flex flex-row text-base items-center font-base ">Adjust Width:</div></div></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="flex flex-row items-center"></div>`);
var FontSize = /* @__PURE__ */ ((FontSize2) => {
  FontSize2[FontSize2["XXS"] = 0] = "XXS";
  FontSize2[FontSize2["XS"] = 1] = "XS";
  FontSize2[FontSize2["S"] = 2] = "S";
  FontSize2[FontSize2["M"] = 3] = "M";
  FontSize2[FontSize2["L"] = 4] = "L";
  FontSize2[FontSize2["XL"] = 5] = "XL";
  FontSize2[FontSize2["XXL"] = 6] = "XXL";
  return FontSize2;
})(FontSize || {});
var Font = /* @__PURE__ */ ((Font2) => {
  Font2[Font2["Body"] = 0] = "Body";
  Font2[Font2["Title"] = 1] = "Title";
  return Font2;
})(Font || {});
function ScratchPad() {
  const [text, setText] = createSignal("");
  const [textSize, setTextSize] = createSignal(3 /* M */);
  const [font, setFont] = createSignal(0 /* Body */);
  const [width, setWidth] = createSignal(600);
  const [lookupId, setLookupId] = createSignal("LOC_BUILDING_ACADEMY_DESCRIPTION");
  const [colorizeIconBackgrounds, setColorizeIconBackgrounds] = createSignal(false);
  const [showDebugHTML, setShowDebugHTML] = createSignal(false);
  const stylizedText = createMemo(() => Locale.stylize(text()));
  const handleLookup = async () => {
    const key = lookupId();
    setText(Locale.compose(key));
  };
  const handleTextChange = (text2) => {
    setText(text2);
  };
  const increaseWidth = () => {
    setWidth(width() + 10);
  };
  const decreaseWidth = () => {
    const w = width();
    if (w - 10 > 0) {
      setWidth(w - 10);
    }
  };
  const toggleColorizeIconBackgrounds = () => {
    setColorizeIconBackgrounds(!colorizeIconBackgrounds());
  };
  const toggleShowDebugHTML = () => {
    setShowDebugHTML(!showDebugHTML());
  };
  const getTextSizeSuffix = () => {
    switch (textSize()) {
      case 0 /* XXS */:
        return "2xs";
      case 1 /* XS */:
        return "xs";
      case 2 /* S */:
        return "sm";
        break;
      case 4 /* L */:
        return "lg";
      case 5 /* XL */:
        return "xl";
      case 6 /* XXL */:
        return "2xl";
      case 3 /* M */:
      default:
        return "base";
    }
  };
  const getFontName = () => {
    switch (font()) {
      case 1 /* Title */:
        return "title";
      case 0 /* Body */:
      default:
        return "body";
    }
  };
  const getTextCSS = () => {
    const suffix = getTextSizeSuffix();
    const font2 = getFontName();
    return `font-${font2}-${suffix}`;
  };
  const FontsWithName = [{
    font: 0 /* Body */,
    name: "Body"
  }, {
    font: 1 /* Title */,
    name: "Title"
  }];
  const SizesWithName = [{
    size: 0 /* XXS */,
    name: "XXS"
  }, {
    size: 1 /* XS */,
    name: "XS"
  }, {
    size: 2 /* S */,
    name: "S"
  }, {
    size: 3 /* M */,
    name: "M"
  }, {
    size: 4 /* L */,
    name: "L"
  }, {
    size: 5 /* XL */,
    name: "XL"
  }, {
    size: 6 /* XXL */,
    name: "XXL"
  }];
  function WhenFinished(props) {
    const [resume, setResume] = createSignal(false);
    Loading.whenFinished.then(() => {
      setResume(true);
    });
    return createComponent(Show, {
      get when() {
        return resume();
      },
      get fallback() {
        return _tmpl$();
      },
      get children() {
        return props.children;
      }
    });
  }
  return [createComponent(Header, {
    "class": "font-title text-2xl",
    children: "Text Scratchpad!"
  }), _tmpl$2(), createComponent(WhenFinished, {
    get children() {
      var _el$3 = _tmpl$4(), _el$4 = _el$3.firstChild, _el$5 = _el$4.firstChild, _el$6 = _el$5.firstChild, _el$7 = _el$5.nextSibling, _el$8 = _el$4.nextSibling, _el$9 = _el$8.firstChild, _el$10 = _el$9.firstChild, _el$11 = _el$10.firstChild, _el$12 = _el$11.nextSibling, _el$13 = _el$10.nextSibling, _el$14 = _el$13.firstChild, _el$15 = _el$14.nextSibling, _el$16 = _el$13.nextSibling, _el$17 = _el$16.firstChild, _el$18 = _el$16.nextSibling, _el$19 = _el$18.firstChild, _el$21 = _el$9.nextSibling, _el$22 = _el$21.firstChild;
      _el$6.addEventListener("change", (e) => setLookupId(e.target.value));
      insert(_el$5, createComponent(Button, {
        onClick: handleLookup,
        "class": "mb-4 ml-4",
        children: "Lookup Text"
      }), null);
      _el$7.$$input = (e) => handleTextChange(e.target.value);
      insert(_el$12, createComponent(For, {
        each: FontsWithName,
        children: (item, index) => (() => {
          var _el$23 = _tmpl$5();
          insert(_el$23, createComponent(RadioButton, {
            get isChecked() {
              return font() == item.font;
            },
            onActivate: () => setFont(item.font)
          }), null);
          insert(_el$23, () => item.name, null);
          insert(_el$23, createComponent(Show, {
            get when() {
              return index() != FontsWithName.length - 1;
            },
            children: ","
          }), null);
          return _el$23;
        })()
      }));
      insert(_el$15, createComponent(For, {
        each: SizesWithName,
        children: (item, index) => (() => {
          var _el$24 = _tmpl$5();
          insert(_el$24, createComponent(RadioButton, {
            get isChecked() {
              return textSize() == item.size;
            },
            onActivate: () => setTextSize(item.size)
          }), null);
          insert(_el$24, () => item.name, null);
          insert(_el$24, createComponent(Show, {
            get when() {
              return index() != SizesWithName.length - 1;
            },
            children: ","
          }), null);
          return _el$24;
        })()
      }));
      insert(_el$16, createComponent(RadioButton, {
        get isChecked() {
          return colorizeIconBackgrounds();
        },
        onActivate: toggleColorizeIconBackgrounds
      }), null);
      insert(_el$18, createComponent(RadioButton, {
        get isChecked() {
          return showDebugHTML();
        },
        onActivate: toggleShowDebugHTML
      }), null);
      insert(_el$8, createComponent(Show, {
        get when() {
          return !showDebugHTML();
        },
        get fallback() {
          return createComponent(SandboxBox, {
            "class": "flex-auto",
            get style() {
              return {
                width: `${width()}px`
              };
            },
            get children() {
              var _el$25 = _tmpl$3();
              insert(_el$25, stylizedText);
              createRenderEffect(() => className(_el$25, `w-full h-64 p-2 ${getTextCSS()}`));
              return _el$25;
            }
          });
        },
        get children() {
          return createComponent(SandboxBox, {
            get ["class"]() {
              return `flex-auto ${colorizeIconBackgrounds() ? "colorize-icons" : ""}`;
            },
            get style() {
              return {
                width: `${width()}px`
              };
            },
            get children() {
              var _el$20 = _tmpl$3();
              createRenderEffect((_p$) => {
                var _v$ = stylizedText(), _v$2 = `w-full h-64 p-2 ${getTextCSS()}`;
                _v$ !== _p$.e && (_el$20.innerHTML = _p$.e = _v$);
                _v$2 !== _p$.t && className(_el$20, _p$.t = _v$2);
                return _p$;
              }, {
                e: void 0,
                t: void 0
              });
              return _el$20;
            }
          });
        }
      }), _el$21);
      insert(_el$21, createComponent(Button, {
        onClick: decreaseWidth,
        "class": "ml-4",
        children: "-"
      }), null);
      insert(_el$21, createComponent(Button, {
        onClick: increaseWidth,
        "class": "ml-4",
        children: "+"
      }), null);
      createRenderEffect(() => _el$6.value = lookupId());
      createRenderEffect(() => _el$7.value = text());
      return _el$3;
    }
  })];
}
engine.whenReady.then(() => {
  render(() => {
    return createComponent(Panel, {
      id: "scratchpad",
      name: "Text Scratchpad",
      "class": "w-full h-full flex flex-col",
      get children() {
        return createComponent(ScratchPad, {});
      }
    });
  }, document.getElementById("root"));
});
delegateEvents(["input"]);
//# sourceMappingURL=text-scratchpad.js.map

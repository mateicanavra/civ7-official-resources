import { t as template, i as insert, f as createRenderEffect, g as className, e as createComponent, h as createMemo, c as createSignal, j as getOwner, F as For, a as createEffect, s as setAttribute, k as spread, m as mergeProps, r as render, o as onMount, P as Panel } from '../components/panel.chunk.js';
import { H as Header } from '../components/header.chunk.js';
import { I as Icon, L as L10n, A as Activatable, N as NavHelp, R as RadioButton, T as Tab } from '../components/l10n.chunk.js';
import { B as Button } from '../components/button.chunk.js';
import { H as HeroButton, F as Filigree } from '../components/hero-button.chunk.js';
import { S as ScrollArea } from '../components/scroll-area.chunk.js';
import { H as HSlot, V as VSlot } from '../components/slot.chunk.js';
import { T as Tooltip } from '../components/tooltip.chunk.js';
import { S as SandboxNavigation } from './sandbox-navigation.chunk.js';
import '../../ui/input/input-support.chunk.js';
import '../../ui/input/focus-support.chunk.js';
import '../../ui/components/fxs-slot.chunk.js';
import '../../ui/input/focus-manager.js';
import '../../ui/audio-base/audio-support.chunk.js';
import '../../ui/framework.chunk.js';
import '../../ui/views/view-manager.chunk.js';
import '../../ui/panel-support.chunk.js';
import '../../ui/spatial/spatial-manager.js';
import '../../ui/context-manager/context-manager.js';
import '../../ui/context-manager/display-queue-manager.js';
import '../../ui/dialog-box/manager-dialog-box.chunk.js';
import '../../ui/input/cursor.js';
import '../../ui/input/action-handler.js';
import '../../ui/utilities/utilities-update-gate.chunk.js';
import '../../ui/navigation-tray/model-navigation-tray.chunk.js';
import '../../ui/utilities/utilities-image.chunk.js';
import '../../ui/utilities/utilities-component-id.chunk.js';

var _tmpl$$6 = /* @__PURE__ */ template(`<div></div>`);
const SandboxBox = (props) => {
  return (() => {
    var _el$ = _tmpl$$6();
    insert(_el$, () => props.children);
    createRenderEffect(() => className(_el$, `img-dropdown-box m-2 p-4 flex flex-col ${props.class}`));
    return _el$;
  })();
};

var _tmpl$$5 = /* @__PURE__ */ template(`<span>Buttons Clicked: </span>`), _tmpl$2$1 = /* @__PURE__ */ template(`<span>Hotkey Triggers: </span>`), _tmpl$3$1 = /* @__PURE__ */ template(`<div class="relative w-64 h-16"><nav-tray></nav-tray></div>`, true, false, false), _tmpl$4 = /* @__PURE__ */ template(`<div class="flex flex-row items-center mb-4">Normal:&nbsp;</div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="flex flex-row items-center">Large:&nbsp;</div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="mt-8 flex flex-row flex-auto items-center justify-center"></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="flex flex-row flex-wrap"></div>`), _tmpl$8 = /* @__PURE__ */ template(`<span>#</span>`);
const ComponentBox = (props) => {
  return createComponent(SandboxBox, {
    "class": "flex flex-col justify-start items-center flex-auto",
    get children() {
      return [createComponent(Header, {
        "class": "mb-2",
        get children() {
          return props.name;
        }
      }), createMemo(() => props.children)];
    }
  });
};
const ComponentsExample = () => {
  const [hotkeyTriggers, setHotkeyTriggers] = createSignal(0);
  const [buttonsClicked, setButtonsClicked] = createSignal(0);
  const [pipChecked, setPipChecked] = createSignal(false);
  const [listLength, setListLength] = createSignal(200);
  return createComponent(ScrollArea, {
    "class": "flex-auto m-4",
    get children() {
      var _el$ = _tmpl$7();
      insert(_el$, createComponent(ComponentBox, {
        name: "Stats",
        get children() {
          return [(() => {
            var _el$2 = _tmpl$$5(), _el$3 = _el$2.firstChild;
            insert(_el$2, buttonsClicked, null);
            return _el$2;
          })(), (() => {
            var _el$4 = _tmpl$2$1(), _el$5 = _el$4.firstChild;
            insert(_el$4, hotkeyTriggers, null);
            return _el$4;
          })()];
        }
      }), null);
      insert(_el$, createComponent(ComponentBox, {
        name: "Button",
        get children() {
          return createComponent(Button, {
            onActivate: () => setButtonsClicked((n) => n + 1),
            children: "Button"
          });
        }
      }), null);
      insert(_el$, createComponent(ComponentBox, {
        name: "Hero Button",
        get children() {
          return createComponent(HeroButton, {
            onActivate: () => setButtonsClicked((n) => n + 1),
            children: "Hero Button"
          });
        }
      }), null);
      insert(_el$, createComponent(ComponentBox, {
        name: "Header",
        get children() {
          return createComponent(Header, {
            children: "Header"
          });
        }
      }), null);
      insert(_el$, createComponent(ComponentBox, {
        name: "Filigree.H1",
        get children() {
          return createComponent(Filigree.H1, {});
        }
      }), null);
      insert(_el$, createComponent(ComponentBox, {
        name: "Filigree.H2",
        get children() {
          return createComponent(Filigree.H2, {});
        }
      }), null);
      insert(_el$, createComponent(ComponentBox, {
        name: "Filigree.H3",
        get children() {
          return createComponent(Filigree.H3, {});
        }
      }), null);
      insert(_el$, createComponent(ComponentBox, {
        name: "Filigree.H4",
        get children() {
          return createComponent(Filigree.H4, {
            children: "H4"
          });
        }
      }), null);
      insert(_el$, createComponent(ComponentBox, {
        name: "Filigree.Small",
        get children() {
          return createComponent(Filigree.Small, {});
        }
      }), null);
      insert(_el$, createComponent(ComponentBox, {
        name: "Icon",
        get children() {
          return ["LEADER_BENJAMIN_FRANKLIN", createComponent(Icon, {
            name: "LEADER_BENJAMIN_FRANKLIN",
            "class": "size-24"
          })];
        }
      }), null);
      insert(_el$, createComponent(ComponentBox, {
        name: "L10n Compose",
        get children() {
          return ["LOC_LEADER_BENJAMIN_FRANKLIN_NAME", createComponent(L10n.Compose, {
            text: "LOC_LEADER_BENJAMIN_FRANKLIN_NAME"
          })];
        }
      }), null);
      insert(_el$, createComponent(ComponentBox, {
        name: "L10n Stylize",
        get children() {
          return ["LOC_TRAIT_LEADER_BENJAMIN_FRANKLIN_ABILITY_DESCRIPTION", createComponent(L10n.Stylize, {
            text: "LOC_TRAIT_LEADER_BENJAMIN_FRANKLIN_ABILITY_DESCRIPTION"
          })];
        }
      }), null);
      insert(_el$, createComponent(ComponentBox, {
        name: "L10n Stylize Broken Test",
        get children() {
          return ["There should be nothing after this line:", createComponent(L10n.Stylize, {
            text: ""
          })];
        }
      }), null);
      insert(_el$, createComponent(ComponentBox, {
        name: "Hotkey With NavHelp",
        get children() {
          return createComponent(Activatable, {
            name: "NavHelp",
            hotkeyAction: "shell-action-1",
            disableFocus: true,
            onActivate: () => setHotkeyTriggers((n) => n + 1),
            get children() {
              return createComponent(NavHelp, {
                "class": "size-16"
              });
            }
          });
        }
      }), null);
      insert(_el$, createComponent(ComponentBox, {
        name: "Hotkey With NavTray",
        get children() {
          return [createComponent(Activatable, {
            name: "NavTray",
            hotkeyAction: "shell-action-2",
            navTrayText: "Activate Hotkey",
            disableFocus: true,
            onActivate: () => setHotkeyTriggers((n) => n + 1)
          }), (() => {
            var _el$6 = _tmpl$3$1(), _el$7 = _el$6.firstChild;
            _el$7._$owner = getOwner();
            return _el$6;
          })()];
        }
      }), null);
      insert(_el$, createComponent(ComponentBox, {
        name: "Radio Button",
        get children() {
          return [(() => {
            var _el$8 = _tmpl$4(), _el$9 = _el$8.firstChild;
            insert(_el$8, createComponent(RadioButton, {
              get isChecked() {
                return pipChecked();
              },
              onActivate: () => {
                setPipChecked((v) => !v);
                setButtonsClicked((n) => n + 1);
              }
            }), null);
            return _el$8;
          })(), (() => {
            var _el$10 = _tmpl$5(), _el$11 = _el$10.firstChild;
            insert(_el$10, createComponent(RadioButton, {
              isLarge: true,
              get isChecked() {
                return pipChecked();
              },
              onActivate: () => {
                setPipChecked((v) => !v);
                setButtonsClicked((n) => n + 1);
              }
            }), null);
            return _el$10;
          })()];
        }
      }), null);
      insert(_el$, createComponent(ComponentBox, {
        name: "Scroll Area",
        get children() {
          return [createComponent(ScrollArea, {
            "class": "h-36 flex-auto",
            minThumbHeight: 30,
            get children() {
              return createComponent(For, {
                get each() {
                  return Array.from({
                    length: listLength()
                  });
                },
                children: (_, index) => (() => {
                  var _el$14 = _tmpl$8(), _el$15 = _el$14.firstChild;
                  insert(_el$14, index, null);
                  return _el$14;
                })()
              });
            }
          }), createComponent(HSlot, {
            get children() {
              return [createComponent(Button, {
                "class": "m-2 min-w-32",
                onActivate: () => setListLength(200),
                children: "200"
              }), createComponent(Button, {
                "class": "m-2 min-w-32",
                onActivate: () => setListLength(0),
                children: "0"
              })];
            }
          })];
        }
      }), null);
      insert(_el$, createComponent(ComponentBox, {
        name: "HSlot",
        get children() {
          return createComponent(HSlot, {
            get children() {
              return [createComponent(Button, {
                "class": "m-2 min-w-32",
                onActivate: () => setButtonsClicked((n) => n + 1),
                children: "1"
              }), createComponent(Button, {
                "class": "m-2 min-w-32",
                onActivate: () => setButtonsClicked((n) => n + 1),
                children: "2"
              }), createComponent(Button, {
                "class": "m-2 min-w-32",
                onActivate: () => setButtonsClicked((n) => n + 1),
                children: "3"
              })];
            }
          });
        }
      }), null);
      insert(_el$, createComponent(ComponentBox, {
        name: "VSlot",
        get children() {
          return createComponent(VSlot, {
            get children() {
              return [createComponent(Button, {
                "class": "m-2",
                onActivate: () => setButtonsClicked((n) => n + 1),
                children: "1"
              }), createComponent(Button, {
                "class": "m-2",
                onActivate: () => setButtonsClicked((n) => n + 1),
                children: "2"
              }), createComponent(Button, {
                "class": "m-2",
                onActivate: () => setButtonsClicked((n) => n + 1),
                children: "3"
              })];
            }
          });
        }
      }), null);
      insert(_el$, createComponent(ComponentBox, {
        name: "Tab (Default)",
        get children() {
          return createComponent(Tab, {
            "class": "w-full",
            get children() {
              return [createComponent(Tab.TabList, {}), (() => {
                var _el$12 = _tmpl$6();
                insert(_el$12, createComponent(Tab.Output, {}));
                return _el$12;
              })(), createComponent(Tab.Item, {
                name: "Tab 1",
                title: () => createComponent(Header, {
                  children: '"Tab 1"'
                }),
                body: () => "Tab 1 Contents"
              }), createComponent(Tab.Item, {
                name: "Tab 2",
                title: () => "Tab 2",
                body: () => "Tab 2 Contents"
              }), createComponent(Tab.Item, {
                name: "Tab 3",
                title: () => "Tab 3",
                body: () => "Tab 3 Contents"
              })];
            }
          });
        }
      }), null);
      insert(_el$, createComponent(ComponentBox, {
        name: "Tab (Pips)",
        get children() {
          return createComponent(Tab, {
            "class": "w-full",
            get children() {
              return [(() => {
                var _el$13 = _tmpl$6();
                insert(_el$13, createComponent(Tab.Output, {}));
                return _el$13;
              })(), createComponent(Tab.TabListPips, {
                "class": "items-center justify-center"
              }), createComponent(Tab.Item, {
                name: "Tab 1",
                title: () => "Tab 1",
                body: () => "Tab 1 Contents"
              }), createComponent(Tab.Item, {
                name: "Tab 2",
                title: () => "Tab 2",
                body: () => "Tab 2 Contents"
              }), createComponent(Tab.Item, {
                name: "Tab 3",
                title: () => "Tab 3",
                body: () => "Tab 3 Contents"
              })];
            }
          });
        }
      }), null);
      insert(_el$, createComponent(ComponentBox, {
        name: "Tooltip",
        get children() {
          return createComponent(Tooltip, {
            get children() {
              return [createComponent(Tooltip.Trigger, {
                get children() {
                  return createComponent(Activatable, {
                    "class": "p-3",
                    style: {
                      border: "1px solid gray"
                    },
                    children: "Hover Me"
                  });
                }
              }), createComponent(Tooltip.Content, {
                get children() {
                  return createComponent(SandboxBox, {
                    get children() {
                      return [createComponent(Filigree.H1, {
                        "class": "-my-9 -mx-14"
                      }), createComponent(Filigree.H4, {
                        get children() {
                          return createComponent(Header, {
                            children: "I am a fancy tooltip"
                          });
                        }
                      }), createComponent(SandboxBox, {
                        "class": "flex flex-row items-center",
                        children: "With different sections"
                      }), createComponent(Tooltip.Text, {
                        text: "Inner Tooltip",
                        get children() {
                          return createComponent(Button, {
                            children: "And A Button"
                          });
                        }
                      })];
                    }
                  });
                }
              })];
            }
          });
        }
      }), null);
      insert(_el$, createComponent(ComponentBox, {
        name: "Text Tooltip",
        get children() {
          return createComponent(Tooltip.Text, {
            text: "I am a boring text tooltip",
            get children() {
              return createComponent(Activatable, {
                "class": "p-3",
                style: {
                  border: "1px solid gray"
                },
                children: "Hover Me"
              });
            }
          });
        }
      }), null);
      return _el$;
    }
  });
};

const [value, setValue] = createSignal("Look in the console");
const EffectModel = {
  value,
  setValue
};
createEffect(() => {
  console.log(`Value changed to ${value()}`);
});

const EffectComponent = (props) => {
  return createComponent(Button, {
    "class": "text-base mx-2 mt-2",
    onActivate: () => props.action(EffectModel.setValue),
    get children() {
      return [createMemo(() => props.name), " Effect"];
    }
  });
};

var _tmpl$$4 = /* @__PURE__ */ template(`<div class="flex flex-col m-2"><div class="flex flex-row mb-2"></div><div class="img-dropdown-box p-2 w-128"></div></div>`);
const EffectExample = () => {
  return (() => {
    var _el$ = _tmpl$$4(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling;
    insert(_el$2, createComponent(EffectComponent, {
      action: (setter) => setter((value) => `${value} Foo`),
      name: "Add Foo"
    }), null);
    insert(_el$2, createComponent(EffectComponent, {
      action: (setter) => setter((value) => `${value} Bar`),
      name: "Add Bar"
    }), null);
    insert(_el$2, createComponent(EffectComponent, {
      action: (setter) => setter(""),
      name: "Clear Value"
    }), null);
    insert(_el$3, () => EffectModel.value());
    return _el$;
  })();
};

var _tmpl$$3 = /* @__PURE__ */ template(`<fxs-header class="mx-2 mt-2"filigree-style=h4></fxs-header>`, true, false, false);
const HelloComponent = (props) => {
  return (() => {
    var _el$ = _tmpl$$3();
    _el$._$owner = getOwner();
    createRenderEffect(() => setAttribute(_el$, "title", `Hello ${props.name}!`));
    return _el$;
  })();
};

var _tmpl$$2 = /* @__PURE__ */ template(`<span class="flex flex-row p-2 mx-2 my-1 text-base mx-2 mt-2 min-w-72">Name: <!> &nbsp;&nbsp;&nbsp; Value: </span>`);
const ListItem = (props) => {
  return (() => {
    var _el$ = _tmpl$$2(), _el$2 = _el$.firstChild, _el$4 = _el$2.nextSibling, _el$3 = _el$4.nextSibling;
    _el$.style.setProperty("border", "1px solid white");
    insert(_el$, () => props.name, _el$4);
    insert(_el$, () => props.value, null);
    return _el$;
  })();
};

var _tmpl$$1 = /* @__PURE__ */ template(`<div class="img-dropdown-box flex flex-col m-2 my-1 w-174 pb-2"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class=m-2>Please Add Items...</div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="flex flex-row"></div>`);
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
    var _el$ = _tmpl$$1();
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

var _tmpl$ = /* @__PURE__ */ template(`<div><span class="text-base my-2">The number is </span></div>`);
const [theNumber, setTheNumber] = createSignal(32);
const SimpleBinding = (props) => {
  return (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild;
    spread(_el$, mergeProps(props, {
      get ["class"]() {
        return `flex flex-row ${props.class}`;
      }
    }), false, true);
    insert(_el$, createComponent(Button, {
      "class": "size-6 m-2",
      onActivate: () => setTheNumber((n) => n - 1),
      children: "-"
    }), _el$2);
    insert(_el$2, theNumber, null);
    insert(_el$, createComponent(Button, {
      "class": "size-6 m-2",
      onActivate: () => setTheNumber((n) => n + 1),
      children: "+"
    }), null);
    return _el$;
  })();
};

const locStrings = ["LOC_UI_OPTIONS_TITLE", "LOC_OPTIONS_CATEGORY_ACCESSIBILITY", "LOC_OPTIONS_CATEGORY_ACCESSIBILITY_DESCRIPTION", "LOC_OPTIONS_CATEGORY_AUDIO", "LOC_OPTIONS_CATEGORY_AUDIO_DESCRIPTION", "LOC_OPTIONS_CATEGORY_GAME", "LOC_OPTIONS_CATEGORY_GAME_DESCRIPTION", "LOC_OPTIONS_CATEGORY_GRAPHICS", "LOC_OPTIONS_CATEGORY_GRAPHICS_DESCRIPTION", "LOC_OPTIONS_CATEGORY_INPUT_DESCRIPTION", "LOC_OPTIONS_CATEGORY_INTERFACE", "LOC_OPTIONS_CATEGORY_INTERFACE_DESCRIPTION", "LOC_OPTIONS_CATEGORY_SYSTEM", "LOC_OPTIONS_CATEGORY_SYSTEM_DESCRIPTION", "LOC_OPTIONS_CANCEL", "LOC_OPTIONS_CANCEL_CHANGES", "LOC_OPTIONS_REVERT", "LOC_OPTIONS_REVERT_DESCRIPTION", "LOC_OPTIONS_DEFAULT", "LOC_OPTIONS_DEFAULTS", "LOC_OPTIONS_DEFAULTS_DESCRIPTION", "LOC_OPTIONS_ARE_YOU_SURE", "LOC_OPTIONS_ARE_YOU_SURE_DEFAULT", "LOC_OPTIONS_YES", "LOC_OPTIONS_NO", "LOC_OPTIONS_CONFIRM", "LOC_OPTIONS_CONFIRM_CHANGES", "LOC_OPTIONS_ACCEPT"];
const simpleNav = new SandboxNavigation();
render(() => {
  let ref;
  onMount(() => {
    simpleNav.setFocus(ref);
  });
  return createComponent(Panel, {
    id: "sandbox-panel",
    name: "Sandbox",
    "class": "w-full h-full flex flex-col",
    ref(r$) {
      var _ref$ = ref;
      typeof _ref$ === "function" ? _ref$(r$) : ref = r$;
    },
    get children() {
      return [createComponent(Header, {
        "class": "text-2xl mt-4",
        children: "UI-Next Solid Test Sandbox"
      }), createComponent(Tab, {
        "class": "flex flex-col flex-auto m-4",
        get children() {
          return [createComponent(Tab.TabList, {
            nextHotkey: "nav-next",
            previousHotkey: "nav-previous"
          }), createComponent(Tab.Output, {}), createComponent(Tab.Item, {
            name: "Components",
            title: () => "Components",
            body: () => createComponent(ComponentsExample, {})
          }), createComponent(Tab.Item, {
            name: "Basic",
            title: () => "Basic",
            body: () => [createComponent(SandboxBox, {
              "class": "w-96",
              get children() {
                return [createComponent(HelloComponent, {
                  name: "World"
                }), createComponent(HelloComponent, {
                  name: "SolidJs"
                }), createComponent(HelloComponent, {
                  name: "Fxs UI"
                })];
              }
            }), createComponent(SimpleBinding, {
              "class": "mx-2 mt-2"
            }), createComponent(EffectExample, {})]
          }), createComponent(Tab.Item, {
            name: "List",
            title: () => "List",
            body: () => createComponent(ListExample, {})
          }), createComponent(Tab.Item, {
            name: "Scrollable",
            title: () => "Proxy Scroll",
            body: () => createComponent(SandboxBox, {
              "class": "self-start",
              get children() {
                return createComponent(ScrollArea, {
                  "class": "w-200 h-96",
                  useProxy: true,
                  get children() {
                    return [createComponent(L10n.Stylize, {
                      text: "LOC_TRAIT_LEADER_ASHOKA_ABILITY_DESCRIPTION"
                    }), createComponent(For, {
                      each: locStrings,
                      children: (item) => createComponent(L10n.Compose, {
                        text: item
                      })
                    })];
                  }
                });
              }
            })
          })];
        }
      })];
    }
  });
}, document.getElementById("root"));
//# sourceMappingURL=sandbox.js.map

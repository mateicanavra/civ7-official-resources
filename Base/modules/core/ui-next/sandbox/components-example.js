import { template, insert } from '../../vendor/solid-js/web/dist/web.js';
import { createComponent, createMemo, createSignal, getOwner, For } from '../../vendor/solid-js/dist/solid.js';
import { Activatable } from '../components/activatable.js';
import { Button } from '../components/button.js';
import { Filigree } from '../components/filigree.js';
import { Header } from '../components/header.js';
import { HeroButton } from '../components/hero-button.js';
import { Icon } from '../components/icon.js';
import { L10n } from '../components/l10n.js';
import { NavHelp } from '../components/nav-help.js';
import { RadioButton, RadioButtonSize } from '../components/radio-button.js';
import { ScrollArea } from '../components/scroll-area.js';
import { HSlot, VSlot } from '../components/slot.js';
import { Tab } from '../components/tab.js';
import { Tooltip } from '../components/tooltip.js';
import { SandboxBox } from './sandbox-box.js';

var _tmpl$ = /* @__PURE__ */ template(`<span>Buttons Clicked: </span>`), _tmpl$2 = /* @__PURE__ */ template(`<span>Hotkey Triggers: </span>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="relative w-64 h-16"><nav-tray></nav-tray></div>`, true, false, false), _tmpl$4 = /* @__PURE__ */ template(`<div class="flex flex-row items-center mb-4">Normal:&nbsp;</div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="flex flex-row items-center">Large:&nbsp;</div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="mt-8 flex flex-row flex-auto items-center justify-center"></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="flex flex-row flex-wrap"></div>`), _tmpl$8 = /* @__PURE__ */ template(`<span>#</span>`);
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
            var _el$2 = _tmpl$(), _el$3 = _el$2.firstChild;
            insert(_el$2, buttonsClicked, null);
            return _el$2;
          })(), (() => {
            var _el$4 = _tmpl$2(), _el$5 = _el$4.firstChild;
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
            var _el$6 = _tmpl$3(), _el$7 = _el$6.firstChild;
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
              get size() {
                return RadioButtonSize.LARGE;
              },
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

export { ComponentsExample };
//# sourceMappingURL=components-example.js.map

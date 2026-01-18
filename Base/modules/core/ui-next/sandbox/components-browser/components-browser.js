import { t as template, k as spread, m as mergeProps, i as insert, e as createComponent, c as createSignal, p as createArraySignal, F as For, j as getOwner, f as createRenderEffect, g as className, C as ComponentRegistry, y as useContext, S as Show, h as createMemo, a as createEffect, r as render, o as onMount, P as Panel } from '../../components/panel.chunk.js';
import { R as RadioButton, A as Activatable, d as ArrowButton, g as TabContext, T as Tab, I as Icon, L as L10n, N as NavHelp } from '../../components/l10n.chunk.js';
import { B as Button } from '../../components/button.chunk.js';
import { S as ScrollArea } from '../../components/scroll-area.chunk.js';
import { H as Header } from '../../components/header.chunk.js';
import { V as VSlot } from '../../components/slot.chunk.js';
import { F as Filigree, H as HeroButton, a as HeroButton2 } from '../../components/hero-button.chunk.js';
import { F as Flipbook } from '../../components/flipbook.chunk.js';
import { S as SandboxNavigation } from '../sandbox-navigation.chunk.js';
import '../../../ui/input/input-support.chunk.js';
import '../../../ui/input/focus-support.chunk.js';
import '../../../ui/components/fxs-slot.chunk.js';
import '../../../ui/input/focus-manager.js';
import '../../../ui/audio-base/audio-support.chunk.js';
import '../../../ui/framework.chunk.js';
import '../../../ui/views/view-manager.chunk.js';
import '../../../ui/panel-support.chunk.js';
import '../../../ui/spatial/spatial-manager.js';
import '../../../ui/context-manager/context-manager.js';
import '../../../ui/context-manager/display-queue-manager.js';
import '../../../ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../ui/input/cursor.js';
import '../../../ui/input/action-handler.js';
import '../../../ui/utilities/utilities-update-gate.chunk.js';
import '../../../ui/navigation-tray/model-navigation-tray.chunk.js';
import '../../../ui/utilities/utilities-image.chunk.js';
import '../../../ui/utilities/utilities-component-id.chunk.js';

var _tmpl$$m = /* @__PURE__ */ template(`<input>`);
const TextInput = (props) => {
  return (() => {
    var _el$ = _tmpl$$m();
    spread(_el$, mergeProps(props, {
      get ["class"]() {
        return `bg-accent-6 border-2 border-secondary-3 p-1 ${props.class ?? ""}`;
      },
      "type": "text"
    }), false, false);
    return _el$;
  })();
};

var _tmpl$$l = /* @__PURE__ */ template(`<div class="my-2 flex flex-col"><div class=text-center></div><div class="relative h-10"></div></div>`), _tmpl$2$7 = /* @__PURE__ */ template(`<div class="my-2 flex flex-row items-center"></div>`);
const BoundString = (props) => {
  const [getter, setter] = props.signal;
  return (() => {
    var _el$ = _tmpl$$l(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling;
    insert(_el$2, () => props.name);
    insert(_el$3, createComponent(TextInput, {
      "class": "flex-grow w-full absolute",
      get value() {
        return getter();
      },
      onInput: (e) => setter(e.currentTarget.value)
    }));
    return _el$;
  })();
};
const BoundBoolean = (props) => {
  const [getter, setter] = props.signal;
  return (() => {
    var _el$4 = _tmpl$2$7();
    insert(_el$4, createComponent(RadioButton, {
      "class": "mr-2",
      get isChecked() {
        return getter();
      },
      onActivate: () => setter((v) => !v)
    }), null);
    insert(_el$4, () => props.name, null);
    return _el$4;
  })();
};
const BoundNumber = (props) => {
  const [getter, setter] = props.signal;
  return (() => {
    var _el$5 = _tmpl$$l(), _el$6 = _el$5.firstChild, _el$7 = _el$6.nextSibling;
    insert(_el$6, () => props.name);
    insert(_el$7, createComponent(TextInput, {
      "class": "flex-grow w-full absolute",
      type: "number",
      get value() {
        return getter()?.toString() ?? 0;
      },
      onInput: (e) => setter(Number(e.currentTarget.value))
    }));
    return _el$5;
  })();
};

var _tmpl$$k = /* @__PURE__ */ template(`<div class="flex flex-row flex-auto mx-4"><div class="w-1\\/3 m-2 p-2 border border-secondary-3 flex flex-col justify-center items-center"></div><div class="w-1\\/3 m-2 p-2 bg-accent-6 border border-secondary-3"><div class="w-64 h-16 border"><nav-tray></nav-tray></div></div></div>`, true, false, false), _tmpl$2$6 = /* @__PURE__ */ template(`<div></div>`);
const ActivatableExample = () => {
  const [audioGroup, setAudioGroup] = createSignal();
  const [audioActivate, setAudioActivate] = createSignal();
  const [audioPress, setAudioPress] = createSignal();
  const [audioError, setAudioError] = createSignal();
  const [audioFocus, setAudioFocus] = createSignal();
  const [disabled, setDisabled] = createSignal(false);
  const [disableFocus, setDisableFocus] = createSignal(false);
  const [hotkeyAction, setHotkeyAction] = createSignal();
  const [navTrayText, setNavtrayText] = createSignal();
  const [onActivateMessage, setOnActivateMessage] = createSignal("onActivate");
  const [onBlurMessage, setOnBlurMessage] = createSignal("onBlur");
  const [onFocusMessage, setOnFocusMessage] = createSignal("onFocus");
  const [content, setContent] = createSignal("Activatable");
  const [messages, useMessages] = createArraySignal(["Message Log"]);
  return (() => {
    var _el$ = _tmpl$$k(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling, _el$4 = _el$3.firstChild, _el$5 = _el$4.firstChild;
    insert(_el$, createComponent(ScrollArea, {
      "class": "w-1\\/3 m-2 p-2 border border-secondary-3",
      get children() {
        return [createComponent(BoundString, {
          name: "content",
          signal: [content, setContent]
        }), createComponent(BoundBoolean, {
          name: "disabled",
          signal: [disabled, setDisabled]
        }), createComponent(BoundBoolean, {
          name: "disableFocus",
          signal: [disableFocus, setDisableFocus]
        }), createComponent(BoundString, {
          name: "hotkeyAction",
          signal: [hotkeyAction, setHotkeyAction]
        }), createComponent(BoundString, {
          name: "navTrayText",
          signal: [navTrayText, setNavtrayText]
        }), createComponent(BoundString, {
          name: "audio.group",
          signal: [audioGroup, setAudioGroup]
        }), createComponent(BoundString, {
          name: "audio.onActivate",
          signal: [audioActivate, setAudioActivate]
        }), createComponent(BoundString, {
          name: "audio.onPress",
          signal: [audioPress, setAudioPress]
        }), createComponent(BoundString, {
          name: "audio.onError",
          signal: [audioError, setAudioError]
        }), createComponent(BoundString, {
          name: "audio.onFocus",
          signal: [audioFocus, setAudioFocus]
        }), createComponent(BoundString, {
          name: "onActivate Message",
          signal: [onActivateMessage, setOnActivateMessage]
        }), createComponent(BoundString, {
          name: "onFocus Message",
          signal: [onFocusMessage, setOnFocusMessage]
        }), createComponent(BoundString, {
          name: "onBlur Message",
          signal: [onBlurMessage, setOnBlurMessage]
        })];
      }
    }), _el$2);
    insert(_el$2, createComponent(Activatable, {
      "class": "border-1",
      name: "ExampleActivatable",
      get audio() {
        return {
          group: audioGroup(),
          onActivate: audioActivate(),
          onPress: audioPress(),
          onError: audioError(),
          onFocus: audioFocus()
        };
      },
      get disabled() {
        return disabled();
      },
      get disableFocus() {
        return disableFocus();
      },
      get hotkeyAction() {
        return hotkeyAction();
      },
      get navTrayText() {
        return navTrayText();
      },
      onActivate: () => useMessages((m) => m.push(onActivateMessage())),
      onBlur: () => useMessages((m) => m.push(onBlurMessage())),
      onFocus: () => useMessages((m) => m.push(onFocusMessage())),
      get children() {
        return content();
      }
    }));
    insert(_el$3, createComponent(Button, {
      "class": "mb-2",
      onActivate: () => useMessages((msgs) => msgs.length = 0),
      children: "Clear Log"
    }), _el$4);
    insert(_el$3, createComponent(ScrollArea, {
      "class": "flex-auto",
      get children() {
        return createComponent(For, {
          get each() {
            return messages();
          },
          children: (message) => (() => {
            var _el$6 = _tmpl$2$6();
            insert(_el$6, message);
            return _el$6;
          })()
        });
      }
    }), _el$4);
    _el$5._$owner = getOwner();
    return _el$;
  })();
};

var _tmpl$$j = /* @__PURE__ */ template(`<div class="flex flex-row flex-auto mx-4"><div class="w-1\\/3 m-2 p-2 border border-secondary-3 flex flex-col justify-center items-center"></div><div class="w-1\\/3 m-2 p-2 bg-accent-6 border border-secondary-3"><div class="w-64 h-16 border"><nav-tray></nav-tray></div></div></div>`, true, false, false), _tmpl$2$5 = /* @__PURE__ */ template(`<div></div>`);
const ArrowButtonExample = () => {
  const [audioGroup, setAudioGroup] = createSignal();
  const [audioActivate, setAudioActivate] = createSignal();
  const [audioPress, setAudioPress] = createSignal();
  const [audioError, setAudioError] = createSignal();
  const [audioFocus, setAudioFocus] = createSignal();
  const [disabled, setDisabled] = createSignal(false);
  const [disableFocus, setDisableFocus] = createSignal(false);
  const [hotkeyAction, setHotkeyAction] = createSignal();
  const [navTrayText, setNavtrayText] = createSignal();
  const [onActivateMessage, setOnActivateMessage] = createSignal("onActivate");
  const [onBlurMessage, setOnBlurMessage] = createSignal("onBlur");
  const [onFocusMessage, setOnFocusMessage] = createSignal("onFocus");
  const [right, setRight] = createSignal(false);
  const [messages, useMessages] = createArraySignal(["Message Log"]);
  return (() => {
    var _el$ = _tmpl$$j(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling, _el$4 = _el$3.firstChild, _el$5 = _el$4.firstChild;
    insert(_el$, createComponent(ScrollArea, {
      "class": "w-1\\/3 m-2 p-2 border border-secondary-3",
      get children() {
        return [createComponent(BoundBoolean, {
          name: "isRight",
          signal: [right, setRight]
        }), createComponent(BoundBoolean, {
          name: "disabled",
          signal: [disabled, setDisabled]
        }), createComponent(BoundBoolean, {
          name: "disableFocus",
          signal: [disableFocus, setDisableFocus]
        }), createComponent(BoundString, {
          name: "hotkeyAction",
          signal: [hotkeyAction, setHotkeyAction]
        }), createComponent(BoundString, {
          name: "navTrayText",
          signal: [navTrayText, setNavtrayText]
        }), createComponent(BoundString, {
          name: "audio.group",
          signal: [audioGroup, setAudioGroup]
        }), createComponent(BoundString, {
          name: "audio.onActivate",
          signal: [audioActivate, setAudioActivate]
        }), createComponent(BoundString, {
          name: "audio.onPress",
          signal: [audioPress, setAudioPress]
        }), createComponent(BoundString, {
          name: "audio.onError",
          signal: [audioError, setAudioError]
        }), createComponent(BoundString, {
          name: "audio.onFocus",
          signal: [audioFocus, setAudioFocus]
        }), createComponent(BoundString, {
          name: "onActivate Message",
          signal: [onActivateMessage, setOnActivateMessage]
        }), createComponent(BoundString, {
          name: "onFocus Message",
          signal: [onFocusMessage, setOnFocusMessage]
        }), createComponent(BoundString, {
          name: "onBlur Message",
          signal: [onBlurMessage, setOnBlurMessage]
        })];
      }
    }), _el$2);
    insert(_el$2, createComponent(ArrowButton, {
      "class": "border-1",
      name: "ExampleActivatable",
      get audio() {
        return {
          group: audioGroup(),
          onActivate: audioActivate(),
          onPress: audioPress(),
          onError: audioError(),
          onFocus: audioFocus()
        };
      },
      get right() {
        return right();
      },
      get disabled() {
        return disabled();
      },
      get disableFocus() {
        return disableFocus();
      },
      get hotkeyAction() {
        return hotkeyAction();
      },
      get navTrayText() {
        return navTrayText();
      },
      onActivate: () => useMessages((m) => m.push(onActivateMessage())),
      onBlur: () => useMessages((m) => m.push(onBlurMessage())),
      onFocus: () => useMessages((m) => m.push(onFocusMessage()))
    }));
    insert(_el$3, createComponent(Button, {
      "class": "mb-2",
      onActivate: () => useMessages((msgs) => msgs.length = 0),
      children: "Clear Log"
    }), _el$4);
    insert(_el$3, createComponent(ScrollArea, {
      "class": "flex-auto",
      get children() {
        return createComponent(For, {
          get each() {
            return messages();
          },
          children: (message) => (() => {
            var _el$6 = _tmpl$2$5();
            insert(_el$6, message);
            return _el$6;
          })()
        });
      }
    }), _el$4);
    _el$5._$owner = getOwner();
    return _el$;
  })();
};

var _tmpl$$i = /* @__PURE__ */ template(`<div>Audio Group</div>`);
const AudioGroupExample = () => {
  return _tmpl$$i();
};

var _tmpl$$h = /* @__PURE__ */ template(`<div class="flex flex-row flex-auto mx-4"><div class="w-1\\/3 m-2 p-2 border border-secondary-3 flex flex-col justify-center items-center"></div><div class="w-1\\/3 m-2 p-2 bg-accent-6 border border-secondary-3"><div class="w-64 h-16 border"><nav-tray></nav-tray></div></div></div>`, true, false, false), _tmpl$2$4 = /* @__PURE__ */ template(`<div></div>`);
const ButtonExample = () => {
  const [audioGroup, setAudioGroup] = createSignal();
  const [audioActivate, setAudioActivate] = createSignal();
  const [audioPress, setAudioPress] = createSignal();
  const [audioError, setAudioError] = createSignal();
  const [audioFocus, setAudioFocus] = createSignal();
  const [disabled, setDisabled] = createSignal(false);
  const [disableFocus, setDisableFocus] = createSignal(false);
  const [hotkeyAction, setHotkeyAction] = createSignal();
  const [navTrayText, setNavtrayText] = createSignal();
  const [onActivateMessage, setOnActivateMessage] = createSignal("onActivate");
  const [onBlurMessage, setOnBlurMessage] = createSignal("onBlur");
  const [onFocusMessage, setOnFocusMessage] = createSignal("onFocus");
  const [content, setContent] = createSignal("Button");
  const [messages, useMessages] = createArraySignal(["Message Log"]);
  return (() => {
    var _el$ = _tmpl$$h(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling, _el$4 = _el$3.firstChild, _el$5 = _el$4.firstChild;
    insert(_el$, createComponent(ScrollArea, {
      "class": "w-1\\/3 m-2 p-2 border border-secondary-3",
      get children() {
        return [createComponent(BoundString, {
          name: "content",
          signal: [content, setContent]
        }), createComponent(BoundBoolean, {
          name: "disabled",
          signal: [disabled, setDisabled]
        }), createComponent(BoundBoolean, {
          name: "disableFocus",
          signal: [disableFocus, setDisableFocus]
        }), createComponent(BoundString, {
          name: "hotkeyAction",
          signal: [hotkeyAction, setHotkeyAction]
        }), createComponent(BoundString, {
          name: "navTrayText",
          signal: [navTrayText, setNavtrayText]
        }), createComponent(BoundString, {
          name: "audio.group",
          signal: [audioGroup, setAudioGroup]
        }), createComponent(BoundString, {
          name: "audio.onActivate",
          signal: [audioActivate, setAudioActivate]
        }), createComponent(BoundString, {
          name: "audio.onPress",
          signal: [audioPress, setAudioPress]
        }), createComponent(BoundString, {
          name: "audio.onError",
          signal: [audioError, setAudioError]
        }), createComponent(BoundString, {
          name: "audio.onFocus",
          signal: [audioFocus, setAudioFocus]
        }), createComponent(BoundString, {
          name: "onActivate Message",
          signal: [onActivateMessage, setOnActivateMessage]
        }), createComponent(BoundString, {
          name: "onFocus Message",
          signal: [onFocusMessage, setOnFocusMessage]
        }), createComponent(BoundString, {
          name: "onBlur Message",
          signal: [onBlurMessage, setOnBlurMessage]
        })];
      }
    }), _el$2);
    insert(_el$2, createComponent(Button, {
      "class": "border-1",
      name: "ExampleActivatable",
      get audio() {
        return {
          group: audioGroup(),
          onActivate: audioActivate(),
          onPress: audioPress(),
          onError: audioError(),
          onFocus: audioFocus()
        };
      },
      get disabled() {
        return disabled();
      },
      get disableFocus() {
        return disableFocus();
      },
      get hotkeyAction() {
        return hotkeyAction();
      },
      get navTrayText() {
        return navTrayText();
      },
      onActivate: () => useMessages((m) => m.push(onActivateMessage())),
      onBlur: () => useMessages((m) => m.push(onBlurMessage())),
      onFocus: () => useMessages((m) => m.push(onFocusMessage())),
      get children() {
        return content();
      }
    }));
    insert(_el$3, createComponent(Button, {
      "class": "mb-2",
      onActivate: () => useMessages((msgs) => msgs.length = 0),
      children: "Clear Log"
    }), _el$4);
    insert(_el$3, createComponent(ScrollArea, {
      "class": "flex-auto",
      get children() {
        return createComponent(For, {
          get each() {
            return messages();
          },
          children: (message) => (() => {
            var _el$6 = _tmpl$2$4();
            insert(_el$6, message);
            return _el$6;
          })()
        });
      }
    }), _el$4);
    _el$5._$owner = getOwner();
    return _el$;
  })();
};

var _tmpl$$g = /* @__PURE__ */ template(`<div></div>`);
const BorderPanel = (props) => {
  return (() => {
    var _el$ = _tmpl$$g();
    insert(_el$, createComponent(Header, {
      "class": "mb-2",
      get children() {
        return props.title;
      }
    }), null);
    insert(_el$, () => props.children, null);
    createRenderEffect(() => className(_el$, `img-dropdown-box m-2 p-4 flex flex-col justify-start ${props.class ?? ""}`));
    return _el$;
  })();
};

const LinkComponent = (props) => {
  props.audio ??= {};
  props.audio.onPress ??= "data-audio-primary-button-press";
  props.audio.onFocus ??= "data-audio-primary-button-focus";
  return createComponent(Activatable, mergeProps(props, {
    get ["class"]() {
      return `text-tertiary-1 focus\\:text-tertiary-2 hover\\:text-tertiary-2 ${props.class ?? ""}`;
    },
    get classList() {
      return props.classList;
    },
    name: "Link",
    get children() {
      return props.children;
    }
  }));
};
const Link = ComponentRegistry.register({
  name: "Link",
  createInstance: LinkComponent
});

const TabListLinks = (props) => {
  const tabContext = useContext(TabContext);
  return createComponent(VSlot, mergeProps(props, {
    get ["class"]() {
      return `flex flex-col items-end ${props.class ?? ""}`;
    },
    "data-name": "TabListLinks",
    get children() {
      return createComponent(For, {
        get each() {
          return tabContext?.tabs();
        },
        children: (tab, index) => createComponent(Tab.Trigger, {
          get name() {
            return tab.name;
          },
          get children() {
            return createComponent(Show, {
              get when() {
                return !tabContext?.isActive(tab.name);
              },
              get fallback() {
                return tab.title();
              },
              get children() {
                return createComponent(Link, {
                  get tabIndex() {
                    return index();
                  },
                  get children() {
                    return tab.title();
                  }
                });
              }
            });
          }
        })
      });
    }
  }));
};

var _tmpl$$f = /* @__PURE__ */ template(`<div class="flex flex-row flex-auto mx-4"><div class="w-full m-2 p-2 border border-secondary-3 flex flex-col justify-center items-center"><div class="flex flex-col my-4 items-center"></div><div class="flex flex-col my-4 items-center"></div><div class="flex flex-col my-4 items-center"></div><div class="flex flex-col my-4 items-center"></div><div class="flex flex-col my-4 items-center"></div></div></div>`);
const FiligreeExample = () => {
  return (() => {
    var _el$ = _tmpl$$f(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$3.nextSibling, _el$5 = _el$4.nextSibling, _el$6 = _el$5.nextSibling, _el$7 = _el$6.nextSibling;
    insert(_el$3, createComponent(Header, {
      "class": "text-2xl",
      children: "Filigree.H1"
    }), null);
    insert(_el$3, createComponent(Filigree.H1, {}), null);
    insert(_el$4, createComponent(Header, {
      "class": "text-xl",
      children: "Filigree.H2"
    }), null);
    insert(_el$4, createComponent(Filigree.H2, {}), null);
    insert(_el$5, createComponent(Header, {
      "class": "text-lg",
      children: "Filigree.H3"
    }), null);
    insert(_el$5, createComponent(Filigree.H3, {}), null);
    insert(_el$6, createComponent(Filigree.H4, {
      get children() {
        return createComponent(Header, {
          "class": "text-base",
          children: "Filigree.H4"
        });
      }
    }));
    insert(_el$7, createComponent(Header, {
      "class": "text-sm",
      children: "Filigree.Small"
    }), null);
    insert(_el$7, createComponent(Filigree.Small, {}), null);
    return _el$;
  })();
};

var _tmpl$$e = /* @__PURE__ */ template(`<div class="flex flex-row flex-auto mx-4"><div class="w-2\\/3 m-2 p-2 border border-secondary-3 flex flex-col justify-center items-center"><div class="flex flex-col my-4 items-center"></div><div class="flex flex-col my-4 items-center"></div></div></div>`), _tmpl$2$3 = /* @__PURE__ */ template(`<div class="my-2 flex flex-col"><div class=text-center>src</div><div class="relative h-10"></div></div>`), _tmpl$3$1 = /* @__PURE__ */ template(`<div class="my-2 flex flex-col"><div class=text-center>spriteHeight</div><div class="relative h-10"></div></div>`), _tmpl$4$1 = /* @__PURE__ */ template(`<div class="my-2 flex flex-col"><div class=text-center>spriteWidth</div><div class="relative h-10"></div></div>`), _tmpl$5$1 = /* @__PURE__ */ template(`<div class="my-2 flex flex-col"><div class=text-center>size</div><div class="relative h-10"></div></div>`);
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
    var _el$ = _tmpl$$e(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$3.nextSibling;
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
            var _el$5 = _tmpl$2$3(), _el$6 = _el$5.firstChild, _el$7 = _el$6.nextSibling;
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
            var _el$8 = _tmpl$3$1(), _el$9 = _el$8.firstChild, _el$10 = _el$9.nextSibling;
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
            var _el$11 = _tmpl$4$1(), _el$12 = _el$11.firstChild, _el$13 = _el$12.nextSibling;
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
            var _el$14 = _tmpl$5$1(), _el$15 = _el$14.firstChild, _el$16 = _el$15.nextSibling;
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
            var _el$17 = _tmpl$5$1(), _el$18 = _el$17.firstChild, _el$19 = _el$18.nextSibling;
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

var _tmpl$$d = /* @__PURE__ */ template(`<div class="flex flex-row flex-auto mx-4"><div class="w-1\\/3 m-2 p-2 border border-secondary-3 flex flex-col justify-center items-center"><div>HeroButton</div><div class=mt-8>HeroButton2</div></div><div class="w-1\\/3 m-2 p-2 bg-accent-6 border border-secondary-3"><div class="w-64 h-16 border"><nav-tray></nav-tray></div></div></div>`, true, false, false), _tmpl$2$2 = /* @__PURE__ */ template(`<div></div>`);
const HeroButtonExample = () => {
  const [audioGroup, setAudioGroup] = createSignal();
  const [audioActivate, setAudioActivate] = createSignal();
  const [audioPress, setAudioPress] = createSignal();
  const [audioError, setAudioError] = createSignal();
  const [audioFocus, setAudioFocus] = createSignal();
  const [disabled, setDisabled] = createSignal(false);
  const [disableFocus, setDisableFocus] = createSignal(false);
  const [hotkeyAction, setHotkeyAction] = createSignal();
  const [navTrayText, setNavtrayText] = createSignal();
  const [onActivateMessage, setOnActivateMessage] = createSignal("onActivate");
  const [onBlurMessage, setOnBlurMessage] = createSignal("onBlur");
  const [onFocusMessage, setOnFocusMessage] = createSignal("onFocus");
  const [content, setContent] = createSignal("Hero Button");
  const [messages, useMessages] = createArraySignal(["Message Log"]);
  return (() => {
    var _el$ = _tmpl$$d(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$3.nextSibling, _el$5 = _el$2.nextSibling, _el$6 = _el$5.firstChild, _el$7 = _el$6.firstChild;
    insert(_el$, createComponent(ScrollArea, {
      "class": "w-1\\/3 m-2 p-2 border border-secondary-3",
      get children() {
        return [createComponent(BoundString, {
          name: "content",
          signal: [content, setContent]
        }), createComponent(BoundBoolean, {
          name: "disabled",
          signal: [disabled, setDisabled]
        }), createComponent(BoundBoolean, {
          name: "disableFocus",
          signal: [disableFocus, setDisableFocus]
        }), createComponent(BoundString, {
          name: "hotkeyAction",
          signal: [hotkeyAction, setHotkeyAction]
        }), createComponent(BoundString, {
          name: "navTrayText",
          signal: [navTrayText, setNavtrayText]
        }), createComponent(BoundString, {
          name: "audio.group",
          signal: [audioGroup, setAudioGroup]
        }), createComponent(BoundString, {
          name: "audio.onActivate",
          signal: [audioActivate, setAudioActivate]
        }), createComponent(BoundString, {
          name: "audio.onPress",
          signal: [audioPress, setAudioPress]
        }), createComponent(BoundString, {
          name: "audio.onError",
          signal: [audioError, setAudioError]
        }), createComponent(BoundString, {
          name: "audio.onFocus",
          signal: [audioFocus, setAudioFocus]
        }), createComponent(BoundString, {
          name: "onActivate Message",
          signal: [onActivateMessage, setOnActivateMessage]
        }), createComponent(BoundString, {
          name: "onFocus Message",
          signal: [onFocusMessage, setOnFocusMessage]
        }), createComponent(BoundString, {
          name: "onBlur Message",
          signal: [onBlurMessage, setOnBlurMessage]
        })];
      }
    }), _el$2);
    insert(_el$2, createComponent(HeroButton, {
      "class": "border-1",
      name: "ExampleActivatable",
      get audio() {
        return {
          group: audioGroup(),
          onActivate: audioActivate(),
          onPress: audioPress(),
          onError: audioError(),
          onFocus: audioFocus()
        };
      },
      get disabled() {
        return disabled();
      },
      get disableFocus() {
        return disableFocus();
      },
      get hotkeyAction() {
        return hotkeyAction();
      },
      get navTrayText() {
        return navTrayText();
      },
      onActivate: () => useMessages((m) => m.push(onActivateMessage())),
      onBlur: () => useMessages((m) => m.push(onBlurMessage())),
      onFocus: () => useMessages((m) => m.push(onFocusMessage())),
      get children() {
        return content();
      }
    }), _el$4);
    insert(_el$2, createComponent(HeroButton2, {
      "class": "border-1",
      name: "ExampleActivatable",
      get audio() {
        return {
          group: audioGroup(),
          onActivate: audioActivate(),
          onPress: audioPress(),
          onError: audioError(),
          onFocus: audioFocus()
        };
      },
      get disabled() {
        return disabled();
      },
      get disableFocus() {
        return disableFocus();
      },
      get hotkeyAction() {
        return hotkeyAction();
      },
      get navTrayText() {
        return navTrayText();
      },
      onActivate: () => useMessages((m) => m.push(onActivateMessage())),
      onBlur: () => useMessages((m) => m.push(onBlurMessage())),
      onFocus: () => useMessages((m) => m.push(onFocusMessage())),
      get children() {
        return content();
      }
    }), null);
    insert(_el$5, createComponent(Button, {
      "class": "mb-2",
      onActivate: () => useMessages((msgs) => msgs.length = 0),
      children: "Clear Log"
    }), _el$6);
    insert(_el$5, createComponent(ScrollArea, {
      "class": "flex-auto",
      get children() {
        return createComponent(For, {
          get each() {
            return messages();
          },
          children: (message) => (() => {
            var _el$8 = _tmpl$2$2();
            insert(_el$8, message);
            return _el$8;
          })()
        });
      }
    }), _el$6);
    _el$7._$owner = getOwner();
    return _el$;
  })();
};

var _tmpl$$c = /* @__PURE__ */ template(`<div class="flex flex-row flex-auto mx-4"><div class="w-2\\/3 m-2 p-2 border border-secondary-3 flex flex-col justify-center items-center"><div class="flex flex-col my-4 items-center"></div></div></div>`);
const IconExample = () => {
  const [name, setName] = createSignal("LEADER_BENJAMIN_FRANKLIN");
  const [context, setContext] = createSignal("LEADER_HAPPY");
  const [isUrl, setIsUrl] = createSignal(false);
  const [className, setClassName] = createSignal("size-64");
  return (() => {
    var _el$ = _tmpl$$c(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild;
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

var _tmpl$$b = /* @__PURE__ */ template(`<span>Add args[<!>]</span>`), _tmpl$2$1 = /* @__PURE__ */ template(`<div class="flex flex-row flex-auto mx-4"><div class="w-2\\/3 m-2 p-2 border border-secondary-3 flex flex-col justify-center items-center"><div class="flex flex-col my-4 items-center"><div>L10n.Compose</div><div class=mt-8>L10n.Stylize</div></div></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="flex flex-row items-center justify-center">args[<!>]</div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="relative h-10"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<span>Remove args[<!>]</span>`);
const L10nExample = () => {
  const [text, setText] = createSignal("LOC_TRAIT_AKSUM_ABILITY_DESCRIPTION");
  const [args, useArgs] = createArraySignal();
  return (() => {
    var _el$ = _tmpl$2$1(), _el$6 = _el$.firstChild, _el$7 = _el$6.firstChild, _el$8 = _el$7.firstChild, _el$9 = _el$8.nextSibling;
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
            var _el$2 = _tmpl$$b(), _el$3 = _el$2.firstChild, _el$5 = _el$3.nextSibling, _el$4 = _el$5.nextSibling;
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

var _tmpl$$a = /* @__PURE__ */ template(`<div class="flex flex-row flex-auto mx-4"><div class="w-1\\/3 m-2 p-2 border border-secondary-3 flex flex-col justify-center items-center"></div><div class="w-1\\/3 m-2 p-2 bg-accent-6 border border-secondary-3"><div class="w-64 h-16 border"><nav-tray></nav-tray></div></div></div>`, true, false, false), _tmpl$2 = /* @__PURE__ */ template(`<div></div>`);
const LinkExample = () => {
  const [audioGroup, setAudioGroup] = createSignal();
  const [audioActivate, setAudioActivate] = createSignal();
  const [audioPress, setAudioPress] = createSignal();
  const [audioError, setAudioError] = createSignal();
  const [audioFocus, setAudioFocus] = createSignal();
  const [disabled, setDisabled] = createSignal(false);
  const [disableFocus, setDisableFocus] = createSignal(false);
  const [hotkeyAction, setHotkeyAction] = createSignal();
  const [navTrayText, setNavtrayText] = createSignal();
  const [onActivateMessage, setOnActivateMessage] = createSignal("onActivate");
  const [onBlurMessage, setOnBlurMessage] = createSignal("onBlur");
  const [onFocusMessage, setOnFocusMessage] = createSignal("onFocus");
  const [content, setContent] = createSignal("Button");
  const [messages, useMessages] = createArraySignal(["Message Log"]);
  return (() => {
    var _el$ = _tmpl$$a(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling, _el$4 = _el$3.firstChild, _el$5 = _el$4.firstChild;
    insert(_el$, createComponent(ScrollArea, {
      "class": "w-1\\/3 m-2 p-2 border border-secondary-3",
      get children() {
        return [createComponent(BoundString, {
          name: "content",
          signal: [content, setContent]
        }), createComponent(BoundBoolean, {
          name: "disabled",
          signal: [disabled, setDisabled]
        }), createComponent(BoundBoolean, {
          name: "disableFocus",
          signal: [disableFocus, setDisableFocus]
        }), createComponent(BoundString, {
          name: "hotkeyAction",
          signal: [hotkeyAction, setHotkeyAction]
        }), createComponent(BoundString, {
          name: "navTrayText",
          signal: [navTrayText, setNavtrayText]
        }), createComponent(BoundString, {
          name: "audio.group",
          signal: [audioGroup, setAudioGroup]
        }), createComponent(BoundString, {
          name: "audio.onActivate",
          signal: [audioActivate, setAudioActivate]
        }), createComponent(BoundString, {
          name: "audio.onPress",
          signal: [audioPress, setAudioPress]
        }), createComponent(BoundString, {
          name: "audio.onError",
          signal: [audioError, setAudioError]
        }), createComponent(BoundString, {
          name: "audio.onFocus",
          signal: [audioFocus, setAudioFocus]
        }), createComponent(BoundString, {
          name: "onActivate Message",
          signal: [onActivateMessage, setOnActivateMessage]
        }), createComponent(BoundString, {
          name: "onFocus Message",
          signal: [onFocusMessage, setOnFocusMessage]
        }), createComponent(BoundString, {
          name: "onBlur Message",
          signal: [onBlurMessage, setOnBlurMessage]
        })];
      }
    }), _el$2);
    insert(_el$2, createComponent(Link, {
      "class": "border-1",
      name: "ExampleActivatable",
      get audio() {
        return {
          group: audioGroup(),
          onActivate: audioActivate(),
          onPress: audioPress(),
          onError: audioError(),
          onFocus: audioFocus()
        };
      },
      get disabled() {
        return disabled();
      },
      get disableFocus() {
        return disableFocus();
      },
      get hotkeyAction() {
        return hotkeyAction();
      },
      get navTrayText() {
        return navTrayText();
      },
      onActivate: () => useMessages((m) => m.push(onActivateMessage())),
      onBlur: () => useMessages((m) => m.push(onBlurMessage())),
      onFocus: () => useMessages((m) => m.push(onFocusMessage())),
      get children() {
        return content();
      }
    }));
    insert(_el$3, createComponent(Button, {
      "class": "mb-2",
      onActivate: () => useMessages((msgs) => msgs.length = 0),
      children: "Clear Log"
    }), _el$4);
    insert(_el$3, createComponent(ScrollArea, {
      "class": "flex-auto",
      get children() {
        return createComponent(For, {
          get each() {
            return messages();
          },
          children: (message) => (() => {
            var _el$6 = _tmpl$2();
            insert(_el$6, message);
            return _el$6;
          })()
        });
      }
    }), _el$4);
    _el$5._$owner = getOwner();
    return _el$;
  })();
};

var _tmpl$$9 = /* @__PURE__ */ template(`<div class="flex flex-row flex-auto mx-4"><div class="w-2\\/3 m-2 p-2 border border-secondary-3 flex flex-col justify-center items-center"><div class=mt-8>Alone</div></div></div>`);
const NavHelpExample = () => {
  const [actionName, setActionName] = createSignal("accept");
  const [disabled, setDisabled] = createSignal(false);
  return (() => {
    var _el$ = _tmpl$$9(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild;
    insert(_el$, createComponent(ScrollArea, {
      "class": "w-1\\/3 m-2 p-2 border border-secondary-3",
      get children() {
        return [createComponent(BoundString, {
          name: "actionName",
          signal: [actionName, setActionName]
        }), createComponent(BoundBoolean, {
          name: "disabled",
          signal: [disabled, setDisabled]
        })];
      }
    }), _el$2);
    insert(_el$2, createComponent(Button, {
      "class": "border-1",
      name: "ExampleActivatable",
      get hotkeyAction() {
        return actionName();
      },
      get children() {
        return [createComponent(NavHelp, {
          "class": "mr-2",
          get actionName() {
            return actionName();
          }
        }), "From button context"];
      }
    }), _el$3);
    insert(_el$2, createComponent(NavHelp, {
      get actionName() {
        return actionName();
      }
    }), null);
    return _el$;
  })();
};

var _tmpl$$8 = /* @__PURE__ */ template(`<div>Panel</div>`);
const PanelExample = () => {
  return _tmpl$$8();
};

var _tmpl$$7 = /* @__PURE__ */ template(`<div>Radio Button</div>`);
const RadioButtonExample = () => {
  return _tmpl$$7();
};

var _tmpl$$6 = /* @__PURE__ */ template(`<div>Scroll Area</div>`);
const ScrollAreaExample = () => {
  return _tmpl$$6();
};

var _tmpl$$5 = /* @__PURE__ */ template(`<div>Slot</div>`);
const SlotExample = () => {
  return _tmpl$$5();
};

var _tmpl$$4 = /* @__PURE__ */ template(`<div>Tab</div>`);
const TabExample = () => {
  return _tmpl$$4();
};

var _tmpl$$3 = /* @__PURE__ */ template(`<div>Tooltip</div>`);
const TooltipExample = () => {
  return _tmpl$$3();
};

var _tmpl$$2 = /* @__PURE__ */ template(`<div>Trigger</div>`);
const TriggerExample = () => {
  return _tmpl$$2();
};

var _tmpl$$1 = /* @__PURE__ */ template(`<div class="relative w-full"><div></div></div>`);
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
      var _el$ = _tmpl$$1(), _el$2 = _el$.firstChild;
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

const simpleNav = new SandboxNavigation();
render(() => {
  let ref;
  onMount(() => {
    simpleNav.setFocus(ref);
  });
  return createComponent(Panel, {
    id: "component-browser-panel",
    name: "component-browser",
    "class": "w-full h-full flex flex-col",
    ref(r$) {
      var _ref$ = ref;
      typeof _ref$ === "function" ? _ref$(r$) : ref = r$;
    },
    get children() {
      return createComponent(Tab, {
        "class": "flex flex-row flex-auto m-4",
        get children() {
          return [createComponent(BorderPanel, {
            "class": "items-end",
            title: "Components",
            get children() {
              return createComponent(TabListLinks, {});
            }
          }), createComponent(BorderPanel, {
            "class": "items-center flex-auto",
            get title() {
              return createComponent(Tab.Title, {});
            },
            get children() {
              return createComponent(Tab.Output, {});
            }
          }), createComponent(Tab.Item, {
            name: "activatable-example",
            title: () => "Activatable",
            body: () => createComponent(ActivatableExample, {})
          }), createComponent(Tab.Item, {
            name: "arrow-buutton-example",
            title: () => "Arrow Button",
            body: () => createComponent(ArrowButtonExample, {})
          }), createComponent(Tab.Item, {
            name: "audio-group-example",
            title: () => "Audio Group",
            body: () => createComponent(AudioGroupExample, {})
          }), createComponent(Tab.Item, {
            name: "button-example",
            title: () => "Button",
            body: () => createComponent(ButtonExample, {})
          }), createComponent(Tab.Item, {
            name: "filigree-example",
            title: () => "Filigree & Header",
            body: () => createComponent(FiligreeExample, {})
          }), createComponent(Tab.Item, {
            name: "flipbook-example",
            title: () => "Flipbook",
            body: () => createComponent(FlipbookExample, {})
          }), createComponent(Tab.Item, {
            name: "hero-button",
            title: () => "Hero Button",
            body: () => createComponent(HeroButtonExample, {})
          }), createComponent(Tab.Item, {
            name: "icon-example",
            title: () => "Icon",
            body: () => createComponent(IconExample, {})
          }), createComponent(Tab.Item, {
            name: "l10n-example",
            title: () => "L10n",
            body: () => createComponent(L10nExample, {})
          }), createComponent(Tab.Item, {
            name: "link-example",
            title: () => "Link",
            body: () => createComponent(LinkExample, {})
          }), createComponent(Tab.Item, {
            name: "nav-help-example",
            title: () => "Nav Help",
            body: () => createComponent(NavHelpExample, {})
          }), createComponent(Tab.Item, {
            name: "panel-example",
            title: () => "Panel",
            body: () => createComponent(PanelExample, {})
          }), createComponent(Tab.Item, {
            name: "radio-button-example",
            title: () => "Radio Button",
            body: () => createComponent(RadioButtonExample, {})
          }), createComponent(Tab.Item, {
            name: "scroll-area-example",
            title: () => "Scroll Area",
            body: () => createComponent(ScrollAreaExample, {})
          }), createComponent(Tab.Item, {
            name: "slot-example",
            title: () => "Slot",
            body: () => createComponent(SlotExample, {})
          }), createComponent(Tab.Item, {
            name: "tab-example",
            title: () => "Tab",
            body: () => createComponent(TabExample, {})
          }), createComponent(Tab.Item, {
            name: "tooltip-example",
            title: () => "Tooltip",
            body: () => createComponent(TooltipExample, {})
          }), createComponent(Tab.Item, {
            name: "trigger-example",
            title: () => "Trigger",
            body: () => createComponent(TriggerExample, {})
          }), createComponent(Tab.Item, {
            name: "virtual-scroll-area-example",
            title: () => "Virtual Scroll Area",
            body: () => createComponent(VirtualScrollAreaExample, {})
          })];
        }
      });
    }
  });
}, document.getElementById("root"));
//# sourceMappingURL=components-browser.js.map

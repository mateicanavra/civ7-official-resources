import { template, insert } from '../../../vendor/solid-js/web/dist/web.js';
import { createSignal, createComponent, For, getOwner } from '../../../vendor/solid-js/dist/solid.js';
import { Activatable } from '../../components/activatable.js';
import { Button } from '../../components/button.js';
import { ScrollArea } from '../../components/scroll-area.js';
import { BoundString, BoundBoolean } from './components/bound-property.js';
import { createArraySignal } from '../../utilities/solid-utilities.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="flex flex-row flex-auto mx-4"><div class="w-1\\/3 m-2 p-2 border border-secondary-3 flex flex-col justify-center items-center"></div><div class="w-1\\/3 m-2 p-2 bg-accent-6 border border-secondary-3"><div class="w-64 h-16 border"><nav-tray></nav-tray></div></div></div>`, true, false, false), _tmpl$2 = /* @__PURE__ */ template(`<div></div>`);
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
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling, _el$4 = _el$3.firstChild, _el$5 = _el$4.firstChild;
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

export { ActivatableExample };
//# sourceMappingURL=activatable-example.js.map

import { template, insert, className } from '../../vendor/solid-js/web/dist/web.js';
import { splitProps, createMemo, createComponent, mergeProps, createRenderEffect } from '../../vendor/solid-js/dist/solid.js';
import { Activatable } from './activatable.js';
import { ArrowButton } from './arrow-button.js';
import { AudioContextProvider } from './audio-context-provider.js';
import { L10n } from './l10n.js';
import { NavHelp } from './nav-help.js';
import { Tooltip } from './tooltip.js';
import { useAudio } from '../services/audio-support.js';
import { ComponentRegistry } from '../services/component-registry.js';

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="img-rollover-highlight absolute inset-0 opacity-0 group-focus\\:opacity-100 group-hover\\:opacity-100 group-pressed\\:opacity-100 pointer-events-none"></div>`);
function SelectorSmallComponent(props) {
  const [local, other] = splitProps(props, ["class", "items", "selectedValue", "setSelectedValue"]);
  const selectedItem = createMemo(() => local.items?.find((i) => i.value == local.selectedValue()) ?? local.items[0]);
  const selectedIndex = createMemo(() => local.items?.findIndex((i) => i.value == local.selectedValue()));
  const previousActionKey = createMemo(() => props.previousActionKey ?? "nav-previous");
  const nextActionKey = createMemo(() => props.nextActionKey ?? "nav-next");
  const audioTrigger = useAudio();
  function selectNext() {
    if (!props.disabled) {
      let newIndex = selectedIndex() + 1;
      if (newIndex >= local.items.length) {
        newIndex = 0;
      }
      local.setSelectedValue(local.items[newIndex].value);
    }
  }
  function selectPrevious() {
    if (!props.disabled) {
      let newIndex = selectedIndex() - 1;
      if (newIndex < 0) {
        newIndex = local.items.length - 1;
      }
      local.setSelectedValue(local.items[newIndex].value);
    }
  }
  function onNavigate(navigationEvent) {
    if (navigationEvent.detail.status == InputActionStatuses.FINISH) {
      if (navigationEvent.detail.name == previousActionKey()) {
        selectPrevious();
        audioTrigger("nav-previous");
        navigationEvent.preventDefault();
        navigationEvent.stopPropagation();
      } else if (navigationEvent.detail.name == nextActionKey()) {
        selectNext();
        audioTrigger("nav-next");
        navigationEvent.preventDefault();
        navigationEvent.stopPropagation();
      }
    }
  }
  return createComponent(Tooltip.Text, {
    get text() {
      return selectedItem()?.description;
    },
    bodyClass: "flex flex-row justify-center",
    get children() {
      return createComponent(AudioContextProvider, {
        segment: "Option",
        get children() {
          return createComponent(Activatable, mergeProps(other, {
            get ["class"]() {
              return `flex flex-row flex-auto items-center justify-center relative group ${local.class || ""} ${props.disabled ? "opacity-40" : ""}`;
            },
            "on:navigate-input": onNavigate,
            get children() {
              return [createComponent(ArrowButton, {
                right: false,
                disableFocus: true,
                onActivate: selectPrevious,
                get ["class"]() {
                  return props.arrowClass ?? "";
                }
              }), createComponent(NavHelp, {
                get actionName() {
                  return previousActionKey();
                },
                "class": "mx-1 opacity-0 group-focus\\:opacity-100"
              }), (() => {
                var _el$ = _tmpl$();
                insert(_el$, createComponent(L10n.Compose, {
                  get text() {
                    return selectedItem()?.name ?? "";
                  }
                }));
                createRenderEffect((_p$) => {
                  var _v$ = `flex-auto flex flex-col items-center justify-center ${props.fixedWidth ? "font-fit-shrink" : ""}`, _v$2 = props.fixedWidth;
                  _v$ !== _p$.e && className(_el$, _p$.e = _v$);
                  _v$2 !== _p$.t && ((_p$.t = _v$2) != null ? _el$.style.setProperty("width", _v$2) : _el$.style.removeProperty("width"));
                  return _p$;
                }, {
                  e: void 0,
                  t: void 0
                });
                return _el$;
              })(), createComponent(NavHelp, {
                get actionName() {
                  return nextActionKey();
                },
                "class": "mx-1 opacity-0 group-focus\\:opacity-100"
              }), createComponent(ArrowButton, {
                right: true,
                disableFocus: true,
                onActivate: selectNext,
                get ["class"]() {
                  return props.arrowClass ?? "";
                }
              }), _tmpl$2()];
            }
          }));
        }
      });
    }
  });
}
const SelectorSmall = ComponentRegistry.register("SelectorSmall", SelectorSmallComponent);

export { SelectorSmall };
//# sourceMappingURL=selector-small.js.map

import { template, insert, classList, use, Portal, className } from '../../vendor/solid-js/web/dist/web.js';
import { createSignal, createContext, useContext, createMemo, createComponent, Show, createRenderEffect, createEffect, on, onMount, onCleanup } from '../../vendor/solid-js/dist/solid.js';
import { Activatable } from './activatable.js';
import { Panel } from './panel.js';
import { ScrollArea } from './scroll-area.js';
import { Slot } from './slot.js';
import { useAudio } from '../services/audio-support.js';
import { FocusManager } from '../services/focus-manager.js';
import { LayoutModel } from '../utilities/layout-utilities.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="mr-0\\.5 rotate-180 img-selection-arrow"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="absolute inset-0\\.5 img-dropdown-focus opacity-0 group-focus\\:opacity-70 group-hover\\:opacity-70 group-pressed\\:opacity-70 flex flex-row items-center justify-start"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="ml-3 relative"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="dropdown__bg absolute inset-px transition-opacity bg-primary-3"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="dropdown__highlight absolute -inset-0\\.5 fxs-dropdown-gradient img-dropdown-box-focus opacity-0 transition-opacity group-hover\\:opacity-100 group-focus\\:opacity-100 group-pressed\\:opacity-100"></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="dropdown__label relative flex-auto"></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="dropdown__open-arrow min-w-8 min-h-12 -my-2 mr-1\\.5 img-arrow transition-transform relative"></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div data-name=Dropdown></div>`);
const DropdownListNavRules = /* @__PURE__ */ new Map([[InputNavigationAction.UP, (context) => {
  context.focusPrevious();
  return true;
}], [InputNavigationAction.DOWN, (context) => {
  context.focusNext();
  return true;
}], [InputNavigationAction.NONE, (context) => context.focusCurrent()], [InputNavigationAction.NEXT, (context) => context.focusCurrent()]]);
class DropDownContextProvider {
  _selectedValue;
  _setSelectedValue;
  _isEditing;
  _setIsEditing;
  constructor(defaultValue) {
    const [selectedValue, setSelectedValue] = createSignal(defaultValue);
    const [isEditing, setIsEditing] = createSignal(false);
    this._selectedValue = selectedValue;
    this._setSelectedValue = setSelectedValue;
    this._isEditing = isEditing;
    this._setIsEditing = setIsEditing;
  }
  get selectedValue() {
    return this._selectedValue;
  }
  get isEditing() {
    return this._isEditing;
  }
  setSelectedValue(value) {
    return this._setSelectedValue(value);
  }
  setIsEditing(value) {
    return this._setIsEditing(value);
  }
}
const DropDownContext = createContext();
function useDropDownContext() {
  const context = useContext(DropDownContext);
  if (!context) {
    throw new Error("Unable to find context provider for DropDownContext");
  }
  return context;
}
function DropdownItem(props) {
  const context = useDropDownContext();
  const value = createMemo(() => props.value);
  function selectItem() {
    context?.setSelectedValue(value());
  }
  const isSelected = createMemo(() => context.selectedValue() == value());
  return createComponent(Activatable, {
    get disabled() {
      return props.disabled;
    },
    onActivate: selectItem,
    get ["class"]() {
      return `group relative ${props.class ?? "p-2"}`;
    },
    get children() {
      return [(() => {
        var _el$ = _tmpl$2();
        insert(_el$, createComponent(Show, {
          get when() {
            return isSelected();
          },
          get children() {
            return _tmpl$();
          }
        }));
        createRenderEffect((_$p) => classList(_el$, {
          "opacity-30": isSelected(),
          "group-hover:opacity-100": !isSelected()
        }, _$p));
        return _el$;
      })(), (() => {
        var _el$3 = _tmpl$3();
        insert(_el$3, () => props.children);
        return _el$3;
      })()];
    }
  });
}
function Dropdown(props) {
  const context = new DropDownContextProvider(props.defaultValue);
  const audioTrigger = useAudio();
  const dropdownMount = document.getElementById("uinext-dropdowns") ?? void 0;
  let ref;
  let popupRef;
  let activatableRef;
  const [dropdownMaxHeight, setDropdownMaxHeight] = createSignal(void 0);
  const [dropdownWidth, setDropdownWidth] = createSignal(void 0);
  const [dropdownTop, setDropdownTop] = createSignal(void 0);
  const [dropdownLeft, setDropdownLeft] = createSignal(void 0);
  const [openUp, setOpenUp] = createSignal(false);
  const selectionTemplate = createMemo(() => {
    const selectedItem = context.selectedValue();
    const fallback = props.fallback ?? "Select An Item";
    return selectedItem ? props.selectedItemTemplate(selectedItem) : fallback;
  });
  const maxHeightPx = LayoutModel.get().toScaledPixels(512);
  let prevFocus;
  createEffect(on(() => props.defaultValue, (value) => {
    if (value) {
      context.setSelectedValue(value);
    }
  }));
  onMount(() => {
    window.addEventListener("click", handleClickOutside, true);
    window.addEventListener("touchstart", handleTouchOutside, true);
  });
  onCleanup(() => {
    window.removeEventListener("click", handleClickOutside, true);
    window.removeEventListener("touchstart", handleTouchOutside, true);
  });
  function triggerAudio() {
    if (context.isEditing()) {
      audioTrigger("Dropdown", "dropdown-open");
    } else {
      audioTrigger("Dropdown", "dropdown-close");
    }
  }
  function closeDropdown() {
    const shouldPlayAudio = context.isEditing();
    context.setIsEditing(false);
    if (shouldPlayAudio) {
      triggerAudio();
    }
  }
  createEffect(on(() => context.selectedValue(), (value) => {
    closeDropdown();
    props.onItemSelected?.(value);
  }));
  createEffect(on(() => context.isEditing(), (isEditing) => {
    if (isEditing) {
      prevFocus = FocusManager.get().currentFocus();
    } else if (prevFocus) {
      FocusManager.get().setFocus(prevFocus);
      prevFocus = void 0;
    }
  }));
  createEffect(on(() => context.isEditing(), (isEditing) => {
    if (isEditing) {
      const rect = ref.getBoundingClientRect();
      const availableHeightTop = rect.top;
      const availableHeightBottom = window.innerHeight - rect.bottom;
      const MARGIN = 4;
      setOpenUp(availableHeightTop > availableHeightBottom);
      if (openUp()) {
        setDropdownMaxHeight(`${Math.min(availableHeightTop - MARGIN, maxHeightPx())}px`);
        setDropdownTop(`${rect.top}px`);
      } else {
        setDropdownMaxHeight(`${Math.min(availableHeightBottom - MARGIN, maxHeightPx())}px`);
        setDropdownTop(`${Math.max(rect.bottom, 0)}px`);
      }
      setDropdownLeft(`${Math.max(rect.left, 0)}px`);
      setDropdownWidth(`${Math.max(rect.width, 0)}px`);
    }
  }));
  function toggleIfOutside(target) {
    if (ref != target && !ref.contains(target) && popupRef != target && !popupRef?.contains(target)) {
      closeDropdown();
    }
  }
  function handleClickOutside(event) {
    toggleIfOutside(event.target);
  }
  function handleTouchOutside(event) {
    toggleIfOutside(event.target);
  }
  return (() => {
    var _el$4 = _tmpl$8();
    var _ref$ = ref;
    typeof _ref$ === "function" ? use(_ref$, _el$4) : ref = _el$4;
    insert(_el$4, createComponent(Activatable, {
      ref(r$) {
        var _ref$2 = activatableRef;
        typeof _ref$2 === "function" ? _ref$2(r$) : activatableRef = r$;
      },
      onActivate: () => {
        context.setIsEditing((value) => !value);
        triggerAudio();
      },
      "on:blur": (event) => {
        handleClickOutside(event);
      },
      get disabled() {
        return props.disabled;
      },
      get disableFocus() {
        return props.disableFocus;
      },
      get onFocus() {
        return props.onFocus;
      },
      "data-name": "dropdown-handle",
      "class": "relative flex flex-auto flex-row items-center justify-between group w-full",
      get hotkeyAction() {
        return props.hotkey;
      },
      get autoFocus() {
        return props.autoFocus;
      },
      get tabIndex() {
        return props.tabIndex;
      },
      get children() {
        return [_tmpl$4(), _tmpl$5(), (() => {
          var _el$7 = _tmpl$6();
          insert(_el$7, selectionTemplate);
          return _el$7;
        })(), (() => {
          var _el$8 = _tmpl$7();
          createRenderEffect((_p$) => {
            var _v$ = !!props.disabled, _v$2 = !!(context.isEditing() && !openUp()), _v$3 = !!(context.isEditing() && openUp());
            _v$ !== _p$.e && _el$8.classList.toggle("disabled", _p$.e = _v$);
            _v$2 !== _p$.t && _el$8.classList.toggle("-rotate-90", _p$.t = _v$2);
            _v$3 !== _p$.a && _el$8.classList.toggle("rotate-90", _p$.a = _v$3);
            return _p$;
          }, {
            e: void 0,
            t: void 0,
            a: void 0
          });
          return _el$8;
        })()];
      }
    }), null);
    insert(_el$4, createComponent(DropDownContext.Provider, {
      value: context,
      get children() {
        return createComponent(Show, {
          get when() {
            return context.isEditing();
          },
          get children() {
            return createComponent(Portal, {
              mount: dropdownMount,
              get children() {
                return createComponent(Panel, {
                  name: "dropdown-panel",
                  id: "dropdown-panel",
                  "class": "absolute z-1 img-dropdown-box flex flex-col pointer-events-none",
                  ref(r$) {
                    var _ref$3 = popupRef;
                    typeof _ref$3 === "function" ? _ref$3(r$) : popupRef = r$;
                  },
                  get style() {
                    return {
                      left: dropdownLeft(),
                      width: dropdownWidth(),
                      top: dropdownTop(),
                      "max-height": dropdownMaxHeight(),
                      // Transform directly applied rather than classList, as later drops merged properties on re-opening.
                      transform: openUp() ? "translateY(-100%)" : void 0,
                      "transform-origin": openUp() ? "bottom" : "top"
                    };
                  },
                  onCancelInput: closeDropdown,
                  get children() {
                    return createComponent(ScrollArea, {
                      "class": "flex-auto",
                      get children() {
                        return createComponent(Slot, {
                          "class": "flex flex-col",
                          navRules: DropdownListNavRules,
                          get children() {
                            return props.children;
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    }), null);
    createRenderEffect(() => className(_el$4, `dropdown__container relative border-2 border-primary-1 min-h-10 ${props.class ?? "min-w-76"}`));
    return _el$4;
  })();
}

export { DropDownContext, DropDownContextProvider, Dropdown, DropdownItem, useDropDownContext };
//# sourceMappingURL=dropdown.js.map

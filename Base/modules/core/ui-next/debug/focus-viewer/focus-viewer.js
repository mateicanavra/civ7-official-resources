import { template, addEventListener, insert, className } from '../../../vendor/solid-js/web/dist/web.js';
import { createSignal, createMemo, createComponent, For, createRenderEffect, onMount, Show } from '../../../vendor/solid-js/dist/solid.js';
import { Activatable } from '../../components/activatable.js';
import { defineLegacyComponent } from '../../components/fxs-solid-component.js';
import { Icon } from '../../components/icon.js';
import { ScrollArea } from '../../components/scroll-area.js';
import { ComponentRegistry } from '../../services/component-registry.js';
import { FocusManager } from '../../services/focus-manager.js';
import { isFocusableAFocusContext, getFocusableElement, focusableToString, rootFocus } from '../../services/focus.js';
import style from './focus-viewer.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="flex flex-col pointer-events-auto"><div></div><div class="flex flex-col ml-6"></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="absolute max-w-128 h-screen right-0 top-0 bottom-0 flex flex-col items-end justify-start"></div>`);
const FocusTreeNode = (props) => {
  const [isHovered, setIsHovered] = createSignal(false);
  const focusClass = createMemo(() => `level-${props.focusLevel}`);
  const focusManager = FocusManager.get();
  const children = () => {
    return isFocusableAFocusContext(props.focusable) ? props.focusable.children() : [];
  };
  const element = createMemo(() => getFocusableElement(props.focusable));
  const currentFocus = createMemo(() => props.focusable?.currentFocus?.());
  const isFocused = createMemo(() => focusManager.activeElement() == element());
  function startHighlight() {
    const currentElement = element();
    if (currentElement?.isConnected && currentElement != document.body) {
      currentElement.classList.add("debug-focus", focusClass());
    }
    setIsHovered(true);
  }
  function endHighlight() {
    const currentElement = element();
    if (currentElement?.isConnected) {
      currentElement.classList.remove("debug-focus", focusClass());
    }
    setIsHovered(false);
  }
  return (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling;
    addEventListener(_el$, "mouseleave", () => endHighlight());
    addEventListener(_el$, "mouseenter", () => startHighlight());
    insert(_el$2, () => focusableToString(props.focusable));
    insert(_el$3, createComponent(For, {
      get each() {
        return children();
      },
      children: (focusable) => [_tmpl$2(), createComponent(FocusTreeNode, {
        focusable,
        get focusLevel() {
          return props.focusLevel + 1;
        },
        get isDefault() {
          return focusable == currentFocus();
        }
      })]
    }));
    createRenderEffect((_p$) => {
      var _v$ = `min-w-64 p-1 debug-focus focus-item ${isHovered() ? focusClass() : ""}`, _v$2 = !!isFocused(), _v$3 = !!props.isDefault;
      _v$ !== _p$.e && className(_el$2, _p$.e = _v$);
      _v$2 !== _p$.t && _el$2.classList.toggle("focus", _p$.t = _v$2);
      _v$3 !== _p$.a && _el$2.classList.toggle("default-focus", _p$.a = _v$3);
      return _p$;
    }, {
      e: void 0,
      t: void 0,
      a: void 0
    });
    return _el$;
  })();
};
const FocusViewerComponent = (props) => {
  const [isVisible, setIsVisible] = createSignal(props.initialVisibility);
  const icon = createMemo(() => isVisible() ? "Action_Sleep" : "Action_Wake");
  onMount(() => {
    console.log("FocusViewer mounted");
  });
  return (() => {
    var _el$5 = _tmpl$3();
    insert(_el$5, createComponent(Activatable, {
      disableFocus: true,
      "class": "border-2 size-16 border-white self-end m-4",
      onActivate: () => setIsVisible((collapsed) => !collapsed),
      get children() {
        return createComponent(Icon, {
          "class": "size-16",
          get name() {
            return icon();
          }
        });
      }
    }), null);
    insert(_el$5, createComponent(Show, {
      get when() {
        return isVisible();
      },
      get children() {
        return createComponent(ScrollArea, {
          "class": "flex flex-col flex-auto",
          get children() {
            return createComponent(FocusTreeNode, {
              focusable: rootFocus,
              focusLevel: 0,
              isDefault: true
            });
          }
        });
      }
    }), null);
    return _el$5;
  })();
};
const FocusViewer = ComponentRegistry.register({
  name: "FocusViewer",
  createInstance: FocusViewerComponent,
  styles: [style]
});
const FxsFocusViewer = defineLegacyComponent("fxs-focus-viewer", {}, FocusViewerComponent);

export { FocusViewer, FxsFocusViewer };
//# sourceMappingURL=focus-viewer.js.map

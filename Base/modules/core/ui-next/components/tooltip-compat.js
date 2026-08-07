import { template } from '../../vendor/solid-js/web/dist/web.js';
import { createContext, createMemo, runWithOwner, createRenderEffect, useContext, createComponent, Show } from '../../vendor/solid-js/dist/solid.js';
import { defineLegacyComponent } from './fxs-solid-component.js';
import { TooltipKeyword } from './tooltip-keyword.js';
import { TooltipContext, TooltipVerticalPosition, TooltipHorizontalPosition, Tooltip } from './tooltip.js';
import { isFocusable } from '../services/focus.js';

var _tmpl$ = /* @__PURE__ */ template(`<span class=text-accent-1></span>`);
const _PROTECTED_IMPORTS = [isFocusable];
const NestedTooltipContext = createContext();
const isNestedTooltipContextDisabled = (ctx) => {
  const disabled = ctx?.disabled;
  if (!disabled) {
    return false;
  }
  return typeof disabled === "function" ? disabled() : disabled;
};
const findOwnerFromElement = (element) => {
  if (!element) return null;
  let current = element;
  while (current) {
    const owner = current.owner;
    if (owner) return owner;
    current = current.parentElement;
  }
  return null;
};
defineLegacyComponent("fxs-tip", {
  attrs: {
    "data-content": null,
    "data-caption": null
  },
  initializeImmediately: true
}, (attrs, element) => {
  if (!element || !(element instanceof HTMLElement)) {
    throw new Error("fxs-tip requires a host element");
  }
  const owner = findOwnerFromElement(element.parentElement);
  const keywordText = element.textContent?.trim();
  const tooltipCaption = createMemo(() => {
    if (attrs["data-caption"]) {
      return attrs["data-caption"].trim();
    }
    return "";
  });
  return owner == null ? (() => {
    var _el$ = _tmpl$();
    createRenderEffect(() => _el$.innerHTML = tooltipCaption());
    return _el$;
  })() : runWithOwner(owner, () => {
    const ctx = useContext(TooltipContext);
    const nestedCtx = useContext(NestedTooltipContext);
    const tooltipText = createMemo(() => {
      if (attrs["data-content"]) {
        return attrs["data-content"].trim();
      }
      return "";
    });
    const initialVPosition = ctx?.vPosition() === TooltipVerticalPosition.TOP ? TooltipVerticalPosition.TOP : TooltipVerticalPosition.BOTTOM;
    const initialHPosition = ctx?.hPosition() === TooltipHorizontalPosition.LEFT ? TooltipHorizontalPosition.LEFT : TooltipHorizontalPosition.RIGHT;
    let activatableRef;
    return createComponent(Show, {
      get when() {
        return !isNestedTooltipContextDisabled(nestedCtx);
      },
      get fallback() {
        return (() => {
          var _el$2 = _tmpl$();
          createRenderEffect(() => _el$2.innerHTML = tooltipCaption());
          return _el$2;
        })();
      },
      get children() {
        return createComponent(Tooltip.Text, {
          header: keywordText,
          get text() {
            return tooltipText();
          },
          initialVPosition,
          initialHPosition,
          allowFlip: true,
          get children() {
            return createComponent(TooltipKeyword, {
              ref(r$) {
                var _ref$ = activatableRef;
                typeof _ref$ === "function" ? _ref$(r$) : activatableRef = r$;
              },
              get children() {
                return tooltipCaption();
              }
            });
          }
        });
      }
    });
  });
});

export { NestedTooltipContext, isNestedTooltipContextDisabled };
//# sourceMappingURL=tooltip-compat.js.map

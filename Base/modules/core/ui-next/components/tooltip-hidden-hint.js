import { template, insert } from '../../vendor/solid-js/web/dist/web.js';
import { createMemo, createComponent } from '../../vendor/solid-js/dist/solid.js';
import ContextManager from '../../ui/context-manager/context-manager.js';
import { Button } from './button.js';
import { defineLegacyComponent } from './fxs-solid-component.js';
import { L10n } from './l10n.js';
import { ModalFrame } from './modal-frame.js';
import { KBMNavHelp, NavHelp } from './nav-help.js';
import { Panel } from './panel.js';
import { ComponentRegistry } from '../services/component-registry.js';
import { HotkeyIconContext } from '../services/hotkey.js';
import { IsKeyboardActive, IsMouseActive } from '../services/input.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="font-title text-base text-center uppercase"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<span class="flex flex-row items-center justify-center gap-1"></span>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="font-body text-sm text-center"></div>`);
const TOOLTIP_HIDDEN_HINT_SCREEN_ID = "tooltip-hidden-hint";
const TooltipHiddenHintComponent = () => {
  const close = () => ContextManager.pop(TOOLTIP_HIDDEN_HINT_SCREEN_ID);
  const isKBM = createMemo(() => IsKeyboardActive() || IsMouseActive());
  const hotkeyIconProvider = {
    disabled: () => false,
    actionName: () => "toggle-tooltip"
  };
  const navHelp = () => {
    if (isKBM()) {
      return createComponent(KBMNavHelp, {
        actionName: "keyboard-inspect-tooltip"
      });
    }
    return createComponent(NavHelp, {
      actionName: "toggle-tooltip",
      "class": "size-8"
    });
  };
  return createComponent(Panel, {
    name: "Tooltip Hidden Hint",
    id: TOOLTIP_HIDDEN_HINT_SCREEN_ID,
    onCancelInput: close,
    "class": "fixed inset-0 flex items-center justify-center",
    get children() {
      return createComponent(ModalFrame, {
        "class": "flex flex-col items-center gap-4 max-w-sm",
        get children() {
          return [(() => {
            var _el$ = _tmpl$();
            insert(_el$, createComponent(L10n.Compose, {
              text: "LOC_UI_TOOLTIP_HIDDEN_HINT_TITLE"
            }));
            return _el$;
          })(), (() => {
            var _el$2 = _tmpl$3();
            insert(_el$2, createComponent(HotkeyIconContext.Provider, {
              value: hotkeyIconProvider,
              get children() {
                var _el$3 = _tmpl$2();
                insert(_el$3, createComponent(L10n.Compose, {
                  text: "LOC_UI_TOOLTIP_HIDDEN_HINT_BODY_PRE"
                }), null);
                insert(_el$3, navHelp, null);
                insert(_el$3, createComponent(L10n.Compose, {
                  text: "LOC_UI_TOOLTIP_HIDDEN_HINT_BODY_POST"
                }), null);
                return _el$3;
              }
            }));
            return _el$2;
          })(), createComponent(Button, {
            onActivate: close,
            get children() {
              return createComponent(L10n.Compose, {
                text: "LOC_GENERIC_OK"
              });
            }
          })];
        }
      });
    }
  });
};
ComponentRegistry.register({
  name: "TooltipHiddenHint",
  createInstance: TooltipHiddenHintComponent
});
defineLegacyComponent(TOOLTIP_HIDDEN_HINT_SCREEN_ID, {}, () => {
  return createComponent(TooltipHiddenHintComponent, {});
});

export { TOOLTIP_HIDDEN_HINT_SCREEN_ID };
//# sourceMappingURL=tooltip-hidden-hint.js.map

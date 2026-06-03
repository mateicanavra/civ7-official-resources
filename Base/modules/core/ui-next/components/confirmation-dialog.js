import { template, insert } from '../../vendor/solid-js/web/dist/web.js';
import { createMemo, createComponent, Show } from '../../vendor/solid-js/dist/solid.js';
import { Button } from './button.js';
import { Filigree } from './filigree.js';
import { ModalFrame } from './modal-frame.js';
import { usePopupContext, Popup } from './popup.js';
import { HSlot } from './slot.js';
import { ComponentRegistry } from '../services/component-registry.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="font-title text-secondary text-xl m-1 uppercase"></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="m-2 font-body text-accent-2 text-base"></div>`);
const ConfirmationDialogComponent = (props) => {
  const context = usePopupContext();
  let accepted = false;
  const name = createMemo(() => `confirmation-dialog-${props.name}`);
  const acceptText = createMemo(() => props.acceptText ?? "LOC_GENERIC_OK");
  const cancelText = createMemo(() => props.acceptText ?? "LOC_GENERIC_CANCEL");
  const close = () => context.close(name());
  function handleAccept() {
    accepted = true;
    close();
  }
  function handleCancel() {
    close();
  }
  function handleOpen() {
    if (props.autoAccept) {
      handleAccept();
    }
  }
  function handleClose() {
    if (!accepted) {
      props.onCancel?.();
    } else {
      props.onAccept?.();
    }
  }
  return [createComponent(Popup.Trigger, {
    get name() {
      return name();
    },
    get children() {
      return props.children;
    }
  }), createComponent(Popup.Item, {
    onOpen: handleOpen,
    onClose: handleClose,
    get name() {
      return name();
    },
    get children() {
      return createComponent(ModalFrame, {
        get children() {
          return [(() => {
            var _el$ = _tmpl$();
            insert(_el$, () => props.title);
            return _el$;
          })(), createComponent(Filigree.H2, {
            "class": "mb-2"
          }), createComponent(Show, {
            get when() {
              return props.content;
            },
            get children() {
              var _el$2 = _tmpl$2();
              insert(_el$2, () => props.content);
              return _el$2;
            }
          }), createComponent(HSlot, {
            "class": "flex flex-row items-center justify-=center",
            get children() {
              return [createComponent(Button, {
                "class": "flex-2 m-2",
                onActivate: handleAccept,
                get children() {
                  return acceptText();
                }
              }), createComponent(Button, {
                "class": "flex-2 m-2",
                onActivate: handleCancel,
                get children() {
                  return cancelText();
                }
              })];
            }
          })];
        }
      });
    }
  })];
};
const ConfirmationDialog = ComponentRegistry.register({
  name: "ConfirmationDialog",
  createInstance: ConfirmationDialogComponent
});

export { ConfirmationDialog };
//# sourceMappingURL=confirmation-dialog.js.map

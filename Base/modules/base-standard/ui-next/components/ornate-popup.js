import { template, spread, insert, className } from '../../../core/vendor/solid-js/web/dist/web.js';
import { mergeProps, createComponent, createRenderEffect, Show, For } from '../../../core/vendor/solid-js/dist/solid.js';
import { Button } from '../../../core/ui-next/components/button.js';
import { CloseButton } from '../../../core/ui-next/components/close-button.js';
import { Icon } from '../../../core/ui-next/components/icon.js';
import { L10n } from '../../../core/ui-next/components/l10n.js';
import { ComponentRegistry } from '../../../core/ui-next/services/component-registry.js';

var _tmpl$ = /* @__PURE__ */ template(`<div><div class="inset-2 bg-contain bg-no-repeat bg-center absolute"></div><div class="inset-0 bg-contain bg-no-repeat bg-center absolute flex justify-center items-center"></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="fixed inset-0 img-unit-panelbox pointer-events-none"></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="filigree-panel-top-long"></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="flex flex-row min-w-96 -mt-4 justify-center relative"></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="my-4"></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="filigree-panel-top-left"></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class="filigree-panel-top-right"></div>`);
const OrnateTopIcon = (props) => {
  return (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling;
    spread(_el$, mergeProps(props, {
      get ["class"]() {
        return `flex justify-center items-center size-16 relative ${props.class}`;
      }
    }), false, true);
    _el$2.style.setProperty("background-image", "url(blp:subsystem_panel_header_icon_backing)");
    _el$3.style.setProperty("background-image", "url(blp:pedia_circle_frame)");
    insert(_el$3, createComponent(Icon, {
      get ["class"]() {
        return `${props.iconClass}`;
      },
      get name() {
        return props.iconSrc;
      }
    }));
    createRenderEffect((_$p) => (_$p = props.backgroundTint) != null ? _el$2.style.setProperty("fxs-background-image-tint", _$p) : _el$2.style.removeProperty("fxs-background-image-tint"));
    return _el$;
  })();
};
const OrnatePopupComponent = (props) => {
  const mergedProps = mergeProps({
    class: "",
    topIconClass: "absolute size-16 -mt-1",
    buttons: []
  }, props);
  return (() => {
    var _el$4 = _tmpl$6();
    insert(_el$4, createComponent(Show, {
      get when() {
        return props.isFullscreen;
      },
      get children() {
        return _tmpl$2();
      }
    }), null);
    insert(_el$4, createComponent(Show, {
      get when() {
        return !props.isFullscreen;
      },
      get children() {
        var _el$6 = _tmpl$4();
        insert(_el$6, createComponent(Show, {
          get when() {
            return props.longFiligree;
          },
          get fallback() {
            return [_tmpl$7(), _tmpl$8()];
          },
          get children() {
            return _tmpl$3();
          }
        }), null);
        insert(_el$6, createComponent(Show, {
          get when() {
            return mergedProps.topIconSrc;
          },
          get children() {
            return createComponent(OrnateTopIcon, {
              "class": "absolute -top-5",
              get backgroundTint() {
                return mergedProps.topIconBackgroundTint || "";
              },
              get iconClass() {
                return mergedProps.topIconClass;
              },
              get iconSrc() {
                return mergedProps.topIconSrc || "";
              }
            });
          }
        }), null);
        return _el$6;
      }
    }), null);
    insert(_el$4, () => mergedProps.children, null);
    insert(_el$4, createComponent(Show, {
      get when() {
        return !props.noClose;
      },
      get children() {
        return createComponent(CloseButton, {
          get ["class"]() {
            return `absolute ${props.isFullscreen ? "top-3 right-3" : "top-0 right-0 size-12"} cursor-pointer group`;
          },
          get onActivate() {
            return mergedProps.closePopupCallback;
          }
        });
      }
    }), null);
    insert(_el$4, createComponent(Show, {
      get when() {
        return mergedProps.buttons.length > 0;
      },
      get children() {
        var _el$8 = _tmpl$5();
        insert(_el$8, createComponent(For, {
          get each() {
            return mergedProps.buttons;
          },
          children: (button) => createComponent(Button, {
            "class": "mx-4",
            get onActivate() {
              return button.onActivate;
            },
            get children() {
              return createComponent(L10n.Compose, {
                get text() {
                  return button.name || "";
                }
              });
            }
          })
        }));
        return _el$8;
      }
    }), null);
    createRenderEffect(() => className(_el$4, `${props.isFullscreen ? "px-6 size-full" : "img-unit-panelbox frame-top-curve px-12"} relative flex flex-col items-center ${mergedProps.class}`));
    return _el$4;
  })();
};
const OrnatePopupFrame = ComponentRegistry.register({
  name: "OrnatePopupFrameComponent",
  createInstance: OrnatePopupComponent
});

export { OrnatePopupFrame, OrnateTopIcon };
//# sourceMappingURL=ornate-popup.js.map

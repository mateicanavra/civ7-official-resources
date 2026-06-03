import { template, className, insert } from '../../vendor/solid-js/web/dist/web.js';
import { createComponent, mergeProps, createRenderEffect, Show } from '../../vendor/solid-js/dist/solid.js';
import { CloseButton } from './close-button.js';
import { Panel } from './panel.js';
import { ComponentRegistry } from '../services/component-registry.js';

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="relative flex flex-col items-center self-stretch"><div class="flex flex-row min-w-96 -mt-8"><div class=filigree-panel-top-left></div><div class=filigree-panel-top-right></div></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class="absolute size-full pointer-events-none"><div class="relative bg-no-repeat bg-cover -mb-4 grow mx-3\\\\.5"></div></div>`), _tmpl$4 = /* @__PURE__ */ template(`<div class="flex-auto max-w-full relative"><div class="flex-auto mx-3\\\\.5"></div></div>`), _tmpl$5 = /* @__PURE__ */ template(`<div class="relative flex flex-col items-center self-stretch"><div class="flex flex-row min-w-96 -mt-8 w-full"><div class="filigree-panel-top-simplified grow mt-1 -ml-4 -mr-4"></div></div></div>`), _tmpl$6 = /* @__PURE__ */ template(`<div class="absolute size-full pointer-events-none"><div class="relative bg-no-repeat bg-cover -mb-4 grow"></div></div>`), _tmpl$7 = /* @__PURE__ */ template(`<div class="subsystem-frame__diplo-tint absolute inset-0 bg-top bg-no-repeat"></div>`), _tmpl$8 = /* @__PURE__ */ template(`<div class="relative flex flex-col items-center self-stretch h-px overflow-visible"><div class="subsystem-frame__filigree-dip relative -mt-1 bg-cover w-full"></div></div>`), _tmpl$9 = /* @__PURE__ */ template(`<div class="flex-auto max-w-full relative"><div class="flex-auto mx-8"></div></div>`), _tmpl$10 = /* @__PURE__ */ template(`<div class="relative flex flex-col items-center self-stretch"><div class="flex flex-row min-w-96 -mt-8 w-full"></div></div>`), _tmpl$11 = /* @__PURE__ */ template(`<div class="absolute top-0 left-4 bottom-0 h-1/2 w-64 mt-4 img-frame-filigree pointer-events-none"></div>`), _tmpl$12 = /* @__PURE__ */ template(`<div class="absolute top-0 right-4 bottom-0 h-1/2 w-64 mt-4 rotate-y-180 img-frame-filigree pointer-events-none"></div>`), _tmpl$13 = /* @__PURE__ */ template(`<div class="relative flex flex-col items-center self-stretch"></div>`), _tmpl$14 = /* @__PURE__ */ template(`<div class="flex-auto max-w-full relative"><div class=flex-auto></div></div>`);
const getFrameOutsideSafezoneClass = (mode) => {
  switch (mode) {
    case "vertical":
      return "fullscreen-outside-safezone-y";
    case "horizontal":
      return "fullscreen-outside-safezone-x";
    case "full":
      return "fullscreen-outside-safezone";
    default:
      mode;
      return "";
  }
};
const SubsystemFrameB1 = (props) => {
  return createComponent(Panel, mergeProps(props, {
    get ["class"]() {
      return `relative flex flex-col pt-4 px-6 ${props.class ?? ""}`;
    },
    get children() {
      return [(() => {
        var _el$ = _tmpl$();
        createRenderEffect(() => className(_el$, `inset-0 absolute frame-top-curve ${getFrameOutsideSafezoneClass(props.outsideSafezoneMode ?? "none")}`));
        return _el$;
      })(), _tmpl$2(), createComponent(Show, {
        get when() {
          return !!props.backdrop;
        },
        get children() {
          var _el$3 = _tmpl$3(), _el$4 = _el$3.firstChild;
          createRenderEffect((_$p) => (_$p = `url(${props.backdrop})`) != null ? _el$4.style.setProperty("background-image", _$p) : _el$4.style.removeProperty("background-image"));
          return _el$3;
        }
      }), (() => {
        var _el$5 = _tmpl$4(), _el$6 = _el$5.firstChild;
        insert(_el$5, () => props.header, _el$6);
        insert(_el$6, () => props.children);
        insert(_el$5, () => props.footer, null);
        return _el$5;
      })(), createComponent(Show, {
        get when() {
          return !props.noClose;
        },
        get children() {
          return createComponent(CloseButton, {
            "class": "absolute top-1 right-1",
            get audio() {
              return {
                onPress: "data-audio-close-press",
                onActivate: "data-audio-close-selected",
                ...props.closeButtonAudio
              };
            },
            onActivate: () => props.onClose?.(),
            "aria-label": "Close"
          });
        }
      })];
    }
  }));
};
const SubsystemFrameB2 = (props) => {
  return createComponent(Panel, mergeProps(props, {
    get ["class"]() {
      return `relative flex flex-col frame-box pt-4 ${props.class ?? ""}`;
    },
    get children() {
      return [(() => {
        var _el$7 = _tmpl$();
        createRenderEffect(() => className(_el$7, `inset-0 absolute frame-box ${getFrameOutsideSafezoneClass(props.outsideSafezoneMode ?? "none")}`));
        return _el$7;
      })(), _tmpl$5(), createComponent(Show, {
        get when() {
          return !!props.backdrop;
        },
        get children() {
          var _el$9 = _tmpl$6(), _el$10 = _el$9.firstChild;
          createRenderEffect((_$p) => (_$p = `url(${props.backdrop})`) != null ? _el$10.style.setProperty("background-image", _$p) : _el$10.style.removeProperty("background-image"));
          return _el$9;
        }
      }), (() => {
        var _el$11 = _tmpl$4(), _el$12 = _el$11.firstChild;
        insert(_el$11, () => props.header, _el$12);
        insert(_el$12, () => props.children);
        insert(_el$11, () => props.footer, null);
        return _el$11;
      })(), createComponent(Show, {
        get when() {
          return !props.noClose;
        },
        get children() {
          return createComponent(CloseButton, {
            "class": "absolute top-1 right-1",
            get audio() {
              return {
                onPress: "data-audio-close-press",
                onActivate: "data-audio-close-selected",
                ...props.closeButtonAudio
              };
            },
            onActivate: () => props.onClose?.(),
            "aria-label": "Close"
          });
        }
      })];
    }
  }));
};
const SubsystemFrameB3 = (props) => {
  return createComponent(Panel, mergeProps(props, {
    get ["class"]() {
      return `relative flex flex-col frame-diplo ${props.class ?? ""}`;
    },
    get children() {
      return [(() => {
        var _el$13 = _tmpl$();
        createRenderEffect(() => className(_el$13, `inset-0 absolute frame-diplo ${getFrameOutsideSafezoneClass(props.outsideSafezoneMode ?? "none")}`));
        return _el$13;
      })(), _tmpl$7(), _tmpl$8(), createComponent(Show, {
        get when() {
          return !!props.backdrop;
        },
        get children() {
          var _el$16 = _tmpl$6(), _el$17 = _el$16.firstChild;
          createRenderEffect((_$p) => (_$p = `url(${props.backdrop})`) != null ? _el$17.style.setProperty("background-image", _$p) : _el$17.style.removeProperty("background-image"));
          return _el$16;
        }
      }), (() => {
        var _el$18 = _tmpl$9(), _el$19 = _el$18.firstChild;
        insert(_el$18, () => props.header, _el$19);
        insert(_el$19, () => props.children);
        insert(_el$18, () => props.footer, null);
        return _el$18;
      })(), createComponent(Show, {
        get when() {
          return !props.noClose;
        },
        get children() {
          return createComponent(CloseButton, {
            "class": "absolute top-1 right-1",
            get audio() {
              return {
                onPress: "data-audio-close-press",
                onActivate: "data-audio-close-selected",
                ...props.closeButtonAudio
              };
            },
            onActivate: () => props.onClose?.(),
            "aria-label": "Close"
          });
        }
      })];
    }
  }));
};
const SubsystemFrameB4 = (props) => {
  return createComponent(Panel, mergeProps(props, {
    get ["class"]() {
      return `relative flex flex-col pt-4 ${props.class ?? ""}`;
    },
    get children() {
      return [(() => {
        var _el$20 = _tmpl$();
        createRenderEffect(() => className(_el$20, `inset-0 absolute frame-box ${getFrameOutsideSafezoneClass(props.outsideSafezoneMode ?? "none")}`));
        return _el$20;
      })(), _tmpl$10(), createComponent(Show, {
        get when() {
          return !!props.backdrop;
        },
        get children() {
          var _el$22 = _tmpl$3(), _el$23 = _el$22.firstChild;
          createRenderEffect((_$p) => (_$p = `url(${props.backdrop})`) != null ? _el$23.style.setProperty("background-image", _$p) : _el$23.style.removeProperty("background-image"));
          return _el$22;
        }
      }), (() => {
        var _el$24 = _tmpl$4(), _el$25 = _el$24.firstChild;
        insert(_el$24, () => props.header, _el$25);
        insert(_el$25, () => props.children);
        insert(_el$24, () => props.footer, null);
        return _el$24;
      })(), createComponent(Show, {
        get when() {
          return !props.noClose;
        },
        get children() {
          return createComponent(CloseButton, {
            "class": "absolute top-1 right-1",
            get audio() {
              return {
                onPress: "data-audio-close-press",
                onActivate: "data-audio-close-selected",
                ...props.closeButtonAudio
              };
            },
            onActivate: () => props.onClose?.(),
            "aria-label": "Close"
          });
        }
      })];
    }
  }));
};
const SubsystemFrameFullscreen = (props) => {
  return createComponent(Panel, mergeProps(props, {
    get ["class"]() {
      return `relative flex flex-col m-0 pt-14 px-10 pb-10 ${props.class ?? ""}`;
    },
    get children() {
      return [(() => {
        var _el$26 = _tmpl$();
        createRenderEffect(() => className(_el$26, `inset-0 absolute img-frame-f1 ${getFrameOutsideSafezoneClass(props.outsideSafezoneMode ?? "none")}`));
        return _el$26;
      })(), _tmpl$11(), _tmpl$12(), _tmpl$13(), createComponent(Show, {
        get when() {
          return !!props.backdrop;
        },
        get children() {
          var _el$30 = _tmpl$6(), _el$31 = _el$30.firstChild;
          createRenderEffect((_$p) => (_$p = `url(${props.backdrop})`) != null ? _el$31.style.setProperty("background-image", _$p) : _el$31.style.removeProperty("background-image"));
          return _el$30;
        }
      }), (() => {
        var _el$32 = _tmpl$14(), _el$33 = _el$32.firstChild;
        insert(_el$32, () => props.header, _el$33);
        insert(_el$33, () => props.children);
        insert(_el$32, () => props.footer, null);
        return _el$32;
      })(), createComponent(Show, {
        get when() {
          return !props.noClose;
        },
        get children() {
          return createComponent(CloseButton, {
            "class": "absolute top-10 right-10",
            get audio() {
              return {
                onPress: "data-audio-close-press",
                onActivate: "data-audio-close-selected",
                ...props.closeButtonAudio
              };
            },
            onActivate: () => props.onClose?.(),
            "aria-label": "Close"
          });
        }
      })];
    }
  }));
};
const SubsystemFrame = ComponentRegistry.register({
  name: "SubsystemFrame",
  createInstance: SubsystemFrameB1,
  images: ["blp:hud_squarepanel-bg.png"]
});
SubsystemFrame.B1 = ComponentRegistry.register({
  name: "SubsystemFrame.B1",
  createInstance: SubsystemFrameB1,
  images: ["blp:hud_squarepanel-bg.png"]
});
SubsystemFrame.B2 = ComponentRegistry.register({
  name: "SubsystemFrame.B2",
  createInstance: SubsystemFrameB2,
  images: ["blp:hud_squarepanel-bg.png"]
});
SubsystemFrame.B3 = ComponentRegistry.register({
  name: "SubsystemFrame.B3",
  createInstance: SubsystemFrameB3,
  images: ["blp:hud_squarepanel-bg.png"]
});
SubsystemFrame.B4 = ComponentRegistry.register({
  name: "SubsystemFrame.B4",
  createInstance: SubsystemFrameB4,
  images: ["blp:hud_squarepanel-bg.png"]
});
SubsystemFrame.Fullscreen = ComponentRegistry.register({
  name: "SubsystemFrame.Fullscreen",
  createInstance: SubsystemFrameFullscreen,
  images: ["blp:hud_squarepanel-bg.png"]
});

export { SubsystemFrame };
//# sourceMappingURL=subsystem-frame.js.map

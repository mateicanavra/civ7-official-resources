import { template, insert, className, style } from '../../vendor/solid-js/web/dist/web.js';
import { mergeProps, createComponent, Show, createRenderEffect } from '../../vendor/solid-js/dist/solid.js';
import { ComponentRegistry } from '../services/component-registry.js';

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="flex absolute self-stretch w-full"><div></div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div><div></div></div>`);
var SafezoneMode = /* @__PURE__ */ ((SafezoneMode2) => {
  SafezoneMode2[SafezoneMode2["None"] = 0] = "None";
  SafezoneMode2[SafezoneMode2["Vertical"] = 1] = "Vertical";
  SafezoneMode2[SafezoneMode2["Horizontal"] = 2] = "Horizontal";
  SafezoneMode2[SafezoneMode2["Full"] = 3] = "Full";
  return SafezoneMode2;
})(SafezoneMode || {});
function safezoneModeToClass(safezoneMode) {
  switch (safezoneMode) {
    case 3 /* Full */:
      return "fullscreen-outside-safezone";
    case 2 /* Horizontal */:
      return "fullscreen-outside-safezone-x";
    case 1 /* Vertical */:
      return "fullscreen-outside-safezone-y";
    default:
      return "";
  }
}
const FrameBaseComponent = (props) => {
  const mergedProps = mergeProps(props, {
    class: "absolute w-full h-full flex justify-center",
    filigreeClass: "mt-8",
    safezoneMode: 0 /* None */
  });
  return (() => {
    var _el$ = _tmpl$3(), _el$2 = _el$.firstChild;
    insert(_el$2, createComponent(Show, {
      get when() {
        return props.showFiligrees;
      },
      get children() {
        return [(() => {
          var _el$3 = _tmpl$();
          createRenderEffect(() => className(_el$3, `absolute top-0 left-4 bottom-0 h-1\\/2 w-64 ${mergedProps.filigreeClass ?? ""} img-frame-filigree pointer-events-none`));
          return _el$3;
        })(), (() => {
          var _el$4 = _tmpl$();
          createRenderEffect(() => className(_el$4, `absolute top-0 right-4 bottom-0 h-1\\/2 w-64 ${mergedProps.filigreeClass ?? ""} rotate-y-180 img-frame-filigree pointer-events-none`));
          return _el$4;
        })()];
      }
    }), null);
    insert(_el$2, createComponent(Show, {
      get when() {
        return props.borderClass;
      },
      get children() {
        var _el$5 = _tmpl$2(), _el$6 = _el$5.firstChild;
        createRenderEffect(() => className(_el$6, props.borderClass));
        return _el$5;
      }
    }), null);
    insert(_el$2, () => props.children, null);
    createRenderEffect((_p$) => {
      var _v$ = `z-0 ${mergedProps.class ?? ""}`, _v$2 = `-z-1 relative flex flex-col flex-auto pt-14 px-10 pb-10  ${props.frameClass} ${safezoneModeToClass(mergedProps.safezoneMode)} ${props.contentClass ?? ""}`, _v$3 = props.style;
      _v$ !== _p$.e && className(_el$, _p$.e = _v$);
      _v$2 !== _p$.t && className(_el$2, _p$.t = _v$2);
      _p$.a = style(_el$2, _v$3, _p$.a);
      return _p$;
    }, {
      e: void 0,
      t: void 0,
      a: void 0
    });
    return _el$;
  })();
};
const FrameF1Component = (props) => {
  return createComponent(FrameBaseComponent, mergeProps(props, {
    frameClass: "img-frame-f1",
    showFiligrees: true
  }));
};
const FrameF2Component = (props) => {
  return createComponent(FrameBaseComponent, mergeProps(props, {
    frameClass: "img-frame-f2",
    showFiligrees: true
  }));
};
const FrameSimpleComponent = (props) => {
  return createComponent(FrameBaseComponent, mergeProps(props, {
    frameClass: "img-frame-f2",
    showFiligrees: false
  }));
};
const FrameModalComponent = (props) => {
  return createComponent(FrameBaseComponent, mergeProps(props, {
    frameClass: "img-modal-frame",
    showFiligrees: false
  }));
};
const Frame = {
  F1: ComponentRegistry.register("Frame.F1", FrameF1Component),
  F2: ComponentRegistry.register("Frame.F2", FrameF2Component),
  Simple: ComponentRegistry.register("Frame.Simple", FrameSimpleComponent),
  Modal: ComponentRegistry.register("Frame.Modal", FrameModalComponent)
};

export { Frame, SafezoneMode };
//# sourceMappingURL=frame.js.map

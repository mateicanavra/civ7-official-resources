import { template, use, spread, insert, Portal } from '../../vendor/solid-js/web/dist/web.js';
import { createMemo, mergeProps, splitProps, createSignal, createEffect, on, onCleanup, createComponent, Show } from '../../vendor/solid-js/dist/solid.js';

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`);
const DEFAULT_OFFSET = {
  x: 0,
  y: 0,
  z: 0
};
const WorldAnchor = (props) => {
  const mount = createMemo(() => {
    if (typeof props.mount === "string") {
      return document.querySelector(props.mount) ?? void 0;
    }
    return props.mount;
  });
  const merged = mergeProps({
    offset: DEFAULT_OFFSET,
    placement: PlacementMode.TERRAIN
  }, props);
  const [local, other] = splitProps(merged, ["location", "offset", "placement", "children", "ref", "mount"]);
  const [handle, setHandle] = createSignal(null);
  function unregisterAnchor() {
    const currentHandle = handle();
    if (currentHandle !== null) {
      WorldAnchors.UnregisterFixedWorldAnchor(currentHandle);
      setHandle(null);
    }
  }
  function registerAnchor() {
    const newHandle = WorldAnchors.RegisterFixedWorldAnchor(local.location, local.offset, local.placement);
    if (newHandle === null || newHandle < 0) {
      console.error("WorldAnchor: failed to register world anchor for location", local.location);
      setHandle(null);
      return;
    }
    setHandle(newHandle);
  }
  createEffect(on(() => {
    return [local.location, local.offset, local.placement];
  }, () => {
    registerAnchor();
    onCleanup(() => unregisterAnchor());
  }));
  const anchor = (() => {
    var _el$ = _tmpl$();
    var _ref$ = local.ref;
    typeof _ref$ === "function" ? use(_ref$, _el$) : local.ref = _el$;
    spread(_el$, mergeProps(other, {
      get ["data-bind-style-transform2d"]() {
        return createMemo(() => handle() !== null)() ? `{{FixedWorldAnchors.offsetTransforms[${handle()}].value}}` : void 0;
      },
      get ["data-bind-style-opacity"]() {
        return createMemo(() => handle() !== null)() ? `{{FixedWorldAnchors.visibleValues[${handle()}]}}` : void 0;
      }
    }), false, true);
    insert(_el$, () => local.children);
    return _el$;
  })();
  return createComponent(Show, {
    get when() {
      return mount();
    },
    fallback: anchor,
    children: (currentMount) => createComponent(Portal, {
      get mount() {
        return currentMount();
      },
      children: anchor
    })
  });
};

export { WorldAnchor };
//# sourceMappingURL=world-anchor.js.map

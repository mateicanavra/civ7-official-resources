import { template, insert, className } from '../../vendor/solid-js/web/dist/web.js';
import { createComponent, Show, createRenderEffect, createMemo, createResource, Suspense } from '../../vendor/solid-js/dist/solid.js';
import { Flipbook } from './flipbook.js';
import { L10n } from './l10n.js';
import { ComponentRegistry } from '../services/component-registry.js';
import { createSignalFromExistingDebugWidget } from '../utilities/debug-widgets.js';

var _tmpl$ = /* @__PURE__ */ template(`<div><div class="flex flex-col justify-center items-center"></div></div>`);
UI.Debug.registerWidget({
  caption: "Force 3s delay on <ThrobberSuspense> components.",
  category: "Debug",
  domainType: "bool",
  id: "forceDelayOnThrobberSuspense",
  value: false
});
const ThrobberComponent = (props) => {
  return (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild;
    insert(_el$2, createComponent(Flipbook.Hourglass, {
      "class": "size-22"
    }), null);
    insert(_el$2, createComponent(Show, {
      get when() {
        return props.caption != null;
      },
      get children() {
        return createComponent(L10n.Stylize, {
          get text() {
            return props.caption;
          }
        });
      }
    }), null);
    createRenderEffect(() => className(_el$, `flex justify-center items-center ${props.class ?? ""}`));
    return _el$;
  })();
};
const Throbber = ComponentRegistry.register({
  name: "Throbber",
  createInstance: ThrobberComponent,
  images: []
});
const ThrobberSuspenseComponent = (props) => {
  const forceSuspenseDelay = createSignalFromExistingDebugWidget("forceDelayOnThrobberSuspense");
  const debugDelayResource = createMemo(() => {
    const value = forceSuspenseDelay();
    if (value !== null && value == true) {
      const [resource] = createResource(async () => {
        const p = new Promise((resolve, _reject) => {
          setTimeout(resolve, 3e3);
        });
        await p;
      });
      return resource;
    }
    return null;
  });
  return createComponent(Suspense, {
    get fallback() {
      return createComponent(Throbber, {
        get caption() {
          return props.caption;
        },
        get ["class"]() {
          return props.class;
        }
      });
    },
    get children() {
      return (() => {
        const resource = debugDelayResource();
        if (resource) {
          resource();
        }
        return props.children;
      })();
    }
  });
};
const ThrobberSuspense = ComponentRegistry.register({
  name: "ThrobberSuspense",
  createInstance: ThrobberSuspenseComponent
});

export { Throbber, ThrobberSuspense };
//# sourceMappingURL=throbber.js.map

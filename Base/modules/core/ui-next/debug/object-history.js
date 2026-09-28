import { template, insert, className } from '../../vendor/solid-js/web/dist/web.js';
import { createSignal, createEffect, untrack, createComponent, For, createRenderEffect } from '../../vendor/solid-js/dist/solid.js';
import { RadioButton } from '../components/radio-button.js';
import { SimpleButton } from './simple-button.js';
import { ComponentRegistry } from '../services/component-registry.js';
import { createArraySignal } from '../utilities/solid-utilities.js';

var _tmpl$ = /* @__PURE__ */ template(`<div><div class="flex flex-row"><div class="flex flex-row items-center justify-center">Max History: <!> </div></div><div class="flex flex-col flex-auto"></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div></div>`);
const ObjectHistoryComponent = (props) => {
  const [autoRefresh, setAutoRefresh] = createSignal(false);
  const [history, useHistory] = createArraySignal();
  const [maxHistory, setMaxHistory] = createSignal(10);
  createEffect(() => {
    if (autoRefresh() && props.proxy) {
      const json = JSON.stringify(props.proxy.value, null, 2);
      untrack(() => {
        useHistory((history2) => {
          if (history2.length < maxHistory()) {
            history2.unshift();
          }
          history2.push(`${Date.now()}
${json}`);
        });
      });
    }
  });
  return (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$3.firstChild, _el$6 = _el$4.nextSibling, _el$5 = _el$6.nextSibling, _el$7 = _el$2.nextSibling;
    insert(_el$2, createComponent(RadioButton, {
      "class": "mx-1 my-2",
      get isChecked() {
        return autoRefresh();
      },
      onActivate: () => setAutoRefresh((v) => !v),
      children: "Auto"
    }), _el$3);
    insert(_el$3, createComponent(SimpleButton, {
      "class": "m-2",
      onActivate: () => setMaxHistory((v) => v - 1),
      children: "<"
    }), _el$4);
    insert(_el$3, maxHistory, _el$6);
    insert(_el$3, createComponent(SimpleButton, {
      "class": "m-2",
      onActivate: () => setMaxHistory((v) => v + 1),
      children: ">"
    }), null);
    insert(_el$7, createComponent(For, {
      get each() {
        return history();
      },
      children: (entry) => (() => {
        var _el$8 = _tmpl$2();
        _el$8.style.setProperty("white-space", "pre");
        insert(_el$8, entry);
        return _el$8;
      })()
    }));
    createRenderEffect(() => className(_el$, `flex flex-col ${props.class ?? ""}`));
    return _el$;
  })();
};
const ObjectHistory = ComponentRegistry.register({
  name: "ObjectHistory",
  createInstance: ObjectHistoryComponent
});

export { ObjectHistory };
//# sourceMappingURL=object-history.js.map

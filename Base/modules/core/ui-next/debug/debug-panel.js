import { template, insert, render } from '../../vendor/solid-js/web/dist/web.js';
import { onCleanup, createContext, createSignal, useContext, createEffect, createComponent, Show, For, createMemo } from '../../vendor/solid-js/dist/solid.js';
import { modifyMutable, reconcile } from '../../vendor/solid-js/store/dist/store.js';
import { RadioButton } from '../components/radio-button.js';
import { Tab } from '../components/tab.js';
import { ObjectEditor } from './object-editor.js';
import { ObjectHistory } from './object-history.js';
import { SimpleButton } from './simple-button.js';
import { createArraySignal } from '../utilities/solid-utilities.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="flex flex-col inset-0 absolute"><div class="flex flex-row"><div class=flex-auto></div><div class=flex-auto></div></div><div class="flex flex-row flex-auto"><div>Models</div><div class="flex flex-col border border-accent-1 p-2"></div></div></div>`);
class MutableProxy {
  constructor(name, id, mutable) {
    this.name = name;
    this.id = id;
    this.mutable = mutable;
  }
  set value(value) {
    modifyMutable(this.mutable, reconcile(value));
  }
  get value() {
    return this.mutable;
  }
}
class StoreProxy {
  constructor(name, id, accessor, setter) {
    this.name = name;
    this.id = id;
    this.accessor = accessor;
    this.setter = setter;
  }
  set value(value) {
    this.setter((_) => value);
  }
  get value() {
    return this.accessor();
  }
}
let currentId = 1;
class DebugContextProvider {
  _registeredModels;
  _mutateModels;
  get models() {
    return this._registeredModels;
  }
  constructor() {
    const [registeredModels, mutateModels] = createArraySignal();
    this._registeredModels = registeredModels;
    this._mutateModels = mutateModels;
  }
  registerMutableModel(name, model) {
    this.registerProxy(new MutableProxy(name, currentId++, model));
  }
  registerStoreModel(name, modelGetter, modelSetter) {
    this.registerProxy(new StoreProxy(name, currentId++, modelGetter, modelSetter));
  }
  registerProxy(proxy) {
    this._mutateModels((m) => m.push(proxy));
    onCleanup(() => {
      this._mutateModels((models) => {
        const foundModel = models.findIndex((m) => m.id == proxy.id);
        if (foundModel >= 0) {
          models.splice(foundModel, 1);
        }
      });
    });
  }
}
const DebugContext = createContext(new DebugContextProvider());
const DebugPanel = () => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [isRight, setIsRight] = createSignal(true);
  const [activeProxy, setActiveProxy] = createSignal();
  const debugContext = useContext(DebugContext);
  createEffect(() => {
    const proxy = activeProxy();
    if (proxy && !debugContext.models().find((p) => p.id == proxy.id)) {
      setActiveProxy(void 0);
    }
  });
  function movePanel(moveRight) {
    if (moveRight == isRight()) {
      setIsOpen(false);
    } else {
      setIsRight((r) => !r);
    }
  }
  return createComponent(Show, {
    get when() {
      return isOpen();
    },
    get fallback() {
      return createComponent(SimpleButton, {
        get ["class"]() {
          return `absolute bottom-0 ${isRight() ? "right-0" : "left-0"}`;
        },
        onActivate: () => setIsOpen(true),
        get children() {
          return isRight() ? "<<" : ">>";
        }
      });
    },
    get children() {
      return createComponent(Tab, {
        get ["class"]() {
          return `absolute top-0 bottom-0 w-1\\/2 ${isRight() ? "right-0" : "left-0"}`;
        },
        style: {
          "background-color": "#222A"
        },
        get children() {
          return [(() => {
            var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$3.nextSibling, _el$5 = _el$2.nextSibling, _el$6 = _el$5.firstChild, _el$7 = _el$6.nextSibling;
            insert(_el$2, createComponent(SimpleButton, {
              onActivate: () => movePanel(false),
              children: "<<"
            }), _el$3);
            insert(_el$2, createComponent(Tab.TabList, {}), _el$4);
            insert(_el$2, createComponent(SimpleButton, {
              onActivate: () => movePanel(true),
              children: ">>"
            }), null);
            insert(_el$7, createComponent(For, {
              get each() {
                return debugContext.models();
              },
              children: (model) => createComponent(RadioButton, {
                get isChecked() {
                  return activeProxy() == model;
                },
                onActivate: () => setActiveProxy(model),
                get children() {
                  return [createMemo(() => model.name), "-", createMemo(() => model.id)];
                }
              })
            }));
            insert(_el$5, createComponent(Tab.Output, {}), null);
            return _el$;
          })(), createComponent(Tab.Item, {
            name: "History",
            title: () => "History",
            body: () => createComponent(ObjectHistory, {
              "class": "flex-auto",
              get proxy() {
                return activeProxy();
              }
            })
          }), createComponent(Tab.Item, {
            name: "Edit",
            title: () => "Edit",
            body: () => createComponent(ObjectEditor, {
              "class": "flex-auto",
              get proxy() {
                return activeProxy();
              }
            })
          })];
        }
      });
    }
  });
};
function showDebugPanel() {
  render(() => createComponent(DebugPanel, {}), document.body);
}

export { DebugContext, DebugPanel, showDebugPanel };
//# sourceMappingURL=debug-panel.js.map

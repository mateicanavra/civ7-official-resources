import { t as template, e as createComponent, m as mergeProps, i as insert, C as ComponentRegistry, c as createSignal, a as createEffect, l as on, u as use, n as delegateEvents, p as createArraySignal, q as untrack, F as For, f as createRenderEffect, g as className, v as modifyMutable, w as reconcile, d as onCleanup, x as createContext, y as useContext, S as Show, h as createMemo, r as render, z as createMutable, o as onMount } from '../components/panel.chunk.js';
import { A as Activatable, R as RadioButton, T as Tab } from '../components/l10n.chunk.js';
import { S as ScrollArea } from '../components/scroll-area.chunk.js';
import { S as SandboxNavigation } from './sandbox-navigation.chunk.js';
import { L as LoadScreenContext, a as LoadScreen } from '../../../base-standard/ui-next/screens/load-screen/load-screen.chunk.js';
import '../../ui/input/input-support.chunk.js';
import '../../ui/input/focus-support.chunk.js';
import '../../ui/components/fxs-slot.chunk.js';
import '../../ui/input/focus-manager.js';
import '../../ui/audio-base/audio-support.chunk.js';
import '../../ui/framework.chunk.js';
import '../../ui/views/view-manager.chunk.js';
import '../../ui/panel-support.chunk.js';
import '../../ui/spatial/spatial-manager.js';
import '../../ui/context-manager/context-manager.js';
import '../../ui/context-manager/display-queue-manager.js';
import '../../ui/dialog-box/manager-dialog-box.chunk.js';
import '../../ui/input/cursor.js';
import '../../ui/input/action-handler.js';
import '../../ui/utilities/utilities-update-gate.chunk.js';
import '../../ui/navigation-tray/model-navigation-tray.chunk.js';
import '../../ui/utilities/utilities-image.chunk.js';
import '../../ui/utilities/utilities-component-id.chunk.js';
import '../../ui/utilities/utilities-layout.chunk.js';
import '../components/hero-button.chunk.js';
import '../components/header.chunk.js';

var _tmpl$$3 = /* @__PURE__ */ template(`<div class="relative flex flex-auto items-center justify-center"></div>`);
const SimpleButtonComponent = (props) => {
  return createComponent(Activatable, mergeProps(props, {
    get ["class"]() {
      return `border-1 border-accent-5 bg-accent-4 hover\\:bg-accent-5 p-1 m-1 font-title text-base text-accent-1 uppercase tracking-150 ${props.class ?? ""}`;
    },
    name: "SimpleButton",
    get children() {
      var _el$ = _tmpl$$3();
      insert(_el$, () => props.children);
      return _el$;
    }
  }));
};
const SimpleButton = ComponentRegistry.register({
  name: "SimpleButton",
  createInstance: SimpleButtonComponent
});

var _tmpl$$2 = /* @__PURE__ */ template(`<textarea class="w-full h-auto"></textarea>`), _tmpl$2$1 = /* @__PURE__ */ template(`<div class="flex flex-col flex-auto"><div class="flex flex-row"></div></div>`);
const ObjectEditorComponent = (props) => {
  let textArea;
  const [autoRefresh, setAutoRefresh] = createSignal(false);
  const [jsonValue, setJsonValue] = createSignal("");
  function updateModel() {
    if (textArea && props.proxy) {
      props.proxy.value = JSON.parse(textArea.value);
    }
  }
  function forceRefresh() {
    if (props.proxy) {
      const value = props.proxy.value;
      const json = JSON.stringify(value, null, 2);
      setJsonValue(json);
    }
  }
  createEffect(() => {
    if (autoRefresh() && props.proxy) {
      const json = JSON.stringify(props.proxy.value, null, 2);
      setJsonValue(json);
    }
  });
  createEffect(on(() => jsonValue(), updateTextAreaSize));
  function updateTextAreaSize() {
    waitForLayout(() => {
      if (textArea) {
        textArea.style.height = `${textArea?.scrollHeight}px`;
      }
    });
  }
  return (() => {
    var _el$ = _tmpl$2$1(), _el$2 = _el$.firstChild;
    insert(_el$2, createComponent(RadioButton, {
      "class": "mx-1 my-2",
      get isChecked() {
        return autoRefresh();
      },
      onActivate: () => setAutoRefresh((v) => !v),
      children: "Auto"
    }), null);
    insert(_el$2, createComponent(SimpleButton, {
      "class": "ml-4 mr-2 my-2",
      onActivate: forceRefresh,
      children: "Refresh"
    }), null);
    insert(_el$2, createComponent(SimpleButton, {
      "class": "m-2",
      onActivate: updateModel,
      children: "Push"
    }), null);
    insert(_el$, createComponent(ScrollArea, {
      "class": "flex-auto m-2",
      get children() {
        var _el$3 = _tmpl$$2();
        _el$3.$$input = updateTextAreaSize;
        use((r) => textArea = r, _el$3);
        insert(_el$3, jsonValue);
        return _el$3;
      }
    }), null);
    return _el$;
  })();
};
const ObjectEditor = ComponentRegistry.register({
  name: "ObjectEditor",
  createInstance: ObjectEditorComponent
});
delegateEvents(["input"]);

var _tmpl$$1 = /* @__PURE__ */ template(`<div><div class="flex flex-row"><div class="flex flex-row items-center justify-center">Max History: <!> </div></div><div class="flex flex-col flex-auto"></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div></div>`);
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
    var _el$ = _tmpl$$1(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$3.firstChild, _el$6 = _el$4.nextSibling, _el$5 = _el$6.nextSibling, _el$7 = _el$2.nextSibling;
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

const testModel = {
  data: {
    backgroundImage: 'url("blp:lsbg_egypt_1080.png")',
    leaderImage: 'url("blp:lsl_harriet_tubman.png")',
    tipText: "Plenty of ways to improve production and many bonuses to settling near rivers, the Egyptian people will quickly become prolific builders under your direction.",
    leaderInfo: {
      name: "LOC_LEADER_HARRIET_TUBMAN_NAME",
      description: "LOC_LEADER_HARRIET_TUBMAN_DESCRIPTION",
      attributes: ["DIPLOMATIC", "MILITARISTIC"],
      abilityName: "LOC_TRAIT_LEADER_HARRIET_TUBMAN_ABILITY_NAME",
      abilityType: "LOC_LOADING_LEADER_ABILITY",
      abilityDescription: "LOC_TRAIT_LEADER_HARRIET_TUBMAN_ABILITY_DESCRIPTION"
    },
    civInfo: {
      name: "MING EMPIRE",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida. Risus commodo viverra maecenas accumsan lacus vel facilisis.  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida. Risus commodo viverra maecenas accumsan lacus vel facilisis.",
      attributes: ["DIPLOMATIC", "MILITARISTIC"],
      abilityName: "LOC_TRAIT_EGYPT_ABILITY_NAME",
      abilityType: "LOC_LOADING_CIVILIZATION_ABILITY",
      abilityDescription: "LOC_TRAIT_EGYPT_ABILITY_DESCRIPTION"
    },
    unitInfo: [{
      name: "Medjay",
      description: "Egyptian Unique Infantry Unit.  Has no maintenace.  +3 Combat Strenght in friendly territory, doubled when stationed in a Setttlement you own.",
      icon: "UNIT_MEDJAY"
    }, {
      name: "Tjaty",
      description: "A Great Person with one charge.  Can only be trained in Cities with a Necropolis, and the specific Tjaty received is random.  Each Tjaty can only be received once.  Cost increases per Tjaty trained.",
      icon: "UNIT_TJATY"
    }],
    constructibleInfo: [{
      name: "LOC_QUARTER_NECROPOLIS_NAME",
      description: "LOC_QUARTER_NECROPOLIS_DESCRIPTION",
      icon: "CITY_UNIQUE_QUARTER",
      isUniqueQuarter: true
    }, {
      name: "LOC_BUILDING_MASTABA_NAME",
      description: "LOC_BUILDING_MASTABA_DESCRIPTION",
      icon: "BUILDING_MASTABA",
      isUniqueQuarter: false
    }, {
      name: "LOC_BUILDING_MORTUARY_TEMPLE_NAME",
      description: "LOC_BUILDING_MORTUARY_TEMPLE_DESCRIPTION",
      icon: "BUILDING_MORTUARY_TEMPLE",
      isUniqueQuarter: false
    }],
    traditionInfo: [{
      civic: "LOC_CIVIC_SEVEN_TRIBES_NAME",
      name: "LOC_TRADITION_FALSE_RETREAT_NAME",
      description: "LOC_TRADITION_FALSE_RETREAT_DESCRIPTION"
    }, {
      civic: "LOC_CIVIC_SEVEN_TRIBES_NAME",
      name: "LOC_TRADITION_FALSE_RETREAT_NAME",
      description: "LOC_TRADITION_FALSE_RETREAT_DESCRIPTION"
    }, {
      civic: "LOC_CIVIC_SEVEN_TRIBES_NAME",
      name: "LOC_TRADITION_FALSE_RETREAT_NAME",
      description: "LOC_TRADITION_FALSE_RETREAT_DESCRIPTION"
    }, {
      civic: "LOC_CIVIC_SEVEN_TRIBES_NAME",
      name: "LOC_TRADITION_FALSE_RETREAT_NAME",
      description: "LOC_TRADITION_FALSE_RETREAT_DESCRIPTION"
    }, {
      civic: "LOC_CIVIC_SEVEN_TRIBES_NAME",
      name: "LOC_TRADITION_FALSE_RETREAT_NAME",
      description: "LOC_TRADITION_FALSE_RETREAT_DESCRIPTION"
    }],
    mementoInfo: [{
      name: "Memento 1",
      description: "I am a memento",
      flavorText: "Yo dawg I heard you like mementos",
      isEmpty: false,
      isLocked: false,
      icon: 'url("blp:mem_min_scythian_battleaxe")'
    }, {
      isEmpty: true,
      isLocked: false
    }, {
      isEmpty: false,
      isLocked: true,
      unlockReason: "A memento is such a terrible thing to waste"
    }]
  },
  progress: 20,
  canBeginGame: true,
  hideBeginButton: false,
  startOnCivTab: true,
  onBeginGame: () => null,
  onTabChanged: () => null
};
const simpleNav = new SandboxNavigation();
render(() => {
  let ref;
  const mutableTextModel = createMutable(testModel);
  const debugContext = useContext(DebugContext);
  debugContext.registerMutableModel("load-screen", mutableTextModel);
  onMount(() => {
    simpleNav.setFocus(ref);
  });
  return createComponent(LoadScreenContext.Provider, {
    value: mutableTextModel,
    get children() {
      return createComponent(LoadScreen, {
        ref(r$) {
          var _ref$ = ref;
          typeof _ref$ === "function" ? _ref$(r$) : ref = r$;
        }
      });
    }
  });
}, document.getElementById("root"));
showDebugPanel();
//# sourceMappingURL=scratchpad.js.map

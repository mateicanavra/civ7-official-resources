import { render } from '../../vendor/solid-js/web/dist/web.js';
import { useContext, onMount, createComponent } from '../../vendor/solid-js/dist/solid.js';
import { createMutable } from '../../vendor/solid-js/store/dist/store.js';
import { Button } from '../components/button.js';
import { Panel } from '../components/panel.js';
import { VSlot } from '../components/slot.js';
import { Tab } from '../components/tab.js';
import { DebugContext, showDebugPanel } from '../debug/debug-panel.js';
import { FocusViewer } from '../debug/focus-viewer/focus-viewer.js';
import { SandboxNavigation } from './sandbox-navigation.js';

const simpleNav = new SandboxNavigation();
const testModel = createMutable({});
render(() => {
  let ref;
  const debugContext = useContext(DebugContext);
  debugContext.registerMutableModel("load-screen", testModel);
  onMount(() => {
    simpleNav.setFocus(ref);
  });
  return createComponent(Panel, {
    name: "Scratchpad",
    id: "Scratchpad",
    ref(r$) {
      var _ref$ = ref;
      typeof _ref$ === "function" ? _ref$(r$) : ref = r$;
    },
    "class": "fullscreen",
    get children() {
      return [createComponent(Tab, {
        "class": "fullscreen flex flex-col",
        get children() {
          return [createComponent(Tab.TabList, {}), createComponent(Tab.Output, {}), createComponent(Tab.Item, {
            name: "tab1",
            title: () => "Tab 1",
            body: () => createComponent(VSlot, {
              get children() {
                return [createComponent(Button, {
                  children: "Tab1 - Button1"
                }), createComponent(Button, {
                  autoFocus: true,
                  children: "Tab1 - Button2"
                }), createComponent(Button, {
                  children: "Tab1 - Button3"
                })];
              }
            })
          }), createComponent(Tab.Item, {
            name: "tab2",
            title: () => "Tab 2",
            body: () => createComponent(VSlot, {
              get children() {
                return [createComponent(Button, {
                  children: "Tab2 - Button1"
                }), createComponent(Button, {
                  children: "Tab2 - Button2"
                }), createComponent(Button, {
                  children: "Tab2 - Button3"
                })];
              }
            })
          }), createComponent(Tab.Item, {
            name: "tab3",
            title: () => "Tab 3",
            body: () => createComponent(VSlot, {
              get children() {
                return [createComponent(Button, {
                  children: "Tab3 - Button1"
                }), createComponent(Button, {
                  children: "Tab3 - Button2"
                }), createComponent(Button, {
                  children: "Tab3 - Button3"
                })];
              }
            })
          })];
        }
      }), createComponent(FocusViewer, {})];
    }
  });
}, document.getElementById("root"));
showDebugPanel();
//# sourceMappingURL=scratchpad.js.map

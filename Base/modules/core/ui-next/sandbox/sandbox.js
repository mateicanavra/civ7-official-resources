import { render } from '../../vendor/solid-js/web/dist/web.js';
import { onMount, createComponent, For } from '../../vendor/solid-js/dist/solid.js';
import { Header } from '../components/header.js';
import { L10n } from '../components/l10n.js';
import { Panel } from '../components/panel.js';
import { Tab } from '../components/tab.js';
import { ComponentsExample } from './components-example.js';
import { SandboxBox } from './sandbox-box.js';
import { SandboxNavigation } from './sandbox-navigation.js';
import { ScrollArea } from '../components/scroll-area.js';
import { EffectExample } from './effect-example.js';
import { HelloComponent } from './hello-component.js';
import { ListExample } from './list-example.js';
import { SimpleBinding } from './simple-binding.js';

const locStrings = ["LOC_UI_OPTIONS_TITLE", "LOC_OPTIONS_CATEGORY_ACCESSIBILITY", "LOC_OPTIONS_CATEGORY_ACCESSIBILITY_DESCRIPTION", "LOC_OPTIONS_CATEGORY_AUDIO", "LOC_OPTIONS_CATEGORY_AUDIO_DESCRIPTION", "LOC_OPTIONS_CATEGORY_GAME", "LOC_OPTIONS_CATEGORY_GAME_DESCRIPTION", "LOC_OPTIONS_CATEGORY_GRAPHICS", "LOC_OPTIONS_CATEGORY_GRAPHICS_DESCRIPTION", "LOC_OPTIONS_CATEGORY_INPUT_DESCRIPTION", "LOC_OPTIONS_CATEGORY_INTERFACE", "LOC_OPTIONS_CATEGORY_INTERFACE_DESCRIPTION", "LOC_OPTIONS_CATEGORY_SYSTEM", "LOC_OPTIONS_CATEGORY_SYSTEM_DESCRIPTION", "LOC_OPTIONS_CANCEL", "LOC_OPTIONS_CANCEL_CHANGES", "LOC_OPTIONS_REVERT", "LOC_OPTIONS_REVERT_DESCRIPTION", "LOC_OPTIONS_DEFAULT", "LOC_OPTIONS_DEFAULTS", "LOC_OPTIONS_DEFAULTS_DESCRIPTION", "LOC_OPTIONS_ARE_YOU_SURE", "LOC_OPTIONS_ARE_YOU_SURE_DEFAULT", "LOC_OPTIONS_YES", "LOC_OPTIONS_NO", "LOC_OPTIONS_CONFIRM", "LOC_OPTIONS_CONFIRM_CHANGES", "LOC_OPTIONS_ACCEPT"];
engine.whenReady.then(() => {
  const simpleNav = new SandboxNavigation();
  render(() => {
    let ref;
    onMount(() => {
      simpleNav.setFocus(ref);
    });
    return createComponent(Panel, {
      id: "sandbox-panel",
      name: "Sandbox",
      "class": "w-full h-full flex flex-col",
      ref(r$) {
        var _ref$ = ref;
        typeof _ref$ === "function" ? _ref$(r$) : ref = r$;
      },
      get children() {
        return [createComponent(Header, {
          "class": "text-2xl mt-4",
          children: "UI-Next Solid Test Sandbox"
        }), createComponent(Tab, {
          "class": "flex flex-col flex-auto m-4",
          get children() {
            return [createComponent(Tab.TabList, {
              nextHotkey: "nav-next",
              previousHotkey: "nav-previous"
            }), createComponent(Tab.Output, {}), createComponent(Tab.Item, {
              name: "Components",
              title: () => "Components",
              body: () => createComponent(ComponentsExample, {})
            }), createComponent(Tab.Item, {
              name: "Basic",
              title: () => "Basic",
              body: () => [createComponent(SandboxBox, {
                "class": "w-96",
                get children() {
                  return [createComponent(HelloComponent, {
                    name: "World"
                  }), createComponent(HelloComponent, {
                    name: "SolidJs"
                  }), createComponent(HelloComponent, {
                    name: "Fxs UI"
                  })];
                }
              }), createComponent(SimpleBinding, {
                "class": "mx-2 mt-2"
              }), createComponent(EffectExample, {})]
            }), createComponent(Tab.Item, {
              name: "List",
              title: () => "List",
              body: () => createComponent(ListExample, {})
            }), createComponent(Tab.Item, {
              name: "Scrollable",
              title: () => "Proxy Scroll",
              body: () => createComponent(SandboxBox, {
                "class": "self-start",
                get children() {
                  return createComponent(ScrollArea, {
                    "class": "w-200 h-96",
                    useProxy: true,
                    get children() {
                      return [createComponent(L10n.Stylize, {
                        text: "LOC_TRAIT_LEADER_ASHOKA_ABILITY_DESCRIPTION"
                      }), createComponent(For, {
                        each: locStrings,
                        children: (item) => createComponent(L10n.Compose, {
                          text: item
                        })
                      })];
                    }
                  });
                }
              })
            })];
          }
        })];
      }
    });
  }, document.getElementById("root"));
});
//# sourceMappingURL=sandbox.js.map

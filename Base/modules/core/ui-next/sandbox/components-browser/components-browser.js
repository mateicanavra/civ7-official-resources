import { render } from '../../../vendor/solid-js/web/dist/web.js';
import { onMount, createComponent } from '../../../vendor/solid-js/dist/solid.js';
import { Panel } from '../../components/panel.js';
import { Tab } from '../../components/tab.js';
import { ActivatableExample } from './activatable-example.js';
import { ArrowButtonExample } from './arrow-button-example.js';
import { AudioGroupExample } from './audio-group-example.js';
import { ButtonExample } from './button-example.js';
import { BorderPanel } from './components/border-panel.js';
import { TabListLinks } from './components/tab-list-links.js';
import { FiligreeExample } from './filigree-example.js';
import { FlipbookExample } from './flipbook-example.js';
import { HeroButtonExample } from './hero-button-example.js';
import { IconExample } from './icon-example.js';
import { L10nExample } from './l10n-example.js';
import { LinkExample } from './link-example.js';
import { NavHelpExample } from './nav-help-example.js';
import { PanelExample } from './panel-example.js';
import { RadioButtonExample } from './radio-button-example.js';
import { ScrollAreaExample } from './scroll-area-example.js';
import { SlotExample } from './slot-example.js';
import { TabExample } from './tab-example.js';
import { TooltipExample } from './tooltip-example.js';
import { TriggerExample } from './trigger-example.js';
import { VirtualScrollAreaExample } from './virtual-scroll-area-example.js';
import { SandboxNavigation } from '../sandbox-navigation.js';

const simpleNav = new SandboxNavigation();
render(() => {
  let ref;
  onMount(() => {
    simpleNav.setFocus(ref);
  });
  return createComponent(Panel, {
    id: "component-browser-panel",
    name: "component-browser",
    "class": "w-full h-full flex flex-col",
    ref(r$) {
      var _ref$ = ref;
      typeof _ref$ === "function" ? _ref$(r$) : ref = r$;
    },
    get children() {
      return createComponent(Tab, {
        "class": "flex flex-row flex-auto m-4",
        get children() {
          return [createComponent(BorderPanel, {
            "class": "items-end",
            title: "Components",
            get children() {
              return createComponent(TabListLinks, {});
            }
          }), createComponent(BorderPanel, {
            "class": "items-center flex-auto",
            get title() {
              return createComponent(Tab.Title, {});
            },
            get children() {
              return createComponent(Tab.Output, {});
            }
          }), createComponent(Tab.Item, {
            name: "activatable-example",
            title: () => "Activatable",
            body: () => createComponent(ActivatableExample, {})
          }), createComponent(Tab.Item, {
            name: "arrow-buutton-example",
            title: () => "Arrow Button",
            body: () => createComponent(ArrowButtonExample, {})
          }), createComponent(Tab.Item, {
            name: "audio-group-example",
            title: () => "Audio Group",
            body: () => createComponent(AudioGroupExample, {})
          }), createComponent(Tab.Item, {
            name: "button-example",
            title: () => "Button",
            body: () => createComponent(ButtonExample, {})
          }), createComponent(Tab.Item, {
            name: "filigree-example",
            title: () => "Filigree & Header",
            body: () => createComponent(FiligreeExample, {})
          }), createComponent(Tab.Item, {
            name: "flipbook-example",
            title: () => "Flipbook",
            body: () => createComponent(FlipbookExample, {})
          }), createComponent(Tab.Item, {
            name: "hero-button",
            title: () => "Hero Button",
            body: () => createComponent(HeroButtonExample, {})
          }), createComponent(Tab.Item, {
            name: "icon-example",
            title: () => "Icon",
            body: () => createComponent(IconExample, {})
          }), createComponent(Tab.Item, {
            name: "l10n-example",
            title: () => "L10n",
            body: () => createComponent(L10nExample, {})
          }), createComponent(Tab.Item, {
            name: "link-example",
            title: () => "Link",
            body: () => createComponent(LinkExample, {})
          }), createComponent(Tab.Item, {
            name: "nav-help-example",
            title: () => "Nav Help",
            body: () => createComponent(NavHelpExample, {})
          }), createComponent(Tab.Item, {
            name: "panel-example",
            title: () => "Panel",
            body: () => createComponent(PanelExample, {})
          }), createComponent(Tab.Item, {
            name: "radio-button-example",
            title: () => "Radio Button",
            body: () => createComponent(RadioButtonExample, {})
          }), createComponent(Tab.Item, {
            name: "scroll-area-example",
            title: () => "Scroll Area",
            body: () => createComponent(ScrollAreaExample, {})
          }), createComponent(Tab.Item, {
            name: "slot-example",
            title: () => "Slot",
            body: () => createComponent(SlotExample, {})
          }), createComponent(Tab.Item, {
            name: "tab-example",
            title: () => "Tab",
            body: () => createComponent(TabExample, {})
          }), createComponent(Tab.Item, {
            name: "tooltip-example",
            title: () => "Tooltip",
            body: () => createComponent(TooltipExample, {})
          }), createComponent(Tab.Item, {
            name: "trigger-example",
            title: () => "Trigger",
            body: () => createComponent(TriggerExample, {})
          }), createComponent(Tab.Item, {
            name: "virtual-scroll-area-example",
            title: () => "Virtual Scroll Area",
            body: () => createComponent(VirtualScrollAreaExample, {})
          })];
        }
      });
    }
  });
}, document.getElementById("root"));
//# sourceMappingURL=components-browser.js.map

import '../../../../vendor/solid-js/web/dist/web.js';
import { useContext, createComponent, mergeProps, For, Show } from '../../../../vendor/solid-js/dist/solid.js';
import { Link } from '../../../components/link.js';
import { VSlot } from '../../../components/slot.js';
import { TabContext, Tab } from '../../../components/tab.js';

const TabListLinks = (props) => {
  const tabContext = useContext(TabContext);
  return createComponent(VSlot, mergeProps(props, {
    get ["class"]() {
      return `flex flex-col items-end ${props.class ?? ""}`;
    },
    "data-name": "TabListLinks",
    get children() {
      return createComponent(For, {
        get each() {
          return tabContext?.tabs();
        },
        children: (tab, index) => createComponent(Tab.Trigger, {
          get name() {
            return tab.name;
          },
          get children() {
            return createComponent(Show, {
              get when() {
                return !tabContext?.isActive(tab.name);
              },
              get fallback() {
                return tab.title();
              },
              get children() {
                return createComponent(Link, {
                  get tabIndex() {
                    return index();
                  },
                  get children() {
                    return tab.title();
                  }
                });
              }
            });
          }
        })
      });
    }
  }));
};

export { TabListLinks };
//# sourceMappingURL=tab-list-links.js.map

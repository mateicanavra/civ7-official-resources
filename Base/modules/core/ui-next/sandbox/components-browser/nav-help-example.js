import { template, insert } from '../../../vendor/solid-js/web/dist/web.js';
import { createSignal, createComponent } from '../../../vendor/solid-js/dist/solid.js';
import { Button } from '../../components/button.js';
import { NavHelp } from '../../components/nav-help.js';
import { ScrollArea } from '../../components/scroll-area.js';
import { BoundString, BoundBoolean } from './components/bound-property.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="flex flex-row flex-auto mx-4"><div class="w-2\\/3 m-2 p-2 border border-secondary-3 flex flex-col justify-center items-center"><div class=mt-8>Alone</div></div></div>`);
const NavHelpExample = () => {
  const [actionName, setActionName] = createSignal("accept");
  const [disabled, setDisabled] = createSignal(false);
  return (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild;
    insert(_el$, createComponent(ScrollArea, {
      "class": "w-1\\/3 m-2 p-2 border border-secondary-3",
      get children() {
        return [createComponent(BoundString, {
          name: "actionName",
          signal: [actionName, setActionName]
        }), createComponent(BoundBoolean, {
          name: "disabled",
          signal: [disabled, setDisabled]
        })];
      }
    }), _el$2);
    insert(_el$2, createComponent(Button, {
      "class": "border-1",
      name: "ExampleActivatable",
      get hotkeyAction() {
        return actionName();
      },
      get children() {
        return [createComponent(NavHelp, {
          "class": "mr-2",
          get actionName() {
            return actionName();
          }
        }), "From button context"];
      }
    }), _el$3);
    insert(_el$2, createComponent(NavHelp, {
      get actionName() {
        return actionName();
      }
    }), null);
    return _el$;
  })();
};

export { NavHelpExample };
//# sourceMappingURL=nav-help-example.js.map

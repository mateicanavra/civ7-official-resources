import { template, spread, insert } from '../../vendor/solid-js/web/dist/web.js';
import { createSignal, mergeProps, createComponent } from '../../vendor/solid-js/dist/solid.js';
import { Button } from '../components/button.js';

var _tmpl$ = /* @__PURE__ */ template(`<div><span class="text-base my-2">The number is </span></div>`);
const [theNumber, setTheNumber] = createSignal(32);
const SimpleBinding = (props) => {
  return (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild;
    spread(_el$, mergeProps(props, {
      get ["class"]() {
        return `flex flex-row ${props.class}`;
      }
    }), false, true);
    insert(_el$, createComponent(Button, {
      "class": "size-6 m-2",
      onActivate: () => setTheNumber((n) => n - 1),
      children: "-"
    }), _el$2);
    insert(_el$2, theNumber, null);
    insert(_el$, createComponent(Button, {
      "class": "size-6 m-2",
      onActivate: () => setTheNumber((n) => n + 1),
      children: "+"
    }), null);
    return _el$;
  })();
};

export { SimpleBinding };
//# sourceMappingURL=simple-binding.js.map

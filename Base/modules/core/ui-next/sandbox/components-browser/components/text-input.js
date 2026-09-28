import { template, spread } from '../../../../vendor/solid-js/web/dist/web.js';
import { mergeProps } from '../../../../vendor/solid-js/dist/solid.js';

var _tmpl$ = /* @__PURE__ */ template(`<input>`);
const TextInput = (props) => {
  return (() => {
    var _el$ = _tmpl$();
    spread(_el$, mergeProps(props, {
      get ["class"]() {
        return `bg-accent-6 border-2 border-secondary-3 p-1 ${props.class ?? ""}`;
      },
      "type": "text"
    }), false, false);
    return _el$;
  })();
};

export { TextInput };
//# sourceMappingURL=text-input.js.map

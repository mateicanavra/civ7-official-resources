import { template, insert } from '../../../../vendor/solid-js/web/dist/web.js';
import { RadioButton } from '../../../components/radio-button.js';
import { TextInput } from './text-input.js';
import { createComponent } from '../../../../vendor/solid-js/dist/solid.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="my-2 flex flex-col"><div class=text-center></div><div class="relative h-10"></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div class="my-2 flex flex-row items-center"></div>`);
const BoundString = (props) => {
  const [getter, setter] = props.signal;
  return (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling;
    insert(_el$2, () => props.name);
    insert(_el$3, createComponent(TextInput, {
      "class": "flex-grow w-full absolute",
      get value() {
        return getter();
      },
      onInput: (e) => setter(e.currentTarget.value)
    }));
    return _el$;
  })();
};
const BoundBoolean = (props) => {
  const [getter, setter] = props.signal;
  return (() => {
    var _el$4 = _tmpl$2();
    insert(_el$4, createComponent(RadioButton, {
      "class": "mr-2",
      get isChecked() {
        return getter();
      },
      onActivate: () => setter((v) => !v)
    }), null);
    insert(_el$4, () => props.name, null);
    return _el$4;
  })();
};
const BoundNumber = (props) => {
  const [getter, setter] = props.signal;
  return (() => {
    var _el$5 = _tmpl$(), _el$6 = _el$5.firstChild, _el$7 = _el$6.nextSibling;
    insert(_el$6, () => props.name);
    insert(_el$7, createComponent(TextInput, {
      "class": "flex-grow w-full absolute",
      type: "number",
      get value() {
        return getter()?.toString() ?? 0;
      },
      onInput: (e) => setter(Number(e.currentTarget.value))
    }));
    return _el$5;
  })();
};

export { BoundBoolean, BoundNumber, BoundString };
//# sourceMappingURL=bound-property.js.map

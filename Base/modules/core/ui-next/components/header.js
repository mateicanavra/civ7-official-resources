import { template, spread, insert } from '../../vendor/solid-js/web/dist/web.js';
import { createMemo, mergeProps } from '../../vendor/solid-js/dist/solid.js';
import { ComponentRegistry } from '../services/component-registry.js';

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`);
const TEXT_SIZES = ["text-2xs", "text-xs", "text-sm", "text-base", "text-lg", "text-xl", "text-2xl", "text-custom"];
const HeaderComponent = (props) => {
  const baseClasses = "uppercase tracking-100 fxs-header pointer-events-auto font-title";
  const textSize = createMemo(() => TEXT_SIZES.some((size) => props.class?.includes(size)) ? "" : "text-lg");
  return (() => {
    var _el$ = _tmpl$();
    spread(_el$, mergeProps(props, {
      get ["class"]() {
        return `${baseClasses} ${textSize()} ${props.class ?? ""}`;
      },
      "data-name": "Header"
    }), false, true);
    insert(_el$, () => props.children);
    return _el$;
  })();
};
const Header = ComponentRegistry.register("Header", HeaderComponent);

export { Header };
//# sourceMappingURL=header.js.map

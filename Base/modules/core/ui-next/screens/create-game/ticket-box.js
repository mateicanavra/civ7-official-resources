import { template, spread, insert } from '../../../vendor/solid-js/web/dist/web.js';
import { ComponentRegistry } from '../../services/component-registry.js';
import { mergeProps } from '../../../vendor/solid-js/dist/solid.js';

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`);
const TicketBoxComponent = (props) => {
  return (() => {
    var _el$ = _tmpl$();
    spread(_el$, mergeProps(props, {
      get ["class"]() {
        return `img-ticket-solid-shadow-container ${props.class ?? ""}`;
      }
    }), false, true);
    insert(_el$, () => props.children);
    return _el$;
  })();
};
const TicketBox = ComponentRegistry.register({
  name: "TicketBox",
  createInstance: TicketBoxComponent,
  images: ["blp:ticket_solid_shadow"]
});

export { TicketBox };
//# sourceMappingURL=ticket-box.js.map

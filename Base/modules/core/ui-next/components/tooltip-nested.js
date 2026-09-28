import { createContext } from '../../vendor/solid-js/dist/solid.js';

const NestedTooltipContext = createContext();
const isNestedTooltipContextDisabled = (ctx) => {
  const disabled = ctx?.disabled;
  if (!disabled) {
    return false;
  }
  return typeof disabled === "function" ? disabled() : disabled;
};

export { NestedTooltipContext, isNestedTooltipContextDisabled };
//# sourceMappingURL=tooltip-nested.js.map

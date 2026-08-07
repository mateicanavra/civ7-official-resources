import '../../vendor/solid-js/web/dist/web.js';
import { Activatable } from './activatable.js';
import { ActiveInputDevice } from '../services/input.js';
import { createComponent, mergeProps } from '../../vendor/solid-js/dist/solid.js';

const TooltipKeyword = (props) => {
  return createComponent(Activatable, mergeProps(props, {
    get ["class"]() {
      return `tooltip-keyword cursor-pointer transition-color duration-50 ${props.class ?? ""}`;
    },
    get classList() {
      return {
        "tooltip-keyword-focus": ActiveInputDevice() !== InputDeviceType.Mouse && ActiveInputDevice() !== InputDeviceType.Keyboard,
        ...props.classList
      };
    },
    name: "TooltipKeyword",
    get children() {
      return props.children;
    }
  }));
};

export { TooltipKeyword };
//# sourceMappingURL=tooltip-keyword.js.map

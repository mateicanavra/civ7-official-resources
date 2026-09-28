import '../../vendor/solid-js/web/dist/web.js';
import { ComponentRegistry } from '../services/component-registry.js';
import { Activatable } from './activatable.js';
import { createComponent, mergeProps } from '../../vendor/solid-js/dist/solid.js';

const LinkComponent = (props) => {
  props.audio ??= {};
  props.audio.onPress ??= "data-audio-primary-button-press";
  props.audio.onFocus ??= "data-audio-primary-button-focus";
  return createComponent(Activatable, mergeProps(props, {
    get ["class"]() {
      return `text-tertiary-1 focus\\:text-tertiary-2 hover\\:text-tertiary-2 ${props.class ?? ""}`;
    },
    get classList() {
      return props.classList;
    },
    name: "Link",
    get children() {
      return props.children;
    }
  }));
};
const Link = ComponentRegistry.register({
  name: "Link",
  createInstance: LinkComponent
});

export { Link };
//# sourceMappingURL=link.js.map

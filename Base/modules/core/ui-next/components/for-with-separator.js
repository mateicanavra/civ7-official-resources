import '../../vendor/solid-js/web/dist/web.js';
import { createComponent, For, createMemo, Show } from '../../vendor/solid-js/dist/solid.js';
import { ComponentRegistry } from '../services/component-registry.js';

function ForWithSeparatorComponent(props) {
  return createComponent(For, {
    get fallback() {
      return props.fallback;
    },
    get each() {
      return props.each;
    },
    children: (item, index) => [createComponent(Show, {
      get when() {
        return index() != 0;
      },
      get children() {
        return props.separator;
      }
    }), createMemo(() => props.children(item, index))]
  });
}
const ForWithSeparator = ComponentRegistry.register("ForWithSeparator", ForWithSeparatorComponent);

export { ForWithSeparator };
//# sourceMappingURL=for-with-separator.js.map

import '../../../vendor/solid-js/web/dist/web.js';
import { createMemo, createComponent } from '../../../vendor/solid-js/dist/solid.js';
import { Icon } from '../../components/icon.js';
import { Tooltip } from '../../components/tooltip.js';

const AttributeIcon = (props) => {
  const iconName = createMemo(() => props.attribute?.replace("LOC_TAG_TRAIT_", "ATTRIBUTE_").replace("_NAME", "") ?? "");
  return createComponent(Tooltip.Text, {
    bodyClass: "flex flex-row justify-center",
    get text() {
      return props.attribute ?? "";
    },
    get children() {
      return createComponent(Icon, {
        get name() {
          return iconName();
        },
        get ["class"]() {
          return `relative ${props.class ?? ""}`;
        },
        context: "OUTLINE"
      });
    }
  });
};

export { AttributeIcon };
//# sourceMappingURL=attribute-icon.js.map

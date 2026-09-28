import '../../vendor/solid-js/web/dist/web.js';
import { Button } from '../components/button.js';
import { EffectModel } from './effect-model.js';
import { createComponent, createMemo } from '../../vendor/solid-js/dist/solid.js';

const EffectComponent = (props) => {
  return createComponent(Button, {
    "class": "text-base mx-2 mt-2",
    onActivate: () => props.action(EffectModel.setValue),
    get children() {
      return [createMemo(() => props.name), " Effect"];
    }
  });
};

export { EffectComponent };
//# sourceMappingURL=effect-component.js.map

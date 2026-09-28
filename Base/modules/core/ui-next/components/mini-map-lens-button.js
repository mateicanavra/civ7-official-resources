import '../../vendor/solid-js/web/dist/web.js';
import { createSignal, onMount, onCleanup, createComponent } from '../../vendor/solid-js/dist/solid.js';
import LensManager, { LensActivationEventName } from '../../ui/lenses/lens-manager.js';
import { L10n } from './l10n.js';
import { RadioButton } from './radio-button.js';
import { ComponentRegistry } from '../services/component-registry.js';

const MiniMapRadioButtonComponent = (props) => {
  const [activeLens, setActiveLens] = createSignal(LensManager.getActiveLens());
  onMount(() => {
    window.addEventListener(LensActivationEventName, onActiveLensChanged);
  });
  onCleanup(() => {
    window.removeEventListener(LensActivationEventName, onActiveLensChanged);
  });
  function onActiveLensChanged(event) {
    setActiveLens(event.detail.activeLens);
  }
  return [createComponent(RadioButton, {
    "class": "mr-2",
    get isChecked() {
      return activeLens() === props.lens;
    },
    "data-audio-group-ref": "minimap-radio-button",
    onActivate: () => {
      LensManager.setActiveLens(props.lens);
    }
  }), createComponent(L10n.Stylize, {
    "class": "text-accent-2 text-base font-body pointer-events-auto",
    get text() {
      return props.caption;
    }
  })];
};
const MiniMapRadioButton = ComponentRegistry.register({
  name: "MiniMapRadioButton",
  createInstance: MiniMapRadioButtonComponent
});

export { MiniMapRadioButton };
//# sourceMappingURL=mini-map-lens-button.js.map

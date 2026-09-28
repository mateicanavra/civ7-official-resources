import '../../../../core/vendor/solid-js/web/dist/web.js';
import { defineLegacyComponent } from '../../../../core/ui-next/components/fxs-solid-component.js';
import { AgeTransitionScreen } from './age-transition-screen.js';
import { createComponent } from '../../../../core/vendor/solid-js/dist/solid.js';

defineLegacyComponent("age-transition-bootstrap", {
  classNames: ["w-full", "h-full"]
}, () => {
  return createComponent(AgeTransitionScreen, {
    screens: [{
      name: "civ-choice",
      step: "civ-select"
    }, {
      name: "civ-select",
      step: "civ-select"
    }, {
      name: "civ-details",
      step: "civ-select"
    }, {
      name: "memento-select",
      step: "memento-select",
      prev: "civ-choice",
      next: "START"
    }]
  });
});
//# sourceMappingURL=age-transition-bootstrap.js.map

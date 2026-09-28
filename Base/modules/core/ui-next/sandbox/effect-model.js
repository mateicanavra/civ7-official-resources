import { createSignal, createEffect } from '../../vendor/solid-js/dist/solid.js';

const [value, setValue] = createSignal("Look in the console");
const EffectModel = {
  value,
  setValue
};
createEffect(() => {
  console.log(`Value changed to ${value()}`);
});

export { EffectModel };
//# sourceMappingURL=effect-model.js.map

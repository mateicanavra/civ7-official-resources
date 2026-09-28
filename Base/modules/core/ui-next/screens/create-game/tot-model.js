import { createMemo, createContext, useContext } from '../../../vendor/solid-js/dist/solid.js';
import { AgeSelectModel } from './age-select-model.js';
import { CivSelectModel } from './civ-select-model.js';
import { ModelRegistry, ModelLifecycle } from '../../services/model-registry.js';

function createTotModel() {
  const ageModel = AgeSelectModel.get();
  const civModel = CivSelectModel.get();
  const isTotEnabled = createMemo(() => ageModel.selectedAge.type != civModel.selectedCiv()?.apexAge);
  const isHeightOfPower = createMemo(() => ageModel.selectedAge.type == civModel.selectedCiv()?.apexAge);
  return {
    isTotEnabled,
    isHeightOfPower
  };
}
const TotModel = ModelRegistry.register("TotModel", ModelLifecycle.SharedInstance, createTotModel);
const TotModelContext = createContext();
function useTotModelContext() {
  const context = useContext(TotModelContext);
  if (!context) {
    throw new Error("useTotModelContext: Cannot find context!");
  }
  return context;
}

export { TotModel, TotModelContext, createTotModel, useTotModelContext };
//# sourceMappingURL=tot-model.js.map

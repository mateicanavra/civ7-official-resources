import { createEffect, createContext, useContext } from '../../../vendor/solid-js/dist/solid.js';
import { createMutable, modifyMutable, produce } from '../../../vendor/solid-js/store/dist/store.js';
import { GameSetupParametersModel } from './game-parameters-model.js';
import { ModelRegistry, ModelLifecycle } from '../../services/model-registry.js';

function createAgeSelectModel() {
  const ageParameter = GameSetupParametersModel.get().Age;
  const ageNames = /* @__PURE__ */ new Map();
  const getAgeData = () => {
    const sortedAges = [];
    const agesDomainValues = [...ageParameter.domain.possibleValues ?? []];
    const sortedValues = agesDomainValues.sort((a, b) => a.sortIndex - b.sortIndex);
    for (const age of sortedValues) {
      const type = age.value;
      const ageInfo = {
        type,
        name: GameSetup.resolveString(age.name) || "",
        description: GameSetup.resolveString(age.description) || "",
        icon: `url(${UI.getIcon(type) || ""})`,
        bgImage: UI.getIconBLP(type, "BACKGROUND_HORIZ"),
        domain: GameSetup.resolveString(age.originDomain) || ""
      };
      sortedAges.push(ageInfo);
      ageNames.set(ageInfo.type, ageInfo.name);
    }
    const currentAge = ageParameter.value.value;
    const selectedAgeIndex = sortedAges.findIndex((age) => age.type == currentAge);
    const selectedAge = sortedAges[selectedAgeIndex >= 0 ? selectedAgeIndex : 0];
    const nextAge = selectedAgeIndex + 1 < sortedAges.length ? sortedAges[selectedAgeIndex + 1] : selectedAge;
    const isAgeTransition = UI.isInGame();
    return { sortedAges, selectedAge: isAgeTransition ? nextAge : selectedAge, nextAge };
  };
  const ageData = {
    ...getAgeData(),
    getAgeName: (ageType) => ageNames.get(ageType),
    setSelectedAge: (age) => ageParameter.setValue(age.type),
    getAgeIcon: (ageType) => `url(${UI.getIcon(ageType) || ""})`
  };
  const ageMutable = createMutable(ageData);
  createEffect(() => {
    const ageData2 = getAgeData();
    modifyMutable(
      ageMutable,
      produce((ageModel) => {
        ageModel.sortedAges = ageData2.sortedAges;
        ageModel.selectedAge = ageData2.selectedAge;
      })
    );
  });
  return ageMutable;
}
const AgeSelectModel = ModelRegistry.register(
  "AgeSelectModel",
  ModelLifecycle.SharedInstance,
  createAgeSelectModel
);
const AgeSelectModelContext = createContext();
function useAgeSelectModelContext() {
  const context = useContext(AgeSelectModelContext);
  if (!context) {
    throw new Error("useAgeSelectModelContext: Cannot find context!");
  }
  return context;
}

export { AgeSelectModel, AgeSelectModelContext, createAgeSelectModel, useAgeSelectModelContext };
//# sourceMappingURL=age-select-model.js.map

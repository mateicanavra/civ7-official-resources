import { U as UpdateGate } from '../../../core/ui/utilities/utilities-update-gate.chunk.js';

class AgeSummaryModel {
  ageName = "";
  ageData = [];
  selectedAgeType = "";
  selectedAgeChangedEvent = new LiteEvent();
  onUpdate;
  constructor() {
    this.updateGate.call("constructor");
  }
  set updateCallback(callback) {
    this.onUpdate = callback;
  }
  updateGate = new UpdateGate(() => {
    const currentAge = GameInfo.Ages.lookup(Game.age);
    if (!currentAge) {
      console.error(`model-age-summary-hub: Failed to get current age for hash ${Game.age}`);
      return;
    }
    const currentAgeChronoIndex = currentAge.ChronologyIndex;
    for (const age of GameInfo.Ages) {
      if (age.$hash == currentAge.$hash) {
        this.ageName = Locale.compose("LOC_AGE_BANNER_TEXT_TOP", age.Name);
      }
      const ageData = {
        name: age.Name,
        type: age.AgeType,
        isCurrent: age.$hash == Game.age,
        isSelected: false,
        isDisabled: age.ChronologyIndex > currentAgeChronoIndex
      };
      this.ageData.push(ageData);
    }
    if (this.onUpdate) {
      this.onUpdate(this);
    }
  });
  selectAgeType(type) {
    for (const age of this.ageData) {
      age.isSelected = type == age.type;
      if (age.isSelected) {
        this.selectedAgeType = age.type;
        this.selectedAgeChangedEvent.trigger(age.type);
      }
    }
  }
  selectCurrentAge() {
    const currentAge = GameInfo.Ages.lookup(Game.age);
    if (!currentAge) {
      console.error(`model-age-summary-hub: selectCurrentAge() Failed to get current age for hash ${Game.age}`);
      return;
    }
    this.selectAgeType(currentAge.AgeType);
  }
}
const AgeSummary = new AgeSummaryModel();
engine.whenReady.then(() => {
  const updateModel = () => {
    engine.updateWholeModel(AgeSummary);
  };
  engine.createJSModel("g_AgeSummary", AgeSummary);
  AgeSummary.updateCallback = updateModel;
});

export { AgeSummary as default };
//# sourceMappingURL=model-age-summary-hub.js.map

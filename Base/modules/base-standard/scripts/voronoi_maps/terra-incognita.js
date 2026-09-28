import { VoronoiShuffle, SectionType } from './shuffle.js';

class VoronoiTerraIncognita extends VoronoiShuffle {
  constructor() {
    super();
    this.m_ruleSetKeysToPlayerRegionIdMap = /* @__PURE__ */ new Map();
    this.m_playerLandmassIdRemap = /* @__PURE__ */ new Map();
  }
  simulateInternal() {
    super.simulateInternal();
  }
  getSectionWeights() {
    const weights = super.getSectionWeights();
    const doubleContinentsRatio = 1 / (weights.length + 1);
    weights[SectionType.Continents] *= doubleContinentsRatio;
    return weights;
  }
  getSectionTypes(count) {
    const sectionTypes = super.getSectionTypes(count);
    sectionTypes[0] = SectionType.Continents;
    return sectionTypes;
  }
  simulate() {
    this.m_ruleSetKeysToPlayerRegionIdMap.clear();
    this.m_playerLandmassIdRemap.clear();
    super.simulate();
    const originalMap = new Map(this.m_ruleSetKeysToPlayerRegionIdMap);
    for (const [newPlayerRegionId, oldPlayerRegionMap] of this.m_playerLandmassIdRemap.entries()) {
      for (const oldPlayerRegionId of oldPlayerRegionMap.keys()) {
        const entries = Array.from(originalMap.entries());
        const ruleSetKey = entries.find(([_, value]) => value === oldPlayerRegionId)?.[0];
        if (ruleSetKey) {
          console.log(
            `Remapping rule set key ${ruleSetKey} from old player region ID ${oldPlayerRegionId} to new player region ID ${newPlayerRegionId}.`
          );
          this.m_ruleSetKeysToPlayerRegionIdMap.set(ruleSetKey, newPlayerRegionId);
        }
      }
    }
  }
  getContinentPlayerRegionId() {
    return (this.m_ruleSetKeysToPlayerRegionIdMap.get("Continents") ?? 0) - 1;
  }
  static getName() {
    return "Terra Incognita";
  }
}

export { VoronoiTerraIncognita };
//# sourceMappingURL=terra-incognita.js.map

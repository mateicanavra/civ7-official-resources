import { RandomImpl } from '../random-pcg-32.js';
import { VoronoiHex, PlayerRegion } from '../voronoi-hex.js';
import { VariantOverrideType } from '../voronoi-types.js';
import { VoronoiBuilder } from '../voronoi-builder.js';
import { VoronoiUtils, WrapType } from '../voronoi-utils.js';

const voronoiMapSchema = {
  totalPlayers: {
    label: "Total Players",
    description: "The number of total players. This value is overridden in-game.",
    default: 8,
    min: 1,
    max: 24,
    step: 1
  },
  voronoiCellCountMultiple: {
    label: "Cell Count Multiple",
    description: "The number of voronoi cells to use relative to hexes.",
    default: 1,
    min: 0.5,
    max: 4,
    step: 0.1
  },
  voronoiRelaxationSteps: {
    label: "Cell Relaxation Steps",
    description: "The number times to relax the voronoi diagram from its original random positions.",
    default: 3,
    min: 0,
    max: 10,
    step: 1
  },
  wrapX: {
    label: "Wrap Meridian",
    description: "Wrap the map around the meridian.",
    default: 0,
    min: 0,
    max: 1,
    step: 1
  }
};
class VoronoiMap {
  m_baseSchema;
  m_builder = new VoronoiBuilder();
  m_initialized = false;
  m_settings;
  m_variants = {};
  m_defaultSettings = { mapSettings: {}, generatorSettings: {}, ruleSettings: {} };
  // not altered after construction
  m_defaultJson = {};
  // default json object optionally passed in.
  m_primarySettings = { mapSettings: {}, generatorSettings: {}, ruleSettings: {} };
  m_builderNeedsInit = true;
  m_hexDims = { x: 0, y: 0 };
  m_generator;
  m_hexTiles;
  m_hexStats;
  m_rndInitState;
  m_rndSimulateInternalState;
  m_rndSimulateState;
  m_initialVariants = {};
  constructor(baseSchema, generator, defaultGeneratorSettings, defaultRulesSettings, defaultJson = {}) {
    this.m_baseSchema = baseSchema;
    this.m_settings = this.m_primarySettings.mapSettings;
    this.m_generator = generator;
    this.m_defaultJson = defaultJson;
    this.m_hexTiles = new VoronoiHex();
    for (const [key, value] of Object.entries(this.getSettingsConfig())) {
      this.m_defaultSettings.mapSettings[key] = value.default;
    }
    this.m_defaultSettings.generatorSettings = VoronoiUtils.clone(defaultGeneratorSettings);
    this.m_defaultSettings.ruleSettings = VoronoiUtils.clone(defaultRulesSettings);
    this.m_primarySettings = VoronoiUtils.clone(this.m_defaultSettings);
    this.resetToDefault();
  }
  getSettings() {
    return this.m_settings;
  }
  setSettings(settings) {
    this.m_settings = { ...settings };
  }
  getHexTiles() {
    return this.m_hexTiles;
  }
  getGenerator() {
    return this.m_generator;
  }
  getSettingsConfig() {
    return this.m_baseSchema;
  }
  getWrapType() {
    return this.getSettings().wrapX ? WrapType.WrapX : WrapType.None;
  }
  createMajorPlayerAreas(valueFunction, playerLandmasses = void 0) {
    if (playerLandmasses == void 0) {
      playerLandmasses = [];
      for (const landmass of this.m_generator.getLandmasses()) {
        if (landmass.playerAreas > 0) {
          const playerRegion = new PlayerRegion();
          playerRegion.id = landmass.id;
          playerRegion.playerAreas = landmass.playerAreas;
          playerLandmasses.push(playerRegion);
        }
      }
    }
    this.m_hexTiles.createMajorPlayerAreas(playerLandmasses, valueFunction, {
      wrap: this.getWrapType(),
      width: this.m_hexDims.x,
      height: this.m_hexDims.y
    });
  }
  simulate() {
    if (this.m_rndSimulateInternalState == void 0) {
      this.m_rndSimulateInternalState = RandomImpl.getState();
    }
    RandomImpl.setState(this.m_rndSimulateInternalState);
    this.applyVariants();
    this.simulateInternal();
    this.m_generator.logSettings();
    this.initBuilder();
    if (this.m_rndSimulateState == void 0) {
      this.m_rndSimulateState = RandomImpl.getState();
    }
    RandomImpl.setState(this.m_rndSimulateState);
    this.m_generator.simulate();
    this.m_hexTiles.initFromRegionCells(
      this.m_hexDims.x,
      this.m_hexDims.y,
      this.m_generator.getKdTree(),
      this.m_generator.getLandmasses()
    );
    this.m_hexTiles.validate();
    this.m_hexStats = this.m_hexTiles.calculatePlayerLandmasses();
  }
  initInternal(hexDims) {
    this.m_hexDims = hexDims;
    this.m_rndSimulateState = void 0;
    this.m_rndSimulateInternalState = void 0;
    this.m_rndInitState = void 0;
    this.m_builderNeedsInit = true;
    if (!this.m_initialized) {
      for (const [variantName, key] of Object.entries(this.m_initialVariants)) {
        if (variantName in this.m_variants && key in this.m_variants[variantName].settings) {
          const variant = this.m_variants[variantName];
          variant.selected = key;
        }
      }
      this.m_initialized = true;
    }
    this.applyVariants();
  }
  initBuilder() {
    if (this.m_builderNeedsInit) {
      if (this.m_rndInitState == void 0) {
        this.m_rndInitState = RandomImpl.getState();
      }
      RandomImpl.setState(this.m_rndInitState);
      const wrapType = this.getSettings().wrapX ? WrapType.WrapX : WrapType.None;
      this.m_builder.init(
        this.m_hexDims,
        this.getSettings().voronoiCellCountMultiple,
        this.getSettings().voronoiRelaxationSteps,
        wrapType
      );
      this.m_generator.init(
        this.m_builder.getDiagramDims(),
        this.m_builder.getDiagram(),
        this.m_hexDims,
        wrapType
      );
      this.m_builderNeedsInit = false;
    }
  }
  resetToDefault() {
    this.m_primarySettings = VoronoiUtils.clone(this.m_defaultSettings);
    if (this.m_defaultJson) {
      this.loadSettingsFromJson(this.m_defaultJson);
    }
  }
  setPrimaryMapSetting(keyPath, value) {
    VoronoiUtils.setPath(this.m_primarySettings.mapSettings, keyPath, value);
    if (["voronoiCellCountMultiple", "voronoiRelaxationSteps", "wrapX"].includes(
      String(keyPath[keyPath.length - 1])
    )) {
      this.m_builderNeedsInit = true;
    }
  }
  setPrimaryGeneratorSetting(keyPath, value) {
    VoronoiUtils.setPath(this.m_primarySettings.generatorSettings, keyPath, value);
  }
  setPrimaryRuleSetting(keyPath, value) {
    VoronoiUtils.setPath(this.m_primarySettings.ruleSettings, keyPath, value);
  }
  getPrimaryMapSetting(keyPath) {
    return VoronoiUtils.getPath(this.m_primarySettings.mapSettings, keyPath);
  }
  getPrimaryGeneratorSetting(keyPath) {
    return VoronoiUtils.getPath(this.m_primarySettings.generatorSettings, keyPath);
  }
  getPrimaryRuleSetting(keyPath) {
    return VoronoiUtils.getPath(this.m_primarySettings.ruleSettings, keyPath);
  }
  getVariants() {
    return this.m_variants;
  }
  setVariants(variants) {
    this.m_variants = variants;
    this.m_builderNeedsInit = true;
  }
  createVariant(name) {
    this.m_variants[name] = { selected: void 0, settings: {} };
  }
  deleteVariant(name) {
    if (name in this.m_variants) {
      delete this.m_variants[name];
      this.m_builderNeedsInit = true;
    }
  }
  createVariantKey(variantName, key) {
    if (variantName in this.m_variants) {
      this.m_variants[variantName].settings[key] = { generatorSettings: {}, mapSettings: {}, ruleSettings: {} };
      this.m_builderNeedsInit = true;
    }
  }
  deleteVariantKey(variantName, key) {
    if (variantName in this.m_variants && key in this.m_variants[variantName].settings) {
      delete this.m_variants[variantName].settings[key];
      this.m_builderNeedsInit = true;
    }
  }
  setSelectedVariantKey(variantName, key) {
    if (!this.m_initialized) {
      if (key === void 0) {
        if (variantName in Object.keys(this.m_initialVariants)) {
          delete this.m_initialVariants[variantName];
        }
      } else {
        this.m_initialVariants[variantName] = key;
      }
    } else if (variantName in this.m_variants && (!key || key in this.m_variants[variantName].settings)) {
      const variant = this.m_variants[variantName];
      variant.selected = key;
      this.m_builderNeedsInit = true;
    }
  }
  applyOverrideAtPath(target, path, [overrideValue, overrideType]) {
    switch (overrideType) {
      case VariantOverrideType.Replace:
        VoronoiUtils.setPath(target, path, overrideValue, false);
        break;
      case VariantOverrideType.Add: {
        const existingValue = VoronoiUtils.getPath(target, path);
        VoronoiUtils.setPath(target, path, existingValue + Number(overrideValue), false);
        break;
      }
      case VariantOverrideType.Multiply: {
        const existingValue = VoronoiUtils.getPath(target, path);
        VoronoiUtils.setPath(target, path, existingValue * Number(overrideValue), false);
        break;
      }
    }
  }
  applyVariants() {
    this.setSettings(VoronoiUtils.clone(this.m_primarySettings.mapSettings));
    this.getGenerator().setSettings(VoronoiUtils.clone(this.m_primarySettings.generatorSettings));
    for (const [groupKey, rules] of Object.entries(this.getGenerator().getRules())) {
      for (const [ruleName, rule] of Object.entries(rules)) {
        const primarySettings = this.m_primarySettings.ruleSettings[groupKey][ruleName];
        const { weight, isActive, ...config } = primarySettings;
        rule.weight = Number(weight);
        rule.isActive = Boolean(isActive);
        rule.configValues = config;
      }
    }
    for (const variant of Object.values(this.m_variants)) {
      if (variant.selected == void 0) continue;
      const selected = variant.settings[variant.selected];
      for (const { path, value } of this.iterateVariantLeaves(selected.mapSettings)) {
        this.applyOverrideAtPath(this.getSettings(), path, value);
      }
      for (const { path, value } of this.iterateVariantLeaves(selected.generatorSettings)) {
        this.applyOverrideAtPath(this.getGenerator().getSettings(), path, value);
      }
      const rules = this.getGenerator().getRules();
      for (const { path, value } of this.iterateVariantLeaves(selected.ruleSettings)) {
        const rule = rules[path[0]][path[1]];
        const ruleProp = path[2];
        if (ruleProp == "weight") {
          rule.weight = Number(value);
        } else if (ruleProp == "isActive") {
          rule.isActive = Boolean(value);
        } else {
          this.applyOverrideAtPath(rule?.configValues, path.slice(2), value);
        }
      }
    }
  }
  getSelectedVariantKey(variantName) {
    if (variantName in this.m_variants) {
      return this.m_variants[variantName].selected;
    }
    return void 0;
  }
  setVariantMapSetting(name, key, path, value) {
    this.setVariantSettingInternal(name, key, "mapSettings", path, value);
    if (["voronoiCellCountMultiple", "voronoiRelaxationSteps", "wrapX"].includes(String(path[path.length - 1]))) {
      this.m_builderNeedsInit = true;
    }
  }
  setVariantGeneratorSetting(name, key, path, value) {
    this.setVariantSettingInternal(name, key, "generatorSettings", path, value);
  }
  setVariantRuleSetting(name, key, path, value) {
    this.setVariantSettingInternal(name, key, "ruleSettings", path, value);
  }
  getVariantMapSetting(name, key, path) {
    return this.getVariantSettingInternal(name, key, "mapSettings", path);
  }
  getVariantGeneratorSetting(name, key, path) {
    return this.getVariantSettingInternal(name, key, "generatorSettings", path);
  }
  getVariantRuleSetting(name, key, path) {
    return this.getVariantSettingInternal(name, key, "ruleSettings", path);
  }
  deleteVariantMapSetting(name, key, path) {
    this.deleteVariantSettingInternal(name, key, "mapSettings", path);
    if (["voronoiCellCountMultiple", "voronoiRelaxationSteps", "wrapX"].includes(String(path[path.length - 1]))) {
      this.m_builderNeedsInit = true;
    }
  }
  deleteVariantGeneratorSetting(name, key, path) {
    this.deleteVariantSettingInternal(name, key, "generatorSettings", path);
  }
  deleteVariantRuleSetting(name, key, path) {
    this.deleteVariantSettingInternal(name, key, "ruleSettings", path);
  }
  getMapVariantsForPath(path) {
    return this.getVariantsForPath(path, "mapSettings");
  }
  getGeneratorVariantsForPath(path) {
    return this.getVariantsForPath(path, "generatorSettings");
  }
  getRuleVariantsForPath(path) {
    return this.getVariantsForPath(path, "ruleSettings");
  }
  getVariantsForPath(path, recordName) {
    const variants = [];
    for (const [variantName, variant] of Object.entries(this.m_variants)) {
      for (const settingName of Object.keys(variant.settings)) {
        if (this.getVariantSettingInternal(variantName, settingName, recordName, path) != void 0) {
          variants.push({ name: variantName, setting: settingName });
        }
      }
    }
    return variants;
  }
  getName() {
    const ctor = this.constructor;
    return ctor.getName();
  }
  setVariantSettingInternal(variantName, variantKey, recordName, path, value) {
    if (variantName in this.m_variants && variantKey in this.m_variants[variantName].settings) {
      const variant = this.m_variants[variantName];
      const settings = variant.settings[variantKey];
      if (settings[recordName] == void 0) {
        settings[recordName] = {};
      }
      const setRecursive = (record, depth) => {
        const item = path[depth];
        const nextDepth = depth + 1;
        const isLast = nextDepth == path.length;
        if (Array.isArray(record)) {
          if (item == "") {
            if (isLast) {
              return;
            } else {
              for (const element of record) {
                setRecursive(element, nextDepth);
              }
            }
          } else if (VoronoiUtils.isArrayIndexKey(item)) {
            if (Number(item) < record.length) {
              setRecursive(record[Number(item)], nextDepth);
            } else {
              return;
            }
          } else {
            return;
          }
        } else if (isLast) {
          record[item] = value;
        } else {
          if (record[item] == void 0) {
            const nextItem = path[nextDepth];
            if (nextItem == "" || VoronoiUtils.isArrayIndexKey(nextItem)) {
              const existing = VoronoiUtils.getPath(
                this.m_primarySettings[recordName],
                path.slice(0, nextDepth)
              );
              if (Array.isArray(existing)) {
                record[item] = new Array(existing.length).fill({});
                if (nextItem == "") {
                  for (const element of record[item]) {
                    setRecursive(element, nextDepth + 1);
                  }
                  return;
                }
              }
            } else {
              record[item] = {};
            }
          }
          setRecursive(record[item], nextDepth);
        }
      };
      setRecursive(settings[recordName], 0);
      if (variant.selected === variantKey) {
      }
    }
  }
  getVariantSettingInternal(variantName, variantKey, recordName, path) {
    if (variantName in this.m_variants && variantKey in this.m_variants[variantName].settings) {
      let record = this.m_variants[variantName].settings[variantKey][recordName];
      for (let i = 0; i < path.length; ++i) {
        const item = path[i];
        if (!record) break;
        if (Array.isArray(record)) {
          if (item == "") {
            record = record[0];
          } else if (VoronoiUtils.isArrayIndexKey(item)) {
            record = record[Number(item)];
          } else {
            return void 0;
          }
        } else if (i == path.length - 1) {
          return record[item];
        } else {
          record = record[item];
        }
      }
    }
    return void 0;
  }
  deleteVariantSettingInternal(variantName, variantKey, recordName, path) {
    if (variantName in this.m_variants && variantKey in this.m_variants[variantName].settings) {
      const deleteRecursive = (record, depth) => {
        const item = path[depth];
        const isLast = depth == path.length - 1;
        const nextDepth = depth + 1;
        if (Array.isArray(record)) {
          if (item == "") {
            if (isLast) {
              record.length = 0;
            } else {
              for (const element of record) {
                deleteRecursive(element, nextDepth);
              }
            }
          } else if (VoronoiUtils.isArrayIndexKey(item)) {
            const idx = Number(item);
            const element = record[idx];
            if (!element) return;
            deleteRecursive(record[Number(item)], nextDepth);
          } else {
            return;
          }
        } else if (isLast) {
          delete record[item];
        } else {
          const child = record[item];
          if (child === void 0) return;
          deleteRecursive(child, nextDepth);
        }
      };
      deleteRecursive(this.m_variants[variantName].settings[variantKey][recordName], 0);
      if (this.m_variants[variantName].selected === variantKey) {
      }
    }
  }
  loadSettingsFromJson(json) {
    this.m_primarySettings = VoronoiUtils.clone(this.m_defaultSettings);
    const configObject = typeof json === "string" ? JSON.parse(json) : json;
    VoronoiUtils.deepMerge(this.m_primarySettings.mapSettings, configObject.mapConfig);
    VoronoiUtils.deepMerge(this.m_primarySettings.generatorSettings, configObject.generatorConfig);
    const rulesConfig = VoronoiUtils.explodeConfig(configObject.rulesConfig);
    VoronoiUtils.deepMerge(this.m_primarySettings.ruleSettings, rulesConfig);
    if (configObject.variantSettings) {
      this.setVariants(configObject.variantSettings);
    }
  }
  loadSettingsFromJs(jsText) {
    const match = jsText.match(/export\s+default\s+({[\s\S]*});?\s*$/);
    if (!match) throw new Error("Could not find export default object");
    return this.loadSettingsFromJson(match[1]);
  }
  static isOverrideValue(v) {
    return Array.isArray(v) && v.length === 2 && (typeof v[0] === "number" || typeof v[0] === "boolean") && typeof v[1] === "number";
  }
  static isVariantRecord(v) {
    return typeof v === "object" && v !== null && !Array.isArray(v);
  }
  static isVariantRecordArray(v) {
    return Array.isArray(v) && !VoronoiMap.isOverrideValue(v);
  }
  *iterateVariantLeaves(root) {
    if (root == void 0) return;
    function* walkValue(value, prefix) {
      if (VoronoiMap.isOverrideValue(value)) {
        yield { path: prefix, value };
      } else if (VoronoiMap.isVariantRecord(value)) {
        yield* walkObject(value, prefix);
      } else if (VoronoiMap.isVariantRecordArray(value)) {
        for (let i = 0; i < value.length; ++i) {
          yield* walkObject(value[i], [...prefix, i]);
        }
      }
    }
    function* walkObject(node, prefix) {
      for (const [key, child] of Object.entries(node)) {
        yield* walkValue(child, [...prefix, key]);
      }
    }
    yield* walkObject(root, []);
  }
}

export { VoronoiMap, voronoiMapSchema };
//# sourceMappingURL=map-common.js.map

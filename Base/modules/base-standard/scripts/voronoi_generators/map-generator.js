import { MapSize } from '../voronoi-types.js';
import { kdTree, WrappedKdTree } from '../kd-tree.js';
import { WrapType, RegionCellPosGetter, VoronoiUtils, RegionCell, Aabb2 } from '../voronoi-utils.js';

var GeneratorType = /* @__PURE__ */ ((GeneratorType2) => {
  GeneratorType2[GeneratorType2["Continent"] = 0] = "Continent";
  return GeneratorType2;
})(GeneratorType || {});
const ruleDefaults = {
  weight: 1,
  isActive: true
};
function resolveRuleConfig(cfg) {
  const obj = {};
  for (const [ruleCategory, rules] of Object.entries(cfg)) {
    obj[ruleCategory] = {};
    for (const [ruleName, ruleSettings] of Object.entries(rules)) {
      obj[ruleCategory][ruleName] = {
        ...ruleDefaults,
        ...ruleSettings,
        config: { ...ruleSettings.config ?? {} }
        // avoid shared object.
      };
    }
  }
  return obj;
}
class GeneratorSchemaGroup {
  groupLabel = "";
  childCount;
  // define this to allow this group to contain arrays of settings.
  children = { type: "configs", data: {} };
}
class MapGenerator {
  m_generatorSettings = {};
  m_regionCells = [];
  m_diagram;
  // initialized in init()
  m_worldDims = { x: 0, y: 0 };
  // World size accounting for sizes of hexes
  m_hexDims = { x: 0, y: 0 };
  // Actual number of hexes in x/y.
  m_mapSizeType = MapSize.Standard;
  m_wrap = WrapType.None;
  m_kdTree = new kdTree(RegionCellPosGetter);
  // initialized in init()
  m_wrapDistOpts = { wrap: WrapType.None };
  init(worldDims, diagram, hexDims, wrap = WrapType.None) {
    this.m_diagram = diagram;
    this.m_worldDims = worldDims;
    this.m_hexDims = hexDims;
    this.m_mapSizeType = VoronoiUtils.getMapSizeForDims(hexDims);
    this.m_wrap = wrap;
    this.m_wrapDistOpts = { wrap, width: worldDims.x, height: worldDims.y };
    this.m_regionCells = diagram.cells.map((cell, index) => {
      const area = VoronoiUtils.calculateCellArea(cell);
      const regionCell = new RegionCell(cell, index, area);
      return regionCell;
    });
    if (wrap == WrapType.WrapX) {
      const bounds = new Aabb2({ x: 0, y: 0 }, worldDims);
      this.m_kdTree = new WrappedKdTree(RegionCellPosGetter, bounds, wrap);
    }
    this.m_kdTree.build(this.m_regionCells);
  }
  logSettings() {
    console.log(
      `generator ${this.getType()} for map size (x: ${this.m_hexDims.x}, y: ${this.m_hexDims.y}) [${this.m_mapSizeType}] initialized with settings:`
    );
    const logObject = (obj, indent, lastKey = "") => {
      if (obj === null) {
        console.log(indent + "null");
      } else if (Array.isArray(obj)) {
        console.log(indent + lastKey + ": [");
        for (let i = 0; i < obj.length; ++i) {
          logObject(obj[i], indent + "  ", i.toString());
        }
        console.log(indent + "]");
      } else if (typeof obj === "object") {
        if (lastKey != "") {
          console.log(indent + lastKey + ": ");
        }
        for (const [key, value] of Object.entries(obj)) {
          if (key[0] === "_") continue;
          logObject(value, indent + "  ", key);
        }
      } else {
        console.log(indent + lastKey + ": " + obj);
      }
    };
    logObject(this.m_generatorSettings, "  ");
    console.log(`Rules:`);
    const ruleSections = this.getRules();
    for (const [ruleSection, rules] of Object.entries(ruleSections)) {
      console.log(`  ${ruleSection}:`);
      for (const [ruleName, rule] of Object.entries(rules)) {
        console.log(`    ${ruleName}: active: ${rule.isActive}, weight: ${rule.weight}`);
        for (const [key, value] of Object.entries(rule.configValues)) {
          logObject(value, "      ", key);
        }
      }
    }
  }
  static buildDefaultSettings(nodes) {
    const out = {};
    for (const [key, node] of Object.entries(nodes)) {
      if ("children" in node) {
        if (node.children.type === "configs") {
          if (node.childCount && node.childCount > 0) {
            out["_defaultChild"] = this.buildDefaultSettings(node.children.data);
            const arr = [];
            for (let i = 0; i < node.childCount; ++i) {
              arr[i] = this.buildDefaultSettings(node.children.data);
            }
            out[key] = arr;
          } else {
            out[key] = this.buildDefaultSettings(node.children.data);
          }
        }
      } else {
        out[key] = node.default;
      }
    }
    return out;
  }
  initializeRules(settings) {
    for (const [cat, rules] of Object.entries(this.getRules())) {
      for (const [ruleName, rule] of Object.entries(rules)) {
        rule.initialize(settings[cat][ruleName]);
      }
    }
  }
  getRegionCells() {
    return this.m_regionCells;
  }
  getPlateCells() {
    return this.m_regionCells;
  }
  getKdTree() {
    return this.m_kdTree;
  }
  getSettings() {
    return this.m_generatorSettings;
  }
  setSettings(generatorSettings) {
    this.m_generatorSettings = generatorSettings;
  }
  getDiagram() {
    return this.m_diagram;
  }
  getPlatesDiagram() {
    return this.m_diagram;
  }
}

export { GeneratorSchemaGroup, GeneratorType, MapGenerator, resolveRuleConfig, ruleDefaults };
//# sourceMappingURL=map-generator.js.map

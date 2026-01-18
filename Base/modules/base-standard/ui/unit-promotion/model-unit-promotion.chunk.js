import { u as utils, G as Graph } from '../../../core/ui/graph-layout/utils.chunk.js';
import { G as GraphLayout } from '../../../core/ui/graph-layout/layout.chunk.js';
import { C as ComponentID } from '../../../core/ui/utilities/utilities-component-id.chunk.js';
import { U as UpdateGate } from '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import { V as ViewManager } from '../../../core/ui/views/view-manager.chunk.js';

class UnitPromotionModel {
  _isClosing = false;
  get isClosing() {
    return this._isClosing;
  }
  set isClosing(value) {
    this._isClosing = value;
  }
  selectedUnit = null;
  // Model Data
  _name = "";
  _totalPromotions = 0;
  _experienceMax = 0;
  _experienceCurrent = 0;
  _experienceCaption = "";
  _promotionPoints = 0;
  _commendationPoints = 0;
  _level = 0;
  _promotionsLabel = "";
  _commendationsLabel = "";
  _commendations = [];
  iconClassMap = {
    LOC_DISCIPLINE_ARMY_BASTION_NAME: "promotion-bastion",
    LOC_DISCIPLINE_ARMY_ASSAULT_NAME: "promotion-assault",
    LOC_DISCIPLINE_LOGISTICS_NAME: "promotion-logistics",
    LOC_DISCIPLINE_MANEUVER_NAME: "promotion-maneuver",
    LOC_DISCIPLINE_LEADERSHIP_NAME: "promotion-leadership",
    LOC_DISCIPLINE_FLEET_BOMBARDMENT_NAME: "promotion-bombardment",
    LOC_DISCIPLINE_FLEET_ENGAGEMENT_NAME: "promotion-engagement",
    LOC_DISCIPLINE_SQUADRON_DOGFIGHTING_NAME: "promotion-dogfighting",
    LOC_DISCIPLINE_SQUADRON_RAIDS_NAME: "promotion-raids",
    LOC_DISCIPLINE_AIRLIFT_OPERATIONS_NAME: "promotion-airlift-operations",
    LOC_DISCIPLINE_CARRIER_OPERATIONS_NAME: "promotion-carrier-operations",
    LOC_DISCIPLINE_ARMY_TRUNG_NHI_NAME: "promotion-trung-nhi"
  };
  _OnUpdate;
  updateGate = new UpdateGate(() => {
    this.update();
  });
  promotionsByDiscipline = /* @__PURE__ */ new Map();
  _promotionTrees = [];
  ORIGIN_ROW = 1;
  ORIGIN_COLUMN = 1;
  HORIZONTAL_OFFSET = 2;
  VERTICAL_OFFSET = 2;
  constructor() {
    engine.whenReady.then(() => {
      const selectedUnitID = UI.Player.getHeadSelectedUnit();
      if (!selectedUnitID && ComponentID.isValid(selectedUnitID)) {
        this.updateGate.call("init");
      }
      engine.on("UnitSelectionChanged", this.onUnitSelectionChanged, this);
    });
  }
  set updateCallback(callback) {
    this._OnUpdate = callback;
  }
  get name() {
    return this._name;
  }
  get totalPromotions() {
    return this._totalPromotions;
  }
  get experienceCaption() {
    return this._experienceCaption;
  }
  get experienceMax() {
    return this._experienceMax;
  }
  get experienceCurrent() {
    return this._experienceCurrent;
  }
  get promotionPoints() {
    return this._promotionPoints;
  }
  get commendationPoints() {
    return this._commendationPoints;
  }
  get level() {
    return this._level;
  }
  get promotionsLabel() {
    return this._promotionsLabel;
  }
  get commendationsLabel() {
    return this._commendationsLabel;
  }
  get commendations() {
    return this._commendations;
  }
  get promotionTrees() {
    return this._promotionTrees;
  }
  get canPurchase() {
    return this._promotionPoints > 0 || this._commendationPoints > 0;
  }
  onUnitSelectionChanged(event) {
    if (!ViewManager.isUnitSelectingAllowed) {
      return;
    }
    if (event.unit.owner == GameContext.localPlayerID && event.selected) {
      const unitComponentID = UI.Player.getHeadSelectedUnit();
      if (!ComponentID.isValid(unitComponentID)) {
        console.warn(
          "model-unit-promotion: onUnitSelectionChanged: Unit selected message signaled but no head selected unit!"
        );
        return;
      }
      if (ComponentID.isMatch(unitComponentID, event.unit)) {
        const unit = Units.get(event.unit);
        if (unit && unit.isCommanderUnit) {
          this.update();
        }
      }
    }
  }
  update() {
    const selectedUnitID = UI.Player.getHeadSelectedUnit();
    if (!selectedUnitID) {
      console.error(
        `model-unit-promotion: update called with no selected unit. triggers: ${this.updateGate.callTriggers}`
      );
      return;
    }
    const unit = Units.get(selectedUnitID);
    if (!unit) {
      console.error(
        `model-unit-promotion: update with no unit object. id: ${ComponentID.toLogString(selectedUnitID)}, triggers: ${this.updateGate.callTriggers}`
      );
      return;
    }
    this.selectedUnit = unit;
    this._name = Locale.compose(this.selectedUnit.name);
    if (!this.selectedUnit.Experience) {
      console.error(
        "model-unit-promotion: update(): No valid unit Experience component attached to unit with id:" + this.selectedUnit.id
      );
      return;
    }
    const promotionsSize = this.selectedUnit.Experience.getTotalPromotionsEarned;
    this._totalPromotions = promotionsSize;
    const currentExperience = this.selectedUnit.Experience.experiencePoints;
    const experienceToNextLevel = this.selectedUnit.Experience.experienceToNextLevel;
    this._experienceMax = experienceToNextLevel;
    this._experienceCurrent = currentExperience;
    this._experienceCaption = `${currentExperience} / ${experienceToNextLevel}`;
    this._promotionPoints = this.selectedUnit.Experience.getStoredPromotionPoints;
    this._level = this.selectedUnit.Experience.getLevel;
    this._commendationPoints = this.selectedUnit.Experience.getStoredCommendations;
    this._promotionsLabel = Locale.compose(
      "LOC_PROMOTION_POINTS",
      this.selectedUnit.Experience.getStoredPromotionPoints
    );
    this._commendationsLabel = Locale.compose(
      "LOC_PROMOTION_COMMENDATION_POINTS",
      this.selectedUnit.Experience.getStoredCommendations
    );
    this.realizePromotionTreeElements();
    if (this._OnUpdate) {
      this._OnUpdate(this);
    }
  }
  updateModel() {
    this.update();
  }
  realizePromotionTreeElements() {
    if (!this.selectedUnit) {
      console.error("model-unit-promotion: realizePromotionTreeElements(): No valid unit selected");
      return;
    }
    if (!this.selectedUnit.Experience) {
      console.error(
        "model-unit-promotion: realizePromotionTreeElements(): No valid unit Experience component attached to unit with id:" + this.selectedUnit.id
      );
      return;
    }
    this._promotionTrees = [];
    this.promotionsByDiscipline.clear();
    const promotionClass = GameInfo.Units.lookup(this.selectedUnit.type);
    if (!promotionClass) {
      console.error(
        "model-unit-promotion: realizePromotionTreeElements(): No valid promotionClass attached to unit with id:" + this.selectedUnit.id
      );
      return;
    }
    GameInfo.UnitPromotionClassSets.forEach((classSet) => {
      if (classSet.PromotionClassType === promotionClass.PromotionClass) {
        const discipline = GameInfo.UnitPromotionDisciplines.lookup(classSet.UnitPromotionDisciplineType);
        const details = GameInfo.UnitPromotionDisciplineDetails.filter(
          (p) => p.UnitPromotionDisciplineType === classSet.UnitPromotionDisciplineType
        );
        const addedPromos = [];
        details.forEach((detail) => {
          const promotion = GameInfo.UnitPromotions.lookup(detail.UnitPromotionType);
          if (promotion != void 0 && discipline != void 0 && !promotion.Commendation) {
            const promotionByDiscipline = this.promotionsByDiscipline.get(discipline);
            if (promotionByDiscipline == void 0) {
              this.promotionsByDiscipline.set(discipline, [promotion]);
            }
            let hasPromo = false;
            for (let i = 0; i < addedPromos.length; ++i) {
              if (addedPromos[i] === promotion.UnitPromotionType) {
                hasPromo = true;
                break;
              }
            }
            if (!hasPromo) {
              promotionByDiscipline?.push(promotion);
              addedPromos?.push(promotion.UnitPromotionType);
            }
          }
        });
      }
    });
    this.promotionsByDiscipline.forEach((promotions, discipline) => {
      const promotionGraph = this.buildPromotionsLayoutGraph(promotions, discipline);
      const layoutHeight = utils.maxRank(promotionGraph) + 1;
      const layoutWidth = utils.maxOrder(promotionGraph) + 1;
      const totalRows = layoutHeight * this.HORIZONTAL_OFFSET + this.ORIGIN_ROW;
      const totalColumns = layoutWidth * this.VERTICAL_OFFSET + this.ORIGIN_COLUMN;
      const promotionTree = {
        discipline,
        promotions,
        layoutGraph: promotionGraph,
        cards: [],
        layoutData: {
          rows: totalRows,
          columns: totalColumns,
          layoutHeight,
          layoutWidth
        }
      };
      const iconClassByDisciplineName = this.getIconClassByDisciplineName(discipline.Name);
      promotions.forEach((promotion) => {
        const card = {
          discipline,
          iconClass: iconClassByDisciplineName,
          promotion,
          row: -1,
          column: -1,
          hasData: false
        };
        promotionTree.cards.push(card);
      });
      this._promotionTrees.push(promotionTree);
    });
    this.buildPromotionCards();
  }
  getIconClassByDisciplineName(name) {
    return this.iconClassMap[name];
  }
  buildPromotionsLayoutGraph(promotions, discipline) {
    const graph = new Graph();
    graph.setGraph({});
    graph.setDefaultEdgeLabel(function() {
      return {};
    });
    for (let i = 0; i < promotions.length; i++) {
      const promotion = promotions[i];
      const unitPromotionsPrereq = GameInfo.UnitPromotionDisciplineDetails.filter(
        (p) => p.UnitPromotionType === promotion.UnitPromotionType && p.UnitPromotionDisciplineType === discipline.UnitPromotionDisciplineType
      );
      unitPromotionsPrereq.forEach((promotionPrereq) => {
        if (promotionPrereq.PrereqUnitPromotion) {
          const startNode = promotionPrereq.PrereqUnitPromotion;
          const endNode = promotionPrereq.UnitPromotionType;
          graph.setNode(startNode, { label: startNode });
          graph.setNode(endNode, { label: endNode });
          graph.setEdge(startNode, endNode);
        }
      });
    }
    const layout = new GraphLayout(graph);
    const layoutGraph = layout.autoResolve();
    return layoutGraph;
  }
  buildPromotionCards() {
    this.promotionTrees.forEach((promotionTree) => {
      const graphLayout = promotionTree.layoutGraph;
      const layerOffsets = this.getHorizontalOffsets(graphLayout);
      for (let rank = 0; rank < 5; rank++) {
        let maxOrdersThisRank = 0;
        promotionTree.cards.forEach((dataCard) => {
          const nodeId = dataCard.promotion?.UnitPromotionType;
          const node = graphLayout.node(nodeId);
          if (node.rank == rank) {
            if (node.order > maxOrdersThisRank) {
              maxOrdersThisRank = node.order;
            }
          }
        });
        if (maxOrdersThisRank > 0) {
          promotionTree.cards.forEach((dataCard) => {
            const nodeId = dataCard.promotion?.UnitPromotionType;
            const node = graphLayout.node(nodeId);
            if (node) {
              if (node.rank == rank) {
                node.order = maxOrdersThisRank - node.order;
              }
            }
          });
        }
      }
      const orderedCards = promotionTree.cards.sort((cardA, cardB) => {
        const nodeA = graphLayout.node(cardA.promotion.UnitPromotionType);
        const nodeB = graphLayout.node(cardB.promotion.UnitPromotionType);
        return nodeA.rank - nodeB.rank;
      });
      promotionTree.cards = orderedCards;
      promotionTree.cards.forEach((dataCard) => {
        const nodeId = dataCard.promotion?.UnitPromotionType;
        const node = graphLayout.node(nodeId);
        if (node) {
          const horizontalOffset = layerOffsets[node.rank];
          if (dataCard.row == -1) {
            dataCard.row = this.ORIGIN_ROW + node.rank * this.HORIZONTAL_OFFSET;
          }
          if (dataCard.column == -1) {
            dataCard.column = this.ORIGIN_COLUMN + node.order * this.VERTICAL_OFFSET + horizontalOffset;
          }
          dataCard.hasData = true;
        }
      });
    });
  }
  getHorizontalOffsets(graph) {
    const maxRank = utils.maxRank(graph);
    const maxOrder = utils.maxOrder(graph);
    const layers = utils.range(0, maxRank + 1).map(function() {
      return [];
    });
    graph.nodes().forEach((v) => {
      const node = graph.node(v);
      const rank = node.rank;
      const order = node.order;
      const layerNode = { v, order, rank };
      if (node) {
        layers[rank].push(layerNode);
      }
    });
    const maxHeigth = maxOrder + 1;
    const layerOffsets = [];
    layers.forEach((layer) => {
      const layerOffset = maxHeigth - layer.length;
      layerOffsets.push(layerOffset);
    });
    return layerOffsets;
  }
  getCard(type) {
    if (type == void 0) {
      return void 0;
    }
    for (let iTree = 0; iTree < this.promotionTrees.length; iTree++) {
      const targetTree = this.promotionTrees[iTree];
      const targetCard = targetTree.cards.find(
        (t) => t.promotion.UnitPromotionType == type
      );
      if (targetCard != void 0) {
        return targetCard;
      }
    }
    return void 0;
  }
  getLastPopulatedRowFromTree(tree) {
    const treeDiscipline = tree.getAttribute("promotion-discipline");
    if (!treeDiscipline) {
      console.error("model-unit-promotion: getLastPopulatedRowFromTree(): No discipline attribute found");
      return;
    }
    const treeInfo = this.promotionTrees.find(
      (tree2) => tree2.discipline.UnitPromotionDisciplineType == treeDiscipline
    );
    if (!treeInfo) {
      console.error(
        "model-unit-promotion: getLastPopulatedRowFromTree(): No tree with discipline " + treeDiscipline
      );
      return;
    }
    const treeGraph = treeInfo.layoutGraph;
    const maxRank = utils.maxRank(treeGraph);
    const lastRowIndex = this.ORIGIN_ROW + maxRank * this.HORIZONTAL_OFFSET;
    const lastRowCards = tree.querySelectorAll(
      `div[row="${lastRowIndex}"] .promotion-element`
    );
    return lastRowCards;
  }
}
const UnitPromotion = new UnitPromotionModel();
engine.whenReady.then(() => {
  const updateModel = () => {
    engine.updateWholeModel(UnitPromotion);
  };
  engine.createJSModel("g_UnitPromotion", UnitPromotion);
  UnitPromotion.updateCallback = updateModel;
});

export { UnitPromotion as U };
//# sourceMappingURL=model-unit-promotion.chunk.js.map

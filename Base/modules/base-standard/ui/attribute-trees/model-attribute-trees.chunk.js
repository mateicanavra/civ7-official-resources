import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import ActionHandler, { ActiveDeviceTypeChangedEventName } from '../../../core/ui/input/action-handler.js';
import { r as roundTo2 } from '../../../core/ui/utilities/utilities-core-textprovider.chunk.js';
import { U as UpdateGate } from '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import { T as TreeGridSourceType, a as TreeGrid } from '../tree-grid/tree-grid.chunk.js';
import { a as TreeGridDirection } from '../tree-grid/tree-support.chunk.js';

class AttributeTreesModel {
  onUpdate;
  updateGate = new UpdateGate(this.update.bind(this));
  wasMouseKeyboard = ActionHandler.isMouseKeyboardActive;
  _attributes = [];
  _activeTreeAttribute = null;
  _wildCardPoints = 0;
  attributesHotkeyListener = () => {
    this.onAttributesHotkey();
  };
  constructor() {
    window.addEventListener("hotkey-open-attributes", this.attributesHotkeyListener);
    window.addEventListener(ActiveDeviceTypeChangedEventName, () => {
      if (!this.wasMouseKeyboard || !ActionHandler.isMouseKeyboardActive) {
        this.updateGate.call("ModelAttributeTrees-ActiveDeviceTypeChanged");
      }
      this.wasMouseKeyboard = ActionHandler.isMouseKeyboardActive;
    });
    this.updateGate.call("constructor");
  }
  set updateCallback(callback) {
    this.onUpdate = callback;
  }
  get playerId() {
    return GameContext.localPlayerID;
  }
  get attributes() {
    return this._attributes;
  }
  get wildCardPoints() {
    return this._wildCardPoints;
  }
  get isGamepadActive() {
    return ActionHandler.isGamepadActive;
  }
  get activeTreeAttribute() {
    return this._activeTreeAttribute;
  }
  set activeTreeAttribute(eType) {
    this._activeTreeAttribute = eType;
  }
  update() {
    this._attributes = [];
    const localPlayerID = GameContext.localPlayerID;
    const localPlayer = Players.get(localPlayerID);
    if (!localPlayer) {
      return;
    }
    if (localPlayer.Identity) {
      for (const attributeDef of GameInfo.Attributes) {
        const definition = GameInfo.ProgressionTrees.find((t) => {
          return t.ProgressionTreeType == attributeDef.ProgressionTreeType;
        });
        if (!definition) {
          if (attributeDef.Name != "LOC_ATTRIBUTE_WILDCARD") {
            console.warn(
              "model-attribute-trees: update(): No definition for attribute: " + attributeDef.Name
            );
          }
          continue;
        }
        const iconCallback = (_node) => {
          return UI.getIconURL(attributeDef.AttributeType);
        };
        const treeConfig = {
          direction: TreeGridDirection.VERTICAL,
          delegateGetIconPath: iconCallback,
          canPurchaseNode: this.canBuyAttributeTreeNode,
          extraRows: 0,
          extraColumns: 0,
          originRow: 0,
          originColumn: 1,
          treeType: TreeGridSourceType.ATTRIBUTES
        };
        const treeGrid = new TreeGrid(definition.ProgressionTreeType, treeConfig);
        treeGrid.initialize();
        const attrPoints = localPlayer.Identity.getAvailableAttributePoints(attributeDef.AttributeType);
        const attrPointProgress = roundTo2(localPlayer.Identity.getNextAttributePointProgress(attributeDef.AttributeType)) * 100;
        const wildcardPoints = localPlayer.Identity.getWildcardPoints();
        this._wildCardPoints = wildcardPoints || 0;
        const wildcard = Locale.stylize("LOC_UI_ATTRIBUTE_TREES_POINTS_WILDCARD", this._wildCardPoints);
        const attrData = {
          attributeTree: definition ? definition.ProgressionTreeType : 0,
          type: attributeDef.AttributeType,
          availablePoints: attrPoints,
          nextPointProgress: attrPointProgress,
          wildCardLabel: wildcard,
          treeGrid
        };
        this._attributes.push(attrData);
      }
      if (this._activeTreeAttribute == null && this._attributes.length > 0) {
        this._activeTreeAttribute = this._attributes[0].type;
      }
    }
    if (this.onUpdate) {
      this.onUpdate(this);
    }
  }
  getAttributeData(attr) {
    for (const data of this._attributes) {
      if (data.type == attr) {
        return data;
      }
    }
    const newData = {
      type: attr,
      availablePoints: 0,
      nextPointProgress: 0,
      attributeTree: -1,
      wildCardLabel: "[WIP] Wildcard Label"
    };
    this._attributes.push(newData);
    return newData;
  }
  canBuyAttributeTreeNode(nodeId) {
    const nodeIndex = +nodeId;
    const args = { ProgressionTreeNodeType: nodeIndex };
    const result = Game.PlayerOperations.canStart(
      GameContext.localPlayerID,
      PlayerOperationTypes.BUY_ATTRIBUTE_TREE_NODE,
      args,
      false
    );
    return result.Success;
  }
  buyAttributeTreeNode(nodeId) {
    const nodeIndex = +nodeId;
    const args = { ProgressionTreeNodeType: nodeIndex };
    const result = Game.PlayerOperations.canStart(
      GameContext.localPlayerID,
      PlayerOperationTypes.BUY_ATTRIBUTE_TREE_NODE,
      args,
      false
    );
    if (result.Success) {
      Game.PlayerOperations.sendRequest(
        GameContext.localPlayerID,
        PlayerOperationTypes.BUY_ATTRIBUTE_TREE_NODE,
        args
      );
    }
    this.updateGate.call("buyAttributeTreeNode");
  }
  getCard(type) {
    if (type == void 0) {
      return void 0;
    }
    for (let iTree = 0; iTree < this._attributes.length; iTree++) {
      const targetTree = this._attributes[iTree];
      const targetCard = targetTree.treeGrid?.getCard(type);
      if (targetCard != void 0) {
        return targetCard;
      }
    }
    return void 0;
  }
  onAttributesHotkey() {
    if (ContextManager.isCurrentClass("screen-attribute-trees")) {
      ContextManager.pop("screen-attribute-trees");
    } else {
      ContextManager.push("screen-attribute-trees");
    }
  }
}
const AttributeTrees = new AttributeTreesModel();
engine.whenReady.then(() => {
  const updateModel = () => {
    engine.updateWholeModel(AttributeTrees);
  };
  engine.createJSModel("g_AttributeTrees", AttributeTrees);
  AttributeTrees.updateCallback = updateModel;
});

export { AttributeTrees as A };
//# sourceMappingURL=model-attribute-trees.chunk.js.map

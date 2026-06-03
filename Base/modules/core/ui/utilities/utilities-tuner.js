class TunerUtilities {
  /* For now, we are returning the GameValue hierarchy in a flat list, because we don't have the tree-view support in the TunerListener yet */
  getGameValueDisplayItems(tValue, depthIn) {
    const items = [];
    const depth = depthIn != void 0 ? depthIn : 0;
    let indentStr = "";
    for (let i = 0; i < depth; ++i) {
      indentStr = indentStr + ">";
    }
    let str = "";
    if (tValue.description) {
      str = tValue.description;
    } else {
      str = "id=" + tValue.id.toString();
    }
    str = str + ";" + tValue.value.toString();
    items.push(indentStr + str);
    if (tValue.base != void 0) {
      if (tValue.base.value != 0 || tValue.base.steps != void 0) {
        str = ".base;" + tValue.base.value.toString();
        items.push(indentStr + str);
        if (tValue.base.steps != void 0) {
          items.push(indentStr + ".base.steps");
          for (const step of tValue.base.steps) {
            const children = this.getGameValueDisplayItems(step, depth + 1);
            for (const child of children) {
              items.push(child);
            }
          }
        }
      }
    }
    if (tValue.modifier != void 0) {
      if (tValue.modifier.value != 0 || tValue.modifier.steps != void 0) {
        str = ".modifier;" + tValue.modifier.value.toString();
        items.push(indentStr + str);
        if (tValue.modifier.steps != void 0) {
          items.push(indentStr + ".modifier.steps");
          for (const step of tValue.modifier.steps) {
            const children = this.getGameValueDisplayItems(step, depth + 1);
            for (const child of children) {
              items.push(child);
            }
          }
        }
      }
    }
    if (tValue.steps != void 0) {
      items.push(indentStr + "steps");
      for (const step of tValue.steps) {
        const children = this.getGameValueDisplayItems(step, depth + 1);
        for (const child of children) {
          items.push(child);
        }
      }
    }
    return items;
  }
  /* Put the game values 'display' into a simple string hierarcy */
  getGameValueDisplayItemsTree(tValue, depthIn) {
    const node = {};
    const depth = depthIn != void 0 ? depthIn : 0;
    let str = "";
    if (tValue.description) {
      str = tValue.description;
    } else {
      str = "id=" + tValue.id.toString();
    }
    str = str + ";" + tValue.value.toString();
    str = str + ";" + this.getGameValueStepTypeString(tValue.type);
    if (tValue.description) {
      str = str + ";id=" + tValue.id.toString();
    }
    node.name = str;
    if (tValue.context != void 0) {
      const contextNode = {};
      contextNode.name = ".context";
      contextNode.children = [];
      if (tValue.context.owner != void 0) {
        const v = {};
        v.name = ".owner = " + tValue.context.owner.toString();
        contextNode.children.push(v);
      }
      if (tValue.context.id != void 0) {
        const v = {};
        v.name = ".id = " + tValue.context.id.toString();
        contextNode.children.push(v);
      }
      if (tValue.context.type != void 0) {
        const v = {};
        v.name = ".type = " + tValue.context.type.toString();
        contextNode.children.push(v);
      }
      if (node.children == void 0) {
        node.children = [];
      }
      node.children.push(contextNode);
    }
    if (tValue.base != void 0) {
      if (tValue.base.value != 0 || tValue.base.steps != void 0) {
        const baseNode = {};
        baseNode.name = ".base;" + tValue.base.value.toString();
        if (tValue.base.steps != void 0) {
          baseNode.children = [];
          for (const step of tValue.base.steps) {
            const childNode = this.getGameValueDisplayItemsTree(step, depth + 1);
            baseNode.children.push(childNode);
          }
        }
        if (node.children == void 0) {
          node.children = [];
        }
        node.children.push(baseNode);
      }
    }
    if (tValue.modifier != void 0) {
      if (tValue.modifier.value != 0 || tValue.modifier.steps != void 0) {
        const modifierNode = {};
        modifierNode.name = ".modifier;" + tValue.modifier.value.toString();
        if (tValue.modifier.steps != void 0) {
          modifierNode.children = [];
          for (const step of tValue.modifier.steps) {
            const childNode = this.getGameValueDisplayItemsTree(step, depth + 1);
            modifierNode.children.push(childNode);
          }
        }
        if (node.children == void 0) {
          node.children = [];
        }
        node.children.push(modifierNode);
      }
    }
    if (tValue.steps != void 0) {
      if (node.children == void 0) {
        node.children = [];
      }
      for (const step of tValue.steps) {
        const childNode = this.getGameValueDisplayItemsTree(step, depth + 1);
        node.children.push(childNode);
      }
    }
    return node;
  }
  getGameValueStepTypeString(type) {
    switch (type) {
      case GameValueStepTypes.INVALID:
        return "INVALID";
      case GameValueStepTypes.VALUE:
        return "VALUE";
      case GameValueStepTypes.ADDITION:
        return "ADDITION";
      case GameValueStepTypes.MAXIMUM:
        return "MAXIMUM";
      case GameValueStepTypes.MINIMUM:
        return "MINIMUM";
      case GameValueStepTypes.ATTRIBUTE:
        return "ATTRIBUTE";
      case GameValueStepTypes.MULTIPLY:
        return "MULTIPLY";
      case GameValueStepTypes.INCREMENT:
        return "INCREMENT";
      case GameValueStepTypes.LNSCALAR:
        return "LNSCALAR";
      case GameValueStepTypes.NEGATIVE:
        return "NEGATIVE";
      case GameValueStepTypes.PERCENTAGE:
        return "PERCENTAGE";
      case GameValueStepTypes.RENAME:
        return "RENAME";
      case GameValueStepTypes.HALVE:
        return "HALVE";
      case GameValueStepTypes.EFFICIENCY:
        return "EFFICIENCY";
      default:
        return "UNKNOWN";
    }
  }
}
const tunerUtilities = new TunerUtilities();
console.log("tunerUtilities active");
//# sourceMappingURL=utilities-tuner.js.map

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
  getYieldSourceTypeString(type) {
    switch (type) {
      case YieldSourceTypes.BASE:
        return "BASE";
      case YieldSourceTypes.ADJACENCY:
        return "ADJACENCY";
      case YieldSourceTypes.WAREHOUSE:
        return "WAREHOUSE";
      case YieldSourceTypes.CONSTRUCTIBLES:
        return "CONSTRUCTIBLES";
      case YieldSourceTypes.NATURAL:
        return "NATURAL";
      case YieldSourceTypes.WORKERS:
        return "WORKERS";
      case YieldSourceTypes.APPEAL:
        return "APPEAL";
      case YieldSourceTypes.ENVIRONMENT:
        return "ENVIRONMENT";
      case YieldSourceTypes.RESOURCES:
        return "RESOURCES";
      case YieldSourceTypes.CITY_MODIFIERS:
        return "CITY_MODIFIERS";
      case YieldSourceTypes.PROJECT:
        return "PROJECT";
      case YieldSourceTypes.GREAT_WORKS:
        return "GREAT_WORKS";
      case YieldSourceTypes.HALVED:
        return "HALVED";
      case YieldSourceTypes.MULTIPLIED:
        return "MULTIPLIED";
      default:
        return "UNKNOWN";
    }
  }
  // Get a display entry for a city
  getCityDisplayEntry(cityId) {
    const pCity = Cities.get(cityId);
    if (pCity != null) {
      let cityName = Locale.compose(pCity.name);
      cityName = cityName.replace("LOC_CITY_NAME_", "");
      let cityStatus = "City";
      if (pCity.isTown) {
        cityStatus = "Town";
      }
      let ownerStr = "none";
      const pOwner = Players.get(pCity.owner);
      if (pOwner) {
        ownerStr = Locale.compose(pOwner.civilizationFullName);
        if (!ownerStr || ownerStr.length == 0) {
          ownerStr = "Player " + ownerStr;
        }
      }
      const origOwner = pCity.originalOwner;
      let origOwnerStr = "none";
      if (origOwner != -1) {
        const pOriginalOwner = Players.get(origOwner);
        if (pOriginalOwner) {
          origOwnerStr = Locale.compose(pOriginalOwner.civilizationFullName);
          if (!origOwnerStr || origOwnerStr.length == 0) {
            origOwnerStr = "Player " + origOwner;
          }
        }
      }
      const cityLocation = pCity.location;
      const str = cityId.owner + "," + cityId.id + ";" + cityLocation.x + ", " + cityLocation.y + ";" + cityName + ";" + cityStatus + ";" + ownerStr + ";" + origOwnerStr;
      return str;
    }
    return null;
  }
  // Get a 'short' display entry for a city
  getShortCityDisplayEntry(cityId) {
    const pCity = Cities.get(cityId);
    if (pCity != null) {
      let cityName = Locale.compose(pCity.name);
      cityName = cityName.replace("LOC_CITY_NAME_", "");
      let ownerStr = "none";
      const pOwner = Players.get(pCity.owner);
      if (pOwner) {
        ownerStr = Locale.compose(pOwner.civilizationFullName);
        if (!ownerStr || ownerStr.length == 0) {
          ownerStr = "Player " + ownerStr;
        }
      }
      const cityLocation = pCity.location;
      const str = cityId.owner + "," + cityId.id + ";" + cityLocation.x + ", " + cityLocation.y + ";" + cityName + ";" + ownerStr;
      return str;
    }
    return null;
  }
  // A display list of all the cities
  getCityDisplayList() {
    const items = [];
    for (const id of Players.getWasEverAliveIds()) {
      const player = Players.get(id);
      if (player == null) {
        continue;
      }
      const pCities = player.Cities;
      if (pCities == null) {
        continue;
      }
      for (const cityId of pCities.getCityIds()) {
        const str = this.getCityDisplayEntry(cityId);
        if (str) {
          items.push(str);
        }
      }
    }
    return items;
  }
}
const tunerUtilities = new TunerUtilities();
console.log("tunerUtilities active");
//# sourceMappingURL=utilities-tuner.js.map

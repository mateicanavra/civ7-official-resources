import { getModifierTextByContext, composeConstructibleDescription } from '../../../core/ui/utilities/utilities-core-textprovider.js';
import { getConstructibleTagsFromType } from './utilities-tags.js';

function getUnlockTargetName(targetType, targetKind) {
  if (targetKind == "KIND_MODIFIER") {
    const modInfo = GameInfo.Modifiers.find((o) => o.ModifierId == targetType);
    if (modInfo) {
      const modifierName = getModifierTextByContext(modInfo.ModifierId, "Name");
      return Locale.compose(modifierName) ?? "";
    }
  }
  if (targetKind == "KIND_CONSTRUCTIBLE") {
    const constructibleInfo = GameInfo.Constructibles.find((o) => o.ConstructibleType == targetType);
    if (constructibleInfo) {
      return Locale.compose(constructibleInfo.Name);
    }
  }
  if (targetKind == "KIND_UNIT") {
    const unitInfo = GameInfo.Units.find((o) => o.UnitType == targetType);
    if (unitInfo) {
      return Locale.compose(unitInfo.Name);
    }
  }
  if (targetKind == "KIND_TRADITION") {
    const traditionInfo = GameInfo.Traditions.find((o) => o.TraditionType == targetType);
    if (traditionInfo) {
      return Locale.compose(traditionInfo.Name);
    }
  }
  if (targetKind == "KIND_DIPLOMATIC_ACTION") {
    const diploActionInfo = GameInfo.DiplomacyActions.find((o) => o.DiplomacyActionType == targetType);
    if (diploActionInfo) {
      return Locale.compose(diploActionInfo.Name);
    }
  }
  if (targetKind == "KIND_PROJECT") {
    const projectInfo = GameInfo.Projects.find((o) => o.ProjectType == targetType);
    if (projectInfo) {
      return Locale.compose(projectInfo.Name);
    }
  }
  return targetType;
}
function getUnlockTargetDescriptions(targetType, targetKind) {
  let locStrings = [];
  if (targetKind == "KIND_MODIFIER") {
    const modInfo = GameInfo.Modifiers.find((o) => o.ModifierId == targetType);
    if (modInfo) {
      const modifierDesc = getModifierTextByContext(modInfo.ModifierId, "Description");
      if (modifierDesc) {
        locStrings.push(modifierDesc);
      }
    }
  } else if (targetKind == "KIND_CONSTRUCTIBLE") {
    const tags = getConstructibleTagsFromType(targetType).join(", ");
    const desc = composeConstructibleDescription(targetType);
    if (desc) {
      locStrings.push(
        tags.length > 0 ? `[STYLE:text-2xs text-accent-3 uppercase mb-4]${tags}[/S][N]${desc}` : desc
      );
    }
  } else if (targetKind == "KIND_UNIT") {
    const unitInfo = GameInfo.Units.find((o) => o.UnitType == targetType);
    if (unitInfo) {
      if (unitInfo.Description) {
        locStrings.push(Locale.compose(unitInfo.Description));
      }
    }
  } else if (targetKind == "KIND_TRADITION") {
    locStrings = getTraditionDescriptions(targetType);
  } else if (targetKind == "KIND_DIPLOMATIC_ACTION") {
    const diploActionInfo = GameInfo.DiplomacyActions.find((o) => o.DiplomacyActionType == targetType);
    if (diploActionInfo) {
      locStrings.push(Locale.compose(diploActionInfo.Description));
    }
  } else if (targetKind == "KIND_PROJECT") {
    const projectInfo = GameInfo.Projects.find((o) => o.ProjectType == targetType);
    if (projectInfo) {
      locStrings.push(Locale.compose(projectInfo.Description));
    }
  }
  return locStrings;
}
function getTraditionDescriptions(traditionType) {
  const descStrings = [];
  const traditionInfo = GameInfo.Traditions.lookup(traditionType);
  if (traditionInfo) {
    for (const modifier of GameInfo.TraditionModifiers) {
      if (modifier.TraditionType == traditionInfo.TraditionType) {
        const modifierDesc = getModifierTextByContext(modifier.ModifierId, "Description");
        if (modifierDesc) {
          descStrings.push(modifierDesc);
        }
      }
    }
    if (descStrings.length == 0) {
      if (traditionInfo.Description) {
        descStrings.push(Locale.compose(traditionInfo.Description));
      }
    }
  }
  return descStrings;
}
function getNodeName(nodeData, player, appendDepth = true) {
  const nodeType = nodeData.nodeType;
  const depth = appendDepth ? nodeData.depthUnlocked : 0;
  const name = getNodeNameFromType(nodeType, depth, player);
  return name;
}
function getNodeNameFromType(nodeType, depth = 0, player) {
  const def = GameInfo.ProgressionTreeNodes.lookup(nodeType);
  if (!def) return "";
  let name = "";
  if (def.CivInjectedName && player) {
    name = Locale.compose(def.CivInjectedName, player.civilizationAdjective ?? "");
  } else {
    name = Locale.compose(def.Name ?? "");
  }
  if (depth >= 1) {
    const numeral = Locale.toRomanNumeral(depth + 1);
    if (numeral) {
      name += " " + numeral;
    }
  }
  return name;
}
function getUnlockDepthPrefix(iCurDepth, iMaxDepth) {
  if (iMaxDepth <= 1) {
    return "";
  }
  return iCurDepth + 1 + "/" + iMaxDepth;
}

export { getNodeName, getNodeNameFromType, getTraditionDescriptions, getUnlockDepthPrefix, getUnlockTargetDescriptions, getUnlockTargetName };
//# sourceMappingURL=utilities-textprovider.js.map

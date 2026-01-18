import { g as getModifierTextByContext, c as composeConstructibleDescription } from '../../../core/ui/utilities/utilities-core-textprovider.chunk.js';
import { g as getConstructibleTagsFromType } from './utilities-tags.chunk.js';
import { Icon } from '../../../core/ui/utilities/utilities-image.chunk.js';

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
function getUnlockTargetIcon(targetType, targetKind) {
  if (targetKind == "KIND_CONSTRUCTIBLE") {
    const constructibleInfo = GameInfo.Constructibles.find((o) => o.ConstructibleType == targetType);
    if (constructibleInfo) {
      return Icon.getConstructibleIconFromDefinition(constructibleInfo);
    }
  }
  if (targetKind == "KIND_UNIT") {
    const unitInfo = GameInfo.Units.find((o) => o.UnitType == targetType);
    if (unitInfo) {
      return Icon.getUnitIconFromDefinition(unitInfo);
    }
  }
  if (targetKind == "KIND_DIPLOMATIC_ACTION") {
    const actionInfo = GameInfo.DiplomaticProjects_UI_Data.find((o) => o.DiplomacyActionType == targetType);
    let iconURL2 = UI.getIconURL(targetType);
    if (iconURL2 != "") {
      return iconURL2;
    }
    if (actionInfo) {
      switch (actionInfo.DiplomacyActionGroup) {
        case "DIPLOMACY_ACTION_GROUP_ESPIONAGE":
          iconURL2 = UI.getIcon("MOD_ESPIONAGE_UNLOCK");
          return iconURL2;
        default:
          break;
      }
    }
    iconURL2 = UI.getIcon(targetKind + "_UNLOCK");
    return iconURL2;
  }
  let iconURL = UI.getIcon(targetKind + "_UNLOCK");
  if (iconURL != "") {
    return iconURL;
  } else {
    iconURL = UI.getIconURL(targetType);
    if (iconURL != "") {
      return iconURL;
    }
  }
  if (targetKind == "KIND_MODIFIER") {
    return UI.getIconURL("MOD_GENERIC_BONUS");
  }
  console.warn("cannot get icon for unhandled targetType: ", targetType, ",  target kind: ", targetKind);
  return UI.getIconURL("MOD_GENERIC_BONUS");
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
function getNodeName(nodeData) {
  if (!nodeData) {
    return "";
  }
  const nodeInfo = GameInfo.ProgressionTreeNodes.lookup(nodeData.nodeType);
  if (!nodeInfo) {
    return "";
  }
  let nodeName = Locale.compose(nodeInfo.Name ?? nodeInfo.ProgressionTreeNodeType);
  if (nodeData.depthUnlocked >= 1) {
    const depthNumeral = Locale.toRomanNumeral(nodeData.depthUnlocked + 1);
    if (depthNumeral) {
      nodeName += " " + depthNumeral;
    }
  }
  return nodeName;
}
function getUnlockDepthPrefix(iCurDepth, iMaxDepth) {
  if (iMaxDepth <= 1) {
    return "";
  }
  return iCurDepth + 1 + "/" + iMaxDepth;
}

export { getUnlockTargetDescriptions as a, getUnlockTargetIcon as b, getNodeName as c, getUnlockTargetName as g };
//# sourceMappingURL=utilities-textprovider.chunk.js.map

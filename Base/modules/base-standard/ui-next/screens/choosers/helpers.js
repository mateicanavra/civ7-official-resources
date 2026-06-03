import { getModifierTextByContext, parseConstructibleAdjacencyNameOnly } from '../../../../core/ui/utilities/utilities-core-textprovider.js';
import { Icon } from '../../../../core/ui/utilities/utilities-image.js';
import { getConstructibleTagsFromType, ConstructibleHasTagType } from '../../../ui/utilities/utilities-tags.js';

function getUnlockTargetNameKey(targetType, targetKind) {
  if (targetKind === "KIND_MODIFIER") {
    const modInfo = GameInfo.Modifiers.find((o) => o.ModifierId === targetType);
    if (modInfo) {
      const modifierName = getModifierTextByContext(modInfo.ModifierId, "Name");
      return modifierName ?? "";
    }
  }
  if (targetKind === "KIND_CONSTRUCTIBLE") {
    const constructibleInfo = GameInfo.Constructibles.find((o) => o.ConstructibleType === targetType);
    if (constructibleInfo?.Name) {
      return constructibleInfo.Name;
    }
  }
  if (targetKind === "KIND_UNIT") {
    const unitInfo = GameInfo.Units.find((o) => o.UnitType === targetType);
    if (unitInfo?.Name) {
      return unitInfo.Name;
    }
  }
  if (targetKind === "KIND_TRADITION") {
    const traditionInfo = GameInfo.Traditions.find((o) => o.TraditionType === targetType);
    if (traditionInfo?.Name) {
      return traditionInfo.Name;
    }
  }
  if (targetKind === "KIND_DIPLOMATIC_ACTION") {
    const diploActionInfo = GameInfo.DiplomacyActions.find((o) => o.DiplomacyActionType === targetType);
    if (diploActionInfo?.Name) {
      return diploActionInfo.Name;
    }
  }
  if (targetKind === "KIND_PROJECT") {
    const projectInfo = GameInfo.Projects.find((o) => o.ProjectType === targetType);
    if (projectInfo?.Name) {
      return projectInfo.Name;
    }
  }
  return targetType;
}
function getUnlockTargetIconUrl(targetType, targetKind) {
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
  if (targetKind == "KIND_TRADITION") {
    let iconURL2 = UI.getIconURL(targetType);
    if (iconURL2 != "") {
      return iconURL2;
    }
    const TraditionInfo = GameInfo.Traditions.find((o) => o.TraditionType == targetType);
    if (TraditionInfo) {
      if (TraditionInfo.CultureSlotType == "TRADITION_CULTURE_SLOT") {
        iconURL2 = UI.getIcon("KIND_TRADITION_UNLOCK");
        if (iconURL2) return iconURL2;
      } else {
        iconURL2 = UI.getIcon("MOD_POLICY_UNLOCK");
        if (iconURL2) return iconURL2;
      }
    }
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
function collectConstructibleYields(constructibleType) {
  const yields = [];
  for (const entry of GameInfo.Constructible_YieldChanges) {
    if (entry.ConstructibleType === constructibleType) {
      yields.push({
        yieldType: entry.YieldType,
        amount: entry.YieldChange
      });
    }
  }
  return yields;
}
function buildAdjacencyListMarkup(entries) {
  const items = entries.map((def) => `[LI] ${parseConstructibleAdjacencyNameOnly(def)}`).join("");
  return `[BLIST]${items}[/BLIST]`;
}
function collectConstructibleAdjacencies(constructibleType) {
  const adjacencyDefinitions = [];
  for (const definition of GameInfo.Constructible_Adjacencies) {
    if (definition.ConstructibleType !== constructibleType) {
      continue;
    }
    const yieldChangeDef = GameInfo.Adjacency_YieldChanges.find((entry) => entry.ID === definition.YieldChangeId);
    if (yieldChangeDef) {
      if (!definition.RequiresActivation) {
        adjacencyDefinitions.push(yieldChangeDef);
      }
    }
  }
  if (adjacencyDefinitions.length === 0) {
    return [];
  }
  const groups = [];
  let counter = 0;
  for (const yieldDefinition of GameInfo.Yields) {
    const perChangeMap = /* @__PURE__ */ new Map();
    for (const changeDefinition of adjacencyDefinitions) {
      if (changeDefinition.YieldType !== yieldDefinition.YieldType) {
        continue;
      }
      const list = perChangeMap.get(changeDefinition.YieldChange);
      if (list) {
        list.push(changeDefinition);
      } else {
        perChangeMap.set(changeDefinition.YieldChange, [changeDefinition]);
      }
    }
    perChangeMap.forEach((definitions, value) => {
      const id = `${yieldDefinition.YieldType}-${value}-${counter}`;
      counter += 1;
      if (definitions.length <= 1) {
        groups.push({
          id,
          textKey: "LOC_UI_ADJACENCY_INFO_OBJECT",
          args: [
            value,
            `[icon:${yieldDefinition.YieldType}]`,
            parseConstructibleAdjacencyNameOnly(definitions[0])
          ]
        });
        return;
      }
      groups.push({
        id,
        textKey: "LOC_UI_ADJACENCY_INFO_GENERIC",
        args: [value, yieldDefinition.YieldType],
        listMarkup: buildAdjacencyListMarkup(definitions)
      });
    });
  }
  return groups;
}
function collectConstructibleModifiers(constructibleType) {
  const lines = [];
  for (const modifier of GameInfo.ConstructibleModifiers) {
    if (modifier.ConstructibleType === constructibleType) {
      const text = getModifierTextByContext(modifier.ModifierId, "Description");
      if (text) {
        lines.push({ text });
      }
    }
  }
  return lines;
}
function getConstructibleTooltip(constructibleType) {
  const def = GameInfo.Constructibles.lookup(constructibleType);
  if (def?.Tooltip) {
    return [{ text: def.Tooltip }];
  }
  return [];
}
function collectTraditionModifiers(traditionType) {
  const lines = [];
  const traditionInfo = GameInfo.Traditions.lookup(traditionType);
  if (traditionInfo) {
    for (const modifier of GameInfo.TraditionModifiers) {
      if (modifier.TraditionType === traditionInfo.TraditionType) {
        const modifierDesc = getModifierTextByContext(modifier.ModifierId, "Description");
        if (modifierDesc) {
          lines.push({ text: modifierDesc });
        }
      }
    }
    if (lines.length === 0 && traditionInfo.Description) {
      lines.push({ text: traditionInfo.Description });
    }
    if (traditionInfo.ObsoletesTraditionType) {
      const obsoleteTradition = GameInfo.Traditions.lookup(traditionInfo.ObsoletesTraditionType);
      if (obsoleteTradition) {
        lines.push({ text: Locale.compose("LOC_CIVIC_REPLACEMENT_NAME", obsoleteTradition.Name) });
      }
    }
  }
  return lines;
}
function getUnlockTargetDescriptionData(targetType, targetKind) {
  const result = {
    kind: targetKind,
    type: targetType,
    tags: [],
    yields: [],
    adjacencies: [],
    descriptionLines: []
  };
  if (targetKind === "KIND_MODIFIER") {
    const modInfo = GameInfo.Modifiers.find((o) => o.ModifierId === targetType);
    if (modInfo) {
      const modifierDesc = getModifierTextByContext(modInfo.ModifierId, "Description");
      if (modifierDesc) {
        result.descriptionLines.push({ text: modifierDesc });
      }
    }
  } else if (targetKind === "KIND_CONSTRUCTIBLE") {
    result.tags = getConstructibleTagsFromType(targetType);
    result.yields = collectConstructibleYields(targetType);
    result.adjacencies = collectConstructibleAdjacencies(targetType);
    result.descriptionLines = collectConstructibleModifiers(targetType);
    const tooltipLines = getConstructibleTooltip(targetType);
    if (tooltipLines.length > 0) {
      if (result.descriptionLines.length === 0) {
        result.descriptionLines.push(...tooltipLines);
      } else {
        for (const line of tooltipLines) {
          const isDuplicate = result.descriptionLines.some((d) => d.text === line.text);
          if (!isDuplicate) {
            result.descriptionLines.push(line);
          }
        }
      }
    }
    const playerUnits = Players.Units.get(GameContext.localPlayerID);
    if (playerUnits) {
      GameInfo.GreatPersonClasses.forEach((greatPersonClass) => {
        if (!greatPersonClass.ConstructibleType && !greatPersonClass.ConstructibleTag) return;
        if (greatPersonClass.ConstructibleType) {
          if (greatPersonClass.ConstructibleType !== targetType) return;
        }
        if (greatPersonClass.ConstructibleTag) {
          if (!ConstructibleHasTagType(targetType, greatPersonClass.ConstructibleTag)) return;
        }
        const greatPersonUnitDef = GameInfo.Units.lookup(greatPersonClass.UnitType);
        if (greatPersonUnitDef && playerUnits.canEverTrain(greatPersonClass.UnitType)) {
          const unitName = greatPersonUnitDef.Description ? `[TIP:${greatPersonUnitDef.Description}]{${greatPersonUnitDef.Name}}[/TIP]` : greatPersonUnitDef.Name;
          result.descriptionLines.push({
            text: Locale.compose(
              "LOC_UI_PRODUCTION_ALLOWS_TRAINING",
              greatPersonUnitDef.UnitType,
              unitName
            )
          });
        }
      });
    }
  } else if (targetKind === "KIND_UNIT") {
    const unitInfo = GameInfo.Units.find((o) => o.UnitType === targetType);
    if (unitInfo?.Description) {
      result.descriptionLines.push({ text: unitInfo.Description });
    }
  } else if (targetKind === "KIND_TRADITION") {
    result.descriptionLines = collectTraditionModifiers(targetType);
  } else if (targetKind === "KIND_DIPLOMATIC_ACTION") {
    const diploActionInfo = GameInfo.DiplomacyActions.find((o) => o.DiplomacyActionType === targetType);
    if (diploActionInfo?.Description) {
      result.descriptionLines.push({ text: diploActionInfo.Description });
    }
  } else if (targetKind === "KIND_PROJECT") {
    const projectInfo = GameInfo.Projects.find((o) => o.ProjectType === targetType);
    if (projectInfo?.Description) {
      result.descriptionLines.push({ text: projectInfo.Description });
    }
  }
  return result;
}
function hasUnlockContent(data) {
  return data.tags.length > 0 || data.yields.length > 0 || data.adjacencies.length > 0 || data.descriptionLines.length > 0;
}
function buildUnlockDisplayData(unlockInfo) {
  const nameKey = getUnlockTargetNameKey(unlockInfo.TargetType, unlockInfo.TargetKind);
  const icon = getUnlockTargetIconUrl(unlockInfo.TargetType, unlockInfo.TargetKind);
  const descriptionData = getUnlockTargetDescriptionData(unlockInfo.TargetType, unlockInfo.TargetKind);
  return {
    icon,
    nameKey,
    kind: unlockInfo.TargetKind,
    type: unlockInfo.TargetType,
    depth: unlockInfo.UnlockDepth,
    descriptionData
  };
}
function convertLegacyUnlock(legacyUnlock) {
  const descriptionData = getUnlockTargetDescriptionData(String(legacyUnlock.type), legacyUnlock.kind);
  return {
    icon: legacyUnlock.icon,
    nameKey: legacyUnlock.name,
    kind: legacyUnlock.kind,
    type: String(legacyUnlock.type),
    depth: legacyUnlock.depth,
    descriptionData
  };
}
function convertLegacyDepthInfo(legacyDepths) {
  return legacyDepths.map((depth) => ({
    header: depth.header,
    unlocks: depth.unlocks.map(convertLegacyUnlock),
    isCompleted: depth.isCompleted,
    isCurrent: depth.isCurrent,
    isLocked: depth.isLocked
  }));
}

export { buildUnlockDisplayData, convertLegacyDepthInfo, convertLegacyUnlock, getUnlockTargetDescriptionData, getUnlockTargetIconUrl, getUnlockTargetNameKey, hasUnlockContent };
//# sourceMappingURL=helpers.js.map

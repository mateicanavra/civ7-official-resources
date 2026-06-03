const cachedPlayerColors = /* @__PURE__ */ new Map();
var HighlightColors = /* @__PURE__ */ ((HighlightColors2) => {
  HighlightColors2[HighlightColors2["unitSelection"] = 4292584979] = "unitSelection";
  HighlightColors2[HighlightColors2["unitPossibleMovement"] = 4294967040] = "unitPossibleMovement";
  HighlightColors2[HighlightColors2["unitPossibleMovementShadow"] = 4291611648] = "unitPossibleMovementShadow";
  HighlightColors2[HighlightColors2["unitAttack"] = 4278198271] = "unitAttack";
  HighlightColors2[HighlightColors2["unitAttackShadow"] = 4278198237] = "unitAttackShadow";
  HighlightColors2[HighlightColors2["unitMovementZOC"] = 4278190335] = "unitMovementZOC";
  HighlightColors2[HighlightColors2["unitMovementZOCShadow"] = 0] = "unitMovementZOCShadow";
  HighlightColors2[HighlightColors2["unitCommanderRadius"] = 4294967295] = "unitCommanderRadius";
  return HighlightColors2;
})(HighlightColors || {});
const numberHexToStringRGB = (hex) => {
  return `rgb(${hex >> 0 & 255},${hex >> 8 & 255},${hex >> 16 & 255})`;
};
const applyPlayerColorsToElement = (element, playerId) => {
  let colorVariants = cachedPlayerColors.get(playerId);
  if (colorVariants == void 0) {
    const playerColor = UI.Color.getPlayerColors(playerId);
    if (playerColor) {
      colorVariants = UI.Color.createPlayerColorVariants(playerColor);
      cachedPlayerColors.set(playerId, colorVariants);
    } else {
      console.warn(`Unable to get player color for an element using playerID "${playerId}".`);
      return;
    }
  }
  element.style.setProperty("--player-color-primary", colorVariants.primaryColor.mainColor);
  element.style.setProperty("--player-color-primary-more", colorVariants.primaryColor.moreColor);
  element.style.setProperty("--player-color-primary-text", colorVariants.primaryColor.textColor);
  element.style.setProperty("--player-color-primary-accent", colorVariants.primaryColor.accentColor);
  element.style.setProperty("--player-color-secondary", colorVariants.secondaryColor.mainColor);
  element.style.setProperty("--player-color-secondary-more", colorVariants.secondaryColor.moreColor);
  element.style.setProperty("--player-color-secondary-text", colorVariants.secondaryColor.textColor);
  element.style.setProperty("--player-color-secondary-accent", colorVariants.secondaryColor.accentColor);
  element.classList.toggle("primary-color-is-lighter", colorVariants.isPrimaryLighter);
};
const colorVariantsByPlayer = /* @__PURE__ */ new Map();
const getPlayerColorVariants = (playerId) => {
  let variants = colorVariantsByPlayer.get(playerId);
  if (!variants) {
    const playerColor = UI.Color.getPlayerColors(playerId);
    if (!playerColor) {
      console.warn(
        `Unable to get player color for playerID "${playerId}". Defaulting to false for isPrimaryColorLighter.`
      );
      return void 0;
    }
    variants = UI.Color.createPlayerColorVariants(playerColor);
    colorVariantsByPlayer.set(playerId, variants);
  }
  return variants;
};
const isPrimaryColorLighter = (playerId) => {
  const variants = getPlayerColorVariants(playerId);
  if (!variants) {
    return false;
  }
  return variants.isPrimaryLighter;
};
const HexToFloat4 = (hex, alpha = 1) => {
  const r = hex >> 16 & 255;
  const g = hex >> 8 & 255;
  const b = hex & 255;
  return { x: r / 255, y: g / 255, z: b / 255, w: Math.min(1, Math.max(0, alpha)) };
};
const ObjectToRgbaString = (object) => {
  return `rgba(${object.r}, ${object.g}, ${object.b}, ${object.a})`;
};
const RGBAToString = (rgba) => {
  return ObjectToRgbaString({ r: rgba.r, g: rgba.g, b: rgba.b, a: rgba.a });
};

export { HexToFloat4, HighlightColors, ObjectToRgbaString, RGBAToString, applyPlayerColorsToElement, getPlayerColorVariants, isPrimaryColorLighter, numberHexToStringRGB };
//# sourceMappingURL=utilities-color.js.map

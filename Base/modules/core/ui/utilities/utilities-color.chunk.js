import { u as utils } from '../graph-layout/utils.chunk.js';
import { Icon } from './utilities-image.chunk.js';

var HighlightColors = /* @__PURE__ */ ((HighlightColors2) => {
  HighlightColors2[HighlightColors2["unitSelection"] = 4292584979] = "unitSelection";
  HighlightColors2[HighlightColors2["unitPossibleMovement"] = 4291206161] = "unitPossibleMovement";
  HighlightColors2[HighlightColors2["unitAttack"] = 4281147135] = "unitAttack";
  HighlightColors2[HighlightColors2["unitMovementZOC"] = 4278249983] = "unitMovementZOC";
  return HighlightColors2;
})(HighlightColors || {});
class PlayerColors {
  // Color offsets for calculating color variations
  // Factor to offset the accent colors by
  static accentOffset = 0.416;
  // Factor to offset the text colors by
  static textOffset = 0.666;
  // Offset to increase the color's direction (darker dark color or lighter light color)
  static moreOffset = 0.25;
  // Offset to decrease the color's direction (lighter dark color or darker light color)
  static lessOffset = 0.25;
  // Tint offsets for fxs-color-tint version of color (dark needs more brightness to compensate)
  static darkTintOffset = -0.5;
  static lightTintOffset = 0.167;
  // White point
  static whiteColor = { r: 255, g: 255, b: 255, a: 1 };
  // Black point
  static blackColor = { r: 0, g: 0, b: 0, a: 1 };
  /**
   * Converts an rgb string color to RGB
   * @param {string} color Must be format 'rgb(R,G,B)'
   */
  static stringRGBtoRGB(color) {
    if (color.substring(0, 3) != "rgb") {
      console.error("Input color for stringRGBtoRGB is not in format 'rgb(R,G,B)'");
      return { r: 0, g: 0, b: 0, a: 1 };
    }
    const br = !isNaN(parseInt(color.charAt(0))) ? 0 : 4;
    const sep = color.indexOf(",") > -1 ? "," : " ";
    const rgb = color.substr(br).split(")")[0].split(sep).map(Number);
    const sRGB = { r: rgb[0], g: rgb[1], b: rgb[2], a: 1 };
    return sRGB;
  }
  /**
   * Converts an rgb string color to HSL
   * @param {string} color Must be format 'rgb(R,G,B)'
   */
  static stringRGBtoHSL(color) {
    const rgb = this.stringRGBtoRGB(color);
    const hsl = Color.convertToHSL(rgb);
    return hsl;
  }
  /**
   * Converts an SRGBColor to an rgb string
   * @param {SRGBColor} srgb The HSLColor to convert
   */
  static SRGBtoString(srgb) {
    return `rgb(${srgb.r}, ${srgb.g}, ${srgb.b})`;
  }
  /**
   * Finds an accent variant of two blended SRGBColors, given an offset
   * @param {SRGBColor} priColor The primary color
   * @param {SRGBColor} secColor The secondary color
   * @param {number} offset The offset
   */
  static findVariantSRGBColor(priColor, secColor, offset) {
    const newColor = {
      r: utils.clamp(Math.round(priColor.r + offset * (secColor.r - priColor.r)), 0, 255),
      g: utils.clamp(Math.round(priColor.g + offset * (secColor.g - priColor.g)), 0, 255),
      b: utils.clamp(Math.round(priColor.b + offset * (secColor.b - priColor.b)), 0, 255),
      a: (priColor.a + secColor.a) * 0.5
    };
    return newColor;
  }
  /**
   * Creates color variations based on the two provided colors
   * @param {string} priColor The primary player color
   * @param {string} secColor The secondary player color
   */
  static createPlayerColorVariants(priColor, secColor) {
    const priRGB = this.stringRGBtoRGB(priColor);
    const secRGB = this.stringRGBtoRGB(secColor);
    const priHSL = this.stringRGBtoHSL(priColor);
    const secHSL = this.stringRGBtoHSL(secColor);
    const priColorIsLighter = priHSL.l >= secHSL.l;
    const newColors = {
      primaryColor: {
        mainColor: priColor,
        textColor: this.SRGBtoString(
          this.findVariantSRGBColor(
            priRGB,
            priColorIsLighter ? this.whiteColor : this.blackColor,
            this.textOffset
          )
        ),
        accentColor: this.SRGBtoString(this.findVariantSRGBColor(priRGB, secRGB, this.accentOffset)),
        moreColor: this.SRGBtoString(
          this.findVariantSRGBColor(
            priRGB,
            priColorIsLighter ? this.whiteColor : this.blackColor,
            this.moreOffset
          )
        ),
        lessColor: this.SRGBtoString(this.findVariantSRGBColor(priRGB, secRGB, this.lessOffset)),
        tintColor: this.SRGBtoString(
          this.findVariantSRGBColor(
            priRGB,
            priColorIsLighter ? this.whiteColor : this.blackColor,
            priColorIsLighter ? this.lightTintOffset : this.darkTintOffset
          )
        )
      },
      secondaryColor: {
        mainColor: secColor,
        textColor: this.SRGBtoString(
          this.findVariantSRGBColor(
            secRGB,
            !priColorIsLighter ? this.whiteColor : this.blackColor,
            this.textOffset
          )
        ),
        accentColor: this.SRGBtoString(this.findVariantSRGBColor(secRGB, priRGB, this.accentOffset)),
        moreColor: this.SRGBtoString(
          this.findVariantSRGBColor(
            secRGB,
            !priColorIsLighter ? this.whiteColor : this.blackColor,
            this.moreOffset
          )
        ),
        lessColor: this.SRGBtoString(this.findVariantSRGBColor(secRGB, priRGB, this.lessOffset)),
        tintColor: this.SRGBtoString(
          this.findVariantSRGBColor(
            secRGB,
            !priColorIsLighter ? this.whiteColor : this.blackColor,
            !priColorIsLighter ? this.lightTintOffset : this.darkTintOffset
          )
        )
      },
      isPrimaryLighter: priColorIsLighter
    };
    return newColors;
  }
}
const numberHexToStringRGB = (hex) => {
  return `rgb(${hex >> 0 & 255},${hex >> 8 & 255},${hex >> 16 & 255})`;
};
const realizePlayerColors = (element, playerId) => {
  const playerColor = UI.Color.getPlayerColors(playerId);
  if (playerColor) {
    const colorVariants = UI.Color.createPlayerColorVariants(playerColor);
    element.style.setProperty("--player-color-primary", colorVariants.primaryColor.mainColor);
    element.style.setProperty("--player-color-primary-more", colorVariants.primaryColor.moreColor);
    element.style.setProperty("--player-color-primary-text", colorVariants.primaryColor.textColor);
    element.style.setProperty("--player-color-primary-less", colorVariants.primaryColor.lessColor);
    element.style.setProperty("--player-color-primary-accent", colorVariants.primaryColor.accentColor);
    element.style.setProperty("--player-color-secondary", colorVariants.secondaryColor.mainColor);
    element.style.setProperty("--player-color-secondary-more", colorVariants.secondaryColor.moreColor);
    element.style.setProperty("--player-color-secondary-less", colorVariants.secondaryColor.lessColor);
    element.style.setProperty("--player-color-secondary-text", colorVariants.secondaryColor.textColor);
    element.style.setProperty("--player-color-secondary-accent", colorVariants.secondaryColor.accentColor);
    element.classList.toggle("primary-color-is-lighter", colorVariants.isPrimaryLighter);
  }
};
const getPlayerColorValues = (playerId) => {
  let playerColorValues = "";
  const playerColor = UI.Color.getPlayerColors(playerId);
  if (playerColor) {
    const colorVariants = UI.Color.createPlayerColorVariants(playerColor);
    playerColorValues = `
		--player-color-primary: ${colorVariants.primaryColor.mainColor};
		--player-color-primary-more: ${colorVariants.primaryColor.moreColor};
		--player-color-primary-text: ${colorVariants.primaryColor.textColor};
		--player-color-primary-less: ${colorVariants.primaryColor.lessColor};
		--player-color-primary-accent: ${colorVariants.primaryColor.accentColor};

		--player-color-secondary: ${colorVariants.secondaryColor.mainColor};
		--player-color-secondary-more: ${colorVariants.secondaryColor.moreColor};
		--player-color-secondary-text: ${colorVariants.secondaryColor.textColor};
		--player-color-secondary-less: ${colorVariants.secondaryColor.lessColor};
		--player-color-secondary-accent: ${colorVariants.secondaryColor.accentColor};`;
  }
  return playerColorValues;
};
const isPrimaryColorLighter = (playerId) => {
  const playerColor = UI.Color.getPlayerColors(playerId);
  if (!playerColor) {
    return false;
  }
  const colorVariants = UI.Color.createPlayerColorVariants(playerColor);
  return colorVariants.isPrimaryLighter;
};
const realizeCivHeraldry = (element, playerId) => {
  const localPlayer = Players.get(playerId);
  realizePlayerColors(element, playerId);
  if (localPlayer) {
    element.style.setProperty(
      "--civ-pattern",
      Icon.getCivLineCSSFromCivilizationType(localPlayer.civilizationType)
    );
    element.style.setProperty(
      "--civ-symbol",
      Icon.getCivSymbolCSSFromCivilizationType(localPlayer.civilizationType)
    );
  }
};

export { HighlightColors as H, realizePlayerColors as a, getPlayerColorValues as g, isPrimaryColorLighter as i, numberHexToStringRGB as n, realizeCivHeraldry as r };
//# sourceMappingURL=utilities-color.chunk.js.map

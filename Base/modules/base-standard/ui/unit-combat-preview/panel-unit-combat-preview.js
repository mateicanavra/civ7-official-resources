import Cursor from '../../../core/ui/input/cursor.js';
import { PlotCursorUpdatedEventName, PlotCursor } from '../../../core/ui/input/plot-cursor.js';
import { C as ComponentID } from '../../../core/ui/utilities/utilities-component-id.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { Icon } from '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/panel-support.chunk.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';

const content = "<div class=\"main-container\">\r\n\t<div\r\n\t\tclass=\"preview-modifier-container\"\r\n\t\tid=\"attacker-modifier-container\"\r\n\t>\r\n\t\t<div\r\n\t\t\tclass=\"preview-modifier-info\"\r\n\t\t\tid=\"attacker-modifier-info\"\r\n\t\t></div>\r\n\t</div>\r\n\t<div\r\n\t\tclass=\"preview-modifier-container preview-modifier-right\"\r\n\t\tid=\"target-modifier-container\"\r\n\t>\r\n\t\t<div\r\n\t\t\tclass=\"preview-modifier-info\"\r\n\t\t\tid=\"target-modifier-info\"\r\n\t\t></div>\r\n\t</div>\r\n\t<div class=\"preview-header\">\r\n\t\t<div class=\"preview-outcome\">\r\n\t\t\t<div class=\"preview-outcome-color-bg\">\r\n\t\t\t\t<div class=\"preview-outcome-label\">\r\n\t\t\t\t\t<div\r\n\t\t\t\t\t\tclass=\"preview-outcome-text font-title\"\r\n\t\t\t\t\t\tid=\"outcome-label\"\r\n\t\t\t\t\t></div>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t\t<div class=\"preview-bg\">\r\n\t\t\t<div class=\"preview-vs-label font-title\">VS</div>\r\n\t\t\t<div class=\"preview-health-meter-container\">\r\n\t\t\t\t<div class=\"preview-health-meter\">\r\n\t\t\t\t\t<div class=\"preview-max-health\">\r\n\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\tclass=\"preview-actual-health\"\r\n\t\t\t\t\t\t\tid=\"attacker-health\"\r\n\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\tclass=\"preview-simulated-health\"\r\n\t\t\t\t\t\t\tid=\"attacker-simulated-health\"\r\n\t\t\t\t\t\t></div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class=\"preview-health-meter preview-health-right\">\r\n\t\t\t\t\t<div class=\"preview-max-health\">\r\n\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\tclass=\"preview-actual-health\"\r\n\t\t\t\t\t\t\tid=\"target-health\"\r\n\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\tclass=\"preview-simulated-health\"\r\n\t\t\t\t\t\t\tid=\"target-simulated-health\"\r\n\t\t\t\t\t\t></div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t\t<div class=\"preview-leader-icon-container\">\r\n\t\t\t<div class=\"preview-leader-icon\">\r\n\t\t\t\t<div class=\"preview-hex-bg\"></div>\r\n\t\t\t\t<fxs-icon\r\n\t\t\t\t\tclass=\"preview-icon-img\"\r\n\t\t\t\t\tid=\"attacker-leader-icon\"\r\n\t\t\t\t></fxs-icon>\r\n\t\t\t</div>\r\n\t\t\t<div class=\"preview-leader-icon preview-leader-right\">\r\n\t\t\t\t<div class=\"preview-hex-bg preview-hex-target\"></div>\r\n\t\t\t\t<fxs-icon\r\n\t\t\t\t\tclass=\"preview-icon-img\"\r\n\t\t\t\t\tid=\"target-leader-icon\"\r\n\t\t\t\t></fxs-icon>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t\t<div class=\"preview-banner-container\">\r\n\t\t\t<div class=\"combat-preview__banner-rod-left\"></div>\r\n\t\t\t<div class=\"combat-preview__banner-rod-right\"></div>\r\n\t\t\t<div class=\"combat-preview__banner-rod-dot\"></div>\r\n\t\t\t<div class=\"preview-banner\">\r\n\t\t\t\t<div class=\"preview-banner-bg\">\r\n\t\t\t\t\t<div class=\"preview-banner-bars\"></div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class=\"preview-banner-stat-container\">\r\n\t\t\t\t\t<fxs-icon\r\n\t\t\t\t\t\tclass=\"size-8 border-2 rounded-full preview-unit-icon\"\r\n\t\t\t\t\t\tid=\"attacker-unit-icon\"\r\n\t\t\t\t\t></fxs-icon>\r\n\t\t\t\t\t<img\r\n\t\t\t\t\t\tclass=\"preview-stat-icon\"\r\n\t\t\t\t\t\tid=\"attacker-stats-icon\"\r\n\t\t\t\t\t/>\r\n\t\t\t\t\t<div\r\n\t\t\t\t\t\tclass=\"preview-stat-number font-body\"\r\n\t\t\t\t\t\tid=\"attacker-stats-string\"\r\n\t\t\t\t\t></div>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t\t<div class=\"preview-banner preview-banner-right\">\r\n\t\t\t\t<div class=\"preview-banner-bg\">\r\n\t\t\t\t\t<div class=\"preview-banner-bars\"></div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class=\"preview-banner-stat-container\">\r\n\t\t\t\t\t<fxs-icon\r\n\t\t\t\t\t\tclass=\"size-8 border-2 rounded-full preview-unit-icon preview-unit-icon-right\"\r\n\t\t\t\t\t\tid=\"target-unit-icon\"\r\n\t\t\t\t\t></fxs-icon>\r\n\t\t\t\t\t<img\r\n\t\t\t\t\t\tclass=\"preview-stat-icon\"\r\n\t\t\t\t\t\tid=\"target-stats-icon\"\r\n\t\t\t\t\t/>\r\n\t\t\t\t\t<div\r\n\t\t\t\t\t\tclass=\"preview-stat-number\"\r\n\t\t\t\t\t\tid=\"target-stats-string\"\r\n\t\t\t\t\t></div>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t</div>\r\n</div>\r\n";

const styles = "fs://game/base-standard/ui/unit-combat-preview/panel-unit-combat-preview.css";

class PanelUnitCombatPreview extends Component {
  plotCursorCoordsUpdatedListener = this.onPlotCursorCoordsUpdated.bind(this);
  queryCombatID = ComponentID.getInvalidID();
  location = null;
  selectedUnitID = ComponentID.getInvalidID();
  targetID = ComponentID.getInvalidID();
  // If we add more target types swap this for an enum
  isTargetDistrict = false;
  isRangedAttacking = false;
  attackerUnitIcon;
  attackerHealth;
  attackerSimulatedHealth;
  attackerStatsString;
  attackerStatsIcon;
  attackerLeaderIcon;
  attackerModifierContainer;
  attackerModifierInfo;
  targetUnitIcon;
  targetHealth;
  targetSimulatedHealth;
  targetStatsString;
  targetStatsIcon;
  targetLeaderIcon;
  targetModifierContainer;
  targetModifierInfo;
  outcomeLabel;
  outcomeColorBottom;
  outcomeColorTop;
  rangedAttackStartedEventListener = this.onRangedAttackStarted.bind(this);
  rangedAttackFinishedEventListener = this.onRangedAttackFinished.bind(this);
  onInitialize() {
    this.attackerUnitIcon = document.getElementById("attacker-unit-icon");
    this.attackerHealth = document.getElementById("attacker-health");
    this.attackerSimulatedHealth = document.getElementById("attacker-simulated-health");
    this.attackerStatsString = document.getElementById("attacker-stats-string");
    this.attackerStatsIcon = document.getElementById("attacker-stats-icon");
    this.attackerLeaderIcon = document.getElementById("attacker-leader-icon");
    this.attackerModifierContainer = document.getElementById("attacker-modifier-container");
    this.attackerModifierInfo = document.getElementById("attacker-modifier-info");
    this.targetUnitIcon = document.getElementById("target-unit-icon");
    this.targetHealth = document.getElementById("target-health");
    this.targetSimulatedHealth = document.getElementById("target-simulated-health");
    this.targetStatsString = document.getElementById("target-stats-string");
    this.targetStatsIcon = document.getElementById("target-stats-icon");
    this.targetLeaderIcon = document.getElementById("target-leader-icon");
    this.targetModifierContainer = document.getElementById("target-modifier-container");
    this.targetModifierInfo = document.getElementById("target-modifier-info");
    this.outcomeLabel = document.getElementById("outcome-label");
    this.outcomeColorBottom = MustGetElement(".preview-outcome", this.Root);
    this.outcomeColorTop = MustGetElement(".preview-outcome-color-bg", this.Root);
    this.Root.setAttribute("data-audio-group-ref", "interact-unit");
  }
  onAttach() {
    super.onAttach();
    engine.on("UnitSelectionChanged", this.onUnitSelectionChanged, this);
    engine.on("UnitRemovedFromMap", this.onUnitRemovedFromMap, this);
    engine.on("UnitMoveComplete", this.onUnitMoveComplete, this);
    engine.on("SimulateCombatResult", this.onSimulateCombatResult, this);
    engine.on("Combat", this.onCombat, this);
    window.addEventListener("ranged-attack-started", this.rangedAttackStartedEventListener);
    window.addEventListener("ranged-attack-finished", this.rangedAttackFinishedEventListener);
    window.addEventListener(PlotCursorUpdatedEventName, this.plotCursorCoordsUpdatedListener);
  }
  onDetach() {
    UI.lockCursor(false);
    engine.off("UnitSelectionChanged", this.onUnitSelectionChanged, this);
    engine.off("UnitRemovedFromMap", this.onUnitRemovedFromMap, this);
    engine.off("UnitMoveComplete", this.onUnitMoveComplete, this);
    engine.off("SimulateCombatResult", this.onSimulateCombatResult, this);
    engine.off("Combat", this.onCombat, this);
    window.removeEventListener("ranged-attack-started", this.rangedAttackStartedEventListener);
    window.removeEventListener("ranged-attack-finished", this.rangedAttackFinishedEventListener);
    window.removeEventListener(PlotCursorUpdatedEventName, this.plotCursorCoordsUpdatedListener);
    super.onDetach();
  }
  onUpdate() {
    const wasEnemyHovered = ComponentID.isValid(this.targetID);
    const previousTargetID = this.targetID;
    this.targetID = this.getTargetAtCursor();
    const isEnemyHovered = ComponentID.isValid(this.targetID);
    if (isEnemyHovered && (!wasEnemyHovered || !ComponentID.isMatch(previousTargetID, this.targetID))) {
      this.Root.classList.toggle("quick", wasEnemyHovered);
      this.Root.classList.remove("visible");
      this.Root.classList.add("hidden");
      this.realizeCombatPreview();
    } else {
      this.Root.classList.toggle("quick", false);
      if (this.Root.classList.contains("visible")) {
        this.removeCombatPreview();
      }
    }
  }
  onPlotCursorCoordsUpdated(_event) {
    this.onUpdate();
  }
  /**
   * Obtain a target at the location focused by the cursor
   * @returns {ComponentID} CID of the enemy target at this location or Invalid otherwise
   */
  getTargetAtCursor() {
    if (ComponentID.isInvalid(this.selectedUnitID)) {
      return ComponentID.getInvalidID();
    }
    if (Cursor.isOnUI && !Camera.isWorldDragging) {
      return ComponentID.getInvalidID();
    }
    const plotLocation = PlotCursor.plotCursorCoords;
    if (plotLocation == null) {
      this.location = plotLocation;
      return ComponentID.getInvalidID();
    }
    const revealedState = GameplayMap.getRevealedState(
      GameContext.localPlayerID,
      plotLocation.x,
      plotLocation.y
    );
    if (revealedState != RevealedStates.VISIBLE) {
      this.location = plotLocation;
      return ComponentID.getInvalidID();
    }
    if (this.location == null || this.location.x != plotLocation.x || this.location.y != plotLocation.y) {
      this.location = plotLocation;
      const defendingDistrictID = Game.Combat.getDefensibleDistrict(this.location);
      if (ComponentID.isValid(defendingDistrictID)) {
        this.isTargetDistrict = true;
        return defendingDistrictID;
      } else {
        const defendingUnitID = Game.Combat.getBestDefender(this.location, this.selectedUnitID);
        this.isTargetDistrict = false;
        return defendingUnitID;
      }
    }
    return this.targetID;
  }
  removeCombatPreview() {
    UI.lockCursor(false);
    window.dispatchEvent(new CustomEvent("combat-preview-hidden"));
    WorldAnchors.ClearWorldUnitsSelectedUnitTargeting();
    this.Root.classList.remove("visible");
    this.Root.classList.add("hidden");
  }
  realizeCombatPreview() {
    const attackingUnit = Units.get(this.selectedUnitID);
    if (attackingUnit == null) {
      console.error(
        "panel-unit-combat-preview: unable to get unit with selectedUnitID during realizeCombatPreview()"
      );
      return;
    }
    const attackingUnitCombat = attackingUnit.Combat;
    if (!attackingUnitCombat) {
      console.error(
        "panel-unit-combat-preview, realizeCombatPreview(): unable to get attackingUnitCombat during realizeCombatPreview()"
      );
      return;
    }
    if (!attackingUnitCombat.isCombat) {
      return;
    }
    if (!attackingUnitCombat.canAttack) {
      return;
    }
    let combatType = CombatTypes.NO_COMBAT;
    if (this.isRangedAttacking) {
      combatType = CombatTypes.COMBAT_RANGED;
    }
    const args = {
      Location: this.location,
      X: this.location?.x,
      Y: this.location?.y,
      CombatType: combatType
    };
    this.queryCombatID = Game.Combat.simulateAttackAsync(attackingUnit.id, args);
  }
  onSimulateCombatResult(results) {
    if (ComponentID.isMatch(results?.QueryToken, this.queryCombatID) == false) return;
    if (results?.Attacker == void 0) {
      this.removeCombatPreview();
      return;
    }
    const attackingUnit = Units.get(results.Attacker.ID);
    if (attackingUnit == null) {
      console.error("panel-unit-combat-preview: unable to get attacking unit from combat results");
      this.removeCombatPreview();
      return;
    }
    const targetData = {
      name: "",
      maxHitPoints: -1,
      currentHealth: 1,
      damage: -1,
      owner: null
    };
    const targetDistrict = Districts.get(results.Defender.ID);
    if (targetDistrict != null) {
      targetData.name = Locale.compose("LOC_UI_CITY_DISTRICT_NAME");
      targetData.owner = targetDistrict.owner;
      const districtHealth = Players.get(targetDistrict.owner)?.Districts?.getDistrictHealth(
        results.Location
      );
      if (districtHealth) {
        targetData.currentHealth = districtHealth;
      } else {
        targetData.currentHealth = -1;
      }
    } else {
      const targetUnit = Units.get(results.Defender.ID);
      if (targetUnit != null) {
        targetData.name = targetUnit.name;
        targetData.owner = targetUnit.owner;
        targetData.currentHealth = targetUnit.Health ? targetUnit.Health.maxDamage - targetUnit.Health.damage : -1;
      }
    }
    if (targetData.owner == null) {
      console.error("panel-unit-combat-preview, realizeCombatPreview(): unable to get target object");
      return;
    }
    targetData.maxHitPoints = results.Defender.MaxHitPoints;
    targetData.damage = results.Defender.DamageTo;
    const combatType = results.CombatType;
    const attackerStrengthType = results.Attacker.CombatStrengthType;
    if (attackerStrengthType != null) {
      if (attackerStrengthType == CombatStrengthTypes.STRENGTH_MELEE) {
        if (this.attackerStatsIcon != void 0) {
          this.attackerStatsIcon.src = "blp:Action_Attack.png";
        }
      } else if (attackerStrengthType == CombatStrengthTypes.STRENGTH_RANGED) {
        if (this.attackerStatsIcon != void 0) {
          this.attackerStatsIcon.src = "blp:Action_Ranged.png";
        }
      } else if (attackerStrengthType == CombatStrengthTypes.STRENGTH_BOMBARD) {
        if (this.attackerStatsIcon != void 0) {
          this.attackerStatsIcon.src = "blp:Action_Bombard.png";
        }
      } else {
        if (this.attackerStatsIcon != void 0) {
          this.attackerStatsIcon.src = "blp:Action_Defend.png";
        }
      }
      this.playSound("data-audio-unit-combat-hovered");
    }
    this.attackerStatsString.innerHTML = (results.Attacker.CombatStrength + results.Attacker.StrengthModifier).toString();
    this.updateCombatMods(
      Locale.compose(attackingUnit.name),
      results.Attacker,
      this.attackerModifierContainer,
      this.attackerModifierInfo
    );
    const attackingUnitHealth = attackingUnit.Health;
    if (!attackingUnitHealth) {
      console.error("panel-unit-combat-preview, realizeCombatPreview(): unable to get attackingUnitHealth");
      return;
    }
    const attackerHealthPercentage = (attackingUnitHealth.maxDamage - attackingUnitHealth.damage) / attackingUnitHealth.maxDamage * 100;
    this.attackerHealth.style.height = attackerHealthPercentage.toString() + "%";
    let attackerSimulatedHealthPercentage = (attackingUnitHealth.maxDamage - attackingUnitHealth.damage - results.Attacker.DamageTo) / attackingUnitHealth.maxDamage * 100;
    if (attackerSimulatedHealthPercentage < 0) {
      attackerSimulatedHealthPercentage = 0;
    }
    this.attackerSimulatedHealth.style.height = attackerSimulatedHealthPercentage.toString() + "%";
    const attackerUnitDefinition = GameInfo.Units.lookup(attackingUnit.type);
    if (attackerUnitDefinition) {
      this.attackerUnitIcon.setAttribute("data-icon-id", attackerUnitDefinition.UnitType);
    }
    const attackingPlayer = Players.get(attackingUnit.owner);
    if (attackingPlayer) {
      const leader = GameInfo.Leaders.lookup(attackingPlayer.leaderType);
      const attackerLeaderIconSrc = Icon.getLeaderPortraitIcon(attackingPlayer.leaderType, 32);
      if (attackerLeaderIconSrc) {
        this.attackerLeaderIcon.setAttribute("data-icon-id", leader.LeaderType);
      }
    }
    const attackerPrimaryColor = UI.Player.getPrimaryColorValueAsString(attackingUnit.owner);
    const attackerSecondaryColor = UI.Player.getSecondaryColorValueAsString(attackingUnit.owner);
    if (attackerPrimaryColor && attackerSecondaryColor) {
      this.Root.style.setProperty("--attacker-color-primary", attackerPrimaryColor);
      this.Root.style.setProperty("--attacker-color-secondary", attackerSecondaryColor);
    }
    const defenderStrengthType = results.Defender.CombatStrengthType;
    if (defenderStrengthType != null) {
      if (defenderStrengthType == CombatStrengthTypes.STRENGTH_MELEE) {
        if (this.targetStatsIcon != void 0) {
          this.targetStatsIcon.src = "blp:Action_Attack.png";
        }
      } else if (defenderStrengthType == CombatStrengthTypes.STRENGTH_RANGED) {
        if (this.targetStatsIcon != void 0) {
          this.targetStatsIcon.src = "blp:Action_Ranged.png";
        }
      } else if (defenderStrengthType == CombatStrengthTypes.STRENGTH_BOMBARD) {
        if (this.targetStatsIcon != void 0) {
          this.targetStatsIcon.src = "blp:game/Action_Bombard.png";
        }
      } else {
        if (this.targetStatsIcon != void 0) {
          this.targetStatsIcon.src = "blp:game/Action_Defend.png";
        }
      }
    }
    this.targetStatsString.innerHTML = (results.Defender.CombatStrength + results.Defender.StrengthModifier).toString();
    this.updateCombatMods(
      Locale.compose(targetData.name),
      results.Defender,
      this.targetModifierContainer,
      this.targetModifierInfo
    );
    const targetHealthPercentage = targetData.currentHealth / targetData.maxHitPoints * 100;
    this.targetHealth.style.height = targetHealthPercentage.toString() + "%";
    let targetSimulatedHealthPercentage = (targetData.currentHealth - targetData.damage) / targetData.maxHitPoints * 100;
    if (targetSimulatedHealthPercentage < 0) {
      targetSimulatedHealthPercentage = 0;
    }
    this.targetSimulatedHealth.style.height = targetSimulatedHealthPercentage.toString() + "%";
    if (this.isTargetDistrict) {
      this.targetUnitIcon.setAttribute("data-icon-id", "UNIT_CITY_DISTRICT");
    } else {
      const targetUnit = Units.get(this.targetID);
      if (targetUnit) {
        const targetUnitDefinition = GameInfo.Units.lookup(targetUnit.type);
        if (targetUnitDefinition) {
          this.targetUnitIcon.setAttribute("data-icon-id", targetUnitDefinition.UnitType);
        }
      }
    }
    const targetPlayer = Players.get(targetData.owner);
    if (targetPlayer) {
      const leader = GameInfo.Leaders.lookup(targetPlayer.leaderType);
      if (leader) {
        const targetLeaderIconSrc = UI.getIconURL(leader.LeaderType, "LEADER");
        if (targetLeaderIconSrc) {
          this.targetLeaderIcon.setAttribute("data-icon-id", leader.LeaderType);
        }
      }
    }
    const targetPrimaryColor = UI.Player.getPrimaryColorValueAsString(targetData.owner);
    const targetSecondaryColor = UI.Player.getSecondaryColorValueAsString(targetData.owner);
    if (targetPrimaryColor && targetSecondaryColor) {
      this.Root.style.setProperty("--target-color-primary", targetPrimaryColor);
      this.Root.style.setProperty("--target-color-secondary", targetSecondaryColor);
    }
    let victoryType = "victory";
    if (combatType == CombatTypes.COMBAT_RANGED) {
      if (results.Defender.DamageTo >= results.Defender.MaxHitPoints) {
        this.outcomeLabel.innerHTML = Locale.compose("LOC_COMBAT_PREVIEW_DECISIVE_VICTORY");
      } else {
        if (results.Defender.DamageTo / results.Defender.MaxHitPoints <= 0.24) {
          this.outcomeLabel.innerHTML = Locale.compose("LOC_COMBAT_PREVIEW_MINOR_VICTORY");
        } else {
          this.outcomeLabel.innerHTML = Locale.compose("LOC_COMBAT_PREVIEW_MAJOR_VICTORY");
        }
      }
    } else if (combatType == CombatTypes.COMBAT_MELEE) {
      if (results.Defender.DamageTo >= results.Defender.MaxHitPoints) {
        this.outcomeLabel.innerHTML = Locale.compose("LOC_COMBAT_PREVIEW_DECISIVE_VICTORY");
      } else {
        const combatDifference = results.Defender.DamageTo - results.Attacker.DamageTo;
        if (combatDifference > 0) {
          if (combatDifference < 3) {
            this.outcomeLabel.innerHTML = Locale.compose("LOC_COMBAT_PREVIEW_STALEMATE");
            victoryType = "stalemate";
          } else {
            if (combatDifference < 10) {
              this.outcomeLabel.innerHTML = Locale.compose("LOC_COMBAT_PREVIEW_MINOR_VICTORY");
            } else {
              this.outcomeLabel.innerHTML = Locale.compose("LOC_COMBAT_PREVIEW_MAJOR_VICTORY");
            }
          }
        } else {
          if (combatDifference > -3) {
            this.outcomeLabel.innerHTML = Locale.compose("LOC_COMBAT_PREVIEW_STALEMATE");
            victoryType = "stalemate";
          } else {
            if (combatDifference > -10) {
              this.outcomeLabel.innerHTML = Locale.compose("LOC_COMBAT_PREVIEW_MINOR_DEFEAT");
              victoryType = "defeat";
            } else {
              this.outcomeLabel.innerHTML = Locale.compose("LOC_COMBAT_PREVIEW_MAJOR_DEFEAT");
              victoryType = "defeat";
            }
          }
        }
      }
    }
    this.outcomeColorBottom?.classList.remove(
      "preview-outcome-victory",
      "preview-outcome-stalemate",
      "preview-outcome-defeat"
    );
    this.outcomeColorTop?.classList.remove(
      "preview-outcome-victory",
      "preview-outcome-stalemate",
      "preview-outcome-defeat"
    );
    switch (victoryType) {
      case "victory":
        this.outcomeColorBottom?.classList.add("preview-outcome-victory");
        this.outcomeColorTop?.classList.add("preview-outcome-victory");
        break;
      case "stalemate":
        this.outcomeColorBottom?.classList.add("preview-outcome-stalemate");
        this.outcomeColorTop?.classList.add("preview-outcome-stalemate");
        break;
      case "defeat":
        this.outcomeColorBottom?.classList.add("preview-outcome-defeat");
        this.outcomeColorTop?.classList.add("preview-outcome-defeat");
        break;
      default:
        break;
    }
    UI.lockCursor(true);
    if (combatType == CombatTypes.COMBAT_RANGED) {
      UI.setCursorByType(UIHTMLCursorTypes.Ranged);
    } else {
      UI.setCursorByType(UIHTMLCursorTypes.Attack);
    }
    window.dispatchEvent(new CustomEvent("combat-preview-shown"));
    WorldAnchors.SetWorldUnitsSelectedUnitTargeting(this.targetID);
    this.Root.classList.remove("hidden");
    this.Root.classList.add("visible");
  }
  updateCombatMods(combatantName, unitResults, modContainer, modInfo) {
    if (!modContainer) {
      console.error(
        "panel-unit-combat-preview, updateCombatMods(): A combat preview modifier container is missing!"
      );
      return;
    }
    if (!modInfo) {
      console.error(
        "panel-unit-combat-preview, updateCombatMods(): A combat preview modifier info container is missing!"
      );
      return;
    }
    while (modInfo.hasChildNodes()) {
      modInfo.removeChild(modInfo.lastChild);
    }
    const unitNameText = document.createElement("div");
    unitNameText.classList.add("preview-unit-name", "font-title");
    unitNameText.innerHTML = combatantName;
    modInfo.appendChild(unitNameText);
    const headerDivider = document.createElement("div");
    headerDivider.classList.add("preview-header-divider");
    modInfo.appendChild(headerDivider);
    let baseStrengthType = "";
    const unitStrengthType = unitResults.CombatStrengthType;
    if (unitStrengthType != null) {
      if (unitStrengthType == CombatStrengthTypes.STRENGTH_MELEE) {
        baseStrengthType = Locale.compose("LOC_COMBAT_PREVIEW_MELEE_STRENGTH");
      } else if (unitStrengthType == CombatStrengthTypes.STRENGTH_RANGED) {
        baseStrengthType = Locale.compose("LOC_COMBAT_PREVIEW_RANGED_STRENGTH");
      } else if (unitStrengthType == CombatStrengthTypes.STRENGTH_BOMBARD) {
        baseStrengthType = Locale.compose("LOC_COMBAT_PREVIEW_BOMBARD_STRENGTH");
      } else {
        baseStrengthType = Locale.compose("LOC_COMBAT_PREVIEW_MELEE_STRENGTH");
      }
    }
    this.addModifierText(modInfo, `${unitResults.CombatStrength}: ${baseStrengthType}`);
    if (unitResults.PreviewTextHealth) {
      for (let i = 0; i < unitResults.PreviewTextHealth.length; i++) {
        this.addModifierText(modInfo, unitResults.PreviewTextHealth[i]);
      }
    }
    if (unitResults.PreviewTextInterceptor) {
      for (let i = 0; i < unitResults.PreviewTextInterceptor.length; i++) {
        this.addModifierText(modInfo, unitResults.PreviewTextInterceptor[i]);
      }
    }
    if (unitResults.PreviewTextAntiAir) {
      for (let i = 0; i < unitResults.PreviewTextAntiAir.length; i++) {
        this.addModifierText(modInfo, unitResults.PreviewTextAntiAir[i]);
      }
    }
    if (unitResults.PreviewTextTerrain) {
      for (let i = 0; i < unitResults.PreviewTextTerrain.length; i++) {
        this.addModifierText(modInfo, unitResults.PreviewTextTerrain[i]);
      }
    }
    if (unitResults.PreviewTextOpponent) {
      for (let i = 0; i < unitResults.PreviewTextOpponent.length; i++) {
        this.addModifierText(modInfo, unitResults.PreviewTextOpponent[i]);
      }
    }
    if (unitResults.PreviewTextModifier) {
      for (let i = 0; i < unitResults.PreviewTextModifier.length; i++) {
        this.addModifierText(modInfo, unitResults.PreviewTextModifier[i]);
      }
    }
    if (unitResults.PreviewTextAssist) {
      for (let i = 0; i < unitResults.PreviewTextAssist.length; i++) {
        this.addModifierText(modInfo, unitResults.PreviewTextAssist[i]);
      }
    }
    if (unitResults.PreviewTextPromotion) {
      for (let i = 0; i < unitResults.PreviewTextPromotion.length; i++) {
        this.addModifierText(modInfo, unitResults.PreviewTextPromotion[i]);
      }
    }
    if (unitResults.PreviewTextDefenses) {
      for (let i = 0; i < unitResults.PreviewTextDefenses.length; i++) {
        this.addModifierText(modInfo, unitResults.PreviewTextDefenses[i]);
      }
    }
    if (unitResults.PreviewTextResources) {
      for (let i = 0; i < unitResults.PreviewTextResources.length; i++) {
        this.addModifierText(modInfo, unitResults.PreviewTextResources[i]);
      }
    }
    modContainer.classList.remove("preview-modifier-container--hidden");
  }
  addModifierText(modContainer, modText) {
    const modifierText = document.createElement("div");
    modifierText.classList.add("preview-modifier-text", "font-body");
    modifierText.innerHTML = Locale.stylize(modText);
    modContainer.appendChild(modifierText);
  }
  onRangedAttackStarted() {
    this.isRangedAttacking = true;
  }
  onRangedAttackFinished() {
    this.isRangedAttacking = false;
  }
  onUnitSelectionChanged(data) {
    if (!data.selected && this.isRangedAttacking) {
      this.onUpdate();
      return;
    }
    this.selectedUnitID = ComponentID.getInvalidID();
    if (!data.selected) {
      this.onUpdate();
      return;
    }
    const unit = Units.get(data.unit);
    if (unit) {
      if (unit.Combat?.isCombat) {
        this.selectedUnitID = data.unit;
      }
    } else {
      console.warn(
        "panel-unit-combat-preview, onUnitSelectionChanged(): Combat registered a selected but none found with cid: " + ComponentID.toLogString(data.unit)
      );
    }
    this.onUpdate();
  }
  onUnitRemovedFromMap(data) {
    if (data.unit == this.selectedUnitID || data.unit == this.targetID) {
      this.onUpdate();
    }
  }
  onUnitMoveComplete(data) {
    if (data.unit == this.selectedUnitID || data.unit == this.targetID || data.location == this.location) {
      this.onUpdate();
    }
  }
  onCombat(data) {
    if (ComponentID.isMatch(data.attacker, this.selectedUnitID)) {
      this.onUpdate();
    }
  }
}
Controls.define("panel-unit-combat-preview", {
  createInstance: PanelUnitCombatPreview,
  description: "Area for combat preview",
  classNames: ["unit-combat-preview", "hidden"],
  styles: [styles],
  innerHTML: [content]
});
//# sourceMappingURL=panel-unit-combat-preview.js.map

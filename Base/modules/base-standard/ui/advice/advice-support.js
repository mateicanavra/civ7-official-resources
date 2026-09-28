var AdvicePriority = /* @__PURE__ */ ((AdvicePriority2) => {
  AdvicePriority2[AdvicePriority2["Low"] = 50] = "Low";
  AdvicePriority2[AdvicePriority2["Default"] = 100] = "Default";
  AdvicePriority2[AdvicePriority2["High"] = 200] = "High";
  AdvicePriority2[AdvicePriority2["Utmost"] = 300] = "Utmost";
  return AdvicePriority2;
})(AdvicePriority || {});
function selectAfterTurns(turns, offset = 0) {
  const turn = Game.turn;
  return (turn - 1 + offset) % turns == 0;
}
const { gameSpeedType } = Configuration.getGame();
const gameSpeedObj = GameInfo.GameSpeeds.lookup(gameSpeedType);
const gameSpeed = gameSpeedObj.CostMultiplier;
const gameSpeedMultiplier = gameSpeed ? gameSpeed / 100 : 1;
function shouldSelect(start, durration, offset = 0) {
  const turn = Game.turn;
  if (turn < start) {
    return false;
  }
  const durrationAdjusted = Math.floor(durration * gameSpeedMultiplier);
  const offsetAdjusted = Math.floor(offset * gameSpeedMultiplier);
  if (turn + offsetAdjusted == start) {
    return true;
  }
  return (turn - 1 + offsetAdjusted) % durrationAdjusted == 0;
}
function hasWonders(amount) {
  const player = Players.get(GameContext.localPlayerID);
  if (player && player.Stats) {
    const originalConstructor = false;
    const currentAgeOnly = false;
    return player.Stats.getNumWonders(originalConstructor, currentAgeOnly) >= amount;
  }
  return false;
}
function hasCivic(name) {
  const player = Players.get(GameContext.localPlayerID);
  if (player && player.Culture) {
    return player.Culture?.isNodeUnlocked(name);
  }
  return false;
}
function goldInRange(min, max) {
  const player = Players.get(GameContext.localPlayerID);
  if (!player) {
    return false;
  }
  const treasury = player.Treasury;
  if (!treasury) {
    return false;
  }
  return (treasury.goldBalance >= min || min == -1) && (treasury.goldBalance <= max || max == -1);
}
function anyTechUnlocked(names) {
  const player = Players.get(GameContext.localPlayerID);
  if (player) {
    const playerTechs = player.Techs;
    if (playerTechs) {
      for (const techName of names) {
        if (playerTechs.isNodeUnlocked(techName)) {
          return true;
        }
      }
    }
  }
  return false;
}
function isAtWar() {
  const player = Players.get(GameContext.localPlayerID);
  if (player) {
    const playerDiplomacy = player.Diplomacy;
    if (playerDiplomacy) {
      if (playerDiplomacy.isAtWarWithAnyMajorCiv() == true) {
        return true;
      }
    }
  }
  return false;
}
function amountConqueredSettlements() {
  const player = Players.get(GameContext.localPlayerID);
  if (!player || !player.Stats) {
    return 0;
  }
  const countMinorPlayers = true;
  const countHomelands = true;
  const countDistantLands = true;
  const bCoastalOnly = false;
  return player.Stats.getNumConqueredSettlements(countMinorPlayers, countHomelands, countDistantLands, bCoastalOnly);
}
function playerHasReligion() {
  const player = Players.get(GameContext.localPlayerID);
  if (!player || !player.Religion) {
    return false;
  }
  return player.Religion.hasCreatedReligion();
}

export { AdvicePriority, amountConqueredSettlements, anyTechUnlocked, goldInRange, hasCivic, hasWonders, isAtWar, playerHasReligion, selectAfterTurns, shouldSelect };
//# sourceMappingURL=advice-support.js.map

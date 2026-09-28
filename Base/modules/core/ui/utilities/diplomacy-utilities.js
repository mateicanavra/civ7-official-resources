import DiplomacyManager from '../../../base-standard/ui/diplomacy/diplomacy-manager.js';

function getPlayerDiplomacy(playerOrId) {
  if (typeof playerOrId === "number") {
    const playerId = playerOrId;
    const playerDiplomacy = Players.get(playerId)?.Diplomacy;
    if (!playerDiplomacy) {
      console.error("getPlayerDiplomacy: Can't get player with id", playerId);
      return null;
    }
    return playerDiplomacy;
  } else {
    const player = playerOrId;
    const playerDiplomacy = player.Diplomacy;
    if (!playerDiplomacy) {
      console.error("getPlayerDiplomacy: Can't get DiplomacyLibrary for player with id", player.id);
      return null;
    }
    return playerDiplomacy;
  }
}
function getRelationshipIconFromPlayer(playerId) {
  const playerDiplomacy = getPlayerDiplomacy(playerId);
  if (!playerDiplomacy) {
    return "";
  }
  let relationshipIcon = "";
  if (playerDiplomacy.isAtWarWith(GameContext.localObserverID)) {
    relationshipIcon = UI.getIconCSS("PLAYER_RELATIONSHIP_AT_WAR", "PLAYER_RELATIONSHIP");
  } else if (playerDiplomacy.hasAllied(GameContext.localObserverID)) {
    relationshipIcon = UI.getIconCSS("PLAYER_RELATIONSHIP_ALLIANCE", "PLAYER_RELATIONSHIP");
  } else {
    relationshipIcon = UI.getIconCSS(
      DiplomacyManager.getRelationshipTypeString(
        playerDiplomacy.getRelationshipEnum(GameContext.localObserverID)
      ),
      "PLAYER_RELATIONSHIP"
    );
  }
  return relationshipIcon;
}
function getRelationship(playerAId, playerBId) {
  const defaultRelationship = {
    type: DiplomacyPlayerRelationships.PLAYER_RELATIONSHIP_UNKNOWN,
    levelName: "unknown",
    amount: 0
  };
  if (playerBId === void 0) {
    playerBId = GameContext.localPlayerID;
  }
  const playerADiplomacy = getPlayerDiplomacy(playerAId);
  if (!playerADiplomacy) {
    console.error("getRelationship: Can't find diplomacy object for player with Id:", playerAId);
    return defaultRelationship;
  }
  return {
    type: playerADiplomacy.getRelationshipEnum(playerBId),
    levelName: playerADiplomacy.getRelationshipLevelName(playerBId),
    amount: playerADiplomacy.getRelationshipLevel(playerBId)
  };
}
function getWarStatusFromPlayerId(playerId) {
  const result = { isAtWar: false, warSupport: 0 };
  const playerDiplomacy = getPlayerDiplomacy(playerId);
  if (!playerDiplomacy) {
    return result;
  }
  result.isAtWar = playerDiplomacy.isAtWarWith(GameContext.localPlayerID);
  let warId = -1;
  for (const jointEvent of Game.Diplomacy.getJointEvents(GameContext.localPlayerID, playerId, false)) {
    if (jointEvent.actionType === DiplomacyActionTypes.DIPLOMACY_ACTION_DECLARE_WAR) {
      warId = jointEvent.uniqueID;
      break;
    }
  }
  if (warId === -1) {
    return result;
  }
  const warEventHeader = Game.Diplomacy.getDiplomaticEventData(warId);
  const supportingPlayers = Game.Diplomacy.getSupportingPlayersWithBonusEnvoys(warEventHeader.uniqueID);
  const opposingPlayers = Game.Diplomacy.getOpposingPlayersWithBonusEnvoys(warEventHeader.uniqueID);
  result.warSupport = warEventHeader.initialPlayer === GameContext.localPlayerID ? supportingPlayers.length - opposingPlayers.length : opposingPlayers.length - supportingPlayers.length;
  return result;
}
function getMajorLeader(playerId) {
  const player = Players.get(playerId);
  if (!player) {
    return null;
  }
  if (player.isMinor) {
    if (!player.Influence) {
      return null;
    }
    if (player.Influence.hasSuzerain) {
      const suzerainPlayerId = player.Influence.getSuzerain();
      if (suzerainPlayerId === PlayerIds.NO_PLAYER) {
        console.error("getMajorLeader::hasSuzerain is true, but no suzerain player ID found");
        return null;
      }
      const suzerainPlayer = Players.get(suzerainPlayerId);
      if (suzerainPlayer) {
        return suzerainPlayer;
      } else {
        console.error("getMajorLeader::hasSuzerain is true, but no suzarain player found.");
        return null;
      }
    }
  } else {
    return player;
  }
  return null;
}

export { getMajorLeader, getPlayerDiplomacy, getRelationship, getRelationshipIconFromPlayer, getWarStatusFromPlayerId };
//# sourceMappingURL=diplomacy-utilities.js.map

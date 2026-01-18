import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import { DisplayQueueManager } from '../../../core/ui/context-manager/display-queue-manager.js';
import { Icon } from '../../../core/ui/utilities/utilities-image.chunk.js';
import { C as CinematicManager } from '../cinematic/cinematic-manager.chunk.js';
import { EndGameScreenCategory } from '../endgame/screen-endgame.js';
import { V as VictoryManager } from '../victory-manager/victory-manager.chunk.js';

const VictoryAchievedScreenCategory = "VictoryAchieved";
class VictoryProgressModel {
  playerScores = [];
  onUpdate;
  rankingsHotkeyListener = this.onRankingsHotkey.bind(this);
  // keeps track of the last advisor page a player was on. The number here is AdvisorTypes
  _advisorVictoryTab = 0;
  get advisorVictoryTab() {
    return this._advisorVictoryTab;
  }
  set updateAdvisorVictoryTab(index) {
    this._advisorVictoryTab = index;
  }
  constructor() {
    VictoryManager.victoryManagerUpdateEvent.on(this.onVictoryManagerUpdate.bind(this));
    engine.whenReady.then(() => {
      window.addEventListener("hotkey-open-rankings", this.rankingsHotkeyListener);
      engine.on("GameAgeEnded", this.onAgeEnded, this);
      engine.on("TeamVictory", this.onTeamVictory, this);
      engine.on("PlayerDefeat", this.onPlayerDefeated, this);
      engine.on("LegacyPathMilestoneCompleted", this.onLegacyPathMilestoneCompleted, this);
    });
  }
  onVictoryManagerUpdate() {
    this.update();
  }
  set updateCallback(callback) {
    this.onUpdate = callback;
  }
  onTeamVictory(event) {
    if (Game.AgeProgressManager.isExtendedGame) {
      const cinematicDef = GameInfo.VictoryCinematics.lookup(event.victory);
      if (cinematicDef && cinematicDef.VictoryCinematicType != VictoryCinematicTypes.NO_VICTORY_CINEMATIC_TYPE && GameplayMap.isValidLocation(event.location)) {
        CinematicManager.startEndOfGameCinematic(
          cinematicDef.VictoryCinematicType,
          cinematicDef.VictoryType,
          event.location
        );
      }
    }
  }
  onAgeEnded(event) {
    if (!Game.AgeProgressManager.isExtendedGame) {
      const cinematicDef = GameInfo.VictoryCinematics.lookup(event.victoryType);
      if (cinematicDef && cinematicDef.VictoryCinematicType != VictoryCinematicTypes.NO_VICTORY_CINEMATIC_TYPE && GameplayMap.isValidLocation(event.location)) {
        CinematicManager.startEndOfGameCinematic(
          cinematicDef.VictoryCinematicType,
          cinematicDef.VictoryType,
          event.location
        );
      } else {
        DisplayQueueManager.add({ category: EndGameScreenCategory, forceShow: true });
      }
    }
  }
  onPlayerDefeated(event) {
    if (event.player == GameContext.localPlayerID) {
      DisplayQueueManager.add({ category: EndGameScreenCategory, forceShow: true });
    }
  }
  onLegacyPathMilestoneCompleted(event) {
    if (event.player == GameContext.localPlayerID) {
      const milestoneDefinition = GameInfo.AgeProgressionMilestones.lookup(event.milestone);
      if (milestoneDefinition) {
        const victoryRequest = {
          category: VictoryAchievedScreenCategory,
          milestoneDefinition,
          forceShow: true
        };
        DisplayQueueManager.add(victoryRequest);
      }
    }
  }
  update() {
    this.playerScores = [];
    const localPlayerID = GameContext.localPlayerID;
    const localPlayer = Players.get(localPlayerID);
    if (!localPlayer) {
      return;
    }
    const localPlayerDiplomacy = localPlayer.Diplomacy;
    if (localPlayerDiplomacy === void 0) {
      console.error("model-victory-progress: Unable to get local player diplomacy!");
      return;
    }
    const victoryEnabledPlayers = VictoryManager.victoryEnabledPlayers;
    const placedVictories = VictoryManager.claimedVictories;
    const victoryProgress = VictoryManager.victoryProgress;
    const enabledLegacyPaths = [];
    const localPlayerEnabledLegacyPaths = localPlayer.LegacyPaths?.getEnabledLegacyPaths();
    if (localPlayerEnabledLegacyPaths) {
      for (const elp of localPlayerEnabledLegacyPaths) {
        const legacyPathDefinition = GameInfo.LegacyPaths.lookup(elp.legacyPath);
        if (legacyPathDefinition) {
          enabledLegacyPaths.push(legacyPathDefinition);
        }
      }
    }
    for (const p of victoryEnabledPlayers) {
      const player = Players.get(p);
      if (player?.isMajor) {
        const team = player.team;
        for (const v of enabledLegacyPaths) {
          let place = 999;
          let currentProgress = 0;
          let totalProgress = 0;
          for (const placedVictory of placedVictories) {
            if (placedVictory.team == team && placedVictory.victory == v.$hash) {
              place = placedVictory.place;
              break;
            }
          }
          for (const progress of victoryProgress) {
            if (progress.team == team && progress.victory == v.$hash) {
              currentProgress = progress.current;
              totalProgress = progress.total;
            }
          }
          this.createScoreData(player, localPlayerDiplomacy, v, place, currentProgress, totalProgress);
        }
      }
    }
    this.playerScores.sort(function(a, b) {
      return a.rank - b.rank || b.victoryTurn - a.victoryTurn || b.score - a.score || a.leaderName.localeCompare(b.leaderName);
    });
    if (this.onUpdate) {
      this.onUpdate(this);
    }
  }
  //Create some temporary score data until we can get the actual data from GameCore
  createScoreData(player, localPlayerDiplomacy, legacyPath, place, currentProgress, totalProgress) {
    const localPlayerID = GameContext.localPlayerID;
    const hasMet = localPlayerDiplomacy.hasMet(player.id) || localPlayerID == player.id;
    const leaderName = hasMet ? player.name : "LOC_LEADER_UNMET_NAME";
    const leaderIconsrc = hasMet ? Icon.getLeaderPortraitIcon(player.leaderType) : "fs://game/base-standard/ui/icons/leaders/leader_portrait_unknown.png";
    const playerScore = {
      playerID: player.id,
      leaderName,
      leaderPortrait: leaderIconsrc,
      score: currentProgress,
      scoreGoal: totalProgress,
      scoreIcon: Icon.getLegacyPathIcon(legacyPath),
      rank: place,
      rankIcon: "",
      victoryTurn: -1,
      victoryType: legacyPath.LegacyPathType,
      victoryClass: legacyPath.LegacyPathClassType,
      victoryAchieved: place > 0
    };
    this.playerScores.push(playerScore);
  }
  onRankingsHotkey() {
    if (ContextManager.isCurrentClass("screen-victory-progress")) {
      ContextManager.pop("screen-victory-progress");
    } else {
      ContextManager.push("screen-victory-progress");
    }
  }
  getBackdropByAdvisorType(advisorType) {
    const lookup = {
      [Database.makeHash("ADVISOR_MILITARY")]: "ADVISOR_BG_MILITARY",
      [Database.makeHash("ADVISOR_CULTURE")]: "ADVISOR_BG_CULTURE",
      [Database.makeHash("ADVISOR_SCIENCE")]: "ADVISOR_BG_SCIENCE",
      [Database.makeHash("ADVISOR_ECONOMIC")]: "ADVISOR_BG_ECONOMIC"
    };
    const icon = lookup[advisorType];
    return icon ? UI.getIconURL(icon) : "";
  }
  getEnabledLegacyPaths() {
    const enabledLegacyPaths = [];
    for (const path of GameInfo.LegacyPaths) {
      if (path.EnabledByDefault) {
        enabledLegacyPaths.push(path);
      }
    }
    return enabledLegacyPaths;
  }
}
const VictoryProgress = new VictoryProgressModel();

export { VictoryProgress as V, VictoryAchievedScreenCategory as a };
//# sourceMappingURL=model-victory-progress.chunk.js.map

import { registerRadialMenu, registerRadialMenuItem, NavigationType } from '../../../core/ui/radial-menu/radial-menu-item-store.js';
import { Layout } from '../../../core/ui/utilities/utilities-layout.js';
import AgeScores from '../age-scores/model-age-scores.js';
import GreatWorks from '../great-works/model-great-works.js';
import { getNodeName } from '../utilities/utilities-textprovider.js';

const GameSymbol = Symbol("Game");
registerRadialMenu({ symbol: GameSymbol, title: "LOC_UI_RADIAL_MENU_MENU_TITLE", sortOrder: 10 });
registerRadialMenuItem(GameSymbol, {
  title: "LOC_UI_VICTORY_PROGRESS",
  icon1: "RADIAL_VICTORIES",
  navigation: {
    type: NavigationType.CONTEXT,
    value: () => "screen-victory-progress",
    createsMouseGuard: true
  },
  sortOrder: 10,
  description: () => {
    return `
			<div class="font-fit-shrink whitespace-nowrap text-accent-3 mt-6 mb-2 ${window.innerHeight > Layout.pixelsToScreenPixels(720) ? "font-title-xl" : "font-title-lg"}">
				${Locale.compose(Game.maxTurns ? "LOC_UI_RADIAL_MENU_AGE_PROGRESS_TURN_RATIO" : "LOC_UI_RADIAL_MENU_AGE_PROGRESS_TURN", Game.turn, Game.maxTurns)}
			</div>
		`;
  }
});
registerRadialMenuItem(GameSymbol, {
  title: "LOC_UI_RADIAL_MENU_DETAILS_TECH_TITLE",
  icon1: "RADIAL_TECH",
  navigation: {
    type: NavigationType.CONTEXT,
    value: () => "screen-tech-tree-chooser"
  },
  tutHidderId: "hideTech",
  sortOrder: 20,
  description: () => {
    const localPlayerId = GameContext.localPlayerID;
    const localPlayer = Players.getEverAlive()[localPlayerId];
    const techs = localPlayer.Techs;
    const turn = techs?.getTurnsLeft().toString();
    const techTreeType = techs?.getTreeType();
    const treeObject = techTreeType ? Game.ProgressionTrees.getTree(localPlayerId, techTreeType) : null;
    const activeNode = treeObject ? treeObject.nodes[treeObject.activeNodeIndex] : void 0;
    const nodeData = activeNode ? Game.ProgressionTrees.getNode(localPlayerId, activeNode.nodeType) : null;
    const nodeInfo = activeNode ? GameInfo.ProgressionTreeNodes.lookup(activeNode.nodeType) : null;
    const techName = Locale.compose(nodeInfo?.Name ?? "") || void 0;
    const depthNumeral = Locale.toRomanNumeral((nodeData?.depthUnlocked ?? 0) + 1);
    const renderHeight = window.innerHeight;
    if (!turn || !techName) {
      return "";
    }
    return `
			<div class="font-body text-accent-4 max-w-full truncate mt-4 ${renderHeight > 720 ? "text-sm" : "text-xs"}" data-l10n-id="LOC_UI_CURRENT_STUDY"></div>
			<div class="font-fit-shrink whitespace-nowrap font-bold text-accent-2 uppercase ${renderHeight > 720 ? "text-base" : "text-sm"}">${techName}${depthNumeral ? ` ${depthNumeral}` : ""}</div>
			<div class="flow-row">
				<div class="radial-menu__name-filigree-left"></div>
				<div class="radial-menu__name-filigree-right"></div>
			</div>
			<div class="flow-row items-center mt-2">
				<div class="img-turn-icon w-8 h-8 mr-1"></div>
				<div class="flex-auto">
					<div class="font-body text-accent-4 max-w-full truncate ${renderHeight > 720 ? "text-base" : "text-sm"}">${turn}</div>
				</div>
			</div>
		`;
  }
});
registerRadialMenuItem(GameSymbol, {
  title: "LOC_UI_RADIAL_MENU_DETAILS_CULTURE_TITLE",
  icon1: "RADIAL_CIVICS",
  navigation: {
    type: NavigationType.CONTEXT,
    value: () => "screen-culture-tree-chooser"
  },
  tutHidderId: "hideCulture",
  sortOrder: 30,
  description: () => {
    const localPlayerId = GameContext.localPlayerID;
    const localPlayer = Players.getEverAlive()[localPlayerId];
    const culture = localPlayer.Culture;
    const turn = culture?.getTurnsLeft().toString();
    const cultureTreeType = culture?.getActiveTree();
    const treeObject = cultureTreeType ? Game.ProgressionTrees.getTree(localPlayerId, cultureTreeType) : null;
    const activeNode = treeObject ? treeObject.nodes[treeObject.activeNodeIndex] : void 0;
    const nodeData = activeNode ? Game.ProgressionTrees.getNode(localPlayerId, activeNode.nodeType) : null;
    const nodeName = nodeData ? getNodeName(nodeData, localPlayer) : "";
    const cultureName = Locale.compose(nodeName) || void 0;
    const depthNumeral = Locale.toRomanNumeral((nodeData?.depthUnlocked ?? 0) + 1);
    const renderHeight = window.innerHeight;
    if (!turn || !cultureName) {
      return "";
    }
    return `
			<div class="font-body text-accent-4 max-w-full truncate mt-4 ${renderHeight > 720 ? "text-sm" : "text-xs"}" data-l10n-id="LOC_UI_CURRENT_STUDY"></div>
			<div class="font-fit-shrink whitespace-nowrap font-bold text-accent-2 uppercase ${renderHeight > 720 ? "text-base" : "text-sm"}">${cultureName}${depthNumeral ? ` ${depthNumeral}` : ""}</div>
			<div class="flow-row">
				<div class="radial-menu__name-filigree-left"></div>
				<div class="radial-menu__name-filigree-right"></div>
			</div>
			<div class="flow-row items-center mt-2">
				<div class="img-turn-icon w-8 h-8 mr-1"></div>
				<div class="flex-auto">
					<div class="font-body text-accent-4 max-w-full truncate ${renderHeight > 720 ? "text-base" : "text-sm"}">${turn}</div>
				</div>
			</div>
		`;
  }
});
registerRadialMenuItem(GameSymbol, {
  title: "LOC_UI_RADIAL_MENU_DETAILS_GOVERNMENT_TITLE",
  icon1: "RADIAL_GOVERNMENT",
  navigation: {
    type: NavigationType.CONTEXT,
    value: () => "screen-policies",
    createsMouseGuard: true
  },
  tutHidderId: "hideCulture",
  sortOrder: 40,
  description: () => {
    const localPlayerId = GameContext.localPlayerID;
    const localPlayer = Players.get(localPlayerId);
    const localPlayerHappiness = localPlayer?.Happiness;
    const localPlayerStats = localPlayer?.Stats;
    const happinessPerTurn = localPlayerStats?.getNetYield(YieldTypes.YIELD_HAPPINESS) ?? -1;
    const isInGoldenAge = localPlayerHappiness?.isInGoldenAge();
    const goldenAgeTurnsLeft = localPlayerHappiness?.getGoldenAgeTurnsLeft() ?? 0;
    const nextGoldenAgeThreshold = localPlayerHappiness?.nextGoldenAgeThreshold ?? -1;
    const happinessTotal = Math.ceil(localPlayerStats?.getLifetimeYield(YieldTypes.YIELD_HAPPINESS) ?? -1) ?? -1;
    const turnsToNextGoldenAge = happinessPerTurn !== 0 ? Math.ceil((nextGoldenAgeThreshold - happinessTotal) / happinessPerTurn) : 0;
    const culture = localPlayer?.Culture;
    const governmentType = culture?.getGovernmentType();
    const playerGovernment = governmentType ? GameInfo.Governments.lookup(governmentType) : null;
    const governmentName = Locale.compose(playerGovernment?.Name ?? "");
    const renderHeight = window.innerHeight;
    return `
			<div class="font-body text-accent-4 max-w-full truncate mt-4 ${renderHeight > 720 ? "text-sm" : "text-xs"}" data-l10n-id="LOC_UI_RADIAL_MENU_DETAILS_GOVERNMENT_GOVERNMENT"></div>
			<div class="font-fit-shrink whitespace-nowrap font-bold text-accent-2 uppercase ${renderHeight > 720 ? "text-base" : "text-sm"}">${governmentName || "LOC_UI_RADIAL_MENU_DETAILS_GOVERNMENT_GOVERNMENT_NONE"}</div>
			<div class="flow-row">
				<div class="radial-menu__name-filigree-left"></div>
				<div class="radial-menu__name-filigree-right"></div>
			</div>
			${isInGoldenAge || turnsToNextGoldenAge > 0 ? `
				<div class="mt-1 flow-column items-center">
					<div class="font-body text-accent-4 max-w-full truncate ${renderHeight > 720 ? "text-sm" : "text-xs"}" data-l10n-id="${isInGoldenAge ? "LOC_UI_RADIAL_MENU_DETAILS_GOVERNMENT_CURRENT_CELEBRATION" : "LOC_UI_RADIAL_MENU_DETAILS_GOVERNMENT_NEXT_CELEBRATION"}"></div>
					<div class="flow-row items-center">
						<div class="img-turn-icon w-8 h-8 mr-1"></div>
						<div class="flex-auto">
							<div class="font-bold text-accent-2 max-w-full truncate uppercase ${renderHeight > 720 ? "text-base" : "text-sm"}">${isInGoldenAge ? goldenAgeTurnsLeft : turnsToNextGoldenAge}</div>
						</div>
					</div>
				</div>
			` : ""}
		`;
  }
});
registerRadialMenuItem(GameSymbol, {
  title: "LOC_UI_RADIAL_MENU_DETAILS_RESOURCES_TITLE",
  icon1: "RADIAL_RESOURCES",
  navigation: {
    type: NavigationType.CONTEXT,
    value: () => "screen-resource-allocation",
    createsMouseGuard: true
  },
  tutHidderId: "hideTrade",
  sortOrder: 50
});
registerRadialMenuItem(GameSymbol, {
  title: "LOC_UI_RADIAL_MENU_DETAILS_GREATWORKS_TITLE",
  icon1: "RADIAL_GREATWORKS",
  navigation: {
    type: NavigationType.CONTEXT,
    value: () => "screen-great-works",
    createsMouseGuard: true
  },
  tutHidderId: "hideGreatWorks",
  sortOrder: 60,
  description: () => {
    const { name = "" } = GreatWorks.latestGreatWorkDetails ?? {};
    let greatWorkVictoryData = null;
    for (const victory of AgeScores.victories) {
      if (victory.victoryType == "VICTORY_MODERN_CULTURE" || victory.victoryType == "VICTORY_EXPLORATION_CULTURE" || victory.victoryType == "VICTORY_ANTIQUITY_SCIENCE") {
        greatWorkVictoryData = victory;
        break;
      }
    }
    const { score } = greatWorkVictoryData?.playerData.find(({ playerID }) => playerID == GreatWorks.localPlayer?.id) ?? {};
    const { scoreNeeded } = greatWorkVictoryData ?? {};
    const renderHeight = window.innerHeight;
    return `
			${name ? `
				<div class="font-body text-accent-4 max-w-full truncate mt-4 ${renderHeight > 720 ? "text-sm" : "text-xs"}" data-l10n-id="LOC_UI_RADIAL_MENU_DETAILS_GREATWORKS_LATEST"></div>
				<div class="font-fit-shrink whitespace-nowrap font-bold text-accent-2 uppercase ${renderHeight > 720 ? "text-base" : "text-sm"}">${name}</div>
			` : score != void 0 && scoreNeeded ? `
					<div class="flow-column items-center">
						<div class="font-body text-accent-4 max-w-full truncate mt-4 ${renderHeight > 720 ? "text-sm" : "text-xs"}" data-l10n-id="LOC_UI_RADIAL_MENU_DETAILS_GREATWORKS_LIBRARY"></div>
						<div class="font-bold text-accent-2 max-w-full truncate uppercase mt-1 ${renderHeight > 720 ? "text-base" : "text-sm"}">${Locale.compose("LOC_UI_RADIAL_MENU_DETAILS_GREATWORKS_LIBRARY_VICTORY_PROGRESS", score, scoreNeeded)}</div>
					</div>
				` : ""}
			${!!name || score != void 0 && scoreNeeded ? `
				<div class="flow-row">
					<div class="radial-menu__name-filigree-left"></div>
					<div class="radial-menu__name-filigree-right"></div>
				</div>
			` : ""}
			${!!name && score != void 0 && scoreNeeded ? `
				<div class="flow-column items-center mt-1">
					<div class="font-body text-accent-4 max-w-full truncate ${renderHeight > 720 ? "text-sm" : "text-xs"}" data-l10n-id="LOC_UI_RADIAL_MENU_DETAILS_GREATWORKS_LIBRARY"></div>
					<div class="font-bold text-accent-2 max-w-full truncate uppercase ${renderHeight > 720 ? "text-base" : "text-sm"}">${Locale.compose("LOC_UI_RADIAL_MENU_DETAILS_GREATWORKS_LIBRARY_VICTORY_PROGRESS", score, scoreNeeded)}</div>
				</div>
			` : ""}
		`;
  }
});
registerRadialMenuItem(GameSymbol, {
  title: "LOC_UI_PLAYER_UNLOCKS_LEGACIES",
  icon1: "RADIAL_LEGACIES",
  navigation: {
    type: NavigationType.CONTEXT,
    value: () => "screen-legacies",
    createsMouseGuard: true
  },
  tutHidderId: "hideTriumphs",
  sortOrder: 70
});
registerRadialMenuItem(GameSymbol, {
  title: "LOC_UI_RADIAL_MENU_DETAILS_ADVISORS_TITLE",
  icon1: "RADIAL_ADVISORS",
  navigation: {
    type: NavigationType.CONTEXT,
    value: () => "screen-advisor-council",
    createsMouseGuard: true
  },
  tutHidderId: "hideAdvisors",
  sortOrder: 80
});
registerRadialMenuItem(GameSymbol, {
  title: "LOC_UI_RADIAL_MENU_DETAILS_RELIGION_TITLE",
  icon1: "RADIAL_RELIGION",
  navigation: {
    type: NavigationType.CONTEXT,
    value: () => {
      if (Game.age == Database.makeHash("AGE_ANTIQUITY")) {
        const player = Players.get(GameContext.localPlayerID);
        if (!player) {
          console.error("panel-radial-menu: religion radial value() - no local player found!");
          return "";
        }
        const playerCulture = player.Culture;
        if (!playerCulture) {
          console.error("panel-radial-menu: religion radial value() - no player culture found!");
          return "";
        }
        const playerReligion = player.Religion;
        if (!playerReligion) {
          console.error("panel-radial-menu: religion radial value() - no player religion found!");
          return "";
        }
        const numPantheonsToAdd = playerReligion.getNumPantheonsUnlocked();
        const mustAddPantheons = numPantheonsToAdd > 0;
        if (mustAddPantheons) {
          return "screen-pantheon-chooser";
        } else {
          return "panel-pantheon-complete";
        }
      } else if (Game.age == Database.makeHash("AGE_EXPLORATION")) {
        const localPlayerID = GameContext.localPlayerID;
        if (Players.isValid(localPlayerID)) {
          const localPlayer = Players.get(localPlayerID);
          if (!localPlayer) {
            console.error("panel-radial-menu: religion menu icon value() - localPlayer was null!");
            return "";
          }
          if (localPlayer.Religion?.canCreateReligion()) {
            return "panel-religion-picker";
          } else {
            return "panel-belief-picker";
          }
        }
      }
      return "";
    }
  },
  tutHidderId: "hideReligion",
  sortOrder: 90,
  //excludedAge: Database.makeHash("AGE_MODERN"),
  requiredCapabilities: ["CAPABILITY_RELIGION_UI"],
  description: () => {
    const playerReligion = Players.get(GameContext.localPlayerID)?.Religion;
    if (!playerReligion) {
      console.error(`Religion radial menu entry: no player religion library for local player!`);
      return "";
    }
    const religionType = playerReligion.getReligionType();
    const numPantheon = playerReligion.getNumPantheons();
    const pantheons = playerReligion.getPantheons();
    const { Name: PantheonName = "", BeliefType = "" } = numPantheon == 1 && pantheons?.[0] ? GameInfo.Beliefs.lookup(pantheons?.[0]) ?? {} : {};
    const religionDef = GameInfo.Religions.lookup(religionType ?? 0);
    let religionTypeString = void 0;
    let religionName = void 0;
    if (religionDef) {
      religionTypeString = religionDef.ReligionType;
      religionName = playerReligion.getReligionName();
    }
    const renderHeight = window.innerHeight;
    if (!PantheonName && !religionName) {
      return "";
    }
    return `
			<div class="font-body text-accent-4 max-w-full truncate mt-4 ${renderHeight > 720 ? "text-sm" : "text-xs"}" data-l10n-id="${!BeliefType ? "LOC_UI_RADIAL_MENU_DETAILS_RELIGION_TITLE" : "LOC_UI_RADIAL_MENU_DETAILS_RELIGION_PANTHEON"}"></div>
			<div class="font-fit-shrink whitespace-nowrap font-bold text-accent-2 uppercase truncate w-62 text-center ${renderHeight > 720 ? "text-base" : "text-sm"}">${PantheonName || religionName}</div>
			<div class="flow-row">
				<div class="radial-menu__name-filigree-left"></div>
				<div class="radial-menu__name-filigree-right"></div>
			</div>
			<div class="img-civics-icon-frame bg-cover w-16 h-16 mt-2 flow-row justify-center items-center">
				<fxs-icon class="w-10 h-10" data-icon-id="${BeliefType || religionTypeString}"></fxs-icon>
			</div>
		`;
  }
});
registerRadialMenuItem(GameSymbol, {
  title: "LOC_UI_RADIAL_MENU_DETAILS_CIVILOPEDIA_TITLE",
  icon1: "RADIAL_CIVILOPEDIA",
  navigation: {
    type: NavigationType.CONTEXT,
    value: () => "screen-civilopedia"
  },
  sortOrder: 1e3
});

export { GameSymbol };
//# sourceMappingURL=radial-menu-items.js.map

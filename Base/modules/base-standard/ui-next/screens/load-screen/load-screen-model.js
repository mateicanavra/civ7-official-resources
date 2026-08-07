import { createMemo, createEffect } from '../../../../core/vendor/solid-js/dist/solid.js';
import { createMutable } from '../../../../core/vendor/solid-js/store/dist/store.js';
import { Filigree } from '../../../../core/ui-next/components/filigree.js';
import { Flipbook } from '../../../../core/ui-next/components/flipbook.js';
import { HeroButton2 } from '../../../../core/ui-next/components/hero-button.js';
import { RadioButton } from '../../../../core/ui-next/components/radio-button.js';
import { Tab } from '../../../../core/ui-next/components/tab.js';
import { ComponentRegistry } from '../../../../core/ui-next/services/component-registry.js';
import { ComponentUtilities } from '../../../../core/ui-next/utilities/component-utilities.js';
import { createArraySignal } from '../../../../core/ui-next/utilities/solid-utilities.js';

const LoadCurtainClosedEventName = "load-curtain-closed-event";
class LoadCurtainClosedEvent extends CustomEvent {
  constructor(detail) {
    super(LoadCurtainClosedEventName, { bubbles: false, cancelable: true, detail });
  }
}
function getCivLoadingInfo() {
  const gameConfig = Configuration.getGame();
  const playerConfig = Configuration.getPlayer(GameContext.localPlayerID);
  if (!gameConfig || !playerConfig) {
    return null;
  }
  const ageTypeName = gameConfig.startAgeName;
  const leaderTypeName = playerConfig.leaderTypeName;
  const civTypeName = playerConfig.civilizationTypeName;
  if (ageTypeName && civTypeName && leaderTypeName) {
    const loadingInfos = GameInfo.LoadingInfo_Civilizations.filter((info) => {
      const ageTypeOverride = info.AgeTypeOverride;
      const leaderTypeOverride = info.LeaderTypeOverride;
      return info.CivilizationType == civTypeName && (ageTypeOverride == null || ageTypeOverride == ageTypeName) && (leaderTypeOverride == null || leaderTypeOverride == leaderTypeName);
    });
    loadingInfos.sort((a, b) => {
      const a_score = (a.LeaderTypeOverride ? 10 : 0) + (a.AgeTypeOverride ? 1 : 0);
      const b_score = (b.LeaderTypeOverride ? 10 : 0) + (b.AgeTypeOverride ? 1 : 0);
      return a_score - b_score;
    });
    if (loadingInfos.length > 0) {
      return loadingInfos[0];
    }
  }
  return null;
}
function getLeaderLoadingInfo() {
  const gameConfig = Configuration.getGame();
  const playerConfig = Configuration.getPlayer(GameContext.localPlayerID);
  if (!gameConfig || !playerConfig) {
    return null;
  }
  const ageTypeName = gameConfig.startAgeName;
  const leaderTypeName = playerConfig.leaderTypeName;
  const civTypeName = playerConfig.civilizationTypeName;
  if (ageTypeName && civTypeName && leaderTypeName) {
    const loadingInfos = GameInfo.LoadingInfo_Leaders.filter((info) => {
      const ageTypeOverride = info.AgeTypeOverride;
      const civTypeOverride = info.CivilizationTypeOverride;
      return info.LeaderType == leaderTypeName && (ageTypeOverride == null || ageTypeOverride == ageTypeName) && (civTypeOverride == null || civTypeOverride == civTypeName);
    });
    loadingInfos.sort((a, b) => {
      const a_score = (a.CivilizationTypeOverride ? 10 : 0) + (a.AgeTypeOverride ? 1 : 0);
      const b_score = (b.CivilizationTypeOverride ? 10 : 0) + (b.AgeTypeOverride ? 1 : 0);
      return a_score - b_score;
    });
    if (loadingInfos.length > 0) {
      return loadingInfos[0];
    }
  }
  return null;
}
function createLeaderModel(playerConfig, loadingLeaderInfo) {
  const leaderName = loadingLeaderInfo?.LeaderNameTextOverride ?? playerConfig.leaderName ?? "ERROR: Missing Leader Name";
  const leaderDescription = loadingLeaderInfo?.LeaderText ?? "";
  const leaderType = playerConfig.leaderTypeName;
  const leaderBonusItems = Database.query("config", "select * from LeaderItems order by SortIndex")?.filter(
    (item) => item.LeaderType == leaderType
  );
  const leaderTrait = leaderBonusItems?.find((item) => item.Kind == "KIND_TRAIT");
  const tags = Database.query(
    "config",
    "select * from LeaderTags inner join Tags on LeaderTags.TagType = Tags.TagType inner join TagCategories on Tags.TagCategoryType = TagCategories.TagCategoryType"
  )?.filter((tag) => !tag.HideInDetails && tag.LeaderType == leaderType).map((tag) => tag.Name) ?? [];
  return {
    name: leaderName,
    description: leaderDescription,
    attributes: tags,
    abilityType: "LOC_LOADING_LEADER_ABILITY",
    abilityName: leaderTrait?.Name ?? "",
    abilityDescription: leaderTrait?.Description ?? ""
  };
}
function createCivModel(playerConfig, loadingCivInfo) {
  const civName = loadingCivInfo?.CivilizationNameTextOverride ?? playerConfig.civilizationFullName ?? playerConfig.civilizationName ?? "ERROR: Missing Civilizaiton Name";
  const civType = playerConfig.civilizationTypeName;
  const tags = Database.query(
    "config",
    "select * from CivilizationTags inner join Tags on CivilizationTags.TagType = Tags.TagType inner join TagCategories on Tags.TagCategoryType = TagCategories.TagCategoryType"
  )?.filter((tag) => !tag.HideInDetails && tag.CivilizationType == civType).map((tag) => tag.Name) ?? [];
  const civItems = Database.query("config", "select * from CivilizationItems order by SortIndex")?.filter(
    (item) => item.CivilizationType == civType
  ) ?? [];
  const ability = (
    // First use trait matching the current age
    civItems.find(
      (item) => item.Kind == "KIND_TRAIT" && Database.makeHash(item.AgeType) == Configuration.getGame().startAgeType
    ) ?? // Then try to find a trait without an age
    civItems.find((item) => item.Kind == "KIND_TRAIT" && !item.AgeType) ?? // Then use any trait
    civItems.find((item) => item.Kind == "KIND_TRAIT")
  );
  return {
    name: civName,
    description: loadingCivInfo?.CivilizationText ?? "",
    attributes: tags,
    abilityType: "LOC_LOADING_CIVILIZATION_ABILITY",
    abilityName: ability?.Name ?? "",
    abilityDescription: ability?.Description ?? ""
  };
}
function getAgeData() {
  const currentAge = GameInfo.Ages[Configuration.getGame().startAgeType].AgeType;
  const ageData = /* @__PURE__ */ new Map();
  Database.query("config", "SELECT * FROM Ages")?.forEach(
    ({ AgeType, PlayerCivilizationDomain, Name, SortIndex }) => {
      ageData.set(AgeType, {
        AgeType,
        Name,
        SortIndex,
        IsCurrent: currentAge == AgeType
      });
      ageData.set(PlayerCivilizationDomain, AgeType);
    }
  );
  return ageData;
}
function getConfigItemsForAge(civTrait, kinds) {
  const ageData = getAgeData();
  const configItems = Database.query(
    "config",
    `select * from CivilizationItems WHERE Kind IN (${kinds.map((item) => `'${item}'`).join(", ")}) AND CivilizationType = '${civTrait?.CivilizationType}' order by SortIndex`
  );
  if (!configItems) return [];
  for (const item of configItems) {
    const ageType = item.AgeType ?? ageData.get(item.CivilizationDomain);
    item.AgeType = ageType;
  }
  return configItems;
}
function convertConstructibleDefToModel(constructible, kind) {
  return {
    kind,
    name: constructible.Name,
    description: constructible.Description ? constructible.Description : "",
    icon: UI.getIconCSS(constructible.ConstructibleType, "BUILDING") ?? "",
    isUniqueQuarter: false,
    isAvailable: true
  };
}
function createConstructiblesModel(civTrait) {
  const constructiblesModel = [];
  const processedConstructibles = [];
  const ageData = getAgeData();
  if (civTrait) {
    const configConstructibles = getConfigItemsForAge(civTrait, [
      "KIND_BUILDING",
      "KIND_QUARTER",
      "KIND_IMPROVEMENT"
    ]);
    const uniqueQuarters = GameInfo.UniqueQuarters.filter((q) => q.TraitType == civTrait.TraitType);
    for (const uniqueQuarter of uniqueQuarters) {
      constructiblesModel.push({
        kind: "KIND_QUARTER",
        name: uniqueQuarter.Name,
        description: uniqueQuarter.Description,
        icon: 'url("blp:city_uniquequarter")',
        isUniqueQuarter: true,
        isAvailable: true
      });
      processedConstructibles.push(uniqueQuarter.UniqueQuarterType);
    }
    for (const uniqueQuarter of configConstructibles.filter(
      (q) => !processedConstructibles.includes(q.Type) && q.Kind == "KIND_QUARTER"
    )) {
      constructiblesModel.push({
        kind: "KIND_QUARTER",
        name: uniqueQuarter.Name,
        description: uniqueQuarter.Description,
        icon: 'url("blp:city_uniquequarter")',
        isUniqueQuarter: true,
        isAvailable: false,
        ageName: ageData.get(uniqueQuarter.AgeType).Name
      });
      processedConstructibles.push(uniqueQuarter.Type);
    }
    const buildings = GameInfo.Buildings.filter((b) => b.TraitType == civTrait.TraitType).map(
      (building) => GameInfo.Constructibles.lookup(building.ConstructibleType)
    );
    for (const building of buildings) {
      if (building) {
        constructiblesModel.push(convertConstructibleDefToModel(building, "KIND_BUILDING"));
        processedConstructibles.push(building.ConstructibleType);
      }
    }
    for (const building of configConstructibles.filter(
      (q) => !processedConstructibles.includes(q.Type) && q.Kind == "KIND_BUILDING"
    )) {
      constructiblesModel.push({
        kind: "KIND_BUILDING",
        name: building.Name,
        description: building.Description,
        icon: UI.getIconCSS(building.Type, "BUILDING") ?? "",
        isUniqueQuarter: false,
        isAvailable: false,
        ageName: ageData.get(building.AgeType).Name
      });
      processedConstructibles.push(building.Type);
    }
    const improvements = GameInfo.Improvements.filter((i) => i.TraitType == civTrait.TraitType).map(
      (improvement) => GameInfo.Constructibles.lookup(improvement.ConstructibleType)
    );
    for (const improvement of improvements) {
      if (improvement) {
        constructiblesModel.push(convertConstructibleDefToModel(improvement, "KIND_IMPROVEMENT"));
        processedConstructibles.push(improvement.ConstructibleType);
      }
    }
    for (const improvement of configConstructibles.filter(
      (q) => !processedConstructibles.includes(q.Type) && q.Kind == "KIND_IMPROVEMENT"
    )) {
      constructiblesModel.push({
        kind: "KIND_IMPROVEMENT",
        name: improvement.Name,
        description: improvement.Description,
        icon: UI.getIconCSS(improvement.Type, "BUILDING") ?? "",
        isUniqueQuarter: false,
        isAvailable: false,
        ageName: ageData.get(improvement.AgeType).Name
      });
      processedConstructibles.push(improvement.Type);
    }
  }
  return constructiblesModel;
}
function createUnitsModel(civTrait) {
  const units = [];
  const processedUnits = [];
  if (civTrait) {
    for (const unit of GameInfo.Units.filter((u) => u.TraitType == civTrait.TraitType)) {
      const query = "SELECT Description from CivilizationItems where Type=?";
      const baseDescription = Database.query("config", query, unit.UnitType)?.[0]?.Description;
      if (baseDescription) {
        units.push({
          name: unit.Name,
          description: baseDescription,
          icon: UI.getIconCSS(unit.UnitType, "UNIT_FLAG"),
          isAvailable: true
        });
        processedUnits.push(unit.UnitType);
      }
    }
    const ageData = getAgeData();
    const configUnits = getConfigItemsForAge(civTrait, ["KIND_UNIT"]);
    if (configUnits) {
      for (const unit of configUnits) {
        if (processedUnits.includes(unit.Type)) continue;
        units.push({
          name: unit.Name ?? "",
          description: unit.Description ?? "",
          icon: UI.getIconCSS(unit.Type, "UNIT_FLAG"),
          ageName: ageData.get(unit.AgeType).Name,
          isAvailable: false
        });
      }
    }
  }
  return units;
}
function createTraditionsModel(civTrait) {
  const traditions = [];
  if (civTrait) {
    const ageType = GameInfo.Ages.lookup(Configuration.getGame().startAgeType)?.AgeType ?? "";
    const syncretismUnlocks = GameInfo.CivSelfSyncretismUnlocks.filter(
      (r) => r.CivilizationType == civTrait.CivilizationType
    ).map((r) => r.UnlockType);
    const foundTraditions = GameInfo.Traditions.filter(
      (t) => t.TraitType == civTrait.TraitType && (!t.AgeType || t.AgeType == ageType)
    );
    for (const tradition of foundTraditions) {
      if (!tradition.IsCrisis) {
        let civicName = "";
        if (syncretismUnlocks.includes(tradition.TraditionType)) {
          civicName = "LOC_UI_SYNCRETISM_TITLE";
        } else {
          const unlockNode = GameInfo.ProgressionTreeNodeUnlocks.find(
            (node) => node.TargetType == tradition.TraditionType
          );
          if (unlockNode) {
            const node = GameInfo.ProgressionTreeNodes.find(
              (node2) => node2.ProgressionTreeNodeType == unlockNode.ProgressionTreeNodeType
            );
            civicName = node?.Name ?? "";
          }
        }
        traditions.push({ name: tradition.Name, description: tradition.Description ?? "", civic: civicName });
      }
    }
  }
  return traditions;
}
function createMementosModel() {
  const mementoData = [];
  const equippedMementos = [
    {
      mementoType: Configuration.getPlayer(GameContext.localPlayerID).getValue("MajorMemento"),
      slotType: "PlayerMementoMajorSlot"
    },
    {
      mementoType: Configuration.getPlayer(GameContext.localPlayerID).getValue("MinorMemento1"),
      slotType: "PlayerMementoMinorSlot1"
    }
  ];
  const mementoSlots = Online.Metaprogression.getMementoSlotData();
  for (const slot of mementoSlots) {
    const equippedType = equippedMementos.find((e) => e.slotType == slot.mementoTypeId)?.mementoType;
    if (equippedType) {
      const memento = GameInfo.Mementos.filter((m) => m.MementoType == equippedType)[0];
      const icon = Database.query(
        "config",
        `SELECT CustomData AS Icon FROM Rewards WHERE GameItemID='${equippedType}'`
      )?.[0]?.Icon;
      if (slot.displayType != DisplayType.DISPLAY_HIDDEN) {
        mementoData.push({
          isLocked: slot.displayType == DisplayType.DISPLAY_LOCKED,
          isEmpty: equippedType == "NONE",
          unlockReason: slot.unlockTitle,
          name: memento?.Name ?? "",
          description: memento?.FunctionalDescription ?? "",
          flavorText: memento?.Description ?? "",
          icon: icon ? `url("blp:${icon}")` : void 0
        });
      }
    }
  }
  return mementoData;
}
function createLoadScreenInfo() {
  const leaderInfo = getLeaderLoadingInfo();
  const civInfo = getCivLoadingInfo();
  const playerConfig = Configuration.getPlayer(GameContext.localPlayerID);
  if (!playerConfig) {
    return;
  }
  if (!playerConfig.leaderTypeName || !playerConfig.civilizationTypeName) {
    console.error("Missing necessary data for loading screen.");
    return;
  }
  const civTrait = GameInfo.LegacyCivilizationTraits.lookup(playerConfig.civilizationTypeName);
  const leaderImagePath = leaderInfo?.LeaderImage;
  const leaderImage = leaderImagePath ? `url(${leaderImagePath})` : "";
  const civImagePath = window.innerWidth >= 1080 ? civInfo?.BackgroundImageHigh : civInfo?.BackgroundImageLow;
  const civImage = civImagePath ? `url(${civImagePath})` : "";
  const tipText = civInfo?.Tip ?? "";
  return {
    data: {
      backgroundImage: civImage,
      leaderImage,
      tipText,
      leaderInfo: createLeaderModel(playerConfig, leaderInfo),
      civInfo: createCivModel(playerConfig, civInfo),
      unitInfo: createUnitsModel(civTrait),
      constructibleInfo: createConstructiblesModel(civTrait),
      traditionInfo: createTraditionsModel(civTrait),
      mementoInfo: createMementosModel()
    },
    audio: {
      leaderAudioTag: leaderInfo?.Audio,
      civAudioTag: civInfo?.Audio
    }
  };
}
function reloadStyles() {
  const stylesheets = document.head.querySelectorAll("link[rel=stylesheet]");
  for (const stylesheet of stylesheets) {
    stylesheet.href.replace(/\?.*|$/, "?" + Date.now());
  }
}
function createLoadScreenModel() {
  const gameConfig = Configuration.getGame();
  const startOnCivTab = gameConfig.isSavedGame || gameConfig.previousAgeCount > 0;
  const isAgeTransition = Modding.getTransitionInProgress() !== TransitionType.None;
  let loadScreenInfo;
  let playingAudio;
  let playedAudioFinished = false;
  let blockFurtherAudio = false;
  let queuedAudio;
  let queuedTimeoutHandle;
  let isBenchmark = false;
  try {
    isBenchmark = Benchmark?.Game?.isRunning();
  } catch (_) {
  }
  const model = createMutable({
    data: void 0,
    progress: 0,
    canBeginGame: false,
    onBeginGame: handleGameStart,
    onTabChanged: handleTabChanged,
    startOnCivTab,
    hideBeginButton: Configuration.getGame().isNetworkMultiplayer || Configuration.getGame().isHotseat || isBenchmark
  });
  function playQueuedAudio(timeout) {
    queuedTimeoutHandle = window.setTimeout(() => {
      if (queuedAudio) {
        UI.sendAudioEvent(queuedAudio);
      }
    }, timeout);
  }
  function cancelQueuedAudio() {
    queuedAudio = void 0;
    if (queuedTimeoutHandle) {
      window.clearTimeout(queuedTimeoutHandle);
    }
  }
  function handleGameStart() {
    blockFurtherAudio = true;
    cancelQueuedAudio();
    UI.notifyUIReady();
    if (Configuration.getXR()) {
      XR.Atlas.invokeEvent(EViewID.MultiquadFrame, "begin-game", "");
    }
  }
  function handleTabChanged(tab) {
    model.currentTab = tab?.name;
    if (startOnCivTab || !tab || tab.name == "leader-info") {
      return;
    }
    if (loadScreenInfo && !isAgeTransition) {
      const newlyQueued = !queuedAudio;
      queuedAudio = loadScreenInfo.audio.civAudioTag;
      if (playedAudioFinished && queuedAudio && newlyQueued && !blockFurtherAudio) {
        playQueuedAudio(1e3);
      }
    }
  }
  function handleAudioFinished(tag) {
    if (tag == playingAudio) {
      playedAudioFinished = true;
      if (queuedAudio && !blockFurtherAudio) {
        playQueuedAudio(2e3);
      }
    }
  }
  const [statesToLoad, mutateStatesToLoad] = createArraySignal([
    // Already loaded on start (add to total state weight):
    // { state: UIGameLoadingProgressState.ContentIsConfigured, weight: 5 },
    { state: UIGameLoadingProgressState.GameCoreInitializationIsStarted, weight: 2 },
    { state: UIGameLoadingProgressState.GameIsInitialized, weight: 2 },
    { state: UIGameLoadingProgressState.GameCoreInitializationIsDone, weight: 4 },
    { state: UIGameLoadingProgressState.GameIsFinishedLoading, weight: 2 },
    { state: UIGameLoadingProgressState.UIIsInitialized, weight: 5 },
    { state: UIGameLoadingProgressState.UIIsReady, weight: 3 }
  ]);
  const currentLoadStateWeight = createMemo(() => statesToLoad().reduce((a, b) => a + b.weight, 0));
  const totalLoadStateWeight = currentLoadStateWeight() + 5;
  function setLoadStateComplete(state) {
    mutateStatesToLoad((states) => {
      const indexToRemove = states.findIndex((s) => s.state == state);
      if (indexToRemove >= 0) {
        states.splice(indexToRemove, 1);
      }
    });
  }
  if (UI.getGameLoadingState() == UIGameLoadingState.GameStarted) {
    return model;
  }
  function updateLoadingProgress(data) {
    setLoadStateComplete(data.UIGameLoadingProgressState);
  }
  createEffect(() => {
    const progress = (totalLoadStateWeight - currentLoadStateWeight()) / totalLoadStateWeight * 100 + 1;
    model.progress = progress;
  });
  engine.whenReady.then(() => {
    engine.on("UIGameLoadingProgressChanged", updateLoadingProgress);
  });
  ComponentRegistry.preloadComponents(Flipbook.Hourglass).then(() => {
    const preloadImages = [
      // from load-scren.scss
      "blp:base_frame-filigree",
      "blp:hud_unit-panel_empty-slot",
      "blp:prof_btn_bk",
      "blp:meter_well",
      "blp:meter_fill",
      "blp:unlock_tradition",
      "blp:city_uniquequarter",
      "fs://game/xb1_icon_right_bumper",
      "fs://game/xb1_icon_left_bumper",
      "fs://game/xb1_icon_right_stick",
      "fs://game/switch_icon_right_bumper",
      "fs://game/switch_icon_left_bumper",
      "fs://game/switch_icon_right_stick",
      "fs://game/ps4_icon_right_bumper",
      "fs://game/ps4_icon_left_bumper",
      "fs://game/ps4_icon_right_stick"
    ];
    for (const attr of GameInfo.Attributes) {
      const iconURL = UI.getIconURL(attr.AttributeType, "OUTLINE");
      if (iconURL) {
        preloadImages.push(iconURL);
      }
    }
    const additionalIcons = [
      "ATTRIBUTE",
      "CITYSTATE",
      "COMMANDER_RADIUS",
      "COMMENDATION",
      "DIPLOMATIC_ACTION",
      "ENDEAVOR",
      "ESPIONAGE",
      "GREATWORK",
      "HOMELAND",
      "TRADE_ROUTE",
      "TREASURE_FLEET",
      "UNIT_SIGHT",
      "WAR",
      "YIELD_CITIES",
      //"YIELD_ENVOYS",
      "YIELD_POPULATION",
      "YIELD_HAPPINESS",
      "YIELD_TRADES",
      "RADIAL_TECH",
      "UNIT_ARMY_COMMANDER"
    ];
    for (const y of GameInfo.Yields) {
      additionalIcons.push(y.YieldType);
    }
    for (const icon of additionalIcons) {
      const iconURL = UI.getIconURL(icon);
      if (iconURL) {
        preloadImages.push(iconURL);
      }
    }
    const celebIcon = UI.getIconURL("NOTIFICATION_CHOOSE_GOLDEN_AGE", "FONTICON");
    if (celebIcon) {
      preloadImages.push(celebIcon);
    }
    const cssURLRegEx = /url\((.+)\)/;
    const parseCSSUrl = (css) => {
      css = css.replaceAll("'", "");
      css = css.replaceAll('"', "");
      const m = cssURLRegEx.exec(css);
      if (m && m[1]) {
        return m[1];
      }
      return null;
    };
    const playerConfig = Configuration.getPlayer(GameContext.localPlayerID);
    if (playerConfig && playerConfig.leaderTypeName && playerConfig.civilizationTypeName) {
      if (playerConfig.leaderTypeName != "RANDOM" && playerConfig.civilizationTypeName != "RANDOM") {
        const earlyInfo = createLoadScreenInfo();
        if (earlyInfo) {
          const info = earlyInfo.data;
          const backgroundImage = parseCSSUrl(info.backgroundImage);
          if (backgroundImage) {
            preloadImages.push(backgroundImage);
          }
          const leaderImage = parseCSSUrl(info.leaderImage);
          if (leaderImage) {
            preloadImages.push(leaderImage);
          }
          const locStrings = [];
          if (info.civInfo.description) {
            locStrings.push(info.civInfo.description);
          }
          if (info.civInfo.abilityDescription) {
            locStrings.push(info.civInfo.abilityDescription);
          }
          if (info.leaderInfo.description) {
            locStrings.push(info.leaderInfo.description);
          }
          if (info.leaderInfo.abilityDescription) {
            locStrings.push(info.leaderInfo.abilityDescription);
          }
          for (const t of info.constructibleInfo) {
            if (t.description) {
              locStrings.push(t.description);
            }
            const image = parseCSSUrl(t.icon);
            if (image) {
              preloadImages.push(image);
            }
          }
          for (const t of info.unitInfo) {
            if (t.description) {
              locStrings.push(t.description);
            }
            const image = parseCSSUrl(t.icon);
            if (image) {
              preloadImages.push(image);
            }
          }
          for (const t of info.traditionInfo) {
            if (t.description) {
              locStrings.push(t.description);
            }
          }
          for (const t of info.mementoInfo) {
            if (t.description) {
              locStrings.push(t.description);
            }
          }
          const icons = Locale.getIconTagsForLocStrings(locStrings);
          for (const icon of icons) {
            const iconURL = UI.getIconURL(icon, "FONTICON");
            if (iconURL) {
              preloadImages.push(iconURL);
            }
          }
        }
      }
    }
    Promise.all([
      ComponentRegistry.preloadComponents(
        Tab.TabListPips,
        HeroButton2,
        RadioButton,
        Filigree.H2,
        Filigree.H3,
        Filigree.H4
      ),
      ComponentUtilities.preloadImages(...preloadImages)
    ]).finally(() => {
      UI.notifyLoadingCurtainReady();
      Loading.runWhenInitialized(() => {
        window.addEventListener("global-scaling-ready", reloadStyles);
        UI.lockCursor(false);
        loadScreenInfo = createLoadScreenInfo();
        if (loadScreenInfo) {
          if (!isAgeTransition) {
            engine.on("AudioEventReturned", (tag) => handleAudioFinished(tag));
            const voTag = model.startOnCivTab ? loadScreenInfo.audio.civAudioTag ?? loadScreenInfo.audio.leaderAudioTag : loadScreenInfo.audio.leaderAudioTag ?? loadScreenInfo.audio.civAudioTag;
            if (voTag) {
              playingAudio = voTag;
              UI.sendAudioEventWithFinishedCallback(voTag);
            }
          }
          model.data = loadScreenInfo?.data;
        }
      });
    });
    Loading.runWhenLoaded(() => {
      mutateStatesToLoad((states) => {
        states.length = 0;
      });
      model.canBeginGame = true;
      if (UI.getGameLoadingState() == UIGameLoadingState.WaitingForUIReady) {
        UI.sendAudioEvent("main-menu-load-ready");
      }
      if (UI.getGameLoadingState() == UIGameLoadingState.GameStarted) {
        blockFurtherAudio = true;
        cancelQueuedAudio();
      }
      engine.off("UIGameLoadingProgressChanged", updateLoadingProgress);
    });
  });
  return model;
}

export { LoadCurtainClosedEvent, LoadCurtainClosedEventName, createLoadScreenModel, getCivLoadingInfo, getLeaderLoadingInfo };
//# sourceMappingURL=load-screen-model.js.map

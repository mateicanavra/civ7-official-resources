function resolveChoices(storyDef, targetStoryId, playerStories) {
  const choices = [];
  const tryAddChoice = (linkDef) => {
    const activation = linkDef.Activation.toUpperCase();
    const isLinked = activation === "LINKED";
    const isConditional = (activation === "LINKED_REQUISITE" || activation === "LINKED_COMMON" || activation === "LINKED_SUBJECT_REQUISITE") && playerStories.determineRequisiteLink(linkDef.NarrativeStoryType, targetStoryId);
    if (!isLinked && !isConditional) {
      return false;
    }
    const toLinkDef = GameInfo.NarrativeStories.lookup(linkDef.NarrativeStoryType);
    const hash = toLinkDef?.$hash ?? -1;
    const icons = GameInfo.NarrativeRewardIcons.filter(
      (item) => item.NarrativeStoryType === linkDef.NarrativeStoryType
    );
    choices.push({
      key: linkDef.NarrativeStoryType,
      mainText: Locale.stylize(
        playerStories.determineNarrativeInjection(targetStoryId, hash, StoryTextTypes.OPTION)
      ),
      rewardText: Locale.stylize(
        playerStories.determineNarrativeInjection(targetStoryId, hash, StoryTextTypes.REWARD)
      ),
      actionText: Locale.stylize(
        playerStories.determineNarrativeInjection(targetStoryId, hash, StoryTextTypes.IMPERATIVE)
      ),
      icons,
      canAfford: linkDef.Cost === 0 || playerStories.canAfford(linkDef.NarrativeStoryType)
    });
    return true;
  };
  if (storyDef.VariableLinks) {
    const variableLinks = playerStories.getOrderedLinks(targetStoryId) ?? [];
    for (const link of variableLinks) {
      const linkDef = GameInfo.NarrativeStories.lookup(link);
      if (linkDef) tryAddChoice(linkDef);
    }
  } else {
    const links = GameInfo.NarrativeStory_Links.filter(
      (def) => def.FromNarrativeStoryType === storyDef.NarrativeStoryType
    );
    for (const link of links) {
      const linkDef = GameInfo.NarrativeStories.lookup(link.ToNarrativeStoryType);
      if (linkDef) tryAddChoice(linkDef);
    }
  }
  if (choices.length === 0) {
    const icons = GameInfo.NarrativeRewardIcons.filter(
      (item) => item.RewardIconType !== "QUEST" && item.NarrativeStoryType === storyDef.NarrativeStoryType
    );
    choices.push({
      key: "CLOSE",
      mainText: Locale.stylize("LOC_NARRATIVE_STORY_END_STORY_NAME"),
      rewardText: Locale.stylize(
        playerStories.determineNarrativeInjectionComponentId(targetStoryId, StoryTextTypes.REWARD)
      ),
      actionText: "",
      icons,
      canAfford: true
    });
  }
  return choices;
}
function resolveStoryCoordinates(playerStories, targetStoryId) {
  const plotCoord = playerStories.getStoryPlotCoord(targetStoryId);
  if (!plotCoord) return null;
  const DEFAULT_COORD = { x: -9999, y: -9999 };
  if (plotCoord.x === DEFAULT_COORD.x && plotCoord.y === DEFAULT_COORD.y) {
    const player = Players.get(GameContext.localPlayerID);
    const cities = player?.Cities?.getCityIds() ?? [];
    for (const cityID of cities) {
      const city = Cities.get(cityID);
      if (city?.isCapital) {
        return { x: city.location.x + 1, y: city.location.y };
      }
    }
    return null;
  }
  return plotCoord;
}
function createSmallNarrativeEventData() {
  const player = Players.get(GameContext.localPlayerID);
  if (!player?.Stories) return null;
  const playerStories = player.Stories;
  const targetStoryId = playerStories.getFirstPendingMetId();
  if (!targetStoryId) return null;
  const story = playerStories.find(targetStoryId);
  if (!story) return null;
  const storyDef = GameInfo.NarrativeStories.lookup(story.type);
  if (!storyDef) return null;
  const storyType = storyDef.UIActivation === "DISCOVERY" ? "DISCOVERY" : "LIGHT";
  const bodyText = storyDef.Completion ? Locale.stylize(playerStories.determineNarrativeInjectionComponentId(targetStoryId, StoryTextTypes.BODY)) : "ERROR: Missing storyDef completion";
  return {
    targetStoryId,
    bodyText,
    choices: resolveChoices(storyDef, targetStoryId, playerStories),
    storyCoordinates: resolveStoryCoordinates(playerStories, targetStoryId),
    storyType,
    leaderCiv: ""
  };
}
function getPrimaryChoiceIcon(icons) {
  return icons.find((icon) => icon.RewardIconType !== "QUEST")?.RewardIconType ?? "";
}
function chooseNarrativeDirection(targetStoryId, choiceKey, icons) {
  const args = {
    TargetType: choiceKey,
    Target: targetStoryId,
    Action: PlayerOperationParameters.Activate
  };
  const result = Game.PlayerOperations.canStart(
    GameContext.localPlayerID,
    PlayerOperationTypes.CHOOSE_NARRATIVE_STORY_DIRECTION,
    args,
    false
  );
  if (!result.Success) return false;
  Game.PlayerOperations.sendRequest(
    GameContext.localPlayerID,
    PlayerOperationTypes.CHOOSE_NARRATIVE_STORY_DIRECTION,
    args
  );
  let usedDefaultAudio = true;
  if (icons.length > 0) {
    const audioEvent = GameInfo.NarrativeStory_RewardIcons.lookup(icons[0].RewardIconType)?.AudioName;
    if (audioEvent) {
      UI.sendAudioEvent(audioEvent);
      usedDefaultAudio = false;
    }
  }
  if (usedDefaultAudio) {
    UI.sendAudioEvent("narrative-choice-default");
  }
  return true;
}

export { chooseNarrativeDirection, createSmallNarrativeEventData, getPrimaryChoiceIcon };
//# sourceMappingURL=small-narrative-event-model.js.map

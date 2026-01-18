import QuestTracker from './quest-tracker.js';
import './quest-item.js';

class NarrativeQuestManagerClass {
  static instance = null;
  narrativeQuestUpdateListener = (event) => {
    this.onNarrativeQuestUpdate(event);
  };
  narrativeStoryRemovedListener = (event) => {
    this.onNarrativeStoryRemoved(event);
  };
  constructor() {
    if (NarrativeQuestManagerClass.instance) {
      console.error("Attempt to create more than one narrative quest manager class; ignoring call.");
    } else {
      NarrativeQuestManagerClass.instance = this;
      this.initializeListeners();
      this.initializeActiveNarrativeQuests();
    }
  }
  initializeListeners() {
    engine.on("NarrativeQuestUpdated", this.narrativeQuestUpdateListener);
    engine.on("NarrativeStoryRemoved", this.narrativeStoryRemovedListener);
  }
  //Query any quests already active (loading a game, hotloading)
  initializeActiveNarrativeQuests() {
    const playerStories = Players.get(GameContext.localObserverID)?.Stories;
    if (!playerStories) {
      console.error(
        "narrative-quest-manager: No valid PlayerStories object attached to player with id: " + GameContext.localObserverID.toString()
      );
      return;
    }
    const activeQuests = playerStories.getActiveQuests();
    if (!activeQuests) {
      return;
    }
    activeQuests.forEach((quest) => {
      const storyDef = GameInfo.NarrativeStories.lookup(quest.story);
      if (!storyDef) {
        console.error(
          "narrative-quest-manager: No valid story definition for NarrativeStoryType of " + quest.story.toString()
        );
        return;
      }
      let variableText = playerStories.determineNarrativeInjectionStoryType(
        quest.story,
        StoryTextTypes.IMPERATIVE
      );
      if (variableText === "") {
        variableText = playerStories.determineNarrativeInjectionStoryType(quest.story, StoryTextTypes.REWARD);
      }
      const questItem = {
        id: quest.storyId.toString(),
        system: "narrative",
        title: storyDef.StoryTitle ? Locale.compose(storyDef.StoryTitle) : Locale.compose(storyDef.Name),
        description: Locale.stylize(variableText),
        progressType: "",
        //TODO: Implement once data includes this
        progress: quest.progress != -1 ? quest.progress.toString() : void 0,
        goal: quest.goal != -1 ? quest.goal.toString() : void 0,
        endTurn: quest.endTurn
      };
      QuestTracker.add(questItem);
    });
  }
  onNarrativeQuestUpdate(event) {
    const playerStories = Players.get(GameContext.localObserverID)?.Stories;
    if (!playerStories) {
      console.error(
        "narrative-quest-manager: No valid PlayerStories object attached to player with id: " + GameContext.localObserverID.toString()
      );
      return;
    }
    if (event.player != GameContext.localObserverID) {
      return;
    }
    const storyDef = GameInfo.NarrativeStories.lookup(event.story);
    if (!storyDef) {
      console.error(
        "narrative-quest-manager: No valid story definition for NarrativeStoryType of " + event.story.toString()
      );
      return;
    }
    if (storyDef.Imperative == void 0) {
      console.error(
        "narrative-quest-manager: No valid Imperative variable (quest objective) for story definition with NarrativeStoryType of " + event.story.toString()
      );
    }
    let variableText = playerStories.determineNarrativeInjectionStoryType(event.story, StoryTextTypes.IMPERATIVE);
    if (variableText === "") {
      variableText = playerStories.determineNarrativeInjectionStoryType(event.story, StoryTextTypes.REWARD);
    }
    const questItem = {
      id: event.storyId.toString(),
      system: "narrative",
      title: storyDef.StoryTitle ? Locale.compose(storyDef.StoryTitle) : Locale.compose(storyDef.Name),
      description: Locale.stylize(variableText),
      progressType: "",
      //TODO: Implement once data includes this
      progress: event.progress != -1 ? event.progress.toString() : void 0,
      goal: event.goal != -1 ? event.goal.toString() : void 0,
      endTurn: event.endTurn
    };
    QuestTracker.add(questItem);
  }
  onNarrativeStoryRemoved(event) {
    if (event.player != GameContext.localObserverID) {
      return;
    }
    QuestTracker.remove(event.storyId.toString(), "narrative");
  }
}
const NarrativeQuestManager = new NarrativeQuestManagerClass();

export { NarrativeQuestManager as default };
//# sourceMappingURL=narrative-quest-manager.js.map

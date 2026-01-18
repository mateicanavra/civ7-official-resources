import { A as Audio } from '../../../core/ui/audio-base/audio-support.chunk.js';
import { F as FxsActivatable } from '../../../core/ui/components/fxs-activatable.chunk.js';
import { ActiveDeviceTypeChangedEventName } from '../../../core/ui/input/action-handler.js';
import FocusManager from '../../../core/ui/input/focus-manager.js';
import { a as LensActivationEventName } from '../../../core/ui/lenses/lens-manager.chunk.js';
import { P as Panel } from '../../../core/ui/panel-support.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { U as UpdateGate } from '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import QuestTracker, { QuestListUpdatedEventName } from './quest-tracker.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/input/input-support.chunk.js';
import './quest-item.js';

const styles = "fs://game/base-standard/ui/quest-tracker/quest-list.css";

const getQuestDescription = (item) => {
  return item.getDescriptionLocParams ? Locale.stylize(item.description, ...item.getDescriptionLocParams()) : Locale.stylize(item.description);
};
class QuestList extends Panel {
  questItemContainer;
  questItemList;
  questItemElements = [];
  questVisibilityToggle;
  bgQuestext;
  questVisibilityNavHelp;
  questNavHelpContainter;
  drawerOut = !this.selectOneMode;
  dirty = false;
  listVisibilityToggleListener = this.listVisibilityToggle.bind(this);
  engineInputListener = this.onEngineInput.bind(this);
  activeDeviceTypeListener = this.onActiveDeviceTypeChanged.bind(this);
  updateListener = this.updateQuestList.bind(this);
  activeLensChangedListener = this.onActiveLensChanged.bind(this);
  inputContextChangedListener = this.onInputContextChanged.bind(this);
  visibleQuests = [];
  get selectOneMode() {
    const viewExperience = UI.getViewExperience();
    return viewExperience == UIViewExperience.Handheld || viewExperience == UIViewExperience.Console;
  }
  onInitialize() {
    super.onInitialize();
    this.render();
    this.updateQuestList();
  }
  onEngineInput(inputEvent) {
    if (inputEvent.isCancelInput() && inputEvent.detail.status == InputActionStatuses.FINISH) {
      this.onCancelSelectQuest();
    }
    if (inputEvent.detail.name == "sys-menu" && inputEvent.detail.status == InputActionStatuses.FINISH) {
      this.onCancelSelectQuest();
    }
  }
  onAttach() {
    super.onAttach();
    this.Root.setAttribute("data-audio-group-ref", "journal");
    window.addEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener);
    window.addEventListener(QuestListUpdatedEventName, this.updateListener);
    window.addEventListener(LensActivationEventName, this.activeLensChangedListener);
    this.Root.addEventListener("engine-input", this.engineInputListener);
    this.questVisibilityToggle.addEventListener("action-activate", this.listVisibilityToggleListener);
    this.questVisibilityToggle.setAttribute("data-audio-group-ref", "journal");
    engine.on("PlayerTurnActivated", this.onPlayerTurnActivated, this);
    engine.on("UnitAddedToMap", this.onUnitAddedRemoved, this);
    engine.on("UnitRemovedFromMap", this.onUnitAddedRemoved, this);
    engine.on("InputContextChanged", this.inputContextChangedListener);
    QuestTracker.AddEvent.on(this.updateListener);
    QuestTracker.RemoveEvent.on(this.updateListener);
  }
  onDetach() {
    window.removeEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener);
    window.removeEventListener(QuestListUpdatedEventName, this.updateListener);
    window.removeEventListener(LensActivationEventName, this.activeLensChangedListener);
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    QuestTracker.AddEvent.off(this.updateListener);
    QuestTracker.RemoveEvent.off(this.updateListener);
    engine.off("PlayerTurnActivated", this.onPlayerTurnActivated, this);
    engine.off("UnitAddedToMap", this.onUnitAddedRemoved, this);
    engine.off("UnitRemovedFromMap", this.onUnitAddedRemoved, this);
    engine.off("InputContextChanged", this.inputContextChangedListener);
    super.onDetach();
  }
  onActiveLensChanged(event) {
    const shouldHide = event.detail.hasLegend;
    this.Root.classList.toggle("hidden", shouldHide);
  }
  onActiveDeviceTypeChanged({ detail: { gamepadActive } }) {
    this.questVisibilityToggle.classList.toggle("hidden", gamepadActive);
    this.bgQuestext.classList.toggle("fxs-nav-help", gamepadActive);
  }
  listVisibilityToggle() {
    if ((QuestTracker.empty || this.visibleQuests.length == 0) && !this.drawerOut) {
      return;
    }
    this.drawerOut = !this.drawerOut;
    const audioId = this.drawerOut ? "data-audio-journal-open" : "data-audio-journal-close";
    Audio.playSound(audioId, "journal");
    if (this.selectOneMode) {
      if (this.drawerOut) {
        Input.setActiveContext(InputContext.Dual);
        FocusManager.setFocus(this.questItemList);
      } else {
        Input.setActiveContext(InputContext.World);
        FocusManager.clearFocus();
      }
    }
    this.updateQuestContainerVisibility();
  }
  onUnitAddedRemoved(data) {
    if (data.unit.owner == GameContext.localPlayerID) {
      this.queueUpdate();
    }
  }
  queueUpdate() {
    if (!this.dirty) {
      this.dirty = true;
      requestAnimationFrame(() => {
        this.updateQuestList();
        this.dirty = false;
      });
    }
  }
  updateQuestContainerVisibility() {
    this.questVisibilityToggle.dataset.disabled = QuestTracker.empty || this.visibleQuests.length == 0 ? "true" : "false";
    const showQuests = !QuestTracker.empty && this.visibleQuests.length > 0 && this.drawerOut;
    if (showQuests || this.selectOneMode) {
      this.questItemContainer.classList.remove("-translate-x-full", "opacity-0");
    } else {
      this.questItemContainer.classList.add("-translate-x-full", "opacity-0");
    }
    for (const questItem of this.questItemElements) {
      const isSelected = this.selectOneMode && questItem.getAttribute("data-quest-id") == QuestTracker.selectedQuest;
      questItem.classList.toggle("hidden", !this.drawerOut && !isSelected);
    }
    const type = showQuests ? "minus" : "plus";
    this.questVisibilityToggle.setAttribute("type", type);
    this.questVisibilityToggle.classList.toggle("invisible", this.visibleQuests.length == 0);
    this.bgQuestext.classList.toggle("invisible", this.visibleQuests.length == 0);
    if (this.selectOneMode) {
      this.questVisibilityNavHelp.setAttribute(
        "action-key",
        showQuests ? "inline-cancel" : "inline-toggle-quest"
      );
    }
  }
  updateQuestList() {
    const player = Players.get(GameContext.localObserverID);
    if (player) {
      if (player.isTurnActive) {
        this.updateGate.call("updateQuestList");
      }
    } else {
      if (!Autoplay.isActive) {
        console.error("quest-list: updateQuestList() couldn't get local player");
      }
      this.updateGate.call("updateQuestList");
    }
  }
  updateGate = new UpdateGate(() => {
    this.visibleQuests.length = 0;
    while (this.questItemList.hasChildNodes()) {
      this.questItemList.removeChild(this.questItemList.lastChild);
    }
    const questItems = QuestTracker.getItems();
    this.visibleQuests = Array.from(questItems).filter((item) => {
      if (!item.victory) {
        return true;
      }
      const isVisible = QuestTracker.isQuestVictoryInProgress(item.id);
      return isVisible;
    });
    let selectedQuestFound = false;
    for (const item of this.visibleQuests) {
      const questItemElement = document.createElement("quest-item");
      questItemElement.setAttribute("data-quest-id", item.id);
      questItemElement.addEventListener("action-activate", this.onSelectQuest.bind(this));
      questItemElement.classList.toggle("cursor-pointer", this.selectOneMode);
      questItemElement.classList.toggle("quest-list-item-selectable", this.selectOneMode);
      this.questItemList.appendChild(questItemElement);
      this.questItemElements.push(questItemElement);
      if (item.id == QuestTracker.selectedQuest) {
        selectedQuestFound = true;
      }
    }
    if (this.visibleQuests.length > 0 && !selectedQuestFound) {
      QuestTracker.selectedQuest = this.visibleQuests[0].id;
    }
    if (this.visibleQuests.length > 0) {
      this.questVisibilityNavHelp.classList.remove("opacity-0");
    } else {
      this.questVisibilityNavHelp.classList.add("opacity-0");
    }
    this.updateQuestContainerVisibility();
  });
  onSelectQuest(event) {
    QuestTracker.selectedQuest = event.target?.getAttribute("data-quest-id") ?? "";
    if (this.selectOneMode) {
      this.listVisibilityToggle();
    }
  }
  onCancelSelectQuest() {
    if (this.selectOneMode) {
      this.listVisibilityToggle();
    }
  }
  onPlayerTurnActivated(data) {
    if (data.player == GameContext.localObserverID) {
      this.updateQuestList();
    }
  }
  onInputContextChanged(contextData) {
    if (contextData.newContext != InputContext.Dual) {
      this.questNavHelpContainter.classList.remove("invisible");
    } else {
      this.questNavHelpContainter.classList.add("invisible");
    }
  }
  render() {
    this.Root.classList.add("flex", "flex-row", "ml-11", "pointer-events-none", "text-shadow");
    this.Root.innerHTML = `
			<div class="quest-list__expand-container flex flex-col items-center w-4 -mt-6 mr-3" data-bind-class-toggle="mr-6:{{g_NavTray.isTrayRequired}}">
				<div class="quest-list__img-questext w-4 h-16 -z-1 img-questext"></div>
				<fxs-minus-plus class="relative -top-5"></fxs-minus-plus>
				<div class="quest-list__nav-help-container relative w-8">
					<fxs-nav-help class="relative w-8 -top-10" action-key="inline-toggle-quest" decoration-mode="border"></fxs-nav-help>
				</div>
			</div>
			<div class="relative flex flex-col quest-item-container">
				<div class="font-title-lg mb-1" data-l10n-id="LOC_UI_QUEST_TRACKER_TITLE"></div>
				<fxs-scrollable class="max-h-72">
					<fxs-vslot tabindex="-1" data-navrule-down="stop" data-navrule-up="stop" class="quest-item-list pr-3"></fxs-vslot>
				</fxs-scrollable>
			</div>
		`;
    this.bgQuestext = MustGetElement(".quest-list__img-questext", this.Root);
    this.questVisibilityToggle = MustGetElement("fxs-minus-plus", this.Root);
    this.questVisibilityNavHelp = MustGetElement("fxs-nav-help", this.Root);
    this.questNavHelpContainter = MustGetElement(".quest-list__nav-help-container", this.Root);
    this.questItemContainer = MustGetElement(".quest-item-container", this.Root);
    this.questItemList = MustGetElement(".quest-item-list", this.Root);
    const highlightObj = document.createElement("div");
    highlightObj.classList.add("quest-list__highlight", "rotate-90");
    highlightObj.setAttribute("data-tut-highlight", "downArrowHighlighter");
    this.questItemContainer.appendChild(highlightObj);
  }
}
Controls.define("quest-list", {
  createInstance: QuestList,
  description: "Small panel for quick glance of tracking items",
  styles: [styles],
  images: ["fs://game/hud_quest_grad.png"]
});
class QuestItemElement extends FxsActivatable {
  onInitialize() {
    super.onInitialize();
    this.render();
  }
  render() {
    const id = this.Root.getAttribute("data-quest-id");
    if (!id) {
      console.error("QuestItemElement: No quest id found.");
      return;
    }
    const quest = QuestTracker.get(id);
    if (!quest) {
      console.error("QuestItemElement: No quest found for id: " + id);
      return;
    }
    const { title, progress, progressType, goal, endTurn } = quest;
    this.Root.classList.add("flex", "flex-col", "font-body", "leading-relaxed");
    this.Root.setAttribute("tabindex", "-1");
    const titleHslot = document.createElement("fxs-hslot");
    this.Root.appendChild(titleHslot);
    const questTitle = document.createElement("div");
    questTitle.classList.add("mb-1", "text-sm", "text-secondary");
    questTitle.textContent = title;
    titleHslot.appendChild(questTitle);
    const questInfo = document.createElement("div");
    questInfo.className = "flex";
    const questBullet = document.createElement("img");
    questBullet.src = "fs://game/hud_quest_bullet.png";
    questBullet.className = "size-8 mr-1";
    const questInfoText = document.createElement("div");
    questInfoText.className = `font-body text-xs text-accent-2 max-w-64`;
    const infoText = getQuestDescription(quest);
    questInfoText.innerHTML = infoText;
    questInfo.appendChild(questInfoText);
    if (progress) {
      if (progressType) {
        const progressString = goal ? Locale.compose("LOC_UI_QUEST_TRACKER_PROGRESS_AND_GOAL", progressType, progress, goal) : Locale.compose("LOC_UI_QUEST_TRACKER_PROGRESS", progressType, progress);
        questInfo.firstChild.textContent += ` (${progressString.trim()})`;
      } else {
        const progressString = goal ? Locale.compose("LOC_UI_QUEST_TRACKER_PROGRESS_AND_GOAL_NO_TYPE", progress, goal) : Locale.compose("LOC_UI_QUEST_TRACKER_PROGRESS_NO_TYPE", progress);
        questInfo.firstChild.textContent += ` (${progressString.trim()})`;
      }
    }
    questInfo.insertBefore(questBullet, questInfo.firstChild);
    if (endTurn != void 0 && endTurn != -1) {
      const turnsRemainingText = Locale.compose("LOC_UI_QUEST_TRACKER_TURNS_REMAINING", endTurn - Game.turn);
      const questTurnsRemaining = document.createElement("p");
      questTurnsRemaining.className = `font-body text-sm text-accent-2 max-w-64 ml-3`;
      questTurnsRemaining.textContent = turnsRemainingText;
      titleHslot.appendChild(questTurnsRemaining);
    }
    this.Root.appendChild(questInfo);
  }
}
Controls.define("quest-item", {
  createInstance: QuestItemElement
});

export { QuestList };
//# sourceMappingURL=quest-list.js.map

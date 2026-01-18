import { TutorialAnchorPosition } from '../../../base-standard/ui/tutorial/tutorial-item.js';
import TutorialManager from '../../../base-standard/ui/tutorial/tutorial-manager.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/panel-support.chunk.js';
import '../../../core/ui/input/input-filter.chunk.js';
import '../../../base-standard/ui/quest-tracker/quest-item.js';
import '../../../base-standard/ui/quest-tracker/quest-tracker.js';
import '../../../base-standard/ui/tutorial/tutorial-events.chunk.js';

const calloutClose = {
  callback: () => {
    return;
  },
  text: "LOC_TUTORIAL_CALLOUT_CLOSE",
  actionKey: "inline-cancel",
  closes: true
};
TutorialManager.add({
  ID: "tutorial_antiquity_pirates",
  filterPlayers: [],
  runAllTurns: true,
  callout: {
    anchorPosition: TutorialAnchorPosition.MiddleRight,
    title: "LOC_TUTORIAL_PIRATE_ANTIQUITY_TITLE",
    body: { text: "LOC_TUTORIAL_PIRATE_ANTIQUITY_BODY" },
    option1: calloutClose
  },
  activationEngineEvents: ["Combat"],
  onActivateCheck: () => {
    const player = Players.get(GameContext.localPlayerID);
    const activationEventData = TutorialManager.activatingEvent;
    if (!(Units.get(activationEventData.defender)?.owner === player?.id)) {
      return false;
    } else {
      if (Units.get(activationEventData.attacker)?.isPrivateer == true) {
        return true;
      }
    }
    return false;
  },
  onActivate: (_item) => {
    const player = Players.get(GameContext.localPlayerID);
    const activationEventData = TutorialManager.activatingEvent;
    const attackingUnit = Units.get(activationEventData.attacker);
    if (player && attackingUnit) {
      UI.Player.deselectAllUnits();
      const plotIndex = GameplayMap.getIndexFromLocation(attackingUnit.location);
      _item.highlightPlots = [plotIndex];
      Camera.lookAtPlot(plotIndex, { zoom: 0.25 });
    }
  }
});
TutorialManager.process("antiquity items edward teach");
//# sourceMappingURL=tutorial-items-antiquity.js.map

import { A as Audio } from '../../../core/ui/audio-base/audio-support.chunk.js';
import { C as ComponentID } from '../../../core/ui/utilities/utilities-component-id.chunk.js';
import { Icon } from '../../../core/ui/utilities/utilities-image.chunk.js';
import { U as UpdateGate } from '../../../core/ui/utilities/utilities-update-gate.chunk.js';

class BuildQueueModel {
  CityID = null;
  Items = [];
  _OnUpdate;
  get isEmpty() {
    return this.items.length == 0;
  }
  constructor() {
    engine.whenReady.then(() => {
      engine.on("CitySelectionChanged", (event) => {
        if (event.cityID.owner != GameContext.localPlayerID) {
          return;
        }
        if (event.selected) {
          if (ComponentID.isValid(event.cityID)) {
            this.cityID = event.cityID;
            return;
          }
          console.error("Model build queue is unable to get valid cityID from selected event.");
        }
        this.cityID = ComponentID.getInvalidID();
      });
      engine.on("CityProductionQueueChanged", (data) => {
        if (data.cityID.owner == GameContext.localPlayerID) {
          this.updateGate.call("CityProductionQueueChanged");
        }
      });
      engine.on("CityProductionChanged", (data) => {
        if (data.cityID.owner == GameContext.localPlayerID) {
          this.updateGate.call("CityProductionChanged");
        }
      });
      engine.on("CityYieldChanged", (data) => {
        if (data.cityID.owner == GameContext.localPlayerID) {
          this.updateGate.call("CityYieldChanged");
        }
      });
      engine.on("CityProductionUpdated", (data) => {
        if (data.cityID.owner == GameContext.localPlayerID) {
          this.updateGate.call("CityProductionUpdated");
        }
      });
      window.addEventListener("request-build-queue-cancel-item", (event) => {
        this.cancelItem(event.detail.index);
      });
      window.addEventListener("request-build-queue-move-item-up", (event) => {
        this.moveItemUp(event.detail.index);
      });
      window.addEventListener("request-build-queue-move-item-last", (event) => {
        this.moveItemLast(event.detail.index);
      });
      this.updateGate.call("engine.whenReady");
    });
  }
  get isTrackingCity() {
    return this.CityID != null;
  }
  set updateCallback(callback) {
    this._OnUpdate = callback;
  }
  set cityID(id) {
    this.CityID = id;
    this.updateGate.call("set cityID");
  }
  get cityID() {
    return this.CityID;
  }
  get items() {
    return this.Items ?? [];
  }
  updateGate = new UpdateGate(() => {
    this.Items = [];
    let index = 0;
    const player = Players.get(GameContext.localPlayerID);
    const cityID = this.cityID;
    if (player && cityID) {
      const c = Cities.get(cityID);
      if (c) {
        const queue = c.BuildQueue;
        if (queue) {
          const queueNodes = queue.getQueue();
          queueNodes.forEach((queueData) => {
            const turns = queue.getTurnsLeft(queueData.type);
            const progress = queue.getPercentComplete(queueData.type);
            let name = "?name?";
            if (queueData.orderType == OrderTypes.ORDER_CONSTRUCT) {
              const buildingInfo = GameInfo.Constructibles.lookup(queueData.constructibleType);
              if (buildingInfo) {
                name = Locale.compose(buildingInfo.Name);
              } else {
                console.warn("Queue item without a definition: " + queueData.orderType.toString());
                name = queueData.orderType.toString();
              }
              this.Items.push({
                index: index++,
                name,
                type: buildingInfo ? buildingInfo.ConstructibleType : "",
                turns: turns != -1 ? turns.toString() : "999",
                showTurns: turns > 0,
                icon: buildingInfo ? Icon.getConstructibleIconFromDefinition(buildingInfo) : "",
                percentComplete: progress
              });
            } else if (queueData.orderType == OrderTypes.ORDER_TRAIN || queueData.orderType == OrderTypes.ORDER_FOOD_TRAIN) {
              const unitInfo = GameInfo.Units.lookup(queueData.unitType);
              if (unitInfo) {
                name = Locale.compose(unitInfo.Name);
              } else {
                console.warn("Queue item without a definition: " + queueData.orderType.toString());
                name = queueData.orderType.toString();
              }
              this.Items.push({
                index: index++,
                name,
                type: unitInfo ? unitInfo.UnitType : "",
                turns: turns != -1 ? turns.toString() : "999",
                showTurns: turns > 0,
                icon: unitInfo ? Icon.getUnitIconFromDefinition(unitInfo) : "",
                percentComplete: progress,
                isUnit: true
              });
            } else if (queueData.orderType == OrderTypes.ORDER_ADVANCE) {
              const projectInfo = GameInfo.Projects.lookup(queueData.projectType);
              if (projectInfo) {
                name = Locale.compose(projectInfo.Name);
              } else {
                console.warn("Queue item without a definition: " + queueData.orderType.toString());
                name = queueData.orderType.toString();
              }
              this.Items.push({
                index: index++,
                name,
                type: projectInfo ? projectInfo.ProjectType : "",
                turns: turns != -1 ? turns.toString() : "999",
                showTurns: turns > 0,
                icon: projectInfo ? Icon.getProjectIconFromDefinition(projectInfo) : "",
                percentComplete: progress
              });
            }
          });
        }
      }
    }
    if (this._OnUpdate) {
      this._OnUpdate(this);
    }
  });
  cancelItem(rawIndex) {
    const index = parseInt(rawIndex);
    if (index > -1) {
      if (this.CityID) {
        console.log(`Attempting to cancel item at rawIndex ${rawIndex}`);
        const args = {};
        args.InsertMode = CityOperationsParametersValues.RemoveAt;
        args.QueueLocation = index;
        const result = Game.CityOperations.canStart(this.CityID, CityOperationTypes.BUILD, args, false);
        if (result.Success) {
          Game.CityOperations.sendRequest(this.CityID, CityOperationTypes.BUILD, args);
        }
      } else {
        console.error(`Attempting to delete from build queue construction w/ no city selected!`);
      }
    }
  }
  moveItemUp(rawIndex) {
    const index = parseInt(rawIndex);
    if (index > -1) {
      if (this.CityID) {
        const args = {
          InsertMode: CityOperationsParametersValues.Swap,
          QueueSourceLocation: index,
          QueueDestinationLocation: index - 1
        };
        const result = Game.CityOperations.canStart(this.CityID, CityOperationTypes.BUILD, args, false);
        if (result.Success) {
          Audio.playSound("data-audio-move-queued-item", "audio-production-chooser");
          Game.CityOperations.sendRequest(this.CityID, CityOperationTypes.BUILD, args);
        }
      }
    } else {
      console.error(`Attempting to modify build queue construction w/ no city selected!`);
    }
  }
  moveItemDown(rawIndex) {
    const index = parseInt(rawIndex);
    if (index > -1) {
      if (this.CityID) {
        const args = {
          InsertMode: CityOperationsParametersValues.Swap,
          QueueSourceLocation: index,
          QueueDestinationLocation: index + 1
        };
        const result = Game.CityOperations.canStart(this.CityID, CityOperationTypes.BUILD, args, false);
        if (result.Success) {
          Game.CityOperations.sendRequest(this.CityID, CityOperationTypes.BUILD, args);
        }
      }
    } else {
      console.error(`Attempting to modify build queue construction w/ no city selected!`);
    }
  }
  moveItemLast(rawIndex) {
    const index = parseInt(rawIndex);
    if (index > -1) {
      if (this.Items.length > 0 && this.CityID) {
        const args = {
          InsertMode: CityOperationsParametersValues.MoveTo,
          QueueSourceLocation: index,
          QueueDestinationLocation: this.Items.length - 1
        };
        const result = Game.CityOperations.canStart(this.CityID, CityOperationTypes.BUILD, args, false);
        if (result.Success) {
          Audio.playSound("data-audio-move-queued-item", "audio-production-chooser");
          Game.CityOperations.sendRequest(this.CityID, CityOperationTypes.BUILD, args);
        }
      }
    } else {
      console.error(`Attempting to modify build queue construction w/ no city selected!`);
    }
  }
}
const BuildQueue = new BuildQueueModel();
engine.whenReady.then(() => {
  const updateModel = () => {
    engine.updateWholeModel(BuildQueue);
  };
  engine.createJSModel("g_BuildQueue", BuildQueue);
  BuildQueue.updateCallback = updateModel;
});

export { BuildQueue };
//# sourceMappingURL=model-build-queue.js.map

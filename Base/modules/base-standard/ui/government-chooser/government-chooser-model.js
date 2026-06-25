import { createContext, useContext } from '../../../core/vendor/solid-js/dist/solid.js';
import { createMutable } from '../../../core/vendor/solid-js/store/dist/store.js';
import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import { getModifierTextByContext } from '../../../core/ui/utilities/utilities-core-textprovider.js';
import { ModelRegistry, ModelLifecycle } from '../../../core/ui-next/services/model-registry.js';

function createGovtChooserModel() {
  const governmentChoices = [];
  let traditionsUnlocked = [];
  let celebrationChoices = [];
  const localPlayerID = GameContext.localPlayerID;
  let govAbility = void 0;
  const player = Players.get(localPlayerID);
  if (player) {
    if (player.Culture) {
      const playerHappiness = player.Happiness;
      if (playerHappiness) {
        const goldenAgeDuration = playerHappiness.getGoldenAgeDuration();
        for (const startingGovernmentDef of GameInfo.StartingGovernments) {
          const governmentType = startingGovernmentDef.GovernmentType;
          const governmentDef = GameInfo.Governments.lookup(governmentType);
          if (governmentDef) {
            const govModifiers = GameInfo.GovernmentModifiers.filter(
              (m) => m.GovernmentType === governmentType
            );
            for (const govMod of govModifiers) {
              const text = getModifierTextByContext(govMod.ModifierId, "Description");
              if (text) {
                govAbility = text;
                break;
              }
            }
            traditionsUnlocked = [];
            GameInfo.ProgressionTreeNodeUnlocks.forEach((node) => {
              if (node.RequiredGovernmentType == governmentType) {
                const nodeInfo = GameInfo.ProgressionTreeNodes.lookup(node.ProgressionTreeNodeType);
                if (nodeInfo) {
                  const tradition = GameInfo.Traditions.lookup(node.TargetType);
                  if (tradition) {
                    traditionsUnlocked.push(tradition);
                  }
                }
              }
            });
            const governmentCelebrationTypes = Game.Culture.GetCelebrationTypesForGovernment(
              governmentDef.GovernmentType
            );
            celebrationChoices = [];
            for (const celebrationChoice of governmentCelebrationTypes) {
              const celebrationItemDef = GameInfo.GoldenAges.lookup(celebrationChoice);
              if (celebrationItemDef) {
                const newItem = {
                  itemName: celebrationItemDef.Name,
                  image: `url(${UI.getIconURL(celebrationItemDef.GoldenAgeType)})`,
                  description: Locale.stylize(celebrationItemDef.Description, goldenAgeDuration)
                };
                celebrationChoices.push(newItem);
              }
            }
            const governmentChoice = {
              governmentName: governmentDef.Name,
              celebrationItems: celebrationChoices,
              governmentType: governmentDef.GovernmentType,
              governmentPassive: govAbility,
              traditionsUnlocked
            };
            governmentChoices.push(governmentChoice);
          }
        }
      }
    }
  }
  function onClose() {
    ContextManager.pop("screen-government-chooser");
  }
  function handleCardClicked(governmentType) {
    model.currentlySelectedChoice = governmentType;
  }
  function onConfirm() {
    if (!model.currentlySelectedChoice) {
      console.error(
        "screen-government-chooser: confirmChooseGovernment() - no government choice currently selected!"
      );
      return;
    }
    const governmentType = model.currentlySelectedChoice;
    if (governmentType) {
      const governmentDef = GameInfo.Governments.lookup(governmentType);
      if (!governmentDef) {
        console.error(
          `screen-government-chooser: confirmChooseGovernment() - no government def found for government type ${governmentType}`
        );
        return;
      }
      const args = {
        GovernmentType: governmentDef.$index,
        Action: PlayerOperationParameters.Activate
      };
      const result = Game.PlayerOperations.canStart(
        GameContext.localPlayerID,
        PlayerOperationTypes.CHANGE_GOVERNMENT,
        args,
        false
      );
      if (result.Success) {
        Game.PlayerOperations.sendRequest(
          GameContext.localPlayerID,
          PlayerOperationTypes.CHANGE_GOVERNMENT,
          args
        );
        model.onCloseClicked();
      }
    }
  }
  const model = createMutable({
    choicesAvailable: governmentChoices,
    onConfirmClicked: onConfirm,
    onCardClick: handleCardClicked,
    onCloseClicked: onClose,
    currentlySelectedChoice: null
  });
  return model;
}
const GovtChooserModel = ModelRegistry.register(
  "GovtScreenModel",
  ModelLifecycle.SharedInstance,
  createGovtChooserModel
);
const GovtChooserModelContext = createContext();
function useGovtChooserModelContext() {
  const context = useContext(GovtChooserModelContext);
  if (!context) {
    throw new Error("useGovtChooserModelContext: Cannot find context!");
  }
  return context;
}

export { GovtChooserModel, GovtChooserModelContext, createGovtChooserModel, useGovtChooserModelContext };
//# sourceMappingURL=government-chooser-model.js.map

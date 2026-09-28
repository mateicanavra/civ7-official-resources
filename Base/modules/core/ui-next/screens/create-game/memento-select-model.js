import { createSignal, createContext, useContext } from '../../../vendor/solid-js/dist/solid.js';
import { createMutable, modifyMutable, reconcile } from '../../../vendor/solid-js/store/dist/store.js';
import { ModelRegistry, ModelLifecycle } from '../../services/model-registry.js';
import { FullTextSearch } from '../../utilities/search-utils.js';

var MementoSlotType = /* @__PURE__ */ ((MementoSlotType2) => {
  MementoSlotType2[MementoSlotType2["Major"] = 0] = "Major";
  MementoSlotType2[MementoSlotType2["Minor"] = 1] = "Minor";
  return MementoSlotType2;
})(MementoSlotType || {});
const funcDescName = GameSetup.findString("FunctionalDescription");
function resolveMemento(value, mementoData) {
  const funcDescProp = value.additionalProperties?.find((v) => v.name === funcDescName);
  const metadata = mementoData.find((m) => m.mementoTypeId == value.value);
  return {
    value: value.value.toString(),
    name: GameSetup.resolveString(value.name),
    description: GameSetup.resolveString(value.description),
    functionalDescription: funcDescProp?.value,
    icon: GameSetup.resolveString(value.icon),
    isFavorite: metadata?.isFavorite ?? false,
    isNew: metadata?.isNewAndUnseenByPlayer ?? false,
    isLocked: metadata?.displayType == DisplayType.DISPLAY_LOCKED,
    unlockTitle: metadata?.unlockTitle ?? "",
    unlockReason: metadata?.unlockReason ?? ""
  };
}
function createMementoModel() {
  const isAgeTransition = UI.isInGame();
  const mementos = Online.Metaprogression.getMementosData();
  const mementoSlots = getMementoSlotInfo();
  const mutableMementos = createMutable(mementoSlots);
  const [selectedSlot, setSelectedSlot] = createSignal(0);
  function getMementoSlotInfo() {
    const mementoSlotParameters = GameSetup.getMementoFilteredPlayerParameters(GameContext.localPlayerID);
    const mementoPlayerParameters = GameSetup.getPlayerParameters(GameContext.localPlayerID);
    const mementoSlotMetadata = Online.Metaprogression.getMementoSlotData();
    const mementoData = [];
    for (const mementoSlotParam of mementoSlotParameters) {
      if (!mementoSlotParam.hidden && mementoSlotParam.invalidReason == GameSetupParameterInvalidReason.Valid) {
        const paramId = GameSetup.resolveString(mementoSlotParam.ID);
        const metadata = mementoSlotMetadata.find((m) => m.mementoTypeId == paramId);
        if (metadata) {
          const isLocked = metadata.displayType == DisplayType.DISPLAY_LOCKED;
          const isMajor = paramId?.startsWith("PlayerMementoMajorSlot");
          const paramName = GameSetup.resolveString(mementoSlotParam.ID) ?? "";
          const resolvedParamName = isAgeTransition ? `AgeTransition${paramName}` : paramName;
          const resolvedParam = mementoPlayerParameters.find((p) => GameSetup.resolveString(p.ID) == resolvedParamName) ?? mementoSlotParam;
          const slotData = {
            gameParameter: resolvedParamName,
            slotType: isMajor ? 0 /* Major */ : 1 /* Minor */,
            isLocked,
            unlockReason: metadata.unlockTitle,
            currentMemento: resolveMemento(resolvedParam.value, mementos),
            availableMementos: isLocked ? [] : resolvedParam.domain.possibleValues.map((v) => resolveMemento(v, mementos)),
            hotkey: mementoData.length == 0 ? "nav-previous" : "nav-next"
          };
          mementoData.push(slotData);
        } else {
          console.log(`Unable to find memento slot metadata for ${paramId}`);
        }
      }
    }
    return mementoData;
  }
  function clearNew(memento) {
    if (memento.isNewAndUnseenByPlayer) {
      Online.Metaprogression.setSeenMemento(memento.mementoTypeId);
    }
  }
  function clearAllNew() {
    for (const memento of mementos) {
      clearNew(memento);
    }
  }
  const equipMemento = (memento) => {
    const slotParameter = mutableMementos[selectedSlot()].gameParameter;
    if (memento.mementoTypeId == mutableMementos[selectedSlot()].currentMemento.value) {
      GameSetup.setPlayerParameterValue(GameContext.localPlayerID, slotParameter, "NONE");
    } else {
      for (const mementoSlot of mutableMementos) {
        if (mementoSlot.currentMemento.value == memento.mementoTypeId) {
          GameSetup.setPlayerParameterValue(GameContext.localPlayerID, mementoSlot.gameParameter, "NONE");
        }
      }
      GameSetup.setPlayerParameterValue(GameContext.localPlayerID, slotParameter, memento.mementoTypeId);
    }
    clearNew(memento);
    memento.isNewAndUnseenByPlayer = false;
    const updatedMementos = getMementoSlotInfo();
    modifyMutable(mutableMementos, reconcile(updatedMementos));
    const nextEmptySlot = mementoSlots.findIndex(
      (s, i) => i != selectedSlot() && !s.isLocked && s.currentMemento.value == "NONE"
    );
    if (nextEmptySlot >= 0) {
      setSelectedSlot(nextEmptySlot);
    }
  };
  const yieldIconPattern = /\[icon:(YIELD_(?:FOOD|PRODUCTION|GOLD|SCIENCE|CULTURE|HAPPINESS|DIPLOMACY))\]/g;
  const search = new FullTextSearch("MementoSelectFilter");
  search.addSearchData(
    mementos.map((m) => {
      const functionalTextDesc = Locale.plainText(
        Locale.compose(Locale.compose(m.functionalTextDesc).replaceAll(yieldIconPattern, "{LOC_$1_NAME}"))
      );
      return {
        key: m.mementoTypeId,
        title: Locale.plainText(m.mementoName),
        fullText: Locale.toLower(
          `${Locale.plainText(functionalTextDesc)}`
        )
      };
    })
  );
  const fulltextSearch = (text) => search.find(text);
  return {
    slots: mutableMementos,
    mementos,
    selectedSlot,
    setSelectedSlot,
    equipMemento,
    clearAllNew,
    fulltextSearch
  };
}
const MementoSelectModel = ModelRegistry.register(
  "MementoSelectModel",
  ModelLifecycle.PerInstance,
  createMementoModel
);
const MementoSelectModelContext = createContext();
function useMementoSelectModelContext() {
  const context = useContext(MementoSelectModelContext);
  if (!context) {
    throw new Error("useMementoSelectModel: Cannot find context!");
  }
  return context;
}

export { MementoSelectModel, MementoSelectModelContext, MementoSlotType, useMementoSelectModelContext };
//# sourceMappingURL=memento-select-model.js.map

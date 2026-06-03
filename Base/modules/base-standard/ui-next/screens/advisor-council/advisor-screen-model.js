import { createSignal, createContext, useContext } from '../../../../core/vendor/solid-js/dist/solid.js';
import { createMutable } from '../../../../core/vendor/solid-js/store/dist/store.js';
import ContextManager from '../../../../core/ui/context-manager/context-manager.js';
import { useAudio } from '../../../../core/ui-next/services/audio-support.js';
import AdviceManager from '../../../ui/advice/advice-manager.js';
import PopupSequencer from '../../../ui/popup-sequencer/popup-sequencer.js';
import { AgePortraitTags } from '../../../ui/tutorial/tutorial-callout.js';

const AgeAdviceTags = {
  [Game.getHash("AGE_ANTIQUITY")]: "ANTIQUITY",
  [Game.getHash("AGE_EXPLORATION")]: "EXPLORATION",
  [Game.getHash("AGE_MODERN")]: "MODERN"
};
var AdvicePanelTypes = /* @__PURE__ */ ((AdvicePanelTypes2) => {
  AdvicePanelTypes2[AdvicePanelTypes2["Quote"] = 1] = "Quote";
  AdvicePanelTypes2[AdvicePanelTypes2["Message"] = 2] = "Message";
  AdvicePanelTypes2[AdvicePanelTypes2["Note"] = 3] = "Note";
  AdvicePanelTypes2[AdvicePanelTypes2["None"] = 4] = "None";
  return AdvicePanelTypes2;
})(AdvicePanelTypes || {});
function createAdvisorCouncilScreenModel() {
  const [followed, setFollowed] = createSignal({
    [AdvisorTypes.CULTURE]: AdviceManager.isCultureFollowed(),
    [AdvisorTypes.ECONOMIC]: AdviceManager.isEconomicFollowed(),
    [AdvisorTypes.MILITARY]: AdviceManager.isMilitaryFollowed(),
    [AdvisorTypes.SCIENCE]: AdviceManager.isScientificFollowed()
  });
  const [selectedAdvisorCard, setSelectedAdvisorCard] = createSignal(AdvisorTypes.NO_ADVISOR);
  const [selectedPanel, setSelectedPanel] = createSignal(4 /* None */);
  const followAdvisor = (advisor) => {
    switch (advisor) {
      case AdvisorTypes.CULTURE:
        AdviceManager.setCultureFollowed(true);
        break;
      case AdvisorTypes.ECONOMIC:
        AdviceManager.setEconomicFollowed(true);
        break;
      case AdvisorTypes.MILITARY:
        AdviceManager.setMilitaryFollowed(true);
        break;
      case AdvisorTypes.SCIENCE:
        AdviceManager.setScientificFollowed(true);
        break;
    }
    setFollowed((prev) => ({ ...prev, [advisor]: true }));
  };
  const unfollowAdvisor = (advisor) => {
    switch (advisor) {
      case AdvisorTypes.CULTURE:
        AdviceManager.setCultureFollowed(false);
        break;
      case AdvisorTypes.ECONOMIC:
        AdviceManager.setEconomicFollowed(false);
        break;
      case AdvisorTypes.MILITARY:
        AdviceManager.setMilitaryFollowed(false);
        break;
      case AdvisorTypes.SCIENCE:
        AdviceManager.setScientificFollowed(false);
        break;
    }
    setFollowed((prev) => ({ ...prev, [advisor]: false }));
  };
  const playFollowAudio = (advisor) => {
    const audioTrigger = useAudio("AdvisorScreen/Button");
    switch (advisor) {
      case AdvisorTypes.CULTURE:
        audioTrigger("activate", {
          advisorType: "culture",
          following: isFollowingAdvisor(advisor) ? "true" : "false"
        });
        break;
      case AdvisorTypes.ECONOMIC:
        audioTrigger("activate", {
          advisorType: "economic",
          following: isFollowingAdvisor(advisor) ? "true" : "false"
        });
        break;
      case AdvisorTypes.MILITARY:
        audioTrigger("activate", {
          advisorType: "military",
          following: isFollowingAdvisor(advisor) ? "true" : "false"
        });
        break;
      case AdvisorTypes.SCIENCE:
        audioTrigger("activate", {
          advisorType: "science",
          following: isFollowingAdvisor(advisor) ? "true" : "false"
        });
        break;
    }
  };
  const isFollowingAdvisor = (advisor) => followed()[advisor];
  function getAdvisorsData() {
    const advisorData = [];
    advisorData.push({
      type: AdvisorTypes.CULTURE,
      title: "CULTURE",
      pages: AdviceManager.getCulturePages()
    });
    advisorData.push({
      type: AdvisorTypes.ECONOMIC,
      title: "ECONOMIC",
      pages: AdviceManager.getEconomicPages()
    });
    advisorData.push({
      type: AdvisorTypes.MILITARY,
      title: "MILITARY",
      pages: AdviceManager.getMilitaryPages()
    });
    advisorData.push({
      type: AdvisorTypes.SCIENCE,
      title: "SCIENCE",
      pages: AdviceManager.getScientificPages()
    });
    return advisorData;
  }
  function getAdvisorsInitialQuote(title) {
    const ageTag = AgeAdviceTags[Game.age];
    switch (title) {
      case "CULTURE":
        return `LOC_ADVICE_${ageTag}_CULTURE_CULTURAL_VICTORY_QUOTE`;
      case "ECONOMIC":
        return `LOC_ADVICE_${ageTag}_ECONOMIC_ECONOMIC_VICTORY_QUOTE`;
      case "MILITARY":
        return `LOC_ADVICE_${ageTag}_MILITARY_MILITARY_VICTORY_QUOTE`;
      case "SCIENCE":
        return `LOC_ADVICE_${ageTag}_SCIENCE_SCIENTIFIC_VICTORY_QUOTE`;
    }
    console.error(`Advisor-Screen-Model: unable to get advisors introductory quote'${title}'.`);
    return "LOC_ADVISOR_NOTHING";
  }
  function getAdvisorsLastQuote(advisor) {
    let pages = [];
    switch (advisor) {
      case AdvisorTypes.CULTURE:
        pages = AdviceManager.getCulturePages();
        break;
      case AdvisorTypes.ECONOMIC:
        pages = AdviceManager.getEconomicPages();
        break;
      case AdvisorTypes.MILITARY:
        pages = AdviceManager.getMilitaryPages();
        break;
      case AdvisorTypes.SCIENCE:
        pages = AdviceManager.getScientificPages();
        break;
    }
    if (pages?.length) {
      const quote = pages[pages.length - 1].quote;
      return quote;
    } else {
      return Locale.compose("LOC_ADVISOR_NOTHING");
    }
  }
  function getAdvisorPortraitURL(advisor) {
    const ageTag = AgePortraitTags[Game.age];
    if (ageTag !== void 0) {
      switch (advisor) {
        case AdvisorTypes.CULTURE:
          return `blp:adv_culture_${ageTag}`;
        case AdvisorTypes.ECONOMIC:
          return `blp:adv_economic_${ageTag}`;
        case AdvisorTypes.MILITARY:
          return `blp:adv_military_${ageTag}`;
        case AdvisorTypes.SCIENCE:
          return `blp:adv_science_${ageTag}`;
        default:
          console.error(`Advisor-Screen-Model: unable to get advisr portrait URL for '${advisor}'.`);
          return "";
      }
    } else {
      console.error(`Advisor-Screen-Model: unable to get ageTag for '${Game.age}'.`);
      return "";
    }
  }
  function handleClickCloseScreen() {
    ContextManager.pop("screen-advisor-council");
  }
  function handleClickClosePopup() {
    PopupSequencer.closePopup("advisor-council-popup");
  }
  const ornatePanelData = {
    topIconSrc: "url(blp:radial_advisors)",
    name: "Advisor-Screen",
    id: "advisor-screen",
    backgroundImageSrc: "url(blp:bg-panel-assyria)"
  };
  const localPlayer = Players.get(GameContext.localPlayerID);
  if (localPlayer != null) {
    const playerColor = UI.Color.getPlayerColors(GameContext.localPlayerID);
    if (playerColor) {
      const variants = UI.Color.createPlayerColorVariants(playerColor);
      ornatePanelData.topIconBackgroundTint = variants.primaryColor.tintColor;
    }
  }
  const model = createMutable({
    clickCloseScreen: handleClickCloseScreen,
    clickClosePopup: handleClickClosePopup,
    advisorInitialQuote: getAdvisorsInitialQuote,
    advisorsLastQuote: getAdvisorsLastQuote,
    advisorPortraitURL: getAdvisorPortraitURL,
    advisorsData: getAdvisorsData(),
    follow: followAdvisor,
    unfollow: unfollowAdvisor,
    isFollowing: isFollowingAdvisor,
    getSelectedAdvisorCard: selectedAdvisorCard,
    setSelectedAdvisorCard,
    getSelectedPanel: selectedPanel,
    setSelectedPanel,
    playFollowAudio,
    ornatePanelData
  });
  return model;
}
const AdvisorCouncilScreenContext = createContext();
function useAdvisorScreenContext() {
  const context = useContext(AdvisorCouncilScreenContext);
  if (!context) {
    throw new Error("Unable to get advisor screen context!");
  }
  return context;
}

export { AdvicePanelTypes, AdvisorCouncilScreenContext, AgeAdviceTags, createAdvisorCouncilScreenModel, useAdvisorScreenContext };
//# sourceMappingURL=advisor-screen-model.js.map

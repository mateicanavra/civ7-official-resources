import Databind from '../../../core/ui/utilities/utilities-core-databinding.js';

var AdvisorRecommendations = /* @__PURE__ */ ((AdvisorRecommendations2) => {
  AdvisorRecommendations2["NO_ADVISOR"] = "recommendation-none";
  AdvisorRecommendations2["CULTURAL"] = "recommendation-cultural";
  AdvisorRecommendations2["ECONOMIC"] = "recommendation-economic";
  AdvisorRecommendations2["MILITARY"] = "recommendation-military";
  AdvisorRecommendations2["SCIENTIFIC"] = "recommendation-scientific";
  return AdvisorRecommendations2;
})(AdvisorRecommendations || {});
var AdvisorUtilities;
((AdvisorUtilities2) => {
  function getTextForAdvisorRecommendation(type) {
    switch (type) {
      case "recommendation-cultural" /* CULTURAL */:
        return "LOC_UI_RECOMMENDATION_CULTURAL";
      case "recommendation-economic" /* ECONOMIC */:
        return "LOC_UI_RECOMMENDATION_ECONOMIC";
      case "recommendation-military" /* MILITARY */:
        return "LOC_UI_RECOMMENDATION_MILITARY";
      case "recommendation-scientific" /* SCIENTIFIC */:
        return "LOC_UI_RECOMMENDATION_SCIENCE";
      default:
        return "LOC_UI_RECOMMENDATION_DEFAULT";
    }
  }
  function createAdvisorRecommendationTooltip(elements) {
    const advisorRecommendationContainer = document.createElement("div");
    advisorRecommendationContainer.classList.add(
      "advisor-recommendation__container",
      "flex-col",
      "items-start",
      "font-body"
    );
    for (const rec of elements) {
      const recomendationElement = document.createElement("div");
      recomendationElement.classList.add("flex", "flex-auto", "items-center", "my-1");
      const advisorRecommendationIcon = document.createElement("div");
      advisorRecommendationIcon.classList.add("advisor-recommendation__icon", "mr-2", "flex");
      advisorRecommendationIcon.classList.add(rec);
      recomendationElement.appendChild(advisorRecommendationIcon);
      const advisorRecommendationText = document.createElement("div");
      advisorRecommendationText.classList.add("flex", "flex-auto", "flex-wrap");
      advisorRecommendationText.setAttribute("data-l10n-id", getTextForAdvisorRecommendation(rec));
      recomendationElement.appendChild(advisorRecommendationText);
      advisorRecommendationContainer.appendChild(recomendationElement);
    }
    return advisorRecommendationContainer;
  }
  AdvisorUtilities2.createAdvisorRecommendationTooltip = createAdvisorRecommendationTooltip;
  function createAdvisorRecommendation(elements, container) {
    const advisorRecommendationContainer = document.createElement("div");
    advisorRecommendationContainer.classList.add("advisor-recommendation__container");
    if (typeof elements == "string") {
      if (!container) {
        console.error(`tutorial-support: No container to attach advisor recommendation icons.`);
        return;
      }
      const advisorRecommendationIconDiv = document.createElement("div");
      Databind.for(advisorRecommendationIconDiv, elements, "recommendation");
      {
        const advisorRecommendationIcon = document.createElement("div");
        advisorRecommendationIcon.classList.add("advisor-recommendation__icon");
        advisorRecommendationIcon.setAttribute("data-bind-class", "{{recommendation.class}}");
        advisorRecommendationIconDiv.appendChild(advisorRecommendationIcon);
      }
      advisorRecommendationContainer.appendChild(advisorRecommendationIconDiv);
      container.appendChild(advisorRecommendationContainer);
    } else {
      advisorRecommendationContainer.classList.add("hidden");
      if (elements.length > 0) {
        advisorRecommendationContainer.classList.remove("hidden");
      }
      for (const rec of elements) {
        const advisorRecommendationIcon = document.createElement("div");
        advisorRecommendationIcon.classList.add("advisor-recommendation__icon");
        advisorRecommendationIcon.classList.add(rec);
        advisorRecommendationContainer.appendChild(advisorRecommendationIcon);
      }
      return advisorRecommendationContainer;
    }
  }
  AdvisorUtilities2.createAdvisorRecommendation = createAdvisorRecommendation;
  function getBuildRecommendationIcons(recommendations, type) {
    for (const recommendation of recommendations) {
      const advisorySubject = GameInfo.AdvisorySubjects.lookup(recommendation.subject);
      let definition = null;
      let definitionType = void 0;
      switch (advisorySubject?.AdvisorySubjectType) {
        case "ADVISORY_SUBJECT_PRODUCE_UNITS":
          definition = GameInfo.Units.lookup(recommendation.recommendedType);
          definitionType = definition?.UnitType;
          break;
        case "ADVISORY_SUBJECT_PRODUCE_CONSTRUCTIBLES":
          definition = GameInfo.Constructibles.lookup(recommendation.recommendedType);
          definitionType = definition?.ConstructibleType;
          break;
        case "ADVISORY_SUBJECT_PRODUCE_PROJECTS":
          definition = GameInfo.Projects.lookup(recommendation.recommendedType);
          definitionType = definition?.ProjectType;
          break;
      }
      if (!definition || recommendation.whichAdvisors == void 0) {
        continue;
      }
      if (definitionType == type) {
        const objectTypes = recommendation.whichAdvisors.map((type2) => {
          let cssClass = "recommendation-none" /* NO_ADVISOR */;
          switch (type2) {
            case AdvisorTypes.CULTURE:
              cssClass = "recommendation-cultural" /* CULTURAL */;
              break;
            case AdvisorTypes.ECONOMIC:
              cssClass = "recommendation-economic" /* ECONOMIC */;
              break;
            case AdvisorTypes.MILITARY:
              cssClass = "recommendation-military" /* MILITARY */;
              break;
            case AdvisorTypes.SCIENCE:
              cssClass = "recommendation-scientific" /* SCIENTIFIC */;
              break;
            default:
              break;
          }
          const classObject = {
            class: cssClass
          };
          return classObject;
        });
        return objectTypes;
      }
    }
    return [];
  }
  AdvisorUtilities2.getBuildRecommendationIcons = getBuildRecommendationIcons;
  function getTreeRecommendationIcons(recommendations, nodeType) {
    for (const recommendation of recommendations) {
      if (!recommendation.whichAdvisors?.length) {
        continue;
      }
      const treeNode = GameInfo.ProgressionTreeNodes.lookup(recommendation.recommendedType);
      if (!treeNode) {
        continue;
      }
      const nodeData = Game.ProgressionTrees.getNode(GameContext.localPlayerID, treeNode.ProgressionTreeNodeType);
      if (nodeData?.nodeType != nodeType) {
        continue;
      }
      const objectTypes = recommendation.whichAdvisors.map((type) => {
        let cssClass = "recommendation-none" /* NO_ADVISOR */;
        switch (type) {
          case AdvisorTypes.CULTURE:
            cssClass = "recommendation-cultural" /* CULTURAL */;
            break;
          case AdvisorTypes.ECONOMIC:
            cssClass = "recommendation-economic" /* ECONOMIC */;
            break;
          case AdvisorTypes.MILITARY:
            cssClass = "recommendation-military" /* MILITARY */;
            break;
          case AdvisorTypes.SCIENCE:
            cssClass = "recommendation-scientific" /* SCIENTIFIC */;
            break;
          default:
            break;
        }
        const classObject = {
          class: cssClass
        };
        return classObject;
      });
      return objectTypes;
    }
    return [];
  }
  AdvisorUtilities2.getTreeRecommendationIcons = getTreeRecommendationIcons;
  AdvisorUtilities2.getTreeRecommendations = (subject) => {
    const localPlayer = GameContext.localPlayerID;
    const recommendationParams = {
      playerId: localPlayer,
      subject,
      maxReturnedEntries: 0
    };
    return Players.Advisory.get(localPlayer)?.getTreeRecommendations(recommendationParams) ?? [];
  };
})(AdvisorUtilities || (AdvisorUtilities = {}));

export { AdvisorRecommendations, AdvisorUtilities };
//# sourceMappingURL=advisor-utilities.js.map

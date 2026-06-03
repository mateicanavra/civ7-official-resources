import { template, spread, insert, className } from '../../../core/vendor/solid-js/web/dist/web.js';
import { splitProps, mergeProps, createComponent, Show, createRenderEffect, For } from '../../../core/vendor/solid-js/dist/solid.js';
import { L10n } from '../../../core/ui-next/components/l10n.js';
import { ComponentRegistry } from '../../../core/ui-next/services/component-registry.js';

var _tmpl$ = /* @__PURE__ */ template(`<div><div></div></div>`), _tmpl$2 = /* @__PURE__ */ template(`<div></div>`), _tmpl$3 = /* @__PURE__ */ template(`<div class=my-1></div>`);
const getTextForAdvisorRecommendation = (type) => {
  switch (type) {
    case "recommendation-cultural":
      return "LOC_UI_RECOMMENDATION_CULTURAL";
    case "recommendation-economic":
      return "LOC_UI_RECOMMENDATION_ECONOMIC";
    case "recommendation-military":
      return "LOC_UI_RECOMMENDATION_MILITARY";
    case "recommendation-scientific":
      return "LOC_UI_RECOMMENDATION_SCIENCE";
    default:
      return "LOC_UI_RECOMMENDATION_DEFAULT";
  }
};
const getIconForAdvisorRecommendation = (rec) => {
  switch (rec) {
    case "recommendation-cultural":
      return "blp:adv_gem_cultural.png";
    case "recommendation-economic":
      return "blp:adv_gem_economic.png";
    case "recommendation-military":
      return "blp:adv_gem_militaristic.png";
    case "recommendation-scientific":
      return "blp:adv_gem_scientific.png";
    default:
      return "";
  }
};
const AdvisorRecommendationItem = (props) => {
  const [local, other] = splitProps(props, ["recommendation", "iconOnly", "sizeClass", "class", "textOverride"]);
  const text = () => {
    return local.textOverride ?? getTextForAdvisorRecommendation(local.recommendation);
  };
  return (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild;
    spread(_el$, mergeProps({
      get ["class"]() {
        return `flex flex-auto items-center ${local.class ?? ""}`;
      }
    }, other), false, true);
    insert(_el$, createComponent(Show, {
      get when() {
        return !local.iconOnly;
      },
      get children() {
        return createComponent(L10n.Stylize, {
          "class": "flex flex-auto flex-wrap",
          get text() {
            return text();
          }
        });
      }
    }), null);
    createRenderEffect((_p$) => {
      var _v$ = `bg-no-repeat bg-contain mr-2 flex ${local.sizeClass ?? "size-6"}`, _v$2 = `url(${getIconForAdvisorRecommendation(local.recommendation)})`;
      _v$ !== _p$.e && className(_el$2, _p$.e = _v$);
      _v$2 !== _p$.t && ((_p$.t = _v$2) != null ? _el$2.style.setProperty("background-image", _v$2) : _el$2.style.removeProperty("background-image"));
      return _p$;
    }, {
      e: void 0,
      t: void 0
    });
    return _el$;
  })();
};
const AdvisorRecommendationsListComponent = (props) => {
  const [local, other] = splitProps(props, ["recommendations", "direction", "iconOnly", "class", "noWrap"]);
  const direction = () => local.direction === "vertical" ? "flex-col" : "flex-row";
  const wrapClass = () => local.noWrap !== true ? "flex-wrap" : "";
  return createComponent(Show, {
    get when() {
      return local.recommendations.length > 0;
    },
    get children() {
      var _el$3 = _tmpl$2();
      spread(_el$3, mergeProps({
        get ["class"]() {
          return `relative flex ${direction()} ${wrapClass()} items-center justify-center font-body ${local.class ?? ""}`;
        }
      }, other), false, true);
      insert(_el$3, createComponent(For, {
        get each() {
          return local.recommendations;
        },
        children: (rec) => (() => {
          var _el$4 = _tmpl$3();
          insert(_el$4, createComponent(AdvisorRecommendationItem, {
            recommendation: rec,
            get iconOnly() {
              return local.iconOnly;
            }
          }));
          return _el$4;
        })()
      }));
      return _el$3;
    }
  });
};
const AdvisorRecommendationsList = ComponentRegistry.register({
  name: "AdvisorRecommendationsList",
  createInstance: AdvisorRecommendationsListComponent
});

export { AdvisorRecommendationItem, AdvisorRecommendationsList, getIconForAdvisorRecommendation, getTextForAdvisorRecommendation };
//# sourceMappingURL=advisor-recommendation.js.map

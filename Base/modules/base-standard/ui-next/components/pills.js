import { template, spread, insert } from '../../../core/vendor/solid-js/web/dist/web.js';
import { splitProps, mergeProps, createComponent } from '../../../core/vendor/solid-js/dist/solid.js';
import { L10n } from '../../../core/ui-next/components/l10n.js';
import { AdvisorRecommendationItem } from './advisor-recommendation.js';

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`);
const Pill = (props) => {
  const [local, other] = splitProps(props, ["class", "backgroundStyle", "children", "small"]);
  const backgroundStyle = () => local.backgroundStyle ?? {
    "background-color": "#23252b"
  };
  return (() => {
    var _el$ = _tmpl$();
    spread(_el$, mergeProps({
      get ["class"]() {
        return `${local.small ? "min-h-6 px-1\\.5" : "min-h-9 px-2"} flex items-center rounded-full leading-normal ${local.class ?? ""}`;
      },
      get style() {
        return {
          border: "1px solid #53565D",
          ...backgroundStyle()
        };
      }
    }, other), false, true);
    insert(_el$, () => local.children);
    return _el$;
  })();
};
const PillText = (props) => {
  const [local, other] = splitProps(props, ["text", "args", "class", "small"]);
  return createComponent(Pill, mergeProps({
    get ["class"]() {
      return `text-sm ${local.class ?? ""}`;
    },
    get small() {
      return local.small;
    }
  }, other, {
    get children() {
      return createComponent(L10n.Stylize, {
        get text() {
          return local.text;
        },
        get args() {
          return local.args;
        }
      });
    }
  }));
};
const advisorPillGradients = {
  "recommendation-cultural": {
    background: "linear-gradient(90deg, #2D1A48 0%, #16101E 100%)"
  },
  "recommendation-economic": {
    background: "linear-gradient(90deg, #453402 0%, #2A2105 100%)"
  },
  "recommendation-military": {
    background: "linear-gradient(90deg, #461314 0%, #2C0A0B 100%)"
  },
  "recommendation-scientific": {
    background: "linear-gradient(90deg, #0E305C 0%, #0A1B30 100%)"
  }
};
const AdvisorRecommendationPill = (props) => {
  const [local, other] = splitProps(props, ["class", "recommendation"]);
  const gradientStyle = () => advisorPillGradients[local.recommendation] ?? {};
  return createComponent(Pill, {
    get ["class"]() {
      return `py-1 text-sm ${local.class ?? ""}`;
    },
    get backgroundStyle() {
      return gradientStyle();
    },
    get children() {
      return createComponent(AdvisorRecommendationItem, mergeProps({
        get recommendation() {
          return local.recommendation;
        }
      }, other));
    }
  });
};

export { AdvisorRecommendationPill, Pill, PillText };
//# sourceMappingURL=pills.js.map

import '../../../vendor/solid-js/web/dist/web.js';
import { Icon } from '../../components/icon.js';
import { Tooltip } from '../../components/tooltip.js';
import { createComponent } from '../../../vendor/solid-js/dist/solid.js';

const AgeIcon = (props) => {
  const ageIcons = {
    AGE_ANTIQUITY: "url('blp:city_antiquity')",
    AGE_EXPLORATION: "url('city_exploration')",
    AGE_MODERN: "url('city_modern')"
  };
  const ageText = {
    AGE_ANTIQUITY: "LOC_UI_CREATE_GAME_ANTIQUITY",
    AGE_EXPLORATION: "LOC_UI_CREATE_GAME_EXPLORATION",
    AGE_MODERN: "LOC_UI_CREATE_GAME_MODERN"
  };
  const ageApexText = {
    AGE_ANTIQUITY: "LOC_UI_CREATE_GAME_ANTIQUITY_APEX",
    AGE_EXPLORATION: "LOC_UI_CREATE_GAME_EXPLORATION_APEX",
    AGE_MODERN: "LOC_UI_CREATE_GAME_MODERN_APEX"
  };
  return createComponent(Tooltip.Text, {
    bodyClass: "flex flex-row justify-center",
    get text() {
      return props.apexTooltip ? ageApexText[props.ageId] : ageText[props.ageId];
    },
    get children() {
      return createComponent(Icon, {
        get ["class"]() {
          return props.class;
        },
        get name() {
          return ageIcons[props.ageId];
        }
      });
    }
  });
};

export { AgeIcon };
//# sourceMappingURL=age-icon.js.map

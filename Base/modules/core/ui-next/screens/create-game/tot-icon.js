import '../../../vendor/solid-js/web/dist/web.js';
import { createMemo, createComponent } from '../../../vendor/solid-js/dist/solid.js';
import { Icon } from '../../components/icon.js';
import { Tooltip } from '../../components/tooltip.js';

const TotIcon = (props) => {
  const tooltipTitle = createMemo(() => props.isApexAge ? Locale.stylize("LOC_UI_APEX") : Locale.stylize("LOC_UI_TIME_TESTED"));
  const tooltipText = createMemo(() => props.isApexAge ? Locale.stylize("LOC_PEDIA_CONCEPTS_APEX_AGE_TOOLTIP") : Locale.stylize("LOC_PEDIA_CONCEPTS_TIME_TESTED_TOOLTIP"));
  const iconName = createMemo(() => props.isApexAge ? "url('blp:civ_apex_100x100')" : "url('blp:civ_timetested_100x100')");
  return createComponent(Tooltip.Text, {
    bodyClass: "flex flex-row justify-center",
    get text() {
      return tooltipText();
    },
    get header() {
      return tooltipTitle();
    },
    get children() {
      return createComponent(Icon, {
        get ["class"]() {
          return props.class;
        },
        get name() {
          return iconName();
        },
        isUrl: true
      });
    }
  });
};

export { TotIcon };
//# sourceMappingURL=tot-icon.js.map

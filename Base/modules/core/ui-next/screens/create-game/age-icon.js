import '../../../vendor/solid-js/web/dist/web.js';
import { createMemo, createComponent } from '../../../vendor/solid-js/dist/solid.js';
import { Icon } from '../../components/icon.js';
import { Tooltip } from '../../components/tooltip.js';

const AgeIcon = (props) => {
  const ageName = createMemo(() => props.ageId.replace("AGE_", ""));
  const ageText = createMemo(() => `LOC_UI_CREATE_GAME_${ageName()}`);
  const ageApexText = createMemo(() => `${ageText()}_APEX`);
  const ageIcons = createMemo(() => `url('blp:city_${ageName().toLowerCase()}')`);
  const framedAgeIcon = createMemo(() => `url('blp:city_${ageName().toLowerCase()}_128x128')`);
  return createComponent(Tooltip.Text, {
    bodyClass: "flex flex-row justify-center",
    get text() {
      return createMemo(() => !!props.apexTooltip)() ? ageApexText() : ageText();
    },
    get children() {
      return createComponent(Icon, {
        get ["class"]() {
          return props.class;
        },
        get name() {
          return createMemo(() => !!props.framedIcons)() ? framedAgeIcon() : ageIcons();
        }
      });
    }
  });
};

export { AgeIcon };
//# sourceMappingURL=age-icon.js.map

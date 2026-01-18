import { A as Audio } from '../../../core/ui/audio-base/audio-support.chunk.js';
import { u as utils } from '../../../core/ui/graph-layout/utils.chunk.js';
import FocusManager from '../../../core/ui/input/focus-manager.js';
import { F as Focus } from '../../../core/ui/input/focus-support.chunk.js';
import { a as NavigateInputEventName, b as InputEngineEventName } from '../../../core/ui/input/input-support.chunk.js';
import { N as NavTray } from '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel } from '../../../core/ui/panel-support.chunk.js';
import { D as Databind } from '../../../core/ui/utilities/utilities-core-databinding.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { L as Layout } from '../../../core/ui/utilities/utilities-layout.chunk.js';
import { PolicyChooserItemIcon, s as styles } from './policy-chooser-item.js';
import { a as PoliciesData, P as PolicyTabPlacement } from './model-policies.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/components/fxs-slot.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/spatial/spatial-manager.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../chooser-item/chooser-item.js';
import '../../../core/ui/components/fxs-activatable.chunk.js';
import '../chooser-item/chooser-item.chunk.js';

const content = "<fxs-frame\r\n\tframe-style=\"f2\"\r\n\toverride-styling=\"pt-5 mt-6 relative flex size-full px-10 pb-10\"\r\n\tfiligree-class=\"mt-3\"\r\n\ttop-border-style=\"b2\"\r\n\tclass=\"flex items-center flex-col\"\r\n>\r\n\t<fxs-close-button class=\"top-1 right-1\"></fxs-close-button>\r\n\t<fxs-header title=\"LOC_UI_MINI_MAP_GOVERNMENT\" header-bg-glow=\"true\"></fxs-header>\r\n\t<fxs-tab-bar\r\n\t\tclass=\"mb-5 self-center policies__tab-bar\"\r\n\t\ttab-item-class=\"mx-18\"\r\n\t\ttab-for=\"screen-policies\"\r\n\t></fxs-tab-bar>\r\n\t<div class=\"policies__main-window flex-auto\">\r\n\t\t<!-- overview -->\r\n\t\t<div\r\n\t\t\tclass=\"policies__overview hidden flex h-full\"\r\n\t\t\ttabindex=\"-1\"\r\n\t\t>\r\n\t\t\t<fxs-scrollable\r\n\t\t\t\tclass=\"policies__overview-scrollable flex flex-auto\"\r\n\t\t\t\thandle-gamepad-pan=\"true\"\r\n\t\t\t\tattached-scrollbar=\"true\"\r\n\t\t\t\tallow-mouse-panning=\"true\"\r\n\t\t\t>\r\n\t\t\t\t<div class=\"flex\">\r\n\t\t\t\t\t<div class=\"flex flex-col w-1\\/2\">\r\n\t\t\t\t\t\t<div class=\"mx-6 grow\">\r\n\t\t\t\t\t\t\t<fxs-header\r\n\t\t\t\t\t\t\t\ttitle=\"LOC_UI_POLICIES_CURRENT_GOVERNMENT\"\r\n\t\t\t\t\t\t\t\tfiligree-style=\"h4\"\r\n\t\t\t\t\t\t\t\tclass=\"mb-3\"\r\n\t\t\t\t\t\t\t></fxs-header>\r\n\t\t\t\t\t\t\t<fxs-inner-frame class=\"flex flex-col items-center relative px-2\">\r\n\t\t\t\t\t\t\t\t<div class=\"relative font-body-base p-6 my-px flex flex-col items-center\">\r\n\t\t\t\t\t\t\t\t\t<p class=\"policies__overview-gov-name relative font-title-xl tracking-100\"></p>\r\n\t\t\t\t\t\t\t\t\t<div class=\"policies__overview-government-divider w-128 h-1 mt-3 mb-2\"></div>\r\n\t\t\t\t\t\t\t\t\t<p class=\"policies__overview-gov-desc relative text-accent-4 my-4\"></p>\r\n\t\t\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\t\t\tclass=\"policies__overview-gov-bonuses relative flex flex-col items-center\"\r\n\t\t\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t</fxs-inner-frame>\r\n\t\t\t\t\t\t\t<fxs-header\r\n\t\t\t\t\t\t\t\ttitle=\"LOC_TAG_CONSTRUCTIBLE_HAPPINESS\"\r\n\t\t\t\t\t\t\t\tfiligree-style=\"h4\"\r\n\t\t\t\t\t\t\t\tclass=\"mt-6 mb-3\"\r\n\t\t\t\t\t\t\t></fxs-header>\r\n\t\t\t\t\t\t\t<fxs-inner-frame class=\"flex items-center relative\">\r\n\t\t\t\t\t\t\t\t<div class=\"flex items-center relative w-full justify-between\">\r\n\t\t\t\t\t\t\t\t\t<div class=\"flex items-center\">\r\n\t\t\t\t\t\t\t\t\t\t<fxs-ring-meter\r\n\t\t\t\t\t\t\t\t\t\t\tclass=\"policies__overview-happiness-meter size-28 flex items-center justify-center\"\r\n\t\t\t\t\t\t\t\t\t\t\tring-class=\"ssb__texture-ring\"\r\n\t\t\t\t\t\t\t\t\t\t>\r\n\t\t\t\t\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\t\t\t\t\tclass=\"policies__overview-happiness-meter-circle bg-no-repeat bg-center bg-cover size-22 flex items-center justify-center\"\r\n\t\t\t\t\t\t\t\t\t\t\t>\r\n\t\t\t\t\t\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\t\t\t\t\t\tclass=\"policies__overview-happiness-meter-image bg-no-repeat bg-center bg-cover size-12\"\r\n\t\t\t\t\t\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t\t\t\t</fxs-ring-meter>\r\n\t\t\t\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\t\t\t\trole=\"paragraph\"\r\n\t\t\t\t\t\t\t\t\t\t\tclass=\"flex flex-col pointer-events-auto\"\r\n\t\t\t\t\t\t\t\t\t\t>\r\n\t\t\t\t\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\t\t\t\t\tclass=\"policies__overview-turns-left-desc font-title-sm tracking-150 max-w-60\"\r\n\t\t\t\t\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t\t\t\t\t<div class=\"policies__overview-turns-left-number font-body-sm\"></div>\r\n\t\t\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t\t\t<div class=\"mr-7\">\r\n\t\t\t\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\t\t\t\trole=\"paragraph\"\r\n\t\t\t\t\t\t\t\t\t\t\tclass=\"flex flex-col items-center pointer-events-auto\"\r\n\t\t\t\t\t\t\t\t\t\t>\r\n\t\t\t\t\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\t\t\t\t\tdata-l10n-id=\"LOC_ATTR_YIELD_INCOME\"\r\n\t\t\t\t\t\t\t\t\t\t\t\tclass=\"font-title-sm tracking-150\"\r\n\t\t\t\t\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t\t\t\t\t<div class=\"policies__happiness-per-turn font-body-sm\"></div>\r\n\t\t\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t</fxs-inner-frame>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t\t<div class=\"flex flex-col items-center w-1\\/2\">\r\n\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\tclass=\"policies__overview-normal-section flex flex-col items-center\"\r\n\t\t\t\t\t\t\ttabindex=\"-1\"\r\n\t\t\t\t\t\t>\r\n\t\t\t\t\t\t\t<fxs-header\r\n\t\t\t\t\t\t\t\ttitle=\"LOC_UI_POLICIES_YOUR_SOCIAL_POLICIES\"\r\n\t\t\t\t\t\t\t\tfiligree-style=\"h4\"\r\n\t\t\t\t\t\t\t\tclass=\"mb-1\"\r\n\t\t\t\t\t\t\t></fxs-header>\r\n\t\t\t\t\t\t\t<div class=\"flex-auto mx-3\">\r\n\t\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\t\tclass=\"policies__overview-policies-container flex flex-wrap items-center justify-center\"\r\n\t\t\t\t\t\t\t\t\tdata-navrule-down=\"escape\"\r\n\t\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t<div class=\"policies__overview-crisis-section flex flex-col items-center mt-7\">\r\n\t\t\t\t\t\t\t<fxs-header\r\n\t\t\t\t\t\t\t\ttitle=\"LOC_UI_POLICIES_YOUR_CRISIS_POLICIES\"\r\n\t\t\t\t\t\t\t\tfiligree-style=\"h4\"\r\n\t\t\t\t\t\t\t></fxs-header>\r\n\t\t\t\t\t\t\t<div class=\"flex-auto mx-3\">\r\n\t\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\t\tclass=\"policies__overview-crisis-container flex flex-wrap items-center justify-center\"\r\n\t\t\t\t\t\t\t\t\tdata-navrule-up=\"escape\"\r\n\t\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t</fxs-scrollable>\r\n\t\t</div>\r\n\t\t<!-- normal policies view -->\r\n\t\t<div class=\"policies__policies hidden flex flex-col items-center size-full\">\r\n\t\t\t<div class=\"policies__policies-unlock-text flex flex-col items-center self-center hidden mb-5\">\r\n\t\t\t\t<fxs-header\r\n\t\t\t\t\tclass=\"policies__policies-unlock-text-header font-title-xl text-secondary\"\r\n\t\t\t\t\tfiligree-style=\"none\"\r\n\t\t\t\t\ttitle=\"LOC_UI_POLICIES_CAN_SWAP\"\r\n\t\t\t\t>\r\n\t\t\t\t</fxs-header>\r\n\t\t\t\t<div class=\"policies__policies-unlock-text-subheader font-body-base text-accent-4 text-center\"></div>\r\n\t\t\t</div>\r\n\t\t\t<div class=\"policies__policies-all-container flex justify-center max-w-full shrink\">\r\n\t\t\t\t<div class=\"flex flex-col items-center policies-column\">\r\n\t\t\t\t\t<fxs-header\r\n\t\t\t\t\t\tfiligree-style=\"h4\"\r\n\t\t\t\t\t\ttitle=\"LOC_POLICIES_AVAILABLE_POLICIES\"\r\n\t\t\t\t\t\tclass=\"mt-3\"\r\n\t\t\t\t\t></fxs-header>\r\n\t\t\t\t\t<fxs-scrollable\r\n\t\t\t\t\t\tclass=\"policies_policies-available-scrollable flex-auto\"\r\n\t\t\t\t\t\tattached-scrollbar=\"true\"\r\n\t\t\t\t\t\thandle-gamepad-pan=\"true\"\r\n\t\t\t\t\t>\r\n\t\t\t\t\t\t<div class=\"flex-auto mx-2\">\r\n\t\t\t\t\t\t\t<fxs-spatial-slot\r\n\t\t\t\t\t\t\t\tclass=\"policies_policies-available-container flex flex-wrap items-center mt-2 justify-center\"\r\n\t\t\t\t\t\t\t\ttabindex=\"-1\"\r\n\t\t\t\t\t\t\t\tdata-navrule-right=\"escape\"\r\n\t\t\t\t\t\t\t>\r\n\t\t\t\t\t\t\t</fxs-spatial-slot>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t</fxs-scrollable>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div\r\n\t\t\t\t\tclass=\"policies-arrow-container h-1\\/2 flex flex-col items-center mx-3\\.5 justify-around self-center\"\r\n\t\t\t\t>\r\n\t\t\t\t\t<div class=\"policies-swap-arrow bg-no-repeat bg-center bg-contain size-9\"></div>\r\n\t\t\t\t\t<div class=\"policies-swap-arrow bg-no-repeat bg-center bg-contain size-9\"></div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class=\"flex flex-col items-center policies-column\">\r\n\t\t\t\t\t<fxs-header\r\n\t\t\t\t\t\tfiligree-style=\"h4\"\r\n\t\t\t\t\t\ttitle=\"LOC_POLICIES_ACTIVE_POLICIES\"\r\n\t\t\t\t\t\tclass=\"mt-3\"\r\n\t\t\t\t\t></fxs-header>\r\n\t\t\t\t\t<fxs-scrollable\r\n\t\t\t\t\t\tclass=\"policies_policies-active-scrollable flex-auto\"\r\n\t\t\t\t\t\tattached-scrollbar=\"true\"\r\n\t\t\t\t\t>\r\n\t\t\t\t\t\t<div class=\"flex-auto mx-2\">\r\n\t\t\t\t\t\t\t<fxs-spatial-slot\r\n\t\t\t\t\t\t\t\tclass=\"policies_policies-active-container flex flex-wrap items-center mt-2 justify-center\"\r\n\t\t\t\t\t\t\t\ttabindex=\"-1\"\r\n\t\t\t\t\t\t\t\tdata-navrule-left=\"escape\"\r\n\t\t\t\t\t\t\t>\r\n\t\t\t\t\t\t\t</fxs-spatial-slot>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t</fxs-scrollable>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t\t<!-- crisis view -->\r\n\t\t<div class=\"policies__crisis hidden flex flex-col items-center size-full\">\r\n\t\t\t<div class=\"policies__crisis-progress-bar flex flex-col items-center mt-8\">\r\n\t\t\t\t<div class=\"w-full\">\r\n\t\t\t\t\t<div class=\"policies__crisis-marker-container mt-10 w-full relative\">\r\n\t\t\t\t\t\t<div class=\"w-0\\.5 h-4 bg-primary text-center absolute bottom-0\">\r\n\t\t\t\t\t\t\t<p\r\n\t\t\t\t\t\t\t\tclass=\"policies__crisis-age-begins absolute min-w-20 max-w-20 bottom-4 font-title-2xs tracking-100\"\r\n\t\t\t\t\t\t\t\tdata-l10n-id=\"LOC_UI_POLICIES_CRISIS_AGE_BEGINS\"\r\n\t\t\t\t\t\t\t></p>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t\t<div class=\"policies__crisis-progress-bar-outer h-2 w-full border border-primary\">\r\n\t\t\t\t\t\t<div class=\"policies__crisis-progress-bar-inner h-1\\.5 border-primary\"></div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class=\"policies__crisis-progress-text self-start mt-2\"></div>\r\n\t\t\t</div>\r\n\t\t\t<div class=\"policies__crisis-all-container flex justify-center max-w-full shrink\">\r\n\t\t\t\t<div class=\"flex flex-col items-center policies-column\">\r\n\t\t\t\t\t<fxs-header\r\n\t\t\t\t\t\tfiligree-style=\"h4\"\r\n\t\t\t\t\t\ttitle=\"LOC_POLICIES_AVAILABLE_POLICIES\"\r\n\t\t\t\t\t\tclass=\"mt-4\"\r\n\t\t\t\t\t></fxs-header>\r\n\t\t\t\t\t<fxs-scrollable\r\n\t\t\t\t\t\tclass=\"policies_crisis-available-scrollable flex-auto\"\r\n\t\t\t\t\t\tattached-scrollbar=\"true\"\r\n\t\t\t\t\t\thandle-gamepad-pan=\"true\"\r\n\t\t\t\t\t>\r\n\t\t\t\t\t\t<div class=\"flex-auto mx-2\">\r\n\t\t\t\t\t\t\t<fxs-spatial-slot\r\n\t\t\t\t\t\t\t\tclass=\"policies_crisis-available-container flex flex-wrap items-center mt-2 justify-center\"\r\n\t\t\t\t\t\t\t\ttabindex=\"-1\"\r\n\t\t\t\t\t\t\t\tdata-navrule-right=\"escape\"\r\n\t\t\t\t\t\t\t>\r\n\t\t\t\t\t\t\t</fxs-spatial-slot>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t</fxs-scrollable>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div\r\n\t\t\t\t\tclass=\"policies-arrow-container h-1\\/2 flex flex-col items-center mx-3\\.5 justify-around self-center\"\r\n\t\t\t\t>\r\n\t\t\t\t\t<div class=\"policies-swap-arrow bg-no-repeat bg-center bg-contain size-9\"></div>\r\n\t\t\t\t\t<div class=\"policies-swap-arrow bg-no-repeat bg-center bg-contain size-9\"></div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class=\"flex flex-col items-center policies-column\">\r\n\t\t\t\t\t<fxs-header\r\n\t\t\t\t\t\tfiligree-style=\"h4\"\r\n\t\t\t\t\t\ttitle=\"LOC_UI_POLICIES_YOUR_CRISIS_POLICIES\"\r\n\t\t\t\t\t\tclass=\"mt-4\"\r\n\t\t\t\t\t></fxs-header>\r\n\t\t\t\t\t<fxs-scrollable\r\n\t\t\t\t\t\tclass=\"policies_crisis-active-scrollable flex-auto\"\r\n\t\t\t\t\t\tattached-scrollbar=\"true\"\r\n\t\t\t\t\t>\r\n\t\t\t\t\t\t<div class=\"flex-auto mx-2\">\r\n\t\t\t\t\t\t\t<fxs-spatial-slot\r\n\t\t\t\t\t\t\t\tclass=\"policies_crisis-active-container flex flex flex-wrap items-center mt-2 justify-center\"\r\n\t\t\t\t\t\t\t\ttabindex=\"-1\"\r\n\t\t\t\t\t\t\t\tdata-navrule-left=\"escape\"\r\n\t\t\t\t\t\t\t>\r\n\t\t\t\t\t\t\t</fxs-spatial-slot>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t</fxs-scrollable>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t</div>\r\n\t<div class=\"policies__confirm-container self-center w-1\\/2\">\r\n\t\t<fxs-hero-button\r\n\t\t\tcaption=\"LOC_UI_RESOURCE_ALLOCATION_CONFIRM\"\r\n\t\t\tclass=\"mt-11\"\r\n\t\t\tdisabled=\"true\"\r\n\t\t></fxs-hero-button>\r\n\t</div>\r\n</fxs-frame>\r\n";

const getPolicyTabItems = (numOpenNormalSlots, numOpenCrisisSlots) => {
  const overviewTab = {
    label: "LOC_UI_POLICIES_OVERVIEW_TAB",
    id: "policies-overview"
  };
  const normalTab = {
    label: "LOC_UI_POLICIES_POLICIES_TAB",
    id: "policies-normal",
    icon: numOpenNormalSlots > 0 ? "dip_attribute_notif" : void 0,
    iconClass: "mt-1 size-14",
    iconText: numOpenNormalSlots.toString(),
    className: "flex-row-reverse"
  };
  const crisisTab = {
    label: "LOC_UI_POLICIES_CRISIS_TAB",
    id: "policies-crisis",
    icon: numOpenCrisisSlots > 0 ? "dip_attribute_notif" : void 0,
    iconClass: "mt-1 size-14",
    iconText: numOpenCrisisSlots.toString(),
    className: "flex-row-reverse"
  };
  if (Game.AgeProgressManager.isFinalAge || !Game.CrisisManager.isCrisisEnabled(0)) {
    return [overviewTab, normalTab];
  } else {
    return [overviewTab, normalTab, crisisTab];
  }
};
class ScreenPolicies extends Panel {
  confirmButtonListener = this.onConfirm.bind(this);
  navigateInputListener = this.onNavigateInput.bind(this);
  engineInputListener = this.onEngineInput.bind(this);
  onPolicyTabSelectedListener = this.onPolicyTabSelected.bind(this);
  overviewWindow;
  policiesWindow;
  crisisWindow;
  currentWindow = null;
  confirmButton;
  confirmButtonContainer;
  activeNormalPolicyScrollable;
  activeCrisisPolicyScrollable;
  availableNormalPolicyScrollable;
  availableCrisisPolicyScrollable;
  displayActiveNormalPolicies = [];
  displayActiveCrisisPolicies = [];
  displayAvailableNormalPolicies = [];
  displayAvailableCrisisPolicies = [];
  policiesToAdd = [];
  policiesToRemove = [];
  localPlayer = null;
  canSwapNormalPolicies = false;
  canSwapCrisisPolicies = false;
  maxNormalPoliciesOnOverview = 4;
  maxCrisisPoliciesOnOverview = 2;
  initialSetupDone = false;
  crisisEventMarkers = [
    {
      progressLabelStr: "LOC_UI_POLICIES_TURNS_UNTIL_CRISIS_BEGINS",
      progressLabelStrRange: "LOC_UI_POLICIES_TURNS_UNTIL_CRISIS_BEGINS_RANGE",
      locStr: "LOC_UI_POLICIES_CRISIS_BEGINS",
      timelinePlacement: Game.CrisisManager.getCrisisStageTriggerPercent(0, 0) / 100
    },
    {
      progressLabelStr: "LOC_UI_POLICIES_TURNS_UNTIL_CRISIS_INTENSIFIES",
      progressLabelStrRange: "LOC_UI_POLICIES_TURNS_UNTIL_CRISIS_INTENSIFIES_RANGE",
      locStr: "LOC_UI_POLICIES_CRISIS_INTENSIFIES",
      timelinePlacement: Game.CrisisManager.getCrisisStageTriggerPercent(0, 1) / 100
    },
    {
      progressLabelStr: "LOC_UI_POLICIES_TURNS_UNTIL_CRISIS_CULMINATES",
      progressLabelStrRange: "LOC_UI_POLICIES_TURNS_UNTIL_CRISIS_CULMINATES_RANGE",
      locStr: "LOC_UI_POLICIES_CRISIS_CULMINATES",
      timelinePlacement: Game.CrisisManager.getCrisisStageTriggerPercent(0, 2) / 100
    },
    {
      progressLabelStr: "LOC_UI_POLICIES_TURNS_UNTIL_CRISIS_ENDS",
      progressLabelStrRange: "LOC_UI_POLICIES_TURNS_UNTIL_CRISIS_ENDS_RANGE",
      locStr: "LOC_UI_POLICIES_CRISIS_ENDS",
      timelinePlacement: Game.CrisisManager.getCrisisStageTriggerPercent(0, 3) / 100
    }
  ];
  onInitialize() {
    this.confirmButton = MustGetElement("fxs-hero-button", this.Root);
    this.confirmButton.setAttribute("data-audio-group-ref", "audio-policy-chooser");
    this.confirmButton.setAttribute("data-audio-activate-ref", "data-audio-policy-confirmed");
    this.confirmButtonContainer = MustGetElement(".policies__confirm-container", this.Root);
    this.overviewWindow = MustGetElement(".policies__overview", this.Root);
    this.policiesWindow = MustGetElement(".policies__policies", this.Root);
    this.crisisWindow = MustGetElement(".policies__crisis", this.Root);
    this.activeNormalPolicyScrollable = MustGetElement(".policies_policies-active-scrollable", this.Root);
    this.activeCrisisPolicyScrollable = MustGetElement(".policies_crisis-active-scrollable", this.Root);
    this.availableNormalPolicyScrollable = MustGetElement(".policies_policies-available-scrollable", this.Root);
    this.availableCrisisPolicyScrollable = MustGetElement(".policies_crisis-available-scrollable", this.Root);
    this.enableOpenSound = true;
    this.enableCloseSound = true;
    this.Root.setAttribute("data-audio-group-ref", "audio-policy-chooser");
  }
  onAttach() {
    super.onAttach();
    PoliciesData.update();
    const closeButton = MustGetElement("fxs-close-button", this.Root);
    closeButton.addEventListener("action-activate", () => {
      this.close();
    });
    const frame = MustGetElement("fxs-frame", this.Root);
    frame.setAttribute("outside-safezone-mode", "full");
    const uiViewExperience = UI.getViewExperience();
    if (uiViewExperience == UIViewExperience.Mobile) {
      frame.setAttribute("frame-style", "f1");
      frame.setAttribute("top-border-style", "");
      frame.setAttribute("filigree-class", "mt-1");
      frame.setAttribute("override-styling", "pt-5 relative flex size-full px-10 pb-10");
    }
    this.localPlayer = Players.get(GameContext.localPlayerID);
    if (!this.localPlayer) {
      console.error("screen-policies: onAttach(): No local player!");
      return;
    }
    this.confirmButton.addEventListener("action-activate", this.confirmButtonListener);
    this.Root.addEventListener(NavigateInputEventName, this.navigateInputListener);
    this.Root.addEventListener(InputEngineEventName, this.engineInputListener);
    this.displayAvailableNormalPolicies = PoliciesData.availableNormalPolicies;
    this.displayActiveNormalPolicies = PoliciesData.activeNormalPolicies;
    this.displayAvailableCrisisPolicies = PoliciesData.availableCrisisPolicies;
    this.displayActiveCrisisPolicies = PoliciesData.activeCrisisPolicies;
    const tabsContainer = MustGetElement("fxs-tab-bar", this.Root);
    const numOpenNormalSlots = this.hasNormalPolicies() ? this.getNumOpenNormalSlots() : 0;
    const numOpenCrisisSlots = this.hasCrisisPolicies() ? this.getNumOpenCrisisSlots() : 0;
    const policyTabItems = getPolicyTabItems(numOpenNormalSlots, numOpenCrisisSlots);
    tabsContainer.setAttribute("tab-items", JSON.stringify(policyTabItems));
    const playerCulture = this.localPlayer.Culture;
    if (!playerCulture) {
      console.error("screen-policies: onAttach() - local player had no culture!");
      return;
    }
    this.canSwapNormalPolicies = playerCulture.canSwapNormalTraditions;
    this.canSwapCrisisPolicies = playerCulture.canSwapCrisisTraditions;
    this.buildOverviewWindow();
    this.buildPolicyWindow();
    this.buildCrisisWindow();
    Databind.classToggle(this.confirmButtonContainer, "hidden", `g_NavTray.isTrayRequired`);
  }
  onDetach() {
    this.Root.removeEventListener(InputEngineEventName, this.engineInputListener);
    this.Root.removeEventListener(NavigateInputEventName, this.navigateInputListener);
    this.confirmButton.removeEventListener("action-activate", this.confirmButtonListener);
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    NavTray.clear();
    NavTray.addOrUpdateGenericBack();
    if (!this.shouldDisableConfirmButton()) {
      NavTray.addOrUpdateShellAction1("LOC_UI_RESOURCE_ALLOCATION_CONFIRM");
    }
    if (this.initialSetupDone) {
      switch (this.currentWindow) {
        case this.overviewWindow:
          this.focusOverviewWindow();
          break;
        case this.policiesWindow:
          this.focusPoliciesWindow();
          break;
        case this.crisisWindow:
          this.focusCrisisWindow();
          break;
        default:
          break;
      }
    } else {
      const tabsContainer2 = MustGetElement("fxs-tab-bar", this.Root);
      let activeTab = PoliciesData.activeTab;
      if (activeTab === PolicyTabPlacement.NONE) {
        if (this.canSwapNormalPolicies) {
          activeTab = PolicyTabPlacement.POLICIES;
        } else if (this.canSwapCrisisPolicies) {
          activeTab = PolicyTabPlacement.CRISIS;
        } else {
          activeTab = PolicyTabPlacement.OVERVIEW;
        }
        PoliciesData.activeTab = activeTab;
      }
      switch (activeTab) {
        case PolicyTabPlacement.OVERVIEW:
          this.goToNewWindow(this.overviewWindow);
          break;
        case PolicyTabPlacement.POLICIES:
          this.goToNewWindow(this.policiesWindow);
          tabsContainer2.setAttribute("selected-tab-index", "1");
          break;
        case PolicyTabPlacement.CRISIS:
          this.goToNewWindow(this.crisisWindow);
          tabsContainer2.setAttribute("selected-tab-index", "2");
          break;
      }
      this.initialSetupDone = true;
    }
    const tabsContainer = MustGetElement("fxs-tab-bar", this.Root);
    tabsContainer.addEventListener("tab-selected", this.onPolicyTabSelectedListener);
  }
  focusOverviewWindow() {
    PoliciesData.activeTab = PolicyTabPlacement.OVERVIEW;
    this.refreshOverviewPolicies();
    FocusManager.setFocus(MustGetElement(".policies__overview-normal-section", this.overviewWindow));
    this.confirmButton.classList.add("hidden");
  }
  focusPoliciesWindow() {
    PoliciesData.activeTab = PolicyTabPlacement.POLICIES;
    this.refreshPolicyWindow();
    if (this.canSwapNormalPolicies && this.getNumOpenNormalSlots() <= 0) {
      this.focusActivePolicyContainer();
    } else if (this.displayAvailableNormalPolicies.length > 0) {
      this.focusAvailablePolicyContainer();
    } else if (this.displayActiveNormalPolicies.length > 0) {
      this.focusActivePolicyContainer();
    }
    this.confirmButton.classList.toggle("hidden", !(this.canSwapNormalPolicies && this.hasNormalPolicies()));
  }
  focusCrisisWindow() {
    PoliciesData.activeTab = PolicyTabPlacement.CRISIS;
    this.refreshCrisisWindow();
    if (this.displayAvailableCrisisPolicies.length > 0) {
      this.focusAvailableCrisisContainer();
    } else if (this.displayActiveCrisisPolicies.length > 0) {
      this.focusActiveCrisisContainer();
    }
    this.confirmButton.classList.toggle("hidden", !(this.canSwapCrisisPolicies && this.hasCrisisPolicies()));
  }
  setPanelOptions(panelOptions) {
    if (panelOptions.openTab) {
      const tabsContainer = MustGetElement("fxs-tab-bar", this.Root);
      switch (panelOptions.openTab) {
        case PolicyTabPlacement.OVERVIEW:
          this.goToNewWindow(this.overviewWindow);
          tabsContainer.setAttribute("selected-tab-index", "0");
          break;
        case PolicyTabPlacement.POLICIES:
          this.goToNewWindow(this.policiesWindow);
          tabsContainer.setAttribute("selected-tab-index", "1");
          break;
        case PolicyTabPlacement.CRISIS:
          this.goToNewWindow(this.crisisWindow);
          tabsContainer.setAttribute("selected-tab-index", "2");
          break;
        default:
          break;
      }
    }
  }
  onPolicyTabSelected(e) {
    switch (e.detail.selectedItem.id) {
      case "policies-overview":
        this.goToNewWindow(this.overviewWindow);
        break;
      case "policies-normal":
        this.goToNewWindow(this.policiesWindow);
        break;
      case "policies-crisis":
        this.goToNewWindow(this.crisisWindow);
        break;
      default:
        e.detail.selectedItem;
        break;
    }
  }
  goToNewWindow(window2) {
    if (this.currentWindow) {
      this.currentWindow.classList.add("hidden");
    }
    this.currentWindow = window2;
    this.currentWindow.classList.remove("hidden");
    if (window2 == this.overviewWindow) {
      this.focusOverviewWindow();
    } else if (window2 == this.policiesWindow) {
      this.focusPoliciesWindow();
    } else if (window2 == this.crisisWindow) {
      this.focusCrisisWindow();
    }
  }
  buildOverviewWindow() {
    const currentGovernment = PoliciesData.myGovernment;
    const governmentNameElement = MustGetElement(".policies__overview-gov-name", this.overviewWindow);
    const governmentDescElement = MustGetElement(".policies__overview-gov-desc", this.overviewWindow);
    const happinessPerTurnElement = MustGetElement(".policies__happiness-per-turn", this.overviewWindow);
    const governmentBonusesContainer = MustGetElement(".policies__overview-gov-bonuses", this.overviewWindow);
    const celebrationTurnsLeftDesc = MustGetElement(".policies__overview-turns-left-desc", this.overviewWindow);
    const celebrationTurnsLeftNumber = MustGetElement(".policies__overview-turns-left-number", this.overviewWindow);
    const happinessRingMeter = MustGetElement(".policies__overview-happiness-meter", this.overviewWindow);
    const activeNormalPolicyContainer = MustGetElement(
      ".policies__overview-policies-container",
      this.overviewWindow
    );
    const activeCrisisPolicyContainer = MustGetElement(".policies__overview-crisis-container", this.overviewWindow);
    const policySection = MustGetElement(".policies__overview-normal-section", this.overviewWindow);
    const crisisSection = MustGetElement(".policies__overview-crisis-section", this.overviewWindow);
    const localPlayerHappiness = this.localPlayer?.Happiness;
    if (localPlayerHappiness === void 0) {
      console.error("screen-policies: buildOverviewWindow() - Local player happiness is undefined!");
      return;
    }
    const localPlayerStats = this.localPlayer?.Stats;
    if (localPlayerStats === void 0) {
      console.error("screen-policies: buildOverviewWindow() - Local player stats is undefined!");
      return;
    }
    const localPlayerCulture = this.localPlayer?.Culture;
    if (!localPlayerCulture) {
      console.error("screen-policies: buildOverviewWindow() - No player culture!");
      return;
    }
    if (currentGovernment) {
      governmentNameElement.setAttribute("data-l10n-id", currentGovernment.Name);
      governmentDescElement.setAttribute("data-l10n-id", currentGovernment.Description ?? "ErrorDescription");
    } else {
      governmentNameElement.setAttribute("data-l10n-id", "LOC_UI_POLICIES_NO_GOVERNMENT_TITLE");
      governmentDescElement.setAttribute("data-l10n-id", "LOC_UI_POLICIES_NO_GOVERNMENT_DESC");
    }
    const happinessPerTurn = localPlayerStats.getNetYield(YieldTypes.YIELD_HAPPINESS) ?? -1;
    happinessPerTurnElement.innerHTML = Locale.stylize(
      "LOC_UI_POLICIES_HAPPINESS_PER_TURN",
      `${happinessPerTurn >= 0 ? "+" : "-"}${Math.round(happinessPerTurn)}`
    );
    const choices = localPlayerCulture.getGoldenAgeChoices();
    for (const choice of choices) {
      const celebrationItemDef = GameInfo.GoldenAges.lookup(choice);
      if (!celebrationItemDef) {
        console.error(`screen-policies: buildOverviewWindow() - No golden age definition found for ${choice}!`);
        return;
      }
      const celebrationChoiceContainer = document.createElement("div");
      celebrationChoiceContainer.classList.value = "flex items-center my-4";
      governmentBonusesContainer.appendChild(celebrationChoiceContainer);
      const celebrationChoiceImage = document.createElement("div");
      celebrationChoiceImage.classList.value = "size-8 bg-no-repeat bg-contain bg-center mr-3";
      celebrationChoiceImage.style.backgroundImage = `url("${UI.getIconURL(celebrationItemDef.GoldenAgeType)}")`;
      celebrationChoiceContainer.appendChild(celebrationChoiceImage);
      const celebrationChoiceDesc = document.createElement("div");
      celebrationChoiceDesc.classList.value = "font-body-base";
      celebrationChoiceDesc.innerHTML = Locale.stylize(
        celebrationItemDef.Description,
        localPlayerHappiness.getGoldenAgeDuration()
      );
      celebrationChoiceContainer.appendChild(celebrationChoiceDesc);
    }
    celebrationTurnsLeftDesc.setAttribute(
      "data-l10n-id",
      localPlayerHappiness.isInGoldenAge() ? "LOC_UI_CURRENT_CELEBRATION" : "LOC_UI_NEXT_CELEBRATION"
    );
    if (localPlayerHappiness.isInGoldenAge()) {
      celebrationTurnsLeftNumber.textContent = Locale.compose(
        "LOC_UI_X_TURNS_LEFT",
        localPlayerHappiness.getGoldenAgeTurnsLeft()
      );
      happinessRingMeter.setAttribute(
        "value",
        (localPlayerHappiness.getGoldenAgeTurnsLeft() / localPlayerHappiness.getGoldenAgeDuration() * 100).toString()
      );
    } else {
      const happinessPerTurn2 = localPlayerStats.getNetYield(YieldTypes.YIELD_HAPPINESS) ?? -1;
      const nextCelebrationThreshold = localPlayerHappiness.nextGoldenAgeThreshold;
      const happinessTotal = Math.ceil(localPlayerStats.getLifetimeYield(YieldTypes.YIELD_HAPPINESS)) ?? -1;
      const turnsToNextCelebration = Math.max(
        Math.ceil((nextCelebrationThreshold - happinessTotal) / happinessPerTurn2),
        1
      );
      celebrationTurnsLeftNumber.textContent = Locale.compose("LOC_UI_X_TURNS_LEFT", turnsToNextCelebration);
      happinessRingMeter.setAttribute("value", (100 * happinessTotal / nextCelebrationThreshold).toString());
    }
    this.maxNormalPoliciesOnOverview = this.displayActiveCrisisPolicies.length > 0 ? 4 : 6;
    let index = 0;
    if (this.displayActiveNormalPolicies.length == 0) {
      policySection.classList.add("hidden");
    }
    for (const policy of PoliciesData.activeNormalPolicies) {
      if (this.maxNormalPoliciesOnOverview <= index) {
        activeNormalPolicyContainer.lastChild.appendChild(
          this.createXYShownElement(
            this.maxNormalPoliciesOnOverview,
            PoliciesData.activeNormalPolicies.length
          )
        );
        break;
      }
      const policyCard = this.createPolicyCard(policy, false);
      activeNormalPolicyContainer.appendChild(policyCard);
      index++;
    }
    if (this.displayActiveCrisisPolicies.length == 0) {
      crisisSection.classList.add("hidden");
    } else {
      index = 0;
      for (const policy of PoliciesData.activeCrisisPolicies) {
        if (this.maxCrisisPoliciesOnOverview <= index) {
          activeCrisisPolicyContainer.lastChild.appendChild(
            this.createXYShownElement(
              this.maxCrisisPoliciesOnOverview,
              PoliciesData.activeCrisisPolicies.length
            )
          );
          break;
        }
        const policyCard = this.createPolicyCard(policy, false);
        activeCrisisPolicyContainer.appendChild(policyCard);
        index++;
      }
    }
  }
  buildPolicyWindow() {
    const header = MustGetElement(".policies__policies-unlock-text-header", this.policiesWindow);
    const subheader = MustGetElement(".policies__policies-unlock-text-subheader", this.policiesWindow);
    if (!this.hasNormalPolicies()) {
      const unlockText = MustGetElement(".policies__policies-unlock-text", this.policiesWindow);
      const allPoliciesContainer = MustGetElement(".policies__policies-all-container", this.policiesWindow);
      allPoliciesContainer.classList.add("hidden");
      header.setAttribute("title", "LOC_UI_POLICIES_NO_SLOTS_HEADER");
      const localPlayerStats = this.localPlayer?.Stats;
      if (localPlayerStats === void 0) {
        console.error("screen-policies: buildPolicyWindow() - Local player stats is undefined!");
        return;
      }
      const localPlayerHappiness = this.localPlayer?.Happiness;
      if (localPlayerHappiness === void 0) {
        console.error("screen-policies: buildPolicyWindow() - Local player happiness is undefined!");
        return;
      }
      const happinessPerTurn = localPlayerStats.getNetYield(YieldTypes.YIELD_HAPPINESS) ?? -1;
      const nextCelebrationThreshold = localPlayerHappiness.nextGoldenAgeThreshold;
      const happinessTotal = Math.ceil(localPlayerStats.getLifetimeYield(YieldTypes.YIELD_HAPPINESS)) ?? -1;
      const turnsToNextCelebration = Math.ceil(
        (nextCelebrationThreshold - happinessTotal) / happinessPerTurn
      );
      subheader.textContent = Locale.compose("LOC_UI_POLICIES_NO_SLOTS_SUBHEADER", turnsToNextCelebration);
      unlockText.classList.remove("hidden");
      return;
    } else if (this.canSwapNormalPolicies) {
      const localPlayerAdvancedStart = this.localPlayer?.AdvancedStart;
      if (!localPlayerAdvancedStart) {
        console.error("screen-policies: buildPolicyWindow() - Local player asvanced start is undefined!");
        return;
      }
      const unlockText = MustGetElement(".policies__policies-unlock-text", this.policiesWindow);
      unlockText.classList.remove("hidden");
      const hasOpenNormalSlots = this.getNumOpenNormalSlots() > 0;
      if (this.displayAvailableNormalPolicies.length == 0 && hasOpenNormalSlots && localPlayerAdvancedStart.getPlacementComplete()) {
        subheader.setAttribute("data-l10n-id", "LOC_UI_POLICIES_NEW_POLICY_SLOT_CANT_FILL");
      } else {
        subheader.setAttribute("data-l10n-id", "LOC_UI_POLICIES_MAY_CHANGE");
      }
    } else {
      const arrowContainer = MustGetElement(".policies-arrow-container", this.policiesWindow);
      arrowContainer.classList.add("opacity-0");
    }
    this.refreshPolicyWindow();
  }
  refreshPolicyWindow() {
    this.populateAvailableNormalPolicies();
    this.populateActiveNormalPolicies();
    this.setCardHeight(PolicyTabPlacement.POLICIES);
    const confirmDisabled = this.shouldDisableConfirmButton();
    this.confirmButton.setAttribute("disabled", confirmDisabled.toString());
    if (confirmDisabled) {
      this.confirmButton.setAttribute("data-tooltip-content", "LOC_UI_POLICIES_CONFIRM_DISABLED_TOOLTIP");
      NavTray.removeShellAction1();
    } else {
      this.confirmButton.removeAttribute("data-tooltip-content");
      NavTray.addOrUpdateShellAction1("LOC_UI_RESOURCE_ALLOCATION_CONFIRM");
    }
  }
  refreshOverviewPolicies() {
    this.setCardHeight(PolicyTabPlacement.OVERVIEW);
    const activeNormalPolicyContainer = MustGetElement(
      ".policies__overview-policies-container",
      this.overviewWindow
    );
    const crisisSection = MustGetElement(".policies__overview-crisis-section", this.overviewWindow);
    const activeCrisisPolicyContainer = MustGetElement(".policies__overview-crisis-container", this.overviewWindow);
    while (activeNormalPolicyContainer.hasChildNodes()) {
      activeNormalPolicyContainer.removeChild(activeNormalPolicyContainer.lastChild);
    }
    while (activeCrisisPolicyContainer.hasChildNodes()) {
      activeCrisisPolicyContainer.removeChild(activeCrisisPolicyContainer.lastChild);
    }
    let index = 0;
    for (const policy of PoliciesData.activeNormalPolicies) {
      if (this.maxNormalPoliciesOnOverview <= index) {
        activeNormalPolicyContainer.lastChild.appendChild(
          this.createXYShownElement(
            this.maxNormalPoliciesOnOverview,
            PoliciesData.activeNormalPolicies.length
          )
        );
        break;
      }
      const policyCard = this.createPolicyCard(policy, false);
      activeNormalPolicyContainer.appendChild(policyCard);
      index++;
    }
    if (this.displayActiveCrisisPolicies.length == 0) {
      crisisSection.classList.add("hidden");
    } else {
      index = 0;
      for (const policy of PoliciesData.activeCrisisPolicies) {
        if (this.maxCrisisPoliciesOnOverview <= index) {
          activeCrisisPolicyContainer.lastChild.appendChild(
            this.createXYShownElement(
              this.maxCrisisPoliciesOnOverview,
              PoliciesData.activeCrisisPolicies.length
            )
          );
          break;
        }
        const policyCard = this.createPolicyCard(policy, false);
        activeCrisisPolicyContainer.appendChild(policyCard);
        index++;
      }
    }
  }
  buildCrisisWindow() {
    if (!this.hasCrisisPolicies()) {
      const crisisPoliciesSection = MustGetElement(".policies__crisis-all-container", this.crisisWindow);
      crisisPoliciesSection.classList.add("hidden");
    } else {
      this.refreshCrisisWindow();
    }
    const innerProgressBar = MustGetElement(".policies__crisis-progress-bar-inner", this.crisisWindow);
    const markerContainer = MustGetElement(".policies__crisis-marker-container", this.crisisWindow);
    const currentAgeProgression = Game.AgeProgressManager.getCurrentAgeProgressionPoints() + 1;
    const maxAgeProgression = Game.AgeProgressManager.getMaxAgeProgressionPoints();
    const ageProgressionPercent = currentAgeProgression / maxAgeProgression;
    innerProgressBar.style.width = `${utils.clamp(ageProgressionPercent * 100, 0, 100)}%`;
    const crisisProgressText = MustGetElement(".policies__crisis-progress-text", this.crisisWindow);
    for (let i = 0; i < this.crisisEventMarkers.length; i++) {
      if (ageProgressionPercent < this.crisisEventMarkers[i].timelinePlacement) {
        break;
      }
    }
    const crisisStage = Game.CrisisManager.getCurrentCrisisStage(0);
    const nextCrisisStage = Math.max(0, crisisStage + 1);
    let showCrisisText = false;
    if (Game.CrisisManager.isCrisisEnabled(0) && nextCrisisStage < this.crisisEventMarkers.length) {
      const { progressLabelStr, progressLabelStrRange } = this.crisisEventMarkers[nextCrisisStage];
      const minTurns = Game.CrisisManager.getMinimumTurnsRemainingInCurrentCrisis(0, crisisStage);
      const maxTurns = Game.CrisisManager.getMaximumTurnsRemainingInCurrentCrisis(0, crisisStage);
      if (minTurns != -1) {
        if (minTurns < 1) {
          crisisProgressText.innerHTML = Locale.stylize(progressLabelStr, maxTurns);
          showCrisisText = true;
        } else if (maxTurns < minTurns) {
          crisisProgressText.innerHTML = Locale.stylize(progressLabelStr, minTurns);
          showCrisisText = true;
        } else {
          crisisProgressText.innerHTML = Locale.stylize(progressLabelStrRange, minTurns, maxTurns);
          showCrisisText = true;
        }
      }
    }
    crisisProgressText.classList.toggle("hidden", !showCrisisText);
    const uiViewExperience = UI.getViewExperience();
    for (const crisisMarker of this.crisisEventMarkers) {
      const marker = document.createElement("div");
      marker.classList.value = `w-0\\.5 h-4 bg-primary text-center absolute bottom-0`;
      marker.style.right = `${(1 - crisisMarker.timelinePlacement) * 100}%`;
      const markerText = document.createElement("p");
      markerText.classList.value = "absolute min-w-20 max-w-25 bottom-4 font-title-2xs font-fit-shrink";
      markerText.setAttribute("data-l10n-id", crisisMarker.locStr);
      marker.appendChild(markerText);
      markerContainer.appendChild(marker);
      if (uiViewExperience == UIViewExperience.Mobile) {
        const timelinePlacement = Math.round((1 - crisisMarker.timelinePlacement) * 100);
        const moveToBottom = timelinePlacement == 30 || timelinePlacement == 10;
        marker.classList.toggle("top-2", moveToBottom);
        markerText.classList.toggle("top-full", moveToBottom);
        markerText.classList.add("w-48");
        markerText.classList.remove("max-w-25");
      }
    }
    if (!this.canSwapCrisisPolicies) {
      const arrowContainer = MustGetElement(".policies-arrow-container", this.crisisWindow);
      arrowContainer.classList.add("opacity-0");
    }
  }
  refreshCrisisWindow() {
    this.populateAvailableCrisisPolicies();
    this.populateActiveCrisisPolicies();
    this.setCardHeight(PolicyTabPlacement.CRISIS);
    const confirmDisabled = this.shouldDisableConfirmButton();
    this.confirmButton.setAttribute("disabled", confirmDisabled.toString());
    if (confirmDisabled) {
      this.confirmButton.setAttribute("data-tooltip-content", "LOC_UI_POLICIES_CONFIRM_DISABLED_TOOLTIP");
      NavTray.removeShellAction1();
    } else {
      this.confirmButton.removeAttribute("data-tooltip-content");
      NavTray.addOrUpdateShellAction1("LOC_UI_RESOURCE_ALLOCATION_CONFIRM");
    }
  }
  populateAvailableNormalPolicies() {
    const availableContainer = MustGetElement(".policies_policies-available-container", this.Root);
    while (availableContainer.hasChildNodes()) {
      availableContainer.removeChild(availableContainer.lastChild);
    }
    for (const availableNormalPolicy of this.displayAvailableNormalPolicies) {
      const policyCard = this.createPolicyCard(availableNormalPolicy);
      policyCard.setAttribute("data-audio-activate-ref", "data-audio-social-policy-activate");
      policyCard.addEventListener("action-activate", () => {
        this.onAvailablePolicySelected(availableNormalPolicy);
      });
      availableContainer.appendChild(policyCard);
    }
  }
  populateActiveNormalPolicies() {
    const activeContainer = MustGetElement(".policies_policies-active-container", this.Root);
    while (activeContainer.hasChildNodes()) {
      activeContainer.removeChild(activeContainer.lastChild);
    }
    for (const activeNormalPolicy of this.displayActiveNormalPolicies) {
      const policyCard = this.createPolicyCard(activeNormalPolicy);
      policyCard.setAttribute("data-audio-activate-ref", "data-audio-social-policy-remove");
      policyCard.addEventListener("action-activate", () => {
        this.onActivePolicySelected(activeNormalPolicy);
      });
      activeContainer.appendChild(policyCard);
    }
    const numOpenNormalSlots = this.getNumOpenNormalSlots();
    for (let i = 0; i < numOpenNormalSlots; i++) {
      const openPolicyCard = this.createEmptyNormalSlot();
      activeContainer.insertBefore(openPolicyCard, activeContainer.firstChild);
    }
  }
  populateAvailableCrisisPolicies() {
    const availableContainer = MustGetElement(".policies_crisis-available-container", this.Root);
    while (availableContainer.hasChildNodes()) {
      availableContainer.removeChild(availableContainer.lastChild);
    }
    for (const availableCrisisPolicy of this.displayAvailableCrisisPolicies) {
      const policyCard = this.createPolicyCard(availableCrisisPolicy);
      policyCard.setAttribute("data-audio-activate-ref", "data-audio-social-policy-activate");
      policyCard.addEventListener("action-activate", () => {
        this.onAvailablePolicySelected(availableCrisisPolicy);
      });
      availableContainer.appendChild(policyCard);
    }
  }
  populateActiveCrisisPolicies() {
    const activeContainer = MustGetElement(".policies_crisis-active-container", this.Root);
    while (activeContainer.hasChildNodes()) {
      activeContainer.removeChild(activeContainer.lastChild);
    }
    for (const activeCrisisPolicy of this.displayActiveCrisisPolicies) {
      const policyCard = this.createPolicyCard(activeCrisisPolicy);
      policyCard.setAttribute("data-audio-activate-ref", "data-audio-social-policy-remove");
      policyCard.addEventListener("action-activate", () => {
        this.onActivePolicySelected(activeCrisisPolicy);
      });
      activeContainer.appendChild(policyCard);
    }
    const numOpenCrisisSlots = this.getNumOpenCrisisSlots();
    for (let i = 0; i < numOpenCrisisSlots; i++) {
      const openPolicyCard = this.createEmptyCrisisSlot();
      activeContainer.insertBefore(openPolicyCard, activeContainer.firstChild);
    }
  }
  createPolicyCard(policy, isSelectable = true) {
    const policyItem = document.createElement("policy-chooser-item");
    policyItem.setAttribute("data-audio-group-ref", "audio-policy-chooser");
    policyItem.setAttribute("data-audio-press-ref", "data-audio-policy-press");
    if (this.canSwapPolicy(policy)) {
      if (!policy.IsCrisis && PoliciesData.numNormalSlots == this.displayActiveNormalPolicies.length && !this.displayActiveNormalPolicies.includes(policy)) {
        policyItem.setAttribute("play-error-sound", "true");
        policyItem.setAttribute("disabled", "true");
        policyItem.setAttribute("disabled-cursor-allowed", "true");
      } else if (policy.IsCrisis && PoliciesData.numCrisisSlots == this.displayActiveCrisisPolicies.length && !this.displayActiveCrisisPolicies.includes(policy)) {
        policyItem.setAttribute("play-error-sound", "true");
        policyItem.setAttribute("disabled", "true");
        policyItem.setAttribute("disabled-cursor-allowed", "true");
      } else {
        policyItem.setAttribute("play-error-sound", "false");
        policyItem.setAttribute("disabled", "false");
        policyItem.setAttribute("disabled-cursor-allowed", "false");
      }
    } else {
      policyItem.setAttribute("play-error-sound", "true");
      policyItem.setAttribute("disabled", "true");
      policyItem.setAttribute("disabled-cursor-allowed", "true");
    }
    policyItem.whenComponentCreated((chooser) => {
      chooser.policyChooserNode = this.createPolicyNode(policy, isSelectable);
    });
    return policyItem;
  }
  createPolicyNode(policy, isSelectable) {
    let iconType = PolicyChooserItemIcon.NONE;
    const playerCulture = this.localPlayer?.Culture;
    if (!playerCulture) {
      console.error("screen-policies: createPolicyNode() - no player culture found!");
    } else {
      const policyIdeology = playerCulture.getIdeologyForTradition(policy.TraditionType);
      switch (policyIdeology) {
        case Database.makeHash("IDEOLOGY_COMMUNISM"):
          iconType = PolicyChooserItemIcon.COMMUNISM;
          break;
        case Database.makeHash("IDEOLOGY_DEMOCRACY"):
          iconType = PolicyChooserItemIcon.DEMOCRACY;
          break;
        case Database.makeHash("IDEOLOGY_FASCISM"):
          iconType = PolicyChooserItemIcon.FASCISM;
          break;
        default:
          iconType = policy.TraitType ? PolicyChooserItemIcon.TRADITION : PolicyChooserItemIcon.NONE;
          break;
      }
    }
    return {
      name: Locale.compose(policy.Name),
      primaryIcon: "",
      description: Locale.stylize(policy.Description ?? ""),
      isCrisis: policy.IsCrisis,
      isPlaceable: this.canSwapPolicy(policy),
      isLocked: false,
      iconType,
      isSelectable,
      traitType: policy.TraitType ?? void 0
    };
  }
  createEmptyNormalSlot() {
    if (window.innerHeight > Layout.pixelsToScreenPixels(768)) {
      const openPolicyCard = document.createElement("div");
      openPolicyCard.setAttribute("data-audio-group-ref", "policy-chooser");
      openPolicyCard.setAttribute("data-audio-focus", "social-policy-focus");
      openPolicyCard.classList.value = `policies-open-slot-normal policy-placeable policy-chooser-element m-2 bg-no-repeat bg-auto bg-center flex items-center justify-center`;
      const openPolicyCardText = document.createElement("div");
      openPolicyCardText.classList.value = "policies-open-slot-text font-title-base max-w-48 text-center";
      openPolicyCardText.setAttribute("data-l10n-id", "LOC_UI_POLICIES_ADD_NORMAL_POLICY");
      openPolicyCard.appendChild(openPolicyCardText);
      return openPolicyCard;
    } else {
      const openPolicyCard = document.createElement("div");
      openPolicyCard.setAttribute("data-audio-group-ref", "policy-chooser");
      openPolicyCard.setAttribute("data-audio-focus", "social-policy-focus");
      openPolicyCard.classList.value = "policies-open-slot-wide_container policy-chooser-element w-full relative flex m-2 items-center justify-center";
      const openPolicyCardBG = document.createElement("div");
      openPolicyCardBG.classList.value = "size-full flex absolute";
      openPolicyCard.appendChild(openPolicyCardBG);
      const openPolicyCardBGLeft = document.createElement("div");
      openPolicyCardBGLeft.classList.value = "policies-open-slot-wide_half-bg h-full w-1\\/2";
      openPolicyCardBG.appendChild(openPolicyCardBGLeft);
      const openPolicyCardBGRight = document.createElement("div");
      openPolicyCardBGRight.classList.value = "policies-open-slot-wide_half-bg h-full w-1\\/2 -scale-x-100";
      openPolicyCardBG.appendChild(openPolicyCardBGRight);
      const openPolicyCardText = document.createElement("div");
      openPolicyCardText.classList.value = "policies-open-slot-text font-title-base max-w-48 text-center relative";
      openPolicyCardText.setAttribute("data-l10n-id", "LOC_UI_POLICIES_ADD_NORMAL_POLICY");
      openPolicyCard.appendChild(openPolicyCardText);
      return openPolicyCard;
    }
  }
  createEmptyCrisisSlot() {
    const openPolicyCard = document.createElement("div");
    openPolicyCard.setAttribute("data-audio-group-ref", "policy-chooser");
    openPolicyCard.setAttribute("data-audio-focus", "social-policy-focus");
    if (window.innerHeight > Layout.pixelsToScreenPixels(768)) {
      openPolicyCard.classList.value = `policies-open-slot-crisis policy-placeable policy-chooser-element m-2 bg-no-repeat bg-auto bg-center flex items-center justify-center relative`;
    } else {
      openPolicyCard.classList.value = "policies-open-slot-wide_container w-full relative flex m-2 items-center justify-center";
      const openPolicyCardBG = document.createElement("div");
      openPolicyCardBG.classList.value = "size-full flex absolute";
      openPolicyCard.appendChild(openPolicyCardBG);
      const openPolicyCardBGLeft = document.createElement("div");
      openPolicyCardBGLeft.classList.value = "policies-open-slot-wide_half-bg h-full w-1\\/2";
      openPolicyCardBG.appendChild(openPolicyCardBGLeft);
      const openPolicyCardBGRight = document.createElement("div");
      openPolicyCardBGRight.classList.value = "policies-open-slot-wide_half-bg h-full w-1\\/2 -scale-x-100";
      openPolicyCardBG.appendChild(openPolicyCardBGRight);
      const openPolicyCardCrisisBorder = document.createElement("div");
      openPolicyCardCrisisBorder.classList.value = "border border-negative size-full absolute";
      openPolicyCard.appendChild(openPolicyCardCrisisBorder);
    }
    const openPolicyCardImageBG = document.createElement("div");
    openPolicyCardImageBG.classList.value = "absolute bg-center bg-contain bg-no-repeat size-2\\/3";
    openPolicyCardImageBG.style.backgroundImage = `url("civic_crisis_low_op")`;
    openPolicyCard.appendChild(openPolicyCardImageBG);
    const openPolicyCardText = document.createElement("div");
    openPolicyCardText.classList.value = "policies-open-slot-text font-title-base max-w-48 text-center";
    openPolicyCardText.setAttribute("data-l10n-id", "LOC_UI_POLICIES_ADD_CRISIS_POLICY");
    openPolicyCard.appendChild(openPolicyCardText);
    return openPolicyCard;
  }
  onAvailablePolicySelected(policy) {
    if (!policy.IsCrisis && PoliciesData.numNormalSlots == this.displayActiveNormalPolicies.length) {
      return;
    } else if (policy.IsCrisis && PoliciesData.numCrisisSlots == this.displayActiveCrisisPolicies.length) {
      return;
    }
    if (this.policiesToRemove.includes(policy)) {
      const index = this.policiesToRemove.indexOf(policy);
      this.policiesToRemove.splice(index, 1);
    } else {
      this.policiesToAdd.push(policy);
    }
    if (policy.IsCrisis) {
      const index = this.displayAvailableCrisisPolicies.indexOf(policy);
      this.displayAvailableCrisisPolicies.splice(index, 1);
      this.displayActiveCrisisPolicies.unshift(policy);
      this.refreshCrisisWindow();
      if (this.displayAvailableCrisisPolicies.length == 0) {
        this.focusActiveCrisisContainer();
      }
    } else {
      const index = this.displayAvailableNormalPolicies.indexOf(policy);
      this.displayAvailableNormalPolicies.splice(index, 1);
      this.displayActiveNormalPolicies.unshift(policy);
      this.refreshPolicyWindow();
      if (this.canSwapNormalPolicies || this.displayAvailableNormalPolicies.length == 0) {
        this.focusActivePolicyContainer();
      }
    }
  }
  onActivePolicySelected(policy) {
    if (this.canSwapPolicy(policy)) {
      if (this.policiesToAdd.includes(policy)) {
        const index = this.policiesToAdd.indexOf(policy);
        this.policiesToAdd.splice(index, 1);
      } else {
        this.policiesToRemove.push(policy);
      }
      if (policy.IsCrisis) {
        const index = this.displayActiveCrisisPolicies.indexOf(policy);
        this.displayActiveCrisisPolicies.splice(index, 1);
        this.displayAvailableCrisisPolicies.unshift(policy);
        this.refreshCrisisWindow();
        if (this.displayActiveCrisisPolicies.length == 0) {
          this.focusAvailableCrisisContainer();
        }
      } else {
        const index = this.displayActiveNormalPolicies.indexOf(policy);
        this.displayActiveNormalPolicies.splice(index, 1);
        this.displayAvailableNormalPolicies.unshift(policy);
        this.refreshPolicyWindow();
        if (this.displayActiveNormalPolicies.length == 0) {
          this.focusAvailablePolicyContainer();
        }
      }
    }
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.isCancelInput() || inputEvent.detail.name == "sys-menu") {
      this.close();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
    if (inputEvent.detail.name == "shell-action-1") {
      if (!this.shouldDisableConfirmButton()) {
        this.onConfirm();
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
        Audio.playSound("data-audio-policy-confirmed", "audio-policy-chooser");
      }
    }
  }
  onNavigateInput(navigationEvent) {
    const direction = navigationEvent.getDirection();
    switch (direction) {
      case InputNavigationAction.UP:
        if (FocusManager.getFocus().parentElement == MustGetElement(".policies__overview-crisis-container", this.overviewWindow)) {
          FocusManager.setFocus(
            MustGetElement(".policies__overview-policies-container", this.overviewWindow)
          );
        }
        break;
      case InputNavigationAction.RIGHT:
        if (FocusManager.getFocus().parentElement == MustGetElement(".policies_policies-available-container", this.policiesWindow) && this.displayActiveNormalPolicies.length > 0) {
          this.focusActivePolicyContainer();
        } else if (FocusManager.getFocus().parentElement == MustGetElement(".policies_crisis-available-container", this.crisisWindow) && this.displayActiveCrisisPolicies.length > 0) {
          this.focusActiveCrisisContainer();
        }
        break;
      case InputNavigationAction.DOWN:
        if (FocusManager.getFocus().parentElement == MustGetElement(".policies__overview-policies-container", this.overviewWindow) && this.hasCrisisPolicies()) {
          FocusManager.setFocus(MustGetElement(".policies__overview-crisis-container", this.overviewWindow));
        }
        break;
      case InputNavigationAction.LEFT:
        if (FocusManager.getFocus().parentElement == MustGetElement(".policies_policies-active-container", this.policiesWindow) && this.displayAvailableNormalPolicies.length > 0 && this.getNumOpenNormalSlots() > 0) {
          this.focusAvailablePolicyContainer();
        } else if (FocusManager.getFocus().parentElement == MustGetElement(".policies_crisis-active-container", this.crisisWindow) && this.displayAvailableCrisisPolicies.length > 0) {
          this.focusAvailableCrisisContainer();
        }
        break;
      default:
        break;
    }
  }
  focusAvailablePolicyContainer() {
    const availablePolicies = MustGetElement(".policies_policies-available-container", this.policiesWindow);
    Focus.setContextAwareFocus(availablePolicies, this.policiesWindow);
    this.activeNormalPolicyScrollable.removeAttribute("handle-gamepad-pan");
    this.availableNormalPolicyScrollable.setAttribute("handle-gamepad-pan", "true");
  }
  focusActivePolicyContainer() {
    const activePolicies = MustGetElement(".policies_policies-active-container", this.policiesWindow);
    Focus.setContextAwareFocus(activePolicies, this.policiesWindow);
    this.availableNormalPolicyScrollable.removeAttribute("handle-gamepad-pan");
    this.activeNormalPolicyScrollable.setAttribute("handle-gamepad-pan", "true");
  }
  focusAvailableCrisisContainer() {
    const availableCrisis = MustGetElement(".policies_crisis-available-container", this.crisisWindow);
    Focus.setContextAwareFocus(availableCrisis, this.crisisWindow);
    this.activeCrisisPolicyScrollable.removeAttribute("handle-gamepad-pan");
    this.availableCrisisPolicyScrollable.setAttribute("handle-gamepad-pan", "true");
  }
  focusActiveCrisisContainer() {
    const activeCrisis = MustGetElement(".policies_crisis-active-container", this.crisisWindow);
    Focus.setContextAwareFocus(activeCrisis, this.crisisWindow);
    this.availableCrisisPolicyScrollable.removeAttribute("handle-gamepad-pan");
    this.activeCrisisPolicyScrollable.setAttribute("handle-gamepad-pan", "true");
  }
  shouldDisableConfirmButton() {
    let normalSlotsFilled = false;
    let crisisSlotsFilled = false;
    if (this.getNumOpenNormalSlots() == 0 || this.displayAvailableNormalPolicies.length == 0) {
      normalSlotsFilled = true;
    }
    if (this.getNumOpenCrisisSlots() == 0 || this.displayAvailableCrisisPolicies.length == 0) {
      crisisSlotsFilled = true;
    }
    return !normalSlotsFilled && !crisisSlotsFilled;
  }
  onConfirm() {
    this.applyNextPolicy();
  }
  setCardHeight(section) {
    waitForLayout(() => {
      let currentSection = this.Root;
      if (section == PolicyTabPlacement.OVERVIEW) {
        currentSection = this.overviewWindow;
      }
      if (section == PolicyTabPlacement.CRISIS) {
        currentSection = this.crisisWindow;
      }
      if (section == PolicyTabPlacement.POLICIES) {
        currentSection = this.policiesWindow;
      }
      const cardList = currentSection.querySelectorAll(".policy-chooser-element");
      let maxHeight = 0;
      for (let i = 0; i < cardList.length; i++) {
        const { height } = cardList[i].getBoundingClientRect();
        maxHeight = Math.max(maxHeight, height);
      }
      for (let i = 0; i < cardList.length; i++) {
        const card = cardList[i];
        if (card instanceof HTMLElement) {
          if (maxHeight > 145) {
            card.style.heightPX = maxHeight;
          } else {
            card.style.heightPX = 145;
          }
        }
      }
    });
  }
  createXYShownElement(numerator, denominator) {
    const xyContainer = document.createElement("div");
    xyContainer.classList.value = "policies__overview-xy-container absolute -bottom-6 right-2";
    const xyContainerText = document.createElement("div");
    xyContainerText.classList.value = "flex p-2";
    xyContainer.appendChild(xyContainerText);
    const xyContainerTextFraction = document.createElement("div");
    xyContainerTextFraction.textContent = Locale.compose("LOC_UI_X_OVER_Y", numerator, denominator);
    xyContainerTextFraction.classList.value = "font-body-base mr-2";
    xyContainerText.appendChild(xyContainerTextFraction);
    const xyContainerTextShown = document.createElement("div");
    xyContainerTextShown.setAttribute("data-l10n-id", "LOC_UI_SHOWN");
    xyContainerTextShown.classList.value = "font-body-base text-accent-4";
    xyContainerText.appendChild(xyContainerTextShown);
    return xyContainer;
  }
  //TODO: Having to send multiple requests to make all the policy changes we want is really slow and really really bad.
  //TODO: Need a way to pass in both policiesToAdd and policiesToRemove and have all the swapping done in one request
  applyNextPolicy() {
    if (this.policiesToRemove.length + this.policiesToAdd.length == 0) {
      this.close();
      return;
    }
    let policy = void 0;
    let operationParameter = null;
    if (this.policiesToRemove.length > 0) {
      policy = this.policiesToRemove.pop();
      operationParameter = PlayerOperationParameters.Deactivate;
    } else if (this.policiesToAdd.length > 0) {
      policy = this.policiesToAdd.pop();
      operationParameter = PlayerOperationParameters.Activate;
    }
    if (policy && operationParameter) {
      const args = {
        TraditionType: policy.$index,
        Action: operationParameter
      };
      const result = Game.PlayerOperations.canStart(
        GameContext.localPlayerID,
        PlayerOperationTypes.CHANGE_TRADITION,
        args,
        false
      );
      if (result.Success) {
        Game.PlayerOperations.sendRequest(
          GameContext.localPlayerID,
          PlayerOperationTypes.CHANGE_TRADITION,
          args
        );
        const eventHandle = engine.on("TraditionChanged", () => {
          this.applyNextPolicy();
          eventHandle.clear();
        });
      } else {
        console.error(
          "screen-policies: applyNextPolicy(): Unable to successfully deactivate policy with index: ",
          policy.$index,
          " and type: ",
          policy.TraditionType
        );
      }
    } else {
      console.error("screen-policies: applyNextPolicy() - failed to start a tradition change operation!");
    }
  }
  getNumOpenNormalSlots() {
    return PoliciesData.numNormalSlots - this.displayActiveNormalPolicies.length;
  }
  getNumOpenCrisisSlots() {
    return PoliciesData.numCrisisSlots - this.displayActiveCrisisPolicies.length;
  }
  hasNormalPolicies() {
    return this.displayActiveNormalPolicies.length + this.displayAvailableNormalPolicies.length != 0;
  }
  hasCrisisPolicies() {
    return this.displayActiveCrisisPolicies.length + this.displayAvailableCrisisPolicies.length != 0;
  }
  canSwapPolicy(policy) {
    return policy.IsCrisis && this.canSwapCrisisPolicies || !policy.IsCrisis && this.canSwapNormalPolicies;
  }
}
Controls.define("screen-policies", {
  createInstance: ScreenPolicies,
  description: "Screen for choosing policies and crisis policies",
  requires: ["fxs-button", "fxs-close-button"],
  classNames: ["screen-policies", "fullscreen", "flex", "items-center", "justify-center"],
  styles: [styles],
  innerHTML: [content],
  tabIndex: -1
});

export { ScreenPolicies };
//# sourceMappingURL=screen-policies.js.map

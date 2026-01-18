import { A as Audio } from '../../../core/ui/audio-base/audio-support.chunk.js';
import FocusManager from '../../../core/ui/input/focus-manager.js';
import { b as InputEngineEventName } from '../../../core/ui/input/input-support.chunk.js';
import { InterfaceModeChangedEventName, InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { P as Panel, A as AnchorType } from '../../../core/ui/panel-support.chunk.js';
import { C as ComponentID } from '../../../core/ui/utilities/utilities-component-id.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { Icon } from '../../../core/ui/utilities/utilities-image.chunk.js';
import { V as ViewManager } from '../../../core/ui/views/view-manager.chunk.js';
import { BuildingPlacementSelectedPlotChangedEventName, BuildingPlacementManager } from '../building-placement/building-placement-manager.js';
import { TogglePlacementMinMaxEventName } from '../interface-modes/interface-mode-place-building.js';
import { PlaceBuildingV2 } from './model-place-building-v2.js';
import { C as ConstructibleHasTagType } from '../utilities/utilities-tags.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/input/focus-support.chunk.js';
import '../../../core/ui/components/fxs-slot.chunk.js';
import '../../../core/ui/spatial/spatial-manager.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/input/plot-cursor.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/lenses/lens-manager.chunk.js';
import '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import '../city-selection/city-selection.js';
import '../city-zoomer/city-zoomer.chunk.js';
import '../../../core/ui/graph-layout/utils.chunk.js';
import '../interface-modes/interface-mode-choose-plot.js';
import '../utilities/utilities-overlay.chunk.js';
import '../world-input/world-input.js';
import '../../../core/ui/utilities/utilities-network.js';
import '../../../core/ui/shell/mp-legal/mp-legal.js';
import '../../../core/ui/events/shell-events.chunk.js';
import '../../../core/ui/utilities/utilities-liveops.js';
import '../../../core/ui/utilities/utilities-network-constants.chunk.js';
import '../diplomacy/diplomacy-events.js';
import '../interface-modes/support-unit-map-decoration.chunk.js';
import '../production-chooser/panel-production-chooser.js';
import '../../../core/ui/components/fxs-editable-header.chunk.js';
import '../../../core/ui/components/fxs-activatable.chunk.js';
import '../../../core/ui/utilities/utilities-core-databinding.chunk.js';
import '../../../core/ui/utilities/utilities-layout.chunk.js';
import '../build-queue/model-build-queue.js';
import '../city-details/panel-city-details.js';
import '../production-chooser/production-chooser-helpers.chunk.js';
import '../../../core/ui/utilities/utilities-core-textprovider.chunk.js';
import '../tutorial/tutorial-support.chunk.js';
import '../../../core/ui/components/fxs-nav-help.chunk.js';
import '../quest-tracker/quest-item.js';
import '../quest-tracker/quest-tracker.js';
import '../tutorial/tutorial-item.js';
import '../tutorial/tutorial-manager.js';
import '../../../core/ui/input/input-filter.chunk.js';
import '../tutorial/tutorial-events.chunk.js';
import '../views/view-city.js';
import '../../../core/ui/components/fxs-chooser-item.chunk.js';
import '../yield-bar-base/yield-bar-base.js';

const styles = "fs://game/base-standard/ui/place-building/panel-place-building-v2.css";

class PlaceBuildingPanelV2 extends Panel {
  content = null;
  subsystemFrame = document.createElement("fxs-subsystem-frame");
  selectedDiv = document.createElement("div");
  constructibleDetails = document.createElement("constructible-details");
  minimizedDiv = document.createElement("div");
  maximizedDiv = document.createElement("div");
  footerContainer = document.createElement("div");
  hideShowText = document.createElement("div");
  hideShowTouchText = document.createElement("div");
  hideShowHybridText = document.createElement("div");
  onTogglePlacementMinMaxListener = this.onTogglePlacementMinMax.bind(this);
  onBuildingPlacementSelectedPlotChangedListener = this.onBuildingPlacementSelectedPlotChanged.bind(this);
  engineInputEventListener = this.onEngineInput.bind(this);
  constructor(root) {
    super(root);
    this.animateInType = this.animateOutType = AnchorType.RelativeToLeft;
    this.inputContext = InputContext.Shell;
  }
  onInitialize() {
    this.Root.setAttribute("tabindex", "-1");
    this.Root.classList.add(
      "panel-place-building-v2",
      "flex-auto",
      "font-body",
      "text-base",
      "pt-12",
      "pl-6",
      "h-screen",
      "relative"
    );
    this.buildView();
    this.setHidden(true);
  }
  onAttach() {
    super.onAttach();
    if (PlaceBuildingV2.showExpandedView) {
      this.minimizedDiv.classList.add("hidden");
      this.maximizedDiv.classList.remove("hidden");
    } else {
      this.minimizedDiv.classList.remove("hidden");
      this.maximizedDiv.classList.add("hidden");
    }
    this.Root.listenForWindowEvent(TogglePlacementMinMaxEventName, this.onTogglePlacementMinMaxListener);
    this.Root.listenForWindowEvent(InterfaceModeChangedEventName, this.onInterfaceModeChanged);
    this.Root.listenForWindowEvent(
      BuildingPlacementSelectedPlotChangedEventName,
      this.onBuildingPlacementSelectedPlotChangedListener
    );
    this.subsystemFrame.addEventListener("subsystem-frame-close", this.requestClose);
    this.Root.addEventListener(InputEngineEventName, this.engineInputEventListener);
    ViewManager.isWorldZoomAllowed = !PlaceBuildingV2.showExpandedView;
  }
  onDetach() {
    ViewManager.isWorldZoomAllowed = true;
    this.subsystemFrame.removeEventListener("subsystem-frame-close", this.requestClose);
    this.Root.removeEventListener(InputEngineEventName, this.engineInputEventListener);
    super.onDetach();
  }
  onReceiveFocus() {
    if (this.content) {
      FocusManager.setFocus(this.content);
    } else {
      waitForLayout(() => {
        this.content = MustGetElement(
          ".subsystem-frame__content",
          this.subsystemFrame
        );
        FocusManager.setFocus(this.content);
      });
    }
  }
  onBuildingPlacementSelectedPlotChanged() {
    const constructibleType = BuildingPlacementManager.currentConstructible?.ConstructibleType;
    const isWall = constructibleType && ConstructibleHasTagType(constructibleType, "DISTRICT_WALL");
    if (BuildingPlacementManager.selectedPlotIndex && !isWall) {
      this.selectedDiv.classList.remove("hidden");
      this.constructibleDetails.classList.add("hidden");
      this.footerContainer.classList.remove("hidden");
      ViewManager.isWorldZoomAllowed = !PlaceBuildingV2.showExpandedView;
    } else {
      this.selectedDiv.classList.add("hidden");
      this.constructibleDetails.classList.remove("hidden");
      this.footerContainer.classList.add("hidden");
      ViewManager.isWorldZoomAllowed = true;
    }
  }
  buildView() {
    const fragment = document.createDocumentFragment();
    const container = document.createElement("div");
    container.classList.add(
      "panel-place-building-v2_container",
      "flex",
      "flex-col",
      "pointer-events-none",
      "mr-6",
      "top-10",
      "bottom-20",
      "absolute"
    );
    this.buildMainPanel();
    container.appendChild(this.subsystemFrame);
    fragment.appendChild(container);
    this.Root.appendChild(fragment);
  }
  buildMinimized() {
    this.minimizedDiv.classList.add("text-xs");
    this.minimizedDiv.innerHTML = `
			<div class="flex flex-col self-center mb-3" data-bind-if="{{g_PlaceBuildingV2.shouldShowUniqueQuarterText}}">
				<div class="self-center text-center" data-bind-value="{{g_PlaceBuildingV2.uniqueQuarterText}}"></div>
				<div class="self-center text-center text-negative" data-bind-value="{{g_PlaceBuildingV2.uniqueQuarterWarning}}"></div>
			</div>
			<div class="flex flex-col self-center my-2" data-bind-if="{{g_PlaceBuildingV2.shouldShowOverbuild}}">
				<div class="flex text-center mx-2" data-bind-html="{{g_PlaceBuildingV2.overbuildText}}"></div>
			</div>
			<div class="img-base-ticket-bg-container flex-col mt-10 mx-4">
				<div class="flex self-center -mt-16" data-bind-if="{{g_PlaceBuildingV2.hasSelectedPlot}}">
					<fxs-icon class="size-20 flex justify-center items-center mx-2" data-bind-attr-data-icon-id="{{g_PlaceBuildingV2.afterFirstConstructibleSlot.type}}" data-bind-if="{{g_PlaceBuildingV2.afterFirstConstructibleSlot.shouldShow}}">
						<fxs-icon class="size-12" data-icon-id="BUILDING_PLACE" data-bind-if="{{g_PlaceBuildingV2.afterFirstConstructibleSlot.showPlacementIcon}}"></fxs-icon>
						<fxs-icon class="size-12" data-icon-id="CITY_REPAIR" data-bind-if="{{g_PlaceBuildingV2.afterFirstConstructibleSlot.showRepairIcon}}"></fxs-icon>
					</fxs-icon>
					<fxs-icon class="size-20 flex justify-center items-center mx-2" data-bind-attr-data-icon-id="{{g_PlaceBuildingV2.afterSecondConstructibleSlot.type}}" data-bind-if="{{g_PlaceBuildingV2.afterSecondConstructibleSlot.shouldShow}}">
						<fxs-icon class="size-12" data-icon-id="BUILDING_PLACE" data-bind-if="{{g_PlaceBuildingV2.afterSecondConstructibleSlot.showPlacementIcon}}"></fxs-icon>
						<fxs-icon class="size-12" data-icon-id="CITY_REPAIR" data-bind-if="{{g_PlaceBuildingV2.afterSecondConstructibleSlot.showRepairIcon}}"></fxs-icon>
					</fxs-icon>
				</div>
				<div class="flex items-center my-2 self-stretch">
					<div class="constructible-details__divider-line-left"></div>
					<p data-l10n-id="LOC_BUILDING_PLACEMENT_RESULTS" class="mx-2 font-title text-secondary text-sm uppercase"></p>
					<div class="constructible-details__divider-line-right"></div>
				</div>
				<yield-bar-base class="mx-1" is-compact="true" data-bind-attr-data-yield-bar="{{g_PlaceBuildingV2.afterYieldTotalsJSONd}}" data-bind-attr-data-yield-deltas="{{g_PlaceBuildingV2.afterYieldDeltasJSONd}}"></yield-bar-base>
				<div class="flex self-center text-center mt-2 mx-2 mb-3 text-sm" data-bind-html="{{g_PlaceBuildingV2.tileConversionText}}"></div>
			</div>
		`;
  }
  buildMaximized() {
    this.maximizedDiv.classList.add("text-xs");
    this.maximizedDiv.innerHTML = `
			<fxs-header class="uppercase m-2" filigree-style="h4" title='LOC_BUILDING_PLACEMENT_BEFORE'></fxs-header>
			<div class="img-base-ticket-bg-container flex-col mt-10 mx-4">
				<div class="flex self-center -mt-16" data-bind-if="{{g_PlaceBuildingV2.hasSelectedPlot}}">
					<fxs-icon class="size-20 flex justify-center items-center mx-2" data-bind-attr-data-icon-id="{{g_PlaceBuildingV2.firstConstructibleSlot.type}}" data-bind-if="{{g_PlaceBuildingV2.firstConstructibleSlot.shouldShow}}">
						<fxs-icon class="size-12" data-icon-id="BUILDING_PLACE" data-bind-if="{{g_PlaceBuildingV2.firstConstructibleSlot.showPlacementIcon}}"></fxs-icon>
						<fxs-icon class="size-12" data-icon-id="CITY_REPAIR" data-bind-if="{{g_PlaceBuildingV2.firstConstructibleSlot.showRepairIcon}}"></fxs-icon>
					</fxs-icon>
					<fxs-icon class="size-20 flex justify-center items-center mx-2" data-bind-attr-data-icon-id="{{g_PlaceBuildingV2.secondConstructibleSlot.type}}" data-bind-if="{{g_PlaceBuildingV2.secondConstructibleSlot.shouldShow}}">
						<fxs-icon class="size-12" data-icon-id="BUILDING_PLACE" data-bind-if="{{g_PlaceBuildingV2.secondConstructibleSlot.showPlacementIcon}}"></fxs-icon>
						<fxs-icon class="size-12" data-icon-id="CITY_REPAIR" data-bind-if="{{g_PlaceBuildingV2.secondConstructibleSlot.showRepairIcon}}"></fxs-icon>
					</fxs-icon>
				</div>
				<div class="flex items-center w-full my-2">
					<div class="constructible-details__divider-line-left"></div>
					<p data-l10n-id="LOC_BUILDING_PLACEMENT_SETTLEMENT_YIELDS_HEADER" class="mx-2 font-title text-secondary text-sm uppercase"></p>
					<div class="constructible-details__divider-line-right"></div>
				</div>
				<yield-bar-base data-bind-attr-data-yield-bar="{{g_PlaceBuildingV2.currentYieldTotalsJSONd}}"></yield-bar-base>
				<div class="flex justify-between items-center">
					<div data-l10n-id="LOC_BUILDING_PLACEMENT_TILE_TYPE"></div>
					<div class="flex">
						<div class="text-sm" data-bind-attr-data-l10n-id="{{g_PlaceBuildingV2.beforeTileType}}"></div>
						<fxs-icon class="ml-2 size-6" data-bind-attr-data-icon-id="{{g_PlaceBuildingV2.beforeTileIcon}}"></fxs-icon>
					</div>
				</div>
				<div class="flex items-center w-full my-4">
					<div class="constructible-details__divider-line-left"></div>
					<p data-l10n-id="LOC_BUILDING_PLACEMENT_BREAKDOWN" class="mx-2 font-title text-secondary text-sm uppercase"></p>
					<div class="constructible-details__divider-line-right"></div>
				</div>
				<div class="self-center font-body text-sm text-info uppercase my-3\\.5" data-l10n-id="LOC_TERM_NONE" data-bind-if="{{g_PlaceBuildingV2.beforeBreakdownEmpty}}"></div>
				<div data-bind-for="entry:{{g_PlaceBuildingV2.beforeBonuses}}">
					<div class="flex justify-between items-center mx-2">
						<div data-bind-attr-data-l10n-id="{{entry.description}}"></div>
						<div class="flex">
							<div data-bind-for="bonusHtml:{{entry.bonuses}}">
								<div data-bind-html="{{bonusHtml}}"></div>
							</div>
						</div>
					</div>
				</div>
				<div class="flex flex-auto justify-between mx-2" data-bind-if={{g_PlaceBuildingV2.showBeforeMaintenance}}>
					<div data-l10n-id="LOC_UI_PRODUCTION_MAINTENANCE"></div>
					<div class="flex">
						<div class="ml-1" data-bind-for="entry:{{g_PlaceBuildingV2.beforeMaintenance}}">
							<div data-bind-html="{{entry}}"></div>
						</div>
					</div>
				</div>
			</div>
			<fxs-header class="uppercase mt-4 mx-2 mb-2" filigree-style="h4" title='LOC_BUILDING_PLACEMENT_AFTER'></fxs-header>
			<div class="flex flex-col self-center mb-3" data-bind-if="{{g_PlaceBuildingV2.shouldShowUniqueQuarterText}}">
				<div class="self-center text-center" data-bind-value="{{g_PlaceBuildingV2.uniqueQuarterText}}"></div>
				<div class="self-center text-center text-negative" data-bind-value="{{g_PlaceBuildingV2.uniqueQuarterWarning}}"></div>
			</div>
			<div class="flex flex-col self-center my-2" data-bind-if="{{g_PlaceBuildingV2.shouldShowOverbuild}}">
				<div class="flex text-center mx-2" data-bind-html="{{g_PlaceBuildingV2.overbuildText}}"></div>
			</div>
			<div class="img-base-ticket-bg-container flex-col mt-10 mx-4">
				<div class="flex self-center -mt-16" data-bind-if="{{g_PlaceBuildingV2.hasSelectedPlot}}">
					<fxs-icon class="size-20 flex justify-center items-center mx-2" data-bind-attr-data-icon-id="{{g_PlaceBuildingV2.afterFirstConstructibleSlot.type}}" data-bind-if="{{g_PlaceBuildingV2.afterFirstConstructibleSlot.shouldShow}}">
						<fxs-icon class="size-12" data-icon-id="BUILDING_PLACE" data-bind-if="{{g_PlaceBuildingV2.afterFirstConstructibleSlot.showPlacementIcon}}"></fxs-icon>
						<fxs-icon class="size-12" data-icon-id="CITY_REPAIR" data-bind-if="{{g_PlaceBuildingV2.afterFirstConstructibleSlot.showRepairIcon}}"></fxs-icon>
					</fxs-icon>
					<fxs-icon class="size-20 flex justify-center items-center mx-2" data-bind-attr-data-icon-id="{{g_PlaceBuildingV2.afterSecondConstructibleSlot.type}}" data-bind-if="{{g_PlaceBuildingV2.afterSecondConstructibleSlot.shouldShow}}">
						<fxs-icon class="size-12" data-icon-id="BUILDING_PLACE" data-bind-if="{{g_PlaceBuildingV2.afterSecondConstructibleSlot.showPlacementIcon}}"></fxs-icon>
						<fxs-icon class="size-12" data-icon-id="CITY_REPAIR" data-bind-if="{{g_PlaceBuildingV2.afterSecondConstructibleSlot.showRepairIcon}}"></fxs-icon>
					</fxs-icon>
				</div>
				<div class="flex items-center my-2\\.5 self-stretch">
					<div class="constructible-details__divider-line-left"></div>
					<p data-l10n-id="LOC_BUILDING_PLACEMENT_RESULTS" class="mx-2 font-title text-secondary text-sm uppercase"></p>
					<div class="constructible-details__divider-line-right"></div>
				</div>
				<yield-bar-base data-bind-attr-data-yield-bar="{{g_PlaceBuildingV2.afterYieldTotalsJSONd}}" data-bind-attr-data-yield-deltas="{{g_PlaceBuildingV2.afterYieldDeltasJSONd}}"></yield-bar-base>
				<div class="flex justify-between items-center mb-1\\.5">
					<div data-l10n-id="LOC_BUILDING_PLACEMENT_TILE_TYPE"></div>
					<div class="flex">
						<div class="text-sm" data-bind-attr-data-l10n-id="{{g_PlaceBuildingV2.afterTileType}}"></div>
						<fxs-icon class="ml-2 size-6" data-bind-attr-data-icon-id="{{g_PlaceBuildingV2.afterTileIcon}}"></fxs-icon>
					</div>
				</div>
				<div class="flex items-center w-full my-2\\.5">
					<div class="constructible-details__divider-line-left"></div>
					<p data-l10n-id="LOC_BUILDING_PLACEMENT_BREAKDOWN" class="mx-2 font-title text-secondary text-sm uppercase"></p>
					<div class="constructible-details__divider-line-right"></div>
				</div>
				<div class="self-center font-body text-sm text-info uppercase my-3\\.5" data-l10n-id="LOC_TERM_NONE" data-bind-if="{{g_PlaceBuildingV2.afterBreakdownEmpty}}"></div>
				<div data-bind-for="entry:{{g_PlaceBuildingV2.afterBonuses}}">
					<div class="flex justify-between items-center mx-2 mb-1">
						<div data-bind-attr-data-l10n-id="{{entry.description}}"></div>
						<div class="flex">
							<div data-bind-for="bonusHtml:{{entry.bonuses}}">
								<div data-bind-html="{{bonusHtml}}"></div>
							</div>
						</div>
					</div>
				</div>
				<div class="flex flex-auto justify-between mx-2" data-bind-if={{g_PlaceBuildingV2.showAfterMaintenance}}>
					<div data-l10n-id="LOC_UI_PRODUCTION_MAINTENANCE"></div>
					<div class="flex">
						<div class="ml-1" data-bind-for="entry:{{g_PlaceBuildingV2.afterMaintenance}}">
							<div data-bind-html="{{entry}}"></div>
						</div>
					</div>
				</div>
			</div>
		`;
  }
  toggleMinMax() {
    PlaceBuildingV2.showExpandedView = !PlaceBuildingV2.showExpandedView;
    if (PlaceBuildingV2.showExpandedView) {
      Audio.playSound("data-audio-expand-yields", "city-growth");
      this.hideShowText.setAttribute("data-l10n-id", "LOC_BUILDING_PLACEMENT_PRESS_SPACE_HIDE_DETAILS");
      this.hideShowTouchText.setAttribute(
        "data-l10n-id",
        "LOC_BUILDING_PLACEMENT_PRESS_SPACE_HIDE_DETAILS_TOUCH"
      );
      this.hideShowHybridText.setAttribute("data-l10n-id", "LOC_BUILDING_PLACEMENT_PRESS_SPACE_HIDE_DETAILS");
    } else {
      Audio.playSound("data-audio-collapse-yields", "city-growth");
      this.hideShowText.setAttribute("data-l10n-id", "LOC_BUILDING_PLACEMENT_PRESS_SPACE_SHOW_DETAILS");
      this.hideShowTouchText.setAttribute(
        "data-l10n-id",
        "LOC_BUILDING_PLACEMENT_PRESS_SPACE_SHOW_DETAILS_TOUCH"
      );
      this.hideShowHybridText.setAttribute("data-l10n-id", "LOC_BUILDING_PLACEMENT_PRESS_SPACE_SHOW_DETAILS");
    }
    this.minimizedDiv.classList.toggle("hidden");
    this.maximizedDiv.classList.toggle("hidden");
    ViewManager.isWorldZoomAllowed = !PlaceBuildingV2.showExpandedView;
  }
  buildMainPanel() {
    this.buildMinimized();
    this.buildMaximized();
    this.subsystemFrame.innerHTML = `
			<div class="max-w-96 self-center" data-slot="header">
				<fxs-header header-bg-glow="true" class="uppercase tracking-100 m-2" font-fit-mode="shrink" truncate="true" filigree-style="small" data-bind-attr-title='{{g_PlaceBuildingV2.headerText}}'></fxs-header>
			</div>
		`;
    this.constructibleDetails.classList.add("mx-8", "mb-4");
    this.constructibleDetails.setAttribute(
      "data-bind-attributes",
      "{'constructible-type': {{g_PlaceBuildingV2.selectedConstructibleInfo.type}}}"
    );
    this.subsystemFrame.appendChild(this.constructibleDetails);
    this.selectedDiv.classList.add("flex", "flex-col", "mb-2", "hidden");
    this.subsystemFrame.appendChild(this.selectedDiv);
    this.minimizedDiv.classList.add("mx-2");
    this.selectedDiv.appendChild(this.minimizedDiv);
    this.maximizedDiv.classList.add("mx-2");
    this.selectedDiv.appendChild(this.maximizedDiv);
    this.footerContainer.className = "flex self-center items-center max-w-full px-4 mb-2 hidden min-w-0";
    this.footerContainer.setAttribute("data-slot", "footer");
    this.subsystemFrame.appendChild(this.footerContainer);
    const footerIcon = document.createElement("div");
    footerIcon.className = "img-pc_icon_space size-12";
    footerIcon.setAttribute("data-bind-class-toggle", "hidden: !{{g_ActionHandler.isMouseKeyboardActive}}");
    this.footerContainer.appendChild(footerIcon);
    const footerIconTouch = document.createElement("div");
    footerIconTouch.className = "img-handpointer size-7 my-2";
    footerIconTouch.setAttribute("data-bind-class-toggle", "hidden: !{{g_ActionHandler.isTouchActive}}");
    this.footerContainer.appendChild(footerIconTouch);
    const footerIconHybrid = document.createElement("div");
    footerIconHybrid.className = "bg-center bg-no-repeat bg-contain size-7 my-2";
    footerIconHybrid.setAttribute("data-bind-class-toggle", "hidden: !{{g_ActionHandler.isHybridActive}}");
    const imagePath = Icon.getIconFromActionName("unit-skip-turn", InputDeviceType.Hybrid) ?? "";
    footerIconHybrid.style.backgroundImage = `url(${imagePath})`;
    this.footerContainer.appendChild(footerIconHybrid);
    this.hideShowText.className = "flex-auto uppercase text-sm ml-2";
    this.hideShowText.setAttribute("data-bind-class-toggle", "hidden: !{{g_ActionHandler.isMouseKeyboardActive}}");
    this.hideShowTouchText.className = "flex-auto uppercase text-sm ml-2 my-2";
    this.hideShowTouchText.setAttribute("data-bind-class-toggle", "hidden: !{{g_ActionHandler.isTouchActive}}");
    this.hideShowHybridText.className = "flex-auto uppercase text-sm ml-2 my-2";
    this.hideShowHybridText.setAttribute("data-bind-class-toggle", "hidden: !{{g_ActionHandler.isHybridActive}}");
    if (PlaceBuildingV2.showExpandedView) {
      this.hideShowText.setAttribute("data-l10n-id", "LOC_BUILDING_PLACEMENT_PRESS_SPACE_HIDE_DETAILS");
      this.hideShowTouchText.setAttribute(
        "data-l10n-id",
        "LOC_BUILDING_PLACEMENT_PRESS_SPACE_HIDE_DETAILS_TOUCH"
      );
      this.hideShowHybridText.setAttribute("data-l10n-id", "LOC_BUILDING_PLACEMENT_PRESS_SPACE_HIDE_DETAILS");
    } else {
      this.hideShowText.setAttribute("data-l10n-id", "LOC_BUILDING_PLACEMENT_PRESS_SPACE_SHOW_DETAILS");
      this.hideShowTouchText.setAttribute(
        "data-l10n-id",
        "LOC_BUILDING_PLACEMENT_PRESS_SPACE_SHOW_DETAILS_TOUCH"
      );
      this.hideShowHybridText.setAttribute("data-l10n-id", "LOC_BUILDING_PLACEMENT_PRESS_SPACE_SHOW_DETAILS");
    }
    this.footerContainer.appendChild(this.hideShowText);
    this.footerContainer.appendChild(this.hideShowTouchText);
    this.footerContainer.appendChild(this.hideShowHybridText);
    waitForLayout(() => {
      this.content = MustGetElement(
        ".subsystem-frame__content",
        this.subsystemFrame
      );
      this.content.setAttribute("proxy-mouse", "true");
      this.content.setAttribute("attached-scrollbar", "false");
      this.content.setAttribute("handle-gamepad-pan", "true");
      this.content.whenComponentCreated((component) => {
        component.setEngineInputProxy(document.body);
      });
      const track = MustGetElement(".fxs-scrollbar__track--vertical", this.subsystemFrame);
      track.classList.remove("-right-1\\.5");
      track.classList.add("right-1");
    });
  }
  requestClose() {
    const selectedCityID = InterfaceMode.getParameters().CityId != null ? InterfaceMode.getParameters().CityId : UI.Player.getHeadSelectedCity();
    if (selectedCityID && ComponentID.isValid(selectedCityID)) {
      InterfaceMode.switchTo("INTERFACEMODE_CITY_PRODUCTION", { CityID: selectedCityID });
      super.close();
    } else {
      InterfaceMode.switchTo("INTERFACEMODE_DEFAULT");
    }
  }
  onInterfaceModeChanged = () => {
    switch (InterfaceMode.getCurrent()) {
      case "INTERFACEMODE_PLACE_BUILDING":
        this.setHidden(false);
        break;
      default:
        this.setHidden(true);
        break;
    }
  };
  onTogglePlacementMinMax() {
    if (this.constructibleDetails.classList.contains("hidden")) {
      this.toggleMinMax();
    }
  }
  setHidden(hidden) {
    this.Root.classList.toggle("hidden", hidden);
  }
  onEngineInput(engineInput) {
    if (engineInput.detail.name == "touch-tap") {
      this.toggleMinMax();
      engineInput.stopImmediatePropagation();
      engineInput.preventDefault();
    }
  }
}
Controls.define("panel-place-building-v2", {
  createInstance: PlaceBuildingPanelV2,
  description: "",
  classNames: ["panel-place-building-v2"],
  styles: [styles]
});
//# sourceMappingURL=panel-place-building-v2.js.map

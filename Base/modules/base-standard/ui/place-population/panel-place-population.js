import { A as Audio } from '../../../core/ui/audio-base/audio-support.chunk.js';
import { b as InputEngineEventName } from '../../../core/ui/input/input-support.chunk.js';
import { InterfaceModeChangedEventName, InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { N as NavTray } from '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel, A as AnchorType } from '../../../core/ui/panel-support.chunk.js';
import { MustGetElements } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { V as ViewManager } from '../../../core/ui/views/view-manager.chunk.js';
import { ToggleGrowthMinMaxEventName } from '../interface-modes/interface-mode-acquire-tile.js';
import { PlacePopulation, PlacePopulationSelectionChangedEventName, PlacePopulationSelectionState } from './model-place-population.js';
import '../../../core/ui/input/focus-manager.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../../core/ui/input/focus-support.chunk.js';
import '../../../core/ui/components/fxs-slot.chunk.js';
import '../../../core/ui/spatial/spatial-manager.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/input/plot-cursor.js';
import '../../../core/ui/lenses/lens-manager.chunk.js';
import '../building-placement/building-placement-manager.js';
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
import '../plot-workers/plot-workers-manager.js';
import '../placement-city-banner/placement-city-banner.js';
import '../utilities/utilities-city-yields.chunk.js';
import '../yield-bar-base/yield-bar-base.js';

const styles = "fs://game/base-standard/ui/place-population/panel-place-population.css";

class PlacePopulationPanel extends Panel {
  subsystemFrame = document.createElement("fxs-subsystem-frame");
  placeImprovementFrame = document.createElement("fxs-subsystem-frame");
  improvementMinimizedContainer = document.createElement("div");
  improvementMaximizedContainer = document.createElement("div");
  improvementExpandText = document.createElement("div");
  improvementTouchExpandText = document.createElement("div");
  placeSpecialistFrame = document.createElement("fxs-subsystem-frame");
  specialistMinimizedContainer = document.createElement("div");
  specialistMaximizedContainer = document.createElement("div");
  specialistExpandText = document.createElement("div");
  specialistTouchExpandText = document.createElement("div");
  onToggleGrowthMinMaxListener = this.onToggleGrowthMinMax.bind(this);
  engineInputEventListener = this.onEngineInput.bind(this);
  constructor(root) {
    super(root);
    this.animateInType = this.animateOutType = AnchorType.RelativeToLeft;
  }
  onAttach() {
    super.onAttach();
    PlacePopulation.update();
    this.Root.setAttribute("tabindex", "-1");
    this.buildView();
    this.setHidden(true);
    this.Root.listenForWindowEvent(
      PlacePopulationSelectionChangedEventName,
      this.onPlacePopulationSelectionChanged
    );
    this.Root.listenForWindowEvent(ToggleGrowthMinMaxEventName, this.onToggleGrowthMinMaxListener);
    window.addEventListener(InterfaceModeChangedEventName, this.onInterfaceModeChanged);
    this.subsystemFrame.addEventListener("subsystem-frame-close", this.requestClose);
    this.placeImprovementFrame.addEventListener("subsystem-frame-close", this.requestClose);
    this.placeSpecialistFrame.addEventListener("subsystem-frame-close", this.requestClose);
    this.Root.addEventListener(InputEngineEventName, this.engineInputEventListener);
    NavTray.clear();
    NavTray.addOrUpdateGenericBack();
    ViewManager.isWorldZoomAllowed = !PlacePopulation.showExpandedView;
  }
  onDetach() {
    ViewManager.isWorldZoomAllowed = true;
    window.removeEventListener(InterfaceModeChangedEventName, this.onInterfaceModeChanged);
    this.subsystemFrame.removeEventListener("subsystem-frame-close", this.requestClose);
    this.placeImprovementFrame.removeEventListener("subsystem-frame-close", this.requestClose);
    this.placeSpecialistFrame.removeEventListener("subsystem-frame-close", this.requestClose);
    this.Root.removeEventListener(InputEngineEventName, this.engineInputEventListener);
    NavTray.clear();
    super.onDetach();
  }
  buildView() {
    const isMobile = UI.getViewExperience() == UIViewExperience.Mobile;
    const container = document.createElement("div");
    container.classList.add(
      "panel-place-population__container",
      "flex",
      "flex-col",
      "pointer-events-none",
      "mr-6",
      "top-10",
      "bottom-20",
      "absolute"
    );
    container.classList.toggle("max-h-full", isMobile);
    container.appendChild(this.buildPopulationPlacementInfo());
    if (!PlacePopulation.isTown) {
      container.appendChild(this.buildSpecialistInfo());
    }
    container.appendChild(this.buildImprovementInfo());
    this.Root.appendChild(container);
    waitForLayout(() => {
      const scrollableContents = MustGetElements(
        ".subsystem-frame__content",
        this.Root
      );
      for (const content of scrollableContents) {
        content.setAttribute("proxy-mouse", "true");
        content.setAttribute("attached-scrollbar", "false");
        content.setAttribute("handle-gamepad-pan", "true");
        content.whenComponentCreated((component) => {
          component.setEngineInputProxy(document.body);
        });
      }
      const tracks = MustGetElements(".fxs-scrollbar__track--vertical", this.Root);
      for (const track of tracks) {
        track.classList.remove("-right-1\\.5");
        track.classList.add("right-1");
      }
    });
  }
  buildPopulationPlacementInfo() {
    this.subsystemFrame.classList.add("panel-place-population-info");
    this.subsystemFrame.innerHTML = `
			<div class="flex flex-col pb-4 px-4">
				<fxs-header header-bg-glow="true" class="uppercase tracking-100 mt-2" filigree-style="small" data-bind-attr-title="{{g_PlacePopulation.growthTitle}}" filigree-style="h3"></fxs-header>
				<div class="self-center my-3\\.5 text-base" data-bind-value="{{g_PlacePopulation.growthDescription}}"></div>
                <fxs-header title="LOC_UI_CITY_GROWTH_SELECT_A_TILE" filigree-style="h4"></fxs-header>
				<div class="img-base-ticket-bg-container flex-col mt-10">
					<div class="img-expand-icon size-20 -mt-16 self-center"></div>
					<div class="flex items-center w-full my-2">
						<div class="constructible-details__divider-line-left"></div>
						<p data-l10n-id="LOC_UI_CITY_GROWTH_ADD_IMPROVEMENT" class="mx-2 font-title text-secondary text-sm uppercase"></p>
						<div class="constructible-details__divider-line-right"></div>
					</div>
					<div class="mt-2 self-center text-sm" data-l10n-id="LOC_UI_CITY_GROWTH_ADD_IMPROVEMENT_DESC"></div>
				</div>
				<div class="img-base-ticket-bg-container flex-col mt-10" data-bind-if="!{{g_PlacePopulation.isTown}} && !{{g_PlacePopulation.isResettling}} && {{g_PlacePopulation.hasUnlockedSpecialist}}">
					<div class="img-add-population-icon size-20 -mt-16 self-center"></div>
					<div class="flex items-center w-full my-2">
						<div class="constructible-details__divider-line-left"></div>
						<p data-l10n-id="LOC_UI_CITY_GROWTH_ADD_SPECIALST" class="mx-2 font-title text-secondary text-sm uppercase"></p>
						<div class="constructible-details__divider-line-right"></div>
					</div>
					<div class="mt-2 text-sm" data-l10n-id="LOC_UI_CITY_GROWTH_ADD_SPECIALST_DESC"></div>
					<div class="flex justify-between mt-1 items-center text-sm">
						<div class="text-sm w-64" data-l10n-id="LOC_BUILDING_PLACEMENT_SPECIALIST_MAINTENANCE"></div>
						<div class="flex">
							<div class="ml-1" data-bind-for="entry:{{g_PlacePopulation.changeSpecialistMaintenance}}">
								<div class="text-sm" data-bind-html="{{entry}}"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		`;
    return this.subsystemFrame;
  }
  buildSpecialistInfo() {
    this.placeSpecialistFrame.classList.add("panel-place-population_specialist-info", "px-4", "hidden");
    const specialistInfoFrameHeader = document.createElement("fxs-header");
    specialistInfoFrameHeader.classList.add("uppercase", "mt-2");
    specialistInfoFrameHeader.setAttribute("data-slot", "header");
    specialistInfoFrameHeader.setAttribute("header-bg-glow", "true");
    specialistInfoFrameHeader.setAttribute("title", "LOC_UI_CITY_GROWTH_ADD_SPECIALST");
    specialistInfoFrameHeader.setAttribute("filigree-style", "small");
    this.placeSpecialistFrame.appendChild(specialistInfoFrameHeader);
    this.placeSpecialistFrame.appendChild(this.buildSpecialistMinimized());
    this.placeSpecialistFrame.appendChild(this.buildSpecialistMaximized());
    const footerContainer = document.createElement("div");
    footerContainer.className = "flex self-center items-center mb-2 px-6 min-w-0";
    footerContainer.setAttribute("data-slot", "footer");
    this.placeSpecialistFrame.appendChild(footerContainer);
    const footerIcon = document.createElement("div");
    footerIcon.className = "img-pc_icon_space size-12";
    footerIcon.setAttribute("data-bind-class-toggle", "hidden: !{{g_ActionHandler.isMouseKeyboardActive}}");
    footerContainer.appendChild(footerIcon);
    const footerIconTouch = document.createElement("div");
    footerIconTouch.className = "img-handpointer size-7 my-2";
    footerIconTouch.setAttribute("data-bind-class-toggle", "hidden: !{{g_ActionHandler.isTouchActive}}");
    footerContainer.appendChild(footerIconTouch);
    this.specialistExpandText.className = "uppercase text-sm ml-2";
    this.specialistExpandText.setAttribute(
      "data-bind-class-toggle",
      "hidden: !{{g_ActionHandler.isMouseKeyboardActive}}"
    );
    this.specialistTouchExpandText.className = "uppercase text-sm ml-2 my-2";
    this.specialistTouchExpandText.setAttribute(
      "data-bind-class-toggle",
      "hidden: !{{g_ActionHandler.isTouchActive}}"
    );
    if (PlacePopulation.showExpandedView) {
      this.specialistExpandText.setAttribute("data-l10n-id", "LOC_BUILDING_PLACEMENT_PRESS_SPACE_HIDE_DETAILS");
      this.specialistTouchExpandText.setAttribute(
        "data-l10n-id",
        "LOC_BUILDING_PLACEMENT_PRESS_SPACE_HIDE_DETAILS_TOUCH"
      );
    } else {
      this.specialistExpandText.setAttribute("data-l10n-id", "LOC_BUILDING_PLACEMENT_PRESS_SPACE_SHOW_DETAILS");
      this.specialistTouchExpandText.setAttribute(
        "data-l10n-id",
        "LOC_BUILDING_PLACEMENT_PRESS_SPACE_SHOW_DETAILS_TOUCH"
      );
    }
    footerContainer.appendChild(this.specialistExpandText);
    footerContainer.appendChild(this.specialistTouchExpandText);
    return this.placeSpecialistFrame;
  }
  buildSpecialistMinimized() {
    this.specialistMinimizedContainer.classList.toggle("hidden", PlacePopulation.showExpandedView);
    this.specialistMinimizedContainer.innerHTML = `
			<div class="img-base-ticket-bg-container flex-col mt-10">
				<div class="flex self-center items-center -mt-10">
					<div data-bind-for="entry:{{g_PlacePopulation.afterSpecialistSlotStatus}}">
						<div class="w-10 h-10 img-specialist-tile-pip-full" data-bind-if="{{entry}}"></div>
						<div class="w-10 h-10 img-specialist-tile-pip-empty" data-bind-if="!{{entry}}"></div>
					</div>
				</div>
				<div class="flex items-center my-2 self-stretch">
					<div class="constructible-details__divider-line-left"></div>
					<p data-l10n-id="LOC_BUILDING_PLACEMENT_RESULTS" class="mx-2 font-title text-secondary text-sm uppercase"></p>
					<div class="constructible-details__divider-line-right"></div>
				</div>
				<yield-bar-base data-bind-attr-data-yield-bar="{{g_PlacePopulation.afterYieldTotalsJSONd}}" data-bind-attr-data-yield-deltas="{{g_PlacePopulation.afterYieldDeltasJSONd}}"></yield-bar-base>
			</div>
        `;
    return this.specialistMinimizedContainer;
  }
  buildSpecialistMaximized() {
    this.specialistMaximizedContainer.classList.toggle("hidden", !PlacePopulation.showExpandedView);
    this.specialistMaximizedContainer.innerHTML = `
            <fxs-header class="uppercase mt-2" filigree-style="h4" title='LOC_BUILDING_PLACEMENT_BEFORE'></fxs-header>
            <div class="img-base-ticket-bg-container flex-col mt-7">
				<div class="flex self-center items-center -mt-10">
					<div data-bind-for="entry:{{g_PlacePopulation.beforeSpecialistSlotStatus}}">
						<div class="w-10 h-10 img-specialist-tile-pip-full" data-bind-if="{{entry}}"></div>
						<div class="w-10 h-10 img-specialist-tile-pip-empty" data-bind-if="!{{entry}}"></div>
					</div>
				</div>
				<div class="flex items-center w-full my-2">
					<div class="constructible-details__divider-line-left"></div>
					<p data-l10n-id="LOC_BUILDING_PLACEMENT_SETTLEMENT_YIELDS_HEADER" class="mx-2 font-title text-secondary text-sm uppercase"></p>
					<div class="constructible-details__divider-line-right"></div>
				</div>
				<yield-bar-base data-bind-attr-data-yield-bar="{{g_PlacePopulation.currentYieldTotalsJSONd}}"></yield-bar-base>
				<div class="flex justify-between items-center">
					<div class="text-sm" data-l10n-id="LOC_BUILDING_PLACEMENT_TILE_TYPE"></div>
					<div class="flex">
						<div class="text-sm" data-l10n-id="LOC_BUILDING_PLACEMENT_DISTRICT"></div>
						<fxs-icon class="ml-2 size-6" data-icon-id="CITY_URBAN"></fxs-icon>
					</div>
				</div>
				<div class="flex items-center w-full my-2">
					<div class="constructible-details__divider-line-left"></div>
					<p data-l10n-id="LOC_BUILDING_PLACEMENT_BREAKDOWN" class="mx-2 font-title text-secondary text-sm uppercase"></p>
					<div class="constructible-details__divider-line-right"></div>
				</div>
				<div class="my-2 text-sm self-center text-info uppercase" data-bind-if="!{{g_PlacePopulation.alreadyHasSpecialists}}" data-l10n-id="LOC_TERM_NONE"></div>
				<div class="flex flex-auto justify-between mx-2" data-bind-if={{g_PlacePopulation.showBeforeSpecialistBonus}}>
					<div class="text-sm" data-l10n-id="LOC_BUILDING_PLACEMENT_SPECIALIST_BONUS"></div>
					<div class="flex">
						<div class="ml-1" data-bind-for="entry:{{g_PlacePopulation.beforeSpecialistBonus}}">
							<div class="text-sm" data-bind-html="{{entry}}"></div>
						</div>
					</div>
				</div>
				<div class="flex flex-auto justify-between mx-2" data-bind-if={{g_PlacePopulation.showBeforeSpecialistMaintenance}}>
					<div class="text-sm" data-l10n-id="LOC_BUILDING_PLACEMENT_SPECIALIST_MAINTENANCE"></div>
					<div class="flex">
						<div class="ml-1" data-bind-for="entry:{{g_PlacePopulation.beforeSpecialistMaintenance}}">
							<div class="text-sm" data-bind-html="{{entry}}"></div>
						</div>
					</div>
				</div>
			</div>
            <fxs-header class="uppercase mt-4" filigree-style="h4" title='LOC_BUILDING_PLACEMENT_AFTER'></fxs-header>
			<div class="img-base-ticket-bg-container flex-col mt-7">
				<div class="flex self-center items-center -mt-10">
					<div data-bind-for="entry:{{g_PlacePopulation.afterSpecialistSlotStatus}}">
						<div class="w-10 h-10 img-specialist-tile-pip-full" data-bind-if="{{entry}}"></div>
						<div class="w-10 h-10 img-specialist-tile-pip-empty" data-bind-if="!{{entry}}"></div>
					</div>
				</div>
				<div class="flex items-center my-2 self-stretch">
					<div class="constructible-details__divider-line-left"></div>
					<p data-l10n-id="LOC_BUILDING_PLACEMENT_RESULTS" class="mx-2 font-title text-secondary text-sm uppercase"></p>
					<div class="constructible-details__divider-line-right"></div>
				</div>
				<yield-bar-base data-bind-attr-data-yield-bar="{{g_PlacePopulation.afterYieldTotalsJSONd}}" data-bind-attr-data-yield-deltas="{{g_PlacePopulation.afterYieldDeltasJSONd}}"></yield-bar-base>
				<div class="flex justify-between items-center">
					<div class="text-sm" data-l10n-id="LOC_BUILDING_PLACEMENT_TILE_TYPE"></div>
					<div class="flex">
						<div class="text-sm" data-l10n-id="LOC_BUILDING_PLACEMENT_DISTRICT"></div>
						<fxs-icon class="ml-2 size-6" data-icon-id="CITY_URBAN"></fxs-icon>
					</div>
				</div>
				<div class="flex items-center w-full my-2">
					<div class="constructible-details__divider-line-left"></div>
					<p data-l10n-id="LOC_BUILDING_PLACEMENT_BREAKDOWN" class="mx-2 font-title text-secondary text-sm uppercase"></p>
					<div class="constructible-details__divider-line-right"></div>
				</div>
				<div class="flex flex-auto justify-between mx-2" data-bind-if={{g_PlacePopulation.showAfterSpecialistBonus}}>
					<div class="text-sm" data-l10n-id="LOC_BUILDING_PLACEMENT_SPECIALIST_BONUS"></div>
					<div class="flex">
						<div class="ml-1" data-bind-for="entry:{{g_PlacePopulation.afterSpecialistBonus}}">
							<div class="text-sm" data-bind-html="{{entry}}"></div>
						</div>
					</div>
				</div>
				<div class="flex flex-auto justify-between mx-2" data-bind-if={{g_PlacePopulation.showAfterSpecialistMaintenance}}>
					<div class="text-sm" data-l10n-id="LOC_BUILDING_PLACEMENT_SPECIALIST_MAINTENANCE"></div>
					<div class="flex">
						<div class="ml-1" data-bind-for="entry:{{g_PlacePopulation.afterSpecialistMaintenance}}">
							<div class="text-sm" data-bind-html="{{entry}}"></div>
						</div>
					</div>
				</div>
			</div>
        `;
    return this.specialistMaximizedContainer;
  }
  buildImprovementInfo() {
    this.placeImprovementFrame.classList.add("panel-place-population_improvement-info", "px-4", "hidden");
    const improvementInfoFrameHeader = document.createElement("fxs-header");
    improvementInfoFrameHeader.classList.add("uppercase", "mt-2");
    improvementInfoFrameHeader.setAttribute("header-bg-glow", "true");
    improvementInfoFrameHeader.setAttribute("data-slot", "header");
    improvementInfoFrameHeader.setAttribute("title", "LOC_UI_ADD_IMPROVEMENT");
    improvementInfoFrameHeader.setAttribute("filigree-style", "small");
    improvementInfoFrameHeader.setAttribute("font-fit-mode", "shrink");
    this.placeImprovementFrame.appendChild(improvementInfoFrameHeader);
    this.placeImprovementFrame.appendChild(this.buildImprovementMinimized());
    this.placeImprovementFrame.appendChild(this.buildImprovementMaximized());
    const footerContainer = document.createElement("div");
    footerContainer.className = "flex self-center items-center px-6 mb-2 min-w-0";
    footerContainer.setAttribute("data-slot", "footer");
    this.placeImprovementFrame.appendChild(footerContainer);
    const footerIcon = document.createElement("div");
    footerIcon.className = "img-pc_icon_space size-12";
    footerIcon.setAttribute("data-bind-class-toggle", "hidden: !{{g_ActionHandler.isMouseKeyboardActive}}");
    footerContainer.appendChild(footerIcon);
    const footerIconTouch = document.createElement("div");
    footerIconTouch.className = "img-handpointer size-7 my-2";
    footerIconTouch.setAttribute("data-bind-class-toggle", "hidden: !{{g_ActionHandler.isTouchActive}}");
    footerContainer.appendChild(footerIconTouch);
    this.improvementExpandText.className = "uppercase text-sm ml-2";
    this.improvementExpandText.setAttribute(
      "data-bind-class-toggle",
      "hidden: !{{g_ActionHandler.isMouseKeyboardActive}}"
    );
    this.improvementTouchExpandText.className = "uppercase text-sm ml-2 my-2";
    this.improvementTouchExpandText.setAttribute(
      "data-bind-class-toggle",
      "hidden: !{{g_ActionHandler.isTouchActive}}"
    );
    if (PlacePopulation.showExpandedView) {
      this.improvementExpandText.setAttribute("data-l10n-id", "LOC_BUILDING_PLACEMENT_PRESS_SPACE_HIDE_DETAILS");
      this.improvementTouchExpandText.setAttribute(
        "data-l10n-id",
        "LOC_BUILDING_PLACEMENT_PRESS_SPACE_HIDE_DETAILS_TOUCH"
      );
    } else {
      this.improvementExpandText.setAttribute("data-l10n-id", "LOC_BUILDING_PLACEMENT_PRESS_SPACE_SHOW_DETAILS");
      this.improvementTouchExpandText.setAttribute(
        "data-l10n-id",
        "LOC_BUILDING_PLACEMENT_PRESS_SPACE_SHOW_DETAILS_TOUCH"
      );
    }
    footerContainer.appendChild(this.improvementExpandText);
    footerContainer.appendChild(this.improvementTouchExpandText);
    return this.placeImprovementFrame;
  }
  buildImprovementMinimized() {
    this.improvementMinimizedContainer.classList.toggle("hidden", PlacePopulation.showExpandedView);
    this.improvementMinimizedContainer.innerHTML = `
			<div class="img-base-ticket-bg-container flex-col mt-10">
				<fxs-icon class="size-16 self-center -mt-14" data-bind-attr-data-icon-id="{{g_PlacePopulation.addImprovementType}}">
					<div class="img-improvement_add_icon size-8 left-8 top-8 relative"></div>
				</fxs-icon>
				<div class="flex items-center my-2\\.5 self-stretch">
					<div class="constructible-details__divider-line-left"></div>
					<p data-l10n-id="LOC_BUILDING_PLACEMENT_RESULTS" class="mx-2 font-title text-secondary text-sm uppercase"></p>
					<div class="constructible-details__divider-line-right"></div>
				</div>
				<yield-bar-base data-bind-attr-data-yield-bar="{{g_PlacePopulation.afterYieldTotalsJSONd}}" data-bind-attr-data-yield-deltas="{{g_PlacePopulation.afterYieldDeltasJSONd}}"></yield-bar-base>
				<div class="text-center self-center text-sm mt-2" data-l10n-id="LOC_BUILDING_PLACEMENT_UNIMPROVED_TO_IMPROVED"></div>
			</div>
        `;
    return this.improvementMinimizedContainer;
  }
  buildImprovementMaximized() {
    this.improvementMaximizedContainer.classList.toggle("hidden", !PlacePopulation.showExpandedView);
    this.improvementMaximizedContainer.innerHTML = `
            <fxs-header class="uppercase m-2" filigree-style="h4" title='LOC_BUILDING_PLACEMENT_BEFORE'></fxs-header>
            <div class="my-2 text-sm self-center" data-l10n-id="LOC_BUILDING_PLACEMENT_NO_IMPROVEMENT"></div>
            <div class="img-base-ticket-bg-container flex-col mt-3">
				<div class="flex items-center w-full my-2\\.5">
					<div class="constructible-details__divider-line-left"></div>
					<p data-l10n-id="LOC_BUILDING_PLACEMENT_SETTLEMENT_YIELDS_HEADER" class="mx-2 font-title text-secondary text-sm uppercase"></p>
					<div class="constructible-details__divider-line-right"></div>
				</div>
				<yield-bar-base data-bind-attr-data-yield-bar="{{g_PlacePopulation.currentYieldTotalsJSONd}}"></yield-bar-base>
				<div class="flex justify-between items-center">
					<div class="text-sm" data-l10n-id="LOC_BUILDING_PLACEMENT_TILE_TYPE"></div>
					<div class="flex">
						<div class="text-sm" class="uppercase font-bold" data-l10n-id="LOC_DISTRICT_UNIMPROVED_NAME"></div>
						<fxs-icon class="ml-2 size-6" data-icon-id="CITY_UNIMPROVED"></fxs-icon>
					</div>
				</div> 
			</div>
            <fxs-header class="uppercase mt-4 mb-2" filigree-style="h4" title='LOC_BUILDING_PLACEMENT_AFTER'></fxs-header>
            <div class="my-2 text-sm self-center" data-bind-html={{g_PlacePopulation.addImprovementText}}></div>
			<div class="img-base-ticket-bg-container flex-col mt-10">
				<fxs-icon class="size-16 self-center -mt-10" data-bind-attr-data-icon-id="{{g_PlacePopulation.addImprovementType}}">
					<div class="img-improvement_add_icon size-8 left-8 top-8 relative"></div>
				</fxs-icon>
				<div class="flex items-center my-2 self-stretch">
					<div class="constructible-details__divider-line-left"></div>
					<p data-l10n-id="LOC_BUILDING_PLACEMENT_RESULTS" class="mx-2 font-title text-secondary text-sm uppercase"></p>
					<div class="constructible-details__divider-line-right"></div>
				</div>
				<yield-bar-base data-bind-attr-data-yield-bar="{{g_PlacePopulation.afterYieldTotalsJSONd}}" data-bind-attr-data-yield-deltas="{{g_PlacePopulation.afterYieldDeltasJSONd}}"></yield-bar-base>
				<div class="flex justify-between items-center mb-2">
					<div class="text-sm" data-l10n-id="LOC_BUILDING_PLACEMENT_TILE_TYPE"></div>
					<div class="flex">
						<div class="text-sm" class="uppercase font-bold" data-l10n-id="LOC_BUILDING_PLACEMENT_IMPROVEMENT"></div>
						<fxs-icon class="ml-2 size-6" data-icon-id="CITY_RURAL"></fxs-icon>
					</div>
				</div>
				<div class="flex items-center w-full my-2">
					<div class="constructible-details__divider-line-left"></div>
					<p data-l10n-id="LOC_BUILDING_PLACEMENT_BREAKDOWN" class="mx-2 font-title text-secondary text-sm uppercase"></p>
					<div class="constructible-details__divider-line-right"></div>
				</div>
				<div class="flex justify-between items-center mx-2 mb-1" data-bind-for="entry:{{g_PlacePopulation.afterBonuses}}">
					<div data-bind-attr-data-l10n-id="{{entry.description}}"></div>
					<div class="flex">
						<div data-bind-for="bonusHtml:{{entry.bonuses}}">
							<div data-bind-html="{{bonusHtml}}"></div>
						</div>
					</div>
				</div>
        `;
    return this.improvementMaximizedContainer;
  }
  onInterfaceModeChanged = () => {
    switch (InterfaceMode.getCurrent()) {
      case "INTERFACEMODE_ACQUIRE_TILE":
        this.setHidden(false);
        break;
      default:
        this.setHidden(true);
        break;
    }
  };
  setHidden(hidden) {
    this.Root.classList.toggle("hidden", hidden);
  }
  requestClose() {
    InterfaceMode.switchToDefault();
  }
  onToggleGrowthMinMax() {
    if (this.subsystemFrame.classList.contains("hidden")) {
      this.toggleMinMax();
    }
  }
  onPlacePopulationSelectionChanged = (event) => {
    const state = event.detail.state;
    this.subsystemFrame.classList.toggle("hidden", state != PlacePopulationSelectionState.NONE);
    this.placeImprovementFrame.classList.toggle("hidden", state != PlacePopulationSelectionState.ADD_IMPROVEMENT);
    this.placeSpecialistFrame.classList.toggle("hidden", state != PlacePopulationSelectionState.ADD_SPECIALIST);
    if (state == PlacePopulationSelectionState.NONE) {
      ViewManager.isWorldZoomAllowed = true;
    } else {
      ViewManager.isWorldZoomAllowed = !PlacePopulation.showExpandedView;
    }
  };
  toggleMinMax() {
    PlacePopulation.showExpandedView = !PlacePopulation.showExpandedView;
    if (PlacePopulation.showExpandedView) {
      Audio.playSound("data-audio-expand-yields", "city-growth");
      this.specialistExpandText.setAttribute("data-l10n-id", "LOC_BUILDING_PLACEMENT_PRESS_SPACE_HIDE_DETAILS");
      this.specialistTouchExpandText.setAttribute(
        "data-l10n-id",
        "LOC_BUILDING_PLACEMENT_PRESS_SPACE_HIDE_DETAILS_TOUCH"
      );
      this.improvementExpandText.setAttribute("data-l10n-id", "LOC_BUILDING_PLACEMENT_PRESS_SPACE_HIDE_DETAILS");
      this.improvementTouchExpandText.setAttribute(
        "data-l10n-id",
        "LOC_BUILDING_PLACEMENT_PRESS_SPACE_HIDE_DETAILS_TOUCH"
      );
    } else {
      Audio.playSound("data-audio-collapse-yields", "city-growth");
      this.specialistExpandText.setAttribute("data-l10n-id", "LOC_BUILDING_PLACEMENT_PRESS_SPACE_SHOW_DETAILS");
      this.specialistTouchExpandText.setAttribute(
        "data-l10n-id",
        "LOC_BUILDING_PLACEMENT_PRESS_SPACE_SHOW_DETAILS_TOUCH"
      );
      this.improvementExpandText.setAttribute("data-l10n-id", "LOC_BUILDING_PLACEMENT_PRESS_SPACE_SHOW_DETAILS");
      this.improvementTouchExpandText.setAttribute(
        "data-l10n-id",
        "LOC_BUILDING_PLACEMENT_PRESS_SPACE_SHOW_DETAILS_TOUCH"
      );
    }
    this.specialistMinimizedContainer.classList.toggle("hidden", PlacePopulation.showExpandedView);
    this.specialistMaximizedContainer.classList.toggle("hidden", !PlacePopulation.showExpandedView);
    this.improvementMinimizedContainer.classList.toggle("hidden", PlacePopulation.showExpandedView);
    this.improvementMaximizedContainer.classList.toggle("hidden", !PlacePopulation.showExpandedView);
    ViewManager.isWorldZoomAllowed = !PlacePopulation.showExpandedView;
  }
  onEngineInput(engineInput) {
    if (engineInput.detail.name == "touch-tap") {
      this.toggleMinMax();
      engineInput.stopImmediatePropagation();
      engineInput.preventDefault();
    }
  }
}
Controls.define("panel-place-population", {
  createInstance: PlacePopulationPanel,
  description: "",
  classNames: [
    "panel-place-population",
    "flex-auto",
    "font-body",
    "text-base",
    "pt-12",
    "pl-6",
    "h-screen",
    "relative"
  ],
  styles: [styles]
});
//# sourceMappingURL=panel-place-population.js.map

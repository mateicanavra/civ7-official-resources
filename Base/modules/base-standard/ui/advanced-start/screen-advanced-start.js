import { A as Audio } from '../../../core/ui/audio-base/audio-support.chunk.js';
import { d as displayRequestUniqueId, D as DialogBoxAction, a as DialogBoxManager } from '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import Cursor from '../../../core/ui/input/cursor.js';
import FocusManager from '../../../core/ui/input/focus-manager.js';
import { PlotCursor } from '../../../core/ui/input/plot-cursor.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { N as NavTray } from '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel } from '../../../core/ui/panel-support.chunk.js';
import { D as Databind } from '../../../core/ui/utilities/utilities-core-databinding.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import AdvancedStart from './model-advanced-start.js';
import TutorialManager from '../tutorial/tutorial-manager.js';
import WorldInput from '../world-input/world-input.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/input/action-handler.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../../core/ui/input/input-filter.chunk.js';
import '../quest-tracker/quest-item.js';
import '../quest-tracker/quest-tracker.js';
import '../tutorial/tutorial-events.chunk.js';
import '../tutorial/tutorial-item.js';
import '../../../core/ui/utilities/utilities-network.js';
import '../../../core/ui/shell/mp-legal/mp-legal.js';
import '../../../core/ui/events/shell-events.chunk.js';
import '../../../core/ui/utilities/utilities-liveops.js';
import '../../../core/ui/utilities/utilities-network-constants.chunk.js';
import '../diplomacy/diplomacy-events.js';
import '../interface-modes/support-unit-map-decoration.chunk.js';
import '../utilities/utilities-overlay.chunk.js';

const content = "<div class=\"adv-start__content\">\r\n\t<mouse-guard data-bind-if=\"{{g_AdvancedStartModel.deckConfirmed}} == false\"></mouse-guard>\r\n\t<fxs-vslot class=\"advanced-start-outer-vslot\">\r\n\t\t<fxs-hslot class=\"adv-start__parent-slot relative w-full h-full flow-column\">\r\n\t\t\t<div\r\n\t\t\t\tclass=\"adv-start__available-legacy-wrapper absolute flow-column justify-start items-center self-start top-0 left-0 h-full mt-10 ml-8\"\r\n\t\t\t>\r\n\t\t\t\t<fxs-vslot\r\n\t\t\t\t\tclass=\"adv-start__available-legacy-container pr-5 mb-19 relative flex-1\"\r\n\t\t\t\t\tfocus-rule=\"last\"\r\n\t\t\t\t>\r\n\t\t\t\t\t<div\r\n\t\t\t\t\t\tclass=\"absolute -top-7 left-1\\.5 bottom-0 w-56 h-52 mt-9 img-frame-filigree pointer-events-none\"\r\n\t\t\t\t\t></div>\r\n\t\t\t\t\t<div\r\n\t\t\t\t\t\tclass=\"absolute -top-7 right-1\\.5 bottom-0 w-56 h-52 mt-9 rotate-y-180 img-frame-filigree pointer-events-none\"\r\n\t\t\t\t\t></div>\r\n\t\t\t\t\t<div class=\"adv-start__subheader-container flow-column items-center self-center relative\">\r\n\t\t\t\t\t\t<div class=\"adv-start__glow absolute inset-0 opacity-50\"></div>\r\n\t\t\t\t\t\t<div class=\"adv-start__header-info relative mt-7 mb-2\\.5\">\r\n\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\tclass=\"font-title-lg uppercase text-shadow-subtle fxs-header font-bold mb-3 text-center tracking-150\"\r\n\t\t\t\t\t\t\t\tdata-l10n-id=\"LOC_UI_ADVANCED_START_CHOOSE_LEGACIES\"\r\n\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t<img\r\n\t\t\t\t\t\t\t\tclass=\"h-4 w-84\"\r\n\t\t\t\t\t\t\t\tsrc=\"fs://game/shell_small-filigree.png\"\r\n\t\t\t\t\t\t\t/>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t\t<fxs-hslot class=\"adv-start__filter-bar mb-2\\.5 filter-list justify-center\"> </fxs-hslot>\r\n\t\t\t\t\t<div class=\"adv-start__available-cards-content relative px-0 pb-10 flow-column items-center flex-1\">\r\n\t\t\t\t\t\t<fxs-scrollable\r\n\t\t\t\t\t\t\tclass=\"adv-start__scrollable\"\r\n\t\t\t\t\t\t\thandle-gamepad-pan=\"true\"\r\n\t\t\t\t\t\t\tattached-scrollbar=\"true\"\r\n\t\t\t\t\t\t>\r\n\t\t\t\t\t\t\t<fxs-vslot\r\n\t\t\t\t\t\t\t\tclass=\"available-cards adv-start__available-cards-list pt-1 pr-4 pl-5 flow-column\"\r\n\t\t\t\t\t\t\t\ttabindex=\"-1\"\r\n\t\t\t\t\t\t\t>\r\n\t\t\t\t\t\t\t</fxs-vslot>\r\n\t\t\t\t\t\t</fxs-scrollable>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</fxs-vslot>\r\n\t\t\t</div>\r\n\t\t\t<div\r\n\t\t\t\tdata-bind-if=\"{{g_AdvancedStartModel.deckConfirmed}}\"\r\n\t\t\t\tclass=\"card-effects-container absolute right-0 bottom-96\"\r\n\t\t\t>\r\n\t\t\t\t<div class=\"box-contents\">\r\n\t\t\t\t\t<div class=\"subheader-box\">\r\n\t\t\t\t\t\t<div class=\"deck-confirmed text-center ml-1\">\r\n\t\t\t\t\t\t\t<div class=\"adv-start__subheader-image-container mr-13\">\r\n\t\t\t\t\t\t\t\t<p\r\n\t\t\t\t\t\t\t\t\tclass=\"text-shadow-subtle font-title-xs placement-title uppercase tracking-150 text-accent-1 py-1 px-3 m-2\"\r\n\t\t\t\t\t\t\t\t\tdata-l10n-id=\"LOC_UI_ADVANCED_START_PLACE_EFFECTS\"\r\n\t\t\t\t\t\t\t\t></p>\r\n\t\t\t\t\t\t\t\t<div class=\"adv-start__subheader-bar bottom-bar\"></div>\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t\t<fxs-scrollable class=\"advanced-start-scrollable\">\r\n\t\t\t\t\t\t<fxs-vslot class=\"card-effects entries-list pt-1\"></fxs-vslot>\r\n\t\t\t\t\t</fxs-scrollable>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t\t<fxs-vslot\r\n\t\t\t\tdata-bind-if=\"{{g_AdvancedStartModel.deckConfirmed}} == false\"\r\n\t\t\t\tclass=\"adv-start__selected-cards-container absolute flow-column items-start flex-1 left-1\\/2 top-4 bottom-24 w-164\"\r\n\t\t\t\tfocus-rule=\"last\"\r\n\t\t\t>\r\n\t\t\t\t<div\r\n\t\t\t\t\tclass=\"adv-start__top-container flow-column items-start justify-start pointer-events-auto top-5 w-128\"\r\n\t\t\t\t>\r\n\t\t\t\t\t<div class=\"adv-start__header-container relative text-center w-full\">\r\n\t\t\t\t\t\t<p\r\n\t\t\t\t\t\t\tclass=\"adv-start__header-title font-title text-lg uppercase fxs-header text-shadow text-center tracking-150 flex font-bold mt-12 mb-2\"\r\n\t\t\t\t\t\t\tdata-l10n-id=\"LOC_UI_ADVANCED_START_TITLE\"\r\n\t\t\t\t\t\t></p>\r\n\t\t\t\t\t\t<img\r\n\t\t\t\t\t\t\tclass=\"h-4 w-84\"\r\n\t\t\t\t\t\t\tsrc=\"fs://game/shell_small-filigree.png\"\r\n\t\t\t\t\t\t/>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t\t<p\r\n\t\t\t\t\t\tclass=\"adv-start__subtext pt-2 text-accent-1 font-body-base text-center w-full\"\r\n\t\t\t\t\t\tdata-l10n-id=\"LOC_ADVANCED_START_SUBTEXT\"\r\n\t\t\t\t\t></p>\r\n\t\t\t\t\t<fxs-hslot\r\n\t\t\t\t\t\trole=\"paragraph\"\r\n\t\t\t\t\t\tclass=\"adv-start__preset-container pointer-events-auto\"\r\n\t\t\t\t\t>\r\n\t\t\t\t\t</fxs-hslot>\r\n\t\t\t\t\t<div\r\n\t\t\t\t\t\tclass=\"adv-start__currency-container font-body font-bold text-lg text-accent-1 justify-center w-full\"\r\n\t\t\t\t\t>\r\n\t\t\t\t\t\t<fxs-hslot>\r\n\t\t\t\t\t\t\t<div class=\"adv-start__currency-list mt-2 px-6 w-full\"></div>\r\n\t\t\t\t\t\t</fxs-hslot>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t\t<div class=\"adv-start__selected-cards-content flex-auto\">\r\n\t\t\t\t\t<fxs-scrollable\r\n\t\t\t\t\t\tattached-scrollbar=\"true\"\r\n\t\t\t\t\t\tclass=\"adv-start__selected-card-list-scrollable h-full\"\r\n\t\t\t\t\t\thandle-gamepad-pan=\"false\"\r\n\t\t\t\t\t>\r\n\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\tclass=\"adv-start__selected-cards-list-container pt-4 flow-column justify-between items-start\"\r\n\t\t\t\t\t\t>\r\n\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\tclass=\"adv-start__selected-cards-list mr-13 cards-list--full selected-cards entries-list flow-column flex-nowrap items-center justify-start\"\r\n\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t</div>\r\n\t\t\t\t\t</fxs-scrollable>\r\n\t\t\t\t</div>\r\n\t\t\t</fxs-vslot>\r\n\t\t</fxs-hslot>\r\n\t\t<fxs-hslot class=\"adv-start__button-container absolute items-end bottom-6 right-6 justify-between\"> </fxs-hslot>\r\n\t</fxs-vslot>\r\n</div>\r\n";

const styles = "fs://game/base-standard/ui/advanced-start/screen-advanced-start.css";

const AdvancedStartBonusPlacementStarted = new CustomEvent("advanced-start-bonus-placement-started");
class ScreenAdvancedStart extends Panel {
  engineInputListener = this.onEngineInput.bind(this);
  availableCardActivateListener = this.onAvailableCardActivate.bind(this);
  selectedCardActivateListener = this.onSelectedCardActivate.bind(this);
  removeCardAnimationListener = this.onRemoveListener.bind(this);
  effectActivateListener = this.onEffectActivate.bind(this);
  confirmDeckButtonListener = this.onConfirmDeck.bind(this);
  forceCompleteButtonListener = this.onForceComplete.bind(this);
  closeButtonListener = this.close.bind(this);
  autoFillListener = this.autofillDeck.bind(this);
  cardAddedListener = this.onCardAdded.bind(this);
  cardRemovedListener = this.onCardRemovedListener.bind(this);
  effectUsedListener = this.onEffectUsed.bind(this);
  interfaceModeChangedListener = this.onInterfaceModeChanged.bind(this);
  flashCostAnimationListener = this.onFlashAnimationEnd.bind(this);
  filterAvailableCardsListener = this.setFilterAvailableCards.bind(this);
  preSelectNavListener = this.setPresetLegacies.bind(this);
  navigateInputListener = this.onNavigateInput.bind(this);
  dialogId = displayRequestUniqueId();
  isAdvancedStart = false;
  filterButtons = [];
  filterButtonIndex = -1;
  plotSelectionHandler = (plot, previousPlot) => {
    return this.selectPlot(plot, previousPlot);
  };
  onInitialize() {
    super.onInitialize();
    this.Root.classList.add("fullscreen", "h-auto", "w-auto");
  }
  onAttach() {
    super.onAttach();
    AdvancedStart.refreshCardList();
    Audio.playSound("data-audio-advanced-start-enter", "audio-advanced-start");
    Telemetry.sendCardSelectionStart();
    this.Root.addEventListener("engine-input", this.engineInputListener);
    this.Root.addEventListener("navigate-input", this.navigateInputListener);
    engine.on("AdvancedStartCardAdded", this.cardAddedListener);
    engine.on("AdvancedStartCardRemoved", this.cardRemovedListener);
    engine.on("AdvancedStartEffectUsed", this.effectUsedListener);
    window.addEventListener("interface-mode-changed", this.interfaceModeChangedListener);
    const advStartChooser = MustGetElement(".adv-start__available-legacy-wrapper", this.Root);
    if (advStartChooser && AdvancedStart.deckConfirmed) {
      advStartChooser.classList.add("hidden");
    }
    const availableCards = MustGetElement(".available-cards", this.Root);
    if (!availableCards) {
      console.error("screen-advanced-start: onAttach(): Failed to find available-cards!");
      return;
    }
    const cardDiv = document.createElement("div");
    {
      Databind.for(cardDiv, "g_AdvancedStartModel.filteredCards", "entry");
      {
        const cardEntry = document.createElement("fxs-activatable");
        this.buildAvailableCard(cardEntry);
        cardEntry.setAttribute("data-audio-group-ref", "audio-advanced-start");
        cardEntry.setAttribute("data-audio-focus-ref", "data-audio-advanced-start-card-focus");
        cardEntry.setAttribute("data-audio-activate-ref", "data-audio-advanced-start-card-activate");
        cardEntry.setAttribute("data-audio-press-ref", "data-audio-add-press");
        cardEntry.addEventListener("action-activate", this.availableCardActivateListener);
        cardEntry.setAttribute("data-bind-attr-play-error-sound", "{{entry.cannotBeAdded}}");
        cardDiv.appendChild(cardEntry);
      }
    }
    availableCards.appendChild(cardDiv);
    const selectedCards = this.Root.querySelector(
      ".adv-start__selected-cards-list-container"
    );
    if (!selectedCards) {
      console.error("screen-advanced-start: onAttach(): Failed to find selected-cards!");
      return;
    }
    const selectedList = selectedCards.querySelector(".cards-list--full");
    if (!selectedList) {
      console.error("screen-advanced-start: onAttach(): Failed to find selected-cards subsection!");
      return;
    }
    this.setupDeckLimitHeader();
    const selectedCardDiv = document.createElement("div");
    {
      Databind.for(selectedCardDiv, "g_AdvancedStartModel.selectedCards", "entry");
      {
        const selectedCardEntry = document.createElement("fxs-activatable");
        this.buildSelectedCard(selectedCardEntry);
        selectedCardEntry.setAttribute("data-audio-group-ref", "audio-advanced-start");
        selectedCardEntry.setAttribute("data-audio-focus-ref", "data-audio-advanced-start-card-focus");
        selectedCardEntry.setAttribute("data-audio-activate-ref", "data-audio-advanced-start-card-deactivate");
        selectedCardEntry.setAttribute("data-audio-press-ref", "data-audio-remove-press");
        selectedCardEntry.addEventListener("action-activate", this.selectedCardActivateListener);
        selectedCardDiv.appendChild(selectedCardEntry);
      }
    }
    selectedList.appendChild(selectedCardDiv);
    selectedCards.classList.add("contracted");
    const cardEffects = MustGetElement(".card-effects", this.Root);
    const cardEffectDiv = document.createElement("div");
    {
      Databind.for(cardEffectDiv, "g_AdvancedStartModel.placeableCardEffects", "entry");
      {
        const cardEffectEntry = document.createElement("fxs-activatable");
        this.buildSelectedCard(cardEffectEntry);
        cardEffectEntry.setAttribute("data-audio-group-ref", "audio-advanced-start");
        cardEffectEntry.setAttribute("data-audio-focus-ref", "data-audio-advanced-start-card-focus");
        cardEffectEntry.setAttribute("data-audio-press-ref", "data-audio-effect-card-press");
        cardEffectEntry.setAttribute("data-audio-activate-ref", "data-audio-effect-card-activate");
        cardEffectEntry.setAttribute("data-bind-attr-data-type-id", "{{entry.effectID}}");
        cardEffectEntry.setAttribute("data-bind-class-toggle", "hide: !{{entry.display}}");
        cardEffectEntry.classList.add("advanced-start-effect", "mr-13");
        cardEffectEntry.addEventListener("action-activate", this.effectActivateListener);
        cardEffectDiv.appendChild(cardEffectEntry);
      }
    }
    cardEffects.appendChild(cardEffectDiv);
    this.buildFilterButtons();
    this.buildButtonBar();
    const selectedCardsContainer = this.Root.querySelector(
      ".adv-start__selected-cards-container"
    );
    if (!selectedCardsContainer) {
      console.error("screen-advanced-start: onAttach(): Failed to find selected-cards-container!");
      return;
    }
    if (!AdvancedStart.deckConfirmed) {
      if (selectedCardsContainer) {
        if (!selectedCardsContainer.classList.contains("expanded")) {
          selectedCardsContainer.classList.remove("contracted");
          selectedCardsContainer.classList.add("expanded");
        }
      }
    }
    engine.synchronizeModels();
    AdvancedStart.advancedStartClosed = false;
    InterfaceMode.switchTo("INTERFACEMODE_ADVANCED_START");
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    waitForLayout(() => {
      if (AdvancedStart.deckConfirmed) {
        const cardEffects = MustGetElement(".card-effects", this.Root);
        FocusManager.setFocus(cardEffects);
        Input.setActiveContext(InputContext.Dual);
      } else {
        const advStartCard = this.Root.querySelector(".adv-start__card");
        if (advStartCard) {
          FocusManager.setFocus(advStartCard);
        } else {
          console.error("ScreenAdvancedStart: Could not find adv-start__card when receiving focus");
        }
        switch (InterfaceMode.getCurrent()) {
          case "INTERFACEMODE_ADVANCED_START":
            Input.setActiveContext(InputContext.Shell);
            break;
          case "INTERFACEMODE_BONUS_PLACEMENT":
            Input.setActiveContext(InputContext.World);
            break;
        }
      }
      this.setupNavTray();
    });
  }
  buildCardEntry(cardEntry, isSelectedCard = false) {
    cardEntry.setAttribute("tabindex", "-1");
    cardEntry.classList.add("adv-start__card", "advanced-start-available-card");
    cardEntry.classList.toggle("adv-start__card--selected", isSelectedCard);
    cardEntry.setAttribute("data-bind-attr-data-type-id", "{{entry.typeID}}");
    cardEntry.setAttribute("data-bind-class", "{{entry.colorClass}}");
    cardEntry.classList.add("mb-3");
    const cardContent = document.createElement("div");
    cardContent.classList.add("adv-start__card-content", "min-h-24");
    cardContent.classList.toggle("min-h-13", isSelectedCard);
    const cardContentRadial = document.createElement("div");
    cardContentRadial.classList.add("adv-start__card-radial", "absolute", "inset-0");
    cardContent.appendChild(cardContentRadial);
    const cardBgIcon = document.createElement("div");
    cardBgIcon.classList.add(
      "adv-start__card-bg-icon",
      "absolute",
      "right-0",
      "size-28",
      "bg-center",
      "bg-no-repeat",
      "bg-contain",
      "opacity-10",
      "h-full"
    );
    cardBgIcon.classList.toggle("hidden", isSelectedCard);
    cardContent.appendChild(cardBgIcon);
    const cardHighlight = document.createElement("div");
    cardHighlight.classList.add(
      "adv-start__card-highlight",
      "absolute",
      "inset-0",
      "z-1",
      "opacity-0",
      "adv-start__card-highlight-frame"
    );
    cardContent.appendChild(cardHighlight);
    const outerContainer = document.createElement("fxs-hslot");
    outerContainer.classList.add(
      "adv-start__card-info",
      "justify-start",
      "px-1\\.5",
      "text-accent-1",
      "items-center"
    );
    const innerContainer = document.createElement("fxs-vslot");
    innerContainer.classList.add("adv-start__card-text", "text-accent-1", "py-4", "pl-1", "flex-1");
    const cardTypeIcon = document.createElement("div");
    cardTypeIcon.classList.add(
      "adv-start__card-type-icon",
      "size-12",
      "relative",
      "flex",
      "bg-no-repeat",
      "bg-center",
      "bg-contain",
      "ml-2"
    );
    cardTypeIcon.classList.toggle("mt-2", !isSelectedCard);
    cardTypeIcon.classList.toggle("mt-1", isSelectedCard);
    cardTypeIcon.setAttribute("data-bind-style-background-image-url", "{{entry.typeIcon}}");
    outerContainer.appendChild(cardTypeIcon);
    const entryName = document.createElement("div");
    entryName.classList.add(
      "adv-start__card-name",
      "font-title",
      "text-xs",
      "uppercase",
      "tracking-100",
      "w-3\\/4",
      "break-words"
    );
    Databind.locText(entryName, "entry.name");
    innerContainer.appendChild(entryName);
    const entryDescription = document.createElement("div");
    entryDescription.classList.add("adv-start__card-description", "font-body-sm", "flex", "flex-wrap");
    Databind.locText(entryDescription, "entry.description");
    innerContainer.appendChild(entryDescription);
    outerContainer.appendChild(innerContainer);
    const costList = document.createElement("div");
    costList.classList.add(
      "adv-start__card-cost-list",
      "flow-row-wrap",
      "justify-end",
      "items-end",
      "max-w-16",
      "py-3",
      "mr-1",
      "self-start",
      "font-bold",
      "items-center"
    );
    const costContainer = document.createElement("fxs-hslot");
    {
      Databind.for(costContainer, "entry.costs", "cost");
      {
        costContainer.classList.add(
          "adv-start__card-cost-container",
          "relative",
          "flow-row",
          "justify-end",
          "items-center"
        );
        const entryCostName = document.createElement("div");
        entryCostName.classList.add(
          "adv-start__card-cost-name",
          "font-body",
          "text-base",
          "mr-0\\.5",
          "leading-relaxed"
        );
        Databind.locText(entryCostName, "cost.value");
        costContainer.appendChild(entryCostName);
        const entryCost = document.createElement("div");
        entryCost.classList.add(
          "adv-start__card-cost-icon",
          "size-8",
          "bg-no-repeat",
          "bg-contain",
          "bg-center"
        );
        entryCost.setAttribute("data-bind-style-background-image-url", "{{cost.icon}}");
        costContainer.appendChild(entryCost);
        costList.appendChild(costContainer);
      }
    }
    outerContainer.appendChild(costList);
    const cardOverlay = document.createElement("div");
    cardOverlay.classList.add("adv-start__card-overlay", "absolute", "inset-0", "flex", "flex-col");
    const cardOverlayBottom = document.createElement("div");
    cardOverlayBottom.classList.add("adv-start__card-frame", "h-1\\/2", "w-full", "-scale-y-100");
    const cardOverlayTop = document.createElement("div");
    cardOverlayTop.classList.add("adv-start__card-frame", "h-1\\/2", "w-full");
    cardOverlay.appendChild(cardOverlayBottom);
    cardOverlay.appendChild(cardOverlayTop);
    cardContent.appendChild(cardOverlay);
    cardContent.appendChild(outerContainer);
    const cardDisabled = document.createElement("div");
    cardDisabled.classList.add("adv-start__card-disabled", "absolute", "inset-0", "bg-black");
    cardContent.appendChild(cardDisabled);
    const limitContainer = document.createElement("div");
    limitContainer.classList.add(
      "adv-start__card-limit",
      "font-bold",
      "text-accent-1",
      "translate-x-full",
      "right-0",
      "absolute",
      "h-full"
    );
    const limitContainerText = document.createElement("div");
    limitContainerText.classList.add("self-center", "p-1", "ml-1", "text-shadow");
    if (isSelectedCard) {
      Databind.locText(limitContainerText, "entry.multipleInstancesString");
      limitContainer.setAttribute("data-bind-class-toggle", "display: {{entry.numInstances}} > 1");
    } else {
      Databind.locText(limitContainerText, "entry.instancesLeft");
      limitContainer.setAttribute("data-bind-class-toggle", "display: {{entry.instancesLeft}} > 1");
      cardOverlay.setAttribute("data-tooltip-style", "advanceStart");
      Databind.attribute(cardOverlay, "node-id", "entry.typeID");
    }
    cardEntry.appendChild(cardContent);
    limitContainer.appendChild(limitContainerText);
    cardEntry.appendChild(limitContainer);
    Databind.tooltip(cardContent, "entry.tooltip");
    if (!isSelectedCard) {
      cardEntry.setAttribute(
        "data-bind-class-toggle",
        "cannot-be-added:{{entry.cannotBeAdded}};selected:{{entry.hasBeenAdded}};short-card:{{entry.oddCard}};insufficent-funds:{{entry.insufficientFunds}}"
      );
    }
  }
  buildAvailableCard(cardEntry) {
    this.buildCardEntry(cardEntry, false);
  }
  buildSelectedCard(cardEntry) {
    this.buildCardEntry(cardEntry, true);
  }
  buildFilterButtons() {
    const filterList = this.Root.querySelector(".filter-list");
    if (!filterList) {
      console.error("screen-advanced-start: onAttach(): Failed to find filter-list!");
      return;
    }
    const navLeftButton = document.createElement("fxs-nav-help");
    navLeftButton.setAttribute("action-key", "inline-cycle-previous");
    navLeftButton.classList.add("mb-2\\.5");
    filterList.appendChild(navLeftButton);
    const filterText = document.createElement("p");
    filterText.classList.add("adv-start__filter-text", "font-body", "text-base");
    filterText.setAttribute("data-l10n-id", "LOC_ADVANCED_START_FILTER");
    filterList.appendChild(filterText);
    const filterByList = [
      CardCategories.CARD_CATEGORY_WILDCARD,
      CardCategories.CARD_CATEGORY_SCIENTIFIC,
      CardCategories.CARD_CATEGORY_CULTURAL,
      CardCategories.CARD_CATEGORY_MILITARISTIC,
      CardCategories.CARD_CATEGORY_ECONOMIC
    ];
    for (let category = 0; category < filterByList.length; category++) {
      const filterButton = document.createElement("fxs-activatable");
      filterButton.classList.add("adv-start__filter-button");
      filterButton.classList.add(`${AdvancedStart.getCardCategoryColor(filterByList[category])}`);
      const categoryClass = `adv-start__category_${AdvancedStart.getCardCategoryColor(filterByList[category])}`;
      filterButton.classList.add(categoryClass);
      filterButton.setAttribute(
        "data-bind-filter-by",
        AdvancedStart.getCardCategoryColor(filterByList[category])
      );
      const filterIcon = document.createElement("div");
      filterIcon.classList.add(
        "adv-start__currency-icon",
        "size-11",
        "flex",
        "bg-no-repeat",
        "bg-center",
        "mb-1",
        "bg-contain"
      );
      const icon = AdvancedStart.getCardCategoryIconURL(filterByList[category]);
      filterIcon.style.backgroundImage = "url('" + icon + "')";
      filterButton.appendChild(filterIcon);
      filterButton.addEventListener("action-activate", this.filterAvailableCardsListener);
      filterList.appendChild(filterButton);
      this.filterButtons.push(categoryClass);
    }
    const navRightButton = document.createElement("fxs-nav-help");
    navRightButton.setAttribute("action-key", "inline-cycle-next");
    navRightButton.classList.add("mb-2\\.5", "ml-1");
    filterList.appendChild(navRightButton);
  }
  setFilterAvailableCards(event) {
    if (event.target instanceof HTMLElement) {
      const filterType = event.target.getAttribute("data-bind-filter-by");
      if (filterType) {
        const prevSelected = this.Root.querySelector(
          ".adv-start__filter-button.selected"
        );
        if (prevSelected) {
          prevSelected.classList.remove("selected");
        }
        const filterCatergory = AdvancedStart.getCardCategoryByColor(filterType);
        if (AdvancedStart.filterForCards === filterCatergory) {
          AdvancedStart.setFilter(CardCategories.CARD_CATEGORY_NONE);
          event.target.classList.remove("selected");
          event.target.setAttribute("data-bind-selected", "false");
        } else {
          AdvancedStart.setFilter(filterCatergory);
          event.target.classList.add("selected");
          event.target.setAttribute("data-bind-selected", "true");
        }
      }
    }
  }
  setupNavTray() {
    NavTray.clear();
    switch (Input.getActiveContext()) {
      case InputContext.Dual:
        if (this.isAdvancedStart && !AdvancedStart.deckConfirmed) {
          NavTray.addOrUpdateShellAction2("LOC_ADVANCED_START_AUTOFILL");
        }
        if (AdvancedStart.deckConfirmed) {
          NavTray.addOrUpdateShellAction1("LOC_ADVANCED_FORCE_COMPLETE_DECK");
        }
        NavTray.addOrUpdateShellAction3("LOC_ADVANCED_START_VIEW_MAP");
        break;
      case InputContext.Shell:
        if (this.isAdvancedStart && !AdvancedStart.deckConfirmed) {
          NavTray.addOrUpdateShellAction2("LOC_ADVANCED_START_AUTOFILL");
        }
        if (AdvancedStart.deckConfirmed) {
          NavTray.addOrUpdateShellAction1("LOC_ADVANCED_FORCE_COMPLETE_DECK");
        }
        NavTray.addOrUpdateShellAction3("LOC_ADVANCED_START_VIEW_MAP");
        break;
      case InputContext.World:
        NavTray.addOrUpdateGenericBack();
        NavTray.addOrUpdateGenericAccept();
        break;
    }
  }
  onDetach() {
    UI.sendAudioEvent(Audio.getSoundTag("data-audio-advanced-start-exit", "audio-advanced-start"));
    window.removeEventListener("interface-mode-changed", this.interfaceModeChangedListener);
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    engine.off("AdvancedStartCardAdded", this.cardAddedListener);
    engine.off("AdvancedStartCardRemoved", this.cardRemovedListener);
    engine.off("AdvancedStartEffectUsed", this.effectUsedListener);
    InterfaceMode.switchTo("INTERFACEMODE_DEFAULT");
    super.onDetach();
  }
  close() {
    AdvancedStart.advancedStartClosed = true;
    super.close();
  }
  setPanelOptions(options) {
    const advancedStartOptions = options;
    const headerTitle = this.Root.querySelector(".adv-start__header-title");
    const cardTitle = this.Root.querySelector(".adv-start__subtext");
    if (headerTitle && cardTitle) {
      if (advancedStartOptions.isAgeTransition) {
        headerTitle.innerHTML = Locale.compose("LOC_UI_AGE_TRANSITION_TITLE");
        cardTitle.innerHTML = Locale.compose("LOC_UI_ADVANCED_START_CHOOSE_LEGACIES");
      } else {
        headerTitle.innerHTML = Locale.compose("LOC_UI_ADVANCED_START_TITLE");
        cardTitle.innerHTML = Locale.compose("LOC_ADVANCED_START_SUBTEXT");
        this.isAdvancedStart = true;
        this.buildPreselectedContainer();
        this.buildButtonBar(this.isAdvancedStart);
      }
    } else {
      console.error("screen-advanced-start: couldn't find adv-start__header-title and/or adv-start__subtext");
    }
  }
  addAutoFillButton(buttonContainer) {
    if (buttonContainer && !NavTray.isTrayActive) {
      const autoFillButton = document.createElement("fxs-button");
      autoFillButton.classList.add("auto-fill-button", "mx-6");
      autoFillButton.setAttribute(
        "data-bind-if",
        `{{g_AdvancedStartModel.deckConfirmed}} == false && {{g_NavTray.isTrayRequired}} == false`
      );
      autoFillButton.setAttribute("data-audio-group-ref", "audio-advanced-start");
      autoFillButton.setAttribute("data-audio-focus-ref", "data-audio-advanced-start-focus");
      autoFillButton.setAttribute("data-audio-activate-ref", "data-audio-advanced-start-autofill");
      autoFillButton.setAttribute("caption", "LOC_ADVANCED_START_AUTOFILL");
      autoFillButton.addEventListener("action-activate", this.autoFillListener);
      buttonContainer.appendChild(autoFillButton);
    }
  }
  buildButtonBar(isAdvancedStart = false) {
    const buttonContainer = MustGetElement(".adv-start__button-container", this.Root);
    if (!buttonContainer && !NavTray.isTrayActive) {
      console.error("screen-advanced-start: unable to find adv-start__button-container");
      return;
    }
    while (buttonContainer.lastChild) {
      buttonContainer.removeChild(buttonContainer.lastChild);
    }
    const viewMapButton = document.createElement("fxs-button");
    viewMapButton.classList.add("selected-close-button", "mx-6");
    viewMapButton.setAttribute("data-audio-group-ref", "audio-advanced-start");
    viewMapButton.setAttribute("data-audio-focus-ref", "data-audio-advanced-start-focus");
    viewMapButton.setAttribute("data-audio-activate-ref", "data-audio-advanced-start-map");
    viewMapButton.setAttribute("caption", "LOC_ADVANCED_START_VIEW_MAP");
    viewMapButton.setAttribute("data-bind-if", `{{g_NavTray.isTrayRequired}} == false`);
    viewMapButton.addEventListener("action-activate", this.closeButtonListener);
    buttonContainer.appendChild(viewMapButton);
    if (isAdvancedStart) {
      this.addAutoFillButton(buttonContainer);
    }
    const forceComplete = document.createElement("fxs-button");
    forceComplete.classList.add("force-complete-button", "mx-6");
    forceComplete.setAttribute("data-audio-group-ref", "audio-advanced-start");
    forceComplete.setAttribute("data-audio-focus-ref", "data-audio-advanced-start-focus");
    forceComplete.setAttribute("data-audio-activate-ref", "data-audio-advanced-start-finish-activate");
    forceComplete.setAttribute(
      "data-bind-if",
      `{{g_AdvancedStartModel.deckConfirmed}} && {{g_NavTray.isTrayRequired}} == false`
    );
    forceComplete.setAttribute("caption", "LOC_ADVANCED_FORCE_COMPLETE_DECK");
    forceComplete.addEventListener("action-activate", this.forceCompleteButtonListener);
    buttonContainer.appendChild(forceComplete);
    const confirmButton = document.createElement("fxs-button");
    confirmButton.classList.add("confirm-deck-button", "mx-6");
    confirmButton.setAttribute("data-audio-group-ref", "audio-advanced-start");
    confirmButton.setAttribute("data-audio-focus-ref", "data-audio-advanced-start-focus");
    confirmButton.setAttribute("data-audio-activate-ref", "data-audio-advanced-start-confirm-activate");
    confirmButton.setAttribute("data-bind-if", `{{g_AdvancedStartModel.deckConfirmed}} == false`);
    confirmButton.setAttribute("caption", "LOC_ADVANCED_START_CONFIRM_LEGACIES");
    confirmButton.setAttribute("action-key", "inline-shell-action-1");
    confirmButton.addEventListener("action-activate", this.confirmDeckButtonListener);
    buttonContainer.appendChild(confirmButton);
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (TutorialManager.isShowing()) {
      return;
    }
    if (inputEvent.isCancelInput() || inputEvent.detail.name == "shell-action-3" || inputEvent.detail.name == "sys-menu") {
      this.close();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
      return;
    }
    switch (inputEvent.detail.name) {
      case "mousebutton-left":
      case "accept":
        if (Cursor.isOnUI || PlotCursor.plotCursorCoords == null) {
          break;
        }
        if (AdvancedStart.placePlacementEffect(PlotCursor.plotCursorCoords)) {
          inputEvent.stopPropagation();
          inputEvent.preventDefault();
        }
        break;
      case "shell-action-1":
        if (AdvancedStart.deckConfirmed) {
          this.onForceComplete();
        } else {
          this.onConfirmDeck();
          Audio.playSound("data-audio-advanced-start-confirm-activate", "audio-advanced-start");
        }
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
        break;
      case "shell-action-2":
        if (this.isAdvancedStart && !AdvancedStart.deckConfirmed) {
          this.autofillDeck();
          inputEvent.stopPropagation();
          inputEvent.preventDefault();
          Audio.playSound("data-audio-advanced-start-autofill", "audio-advanced-start");
        }
        break;
    }
  }
  selectPlot(plot, _previousPlot) {
    return AdvancedStart.placePlacementEffect(plot);
  }
  //
  onInterfaceModeChanged() {
    switch (InterfaceMode.getCurrent()) {
      case "INTERFACEMODE_CINEMATIC":
        this.Root.style.visibility = "hidden";
        break;
      default:
        this.Root.style.visibility = "visible";
        break;
    }
  }
  onAvailableCardActivate(event) {
    if (event.target instanceof HTMLElement) {
      const typeID = event.target.getAttribute("data-type-id");
      if (typeID) {
        FocusManager.setFocus(event.target);
        const localPlayer = Players.get(GameContext.localPlayerID);
        if (!localPlayer) {
          console.error("screen-advanced-start: couldn't get the local player");
          return;
        }
        const playerAdvancedStart = localPlayer.AdvancedStart;
        if (!playerAdvancedStart) {
          console.error("screen-advanced-start: couldn't get the advanced start info for the local player");
          return;
        }
        const legacyPoints = playerAdvancedStart.getLegacyPoints();
        if (AdvancedStart.addAvailableCard(typeID)) {
          const cardInfo = playerAdvancedStart.getAvailableCards().find((t) => t.id == typeID);
          if (cardInfo) {
            if (cardInfo.id == typeID) {
              cardInfo.cost.forEach((cost) => {
                const legacyCost = legacyPoints.find(
                  (t) => t.category == cost.category
                );
                if (legacyCost) {
                  if (legacyCost.category == cost.category) {
                    if (legacyCost.value < cost.value) {
                      this.animateACost(
                        ".adv-start__category_" + AdvancedStart.getCardCategoryColor(
                          CardCategories.CARD_CATEGORY_WILDCARD
                        )
                      );
                    }
                    if (legacyCost.value > 0) {
                      this.animateACost(
                        ".adv-start__category_" + AdvancedStart.getCardCategoryColor(cost.category)
                      );
                    }
                  }
                }
              });
            }
          }
        }
        const selectedCards = this.Root.querySelector(
          ".adv-start__selected-cards-container"
        );
        if (selectedCards) {
          if (!selectedCards.classList.contains("expanded")) {
            selectedCards.classList.remove("contracted");
            selectedCards.classList.add("expanded");
          }
        }
      }
    }
  }
  animateACost(selectorID) {
    const categoryEntry = this.Root.querySelector(selectorID);
    if (categoryEntry) {
      categoryEntry.removeEventListener("animationend", this.flashCostAnimationListener);
      categoryEntry.classList.remove("adv-start__highlighted");
      categoryEntry.classList.add("adv-start__highlighted");
      categoryEntry.addEventListener("animationend", this.flashCostAnimationListener);
    }
  }
  buildPreselectedContainer() {
    const preSelect = this.Root.querySelector(".adv-start__preset-container");
    if (!preSelect) {
      console.error("screen-advanced-start: couldn't get the advanced start preset filter");
      return;
    }
    preSelect.classList.add(
      "flow-row",
      "mt-6",
      "justify-center",
      "items-center",
      "py-2",
      "w-128",
      "h-13",
      "border-2",
      "border-accent-4",
      "uppercase",
      "tracking-150"
    );
    const leftArrowDom = document.createElement("fxs-activatable");
    const leftArrow = document.createElement("div");
    leftArrow.classList.add("adv-start__left-arrow", "img-arrow");
    leftArrowDom.classList.add("adv-start__left-arrow", "absolute", "left-0");
    leftArrowDom.setAttribute("data-bind-preselect-direction", "left");
    leftArrowDom.setAttribute("data-audio-group-ref", "audio-advanced-start");
    leftArrowDom.setAttribute("data-audio-activate-ref", "data-audio-advanced-start-paginate");
    leftArrowDom.setAttribute("data-audio-press-ref", "data-audio-advanced-start-paginate-press");
    leftArrowDom.appendChild(leftArrow);
    leftArrowDom.addEventListener("action-activate", this.preSelectNavListener);
    const preselectText = document.createElement("div");
    preselectText.classList.add("adv-start__preset-text", "font-title-sm");
    const rightArrowDom = document.createElement("fxs-activatable");
    const rightArrow = document.createElement("div");
    rightArrowDom.classList.add("adv-start__right-arrow", "absolute", "right-0");
    rightArrow.classList.add("adv-start__right-arrow", "img-arrow", "pointer-events-none");
    rightArrowDom.setAttribute("data-bind-preselect-direction", "right");
    rightArrowDom.setAttribute("data-audio-group-ref", "audio-advanced-start");
    rightArrowDom.setAttribute("data-audio-activate-ref", "data-audio-advanced-start-paginate");
    rightArrowDom.setAttribute("data-audio-press-ref", "data-audio-advanced-start-paginate-press");
    rightArrowDom.appendChild(rightArrow);
    rightArrowDom.addEventListener("action-activate", this.preSelectNavListener);
    Databind.classToggle(leftArrowDom, "hidden", `g_NavTray.isTrayRequired`);
    Databind.classToggle(rightArrow, "hidden", `g_NavTray.isTrayRequired`);
    const rightNavHelper = document.createElement("fxs-nav-help");
    rightNavHelper.setAttribute("action-key", "inline-nav-shell-next");
    rightNavHelper.classList.add("absolute", "right-0");
    const leftNavHelper = document.createElement("fxs-nav-help");
    leftNavHelper.setAttribute("action-key", "inline-nav-shell-previous");
    leftNavHelper.classList.add("absolute", "left-2");
    preSelect.appendChild(leftNavHelper);
    preSelect.appendChild(leftArrowDom);
    preSelect.appendChild(preselectText);
    preSelect.appendChild(rightArrowDom);
    preSelect.appendChild(rightNavHelper);
    this.onPreselectChange();
  }
  setPresetLegacies(event) {
    if (event.target instanceof HTMLElement) {
      const direction = event.target.getAttribute("data-bind-preselect-direction");
      let shift = 0;
      switch (direction) {
        case "left":
          shift = -1;
          break;
        case "right":
          shift = 1;
          break;
        default:
          console.error(`screen-advanced-start: unknown direction ${direction}`);
          break;
      }
      AdvancedStart.changePresetLegacies(shift);
      this.onPreselectChange();
    }
  }
  onPreselectChange() {
    const preselectText = this.Root.querySelector(".adv-start__preset-text");
    if (!preselectText) {
      console.error("screen-advanced-start: couldn't get the advanced start preset filter text");
      return;
    }
    const locKey = AdvancedStart.preSelectLoc;
    preselectText.innerHTML = Locale.compose(locKey);
    if (AdvancedStart.preSelectIndex == 0) {
      FocusManager.setFocus(MustGetElement(".adv-start__available-cards-list", this.Root));
    }
  }
  onFlashAnimationEnd(event) {
    if (event.animationName == "highlight-currency") {
      if (event.target) {
        const categoryEntry = event.target;
        categoryEntry.classList.remove("animate-currency");
        categoryEntry.classList.remove("animate-currency-reverse");
      }
    }
  }
  onSelectedCardActivate(event) {
    if (event.currentTarget instanceof HTMLElement) {
      FocusManager.setFocus(event.currentTarget);
      event.currentTarget.addEventListener("animationend", this.removeCardAnimationListener);
      event.currentTarget.classList.add("adv-start__card--remove");
    }
  }
  onRemoveListener(event) {
    if (event.currentTarget instanceof HTMLElement && event.animationName == "adv-start__selected-card-anim-out") {
      event.currentTarget.removeEventListener("animationend", this.removeCardAnimationListener);
      const typeID = event.currentTarget.getAttribute("data-type-id");
      if (typeID) {
        AdvancedStart.removeAvailableCard(typeID);
        if (AdvancedStart.selectedCards.length <= 0) {
          const availableCardsSlot = this.Root.querySelector(".adv-start__card");
          if (!availableCardsSlot) {
            console.error("screen-advanced-start: Unable to find element with class available-cards!");
            return;
          }
          FocusManager.setFocus(availableCardsSlot);
        } else if (event.currentTarget.parentElement?.classList.contains("adv-start__card--selected") && AdvancedStart.selectedCards.length >= 2) {
          const cardContainer = this.Root.querySelector(".adv-start__card--selected");
          if (cardContainer) {
            FocusManager.setFocus(cardContainer);
          }
        }
      }
      event.currentTarget.classList.remove("adv-start__card--remove");
    }
  }
  onCardAdded() {
    this.updateDeckLimitHeader();
    waitForLayout(() => {
      if (!FocusManager.getFocus().isConnected) {
        const cardContainer = this.Root.querySelector(".adv-start__card--selected");
        if (cardContainer) {
          FocusManager.setFocus(cardContainer);
        }
      }
    });
  }
  onCardRemovedListener() {
    this.updateDeckLimitHeader();
    if (AdvancedStart.selectedCards.length <= 1 && AdvancedStart.selectedCards[0]?.numInstances <= 1) {
      const advCardSlot = this.Root.querySelector(".adv-start__card");
      if (!advCardSlot) {
        console.error("screen-advanced-start: Unable to find element with class available-cards!");
        return;
      }
      FocusManager.setFocus(advCardSlot);
    } else {
      waitForLayout(() => {
        const cardContainer = this.Root.querySelector(".adv-start__card--selected");
        if (cardContainer) {
          FocusManager.setFocus(cardContainer);
        }
      });
    }
  }
  onConfirmDeck() {
    const playerAdvancedStart = Players.get(
      GameContext.localPlayerID
    )?.AdvancedStart;
    if (!playerAdvancedStart) {
      console.error(`model-advanced-start: Failed to retrieve Resources for Player ${GameContext.localPlayerID}`);
      return;
    }
    const legacyPoints = playerAdvancedStart.getLegacyPoints();
    let hasPointsRemaining = false;
    for (let i = 0; i < legacyPoints.length; i++) {
      if (legacyPoints[i].value > 0) {
        hasPointsRemaining = true;
        break;
      }
    }
    const confirmDeckCallback = (eAction) => {
      if (eAction == DialogBoxAction.Confirm) {
        AdvancedStart.confirmDeck();
        waitForLayout(() => {
          const cardEffects = MustGetElement(".card-effects", this.Root);
          if (AdvancedStart.placeableCardEffects.length > 0) {
            window.dispatchEvent(AdvancedStartBonusPlacementStarted);
            Input.setActiveContext(InputContext.Dual);
            this.setupNavTray();
            const advStartChooser = MustGetElement(".adv-start__available-legacy-wrapper", this.Root);
            advStartChooser.classList.add("hidden");
            FocusManager.setFocus(cardEffects);
          } else {
            this.close();
          }
        });
      }
    };
    if (hasPointsRemaining) {
      DialogBoxManager.createDialog_ConfirmCancel({
        dialogId: this.dialogId,
        body: "LOC_ADVANCED_START_CONFIRM_UNUSED_POINTS_BODY",
        title: "LOC_ADVANCED_START_CONFIRM_UNUSED_POINTS_TITLE",
        callback: (eAction) => {
          confirmDeckCallback(eAction);
        }
      });
    } else {
      confirmDeckCallback(DialogBoxAction.Confirm);
    }
  }
  onForceComplete() {
    const confirmForceCompleteCallback = (eAction) => {
      if (eAction == DialogBoxAction.Confirm) {
        this.confirmForceComplete();
        Audio.playSound("data-audio-place-effects-confirm", "audio-advanced-start");
      } else {
        Audio.playSound("data-audio-place-effects-confirm-cancel", "audio-advanced-start");
      }
    };
    DialogBoxManager.createDialog_ConfirmCancel({
      body: "LOC_ADVANCED_START_CONFIRM_COMPLETE_BODY",
      title: "LOC_ADVANCED_START_CONFIRM_COMPLETE_TITLE",
      callback: (eAction) => {
        confirmForceCompleteCallback(eAction);
      }
    });
  }
  confirmForceComplete() {
    this.close();
    AdvancedStart.forceComplete();
  }
  onEffectActivate(event) {
    if (event.target instanceof HTMLElement) {
      InterfaceMode.switchTo("INTERFACEMODE_BONUS_PLACEMENT");
      Input.setActiveContext(InputContext.World);
      this.setupNavTray();
      const typeID = event.target.getAttribute("data-type-id");
      if (typeID) {
        WorldInput.setPlotSelectionHandler(this.plotSelectionHandler);
        AdvancedStart.selectPlacementEffect(typeID);
        FocusManager.SetWorldFocused();
      }
    }
  }
  onEffectUsed() {
    if (AdvancedStart.deckConfirmed && AdvancedStart.placeableCardEffects.length <= 1) {
      this.close();
    } else {
      InterfaceMode.switchTo("INTERFACEMODE_ADVANCED_START");
      Input.setActiveContext(InputContext.Dual);
      this.setupNavTray();
      waitForLayout(() => {
        const cardEffects = MustGetElement(".card-effects", this.Root);
        FocusManager.setFocus(cardEffects);
      });
    }
  }
  setupDeckLimitHeader() {
    const deckLimitContainer = MustGetElement(".adv-start__currency-list", this.Root);
    deckLimitContainer.addEventListener("animationend", this.flashCostAnimationListener);
    const uiViewExperience = UI.getViewExperience();
    if (uiViewExperience == UIViewExperience.Mobile) {
      const deckLimitTopContainer = this.Root.querySelector(
        ".adv-start__currency-container"
      );
      if (deckLimitTopContainer) {
        const backgroundDiv = document.createElement("div");
        backgroundDiv.classList.add("absolute", "w-full", "h-3\\/4", "bg-black", "opacity-60", "mt-3");
        deckLimitTopContainer.appendChild(backgroundDiv);
        deckLimitTopContainer.classList.add("w-full", "justify-center");
        deckLimitContainer.classList.add("z-1");
      }
    }
    this.updateDeckLimitHeader(true);
  }
  autofillDeck() {
    AdvancedStart.autoFillLegacies();
  }
  updateDeckLimitHeader(setup = false) {
    const deckLimitContainer = MustGetElement(".adv-start__currency-list", this.Root);
    const localPlayer = Players.get(GameContext.localPlayerID);
    if (!localPlayer) {
      console.error(
        `model-advanced-start: Failed to retrieve PlayerLibrary for Player ${GameContext.localPlayerID}`
      );
      return;
    }
    const playerAdvancedStart = localPlayer.AdvancedStart;
    if (!playerAdvancedStart) {
      console.error(`model-advanced-start: Failed to retrieve Resources for Player ${GameContext.localPlayerID}`);
      return;
    }
    const legacyPoints = playerAdvancedStart.getLegacyPoints();
    const orderList = [
      CardCategories.CARD_CATEGORY_WILDCARD,
      CardCategories.CARD_CATEGORY_SCIENTIFIC,
      CardCategories.CARD_CATEGORY_CULTURAL,
      CardCategories.CARD_CATEGORY_MILITARISTIC,
      CardCategories.CARD_CATEGORY_ECONOMIC
    ];
    for (let category = 0; category < orderList.length; category++) {
      const instance = legacyPoints.find((target) => {
        return target.category == orderList[category];
      });
      const instanceValue = instance?.value || 0;
      let targetCurrency = deckLimitContainer.querySelector(
        `.${AdvancedStart.getCardCategoryColor(orderList[category])}`
      );
      if (!targetCurrency) {
        targetCurrency = document.createElement("div");
        targetCurrency.classList.add("adv-start__currency-item");
        targetCurrency.classList.add(`${AdvancedStart.getCardCategoryColor(orderList[category])}`);
        targetCurrency.classList.add(
          `adv-start__category_${AdvancedStart.getCardCategoryColor(orderList[category])}`
        );
      }
      let pointsText = targetCurrency.querySelector(".adv-start__currency-text");
      if (!pointsText) {
        pointsText = document.createElement("div");
        pointsText.classList.add("adv-start__currency-text", "font-body");
        targetCurrency.appendChild(pointsText);
        const icon = AdvancedStart.getCardCategoryIconURL(orderList[category]);
        const pointsIcon = document.createElement("div");
        pointsIcon.classList.add(
          "adv-start__currency-icon",
          "size-11",
          "flex",
          "bg-no-repeat",
          "bg-center",
          "mb-1",
          "bg-contain"
        );
        pointsIcon.style.backgroundImage = "url('" + icon + "')";
        pointsIcon.setAttribute("data-tooltip-style", "advanceStart");
        pointsIcon.setAttribute("node-id", AdvancedStart.getCardCategoryColor(orderList[category]));
        targetCurrency.appendChild(pointsIcon);
        deckLimitContainer.appendChild(targetCurrency);
      }
      let highlightLayer = targetCurrency.querySelector(`.currency-highlight`);
      if (!highlightLayer) {
        highlightLayer = document.createElement("div");
        highlightLayer.classList.add("adv-start__currency-item", "currency-highlight");
        highlightLayer.innerHTML = targetCurrency.innerHTML;
        targetCurrency.appendChild(highlightLayer);
      }
      pointsText.innerHTML = instanceValue.toString();
      const highlightText = highlightLayer.querySelector(".adv-start__currency-text");
      if (highlightText && highlightText.innerHTML != instanceValue.toString()) {
        const oldNum = parseFloat(highlightText.innerHTML);
        highlightText.innerHTML = instanceValue.toString();
        if (!setup) {
          highlightLayer.classList.add(
            oldNum > instanceValue ? "animate-currency" : "animate-currency-reverse"
          );
        }
      }
    }
  }
  onNavigateInput(navigationEvent) {
    const live = this.handleNavigation(navigationEvent);
    if (!live) {
      navigationEvent.preventDefault();
      navigationEvent.stopPropagation();
    }
  }
  /**
   * @returns true if still live, false if input should stop.
   */
  handleNavigation(navigationEvent) {
    if (navigationEvent.detail.status != InputActionStatuses.FINISH) {
      return true;
    }
    let presetContainerActive = false;
    const preSelect = this.Root.querySelector(".adv-start__preset-container");
    if (preSelect && this.isAdvancedStart) {
      presetContainerActive = true;
    }
    let live = true;
    const direction = navigationEvent.getDirection();
    switch (direction) {
      case InputNavigationAction.SHELL_PREVIOUS: {
        if (presetContainerActive) {
          AdvancedStart.changePresetLegacies(-1);
          this.onPreselectChange();
          Audio.playSound("data-audio-activate", "audio-pager");
        }
        live = false;
        break;
      }
      case InputNavigationAction.SHELL_NEXT: {
        if (presetContainerActive) {
          AdvancedStart.changePresetLegacies(1);
          this.onPreselectChange();
          Audio.playSound("data-audio-activate", "audio-pager");
        }
        live = false;
        break;
      }
      case InputNavigationAction.PREVIOUS: {
        if (!AdvancedStart.deckConfirmed) {
          this.navigateFilters(-1);
        }
        live = false;
        Audio.playSound("data-audio-press");
        break;
      }
      case InputNavigationAction.NEXT: {
        if (!AdvancedStart.deckConfirmed) {
          this.navigateFilters(1);
        }
        live = false;
        Audio.playSound("data-audio-press");
        break;
      }
    }
    return live;
  }
  navigateFilters(indexShift) {
    if (this.filterButtons[this.filterButtonIndex]) {
      const prevSelect = MustGetElement(`.${this.filterButtons[this.filterButtonIndex]}`, this.Root);
      prevSelect.classList.remove("selected");
      prevSelect.setAttribute("data-bind-selected", "false");
    }
    this.filterButtonIndex = this.filterButtonIndex + indexShift;
    if (this.filterButtonIndex == -2) {
      this.filterButtonIndex = this.filterButtons.length - 1;
    }
    if (this.filterButtonIndex < 0 || this.filterButtonIndex >= this.filterButtons.length) {
      this.filterButtonIndex = -1;
      AdvancedStart.setFilter(CardCategories.CARD_CATEGORY_NONE);
    } else {
      const nextSelect = MustGetElement(`.${this.filterButtons[this.filterButtonIndex]}`, this.Root);
      const filterType = nextSelect.getAttribute("data-bind-filter-by");
      if (filterType) {
        const filterCatergory = AdvancedStart.getCardCategoryByColor(filterType);
        AdvancedStart.setFilter(filterCatergory);
        nextSelect.classList.add("selected");
        nextSelect.setAttribute("data-bind-selected", "true");
      }
    }
    const advCardSlot = this.Root.querySelector(".adv-start__card");
    if (!advCardSlot) {
      console.error("screen-advanced-start navigateFilters: Unable to find element with class available-cards!");
      return;
    }
    FocusManager.setFocus(advCardSlot);
  }
}
Controls.define("screen-advanced-start", {
  createInstance: ScreenAdvancedStart,
  description: "Advanced Start screen.",
  classNames: [],
  styles: [styles],
  innerHTML: [content],
  attributes: []
});
//# sourceMappingURL=screen-advanced-start.js.map

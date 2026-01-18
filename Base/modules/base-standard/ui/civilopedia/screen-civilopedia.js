import { A as Audio } from '../../../core/ui/audio-base/audio-support.chunk.js';
import { DisplayQueueManager } from '../../../core/ui/context-manager/display-queue-manager.js';
import ActionHandler, { ActiveDeviceTypeChangedEventName } from '../../../core/ui/input/action-handler.js';
import FocusManager from '../../../core/ui/input/focus-manager.js';
import { b as InputEngineEventName } from '../../../core/ui/input/input-support.chunk.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import { N as NavTray } from '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel } from '../../../core/ui/panel-support.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { L as Layout } from '../../../core/ui/utilities/utilities-layout.chunk.js';
import { ChooserItem } from '../chooser-item/chooser-item.js';
import { instance, DetailsType } from './model-civilopedia.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../../core/ui/components/fxs-activatable.chunk.js';
import '../chooser-item/chooser-item.chunk.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';

const content = "<fxs-frame\r\n\tframe-style=\"f1\"\r\n\toverride-styling=\"flex size-full px-10 pb-4\"\r\n>\r\n\t<fxs-close-button></fxs-close-button>\r\n\r\n\t<fxs-header\r\n\t\tid=\"civilopedia-header\"\r\n\t\ttitle-style=\"h1\"\r\n\t\ttitle=\"LOC_UI_VIEW_CIVILOPEDIA\"\r\n\t\tclass=\"self-center font-title tracking-150 text-2xl text-gradient-secondary mt-8\"\r\n\t></fxs-header>\r\n\r\n\t<!-- Experiment with a more grande logo in the pedia -->\r\n\t<!--<div class=\"pause-menu__header-top-filagree flex w-96 h-6 bg-contain bg-no-repeat self-center mt-8\"></div>\r\n\t<div class=\"pause-menu__logo bg-contain bg-no-repeat self-center\"></div>\r\n\t<div class=\"pause-menu__header-bottom-filagree self-center\"></div>-->\r\n\t<div\r\n\t\tclass=\"flex-auto size-full pr-4 contain-strict\"\r\n\t\tid=\"civilopedia\"\r\n\t>\r\n\t\t<pedia-top-menu class=\"pedia-top-menu flex justify-center overflow-scroll\">\r\n\t\t\t<fxs-tab-bar\r\n\t\t\t\tclass=\"pedia__top-menu-tab-bar my-2 w-full\"\r\n\t\t\t\ttab-for=\"screen-civilopedia\"\r\n\t\t\t\ttab-item-class=\"mx-3 self-center\"\r\n\t\t\t\talt-controls=\"false\"\r\n\t\t\t></fxs-tab-bar>\r\n\t\t</pedia-top-menu>\r\n\t\t<div class=\"pedia__top-nav-container pb-2 flex justify-center items-center\">\r\n\t\t\t<pedia-navigation class=\"pedia-navigation flex px-2 pt-1\">\r\n\t\t\t\t<div class=\"pedia-navigation_back-container h-12 w-8\">\r\n\t\t\t\t\t<fxs-activatable\r\n\t\t\t\t\t\tclass=\"img-arrow bg-contain bg-no-repeat -mt-2 bg-center left-arrow\"\r\n\t\t\t\t\t></fxs-activatable>\r\n\t\t\t\t\t<fxs-nav-help\r\n\t\t\t\t\t\tclass=\"-ml-1\"\r\n\t\t\t\t\t\taction-key=\"inline-nav-shell-previous\"\r\n\t\t\t\t\t></fxs-nav-help>\r\n\t\t\t\t</div>\r\n\t\t\t\t<fxs-activatable\r\n\t\t\t\t\tclass=\"pedia-navigation-item font-body text-sm hover\\:text-accent-1 focus\\:text-accent-1 pressed\\:text-accent-1 mb-4 pointer-events-auto self-center\"\r\n\t\t\t\t\tdata-l10n-id=\"LOC_PEDIA_SCREEN_NAV_HOME\"\r\n\t\t\t\t></fxs-activatable>\r\n\t\t\t\t<div class=\"pedia-navigation_forward-container h-12 w-8\">\r\n\t\t\t\t\t<fxs-activatable class=\"img-arrow bg-contain bg-no-repeat -mt-2 bg-center right-arrow -scale-x-100\">\r\n\t\t\t\t\t</fxs-activatable>\r\n\t\t\t\t\t<fxs-nav-help\r\n\t\t\t\t\t\tclass=\"ml-1\"\r\n\t\t\t\t\t\taction-key=\"inline-nav-shell-next\"\r\n\t\t\t\t\t></fxs-nav-help>\r\n\t\t\t\t</div>\r\n\t\t\t</pedia-navigation>\r\n\t\t\t<pedia-breadcrumbs class=\"pedia-breadcrumbs flex flex-auto ml-3\">\r\n\t\t\t\t<fxs-scrollable-horizontal\r\n\t\t\t\t\tclass=\"pedia-breadcrumbs__scrollable\"\r\n\t\t\t\t\thandle-gamepad-pan=\"false\"\r\n\t\t\t\t>\r\n\t\t\t\t\t<div class=\"pedia-breadcrumbs__container pb-4 flex items-center\"></div>\r\n\t\t\t\t</fxs-scrollable-horizontal>\r\n\t\t\t</pedia-breadcrumbs>\r\n\t\t\t<pedia-search class=\"relative flex px-2 py-1 mb-4\">\r\n\t\t\t\t<fxs-vslot>\r\n\t\t\t\t\t<div class=\"relative flex\">\r\n\t\t\t\t\t\t<fxs-textbox\r\n\t\t\t\t\t\t\tclass=\"pedia-search__textbox w-80 font-title uppercase text-sm text-accent-2 tracking-100 border border-primary hover\\:border-secondary focus\\:border-secondary pressed\\:border-secondary\"\r\n\t\t\t\t\t\t\thas-border=\"false\"\r\n\t\t\t\t\t\t\tplaceholder=\"LOC_OPTIONS_SEARCH\"\r\n\t\t\t\t\t\t></fxs-textbox>\r\n\t\t\t\t\t\t<div class=\"pedia-search__icon size-10 bg-contain bg-center bg-no-repeat bg-primary-2\"></div>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t\t<div class=\"pedia-search__results-scrollable-container absolute mt-1 top-full inset-x-2 hidden\">\r\n\t\t\t\t\t\t<fxs-scrollable class=\"pedia-search__results-scrollable img-dropdown-box\">\r\n\t\t\t\t\t\t\t<fxs-vslot class=\"pedia-search__results w-full\"> </fxs-vslot>\r\n\t\t\t\t\t\t</fxs-scrollable>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</fxs-vslot>\r\n\t\t\t</pedia-search>\r\n\t\t</div>\r\n\t\t<div class=\"pedia-main-container flex flex-auto pt-2 pr-2 pb-4 pl-2\">\r\n\t\t\t<pedia-page-list class=\"font-body-base pedia-page-list mr-4 flex flex-col flex-auto w-1\\/4 max-w-1\\/4\">\r\n\t\t\t\t<fxs-scrollable handle-gamepad-pan=\"false\">\r\n\t\t\t\t\t<fxs-vslot class=\"pedia_page-list-container mr-2\"></fxs-vslot>\r\n\t\t\t\t</fxs-scrollable>\r\n\t\t\t</pedia-page-list>\r\n\t\t\t<pedia-page-content-main class=\"relative w-3\\/4\">\r\n\t\t\t\t<div class=\"size-full absolute mr-5\">\r\n\t\t\t\t\t<div class=\"pedia-page-content-shadow relative grow p-2\">\r\n\t\t\t\t\t\t<fxs-scrollable\r\n\t\t\t\t\t\t\tclass=\"content-main-scroll relative\"\r\n\t\t\t\t\t\t\thandle-gamepad-pan=\"true\"\r\n\t\t\t\t\t\t\tstyle=\"width: 100%\"\r\n\t\t\t\t\t\t>\r\n\t\t\t\t\t\t\t<div class=\"pedia-page-content\">\r\n\t\t\t\t\t\t\t\t<div class=\"w-full h-16 flex justify-center\">\r\n\t\t\t\t\t\t\t\t\t<fxs-header\r\n\t\t\t\t\t\t\t\t\t\tclass=\"pedia-page-content-header pt-5 pb-5 pedia__header-text text-center self-center font-title text-lg text-secondary tracking-100 w-full\"\r\n\t\t\t\t\t\t\t\t\t\ttitle-style=\"h2\"\r\n\t\t\t\t\t\t\t\t\t\tfiligree-style=\"none\"\r\n\t\t\t\t\t\t\t\t\t></fxs-header>\r\n\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t\t<div class=\"flex flex-row\">\r\n\t\t\t\t\t\t\t\t\t<div\r\n\t\t\t\t\t\t\t\t\t\tclass=\"pedia__main-text-container pedia-page-content-body flex-auto mt-4\"\r\n\t\t\t\t\t\t\t\t\t></div>\r\n\t\t\t\t\t\t\t\t\t<pedia-page-content-sidebar\r\n\t\t\t\t\t\t\t\t\t\tclass=\"w-64 mt-4 flex flex-col items-center ml-3 pedia-page-content-body mr-2\"\r\n\t\t\t\t\t\t\t\t\t>\r\n\t\t\t\t\t\t\t\t\t</pedia-page-content-sidebar>\r\n\t\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t\t</div>\r\n\t\t\t\t\t\t</fxs-scrollable>\r\n\t\t\t\t\t</div>\r\n\t\t\t\t</div>\r\n\t\t\t</pedia-page-content-main>\r\n\t\t</div>\r\n\t</div>\r\n</fxs-frame>\r\n";

const styles = "fs://game/base-standard/ui/civilopedia/screen-civilopedia.css";

const PediaSearchCloseEventName = "pedia-search-close";
class PediaSearchCloseEvent extends CustomEvent {
  constructor() {
    super(PediaSearchCloseEventName, { bubbles: true });
  }
}
class ScreenCivilopedia extends Panel {
  previousMode = null;
  previousModeContext = null;
  engineInputListener = this.onEngineInput.bind(this);
  PediaSearchCloseListener = this.onPediaSearchClose.bind(this);
  navComponent = null;
  sideMenuComponent = null;
  searchBar = null;
  constructor(root) {
    super(root);
    this.enableOpenSound = true;
    this.enableCloseSound = true;
    this.Root.setAttribute("data-audio-group-ref", "civilopedia");
  }
  onAttach() {
    super.onAttach();
    const frame = MustGetElement("fxs-frame", this.Root);
    frame.setAttribute("outside-safezone-mode", "full");
    const closeButton = MustGetElement("fxs-close-button", this.Root);
    closeButton.setAttribute("data-audio-group-ref", "civilopedia");
    closeButton.addEventListener("action-activate", () => {
      this.close();
    });
    this.previousMode = InterfaceMode.getCurrent();
    this.previousModeContext = InterfaceMode.getParameters();
    InterfaceMode.switchTo("INTERFACEMODE_CINEMATIC");
    this.Root.addEventListener("navigate-input", this.onNavigateInput);
    const header = document.getElementById("civilopedia-header");
    if (header) {
      if (window.innerHeight < Layout.pixelsToScreenPixels(1080)) {
        header.setAttribute("filigree-style", "small");
      } else {
        header.removeAttribute("filigree-style");
      }
    }
    const mainScrollable = this.getComponentRoot(".content-main-scroll").component;
    mainScrollable.setEngineInputProxy(this.Root);
    this.navComponent = this.getComponentRoot(".pedia-navigation").component;
    this.sideMenuComponent = this.getComponentRoot(".pedia-page-list").component;
    this.searchBar = this.getComponentRoot(".pedia-search__textbox").component;
    DisplayQueueManager.suspend();
    instance.navigateToLastPageInHistory();
    instance.isOpen = true;
  }
  onDetach() {
    instance.isOpen = false;
    if (!this.previousMode || this.previousMode && !InterfaceMode.switchTo(this.previousMode, this.previousModeContext)) {
      InterfaceMode.switchToDefault();
    }
    DisplayQueueManager.resume();
    this.Root.removeEventListener("navigate-input", this.onNavigateInput);
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    NavTray.clear();
    NavTray.addOrUpdateGenericBack();
    NavTray.addOrUpdateShellAction2("LOC_OPTIONS_SEARCH");
    this.Root.addEventListener(InputEngineEventName, this.engineInputListener);
    this.Root.addEventListener("navigate-input", this.onNavigateInput);
    this.Root.addEventListener(PediaSearchCloseEventName, this.PediaSearchCloseListener);
    this.realizeFocus();
  }
  realizeFocus() {
    const listContainer = this.Root.querySelector(".pedia_page-list-container");
    if (listContainer) {
      FocusManager.setFocus(listContainer);
    }
  }
  onPediaSearchClose(_event) {
    this.realizeFocus();
  }
  onLoseFocus() {
    NavTray.clear();
    this.Root.removeEventListener(InputEngineEventName, this.engineInputListener);
    this.Root.removeEventListener("navigate-input", this.onNavigateInput);
    this.Root.removeEventListener(PediaSearchCloseEventName, this.PediaSearchCloseListener);
    super.onLoseFocus();
  }
  getComponentRoot(componentName) {
    const componentElement = MustGetElement(componentName, document);
    componentElement.initialize();
    return componentElement;
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    let handledInput = false;
    if (inputEvent.isCancelInput() || inputEvent.detail.name == "sys-menu") {
      this.close();
      handledInput = true;
    }
    switch (inputEvent.detail.name) {
      case "shell-action-2":
        this.searchBar?.onActivate();
        handledInput = true;
        break;
    }
    if (handledInput) {
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  onNavigateInput = (event) => {
    if (event.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    const direction = event.getDirection();
    let handledInput = false;
    switch (direction) {
      case InputNavigationAction.UP:
        this.sideMenuComponent?.onArticleUp();
        handledInput = true;
        break;
      case InputNavigationAction.DOWN:
        this.sideMenuComponent?.onArticleDown();
        handledInput = true;
        break;
      case InputNavigationAction.SHELL_NEXT:
        this.navComponent?.onNavigateForward();
        handledInput = true;
        break;
      case InputNavigationAction.SHELL_PREVIOUS:
        this.navComponent?.onNavigateBack();
        handledInput = true;
        break;
    }
    if (handledInput) {
      event.stopPropagation();
      event.preventDefault();
    }
  };
}
Controls.define("screen-civilopedia", {
  createInstance: ScreenCivilopedia,
  description: "Encyclopedia of all things CIV.",
  classNames: ["screen-civilopedia", "relative", "max-w-full", "max-h-full"],
  styles: [styles],
  innerHTML: [content]
});
class PediaBreadCrumbs extends Component {
  boundOnNavigate = () => {
    this.onNavigate();
  };
  scrollReadyListener = this.onScrollReady.bind(this);
  crumbsContainer;
  crumbClicked = false;
  elementToScrollTo = null;
  onInitialize() {
    this.crumbsContainer = MustGetElement(".pedia-breadcrumbs__container", this.Root);
  }
  onAttach() {
    instance.onNavigatePage.on(this.boundOnNavigate);
    this.Root.addEventListener("scroll-is-ready", this.scrollReadyListener);
    this.refresh();
  }
  onDetach() {
    instance.onNavigatePage.off(this.boundOnNavigate);
    this.Root.removeEventListener("scroll-is-ready", this.scrollReadyListener);
  }
  onScrollReady(event) {
    if (this.elementToScrollTo) {
      const scrollComponentRoot = event.target;
      scrollComponentRoot.component.scrollIntoView(this.elementToScrollTo);
    }
  }
  onNavigate() {
    if (!this.crumbClicked) {
      this.refresh();
    }
    this.crumbClicked = false;
  }
  refresh() {
    while (this.crumbsContainer.hasChildNodes()) {
      this.crumbsContainer.removeChild(this.crumbsContainer.lastChild);
    }
    for (const [index, historyPage] of instance.history.entries()) {
      const historyPageDetails = instance.getPage(
        historyPage.sectionID,
        historyPage.pageID
      );
      if (!historyPageDetails) {
        console.error(
          `PediaBreadCrumbs: refresh - historyPageDetails for sectionID ${historyPage.sectionID} and pageID ${historyPage.pageID} was null!`
        );
        return;
      }
      const historyPageTitle = historyPageDetails.nameKey;
      if (!historyPageTitle) {
        console.error(
          `PediaBreadCrumbs: refresh - historyPageTitle for sectionID ${historyPage.sectionID} and pageID ${historyPage.pageID} was null!`
        );
        return;
      }
      const newCrumb = document.createElement("fxs-activatable");
      newCrumb.classList.add(
        "font-body",
        "text-sm",
        "hover\\:text-accent-1",
        "focus\\:text-accent-1",
        "pressed\\:text-accent-1"
      );
      newCrumb.setAttribute("data-l10n-id", historyPageTitle);
      newCrumb.setAttribute("data-audio-group-ref", "civilopedia");
      this.crumbsContainer.insertBefore(newCrumb, this.crumbsContainer.firstChild);
      if (index != instance.history.length - 1) {
        const crumbDivider = document.createElement("div");
        crumbDivider.classList.value = "pedia-breadcrumbs__divider size-4 px-4 bg-contain bg-no-repeat bg-center";
        this.crumbsContainer.insertBefore(crumbDivider, this.crumbsContainer.firstChild);
      }
      if (index == instance.currentHistoryIndex) {
        this.elementToScrollTo = newCrumb;
      }
      const indexInHistory = index;
      newCrumb.addEventListener("action-activate", () => {
        this.crumbClicked = true;
        if (instance.currentHistoryIndex < indexInHistory) {
          instance.navigateBack(indexInHistory - instance.currentHistoryIndex);
        } else if (instance.currentHistoryIndex > indexInHistory) {
          instance.navigateForward(instance.currentHistoryIndex - indexInHistory);
        }
      });
    }
  }
}
Controls.define("pedia-breadcrumbs", {
  createInstance: PediaBreadCrumbs,
  description: "Breadcrumbs display for pedia history."
});
class PediaSearch extends Component {
  textInputListener = this.onTextInput.bind(this);
  focusInListener = this.onTextEngineInput.bind(this);
  validateVirtualKeyboardListener = this.onValidateVirtualKeyboard.bind(this);
  onEngineInputListener = this.onEngineInput.bind(this);
  textInput;
  resultsContainer;
  resultsScrollableContainer;
  onInitialize() {
    this.textInput = MustGetElement(".pedia-search__textbox", this.Root);
    this.resultsContainer = MustGetElement(".pedia-search__results", this.Root);
    this.resultsScrollableContainer = MustGetElement(".pedia-search__results-scrollable-container", this.Root);
  }
  onAttach() {
    this.textInput.addEventListener("input", this.textInputListener);
    this.textInput.addEventListener("focusin", this.focusInListener);
    this.textInput.addEventListener("fxs-textbox-validate-virtual-keyboard", this.validateVirtualKeyboardListener);
    this.textInput.setAttribute("data-audio-focus-ref", "none");
    this.Root.addEventListener(InputEngineEventName, this.onEngineInputListener);
  }
  onDetach() {
    this.textInput.removeEventListener("input", this.textInputListener);
    this.textInput.removeEventListener("focusin", this.focusInListener);
    this.textInput.removeEventListener(
      "fxs-textbox-validate-virtual-keyboard",
      this.validateVirtualKeyboardListener
    );
    this.Root.removeEventListener(InputEngineEventName, this.onEngineInputListener);
  }
  onEngineInput(event) {
    if (event.detail.status == InputActionStatuses.FINISH && event.detail.name == "cancel") {
      this.Root.dispatchEvent(new PediaSearchCloseEvent());
      this.resultsScrollableContainer.classList.add("hidden");
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  }
  onTextInput() {
    this.generateResultItems();
  }
  onValidateVirtualKeyboard() {
    this.generateResultItems();
    if (this.resultsContainer.childElementCount > 0) {
      FocusManager.setFocus(this.resultsContainer);
    } else {
      this.Root.dispatchEvent(new PediaSearchCloseEvent());
    }
  }
  generateResultItems() {
    this.resultsContainer.innerHTML = "";
    const searchQuery = this.textInput.getAttribute("value");
    if (!searchQuery || searchQuery.length == 0) {
      this.resultsScrollableContainer.classList.add("hidden");
      return;
    }
    const searchResults = instance.search(searchQuery, 5);
    this.resultsScrollableContainer.classList.toggle("hidden", searchResults.length == 0);
    for (const searchResult of searchResults) {
      const pageDetails = instance.getPage(searchResult.page.sectionID, searchResult.page.pageID);
      if (!pageDetails) {
        console.error(
          `PediaSearch: onTextInput - pageDetails for sectionID ${searchResult.page.sectionID} and pageID ${searchResult.page.pageID} was null!`
        );
        continue;
      }
      const resultItem = document.createElement("fxs-dropdown-item");
      resultItem.setAttribute("data-audio-group-ref", "civilopedia");
      resultItem.classList.add("pedia-result-item");
      resultItem.dataset.label = pageDetails.titleText ?? pageDetails.nameKey;
      resultItem.dataset.disabled = "false";
      resultItem.dataset.tooltipContent = "";
      this.resultsContainer.appendChild(resultItem);
      resultItem.addEventListener("action-activate", () => {
        if (!instance.navigateTo(searchResult.page)) {
          this.Root.dispatchEvent(new PediaSearchCloseEvent());
        }
        this.resultsScrollableContainer.classList.add("hidden");
      });
    }
  }
  onTextEngineInput() {
    if (this.textInput.getAttribute("value") != "") {
      this.generateResultItems();
    }
  }
}
Controls.define("pedia-search", {
  createInstance: PediaSearch,
  description: "Search box for the pedia."
});
class PediaNavigation extends Component {
  boundOnNavigate = (page) => {
    this.onNavigatePage(page);
  };
  boundOnNavigateForward = () => {
    this.onNavigateForward();
  };
  boundOnNavigateHome = () => {
    this.onNavigateHome();
  };
  boundOnNavigateBack = () => {
    this.onNavigateBack();
  };
  activeDeviceChangedListener = this.onActiveDeviceChange.bind(this);
  backContainer;
  forwardContainer;
  backArrow;
  homeElement;
  forwardArrow;
  onInitialize() {
    this.backContainer = MustGetElement(".pedia-navigation_back-container", this.Root);
    this.forwardContainer = MustGetElement(".pedia-navigation_forward-container", this.Root);
    this.backArrow = MustGetElement(".left-arrow", this.Root);
    this.backArrow.addEventListener("action-activate", this.boundOnNavigateBack);
    this.homeElement = MustGetElement(".pedia-navigation-item", this.Root);
    this.homeElement.addEventListener("action-activate", this.boundOnNavigateHome);
    this.homeElement.setAttribute("data-audio-group-ref", "civilopedia");
    this.forwardArrow = MustGetElement(".right-arrow", this.Root);
    this.forwardArrow.addEventListener("action-activate", this.boundOnNavigateForward);
  }
  onAttach() {
    instance.onNavigatePage.on(this.boundOnNavigate);
    window.addEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceChangedListener);
    this.toggleNavArrows();
    this.backArrow.setAttribute("data-audio-group-ref", "audio-pager");
    this.forwardArrow.setAttribute("data-audio-group-ref", "audio-pager");
  }
  onDetach() {
    instance.onNavigatePage.off(this.boundOnNavigate);
    window.removeEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceChangedListener);
  }
  onActiveDeviceChange(event) {
    this.backArrow.classList.toggle("hidden", event.detail.gamepadActive);
    this.forwardArrow.classList.toggle("hidden", event.detail.gamepadActive);
  }
  onNavigatePage(_page) {
    this.toggleNavArrows();
  }
  toggleNavArrows() {
    this.backContainer.classList.toggle("opacity-0", !instance.canNavigateBackwards());
    this.forwardContainer.classList.toggle("opacity-0", !instance.canNavigateForward());
    this.backArrow.classList.toggle("hidden", ActionHandler.isGamepadActive);
    this.forwardArrow.classList.toggle("hidden", ActionHandler.isGamepadActive);
  }
  onNavigateHome() {
    instance.navigateHome();
  }
  onNavigateBack() {
    instance.navigateBack();
  }
  onNavigateForward() {
    instance.navigateForward();
  }
}
Controls.define("pedia-navigation", {
  createInstance: PediaNavigation,
  description: "Navigation bar for the pedia."
});
class PediaSectionList extends Component {
  allSectionIds = [];
  onSectionTabSelectedListener = this.onTabSelected.bind(this);
  onAttach() {
    const sections = instance.getSections();
    const tabsContainer = MustGetElement(".pedia__top-menu-tab-bar", this.Root);
    const tabItems = [];
    let lastTabIndex = -1;
    for (const [index, section] of sections.entries()) {
      const pages = instance.getPages(section.sectionID);
      if (pages && pages.length > 0) {
        this.allSectionIds.push(section.sectionID);
        tabItems.push({
          icon: section.icon,
          id: section.sectionID,
          label: "",
          iconClass: "size-10 img-rel-icon-select",
          tooltip: section.nameKey
        });
        if (section.sectionID == instance.currentPage.sectionID) {
          lastTabIndex = index;
        }
      }
    }
    tabsContainer.setAttribute("nav-help-left-class", "pl-2");
    tabsContainer.setAttribute("nav-help-right-class", "pr-2");
    tabsContainer.setAttribute("tab-items", JSON.stringify(tabItems));
    tabsContainer.setAttribute("data-audio-group-ref", "civilopedia");
    if (lastTabIndex > -1) {
      tabsContainer.setAttribute("selected-tab-index", lastTabIndex.toString());
    }
    delayByFrame(() => {
      tabsContainer.addEventListener("tab-selected", this.onSectionTabSelectedListener);
    }, 1);
  }
  onTabSelected(e) {
    const newSectionID = this.allSectionIds[e.detail.index];
    const pages = instance.getPages(newSectionID);
    if (pages && pages.length > 0) {
      instance.navigateTo({ sectionID: newSectionID, pageID: pages[0].pageID });
    }
  }
}
Controls.define("pedia-top-menu", {
  createInstance: PediaSectionList,
  description: "List of sections for the pedia."
});
class PediaPageList extends Component {
  activateListener = this.onActivate.bind(this);
  navigateListener = (page) => {
    this.onNavigate(page);
  };
  pageTabs = /* @__PURE__ */ new Map();
  currentSectionID = null;
  currentPageID = null;
  pageItemContainer;
  onInitialize() {
    this.pageItemContainer = MustGetElement(".pedia_page-list-container", this.Root);
    this.refresh();
  }
  onAttach() {
    instance.onNavigatePage.on(this.navigateListener);
  }
  onDetach() {
    instance.onNavigatePage.off(this.navigateListener);
  }
  onActivate(event) {
    if (event.target instanceof HTMLElement) {
      this.onNavigateToElement(event.target);
    }
  }
  onNavigate(page) {
    if (page.sectionID == this.currentSectionID) {
      if (this.currentPageID) {
        const el2 = this.pageTabs.get(this.currentPageID);
        if (el2) {
          el2.removeAttribute("data-selected");
        }
      }
      this.currentPageID = page.pageID;
      const el = this.pageTabs.get(this.currentPageID);
      if (el) {
        el.setAttribute("data-selected", "1");
        FocusManager.setFocus(el);
      }
    } else {
      this.refresh();
    }
  }
  onNavigateToElement(element) {
    const pageID = element.getAttribute("data-page-id");
    if (this.currentSectionID && pageID) {
      instance.navigateTo({ sectionID: this.currentSectionID, pageID });
    }
  }
  onArticleUp() {
    const selection = this.Root.querySelector(".page-item-selected");
    if (selection) {
      const divider = selection.previousElementSibling;
      if (divider) {
        const prevSelection = divider.previousElementSibling;
        if (prevSelection) {
          this.onNavigateToElement(prevSelection);
        }
      }
    }
  }
  onArticleDown() {
    const selection = this.Root.querySelector(".page-item-selected");
    if (selection) {
      const divider = selection.nextElementSibling;
      if (divider) {
        const nextSelection = divider.nextElementSibling;
        if (nextSelection) {
          this.onNavigateToElement(nextSelection);
        }
      }
    }
  }
  refresh() {
    const currentPage = instance.currentPage;
    this.currentSectionID = currentPage.sectionID;
    this.currentPageID = currentPage.pageID;
    this.pageTabs.clear();
    const sectionID = this.currentSectionID;
    while (this.pageItemContainer.hasChildNodes()) {
      this.pageItemContainer.removeChild(this.pageItemContainer.lastChild);
    }
    const pages = instance.getPages(sectionID) ?? [];
    const pageGroups = instance.getPageGroups(sectionID) ?? [];
    const topLevelItems = [];
    for (const page of pages) {
      if (page.pageGroupID == null) {
        topLevelItems.push(page);
      }
    }
    for (const group of pageGroups) {
      if (group.visibleIfEmpty) {
        topLevelItems.push(group);
      } else {
        for (const page of pages) {
          if (page.pageGroupID == group.pageGroupID) {
            topLevelItems.push(group);
            break;
          }
        }
      }
    }
    topLevelItems.sort((a, b) => {
      return a.sortIndex - b.sortIndex;
    });
    const fragment = document.createDocumentFragment();
    for (const item of topLevelItems) {
      if (item.detailsType == DetailsType.PageGroup) {
        const groupContainer = document.createElement("div");
        fragment.appendChild(groupContainer);
        const groupElement = document.createElement("pedia-page-group");
        groupElement.setAttribute("data-page--group-id", item.pageGroupID ?? "");
        groupElement.setAttribute("data-name", item.nameKey);
        groupContainer.appendChild(groupElement);
        const parent = groupContainer;
        for (const page of pages) {
          if (page.pageGroupID == item.pageGroupID) {
            const el = document.createElement("pedia-page-list-item");
            el.setAttribute("data-page-id", page.pageID);
            el.setAttribute("data-text", page.tabText);
            el.setAttribute("tabindex", "-1");
            el.setAttribute("data-audio-group-ref", "civilopedia");
            el.classList.add("ml-3", "hidden");
            if (currentPage.pageID == page.pageID) {
              el.setAttribute("data-selected", "1");
              this.currentPageID = page.pageID;
            }
            this.pageTabs.set(page.pageID, el);
            parent.appendChild(el);
            el.addEventListener("action-activate", this.activateListener);
          }
        }
      } else if (item.detailsType == DetailsType.Page) {
        const el = document.createElement("pedia-page-list-item");
        el.setAttribute("data-page-id", item.pageID);
        el.setAttribute("data-text", item.tabText);
        el.setAttribute("tabindex", "-1");
        el.setAttribute("data-audio-group-ref", "civilopedia");
        el.classList.add("ml-3");
        if (currentPage.pageID == item.pageID) {
          el.setAttribute("data-selected", "1");
          this.currentPageID = item.pageID;
        }
        this.pageTabs.set(item.pageID, el);
        fragment.appendChild(el);
        el.addEventListener("action-activate", this.activateListener);
      }
    }
    this.pageItemContainer.appendChild(fragment);
  }
}
Controls.define("pedia-page-list", {
  createInstance: PediaPageList,
  description: "Page list for the pedia."
});
const ListItemHideEventName = "list-item-hide";
class ListItemHideEvent extends CustomEvent {
  constructor(isHidden) {
    super(ListItemHideEventName, { bubbles: false, cancelable: true, detail: { isHidden } });
  }
}
class PediaPageGroup extends ChooserItem {
  collapseIcon;
  expandIcon;
  onInitialize() {
    super.onInitialize();
    this.Root.addEventListener("action-activate", () => {
      if (this.collapseIcon.classList.toggle("hidden")) {
        this.Root.setAttribute("data-audio-activate-ref", "data-audio-group-expand");
      } else {
        this.Root.setAttribute("data-audio-activate-ref", "data-audio-group-collapse");
      }
      this.expandIcon.classList.toggle("hidden");
      const items = this.Root.parentElement?.querySelectorAll("pedia-page-list-item");
      if (items) {
        for (const item of items) {
          item.classList.toggle("hidden");
          const isHidden = item.classList.contains("hidden");
          item.dispatchEvent(new ListItemHideEvent(isHidden));
        }
      }
    });
  }
  render() {
    super.render();
    const chooserItem = document.createDocumentFragment();
    this.Root.classList.add("text-accent-2", "chooser-item_unlocked");
    this.Root.setAttribute("data-audio-group-ref", "civilopedia");
    this.Root.setAttribute("data-audio-activate-ref", "data-audio-group-collapse");
    const title = document.createElement("div");
    title.role = "heading";
    title.classList.value = "relative font-title-sm break-words uppercase mt-2 pl-4 pr-1 py-1 text-accent-2 pointer-events-auto";
    title.setAttribute("data-l10n-id", this.Root.getAttribute("data-name") ?? "");
    chooserItem.appendChild(title);
    this.collapseIcon = document.createElement("div");
    this.collapseIcon.classList.add("absolute", "size-8", "self-end", "mt-1", "img-questclose", "hidden");
    chooserItem.appendChild(this.collapseIcon);
    this.expandIcon = document.createElement("div");
    this.expandIcon.classList.add("absolute", "size-8", "self-end", "mt-1", "img-questopen");
    chooserItem.appendChild(this.expandIcon);
    this.Root.appendChild(chooserItem);
  }
}
Controls.define("pedia-page-group", {
  createInstance: PediaPageGroup,
  description: "Page group for the pedia shown in the page list.",
  attributes: [
    {
      name: "data-name",
      description: "The localized name of the item.",
      required: true
    },
    {
      name: "data-selected",
      description: "Whether or not the item is selected.",
      required: false
    }
  ]
});
class PediaPageListItem extends ChooserItem {
  title = document.createElement("div");
  onInitialize() {
    super.onInitialize();
    this.Root.addEventListener(ListItemHideEventName, (event) => {
      if (event.detail.isHidden) {
        return;
      }
      executeWhenEllipsisIsActive(this.title, () => {
        const tooltipText = this.Root.getAttribute("data-text");
        if (tooltipText) {
          this.title.setAttribute("data-tooltip-content", tooltipText);
        }
      });
    });
  }
  render() {
    super.render();
    this.Root.classList.add("text-accent-2", "chooser-item_unlocked");
    this.title.role = "heading";
    this.title.classList.value = "relative font-title-sm truncate font-fit-shrink uppercase mt-2 pl-4 pr-1 py-1 text-accent-2 pointer-events-auto";
    this.title.setAttribute("data-l10n-id", this.Root.getAttribute("data-text") ?? "");
    executeWhenEllipsisIsActive(this.title, () => {
      const tooltipText = this.Root.getAttribute("data-text");
      if (tooltipText) {
        this.title.setAttribute("data-tooltip-content", tooltipText);
      }
    });
    this.Root.appendChild(this.title);
  }
}
Controls.define("pedia-page-list-item", {
  createInstance: PediaPageListItem,
  description: "Page list item for the pedia.",
  attributes: [
    {
      name: "data-name",
      description: "The localized name of the item.",
      required: true
    },
    {
      name: "data-selected",
      description: "Whether or not the item is selected.",
      required: false
    }
  ]
});
class PediaMainContent extends Component {
  boundOnNavigate = () => {
    this.onNavigate();
  };
  sidebar = null;
  headerElement;
  mainTextContainer;
  onInitialize() {
    this.headerElement = MustGetElement(".pedia__header-text", this.Root);
    this.mainTextContainer = MustGetElement(".pedia__main-text-container", this.Root);
    this.sidebar = this.Root.querySelector("pedia-page-content-sidebar");
  }
  onAttach() {
    instance.onNavigatePage.on(this.boundOnNavigate);
    this.refresh();
  }
  onDetach() {
    instance.onNavigatePage.off(this.boundOnNavigate);
  }
  onNavigate() {
    this.refresh();
    Audio.playSound("data-audio-turn-page", "civilopedia");
  }
  refresh() {
    while (this.mainTextContainer.hasChildNodes()) {
      this.mainTextContainer.removeChild(this.mainTextContainer.lastChild);
    }
    const panelScroll = this.Root.querySelector(".content-main-scroll");
    panelScroll?.setAttribute("scrollpercent", "0");
    panelScroll?.setAttribute("handle-gamepad-pan", "true");
    const currentPage = instance.currentPage;
    const currentPageDetails = instance.getPage(
      currentPage.sectionID,
      currentPage.pageID
    );
    if (!currentPageDetails) {
      console.error(
        `PediaMainContent: refresh - no page details found for sectionID ${currentPage.sectionID} and pageID ${currentPage.pageID}`
      );
      return;
    }
    this.headerElement.setAttribute("title", currentPageDetails.titleText ?? "ErrorTitle");
    const layout = GameInfo.CivilopediaPageLayouts.lookup(currentPageDetails.pageLayoutID);
    if (this.sidebar) {
      if (layout && layout.UseSidebar) {
        this.sidebar.setAttribute("data-section-id", currentPageDetails.sectionID);
        this.sidebar.setAttribute("data-page-id", currentPageDetails.pageID);
        this.sidebar.style.display = "";
      } else {
        this.sidebar.removeAttribute("data-section-id");
        this.sidebar.removeAttribute("data-page-id");
        this.sidebar.style.display = "none";
      }
    }
    const chapters = instance.getPageChapters(currentPageDetails.pageLayoutID);
    if (!chapters) {
      console.error(
        `PediaMainContent: refresh - no chapters found for sectionID ${currentPage.sectionID} and pageID ${currentPage.pageID}`
      );
      return;
    }
    for (const chapter of chapters) {
      const el = document.createElement("pedia-page-content-chapter");
      el.setAttribute("data-page-layout-id", currentPageDetails.pageLayoutID);
      el.setAttribute("data-section-id", currentPageDetails.sectionID);
      el.setAttribute("data-page-id", currentPageDetails.pageID);
      el.setAttribute("data-chapter-id", chapter.chapterID);
      this.mainTextContainer.appendChild(el);
    }
  }
}
Controls.define("pedia-page-content-main", {
  createInstance: PediaMainContent,
  description: "Main content display for a specific pedia page.",
  classNames: [""]
});
function sortCivilopediaSidebarPanels(a, b) {
  return a.SortIndex - b.SortIndex;
}
class PediaSidebarContent extends Component {
  boundRefresh = this.doRefresh.bind(this);
  sectionID = null;
  pageID = null;
  rafID = 0;
  onAttach() {
    this.sectionID = this.Root.getAttribute("data-section-id");
    this.pageID = this.Root.getAttribute("data-page-id");
    this.doRefresh();
    const panels = [];
    for (const panel of GameInfo.CivilopediaPageSidebarPanels) {
      if ((panel.SectionID == null || panel.SectionID == this.sectionID) && (panel.PageID == null || panel.PageID == this.pageID)) {
        panels.push(panel);
      }
    }
    panels.sort(sortCivilopediaSidebarPanels);
  }
  onDetach() {
    if (this.rafID != 0) {
      cancelAnimationFrame(this.rafID);
      this.rafID = 0;
    }
    this.Root.innerHTML = "";
    this.sectionID = null;
    this.pageID = null;
  }
  onAttributeChanged(name, _oldValue, newValue) {
    if (name == "data-section-id" && this.sectionID != newValue) {
      this.sectionID = newValue;
      this.queueRefresh();
    } else if (name == "data-page-id" && this.pageID != newValue) {
      this.pageID = newValue;
      this.queueRefresh();
    }
  }
  queueRefresh() {
    if (this.rafID == 0 && this.sectionID && this.pageID) {
      this.rafID = requestAnimationFrame(this.boundRefresh);
    }
  }
  doRefresh() {
    this.rafID = 0;
    this.Root.innerHTML = "";
    if (this.pageID && this.sectionID) {
      const panels = [];
      for (const panel of GameInfo.CivilopediaPageSidebarPanels) {
        if ((panel.SectionID == null || panel.SectionID == this.sectionID) && (panel.PageID == null || panel.PageID == this.pageID)) {
          panels.push(panel);
        }
      }
      panels.sort(sortCivilopediaSidebarPanels);
      const frag = document.createDocumentFragment();
      for (const p of panels) {
        const el = document.createElement(p.Component);
        if (this.sectionID) {
          el.setAttribute("data-section-id", this.sectionID);
        } else {
          el.removeAttribute("data-section-id");
        }
        if (this.pageID) {
          el.setAttribute("data-page-id", this.pageID);
        } else {
          el.removeAttribute("data-page-id");
        }
        frag.appendChild(el);
      }
      this.Root.appendChild(frag);
    }
  }
}
Controls.define("pedia-page-content-sidebar", {
  createInstance: PediaSidebarContent,
  description: "Pedia page content sidebar.",
  attributes: [
    {
      name: "data-section-id",
      description: "The current navigated section."
    },
    {
      name: "data-page-id",
      description: "The current navigated page."
    }
  ]
});
class PediaChapter extends Component {
  onAttach() {
    const sectionID = this.Root.getAttribute("data-section-id");
    const pageID = this.Root.getAttribute("data-page-id");
    const chapterID = this.Root.getAttribute("data-chapter-id");
    const pageLayoutID = this.Root.getAttribute("data-page-layout-id");
    if (sectionID == "CIVILIZATIONS") {
      const civTrait = Database.query("config", "select * from CivilizationItems order by SortIndex")?.find(
        (item) => item.CivilizationType == pageID && item.Kind == "KIND_TRAIT"
      );
      const traitHeader = document.createElement("fxs-header");
      traitHeader.classList.value = "font-title text-lg text-secondary";
      traitHeader.setAttribute("title", civTrait?.Name);
      traitHeader.setAttribute("filigree-style", "small");
      this.Root.appendChild(traitHeader);
      const traitText = document.createElement("div");
      traitText.role = "paragraph";
      traitText.classList.value = "px-3 m-3 pb-3 font-body text-base pointer-events-auto";
      traitText.innerHTML = Locale.stylize(civTrait?.Description);
      this.Root.appendChild(traitText);
    } else if (sectionID == "LEADERS") {
      const leaderTrait = Database.query("config", "select * from LeaderItems order by SortIndex")?.find(
        (item) => item.LeaderType == pageID && item.Kind == "KIND_TRAIT"
      );
      const traitHeader = document.createElement("fxs-header");
      traitHeader.classList.value = "font-title text-lg text-secondary";
      traitHeader.setAttribute("title", leaderTrait?.Name);
      traitHeader.setAttribute("filigree-style", "small");
      this.Root.appendChild(traitHeader);
      const traitText = document.createElement("div");
      traitText.role = "paragraph";
      traitText.classList.value = "px-3 m-3 pb-3 font-body text-base pointer-events-auto";
      traitText.innerHTML = Locale.stylize(leaderTrait?.Description);
      this.Root.appendChild(traitText);
    }
    if (sectionID && pageID && chapterID && pageLayoutID) {
      const body = instance.getChapterBody(sectionID, pageID, chapterID, pageLayoutID);
      if (body && body.length > 0) {
        const header = instance.getChapterHeader(sectionID, pageID, chapterID);
        if (header) {
          const headerElement = document.createElement("fxs-header");
          headerElement.setAttribute("title", header);
          headerElement.classList.value = "font-title text-lg text-secondary";
          headerElement.setAttribute("filigree-style", "small");
          this.Root.appendChild(headerElement);
        }
        for (const paragraph of body) {
          const paragraphElement = document.createElement("div");
          paragraphElement.role = "paragraph";
          paragraphElement.setAttribute("data-l10n-id", paragraph);
          paragraphElement.classList.value = `px-3 m-3 font-body text-initial pointer-events-auto`;
          this.Root.appendChild(paragraphElement);
        }
      }
    } else {
      this.Root.classList.add("hidden");
    }
  }
}
Controls.define("pedia-page-content-chapter", {
  createInstance: PediaChapter,
  description: "Specific chapter of a page in the pedia."
});
//# sourceMappingURL=screen-civilopedia.js.map

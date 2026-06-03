import { MustGetElement } from '../utilities/utilities-dom.js';
import { number } from '../utilities/utilities-validation.js';
import '../stateful-icon/index.js';
import './fxs-tab-item.js';
import { SetAttributes } from '../stateful-icon/stateful-icon.js';

class TabSelectedEvent extends CustomEvent {
  constructor(detail) {
    super("tab-selected", {
      bubbles: true,
      cancelable: true,
      detail
    });
  }
}
class FxsTabBar extends Component {
  selectedTabIndex = -1;
  containerElement;
  selectionIndicatorElement;
  selectionIndicatorPositionValue = CSS.percent(0);
  navHelpLeftElement = document.createElement("fxs-nav-help");
  navHelpRightElement = document.createElement("fxs-nav-help");
  tabItems = [];
  tabElements = [];
  useAltControls = false;
  /**
   * navHandler is the element to attach the navigation handler to.
   * Higher up the tree enables tabbing from anywhere in the screen.
   */
  navHandler = this.Root;
  resizeObserver = new ResizeObserver(this.doSelectorPositionUpdate.bind(this));
  handleResizeEventListener = this.doSelectorPositionUpdate.bind(this);
  navigateInputEventListener = this.onNavigateInput.bind(this);
  get disabled() {
    return this.Root.getAttribute("disabled") === "true";
  }
  set disabled(value) {
    this.Root.setAttribute("disabled", value ? "true" : "false");
  }
  onNavigateInput(event) {
    if (event.detail.status != InputActionStatuses.FINISH || this.disabled) {
      return;
    }
    const direction = event.getDirection();
    switch (direction) {
      case InputNavigationAction.PREVIOUS:
      case InputNavigationAction.NEXT: {
        if (!this.useAltControls) {
          let selectedIndex = this.selectedTabIndex;
          selectedIndex = direction === InputNavigationAction.PREVIOUS ? selectedIndex - 1 : selectedIndex + 1;
          selectedIndex = Math.max(0, Math.min(selectedIndex, this.tabItems.length - 1));
          if (selectedIndex !== this.selectedTabIndex) {
            if (this.tabElements[selectedIndex].getAttribute("disabled") == "true") {
              if (direction === InputNavigationAction.PREVIOUS) {
                selectedIndex = this.findPreviousTab(selectedIndex);
                if (selectedIndex == -1) {
                  event.preventDefault();
                  event.stopImmediatePropagation();
                  return;
                }
              } else {
                selectedIndex = this.findNextTab(selectedIndex);
                if (selectedIndex == -1) {
                  event.preventDefault();
                  event.stopImmediatePropagation();
                  return;
                }
              }
            }
            this.tabSelected(selectedIndex);
          }
          event.preventDefault();
          event.stopImmediatePropagation();
          const audioId = this.Root.getAttribute("data-audio-activate-ref");
          if (audioId && audioId != "") {
            this.playSound(audioId);
          }
        }
        break;
      }
      case InputNavigationAction.SHELL_PREVIOUS:
      case InputNavigationAction.SHELL_NEXT: {
        if (this.useAltControls) {
          let selectedIndex = this.selectedTabIndex;
          selectedIndex = direction === InputNavigationAction.SHELL_PREVIOUS ? selectedIndex - 1 : selectedIndex + 1;
          selectedIndex = Math.max(0, Math.min(selectedIndex, this.tabItems.length - 1));
          if (selectedIndex !== this.selectedTabIndex) {
            if (this.tabElements[selectedIndex].getAttribute("disabled") == "true") {
              if (direction === InputNavigationAction.SHELL_PREVIOUS) {
                selectedIndex = this.findPreviousTab(selectedIndex);
                if (selectedIndex == -1) {
                  event.preventDefault();
                  event.stopImmediatePropagation();
                  return;
                }
              } else {
                selectedIndex = this.findNextTab(selectedIndex);
                if (selectedIndex == -1) {
                  event.preventDefault();
                  event.stopImmediatePropagation();
                  return;
                }
              }
            }
            this.tabSelected(selectedIndex);
          }
          event.preventDefault();
          event.stopImmediatePropagation();
          const audioId = this.Root.getAttribute("data-audio-activate-ref");
          if (audioId && audioId != "") {
            this.playSound(audioId);
          }
        }
        break;
      }
    }
  }
  onInitialize() {
    super.onInitialize();
    this.render();
    this.updateNavHelp();
  }
  onAttach() {
    super.onAttach();
    const tabForSelector = this.Root.getAttribute("tab-for") ?? "fxs-frame";
    if (tabForSelector !== "") {
      const navHandler = this.Root.closest(tabForSelector);
      if (!navHandler) {
        console.error(
          `fxs-tab-bar: could not find nav handler for selector ${tabForSelector}. Attaching to root element instead, navigation will not work unless the tab bar is focused.`
        );
      } else {
        this.navHandler = navHandler;
      }
    } else {
      this.navHelpLeftElement.classList.add("hidden");
      this.navHelpRightElement.classList.add("hidden");
    }
    this.navHandler.addEventListener("navigate-input", this.navigateInputEventListener);
    this.Root.addEventListener("resize", this.handleResizeEventListener);
    this.Root.setAttribute("data-audio-activate-ref", "data-audio-tab-selected");
  }
  onDetach() {
    this.navHandler.removeEventListener("navigate-input", this.navigateInputEventListener);
    this.Root.removeEventListener("resize", this.handleResizeEventListener);
    super.onDetach();
    this.navHandler = this.Root;
    this.resizeObserver.disconnect();
  }
  onAttributeChanged(name, _oldValue, newValue) {
    switch (name) {
      case "tab-items": {
        if (newValue) {
          this.updateTabItems(JSON.parse(newValue));
          this.updateNavHelp();
        } else {
          this.updateTabItems([]);
        }
        break;
      }
      case "selected-tab-index": {
        if (newValue) {
          const index = number({ value: newValue, min: 0, max: this.tabItems.length - 1 });
          this.tabSelected(index);
        }
        break;
      }
      case "alt-controls": {
        if (newValue) {
          if (newValue == "true") {
            this.useAltControls = true;
          } else {
            this.useAltControls = false;
          }
          this.updateNavHelp();
        }
        break;
      }
      case "disabled": {
        const disabled = newValue === "true";
        const attributeValue = disabled ? "true" : "false";
        this.tabElements.forEach((tab) => {
          tab.setAttribute("disabled", attributeValue);
        });
        break;
      }
    }
  }
  tabSelected(index) {
    if (index < 0 || index >= this.tabItems.length) {
      console.error(`fxs-tab-bar: invalid tab index ${index}`);
      return;
    }
    if (this.selectedTabIndex === index || this.disabled) {
      return;
    }
    const selectedItem = this.tabItems[index];
    const selectedElement = this.tabElements[index];
    const prevIndex = this.selectedTabIndex;
    const cancelled = !this.Root.dispatchEvent(new TabSelectedEvent({ index, selectedItem }));
    if (cancelled) {
      this.Root.setAttribute("selected-tab-index", prevIndex.toString());
      return;
    }
    this.selectedTabIndex = index;
    this.Root.setAttribute("selected-tab-index", index.toString());
    if (prevIndex >= 0) {
      this.tabElements[prevIndex].setAttribute("selected", "false");
    }
    selectedElement.setAttribute("selected", "true");
    this.resizeObserver.observe(selectedElement);
    this.doSelectorPositionUpdate();
  }
  findPreviousTab(selectedIndex) {
    while (selectedIndex >= 0) {
      if (this.tabElements[selectedIndex].getAttribute("disabled") != "true") {
        break;
      }
      if (selectedIndex > 0) {
        selectedIndex--;
      } else {
        return -1;
      }
    }
    return selectedIndex;
  }
  findNextTab(selectedIndex) {
    while (selectedIndex <= this.tabItems.length - 1) {
      if (this.tabElements[selectedIndex].getAttribute("disabled") != "true") {
        break;
      }
      if (selectedIndex < this.tabItems.length - 1) {
        selectedIndex++;
      } else {
        return -1;
      }
    }
    return selectedIndex;
  }
  /**
   * Read in the tab data attribute and update the tab bar state
   */
  updateTabItems(tabItems) {
    this.tabItems = tabItems;
    this.clearTabItems();
    const tabItemClassName = this.Root.getAttribute("tab-item-class") ?? "";
    const fragment = document.createDocumentFragment();
    const ourAudioGroup = this.Root.getAttribute("data-audio-group-ref");
    const ourFocusGroup = this.Root.getAttribute("data-audio-focus-ref");
    for (let index = 0; index < this.tabItems.length; index++) {
      const tab = this.tabItems[index];
      const tabElement = document.createElement("fxs-tab-item");
      if (ourAudioGroup) {
        tabElement.setAttribute("data-audio-group-ref", ourAudioGroup);
      }
      if (ourFocusGroup) {
        tabElement.setAttribute("data-audio-focus-ref", ourFocusGroup);
      }
      tabElement.setAttribute("data-audio-activate-ref", "data-audio-tab-selected");
      if (tab.label) {
        tabElement.setAttribute("label", tab.label);
        if (tab.nowrap) {
          tabElement.setAttribute("nowrap", tab.nowrap ? "true" : "false");
        }
      }
      if (tab.id) {
        tabElement.setAttribute("id", tab.id + "-tab-item");
      }
      if (tab.highlight) {
        tabElement.setAttribute("data-tut-highlight", "techChooserHighlights");
      }
      if (tab.icon) {
        SetAttributes(tabElement, tab.icon);
        if (tab.iconClass) {
          tabElement.setAttribute("icon-class", tab.iconClass);
        }
        if (tab.iconText) {
          tabElement.setAttribute("icon-text", tab.iconText);
        }
      }
      if (tabItemClassName) {
        tabElement.classList.add(...tabItemClassName.split(" "));
      }
      if (tab.className) {
        tabElement.classList.add(...tab.className.split(" "));
      }
      tabElement.setAttribute("disabled", tab.disabled ? "true" : "false");
      tabElement.setAttribute("selected", "false");
      tabElement.addEventListener("action-activate", () => {
        this.tabSelected(index);
      });
      const tooltip = tabItems[index].tooltip;
      if (tooltip) {
        tabElement.setAttribute("data-tooltip-content", tooltip);
      }
      fragment.appendChild(tabElement);
      this.tabElements.push(tabElement);
    }
    this.containerElement.appendChild(fragment);
    if (this.tabItems.length > 0) {
      if (this.Root.hasAttribute("selected-tab-index")) {
        const index = number({
          value: this.Root.getAttribute("selected-tab-index"),
          min: 0,
          max: this.tabItems.length - 1
        });
        this.tabSelected(index);
      } else {
        this.tabSelected(0);
      }
    }
  }
  clearTabItems() {
    const elements = this.containerElement.childNodes;
    for (let i = elements.length - 1; i >= 0; i--) {
      elements[i].remove();
    }
    this.tabElements = [];
    this.selectedTabIndex = -1;
  }
  updateNavHelp() {
    if (this.tabItems.length < 2) {
      return;
    }
    if (this.useAltControls) {
      this.navHelpLeftElement.setAttribute("action-key", "inline-nav-shell-previous");
      this.navHelpRightElement.setAttribute("action-key", "inline-nav-shell-next");
    } else {
      this.navHelpLeftElement.setAttribute("action-key", "inline-cycle-prev");
      this.navHelpRightElement.setAttribute("action-key", "inline-cycle-next");
    }
    this.navHelpLeftElement.setAttribute("data-audio-activate-ref", "data-audio-tab-selected");
  }
  /**
   * Called after a tab is selected to update highlight element positions.
   *
   * Override this method to customize how highlight elements are positioned. If you override this method, you must also override `renderSelectionIndicators`.
   */
  onSelectorPositionUpdate() {
    const selectedTab = this.tabElements[this.selectedTabIndex];
    const rootRect = this.containerElement.getBoundingClientRect();
    const tabRect = selectedTab.getBoundingClientRect();
    const lineStart = tabRect.x;
    const lineTarget = lineStart - rootRect.x;
    this.selectionIndicatorPositionValue.value = lineTarget / rootRect.width * 100;
    this.selectionIndicatorElement.attributeStyleMap.set("left", this.selectionIndicatorPositionValue);
    const tabWidth = tabRect.width;
    this.selectionIndicatorElement.style.width = `${tabWidth}px`;
  }
  /**
   * Calls the `onUpdateSelectorPosition` method after the next layout update.
   */
  doSelectorPositionUpdate() {
    waitForLayout(this.onSelectorPositionUpdate.bind(this));
  }
  /**
   * Render the whole tab bar, but don't worry about the state yet.
   */
  render() {
    this.Root.classList.add(
      "relative",
      "flex",
      "justify-center",
      "h-16",
      "uppercase",
      "font-title",
      "text-base",
      "text-accent-2",
      "tracking-150"
    );
    if (this.Root.getAttribute("rect-render") == "true") {
      this.Root.innerHTML = `
				<div class="absolute inset-0 border-t-primary-3 border-t border-b-primary border-b pointer-events-none"></div>
				<div class="absolute inset-0 bg-primary opacity-10 pointer-events-none"></div>
			`;
    } else if (this.Root.getAttribute("tab-style") == "flat") {
      this.Root.innerHTML = `
				<div class="absolute inset-0 img-tab-bar-flat pointer-events-none"></div>
				<div class="absolute -left-1 img-tab-flat-end-cap pointer-events-none left-border"></div>
				<div class="absolute -right-1 rotate-y-180 img-tab-flat-end-cap pointer-events-none right-border"></div>
			`;
    } else {
      this.Root.classList.add("px-12");
      this.Root.innerHTML = `
				<div class="absolute inset-0 img-tab-bar pointer-events-none"></div>
				<div class="absolute -left-1\\.5 img-tab-end-cap pointer-events-none left-border"></div>
				<div class="absolute -right-1\\.5 rotate-y-180 img-tab-end-cap pointer-events-none right-border"></div>
			`;
    }
    const navHelpLeftClassName = this.Root.getAttribute("nav-help-left-class") ?? "absolute -left-9";
    this.navHelpLeftElement.classList.add(...navHelpLeftClassName.split(" "));
    this.Root.insertAdjacentElement("beforeend", this.navHelpLeftElement);
    this.Root.insertAdjacentHTML(
      "beforeend",
      `
			<div class="relative flex flex-auto">
				<div class="flex flex-auto tab-bar__items justify-center"></div>
				<div class="absolute bottom-0 left-0 img-tab-selection-indicator bg-no-repeat bg-center min-h-6 bg-contain tab-bar__selection-indicator transition-left duration-150"></div>
			</div>
		`
    );
    const navHelpRightClassName = this.Root.getAttribute("nav-help-right-class") ?? "absolute -right-9";
    this.navHelpRightElement.classList.add(...navHelpRightClassName.split(" "));
    this.Root.insertAdjacentElement("beforeend", this.navHelpRightElement);
    this.containerElement = MustGetElement(".tab-bar__items", this.Root);
    this.selectionIndicatorElement = MustGetElement(".tab-bar__selection-indicator", this.Root);
  }
}
Controls.define("fxs-tab-bar", {
  createInstance: FxsTabBar,
  attributes: [
    {
      name: "tab-items"
    },
    {
      name: "selected-tab-index"
    },
    {
      name: "alt-controls"
    },
    {
      name: "disabled"
    },
    {
      name: "tab-style",
      description: "flat, default is with img-tab-bar and img-tab-end-cap"
    }
  ]
});

export { FxsTabBar, TabSelectedEvent, FxsTabBar as default };
//# sourceMappingURL=fxs-tab-bar.js.map

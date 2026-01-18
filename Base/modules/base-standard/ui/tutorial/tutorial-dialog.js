import { A as Audio } from '../../../core/ui/audio-base/audio-support.chunk.js';
import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import ActionHandler, { ActiveDeviceTypeChangedEventName } from '../../../core/ui/input/action-handler.js';
import FocusManager from '../../../core/ui/input/focus-manager.js';
import { N as NavTray } from '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel } from '../../../core/ui/panel-support.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import { s as styles } from './tutorial-dialog.chunk.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';

const content = "<div class=\"tutorial-dialog-content flex absolute fullscreen overflow-hidden\">\r\n\t<div class=\"tutorial-dialog-page-overlay absolute fullscreen\"></div>\r\n\t<div class=\"tutorial-dialog-pages relative flex flex-col size-full bg-cover bg-center bg-primary-5\">\r\n\t\t<div class=\"tutorial-dialog-pagination-container flex-col absolute w-full bottom-3 z-1\">\r\n\t\t\t<div class=\"w-full flex flex-row justify-center pt-7 pb-3\">\r\n\t\t\t\t<fxs-button class=\"tutorial-dialog-previous-button disabled mx-6\"></fxs-button>\r\n\t\t\t\t<fxs-button class=\"tutorial-dialog-next-button mx-6\"></fxs-button>\r\n\t\t\t</div>\r\n\t\t\t<div class=\"w-full p-2\">\r\n\t\t\t\t<div class=\"tutorial-dialog-counter justify-center flex-row flex\"></div>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t</div>\r\n\t<div class=\"absolute fullscreen\">\r\n\t\t<div class=\"tutorial-dialog-frame mt-6 ml-6 pointer-events-none size-full\"></div>\r\n\t</div>\r\n\t<div class=\"absolute fullscreen\">\r\n\t\t<div class=\"tutorial-dialog-frame -scale-x-100 mt-6 -ml-6 pointer-events-none size-full\"></div>\r\n\t</div>\r\n\t<div class=\"absolute fullscreen\">\r\n\t\t<div class=\"relative size-full\">\r\n\t\t\t<fxs-close-button></fxs-close-button>\r\n\t\t</div>\r\n\t</div>\r\n</div>\r\n";

class LowerTutorialDialogEvent extends CustomEvent {
  constructor(itemID) {
    super("lower-tutorial-dialog-event", {
      bubbles: true,
      detail: { itemID }
    });
  }
}
class TutorialDialogPanel extends Panel {
  nextButton = null;
  previousButton = null;
  pageCounter = null;
  itemID = "";
  page = 0;
  lastPage = -1;
  pages = [];
  radioButtons = [];
  pagesReady = -1;
  tutorialDialogPageReadyListener = (event) => {
    this.onPageReady(event);
  };
  activeDeviceTypeListener = () => {
    this.onActiveDeviceTypeChanged();
  };
  navigateInputListener = (navigationEvent) => {
    this.onNavigateInput(navigationEvent);
  };
  engineInputListener = (inputEvent) => {
    this.onEngineInput(inputEvent);
  };
  constructor(root) {
    super(root);
    this.enableOpenSound = true;
    this.enableCloseSound = true;
    this.Root.setAttribute("data-audio-group-ref", "tutorial-intro");
  }
  onAttach() {
    super.onAttach();
    const dialogDataSerialized = this.Root.getAttribute("value");
    if (!dialogDataSerialized) {
      console.error(
        "tutorial-dialog: onAttach(): Could not raise tutorial dialog because no dialog data was passed in."
      );
      return;
    }
    window.addEventListener("tutorial-dialog-page-ready", this.tutorialDialogPageReadyListener);
    window.addEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener, true);
    this.Root.addEventListener("navigate-input", this.navigateInputListener);
    this.Root.addEventListener("engine-input", this.engineInputListener);
    this.pagesReady = 0;
    this.itemID = this.Root.getAttribute("itemID") ?? "";
    if (this.itemID == "") {
      console.warn(
        "tutorial-dialog: onAttach(): Loading a tutorial dialog but no associate tutorial item ID was passed in."
      );
    }
    const dialogData = JSON.parse(dialogDataSerialized);
    if (dialogData == null) {
      console.error(
        "tutorial-dialog: onAttach(): Could not raise tutorial dialog because data provided wasn't a valid definition."
      );
      console.log("tutorial-dialog: onAttach(): Dialog data: ", dialogDataSerialized);
    }
    const closeButton = this.Root.querySelector("fxs-close-button");
    if (closeButton) {
      closeButton.addEventListener("action-activate", (event) => {
        event.stopPropagation();
        event.preventDefault();
        this.close();
      });
    } else {
      console.error("tutorial-dialog: onAttach(): closeButton with 'fxs-close-button'");
    }
    this.nextButton = this.Root.querySelector(".tutorial-dialog-next-button");
    if (this.nextButton) {
      this.nextButton.setAttribute("caption", Locale.compose("LOC_TUTORIAL_NEXT_PAGE"));
      this.nextButton.setAttribute("data-audio-group-ref", "tutorial-intro");
      this.nextButton.setAttribute("data-audio-activate-ref", "none");
      this.nextButton.addEventListener("action-activate", (event) => {
        event.stopPropagation();
        event.preventDefault();
        this.onNextPage();
      });
    } else {
      console.error("tutorial-dialog: onAttach(): this.nextButton with '.tutorial-dialog-next-button'");
    }
    this.previousButton = this.Root.querySelector(".tutorial-dialog-previous-button");
    if (this.previousButton) {
      this.previousButton.setAttribute("caption", Locale.compose("LOC_TUTORIAL_PREVIOUS_PAGE"));
      this.previousButton.setAttribute("data-audio-group-ref", "tutorial-intro");
      this.previousButton.setAttribute("data-audio-activate-ref", "none");
      this.previousButton.addEventListener("action-activate", (event) => {
        event.stopPropagation();
        event.preventDefault();
        this.onPreviousPage();
      });
    } else {
      console.error("tutorial-dialog: onAttach(): this.previousButton with '.tutorial-dialog-previous-button'");
    }
    this.pageCounter = MustGetElement(".tutorial-dialog-counter", this.Root);
    this.initializePages(dialogData);
  }
  onDetach() {
    window.removeEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener, true);
    window.removeEventListener("tutorial-dialog-page-ready", this.tutorialDialogPageReadyListener);
    this.Root.removeEventListener("navigate-input", this.navigateInputListener);
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    NavTray.clear();
    NavTray.addOrUpdateAccept("LOC_TUTORIAL_NEXT_PAGE");
    NavTray.addOrUpdateCancel("LOC_TUTORIAL_PREVIOUS_PAGE");
    NavTray.addOrUpdateNavNext("LOC_TUTORIAL_SKIP");
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  setButtonVisible(button, isVisible) {
    if (button) {
      button.classList.toggle("hidden", !isVisible);
    }
  }
  onActiveDeviceTypeChanged() {
    this.setButtonVisible(this.previousButton, !ActionHandler.isGamepadActive);
    this.setButtonVisible(this.nextButton, !ActionHandler.isGamepadActive);
  }
  close() {
    window.dispatchEvent(new LowerTutorialDialogEvent(this.itemID));
    super.close();
  }
  open() {
    ContextManager.pushElement(this.Root);
    UI.panelStart(this.Root.typeName, "", 2, true);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          this.onNextPage();
        });
      });
    });
  }
  initializePages(dialogData) {
    if (!dialogData?.series) {
      console.error(
        "tutorial-dialog: initializePages(): Cannot raise tutorial dialog as it only supports a series."
      );
      console.log("tutorial-dialog: initializePages(): Dialog data: ", JSON.stringify(dialogData));
      return;
    }
    const pagesElement = this.Root.querySelector(".tutorial-dialog-pages");
    if (!pagesElement) {
      console.error("tutorial-dialog: initializePages(): Missing pagesElement with '.tutorial-dialog-pages'");
      return;
    }
    const max = (dialogData.series.length - 1).toString();
    dialogData.series.forEach((data, index) => {
      const page = data;
      const pageElement = document.createElement("tutorial-dialog-page");
      pageElement.setAttribute("index", index.toString());
      pageElement.setAttribute("max", max);
      pageElement.setAttribute("title", page.title ?? "");
      pageElement.setAttribute("subtitle", page.subtitle ?? "");
      pageElement.setAttribute("body", page.body ?? "");
      if (page.images && page.images.length > 0) {
        page.images.forEach((data2) => {
          const img = document.createElement("div");
          img.classList.add("tutorial-image");
          img.setAttribute("image", data2.image ?? "");
          img.setAttribute("width", data2.width?.toString() ?? "");
          img.setAttribute("height", data2.height?.toString() ?? "");
          img.setAttribute("x", data2.x?.toString() ?? "");
          img.setAttribute("y", data2.y?.toString() ?? "");
          pageElement.appendChild(img);
        });
      }
      if (page.backgroundImages && page.backgroundImages.length > 0) {
        pageElement.setAttribute("backgroundImages", page.backgroundImages.toString());
      } else {
        console.warn(
          "tutorial-dialog: initializePages(): No background images for the tutorial dialog! index:",
          index,
          "'" + JSON.stringify(data) + "'"
        );
      }
      pagesElement.appendChild(pageElement);
      this.pages.push(pageElement);
      const item = document.createElement("fxs-radio-button");
      item.classList.add("relative", "flex", "bg-no-repeat", "bg-cover", this.pages.length > 0 ? "ml-1" : "");
      item.style.pointerEvents = "none";
      if (page.title) {
        item.setAttribute("data-item-id", page.title.toString());
        item.setAttribute("group-tag", "overview-breadcrumbs");
        item.setAttribute("value", index.toString());
        this.radioButtons.push(item);
        this.pageCounter?.appendChild(item);
      }
      this.page = -1;
    });
  }
  updatePreviousButtonState() {
    const onFirstPage = this.page == 0;
    const onSecondPage = this.page == 1;
    if (this.previousButton) {
      if (onFirstPage) {
        this.previousButton.style.display = "none";
      } else if (onSecondPage && !ActionHandler.isGamepadActive) {
        this.previousButton.style.display = "flex";
      }
    }
  }
  onPreviousPage() {
    if (this.page <= 0) {
      console.error("tutorial-dialog: onPreviousPage(): Attempt for tutorial dialog to go past page 0.");
      return;
    }
    if (this.page + 1 >= this.pages.length) {
      this.nextButton?.setAttribute("caption", Locale.compose("LOC_TUTORIAL_NEXT_PAGE"));
    }
    this.lastPage = this.page--;
    this.realize();
    this.radioButtons[this.page].setAttribute("selected", "true");
    this.updatePreviousButtonState();
    Audio.playSound("data-audio-activate", "tutorial-intro");
  }
  onNextPage() {
    if (this.page + 1 >= this.pages.length) {
      this.close();
    } else {
      this.lastPage = this.page++;
      this.realize();
      if (this.page + 1 >= this.pages.length) {
        this.nextButton?.setAttribute("caption", Locale.compose("LOC_TUTORIAL_FINISH"));
      }
      this.radioButtons[this.page].setAttribute("selected", "true");
      this.updatePreviousButtonState();
    }
    Audio.playSound("data-audio-activate", "tutorial-intro");
  }
  onNavigateInput(navigationEvent) {
    const live = this.handleNavigation(navigationEvent);
    if (!live) {
      navigationEvent.preventDefault();
      navigationEvent.stopImmediatePropagation();
    }
  }
  /**
   * @returns true if still live, false if input should stop.
   */
  handleNavigation(navigationEvent) {
    if (navigationEvent.detail.status != InputActionStatuses.FINISH) {
      return true;
    }
    let live = true;
    const direction = navigationEvent.getDirection();
    switch (direction) {
      case InputNavigationAction.DOWN:
      case InputNavigationAction.RIGHT:
        this.onNextPage();
        live = false;
        break;
      case InputNavigationAction.UP:
      case InputNavigationAction.LEFT:
        this.onPreviousPage();
        live = false;
        break;
      case InputNavigationAction.NEXT:
        this.close();
        live = false;
    }
    return live;
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.detail.name == "accept") {
      this.onNextPage();
      window.dispatchEvent(new SetActivatedComponentEvent(null));
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    } else if (inputEvent.detail.name == "cancel") {
      this.onPreviousPage();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  realize() {
    if (!this.pages[this.page]) {
      console.warn(`tutorial-dialog: realize(): No current tutorial dialog page at ${this.page}`);
      return;
    }
    if (this.lastPage >= 0 && !this.pages[this.lastPage]) {
      console.warn(`tutorial-dialog: realize(): No previous tutorial dialog page at ${this.lastPage}`);
      return;
    }
    this.pages[this.page].classList.remove("no-anim");
    if (this.lastPage < this.page) {
      if (this.lastPage >= 0) {
        this.pages[this.lastPage].classList.remove("slow-anim", "pointer-events-auto");
        this.pages[this.lastPage].classList.add("prev", "pointer-events-none");
      }
      this.pages[this.page].classList.remove("inactive", "pointer-events-none");
      this.pages[this.page].classList.add("pointer-events-auto");
    } else {
      this.pages[this.lastPage].classList.remove("slow-anim", "pointer-events-auto");
      this.pages[this.lastPage].classList.add("inactive", "pointer-events-none");
      this.pages[this.page].classList.remove("prev", "pointer-events-none");
      this.pages[this.page].classList.add("slow-anim", "pointer-events-auto");
    }
  }
  /// Track which tutorial pages are ready
  onPageReady(event) {
    if (!event.detail || event.detail.index == void 0) {
      console.error(
        "tutorial-dialog: onPageReady(): Tutorial dialog received a page-is-ready event but no page index was passed in!"
      );
      return;
    }
    const pageIndex = event.detail.index;
    if (pageIndex < 0 || pageIndex > this.pages.length - 1) {
      console.error(
        "tutorial-dialog: onPageReady(): Tutorial dialog received a page-is-ready event but page index '" + pageIndex + "' is out-of-bounds. length: ",
        this.pages.length
      );
      return;
    }
    this.pagesReady++;
    if (this.pagesReady == this.pages.length) {
      FocusManager.setFocus(this.Root);
      this.open();
    } else if (this.pagesReady > this.pages.length) {
      console.warn(
        "tutorial-dialog: onPageReady(): Tutorial dialog has more pages reported being ready than max. pages: " + this.pagesReady + ", length: " + this.pages.length
      );
    }
  }
}
Controls.define("tutorial-dialog", {
  createInstance: TutorialDialogPanel,
  description: "Dialog box containing a series of tutorial information.",
  styles: [styles],
  innerHTML: [content],
  attributes: [],
  tabIndex: -1
});
//# sourceMappingURL=tutorial-dialog.js.map

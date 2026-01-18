import { A as Audio } from '../../../core/ui/audio-base/audio-support.chunk.js';
import { D as DialogBoxAction, a as DialogBoxManager } from '../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import ActionHandler, { ActiveDeviceTypeChangedEventName } from '../../../core/ui/input/action-handler.js';
import FocusManager from '../../../core/ui/input/focus-manager.js';
import { F as Focus } from '../../../core/ui/input/focus-support.chunk.js';
import { N as NavTray } from '../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import { MustGetElement } from '../../../core/ui/utilities/utilities-dom.chunk.js';
import QuestTracker from '../quest-tracker/quest-tracker.js';
import { a as LowerQuestPanelEvent } from './tutorial-events.chunk.js';
import { TutorialAnchorPosition } from './tutorial-item.js';
import TutorialManager from './tutorial-manager.js';
import { g as getTutorialPrompts } from './tutorial-support.chunk.js';
import '../../../core/ui/context-manager/display-queue-manager.js';
import '../../../core/ui/framework.chunk.js';
import '../../../core/ui/input/cursor.js';
import '../../../core/ui/views/view-manager.chunk.js';
import '../../../core/ui/panel-support.chunk.js';
import '../../../core/ui/input/input-support.chunk.js';
import '../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../core/ui/components/fxs-slot.chunk.js';
import '../../../core/ui/spatial/spatial-manager.js';
import '../../../core/ui/context-manager/context-manager.js';
import '../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../quest-tracker/quest-item.js';
import '../../../core/ui/input/input-filter.chunk.js';
import '../../../core/ui/components/fxs-nav-help.chunk.js';
import '../../../core/ui/utilities/utilities-layout.chunk.js';
import '../../../core/ui/utilities/utilities-core-databinding.chunk.js';

const content = "<fxs-modal-frame\r\n\tclass=\"tutorial-quest-panel-content absolute self-center w-full\"\r\n\tdata-modal-style=\"special\"\r\n>\r\n\t<div class=\"tutorial-quest-panel-title-container relative h-auto flex flex-col items-center\">\r\n\t\t<div\r\n\t\t\tclass=\"tutorial-quest-panel-title font-title-2xl text-secondary uppercase relative pointer-events-none justify-center text-center\"\r\n\t\t></div>\r\n\t\t<div\r\n\t\t\tclass=\"tutorial-quest-panel-divider h-4 filigree-shell-small absolute self-center bg-contain bg-no-repeat bg-center\"\r\n\t\t></div>\r\n\t</div>\r\n\t<div class=\"tutorial-quest-panel-body relative pointer-events-none flex justify-around flex-col\">\r\n\t\t<div class=\"tutorial-quest-panel-body-text font-body-base text-primary-1\"></div>\r\n\t</div>\r\n\t<fxs-hslot class=\"tutorial-quest-panel-advisors flex max-w-full relative justify-center\"></fxs-hslot>\r\n\t<div class=\"tutorial-quest-panel-overlay absolute inset-0 pointer-events-none\"></div>\r\n</fxs-modal-frame>\r\n";

const styles = "fs://game/base-standard/ui/tutorial/tutorial-quest-panel.css";

class TutorialQuestPanel extends Component {
  data;
  itemID = "";
  isClosed = true;
  // Is this in a closed stated?
  nextID;
  selectedAdvisorQuestPath = AdvisorTypes.NO_ADVISOR;
  gamepadWasActive = ActionHandler.isGamepadActive;
  engineInputListener = this.onEngineInput.bind(this);
  activeDeviceTypeListener = this.onActiveDeviceTypeChanged.bind(this);
  constructor(root) {
    super(root);
  }
  onAttach() {
    super.onAttach();
    if (!this.isClosed) {
      console.error(
        "tutorial-quest-panel: onAttach(): Attempting to load tutorial quest panel content when it's not marked as 'closed'. id: ",
        this.itemID
      );
      return;
    }
    this.itemID = this.Root.getAttribute("itemID") ?? "";
    if (this.itemID == "") {
      console.warn(
        "tutorial-quest-panel: onAttach(): Loading a tutorial quest panel but no associated item ID was passed in."
      );
    }
    const calloutDataSerialized = this.Root.getAttribute("value");
    if (!calloutDataSerialized) {
      console.warn(
        "tutorial-quest-panel: onAttach(): Could not raise tutorial quest panel because no data was passed in. id: ",
        this.itemID
      );
      return;
    }
    const serializedData = JSON.parse(calloutDataSerialized);
    if (!serializedData) {
      console.error(
        "tutorial-quest-panel: onAttach(): Could not raise tutorial quest panel because data provided wasn't a valid definition. id: ",
        this.itemID
      );
      return;
    }
    this.data = serializedData;
    const enabledLegacyPaths = Players.get(GameContext.localPlayerID)?.LegacyPaths?.getEnabledLegacyPaths();
    this.data.advisors = this.data.advisors.filter(
      (advisor) => enabledLegacyPaths?.find(
        (lPath) => lPath.legacyPathClass == Database.makeHash(advisor.legacyPathClassType)
      )
    );
    if (this.data.title) {
      this.Root.classList.toggle("show-title", this.data.title != "");
      const title = Locale.compose(this.data.title);
      this.setHTMLInDivClass(title, "tutorial-quest-panel-title");
    }
    const uiViewExperience = UI.getViewExperience();
    if (uiViewExperience == UIViewExperience.Mobile) {
      const frame = MustGetElement("fxs-modal-frame", this.Root);
      frame.setAttribute("data-modal-style", "generic");
      frame.setAttribute("bg-style", "none");
      const closeButton = document.createElement("fxs-close-button");
      closeButton.classList.add("absolute", "top-7", "-right-9");
      closeButton.addEventListener("action-activate", () => {
        this.close();
      });
      frame.appendChild(closeButton);
      const frameBg = document.createElement("div");
      frameBg.classList.add("absolute", "img-frame-f1", "fullscreen-outside-safezone", "-z-1");
      this.Root.appendChild(frameBg);
      const advisors = MustGetElement(".tutorial-quest-panel-advisors", this.Root);
      const bodyTextScrollable = document.createElement("fxs-scrollable");
      bodyTextScrollable.classList.add("tutorial-quest-panel-scrollable", "mt-8", "mb-2", "self-center");
      bodyTextScrollable.whenComponentCreated((component) => {
        component.setEngineInputProxy(this.Root);
      });
      frame.insertBefore(bodyTextScrollable, advisors);
      const bodyTextDiv = MustGetElement(".tutorial-quest-panel-body", this.Root);
      bodyTextDiv.classList.remove("flex", "flex-col");
      bodyTextScrollable.appendChild(bodyTextDiv);
      this.setGamepadControlsVisible(ActionHandler.isGamepadActive);
    }
    this.setHTMLInDivClass(Locale.compose(this.getContentData() || ""), "tutorial-quest-panel-body-text");
    this.setAdvisors();
    this.Root.classList.add(TutorialAnchorPosition.MiddleCenter);
    window.addEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener, true);
    this.Root.addEventListener("engine-input", this.engineInputListener);
    this.nextID = void 0;
    this.selectedAdvisorQuestPath = AdvisorTypes.NO_ADVISOR;
    this.isClosed = false;
    Audio.playSound("data-audio-showing", "tutorial-quest-panel");
  }
  onDetach() {
    window.removeEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceTypeListener, true);
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    super.onDetach();
    Audio.playSound("data-audio-hiding", "tutorial-quest-panel");
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    Input.setActiveContext(InputContext.Shell);
    const advisorButton = this.Root.querySelector(".quest-advisor-button");
    if (advisorButton) {
      Focus.setContextAwareFocus(advisorButton, this.Root);
    } else {
      const exitButton = MustGetElement(".quest-advisor__emergency-exit", this.Root);
      Focus.setContextAwareFocus(exitButton, this.Root);
    }
  }
  getContentData() {
    const item = TutorialManager.getCalloutItem(this.itemID);
    if (!item) {
      console.error(
        "tutorial-quest-panel: getContentData(): Attempting to get tutorial item but not found, id: ",
        this.itemID
      );
      return;
    }
    const questPanelDefine = item.questPanel;
    if (!questPanelDefine) {
      console.error(
        "tutorial-quest-panel: getContentData(): Tutorial: Quest Panel data missing; cannot raise. id: ",
        this.itemID
      );
      return;
    }
    let params = [];
    let content2 = "";
    const hasAdvisors = this.data.advisors.length > 0;
    if (hasAdvisors) {
      if (questPanelDefine.description) {
        content2 = questPanelDefine.description.text;
      }
      if (questPanelDefine.description?.getLocParams) {
        params = questPanelDefine.description.getLocParams(item);
      }
    } else {
      if (questPanelDefine.altNoAdvisorsDescription) {
        content2 = questPanelDefine.altNoAdvisorsDescription.text;
      }
      if (questPanelDefine.altNoAdvisorsDescription?.getLocParams) {
        params = questPanelDefine.altNoAdvisorsDescription.getLocParams(item);
      }
    }
    let prompts = [];
    if (questPanelDefine.actionPrompts) {
      prompts = getTutorialPrompts(questPanelDefine.actionPrompts);
    }
    return Locale.stylize(content2, ...params, ...prompts);
  }
  setAdvisors() {
    if (this.data == null) {
      console.error(
        "tutorial-quest-panel: setAdvisors(): Could not raise tutorial quest panel because data provided wasn't a valid definition. id: ",
        this.itemID
      );
      return;
    }
    const isMobile = UI.getViewExperience() == UIViewExperience.Mobile;
    const advisorsContainer = MustGetElement(".tutorial-quest-panel-advisors", this.Root);
    while (advisorsContainer.hasChildNodes()) {
      advisorsContainer.removeChild(advisorsContainer.lastChild);
    }
    advisorsContainer.classList.toggle("flex-auto", isMobile);
    if (this.data.advisors.length == 0) {
      const exitButton = document.createElement("fxs-button");
      exitButton.setAttribute("caption", "LOC_GENERIC_CONTINUE");
      exitButton.classList.add("quest-advisor__emergency-exit", "w-96", "self-center");
      exitButton.setAttribute("action-key", "inline-confirm");
      exitButton.addEventListener("action-activate", this.close.bind(this));
      MustGetElement(".tutorial-quest-panel-body", this.Root).appendChild(exitButton);
      return;
    }
    for (const advisor of this.data.advisors) {
      const advisorElement = document.createElement("fxs-vslot");
      advisorElement.classList.add(
        "quest-advisor-element",
        "flex",
        "flex-col",
        "my-4",
        "flex-auto",
        "justify-between",
        "max-w-96"
      );
      const advisorCardBg = document.createElement("div");
      advisorCardBg.classList.add("quest-advisor-card-backdrop", "absolute", "inset-0");
      advisorElement.appendChild(advisorCardBg);
      const advisorCardFiligree = document.createElement("div");
      advisorCardFiligree.classList.add("quest-advisor-card-filigree", "absolute", "top-20", "h-18", "w-full");
      advisorElement.appendChild(advisorCardFiligree);
      const advisorPicContainer = document.createElement("div");
      advisorPicContainer.classList.add("relative", "flex", "self-center", "pb-2");
      const advisorBg = document.createElement("div");
      advisorBg.classList.add("quest-advisor-bg", "bg-cover", "bg-no-repeat");
      advisorPicContainer.appendChild(advisorBg);
      let advisorType = "";
      switch (advisor.type) {
        case AdvisorTypes.CULTURE:
          advisorType = "ADVISOR_CULTURE";
          break;
        case AdvisorTypes.ECONOMIC:
          advisorType = "ADVISOR_ECONOMIC";
          break;
        case AdvisorTypes.MILITARY:
          advisorType = "ADVISOR_MILITARY";
          break;
        case AdvisorTypes.SCIENCE:
          advisorType = "ADVISOR_SCIENCE";
          break;
      }
      const advisorImage = document.createElement("div");
      advisorImage.classList.add("quest-advisor-portrait", "absolute", "inset-0", "bg-cover", "bg-no-repeat");
      advisorImage.style.backgroundImage = UI.getIconCSS(advisorType, "CIRCLE_MASK");
      advisorPicContainer.appendChild(advisorImage);
      const advisorTypeIconBg = document.createElement("div");
      advisorTypeIconBg.classList.add(
        "quest-advisor-type-icon-bg",
        "absolute",
        "inset-0",
        "bg-cover",
        "bg-no-repeat"
      );
      advisorPicContainer.appendChild(advisorTypeIconBg);
      const advisorTypeIcon = document.createElement("div");
      advisorTypeIcon.classList.add("quest-advisor-type-icon", "absolute", "inset-0", "bg-cover", "bg-no-repeat");
      advisorTypeIcon.style.backgroundImage = UI.getIconCSS(advisorType, "BADGE");
      advisorPicContainer.appendChild(advisorTypeIcon);
      advisorElement.appendChild(advisorPicContainer);
      const advisorQuoteContainer = document.createElement("div");
      advisorQuoteContainer.classList.add("quest-advisor-quote-container", "relative", "my-2", "mx-4");
      advisorQuoteContainer.classList.toggle("flex-auto", isMobile);
      const advisorQuoteBackground = document.createElement("fxs-inner-frame");
      advisorQuoteBackground.classList.add("quest-advisor-quote-background", "absolute", "size-full");
      const advisorQuote = document.createElement("div");
      advisorQuote.classList.add(
        "quest-advisor-quote",
        "m-3",
        "relative",
        "font-body",
        "text-base",
        "text-accent-2",
        "self-center"
      );
      advisorQuote.innerHTML = Locale.compose(advisor.quote || "");
      advisorQuoteContainer.appendChild(advisorQuoteBackground);
      advisorQuoteContainer.appendChild(advisorQuote);
      const optionDef = advisor.button;
      const caption = Locale.compose(optionDef.text);
      if (caption == void 0 || caption == null) {
        console.error("tutorial-callout: setupOption(): Missing caption");
        continue;
      }
      const advisorButton = document.createElement("fxs-button");
      advisorButton.classList.add("quest-advisor-button", "mx-3", "mb-2", "leading-none", "h-14", "text-center");
      if (optionDef.nextID && QuestTracker.isQuestVictoryInProgress(optionDef.questID)) {
        advisorButton.setAttribute("disabled", "true");
        advisorButton.setAttribute("caption", "LOC_TUTORIAL_QUEST_ALREADY_FOLLOWING");
      } else {
        advisorButton.setAttribute("caption", caption);
        advisorButton.setAttribute("tabindex", "-1");
      }
      advisorButton.addEventListener("action-activate", () => {
        if (optionDef.closes && !this.isClosed) {
          this.selectedAdvisorQuestPath = advisor.type;
          this.nextID = optionDef.nextID;
          this.onAdvisorButtonSelected(optionDef.text, optionDef.pathDesc);
        }
      });
      advisorElement.appendChild(advisorQuoteContainer);
      advisorElement.appendChild(advisorButton);
      advisorsContainer.appendChild(advisorElement);
    }
    const advisorButtons = MustGetElement(".tutorial-quest-panel-advisors", this.Root);
    FocusManager.setFocus(advisorButtons);
  }
  /// Helper
  setHTMLInDivClass(innerHTML, cssClassName) {
    const element = this.Root.querySelector(`.${cssClassName}`);
    if (!element) {
      console.warn("tutorial-callout: setStringInDivClass(): Missing element with '." + cssClassName + "'");
      return;
    }
    element.innerHTML = Locale.stylize(innerHTML);
  }
  setGamepadControlsVisible(isVisible) {
    if (isVisible) {
      NavTray.addOrUpdateGenericBack();
    } else {
      NavTray.clear();
    }
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    const isMobile = UI.getViewExperience() == UIViewExperience.Mobile;
    if (isMobile) {
      if (inputEvent.isCancelInput() || inputEvent.detail.name == "sys-menu") {
        this.close();
      }
    } else if (inputEvent.detail.name.startsWith("camera")) {
      return;
    } else if (inputEvent.detail.name == "sys-menu" || inputEvent.detail.name == "keyboard-escape") {
      this.Root.classList.remove("trigger-nav-help");
      return;
    }
    inputEvent.stopPropagation();
    inputEvent.preventDefault();
  }
  onAdvisorButtonSelected = (pathName, pathDescription) => {
    if (this.data?.advisors.length == 1) {
      this.close();
      return;
    }
    const actionCallback = (action) => {
      if (action == DialogBoxAction.Confirm) {
        this.close();
      }
    };
    const confirmOption = {
      actions: ["accept"],
      label: "LOC_TUTORIAL_CALLOUT_CONTINUE",
      callback: actionCallback
    };
    const cancelCallback = () => {
      actionCallback(DialogBoxAction.Cancel);
    };
    const cancelOption = {
      actions: ["cancel", "keyboard-escape"],
      label: "LOC_TUTORIAL_CALLOUT_GO_BACK",
      callback: cancelCallback
    };
    const options = [confirmOption, cancelOption];
    DialogBoxManager.createDialog_MultiOption({
      body: Locale.compose(
        "LOC_TUTORIAL_QUEST_CONFIRM_BODY",
        pathDescription,
        Locale.compose("LOC_TUTORIAL_QUEST_PATH_ADVISOR", pathName)
      ),
      title: Locale.compose("LOC_TUTORIAL_QUEST_CONFIRM_TITLE", pathName),
      options,
      canClose: false,
      displayQueue: "TutorialManager",
      addToFront: true
    });
  };
  onActiveDeviceTypeChanged(event) {
    if (event.detail && event.detail.gamepadActive != this.gamepadWasActive) {
      this.gamepadWasActive = event.detail.gamepadActive;
      this.setHTMLInDivClass(Locale.compose(this.getContentData() || ""), "tutorial-callout-body-text");
      this.setAdvisors();
      if (UI.getViewExperience() == UIViewExperience.Mobile) {
        this.setGamepadControlsVisible(event.detail?.gamepadActive);
      }
    }
  }
  close() {
    if (this.isClosed) {
      console.error(
        "tutorial-callout: close(): Tutorial callout being closed when already marked closed. id: ",
        this.itemID
      );
    }
    window.dispatchEvent(
      new LowerQuestPanelEvent({
        itemID: this.itemID,
        nextID: this.nextID,
        advisorPath: this.selectedAdvisorQuestPath,
        closed: true
      })
    );
    this.isClosed = true;
  }
}
Controls.define("tutorial-quest-panel", {
  createInstance: TutorialQuestPanel,
  description: "Panel to select a quest path.",
  styles: [styles],
  innerHTML: [content],
  classNames: ["size-full", "relative"],
  tabIndex: -1
});
//# sourceMappingURL=tutorial-quest-panel.js.map

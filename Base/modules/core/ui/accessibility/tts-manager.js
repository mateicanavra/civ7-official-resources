import ContextManager from '../context-manager/context-manager.js';
import '../context-manager/display-queue-manager.js';
import '../dialog-box/manager-dialog-box.chunk.js';
import '../framework.chunk.js';
import '../input/cursor.js';
import '../input/focus-manager.js';
import '../audio-base/audio-support.chunk.js';
import '../views/view-manager.chunk.js';
import '../panel-support.chunk.js';

var TextToSpeechSearchType = /* @__PURE__ */ ((TextToSpeechSearchType2) => {
  TextToSpeechSearchType2[TextToSpeechSearchType2["Hover"] = 0] = "Hover";
  TextToSpeechSearchType2[TextToSpeechSearchType2["Focus"] = 1] = "Focus";
  return TextToSpeechSearchType2;
})(TextToSpeechSearchType || {});
class TtsManagerImpl {
  lastRequest = 0;
  textElement = document.createElement("p");
  textToSpeechOnHoverDelayMs = 1e3;
  textToSpeechOnHoverDelayHandle = null;
  textToSpeechOnHoverTarget = null;
  _isTtsSupported = true;
  _isTextToSpeechOnHoverEnabled = false;
  _isTextToSpeechOnChatEnabled = false;
  extensions = [];
  mouseOverListener = this.handleHover.bind(this);
  get isTtsSupported() {
    return this._isTtsSupported;
  }
  get isTextToSpeechOnHoverEnabled() {
    return this._isTtsSupported && this._isTextToSpeechOnHoverEnabled;
  }
  get isTextToSpeechOnChatEnabled() {
    return this._isTtsSupported && this._isTextToSpeechOnChatEnabled;
  }
  registerWithContextManager() {
    this._isTtsSupported = UI.supportsTextToSpeech();
    if (this._isTtsSupported) {
      ContextManager.registerEngineInputHandler(this);
      window.addEventListener("main-menu-return", this.handleUpdateSettings.bind(this));
      this.handleUpdateSettings();
    }
  }
  handleHover(event) {
    if (event.target) {
      const foundTarget = this.findNearestValidElement(this.reverseScanFromBody(event.target));
      if (this.textToSpeechOnHoverTarget?.deref() == foundTarget) {
        return;
      }
      if (!foundTarget) {
        if (this.textToSpeechOnHoverDelayHandle) {
          window.clearTimeout(this.textToSpeechOnHoverDelayHandle);
          this.textToSpeechOnHoverDelayHandle = null;
        }
        this.textToSpeechOnHoverTarget = null;
        return;
      }
      this.textToSpeechOnHoverTarget = new WeakRef(foundTarget);
      if (this.textToSpeechOnHoverDelayHandle) {
        window.clearTimeout(this.textToSpeechOnHoverDelayHandle);
      }
      this.textToSpeechOnHoverDelayHandle = window.setTimeout(() => {
        const target = this.textToSpeechOnHoverTarget?.deref();
        this.textToSpeechOnHoverDelayHandle = null;
        this.textToSpeechOnHoverTarget = null;
        if (target) {
          this.stopSpeaking();
          this.speakElement(target);
        }
      }, this.textToSpeechOnHoverDelayMs);
    }
  }
  handleInput(event) {
    if (event.detail.status == InputActionStatuses.FINISH) {
      if (event.detail.name == "text-to-speech-keyboard") {
        this.handleSpeakRequest(0 /* Hover */);
      } else if (event.detail.name == "text-to-speech-controller") {
        this.handleSpeakRequest(1 /* Focus */);
      }
    }
    return true;
  }
  handleNavigation(_navigationEvent) {
    return true;
  }
  trySpeakElement(element) {
    const validElement = this.findNearestValidElement(this.reverseScanFromBody(element));
    if (validElement) {
      this.speakElement(validElement);
    }
  }
  handleUpdateSettings() {
    const config = Configuration.getUser();
    if (config.textToSpeechOnHover != this._isTextToSpeechOnHoverEnabled) {
      this._isTextToSpeechOnHoverEnabled = config.textToSpeechOnHover;
      if (this.isTextToSpeechOnHoverEnabled) {
        window.addEventListener("mouseover", this.mouseOverListener, true);
      } else {
        window.removeEventListener("mouseover", this.mouseOverListener, true);
      }
    }
    if (config.textToSpeechOnChat != this._isTextToSpeechOnChatEnabled) {
      this._isTextToSpeechOnChatEnabled = config.textToSpeechOnChat;
    }
    this.textToSpeechOnHoverDelayMs = config.textToSpeechOnHoverDelay;
  }
  handleSpeakRequest(type) {
    const element = type == 0 /* Hover */ ? this.findNearestValidElement(this.queryScanFromBody(":hover")) : this.findNearestValidElement(this.queryScanFromBody(":focus-within"));
    if (element) {
      this.stopSpeaking();
      this.speakElement(element);
    }
  }
  isTextContentElement(element) {
    const tag = element.tagName.toLowerCase();
    switch (tag) {
      case "body":
      case "label":
      case "p":
        return true;
    }
    const role = element.role ?? element.getAttribute("role");
    switch (role) {
      case "alert":
      case "article":
      case "banner":
      case "button":
      case "cell":
      case "columnheader":
      case "comment":
      case "definition":
      case "heading":
      case "input":
      case "listitem":
      case "link":
      case "menuitem":
      case "note":
      case "option":
      case "paragraph":
      case "rowheader":
      case "searchbox":
      case "select":
      case "status":
      case "suggestion":
      case "textbox":
      case "tooltip":
        return true;
    }
    return element.hasAttribute("aria-label") || element.hasAttribute("alt") || element.hasAttribute("data-tooltip-content");
  }
  *queryScanFromBody(query) {
    let element = document.body;
    while (element) {
      yield element;
      element = element.querySelector(query);
    }
  }
  reverseScanFromBody(element) {
    const elements = [];
    while (element && element != document.body) {
      elements.push(element);
      element = element.parentElement;
    }
    return elements.reverse();
  }
  findNearestValidElement(elementList) {
    let nearestElement = null;
    for (const element of elementList) {
      if (element.hasAttribute("aria-hidden")) {
        break;
      }
      if (this.isTextContentElement(element)) {
        nearestElement = element;
      }
    }
    return nearestElement;
  }
  speakElement(element) {
    const foundText = this.findText(element);
    if (foundText != null) {
      if (foundText.length > 0) {
        this.lastRequest = CohtmlSpeechAPI.addSpeechRequest(foundText);
      }
      return true;
    }
    return false;
  }
  isElement(node) {
    return node.nodeType == Node.ELEMENT_NODE;
  }
  isText(node) {
    return node.nodeType == Node.TEXT_NODE;
  }
  registerExtension(ttsExtension) {
    this.extensions.push(ttsExtension);
  }
  getElementInnerText(element) {
    const foundText = [];
    const nodesToSearch = [element];
    while (nodesToSearch.length > 0) {
      const node = nodesToSearch.pop();
      if (!node) {
        continue;
      }
      if (this.isElement(node)) {
        try {
          const style = window.getComputedStyle(node);
          if (node.ariaHidden == "true" || node.getAttribute("aria-hidden") == "true" || style.visibility == "hidden" || style.display == "none") {
            continue;
          }
          const label = node.getAttribute("aria-label") ?? node.ariaLabel;
          if (label != void 0) {
            if (label) {
              foundText.push(label);
            }
            continue;
          }
          for (let i = node?.childNodes.length - 1; i >= 0; --i) {
            nodesToSearch.push(node.childNodes.item(i));
          }
        } catch {
        }
      } else if (this.isText(node)) {
        const text = node.textContent;
        if (text && text.length > 0) {
          foundText.push(text.replaceAll("|", ", "));
        }
      }
    }
    return foundText.join(" ");
  }
  findText(element) {
    const foundText = [];
    const addText = (text) => {
      const hasText = text && text.length > 0;
      if (hasText) {
        const plainText = Locale.plainText(text).toLowerCase();
        this.textElement.innerHTML = plainText;
        const strippedText = this.textElement.textContent;
        if (strippedText) {
          foundText.push(strippedText);
        }
      }
      return hasText;
    };
    if (element == document.body) {
      for (const extension of this.extensions) {
        const foundGlobal = extension.checkGlobal(this, addText);
        return foundGlobal ? foundText.join(". ") : "";
      }
    }
    addText(element.getAttribute("alt")) || addText(element.ariaLabel) || addText(element.ariaValueText) || addText(element.ariaValueNow) || // '|' is commonly used as a divider but it trips up the plain text sanitizer
    addText(this.getElementInnerText(element));
    const tooltipChildren = element.querySelectorAll("[data-tooltip-content]");
    addText(element.getAttribute("data-tooltip-content"));
    if (element.role != "select") {
      for (const tooltipChild of tooltipChildren) {
        addText(tooltipChild.getAttribute("data-tooltip-content"));
      }
    }
    for (const extension of this.extensions) {
      extension.checkElement(this, element, addText);
    }
    return foundText.length == 0 ? null : foundText.join(". ");
  }
  stopSpeaking() {
    if (CohtmlSpeechAPI.isScheduledForSpeakingRequest(this.lastRequest)) {
      CohtmlSpeechAPI.abortCurrentRequest();
      CohtmlSpeechAPI.discardRequest(this.lastRequest);
    }
  }
}
const TtsManager = new TtsManagerImpl();

export { TtsManager };
//# sourceMappingURL=tts-manager.js.map

import { A as Audio } from '../../audio-base/audio-support.chunk.js';
import FocusManager from '../../input/focus-manager.js';
import { N as NavTray } from '../../navigation-tray/model-navigation-tray.chunk.js';
import { P as Panel, A as AnchorType } from '../../panel-support.chunk.js';
import { a as MPFriendsModel } from './model-mp-friends.chunk.js';
import { MustGetElement } from '../../utilities/utilities-dom.chunk.js';
import '../../framework.chunk.js';
import '../../input/action-handler.js';
import '../../input/cursor.js';
import '../../views/view-manager.chunk.js';
import '../../input/input-support.chunk.js';
import '../../utilities/utilities-update-gate.chunk.js';
import '../../utilities/utilities-image.chunk.js';
import '../../utilities/utilities-component-id.chunk.js';
import '../../social-notifications/social-notifications-manager.js';
import '../../utilities/utilities-layout.chunk.js';

const content = "<fxs-frame>\r\n\t<fxs-vslot class=\"rules-container flex flex-auto mt-4 mb-10\">\r\n\t\t<div class=\"flex flex-col items-center -mt-10\">\r\n\t\t\t<div\r\n\t\t\t\tclass=\"font-title text-2xl text-secondary\"\r\n\t\t\t\tdata-l10n-id=\"LOC_UI_FRIENDS_OPEN_SEARCH_TITLE\"\r\n\t\t\t></div>\r\n\t\t\t<div class=\"filigree-divider-h3 w-64\"></div>\r\n\t\t</div>\r\n\t\t<div class=\"flex flex-row justify-between\">\r\n\t\t\t<fxs-textbox\r\n\t\t\t\tclass=\"enter-search-textbox\"\r\n\t\t\t\tmax-length=\"24\"\r\n\t\t\t></fxs-textbox>\r\n\t\t</div>\r\n\t</fxs-vslot>\r\n\r\n\t<div class=\"button-container flex flex-row justify-around\">\r\n\t\t<fxs-button\r\n\t\t\tclass=\"search\"\r\n\t\t\tdisabled=\"true\"\r\n\t\t\tcaption=\"LOC_UI_FRIENDS_SEARCH\"\r\n\t\t\taction-key=\"inline-shell-action-1\"\r\n\t\t></fxs-button>\r\n\t\t<fxs-button\r\n\t\t\tclass=\"cancel\"\r\n\t\t\tcaption=\"LOC_GENERIC_CANCEL\"\r\n\t\t\taction-key=\"inline-cancel\"\r\n\t\t></fxs-button>\r\n\t</div>\r\n</fxs-frame>\r\n";

const styles = "fs://game/core/ui/shell/mp-staging/mp-search.css";

class PanelMPSearch extends Panel {
  cancelButtonListener = () => {
    this.close();
  };
  engineInputListener = (inputEvent) => {
    this.onEngineInput(inputEvent);
  };
  searchButton = null;
  searchTextbox = null;
  constructor(root) {
    super(root);
    this.animateInType = this.animateOutType = AnchorType.RelativeToRight;
    this.enableCloseSound = true;
    this.Root.setAttribute("data-audio-group-ref", "audio-mp-friends-popups");
  }
  executeSearch() {
    if (this.searchTextbox) {
      const value = this.searchTextbox?.getAttribute("value");
      if (value) {
        this.Search(value);
      }
    }
  }
  onAttach() {
    super.onAttach();
    this.Root.addEventListener("engine-input", this.engineInputListener);
    this.searchButton = MustGetElement(".search", this.Root);
    const bgFrameSetOpacity = MustGetElement("fxs-frame", this.Root);
    bgFrameSetOpacity.classList.add("bg-black");
    this.searchButton?.addEventListener("action-activate", () => {
      MPFriendsModel.searching(true);
      this.executeSearch();
    });
    this.searchTextbox = MustGetElement(".enter-search-textbox", this.Root);
    if (this.searchTextbox) {
      this.searchTextbox.setAttribute("placeholder", Locale.compose("LOC_UI_FRIENDS_SEARCH_FIELD"));
      this.searchTextbox.addEventListener("component-value-changed", (event) => {
        this.searchButton?.setAttribute(
          "disabled",
          event.detail.value && event.detail.value != "" ? "false" : "true"
        );
      });
    }
    const cancelButton = this.Root.querySelector(".cancel");
    cancelButton?.addEventListener("action-activate", this.cancelButtonListener);
    MPFriendsModel.searched(false);
  }
  onDetach() {
    this.Root.removeEventListener("engine-input", this.engineInputListener);
    const cancelButton = this.Root.querySelector(".cancel");
    cancelButton?.removeEventListener("action-activate", this.cancelButtonListener);
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    NavTray.clear();
    const rulesContainer = this.Root.querySelector(".rules-container");
    if (rulesContainer) {
      FocusManager.setFocus(rulesContainer);
    }
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  onEngineInput(inputEvent) {
    if (inputEvent.detail.name == "cancel") {
      if (inputEvent.detail.status == InputActionStatuses.START) {
        Audio.playSound("data-audio-primary-button-press");
        return;
      }
    }
    if (inputEvent.detail.name == "shell-action-1") {
      if (inputEvent.detail.status == InputActionStatuses.START) {
        const disableAttribute = this.searchButton?.getAttribute("disabled");
        if (!disableAttribute || disableAttribute != "true") {
          Audio.playSound("data-audio-primary-button-press");
        }
        return;
      }
    }
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    switch (inputEvent.detail.name) {
      case "cancel":
      case "keyboard-escape":
        this.close();
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
        break;
      case "shell-action-1":
        const disableAttribute = this.searchButton?.getAttribute("disabled");
        if (!disableAttribute || disableAttribute != "true") {
          MPFriendsModel.searching(true);
          this.executeSearch();
        }
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
        break;
    }
  }
  Search(userName) {
    Online.Social.searchFriendList(userName);
    MPFriendsModel.searched(true);
    this.close();
  }
}
Controls.define("screen-mp-search", {
  createInstance: PanelMPSearch,
  description: "Quick join screen for multiplayer.",
  classNames: ["mp-search"],
  styles: [styles],
  innerHTML: [content],
  attributes: []
});
//# sourceMappingURL=mp-search.js.map

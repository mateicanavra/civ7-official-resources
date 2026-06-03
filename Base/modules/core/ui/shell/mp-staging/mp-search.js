import { Audio } from '../../audio-base/audio-support.js';
import NavTray from '../../navigation-tray/model-navigation-tray.js';
import Panel, { AnchorType } from '../../panel-support.js';
import MPFriendsModel from './model-mp-friends.js';
import { MustGetElement } from '../../utilities/utilities-dom.js';
import { FocusManager } from '../../../ui-next/services/focus-manager.js';
import content from './mp-search.html.js';
import styles from './mp-search.scss.js';

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
    const bgFrameSetOpacity = MustGetElement("fxs-modal-frame", this.Root);
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
      FocusManager.get().setFocus(rulesContainer);
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

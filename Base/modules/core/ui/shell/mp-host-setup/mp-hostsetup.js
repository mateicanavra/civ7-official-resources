import { FocusManager } from '../../../ui-next/services/focus-manager.js';

class MpHostSetup {
  buttonList = [
    {
      name: "Start Game",
      autofocus: true,
      buttonListener: () => {
        this.onStartGame();
      }
    },
    {
      name: "Back",
      autofocus: false,
      buttonListener: () => {
        this.onBackToMultiplayerMenu();
      }
    }
  ];
  buttonBox;
  constructor() {
    engine.whenReady.then(() => {
      this.onReady();
    });
  }
  onInit() {
  }
  onStartGame() {
    Network.startMultiplayerGame();
  }
  onBackToMultiplayerMenu() {
    Network.leaveMultiplayerGame();
    window.location.href = "fs://game/core/ui/shell/mp-main-menu/page-mp-mainmenu.html";
  }
  onReady() {
    this.buttonBox = document.getElementById("MpButtonBox");
    for (const button of this.buttonList) {
      const newButton = document.createElement("fxs-button");
      this.buttonBox.appendChild(newButton);
      newButton.setAttribute("caption", button.name);
      newButton.addEventListener("action-activate", button.buttonListener);
      if (button.autofocus == true) {
        FocusManager.get().setFocus(newButton);
      }
    }
  }
}
const MultiplayerHostSetup = new MpHostSetup();

export { MultiplayerHostSetup as default };
//# sourceMappingURL=mp-hostsetup.js.map

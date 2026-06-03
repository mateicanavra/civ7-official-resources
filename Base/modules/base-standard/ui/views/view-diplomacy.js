import { Audio } from '../../../core/ui/audio-base/audio-support.js';
import { InputEngineEventName } from '../../../core/ui/input/input-support.js';
import { InterfaceMode } from '../../../core/ui/interface-modes/interface-modes.js';
import NavTray from '../../../core/ui/navigation-tray/model-navigation-tray.js';
import ViewManager, { UISystem } from '../../../core/ui/views/view-manager.js';
import DiplomacyManager, { DiplomacyInputPanel } from '../diplomacy/diplomacy-manager.js';
import { SetIsPlotTooltipVisible } from '../../ui-next/tooltips/plot-tooltip/plot-tooltip.js';

class DiplomacyView {
  canPlayExitSound = true;
  getName() {
    return "Diplomacy";
  }
  getInputContext() {
    return InputContext.Shell;
  }
  getHarnessTemplate() {
    return "diplomacy";
  }
  enterView() {
    this.canPlayExitSound = true;
    Audio.playSound("data-audio-showing", "leader-panel");
    SetIsPlotTooltipVisible(false);
  }
  exitView() {
    SetIsPlotTooltipVisible(true);
  }
  addEnterCallback(_func) {
  }
  addExitCallback(_func) {
  }
  /**
   * @returns true if still live, false if input should stop.
   */
  readInputEvent(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return true;
    }
    if (inputEvent.detail.name == "cancel" || inputEvent.detail.name == "keyboard-escape" || inputEvent.detail.name == "mousebutton-right") {
      if (this.canPlayExitSound) {
        Audio.playSound("data-audio-hiding", "leader-panel");
        this.canPlayExitSound = false;
      }
    }
    if (inputEvent.type != InputEngineEventName) {
      console.warn(
        `VM: Attempt to handle engine input event failed since '${inputEvent.type}' is not '${InputEngineEventName}'.`
      );
      return true;
    }
    let isLive = true;
    const screens = this.getCurrentScreens();
    for (const screen of screens) {
      if (screen instanceof ComponentRoot) {
        if (screen.component instanceof DiplomacyInputPanel) {
          isLive = screen.component.handleInput(inputEvent);
        }
        if (!isLive) {
          return false;
        }
      }
    }
    const panels = this.getCurrentPanels();
    for (const panel of panels) {
      if (panel instanceof ComponentRoot) {
        if (panel.component instanceof DiplomacyInputPanel) {
          isLive = panel.component.handleInput(inputEvent);
        }
        if (!isLive) {
          return false;
        }
      }
    }
    return true;
  }
  handleNavigation(navigationEvent) {
    let isLive = true;
    const screens = this.getCurrentScreens();
    for (const screen of screens) {
      if (screen instanceof ComponentRoot) {
        if (screen.component instanceof DiplomacyInputPanel) {
          isLive = screen.component.handleNavigation(navigationEvent);
        }
        if (!isLive) {
          return false;
        }
      }
    }
    const panels = this.getCurrentPanels();
    for (const panel of panels) {
      if (panel instanceof ComponentRoot) {
        if (panel.component instanceof DiplomacyInputPanel) {
          isLive = panel.component.handleNavigation(navigationEvent);
        }
        if (!isLive) {
          return false;
        }
      }
    }
    return true;
  }
  getRules() {
    return [
      { name: "harness", type: UISystem.HUD, visible: "true" },
      { name: "city-banners", type: UISystem.World, visible: "false" },
      { name: "unit-info-panel", type: UISystem.World, visible: "false" },
      { name: "plot-icons", type: UISystem.World, visible: "false" },
      { name: "plot-vfx", type: UISystem.World, visible: "false" },
      { name: "units", type: UISystem.Events, selectable: false },
      { name: "unit-flags", type: UISystem.World, visible: "false" },
      { name: "small-narratives", type: UISystem.World, visible: "false" },
      { name: "world", type: UISystem.Events, selectable: false },
      { name: "world-input", type: UISystem.World, selectable: false },
      { name: "district-health-bars", type: UISystem.World, visible: "false" }
    ];
  }
  handleReceiveFocus() {
    ViewManager.getHarness()?.classList.add("trigger-nav-help");
    const panels = this.getCurrentPanels();
    panels.forEach((panel) => {
      panel.dispatchEvent(new CustomEvent("view-receive-focus"));
    });
  }
  handleLoseFocus() {
    ViewManager.getHarness()?.classList.remove("trigger-nav-help");
    NavTray.clear();
  }
  getCurrentPanels() {
    let diplomacyPanels;
    const interMode = InterfaceMode.getCurrent();
    if (DiplomacyManager.isFirstMeetDiplomacyOpen) {
      return document.querySelectorAll(".panel-diplomacy-actions");
    }
    switch (interMode) {
      case "INTERFACEMODE_DIPLOMACY_HUB":
        diplomacyPanels = document.querySelectorAll(".panel-diplomacy-actions");
        break;
      case "INTERFACEMODE_PEACE_DEAL":
        diplomacyPanels = document.querySelectorAll(".panel-diplomacy-peace-deal");
        break;
      case "INTERFACEMODE_CALL_TO_ARMS":
        diplomacyPanels = document.querySelectorAll(".screen-diplomacy-call-to-arms");
        break;
      case "INTERFACEMODE_DIPLOMACY_PROJECT_REACTION":
        diplomacyPanels = document.querySelectorAll(".panel-diplomacy-project-reaction");
        break;
      case "INTERFACEMODE_DIPLOMACY_DIALOG":
        if (document.querySelector("panel-diplomacy-hub")?.classList.contains("hidden")) {
          diplomacyPanels = document.querySelectorAll(".panel-diplomacy-project-reaction");
        } else {
          diplomacyPanels = document.querySelectorAll("panel-diplomacy-hub");
        }
        break;
      default:
        diplomacyPanels = document.querySelectorAll("panel-diplomacy-hub");
        break;
    }
    return diplomacyPanels;
  }
  getCurrentScreens() {
    return document.querySelectorAll(".screen-diplomacy-target-select");
  }
}
ViewManager.addHandler(new DiplomacyView());

export { DiplomacyView };
//# sourceMappingURL=view-diplomacy.js.map

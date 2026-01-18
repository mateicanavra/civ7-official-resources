import ActionHandler, { ActiveDeviceTypeChangedEventName } from '../input/action-handler.js';
import { Icon } from '../utilities/utilities-image.chunk.js';

class FxsFontIcon extends HTMLElement {
  refreshId;
  inputContextChangedHandle = null;
  activeDeviceChangedListener = this.onActiveDeviceChange.bind(this);
  hasDeviceChangedListener = false;
  constructor() {
    super();
    this.refreshId = 0;
  }
  connectedCallback() {
    if (this.isConnected) {
      this.refreshIcon();
    }
  }
  disconnectedCallback() {
    if (this.inputContextChangedHandle) {
      this.inputContextChangedHandle.clear();
      this.inputContextChangedHandle = null;
    }
    if (this.hasDeviceChangedListener) {
      window.removeEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceChangedListener);
      this.hasDeviceChangedListener = false;
    }
    if (this.refreshId != 0) {
      cancelAnimationFrame(this.refreshId);
      this.refreshId = 0;
    }
  }
  attributeChangedCallback(name, _oldValue, newValue) {
    if (_oldValue != newValue) {
      if (name == "data-icon-id" || name == "data-icon-context" || name == "data-icon-size") {
        if (this.refreshId == 0) {
          this.refreshId = requestAnimationFrame(() => {
            this.refreshIcon();
            this.refreshId = 0;
          });
        }
      }
    }
  }
  refreshIcon() {
    this.innerHTML = "";
    const id = this.getAttribute("data-icon-id");
    const context = this.getAttribute("data-icon-context");
    if (id) {
      let iconURL = "";
      if (context == "action") {
        if (this.inputContextChangedHandle == null) {
          this.inputContextChangedHandle = engine.on(
            "InputContextChanged",
            this.onActiveContextChanged,
            this
          );
        }
        if (!this.hasDeviceChangedListener) {
          window.addEventListener(ActiveDeviceTypeChangedEventName, this.activeDeviceChangedListener);
          this.hasDeviceChangedListener = true;
        }
        iconURL = Icon.getIconFromActionName(id, ActionHandler.deviceType) ?? "";
      } else {
        iconURL = UI.getIconURL(id, "FontIcon");
        if (!iconURL) {
          iconURL = UI.getIconURL(id);
        }
      }
      if (iconURL) {
        const el = document.createElement("img");
        el.src = iconURL;
        //! MAGIC NUMBER WARNING!
        el.style.height = "1.5em";
        el.style.width = "1.5em";
        this.appendChild(el);
      }
    }
  }
  onActiveContextChanged() {
    this.refreshIcon();
  }
  onActiveDeviceChange() {
    this.refreshIcon();
  }
}
customElements.define("fxs-font-icon", FxsFontIcon);
//# sourceMappingURL=fxs-font-icon.chunk.js.map

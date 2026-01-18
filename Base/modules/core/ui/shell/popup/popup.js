const content = "<div class=\"popup-content font-body text-left\">\r\n\t<div class=\"popup-shadow\"></div>\r\n\t<div class=\"popup-bg\"></div>\r\n\t<div class=\"popup-pattern\"></div>\r\n\t<div class=\"popup-frame\"></div>\r\n\t<div class=\"popup-body\">\r\n\t\t<div class=\"popup-body-text-1\"></div>\r\n\t\t<div class=\"popup-divider\"></div>\r\n\t\t<div class=\"popup-body-text-2\"></div>\r\n\t</div>\r\n\t<div class=\"popup-overlay\"></div>\r\n</div>\r\n";

const styles = "fs://game/core/ui/shell/popup/popup.css";

class Popup extends Component {
  constructor(root) {
    super(root);
  }
  onAttach() {
    this.setPosition(this.Root.getAttribute("position") || "bottom-right", "");
    this.setText1(this.Root.getAttribute("text1") || "");
    this.setText2(this.Root.getAttribute("text2") || "");
    super.onAttach();
  }
  onDetach() {
    super.onDetach();
  }
  onAttributeChanged(name, oldValue, newValue) {
    switch (name) {
      case "position": {
        this.setPosition(newValue, oldValue);
        return;
      }
      case "text1": {
        this.setText1(newValue);
        return;
      }
      case "text2": {
        this.setText2(newValue);
        return;
      }
    }
    super.onAttributeChanged(name, oldValue, newValue);
  }
  setText1(text) {
    const textElement = this.Root.querySelector(".popup-body-text-1");
    if (textElement) {
      textElement.setAttribute("data-l10n-id", text);
    }
  }
  setText2(title) {
    const textElement = this.Root.querySelector(".popup-body-text-2");
    if (textElement) {
      textElement.setAttribute("data-l10n-id", title);
    }
  }
  setPosition(newPosition, oldPosition) {
    if (oldPosition && oldPosition.length > 0) {
      this.Root.classList.remove(oldPosition);
    }
    this.Root.classList.add(newPosition);
  }
}
function displayPopup(text1, text2, position) {
  const tooltipArea = document.querySelector("#popups");
  if (tooltipArea) {
    const popup = document.createElement("pop-up");
    popup.setAttribute("text1", text1);
    popup.setAttribute("text2", text2);
    popup.setAttribute("position", position);
    tooltipArea.appendChild(popup);
    return popup;
  }
  return null;
}
Controls.define("pop-up", {
  createInstance: Popup,
  description: "Box to display simple information.",
  styles: [styles],
  innerHTML: [content],
  attributes: [],
  tabIndex: -1
});

export { displayPopup };
//# sourceMappingURL=popup.js.map

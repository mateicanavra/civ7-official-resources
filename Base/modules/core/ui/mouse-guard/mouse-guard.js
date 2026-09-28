import styles from './mouse-guard.scss.js';

class MouseGuard extends Component {
  onReceiveFocus() {
  }
  //override
  onLoseFocus() {
  }
  //override
}
Controls.define("mouse-guard", {
  createInstance: MouseGuard,
  description: "Used by ContextManager request for capturing mouse behavior from leaking down.",
  classNames: ["mouse-guard", "fixed", "inset-0", "pointer-events-auto"],
  styles: [styles]
});
//# sourceMappingURL=mouse-guard.js.map

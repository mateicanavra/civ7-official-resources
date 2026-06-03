import { createContext, createComponent } from '../../vendor/solid-js/dist/solid.js';
import { createMutable } from '../../vendor/solid-js/store/dist/store.js';
import { render } from '../../vendor/solid-js/web/dist/web.js';
import { Focus } from '../../ui/input/focus-support.js';

const registeredLegacySolidComponents = /* @__PURE__ */ new Map();
class SolidAdapterContextProvider {
  constructor(rootElement) {
    this.rootElement = rootElement;
  }
}
const SolidAdapterContext = createContext();
class FxsSolidComponent extends Component {
  dispose = null;
  onActivatableFocusEventListener = this.onFocus.bind(this);
  reactiveAttrs;
  children = null;
  onAttach() {
    super.onAttach();
    this.Root.addEventListener("focus", this.onActivatableFocusEventListener);
    if (this.dispose) {
      this.dispose();
      this.dispose = null;
      if (this.children) {
        for (const c of this.children) {
          this.Root.append(c);
        }
      }
      this.children = null;
    }
    if (this.children == null) {
      this.children = [];
      for (const c of this.Root.childNodes) {
        this.children.push(c);
      }
    }
    const props = registeredLegacySolidComponents.get(this.Root.tagName);
    if (props) {
      const attrs = { ...props.attrs };
      for (const attr in attrs) {
        if (this.Root.hasAttribute(attr)) {
          attrs[attr] = this.Root.getAttribute(attr);
        }
      }
      this.reactiveAttrs = createMutable(attrs);
      const renderSolidComponent = () => props.renderFunction(this.reactiveAttrs, this.Root);
      this.dispose = render(
        () => createComponent(SolidAdapterContext.Provider, {
          value: new SolidAdapterContextProvider(this.Root),
          get children() {
            return renderSolidComponent();
          }
        }),
        this.Root
      );
    } else {
      console.error(
        `Could not resolve solid component name based on this element's tag name - ${this.Root.tagName}.`
      );
    }
  }
  onAttributeChanged(_name, _oldValue, _newValue) {
    if (this.reactiveAttrs) {
      this.reactiveAttrs[_name] = _newValue;
    }
  }
  onDetach() {
    super.onDetach();
    if (this.dispose) {
      const dispose = this.dispose;
      this.dispose = null;
      dispose();
      if (this.children) {
        for (const c of this.children) {
          this.Root.append(c);
        }
      }
      this.children = null;
    }
  }
  onFocus() {
    if (this.Root.hasChildNodes()) {
      Focus.setContextAwareFocus(this.Root.firstChild, this.Root);
    }
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    this.onFocus();
  }
}
function defineLegacyComponent(name, options, renderFunction) {
  if (!renderFunction) {
    throw new Error("defineLegacyComponent - A render function must be defined!");
  }
  const ranking = typeof options.calleeURLOrPriority == "number" ? options.calleeURLOrPriority : options.calleeURLOrPriority ? Modding.getModRankByURL(options.calleeURLOrPriority) : 1;
  const componentAttrs = options.attrs ? Object.getOwnPropertyNames(options.attrs).map((attr) => ({ name: attr })) : [];
  registeredLegacySolidComponents.set(name.toUpperCase(), { renderFunction, ...options });
  Controls.define(name, {
    createInstance: FxsSolidComponent,
    classNames: options.classNames,
    skipPostOnAttach: true,
    priority: ranking >= 0 ? ranking : 0,
    attributes: componentAttrs,
    tabIndex: options?.tabIndex,
    initializeImmediately: options?.initializeImmediately
  });
}

export { SolidAdapterContext, SolidAdapterContextProvider, defineLegacyComponent };
//# sourceMappingURL=fxs-solid-component.js.map

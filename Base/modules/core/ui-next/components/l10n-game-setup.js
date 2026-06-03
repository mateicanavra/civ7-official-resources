import { template, insert, use, spread } from '../../vendor/solid-js/web/dist/web.js';
import { createContext, useContext, getOwner, mergeProps } from '../../vendor/solid-js/dist/solid.js';
import { ComponentRegistry } from '../services/component-registry.js';

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`);
class GameSetupStringCache {
  stringCache = {};
  composeCache = {};
  stylizeCache = {};
  resolve(handle) {
    let value = this.stringCache[handle];
    if (!value) {
      value = GameSetup.resolveString(handle) ?? "";
      this.stringCache[handle] = value;
    }
    return value;
  }
  compose(handle) {
    let value = this.composeCache[handle];
    if (!value) {
      value = Locale.compose(this.resolve(handle));
      this.composeCache[handle] = value;
    }
    return value;
  }
  stylize(handle) {
    let value = this.stylizeCache[handle];
    if (!value) {
      value = Locale.stylize(this.resolve(handle));
      this.stylizeCache[handle] = value;
    }
    return value;
  }
}
const GameSetupStringCacheContext = createContext(new GameSetupStringCache());
function useGameSetupStringCacheContext() {
  const context = useContext(GameSetupStringCacheContext);
  if (!context) {
    throw new Error("Unable to resolve L10GameSetupCacheContext");
  }
  return context;
}
const Compose = (props) => {
  const context = useGameSetupStringCacheContext();
  return (() => {
    var _el$ = _tmpl$();
    insert(_el$, () => context.compose(props.handle));
    return _el$;
  })();
};
const Stylize = (props) => {
  const context = useGameSetupStringCacheContext();
  const owner = getOwner();
  return (() => {
    var _el$2 = _tmpl$();
    use((el) => {
      el.owner = owner;
      if (typeof props.ref === "function") props.ref(el);
    }, _el$2);
    spread(_el$2, mergeProps(props, {
      get innerHTML() {
        return context.stylize(props.handle);
      }
    }), false, false);
    return _el$2;
  })();
};
const L10nGameSetup = {
  /**
   * Compose game setup text using the Locale.Compose.
   * Generate text given a localization-syntax string
   * ```tsx
   * <L10n.Compose handle={param.name} />
   * ```
   * Default implementation: {@link Compose}
   * @param {GameSetupLocaleProps} props See {@link GameSetupLocaleProps} for a full list of properties
   *
   * Commonly Used Properties:
   * @param {GameSetupStringHandle} props.handle The game setup string handle to compose.
   */
  Compose: ComponentRegistry.register("Compose", Compose),
  /**
   * Compose text using the Locale.Stylize.
   * Convert a string or localized text containing stylized markup into HTML formatted text.
   * ```tsx
   * <L10n.Stylize handle={param.description} />
   * ```
   * Default implementation: {@link Stylize}
   * @param {GameSetupStylizeProps} props See {@link GameSetupStylizeProps} for a full list of properties
   *
   * Commonly Used Properties:
   * @param {GameSetupStringHandle} props.handle The  game setup string handle to stylize.
   */
  Stylize: ComponentRegistry.register("Stylize", Stylize)
};

export { GameSetupStringCache, GameSetupStringCacheContext, L10nGameSetup, useGameSetupStringCacheContext };
//# sourceMappingURL=l10n-game-setup.js.map

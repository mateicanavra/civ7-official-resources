import '../../vendor/solid-js/web/dist/web.js';
import { createContext, useContext, createMemo, createComponent } from '../../vendor/solid-js/dist/solid.js';

var TriggerType = /* @__PURE__ */ ((TriggerType2) => {
  TriggerType2[TriggerType2["Activate"] = 0] = "Activate";
  TriggerType2[TriggerType2["Focus"] = 1] = "Focus";
  TriggerType2[TriggerType2["Blur"] = 2] = "Blur";
  return TriggerType2;
})(TriggerType || {});
class TriggerActivationContextProvider {
  constructor(host, parent, name) {
    this.host = host;
    this.parent = parent;
    this.name = name;
  }
  trigger(type, source) {
    this.host?.onTrigger(this.name(), type, source);
    this.parent?.trigger(type, source);
  }
}
const TriggerActivationContext = createContext();
function createTrigger(context) {
  const triggerComponent = (props) => {
    const hostContext = useContext(context);
    const parentContext = useContext(TriggerActivationContext);
    const reactiveName = createMemo(() => props.name);
    const triggerContextProvider = new TriggerActivationContextProvider(hostContext, parentContext, reactiveName);
    return createComponent(TriggerActivationContext.Provider, {
      value: triggerContextProvider,
      get children() {
        return props.children;
      }
    });
  };
  return triggerComponent;
}

export { TriggerActivationContext, TriggerActivationContextProvider, TriggerType, createTrigger };
//# sourceMappingURL=trigger.js.map

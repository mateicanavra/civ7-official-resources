import { template, insert, use, spread } from '../../vendor/solid-js/web/dist/web.js';
import { createMemo, createSignal, createEffect, on, createContext, useContext, onMount, mergeProps, createComponent } from '../../vendor/solid-js/dist/solid.js';
import { TabContextProvider, TabContext } from './tab.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="flex flex-row text-base ml-38 mt-8">STEP&nbsp;<!>&nbsp;of&nbsp;</div>`), _tmpl$2 = /* @__PURE__ */ template(`<div></div>`);
var ScreenFlowStepType = /* @__PURE__ */ ((ScreenFlowStepType2) => {
  ScreenFlowStepType2[ScreenFlowStepType2["Normal"] = 0] = "Normal";
  ScreenFlowStepType2[ScreenFlowStepType2["Hub"] = 1] = "Hub";
  ScreenFlowStepType2[ScreenFlowStepType2["Start"] = 2] = "Start";
  return ScreenFlowStepType2;
})(ScreenFlowStepType || {});
class ScreenFlowContextProvider extends TabContextProvider {
  screens = [];
  onClose;
  onStart;
  _currentScreen;
  _startScreen;
  _isStartActive;
  _hubScreen;
  _wasHubVisited;
  _setWasHubVisited;
  _isHubActive;
  _currentStep;
  _numSteps;
  get isStartActive() {
    return this._isStartActive;
  }
  get isHubActive() {
    return this._isHubActive;
  }
  get wasHubVisited() {
    return this._wasHubVisited;
  }
  get currentStep() {
    return this._currentStep;
  }
  get numSteps() {
    return this._numSteps;
  }
  constructor(screens, onClose, onStart) {
    super();
    const steps = [];
    for (const screen of screens) {
      const step = screen.step;
      if (step && step.length > 0 && !steps.some((s) => s == step)) {
        steps.push(step);
      }
    }
    this.screens = screens;
    this.onClose = onClose;
    this.onStart = onStart;
    this._currentScreen = createMemo(() => this.screens.find((s) => s.name == this.active()?.name));
    this._startScreen = screens.find((s) => s.type == 2 /* Start */) ?? screens[0];
    this._isStartActive = createMemo(() => this.active()?.name == this._startScreen?.name);
    this._hubScreen = screens.find((s) => s.type == 1 /* Hub */);
    const [wasHubVisited, setWasHubisited] = createSignal(!!this._hubScreen?.name && this._startScreen.name == this._hubScreen?.name);
    this._wasHubVisited = wasHubVisited;
    this._setWasHubVisited = setWasHubisited;
    this._isHubActive = createMemo(() => !!this._hubScreen?.name && this.active()?.name == this._hubScreen?.name);
    this._currentStep = createMemo(() => steps.findIndex((s) => s == this._currentScreen()?.step) + 1);
    this._numSteps = createMemo(() => steps.length);
    createEffect(on(() => this.active(), () => this._setWasHubVisited((wasVisited) => wasVisited || this.isHubActive())));
  }
  activatePrev() {
    const prev = this._currentScreen()?.prev;
    if (this._wasHubVisited() && !this.isHubActive()) {
      return this.activate(this._hubScreen?.name ?? "");
    } else if (this.isStartActive() && !this._wasHubVisited()) {
      this.close();
    } else if (prev) {
      if (prev == "START") {
        this.start();
      } else if (prev == "CLOSE") {
        this.close();
      } else {
        return this.activate(prev);
      }
    } else {
      const index = this.screens.findIndex((s) => s.name == this._currentScreen()?.name);
      if (index >= 0) {
        const prevIndex = index - 1;
        if (index < 0) {
          this.close();
        } else {
          return this.activate(this.screens[prevIndex].name);
        }
      }
    }
    return true;
  }
  activateNext() {
    const next = this._currentScreen()?.next;
    if (this._wasHubVisited() && !this.isHubActive()) {
      return this.activate(this._hubScreen?.name ?? "");
    } else if (this.isHubActive()) {
      this.start();
    } else if (next) {
      if (next == "START") {
        this.start();
      } else if (next == "CLOSE") {
        this.close();
      } else {
        return this.activate(next);
      }
    } else {
      const index = this.screens.findIndex((s) => s.name == this._currentScreen()?.name);
      if (index >= 0) {
        const nextIndex = index + 1;
        if (index >= this.screens.length) {
          this.start();
        } else {
          return this.activate(this.screens[nextIndex].name);
        }
      }
    }
    return true;
  }
  clearHub() {
    this._setWasHubVisited(false);
  }
  close() {
    this.onClose?.(this.active()?.name ?? this._startScreen.name);
  }
  start() {
    this.onStart?.(this.active()?.name ?? this._startScreen.name);
  }
}
const ScreenFlowContext = createContext();
function useScreenFlowContext() {
  const context = useContext(ScreenFlowContext);
  if (!context) {
    throw new Error("");
  }
  return context;
}
const ScreenFlowStepCount = () => {
  const context = useScreenFlowContext();
  return (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild, _el$4 = _el$2.nextSibling, _el$3 = _el$4.nextSibling;
    _el$.style.setProperty("color", "white");
    insert(_el$, () => context.currentStep(), _el$4);
    insert(_el$, () => context.numSteps(), null);
    return _el$;
  })();
};
const ScreenFlowTab = (props) => {
  const contextProvider = new ScreenFlowContextProvider(props.screens, props.onClose, props.onStart);
  createEffect(() => {
    props.onTabChanged?.(contextProvider.active());
  });
  createEffect(() => {
    if (props.defaultTab) {
      contextProvider.setDefaultTab(props.defaultTab);
    }
  });
  onMount(() => {
    if (props.contextRef) {
      props.contextRef(contextProvider);
    }
  });
  return (() => {
    var _el$5 = _tmpl$2();
    var _ref$ = props.ref;
    typeof _ref$ === "function" ? use(_ref$, _el$5) : props.ref = _el$5;
    spread(_el$5, mergeProps(props, {
      get ["class"]() {
        return props.class ?? "flex flex-row";
      },
      "data-name": "Tab"
    }), false, true);
    insert(_el$5, createComponent(TabContext.Provider, {
      value: contextProvider,
      get children() {
        return createComponent(ScreenFlowContext.Provider, {
          value: contextProvider,
          get children() {
            return props.children;
          }
        });
      }
    }));
    return _el$5;
  })();
};

export { ScreenFlowContext, ScreenFlowContextProvider, ScreenFlowStepCount, ScreenFlowStepType, ScreenFlowTab, useScreenFlowContext };
//# sourceMappingURL=screen-flow.js.map

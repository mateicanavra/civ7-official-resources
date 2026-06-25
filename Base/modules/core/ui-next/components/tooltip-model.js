import { createSignal, onCleanup, createEffect, on, createMemo, createSelector } from '../../vendor/solid-js/dist/solid.js';
import { Audio } from '../../ui/audio-base/audio-support.js';
import { ContextManagerEvents } from '../../ui/context-manager/context-manager.js';
import { InterfaceModeChangedEventName } from '../../ui/interface-modes/interface-modes.js';
import { TriggerType } from './trigger.js';
import { FocusManager } from '../services/focus-manager.js';
import { IsMouseActive, IsHybridActive, IsTouchActive, IsKeyboardActive } from '../services/input.js';
import { ModelRegistry, ModelLifecycle } from '../services/model-registry.js';
import { createEngineEvent } from '../utilities/game-core-utilities.js';
import { createWindowEventSignal } from '../utilities/solid-utilities.js';

function createTooltipModel() {
  const [targets, setTargets] = createSignal({});
  const [active, setActive] = createSignal([]);
  const [locked, setLocked] = createSignal();
  const [tooltipsHidden, setTooltipsHidden] = createSignal(false);
  const [touchPress, setTouchPress] = createSignal(false);
  const [childTooltipTable, setChildTooltipTable] = createSignal({});
  const [autoLockTooltip, setAutoLockTooltip] = createSignal();
  let autoLockTimeoutHandle;
  let savedInputContext;
  let inputContextChangedWhileOwned = false;
  const focusManager = FocusManager.get();
  const ignoredInputContextTransitions = [];
  const queueIgnoredInputContextTransition = (oldContext, newContext) => {
    if (oldContext === newContext) {
      return;
    }
    ignoredInputContextTransitions.push({ oldContext, newContext });
  };
  const shouldIgnoreInputContextChange = (contextData) => {
    const ignoredTransitionIndex = ignoredInputContextTransitions.findIndex(
      (transition) => transition.oldContext === contextData.oldContext && transition.newContext === contextData.newContext
    );
    if (ignoredTransitionIndex < 0) {
      return false;
    }
    ignoredInputContextTransitions.splice(ignoredTransitionIndex, 1);
    return true;
  };
  const claimInputContext = () => {
    if (savedInputContext !== void 0) {
      return;
    }
    ignoredInputContextTransitions.length = 0;
    savedInputContext = Input.getActiveContext();
    inputContextChangedWhileOwned = false;
    if (savedInputContext !== InputContext.Shell) {
      queueIgnoredInputContextTransition(savedInputContext, InputContext.Shell);
      Input.setActiveContext(InputContext.Shell);
    }
  };
  const releaseInputContext = () => {
    if (savedInputContext === void 0) {
      return;
    }
    const contextToRestore = savedInputContext;
    const shouldRestoreInputContext = !inputContextChangedWhileOwned;
    savedInputContext = void 0;
    inputContextChangedWhileOwned = false;
    if (!shouldRestoreInputContext) {
      return;
    }
    const currentContext = Input.getActiveContext();
    if (currentContext !== contextToRestore) {
      queueIgnoredInputContextTransition(currentContext, contextToRestore);
      Input.setActiveContext(contextToRestore);
    }
  };
  const onInputContextChanged = (contextData) => {
    if (shouldIgnoreInputContextChange(contextData)) {
      return;
    }
    if (savedInputContext !== void 0) {
      inputContextChangedWhileOwned = true;
    }
  };
  engine.on("InputContextChanged", onInputContextChanged);
  onCleanup(() => {
    engine.off("InputContextChanged", onInputContextChanged);
    releaseInputContext();
  });
  createEffect(
    on(
      locked,
      (currentLocked, previousLocked) => {
        if (previousLocked === void 0 && currentLocked !== void 0) {
          claimInputContext();
        } else if (previousLocked !== void 0 && currentLocked === void 0) {
          releaseInputContext();
        }
      },
      { defer: true }
    )
  );
  const contextManagerChanged = createEngineEvent(ContextManagerEvents.OnChanged);
  const interfaceModeChanged = createWindowEventSignal(InterfaceModeChangedEventName);
  createEffect(
    on(
      [contextManagerChanged, interfaceModeChanged],
      () => {
        unlockAll();
      },
      { defer: true }
    )
  );
  const isAutolockAvailable = createMemo(() => {
    return Configuration.getUser().tooltipAutolockEnabled && UI.isMouseAvailable() && !IsTouchActive() && (IsMouseActive() || IsHybridActive());
  });
  const startAutoLock = (tooltipName, durationMs) => {
    stopAutoLock();
    setAutoLockTooltip(tooltipName);
    autoLockTimeoutHandle = setTimeout(() => {
      const currentTooltipName = autoLockTooltip();
      if (!currentTooltipName) {
        stopAutoLock();
        return;
      }
      const currentActive = active();
      const topActive = currentActive.length > 0 ? currentActive[currentActive.length - 1] : void 0;
      const isAutolockInputActive = IsMouseActive() || IsHybridActive();
      if (!isAutolockInputActive || IsTouchActive() || topActive !== currentTooltipName || locked() === currentTooltipName || tooltipsHidden()) {
        stopAutoLock();
        return;
      }
      const childTooltipListAccesor = childTooltipTable()[currentTooltipName];
      if (!childTooltipListAccesor || childTooltipListAccesor().length <= 0) {
        stopAutoLock();
        return;
      }
      setLocked(currentTooltipName);
      Audio.playSound("data-audio-activate", "tooltip-nested");
      stopAutoLock();
    }, durationMs);
  };
  const tryStartAutoLock = (tooltipName) => {
    if (!isAutolockAvailable()) {
      return;
    }
    if (locked() === tooltipName || tooltipsHidden()) {
      return;
    }
    const timeToLockMs = Configuration.getUser().tooltipAutolock;
    if (timeToLockMs <= 0) {
      setLocked(tooltipName);
      Audio.playSound("data-audio-activate", "tooltip-nested");
      return;
    }
    startAutoLock(tooltipName, timeToLockMs);
  };
  const stopAutoLock = () => {
    if (autoLockTimeoutHandle !== void 0) {
      clearTimeout(autoLockTimeoutHandle);
      autoLockTimeoutHandle = void 0;
    }
    setAutoLockTooltip(void 0);
  };
  const getTarget = (name) => {
    const target = targets()[name];
    if (target instanceof WeakRef) {
      return target.deref();
    } else {
      return target;
    }
  };
  const register = (name, childListAccesor) => {
    setChildTooltipTable((current) => ({
      ...current,
      [name]: childListAccesor
    }));
    return () => unregister(name);
  };
  const unregister = (name) => {
    stopAutoLock();
    const activeIdx = active().indexOf(name);
    if (name == locked()) {
      setLocked(void 0);
    }
    if (activeIdx !== -1) {
      setActive((current) => current.slice(0, activeIdx));
    }
    setChildTooltipTable((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
  };
  const unlock = () => {
    stopAutoLock();
    const currentActive = active();
    const lockedTooltip = currentActive[currentActive.length - 1];
    if (lockedTooltip === locked()) {
      let nextTooltip = "";
      if (currentActive.length > 1) {
        if (IsKeyboardActive() || IsMouseActive()) {
          setActive((current) => current.slice(0, -1));
        }
        nextTooltip = currentActive[currentActive.length - 2];
        setLocked(nextTooltip);
      } else {
        setLocked(void 0);
      }
      let nextTarget = getTarget(lockedTooltip);
      if (!nextTarget && nextTooltip) {
        nextTarget = getTarget(nextTooltip);
      }
      if (nextTarget instanceof HTMLElement) {
        focusManager.setFocus(nextTarget);
      } else if (nextTarget == null) {
        console.error(
          `TooltipModel.unlock: Unable to focus tooltip "${lockedTooltip}" because its target is missing.`
        );
      }
    }
  };
  const pop = () => {
    stopAutoLock();
    const currentActive = active();
    if (currentActive.length === 0) return;
    const topTooltip = currentActive[currentActive.length - 1];
    setActive((current) => current.slice(0, -1));
    setTargets((current) => {
      const next = { ...current };
      delete next[topTooltip];
      return next;
    });
    if (IsTouchActive()) {
      const nextActive = currentActive.slice(0, -1);
      if (nextActive.length > 1) {
        setLocked(nextActive[nextActive.length - 2]);
      } else {
        setLocked(void 0);
      }
    }
  };
  const unlockAll = () => {
    stopAutoLock();
    const currentActive = active();
    if (currentActive.length > 0) {
      const firstTooltipTarget = getTarget(currentActive[0]);
      if (firstTooltipTarget && firstTooltipTarget instanceof HTMLElement) {
        focusManager.setFocus(firstTooltipTarget);
      }
    }
    setActive([]);
    setLocked(void 0);
    setTargets({});
  };
  const lock = () => {
    stopAutoLock();
    const currentActive = active();
    if (currentActive.length == 1 && tooltipsHidden()) {
      setTooltipsHidden(false);
      setLocked(void 0);
      return true;
    }
    const currentTarget = currentActive.length > 0 ? getTarget(currentActive[currentActive.length - 1]) : void 0;
    const isCurrentActiveLocked = isLocked(currentActive[currentActive.length - 1]);
    if (isCurrentActiveLocked) {
      if (active().length <= 1) {
        setLocked(void 0);
        if (currentTarget instanceof HTMLElement) {
          focusManager.setFocus(currentTarget);
        }
      } else {
        setTooltipsHidden(false);
        unlock();
      }
      return true;
    }
    if (currentActive.length > 0 && currentTarget) {
      const currentTooltipName = currentActive[currentActive.length - 1];
      const childListAccessor = childTooltipTable()[currentTooltipName];
      if (!childListAccessor || childListAccessor().length <= 0) {
        if (currentActive.length == 1) {
          setTooltipsHidden(true);
        }
        return false;
      }
      setLocked(currentTooltipName);
      Audio.playSound("data-audio-activate", "tooltip-nested");
      return true;
    }
    return false;
  };
  const lockedTooltips = createMemo(() => {
    const result = /* @__PURE__ */ new Set();
    const currentLocked = locked();
    const activeTooltips = active();
    if (currentLocked !== void 0) {
      result.add(currentLocked);
    }
    for (let i = 0; i < activeTooltips.length - 1; i++) {
      result.add(activeTooltips[i]);
    }
    return result;
  });
  const isLocked = createSelector(lockedTooltips, (name, lockedTooltips2) => {
    return lockedTooltips2.has(name ?? "");
  });
  const isActive = createSelector(active, (name, activeTooltips) => {
    return activeTooltips.includes(name);
  });
  const isAutoLocking = (name) => {
    const autoLockingTooltip = autoLockTooltip();
    return autoLockingTooltip !== void 0 && autoLockingTooltip === name;
  };
  const gotTouchPress = (status) => {
    setTouchPress(status);
  };
  const triggerTooltip = (name, type, triggerTarget) => {
    if (isLocked(name)) {
      return;
    }
    if (name === autoLockTooltip()) {
      stopAutoLock();
    }
    if (type === TriggerType.Focus || type === TriggerType.Activate) {
      if (!isActive(name)) {
        let shouldNest;
        let isRaisingSiblingTooltip = false;
        const currentActive = active();
        if (currentActive.length === 0) {
          shouldNest = false;
        } else {
          const currentTop = currentActive[currentActive.length - 1];
          const currentTopList = childTooltipTable()[currentTop]();
          if (currentActive.length > 1 && !isLocked(currentTop)) {
            const previousTop = currentActive[currentActive.length - 2];
            const previousTopList = childTooltipTable()[previousTop]();
            isRaisingSiblingTooltip = previousTopList.includes(name);
          }
          shouldNest = isRaisingSiblingTooltip || currentTopList.includes(name) && (isLocked(currentTop) || IsTouchActive());
        }
        if (!shouldNest) {
          setActive([name]);
        } else {
          if (isRaisingSiblingTooltip) {
            setActive((current) => [...current.slice(0, -1), name]);
          } else {
            setActive((current) => [...current, name]);
          }
          tryStartAutoLock(name);
        }
      }
      if (IsTouchActive() || type === TriggerType.Activate) {
        if (active().length > 1) {
          const tooltipToLock = type === TriggerType.Activate ? name : active()[active().length - 2];
          const childListAccessor = childTooltipTable()[tooltipToLock];
          if (childListAccessor && childListAccessor().length > 0) {
            setLocked(tooltipToLock);
          }
        }
      }
      if (triggerTarget) {
        setTargets((current) => ({
          ...current,
          [name]: triggerTarget instanceof HTMLElement ? new WeakRef(triggerTarget) : triggerTarget
        }));
      }
    } else if (type === TriggerType.Blur) {
      setTargets((current) => {
        const next = { ...current };
        delete next[name];
        return next;
      });
      setActive((current) => current.filter((n) => n !== name));
    }
  };
  return {
    active,
    targets,
    locked,
    isAutolockAvailable,
    childTooltipTable,
    register,
    unlock,
    gotTouchPress,
    pop,
    getTarget,
    unlockAll,
    isAutoLocking,
    lock,
    isActive,
    isLocked,
    tooltipsHidden,
    onTrigger: (name, type, triggerTarget) => {
      triggerTooltip(name, type, triggerTarget);
    },
    touchPress,
    triggerTooltip
  };
}
const TooltipModel = ModelRegistry.register("TooltipModel", ModelLifecycle.Singleton, createTooltipModel);

export { TooltipModel };
//# sourceMappingURL=tooltip-model.js.map

import { createSignal, createMemo, useContext, createEffect, on, onMount, onCleanup } from '../../vendor/solid-js/dist/solid.js';
import { Audio } from '../../ui/audio-base/audio-support.js';
import { buildFocusChain, FocusContext, currentSolidFocus, rootFocus } from './focus.js';
import { ModelRegistry, ModelLifecycle } from './model-registry.js';

function createFocusManager() {
  const [enabledDebugFocus, setEnableDebugFocus] = createSignal(false);
  const [activeElement, setActiveElement] = createSignal(document.activeElement);
  const [currentFocus, setCurrentFocus] = createSignal(document.body);
  const [pendingFocus, setPendingFocus] = createSignal(null);
  const [isPendingFocusSolid, setIsPendingFocusSolid] = createSignal(false);
  const [pendingFocusFrameCount, setPendingFocusFrameCount] = createSignal(0);
  const [lockedFocusTarget, setLockedFocusTarget] = createSignal();
  const [isGamepadActive, setIsGamePadActive] = createSignal(
    Input.getActiveDeviceType() == InputDeviceType.Controller
  );
  const isFocusActive = createMemo(() => activeElement() == currentFocus() && currentFocus() != document.body);
  const isWorldFocused = createMemo(() => currentFocus() == document.body);
  const isFocusLocked = createMemo(() => lockedFocusTarget() != null);
  const focusChain = createMemo(() => buildFocusChain(currentFocus()));
  function handleDeviceChanged(deviceType) {
    setIsGamePadActive(deviceType == InputDeviceType.Controller);
    if (isGamepadActive()) {
      realizeFocus(false);
    }
  }
  const solidRootFocus = useContext(FocusContext);
  createEffect(() => {
    globalThis.debugCurrentFocus = new WeakRef(currentFocus());
  });
  createEffect(
    on(
      () => currentSolidFocus(),
      (element) => {
        if (element) {
          setFocusInternal(element, false);
        }
      }
    )
  );
  onMount(() => {
    window.addEventListener("blur", handleFocusChange, true);
    window.addEventListener("focus", handleFocusChange, true);
    engine.on("input-source-changed", handleDeviceChanged);
  });
  onCleanup(() => {
    window.removeEventListener("blur", handleFocusChange, true);
    window.addEventListener("focus", handleFocusChange, true);
    engine.off("input-source-changed", handleDeviceChanged);
  });
  function handleFocusChange() {
    setActiveElement(document.activeElement);
  }
  function getFocusChildOf(parent) {
    let index = -1;
    const focusChainLength = focusChain().length;
    for (let i = 0; i < focusChainLength; ++i) {
      if (focusChain()[i].deref() == parent) {
        index = i;
        break;
      }
    }
    index = index - 1;
    if (index < 0) {
      return null;
    }
    while (index > 0) {
      const el = focusChain()[index].deref();
      if (el && el.hasAttribute("tabindex")) {
        return el;
      }
      index--;
    }
    return focusChain().length > 0 ? focusChain()[0].deref() ?? null : null;
  }
  function toLogString(target) {
    const element = target ?? currentFocus();
    return `name=${element?.nodeName ?? ""}, tagName=${element?.tagName ?? ""}, className=${element?.className ?? ""}`;
  }
  function lockFocus(target, who, why) {
    console.log(`FM: Focus lock requested by '${who}' on ${toLogString(target)}, because '${why}'.`);
    if (isFocusLocked()) {
      console.error(`FM: Denying focus lock because already locked by ${lockedFocusTarget()?.who}.`);
      return false;
    }
    if (target instanceof HTMLElement) {
      setLockedFocusTarget({ previous: currentFocus(), who });
    } else {
      console.error(`FM: Denying focus lock because target ${target} is not an HTMLElement.`);
      return false;
    }
    setPendingFocus(target);
    window.requestAnimationFrame(checkPendingFocus);
    return true;
  }
  function unlockFocus(target, who) {
    console.log(`FM: Focus unlock by '${who}' on ${toLogString(target)}.`);
    if (!isFocusLocked()) {
      console.error(`FM: Attempting to unlock focus by ${who} but it's already unlocked.`);
      return false;
    }
    const oldWho = lockedFocusTarget()?.who;
    if (oldWho != who) {
      console.error(`FM: Fail to unlock focus by ${who} as it was locked by ${oldWho}`);
      return false;
    }
    if (target != currentFocus()) {
      console.error(
        `FM: Fail to unlock focus by ${who} because the target '${toLogString(target)}' mismatches the currentFocus '${toLogString(currentFocus())}'.`
      );
      return false;
    }
    setPendingFocus(lockedFocusTarget()?.previous ?? null);
    setLockedFocusTarget(void 0);
    window.requestAnimationFrame(checkPendingFocus);
    return true;
  }
  function setFocus(target) {
    setFocusInternal(target, target.hasAttribute("data-focus-context-name"));
  }
  function setFocusInternal(target, applySolidFocus) {
    if (target == null || target == void 0) {
      console.error("FM: Attempt to set focus to a null/undefined type.");
      return;
    }
    if (target == document.body) {
      console.warn(
        "FM: Explicitly setting focus to the document.body (aka: 'the world').  Use worldFocused() instead!"
      );
    } else if (target.hasAttribute("tabindex") == false) {
      if (target instanceof ComponentRoot == false || target.isInitialized) {
        console.error("FM: Attempt to set focus on element without tabindex. element: ", toLogString(target));
      }
    }
    if (isFocusLocked()) {
      if (target instanceof HTMLElement) {
        if (target != currentFocus()) {
          console.warn(
            `FM: Focus is locked. Previous focus '${toLogString(lockedFocusTarget().previous)}' overriden by set focus call for '${toLogString(target)}'.`
          );
          setLockedFocusTarget((l) => ({ previous: target, who: l?.who ?? "" }));
        }
      } else {
        console.error(
          `FM: Focus is locked and attempt to overwrite with non HTML element: '${toLogString(target)}'.`
        );
      }
      return;
    }
    if (target.isSameNode(pendingFocus())) {
      console.warn("FM: Multiple attempts to set focus, currently pending. target: ", toLogString(target));
    } else if (pendingFocus()) {
      if (!pendingFocus().contains(target)) {
        console.warn(
          `FM: Setting focus to '${toLogString(target)}' and a pending focus '${toLogString(pendingFocus())}' will never be realized.`
        );
      }
    }
    setPendingFocus(null);
    setIsPendingFocusSolid(false);
    if (!target.isSameNode(currentFocus())) {
      if (target instanceof HTMLHtmlElement) {
        setCurrentFocus(document.body);
      } else if (target instanceof HTMLElement) {
        if (readyForFocus(target)) {
          setCurrentFocus(target);
        } else {
          if (pendingFocus()) {
            console.error(
              "FM: Overriding a pending focus target with a new one. old: ",
              toLogString(pendingFocus()),
              ",  new: ",
              toLogString(target)
            );
          }
          clearFocus();
          setIsPendingFocusSolid(target.hasAttribute("data-focus-context-name"));
          setPendingFocus(target);
          window.requestAnimationFrame(checkPendingFocus);
          return;
        }
      } else {
        console.warn(
          "FM: Attempt to setFocus on non-HTML element; wasn't expecting that: " + toLogString(target)
        );
        return;
      }
      realizeFocus(applySolidFocus);
    }
  }
  function readyForFocus(element) {
    return element.isConnected && element.hasAttribute("tabindex");
  }
  function handleFocusLost() {
    console.warn("FM: Needing to walk up focus chain to to disconnect currentFocus: ", toLogString(currentFocus()));
    for (let i = focusChain.length - 2; i >= 0; --i) {
      const el = focusChain()[i].deref();
      if (el && readyForFocus(el)) {
        setCurrentFocus(el);
        break;
      }
    }
    setCurrentFocus(document.body);
  }
  function realizeFocus(applySolidFocus) {
    let curFocus = currentFocus();
    if (!curFocus || !curFocus.isConnected) {
      handleFocusLost();
      curFocus = currentFocus();
    }
    if (!curFocus) {
      return;
    }
    if (isGamepadActive()) {
      const prevFocus = curFocus;
      curFocus.focus();
      const handleSetFocus = () => {
        if (applySolidFocus) {
          solidRootFocus.focusDescendant(currentFocus(), false);
        }
        if (prevFocus == curFocus) {
          const audioId = curFocus.getAttribute("data-audio-focus-ref") || "data-audio-focus";
          const audioGroup = curFocus.getAttribute("data-audio-group-ref") || "audio-base";
          Audio.playSound(audioId, audioGroup);
        }
      };
      if (document.activeElement != curFocus) {
        waitForLayout(() => {
          if (!curFocus.isConnected || curFocus != currentFocus()) {
            return;
          }
          curFocus.focus();
          if (document.activeElement == curFocus) {
            handleSetFocus();
          } else {
            if (currentFocus() == curFocus) {
              console.log(
                `Despite waiting 2 frames, could not set focus on <${curFocus.tagName} #${curFocus.id} - ${curFocus.className}>.`
              );
            }
          }
        });
      } else {
        handleSetFocus();
      }
      if (enabledDebugFocus()) {
        curFocus.classList.add("debug-visualize-focus");
      }
    } else {
      curFocus.blur();
      if (enabledDebugFocus()) {
        curFocus.classList.remove("debug-visualize-focus");
      }
    }
  }
  function checkPendingFocus() {
    if (!pendingFocus()) {
      return;
    }
    if (readyForFocus(pendingFocus())) {
      setCurrentFocus(pendingFocus());
      realizeFocus(isPendingFocusSolid());
      setPendingFocus(null);
      setIsPendingFocusSolid(false);
      setPendingFocusFrameCount(0);
    } else {
      setPendingFocusFrameCount((count) => count + 1);
      if (pendingFocusFrameCount() == 10) {
        console.warn(
          "FM: Over 10 frames have been requested for element to receive focus: ",
          toLogString(pendingFocus())
        );
      }
      if (pendingFocusFrameCount() == 30) {
        console.error(
          `FM: Forcing focus re-evaluation as a pending focus element has been waiting over ${pendingFocusFrameCount()} frames for focus: ${toLogString(pendingFocus())}`
        );
        setPendingFocus(null);
        setPendingFocusFrameCount(0);
        if (isPendingFocusSolid()) {
          setIsPendingFocusSolid(false);
          rootFocus.focusCurrent();
        } else {
          setFocus(document.body);
        }
      }
      window.requestAnimationFrame(checkPendingFocus);
    }
  }
  function clearFocus(targetElement = null) {
    if (currentFocus() == null) {
      console.error("FM: Clear focus but focus is null!");
      return;
    }
    if (currentFocus() == document.body && activeElement() == document.body) {
      return;
    }
    if (isFocusLocked()) {
      console.warn(
        `FM: Denying clearFocus('${targetElement ? toLogString(targetElement) : ""}') because focus is locked by ${lockedFocusTarget()?.who}.`
      );
      return;
    }
    if (targetElement != null) {
      if (!currentFocus().isConnected) {
        console.error(
          "FM: Attempt to clear focus with an element and current focus is set to a disconnected DOM node. current: ",
          toLogString(currentFocus()),
          ", target: ",
          toLogString(targetElement)
        );
        console.warn("FM: Will be clearing focus regardless of targetElement to prevent lock up.");
        return;
      } else {
        if (currentFocus() != targetElement && !targetElement.contains(currentFocus())) {
          if (targetElement.querySelector(":focus") == null) {
            return;
          }
        }
      }
    }
    currentFocus()?.blur();
    if (enabledDebugFocus()) {
      currentFocus().classList.remove("debug-visualize-focus");
    }
    setCurrentFocus(document.body);
  }
  return {
    activeElement,
    currentFocus,
    setFocus,
    clearFocus,
    isFocusActive,
    isWorldFocused,
    lockFocus,
    unlockFocus,
    isFocusLocked,
    getFocusChildOf,
    setEnableDebugFocus,
    realizeFocus,
    toLogString
  };
}
const FocusManager = ModelRegistry.register("FocusManager", ModelLifecycle.Singleton, createFocusManager);

export { FocusManager };
//# sourceMappingURL=focus-manager.js.map

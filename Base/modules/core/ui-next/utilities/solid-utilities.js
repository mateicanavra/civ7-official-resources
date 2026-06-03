import { createSignal, createEffect, onMount, createRoot, createMemo, onCleanup, on } from '../../vendor/solid-js/dist/solid.js';

function createArraySignal(defaultValue = []) {
  const [value, setValue] = createSignal(defaultValue, { equals: () => false });
  const mutator = (mutator2) => {
    mutator2(value());
    setValue(value());
  };
  return [value, mutator];
}
function createPropsRefSignal(propsRef) {
  const [value, setValue] = createSignal();
  createEffect(() => propsRef?.(value()));
  return [value, setValue];
}
function createLayoutComplete() {
  const [layoutComplete, setLayoutComplete] = createSignal(false);
  onMount(() => requestAnimationFrame(() => requestAnimationFrame(() => setLayoutComplete(true))));
  return layoutComplete;
}
function useRenderMount(action) {
  onMount(() => requestAnimationFrame(() => requestAnimationFrame(action)));
}
function createDisposableMemo(fn, initialValue) {
  let disposer;
  let value;
  createRoot((dispose) => {
    disposer = dispose;
    value = createMemo((v) => fn(v), initialValue);
  });
  return [value, disposer];
}
function createPolledSignal(fn, intervalMs) {
  const [value, setValue] = createSignal(fn(void 0));
  let timerHandle = void 0;
  onMount(() => {
    timerHandle = window.setInterval(() => {
      setValue(fn);
    }, intervalMs);
  });
  function cleanUp() {
    if (timerHandle) {
      window.clearInterval(timerHandle);
      timerHandle = void 0;
    }
  }
  onCleanup(() => cleanUp());
  return [value, cleanUp];
}
function createAnimationSignal(animationDurationMs, autoStart = false) {
  let lastAnimationTime = 0;
  const [animationTimeElapsed, setAnimationTimeElapsed] = createSignal(0);
  const [isAnimating, setIsAnimating] = createSignal(false);
  createEffect(
    on(
      () => isAnimating(),
      (shouldStart) => {
        if (shouldStart) {
          setAnimationTimeElapsed(0);
          requestAnimationFrame((time) => {
            lastAnimationTime = time;
            if (isAnimating()) {
              requestAnimationFrame(animate);
            }
          });
        }
      }
    )
  );
  function animate(timestamp) {
    if (isAnimating()) {
      const timeDelta = timestamp - lastAnimationTime;
      setAnimationTimeElapsed((t) => t + timeDelta);
      if (animationDurationMs && animationTimeElapsed() >= animationDurationMs()) {
        setIsAnimating(false);
      } else {
        requestAnimationFrame(animate);
      }
    }
    lastAnimationTime = timestamp;
  }
  if (autoStart) {
    setIsAnimating(true);
  }
  onCleanup(() => setIsAnimating(false));
  return [animationTimeElapsed, isAnimating, setIsAnimating];
}
function createElementEventSignal(element, eventName) {
  const [event, setEvent] = createSignal();
  const listener = (event2) => setEvent(() => event2);
  element.addEventListener(eventName, listener);
  onCleanup(() => element?.removeEventListener(eventName, listener));
  return event;
}
function createWindowEventSignal(eventName) {
  const [event, setEvent] = createSignal();
  const listener = (event2) => setEvent(() => event2);
  window.addEventListener(eventName, listener);
  onCleanup(() => window.removeEventListener(eventName, listener));
  return event;
}
function createDebouncedSignal(intervalMs, initialValue) {
  const [value, setValue] = createSignal(initialValue);
  const [debouncedValue, setDebouncedValue] = createSignal(initialValue);
  const isDebouncing = createMemo(() => value() != debouncedValue());
  let timeoutId;
  createEffect(
    on(
      () => value(),
      (value2) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = window.setTimeout(() => {
          setDebouncedValue(() => value2);
        }, intervalMs);
      }
    )
  );
  onCleanup(() => clearTimeout(timeoutId));
  return [debouncedValue, setValue, isDebouncing, value];
}
function useWindowListener(type, listener, options) {
  if (typeof window !== "undefined") {
    window.addEventListener(type, listener, options);
    onCleanup(() => {
      window.removeEventListener(type, listener, options);
    });
  }
}

export { createAnimationSignal, createArraySignal, createDebouncedSignal, createDisposableMemo, createElementEventSignal, createLayoutComplete, createPolledSignal, createPropsRefSignal, createWindowEventSignal, useRenderMount, useWindowListener };
//# sourceMappingURL=solid-utilities.js.map

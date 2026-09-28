import { template, use, spread, insert } from '../../../core/vendor/solid-js/web/dist/web.js';
import { createSignal, useContext, splitProps, createMemo, createEffect, mergeProps } from '../../../core/vendor/solid-js/dist/solid.js';
import { createStore } from '../../../core/vendor/solid-js/store/dist/store.js';
import { useAudio } from '../../../core/ui-next/services/audio-support.js';
import { AudioGroupContext } from '../../../core/ui-next/services/audio.js';
import { ComponentRegistry } from '../../../core/ui-next/services/component-registry.js';
import { registerHotkey, registerNavTray } from '../../../core/ui-next/services/hotkey.js';

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`);
const GamepadTrayItemProviderComponent = (props) => {
  const [root, setRoot] = createSignal();
  const [args, setArgs] = createStore([]);
  const audioContext = useContext(AudioGroupContext);
  const audioTrigger = useAudio();
  const [localProps, divProps] = splitProps(props, ["name", "items", "enabled"]);
  const enabled = createMemo(() => localProps.enabled ?? (() => true));
  createEffect(() => {
    const result = [];
    localProps.items().forEach((item) => {
      result.push({
        hotkeyArgs: () => [item.hotkeyAction, enabled(), item.onActivate],
        navTrayArgs: () => [item.hotkeyAction, enabled(), item.navTrayText]
      });
    });
    setArgs(result);
  });
  createEffect(() => {
    if (!root()) {
      return;
    }
    args.forEach((arg) => {
      registerHotkey(root(), arg.hotkeyArgs);
      registerNavTray(root(), arg.navTrayArgs);
    });
  });
  function triggerAudioIfAttributeNotDefined(eventName, attributeName) {
    if (!root()?.hasAttribute(attributeName)) {
      audioTrigger(localProps.name, eventName);
    }
  }
  const onEngineInput = (inputEvent) => {
    const isStart = inputEvent.detail.status == InputActionStatuses.START;
    const isFinish = inputEvent.detail.status == InputActionStatuses.FINISH;
    if (!isStart && !isFinish) {
      return;
    }
    let handleActivate = void 0;
    if (localProps.items().length > 0) {
      const item = localProps.items().find((trayItem) => trayItem.hotkeyAction === inputEvent.detail.name);
      if (item) {
        handleActivate = item.onActivate;
      }
    }
    if (handleActivate) {
      if (!enabled()()) {
        if (isStart) {
          audioContext().playSound("data-audio-error-press", root());
          triggerAudioIfAttributeNotDefined("pressError", "data-audio-error-press");
        }
      } else {
        if (isStart) {
          audioContext().playSound("data-audio-press", root());
          triggerAudioIfAttributeNotDefined("press", "data-audio-press");
        } else {
          audioContext().playSound("data-audio-activate", root());
          triggerAudioIfAttributeNotDefined("activate", "data-audio-activate");
          handleActivate?.();
          inputEvent.preventDefault();
          inputEvent.stopPropagation();
        }
      }
    }
  };
  return (() => {
    var _el$ = _tmpl$();
    use(setRoot, _el$);
    spread(_el$, mergeProps(divProps, {
      get ["data-name"]() {
        return localProps.name;
      },
      "on:engine-input": onEngineInput
    }), false, true);
    insert(_el$, () => props.children);
    return _el$;
  })();
};
const GamepadTrayItemProvider = ComponentRegistry.register({
  name: "GamepadTrayItemProvider",
  createInstance: GamepadTrayItemProviderComponent
});

export { GamepadTrayItemProvider };
//# sourceMappingURL=gamepad-tray-item-provider.js.map

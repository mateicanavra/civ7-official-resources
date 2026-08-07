import { template, use, spread, insert } from '../../vendor/solid-js/web/dist/web.js';
import { createMemo, useContext, createSignal, onMount, onCleanup, mergeProps, createComponent } from '../../vendor/solid-js/dist/solid.js';
import { InputEngineEventName } from '../../ui/input/input-support.js';
import { TriggerActivationContext, TriggerType } from './trigger.js';
import { useAudio } from '../services/audio-support.js';
import { AudioGroupContext } from '../services/audio.js';
import { ComponentRegistry } from '../services/component-registry.js';
import { isFocusable } from '../services/focus.js';
import { registerHotkey, registerNavTray, HotkeyIconContext } from '../services/hotkey.js';
import { IsControllerActive } from '../services/input.js';
import { useVfx } from '../services/ui-vfx-support.js';
import { createPropsRefSignal } from '../utilities/solid-utilities.js';

var _tmpl$ = /* @__PURE__ */ template(`<div></div>`);
const PROTECTED_IMPORTS = [isFocusable, registerHotkey, registerNavTray];
const FEEDBACK_LOW = 20;
const FEEDBACK_HIGH = 20;
const FEEDBACK_DURATION = 100;
const EMPTY_ACTIVATABLE_AUDIO = {
  group: "",
  onActivate: "",
  onPress: "",
  onError: "",
  onFocus: ""
};
const ActivatableComponent = (props) => {
  const audioComponentName = createMemo(() => {
    return props.audioComponentAlias ?? props.name ?? "Activatable";
  });
  const vfxComponentName = createMemo(() => {
    return props.vfxComponentAlias ?? props.name ?? "Activatable";
  });
  const audioTrigger = useAudio();
  const vfxTrigger = useVfx();
  function triggerUiSFX(eventName, attributeName) {
    if (!root()?.hasAttribute(attributeName)) {
      audioTrigger(audioComponentName(), eventName);
    } else {
      audioContext().playSound(attributeName, root());
    }
  }
  function triggerUiVFX(eventName) {
    const vfxPathAttributeData = root()?.getAttribute("data-vfx-path");
    const rects = root()?.getClientRects();
    if (rects == void 0 || rects.length == 0) {
      return;
    }
    const rect = rects[0];
    if (!vfxPathAttributeData) {
      vfxTrigger(vfxComponentName(), rect, eventName);
    } else {
      const vfx = useVfx(vfxPathAttributeData);
      vfx(eventName, rect);
    }
  }
  const audioContext = useContext(AudioGroupContext);
  const triggerContext = useContext(TriggerActivationContext);
  const actionButton = createMemo(() => props.actionKey ?? "accept");
  const hotkeyIcon = createMemo(() => props.hotkeyAction ?? actionButton());
  const [root, setRoot] = createPropsRefSignal(() => props.ref);
  const [isPressed, setIsPressed] = createSignal(false);
  const isHidden = createMemo(() => IsControllerActive() && !!props.navTrayText && props.navTrayText.length > 0);
  const isDisabled = createMemo(() => props.disabled);
  const hotkeyIconProvider = {
    disabled: isDisabled,
    actionName: hotkeyIcon
  };
  const onMouseEnter = (event) => {
    triggerUiSFX("focus", "data-audio-focus");
    triggerUiVFX("focus");
    props.onMouseEnter?.(event);
  };
  const onFocus = () => {
    if (props.isFeedbackEnabled) {
      Input.triggerForceFeedback(FEEDBACK_LOW, FEEDBACK_HIGH, FEEDBACK_DURATION);
    }
  };
  const onTouchComplete = (inputEvent) => {
    if (inputEvent.detail.name == "touch-complete") {
      setIsPressed(false);
    }
  };
  onMount(() => {
    window.addEventListener(InputEngineEventName, onTouchComplete, true);
  });
  onCleanup(() => {
    window.removeEventListener(InputEngineEventName, onTouchComplete, true);
  });
  const onEngineInput = (inputEvent) => {
    const isStart = inputEvent.detail.status == InputActionStatuses.START;
    const isFinish = inputEvent.detail.status == InputActionStatuses.FINISH;
    if (!isStart && !isFinish) {
      return;
    }
    if (inputEvent.detail.name == "touch-touch") {
      setIsPressed(true);
      if (props.disabled) {
        triggerUiSFX("pressError", "data-audio-error-press");
        triggerUiVFX("pressError");
      } else {
        triggerUiSFX("press", "data-audio-press");
        triggerUiVFX("press");
      }
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
      return;
    }
    if (inputEvent.detail.name == "mousebutton-left" || inputEvent.detail.name == actionButton() || inputEvent.detail.name == "touch-tap" || inputEvent.detail.name == "keyboard-enter") {
      if (props.disabled) {
        if (isStart) {
          triggerUiSFX("pressError", "data-audio-error-press");
          triggerUiVFX("pressError");
          inputEvent.stopPropagation();
          inputEvent.preventDefault();
        }
      } else {
        if (isStart) {
          triggerUiSFX("press", "data-audio-press");
          triggerUiVFX("press");
        } else {
          activate();
        }
        inputEvent.stopPropagation();
        inputEvent.preventDefault();
      }
    } else {
      props["on:engine-input"]?.(inputEvent);
    }
  };
  function activate() {
    props.onActivate?.();
    triggerUiSFX("activate", "data-audio-activate");
    triggerUiVFX("activate");
    if (!props.disableTrigger) {
      triggerContext?.trigger(TriggerType.Activate, root());
    }
  }
  return (() => {
    var _el$ = _tmpl$();
    use(registerNavTray, _el$, () => [props.hotkeyAction, () => props.disabled != true, props.navTrayText]);
    use(registerHotkey, _el$, () => [props.hotkeyAction, () => props.disabled != true, activate]);
    use(isFocusable, _el$, () => [!props.disableFocus, props.autoFocus]);
    use(setRoot, _el$);
    spread(_el$, mergeProps(props, {
      get role() {
        return props.role ?? "button";
      },
      get ["class"]() {
        return `pointer-events-auto ${props.class ?? ""}`;
      },
      get classList() {
        return {
          ...props.classList,
          disabled: props.disabled,
          "cursor-not-allowed": props.disabled && !props.suppressPointerChanges,
          "cursor-pointer": !props.disabled && !props.suppressPointerChanges,
          pressed: isPressed(),
          hidden: isHidden()
        };
      },
      get tabIndex() {
        return props.disableFocus ? void 0 : props.tabIndex ?? -1;
      },
      get ["data-audio-group-ref"]() {
        return props.audio?.group;
      },
      get ["data-audio-press-ref"]() {
        return props.audio?.onPress;
      },
      get ["data-audio-activate-ref"]() {
        return props.audio?.onActivate;
      },
      get ["data-audio-error-press-ref"]() {
        return props.audio?.onError;
      },
      get ["data-audio-focus-ref"]() {
        return props.audio?.onFocus;
      },
      get ["data-name"]() {
        return props.name ?? "Activatable";
      },
      "data-activatable": "true",
      "on:focus": onFocus,
      "onMouseEnter": onMouseEnter,
      "on:engine-input": onEngineInput
    }), false, true);
    insert(_el$, createComponent(HotkeyIconContext.Provider, {
      value: hotkeyIconProvider,
      get children() {
        return props.children;
      }
    }));
    return _el$;
  })();
};
const Activatable = ComponentRegistry.register("Activatable", ActivatableComponent);

export { Activatable, EMPTY_ACTIVATABLE_AUDIO, PROTECTED_IMPORTS };
//# sourceMappingURL=activatable.js.map

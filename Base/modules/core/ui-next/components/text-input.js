import { template, use, addEventListener, setAttribute, insert, className, delegateEvents } from '../../vendor/solid-js/web/dist/web.js';
import { useContext, createSignal, createMemo, createEffect, createRenderEffect } from '../../vendor/solid-js/dist/solid.js';
import { FxsTextboxValidateVirtualKeyboard, TextBoxTextEditStopEvent } from '../../ui/components/fxs-textbox.js';
import { useAudio } from '../services/audio-support.js';
import { AudioGroupContext } from '../services/audio.js';
import { ComponentRegistry } from '../services/component-registry.js';
import { FocusManager } from '../services/focus-manager.js';
import { isFocusable } from '../services/focus.js';
import { registerHotkey } from '../services/hotkey.js';
import { IsControllerActive } from '../services/input.js';
import { createPropsRefSignal } from '../utilities/solid-utilities.js';

var _tmpl$ = /* @__PURE__ */ template(`<div><input type=text class="fxs-textbox py-1 px-1\\.5 flex-auto border-1 border-primary-1 hover\\:border-secondary focus\\:border-secondary transition-border-color bg-accent-6"data-name=text-input data-isinput=true></div>`);
const TextInputComponent = (props) => {
  const audioContext = useContext(AudioGroupContext);
  const [root, setRoot] = createPropsRefSignal(() => props.ref);
  const [isFocused, setIsFocused] = createSignal(false);
  const [validatedValue, setValidatedValue] = createSignal("", {
    equals: () => false
  });
  const audioTrigger = useAudio();
  const enabled = createMemo(() => !(props.disabled ?? false));
  function triggerUiSFX(eventName, attributeName) {
    if (!root()?.hasAttribute(attributeName)) {
      audioTrigger("TextInput", eventName);
    } else {
      audioContext().playSound(attributeName, root());
    }
  }
  createEffect(() => {
    setValidatedValue(props.value?.());
  });
  createEffect(() => {
    props.setIsEditing?.(isFocused);
  });
  function onVirtualKeyboardTextEntered(text) {
    const input = root();
    if (!input) {
      return;
    }
    let value = UI.getIMEConfirmationValueLocation() == IMEConfirmationValueLocation.Element ? input.value : text.data;
    if (input.hasAttribute("max-length")) {
      const maxLength = Number.parseInt(input.getAttribute("max-length") ?? "-1");
      if (maxLength > 0 && value.length > maxLength) {
        value = value.substring(0, maxLength);
      }
    }
    updateValue(value);
    input.dispatchEvent(new FxsTextboxValidateVirtualKeyboard({
      value
    }));
    clearVirtualKeyboardCallbacks();
    input.dispatchEvent(new TextBoxTextEditStopEvent(true));
  }
  function onVirtualKeyboardTextCanceled() {
    clearVirtualKeyboardCallbacks();
    root()?.dispatchEvent(new TextBoxTextEditStopEvent(false));
  }
  function clearVirtualKeyboardCallbacks() {
    engine.off("IMEValidated", onVirtualKeyboardTextEntered);
    engine.off("IMECanceled", onVirtualKeyboardTextCanceled);
  }
  function onActivate() {
    triggerUiSFX("activate", "data-audio-activate");
    if (UI.canDisplayKeyboard() && props.enableVirtualKeyboard) {
      engine.on("IMEValidated", onVirtualKeyboardTextEntered);
      engine.on("IMECanceled", onVirtualKeyboardTextCanceled);
      UI.displayKeyboard(root()?.value ?? "", root()?.type == "password", root()?.maxLength ?? -1);
    }
    if (IsControllerActive()) {
      switch (UI.getVirtualKeyboardType()) {
        case UIVirtualKeyboardType.None:
        case UIVirtualKeyboardType.Inline:
          if (root() !== void 0) {
            FocusManager.get().setFocus(root());
          }
          break;
        default:
          break;
      }
    }
  }
  function updateValue(value) {
    const newValue = props.setValue(value);
    if (newValue !== void 0 && value != newValue) {
      setValidatedValue(newValue);
    }
  }
  function onDoubleClick() {
    root()?.setSelectionRange(0, -1);
  }
  function onMouseEnter() {
    triggerUiSFX("focus", "data-audio-focus");
  }
  function onEngineInput(inputEvent) {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    const input = root();
    if (!input) {
      return;
    }
    if (inputEvent.detail.name == "accept" && enabled()) {
      onActivate();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    } else if (inputEvent.isCancelInput() && enabled()) {
      input.dispatchEvent(new TextBoxTextEditStopEvent(false, inputEvent.detail.name));
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    } else if (inputEvent.detail.name == "touch-tap" && enabled()) {
      onActivate();
      inputEvent.stopPropagation();
      inputEvent.preventDefault();
    }
  }
  return (() => {
    var _el$ = _tmpl$(), _el$2 = _el$.firstChild;
    use(registerHotkey, _el$, () => [props.hotkeyAction, () => enabled(), onActivate]);
    use(isFocusable, _el$2, () => [!props.disabled && !props.disableFocus, props.autoFocus]);
    _el$2.$$input = (e) => updateValue(e.currentTarget.value);
    _el$2.$$focusout = () => setIsFocused(false);
    _el$2.addEventListener("focus", () => setIsFocused(true));
    _el$2.addEventListener("mouseenter", onMouseEnter);
    addEventListener(_el$2, "engine-input", onEngineInput);
    _el$2.$$click = onActivate;
    _el$2.$$dblclick = onDoubleClick;
    use(setRoot, _el$2);
    setAttribute(_el$2, "consume-keyboard-input", true);
    insert(_el$, () => props.children, null);
    createRenderEffect((_p$) => {
      var _v$ = `relative flex flex-row ${props.class ?? ""}`, _v$2 = !!isFocused(), _v$3 = props.tabIndex;
      _v$ !== _p$.e && className(_el$, _p$.e = _v$);
      _v$2 !== _p$.t && _el$2.classList.toggle("border-secondary", _p$.t = _v$2);
      _v$3 !== _p$.a && setAttribute(_el$2, "tabindex", _p$.a = _v$3);
      return _p$;
    }, {
      e: void 0,
      t: void 0,
      a: void 0
    });
    createRenderEffect(() => _el$2.value = validatedValue());
    return _el$;
  })();
};
const TextInput = ComponentRegistry.register({
  name: "TextInput",
  createInstance: TextInputComponent
});
delegateEvents(["dblclick", "click", "focusout", "input"]);

export { TextInput };
//# sourceMappingURL=text-input.js.map

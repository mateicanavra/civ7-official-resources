import { createSignal, createEffect, createMemo, createContext } from '../../vendor/solid-js/dist/solid.js';
import { createEngineEvent } from '../utilities/game-core-utilities.js';

const [activeInputDevice, setActiveInputDevice] = createSignal(Input.getActiveDeviceType());
const [activeInputDeviceLayout, setActiveInputDeviceLayout] = createSignal(
  InputDeviceLayout.Unknown
);
engine.whenReady.then(() => {
  engine.on("input-source-changed", (deviceType, deviceLayout) => {
    setActiveInputDevice(deviceType);
    setActiveInputDeviceLayout(deviceLayout);
  });
});
function useActiveInputContext() {
  const inputContextChanged = createEngineEvent("InputContextChanged");
  const [activeInputContext, setActiveInputContext] = createSignal(Input.getActiveContext());
  createEffect(() => {
    if (inputContextChanged()) {
      setActiveInputContext(Input.getActiveContext());
    }
  });
  return activeInputContext;
}
const ActiveInputDevice = activeInputDevice;
const ActiveInputDeviceLayout = activeInputDeviceLayout;
const IsControllerActive = createMemo(() => activeInputDevice() == InputDeviceType.Controller);
const IsTouchActive = createMemo(() => activeInputDevice() == InputDeviceType.Touch);
const IsHybridActive = createMemo(() => activeInputDevice() == InputDeviceType.Hybrid);
const IsKeyboardActive = createMemo(() => activeInputDevice() == InputDeviceType.Keyboard);
const IsMouseActive = createMemo(() => activeInputDevice() == InputDeviceType.Mouse);
class EngineInputProxyProvider {
  handlers = [];
  unregisterHandler(handler) {
    const foundHandler = this.handlers.indexOf(handler);
    if (foundHandler >= 0) {
      this.handlers.splice(foundHandler, 1);
    }
  }
  registerHandler(handler) {
    this.handlers.push(handler);
  }
  triggerEngineInput(event) {
    for (const handler of this.handlers) {
      handler(event);
    }
  }
}
const EngineInputProxyContext = createContext();

export { ActiveInputDevice, ActiveInputDeviceLayout, EngineInputProxyContext, EngineInputProxyProvider, IsControllerActive, IsHybridActive, IsKeyboardActive, IsMouseActive, IsTouchActive, useActiveInputContext };
//# sourceMappingURL=input.js.map

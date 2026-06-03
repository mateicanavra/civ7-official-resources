const ActiveDeviceTypeChangedEventName = "active-device-type-changed";
class ActiveDeviceTypeChangedEvent extends CustomEvent {
  constructor(deviceType, gamepadActive) {
    super(ActiveDeviceTypeChangedEventName, { bubbles: false, detail: { deviceType, gamepadActive } });
  }
}
class MoveSoftCursorEvent extends CustomEvent {
  constructor(status, x, y) {
    super("move-soft-cursor", { detail: { status, x, y } });
  }
}

export { ActiveDeviceTypeChangedEvent, ActiveDeviceTypeChangedEventName, MoveSoftCursorEvent };
//# sourceMappingURL=input-events.js.map

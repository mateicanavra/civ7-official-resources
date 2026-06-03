import '../../../core/vendor/solid-js/web/dist/web.js';
import { createSignal, onMount, createEffect, onCleanup, createComponent } from '../../../core/vendor/solid-js/dist/solid.js';
import ContextManager from '../../../core/ui/context-manager/context-manager.js';
import { FiligreeTitle } from '../../../core/ui-next/components/filigree-title.js';
import { VSlot } from '../../../core/ui-next/components/slot.js';
import { SubsystemFrame } from '../../../core/ui-next/components/subsystem-frame.js';
import { ComponentRegistry } from '../../../core/ui-next/services/component-registry.js';
import { HideMiniMapEvent } from '../../ui/mini-map/panel-mini-map.js';

const SidebarChooserComponent = (props) => {
  const [getAnimation, setAnimation] = createSignal("animate-in-left");
  let hasPoppedContext = false;
  const onClose = () => {
    if (props.onClose) {
      props.onClose();
    }
    setAnimation("animate-out-left");
    setTimeout(() => {
      if (!hasPoppedContext) {
        hasPoppedContext = true;
        ContextManager.pop(props.context);
      }
    }, 200);
  };
  onMount(() => {
    window.dispatchEvent(new HideMiniMapEvent(true));
    createEffect(() => {
      if (props.closing) {
        onClose();
      }
    });
    onCleanup(() => {
      window.dispatchEvent(new HideMiniMapEvent(false));
      if (!hasPoppedContext) {
        hasPoppedContext = true;
        ContextManager.pop(props.context);
      }
    });
  });
  return createComponent(SubsystemFrame.B1, {
    get id() {
      return props.id;
    },
    get name() {
      return props.name;
    },
    get ["class"]() {
      return `m-4 items-center ${getAnimation()}`;
    },
    get closeButtonAudio() {
      return props.closeButtonAudioGroup ? {
        group: props.closeButtonAudioGroup
      } : void 0;
    },
    onClose,
    get header() {
      return createComponent(FiligreeTitle, {
        get text() {
          return props.title;
        },
        bgGlow: true
      });
    },
    get children() {
      return createComponent(VSlot, {
        "class": "flex flex-col flex-1",
        get children() {
          return props.children;
        }
      });
    }
  });
};
const SidebarChooser = ComponentRegistry.register({
  name: "SidebarChooser",
  createInstance: SidebarChooserComponent
});

export { SidebarChooser };
//# sourceMappingURL=side-chooser.js.map

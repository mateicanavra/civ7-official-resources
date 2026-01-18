import { c as createSignal, r as render, a as createEffect, I as IsControllerActive, b as IsTouchActive, o as onMount, d as onCleanup, e as createComponent } from '../../../../core/ui-next/components/panel.chunk.js';
import FocusManager from '../../../../core/ui/input/focus-manager.js';
import { c as createLoadScreenModel } from './load-screen-model.chunk.js';
import { L as LoadScreenContext, a as LoadScreen } from './load-screen.chunk.js';
import '../../../../core/ui/input/input-support.chunk.js';
import '../../../../core/ui/input/focus-support.chunk.js';
import '../../../../core/ui/components/fxs-slot.chunk.js';
import '../../../../core/ui/views/view-manager.chunk.js';
import '../../../../core/ui/panel-support.chunk.js';
import '../../../../core/ui/framework.chunk.js';
import '../../../../core/ui/spatial/spatial-manager.js';
import '../../../../core/ui/context-manager/context-manager.js';
import '../../../../core/ui/context-manager/display-queue-manager.js';
import '../../../../core/ui/dialog-box/manager-dialog-box.chunk.js';
import '../../../../core/ui/input/cursor.js';
import '../../../../core/ui/input/action-handler.js';
import '../../../../core/ui/utilities/utilities-update-gate.chunk.js';
import '../../../../core/ui/navigation-tray/model-navigation-tray.chunk.js';
import '../../../../core/ui/utilities/utilities-image.chunk.js';
import '../../../../core/ui/utilities/utilities-component-id.chunk.js';
import '../../../../core/ui/audio-base/audio-support.chunk.js';
import '../../../../core/ui-next/components/hero-button.chunk.js';
import '../../../../core/ui-next/components/l10n.chunk.js';
import '../../../../core/ui-next/components/flipbook.chunk.js';
import '../../../../core/ui/utilities/utilities-layout.chunk.js';
import '../../../../core/ui-next/components/header.chunk.js';
import '../../../../core/ui-next/components/scroll-area.chunk.js';

if (UI.isInGame() || UI.isInLoading()) {
  const model = createLoadScreenModel();
  const [ref, setRef] = createSignal();
  if (model) {
    render(() => {
      createEffect(() => {
        if (model.data || UI.getGameLoadingState() == UIGameLoadingState.GameStarted) {
          const hourglassElement = document.getElementById("load-screen-flip-book");
          hourglassElement?.remove();
        }
      });
      createEffect(() => {
        if (IsControllerActive() || IsTouchActive()) {
          UI.hideCursor();
        } else {
          UI.showCursor();
        }
      });
      onMount(() => {
        Input.setActiveContext(InputContext.Shell);
        FocusManager.setFocus(ref());
      });
      onCleanup(() => {
        Input.setActiveContext(InputContext.World);
      });
      return createComponent(LoadScreenContext.Provider, {
        value: model,
        get children() {
          return createComponent(LoadScreen, {
            ref: setRef
          });
        }
      });
    }, document.getElementById("loading-curtain"));
  } else {
    console.error("Unable to render load screen - model could not be created");
  }
}
//# sourceMappingURL=load-screen-bootstrap.js.map

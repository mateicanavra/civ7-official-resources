import { template, use, insert } from '../../../../core/vendor/solid-js/web/dist/web.js';
import { useContext, createSignal, createEffect, onMount, onCleanup, createComponent, Show, createRenderEffect } from '../../../../core/vendor/solid-js/dist/solid.js';
import { ContextManager, ContextManagerEvents } from '../../../../core/ui/context-manager/context-manager.js';
import { Layout } from '../../../../core/ui/utilities/utilities-layout.js';
import { SolidAdapterContext, defineLegacyComponent } from '../../../../core/ui-next/components/fxs-solid-component.js';
import { ComponentRegistry } from '../../../../core/ui-next/services/component-registry.js';
import { createEngineEvent } from '../../../../core/ui-next/utilities/game-core-utilities.js';
import { createWindowEventSignal } from '../../../../core/ui-next/utilities/solid-utilities.js';
import { NarrativePopupManager } from '../../../ui/narrative-event/narrative-popup-manager.js';
import { NarrativeEventPanel } from './narrative-event-panel.js';
import { chooseNarrativeDirection, createSmallNarrativeEventData } from './small-narrative-event-model.js';
import style from '../../../ui/small-narrative-event/small-narrative-event.scss.js';

var _tmpl$ = /* @__PURE__ */ template(`<div class="absolute top-0 left-0 flex flex-col items-center w-full origin-bottom-left"></div>`);
const Z_PLACEMENT = {
  x: 0,
  y: 0,
  z: 18
};
const HideSmallNarrativesEventName = "ui-hide-small-narratives";
const PANEL_PLOT_VERTICAL_OFFSET_PX = 80;
const SmallNarrativeEventAnchor = () => {
  const adapterContext = useContext(SolidAdapterContext);
  const [data, setData] = createSignal(null);
  const [panelHeight, setPanelHeight] = createSignal(0);
  const localPlayerTurnEnd = createEngineEvent("LocalPlayerTurnEnd");
  const hideSmallNarratives = createWindowEventSignal(HideSmallNarrativesEventName);
  let panelRef;
  let anchorHandle = null;
  let rafId = null;
  const closePanel = (method) => {
    ContextManager.pop("small-narrative-event", {
      viewChangeMethod: method
    });
  };
  const handleClose = () => {
    NarrativePopupManager.closePopup();
    closePanel(UIViewChangeMethod.PlayerInteraction);
  };
  const handleChoiceSelected = (choice) => {
    const eventData = data();
    if (!eventData) return;
    if (chooseNarrativeDirection(eventData.targetStoryId, choice.key, choice.icons)) {
      NarrativePopupManager.closePopup();
      closePanel(UIViewChangeMethod.PlayerInteraction);
    }
  };
  const onTurnEnd = () => {
    NarrativePopupManager.closePopup();
    closePanel(UIViewChangeMethod.Automatic);
  };
  const onGlobalHide = () => {
    closePanel(UIViewChangeMethod.Automatic);
  };
  const onContextClose = (event) => {
    const deactivatedElementName = event.detail.deactivatedElement.typeName;
    if (!deactivatedElementName) {
      return;
    }
    if (deactivatedElementName === "small-narrative-event") {
      waitForLayout(() => {
        NarrativePopupManager.closePopup();
        closePanel(UIViewChangeMethod.Automatic);
        engine.off(ContextManagerEvents.OnClose, onContextClose);
      });
    }
  };
  createEffect(() => {
    if (!hideSmallNarratives()) {
      return;
    }
    onGlobalHide();
  });
  createEffect(() => {
    const eventData = localPlayerTurnEnd();
    if (!eventData) {
      return;
    }
    onTurnEnd();
  });
  const registerWorldAnchor = (coords) => {
    anchorHandle = WorldAnchors.RegisterFixedWorldAnchor(coords, Z_PLACEMENT);
    if (anchorHandle !== null && anchorHandle >= 0) {
      adapterContext?.rootElement.setAttribute("data-bind-style-transform2d", `{{FixedWorldAnchors.offsetTransforms[${anchorHandle}].value}}`);
    } else {
      console.error("small-narrative-event: Failed to register world anchor for coords", coords);
      anchorHandle = null;
    }
  };
  const unregisterWorldAnchor = () => {
    if (anchorHandle !== null) {
      adapterContext?.rootElement.removeAttribute("data-bind-style-transform2d");
      WorldAnchors.UnregisterFixedWorldAnchor(anchorHandle);
      anchorHandle = null;
    }
  };
  const updateHeightOffset = () => {
    if (panelRef) {
      const h = panelRef.offsetHeight;
      if (h !== panelHeight()) {
        setPanelHeight(h);
      }
    }
    rafId = window.requestAnimationFrame(updateHeightOffset);
  };
  onMount(() => {
    const eventData = createSmallNarrativeEventData();
    if (!eventData) {
      NarrativePopupManager.closePopup();
      closePanel(UIViewChangeMethod.Automatic);
      return;
    }
    setData(eventData);
    if (eventData.storyCoordinates) {
      const worldLoc = WorldUI.getPlotLocation(eventData.storyCoordinates, {
        x: 0,
        y: 0,
        z: 0
      }, PlacementMode.WATER);
      Camera.lookAt(worldLoc.x, worldLoc.y + 64);
      registerWorldAnchor(eventData.storyCoordinates);
    }
    rafId = window.requestAnimationFrame(updateHeightOffset);
    engine.on(ContextManagerEvents.OnClose, onContextClose);
  });
  onCleanup(() => {
    if (rafId !== null) window.cancelAnimationFrame(rafId);
    unregisterWorldAnchor();
  });
  return createComponent(Show, {
    get when() {
      return data();
    },
    children: (data2) => (() => {
      var _el$ = _tmpl$();
      var _ref$ = panelRef;
      typeof _ref$ === "function" ? use(_ref$, _el$) : panelRef = _el$;
      insert(_el$, createComponent(NarrativeEventPanel, {
        get bodyText() {
          return data2().bodyText;
        },
        get choices() {
          return data2().choices;
        },
        get storyType() {
          return data2().storyType;
        },
        get leaderCiv() {
          return data2().leaderCiv;
        },
        onChoiceSelected: handleChoiceSelected,
        onClose: handleClose,
        panelID: "small-narrative-event"
      }));
      createRenderEffect((_p$) => {
        var _v$ = anchorHandle !== null ? `${-panelHeight() - PANEL_PLOT_VERTICAL_OFFSET_PX}px` : void 0, _v$2 = Layout.pixels(570);
        _v$ !== _p$.e && ((_p$.e = _v$) != null ? _el$.style.setProperty("top", _v$) : _el$.style.removeProperty("top"));
        _v$2 !== _p$.t && ((_p$.t = _v$2) != null ? _el$.style.setProperty("width", _v$2) : _el$.style.removeProperty("width"));
        return _p$;
      }, {
        e: void 0,
        t: void 0
      });
      return _el$;
    })()
  });
};
defineLegacyComponent("small-narrative-event", {
  classNames: ["small-narrative-event"]
}, (_attrs, _element) => {
  Input.setActiveContext(InputContext.Dual);
  return createComponent(SmallNarrativeEventAnchor, {});
});
ComponentRegistry.register({
  name: "SmallNarrativeEvent",
  createInstance: SmallNarrativeEventAnchor,
  styles: [style]
});
//# sourceMappingURL=small-narrative-event.js.map

import '../../vendor/solid-js/web/dist/web.js';
import { createContext, useContext, createComponent, createMemo, onMount, onCleanup, createEffect, createSignal, on } from '../../vendor/solid-js/dist/solid.js';
import { ComponentRegistry } from '../services/component-registry.js';
import { cleanObject } from '../utilities/game-core-utilities.js';

class Scene3dContextProvider {
  constructor(name) {
    this.name = name;
  }
}
const Scene3dContext = createContext();
function useScene3dContext() {
  const context = useContext(Scene3dContext);
  if (!context) {
    throw new Error("No Scene3d context found!");
  }
  return context;
}
const Scene3dComponent = (props) => {
  const sceneContext = new Scene3dContextProvider(props.name);
  return createComponent(Scene3dContext.Provider, {
    value: sceneContext,
    get children() {
      return props.children;
    }
  });
};
const Scene3d = ComponentRegistry.register({
  name: "Scene3d",
  createInstance: Scene3dComponent
});
const Camera3dComponent = (props) => {
  const cameraProps = createMemo(() => cleanObject({
    fovy: props.fov,
    up: props.up,
    clip: props.clip
  }));
  onMount(() => {
    Camera.pushCamera(props.cameraPos, props.subjectPos, cameraProps());
  });
  onCleanup(() => {
    Camera.popCamera();
  });
  return null;
};
const Camera3d = ComponentRegistry.register({
  name: "Camera3d",
  createInstance: Camera3dComponent
});
class ModelGroup3dContextProvider {
  _modelGroup;
  get modelGroup() {
    return this._modelGroup;
  }
  constructor(name) {
    this._modelGroup = WorldUI.createModelGroup(name);
  }
  dispose() {
    this._modelGroup.destroy();
  }
}
const ModelGroup3dContext = createContext();
function useModelGroup3dContext() {
  const context = useContext(ModelGroup3dContext);
  if (!context) {
    throw new Error("No ModelGroup3d context found!");
  }
  return context;
}
const ModelGroup3dComponent = (props) => {
  const groupContext = new ModelGroup3dContextProvider(props.name);
  createEffect(() => props.ref?.(groupContext.modelGroup));
  onCleanup(() => {
    groupContext.dispose();
  });
  return createComponent(ModelGroup3dContext.Provider, {
    value: groupContext,
    get children() {
      return props.children;
    }
  });
};
const ModelGroup3d = ComponentRegistry.register({
  name: "ModelGroup3d",
  createInstance: ModelGroup3dComponent
});
const defaultLocation = {
  marker: WorldUI.createFixedMarker({
    x: 0,
    y: 0,
    z: 0
  }) ?? void 0,
  offset: {
    x: 0,
    y: 0,
    z: 0
  }
};
const Model3dComponent = (props) => {
  const modelGroupContext = useModelGroup3dContext();
  const [model, setModel] = createSignal();
  const modelParams = createMemo(() => cleanObject({
    scale: props.scale,
    angle: props.angle,
    tintColor1: props.tintColor1,
    tintColor2: props.tintColor2,
    initialState: props.state,
    placement: props.placement,
    foreground: props.foreground,
    needsShadows: props.needsShadows,
    triggerCallbacks: !!props.onTrigger,
    selectionScriptParams: props.selectionScriptParams
  }));
  engine.on("ModelTrigger", (id, hash) => {
    if (model()?.id == id) {
      props.onTrigger?.(hash);
    }
  });
  createEffect(on(() => props.hidden, (hidden, prevHidden) => {
    const alpha = hidden ? 0 : props.alpha ?? 1;
    model()?.setAlpha(alpha);
    if (props.clearTemporalHistoryOnChange && prevHidden != hidden) {
      WorldUI.clearTemporalHistory();
    }
  }));
  createEffect(() => props.ref?.(model()));
  createEffect(on(() => props.model, (modelName, prevModelName) => {
    model()?.setAssetName(modelName);
    if (props.clearTemporalHistoryOnChange && prevModelName != modelName) {
      WorldUI.clearTemporalHistory();
    }
  }));
  createEffect(() => {
    if (props.state) {
      model()?.setState(props.state);
    }
  });
  createEffect(() => {
    model()?.updateSelectionScriptParams(modelParams());
  });
  onMount(() => {
    const model2 = modelGroupContext.modelGroup.addModel(props.model, props.location ?? defaultLocation, modelParams()) ?? void 0;
    setModel(model2);
  });
  return null;
};
const Model3d = ComponentRegistry.register({
  name: "Model3d",
  createInstance: Model3dComponent
});
class Background3dContextProvider {
  setIsUpdatePending;
  layers = [];
  constructor() {
    const [isUpdatePending, setIsUpdatePending] = createSignal(true);
    this.setIsUpdatePending = setIsUpdatePending;
    createEffect(() => {
      if (isUpdatePending()) {
        this.rerender();
        this.setIsUpdatePending(false);
      }
    });
  }
  cleanLayer(layer) {
    return cleanObject({
      stretch: layer.stretch,
      alignX: layer.alignX,
      alignY: layer.alignY,
      alpha: layer.alpha,
      size: layer.size,
      sizeRel: layer.sizeRel,
      offset: layer.offset,
      offsetRel: layer.offsetRel,
      border_slice: layer.borderImageSlice,
      border_width: layer.borderImageWidth,
      flipX: layer.flipX,
      flipY: layer.flipY
    });
  }
  rerender() {
    WorldUI.clearBackground();
    const pass = UI.isInGame() ? BackgroundPass.UI : BackgroundPass.Game;
    for (const layer of this.layers) {
      if (layer.mask) {
        WorldUI.addMaskedBackgroundLayer(layer.texture, layer.mask, this.cleanLayer(layer), pass);
      } else {
        WorldUI.addBackgroundLayer(layer.texture, this.cleanLayer(layer), pass);
      }
    }
  }
  addOrUpdateLayer(layer) {
    const foundLayer = this.layers.find((l) => l.name == layer.name);
    if (foundLayer) {
      foundLayer.alignX = layer.alignX;
      foundLayer.alignY = layer.alignY;
      foundLayer.alpha = layer.alpha;
      foundLayer.borderImageSlice = layer.borderImageSlice;
      foundLayer.borderImageWidth = layer.borderImageWidth;
      foundLayer.mask = layer.mask;
      foundLayer.offset = layer.offset;
      foundLayer.offsetRel = layer.offsetRel;
      foundLayer.size = layer.size;
      foundLayer.sizeRel = layer.sizeRel;
      foundLayer.stretch = layer.stretch;
      foundLayer.texture = layer.texture;
      foundLayer.flipX = layer.flipX;
      foundLayer.flipY = layer.flipY;
    } else {
      this.layers.push({
        ...layer
      });
    }
    this.setIsUpdatePending(true);
  }
  removeLayer(layer) {
    const foundLayerIndex = this.layers.findIndex((l) => l.name == layer.name);
    if (foundLayerIndex >= 0) {
      this.layers.splice(foundLayerIndex, 1);
    }
    this.setIsUpdatePending(true);
  }
}
const Background3dContext = createContext();
function useBackground3dContext() {
  const context = useContext(Background3dContext);
  if (!context) {
    throw new Error("Unable to find Background3dContext to use");
  }
  return context;
}
const Background3dComponent = (props) => {
  const context = new Background3dContextProvider();
  return createComponent(Background3dContext.Provider, {
    value: context,
    get children() {
      return props.children;
    }
  });
};
const Background3d = ComponentRegistry.register({
  name: "Background3d",
  createInstance: Background3dComponent
});
const BackgroundLayer3dComponent = (props) => {
  const context = useBackground3dContext();
  function setBackground() {
    context.addOrUpdateLayer(props);
  }
  createEffect(on(() => [props.texture, props.size, props.sizeRel, props.offset, props.offsetRel], () => setBackground()));
  onCleanup(() => {
    context.removeLayer(props);
  });
  return null;
};
const BackgroundLayer3d = ComponentRegistry.register({
  name: "BackgroundLayer3d",
  createInstance: BackgroundLayer3dComponent
});

export { Background3d, BackgroundLayer3d, Camera3d, Camera3dComponent, Model3d, ModelGroup3d, Scene3d, Scene3dComponent, useModelGroup3dContext, useScene3dContext };
//# sourceMappingURL=scene-3d.js.map

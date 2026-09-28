import { createRoot, onCleanup } from '../../vendor/solid-js/dist/solid.js';

var ModelLifecycle = /* @__PURE__ */ ((ModelLifecycle2) => {
  ModelLifecycle2[ModelLifecycle2["Singleton"] = 0] = "Singleton";
  ModelLifecycle2[ModelLifecycle2["SharedInstance"] = 1] = "SharedInstance";
  ModelLifecycle2[ModelLifecycle2["PerInstance"] = 2] = "PerInstance";
  return ModelLifecycle2;
})(ModelLifecycle || {});
class ModelRegistryImpl {
  modelFactories = /* @__PURE__ */ new Map();
  rootDisposeFn;
  isInitialized = false;
  constructor() {
    engine.whenReady.then(() => {
      createRoot((dispose) => {
        this.rootDisposeFn = dispose;
        for (const modelFactory of this.modelFactories.values()) {
          this.resolveModel(modelFactory);
        }
        this.isInitialized = true;
      });
    });
  }
  /**
   * Registers a model with the model registry.
   * Models can be overriden (for example, by mods) by setting a higher priority in options
   * See {@link ModelRegistryImpl} for more info
   * ```ts
   * export const ExampleModel = ModelRegistry.register("ExampleModel", ModelLifecycle.PerInstance, createExampleModel), overridePriority: 0);
   * ```
   * @param name The name of the model - only used for registration and overrides
   * @param lifecycle Is the model a singleton or is it a per instance model?
   * @param factory The model factory function
   * @param overridePriority The model registered with the highest override priority will be used. Default: 0
   *
   * @returns The registered overridable component
   */
  register(name, lifecycle, factory, overridePriority) {
    let modelFactory = this.modelFactories.get(name);
    overridePriority ??= 0;
    if (modelFactory) {
      if (modelFactory.overridePriority < overridePriority) {
        modelFactory.overridePriority = overridePriority;
        modelFactory = this.updateModel(modelFactory, name, lifecycle, factory);
      }
    } else {
      const partialFactory = {
        name,
        overridePriority
      };
      modelFactory = this.updateModel(partialFactory, name, lifecycle, factory);
      this.modelFactories.set(name, modelFactory);
    }
    return modelFactory;
  }
  /**
   * Gets a registered model from the model registry.
   * Will return a model that points the model factory with the highest override priority.
   * @param name The name of the model to get
   * @returns The registered model or undefined if no registration was not found
   */
  get(name) {
    return this.modelFactories.get(name);
  }
  /**
   * Cleans up the model registry solid root
   */
  destroy() {
    this.rootDisposeFn?.();
    this.modelFactories.clear();
  }
  updateModel(modelFactory, name, lifecycle, factory) {
    modelFactory.lifecycle = lifecycle;
    modelFactory.instance = void 0;
    modelFactory.factory = factory;
    modelFactory.get = () => {
      throw new Error(`Model Registry - Unable to resolve model "${name}" before engine ready!`);
    };
    if (this.isInitialized) {
      this.resolveModel(modelFactory);
    }
    return modelFactory;
  }
  resolveModel(model) {
    switch (model.lifecycle) {
      case 2 /* PerInstance */:
        model.get = model.factory;
        break;
      case 0 /* Singleton */:
        model.instance = model.factory?.();
        model.get = () => model.instance;
        break;
      case 1 /* SharedInstance */:
        model.refCount = 0;
        model.get = () => {
          if (model.instance == void 0) {
            model.instance = model.factory?.();
          }
          model.refCount++;
          onCleanup(() => {
            model.refCount--;
            if (model.refCount <= 0) {
              model.instance = void 0;
              model.refCount = 0;
            }
          });
          return model.instance;
        };
        break;
    }
  }
}
const ModelRegistry = new ModelRegistryImpl();

export { ModelLifecycle, ModelRegistry };
//# sourceMappingURL=model-registry.js.map

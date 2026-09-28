import '../../vendor/solid-js/web/dist/web.js';
import { createSignal, createEffect, mergeProps, createComponent } from '../../vendor/solid-js/dist/solid.js';
import { Icon } from './icon.js';
import { ComponentRegistry } from '../services/component-registry.js';
import { Activatable } from './activatable.js';

const ImageButtonComponent = (props) => {
  const [mergedProps, setMergedProps] = createSignal({
    imageData: {
      base: "",
      focus: ""
    },
    size: "12"
  });
  createEffect(() => {
    const audioObject = props.audio ?? {};
    audioObject.onPress ??= "data-audio-primary-button-press";
    audioObject.onFocus ??= "data-audio-primary-button-focus";
    const defaultProps = {
      audio: audioObject,
      imageData: {
        base: "",
        focus: ""
      },
      size: "12"
    };
    const finalPropsObject = mergeProps(defaultProps, props);
    setMergedProps(finalPropsObject);
  });
  return createComponent(Activatable, mergeProps(mergedProps, {
    get ["class"]() {
      return `fxs-image-button relative size-${props.size} ${props.class ?? ""}`;
    },
    get classList() {
      return {
        "opacity-50": props.disabled && !props.imageData.disabled
      };
    },
    get name() {
      return props.name ? props.name + "(ImageButton)" : "ImageButton";
    },
    get children() {
      return [createComponent(Icon, {
        "class": "absolute inset-0 size-full",
        get name() {
          return props.imageData.base;
        },
        isUrl: true
      }), createComponent(Icon, {
        "class": "absolute inset-0 size-full opacity-0 fxs-image-button__bg--focus",
        get name() {
          return props.imageData.focus;
        },
        isUrl: true
      }), createComponent(Icon, {
        "class": "absolute inset-0 size-full opacity-0 fxs-image-button__bg--active",
        get name() {
          return props.imageData.active ?? props.imageData.focus;
        },
        isUrl: true
      }), createComponent(Icon, {
        "class": "absolute inset-0 size-full opacity-0 fxs-image-button__bg--disabled",
        get name() {
          return props.imageData.disabled ?? props.imageData.base;
        },
        isUrl: true
      })];
    }
  }));
};
const ImageButton = ComponentRegistry.register({
  name: "ImageButton",
  createInstance: ImageButtonComponent
});

export { ImageButton };
//# sourceMappingURL=image-button.js.map

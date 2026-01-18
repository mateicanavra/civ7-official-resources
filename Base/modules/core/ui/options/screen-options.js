import { b as FxsSwitch, F as FxsCheckbox, a as FxsStepper } from '../components/fxs-switch.chunk.js';
import { D as DropdownSelectionChangeEventName } from '../components/fxs-dropdown.chunk.js';
import { F as FxsSlider } from '../components/fxs-slider.chunk.js';
import ContextManager from '../context-manager/context-manager.js';
import { d as displayRequestUniqueId, a as DialogBoxManager, D as DialogBoxAction } from '../dialog-box/manager-dialog-box.chunk.js';
import { M as MainMenuReturnEvent } from '../events/shell-events.chunk.js';
import FocusManager from '../input/focus-manager.js';
import { b as InputEngineEventName } from '../input/input-support.chunk.js';
import { N as NavTray } from '../navigation-tray/model-navigation-tray.chunk.js';
import { O as Options, a as OptionType, C as CategoryType, b as CreateOptionComponent, G as GetGroupLocKey, S as ShowReloadUIPrompt, c as ShowRestartGamePrompt, d as CategoryData } from './editors/index.chunk.js';
import { TtsManager } from '../accessibility/tts-manager.js';
import { FontScale as FontScale$1, MustGetElement } from '../utilities/utilities-dom.chunk.js';
import { a as FxsVSlot } from '../components/fxs-slot.chunk.js';
import { P as Panel } from '../panel-support.chunk.js';
import '../components/fxs-activatable.chunk.js';
import '../audio-base/audio-support.chunk.js';
import '../input/action-handler.js';
import '../framework.chunk.js';
import '../input/cursor.js';
import '../views/view-manager.chunk.js';
import '../utilities/utilities-update-gate.chunk.js';
import '../input/focus-support.chunk.js';
import '../context-manager/display-queue-manager.js';
import '../utilities/utilities-image.chunk.js';
import '../utilities/utilities-component-id.chunk.js';
import '../components/fxs-chooser-item.chunk.js';
import '../utilities/utilities-layout.chunk.js';
import '../../../base-standard/ui/chooser-item/chooser-item.chunk.js';
import '../components/fxs-button.chunk.js';
import '../utilities/utilities-core-databinding.chunk.js';
import '../spatial/spatial-manager.js';

const FORCE_FEEDBACK_OPTION_LOW = 20;
const FORCE_FEEDBACK_OPTION_HIGH = 20;
const FORCE_FEEDBACK_OPTION_DURATION = 100;
const FRAMERATE_LIMIT_SLIDER_MIN = 30;
const FRAMERATE_LIMIT_SLIDER_INF = 241;
const bPlatformSupportsXess = (BuildInfo.graphics == "DX12" || BuildInfo.graphics == "Vulkan") && BuildInfo.target == "Windows";
const bPlatformSupportsFSR3 = (BuildInfo.graphics == "DX12" || BuildInfo.graphics == "Vulkan") && BuildInfo.target == "Windows";
const bPlatformSupportsMetalFX = Options.canUseMetalFx;
const upscaleItemList = [
  { mode: UpscalingAA.AUTO, label: Locale.compose("LOC_OPTIONS_GFX_AUTO") },
  { mode: UpscalingAA.OFF, label: "LOC_OPTIONS_MISC_OFF" },
  {
    mode: UpscalingAA.MSAA,
    label: "LOC_OPTIONS_GFX_UPSCALE_AA_MSAA",
    tooltip: "LOC_OPTIONS_GFX_UPSCALE_AA_MSAA_DESCRIPTION"
  },
  ...bPlatformSupportsXess ? [
    {
      mode: UpscalingAA.XeSS,
      label: "LOC_OPTIONS_GFX_UPSCALE_AA_XESS",
      tooltip: "LOC_OPTIONS_GFX_UPSCALE_AA_XESS_DESCRIPTION"
    }
  ] : [],
  // TODO _SHORT or _MINIMUM keys have more detail
  {
    mode: UpscalingAA.FSR1,
    label: "LOC_OPTIONS_GFX_UPSCALE_AA_FSR1",
    tooltip: "LOC_OPTIONS_GFX_UPSCALE_AA_FSR1_DESCRIPTION"
  },
  ...bPlatformSupportsFSR3 ? [
    {
      mode: UpscalingAA.FSR3,
      label: "LOC_OPTIONS_GFX_UPSCALE_AA_FSR3",
      tooltip: "LOC_OPTIONS_GFX_UPSCALE_AA_FSR3_DESCRIPTION"
    }
  ] : [],
  ...bPlatformSupportsMetalFX ? [
    {
      mode: UpscalingAA.MetalFXSpatial,
      label: "LOC_OPTIONS_GFX_UPSCALE_AA_METALFX_SPATIAL",
      tooltip: "LOC_OPTIONS_GFX_UPSCALE_AA_METALFX_SPATIAL_DESCRIPTION"
    }
  ] : [],
  ...bPlatformSupportsMetalFX ? [
    {
      mode: UpscalingAA.MetalFXTemporal,
      label: "LOC_OPTIONS_GFX_UPSCALE_AA_METALFX_TEMPORAL",
      tooltip: "LOC_OPTIONS_GFX_UPSCALE_AA_METALFX_TEMPORAL_DESCRIPTION"
    }
  ] : []
];
const onAudioDynRangeInit = (optionInfo) => {
  if (optionInfo.id != "option-audio-dynamic-range") {
    console.warn("The dynamic range handler was called by some other option '" + optionInfo.id + "'");
    return;
  }
  optionInfo.selectedItemIndex = Sound.getDynamicRangeOption();
};
const onAudioDynRangeUpdate = (optionInfo, value) => {
  optionInfo.currentValue = value;
  Sound.setDynamicRangeOption(value);
};
const onProductionPanelBuildingInfoTypeInit = (optionInfo) => {
  if (optionInfo.id != "option-productionpanel-buildinginfotype") {
    console.warn("The building info handler was called by some other option '" + optionInfo.id + "'");
    return;
  }
  if (!optionInfo.dropdownItems) {
    console.error("Production panel building info type dropdown items are not defined.");
    return;
  }
  const type = Configuration.getUser().productionPanelBuildingInfoType;
  const index = optionInfo.dropdownItems.findIndex(
    (item) => item.value === type
  );
  optionInfo.selectedItemIndex = index;
};
const onProductionPanelBuildingInfoTypeUpdate = (optionInfo, value) => {
  if (optionInfo.id != "option-productionpanel-buildinginfotype") {
    console.warn("The building info handler was called by some other option '" + optionInfo.id + "'");
    return;
  }
  if (!optionInfo.dropdownItems || optionInfo.selectedItemIndex === void 0) {
    return;
  }
  const item = optionInfo.dropdownItems[value];
  Configuration.getUser().setProductionPanelBuildingInfoType(item.value);
};
const onVolumeInit = (optionInfo) => {
  switch (optionInfo.id) {
    case "option-audio-cinematics":
      optionInfo.currentValue = Sound.volumeGetCinematics();
      break;
    case "option-audio-master":
      optionInfo.currentValue = Sound.volumeGetMaster();
      break;
    case "option-audio-music":
      optionInfo.currentValue = Sound.volumeGetMusic();
      break;
    case "option-audio-ui":
      optionInfo.currentValue = Sound.volumeGetUI();
      break;
    case "option-audio-voice":
      optionInfo.currentValue = Sound.volumeGetVoice();
      break;
    case "option-audio-sfx":
      optionInfo.currentValue = Sound.volumeGetSFX();
      break;
    default:
      console.warn("Attempt to init volume on unknown id '" + optionInfo.id + "'.");
      break;
  }
  if (optionInfo.currentValue) {
    optionInfo.formattedValue = `${Math.round(optionInfo.currentValue * 100)}%`;
  }
};
const onMuteOnFocusLossInit = (optionInfo) => {
  optionInfo.currentValue = Sound.getMuteOnFocusLoss();
};
const onMuteOnFocusLossUpdate = (_optionInfo, value) => {
  Sound.setMuteOnFocusLoss(value);
};
const onSubtitlesInit = (optionInfo) => {
  optionInfo.currentValue = Sound.getSubtitles();
};
const onSubtitlesUpdate = (_optionInfo, value) => {
  Sound.setSubtitles(value);
};
const onVolumeUpdate = (optionInfo, value) => {
  optionInfo.currentValue = value;
  optionInfo.formattedValue = `${Math.round(optionInfo.currentValue * 100)}%`;
  switch (optionInfo.id) {
    case "option-audio-master":
      Sound.volumeSetMaster(value);
      break;
    case "option-audio-music":
      Sound.volumeSetMusic(value);
      break;
    case "option-audio-voice":
      Sound.volumeSetVoice(value);
      break;
    case "option-audio-ui":
      Sound.volumeSetUI(value);
      break;
    case "option-audio-cinematics":
      Sound.volumeSetCinematics(value);
      break;
    case "option-audio-sfx":
      Sound.volumeSetSFX(value);
      break;
    default:
      console.warn("Cannot change volume on unknown audio channel with optionID '" + optionInfo.id + "'.");
      break;
  }
};
const advancedGraphicsOptionSetters = [];
let graphicsProfileSetter = void 0;
let updatingGraphicsProfile = false;
function getOptionsForProfile(profile) {
  const profileOptions = { ...Options.graphicsOptions };
  profileOptions.profile = profile;
  return GraphicsOptions.fillAdvancedOptions(profileOptions);
}
function onAdvancedOptionChanged() {
  if (!Options.supportsGraphicOptions) {
    return;
  }
  if (!updatingGraphicsProfile && Options.graphicsOptions.profile != GraphicsProfile.CUSTOM) {
    Options.graphicsOptions.profile = GraphicsProfile.CUSTOM;
    if (graphicsProfileSetter) {
      graphicsProfileSetter();
    }
  }
}
function onGraphicsProfileChanged() {
  if (Options.graphicsOptions.profile == GraphicsProfile.CUSTOM) {
    return;
  }
  const options = getOptionsForProfile(Options.graphicsOptions.profile);
  Object.assign(Options.graphicsOptions, options);
  updatingGraphicsProfile = true;
  for (const advancedGraphicsOption of advancedGraphicsOptionSetters) {
    advancedGraphicsOption();
  }
  updatingGraphicsProfile = false;
}
function addGraphicsOptionSetter(optionInfo, advancedOptionSetter) {
  advancedGraphicsOptionSetters.push(() => {
    advancedOptionSetter();
    if (optionInfo.forceRender) {
      optionInfo.forceRender();
    }
  });
}
const antialiasingOptions = [];
function updateAntialiasingVisiblity() {
  let optionIdsToShow = [];
  switch (Options.graphicsOptions.upscaleAA) {
    case UpscalingAA.MSAA:
      optionIdsToShow.push("option-gfx-msaa-quality");
      break;
    case UpscalingAA.XeSS:
      optionIdsToShow.push("option-gfx-xess-quality");
      break;
    case UpscalingAA.FSR1:
      optionIdsToShow.push("option-gfx-fsr1-quality");
      optionIdsToShow.push("option-gfx-msaa-quality");
      break;
    case UpscalingAA.FSR3:
      optionIdsToShow.push("option-gfx-fsr3-quality");
      break;
    case UpscalingAA.MetalFXSpatial:
      optionIdsToShow.push("option-gfx-metalfxSpatial-quality");
      optionIdsToShow.push("option-gfx-msaa-quality");
      break;
    case UpscalingAA.MetalFXTemporal:
      optionIdsToShow.push("option-gfx-metalfxTemporal-quality");
      break;
  }
  for (const optionInfo of antialiasingOptions) {
    optionInfo.isHidden = !optionIdsToShow.includes(optionInfo.id);
    if (optionInfo.forceRender) {
      optionInfo.forceRender();
    }
  }
}
let xellOption;
let vsyncOption;
const onGfxCoreDropdownInit = (optionInfo) => {
  if (!Options.supportsGraphicOptions) {
    return;
  }
  switch (optionInfo.id) {
    case "option-gfx-profile":
      graphicsProfileSetter = () => {
        if (!optionInfo.dropdownItems) return;
        for (let i = 0; i < optionInfo.dropdownItems.length; i++) {
          const item = optionInfo.dropdownItems[i];
          if (item.profile == Options.graphicsOptions.profile) {
            optionInfo.selectedItemIndex = i;
            break;
          }
        }
        if (optionInfo.forceRender) {
          optionInfo.forceRender();
        }
      };
      graphicsProfileSetter();
      break;
    case "option-gfx-gpu":
      optionInfo.selectedItemIndex = optionInfo.dropdownItems?.findIndex(
        ({ deviceID }) => deviceID === Options.graphicsOptions.deviceID
      ) ?? 0;
      break;
    case "option-gfx-window":
      optionInfo.selectedItemIndex = optionInfo.dropdownItems?.findIndex(
        ({ fullscreen }) => fullscreen === Options.graphicsOptions.fullscreen
      ) ?? 0;
      break;
    case "option-gfx-res":
      optionInfo.selectedItemIndex = 0;
      if (Options.graphicsOptions.resolution.i != 0 && Options.graphicsOptions.resolution.j != 0) {
        for (let i = 0; i < Options.supportedOptions.resolutions.length; i++) {
          const width = Options.supportedOptions.resolutions[i].i;
          const height = Options.supportedOptions.resolutions[i].j;
          if (width === Options.graphicsOptions.resolution.i && height === Options.graphicsOptions.resolution.j) {
            optionInfo.selectedItemIndex = i + 1;
            break;
          }
        }
      }
      break;
    case "option-gfx-upscale-aa":
      const upscaleAASetter = () => {
        if (!optionInfo.dropdownItems) {
          return;
        }
        const autoItem = upscaleItemList.find((item) => item.mode == Options.graphicsOptions.autoUpscaleAA);
        if (autoItem) {
          optionInfo.dropdownItems[0].label = Locale.compose("LOC_OPTIONS_GFX_AUTO") + " - " + Locale.compose(autoItem.label);
        }
        if (optionInfo.forceRender) {
          optionInfo.forceRender();
        }
        optionInfo.selectedItemIndex = optionInfo.dropdownItems.findIndex(({ mode }) => {
          return mode === Options.graphicsOptions.upscaleAA;
        }) ?? 0;
      };
      addGraphicsOptionSetter(optionInfo, upscaleAASetter);
      upscaleAASetter();
      optionInfo.selectedItemIndex = optionInfo.dropdownItems?.findIndex(
        ({ mode }) => mode === Options.graphicsOptions.upscaleAA
      ) ?? 0;
      updateAntialiasingVisiblity();
      break;
  }
};
const onGfxCoreDropdownUpdate = ({ id, dropdownItems = [] }, value) => {
  switch (id) {
    case "option-gfx-profile": {
      const { profile } = dropdownItems[value];
      Options.graphicsOptions.profile = profile;
      onGraphicsProfileChanged();
      break;
    }
    case "option-gfx-gpu": {
      const { deviceID } = dropdownItems[value];
      Options.graphicsOptions.deviceID = deviceID;
      break;
    }
    case "option-gfx-window": {
      const { fullscreen } = dropdownItems[value];
      Options.graphicsOptions.fullscreen = fullscreen;
      break;
    }
    case "option-gfx-res": {
      const { resolution } = dropdownItems[value];
      Options.graphicsOptions.resolution.i = resolution.i;
      Options.graphicsOptions.resolution.j = resolution.j;
      break;
    }
    case "option-gfx-upscale-aa": {
      const { mode } = dropdownItems[value];
      Options.graphicsOptions.upscaleAA = mode;
      updateAntialiasingVisiblity();
      break;
    }
  }
};
const onGfxAntialiasingDropdownInit = (optionInfo) => {
  if (!Options.supportsGraphicOptions) {
    return;
  }
  switch (optionInfo.id) {
    case "option-gfx-msaa-quality":
      const msaaSelector = () => {
        optionInfo.selectedItemIndex = optionInfo.dropdownItems?.findIndex(
          ({ value }) => value === Options.graphicsOptions.msaaSamples
        ) ?? 0;
      };
      addGraphicsOptionSetter(optionInfo, msaaSelector);
      msaaSelector();
      break;
    case "option-gfx-xess-quality":
      const xessSelector = () => {
        optionInfo.selectedItemIndex = optionInfo.dropdownItems?.findIndex(
          ({ value }) => value === Options.graphicsOptions.xessQuality
        ) ?? 0;
      };
      addGraphicsOptionSetter(optionInfo, xessSelector);
      xessSelector();
      break;
    case "option-gfx-fsr1-quality":
      const fsr1Selector = () => {
        optionInfo.selectedItemIndex = optionInfo.dropdownItems?.findIndex(
          ({ value }) => value === Options.graphicsOptions.fsr1Quality
        ) ?? 0;
      };
      addGraphicsOptionSetter(optionInfo, fsr1Selector);
      fsr1Selector();
      break;
    case "option-gfx-fsr3-quality":
      const fsr3Selector = () => {
        optionInfo.selectedItemIndex = optionInfo.dropdownItems?.findIndex(
          ({ value }) => value === Options.graphicsOptions.fsr3Quality
        ) ?? 0;
      };
      addGraphicsOptionSetter(optionInfo, fsr3Selector);
      fsr3Selector();
      break;
    case "option-gfx-metalfxSpatial-quality":
      const metalfxSpatialSelector = () => {
        optionInfo.selectedItemIndex = optionInfo.dropdownItems?.findIndex(
          ({ value }) => value === Options.graphicsOptions.metalfxSpatialQuality
        ) ?? 0;
      };
      addGraphicsOptionSetter(optionInfo, metalfxSpatialSelector);
      metalfxSpatialSelector();
      break;
    case "option-gfx-metalfxTemporal-quality":
      const metalfxTemporalSelector = () => {
        optionInfo.selectedItemIndex = optionInfo.dropdownItems?.findIndex(
          ({ value }) => value === Options.graphicsOptions.metalfxTemporalQuality
        ) ?? 0;
      };
      addGraphicsOptionSetter(optionInfo, metalfxTemporalSelector);
      metalfxTemporalSelector();
      break;
  }
};
const onGfxAntialiasingDropdownUpdate = ({ id, dropdownItems = [] }, value) => {
  switch (id) {
    case "option-gfx-msaa-quality":
      Options.graphicsOptions.msaaSamples = dropdownItems[value].value;
      break;
    case "option-gfx-xess-quality":
      Options.graphicsOptions.xessQuality = dropdownItems[value].value;
      break;
    case "option-gfx-fsr1-quality":
      Options.graphicsOptions.fsr1Quality = dropdownItems[value].value;
      break;
    case "option-gfx-fsr3-quality":
      Options.graphicsOptions.fsr3Quality = dropdownItems[value].value;
      break;
    case "option-gfx-metalfxSpatial-quality":
      Options.graphicsOptions.metalfxSpatialQuality = dropdownItems[value].value;
      break;
    case "option-gfx-metalfxTemporal-quality":
      Options.graphicsOptions.metalfxTemporalQuality = dropdownItems[value].value;
      break;
  }
  onAdvancedOptionChanged();
};
const onGfxCoreCheckboxInit = (optionInfo) => {
  switch (optionInfo.id) {
    case "option-gfx-vsync":
      optionInfo.currentValue = Options.graphicsOptions.vsync;
      break;
    case "option-gfx-hdr":
      optionInfo.currentValue = Options.graphicsOptions.hdr;
      break;
    case "option-gfx-intel-xefg":
      optionInfo.currentValue = Options.graphicsOptions.frameGenerationMode == FrameGenerationMode.INTEL_XeFG;
      xellOption.currentValue = optionInfo.currentValue || Options.graphicsOptions.lowLatencyMode == LowLatencyMode.INTEL_XELL;
      xellOption.isDisabled = optionInfo.currentValue;
      break;
    case "option-gfx-intel-xell":
      optionInfo.currentValue = Options.graphicsOptions.lowLatencyMode == LowLatencyMode.INTEL_XELL || Options.graphicsOptions.frameGenerationMode == FrameGenerationMode.INTEL_XeFG;
      break;
  }
};
const onGfxCoreCheckboxUpdate = (optionInfo, value) => {
  switch (optionInfo.id) {
    case "option-gfx-vsync":
      Options.graphicsOptions.vsync = value;
      break;
    case "option-gfx-hdr":
      Options.graphicsOptions.hdr = value;
      break;
    case "option-gfx-intel-xefg":
      Options.graphicsOptions.frameGenerationMode = value ? FrameGenerationMode.INTEL_XeFG : FrameGenerationMode.NONE;
      if (value) {
        Options.graphicsOptions.lowLatencyMode = LowLatencyMode.INTEL_XELL;
        xellOption.currentValue = true;
        xellOption.isDisabled = true;
        Options.graphicsOptions.vsync = false;
        vsyncOption.currentValue = false;
      } else {
        xellOption.currentValue = Options.graphicsOptions.lowLatencyMode == LowLatencyMode.INTEL_XELL;
        xellOption.isDisabled = false;
      }
      xellOption.forceRender?.();
      vsyncOption.forceRender?.();
      break;
    case "option-gfx-intel-xell":
      Options.graphicsOptions.lowLatencyMode = value ? LowLatencyMode.INTEL_XELL : LowLatencyMode.NONE;
      break;
  }
};
function formatFramerateLimit(value) {
  if (value != 0) {
    return `${Math.round(value)}`;
  }
  return Locale.keyExists("LOC_OPTIONS_SYMBOL_INFINITY") ? Locale.compose("LOC_OPTIONS_SYMBOL_INFINITY") : "∞";
}
const onGfxCoreSliderInit = (optionInfo) => {
  switch (optionInfo.id) {
    case "option-gfx-frame-limit-game":
      optionInfo.currentValue = Options.graphicsOptions.framerateLimit;
      if (optionInfo.currentValue == 0) {
        optionInfo.currentValue = FRAMERATE_LIMIT_SLIDER_INF;
      }
      optionInfo.formattedValue = formatFramerateLimit(Options.graphicsOptions.framerateLimit);
      break;
  }
};
const onGfxCoreSliderUpdate = (optionInfo, value) => {
  switch (optionInfo.id) {
    case "option-gfx-frame-limit-game":
      const optionValue = value == FRAMERATE_LIMIT_SLIDER_INF ? 0 : value;
      Options.graphicsOptions.framerateLimit = optionValue;
      optionInfo.formattedValue = formatFramerateLimit(optionValue);
      break;
  }
};
const onGfxAdvancedDropdownInit = (optionInfo) => {
  switch (optionInfo.id) {
    case "option-gfx-ssao-quality":
      const ssaoQualitySetter = () => {
        optionInfo.selectedItemIndex = optionInfo.dropdownItems?.findIndex(({ value }) => {
          return value === Options.graphicsOptions.ssaoQuality;
        }) ?? 0;
      };
      addGraphicsOptionSetter(optionInfo, ssaoQualitySetter);
      ssaoQualitySetter();
      break;
    case "option-gfx-asset-quality":
      const assetQualitySetter = () => {
        optionInfo.selectedItemIndex = optionInfo.dropdownItems?.findIndex(({ value }) => {
          return value === Options.graphicsOptions.assetQuality;
        }) ?? 0;
      };
      addGraphicsOptionSetter(optionInfo, assetQualitySetter);
      assetQualitySetter();
      break;
    case "option-gfx-particle-quality":
      const particleQualitySetter = () => {
        optionInfo.selectedItemIndex = optionInfo.dropdownItems?.findIndex(({ value }) => {
          return value === Options.graphicsOptions.vfxQuality;
        }) ?? 0;
      };
      addGraphicsOptionSetter(optionInfo, particleQualitySetter);
      particleQualitySetter();
      break;
    case "option-gfx-texture-detail":
      const textureDetailSetter = () => {
        optionInfo.selectedItemIndex = optionInfo.dropdownItems?.findIndex(({ value }) => {
          return value === Options.graphicsOptions.textureDetail;
        }) ?? 0;
      };
      addGraphicsOptionSetter(optionInfo, textureDetailSetter);
      textureDetailSetter();
      break;
    case "option-gfx-shadow-quality":
      const shadowQualitySetter = () => {
        optionInfo.selectedItemIndex = optionInfo.dropdownItems?.findIndex(({ value }) => {
          return value === Options.graphicsOptions.shadowQuality;
        }) ?? 0;
      };
      addGraphicsOptionSetter(optionInfo, shadowQualitySetter);
      shadowQualitySetter();
      break;
    case "option-gfx-water-quality":
      const waterQualitySetter = () => {
        optionInfo.selectedItemIndex = optionInfo.dropdownItems?.findIndex(({ value }) => {
          return value === Options.graphicsOptions.waterQuality;
        }) ?? 0;
      };
      addGraphicsOptionSetter(optionInfo, waterQualitySetter);
      waterQualitySetter();
      break;
    case "option-gfx-sharpening":
      const sharpeningSetter = () => {
        optionInfo.selectedItemIndex = optionInfo.dropdownItems?.findIndex(({ value }) => {
          return value === Options.graphicsOptions.sharpeningLevel;
        }) ?? 0;
      };
      addGraphicsOptionSetter(optionInfo, sharpeningSetter);
      sharpeningSetter();
      break;
  }
};
const onGfxAdvancedDropdownUpdate = ({ id, dropdownItems = [] }, index) => {
  switch (id) {
    case "option-gfx-ssao-quality": {
      const { value } = dropdownItems[index];
      Options.graphicsOptions.ssaoQuality = value;
      break;
    }
    case "option-gfx-asset-quality": {
      const { value } = dropdownItems[index];
      Options.graphicsOptions.assetQuality = value;
      break;
    }
    case "option-gfx-particle-quality": {
      const { value } = dropdownItems[index];
      Options.graphicsOptions.vfxQuality = value;
      break;
    }
    case "option-gfx-texture-detail": {
      const { value } = dropdownItems[index];
      Options.graphicsOptions.textureDetail = value;
      break;
    }
    case "option-gfx-shadow-quality": {
      const { value } = dropdownItems[index];
      Options.graphicsOptions.shadowQuality = value;
      break;
    }
    case "option-gfx-water-quality": {
      const { value } = dropdownItems[index];
      Options.graphicsOptions.waterQuality = value;
      break;
    }
    case "option-gfx-sharpening": {
      const { value } = dropdownItems[index];
      Options.graphicsOptions.sharpeningLevel = value;
      break;
    }
  }
  onAdvancedOptionChanged();
};
const onGfxAdvancedCheckboxInit = (optionInfo) => {
  switch (optionInfo.id) {
    case "option-gfx-ssr":
      const ssrSetter = () => {
        optionInfo.currentValue = Options.graphicsOptions.enableSSR;
      };
      addGraphicsOptionSetter(optionInfo, ssrSetter);
      ssrSetter();
      break;
    case "option-gfx-ssshadows":
      const ssshadowsSetter = () => {
        optionInfo.currentValue = Options.graphicsOptions.enableSSShadows;
      };
      addGraphicsOptionSetter(optionInfo, ssshadowsSetter);
      ssshadowsSetter();
      break;
    case "option-gfx-ssoverlay":
      const ssoverlaySetter = () => {
        optionInfo.currentValue = Options.graphicsOptions.enableSSOverlay;
      };
      addGraphicsOptionSetter(optionInfo, ssoverlaySetter);
      ssoverlaySetter();
      break;
    case "option-gfx-bloom":
      const bloomSetter = () => {
        optionInfo.currentValue = Options.graphicsOptions.enableBloom;
      };
      addGraphicsOptionSetter(optionInfo, bloomSetter);
      bloomSetter();
      break;
  }
};
const onGfxAdvancedCheckboxUpdate = (optionInfo, value) => {
  switch (optionInfo.id) {
    case "option-gfx-ssr":
      Options.graphicsOptions.enableSSR = value;
      break;
    case "option-gfx-ssshadows":
      Options.graphicsOptions.enableSSShadows = value;
      break;
    case "option-gfx-ssoverlay":
      Options.graphicsOptions.enableSSOverlay = value;
      break;
    case "option-gfx-bloom":
      Options.graphicsOptions.enableBloom = value;
      break;
  }
  onAdvancedOptionChanged();
};
const onLongPressInit = (optionInfo) => {
  const value = UI.getOption("user", "Accessibility", "LongPressDelay");
  optionInfo.currentValue = value;
  optionInfo.formattedValue = `${value}`;
};
const onLongPressUpdate = (optionInfo, value) => {
  optionInfo.currentValue = value;
  optionInfo.formattedValue = `${value}`;
  UI.setOption("user", "Accessibility", "LongPressDelay", value);
  ContextManager.updateClickDuration();
};
const onTutorialLevelInit = (optionInfo) => {
  if (optionInfo.id != "option-tutoriallevel") {
    console.warn("The tutorial level handler was called by some other option '" + optionInfo.id + "'");
    return;
  }
  const value = Configuration.getUser().tutorialLevel;
  optionInfo.selectedItemIndex = value == 0 ? value : value / 2;
};
const onTutorialLevelUpdate = (optionInfo, value) => {
  if (optionInfo.id != "option-tutoriallevel") {
    console.warn("The tutorial level handler was called by some other option '" + optionInfo.id + "'");
    return;
  }
  const userConfig = Configuration.getUser();
  userConfig.setTutorialLevel(value * 2);
  optionInfo.selectedItemIndex = value;
};
const onCheckboxInit = (optionInfo) => {
  const option = UI.getOption(optionInfo.optionSet, optionInfo.optionType, optionInfo.optionName);
  if (typeof option === "number") {
    const toggleVal = Boolean(option);
    optionInfo.currentValue = toggleVal;
  }
};
const onCheckboxUpdate = (optionInfo, value) => {
  if (optionInfo.optionSet && optionInfo.optionType && optionInfo.optionName) {
    UI.setOption(optionInfo.optionSet, optionInfo.optionType, optionInfo.optionName, value ? 1 : 0);
  }
};
const onRemapInit = (optionInfo) => {
  optionInfo.currentValue = VisualRemaps.getRemapState(optionInfo.id) == VisualRemapSelection.Disabled ? false : true;
};
const onRemapUpdate = (optionInfo, value) => {
  VisualRemaps.setRemapState(optionInfo.id, value ? VisualRemapSelection.Enabled : VisualRemapSelection.Disabled);
};
const onPromotionalContentUpdate = (optionInfo, value) => {
  if (optionInfo.optionSet && optionInfo.optionType && optionInfo.optionName) {
    UI.setOption(optionInfo.optionSet, optionInfo.optionType, optionInfo.optionName, value ? 1 : 0);
    Online.Promo.reloadPromos();
  }
};
const onMapCursorSpeedInit = (optionInfo) => {
  const userConfig = Configuration.getUser();
  optionInfo.currentValue = userConfig.mapCursorSpeed;
  optionInfo.formattedValue = `${userConfig.mapCursorSpeed}%`;
};
const onMapCursorSpeedUpdate = (optionInfo, value) => {
  const userConfig = Configuration.getUser();
  userConfig.setMapCursorSpeed(value);
  optionInfo.currentValue = userConfig.mapCursorSpeed;
  optionInfo.formattedValue = `${userConfig.mapCursorSpeed}%`;
};
const onMapCursorDirectionalInit = (optionInfo) => {
  const userConfig = Configuration.getUser();
  optionInfo.currentValue = userConfig.mapCursorDirectional;
};
const onMapCursorDirectionalUpdate = (optionInfo, value) => {
  const userConfig = Configuration.getUser();
  userConfig.setMapCursorDirectional(value);
  optionInfo.currentValue = userConfig.mapCursorDirectional;
};
const onAdaptiveTriggersInit = (optionInfo) => {
  const value = Configuration.getUser().adaptiveTriggersEnabled;
  optionInfo.currentValue = value;
};
const onAdaptiveTriggersUpdate = (optionInfo, value) => {
  const userConfig = Configuration.getUser();
  userConfig.setAdaptiveTriggersEnabled(value);
  optionInfo.currentValue = userConfig.adaptiveTriggersEnabled;
  Options.inputRefreshRequired = true;
};
const onRumbleInit = (optionInfo) => {
  optionInfo.currentValue = Configuration.getUser().rumbleEnabled;
};
const onRumbleUpdate = (optionInfo, value) => {
  Configuration.getUser().setRumbleEnabled(value);
  optionInfo.currentValue = value;
  UI.refreshInput();
  if (value) {
    Input.triggerForceFeedback(
      FORCE_FEEDBACK_OPTION_LOW,
      FORCE_FEEDBACK_OPTION_HIGH,
      FORCE_FEEDBACK_OPTION_DURATION
    );
  }
};
const onAutoSaveKeepCountInit = (optionInfo) => {
  const value = Configuration.getUser().autoSaveKeepCount;
  optionInfo.currentValue = value;
  optionInfo.formattedValue = `${value}`;
};
const onAutoSaveKeepCountUpdate = (optionInfo, value) => {
  optionInfo.currentValue = value;
  optionInfo.formattedValue = `${value}`;
  Configuration.getUser().setAutoSaveKeepCount(value);
};
const onAutoSaveFrequencyInit = (optionInfo) => {
  const value = Configuration.getUser().autoSaveFrequency;
  optionInfo.currentValue = value;
  optionInfo.formattedValue = `${value}`;
};
const onAutoSaveFrequencyUpdate = (optionInfo, value) => {
  optionInfo.currentValue = value;
  optionInfo.formattedValue = `${value}`;
  Configuration.getUser().setAutoSaveFrequency(value);
};
const onAccessibilityInit = (optionInfo) => {
  switch (optionInfo.id) {
    case "option-acc-colorblind":
      optionInfo.currentValue = optionInfo.originalValue = Configuration.getUser().colorblindAdaptation;
      optionInfo.selectedItemIndex = optionInfo.currentValue;
      break;
  }
};
const onAccessibilityUpdate = (optionInfo, value) => {
  optionInfo.currentValue = value;
  if (optionInfo.currentValue != optionInfo.originalValue) {
    Options.needReloadRefCount += 1;
  } else {
    if (Options.needReloadRefCount > 0) {
      Options.needReloadRefCount -= 1;
    }
  }
  Configuration.getUser().setColorblindAdaptation(value);
};
const onTooltipDelayInit = (optionInfo) => {
  optionInfo.currentValue = Configuration.getUser().tooltipDelay;
  const adjustedValue = Math.round((optionInfo.currentValue * 1e-3 + Number.EPSILON) * 10) / 10;
  optionInfo.formattedValue = Locale.compose("LOC_OPTIONS_TOOLTIP_DELAY_VALUE", adjustedValue);
};
const onTooltipDelayUpdate = (optionInfo, value) => {
  Configuration.getUser().setTooltipDelay(value);
  optionInfo.currentValue = Configuration.getUser().tooltipDelay;
  const adjustedValue = Math.round((optionInfo.currentValue * 1e-3 + Number.EPSILON) * 10) / 10;
  optionInfo.formattedValue = Locale.compose("LOC_OPTIONS_TOOLTIP_DELAY_VALUE", adjustedValue);
};
const onCameraPanningSpeedInit = (optionInfo) => {
  const userConfig = Configuration.getUser();
  optionInfo.currentValue = userConfig.cameraPanningSpeed;
  optionInfo.formattedValue = `${userConfig.cameraPanningSpeed}%`;
};
const onCameraPanningSpeedUpdate = (optionInfo, value) => {
  const userConfig = Configuration.getUser();
  userConfig.setCameraPanningSpeed(value);
  optionInfo.currentValue = userConfig.cameraPanningSpeed;
  optionInfo.formattedValue = `${userConfig.cameraPanningSpeed}%`;
};
const onEdgePanUpdate = (optionInfo, value) => {
  UI.setOption(optionInfo.optionSet, optionInfo.optionType, "EdgePan", value ? 1 : 0);
  UI.setOption(optionInfo.optionSet, optionInfo.optionType, "ClipCursor", value ? 1 : 0);
  Options.inputRefreshRequired = true;
};
const onUiFontScaleInit = (optionInfo) => {
  const { uiFontScale } = Configuration.getUser();
  if (optionInfo.dropdownItems) {
    for (let index = 0; index < optionInfo.dropdownItems.length; ++index) {
      if (optionInfo.dropdownItems[index].scale == uiFontScale) {
        optionInfo.selectedItemIndex = index;
        break;
      }
    }
  }
};
const onUiFontScaleUpdate = (optionInfo, value) => {
  const newScale = (optionInfo.dropdownItems?.[value]).scale;
  Configuration.getUser().setUiFontScale(newScale);
};
const onUiExperienceInit = (optionInfo) => {
  const experience = UI.getViewExperience();
  if (optionInfo.dropdownItems) {
    for (let index = 0; index < optionInfo.dropdownItems.length; ++index) {
      if (optionInfo.dropdownItems[index].experience == experience) {
        optionInfo.selectedItemIndex = index;
        break;
      }
    }
    optionInfo.currentValue = optionInfo.originalValue = experience;
  }
};
const onUiExperienceUpdate = (optionInfo, value) => {
  const newExperience = (optionInfo.dropdownItems?.[value]).experience;
  UI.setViewExperience(newExperience);
  optionInfo.currentValue = newExperience;
  if (optionInfo.currentValue != optionInfo.originalValue) {
    Options.needReloadRefCount += 1;
  } else {
    if (Options.needReloadRefCount > 0) {
      Options.needReloadRefCount -= 1;
    }
  }
};
const onUiExperienceRestore = (optionInfo) => {
  if (optionInfo.currentValue != optionInfo.originalValue) {
    if (optionInfo.originalValue == void 0) {
      console.error("options.ts: onUiExperienceRestore() - originalValue was undefined!");
      return;
    }
    UI.setViewExperience(optionInfo.originalValue);
    optionInfo.currentValue = optionInfo.originalValue;
  }
};
const onUiAutoScaleInit = (optionInfo) => {
  const value = Configuration.getUser().uiAutoScale;
  optionInfo.currentValue = value;
};
const onUiAutoScaleUpdate = (optionInfo, value) => {
  Configuration.getUser().setUiAutoScale(value);
  optionInfo.currentValue = Configuration.getUser().uiAutoScale;
};
const onShowIntroVideoInit = (optionInfo) => {
  const value = UI.isShowIntroSequences();
  optionInfo.currentValue = value;
};
const onShowIntroVideoUpdate = (optionInfo, value) => {
  UI.SetShowIntroSequences(value ? 1 : 0);
  optionInfo.currentValue = value;
};
Options.addInitCallback(() => {
  const viewExperience = UI.getViewExperience();
  const isConsole = viewExperience == UIViewExperience.Handheld || viewExperience == UIViewExperience.Console;
  const isMainMenu = UI.isInShell();
  if (Options.supportedOptions.gamepad) {
    if (UI.useReadOnlyInputMappingScreen()) {
      Options.addOption({
        category: CategoryType.Accessibility,
        group: "general",
        type: OptionType.Editor,
        id: "option-remap-controller",
        editorTagName: "editor-controller-mapping",
        label: "LOC_OPTIONS_REMAP_CONTROLLER",
        description: "LOC_OPTIONS_REMAP_VIEW_ONLY_DESCRIPTION",
        caption: "LOC_OPTIONS_REMAP_VIEW_ONLY_TEXT",
        activateListener: () => Input.showSystemBindingPanel()
      });
    } else {
      Options.addOption({
        category: CategoryType.Accessibility,
        group: "general",
        type: OptionType.Editor,
        id: "option-remap-controller",
        editorTagName: "editor-controller-mapping",
        label: "LOC_OPTIONS_REMAP_CONTROLLER",
        description: "LOC_OPTIONS_REMAP_CONTROLLER_DESCRIPTION",
        caption: "LOC_OPTIONS_REMAP_CONTROLLER_TEXT",
        activateListener: () => Input.showSystemBindingPanel()
      });
    }
  }
  if (Options.supportedOptions.keyboard) {
    if (UI.useReadOnlyInputMappingScreen()) {
      Options.addOption({
        category: CategoryType.Accessibility,
        group: "general",
        type: OptionType.Editor,
        id: "option-remap-kbm",
        editorTagName: "editor-keyboard-mapping",
        label: "LOC_OPTIONS_REMAP_KBM",
        description: "LOC_OPTIONS_REMAP_VIEW_ONLY_DESCRIPTION",
        caption: "LOC_OPTIONS_REMAP_VIEW_ONLY_TEXT"
      });
    } else {
      Options.addOption({
        category: CategoryType.Accessibility,
        group: "general",
        type: OptionType.Editor,
        id: "option-remap-kbm",
        editorTagName: "editor-keyboard-mapping",
        label: "LOC_OPTIONS_REMAP_KBM",
        description: "LOC_OPTIONS_REMAP_KBM_DESCRIPTION",
        caption: "LOC_OPTIONS_REMAP_KBM_TEXT"
      });
    }
  }
  const colorblindAdaptationModes = [
    { label: "LOC_OPTIONS_ACCESSIBILITY_COLORBLIND_NONE" },
    { label: "LOC_OPTIONS_ACCESSIBILITY_COLORBLIND_PROTANOPIA" },
    { label: "LOC_OPTIONS_ACCESSIBILITY_COLORBLIND_DEUTERANOPIA" },
    { label: "LOC_OPTIONS_ACCESSIBILITY_COLORBLIND_TRITANOPIA" }
  ];
  const colorblindAdaptationDescription = isMainMenu ? "LOC_OPTIONS_ACCESSIBILITY_COLORBLIND_DESCRIPTION" : "LOC_OPTIONS_DISABLED_IN_GAME";
  Options.addOption({
    category: CategoryType.Accessibility,
    group: "general",
    type: OptionType.Dropdown,
    id: "option-acc-colorblind",
    initListener: onAccessibilityInit,
    updateListener: onAccessibilityUpdate,
    label: "LOC_OPTIONS_ACCESSIBILITY_COLORBLIND",
    description: colorblindAdaptationDescription,
    dropdownItems: colorblindAdaptationModes,
    isDisabled: !isMainMenu
  });
  const uiFontScaleRanges = isConsole ? [
    { label: "LOC_OPTIONS_UI_SCALE_SMALL", scale: FontScale$1.Small },
    { label: "LOC_OPTIONS_UI_SCALE_MEDIUM", scale: FontScale$1.Medium },
    { label: "LOC_OPTIONS_UI_SCALE_LARGE", scale: FontScale$1.Large }
  ] : [
    { label: "LOC_OPTIONS_UI_SCALE_EXTRA_SMALL", scale: FontScale$1.XSmall },
    { label: "LOC_OPTIONS_UI_SCALE_SMALL", scale: FontScale$1.Small },
    { label: "LOC_OPTIONS_UI_SCALE_MEDIUM", scale: FontScale$1.Medium },
    { label: "LOC_OPTIONS_UI_SCALE_LARGE", scale: FontScale$1.Large },
    { label: "LOC_OPTIONS_UI_SCALE_EXTRA_LARGE", scale: FontScale$1.XLarge }
  ];
  Options.addOption({
    category: CategoryType.Accessibility,
    group: "general",
    type: OptionType.Dropdown,
    id: "option-system-uifontscale",
    initListener: onUiFontScaleInit,
    updateListener: onUiFontScaleUpdate,
    label: "LOC_OPTIONS_UI_SCALE",
    description: "LOC_OPTIONS_UI_SCALE_DESCRIPTION",
    dropdownItems: uiFontScaleRanges
  });
  const expItemList = [
    { label: "LOC_OPTIONS_UI_EXPERIENCE_HANDHELD", experience: UIViewExperience.Handheld },
    { label: "LOC_OPTIONS_UI_EXPERIENCE_CONSOLE", experience: UIViewExperience.Console },
    { label: "LOC_OPTIONS_UI_EXPERIENCE_DESKTOP", experience: UIViewExperience.Desktop }
  ];
  if (UI.hasViewExperience()) {
    Options.addOption({
      category: CategoryType.Accessibility,
      group: "general",
      type: OptionType.Dropdown,
      id: "option-system-uiexperience",
      initListener: onUiExperienceInit,
      updateListener: onUiExperienceUpdate,
      restoreListener: onUiExperienceRestore,
      label: "LOC_OPTIONS_UI_EXPERIENCE",
      description: "LOC_OPTIONS_UI_EXPERIENCE_DESCRIPTION",
      dropdownItems: expItemList
    });
  }
  if (UI.supportsHIDPI() && UI.canSetAutoScaling()) {
    Options.addOption({
      category: CategoryType.Accessibility,
      group: "general",
      type: OptionType.Checkbox,
      initListener: onUiAutoScaleInit,
      updateListener: onUiAutoScaleUpdate,
      id: "option-system-uiautoscale",
      label: "LOC_OPTIONS_UI_AUTO_SCALE",
      description: "LOC_OPTIONS_UI_AUTO_SCALE_DESCRIPTION",
      optionSet: "",
      optionType: "",
      optionName: ""
    });
  }
  if (TtsManager.isTtsSupported) {
    Options.addOption({
      category: CategoryType.Accessibility,
      group: "general",
      type: OptionType.Checkbox,
      id: "option-tts-hover",
      initListener: onCheckboxInit,
      updateListener: onCheckboxUpdate,
      label: "LOC_OPTIONS_NARRATE_HOVER",
      description: "LOC_OPTIONS_NARRATE_HOVER_DESCRIPTION",
      optionSet: "user",
      optionType: "Accessibility",
      optionName: "TextToSpeechOnHover"
    });
    Options.addOption({
      category: CategoryType.Accessibility,
      group: "general",
      type: OptionType.Checkbox,
      id: "option-tts-chat",
      initListener: onCheckboxInit,
      updateListener: onCheckboxUpdate,
      label: "LOC_OPTIONS_NARRATE_CHAT",
      description: "LOC_OPTIONS_NARRATE_CHAT_DESCRIPTION",
      optionSet: "user",
      optionType: "Accessibility",
      optionName: "TextToSpeechOnChat"
    });
  }
  if (UI.supportsTouchscreenTapDelay()) {
    Options.addOption({
      category: CategoryType.Accessibility,
      group: "general",
      type: OptionType.Slider,
      id: "option-longpressdelay",
      initListener: onLongPressInit,
      updateListener: onLongPressUpdate,
      label: "LOC_OPTIONS_ACCESSIBILITY_LONG_PRESS",
      description: "LOC_OPTIONS_ACCESSIBILITY_LONG_PRESS_DESCRIPTION",
      min: 100,
      max: 1e3,
      steps: 9
    });
  }
  Options.addOption({
    category: CategoryType.Accessibility,
    group: "subtitles",
    type: OptionType.Checkbox,
    id: "option-audio-subtitles",
    initListener: onSubtitlesInit,
    updateListener: onSubtitlesUpdate,
    label: "LOC_OPTIONS_SUBTITLES",
    description: "LOC_OPTIONS_SUBTITLES_DESCRIPTION",
    optionSet: "",
    optionType: "",
    optionName: ""
  });
  const audioDynamicRanges = [
    { label: "LOC_OPTIONS_AUDIO_DYNAMIC_RANGE_WIDE", tooltip: "LOC_OPTIONS_AUDIO_DYNAMIC_RANGE_WIDE_DESCRIPTION" },
    {
      label: "LOC_OPTIONS_AUDIO_DYNAMIC_RANGE_STANDARD",
      tooltip: "LOC_OPTIONS_AUDIO_DYNAMIC_RANGE_STANDARD_DESCRIPTION"
    },
    {
      label: "LOC_OPTIONS_AUDIO_DYNAMIC_RANGE_NARROW",
      tooltip: "LOC_OPTIONS_AUDIO_DYNAMIC_RANGE_NARROW_DESCRIPTION"
    }
  ];
  const volumeBase = {
    category: CategoryType.Audio,
    group: "volume",
    type: OptionType.Slider,
    initListener: onVolumeInit,
    updateListener: onVolumeUpdate,
    min: 0,
    max: 1,
    steps: 20
  };
  Options.addOption({
    ...volumeBase,
    id: "option-audio-master",
    group: "general",
    label: "LOC_OPTIONS_AUDIO_VOLUME_MASTER",
    description: "LOC_OPTIONS_AUDIO_VOLUME_MASTER_DESCRIPTION"
  });
  Options.addOption({
    ...volumeBase,
    id: "option-audio-music",
    group: "general",
    label: "LOC_OPTIONS_AUDIO_VOLUME_MUSIC",
    description: "LOC_OPTIONS_AUDIO_VOLUME_MUSIC_DESCRIPTION"
  });
  Options.addOption({
    ...volumeBase,
    id: "option-audio-sfx",
    group: "general",
    label: "LOC_OPTIONS_AUDIO_VOLUME_SFX",
    description: "LOC_OPTIONS_AUDIO_VOLUME_SFX_DESCRIPTION"
  });
  Options.addOption({
    ...volumeBase,
    id: "option-audio-cinematics",
    group: "general",
    label: "LOC_OPTIONS_AUDIO_VOLUME_CINEMATICS",
    description: "LOC_OPTIONS_AUDIO_VOLUME_CINEMATICS_DESCRIPTION"
  });
  Options.addOption({
    ...volumeBase,
    id: "option-audio-ui",
    group: "general",
    label: "LOC_OPTIONS_AUDIO_VOLUME_UI",
    description: "LOC_OPTIONS_AUDIO_VOLUME_UI_DESCRIPTION"
  });
  Options.addOption({
    ...volumeBase,
    id: "option-audio-voice",
    group: "general",
    label: "LOC_OPTIONS_AUDIO_VOLUME_VOICE",
    description: "LOC_OPTIONS_AUDIO_VOLUME_VOICE_DESCRIPTION"
  });
  Options.addOption({
    category: CategoryType.Audio,
    group: "advanced",
    type: OptionType.Dropdown,
    id: "option-audio-dynamic-range",
    initListener: onAudioDynRangeInit,
    updateListener: onAudioDynRangeUpdate,
    label: "LOC_OPTIONS_AUDIO_DYNAMIC_RANGE",
    description: "LOC_OPTIONS_AUDIO_DYNAMIC_RANGE_DESCRIPTION",
    dropdownItems: audioDynamicRanges
  });
  if (Options.supportedOptions.muteOnFocusLoss) {
    Options.addOption({
      category: CategoryType.Audio,
      group: "advanced",
      type: OptionType.Checkbox,
      id: "option-audio-muteonfocusloss",
      initListener: onMuteOnFocusLossInit,
      updateListener: onMuteOnFocusLossUpdate,
      label: "LOC_OPTIONS_AUDIO_MUTEONFOCUSLOSS",
      description: "LOC_OPTIONS_AUDIO_MUTEONFOCUSLOSS_DESCRIPTION",
      optionSet: "",
      optionType: "",
      optionName: ""
    });
  }
  Options.addOption({
    category: CategoryType.Game,
    group: "general",
    type: OptionType.Checkbox,
    id: "option-autoendturn",
    initListener: onCheckboxInit,
    updateListener: onCheckboxUpdate,
    label: "LOC_OPTIONS_AUTOENDTURN",
    description: "LOC_OPTIONS_AUTOENDTURN_DESCRIPTION",
    optionSet: "user",
    optionType: "Gameplay",
    optionName: "AutoEndTurn"
  });
  Options.addOption({
    category: CategoryType.Game,
    group: "general",
    type: OptionType.Checkbox,
    id: "option-unitcycle-remainingmoves",
    initListener: onCheckboxInit,
    updateListener: onCheckboxUpdate,
    label: "LOC_OPTIONS_UNITCYCLE_REMAININGMOVES",
    description: "LOC_OPTIONS_UNITCYCLE_REMAININGMOVES_DESCRIPTION",
    optionSet: "user",
    optionType: "Gameplay",
    optionName: "UnitCycle_RemainingMoves"
  });
  Options.addOption({
    category: CategoryType.Game,
    group: "general",
    type: OptionType.Checkbox,
    id: "option-autounitcycle",
    initListener: onCheckboxInit,
    updateListener: onCheckboxUpdate,
    label: "LOC_OPTIONS_AUTOUNITYCYCLE",
    description: "LOC_OPTIONS_AUTOUNITYCYCLE_DESCRIPTION",
    optionSet: "user",
    optionType: "Gameplay",
    optionName: "AutoUnitCycle"
  });
  Options.addOption({
    category: CategoryType.Game,
    group: "general",
    type: OptionType.Checkbox,
    id: "option-quickmovement",
    initListener: onCheckboxInit,
    updateListener: onCheckboxUpdate,
    label: "LOC_OPTIONS_QUICK_MOVEMENT",
    description: "LOC_OPTIONS_QUICK_MOVEMENT_DESCRIPTION",
    optionSet: "user",
    optionType: "Gameplay",
    optionName: "QuickMovement"
  });
  Options.addOption({
    category: CategoryType.Game,
    group: "general",
    type: OptionType.Checkbox,
    id: "option-productionpanelstayopen",
    initListener: onCheckboxInit,
    updateListener: onCheckboxUpdate,
    label: "LOC_OPTIONS_PRODUCTIONPANEL_STAYSOPEN",
    description: "LOC_OPTIONS_PRODUCTIONPANEL_STAYSOPEN_DESCRIPTION",
    optionSet: "user",
    optionType: "Gameplay",
    optionName: "ProductionPanelStayOpen"
  });
  Options.addOption({
    category: CategoryType.Game,
    group: "general",
    type: OptionType.Dropdown,
    id: "option-productionpanel-buildinginfotype",
    initListener: onProductionPanelBuildingInfoTypeInit,
    updateListener: onProductionPanelBuildingInfoTypeUpdate,
    label: "LOC_OPTIONS_PRODUCTIONPANEL_BUILDINGINFO",
    description: "LOC_OPTIONS_PRODUCTIONPANEL_BUILDINGINFO_DESCRIPTION",
    dropdownItems: [
      {
        label: "LOC_OPTIONS_PRODUCTIONPANEL_BUILDINGINFO_BASEYIELD",
        tooltip: "LOC_OPTIONS_PRODUCTIONPANEL_BUILDINGINFO_BASEYIELD_TOOLTIP",
        value: "base-yield"
      },
      {
        label: "LOC_OPTIONS_PRODUCTIONPANEL_BUILDINGINFO_YIELDPREVIEW",
        tooltip: "LOC_OPTIONS_PRODUCTIONPANEL_BUILDINGINFO_YIELDPREVIEW_TOOLTIP",
        value: "yield-preview"
      }
    ]
  });
  const tutorialItemList = [
    { label: "LOC_OPTIONS_GAME_TUTORIAL_0", tooltip: "LOC_OPTIONS_GAME_TUTORIAL_0_DESCRIPTION" },
    { label: "LOC_OPTIONS_GAME_TUTORIAL_1", tooltip: "LOC_OPTIONS_GAME_TUTORIAL_1_DESCRIPTION" },
    { label: "LOC_OPTIONS_GAME_TUTORIAL_2", tooltip: "LOC_OPTIONS_GAME_TUTORIAL_2_DESCRIPTION" }
  ];
  Options.addOption({
    category: CategoryType.Game,
    group: "general",
    type: OptionType.Dropdown,
    id: "option-tutoriallevel",
    initListener: onTutorialLevelInit,
    updateListener: onTutorialLevelUpdate,
    label: "LOC_OPTIONS_TUTORIALLEVEL",
    description: "LOC_OPTIONS_TUTORIALLEVEL_DESCRIPTION",
    dropdownItems: tutorialItemList
  });
  if (Network.canDisablePromotions()) {
    Options.addOption({
      category: CategoryType.Game,
      type: OptionType.Checkbox,
      id: "option-promotions",
      initListener: onCheckboxInit,
      updateListener: onPromotionalContentUpdate,
      label: "LOC_OPTIONS_PROMOTIONS",
      description: "LOC_OPTIONS_PROMOTIONS_DESCRIPTION",
      optionSet: "network",
      optionType: "Network",
      optionName: "Promotions"
    });
  }
  const maxAutoSaveKeep = Configuration.getUser().maxAutoSaveKeepCount;
  Options.addOption({
    category: CategoryType.Game,
    group: "autosaves",
    type: OptionType.Slider,
    id: "option-autosavekeepcount",
    initListener: onAutoSaveKeepCountInit,
    updateListener: onAutoSaveKeepCountUpdate,
    label: "LOC_OPTIONS_AUTOSAVE_KEEP_COUNT",
    description: "LOC_OPTIONS_AUTOSAVE_KEEP_COUNT_DESCRIPTION",
    min: 1,
    max: maxAutoSaveKeep,
    currentValue: -1,
    steps: maxAutoSaveKeep - 1
  });
  const minimumAutoSaveFrequency = Configuration.getUser().minimumAutoSaveFrequency;
  Options.addOption({
    category: CategoryType.Game,
    type: OptionType.Slider,
    id: "option-autosavefrequency",
    initListener: onAutoSaveFrequencyInit,
    updateListener: onAutoSaveFrequencyUpdate,
    label: "LOC_OPTIONS_AUTOSAVE_BETWEEN",
    description: "LOC_OPTIONS_AUTOSAVE_BETWEEN_DESCRIPTION",
    min: 1,
    max: minimumAutoSaveFrequency,
    currentValue: -1,
    steps: minimumAutoSaveFrequency - 1
  });
  if (Network.hasCrossPlayPrivilege()) {
    Options.addOption({
      category: CategoryType.Game,
      group: "advanced",
      type: OptionType.Checkbox,
      id: "option-crossplay",
      initListener: onCheckboxInit,
      updateListener: onCheckboxUpdate,
      label: "LOC_OPTIONS_CROSSPLAY",
      description: "LOC_OPTIONS_CROSSPLAY_DESCRIPTION",
      optionSet: "network",
      optionType: "Network",
      optionName: "Crossplay"
    });
  }
  const remaps = VisualRemaps.getAvailableRemaps();
  for (const item of remaps) {
    Options.addOption({
      category: CategoryType.Game,
      group: "extras",
      type: OptionType.Checkbox,
      id: item.id,
      initListener: onRemapInit,
      updateListener: onRemapUpdate,
      label: item.displayName,
      isDisabled: !isMainMenu,
      description: !isMainMenu ? "LOC_OPTIONS_DISABLED_IN_GAME" : ""
    });
  }
  advancedGraphicsOptionSetters.length = 0;
  const supportedOptions = Options.supportedOptions;
  if (supportedOptions.gpus.length > 0) {
    const ddGPUItems = [];
    for (let i = 0; i < Options.supportedOptions.gpus.length; i++) {
      const gpu = Options.supportedOptions.gpus[i];
      ddGPUItems.push({ label: gpu.name, deviceID: gpu.deviceID });
    }
    Options.addOption({
      category: CategoryType.Graphics,
      group: "general",
      type: OptionType.Dropdown,
      id: "option-gfx-gpu",
      initListener: onGfxCoreDropdownInit,
      updateListener: onGfxCoreDropdownUpdate,
      label: "LOC_OPTIONS_GFX_GPU_SELECTION",
      description: "LOC_OPTIONS_GFX_GPU_SELECTION_DESCRIPTION",
      dropdownItems: ddGPUItems
    });
  }
  if (supportedOptions.canChangeScreenMode) {
    const ddWindowItems = [
      { label: "LOC_OPTIONS_GFX_SCREEN_MODE_WINDOWED", fullscreen: false },
      { label: "LOC_OPTIONS_GFX_SCREEN_MODE_FULLSCREEN", fullscreen: true }
      // isborderless
    ];
    const option = {
      category: CategoryType.Graphics,
      group: "general",
      type: OptionType.Dropdown,
      id: "option-gfx-window",
      initListener: onGfxCoreDropdownInit,
      updateListener: onGfxCoreDropdownUpdate,
      label: "LOC_OPTIONS_GFX_SCREEN_MODE",
      description: "LOC_OPTIONS_GFX_SCREEN_MODE_DESCRIPTION",
      dropdownItems: ddWindowItems
    };
    Options.addOption(option);
  }
  if (supportedOptions.resolutions.length > 0) {
    const resItemList = [{ label: "LOC_OPTIONS_GFX_AUTO", resolution: { i: 0, j: 0 } }];
    for (const res of supportedOptions.resolutions) {
      resItemList.push({ label: `${res.i} x ${res.j}`, resolution: res });
    }
    Options.addOption({
      category: CategoryType.Graphics,
      group: "general",
      type: OptionType.Dropdown,
      id: "option-gfx-res",
      initListener: onGfxCoreDropdownInit,
      updateListener: onGfxCoreDropdownUpdate,
      label: "LOC_OPTIONS_GFX_RESOLUTION",
      description: "LOC_OPTIONS_GFX_RESOLUTION_DESCRIPTION",
      dropdownItems: resItemList
    });
  }
  if (supportedOptions.canChangeVSync) {
    vsyncOption = {
      category: CategoryType.Graphics,
      group: "general",
      type: OptionType.Checkbox,
      id: "option-gfx-vsync",
      initListener: onGfxCoreCheckboxInit,
      updateListener: onGfxCoreCheckboxUpdate,
      label: "LOC_OPTIONS_GFX_VSYNC",
      description: "LOC_OPTIONS_GFX_VSYNC_DESCRIPTION"
    };
    Options.addOption(vsyncOption);
    const frameLimitSliderBase = {
      category: CategoryType.Graphics,
      group: "general",
      type: OptionType.Slider,
      initListener: onGfxCoreSliderInit,
      updateListener: onGfxCoreSliderUpdate,
      min: FRAMERATE_LIMIT_SLIDER_MIN,
      max: FRAMERATE_LIMIT_SLIDER_INF
    };
    Options.addOption({
      ...frameLimitSliderBase,
      id: "option-gfx-frame-limit-game",
      label: "LOC_OPTIONS_GFX_FRAME_RATE_LIMIT",
      description: "LOC_OPTIONS_GFX_FRAME_RATE_LIMIT_DESCRIPTION",
      currentValue: Options.graphicsOptions.framerateLimit
    });
  }
  if (supportedOptions.canChangeAAUpscale) {
    const autoItem = upscaleItemList.find((item) => item.mode == Options.graphicsOptions.autoUpscaleAA);
    upscaleItemList[0].label += autoItem ? " - " + Locale.compose(autoItem.label) : "";
    Options.addOption({
      category: CategoryType.Graphics,
      group: "general",
      type: OptionType.Dropdown,
      id: "option-gfx-upscale-aa",
      initListener: onGfxCoreDropdownInit,
      updateListener: onGfxCoreDropdownUpdate,
      label: "LOC_OPTIONS_GFX_UPSCALE_AA",
      description: "LOC_OPTIONS_GFX_UPSCALE_AA_DESCRIPTION",
      dropdownItems: upscaleItemList
    });
  }
  if (supportedOptions.profiles.length > 0) {
    const ddProfileItems = [];
    for (const profile of supportedOptions.profiles) {
      const name = UI.getGraphicsProfile(profile);
      const label = "LOC_OPTIONS_GFX_PROFILE_" + name.toUpperCase();
      ddProfileItems.push({ label, profile, disabled: !isMainMenu });
    }
    if (Options.showCustomGraphicsProfile) {
      ddProfileItems.push({ label: "LOC_OPTIONS_GFX_PROFILE_CUSTOM", profile: GraphicsProfile.CUSTOM });
    }
    Options.addOption({
      category: CategoryType.Graphics,
      group: "general",
      type: OptionType.Dropdown,
      id: "option-gfx-profile",
      initListener: onGfxCoreDropdownInit,
      updateListener: onGfxCoreDropdownUpdate,
      label: "LOC_OPTIONS_GFX_PROFILE",
      description: "LOC_OPTIONS_GFX_PROFILE_DESCRIPTION",
      dropdownItems: ddProfileItems,
      isDisabled: !Options.showCustomGraphicsProfile && !isMainMenu
    });
  }
  if (supportedOptions.hdr) {
    if (supportedOptions.canDisableHDR) {
      const EnableHDRDescription = isMainMenu ? "LOC_OPTIONS_GFX_ENABLE_HDR_DESCRIPTION" : "LOC_OPTIONS_DISABLED_IN_GAME";
      Options.addOption({
        category: CategoryType.Graphics,
        group: "general",
        type: OptionType.Checkbox,
        id: "option-gfx-hdr",
        initListener: onGfxCoreCheckboxInit,
        updateListener: onGfxCoreCheckboxUpdate,
        label: "LOC_OPTIONS_GFX_ENABLE_HDR",
        description: EnableHDRDescription,
        optionSet: "user",
        optionType: "Graphics",
        optionName: "UseHDR",
        isDisabled: !isMainMenu,
        currentValue: Options.graphicsOptions.hdr
      });
    }
    const CalibrateHDRDescription = isMainMenu ? "LOC_OPTIONS_GFX_CALIBRATE_HDR_DESCRIPTION" : "LOC_OPTIONS_DISABLED_IN_GAME";
    Options.addOption({
      category: CategoryType.Graphics,
      group: "general",
      type: OptionType.Editor,
      id: "option-gfx-calibrate-hdr",
      editorTagName: "editor-calibrate-hdr",
      pushProperties: { singleton: true, createMouseGuard: true, attributes: { shouldDarken: false } },
      label: "",
      description: CalibrateHDRDescription,
      caption: "LOC_OPTIONS_GFX_CALIBRATE_HDR",
      isDisabled: !isMainMenu
    });
  } else {
  }
  if (Options.supportsGraphicOptions && Options.showAdvancedGraphicsOptions) {
    const msaaSamplesItemList = [
      { value: 1, label: "LOC_OPTIONS_GFX_MSAA_QUALITY_1X" },
      { value: 2, label: "LOC_OPTIONS_GFX_MSAA_QUALITY_2X" },
      { value: 4, label: "LOC_OPTIONS_GFX_MSAA_QUALITY_4X" },
      { value: 8, label: "LOC_OPTIONS_GFX_MSAA_QUALITY_8X" }
    ];
    const msaaOption = {
      category: CategoryType.Graphics,
      group: "advanced",
      type: OptionType.Dropdown,
      id: "option-gfx-msaa-quality",
      initListener: onGfxAntialiasingDropdownInit,
      updateListener: onGfxAntialiasingDropdownUpdate,
      label: "LOC_OPTIONS_GFX_MSAA_QUALITY",
      description: "LOC_OPTIONS_GFX_MSAA_QUALITY_DESCRIPTION",
      dropdownItems: msaaSamplesItemList
    };
    Options.addOption(msaaOption);
    antialiasingOptions.push(msaaOption);
    const xessQualityItemList = [
      {
        value: XeSSQuality.ULTRA_PERFORMANCE,
        label: "LOC_OPTIONS_GFX_XESS_QUALITY_ULTRA_PERFORMANCE",
        tooltip: "LOC_OPTIONS_GFX_XESS_QUALITY_ULTRA_PERFORMANCE_DESCRIPTION"
      },
      {
        value: XeSSQuality.PERFORMANCE,
        label: "LOC_OPTIONS_GFX_XESS_QUALITY_PERFORMANCE",
        tooltip: "LOC_OPTIONS_GFX_XESS_QUALITY_PERFORMANCE_DESCRIPTION"
      },
      {
        value: XeSSQuality.BALANCED,
        label: "LOC_OPTIONS_GFX_XESS_QUALITY_BALANCED",
        tooltip: "LOC_OPTIONS_GFX_XESS_QUALITY_BALANCED_DESCRIPTION"
      },
      {
        value: XeSSQuality.QUALITY,
        label: "LOC_OPTIONS_GFX_XESS_QUALITY_QUALITY",
        tooltip: "LOC_OPTIONS_GFX_XESS_QUALITY_QUALITY_DESCRIPTION"
      },
      {
        value: XeSSQuality.ULTRA_QUALITY,
        label: "LOC_OPTIONS_GFX_XESS_QUALITY_ULTRA_QUALITY",
        tooltip: "LOC_OPTIONS_GFX_XESS_QUALITY_ULTRA_QUALITY_DESCRIPTION"
      },
      {
        value: XeSSQuality.ULTRA_QUALITY_PLUS,
        label: "LOC_OPTIONS_GFX_XESS_QUALITY_ULTRA_QUALITY_PLUS",
        tooltip: "LOC_OPTIONS_GFX_XESS_QUALITY_ULTRA_QUALITY_PLUS_DESCRIPTION"
      },
      {
        value: XeSSQuality.NATIVE,
        label: "LOC_OPTIONS_GFX_XESS_QUALITY_NATIVE",
        tooltip: "LOC_OPTIONS_GFX_XESS_QUALITY_NATIVE_DESCRIPTION"
      }
    ];
    const xessOption = {
      category: CategoryType.Graphics,
      group: "advanced",
      type: OptionType.Dropdown,
      id: "option-gfx-xess-quality",
      initListener: onGfxAntialiasingDropdownInit,
      updateListener: onGfxAntialiasingDropdownUpdate,
      label: "LOC_OPTIONS_GFX_XESS_QUALITY_SETTING",
      description: "LOC_OPTIONS_GFX_XESS_QUALITY_SETTING_DESCRIPTION",
      dropdownItems: xessQualityItemList
    };
    Options.addOption(xessOption);
    antialiasingOptions.push(xessOption);
    const fsr1QualityItemList = [
      { value: Fsr1Quality.PERFORMANCE, label: "LOC_OPTIONS_GFX_FSR1_QUALITY_PERFORMANCE" },
      { value: Fsr1Quality.BALANCED, label: "LOC_OPTIONS_GFX_FSR1_QUALITY_BALANCED" },
      { value: Fsr1Quality.QUALITY, label: "LOC_OPTIONS_GFX_FSR1_QUALITY_QUALITY" },
      { value: Fsr1Quality.ULTRA_QUALITY, label: "LOC_OPTIONS_GFX_FSR1_QUALITY_ULTRA_QUALITY" }
    ];
    const fsr1Option = {
      category: CategoryType.Graphics,
      group: "advanced",
      type: OptionType.Dropdown,
      id: "option-gfx-fsr1-quality",
      initListener: onGfxAntialiasingDropdownInit,
      updateListener: onGfxAntialiasingDropdownUpdate,
      label: "LOC_OPTIONS_GFX_FSR1_QUALITY_SETTING",
      description: "LOC_OPTIONS_GFX_FSR1_QUALITY_SETTING_DESCRIPTION",
      dropdownItems: fsr1QualityItemList
    };
    Options.addOption(fsr1Option);
    antialiasingOptions.push(fsr1Option);
    const fsr3QualityItemList = [
      {
        value: Fsr3Quality.ULTRA_PERFORMANCE,
        label: "LOC_OPTIONS_GFX_FSR3_QUALITY_ULTRA_PERFORMANCE",
        tooltip: "LOC_OPTIONS_GFX_FSR3_QUALITY_ULTRA_PERFORMANCE_DESCRIPTION"
      },
      {
        value: Fsr3Quality.PERFORMANCE,
        label: "LOC_OPTIONS_GFX_FSR3_QUALITY_PERFORMANCE",
        tooltip: "LOC_OPTIONS_GFX_FSR3_QUALITY_PERFORMANCE_DESCRIPTION"
      },
      {
        value: Fsr3Quality.BALANCED,
        label: "LOC_OPTIONS_GFX_FSR3_QUALITY_BALANCED",
        tooltip: "LOC_OPTIONS_GFX_FSR3_QUALITY_BALANCED_DESCRIPTION"
      },
      {
        value: Fsr3Quality.QUALITY,
        label: "LOC_OPTIONS_GFX_FSR3_QUALITY_QUALITY",
        tooltip: "LOC_OPTIONS_GFX_FSR3_QUALITY_QUALITY_DESCRIPTION"
      },
      {
        value: Fsr3Quality.NATIVE,
        label: "LOC_OPTIONS_GFX_FSR3_QUALITY_NATIVE",
        tooltip: "LOC_OPTIONS_GFX_FSR3_QUALITY_NATIVE_DESCRIPTION"
      }
    ];
    const fsr3Option = {
      category: CategoryType.Graphics,
      group: "advanced",
      type: OptionType.Dropdown,
      id: "option-gfx-fsr3-quality",
      initListener: onGfxAntialiasingDropdownInit,
      updateListener: onGfxAntialiasingDropdownUpdate,
      label: "LOC_OPTIONS_GFX_FSR3_QUALITY_SETTING",
      description: "LOC_OPTIONS_GFX_FSR3_QUALITY_SETTING_DESCRIPTION",
      dropdownItems: fsr3QualityItemList
    };
    Options.addOption(fsr3Option);
    antialiasingOptions.push(fsr3Option);
    const metalfxSpatialQualityItemList = [
      {
        value: MetalFxSpatialQuality.PERFORMANCE,
        label: "LOC_OPTIONS_GFX_METALFX_SPATIAL_QUALITY_PERFORMANCE",
        tooltip: "LOC_OPTIONS_GFX_METALFX_SPATIAL_QUALITY_PERFORMANCE_DESCRIPTION"
      },
      {
        value: MetalFxSpatialQuality.BALANCED,
        label: "LOC_OPTIONS_GFX_METALFX_SPATIAL_QUALITY_BALANCED",
        tooltip: "LOC_OPTIONS_GFX_METALFX_SPATIAL_QUALITY_BALANCED_DESCRIPTION"
      },
      {
        value: MetalFxSpatialQuality.QUALITY,
        label: "LOC_OPTIONS_GFX_METALFX_SPATIAL_QUALITY_QUALITY",
        tooltip: "LOC_OPTIONS_GFX_METALFX_SPATIAL_QUALITY_QUALITY_DESCRIPTION"
      },
      {
        value: MetalFxSpatialQuality.ULTRA_QUALITY,
        label: "LOC_OPTIONS_GFX_METALFX_SPATIAL_QUALITY_ULTRA_QUALITY",
        tooltip: "LOC_OPTIONS_GFX_METALFX_SPATIAL_QUALITY_ULTRA_QUALITY_DESCRIPTION"
      }
    ];
    const metalfxSpatialOption = {
      category: CategoryType.Graphics,
      group: "advanced",
      type: OptionType.Dropdown,
      id: "option-gfx-metalfxSpatial-quality",
      initListener: onGfxAntialiasingDropdownInit,
      updateListener: onGfxAntialiasingDropdownUpdate,
      label: "LOC_OPTIONS_GFX_METALFX_SPATIAL_QUALITY_SETTING",
      description: "LOC_OPTIONS_GFX_METALFX_SPATIAL_QUALITY_SETTING_DESCRIPTION",
      dropdownItems: metalfxSpatialQualityItemList
    };
    Options.addOption(metalfxSpatialOption);
    antialiasingOptions.push(metalfxSpatialOption);
    const metalfxTemporalQualityItemList = [
      {
        value: MetalFxTemporalQuality.PERFORMANCE,
        label: "LOC_OPTIONS_GFX_METALFX_TEMPORAL_QUALITY_PERFORMANCE",
        tooltip: "LOC_OPTIONS_GFX_METALFX_TEMPORAL_QUALITY_PERFORMANCE_DESCRIPTION"
      },
      {
        value: MetalFxTemporalQuality.BALANCED,
        label: "LOC_OPTIONS_GFX_METALFX_TEMPORAL_QUALITY_BALANCED",
        tooltip: "LOC_OPTIONS_GFX_METALFX_TEMPORAL_QUALITY_BALANCED_DESCRIPTION"
      },
      {
        value: MetalFxTemporalQuality.QUALITY,
        label: "LOC_OPTIONS_GFX_METALFX_TEMPORAL_QUALITY_QUALITY",
        tooltip: "LOC_OPTIONS_GFX_METALFX_TEMPORAL_QUALITY_QUALITY_DESCRIPTION"
      },
      {
        value: MetalFxTemporalQuality.ULTRA_QUALITY,
        label: "LOC_OPTIONS_GFX_METALFX_TEMPORAL_QUALITY_ULTRA_QUALITY",
        tooltip: "LOC_OPTIONS_GFX_METALFX_TEMPORAL_QUALITY_ULTRA_QUALITY_DESCRIPTION"
      },
      {
        value: MetalFxTemporalQuality.NATIVE,
        label: "LOC_OPTIONS_GFX_METALFX_TEMPORAL_QUALITY_NATIVE",
        tooltip: "LOC_OPTIONS_GFX_METALFX_TEMPORAL_QUALITY_NATIVE_DESCRIPTION"
      }
    ];
    const metalfxTemporalOption = {
      category: CategoryType.Graphics,
      group: "advanced",
      type: OptionType.Dropdown,
      id: "option-gfx-metalfxTemporal-quality",
      initListener: onGfxAntialiasingDropdownInit,
      updateListener: onGfxAntialiasingDropdownUpdate,
      label: "LOC_OPTIONS_GFX_METALFX_TEMPORAL_QUALITY_SETTING",
      description: "LOC_OPTIONS_GFX_METALFX_TEMPORAL_QUALITY_SETTING_DESCRIPTION",
      dropdownItems: metalfxTemporalQualityItemList
    };
    Options.addOption(metalfxTemporalOption);
    antialiasingOptions.push(metalfxTemporalOption);
    if (supportedOptions.intelXellSupported) {
      xellOption = {
        category: CategoryType.Graphics,
        group: "advanced",
        type: OptionType.Checkbox,
        id: "option-gfx-intel-xell",
        initListener: onGfxCoreCheckboxInit,
        updateListener: onGfxCoreCheckboxUpdate,
        label: "LOC_OPTIONS_GFX_XELL",
        description: "LOC_OPTIONS_GFX_XELL_DESCRIPTION"
      };
      if (supportedOptions.intelXefgSupported) {
        Options.addOption({
          category: CategoryType.Graphics,
          group: "advanced",
          type: OptionType.Checkbox,
          id: "option-gfx-intel-xefg",
          initListener: onGfxCoreCheckboxInit,
          updateListener: onGfxCoreCheckboxUpdate,
          label: "LOC_OPTIONS_GFX_XEFG",
          description: "LOC_OPTIONS_GFX_XEFG_DESCRIPTION"
        });
      }
      Options.addOption(xellOption);
    }
    if (supportedOptions.canChangeSSAOQuality) {
      const ssaoQualityItemList = [
        { value: SSAOQuality.OFF, label: "LOC_OPTIONS_MISC_OFF" },
        { value: SSAOQuality.LOW, label: "LOC_OPTIONS_GFX_SSAO_QUALITY_LOW" },
        { value: SSAOQuality.MEDIUM, label: "LOC_OPTIONS_GFX_SSAO_QUALITY_MEDIUM" },
        { value: SSAOQuality.HIGH, label: "LOC_OPTIONS_GFX_SSAO_QUALITY_HIGH" }
      ];
      Options.addOption({
        category: CategoryType.Graphics,
        group: "advanced",
        type: OptionType.Dropdown,
        id: "option-gfx-ssao-quality",
        initListener: onGfxAdvancedDropdownInit,
        updateListener: onGfxAdvancedDropdownUpdate,
        label: "LOC_OPTIONS_GFX_SSAO_QUALITY",
        description: "LOC_OPTIONS_GFX_SSAO_QUALITY_DESCRIPTION",
        dropdownItems: ssaoQualityItemList
      });
    }
    if (supportedOptions.canChangeSSR) {
      Options.addOption({
        category: CategoryType.Graphics,
        group: "advanced",
        type: OptionType.Checkbox,
        id: "option-gfx-ssr",
        initListener: onGfxAdvancedCheckboxInit,
        updateListener: onGfxAdvancedCheckboxUpdate,
        label: "LOC_OPTIONS_GFX_SSR",
        description: "LOC_OPTIONS_GFX_SSR_DESCRIPTION"
      });
    }
    if (supportedOptions.canChangeSSShadows) {
      Options.addOption({
        category: CategoryType.Graphics,
        group: "advanced",
        type: OptionType.Checkbox,
        id: "option-gfx-ssshadows",
        initListener: onGfxAdvancedCheckboxInit,
        updateListener: onGfxAdvancedCheckboxUpdate,
        label: "LOC_OPTIONS_GFX_SSSHADOWS",
        description: "LOC_OPTIONS_GFX_SSSHADOWS_DESCRIPTION"
      });
    }
    if (supportedOptions.canChangeSSOverlay) {
      Options.addOption({
        category: CategoryType.Graphics,
        group: "advanced",
        type: OptionType.Checkbox,
        id: "option-gfx-ssoverlay",
        initListener: onGfxAdvancedCheckboxInit,
        updateListener: onGfxAdvancedCheckboxUpdate,
        label: "LOC_OPTIONS_GFX_SSOVERLAY",
        description: "LOC_OPTIONS_GFX_SSOVERLAY_DESCRIPTION"
      });
    }
    if (supportedOptions.canChangeBloom) {
      Options.addOption({
        category: CategoryType.Graphics,
        group: "advanced",
        type: OptionType.Checkbox,
        id: "option-gfx-bloom",
        initListener: onGfxAdvancedCheckboxInit,
        updateListener: onGfxAdvancedCheckboxUpdate,
        label: "LOC_OPTIONS_GFX_BLOOM",
        description: "LOC_OPTIONS_GFX_BLOOM_DESCRIPTION"
      });
    }
    if (supportedOptions.canChangeAssetQuality) {
      const assetQualityItemList = [
        { value: AssetQuality.LOW, label: "LOC_OPTIONS_GFX_ASSET_QUALITY_LOW" },
        { value: AssetQuality.HIGH, label: "LOC_OPTIONS_GFX_ASSET_QUALITY_HIGH" }
      ];
      const assetQualityDescription = isMainMenu ? "LOC_OPTIONS_GFX_ASSET_QUALITY_DESCRIPTION" : "LOC_OPTIONS_DISABLED_IN_GAME";
      Options.addOption({
        category: CategoryType.Graphics,
        group: "advanced",
        type: OptionType.Dropdown,
        id: "option-gfx-asset-quality",
        initListener: onGfxAdvancedDropdownInit,
        updateListener: onGfxAdvancedDropdownUpdate,
        label: "LOC_OPTIONS_GFX_ASSET_QUALITY",
        description: assetQualityDescription,
        dropdownItems: assetQualityItemList,
        isDisabled: !isMainMenu
      });
    }
    if (supportedOptions.canChangeTextureDetail) {
      const textureDetailItemList = [
        { value: TextureDetail.LOW, label: "LOC_OPTIONS_GFX_TEXTURE_DETAIL_LOW" },
        { value: TextureDetail.MEDIUM, label: "LOC_OPTIONS_GFX_TEXTURE_DETAIL_MEDIUM" },
        { value: TextureDetail.HIGH, label: "LOC_OPTIONS_GFX_TEXTURE_DETAIL_HIGH" }
      ];
      const textureDetailDescription = isMainMenu ? "LOC_OPTIONS_GFX_TEXTURE_DETAIL_DESCRIPTION" : "LOC_OPTIONS_DISABLED_IN_GAME";
      Options.addOption({
        category: CategoryType.Graphics,
        group: "advanced",
        type: OptionType.Dropdown,
        id: "option-gfx-texture-detail",
        initListener: onGfxAdvancedDropdownInit,
        updateListener: onGfxAdvancedDropdownUpdate,
        label: "LOC_OPTIONS_GFX_TEXTURE_DETAIL",
        description: textureDetailDescription,
        dropdownItems: textureDetailItemList,
        isDisabled: !isMainMenu
      });
    }
    if (supportedOptions.canChangeParticleQuality) {
      const particleQualityItemList = [
        { value: VFXQuality.LOW, label: "LOC_OPTIONS_GFX_PARTICLE_QUALITY_LOW" },
        { value: VFXQuality.HIGH, label: "LOC_OPTIONS_GFX_PARTICLE_QUALITY_HIGH" }
      ];
      Options.addOption({
        category: CategoryType.Graphics,
        group: "advanced",
        type: OptionType.Dropdown,
        id: "option-gfx-particle-quality",
        initListener: onGfxAdvancedDropdownInit,
        updateListener: onGfxAdvancedDropdownUpdate,
        label: "LOC_OPTIONS_GFX_PARTICLE_QUALITY",
        description: "LOC_OPTIONS_GFX_PARTICLE_QUALITY_DESCRIPTION",
        dropdownItems: particleQualityItemList
      });
    }
    if (supportedOptions.canChangeShadowQuality) {
      const shadowQualityItemList = [
        { value: ShadowQuality.LOW, label: "LOC_OPTIONS_GFX_SHADOW_QUALITY_LOW" },
        { value: ShadowQuality.MEDIUM, label: "LOC_OPTIONS_GFX_SHADOW_QUALITY_MEDIUM" },
        { value: ShadowQuality.HIGH, label: "LOC_OPTIONS_GFX_SHADOW_QUALITY_HIGH" }
      ];
      Options.addOption({
        category: CategoryType.Graphics,
        group: "advanced",
        type: OptionType.Dropdown,
        id: "option-gfx-shadow-quality",
        initListener: onGfxAdvancedDropdownInit,
        updateListener: onGfxAdvancedDropdownUpdate,
        label: "LOC_OPTIONS_GFX_SHADOW_QUALITY",
        description: "LOC_OPTIONS_GFX_SHADOW_QUALITY_DESCRIPTION",
        dropdownItems: shadowQualityItemList
      });
    }
    if (supportedOptions.canChangeWaterQuality) {
      const waterQualityItemList = [
        { value: WaterQuality.LOW, label: "LOC_OPTIONS_GFX_WATER_QUALITY_LOW" },
        { value: WaterQuality.HIGH, label: "LOC_OPTIONS_GFX_WATER_QUALITY_HIGH" }
      ];
      Options.addOption({
        category: CategoryType.Graphics,
        group: "advanced",
        type: OptionType.Dropdown,
        id: "option-gfx-water-quality",
        initListener: onGfxAdvancedDropdownInit,
        updateListener: onGfxAdvancedDropdownUpdate,
        label: "LOC_OPTIONS_GFX_WATER_QUALITY",
        description: "LOC_OPTIONS_GFX_WATER_QUALITY_DESCRIPTION",
        dropdownItems: waterQualityItemList
      });
    }
    if (supportedOptions.canChangeImageSharpness) {
      const sharpeningItemList = [
        { value: SharpeningLevel.OFF, label: "LOC_OPTIONS_MISC_NONE" },
        { value: SharpeningLevel.SOFT, label: "LOC_OPTIONS_MISC_LOW" },
        { value: SharpeningLevel.NORMAL, label: "LOC_OPTIONS_MISC_MEDIUM" },
        { value: SharpeningLevel.SHARP, label: "LOC_OPTIONS_MISC_HIGH" },
        { value: SharpeningLevel.MAX, label: "LOC_OPTIONS_MISC_VERY_HIGH" }
      ];
      Options.addOption({
        category: CategoryType.Graphics,
        group: "advanced",
        type: OptionType.Dropdown,
        id: "option-gfx-sharpening",
        initListener: onGfxAdvancedDropdownInit,
        updateListener: onGfxAdvancedDropdownUpdate,
        label: "LOC_OPTIONS_GFX_SHARPENING",
        description: "LOC_OPTIONS_GFX_SHARPENING_DESCRIPTION",
        dropdownItems: sharpeningItemList
      });
    }
  }
  Options.addOption({
    category: CategoryType.System,
    group: "general",
    type: OptionType.Editor,
    id: "option-language-select",
    editorTagName: "editor-language-select",
    label: "LOC_OPTIONS_LANGUAGE",
    description: "LOC_OPTIONS_LANGUAGE_DESCRIPTION",
    caption: "LOC_OPTIONS_LANGUAGE_TEXT"
  });
  if (UI.exposeShowIntroVideoOption()) {
    Options.addOption({
      category: CategoryType.System,
      group: "general",
      type: OptionType.Checkbox,
      id: "option-show-intro-video",
      initListener: onShowIntroVideoInit,
      updateListener: onShowIntroVideoUpdate,
      label: "LOC_OPTIONS_SHOW_INTRO_VIDEO",
      description: "LOC_OPTIONS_SHOW_INTRO_VIDEO_DESCRIPTION",
      optionSet: "",
      optionType: "",
      optionName: ""
    });
  }
  Options.addOption({
    category: CategoryType.System,
    group: "general",
    type: OptionType.Slider,
    id: "option-system-tooltipdelay",
    initListener: onTooltipDelayInit,
    updateListener: onTooltipDelayUpdate,
    label: "LOC_OPTIONS_TOOLTIP_DELAY",
    description: "LOC_OPTIONS_TOOLTIP_DELAY_DESCRIPTION",
    min: 0,
    max: 2e3,
    currentValue: -1,
    steps: 20
  });
  Options.addOption({
    category: CategoryType.System,
    group: "general",
    type: OptionType.Checkbox,
    id: "option-ribbonstats",
    initListener: onCheckboxInit,
    updateListener: onCheckboxUpdate,
    label: "LOC_OPTIONS_RIBBON_DISPLAY",
    description: "LOC_OPTIONS_RIBBON_DISPLAY_DESCRIPTION",
    optionSet: "user",
    optionType: "Interface",
    optionName: "RibbonStats"
  });
  Options.addOption({
    category: CategoryType.System,
    group: "camera",
    type: OptionType.Slider,
    id: "option-camerapanningspeed",
    initListener: onCameraPanningSpeedInit,
    updateListener: onCameraPanningSpeedUpdate,
    label: "LOC_OPTIONS_CAMERA_PANNING_SPEED",
    description: "LOC_OPTIONS_CAMERA_PANNING_SPEED_DESCRIPTION",
    min: 20,
    max: 200,
    currentValue: -1,
    steps: 18
  });
  Options.addOption({
    category: CategoryType.System,
    group: "camera",
    type: OptionType.Checkbox,
    id: "option-notificationcamerapan",
    initListener: onCheckboxInit,
    updateListener: onCheckboxUpdate,
    label: "LOC_OPTIONS_NOTIFICATION_CAMERA_PAN",
    description: "LOC_OPTIONS_NOTIFICATION_CAMERA_PAN_DESCRIPTION",
    optionSet: "user",
    optionType: "Interface",
    optionName: "NotificationCameraPan"
  });
  if (UI.isMouseAvailable()) {
    Options.addOption({
      category: CategoryType.System,
      group: "camera",
      type: OptionType.Checkbox,
      id: "option-edgepanning",
      initListener: onCheckboxInit,
      updateListener: onEdgePanUpdate,
      label: "LOC_OPTIONS_ENABLE_EDGE_PANNING",
      description: "LOC_OPTIONS_ENABLE_EDGE_PANNING_DESCRIPTION",
      optionSet: "user",
      optionType: "Interface",
      optionName: "EdgePan"
    });
  } else {
    const clipping = UI.getOption("user", "Gameplay", "ClipCursor");
    if (clipping) {
      UI.setOption("user", "Gameplay", "EdgePan", 0);
      UI.setOption("user", "Gameplay", "ClipCursor", 0);
      Options.inputRefreshRequired = true;
    }
  }
  Options.addOption({
    category: CategoryType.System,
    group: "gamepad",
    type: OptionType.Checkbox,
    id: "option-mapcursordirectional",
    initListener: onMapCursorDirectionalInit,
    updateListener: onMapCursorDirectionalUpdate,
    label: "LOC_OPTIONS_MAP_CURSOR_DIRECTIONAL",
    description: "LOC_OPTIONS_MAP_CURSOR_DIRECTIONAL_DESCRIPTION",
    optionSet: "user",
    optionType: "Interface",
    optionName: "MapCursorDirectional"
  });
  Options.addOption({
    category: CategoryType.System,
    group: "gamepad",
    type: OptionType.Slider,
    id: "option-mapcursorspeed",
    initListener: onMapCursorSpeedInit,
    updateListener: onMapCursorSpeedUpdate,
    label: "LOC_OPTIONS_MAP_CURSOR_SPEED",
    description: "LOC_OPTIONS_MAP_CURSOR_SPEED_DESCRIPTION",
    min: 10,
    max: 200,
    currentValue: -1,
    steps: 38
  });
  if (UI.isRumbleAvailable()) {
    Options.addOption({
      category: CategoryType.System,
      group: "gamepad",
      type: OptionType.Checkbox,
      id: "option-input-rumble",
      initListener: onRumbleInit,
      updateListener: onRumbleUpdate,
      label: "LOC_OPTIONS_RUMBLE",
      description: "LOC_OPTIONS_RUMBLE_DESCRIPTION",
      optionSet: "user",
      optionType: "Interface",
      optionName: "RumbleEnabled"
    });
  }
  if (UI.areAdaptiveTriggersAvailable()) {
    Options.addOption({
      category: CategoryType.System,
      group: "gamepad",
      type: OptionType.Checkbox,
      id: "option-adaptivetriggersenabled",
      initListener: onAdaptiveTriggersInit,
      updateListener: onAdaptiveTriggersUpdate,
      label: "LOC_OPTIONS_ADAPTIVE_TRIGGERS_ENABLED",
      description: "LOC_OPTIONS_ADAPTIVE_TRIGGERS_ENABLED_DESCRIPTION",
      optionSet: "user",
      optionType: "Interface",
      optionName: "AdaptiveTriggersEnabled"
    });
  }
});

class ScreenOptionsCategory extends FxsVSlot {
  groupHeaders = {};
  /**
   * appendOption adds the given option to the group.
   */
  appendOption(option) {
    const optionElement = CreateOptionComponent(option);
    const referenceNode = this.getOptionReferenceNode(option.group);
    const optionRow = document.createElement("div");
    optionRow.classList.value = "flex items-center justify-between mb-2 highlight-row";
    optionRow.addEventListener("mouseenter", this.playSound.bind(this, "data-audio-focus", "data-audio-focus-ref"));
    this.Root.insertBefore(optionRow, referenceNode);
    const optionLabel = document.createElement("p");
    optionLabel.classList.add("font-body", "text-base");
    optionLabel.setAttribute("data-l10n-id", option.label);
    optionRow.appendChild(optionLabel);
    if (option.description) {
      const description = Locale.compose(option.description);
      optionElement.setAttribute("data-tooltip-content", description);
      optionElement.setAttribute("data-tooltip-anchor", "left");
      optionLabel.setAttribute("data-tooltip-content", description);
    }
    const optionValue = document.createElement("div");
    optionValue.classList.add("flex", "flex-col", "items-end");
    optionValue.setAttribute("optionID", `${option.id}`);
    const optionValueInner = document.createElement("div");
    optionValueInner.classList.add("flex", "flex-row");
    optionValue.appendChild(optionValueInner);
    optionValueInner.appendChild(optionElement);
    optionRow.appendChild(optionValue);
    if (option.type == OptionType.Slider) {
      const optionNumberWrapper = document.createElement("div");
      optionNumberWrapper.classList.add(
        "screen-options-category_slider-text",
        "flex",
        "items-center",
        "justify-end"
      );
      const optionNumber = document.createElement("div");
      optionNumber.classList.add("font-body", "text-sm");
      optionNumberWrapper.appendChild(optionNumber);
      option.sliderValue = optionNumber;
      optionValueInner.appendChild(optionNumberWrapper);
    }
    return { optionRow, optionElement };
  }
  /**
   * getOptionReferenceNode finds the node to insert the option after.
   *
   * This should be the next group header, or if no group is specified, the first group header.
   */
  getOptionReferenceNode(group) {
    if (group) {
      this.groupHeaders[group] ??= this.createGroupHeader(group);
      return this.Root.querySelector(`[data-group="${group}"] ~ [data-group]`) ?? null;
    } else {
      return this.Root.querySelector(`[data-group] + .options-row`)?.previousSibling ?? null;
    }
  }
  createGroupHeader(group) {
    const groupTitle = document.createElement("fxs-header");
    groupTitle.setAttribute("title", GetGroupLocKey(group));
    groupTitle.setAttribute("data-group", group);
    return this.Root.appendChild(groupTitle);
  }
  onInitialize() {
    super.onInitialize();
    this.render();
    this.Root.setAttribute("data-audio-group-ref", "options");
  }
  render() {
    this.Root.classList.add("flex", "flex-col");
    this.Root.setAttribute("disable-focus-allowed", "true");
  }
}
const ScreenOptionsCategoryTagName = "screen-options-category";
Controls.define(ScreenOptionsCategoryTagName, {
  createInstance: ScreenOptionsCategory,
  attributes: [
    {
      name: "disable-focus-allowed",
      description: "Determines if focus is allowed to occur on disabled items."
    }
  ],
  tabIndex: -1
});

const styles = "fs://game/core/ui/options/screen-options.css";

const DEFAULT_PUSH_PROPERTIES = {
  singleton: true,
  createMouseGuard: true
};
class ScreenOptions extends Panel {
  panels = [];
  tabData = [];
  tabControl;
  slotGroup = document.createElement("fxs-slot-group");
  scrollable;
  cancelButton;
  defaultsButton;
  confirmButton;
  dialogId = displayRequestUniqueId();
  minWidthByFontScale = {
    [FontScale.XSmall]: "w-11",
    [FontScale.Small]: "w-12",
    [FontScale.Medium]: "w-13",
    [FontScale.Large]: "w-14",
    [FontScale.XLarge]: "w-16"
  };
  onInitialize() {
    super.onInitialize();
    Options.init();
    for (const option of Options.data.values()) {
      option.initListener?.(option);
    }
    Options.saveCheckpoints();
    this.render();
  }
  onAttach() {
    this.enableOpenSound = true;
    this.enableCloseSound = true;
    this.Root.setAttribute("data-audio-group-ref", "options");
    super.onAttach();
    this.cancelButton?.addEventListener("action-activate", this.onCancelOptions);
    this.cancelButton?.setAttribute("data-audio-focus-ref", "data-audio-hero-focus");
    this.defaultsButton?.addEventListener("action-activate", this.onDefaultOptions);
    this.defaultsButton?.setAttribute("data-audio-focus-ref", "data-audio-hero-focus");
    this.confirmButton?.addEventListener("action-activate", this.onConfirmOptions);
    this.Root.addEventListener(InputEngineEventName, this.onEngineInput);
    const uiViewExperienceIsMobile = UI.getViewExperience() == UIViewExperience.Mobile;
    const optionFrame = MustGetElement(".option-frame", this.Root);
    optionFrame.classList.toggle("size-full", uiViewExperienceIsMobile);
    optionFrame.setAttribute("outside-safezone-mode", uiViewExperienceIsMobile ? "full" : "vertical");
    this.Root.listenForEngineEvent("UIFontScaleChanged", this.onFontScaleChanged.bind(this));
    this.adjustSliderTextsSize();
    Options.addChangedCallback(this.onOptionsChanged);
  }
  onDetach() {
    Options.clearChangedCallbacks();
    this.Root.removeEventListener(InputEngineEventName, this.onEngineInput);
    this.cancelButton?.removeEventListener("action-activate", this.onCancelOptions);
    this.defaultsButton?.removeEventListener("action-activate", this.onDefaultOptions);
    this.confirmButton?.removeEventListener("action-activate", this.onConfirmOptions);
    super.onDetach();
  }
  onReceiveFocus() {
    super.onReceiveFocus();
    NavTray.clear();
    NavTray.addOrUpdateGenericCancel();
    NavTray.addOrUpdateShellAction1("LOC_OPTIONS_CONFIRM_CHANGES");
    NavTray.addOrUpdateShellAction2("LOC_OPTIONS_RESET_TO_DEFAULTS");
    Sound.volumeSetCheckpoint();
    waitForLayout(() => {
      FocusManager.setFocus(this.slotGroup);
    });
  }
  onLoseFocus() {
    NavTray.clear();
    super.onLoseFocus();
  }
  onOptionsChanged = () => {
    const defaultCallback = (_eAction) => {
      Options.restore();
      VisualRemaps.revertUnsavedChanges();
      window.dispatchEvent(new MainMenuReturnEvent());
      this.close();
      delayByFrame(() => {
        ContextManager.push("screen-options", { singleton: true, createMouseGuard: true });
      }, 8);
    };
    DialogBoxManager.createDialog_Confirm({
      body: "LOC_OPTIONS_CONFIG_CHANGE_BODY",
      title: "LOC_OPTIONS_CONFIG_CHANGE",
      canClose: false,
      displayQueue: "SystemMessage",
      addToFront: true,
      callback: defaultCallback
    });
  };
  onDefaultOptions = () => {
    const defaultCallback = (eAction) => {
      if (eAction == DialogBoxAction.Confirm) {
        Options.resetOptionsToDefault();
        VisualRemaps.resetToDefaults();
        window.dispatchEvent(new MainMenuReturnEvent());
        this.close();
      }
    };
    DialogBoxManager.createDialog_ConfirmCancel({
      body: "LOC_OPTIONS_ARE_YOU_SURE_DEFAULT",
      title: "LOC_OPTIONS_DEFAULT",
      canClose: false,
      displayQueue: "SystemMessage",
      addToFront: true,
      callback: defaultCallback
    });
  };
  onCancelOptions = () => {
    const cancelCallback = (eAction) => {
      if (eAction == DialogBoxAction.Confirm) {
        Options.restore();
        VisualRemaps.revertUnsavedChanges();
        window.dispatchEvent(new MainMenuReturnEvent());
        this.close();
      }
    };
    if (Options.hasChanges() || VisualRemaps.hasUnsavedChanges()) {
      DialogBoxManager.createDialog_ConfirmCancel({
        dialogId: this.dialogId,
        body: "LOC_OPTIONS_REVERT_DESCRIPTION",
        title: "LOC_OPTIONS_CANCEL_CHANGES",
        canClose: false,
        displayQueue: "SystemMessage",
        addToFront: true,
        callback: cancelCallback
      });
    } else {
      window.dispatchEvent(new MainMenuReturnEvent());
      this.close();
    }
  };
  onConfirmOptions = () => {
    const closeFn = this.close.bind(this);
    if (Options.isUIReloadRequired() && UI.isInGame()) {
      ShowReloadUIPrompt(closeFn);
    } else if (Options.isRestartRequired()) {
      ShowRestartGamePrompt(closeFn);
    } else {
      Options.commitOptions();
      VisualRemaps.saveConfiguration();
      engine.trigger("update-tutorial-level");
      engine.trigger("UIFontScaleChanged");
      engine.trigger("UIGlobalScaleChanged");
      engine.trigger("UI_OptionsChanged");
      window.dispatchEvent(new MainMenuReturnEvent());
      this.close();
    }
    if (Options.isInputRefreshRequired()) {
      Options.inputRefreshRequired = false;
      UI.refreshInput();
    }
  };
  onFontScaleChanged() {
    this.adjustSliderTextsSize();
  }
  adjustSliderTextsSize() {
    const newScale = Configuration.getUser().uiFontScale;
    const minWidthTag = this.minWidthByFontScale[newScale];
    const sliderTexts = this.Root.querySelectorAll(".screen-options-category_slider-text");
    sliderTexts.forEach((element) => {
      element.classList.remove(...Object.values(this.minWidthByFontScale));
      element.classList.add(minWidthTag ?? "");
    });
  }
  onEngineInput = (inputEvent) => {
    if (inputEvent.detail.status != InputActionStatuses.FINISH) {
      return;
    }
    if (inputEvent.isCancelInput()) {
      this.onCancelOptions();
      inputEvent.preventDefault();
      inputEvent.stopPropagation();
    }
    switch (inputEvent.detail.name) {
      case "shell-action-1":
        this.onConfirmOptions();
        inputEvent.preventDefault();
        inputEvent.stopPropagation();
        break;
      case "shell-action-2":
        this.onDefaultOptions();
        inputEvent.preventDefault();
        inputEvent.stopPropagation();
        break;
    }
  };
  onOptionsTabSelected = (e) => {
    e.stopPropagation();
    const { index } = e.detail;
    const slotId = this.panels[index].id;
    this.slotGroup.setAttribute("selected-slot", slotId);
  };
  handleForceRenderOptions(optionElement, _component, option) {
    optionElement.classList.toggle("hidden", option.isHidden ?? false);
  }
  onUpdateOptionValue(optionElement, component, option) {
    switch (option.type) {
      // TODO: Add cases for other component types used
      case OptionType.Editor:
        component.Root.addEventListener("action-activate", (_event) => {
          const pushProperties = option.pushProperties ?? DEFAULT_PUSH_PROPERTIES;
          const activateResult = option.activateListener?.();
          if (option.editorTagName && (activateResult === void 0 || activateResult === false)) {
            ContextManager.push(option.editorTagName, pushProperties);
          }
          Options.incRefCount();
        });
        break;
      case OptionType.Dropdown:
        component.Root.addEventListener(
          DropdownSelectionChangeEventName,
          (event) => {
            Options.incRefCount();
            option.updateListener?.(option, event.detail.selectedIndex);
          }
        );
        option.forceRender = () => {
          component.Root.setAttribute("selected-item-index", `${option.selectedItemIndex ?? 0}`);
          component.Root.setAttribute("dropdown-items", JSON.stringify(option.dropdownItems));
          this.handleForceRenderOptions(optionElement, component, option);
        };
        break;
      case OptionType.Stepper:
        if (component instanceof FxsStepper) {
          component.Root.addEventListener("component-value-changed", () => {
            Options.incRefCount();
            option.updateListener?.(option, component.value);
          });
        }
        option.forceRender = () => {
          component.Root.setAttribute("value", `${option.currentValue ?? 0}`);
          this.handleForceRenderOptions(optionElement, component, option);
        };
        break;
      case OptionType.Checkbox:
        if (component instanceof FxsCheckbox) {
          component.Root.addEventListener(
            ComponentValueChangeEventName,
            (event) => {
              Options.incRefCount();
              option.updateListener?.(option, event.detail.value);
            }
          );
          option.forceRender = () => {
            component.Root.setAttribute("selected", `${option.currentValue}`);
            component.Root.setAttribute("disabled", `${option.isDisabled}`);
            this.handleForceRenderOptions(optionElement, component, option);
          };
        }
        break;
      case OptionType.Switch:
        if (component instanceof FxsSwitch) {
          component.Root.addEventListener(ComponentValueChangeEventName, (event) => {
            Options.incRefCount();
            option.updateListener?.(option, event.detail.value);
          });
          option.forceRender = () => {
            component.Root.setAttribute("selected", option.currentValue ? "true" : "false");
            this.handleForceRenderOptions(optionElement, component, option);
          };
        }
        break;
      case OptionType.Slider:
        if (component instanceof FxsSlider) {
          component.Root.addEventListener(ComponentValueChangeEventName, (event) => {
            if (option.currentValue && Math.abs(option.currentValue - event.detail.value) > 1e-6) {
              Options.incRefCount();
            }
            option.updateListener?.(option, event.detail.value);
            if (option.sliderValue) {
              const output = option.formattedValue ?? `${option.currentValue ?? 0}%`;
              option.sliderValue.textContent = output;
            }
          });
          if (option.sliderValue) {
            const output = option.formattedValue ?? `${option.currentValue ?? 0}%`;
            option.sliderValue.textContent = output;
          }
          option.forceRender = () => {
            component.Root.setAttribute("value", `${option.currentValue ?? 0}`);
            this.handleForceRenderOptions(optionElement, component, option);
          };
        }
        break;
      default:
        throw new Error(`Unhandled option type: ${option}`);
    }
  }
  /**
   * getOrCreateCategoryTab Finds or creates the panel associated with a given option category.
   *
   * @param catID A category to associate with a tab.
   * @returns The display panel associated with the tab.
   */
  getOrCreateCategoryTab(catID) {
    const elementID = `category-table-${catID}`;
    let categoryPanel = this.panels.find((panel) => panel.id === elementID);
    if (!categoryPanel) {
      categoryPanel = document.createElement("screen-options-category");
      categoryPanel.classList.add(elementID, "flex", "flex-col");
      categoryPanel.id = elementID;
      this.panels.push(categoryPanel);
      const { title, description } = CategoryData[catID];
      categoryPanel.setAttribute("description", description);
      this.tabData.push({
        id: elementID,
        category: catID,
        label: title
      });
    }
    return categoryPanel;
  }
  render() {
    const supportedOptions = Options.supportedOptions;
    let resetTooltip = Locale.compose("LOC_OPTIONS_RESET_TO_DEFAULTS_TOOLTIP");
    if (supportedOptions.canChangeScreenMode || supportedOptions.hdr && supportedOptions.canDisableHDR || supportedOptions.resolutions.length > 0) {
      resetTooltip += "[N] [N]";
      resetTooltip += Locale.compose("LOC_OPTIONS_RESET_EXCLUDES");
      resetTooltip += "[N][LIST]";
      if (supportedOptions.canChangeScreenMode) {
        resetTooltip += "[LI]";
        resetTooltip += Locale.compose("LOC_OPTIONS_GFX_SCREEN_MODE");
      }
      if (supportedOptions.hdr && supportedOptions.canDisableHDR) {
        resetTooltip += "[LI]";
        resetTooltip += Locale.compose("LOC_OPTIONS_GFX_ENABLE_HDR");
      }
      if (supportedOptions.resolutions.length > 0) {
        resetTooltip += "[LI]";
        resetTooltip += Locale.compose("LOC_OPTIONS_GFX_RESOLUTION");
      }
      resetTooltip += "[/LIST]";
    }
    this.Root.classList.add(
      "absolute",
      "flex",
      "justify-center",
      "fullscreen",
      "max-w-screen",
      "max-h-screen",
      "pointer-events-auto"
    );
    this.Root.innerHTML = `
			<div class="absolute img-lsgb-egypt-720 fullscreen"></div>
			<fxs-frame class="option-frame min-w-256 flex-initial" content-as="fxs-vslot" content-class="flex-auto">
				<fxs-vslot class="flex-auto" focus-rule="last">
					<fxs-header class="self-center mb-6 font-title text-xl text-secondary" title="LOC_UI_OPTIONS_TITLE" filigree-style="none"></fxs-header>
					<fxs-tab-bar class="mb-6"></fxs-tab-bar>
					<fxs-scrollable class="flex-auto" attached-scrollbar="true" allow-mouse-panning="true"></fxs-scrollable>
				</fxs-vslot>
				<div class="flex flex-row justify-between items-end mt-6" data-bind-class-toggle="hidden:{{g_NavTray.isTrayRequired}}">
					<fxs-button id="options-cancel"
								data-audio-group-ref="options" data-audio-activate="options-cancel-selected"
								caption="LOC_OPTIONS_CANCEL_CHANGES"></fxs-button>
					<fxs-button id="options-defaults" class="ml-2"
								data-audio-group-ref="options" data-audio-activate="options-default-selected"
								caption="LOC_OPTIONS_RESET_TO_DEFAULTS" data-tooltip-content="${resetTooltip}"></fxs-button>
					<fxs-hero-button id="options-confirm" class="ml-2"
								caption="LOC_OPTIONS_CONFIRM_CHANGES" data-audio-group-ref="options"
								data-audio-activate-ref="data-audio-options-confirm"></fxs-button>
				</div>
			</fxs-frame>
		`;
    this.scrollable = MustGetElement("fxs-scrollable", this.Root);
    this.cancelButton = MustGetElement("#options-cancel", this.Root);
    this.defaultsButton = MustGetElement("#options-defaults", this.Root);
    this.confirmButton = MustGetElement("#options-confirm", this.Root);
    this.tabControl = MustGetElement("fxs-tab-bar", this.Root);
    for (const [, option] of Options.data) {
      const category = this.getOrCreateCategoryTab(option.category);
      if (!category.maybeComponent) {
        category.initialize();
      }
      const { optionRow, optionElement } = category.component.appendOption(option);
      optionElement.initialize();
      this.onUpdateOptionValue(optionRow, optionElement.component, option);
      optionRow.classList.toggle("hidden", option.isHidden ?? false);
    }
    this.tabControl.setAttribute("tab-items", JSON.stringify(this.tabData));
    const selectedTab = this.Root.getAttribute("selected-tab");
    this.tabControl.setAttribute("selected-tab-index", selectedTab ?? "0");
    for (let i = 0; i < this.panels.length; i++) {
      this.slotGroup.appendChild(this.panels[i]);
    }
    this.slotGroup.classList.add("px-6");
    this.scrollable.appendChild(this.slotGroup);
    this.tabControl.addEventListener("tab-selected", this.onOptionsTabSelected);
    const isMobile = UI.getViewExperience() == UIViewExperience.Mobile;
    if (isMobile) {
      this.tabControl.classList.add("mx-7");
    }
  }
}
Controls.define("screen-options", {
  createInstance: ScreenOptions,
  description: "Screen for adjusting game options.",
  styles: [styles]
});

export { ScreenOptions };
//# sourceMappingURL=screen-options.js.map

import { u as utils } from '../../../core/ui/graph-layout/utils.chunk.js';

const MAX_ZOOM = 0.3;
var CityZoomer;
((CityZoomer2) => {
  function zoomToCity(city) {
    Camera.saveCameraZoom();
    const region = { min: { x: 0.275, y: 0.025 }, max: { x: 0.975, y: 0.975 } };
    const calculatedFocus = Camera.calculateCameraFocusAndZoom(city.getPurchasedPlots(), 30, {
      region
    });
    if (calculatedFocus) {
      const cameraFrame = {
        duration: 1,
        tilt: 30,
        focus: { x: calculatedFocus.x, y: calculatedFocus.y },
        zoom: utils.clamp(calculatedFocus.z, MAX_ZOOM, 1),
        func: InterpolationFunc.EaseOutSin,
        writeMask: KeyframeFlag.FLAG_ALL,
        // overwrite all affected camera state
        end: true
        // return to player control once done
      };
      Camera.addKeyframe(cameraFrame);
    } else {
      Camera.lookAtPlot(city.location, { zoom: 1, tilt: 30 });
    }
  }
  CityZoomer2.zoomToCity = zoomToCity;
  function resetZoom() {
    Camera.restoreDefaults();
    Camera.restoreCameraZoom();
    Camera.clearAnimation();
  }
  CityZoomer2.resetZoom = resetZoom;
})(CityZoomer || (CityZoomer = {}));

export { CityZoomer as C };
//# sourceMappingURL=city-zoomer.chunk.js.map

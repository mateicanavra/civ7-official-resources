import { FocusManager } from '../../../ui-next/services/focus-manager.js';
import SpatialNavigation from './spatial_navigation.js';

class SpatialWrapper {
  static _Instance;
  /**
   * Singleton accessor
   */
  static getInstance() {
    if (!SpatialWrapper._Instance) {
      SpatialWrapper._Instance = new SpatialWrapper();
    }
    return SpatialWrapper._Instance;
  }
  init() {
    SpatialNavigation.init();
  }
  /**
   * Navigate within a spatial section given its focusable children and a direction.
   * @param sectionId The section ID of the shared parent slot.
   * @param focusableChildren Children Elements that are assumed to be focusable.
   * @param direction The movement direction
   * @returns true if still live, false if input should stop (the navigation was effective).
   */
  navigate(sectionId, focusableChildren, direction) {
    if (focusableChildren.length == 0) {
      console.error(
        "spatial-wrapper: navigateFromElementWithinElements(): None focusable child, navigation is impossible"
      );
      return false;
    }
    const focusManager = FocusManager.get();
    const priorFocus = focusManager.currentFocus();
    SpatialNavigation.remove(sectionId);
    SpatialNavigation.add(sectionId, focusableChildren);
    SpatialNavigation.set(sectionId, { restrict: "self-only" });
    SpatialNavigation.move(direction);
    SpatialNavigation.remove(sectionId);
    return priorFocus == focusManager.currentFocus();
  }
}
const SpatialWrap = SpatialWrapper.getInstance();

export { SpatialWrap as default };
//# sourceMappingURL=spatial-wrapper.js.map

async function waitForElementStyle(element, property, target) {
  const _frameLimit = 3;
  let _framesLeft = _frameLimit;
  if (!element) {
    console.warn(`StyleChecker: Target element could not be found`);
    return false;
  }
  if (!window.getComputedStyle(element).getPropertyValue(property)) {
    console.warn(
      `StyleChecker: Target ${element.tagName} ${element.className} does not have a '${property}' property`
    );
    return false;
  }
  const promise = new Promise((res) => {
    const checkReadyStatus = () => {
      _framesLeft--;
      requestAnimationFrame(() => {
        const _value = parseFloat(window.getComputedStyle(element).getPropertyValue(property));
        if (_value == target) {
          requestAnimationFrame(() => {
            res(true);
          });
        } else if (_framesLeft == 0) {
          console.error(
            `StyleChecker: Target ${element.tagName} ${element.className} did not have its '${property}' property set to ${target} within ${_frameLimit} frames`
          );
          requestAnimationFrame(() => {
            res(false);
          });
        } else {
          checkReadyStatus();
        }
      });
    };
    checkReadyStatus();
  });
  return await promise;
}

export { waitForElementStyle };
//# sourceMappingURL=utilities-core-stylechecker.js.map

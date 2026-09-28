import { ComponentID } from './utilities-component-id.js';
import Databind from './utilities-core-databinding.js';

function databindComponentID(target, baseComponentID, verbose) {
  Databind.attribute(target, "componentid", `${baseComponentID}`, verbose);
}
function databindRetrieveComponentID(target) {
  const foundID = target.getAttribute("componentid");
  if (foundID == null || foundID == "") {
    return ComponentID.getInvalidID();
  } else {
    return ComponentID.fromString(foundID);
  }
}
function databindRetrieveComponentIDSerial(target) {
  const foundID = target.getAttribute("componentid");
  return foundID ?? "";
}

export { databindComponentID, databindRetrieveComponentID, databindRetrieveComponentIDSerial };
//# sourceMappingURL=utilities-databinding.js.map

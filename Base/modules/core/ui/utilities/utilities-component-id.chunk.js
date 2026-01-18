var ComponentID;
((ComponentID2) => {
  const UIBase = 1e3;
  let UITypes;
  ((UITypes2) => {
    UITypes2[UITypes2["IndependentBanner"] = UIBase + 0] = "IndependentBanner";
  })(UITypes = ComponentID2.UITypes || (ComponentID2.UITypes = {}));
  ComponentID2.cid_type = 30;
  function toString(id) {
    if (id) {
      if (id.type) {
        const str = id.owner + ";" + id.id + ";" + id.type;
        return str;
      } else {
        const str = id.owner + ";" + id.id;
        return str;
      }
    } else {
      return "";
    }
  }
  ComponentID2.toString = toString;
  function fromString(str) {
    if (str) {
      const strs = str.split(";");
      if (strs.length >= 2) {
        const owner = parseInt(strs[0]);
        const id = parseInt(strs[1]);
        const type = strs.length > 2 ? parseInt(strs[2]) : -1;
        const retVal = make(owner, type, id);
        if (!isNaN(retVal.owner) && !isNaN(retVal.id) && !isNaN(retVal.type)) {
          return retVal;
        }
      }
      console.error("Invalid ComponentID parsed from string: ", str);
    } else {
      console.error("Cannot convert ComponentID from an empty string.");
    }
    return getInvalidID();
  }
  ComponentID2.fromString = fromString;
  function isMatch(id1, id2) {
    if (id1 && id2) {
      if (id1.owner == id2.owner && id1.id == id2.id && id1.type == id2.type) {
        return true;
      }
    }
    return false;
  }
  ComponentID2.isMatch = isMatch;
  function isMatchInArray(ids, id) {
    for (let i = 0; i < ids.length; i++) {
      const other = ids[i];
      if (id.owner == other.owner && id.id == other.id && id.type == other.type) {
        return true;
      }
    }
    return false;
  }
  ComponentID2.isMatchInArray = isMatchInArray;
  function isInstanceOf(thing) {
    if (thing && thing.hasOwnProperty("owner") && thing.hasOwnProperty("id")) {
      return true;
    }
    return false;
  }
  ComponentID2.isInstanceOf = isInstanceOf;
  function addToArray(ids, id) {
    if (ids && id) {
      for (const check of ids) {
        if (isMatch(check, id)) {
          return false;
        }
      }
      ids.push(id);
      return true;
    }
    return false;
  }
  ComponentID2.addToArray = addToArray;
  function removeFromArray(ids, id) {
    if (ids && id) {
      for (let i = 0; i < ids.length; ++i) {
        if (isMatch(ids[i], id)) {
          ids.splice(i, 1);
          return true;
        }
      }
    }
    return false;
  }
  ComponentID2.removeFromArray = removeFromArray;
  function isInvalid(id) {
    return id && id.owner == -1 && id.id == -1;
  }
  ComponentID2.isInvalid = isInvalid;
  function isValid(id) {
    return id != null && id.owner != -1 && id.id != -1;
  }
  ComponentID2.isValid = isValid;
  const invalidID = Object.freeze({ owner: -1, id: -1, type: 0 });
  function getInvalidID() {
    return invalidID;
  }
  ComponentID2.getInvalidID = getInvalidID;
  function toBitfield(componentID) {
    const a = componentID.owner * Math.pow(2, 48);
    const b = componentID.type * Math.pow(2, 32);
    const c = componentID.id;
    return a + b + c;
  }
  ComponentID2.toBitfield = toBitfield;
  function fromBitfield(bitfield) {
    const owner = bitfield / Math.pow(2, 48) & 65535;
    return {
      owner: owner < 65535 ? owner : -1,
      type: bitfield / Math.pow(2, 32) & 65535,
      id: bitfield & 4294967295
    };
  }
  ComponentID2.fromBitfield = fromBitfield;
  function fromPlot(owner, coordinates, type) {
    const id = coordinates.x * Math.pow(2, 16) + coordinates.y;
    return {
      owner,
      type,
      id
    };
  }
  ComponentID2.fromPlot = fromPlot;
  function toLogString(id) {
    if (id == null) {
      return "NULL";
    }
    if (ComponentID2.isInvalid(id)) {
      return "InvalidCID";
    }
    function typeToString(type) {
      switch (type) {
        case 0:
          return "UNDEFINED";
        case 1:
          return "CITY";
        case 2:
          return "CONSTRUCTIBLE";
        case 3:
          return "DIPLOMACY";
        case 4:
          return "DISTRICT";
        case 5:
          return "DROUGHT";
        case 6:
          return "FIRE";
        case 7:
          return "FORMATION";
        case 8:
          return "GAME";
        case 9:
          return "GAME_CONFIGURATION";
        case 10:
          return "GAME_NOTIFICATION";
        case 11:
          return "GOVERNOR";
        case 12:
          return "IMPROVEMENT";
        case 13:
          return "MAP_CONFIGURATION";
        case 14:
          return "MODIFIER_DYNAMIC";
        case 15:
          return "NATIONALPARK";
        case 16:
          return "ONEOFF_EVENT";
        case 17:
          return "PLAYER";
        case 18:
          return "PLAYER_CONFIGURATION";
        case 19:
          return "PLAYER_MANAGER";
        case 20:
          return "PLAYER_NOTIFICATION";
        case 21:
          return "PLAYER_VISIBILITY";
        case 22:
          return "PLOT";
        case 23:
          return "RELIGION";
        case 24:
          return "RESOURCE";
        case 25:
          return "STORM";
        case 26:
          return "UNIT";
        case 27:
          return "AI_CONTROL_MANAGER";
        case 28:
          return "AI_BEHAVIORTREEMANAGER";
        case 29:
          return "ARMY";
        case 30:
          return "UI";
        // cid_type
        case 31:
          return "TRADEROUTE";
        case 32:
          return "SPECIALIST";
        case 33:
          return "MINOR_INDEPENDENT_MANAGER";
        // Enums that start at a high number (e.g., 1000) which are UI-created, and UI-specific.  (Engine has no concept of it).
        case UITypes.IndependentBanner:
          return "UI-INDEPENDENT_BANNER";
      }
      return "unknown-type(" + type.toString() + ")";
    }
    return typeToString(id.type) + ":" + id.owner.toString() + ":" + id.id.toString();
  }
  ComponentID2.toLogString = toLogString;
  function isUI(cid) {
    return cid.type >= UIBase;
  }
  ComponentID2.isUI = isUI;
  function make(owner, type = -1, id) {
    return {
      owner,
      type,
      id
    };
  }
  ComponentID2.make = make;
})(ComponentID || (ComponentID = {}));

export { ComponentID as C };
//# sourceMappingURL=utilities-component-id.chunk.js.map

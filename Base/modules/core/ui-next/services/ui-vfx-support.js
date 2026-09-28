import { createSignal, createContext, useContext } from '../../vendor/solid-js/dist/solid.js';
import { UiVfx } from '../../ui/vfx/vfx-manager.js';
import { asyncLoad } from '../utilities/async-load.js';
import vfxBaseRulesUrl from '../vfx-rules.json.js';

function _validateVfxRulePath(_path) {
  return true;
}
function compileVfxRules(rules) {
  const tree = {
    rules: [],
    children: {}
  };
  const reverse = rules.reverse();
  for (const rule of reverse) {
    const segments = rule.path.split("/");
    let current = tree;
    for (const s of segments) {
      let child = current.children[s];
      if (child == null) {
        child = { rules: [], children: {} };
        current.children[s] = child;
      }
      current = child;
    }
    current.rules.push(rule);
  }
  return tree;
}
const [globalRules, setGlobalRules] = createSignal({ rules: [], children: {} });
const VfxContext = createContext({
  path: () => "",
  vars: () => ({}),
  tree: globalRules
});
function meetsConstraint(key, constraint, vars) {
  if (typeof constraint == "string") {
    return vars[key] == constraint;
  } else {
    if (constraint.op == null) {
      return vars[key] == constraint.value;
    } else {
      switch (constraint.op) {
        case "eq":
          return vars[key] == constraint.value;
          break;
        case "neq":
          return vars[key] != constraint.value;
          break;
        case "lt":
          return constraint.value != null ? vars[key] < constraint.value : false;
          break;
        case "lte":
          return constraint.value != null ? vars[key] <= constraint.value : false;
          break;
        case "gt":
          return constraint.value != null ? vars[key] > constraint.value : false;
          break;
        case "gte":
          return constraint.value != null ? vars[key] >= constraint.value : false;
          break;
        case "exists":
          return vars[key] != null;
          break;
        case "in":
          return constraint.value.includes(vars[key]);
          break;
        default:
          return false;
      }
    }
  }
}
function meetsConstraints(rule, vars, shouldLogVerbose) {
  const constraints = rule.constraints;
  if (constraints == null) {
    return true;
  } else {
    return Object.entries(constraints).every(([key, value]) => {
      const result = meetsConstraint(key, value, vars);
      if (shouldLogVerbose != null && shouldLogVerbose) {
        console.log(
          `-- Constraint ${key} ${typeof value === "string" ? "eq" : value.op} ${typeof value === "string" ? value : value.value} -> ${result}`
        );
      }
      return result;
    });
  }
}
const vfxVariableRegex = /{(\w+)}/g;
const useVfx = (localSegment) => {
  const ctx = useContext(VfxContext);
  const trigger = (segmentOrEventName, controlRect, eventNameOrVars, optionalVars) => {
    const segment = typeof eventNameOrVars === "string" ? segmentOrEventName : null;
    const eventName = typeof eventNameOrVars === "string" ? eventNameOrVars : segmentOrEventName;
    const localVars = typeof eventNameOrVars === "object" ? eventNameOrVars : optionalVars;
    const path = ctx.path();
    const vars = localVars != null ? { ...ctx.vars(), ...localVars } : ctx.vars();
    const targetPath = [path, localSegment, segment].filter((p) => p).join("/");
    const segments = targetPath.split("/");
    let current = ctx.tree();
    for (const seg of segments) {
      if (current.children[seg]) {
        current = current.children[seg];
      } else {
      }
    }
    const shouldLogVerbose = UI.Debug.getWidgetValue("logVfxRuleConstraintMatching");
    const match = current.rules.find((r) => meetsConstraints(r, vars, shouldLogVerbose));
    if (match?.events[eventName]) {
      const vfx = match.events[eventName];
      const tag = vfx.replace(vfxVariableRegex, (_, k) => vars[k] || k);
      const shouldLog = UI.Debug.getWidgetValue("logMatchedVfxTriggers");
      if (shouldLog != null && shouldLog) {
        const strVars = Object.entries(vars).map((entry) => `${entry[0]}=${entry[1]}`).join("&");
        console.log(`${targetPath}[${strVars}]:${eventName} -> ${tag} (${match.path})`);
      }
      if (tag != null && tag != "") {
        UiVfx.triggerScreenVFXToRect(tag, controlRect);
      }
    } else {
      const shouldLog = UI.Debug.getWidgetValue("logUnmatchedVfxTriggers");
      if (shouldLog != null && shouldLog) {
        const strVars = Object.entries(vars).map((entry) => `${entry[0]}=${entry[1]}`).join("&");
        console.log(`${targetPath}[${strVars}]:${eventName} -> No Match`);
      }
    }
  };
  return trigger;
};
engine.whenReady.then(async () => {
  const vfxRules = vfxBaseRulesUrl ? [vfxBaseRulesUrl] : [];
  const rules = (await Promise.all(vfxRules.map(asyncLoad))).flatMap((result) => JSON.parse(result));
  setGlobalRules(compileVfxRules(rules));
});
const LogVfxMatchedTriggersWidget = {
  id: "logMatchedVfxTriggers",
  category: "VFX",
  caption: "Log Matched Triggers",
  domainType: "bool",
  value: false
};
const LogVfxNotMatchedTriggersWidget = {
  id: "logUnmatchedVfxTriggers",
  category: "VFX",
  caption: "Log Unmatched Triggers",
  domainType: "bool",
  value: false
};
const LogVfxRuleConstraintMatchingWidget = {
  id: "logVfxRuleConstraintMatching",
  category: "VFX",
  caption: "Log Constraint Matching (Verbose)",
  domainType: "bool",
  value: false
};
UI.Debug.registerWidget(LogVfxMatchedTriggersWidget);
UI.Debug.registerWidget(LogVfxNotMatchedTriggersWidget);
UI.Debug.registerWidget(LogVfxRuleConstraintMatchingWidget);

export { VfxContext, compileVfxRules, useVfx };
//# sourceMappingURL=ui-vfx-support.js.map

class CityYieldsEngine {
  yields = [];
  getCityYieldDetails(targetCityID) {
    const city = Cities.get(targetCityID);
    const cityYields = city?.Yields;
    this.yields = [];
    if (city && cityYields) {
      if (city) {
        const yields = cityYields.getYields();
        if (yields != null) {
          yields.forEach((y, i) => {
            const yieldInfo = GameInfo.Yields[i];
            if (yieldInfo) {
              this.yields.push(this.getYieldData(yieldInfo.Name, yieldInfo.YieldType, y));
            }
          });
        }
      }
    }
    return this.yields;
  }
  // KWG: This should be some global helper function.  Also, it is a bit incomplete
  /** Format the value into a display string
   * @param value The value to format
   * @param type	The type of the PARENT of the value.  We use the parent because that tells us how the value is being used in a calculation.
   * @param isModfier Denotes of the value is from a parent that is in the .modifer branch of a game value.  */
  getValueDisplayString(value, type, isModifier) {
    if (isModifier) {
      if (type == GameValueStepTypes.ATTRIBUTE) {
        return Locale.toNumber(value, "0.0") + "%";
      } else {
        if (type == GameValueStepTypes.MULTIPLY) {
          return "x " + Locale.toNumber(value, "0.0");
        }
      }
    }
    if (type == GameValueStepTypes.PERCENTAGE) {
      return Locale.toNumber(value, "0.0") + "%";
    }
    return Locale.toNumber(value, "0.0");
  }
  getModifierStepLabel(type) {
    if (type == GameValueStepTypes.ATTRIBUTE) {
      return "LOC_ATTR_ADD_PERCENTAGE_OF_SOURCES";
    } else {
      if (type == GameValueStepTypes.MULTIPLY) {
        return "LOC_ATTR_MULTIPLIED_BY_SOURCES";
      }
    }
    return "LOC_ATTR_MODIFIERS";
  }
  getYieldData(label, type, attribute) {
    const yieldData = {
      label,
      value: "",
      valueNum: attribute.value,
      valueType: attribute.type,
      type,
      showIcon: true,
      isNegative: attribute.value < 0,
      isModifier: false,
      childData: []
    };
    if (attribute.base != void 0 && attribute.base.value != 0 && attribute.base.steps != void 0) {
      if (attribute.modifier != void 0 && attribute.modifier.value != 0) {
        const baseData = {
          label: "LOC_ATTR_SOURCES",
          value: "",
          valueNum: attribute.base.value,
          valueType: attribute.type,
          showIcon: false,
          isNegative: attribute.base.value < 0,
          isModifier: false,
          childData: []
        };
        baseData.childData = this.getStepData(attribute.base.steps, attribute.type, false);
        yieldData.childData = yieldData.childData.concat(baseData);
      } else {
        yieldData.childData = yieldData.childData.concat(
          this.getStepData(attribute.base.steps, attribute.type, false)
        );
      }
    }
    if (attribute.modifier != void 0 && attribute.modifier.value != 0 && attribute.modifier.steps != void 0) {
      const modifierData = {
        label: this.getModifierStepLabel(attribute.type),
        value: "",
        valueNum: attribute.modifier.value,
        valueType: attribute.type,
        showIcon: false,
        isNegative: attribute.modifier.value < 0,
        isModifier: true,
        childData: []
      };
      modifierData.childData = this.getStepData(attribute.modifier.steps, attribute.type, true);
      yieldData.childData = yieldData.childData.concat(modifierData);
    }
    let result = yieldData;
    result = this.removeRedundantNodes(yieldData);
    this.removeBlankChildren(result);
    this.prepareForDisplay(result);
    return result;
  }
  getStepData(steps, parentStepType, isModifier) {
    const childData = [];
    const stespLength = steps.length;
    for (let i = 0; i < stespLength; ++i) {
      const step = steps[i];
      if (step.value != 0) {
        const yieldData = {
          label: step.description ? step.description : "",
          value: "",
          valueNum: step.value,
          valueType: parentStepType,
          showIcon: false,
          isNegative: step.value < 0,
          isModifier,
          childData: []
        };
        if (step.base != void 0 && step.base.steps != void 0) {
          if (step.modifier != void 0 && step.modifier.value != 0) {
            const baseData = {
              label: "LOC_ATTR_SOURCES",
              value: "",
              valueNum: step.base.value,
              valueType: step.type,
              showIcon: false,
              isNegative: step.base.value < 0,
              isModifier: false,
              childData: this.getStepData(step.base.steps, step.type, false)
            };
            yieldData.childData.push(baseData);
          } else {
            yieldData.childData.push(...this.getStepData(step.base.steps, step.type, false));
          }
        }
        if (step.modifier != void 0 && step.modifier.value != 0 && step.modifier.steps != void 0) {
          const modifierData = {
            label: this.getModifierStepLabel(step.type),
            value: "",
            valueNum: step.modifier.value,
            valueType: step.type,
            showIcon: false,
            isNegative: step.modifier.value < 0,
            isModifier: true,
            childData: this.getStepData(step.modifier.steps, step.type, true)
          };
          yieldData.childData.push(modifierData);
        }
        if (step.steps != void 0) {
          yieldData.childData.push(...this.getStepData(step.steps, step.type, false));
        }
        childData.push(yieldData);
      }
    }
    return childData;
  }
  /**
   * Remove redundant nodes.
   * A redundant node is one in which the parent has a single child and their values/valueTypes match.
   * We must then determine whether to keep the parent or the child.  This logic is evolving and is currently as such:
   * * If the root doesn't have an associated type and isn't marked as showing an icon, use the child if the child contains a label.
   * @param root
   * @returns
   */
  removeRedundantNodes(root) {
    if (root.childData.length == 1 && root.valueNum == root.childData[0].valueNum) {
      const child = this.removeRedundantNodes(root.childData[0]);
      if (child.label && !root.showIcon) {
        root = child;
      } else {
        root.childData = child.childData;
      }
    } else {
      const children = root.childData;
      const childrenLength = children.length;
      for (let i = 0; i < childrenLength; ++i) {
        const child = children[i];
        children[i] = this.removeRedundantNodes(child);
      }
    }
    return root;
  }
  /**
   * 'Blank' nodes are nodes without a label or icon to convey what exactly they mean.
   *  To provide concise information, nodes with blank children have _all_ their children removed.
   *  To prevent situations where this is too deep a cut, these nodes should be correctly labeled in GameCore.
   *
   * @param root
   */
  removeBlankChildren(root) {
    for (const data of root.childData) {
      if (!data.label && !data.showIcon) {
        root.childData = [];
      }
    }
    for (const data of root.childData) {
      this.removeBlankChildren(data);
    }
  }
  prepareForDisplay(root) {
    if (root.label) {
      root.label = Locale.compose(root.label);
    }
    root.value = this.getValueDisplayString(root.valueNum, root.valueType, root.isModifier);
    for (const data of root.childData) {
      this.prepareForDisplay(data);
    }
  }
}
const SortYields = (yields) => {
  return yields.sort((a, b) => {
    const aYieldIndex = GameInfo.Yields.findIndex((y) => y.YieldType === a.yieldType);
    const bYieldIndex = GameInfo.Yields.findIndex((y) => y.YieldType === b.yieldType);
    return aYieldIndex - bYieldIndex;
  });
};
const CityYields = new CityYieldsEngine();

export { CityYields as C, SortYields as S };
//# sourceMappingURL=utilities-city-yields.chunk.js.map

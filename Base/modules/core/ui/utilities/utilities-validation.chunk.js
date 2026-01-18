const number = ({ value, min, max, defaultValue = 0 }) => {
  if (value === null || value === void 0) {
    return defaultValue;
  }
  value = typeof value === "number" ? value : parseInt(value);
  if (typeof value === "string") {
    value = parseInt(value);
  }
  if (isNaN(value)) {
    value = defaultValue;
  }
  if (min !== void 0) {
    value = Math.max(min, value);
  }
  if (max !== void 0) {
    value = Math.min(max, value);
  }
  return value;
};

export { number as n };
//# sourceMappingURL=utilities-validation.chunk.js.map

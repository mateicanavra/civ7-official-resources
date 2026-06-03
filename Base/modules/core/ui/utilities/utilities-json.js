function stringifyJSON(value) {
  return JSON.stringify(value, (_k, v) => {
    if (typeof v === "bigint") {
      return v.toString();
    }
    return v;
  });
}

export { stringifyJSON };
//# sourceMappingURL=utilities-json.js.map

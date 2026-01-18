const DEBUG_LOG_FILTER = false;
class InputFilterSingleton {
  static Instance;
  // Singleton
  _allowFilters = false;
  // quick way to turn on/off all filters without deleting them
  activeFilters = [];
  // If the name for an input is contained in activeFilters, this manager will block the input
  get allowFilters() {
    return this._allowFilters;
  }
  set allowFilters(newValue) {
    if (this._allowFilters != newValue) {
      this._allowFilters = newValue;
    }
  }
  /**
   * Singleton accessor
   */
  static getInstance() {
    if (!InputFilterSingleton.Instance) {
      InputFilterSingleton.Instance = new InputFilterSingleton();
    }
    return InputFilterSingleton.Instance;
  }
  /**
   * Handles touch inputs
   * @param {InputEngineEvent} inputEvent An input event
   * @returns true if the input is still "live" and not yet cancelled.
   * @implements InputEngineEvent
   */
  handleInput(inputEvent) {
    const status = inputEvent.detail.status;
    const name = inputEvent.detail.name;
    if (status != InputActionStatuses.FINISH) {
      return true;
    }
    if (this.activeFilters.length <= 0 || !this.allowFilters) {
      return true;
    }
    const filter = this.activeFilters.find((filter2) => filter2.inputName == name);
    if (filter) {
      if (DEBUG_LOG_FILTER) {
        console.log(`InputFilter: '${filter.inputName}' filtered by ${filter.filterSource})`);
      }
      return false;
    }
    return true;
  }
  /**
   * Input filter doesn't handle navigation input events
   */
  handleNavigation() {
    return true;
  }
  /**
   * Adds a filter
   * @param inputFilter Contains the input action to be filtered.
   * @returns true if the filter was added
   */
  addInputFilter(inputFilter) {
    const existingEntryIndex = this.activeFilters.findIndex(
      (entry) => entry.inputName == inputFilter.inputName
    );
    if (existingEntryIndex != -1) {
      console.warn(
        `InputFilter: Cannot add '${inputFilter.inputName}' from ${inputFilter.filterSource}, already added by ${this.activeFilters[existingEntryIndex].filterSource} `
      );
      return false;
    }
    if (DEBUG_LOG_FILTER) {
      console.log(`InputFilter: added  '${inputFilter.inputName}' from ${inputFilter.filterSource}`);
    }
    this.activeFilters.push(inputFilter);
    return true;
  }
  /**
   * Removes a given filter by name
   * @param inputFilter the filter to remove
   * @returns true if the filter was removed
   */
  removeInputFilter(inputFilter) {
    const existingEntryIndex = this.activeFilters.findIndex(
      (entry) => entry.inputName == inputFilter.inputName
    );
    if (existingEntryIndex == -1) {
      return false;
    }
    if (DEBUG_LOG_FILTER) {
      console.log(`InputFilter: remove '${inputFilter.inputName}' from ${inputFilter.filterSource}`);
    }
    this.activeFilters.splice(existingEntryIndex, 1);
    return true;
  }
  /**
   * Cleanup the manager from all current filters
   */
  removeAllInputFilters() {
    this.activeFilters = [];
  }
}
const InputFilterManager = InputFilterSingleton.getInstance();

export { InputFilterManager as default };
//# sourceMappingURL=input-filter.chunk.js.map

const DEBUG_LOG_META_INFO = false;
const DEBUG_LOG_WRITES = false;
const DEBUG_LOG_READS = false;
const CATALOG_FORMAT_VERSION = 3;
class SerialBase {
  id;
  scope;
  hashPreamble;
  childrenIDs = /* @__PURE__ */ new Set();
  /* Which player this is for. If null, it's global. */
  player = null;
  /**
   * CTOR
   * @param id is the identifier of this object in the catalog
   * @param scope the parent scope (if the parent is the catalog, it's the name of the catalog).
   */
  constructor(id, scope, player = null) {
    this.id = id;
    this.scope = scope;
    this.player = player ?? null;
    this.hashPreamble = "_" + scope + "_" + id + "_";
    this.readIDs();
  }
  /**
   * Consistent way to make a hash from a value using the preamble
   * @param key Value to hash (along with the preamble.)
   * @returns hash value
   */
  makeHash(key) {
    const hash = Database.makeHash(this.hashPreamble + key);
    return hash;
  }
  /**
   * Actual write to the Apps tutorial store.  If player is set, writes to that player's tutorial, otherwise writes globally.
   * @param hash of the key value to write into.
   * @param value what to actually write
   */
  internalWrite(hash, value) {
    if (!this.player) {
      GameTutorial.setProperty(hash, value);
    } else {
      this.player.Tutorial.setProperty(hash, value);
    }
  }
  /**
   * Actual read from the Apps tutorial store.  If player is set, reads from that player's tutorial, otherwise reads globally.
   * @param hash representation of the key to read the value from.
   * @returns the value read
   */
  internalRead(hash) {
    const value = this.player != null ? this.player.Tutorial.getProperty(hash) : GameTutorial.getProperty(hash);
    return value;
  }
  /**
   * Read in the list of ids (keys) for the values this scopes.
   * @returns the number of IDs read or -1 if they don't exist
   */
  readIDs() {
    const hash = this.makeHash("KEYS");
    const ids = this.internalRead(hash);
    if (ids) {
      if (typeof ids === "string") {
        this.childrenIDs = new Set(ids.split(","));
        return this.childrenIDs.size;
      }
    }
    return -1;
  }
  /**
   * Write out the list of ids (keys) for the values this scopes.
   */
  writeIDs() {
    const hash = this.makeHash("KEYS");
    const ids = Array.from(this.childrenIDs).join(",");
    this.internalWrite(hash, ids);
  }
  /**
   * Get collection of IDs maintained by this object.
   * @returns a set of IDs
   */
  getKeys() {
    return this.childrenIDs;
  }
  /**
   * Debug Helper
   * @returns a comma separated string of IDs maintained by this object
   */
  getKeysAsString() {
    return [...this.childrenIDs].join(", ");
  }
}
class SerialObject extends SerialBase {
  /**
   * Read a single value
   * @param key of value to read
   * @returns a type supported for serialization
   */
  read(key) {
    const hash = this.makeHash(key);
    const value = this.internalRead(hash);
    if (DEBUG_LOG_READS) {
      console.log(
        `Catalog-Read : '${key}'(${hash}) = '${value}', player: ${this.player ? this.player.id : "*"}, key='${this.hashPreamble + key}'`
      );
    }
    return value;
  }
  /**
   * Write a single key,value
   * @param key the key to associate with this value
   * @param value to save out
   */
  write(key, value) {
    const hash = this.makeHash(key);
    if (DEBUG_LOG_WRITES) {
      console.log(
        `Catalog-Write : '${key}'(${hash}) = '${value}', player: ${this.player ? this.player.id : "*"}, key='${this.hashPreamble + key}'`
      );
    }
    this.internalWrite(hash, value);
    if (!this.childrenIDs.has(key)) {
      this.childrenIDs.add(key);
      this.writeIDs();
    }
  }
}
class Catalog extends SerialBase {
  /** The player for whom to write properties. If null, writes globally. */
  _player = null;
  /* Version file was saved with. */
  _fileVersion = 0;
  /* Accessor to version file was saved with. */
  get fileVersion() {
    return this._fileVersion;
  }
  /* version running now in the catalog. */
  _runningVersion = 0;
  /* Accessor to version running now in the catalog. */
  get runningVersion() {
    return this._runningVersion;
  }
  /* Was the catalog just newly created? */
  _justCreated = false;
  /* Accessor to if the catalog was just created. */
  get justCreated() {
    return this._justCreated;
  }
  /**
   * CTOR
   * @description Tracks object with values in array kept in key: _DEFAULT__KEYS
   * @param scope, optional parameter for what named "catalog" objects will be a part of
   * @param version, optional, layout of the catalog's data that is specific to this one catalog.
   */
  constructor(properties) {
    super("", properties.name, properties.player ?? null);
    this._player = properties.player ?? null;
    this._runningVersion = properties.version ?? 0;
    this.realizeInfoBlock(this._runningVersion);
  }
  /**
   * Write the meta-info block that stores info about this catalog.
   */
  realizeInfoBlock(version) {
    if (DEBUG_LOG_META_INFO) {
      console.log(`Catalog: '${this.scope}' realizing info block. version: ${version}`);
    }
    const info = new SerialObject("INFO", this.scope, this._player);
    let diskVersion = info.read("version");
    this._justCreated = diskVersion === void 0;
    this._fileVersion = this._justCreated ? version : diskVersion;
    if (DEBUG_LOG_META_INFO) {
      console.log(`Catalog: '${this.scope}' diskVersion: ${diskVersion}`);
      console.log(`Catalog: '${this.scope}' justCreated: ${this._justCreated}`);
      console.log(`Catalog: '${this.scope}' fileVersion: ${this._fileVersion}`);
    }
    if (this._justCreated) {
      info.write("version", version);
      info.write("first_version", version);
      info.write("catalog_format", CATALOG_FORMAT_VERSION);
      info.write("created", Date.now());
      info.write("hosting", Network.getLocalHostingPlatform());
      if (DEBUG_LOG_META_INFO) {
        console.log(`Catalog: '${this.scope}' is NEW -------------------------- `);
        console.log(`Catalog: '${this.scope}'        version: ${version}`);
        console.log(`Catalog: '${this.scope}'  first_version: ${version}`);
        console.log(`Catalog: '${this.scope}' catalog_format: ${CATALOG_FORMAT_VERSION}`);
        console.log(`Catalog: '${this.scope}'        created: ${Date.now()}`);
        console.log(`Catalog: '${this.scope}'        hosting: ${Network.getLocalHostingPlatform()}`);
      }
    } else {
      if (DEBUG_LOG_META_INFO) {
        console.log(`Catalog: '${this.scope}' is old -------------------------- `);
        console.log(`Catalog: '${this.scope}'  diskVersion: ${diskVersion}`);
        console.log(`Catalog: '${this.scope}'      version: ${version}`);
      }
      if (diskVersion < version) {
        console.log(
          `utility-serialize: Catalog object '${this.scope}' in save file is ${diskVersion}, app wants ${version}.`
        );
        diskVersion = version;
        info.write("version", version);
      } else if (diskVersion > version) {
        console.warn(
          `utility-serialize: Catalog object '${this.scope}' file version is NEWER than app.  File is ${diskVersion}, app is ${version}. (Ok if running an old build).`
        );
      }
    }
  }
  /**
   * Return an object associated with this catalog; creates one if it doesn't exist.
   * @param id Identifier of the object.
   * @returns {SerialObject}
   */
  getObject(id) {
    if (!this.exists(id)) {
      this.childrenIDs.add(id);
      this.writeIDs();
    }
    return new SerialObject(id, this.scope + "_OBJ", this._player);
  }
  /**
   * Does an object exist in this catalog?
   * @param id Identifier of the object.
   * @returns true if object exists.
   */
  exists(id) {
    return this.childrenIDs.has(id);
  }
}

export { Catalog, SerialObject };
//# sourceMappingURL=utility-serialize.js.map

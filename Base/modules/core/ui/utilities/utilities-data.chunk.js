import { C as ComponentID } from './utilities-component-id.chunk.js';

class DatabaseCache {
  dbName;
  dbChanges = -1;
  dbCachedResults = /* @__PURE__ */ new Map();
  constructor(dbName) {
    this.dbName = dbName;
  }
  query(sql) {
    this.checkCache();
    const cachedResults = this.dbCachedResults.get(sql);
    if (cachedResults === void 0) {
      const results = Database.query(this.dbName, sql);
      this.dbCachedResults.set(sql, results ?? []);
      return results ?? [];
    } else {
      return cachedResults;
    }
  }
  checkCache() {
    const changes = Database.changes(this.dbName);
    if (changes != this.dbChanges) {
      this.wipeCache();
      this.dbChanges = changes;
    }
  }
  wipeCache() {
    this.dbCachedResults.clear();
  }
}
var TradeRoute;
((TradeRoute2) => {
  function isWithCity(route, cityId) {
    if (!cityId) return false;
    return ComponentID.isMatch(route.leftCityID, cityId) || ComponentID.isMatch(route.rightCityID, cityId);
  }
  TradeRoute2.isWithCity = isWithCity;
  function getOppositeCityID(route, cityId) {
    if (ComponentID.isMatch(route.leftCityID, cityId)) {
      return route.rightCityID;
    } else if (ComponentID.isMatch(route.rightCityID, cityId)) {
      return route.leftCityID;
    }
    return null;
  }
  TradeRoute2.getOppositeCityID = getOppositeCityID;
  function getOppositeCity(route, cityId) {
    if (ComponentID.isMatch(route.leftCityID, cityId)) {
      return Cities.get(route.rightCityID);
    } else if (ComponentID.isMatch(route.rightCityID, cityId)) {
      return Cities.get(route.leftCityID);
    }
    return null;
  }
  TradeRoute2.getOppositeCity = getOppositeCity;
  function getCityPayload(route, cityId) {
    if (ComponentID.isMatch(route.leftCityID, cityId)) {
      return route.leftPayload;
    }
    if (ComponentID.isMatch(route.rightCityID, cityId)) {
      return route.rightPayload;
    }
    return null;
  }
  TradeRoute2.getCityPayload = getCityPayload;
})(TradeRoute || (TradeRoute = {}));

export { DatabaseCache as D, TradeRoute as T };
//# sourceMappingURL=utilities-data.chunk.js.map

var BannerType = /* @__PURE__ */ ((BannerType2) => {
  BannerType2[BannerType2["custom"] = 0] = "custom";
  BannerType2[BannerType2["town"] = 1] = "town";
  BannerType2[BannerType2["city"] = 2] = "city";
  BannerType2[BannerType2["village"] = 3] = "village";
  BannerType2[BannerType2["cityState"] = 4] = "cityState";
  return BannerType2;
})(BannerType || {});
var CityStatusType = /* @__PURE__ */ ((CityStatusType2) => {
  CityStatusType2[CityStatusType2["none"] = 0] = "none";
  CityStatusType2["happy"] = "YIELD_HAPPINESS";
  CityStatusType2["unhappy"] = "YIELD_UNHAPPINESS";
  CityStatusType2["angry"] = "YIELD_ANGRY";
  CityStatusType2["plague"] = "YIELD_PLAGUE";
  return CityStatusType2;
})(CityStatusType || {});
function makeEmptyBannerData() {
  return {
    bannerType: 0 /* custom */,
    tooltip: ""
  };
}
const BANNER_INVALID_LOCATION = -9999;

export { BANNER_INVALID_LOCATION, BannerType, CityStatusType, makeEmptyBannerData };
//# sourceMappingURL=banner-support.js.map

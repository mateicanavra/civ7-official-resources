import { DatabaseCache } from '../../../ui/utilities/utilities-data.js';

function SyncretismQueryTemplate(tableName, keyTable, keyType, keyName) {
  return `
		SELECT 
			t.${keyType} as Key,
			k.${keyName} as KeyName,
			ak.AgeType as KeyAgeType,
			ak.Name as KeyAgeName,
			t.UnlockCivilizationType as CivilizationType,
			c.CivilizationName,
			a.AgeType,
			a.Name as AgeName
		FROM ${tableName} t
		INNER JOIN ${keyTable} k
			ON t.${keyType} = k.${keyType}
		INNER JOIN Civilizations c 
			ON t.UnlockCivilizationType = c.CivilizationType
		INNER JOIN Ages a 
			ON c.Domain = a.PlayerCivilizationDomain
		LEFT JOIN Civilizations kc
			ON t.${keyType} = kc.CivilizationType
		LEFT JOIN Ages ak
			ON kc.Domain = ak.PlayerCivilizationDomain
		ORDER BY 
			a.ChronologyIndex ASC;
	`;
}
const LeaderSyncretismQuery = SyncretismQueryTemplate(
  "LeaderSyncretismUnlocks",
  "Leaders",
  "LeaderType",
  "LeaderName"
);
const CivSyncretismQuery = SyncretismQueryTemplate(
  "CivilizationSyncretismUnlocks",
  "Civilizations",
  "CivilizationType",
  "CivilizationName"
);
function createSyncretismDataModel() {
  const info = /* @__PURE__ */ new Map();
  const dbCache = new DatabaseCache("config");
  const civilizationItems = dbCache.query(`
		SELECT 
			ci.*, 
			CASE WHEN se.Type IS NOT NULL THEN se.IncludeAsInfrastructureUpgrade WHEN ci.Kind IS NULL OR ci.Kind <> 'KIND_UNIT' THEN 1 ELSE 0 END AS Infrastructure, 
			CASE WHEN se.Type IS NOT NULL THEN se.IncludeAsUnitUpgrade WHEN ci.Kind = 'KIND_UNIT' THEN 1 ELSE 0 END AS Unit 
		FROM CivilizationItems ci 
		LEFT JOIN SyncretismExceptions se ON ci.Type = se.Type 
		WHERE ci.Kind != "KIND_TRAIT" AND ci.CanSyncretize == 1
		ORDER BY ci.kind == "KIND_QUARTER" DESC;
	`);
  const civilizations = dbCache.query(`
		SELECT DISTINCT 
			c.CivilizationType, 
			c.CivilizationName, 
			a.AgeType, 
			a.Name AS AgeName, 
			a.ChronologyIndex 
		FROM Civilizations c 
		INNER JOIN Ages a ON c.Domain = a.PlayerCivilizationDomain 
		ORDER BY a.ChronologyIndex ASC;
	`);
  const itemsByType = /* @__PURE__ */ new Map();
  for (const item of civilizationItems) {
    const civType = item.CivilizationType;
    if (!itemsByType.has(civType)) {
      itemsByType.set(civType, []);
    }
    itemsByType.get(civType).push(item);
  }
  for (const row of civilizations) {
    const civType = row.CivilizationType;
    const data = {
      CivilizationName: row.CivilizationName,
      CivilizationType: civType,
      AgeType: row.AgeType,
      AgeName: row.AgeName,
      Infrastructure: [],
      Unit: []
    };
    const unlocks = itemsByType.get(civType) ?? [];
    for (const unlock of unlocks) {
      const unlockData = {
        Type: unlock.Type,
        Kind: unlock.Kind,
        Name: unlock.Name,
        Description: unlock.Description
      };
      const isUnit = String(unlock.Unit).toLowerCase() === "true" || unlock.Unit === 1;
      const isInfra = String(unlock.Infrastructure).toLowerCase() === "true" || unlock.Infrastructure === 1;
      if (isUnit) data.Unit.push(unlockData);
      if (isInfra) data.Infrastructure.push(unlockData);
    }
    info.set(row.CivilizationType, data);
  }
  return { Info: info };
}
const SyncretismDataModel = createSyncretismDataModel();

export { CivSyncretismQuery, LeaderSyncretismQuery, SyncretismDataModel };
//# sourceMappingURL=syncretism-model.js.map

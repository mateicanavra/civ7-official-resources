INSERT INTO CivilizationTraits (CivilizationType, TraitType)
SELECT c.CivilizationType, 'TRAIT_ANACHRONISTIC_CIV'
FROM Civilizations c
JOIN Ages a ON c.ApexAge = a.AgeType
WHERE a.Active <> 1
  AND NOT EXISTS (
      SELECT 1 
      FROM CivilizationTraits ct 
      WHERE ct.CivilizationType = c.CivilizationType 
        AND ct.TraitType = 'TRAIT_ANACHRONISTIC_CIV'
  );
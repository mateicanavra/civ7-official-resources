ALTER TABLE CivilizationItems RENAME TO CivilizationItemsOld;
CREATE TABLE CivilizationItems (
	"CivilizationDomain" TEXT NOT NULL,
	"CivilizationType" TEXT NOT NULL,
	"AgeType" TEXT,	-- Added "AgeType"
	"Type" TEXT,	-- Removed "NOT NULL" constraint
	"Kind" TEXT,	-- Removed "NOT NULL" constraint
	"Name" TEXT NOT NULL,
	"Description" TEXT NOT NULL,
	"Icon" TEXT,
	"SortIndex" INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY("CivilizationDomain", "CivilizationType", "AgeType", "Type")
);
INSERT INTO CivilizationItems("CivilizationDomain", "CivilizationType", "Type", "Kind", "Name", "Description", "Icon", "SortIndex") 
	SELECT
		"CivilizationDomain",
		"CivilizationType",
		"Type",
		"Kind",
		"Name",
		"Description",
		"Icon",
		"SortIndex"
		FROM "CivilizationItemsOld";
DROP TABLE CivilizationItemsOld;

ALTER TABLE LeaderItems RENAME TO LeaderItemsOld;
CREATE TABLE LeaderItems (
	"LeaderDomain" TEXT Default "StandardLeaders",
	"LeaderType" TEXT NOT NULL,
	"AgeType" TEXT,	-- Added "AgeType"
	"Type" TEXT,	-- Removed "NOT NULL" constraint
	"Kind" TEXT,	-- Removed "NOT NULL" constraint
	"Name" TEXT NOT NULL,
	"Description" TEXT NOT NULL,
	"Icon" TEXT,
	"SortIndex" INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY("LeaderDomain", "LeaderType", "AgeType", "Type")
);
INSERT INTO LeaderItems("LeaderDomain", "LeaderType", "Type", "Kind", "Name", "Description", "Icon", "SortIndex") 
	SELECT
		"LeaderDomain",
		"LeaderType",
		"Type",
		"Kind",
		"Name",
		"Description",
		"Icon",
		"SortIndex"
		FROM LeaderItemsOld;
DROP TABLE LeaderItemsOld;

-- These tables are shared with the gameplay database so they can be accessed during game creation
CREATE TABLE 'Traditions' (
	'TraditionType' TEXT NOT NULL,
	'AgeType' TEXT,
	'CultureSlotType' TEXT NOT NULL,
	'Description' TEXT,
	'IsCrisis' BOOLEAN NOT NULL DEFAULT 0,
	'Name' TEXT NOT NULL,
	'ObsoletesTraditionType' TEXT,
	'TraitType' TEXT,
	'IgnoreInitializeUnlock' BOOLEAN NOT NULL DEFAULT 0,
	'AllowInitializeAdvancedStart' BOOLEAN NOT NULL DEFAULT 0,
	PRIMARY KEY("TraditionType")
);

CREATE TABLE 'ProgressionTreeNodes' (
	'ProgressionTreeNodeType' TEXT NOT NULL,
	'CanBoost' BOOLEAN NOT NULL DEFAULT 1,
	'CanSteal' BOOLEAN NOT NULL DEFAULT 1,
	'Cost' INTEGER NOT NULL,
	'Description' TEXT,
	'IconString' TEXT,
	'Name' TEXT NOT NULL DEFAULT "",
	'ProgressionTree' TEXT NOT NULL,
	'Repeatable' BOOLEAN NOT NULL DEFAULT 0,
	'RepeatableCostProgressionModel' TEXT NOT NULL DEFAULT "NO_PROGRESSION_MODEL",
	'RepeatableCostProgressionParam1' INTEGER NOT NULL DEFAULT 0,
	'StartingUnlockDepth' INTEGER NOT NULL DEFAULT -1,
	'UILayoutColumn' INTEGER,
	'UILayoutRow' INTEGER,
	PRIMARY KEY("ProgressionTreeNodeType")
);

CREATE TABLE 'ProgressionTreeNodeUnlocks' (
	'ProgressionTreeNodeType' TEXT NOT NULL,
	'TargetType' TEXT NOT NULL,
	'AIIgnoreUnlockValue' BOOLEAN NOT NULL DEFAULT 0,
	'Hidden' BOOLEAN,
	'IconString' TEXT,
	'NotTraitType' TEXT,
	'RequiredTraitType' TEXT,
	'RequiredGovernmentType' TEXT,
	'TargetKind' TEXT NOT NULL,
	'UnlockDepth' INTEGER NOT NULL DEFAULT 1,
	PRIMARY KEY("ProgressionTreeNodeType", "TargetType")
);

CREATE TABLE 'LeaderSyncretismUnlocks' (
	'LeaderType' TEXT NOT NULL,
	'UnlockCivilizationType' TEXT NOT NULL,
	PRIMARY KEY("LeaderType", "UnlockCivilizationType")
);

CREATE TABLE 'CivilizationSyncretismUnlocks' (
	'CivilizationType' TEXT NOT NULL,
	'UnlockCivilizationType' TEXT NOT NULL,
	PRIMARY KEY("CivilizationType", "UnlockCivilizationType")
);

CREATE TABLE 'SyncretismExceptions' (
	'Type' TEXT NOT NULL,
	'IncludeAsInfrastructureUpgrade' BOOLEAN NOT NULL,
	'IncludeAsUnitUpgrade' BOOLEAN NOT NULL,
	'Kind' TEXT NOT NULL,
	PRIMARY KEY("Type")
);

CREATE TABLE 'CivSelfSyncretismUnlocks' (
	'CivilizationType' TEXT NOT NULL,
	'UnlockType' TEXT NOT NULL,
	'Kind' TEXT NOT NULL,
	'Age' TEXT NOT NULL,
	'ModifierID' TEXT NOT NULL,
	PRIMARY KEY("CivilizationType", "UnlockType", "Age")
);

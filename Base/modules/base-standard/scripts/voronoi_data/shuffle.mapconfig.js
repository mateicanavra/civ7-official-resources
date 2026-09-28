const shuffleSettings = {
  "generatorKey": 0,
  "mapConfig": {
    "totalLandmassSize": 40,
    "continentsSettings": {
      "maxSizeVariance": 33.33,
      "totalSizeScale": 1.05,
      "coastalIslands": 10,
      "coastalIslandsSize": 0.85
    },
    "fractalSettings": {
      "maxSizeVariance": 50,
      "minLandmassSeeds": 8,
      "maxLandmassSeeds": 12,
      "minDistantSeeds": 1,
      "maxDistantSeeds": 3,
      "forceAtLeastThree": 10,
      "coastalIslands": 6,
      "coastalIslandsMaxDistance": 2.5,
      "coastalIslandsMinDistance": 1.5,
      "coastalIslandsSize": 0.5,
      "coastalIslandsSizeVariance": 0.25
    },
    "archipelagoSettings": {
      "maxSizeVariance": 75,
      "minLandmassSeeds": 16,
      "landmassSeedVariance": 2,
      "minDistantSeeds": 5,
      "maxDistantSeeds": 8,
      "totalSizeScale": 0.8,
      "coastalIslands": 4,
      "coastalIslandsMaxDistance": 2.5,
      "coastalIslandsMinDistance": 1.5,
      "coastalIslandsSize": 0.3,
      "coastalIslandsSizeVariance": 0.25
    },
    "shatteredSeasSettings": {
      "maxSizeVariance": 15,
      "distantFactor": 0.25,
      "totalSizeScale": 0.9500000000000001,
      "coastalIslands": 5,
      "coastalIslandsSize": 0.4,
      "coastalIslandsSizeVariance": 0.25
    }
  },
  "generatorConfig": {
    "plate": {
      "factor": 0.45
    },
    "landmass": [
      {
        "playerAreas": 1,
        "coastalIslands": 10,
        "coastalIslandsSize": 0.85
      },
      {
        "playerAreas": 1,
        "coastalIslands": 6,
        "coastalIslandsMinDistance": 1.5,
        "coastalIslandsMaxDistance": 2.5,
        "coastalIslandsSize": 0.5,
        "coastalIslandsSizeVariance": 0.25
      },
      {
        "playerAreas": 1,
        "coastalIslands": 6,
        "coastalIslandsMinDistance": 1.5,
        "coastalIslandsMaxDistance": 2.5,
        "coastalIslandsSize": 0.5,
        "coastalIslandsSizeVariance": 0.25
      },
      {
        "playerAreas": 1,
        "coastalIslands": 6,
        "coastalIslandsMinDistance": 1.5,
        "coastalIslandsMaxDistance": 2.5,
        "coastalIslandsSize": 0.5,
        "coastalIslandsSizeVariance": 0.25
      },
      {
        "playerAreas": 1,
        "coastalIslands": 6,
        "coastalIslandsMinDistance": 1.5,
        "coastalIslandsMaxDistance": 2.5,
        "coastalIslandsSize": 0.5,
        "coastalIslandsSizeVariance": 0.25
      },
      {
        "playerAreas": 1,
        "coastalIslands": 6,
        "coastalIslandsMinDistance": 1.5,
        "coastalIslandsMaxDistance": 2.5,
        "coastalIslandsSize": 0.5,
        "coastalIslandsSizeVariance": 0.25
      }
    ]
  },
  "rulesConfig": {
    "Plates": {
      "Cell Area.weight": 0.15,
      "Cell Area.isActive": true,
      "Near Neighbor.weight": 0.8,
      "Near Neighbor.isActive": true,
      "Near Region Seed.weight": 0.02,
      "Near Region Seed.isActive": true,
      "Neighbors In Region.weight": 0.6,
      "Neighbors In Region.isActive": true
    },
    "Continents": {
      "Avoid Edge.weight": 1,
      "Avoid Edge.isActive": true,
      "Avoid Edge.poleDistanceFalloff": 2,
      "Avoid Edge.poleFalloffCurve": 0.2,
      "Avoid Edge.polePerturbationScale": 3,
      "Avoid Edge.polePerturbationWavelength": 2,
      "Avoid Edge.meridianDistanceFalloff": 1,
      "Avoid Edge.meridianFalloffCurve": 0.5,
      "Avoid Edge.avoidCorners": 12,
      "Cell Area.weight": 0.01,
      "Cell Area.isActive": true,
      "Near Neighbor.weight": 0.75,
      "Near Neighbor.isActive": true,
      "Near Region Seed.weight": 0.05,
      "Near Region Seed.isActive": true,
      "Near Region Seed.scaleFactor": 8,
      "Neighbors In Region.weight": 0.8,
      "Neighbors In Region.isActive": true,
      "Neighbors In Region.preferredNeighborCount": 2.6,
      "Near Map Center.weight": 0.5,
      "Near Map Center.isActive": true,
      "Avoid Other Regions.weight": 1,
      "Avoid Other Regions.isActive": true,
      "Avoid Other Regions.minDistance": 8,
      "Avoid Other Regions.distanceFalloff": 10,
      "Avoid Other Regions.falloffCurve": 0.2,
      "Avoid Other Region Groups.weight": 1,
      "Avoid Other Region Groups.isActive": false,
      "Near Plate Boundary.weight": 0.75,
      "Near Plate Boundary.isActive": true,
      "Near Plate Boundary.scaleFactor": 3,
      "Prefer Latitude.weight": 0.76,
      "Prefer Latitude.isActive": true,
      "Prefer Latitude.overlap": 4,
      "Prefer Latitude.latitudes": [
        {
          "latitude": 25,
          "weight": 20
        },
        {
          "latitude": 45,
          "weight": 20
        },
        {
          "latitude": 70,
          "weight": 20
        }
      ],
      "Near Other Region.weight": 0.5,
      "Near Other Region.isActive": false
    },
    "Fractal": {
      "Avoid Edge.weight": 1,
      "Avoid Edge.isActive": true,
      "Avoid Edge.avoidCorners": 20,
      "Cell Area.weight": 0.33,
      "Cell Area.isActive": true,
      "Near Neighbor.weight": 0.45,
      "Near Neighbor.isActive": true,
      "Near Region Seed.weight": 0.05,
      "Near Region Seed.isActive": true,
      "Neighbors In Region.weight": 0.28,
      "Neighbors In Region.isActive": true,
      "Neighbors In Region.preferredNeighborCount": 2.2,
      "Neighbors In Region.deviation": 0.5,
      "Near Map Center.weight": 0.05,
      "Near Map Center.isActive": false,
      "Avoid Other Regions.weight": 0.2,
      "Avoid Other Regions.isActive": true,
      "Avoid Other Regions.minDistance": 0,
      "Avoid Other Regions.falloffCurve": 0.5,
      "Avoid Other Region Groups.weight": 1,
      "Avoid Other Region Groups.isActive": true,
      "Avoid Other Region Groups.minDistance": 8,
      "Avoid Other Region Groups.distanceFalloff": 8,
      "Avoid Other Region Groups.falloffCurve": 1,
      "Near Plate Boundary.weight": 1,
      "Near Plate Boundary.isActive": true,
      "Near Plate Boundary.scaleFactor": 3,
      "Near Plate Boundary.directionInfluence": 0.8,
      "Prefer Latitude.weight": 0.5,
      "Prefer Latitude.isActive": true,
      "Prefer Latitude.latitudes": [],
      "Near Other Region.weight": 2,
      "Near Other Region.isActive": true,
      "Near Other Region.scoreDistance": 15
    },
    "Archipelago": {
      "Avoid Edge.weight": 1,
      "Avoid Edge.isActive": true,
      "Avoid Edge.avoidCorners": 20,
      "Cell Area.weight": 0.33,
      "Cell Area.isActive": true,
      "Near Neighbor.weight": 0.45,
      "Near Neighbor.isActive": false,
      "Near Region Seed.weight": 0.05,
      "Near Region Seed.isActive": true,
      "Neighbors In Region.weight": 0.28,
      "Neighbors In Region.isActive": true,
      "Neighbors In Region.preferredNeighborCount": 2.2,
      "Neighbors In Region.deviation": 0.5,
      "Near Map Center.weight": 0.05,
      "Near Map Center.isActive": false,
      "Avoid Other Regions.weight": 1,
      "Avoid Other Regions.isActive": true,
      "Avoid Other Regions.minDistance": 1,
      "Avoid Other Regions.falloffCurve": 0.5,
      "Avoid Other Region Groups.weight": 1,
      "Avoid Other Region Groups.isActive": true,
      "Avoid Other Region Groups.distanceFalloff": 6,
      "Avoid Other Region Groups.falloffCurve": 0.5,
      "Near Plate Boundary.weight": 1,
      "Near Plate Boundary.isActive": true,
      "Near Plate Boundary.directionInfluence": 0.8,
      "Prefer Latitude.weight": 0.5,
      "Prefer Latitude.isActive": true,
      "Prefer Latitude.latitudes": [],
      "Near Other Region.weight": 2,
      "Near Other Region.isActive": true,
      "Near Other Region.disableDistance": 2.5
    },
    "ShatteredSeas": {
      "Avoid Edge.weight": 1,
      "Avoid Edge.isActive": true,
      "Avoid Edge.poleDistance": 1,
      "Avoid Edge.poleDistanceFalloff": 3,
      "Avoid Edge.poleFalloffCurve": 0.45,
      "Avoid Edge.polePerturbationScale": 4,
      "Avoid Edge.meridianDistanceFalloff": 4,
      "Avoid Edge.meridianFalloffCurve": 0.5,
      "Avoid Edge.avoidCorners": 12,
      "Cell Area.weight": 0.1,
      "Cell Area.isActive": true,
      "Near Neighbor.weight": 0.5,
      "Near Neighbor.isActive": true,
      "Near Neighbor.scaleFactor": 2,
      "Near Neighbor.min": 0.5,
      "Near Neighbor.max": 4,
      "Near Region Seed.weight": 0.2,
      "Near Region Seed.isActive": true,
      "Near Region Seed.scaleFactor": 8,
      "Neighbors In Region.weight": 0.5,
      "Neighbors In Region.isActive": true,
      "Neighbors In Region.preferredNeighborCount": 3.5,
      "Neighbors In Region.deviation": 1.5,
      "Near Map Center.weight": 0.05,
      "Near Map Center.isActive": false,
      "Avoid Other Regions.weight": 1,
      "Avoid Other Regions.isActive": true,
      "Avoid Other Regions.minDistance": 1.6,
      "Avoid Other Regions.distanceFalloff": 6,
      "Avoid Other Region Groups.weight": 1,
      "Avoid Other Region Groups.isActive": true,
      "Avoid Other Region Groups.minDistance": 4.5,
      "Avoid Other Region Groups.distanceFalloff": 6,
      "Avoid Other Region Groups.falloffCurve": 0.5,
      "Near Plate Boundary.weight": 0.75,
      "Near Plate Boundary.isActive": true,
      "Near Plate Boundary.scaleFactor": 2,
      "Near Plate Boundary.directionInfluence": 0.7,
      "Prefer Latitude.weight": 0.76,
      "Prefer Latitude.isActive": true,
      "Prefer Latitude.overlap": 4,
      "Prefer Latitude.latitudes": [
        {
          "latitude": 25,
          "weight": 20
        },
        {
          "latitude": 45,
          "weight": 20
        },
        {
          "latitude": 70,
          "weight": 20
        }
      ],
      "Near Other Region.weight": 3,
      "Near Other Region.isActive": true,
      "Near Other Region.disableDistance": 2,
      "Near Other Region.disabledOnTouch": 1,
      "Near Other Region.scoreDistance": 30
    },
    "Coastal Islands": {
      "Avoid Edge.weight": 1,
      "Avoid Edge.isActive": true,
      "Avoid Edge.poleDistance": 1,
      "Avoid Edge.poleDistanceFalloff": 2.5,
      "Avoid Edge.poleFalloffCurve": 0.35,
      "Avoid Edge.polePerturbationScale": 3.5,
      "Avoid Edge.polePerturbationWavelength": 2,
      "Avoid Edge.meridianDistanceFalloff": 3,
      "Avoid Edge.meridianFalloffCurve": 0.35,
      "Avoid Edge.avoidCorners": 12,
      "Near Neighbor.weight": 0.5,
      "Near Neighbor.isActive": true,
      "Avoid Other Regions.weight": 1,
      "Avoid Other Regions.isActive": true,
      "Avoid Other Regions.minDistance": 2,
      "Avoid Other Regions.distanceFalloff": 2,
      "Avoid Other Region Groups.weight": 1.25,
      "Avoid Other Region Groups.isActive": true,
      "Avoid Own Region.weight": 1,
      "Avoid Own Region.isActive": true,
      "Avoid Own Region.minDistance": 1,
      "Avoid Own Region.distanceFalloff": 2,
      "Avoid Islands.weight": 1,
      "Avoid Islands.isActive": true,
      "Avoid Islands.distanceFalloff": 2,
      "Near Plate Boundary.weight": 0.75,
      "Near Plate Boundary.isActive": true,
      "Near Plate Boundary.scaleFactor": 2,
      "Near Region Seed.weight": 0.3,
      "Near Region Seed.isActive": true,
      "Near Region Seed.scaleFactor": 41,
      "Near Region Seed.invert": 1
    },
    "Islands": {
      "Avoid Edge.weight": 1,
      "Avoid Edge.isActive": true,
      "Avoid Edge.poleDistance": 1,
      "Avoid Edge.poleDistanceFalloff": 3,
      "Avoid Edge.poleFalloffCurve": 0.5,
      "Avoid Edge.meridianDistance": 1,
      "Avoid Edge.meridianDistanceFalloff": 4.5,
      "Avoid Edge.meridianFalloffCurve": 0.4,
      "Avoid Edge.avoidCorners": 16,
      "Cell Area.weight": 0.15,
      "Cell Area.isActive": true,
      "Cell Area.scaleFactor": -0.2,
      "Near Neighbor.weight": 0.8,
      "Near Neighbor.isActive": true,
      "Near Neighbor.scaleFactor": 1.25,
      "Near Region Seed.weight": 0.03,
      "Near Region Seed.isActive": true,
      "Neighbors In Region.weight": 0.65,
      "Neighbors In Region.isActive": true,
      "Neighbors In Region.preferredNeighborCount": 2,
      "Neighbors In Region.deviation": 1.25,
      "Near Map Center.weight": 0.04,
      "Near Map Center.isActive": false,
      "Avoid Other Regions.weight": 1,
      "Avoid Other Regions.isActive": true,
      "Avoid Other Regions.distanceFalloff": 8,
      "Avoid Other Regions.falloffCurve": 0.2,
      "Near Plate Boundary.weight": 0.75,
      "Near Plate Boundary.isActive": true,
      "Near Plate Boundary.scaleFactor": 2,
      "Near Plate Boundary.directionInfluence": 0.9
    },
    "Erosion": {
      "Neighbors In Region.weight": 0.6,
      "Neighbors In Region.isActive": true,
      "Neighbors In Region.preferredNeighborCount": 2,
      "Near Plate Boundary.weight": 0.75,
      "Near Plate Boundary.isActive": true,
      "Near Plate Boundary.scaleFactor": 1,
      "Near Plate Boundary.invert": 1,
      "Wave Exposure.weight": 0.5,
      "Wave Exposure.isActive": true,
      "Wave Exposure.exposureFactor": 0
    },
    "Mountains": {
      "Cell Area.weight": 0.23,
      "Cell Area.isActive": true,
      "Near Neighbor.weight": 0.2,
      "Near Neighbor.isActive": true,
      "Neighbors In Region.weight": 0.45,
      "Neighbors In Region.isActive": true,
      "Neighbors In Region.preferredNeighborCount": 5.5,
      "Neighbors In Region.deviation": 4,
      "Near Plate Boundary.weight": 0.8,
      "Near Plate Boundary.isActive": true,
      "Near Plate Boundary.scaleFactor": 0.75,
      "Near Plate Boundary.directionInfluence": 0.35
    },
    "Volcanoes": {
      "Cell Area.weight": 0.3,
      "Cell Area.isActive": true,
      "Cell Area.invert": true,
      "Neighbors In Region.weight": 0.9,
      "Neighbors In Region.isActive": true,
      "Neighbors In Region.preferredNeighborCount": 2
    },
    "Elevation": {
      "Near Plate Boundary.weight": 1,
      "Near Plate Boundary.isActive": true,
      "Near Plate Boundary.scaleFactor": 1,
      "Near Plate Boundary.directionInfluence": 0.6,
      "Cell Area.weight": 100,
      "Cell Area.isActive": true,
      "Near Neighbor.weight": 0.425,
      "Near Neighbor.isActive": true,
      "Near Neighbor.min": 0.5,
      "Near Neighbor.max": 4,
      "Avoid Other Regions.weight": 1,
      "Avoid Other Regions.isActive": true,
      "Avoid Other Regions.minDistance": 0,
      "Avoid Other Regions.distanceFalloff": 10,
      "Avoid Other Regions.falloffCurve": 0.15
    }
  },
  "hexConfig": {},
  "variantSettings": {
    "Sea Level": {
      "settings": {
        "High": {
          "generatorSettings": {},
          "mapSettings": {
            "totalLandmassSize": [
              0.82,
              2
            ],
            "fractalSettings": {
              "totalDistantSize": [
                0.8,
                2
              ]
            },
            "archipelagoSettings": {
              "totalDistantSize": [
                0.8,
                2
              ]
            }
          },
          "ruleSettings": {}
        },
        "Low": {
          "generatorSettings": {},
          "mapSettings": {
            "totalLandmassSize": [
              1.16,
              2
            ],
            "fractalSettings": {
              "totalDistantSize": [
                1.4,
                2
              ]
            },
            "archipelagoSettings": {
              "totalDistantSize": [
                1.4,
                2
              ]
            },
            "shatteredSeasSettings": {
              "coastalIslands": [
                0.6,
                2
              ]
            }
          },
          "ruleSettings": {}
        }
      }
    },
    "World Age": {
      "settings": {
        "Old": {
          "generatorSettings": {},
          "mapSettings": {}
        },
        "Young": {
          "generatorSettings": {},
          "mapSettings": {}
        }
      }
    }
  }
};

export { shuffleSettings as default };
//# sourceMappingURL=shuffle.mapconfig.js.map

const continentSettings = {
  "generatorKey": 0,
  "mapConfig": {
    "totalPlayers": 4,
    "totalLandmassSize": 40,
    "minLandmassSize": 16
  },
  "generatorConfig": {
    "plate": {
      "plateRotationMultiple": 5
    },
    "landmass": [
      {
        "erosionPercent": 4,
        "erosionTime": 1,
        "erosionRandomness": 0.6,
        "playerAreas": 2,
        "coastalIslands": 10,
        "coastalIslandsSize": 0.85
      },
      {
        "erosionPercent": 4,
        "erosionTime": 1,
        "erosionRandomness": 0.6,
        "playerAreas": 2,
        "coastalIslands": 10,
        "coastalIslandsSize": 0.85
      }
    ],
    "island": {
      "minSize": 0.1,
      "totalSize": 4.5,
      "variance": 1,
      "meridianDistance": 2,
      "landmassDistance": 5,
      "islandDistance": 4,
      "erosionPercent": 3
    },
    "mountain": {
      "percent": 12,
      "randomize": 35
    }
  },
  "rulesConfig": {
    "Plates": {
      "Cell Area.weight": 0.15,
      "Cell Area.isActive": true,
      "Near Neighbor.weight": 0.8,
      "Near Neighbor.isActive": true,
      "Near Neighbor.scaleFactor": 0.5,
      "Near Region Seed.weight": 0.02,
      "Near Region Seed.isActive": true,
      "Neighbors In Region.weight": 0.6,
      "Neighbors In Region.isActive": true,
      "Neighbors In Region.preferredNeighborCount": 6,
      "Neighbors In Region.deviation": 3
    },
    "Landmasses": {
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
      "Near Map Center.weight": 0.05,
      "Near Map Center.isActive": false,
      "Avoid Other Regions.weight": 1,
      "Avoid Other Regions.isActive": true,
      "Avoid Other Regions.minDistance": 8,
      "Avoid Other Regions.distanceFalloff": 10,
      "Avoid Other Regions.falloffCurve": 0.2,
      "Avoid Other Region Groups.weight": 1,
      "Avoid Other Region Groups.isActive": false,
      "Near Plate Boundary.weight": 0.75,
      "Near Plate Boundary.isActive": true,
      "Near Plate Boundary.scaleFactor": 1.5,
      "Near Plate Boundary.directionInfluence": 0.7000000000000001,
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
    "Coastal Islands": {
      "Avoid Edge.weight": 1,
      "Avoid Edge.isActive": true,
      "Avoid Edge.poleDistanceFalloff": 2,
      "Avoid Edge.poleFalloffCurve": 0.2,
      "Avoid Edge.polePerturbationScale": 3,
      "Avoid Edge.polePerturbationWavelength": 2,
      "Avoid Edge.meridianDistanceFalloff": 3,
      "Avoid Edge.meridianFalloffCurve": 0.5,
      "Avoid Edge.avoidCorners": 12,
      "Near Neighbor.weight": 0.5,
      "Near Neighbor.isActive": true,
      "Avoid Other Regions.weight": 1,
      "Avoid Other Regions.isActive": true,
      "Avoid Other Regions.minDistance": 6,
      "Avoid Other Region Groups.weight": 1,
      "Avoid Other Region Groups.isActive": false,
      "Avoid Own Region.weight": 2,
      "Avoid Own Region.isActive": true,
      "Avoid Own Region.minDistance": 1.5,
      "Avoid Own Region.distanceFalloff": 6,
      "Avoid Own Region.falloffCurve": 0.1,
      "Avoid Islands.weight": 1,
      "Avoid Islands.isActive": true,
      "Avoid Islands.distanceFalloff": 2,
      "Near Plate Boundary.weight": 0.5,
      "Near Plate Boundary.isActive": true,
      "Near Plate Boundary.scaleFactor": 2,
      "Near Plate Boundary.directionInfluence": 0.8,
      "Near Region Seed.weight": 1,
      "Near Region Seed.isActive": true,
      "Near Region Seed.scaleFactor": 50,
      "Near Region Seed.invert": 1
    },
    "Islands": {
      "Avoid Edge.weight": 1,
      "Avoid Edge.isActive": true,
      "Avoid Edge.poleDistance": 4,
      "Avoid Edge.poleDistanceFalloff": 1,
      "Avoid Edge.poleFalloffCurve": 0.5,
      "Avoid Edge.meridianDistance": 1,
      "Avoid Edge.meridianDistanceFalloff": 5,
      "Avoid Edge.meridianFalloffCurve": 0.3,
      "Avoid Edge.avoidCorners": 12,
      "Cell Area.weight": 0.15,
      "Cell Area.isActive": true,
      "Cell Area.scaleFactor": -0.2,
      "Near Neighbor.weight": 0.9,
      "Near Neighbor.isActive": true,
      "Near Neighbor.scaleFactor": 2,
      "Near Region Seed.weight": 0.03,
      "Near Region Seed.isActive": true,
      "Neighbors In Region.weight": 0.6,
      "Neighbors In Region.isActive": true,
      "Neighbors In Region.preferredNeighborCount": 2,
      "Neighbors In Region.deviation": 0.5,
      "Near Map Center.weight": 0.04,
      "Near Map Center.isActive": true,
      "Avoid Other Regions.weight": 1,
      "Avoid Other Regions.isActive": true,
      "Avoid Other Regions.distanceFalloff": 8,
      "Avoid Other Regions.falloffCurve": 0.30000000000000004,
      "Near Plate Boundary.weight": 1,
      "Near Plate Boundary.isActive": true,
      "Near Plate Boundary.scaleFactor": 2,
      "Near Plate Boundary.directionInfluence": 1
    },
    "Erosion": {
      "Neighbors In Region.weight": 0.6,
      "Neighbors In Region.isActive": true,
      "Near Plate Boundary.weight": 0.75,
      "Near Plate Boundary.isActive": true,
      "Near Plate Boundary.scaleFactor": 1,
      "Near Plate Boundary.invert": 1,
      "Wave Exposure.weight": 0.5,
      "Wave Exposure.isActive": true,
      "Wave Exposure.exposureFactor": 0
    },
    "Mountains": {
      "Cell Area.weight": 0.3,
      "Cell Area.isActive": true,
      "Cell Area.invert": true,
      "Near Neighbor.weight": 0.25,
      "Near Neighbor.isActive": false,
      "Neighbors In Region.weight": 0.6,
      "Neighbors In Region.isActive": true,
      "Neighbors In Region.preferredNeighborCount": 6,
      "Neighbors In Region.deviation": 4,
      "Near Plate Boundary.weight": 0.75,
      "Near Plate Boundary.isActive": true,
      "Near Plate Boundary.scaleFactor": 1,
      "Near Plate Boundary.directionInfluence": 0.4
    },
    "Volcanoes": {
      "Cell Area.weight": 0.3,
      "Cell Area.isActive": true,
      "Cell Area.invert": true,
      "Neighbors In Region.weight": 0.9,
      "Neighbors In Region.isActive": true,
      "Neighbors In Region.preferredNeighborCount": 0
    },
    "Elevation": {
      "Near Plate Boundary.weight": 3,
      "Near Plate Boundary.isActive": true,
      "Near Plate Boundary.scaleFactor": 1,
      "Near Plate Boundary.directionInfluence": 0.8,
      "Cell Area.weight": 0.21,
      "Cell Area.isActive": false,
      "Cell Area.invert": true,
      "Near Neighbor.weight": 0.6,
      "Near Neighbor.isActive": true,
      "Near Neighbor.min": 0.5,
      "Near Neighbor.max": 4,
      "Avoid Other Regions.weight": 1,
      "Avoid Other Regions.isActive": false,
      "Avoid Other Regions.minDistance": 0,
      "Avoid Other Regions.distanceFalloff": 10,
      "Avoid Other Regions.falloffCurve": 0.15
    }
  },
  "variantSettings": {
    "Sea Level": {
      "settings": {
        "High": {
          "generatorSettings": {
            "island": {
              "factor": [
                1.2857142857142856,
                2
              ],
              "totalSize": [
                0.8181818181818182,
                2
              ]
            },
            "landmass": [
              {
                "erosionPercent": [
                  2.5,
                  2
                ]
              },
              {
                "erosionPercent": [
                  2.5,
                  2
                ]
              }
            ]
          },
          "mapSettings": {
            "totalLandmassSize": [
              0.8,
              2
            ],
            "minLandmassSize": [
              0.875,
              2
            ]
          },
          "ruleSettings": {
            "Landmasses": {
              "Neighbors In Region": {
                "preferredNeighborCount": [
                  0.9230769230769231,
                  2
                ],
                "deviation": [
                  0.8,
                  2
                ]
              },
              "Avoid Other Regions": {
                "falloffCurve": [
                  2,
                  2
                ]
              }
            },
            "Coastal Islands": {
              "Avoid Other Landmass": {
                "distanceFalloff": [
                  2,
                  2
                ],
                "minDistance": [
                  1.5,
                  2
                ]
              }
            }
          }
        },
        "Low": {
          "generatorSettings": {
            "island": {
              "factor": [
                0.857142857142857,
                2
              ]
            }
          },
          "mapSettings": {
            "totalLandmassSize": [
              1.1,
              2
            ],
            "minLandmassSize": [
              1.125,
              2
            ]
          }
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

export { continentSettings as default };
//# sourceMappingURL=continents.mapconfig.js.map

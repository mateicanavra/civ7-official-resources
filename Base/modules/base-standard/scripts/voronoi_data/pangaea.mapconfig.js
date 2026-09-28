const pangaeaSettings = {
  "generatorKey": 0,
  "mapConfig": {},
  "generatorConfig": {
    "plate": {
      "factor": 0.75,
      "linearStrength": 0.8,
      "plateRotationMultiple": 5
    },
    "landmass": [
      {
        "size": 44,
        "xPos": 0.5571221484702831,
        "yPos": 0.5308308537422751,
        "erosionRandomness": 0.5,
        "playerAreas": 8,
        "coastalIslands": 40,
        "coastalIslandsMinDistance": 1.5,
        "coastalIslandsSize": 5
      }
    ],
    "island": {
      "factor": 0.35000000000000003,
      "minSize": 0.2,
      "maxSize": 2.25,
      "totalSize": 6,
      "poleDistance": 4,
      "meridianDistance": 1,
      "islandDistance": 4
    },
    "mountain": {
      "percent": 12,
      "randomize": 50
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
      "Avoid Edge.poleDistanceFalloff": 5,
      "Avoid Edge.poleFalloffCurve": 0.2,
      "Avoid Edge.polePerturbationScale": 4,
      "Avoid Edge.polePerturbationWavelength": 5,
      "Avoid Edge.meridianDistanceFalloff": 6,
      "Avoid Edge.meridianFalloffCurve": 0.3,
      "Avoid Edge.avoidCorners": 18,
      "Cell Area.weight": 0.1,
      "Cell Area.isActive": true,
      "Cell Area.min": 0.5,
      "Cell Area.max": 4,
      "Near Neighbor.weight": 0.5,
      "Near Neighbor.isActive": true,
      "Near Neighbor.scaleFactor": 2,
      "Near Neighbor.min": 0.5,
      "Near Neighbor.max": 4,
      "Near Region Seed.weight": 0.1,
      "Near Region Seed.isActive": true,
      "Near Region Seed.scaleFactor": 50,
      "Near Region Seed.invert": 1,
      "Neighbors In Region.weight": 0.25,
      "Neighbors In Region.isActive": true,
      "Neighbors In Region.preferredNeighborCount": 3.3000000000000003,
      "Neighbors In Region.deviation": 0.5,
      "Near Map Center.weight": 0.1,
      "Near Map Center.isActive": false,
      "Avoid Other Regions.weight": 1,
      "Avoid Other Regions.isActive": false,
      "Avoid Other Regions.distanceFalloff": 8,
      "Avoid Other Regions.falloffCurve": 0.2,
      "Avoid Other Region Groups.weight": 1,
      "Avoid Other Region Groups.isActive": false,
      "Near Plate Boundary.weight": 1,
      "Near Plate Boundary.isActive": true,
      "Near Plate Boundary.scaleFactor": 1,
      "Near Plate Boundary.directionInfluence": 0.7000000000000001,
      "Prefer Latitude.weight": 0.75,
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
      "Avoid Other Regions.distanceFalloff": 2,
      "Avoid Other Region Groups.weight": 1,
      "Avoid Other Region Groups.isActive": false,
      "Avoid Own Region.weight": 1,
      "Avoid Own Region.isActive": true,
      "Avoid Own Region.minDistance": 1.5,
      "Avoid Own Region.distanceFalloff": 8,
      "Avoid Own Region.falloffCurve": 0.8,
      "Avoid Islands.weight": 1,
      "Avoid Islands.isActive": true,
      "Avoid Islands.distanceFalloff": 2,
      "Near Plate Boundary.weight": 0.5,
      "Near Plate Boundary.isActive": true,
      "Near Plate Boundary.scaleFactor": 0.5,
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
      "Avoid Edge.meridianDistanceFalloff": 6,
      "Avoid Edge.meridianFalloffCurve": 0.3,
      "Avoid Edge.avoidCorners": 12,
      "Cell Area.weight": 0.15,
      "Cell Area.isActive": true,
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
      "Avoid Other Regions.falloffCurve": 0.15,
      "Near Plate Boundary.weight": 1,
      "Near Plate Boundary.isActive": true,
      "Near Plate Boundary.scaleFactor": 2,
      "Near Plate Boundary.directionInfluence": 1
    },
    "Erosion": {
      "Neighbors In Region.weight": 0.6,
      "Neighbors In Region.isActive": true,
      "Near Plate Boundary.weight": 1,
      "Near Plate Boundary.isActive": true,
      "Near Plate Boundary.scaleFactor": 2,
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
      "Near Plate Boundary.weight": 0.75,
      "Near Plate Boundary.isActive": true,
      "Near Plate Boundary.scaleFactor": 1,
      "Near Plate Boundary.directionInfluence": 0.4,
      "Cell Area.weight": 0.3,
      "Cell Area.isActive": true,
      "Cell Area.invert": true,
      "Near Neighbor.weight": 0.25,
      "Near Neighbor.isActive": false,
      "Avoid Other Regions.weight": 1,
      "Avoid Other Regions.isActive": true,
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
            "landmass": {
              "0": {
                "size": [
                  0.8181818181818182,
                  2
                ],
                "erosionPercent": [
                  1.5,
                  2
                ]
              }
            },
            "island": {
              "factor": [
                1.1999999999999997,
                2
              ]
            }
          },
          "mapSettings": {},
          "ruleSettings": {
            "Landmasses": {
              "Neighbors In Region": {
                "deviation": [
                  0.2,
                  0
                ]
              }
            }
          }
        },
        "Low": {
          "generatorSettings": {
            "landmass": {
              "0": {
                "size": [
                  1.1818181818181819,
                  2
                ],
                "erosionPercent": [
                  0.5,
                  2
                ]
              }
            },
            "island": {
              "factor": [
                0.857142857142857,
                2
              ]
            }
          },
          "mapSettings": {},
          "ruleSettings": {}
        }
      }
    }
  }
};

export { pangaeaSettings as default };
//# sourceMappingURL=pangaea.mapconfig.js.map

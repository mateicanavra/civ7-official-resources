const shatteredSeasSettings = {
  "generatorKey": 0,
  "mapConfig": {
    "totalLandmassSize": 43,
    "maxSizeVariance": 15,
    "totalDistantSize": 5,
    "distantFactor": 0.25
  },
  "generatorConfig": {
    "plate": {
      "factor": 0.5,
      "plateRotationMultiple": 5
    },
    "landmass": [
      {
        "erosionTime": 0.2,
        "erosionRandomness": 0.5,
        "playerAreas": 0,
        "coastalIslands": 5,
        "coastalIslandsSize": 0.4,
        "coastalIslandsSizeVariance": 0.25
      },
      {
        "erosionTime": 0.2,
        "erosionRandomness": 0.5,
        "playerAreas": 1,
        "coastalIslands": 5,
        "coastalIslandsSize": 0.4,
        "coastalIslandsSizeVariance": 0.25
      },
      {
        "erosionTime": 0.2,
        "erosionRandomness": 0.5,
        "playerAreas": 1,
        "coastalIslands": 5,
        "coastalIslandsSize": 0.4,
        "coastalIslandsSizeVariance": 0.25
      },
      {
        "erosionTime": 0.2,
        "erosionRandomness": 0.5,
        "playerAreas": 1,
        "coastalIslands": 5,
        "coastalIslandsSize": 0.4,
        "coastalIslandsSizeVariance": 0.25
      },
      {
        "erosionTime": 0.2,
        "erosionRandomness": 0.5,
        "playerAreas": 0,
        "coastalIslands": 5,
        "coastalIslandsSize": 0.4,
        "coastalIslandsSizeVariance": 0.25
      },
      {
        "erosionTime": 0.2,
        "erosionRandomness": 0.5,
        "playerAreas": 1,
        "coastalIslands": 5,
        "coastalIslandsSize": 0.4,
        "coastalIslandsSizeVariance": 0.25
      },
      {
        "erosionTime": 0.2,
        "erosionRandomness": 0.5,
        "playerAreas": 1,
        "coastalIslands": 5,
        "coastalIslandsSize": 0.4,
        "coastalIslandsSizeVariance": 0.25
      },
      {
        "erosionTime": 0.2,
        "erosionRandomness": 0.5,
        "playerAreas": 1,
        "coastalIslands": 5,
        "coastalIslandsSize": 0.4,
        "coastalIslandsSizeVariance": 0.25
      },
      {
        "erosionTime": 0.2,
        "erosionRandomness": 0.5,
        "playerAreas": 1,
        "coastalIslands": 5,
        "coastalIslandsSize": 0.4,
        "coastalIslandsSizeVariance": 0.25
      },
      {
        "erosionTime": 0.2,
        "erosionRandomness": 0.5,
        "playerAreas": 1,
        "coastalIslands": 5,
        "coastalIslandsSize": 0.4,
        "coastalIslandsSizeVariance": 0.25
      }
    ],
    "island": {
      "minSize": 0.25,
      "maxSize": 1,
      "totalSize": 3,
      "variance": 1,
      "poleDistance": 6,
      "meridianDistance": 4,
      "erosionPercent": 15
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
      "Avoid Other Regions.minDistance": 2.3000000000000003,
      "Avoid Other Regions.distanceFalloff": 8,
      "Avoid Other Regions.falloffCurve": 0.5,
      "Avoid Other Region Groups.weight": 1,
      "Avoid Other Region Groups.isActive": true,
      "Avoid Other Region Groups.minDistance": 4.5,
      "Avoid Other Region Groups.distanceFalloff": 6,
      "Avoid Other Region Groups.falloffCurve": 0.5,
      "Near Plate Boundary.weight": 0.75,
      "Near Plate Boundary.isActive": true,
      "Near Plate Boundary.scaleFactor": 3,
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
      "Near Other Region.weight": 3,
      "Near Other Region.isActive": true,
      "Near Other Region.disableDistance": 2,
      "Near Other Region.scoreDistance": 15
    },
    "Coastal Islands": {
      "Avoid Edge.weight": 1,
      "Avoid Edge.isActive": true,
      "Avoid Edge.poleDistance": 1,
      "Avoid Edge.poleDistanceFalloff": 2,
      "Avoid Edge.poleFalloffCurve": 0.2,
      "Avoid Edge.polePerturbationScale": 3,
      "Avoid Edge.polePerturbationWavelength": 2,
      "Avoid Edge.meridianDistanceFalloff": 3,
      "Avoid Edge.meridianFalloffCurve": 0.2,
      "Avoid Edge.avoidCorners": 12,
      "Near Neighbor.weight": 0.5,
      "Near Neighbor.isActive": true,
      "Avoid Other Regions.weight": 1,
      "Avoid Other Regions.isActive": true,
      "Avoid Other Regions.minDistance": 2,
      "Avoid Other Regions.distanceFalloff": 2,
      "Avoid Other Region Groups.weight": 2.5,
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
      "Near Region Seed.scaleFactor": 15,
      "Near Region Seed.invert": 1
    },
    "Islands": {
      "Avoid Edge.weight": 1,
      "Avoid Edge.isActive": true,
      "Avoid Edge.poleDistance": 1,
      "Avoid Edge.poleDistanceFalloff": 4,
      "Avoid Edge.poleFalloffCurve": 0.5,
      "Avoid Edge.meridianDistance": 1,
      "Avoid Edge.meridianDistanceFalloff": 4,
      "Avoid Edge.meridianFalloffCurve": 0.5,
      "Avoid Edge.avoidCorners": 20,
      "Cell Area.weight": 0.15,
      "Cell Area.isActive": true,
      "Cell Area.scaleFactor": -0.2,
      "Near Neighbor.weight": 0.4,
      "Near Neighbor.isActive": true,
      "Near Neighbor.scaleFactor": 0.5,
      "Near Region Seed.weight": 0.03,
      "Near Region Seed.isActive": true,
      "Neighbors In Region.weight": 0.8,
      "Neighbors In Region.isActive": true,
      "Neighbors In Region.preferredNeighborCount": 2,
      "Neighbors In Region.deviation": 2,
      "Near Map Center.weight": 0.04,
      "Near Map Center.isActive": false,
      "Avoid Other Regions.weight": 1,
      "Avoid Other Regions.isActive": true,
      "Avoid Other Regions.falloffCurve": 0.15,
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
      "Near Plate Boundary.scaleFactor": 2,
      "Near Plate Boundary.invert": 1,
      "Wave Exposure.weight": 0.5,
      "Wave Exposure.isActive": true
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
            "island": {
              "factor": [
                1.3333333333333335,
                2
              ]
            },
            "landmass": [
              {
                "erosionPercent": [
                  5,
                  1
                ]
              },
              {
                "erosionPercent": [
                  5,
                  1
                ]
              },
              {
                "erosionPercent": [
                  5,
                  1
                ]
              },
              {
                "erosionPercent": [
                  5,
                  1
                ]
              },
              {
                "erosionPercent": [
                  5,
                  1
                ]
              },
              {
                "erosionPercent": [
                  5,
                  1
                ]
              },
              {
                "erosionPercent": [
                  5,
                  1
                ]
              },
              {
                "erosionPercent": [
                  5,
                  1
                ]
              }
            ]
          },
          "mapSettings": {
            "totalLandmassSize": [
              -9,
              1
            ]
          },
          "ruleSettings": {}
        },
        "Low": {
          "generatorSettings": {
            "landmass": [
              {
                "erosionPercent": [
                  -5,
                  1
                ],
                "coastalIslands": [
                  0.6,
                  2
                ]
              },
              {
                "erosionPercent": [
                  -5,
                  1
                ],
                "coastalIslands": [
                  0.6,
                  2
                ]
              },
              {
                "erosionPercent": [
                  -5,
                  1
                ],
                "coastalIslands": [
                  0.6,
                  2
                ]
              },
              {
                "erosionPercent": [
                  -5,
                  1
                ],
                "coastalIslands": [
                  0.6,
                  2
                ]
              },
              {
                "erosionPercent": [
                  -5,
                  1
                ],
                "coastalIslands": [
                  0.6,
                  2
                ]
              },
              {
                "erosionPercent": [
                  -5,
                  1
                ],
                "coastalIslands": [
                  0.6,
                  2
                ]
              },
              {
                "erosionPercent": [
                  -5,
                  1
                ],
                "coastalIslands": [
                  0.6,
                  2
                ]
              },
              {
                "erosionPercent": [
                  -5,
                  1
                ],
                "coastalIslands": [
                  0.6,
                  2
                ]
              }
            ],
            "island": {
              "factor": [
                1.6666666666666667,
                2
              ]
            }
          },
          "mapSettings": {
            "totalLandmassSize": [
              7,
              1
            ]
          },
          "ruleSettings": {}
        }
      }
    }
  }
};

export { shatteredSeasSettings as default };
//# sourceMappingURL=shattered-seas.mapconfig.js.map

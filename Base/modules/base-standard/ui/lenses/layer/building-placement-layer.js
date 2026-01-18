import { L as LensManager } from '../../../../core/ui/lenses/lens-manager.chunk.js';
import { C as ComponentID } from '../../../../core/ui/utilities/utilities-component-id.chunk.js';
import { BuildingPlacementHoveredPlotChangedEventName, BuildingPlacementManager } from '../../building-placement/building-placement-manager.js';
import { Y as YieldChangeVisualizer } from './yield-change-visualizer.chunk.js';
import { S as SortYields } from '../../utilities/utilities-city-yields.chunk.js';

const ADJACENCY_ICON = "adjacencyarrow_east";
const ADJACENCY_ARROW_SCALE = 1.7;
const IN_AND_OUT_OFFSET = 5;
const Y_SPACE_BETWEEN = 10;
const ARROW_Y_OFFSET = 5;
class WorkerYieldsLensLayer {
  buildSlotSpritePadding = 16;
  yieldSpritePadding = 11;
  yieldVisualizer = new YieldChangeVisualizer("BuildingPlacement");
  adjacenciesSpriteGrid = WorldUI.createSpriteGrid(
    "Adjacencies_SpriteGroup",
    SpriteMode.Default
  );
  buildingPlacementPlotChangedListener = this.onBuildingPlacementPlotChanged.bind(this);
  initLayer() {
    this.yieldVisualizer.setVisible(false);
    this.adjacenciesSpriteGrid.setVisible(false);
  }
  applyLayer() {
    this.realizeBuidlingPlacementSprites();
    this.yieldVisualizer.setVisible(true);
    window.addEventListener(
      BuildingPlacementHoveredPlotChangedEventName,
      this.buildingPlacementPlotChangedListener
    );
  }
  removeLayer() {
    this.yieldVisualizer.clear();
    this.yieldVisualizer.setVisible(false);
    this.adjacenciesSpriteGrid.clear();
    this.adjacenciesSpriteGrid.setVisible(false);
    window.removeEventListener(
      BuildingPlacementHoveredPlotChangedEventName,
      this.buildingPlacementPlotChangedListener
    );
  }
  getPlacementOptions() {
    const validPlots = BuildingPlacementManager.expandablePlots.concat(
      BuildingPlacementManager.developedPlots.concat(BuildingPlacementManager.urbanPlots)
    );
    const primaryYields = BuildingPlacementManager.getPrimaryBuildingYields();
    const placementOptions = [];
    for (const plotIndex of validPlots) {
      const changes = BuildingPlacementManager.getTotalYieldChanges(plotIndex);
      if (changes) {
        let netChange = 0;
        let netPrimary = 0;
        for (const changeInfo of changes) {
          netChange += changeInfo.yieldChange;
          if (primaryYields.includes(changeInfo.yieldType)) {
            netPrimary += changeInfo.yieldChange;
          }
        }
        placementOptions.push({ plotIndex, netChange, netPrimary, changes, recommended: false });
      }
    }
    placementOptions.sort((a, b) => {
      return b.netChange - a.netChange;
    });
    const targetCount = validPlots.length > 5 ? 3 : 1;
    let recommendedCount = 0;
    let bestPrimaryYields = Number.MIN_SAFE_INTEGER;
    let bestPrimaryNetYields = Number.MIN_SAFE_INTEGER;
    for (const placement of placementOptions) {
      if (placement.netPrimary > bestPrimaryYields) {
        bestPrimaryYields = placement.netPrimary;
        bestPrimaryNetYields = placement.netChange;
      } else {
        bestPrimaryNetYields = Math.max(bestPrimaryNetYields, placement.netChange);
      }
    }
    for (const placement of placementOptions) {
      if (placement.netPrimary == bestPrimaryYields && placement.netChange == bestPrimaryNetYields) {
        placement.recommended = true;
        recommendedCount++;
      }
    }
    let lastNetChange = Number.MIN_SAFE_INTEGER;
    for (const placement of placementOptions) {
      if (placement.netChange != lastNetChange && recommendedCount >= targetCount) {
        break;
      }
      if (!placement.recommended) {
        recommendedCount++;
      }
      placement.recommended = true;
      lastNetChange = placement.netChange;
    }
    if (recommendedCount == placementOptions.length) {
      for (const placement of placementOptions) {
        placement.recommended = false;
      }
    }
    return placementOptions;
  }
  /** Add the yield deltas and building slots to each valid plot for the current building */
  realizeBuidlingPlacementSprites() {
    if (!BuildingPlacementManager.cityID) {
      console.error(
        "building-placement-layer: No assigned cityID in the BuildingPlacementManager when attempting to realizeBuildingPlacementSprites"
      );
      return;
    }
    if (!BuildingPlacementManager.currentConstructible) {
      console.error(
        "building-placement-layer: No assigned currentConstructible in the BuildingPlacementManager when attempting to realizeBuildingPlacementSprites"
      );
      return;
    }
    const city = Cities.get(BuildingPlacementManager.cityID);
    if (!city) {
      console.error(
        "building-placement-layer: No valid city with city ID: " + ComponentID.toLogString(BuildingPlacementManager.cityID)
      );
      return;
    }
    if (!city.Yields) {
      console.error(
        "building-placement-layer: No valid Yields object attached to city with city ID: " + ComponentID.toLogString(BuildingPlacementManager.cityID)
      );
      return;
    }
    const placementOptions = this.getPlacementOptions();
    for (const placement of placementOptions) {
      const plotYieldGainPills = [];
      const plotYieldLossPills = [];
      placement.changes.forEach((yieldChangeInfo) => {
        if (yieldChangeInfo.yieldChange != 0) {
          const yieldPillData = {
            yieldDelta: yieldChangeInfo.yieldChange,
            yieldType: yieldChangeInfo.yieldType
          };
          if (yieldChangeInfo.yieldChange > 0) {
            plotYieldGainPills.push(yieldPillData);
          } else {
            plotYieldLossPills.push(yieldPillData);
          }
        }
      });
      SortYields(plotYieldGainPills);
      SortYields(plotYieldLossPills);
      const pillGainOffsets = this.getXYOffsetForPill(plotYieldGainPills.length);
      const pillLossOffsets = this.getXYOffsetForPill(plotYieldLossPills.length);
      const gainColor = placement.recommended ? 4283629382 : 4294967295;
      const location = GameplayMap.getLocationFromIndex(placement.plotIndex);
      plotYieldGainPills.forEach((yieldPillData, i) => {
        const offset = { x: pillGainOffsets[i].x, y: 6 };
        this.yieldVisualizer.addYieldChange(yieldPillData, location, offset, gainColor);
      });
      plotYieldLossPills.forEach((yieldPillData, i) => {
        const offset = { x: pillLossOffsets[i].x, y: -10 };
        this.yieldVisualizer.addYieldChange(yieldPillData, location, offset, 4294967295);
      });
      const district = Districts.getAtLocation(placement.plotIndex);
      if (district) {
        this.realizeBuildSlots(district);
      }
    }
  }
  /**
   * Returns an array of offsets for yield pills for totalPills count passed in
   * Will wrap to 2 lines once hitting a limit but won't wrap more than once
   * @param totalPills total number of yield pills that will be displayed on the tile
   * @returns array of offsets indexed to the sourced array of pills. ie: 3rd pill (index of 2) offset at offsetArray[2]
   */
  getXYOffsetForPill(totalPills) {
    const offsets = [];
    const numPillsTopRow = totalPills;
    const groupWidth = (numPillsTopRow - 1) * this.yieldSpritePadding;
    for (let i = 0; i < totalPills; i++) {
      const isPillInTopRow = i + 1 <= numPillsTopRow;
      const rowPosition = isPillInTopRow ? i : i - numPillsTopRow;
      const offset = {
        x: rowPosition * this.yieldSpritePadding + groupWidth / 2 - groupWidth,
        y: 0
      };
      offsets.push(offset);
    }
    return offsets;
  }
  /*Show building slots below each tile*/
  realizeBuildSlots(district) {
    const districtDefinition = GameInfo.Districts.lookup(district.type);
    if (!districtDefinition) {
      console.error(
        "building-placement-layer: Unable to retrieve a valid DistrictDefinition with DistrictType: " + district.type
      );
      return;
    }
    const constructibles = MapConstructibles.getConstructibles(
      district.location.x,
      district.location.y
    ).filter((constructibleID) => {
      const constructible = Constructibles.getByComponentID(constructibleID);
      if (!constructible) {
        console.error(
          `building-placement-layer: realizeBuildSlots - no constructible found for component id ${constructibleID}`
        );
        return false;
      }
      const constructibleDefinition = GameInfo.Constructibles.lookup(constructible.type);
      if (!constructibleDefinition) {
        console.error(
          `building-placement-layer: realizeBuildSlots - no constructible definition found for component id ${constructibleID}`
        );
        return false;
      }
      if (constructibleDefinition.ExistingDistrictOnly) {
        return false;
      }
      return true;
    });
    const buildingSlots = [];
    for (const constructibleID of constructibles) {
      const existingConstructible = Constructibles.getByComponentID(constructibleID);
      if (!existingConstructible) {
        console.error(
          "building-placement-layer: Unable to find a valid Constructible with ComponentID: " + ComponentID.toLogString(constructibleID)
        );
        continue;
      }
      const constructibleDefinition = GameInfo.Constructibles.lookup(
        existingConstructible.type
      );
      if (!constructibleDefinition) {
        console.error(
          "building-placement-layer: Unable to find a valid ConstructibleDefinition with type: " + existingConstructible.type
        );
        continue;
      }
      const iconString = UI.getIconBLP(constructibleDefinition.ConstructibleType);
      buildingSlots.push({ iconURL: iconString ? iconString : "" });
    }
    for (let i = 0; i < districtDefinition.MaxConstructibles; i++) {
      const groupWidth = (districtDefinition.MaxConstructibles - 1) * this.buildSlotSpritePadding;
      const xPos = i * this.buildSlotSpritePadding + groupWidth / 2 - groupWidth;
      if (buildingSlots[i]) {
        this.yieldVisualizer.addSprite(
          district.location,
          buildingSlots[i].iconURL,
          {
            x: xPos,
            y: 24,
            z: 0
          },
          { scale: 0.9 }
        );
      } else {
        this.yieldVisualizer.addSprite(
          district.location,
          UI.getIconBLP("BUILDING_EMPTY"),
          {
            x: xPos,
            y: 24,
            z: 0
          },
          { scale: 0.8 }
        );
      }
    }
  }
  /* Update displayed info when hovering a new plot */
  onBuildingPlacementPlotChanged() {
    this.adjacenciesSpriteGrid.clear();
    this.adjacenciesSpriteGrid.setVisible(false);
    if (!BuildingPlacementManager.cityID) {
      console.error(
        "building-placement-layer: No assigned cityID in the BuildingPlacementManager when attempting to realizeBuildingPlacementSprites"
      );
      return;
    }
    if (!BuildingPlacementManager.currentConstructible) {
      console.error(
        "building-placement-layer: No assigned currentConstructible in the BuildingPlacementManager when attempting to realizeBuildingPlacementSprites"
      );
      return;
    }
    const city = Cities.get(BuildingPlacementManager.cityID);
    if (!city) {
      console.error(
        "building-placement-layer: No valid city with city ID: " + ComponentID.toLogString(BuildingPlacementManager.cityID)
      );
      return;
    }
    if (!city.Yields) {
      console.error(
        "building-placement-layer: No valid Yields object attached to city with city ID: " + ComponentID.toLogString(BuildingPlacementManager.cityID)
      );
      return;
    }
    const hoveredPlotIndex = BuildingPlacementManager.hoveredPlotIndex;
    if (!hoveredPlotIndex) {
      return;
    }
    if (!BuildingPlacementManager.isValidPlacementPlot(hoveredPlotIndex)) {
      return;
    }
    const yieldAdjacencies = BuildingPlacementManager.getPlacementChangeDetails(
      hoveredPlotIndex,
      YieldSourceTypes.ADJACENCY
    );
    const yieldIcons = [];
    const buildingLocation = GameplayMap.getLocationFromIndex(hoveredPlotIndex);
    const adjacencyBuckets = this.generateAdjacencyBuckets(hoveredPlotIndex, yieldAdjacencies);
    for (const [_plotIndex, adjacencyBucket] of adjacencyBuckets.entries()) {
      const incomingAdjacencies = [];
      const outgoingAdjacencies = [];
      for (const [index, adjacency] of adjacencyBucket.entries()) {
        const isIncoming = hoveredPlotIndex == adjacency.targetPlotIndex;
        if (isIncoming) {
          incomingAdjacencies.push([index, adjacency]);
        } else {
          outgoingAdjacencies.push([index, adjacency]);
        }
      }
      for (const [index, incomingAdjacency] of incomingAdjacencies.entries()) {
        const xOffset = outgoingAdjacencies.length > 0 ? -IN_AND_OUT_OFFSET : 0;
        const totalYOffset = (incomingAdjacencies.length - 1) * Y_SPACE_BETWEEN;
        const startYOffset = totalYOffset / 2;
        const yOffset = startYOffset - index * Y_SPACE_BETWEEN;
        const sourceLocation = GameplayMap.getLocationFromIndex(incomingAdjacency[1].sourcePlotIndex);
        const targetLocation = GameplayMap.getLocationFromIndex(incomingAdjacency[1].targetPlotIndex);
        const adjacencyDirection = GameplayMap.getDirectionToPlot(
          targetLocation,
          sourceLocation
        );
        const iconOffset = this.calculateAdjacencyDirectionOffsetLocation(adjacencyDirection);
        const rotation = this.calculateAdjacencyRotation(adjacencyDirection);
        const rotateOffset = this.rotateIconOffset(xOffset, yOffset, rotation);
        const correctiveAngle = this.calculateAdjacencyCorrectiveAngle(adjacencyDirection);
        this.adjacenciesSpriteGrid.addSprite(
          buildingLocation,
          ADJACENCY_ICON,
          { x: iconOffset.x, y: iconOffset.y, z: ARROW_Y_OFFSET },
          {
            scale: -ADJACENCY_ARROW_SCALE,
            offset: { x: xOffset, y: yOffset },
            angle: correctiveAngle
          }
        );
        const yieldDefinition = GameInfo.Yields.lookup(incomingAdjacency[1].yieldType);
        if (yieldDefinition) {
          yieldIcons.push({
            icon: UI.getIconBLP(yieldDefinition.YieldType + "_1", "YIELD"),
            worldOffset: iconOffset,
            screenOffset: rotateOffset
          });
        }
      }
      for (const [index, outgoingAdjacency] of outgoingAdjacencies.entries()) {
        const xOffset = incomingAdjacencies.length > 0 ? IN_AND_OUT_OFFSET : 0;
        const totalYOffset = (outgoingAdjacencies.length - 1) * Y_SPACE_BETWEEN;
        const startYOffset = totalYOffset / 2;
        const yOffset = startYOffset - index * Y_SPACE_BETWEEN;
        const sourceLocation = GameplayMap.getLocationFromIndex(outgoingAdjacency[1].sourcePlotIndex);
        const targetLocation = GameplayMap.getLocationFromIndex(outgoingAdjacency[1].targetPlotIndex);
        const adjacencyDirection = GameplayMap.getDirectionToPlot(
          sourceLocation,
          targetLocation
        );
        const iconOffset = this.calculateAdjacencyDirectionOffsetLocation(adjacencyDirection);
        const rotation = this.calculateAdjacencyRotation(adjacencyDirection);
        const rotateOffset = this.rotateIconOffset(xOffset, yOffset, rotation);
        const correctiveAngle = this.calculateAdjacencyCorrectiveAngle(adjacencyDirection);
        this.adjacenciesSpriteGrid.addSprite(
          buildingLocation,
          ADJACENCY_ICON,
          { x: iconOffset.x, y: iconOffset.y, z: ARROW_Y_OFFSET },
          {
            scale: ADJACENCY_ARROW_SCALE,
            offset: { x: xOffset, y: yOffset },
            angle: correctiveAngle
          }
        );
        const yieldDefinition = GameInfo.Yields.lookup(outgoingAdjacency[1].yieldType);
        if (yieldDefinition) {
          yieldIcons.push({
            icon: UI.getIconBLP(yieldDefinition.YieldType + "_1", "YIELD"),
            worldOffset: iconOffset,
            screenOffset: rotateOffset
          });
        }
      }
    }
    for (const yieldIcon of yieldIcons) {
      this.adjacenciesSpriteGrid.addSprite(
        buildingLocation,
        yieldIcon.icon,
        { x: yieldIcon.worldOffset.x, y: yieldIcon.worldOffset.y, z: ARROW_Y_OFFSET },
        {
          scale: 1,
          offset: { x: yieldIcon.screenOffset.x, y: yieldIcon.screenOffset.y }
        }
      );
    }
    this.adjacenciesSpriteGrid.setVisible(true);
  }
  generateAdjacencyBuckets(selectedPlotIndex, adjacencyChangeData) {
    const adjacencyBuckets = /* @__PURE__ */ new Map();
    for (const adjacency of adjacencyChangeData) {
      if (adjacency.change < 0) {
        continue;
      }
      const adjacencyPlotIndex = adjacency.sourcePlotIndex == selectedPlotIndex ? adjacency.targetPlotIndex : adjacency.sourcePlotIndex;
      const bucket = adjacencyBuckets.get(adjacencyPlotIndex);
      if (bucket) {
        bucket.push(adjacency);
      } else {
        adjacencyBuckets.set(adjacencyPlotIndex, [adjacency]);
      }
    }
    return adjacencyBuckets;
  }
  rotateIconOffset(x, y, radians) {
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const dx = x;
    const dy = y;
    const xNew = dx * cos - dy * sin;
    const yNew = dx * sin + dy * cos;
    return {
      x: xNew,
      y: yNew
    };
  }
  /* Determine where adjacency arrows should go based on adjacency location */
  calculateAdjacencyDirectionOffsetLocation(adjacencyDirection) {
    switch (adjacencyDirection) {
      case DirectionTypes.DIRECTION_EAST:
        return { x: 32, y: 0 };
      case DirectionTypes.DIRECTION_WEST:
        return { x: -32, y: 0 };
      case DirectionTypes.DIRECTION_NORTHEAST:
        return { x: 16, y: 28 };
      case DirectionTypes.DIRECTION_NORTHWEST:
        return { x: -16, y: 28 };
      case DirectionTypes.DIRECTION_SOUTHEAST:
        return { x: 16, y: -28 };
      case DirectionTypes.DIRECTION_SOUTHWEST:
        return { x: -16, y: -28 };
      default:
        return { x: 32, y: 0 };
    }
  }
  calculateAdjacencyRotation(adjacencyDirection) {
    switch (adjacencyDirection) {
      case DirectionTypes.DIRECTION_EAST:
        return 0;
      case DirectionTypes.DIRECTION_WEST:
        return Math.PI;
      case DirectionTypes.DIRECTION_NORTHEAST:
        return Math.PI * 1 / 3;
      case DirectionTypes.DIRECTION_NORTHWEST:
        return Math.PI * 2 / 3;
      case DirectionTypes.DIRECTION_SOUTHEAST:
        return Math.PI * 5 / 3;
      case DirectionTypes.DIRECTION_SOUTHWEST:
        return Math.PI * 4 / 3;
      default:
        return 0;
    }
  }
  calculateAdjacencyCorrectiveAngle(adjacencyDirection) {
    switch (adjacencyDirection) {
      case DirectionTypes.DIRECTION_EAST:
        return 0;
      case DirectionTypes.DIRECTION_WEST:
        return 180;
      case DirectionTypes.DIRECTION_NORTHEAST:
        return 60;
      case DirectionTypes.DIRECTION_NORTHWEST:
        return 120;
      case DirectionTypes.DIRECTION_SOUTHEAST:
        return -60;
      case DirectionTypes.DIRECTION_SOUTHWEST:
        return -120;
      default:
        return 0;
    }
  }
}
LensManager.registerLensLayer("fxs-building-placement-layer", new WorkerYieldsLensLayer());
//# sourceMappingURL=building-placement-layer.js.map

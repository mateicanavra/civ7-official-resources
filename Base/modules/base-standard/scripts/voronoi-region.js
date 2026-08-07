import { RandomImpl } from './random-pcg-32.js';
import { VoronoiUtils } from './voronoi-utils.js';

class IdScorePair {
  id = 0;
  score = 0;
}
class VoronoiRegion {
  name;
  id = 0;
  groupId = 0;
  type = 0;
  maxArea = 0;
  playerAreas = 0;
  color = { x: 0, y: 0, z: 0 };
  seedLocation = { x: 0, y: 0 };
  considerationList = [];
  cellCount = 0;
  latestAddedCell = null;
  minOrder = 0;
  // Used for offsetting the order of individual cells, for visualizing and debugging region growth over time.
  scoringContext;
  quadTree;
  constructor(name, id, groupId, type, maxArea, playerAreas) {
    this.name = name;
    this.id = id;
    this.groupId = groupId;
    this.type = type;
    this.maxArea = maxArea;
    this.playerAreas = playerAreas;
  }
  prepareGrowth(regionCells, regions, rules, worldDims, plateRegions, wrap) {
    this.scoringContext = {
      cells: regionCells,
      region: this,
      regions,
      plateRegions,
      m_worldDims: { x: worldDims.x, y: worldDims.y },
      totalArea: 0,
      cellCount: 0,
      rules,
      wrap
    };
    for (const rule of Object.values(rules)) {
      if (rule.isActive) {
        rule.prepare();
      }
    }
    regionCells.forEach((cell) => {
      cell.regionConsiderationBits = 0n;
    });
    this.quadTree = void 0;
  }
  growStep() {
    let newCellIndex = 0;
    const regionCells = this.scoringContext.cells;
    for (let i = 0; i < this.considerationList.length; ) {
      const cell = regionCells[this.considerationList[i].id];
      if (this.isCellClaimed(cell)) {
        VoronoiUtils.swapAndPop(this.considerationList, i);
        continue;
      }
      if (this.considerationList[i].score > this.considerationList[newCellIndex].score) {
        newCellIndex = i;
      }
      ++i;
    }
    if (this.considerationList.length == 0 || this.considerationList[newCellIndex].score < 0) {
      return false;
    }
    const newCellId = this.considerationList[newCellIndex].id;
    VoronoiUtils.swapAndPop(this.considerationList, newCellIndex);
    const newCell = regionCells[newCellId];
    newCell.regionConsiderationBits = 0n;
    this.setRegionIdForCell(newCell, this.id, this.scoringContext);
    this.scoringContext.totalArea += newCell.area;
    this.scoringContext.cellCount++;
    this.cellCount = this.scoringContext.cellCount;
    this.latestAddedCell = newCell;
    if (this.quadTree) {
      this.quadTree.insert(newCell);
    }
    Object.values(this.scoringContext.rules).forEach(
      (rule) => rule.notifySelectedCell(newCell, this.scoringContext)
    );
    for (const neighborId of newCell.cell.getNeighborIds()) {
      const neighbor = regionCells[neighborId];
      if (this.isCellClaimed(neighbor)) {
        continue;
      }
      const score = this.scoreCell(neighbor, this.scoringContext);
      if (neighbor.regionConsiderationBits & 1n << BigInt(this.id)) {
        const pair = this.considerationList.find((value) => value.id === neighborId);
        pair.score = score;
      } else {
        this.considerationList.push({ id: neighborId, score });
        neighbor.regionConsiderationBits |= 1n << BigInt(this.id);
      }
    }
    return this.considerationList.length > 0 && this.scoringContext.totalArea < this.maxArea;
  }
  logStats() {
    console.log(
      "Region " + this.id + " total area: " + this.scoringContext?.totalArea + ", cell count: " + this.scoringContext?.cellCount
    );
  }
  scoreCell(regionCell, scoringContext) {
    let score = 0;
    for (const rule of Object.values(scoringContext.rules)) {
      if (rule.isActive) {
        score += rule.score(regionCell, scoringContext) * rule.weight;
      }
    }
    return score;
  }
  scoreSingleCell(regionCell) {
    return this.scoreCell(regionCell, this.scoringContext);
  }
  SetQuadTree(quadtree) {
    this.quadTree = quadtree;
  }
}
class LandmassRegion extends VoronoiRegion {
  setRegionIdForCell(cell, id, scoringContext) {
    cell.landmassId = id;
    cell.landmassOrder = scoringContext.cellCount;
  }
  getRegionIdForCell(cell) {
    return cell.landmassId;
  }
  isCellClaimed(cell) {
    return cell.landmassId != 0;
  }
}
class PlateRegion extends VoronoiRegion {
  m_movement = { x: 0, y: 0 };
  m_rotation = 0;
  constructor(name, id, type, maxArea) {
    super(name, id, 0, type, maxArea, 0);
    const dir = RandomImpl.fRand("Plate Movement Direction") * Math.PI * 2;
    const movementSpeed = RandomImpl.fRand("Plate Movement Speed");
    this.m_movement.x = Math.cos(dir) * movementSpeed;
    this.m_movement.y = Math.sin(dir) * movementSpeed;
    this.m_rotation = RandomImpl.fRand("Plate Rotation") * 2 - 1;
  }
  setRegionIdForCell(cell, id, scoringContext) {
    cell.plateId = id;
    cell.plateOrder = scoringContext.cellCount;
  }
  getRegionIdForCell(cell) {
    return cell.plateId;
  }
  isCellClaimed(cell) {
    return cell.plateId != -1;
  }
}

export { LandmassRegion, PlateRegion, VoronoiRegion };
//# sourceMappingURL=voronoi-region.js.map

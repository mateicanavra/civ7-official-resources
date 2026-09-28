import { Heap } from './heap.js';
import { RandomImpl } from './random-pcg-32.js';

class IdScorePair {
  id = 0;
  score = 0;
  cycle = 0;
  // Tracks the cycle in which this score was generated, to know how stale it is.
  pairId = -1;
  // tracks the unique id of the score pair.
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
  latestAddedCell = null;
  ruleSetKey;
  minOrder = 0;
  // Used for offsetting the order of individual cells, for visualizing and debugging region growth over time.
  cellCount = 0;
  considerationHeap = new Heap((a, b) => b.score - a.score);
  latestScorePairId = new Uint32Array(0);
  nextScorePairId = 0;
  cycle = 0;
  // Tracks the number of growStep() calls
  dynamicRules = [];
  staticRules = [];
  staticScores = new Float32Array(0);
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
  pushConsideration(cellId, score) {
    const pair = { id: cellId, score, pairId: this.nextScorePairId, cycle: this.cycle };
    this.considerationHeap.push(pair);
    this.latestScorePairId[cellId] = this.nextScorePairId++;
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
    this.staticRules = [];
    this.dynamicRules = [];
    for (const rule of Object.values(rules)) {
      if (rule.isActive) {
        rule.prepare();
        if (rule.isStatic) {
          this.staticRules.push(rule);
        } else {
          this.dynamicRules.push(rule);
        }
      }
    }
    regionCells.forEach((cell) => {
      cell.regionConsiderationBits = 0n;
    });
    this.quadTree = void 0;
    this.considerationHeap.clear();
    this.latestScorePairId = new Uint32Array(regionCells.length);
    this.staticScores = new Float32Array(regionCells.length);
    this.staticScores.fill(NaN);
    this.nextScorePairId = 0;
    this.cycle = 0;
  }
  growStep() {
    let newCellPair = void 0;
    const regionCells = this.scoringContext.cells;
    while (this.considerationHeap.size > 0) {
      const pair = this.considerationHeap.pop();
      const cell = regionCells[pair.id];
      if (this.isCellClaimed(cell)) {
        continue;
      }
      if (this.latestScorePairId[pair.id] != pair.pairId) {
        continue;
      }
      if (pair.cycle < this.cycle - 1) {
        pair.score = this.scoreCell(cell, this.scoringContext);
      }
      const nextHighestScore = this.considerationHeap.peek()?.score ?? -Infinity;
      if (pair.score >= nextHighestScore) {
        newCellPair = pair;
        break;
      } else {
        pair.pairId = this.nextScorePairId++;
        pair.cycle = this.cycle;
        this.latestScorePairId[pair.id] = pair.pairId;
        this.considerationHeap.push(pair);
      }
    }
    if (newCellPair === void 0 || newCellPair.score < 0) {
      return false;
    }
    const newCellId = newCellPair.id;
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
      const pairId = this.nextScorePairId++;
      this.latestScorePairId[neighborId] = pairId;
      this.considerationHeap.push({ id: neighborId, score, cycle: this.cycle, pairId });
    }
    ++this.cycle;
    return this.considerationHeap.size > 0 && this.scoringContext.totalArea < this.maxArea;
  }
  logStats() {
    console.log(
      "Region " + this.id + " total area: " + this.scoringContext?.totalArea + ", cell count: " + this.scoringContext?.cellCount
    );
  }
  scoreCell(regionCell, scoringContext) {
    let score = 0;
    let staticScore = this.staticScores[regionCell.id];
    if (Number.isNaN(staticScore)) {
      staticScore = 0;
      for (const rule of this.staticRules) {
        staticScore += rule.score(regionCell, scoringContext) * rule.weight;
      }
      this.staticScores[regionCell.id] = staticScore;
    }
    score += staticScore;
    for (const rule of this.dynamicRules) {
      score += rule.score(regionCell, scoringContext) * rule.weight;
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

import { IndexedMinHeap } from './heap.js';
import { profileScope, profileFunction } from './profiling.js';
import { TerrainType } from './voronoi-types.js';
import { WrapType, VoronoiUtils } from './voronoi-utils.js';

class PlayerRegion {
  id = -1;
  playerAreas = 0;
  filter = (tile) => tile.playerLandmassId == this.id;
}
const detailedLogs = false;
function buildMapContext(hexMap, wrap) {
  const tiles = hexMap.getTiles();
  const height = tiles.length;
  const width = height > 0 ? tiles[0].length : 0;
  const tileCount = width * height;
  const terrain = new Uint8Array(tileCount);
  const posX = new Float32Array(tileCount);
  const posY = new Float32Array(tileCount);
  for (let y = 0; y < height; ++y) {
    const row = tiles[y];
    const rowOffset = y * width;
    for (let x = 0; x < width; ++x) {
      const tile = row[x];
      const idx = rowOffset + x;
      terrain[idx] = tile.terrainType;
      posX[idx] = tile.pos.x;
      posY[idx] = tile.pos.y;
    }
  }
  const evenDeltas = hexMap.EvenRowDeltas;
  const oddDeltas = hexMap.OddRowDeltas;
  const evenDx = new Int8Array(6);
  const evenDy = new Int8Array(6);
  const oddDx = new Int8Array(6);
  const oddDy = new Int8Array(6);
  for (let i = 0; i < 6; ++i) {
    evenDx[i] = evenDeltas[i][0];
    evenDy[i] = evenDeltas[i][1];
    oddDx[i] = oddDeltas[i][0];
    oddDy[i] = oddDeltas[i][1];
  }
  const wrapMask = wrap.wrap ?? WrapType.None;
  const wrapX = (wrapMask & WrapType.WrapX) !== 0;
  const wrapY = (wrapMask & WrapType.WrapY) !== 0;
  const neighbors = new Int32Array(tileCount * 6);
  for (let y = 0; y < height; ++y) {
    const dx = (y & 1) === 0 ? evenDx : oddDx;
    const dy = (y & 1) === 0 ? evenDy : oddDy;
    for (let x = 0; x < width; ++x) {
      const base = (y * width + x) * 6;
      for (let i = 0; i < 6; ++i) {
        let ny = y + dy[i];
        if (ny < 0 || ny >= height) {
          if (!wrapY) {
            neighbors[base + i] = -1;
            continue;
          }
          ny = ny < 0 ? ny + height : ny - height;
        }
        let nx = x + dx[i];
        if (nx < 0 || nx >= width) {
          if (!wrapX) {
            neighbors[base + i] = -1;
            continue;
          }
          nx = nx < 0 ? nx + width : nx - width;
        }
        neighbors[base + i] = ny * width + nx;
      }
    }
  }
  return { width, height, terrain, posX, posY, neighbors };
}
function buildLandmassContext(mapCtx, hexMap, region) {
  const { width, height } = mapCtx;
  const tileCount = width * height;
  const inLandmass = new Uint8Array(tileCount);
  const passable = new Uint8Array(tileCount);
  const assignment = new Int32Array(tileCount);
  assignment.fill(-1);
  const tiles = hexMap.getTiles();
  const filter = region.filter;
  for (let y = 0; y < height; ++y) {
    const row = tiles[y];
    const rowOffset = y * width;
    for (let x = 0; x < width; ++x) {
      const tile = row[x];
      if (filter(tile)) {
        const idx = rowOffset + x;
        inLandmass[idx] = 1;
        if (tile.isPassable()) {
          passable[idx] = 1;
        }
      }
    }
  }
  return { ...mapCtx, inLandmass, passable, assignment };
}
function keepLargestComponent(ctx) {
  const { width, height, passable, inLandmass, neighbors } = ctx;
  const tileCount = passable.length;
  const componentId = new Uint16Array(tileCount);
  const stack = new Uint32Array(tileCount);
  let nextId = 0;
  let bestId = 0;
  let bestSize = 0;
  for (let tileY = 0; tileY < height; ++tileY) {
    const tileRow = tileY * width;
    for (let tileX = 0; tileX < width; ++tileX) {
      const tileIdx = tileRow + tileX;
      if (passable[tileIdx] === 0 || componentId[tileIdx] !== 0) continue;
      ++nextId;
      let stackTop = 0;
      let size = 0;
      stack[stackTop++] = tileIdx;
      componentId[tileIdx] = nextId;
      while (stackTop > 0) {
        const idx = stack[--stackTop];
        ++size;
        const base = idx * 6;
        for (let i = 0; i < 6; ++i) {
          const nIdx = neighbors[base + i];
          if (nIdx < 0) continue;
          if (passable[nIdx] === 1 && componentId[nIdx] === 0) {
            componentId[nIdx] = nextId;
            stack[stackTop++] = nIdx;
          }
        }
      }
      if (size > bestSize) {
        bestSize = size;
        bestId = nextId;
      }
    }
  }
  const tiles = new Uint32Array(bestSize);
  let w = 0;
  for (let y = 0; y < height; ++y) {
    const rowOffset = y * width;
    for (let x = 0; x < width; ++x) {
      const i = rowOffset + x;
      if (inLandmass[i] === 0) continue;
      if (componentId[i] === bestId) {
        tiles[w++] = i;
      } else {
        inLandmass[i] = 0;
        passable[i] = 0;
      }
    }
  }
  return { tiles };
}
function kmeansRelaxSeeds(ctx, landmassTiles, numRegions, maxPasses) {
  const { width, terrain, passable, assignment, posX, posY, neighbors } = ctx;
  const { tiles } = landmassTiles;
  const seeds = new Uint32Array(numRegions);
  const prevSeeds = new Uint32Array(numRegions);
  const prevPrevSeeds = new Uint32Array(numRegions);
  const bestDist = new Float32Array(passable.length);
  const heap = new IndexedMinHeap(tiles.length);
  const centroidX = new Float64Array(numRegions);
  const centroidY = new Float64Array(numRegions);
  const regionCount = new Int32Array(numRegions);
  const bestD = new Float64Array(numRegions);
  const bestSeed = new Uint32Array(numRegions);
  const dijkstra = () => {
    while (heap.size > 0) {
      const idx = heap.pop();
      const dist = heap.lastVal;
      if (dist > bestDist[idx]) continue;
      const regionId = assignment[idx];
      const base = idx * 6;
      for (let i = 0; i < 6; ++i) {
        const nIdx = neighbors[base + i];
        if (nIdx < 0 || passable[nIdx] === 0) continue;
        const cost = terrain[nIdx] === TerrainType.Coast ? 2 : 1;
        const newDist = dist + cost;
        if (newDist < bestDist[nIdx]) {
          bestDist[nIdx] = newDist;
          assignment[nIdx] = regionId;
          heap.push(newDist, nIdx);
        }
      }
    }
  };
  bestDist.fill(Infinity);
  assignment.fill(-1);
  heap.clear();
  seeds[0] = tiles[0];
  bestDist[seeds[0]] = 0;
  assignment[seeds[0]] = 0;
  heap.push(0, seeds[0]);
  for (let j = 0; j < numRegions; ++j) {
    if (j > 0) {
      let farthestIdx = tiles[0];
      let farthestDist = -1;
      for (const idx of tiles) {
        const d = bestDist[idx];
        if (d > farthestDist) {
          farthestDist = d;
          farthestIdx = idx;
        }
      }
      seeds[j] = farthestIdx;
      bestDist[farthestIdx] = 0;
      assignment[farthestIdx] = j;
      heap.push(0, farthestIdx);
    }
    dijkstra();
  }
  if (detailedLogs) {
    console.log(
      `  Gonzalez seeding: seeds at [${Array.from(seeds, (s) => `(${s % width},${s / width | 0})`).join(", ")}]`
    );
  }
  const moveThresholdSq = 1;
  let passesRun = 0;
  let exitReason = "max passes";
  for (let pass = 0; pass < maxPasses; ++pass) {
    if (pass > 0) {
      bestDist.fill(Infinity);
      assignment.fill(-1);
      heap.clear();
      for (let j = 0; j < numRegions; ++j) {
        const idx = seeds[j];
        bestDist[idx] = 0;
        assignment[idx] = j;
        heap.push(0, idx);
      }
      dijkstra();
    }
    centroidX.fill(0);
    centroidY.fill(0);
    regionCount.fill(0);
    for (const idx of tiles) {
      const r = assignment[idx];
      centroidX[r] += posX[idx];
      centroidY[r] += posY[idx];
      ++regionCount[r];
    }
    for (let j = 0; j < numRegions; ++j) {
      if (regionCount[j] === 0) continue;
      centroidX[j] /= regionCount[j];
      centroidY[j] /= regionCount[j];
    }
    bestD.fill(Infinity);
    for (const idx of tiles) {
      const r = assignment[idx];
      const ddx = posX[idx] - centroidX[r];
      const ddy = posY[idx] - centroidY[r];
      const d = ddx * ddx + ddy * ddy;
      if (d < bestD[r]) {
        bestD[r] = d;
        bestSeed[r] = idx;
      }
    }
    let maxMoveSq = 0;
    let anyChanged = false;
    for (let j = 0; j < numRegions; ++j) {
      prevPrevSeeds[j] = prevSeeds[j];
      prevSeeds[j] = seeds[j];
      if (regionCount[j] === 0) continue;
      const newSeed = bestSeed[j];
      const oldSeed = seeds[j];
      if (newSeed !== oldSeed) {
        anyChanged = true;
        const ddx = posX[newSeed] - posX[oldSeed];
        const ddy = posY[newSeed] - posY[oldSeed];
        const dsq = ddx * ddx + ddy * ddy;
        if (dsq > maxMoveSq) maxMoveSq = dsq;
        seeds[j] = newSeed;
      }
    }
    ++passesRun;
    if (detailedLogs) {
      console.log(
        `  K-means pass ${pass}: counts=[${Array.from(regionCount).join(", ")}], maxSeedMove=${Math.sqrt(maxMoveSq).toFixed(2)}`
      );
    }
    if (!anyChanged) {
      exitReason = "no movement";
      break;
    }
    if (maxMoveSq < moveThresholdSq) {
      exitReason = "converged";
      break;
    }
    if (pass >= 2) {
      let isCycle = true;
      for (let j = 0; j < numRegions; ++j) {
        if (seeds[j] !== prevPrevSeeds[j]) {
          isCycle = false;
          break;
        }
      }
      if (isCycle) {
        exitReason = "2-cycle";
        break;
      }
    }
  }
  if (detailedLogs) {
    console.log(
      `K-means relaxation: ${passesRun} pass(es), exit=${exitReason}, seeds at [${Array.from(seeds, (s) => `(${s % width},${s / width | 0})`).join(", ")}]`
    );
  }
  return seeds;
}
function powerDiagramPartition(ctx, landmassTiles, seeds, numRegions, tileValue, maxIters) {
  const { terrain, passable, assignment, neighbors } = ctx;
  const { tiles } = landmassTiles;
  const tileValueCache = new Float64Array(tiles.length);
  let totalLandmassValue = 0;
  for (let i = 0; i < tiles.length; ++i) {
    const v = tileValue(tiles[i]);
    tileValueCache[i] = v;
    totalLandmassValue += v;
  }
  const targetValue = totalLandmassValue / numRegions;
  const avgTileValue = totalLandmassValue / tiles.length;
  const earlyExitSpread = 0.1 * targetValue;
  const bias = new Float64Array(numRegions);
  const totalValue = new Float64Array(numRegions);
  const prevBias = new Float64Array(numRegions);
  const prevTotalValue = new Float64Array(numRegions);
  const bestDist = new Float64Array(passable.length);
  const heap = new IndexedMinHeap(tiles.length);
  const bestAssignment = new Int32Array(assignment.length);
  let bestSpread = Infinity;
  let itersSinceBest = 0;
  const radius = Math.sqrt(tiles.length / Math.PI);
  const perimeterEstimate = Math.max(1, 1.3 * radius);
  const diskCoeff = Math.max(0.01, perimeterEstimate * avgTileValue);
  const coeffLo = diskCoeff * 0.5;
  const coeffHi = diskCoeff * 2;
  let transferCoeff = diskCoeff;
  let calibrationConfidence = 1;
  const calibrationConfidenceCap = 8;
  const maxBiasDelta = 10;
  const stagnationLimit = 3;
  const minDamping = 0.1;
  const maxDamping = 1;
  let damping = maxDamping;
  let prevSpread = Infinity;
  const jitterMagnitude = 0.5;
  const jitterScale = jitterMagnitude / 4294967296;
  const jitterAt = (idx, regionId) => {
    return (Math.imul(idx * 16 + regionId, 2654435769) >>> 0) * jitterScale;
  };
  for (let iter = 0; iter < maxIters; ++iter) {
    bestDist.fill(Infinity);
    assignment.fill(-1);
    heap.clear();
    for (let j = 0; j < numRegions; ++j) {
      const idx = seeds[j];
      const seedDist = -bias[j] + jitterAt(idx, j);
      bestDist[idx] = seedDist;
      assignment[idx] = j;
      heap.push(seedDist, idx);
    }
    while (heap.size > 0) {
      const idx = heap.pop();
      const dist = heap.lastVal;
      if (dist > bestDist[idx]) continue;
      const regionId = assignment[idx];
      const jitterU = jitterAt(idx, regionId);
      const base = idx * 6;
      for (let i = 0; i < 6; ++i) {
        const nIdx = neighbors[base + i];
        if (nIdx < 0 || passable[nIdx] === 0) continue;
        const cost = terrain[nIdx] === TerrainType.Coast ? 2 : 1;
        const newDist = dist + cost + jitterAt(nIdx, regionId) - jitterU;
        if (newDist < bestDist[nIdx]) {
          bestDist[nIdx] = newDist;
          assignment[nIdx] = regionId;
          heap.push(newDist, nIdx);
        }
      }
    }
    totalValue.fill(0);
    for (let i = 0; i < tiles.length; ++i) {
      totalValue[assignment[tiles[i]]] += tileValueCache[i];
    }
    let minVal = totalValue[0];
    let maxVal = totalValue[0];
    for (let j = 1; j < numRegions; ++j) {
      const v = totalValue[j];
      if (v < minVal) minVal = v;
      if (v > maxVal) maxVal = v;
    }
    const spread = maxVal - minVal;
    if (detailedLogs) {
      console.log(
        `Power diagram iter ${iter}: spread=${spread.toFixed(2)}, target=${targetValue.toFixed(2)}, damping=${damping.toFixed(2)}, values=[${Array.from(totalValue, (v) => v.toFixed(1)).join(", ")}]`
      );
    }
    const overshoot = iter > 0 && spread > prevSpread + 1e-6;
    if (iter > 0 && !overshoot) {
      let num = 0;
      let den = 0;
      for (let j = 0; j < numRegions; ++j) {
        const dBias = bias[j] - prevBias[j];
        const dValue = totalValue[j] - prevTotalValue[j];
        num += dValue * dBias;
        den += dBias * dBias;
      }
      if (den > 1e-9 && num > 0) {
        const observed = num / den;
        const clamped = observed < coeffLo ? coeffLo : observed > coeffHi ? coeffHi : observed;
        const alpha = 1 / (1 + calibrationConfidence);
        const next = (1 - alpha) * transferCoeff + alpha * clamped;
        if (detailedLogs) {
          console.log(
            `  Recalibrated transferCoeff: ${transferCoeff.toFixed(3)} -> ${next.toFixed(3)} (observed ${observed.toFixed(3)}, clamped ${clamped.toFixed(3)}, alpha ${alpha.toFixed(2)})`
          );
        }
        transferCoeff = next;
        if (calibrationConfidence < calibrationConfidenceCap) ++calibrationConfidence;
      }
    }
    const improvedBest = spread < bestSpread - 1e-6;
    if (iter > 0) {
      if (overshoot) {
        damping *= 0.5;
        if (damping < minDamping) damping = minDamping;
      } else if (improvedBest) {
        damping *= 1.4;
        if (damping > maxDamping) damping = maxDamping;
      }
    }
    prevSpread = spread;
    if (improvedBest) {
      bestSpread = spread;
      bestAssignment.set(assignment);
      itersSinceBest = 0;
    } else {
      ++itersSinceBest;
      if (itersSinceBest >= stagnationLimit) {
        console.log(`  Stopping early for stagnation: ${itersSinceBest} iters without improvement.`);
        break;
      }
    }
    if (spread < earlyExitSpread) break;
    prevBias.set(bias);
    prevTotalValue.set(totalValue);
    let deltaSum = 0;
    for (let j = 0; j < numRegions; ++j) {
      const raw = damping * (targetValue - totalValue[j]) / transferCoeff;
      const delta = raw > maxBiasDelta ? maxBiasDelta : raw < -maxBiasDelta ? -maxBiasDelta : raw;
      bias[j] += delta;
      deltaSum += delta;
    }
    const meanDelta = deltaSum / numRegions;
    for (let j = 0; j < numRegions; ++j) {
      bias[j] -= meanDelta;
    }
  }
  if (bestSpread < Infinity) {
    assignment.set(bestAssignment);
  }
}
function writeBack(ctx, hexMap, playerIdOffset) {
  const { width, height, inLandmass, assignment } = ctx;
  const tiles = hexMap.getTiles();
  for (let y = 0; y < height; ++y) {
    const row = tiles[y];
    const rowOffset = y * width;
    for (let x = 0; x < width; ++x) {
      const idx = rowOffset + x;
      if (inLandmass[idx] === 1) {
        const r = assignment[idx];
        if (r >= 0) {
          row[x].majorPlayerRegionId = r + playerIdOffset;
        }
      }
    }
  }
}
function CreateMajorPlayerAreas(hexMap, playerRegions, valueFunction, wrap = { wrap: WrapType.None }) {
  const perfScope = new profileScope("Creating major player regions");
  const kmeansMaxPasses = 6;
  const partitionMaxIters = 12;
  VoronoiUtils.performanceMarker("createMajorPlayerAreas - Begin");
  let playerIdOffset = 0;
  const mapCtx = buildMapContext(hexMap, wrap);
  for (const region of playerRegions) {
    if (region.playerAreas == 0) continue;
    const ctx = buildLandmassContext(mapCtx, hexMap, region);
    const landmassTiles = keepLargestComponent(ctx);
    console.log(
      `Requesting ${region.playerAreas} player areas on landmass ${region.id} with ${landmassTiles.tiles.length} tiles.`
    );
    if (region.playerAreas == 1) {
      const { tiles } = landmassTiles;
      for (const idx of tiles) {
        ctx.assignment[idx] = 0;
      }
      writeBack(ctx, hexMap, playerIdOffset);
      ++playerIdOffset;
      continue;
    }
    const width = ctx.width;
    const tileValue = valueFunction ? /* @__PURE__ */ ((tiles) => (idx) => valueFunction(tiles[idx / width | 0][idx % width]))(hexMap.getTiles()) : (idx) => ctx.terrain[idx] === TerrainType.Coast ? 0.5 : 1;
    const seeds = kmeansRelaxSeeds(ctx, landmassTiles, region.playerAreas, kmeansMaxPasses);
    VoronoiUtils.performanceMarker("createMajorPlayerAreas - K-means Done");
    profileFunction(
      "powerDiagramPartition",
      () => powerDiagramPartition(ctx, landmassTiles, seeds, region.playerAreas, tileValue, partitionMaxIters)
    );
    VoronoiUtils.performanceMarker("createMajorPlayerAreas - Partition Done");
    writeBack(ctx, hexMap, playerIdOffset);
    console.log(
      `Finished creating major player regions for region ${region.id}, (ids ${playerIdOffset} - ${playerIdOffset + region.playerAreas - 1}).`
    );
    playerIdOffset += region.playerAreas;
  }
  perfScope.end();
}

export { CreateMajorPlayerAreas, PlayerRegion };
//# sourceMappingURL=player-areas.js.map

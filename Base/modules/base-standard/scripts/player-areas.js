import { Heap } from './heap.js';
import { FloodFillResult } from './hex-map.js';
import { kdTree } from './kd-tree.js';
import { profileScope } from './profiling.js';
import { TerrainType } from './voronoi-types.js';
import { WrapType, VoronoiUtils } from './voronoi-utils.js';

class PlayerRegion {
  id = -1;
  playerAreas = 0;
  filter = (tile) => tile.playerLandmassId == this.id;
}
function CreateMajorPlayerAreas(hexMap, playerRegions, valueFunction, _wrap = { wrap: WrapType.None }) {
  const perfScope = new profileScope("Creating major player regions");
  const detailedLogs = false;
  VoronoiUtils.performanceMarker("createMajorPlayerAreas - Begin");
  let playerIdOffset = 0;
  for (const region of playerRegions) {
    if (region.playerAreas == 0) continue;
    let landmassTiles = hexMap.getTiles().flatMap((row) => row.filter(region.filter));
    landmassTiles.forEach((tile) => {
      tile.majorPlayerRegionId = -1;
    });
    console.log(
      `Requesting ${region.playerAreas} player areas on landmass ${region.id} with ${landmassTiles.length} tiles.`
    );
    const floodBucket = [];
    for (const tile of landmassTiles) {
      if (!tile.visited) {
        floodBucket.push(
          hexMap.floodFill(
            tile,
            (tile2) => tile2.isPassable() && region.filter(tile2) ? FloodFillResult.Include : FloodFillResult.Exclude
          )
        );
      }
    }
    landmassTiles.forEach((tile) => {
      tile.visited = 0;
    });
    landmassTiles = floodBucket.sort((a, b) => b.length - a.length)[0];
    if (region.playerAreas == 1) {
      landmassTiles.forEach((tile) => {
        tile.majorPlayerRegionId = playerIdOffset;
      });
      ++playerIdOffset;
      continue;
    }
    const landmassKdTree = new kdTree((tile) => tile.pos);
    landmassKdTree.build(landmassTiles);
    class SeedTile {
      tile;
      count;
    }
    const seedTiles = new Array(region.playerAreas);
    for (let i = 0; i < region.playerAreas; ++i) {
      const tilesPerPlayer = Math.floor(landmassTiles.length / region.playerAreas);
      seedTiles[i] = {
        tile: landmassTiles[i * tilesPerPlayer + Math.floor(tilesPerPlayer / 2)],
        count: 0
      };
    }
    const getAverageRegionPositions = (seedTiles2) => {
      for (let j = 0; j < seedTiles2.length; ++j) {
        const totalPos = { x: 0, y: 0 };
        const tilesForSeed = landmassTiles.filter((tile) => tile.majorPlayerRegionId == j);
        tilesForSeed.forEach((tile) => {
          totalPos.x += tile.pos.x;
          totalPos.y += tile.pos.y;
        });
        const averagePos = {
          x: totalPos.x / tilesForSeed.length,
          y: totalPos.y / tilesForSeed.length
        };
        seedTiles2[j] = { tile: landmassKdTree.search(averagePos).data, count: 0 };
      }
    };
    const relaxationSteps = 10;
    let lastSizeDiff = Infinity;
    const landmassTileSet = new Set(landmassTiles);
    for (let i = 0; i < relaxationSteps; ++i) {
      for (const tile of landmassTiles) {
        tile.majorPlayerRegionId = -1;
      }
      for (const seed of seedTiles) {
        seed.count = 0;
      }
      const dijkstraHeap = new Heap((a, b) => a.dist - b.dist);
      const bestDist = /* @__PURE__ */ new Map();
      for (let j = 0; j < seedTiles.length; ++j) {
        const seedTile = seedTiles[j].tile;
        dijkstraHeap.push({ tile: seedTile, dist: 0, regionId: j });
        bestDist.set(seedTile, 0);
        seedTile.majorPlayerRegionId = j;
        ++seedTiles[j].count;
      }
      while (dijkstraHeap.size > 0) {
        const entry = dijkstraHeap.pop();
        if (entry.dist > bestDist.get(entry.tile)) continue;
        hexMap.forNeighbors(entry.tile.coord.x, entry.tile.coord.y, hexMap.getTiles(), (neighbor) => {
          if (!neighbor || !landmassTileSet.has(neighbor)) return;
          const cost = neighbor.terrainType === TerrainType.Coast ? 2 : 1;
          const newDist = entry.dist + cost;
          const existing = bestDist.get(neighbor);
          if (existing === void 0 || newDist < existing) {
            bestDist.set(neighbor, newDist);
            if (neighbor.majorPlayerRegionId >= 0) {
              --seedTiles[neighbor.majorPlayerRegionId].count;
            }
            neighbor.majorPlayerRegionId = entry.regionId;
            ++seedTiles[entry.regionId].count;
            dijkstraHeap.push({ tile: neighbor, dist: newDist, regionId: entry.regionId });
          }
        });
      }
      const counts = seedTiles.map((seedTile) => seedTile.count);
      const sizeDiff = Math.max(...counts) - Math.min(...counts);
      if (detailedLogs) {
        console.log("Player region sizes: " + counts.join(", ") + ". Total size difference: " + sizeDiff);
      }
      if (Math.abs(lastSizeDiff - sizeDiff) < 5) {
        break;
      }
      lastSizeDiff = sizeDiff;
      getAverageRegionPositions(seedTiles);
    }
    landmassTiles.forEach((tile) => {
      tile.majorPlayerRegionId = -1;
    });
    VoronoiUtils.performanceMarker("createMajorPlayerAreas - K-means clustering done");
    class ScoredTile {
      tile;
      scores = new Array(playerRegions2.length).fill(-1);
      expScores = new Array(playerRegions2.length).fill(-1);
      expSum = 0;
      constructor(tile) {
        this.tile = tile;
      }
    }
    class MajorPlayerRegion {
      id = 0;
      totalValue = 0;
      centerPos = { x: 0, y: 0 };
      considerationHeap;
      finalSet = /* @__PURE__ */ new Set();
      borderSet = Array.from({ length: region.playerAreas }, () => /* @__PURE__ */ new Set());
    }
    const playerRegions2 = Array.from({ length: seedTiles.length }, () => new MajorPlayerRegion());
    const scoredTiles = hexMap.getTiles().map((row) => row.map((item) => new ScoredTile(item)));
    const getScoredTile = (tile) => scoredTiles[tile.coord.y][tile.coord.x];
    const getTileCost = (tile) => {
      return [TerrainType.Coast, TerrainType.NavRiver, TerrainType.Rough].includes(tile.terrainType) ? 2 : 1;
    };
    for (let playerRegionId = 0; playerRegionId < playerRegions2.length; ++playerRegionId) {
      const playerRegionBit = 1 << playerRegionId;
      const initialTile = getScoredTile(seedTiles[playerRegionId].tile);
      initialTile.scores[playerRegionId] = 0;
      const considerationHeap = new Heap(
        (a, b) => a.scores[playerRegionId] - b.scores[playerRegionId]
      );
      considerationHeap.push(initialTile);
      while (considerationHeap.size > 0) {
        const bestTile = considerationHeap.pop();
        hexMap.forNeighbors(bestTile.tile.coord.x, bestTile.tile.coord.y, hexMap.getTiles(), (neighbor) => {
          if (neighbor && (neighbor.visited & playerRegionBit) == 0) {
            neighbor.visited |= playerRegionBit;
            const scoredNeighbor = getScoredTile(neighbor);
            scoredNeighbor.scores[playerRegionId] = bestTile.scores[playerRegionId] + getTileCost(neighbor);
            considerationHeap.push(scoredNeighbor);
          }
        });
      }
    }
    landmassTiles.forEach((tile) => {
      tile.visited = 0;
      const scoredTile = getScoredTile(tile);
      const softMaxTemp = 5;
      scoredTile.expScores = scoredTile.scores.map((s) => Math.exp(-s / softMaxTemp));
      scoredTile.expSum = scoredTile.expScores.reduce((a, b) => a + b, 0);
    });
    VoronoiUtils.performanceMarker("createMajorPlayerAreas - Scoring Done");
    let majorPlayerRegionId = 0;
    for (const region2 of playerRegions2) {
      const seedTile = seedTiles[majorPlayerRegionId].tile;
      const scoredSeedTile = getScoredTile(seedTile);
      scoredSeedTile.scores[majorPlayerRegionId] = 0;
      scoredSeedTile.tile.visited = 1 << majorPlayerRegionId;
      region2.id = majorPlayerRegionId;
      region2.considerationHeap = new Heap((a, b) => {
        const scoreA = a.expScores[region2.id] / a.expSum;
        const scoreB = b.expScores[region2.id] / b.expSum;
        return scoreB - scoreA;
      });
      region2.considerationHeap.push(scoredSeedTile);
      region2.centerPos = seedTile.pos;
      ++majorPlayerRegionId;
    }
    const scoringRegions = [...playerRegions2];
    while (scoringRegions.length > 0) {
      for (const scoringRegion of scoringRegions) {
        let bestTile = void 0;
        while (bestTile === void 0 && scoringRegion.considerationHeap.size > 0) {
          bestTile = scoringRegion.considerationHeap.pop();
          if (bestTile.tile.majorPlayerRegionId != -1) {
            bestTile = void 0;
          }
        }
        if (bestTile === void 0) {
          scoringRegions.splice(scoringRegions.indexOf(scoringRegion), 1);
          continue;
        }
        bestTile.tile.majorPlayerRegionId = scoringRegion.id;
        scoringRegion.finalSet.add(bestTile.tile);
        const regionBit = 1 << scoringRegion.id;
        hexMap.forNeighbors(bestTile.tile.coord.x, bestTile.tile.coord.y, scoredTiles, (neighbor) => {
          if (neighbor?.tile.majorPlayerRegionId == -1 && (neighbor.tile.visited & regionBit) == 0) {
            neighbor.tile.visited |= regionBit;
            if (neighbor.tile.isPassable()) {
              scoringRegion.considerationHeap.push(neighbor);
            }
          }
        });
      }
    }
    const getTileValue = valueFunction ? valueFunction : (tile) => {
      switch (tile.terrainType) {
        case TerrainType.Coast:
          return 0.5;
        default:
          return 1;
      }
    };
    landmassTiles.forEach((tile) => {
      tile.visited = 0;
      if (tile.majorPlayerRegionId >= 0) {
        playerRegions2[tile.majorPlayerRegionId].totalValue += getTileValue(tile);
      }
    });
    VoronoiUtils.performanceMarker("createMajorPlayerAreas - Initial Growth Done");
    console.log(
      `After initial growth, region sizes are: [${playerRegions2.map((region2) => region2.finalSet.size).join(", ")}] and vales are: [${playerRegions2.map((region2) => region2.totalValue).join(", ")}]`
    );
    class Border {
      regionId1 = -1;
      regionId2 = -1;
      count = 1;
      constructor(regionId1, regionId2) {
        [this.regionId1, this.regionId2] = [regionId1, regionId2];
        this.count = 1;
      }
      regionValueDiff() {
        return Math.abs(
          //playerRegions[this.regionId1].finalSet.size - playerRegions[this.regionId2].finalSet.size,
          playerRegions2[this.regionId1].totalValue - playerRegions2[this.regionId2].totalValue
        );
      }
      isSame(regionId1, regionId2) {
        return this.regionId1 == regionId1 && this.regionId2 == regionId2 || this.regionId2 == regionId1 && this.regionId1 == regionId2;
      }
      getOrderedRegions() {
        return playerRegions2[this.regionId1].totalValue < playerRegions2[this.regionId2].totalValue ? [this.regionId1, this.regionId2] : [this.regionId2, this.regionId1];
      }
    }
    const borders = [];
    const addBorder = (regionId1, regionId2) => {
      const existingBorder = borders.find(
        (border) => border.isSame(regionId1, regionId2)
      );
      if (existingBorder) {
        ++existingBorder.count;
      } else {
        borders.push(new Border(regionId1, regionId2));
      }
    };
    const getBorderNeighbors = (tile) => {
      const borderNeighbors = [];
      hexMap.forNeighbors(tile.coord.x, tile.coord.y, hexMap.getTiles(), (neighbor) => {
        if (neighbor && neighbor.majorPlayerRegionId != -1 && neighbor.majorPlayerRegionId != tile.majorPlayerRegionId) {
          borderNeighbors.push(neighbor);
        }
      });
      return borderNeighbors;
    };
    const isBridgeForRegion = (tile) => {
      const regions = [];
      hexMap.forNeighbors(tile.coord.x, tile.coord.y, hexMap.getTiles(), (neighbor) => {
        regions.push(neighbor.majorPlayerRegionId == tile.majorPlayerRegionId ? 1 : 0);
      });
      let lastRegionId = regions[0];
      let nonRegionBlobs = 1 - lastRegionId;
      let regionBlobs = lastRegionId;
      for (let i = 1; i < regions.length; ++i) {
        const regionId = regions[i];
        if (lastRegionId == 0 && regionId == 1) ++regionBlobs;
        else if (lastRegionId == 1 && regionId == 0) ++nonRegionBlobs;
        lastRegionId = regionId;
      }
      return nonRegionBlobs > 1 && regionBlobs > 1;
    };
    for (const tile of landmassTiles) {
      if (tile.majorPlayerRegionId == -1) {
        continue;
      }
      const region2 = playerRegions2[tile.majorPlayerRegionId];
      const borderNeighbors = getBorderNeighbors(tile);
      for (const neighbor of borderNeighbors) {
        region2.borderSet[neighbor.majorPlayerRegionId].add(tile);
        addBorder(tile.majorPlayerRegionId, neighbor.majorPlayerRegionId);
      }
    }
    const borderSorter = (a, b) => {
      return b.regionValueDiff() - a.regionValueDiff();
    };
    borders.sort(borderSorter);
    if (borders.length === 0) {
      console.warn(
        "No borders found between player regions, unable to balance the size of player starting areas."
      );
      continue;
    }
    let count = 0;
    while (borders[0].regionValueDiff() > 1 && count < 100) {
      ++count;
      let bestScore = -Infinity;
      let bestSteal;
      let bestSource;
      let [smallRegionId, bigRegionId] = borders[0].getOrderedRegions();
      let [smallRegion, bigRegion] = [playerRegions2[smallRegionId], playerRegions2[bigRegionId]];
      let i = 0;
      let border = borders[i];
      while (bestSteal == void 0 && i < borders.length) {
        border = borders[i];
        ++i;
        bestScore = -Infinity;
        [smallRegionId, bigRegionId] = border.getOrderedRegions();
        [smallRegion, bigRegion] = [playerRegions2[smallRegionId], playerRegions2[bigRegionId]];
        for (const borderTile of smallRegion.borderSet[bigRegionId]) {
          for (const neighbor of getBorderNeighbors(borderTile)) {
            if (neighbor.majorPlayerRegionId == bigRegionId) {
              const neighborPairTile = getScoredTile(neighbor);
              const neighborValue = getTileValue(neighborPairTile.tile);
              const bigRegionScore = neighborPairTile.scores[bigRegionId] - neighborValue;
              const smallRegionScore = neighborPairTile.scores[smallRegionId] - neighborValue;
              const swapScore = bigRegionScore - smallRegionScore;
              if (swapScore > bestScore && !isBridgeForRegion(neighbor) && // doesn't cut region in two
              borders[0].regionValueDiff() - neighborValue > 0) {
                bestScore = swapScore;
                bestSteal = neighbor;
                bestSource = borderTile;
              }
            }
          }
        }
      }
      if (bestSteal != void 0 && bestSource != void 0) {
        if (detailedLogs) {
          console.log(
            `Stealing (${bestSteal.coord.x}, ${bestSteal.coord.y}) from region ${bestSteal.majorPlayerRegionId} to region ${bestSource.majorPlayerRegionId} with score ${bestScore}`
          );
        }
        border.count -= getBorderNeighbors(bestSteal).length;
        {
          const bestStealValue = getTileValue(bestSteal);
          let count2 = 0;
          for (const borderSet of bigRegion.borderSet) {
            count2 += Number(borderSet.delete(bestSteal));
          }
          if (count2 == 0) throw new Error();
          if (!bigRegion.finalSet.delete(bestSteal)) throw new Error();
          bigRegion.totalValue -= bestStealValue;
          bestSteal.majorPlayerRegionId = smallRegionId;
          count2 = 0;
          for (const neighbor of getBorderNeighbors(bestSteal)) {
            if (neighbor.majorPlayerRegionId != smallRegion.id) {
              smallRegion.borderSet[neighbor.majorPlayerRegionId].add(bestSteal);
              ++count2;
            }
          }
          if (count2 == 0) throw new Error();
          smallRegion.finalSet.add(bestSteal);
          smallRegion.totalValue += bestStealValue;
          const borderNeighbors = getBorderNeighbors(bestSteal);
          for (const neighbor of borderNeighbors) {
            addBorder(smallRegionId, neighbor.majorPlayerRegionId);
            bigRegion.borderSet[smallRegionId].add(neighbor);
          }
        }
        if (getBorderNeighbors(bestSource).length == 0) {
          if (!smallRegion.borderSet[bigRegionId].delete(bestSource)) throw new Error();
        }
        if (border.count == 0) {
          VoronoiUtils.swapAndPop(borders, i - 1);
          borders.sort(borderSorter);
        }
        for (let i2 = 0; i2 < borders.length - 1; ++i2) {
          if (borders[i2].regionValueDiff() < borders[i2 + 1].regionValueDiff()) {
            [borders[i2], borders[i2 + 1]] = [borders[i2 + 1], borders[i2]];
          } else {
            break;
          }
        }
      } else {
        break;
      }
      if (detailedLogs) {
        console.log(`  Region sizes: [${playerRegions2.map((region2) => region2.finalSet.size).join(", ")}] `);
        console.log(`  Region values: [${playerRegions2.map((region2) => region2.totalValue).join(", ")}] `);
        console.log(
          `  Borders: [${borders.map((border2) => "([" + border2.getOrderedRegions()[0] + ", " + border2.getOrderedRegions()[1] + "], diff: " + border2.regionValueDiff() + ", count: " + border2.count + ")").join(", ")}] `
        );
      }
    }
    VoronoiUtils.performanceMarker("createMajorPlayerAreas - Region Area Balancing Done");
    for (const region2 of playerRegions2) {
      const inBorderTiles = /* @__PURE__ */ new Set();
      region2.finalSet.forEach((tile) => {
        if (getBorderNeighbors(tile).length > 0) inBorderTiles.add(getScoredTile(tile));
      });
      const outBorderTiles = Array.from(
        { length: playerRegions2.length },
        () => /* @__PURE__ */ new Set()
      );
      for (const tile of inBorderTiles) {
        for (const neighbor of getBorderNeighbors(tile.tile)) {
          outBorderTiles[neighbor.majorPlayerRegionId].add(getScoredTile(neighbor));
        }
      }
      while (true) {
        const regionPairs = /* @__PURE__ */ new Map();
        for (const inTile2 of inBorderTiles) {
          if (isBridgeForRegion(inTile2.tile)) {
            continue;
          }
          const borderRegions = [];
          for (const neighbor of getBorderNeighbors(inTile2.tile)) {
            if (borderRegions.indexOf(neighbor.majorPlayerRegionId) == -1) {
              borderRegions.push(neighbor.majorPlayerRegionId);
            }
          }
          for (const regionId of borderRegions) {
            let bestTradeScore = 0;
            let bestTradeTile;
            for (const outTile2 of outBorderTiles[regionId]) {
              const inTileValue = getTileValue(inTile2.tile);
              const outTileValue = getTileValue(outTile2.tile);
              const tileValueDiff = inTileValue - outTileValue;
              const scoreBefore = inTile2.scores[region2.id] + outTile2.scores[outTile2.tile.majorPlayerRegionId] + tileValueDiff;
              const scoreAfter = inTile2.scores[outTile2.tile.majorPlayerRegionId] + outTile2.scores[region2.id] - tileValueDiff;
              const tradeScore = scoreBefore - scoreAfter;
              if (tradeScore > bestTradeScore && !isBridgeForRegion(outTile2.tile)) {
                bestTradeScore = tradeScore;
                bestTradeTile = outTile2;
              }
            }
            if (bestTradeTile != void 0) {
              const tradeCandidate = regionPairs.get(regionId);
              if (tradeCandidate == void 0) {
                regionPairs.set(regionId, {
                  inside: inTile2,
                  outside: bestTradeTile,
                  delta: bestTradeScore
                });
              } else if (tradeCandidate.delta < bestTradeScore) {
                tradeCandidate.inside = inTile2;
                tradeCandidate.outside = bestTradeTile;
                tradeCandidate.delta = bestTradeScore;
              }
            }
          }
        }
        if (regionPairs.size == 0) {
          break;
        }
        let bestTradeCandidate;
        for (const [_key, value] of regionPairs) {
          if (bestTradeCandidate == void 0 || bestTradeCandidate.delta < value.delta) {
            bestTradeCandidate = value;
          }
        }
        let [inTile, outTile] = [bestTradeCandidate.inside, bestTradeCandidate.outside];
        if (inTile.tile.majorPlayerRegionId == outTile.tile.majorPlayerRegionId) throw new Error("");
        {
          const scoreBefore = inTile.scores[region2.id] + outTile.scores[outTile.tile.majorPlayerRegionId];
          const scoreAfter = inTile.scores[outTile.tile.majorPlayerRegionId] + outTile.scores[region2.id];
          if (detailedLogs) {
            console.log(
              `Trading (${inTile.tile.coord.x}, ${inTile.tile.coord.y}), region: ${inTile.tile.majorPlayerRegionId} with (${outTile.tile.coord.x}, ${outTile.tile.coord.y}), region: ${outTile.tile.majorPlayerRegionId} to improve total score from ${scoreBefore} to ${scoreAfter} `
            );
          }
        }
        if (!inBorderTiles.delete(inTile)) throw new Error();
        if (!outBorderTiles[outTile.tile.majorPlayerRegionId].delete(outTile)) throw new Error();
        if (!playerRegions2[inTile.tile.majorPlayerRegionId].finalSet.delete(inTile.tile)) throw new Error();
        if (!playerRegions2[outTile.tile.majorPlayerRegionId].finalSet.delete(outTile.tile)) throw new Error();
        playerRegions2[inTile.tile.majorPlayerRegionId].totalValue -= getTileValue(inTile.tile);
        playerRegions2[outTile.tile.majorPlayerRegionId].totalValue -= getTileValue(outTile.tile);
        [inTile.tile.majorPlayerRegionId, outTile.tile.majorPlayerRegionId] = [
          outTile.tile.majorPlayerRegionId,
          inTile.tile.majorPlayerRegionId
        ];
        [inTile, outTile] = [outTile, inTile];
        if (inTile.tile.majorPlayerRegionId != region2.id) throw new Error("");
        inBorderTiles.add(inTile);
        outBorderTiles[outTile.tile.majorPlayerRegionId].add(outTile);
        playerRegions2[inTile.tile.majorPlayerRegionId].finalSet.add(inTile.tile);
        playerRegions2[outTile.tile.majorPlayerRegionId].finalSet.add(outTile.tile);
        playerRegions2[inTile.tile.majorPlayerRegionId].totalValue += getTileValue(inTile.tile);
        playerRegions2[outTile.tile.majorPlayerRegionId].totalValue += getTileValue(outTile.tile);
        hexMap.forNeighbors(inTile.tile.coord.x, inTile.tile.coord.y, hexMap.getTiles(), (neighbor) => {
          if (getBorderNeighbors(neighbor).length == 0) {
            inBorderTiles.delete(getScoredTile(neighbor));
          }
        });
        hexMap.forNeighbors(outTile.tile.coord.x, outTile.tile.coord.y, hexMap.getTiles(), (neighbor) => {
          if (getBorderNeighbors(neighbor).length == 0) {
            outBorderTiles[neighbor.majorPlayerRegionId].delete(getScoredTile(neighbor));
          }
        });
      }
    }
    if (playerIdOffset > 0) {
      for (const region2 of playerRegions2) {
        for (const tile of region2.finalSet) {
          tile.majorPlayerRegionId += playerIdOffset;
        }
      }
    }
    hexMap.clearVisited();
    VoronoiUtils.performanceMarker("createMajorPlayerAreas - Region Optimizing Done");
    console.log(
      `"Finished creating major player regions for region ${region.id}, (ids ${playerIdOffset} - ${playerIdOffset + region.playerAreas - 1}). Region sizes are: [${playerRegions2.map((region2) => region2.finalSet.size).join(", ")}] and vales are: [${playerRegions2.map((region2) => region2.totalValue).join(", ")}]`
    );
    playerIdOffset += region.playerAreas;
  }
  perfScope.end();
}

export { CreateMajorPlayerAreas, PlayerRegion };
//# sourceMappingURL=player-areas.js.map

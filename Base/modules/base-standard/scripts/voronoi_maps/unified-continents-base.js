import { RandomImpl } from '../random-pcg-32.js';
import { VoronoiUtils } from '../voronoi-utils.js';
import { continentGeneratorSchema, ContinentGenerator, continentGeneratorRulesSettings } from '../voronoi_generators/continent-generator.js';
import { voronoiMapSchema, VoronoiMap } from './map-common.js';

const unifiedSectionSchema = {
  totalLandmassSize: {
    label: "Total Landmass Size",
    description: "The total percentage of land to be taken up by the major landmasses.",
    default: 32,
    min: 20,
    max: 50,
    step: 0.25
  },
  maxSizeVariance: {
    label: "Max Size Variance",
    description: "The maximum difference allowed for between the largest and smallest continents as a percentage. For instance, 50% would mean the smallest landmass can be half the size of the largest.",
    default: 20,
    min: 0,
    max: 50,
    step: 1
  },
  landmassCount: {
    label: "Landmass Count",
    description: "The number of major landmasses to spawn.",
    default: 4,
    min: 0,
    max: 20,
    step: 1
  },
  landmassGroupCount: {
    label: "Landmass Group Count",
    description: "The number of groups to divide landmasses into. Landmasses in the same group are more likely to be closer together and less likely to have ocean between them.",
    default: 1,
    min: 1,
    max: 10,
    step: 1
  },
  totalDistantSize: {
    label: "Total Distant Size",
    description: 'The total percentage of land to be taken up by the "distant" landmasses.',
    default: 4,
    min: 0,
    max: 20,
    step: 0.25
  },
  maxDistantSizeVariance: {
    label: "Max Distant Size Variance",
    description: 'The maximum difference allowed for between the largest and smallest "distant" landmasses as a percentage. For instance, 50% would mean the smallest landmass can be half the size of the largest.',
    default: 20,
    min: 0,
    max: 50,
    step: 1
  },
  distantCount: {
    label: "Distant Land Count",
    description: "The number of primary distant landmasses to spawn.",
    default: 0,
    min: 0,
    max: 10,
    step: 1
  },
  groupBalancedMode: {
    label: "Balance Landmass Groups",
    description: "0: evenly space groups, 1: slightly randomize, 2: fully random.",
    default: 0,
    min: 0,
    max: 2,
    step: 1,
    hidden: true
  },
  minPlayersPerLandmassGroup: {
    label: "Min Players per Landmass Group",
    description: "The minimum number of players that should spawn on each landmass group. This is used to help ensure that each landmass group is large enough to host at least a certain number of players, which can help prevent very small landmasses that only host one player.",
    default: 2,
    min: 0,
    max: 4,
    step: 1,
    hidden: true
  },
  minLandmassSpawnCenterDistance: {
    label: "Min Landmass Spawn Center Distance",
    description: "The minimum distance ratio from the center of the map that a landmass can spawn.",
    default: 0.3,
    min: 0,
    max: 1,
    step: 0.05,
    hidden: true
  },
  maxLandmassSpawnCenterDistance: {
    label: "Max Landmass Spawn Center Distance",
    description: "The maximum distance ratio from the center of the map that a landmass can spawn.",
    default: 0.8,
    min: 0,
    max: 1,
    step: 0.05,
    hidden: true
  },
  minDistantSpawnCenterDistance: {
    label: "Min Distant Landmass Spawn Center Distance",
    description: "The minimum distance ratio from the center of the map that a distant landmass can spawn.",
    default: 0.4,
    min: 0,
    max: 1,
    step: 0.05,
    hidden: true
  },
  maxDistantSpawnCenterDistance: {
    label: "Max Distant Landmass Spawn Center Distance",
    description: "The maximum distance ratio from the center of the map that a distant landmass can spawn.",
    default: 0.6,
    min: 0,
    max: 1,
    step: 0.05,
    hidden: true
  }
};
const unifiedContinentsSchema = { ...voronoiMapSchema, ...unifiedSectionSchema };
class UnifiedContinentsBase extends VoronoiMap {
  constructor(customSchema, defaultMapSettings, landmassRuleSetNames) {
    const schema = VoronoiUtils.clone(continentGeneratorSchema);
    schema.landmass.children.data.size.locked = true;
    schema.landmass.children.data.variance.locked = true;
    schema.landmass.children.data.erosionPercent.unified = true;
    schema.landmass.children.data.erosionRandomness.unified = true;
    schema.landmass.children.data.erosionTime.unified = true;
    schema.landmass.children.data.coastalIslands.unified = true;
    schema.landmass.children.data.coastalIslandsMinDistance.unified = true;
    schema.landmass.children.data.coastalIslandsMaxDistance.unified = true;
    schema.landmass.children.data.coastalIslandsSize.unified = true;
    schema.landmass.children.data.coastalIslandsSizeVariance.unified = true;
    const generator = new ContinentGenerator(schema, { ...continentGeneratorRulesSettings }, landmassRuleSetNames);
    super(
      { ...unifiedContinentsSchema, ...customSchema },
      generator,
      generator.getDefaultGeneratorSettings(),
      generator.getDefaultRuleSettings(),
      defaultMapSettings
    );
  }
  buildSection(settings, startAngle, sweepAngle, landmassDefaults, ruleSetKey) {
    return {
      startAngle,
      sweepAngle,
      landmassCount: settings.landmassCount,
      distantCount: settings.distantCount,
      groupCount: Math.min(settings.landmassGroupCount, settings.landmassCount),
      totalLandmassSize: settings.totalLandmassSize,
      maxSizeVariance: settings.maxSizeVariance,
      totalDistantSize: settings.totalDistantSize,
      maxDistantSizeVariance: settings.maxDistantSizeVariance,
      landmassSpawnDistance: {
        min: settings.minLandmassSpawnCenterDistance,
        max: settings.maxLandmassSpawnCenterDistance
      },
      distantSpawnDistance: {
        min: settings.minDistantSpawnCenterDistance,
        max: settings.maxDistantSpawnCenterDistance
      },
      groupBalancedMode: settings.groupBalancedMode,
      minPlayersPerLandmassGroup: settings.minPlayersPerLandmassGroup,
      ruleSetKey,
      landmassDefaults: { ...landmassDefaults }
    };
  }
  placeDefaultSection(settings) {
    const generatorSettings = this.getGenerator().getSettings();
    const sweepAngle = 2 * Math.PI;
    const startAngle = sweepAngle * RandomImpl.fRand("Landmass spawn offset");
    const section = this.buildSection(settings, startAngle, sweepAngle, generatorSettings.landmass[0]);
    this.placeSections([section]);
  }
  placeSections(sections) {
    const generatorSettings = this.getGenerator().getSettings();
    generatorSettings.landmass = [];
    const totalGroupCount = sections.reduce((sum, s) => sum + s.groupCount, 0);
    const positions = [];
    const context = {
      groupOffset: 0,
      totalGroupCount,
      runningLandmassCount: 0,
      runningDistantCount: 0,
      runningGroupCount: 0
    };
    for (const section of sections) {
      positions.push(...this.placeSection(section, context));
    }
    const hexDims = this.m_hexDims;
    const totalLandmassCount = positions.length;
    const W = hexDims.x;
    const H = hexDims.y;
    positions.forEach((p) => {
      p.x *= W;
      p.y *= H;
    });
    const slotSizes = positions.map((p, i) => p.size + (generatorSettings.landmass[i].coastalIslandsSize ?? 0));
    const sameGroupPadding = 1;
    const sameGroupMultiplier = 1;
    const diffGroupPadding = 5;
    const diffGroupMultiplier = 1.2;
    const radiusOf = (size) => Math.pow(size / 100 * W * H, 0.6) / Math.PI;
    const minDistBetween = (sizeA, sizeB, sameGroup) => {
      const padding = sameGroup ? sameGroupPadding : diffGroupPadding;
      const multiplier = sameGroup ? sameGroupMultiplier : diffGroupMultiplier;
      return (radiusOf(sizeA) + radiusOf(sizeB)) * multiplier + padding;
    };
    const maxDistMultiplier = 1.2;
    const constraintIterations = 10;
    const mstStrength = 0.8;
    const separationStrength = 0.3;
    const groupMembers = /* @__PURE__ */ new Map();
    for (let i = 0; i < totalLandmassCount; ++i) {
      const gid = positions[i].groupId;
      if (gid === 0) continue;
      if (!groupMembers.has(gid)) groupMembers.set(gid, []);
      groupMembers.get(gid).push(i);
    }
    const groupMSTs = /* @__PURE__ */ new Map();
    for (const [gid, members] of groupMembers) {
      if (members.length < 2) continue;
      const inTree = /* @__PURE__ */ new Set();
      const mstEdges = [];
      inTree.add(members[0]);
      while (inTree.size < members.length) {
        let bestDist = Infinity;
        let bestFrom = -1;
        let bestTo = -1;
        for (const from of inTree) {
          for (const to of members) {
            if (inTree.has(to)) continue;
            const dx = positions[to].x - positions[from].x;
            const dy = positions[to].y - positions[from].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < bestDist) {
              bestDist = d;
              bestFrom = from;
              bestTo = to;
            }
          }
        }
        if (bestTo >= 0) {
          inTree.add(bestTo);
          mstEdges.push([bestFrom, bestTo]);
        } else {
          break;
        }
      }
      groupMSTs.set(gid, mstEdges);
    }
    const convergenceThreshold = 0.5;
    const applyForce = (pa, pb, dist, amount, massA = 1, massB = 1) => {
      let nx;
      let ny;
      if (dist > 0) {
        nx = (pb.x - pa.x) / dist;
        ny = (pb.y - pa.y) / dist;
      } else {
        const angle = (pa.x * 7 + pa.y * 13 + pb.x * 17 + pb.y * 23) % 360 * (Math.PI / 180);
        nx = Math.cos(angle);
        ny = Math.sin(angle);
      }
      const totalMass = massA + massB;
      const ratioA = totalMass > 0 ? massB / totalMass : 0.5;
      const ratioB = totalMass > 0 ? massA / totalMass : 0.5;
      if (!pa.pinned) {
        pa.x -= nx * amount * ratioA;
        pa.y -= ny * amount * ratioA;
      }
      if (!pb.pinned) {
        pb.x += nx * amount * ratioB;
        pb.y += ny * amount * ratioB;
      }
    };
    for (let iter = 0; iter < constraintIterations; ++iter) {
      const prevPositions = positions.map((p) => ({ x: p.x, y: p.y }));
      const damping = 1 - 0.5 * (iter / constraintIterations);
      const currentMST = mstStrength * damping;
      const currentSep = separationStrength * damping;
      for (const [gid, members] of groupMembers) {
        const mstEdges = groupMSTs.get(gid);
        if (!mstEdges || members.length < 2) continue;
        for (const [a, b] of mstEdges) {
          const pa = positions[a];
          const pb = positions[b];
          const dx = pb.x - pa.x;
          const dy = pb.y - pa.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = minDistBetween(slotSizes[a], slotSizes[b], true);
          const maxDist = minDist * maxDistMultiplier;
          if (dist > maxDist) {
            applyForce(pa, pb, dist, -(dist - maxDist) * currentMST);
          } else if (dist < minDist) {
            applyForce(pa, pb, dist, (minDist - dist) * (minDist - dist) * currentSep);
          }
        }
      }
      for (let i = 0; i < totalLandmassCount; ++i) {
        for (let j = i + 1; j < totalLandmassCount; ++j) {
          const sameGroup = positions[i].groupId > 0 && positions[i].groupId === positions[j].groupId;
          const pi = positions[i];
          const pj = positions[j];
          const dx = pj.x - pi.x;
          const dy = pj.y - pi.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = minDistBetween(slotSizes[i], slotSizes[j], sameGroup);
          if (dist < minDist) {
            const amount = (minDist - (dist > 0 ? dist : 0)) * currentSep;
            applyForce(pi, pj, dist, amount * amount, slotSizes[i], slotSizes[j]);
          }
        }
      }
      let maxMovementSq = 0;
      const edgePadding = 2;
      for (let i = 0; i < totalLandmassCount; ++i) {
        const r = radiusOf(slotSizes[i]);
        const loX = Math.max(edgePadding, r);
        const hiX = Math.min(W - edgePadding, W - r);
        const loY = Math.max(edgePadding, r);
        const hiY = Math.min(H - edgePadding, H - r);
        if (!positions[i].pinned) {
          positions[i].x = VoronoiUtils.clamp(positions[i].x, loX, hiX);
          positions[i].y = VoronoiUtils.clamp(positions[i].y, loY, hiY);
        }
        const dx = positions[i].x - prevPositions[i].x;
        const dy = positions[i].y - prevPositions[i].y;
        maxMovementSq = Math.max(maxMovementSq, dx * dx + dy * dy);
      }
      if (maxMovementSq < convergenceThreshold * convergenceThreshold) break;
    }
    for (let i = 0; i < totalLandmassCount; ++i) {
      positions[i].x /= W;
      positions[i].y /= H;
    }
    for (let i = 0; i < totalLandmassCount; ++i) {
      const landmass = generatorSettings.landmass[i];
      landmass.size = positions[i].size;
      landmass.playerAreas = positions[i].groupId === 0 ? 0 : 1;
      landmass.xPos = positions[i].x;
      landmass.yPos = positions[i].y;
      landmass.variance = 0;
      landmass.groupId = positions[i].groupId;
      landmass.ruleSetKey = positions[i].ruleSetKey;
    }
  }
  placeSection(section, context) {
    const hexDims = this.m_hexDims;
    const sweepRatio = section.sweepAngle / (2 * Math.PI);
    const allocateCount = (running, desired, atLeastOne) => {
      const before = Math.round(running);
      const after = running + desired;
      let count = Math.round(after) - before;
      if (atLeastOne && count === 0 && desired > 0) count = 1;
      return { count, after };
    };
    const landmassAllocation = allocateCount(
      context.runningLandmassCount,
      section.landmassCount * sweepRatio,
      true
    );
    const landmassCount = landmassAllocation.count;
    context.runningLandmassCount = landmassAllocation.after;
    const distantAllocation = allocateCount(context.runningDistantCount, section.distantCount * sweepRatio, false);
    const distantCount = distantAllocation.count;
    context.runningDistantCount = distantAllocation.after;
    const groupAllocation = allocateCount(context.runningGroupCount, section.groupCount * sweepRatio, true);
    const groupCount = Math.min(groupAllocation.count, landmassCount);
    context.runningGroupCount = groupAllocation.after;
    const totalLandmassSize = section.totalLandmassSize * sweepRatio;
    const totalDistantSize = section.totalDistantSize * sweepRatio;
    const totalLandmassCount = landmassCount + distantCount;
    const generatorSettings = this.getGenerator().getSettings();
    for (let i = 0; i < totalLandmassCount; ++i) {
      const defaults = { ...section.landmassDefaults };
      generatorSettings.landmass.push(defaults);
    }
    const tileCount = hexDims.x * hexDims.y;
    const avgDim = (hexDims.x + hexDims.y) / 2;
    const landmassSeparationWidth = 2;
    const separationAxis = 2 * Math.sqrt(totalLandmassCount) - 2;
    const landmassSeparationTiles = avgDim * separationAxis * landmassSeparationWidth;
    const usablePercentage = (tileCount - landmassSeparationTiles) / tileCount;
    const adjustedTotalSize = totalLandmassSize * usablePercentage;
    const [minSize, maxSize] = VoronoiUtils.computeBoundedPartitionRange(
      landmassCount,
      adjustedTotalSize,
      section.maxSizeVariance * 0.01
    );
    const landmassSizes = VoronoiUtils.distributeTotal(adjustedTotalSize, minSize, maxSize, landmassCount);
    const adjustedTotalDistantSize = totalDistantSize * usablePercentage;
    const [minDistantSize, maxDistantSize] = VoronoiUtils.computeBoundedPartitionRange(
      distantCount,
      adjustedTotalDistantSize,
      section.maxDistantSizeVariance * 0.01
    );
    const distantSizes = VoronoiUtils.distributeTotal(
      adjustedTotalDistantSize,
      minDistantSize,
      maxDistantSize,
      distantCount
    );
    const getDistantDistance = (rand) => VoronoiUtils.lerp(section.distantSpawnDistance.min, section.distantSpawnDistance.max, rand);
    const getLandmassDistance = (rand) => VoronoiUtils.lerp(section.landmassSpawnDistance.min, section.landmassSpawnDistance.max, rand);
    const landmassGroups = Array(totalLandmassCount).fill(0);
    let remainingLandmasses = landmassCount;
    let writeIndex = 0;
    let remainingMidGroupDistant = Math.min(distantCount, groupCount);
    const extraDistant = Math.max(0, distantCount - groupCount);
    const minGroupSize = Math.floor(landmassCount / groupCount);
    let extraAccumulator = landmassCount > 0 ? RandomImpl.getRandomNumber(minGroupSize * 0.25, "Distant Lands Extra Spacing Offset") + minGroupSize * 0.5 : 0;
    for (let groupId = 0; groupId < groupCount; ++groupId) {
      const gapsBeforeGroup = Math.round(remainingMidGroupDistant / (groupCount - groupId));
      writeIndex += gapsBeforeGroup;
      remainingMidGroupDistant -= gapsBeforeGroup;
      const landmassesInGroup = Math.round(remainingLandmasses / (groupCount - groupId));
      for (let i = 0; i < landmassesInGroup; ++i) {
        extraAccumulator += extraDistant;
        while (landmassCount > 0 && extraAccumulator > landmassCount) {
          writeIndex++;
          extraAccumulator -= landmassCount;
        }
        landmassGroups[writeIndex % totalLandmassCount] = groupId + 1;
        writeIndex++;
      }
      remainingLandmasses -= landmassesInGroup;
    }
    if (section.groupBalancedMode == 1) {
      for (let i = 0; i < landmassGroups.length - 1; ++i) {
        if (RandomImpl.getRandomNumber(2, "Distant Lands Slight Random") > 0) {
          [landmassGroups[i], landmassGroups[i + 1]] = [landmassGroups[i + 1], landmassGroups[i]];
        }
      }
    } else if (section.groupBalancedMode == 2) {
      VoronoiUtils.shuffle(landmassGroups);
    }
    let landmassIdx = 0;
    let distantIdx = 0;
    const slotWeights = [];
    for (let i = 0; i < totalLandmassCount; ++i) {
      if (landmassGroups[i] === 0) {
        slotWeights.push(distantSizes[distantIdx++]);
      } else {
        slotWeights.push(landmassSizes[landmassIdx++]);
      }
    }
    const totalSlotWeight = slotWeights.reduce((a, b) => a + b, 0);
    const rands = VoronoiUtils.getPoissonRands(totalLandmassCount, "Landmass Spawn Distance");
    const positions = [];
    let cumulativeAngle = section.startAngle;
    for (let i = 0; i < totalLandmassCount; ++i) {
      const sliceAngle = totalSlotWeight > 0 ? slotWeights[i] / totalSlotWeight * section.sweepAngle : section.sweepAngle / totalLandmassCount;
      const angle = cumulativeAngle + sliceAngle * 0.5;
      const distFn = landmassGroups[i] === 0 ? getDistantDistance : getLandmassDistance;
      const distance = VoronoiUtils.clamp(distFn(rands[i]), 0, 1) * 0.5;
      positions.push({
        x: 0.5 + Math.cos(angle) * distance,
        y: 0.5 + Math.sin(angle) * distance,
        pinned: false,
        size: slotWeights[i],
        groupId: landmassGroups[i] == 0 ? 0 : landmassGroups[i] + context.groupOffset,
        ruleSetKey: section.ruleSetKey
      });
      cumulativeAngle += sliceAngle;
    }
    if (context.totalGroupCount === 1) {
      for (let i = 0; i < totalLandmassCount; ++i) {
        if (positions[i].groupId > 0) {
          const offsetAngle = RandomImpl.fRand("Pinned center angle") * Math.PI * 2;
          const offsetDist = Math.sqrt(RandomImpl.fRand("Pinned center dist")) * 0.05;
          positions[i].x = 0.5 + Math.cos(offsetAngle) * offsetDist;
          positions[i].y = 0.5 + Math.sin(offsetAngle) * offsetDist;
          positions[i].pinned = true;
          break;
        }
      }
    }
    context.groupOffset += section.groupCount;
    return positions;
  }
  getSettingsConfig() {
    return this.m_baseSchema;
  }
}

export { UnifiedContinentsBase, unifiedContinentsSchema, unifiedSectionSchema };
//# sourceMappingURL=unified-continents-base.js.map

function lengthToT(lengths, targetLength, sampleCount) {
  let lo = 0;
  let hi = sampleCount;
  while (lo < hi) {
    const mid = lo + hi >> 1;
    if (lengths[mid] < targetLength) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  if (lo === 0) return 0;
  const segLen = lengths[lo] - lengths[lo - 1];
  const overshoot = segLen > 0 ? (targetLength - lengths[lo - 1]) / segLen : 0;
  return (lo - 1 + overshoot) / sampleCount;
}
function quadraticBezierPoint(p0x, p0y, cpx, cpy, p1x, p1y, t) {
  const inv = 1 - t;
  return {
    x: inv * inv * p0x + 2 * inv * t * cpx + t * t * p1x,
    y: inv * inv * p0y + 2 * inv * t * cpy + t * t * p1y
  };
}
function drawDashedQuadraticBezier(ctx, p0x, p0y, cpx, cpy, p1x, p1y, dashLength, gapLength) {
  const sampleCount = 200;
  let totalLength = 0;
  const lengths = [0];
  let prevPt = quadraticBezierPoint(p0x, p0y, cpx, cpy, p1x, p1y, 0);
  for (let i = 1; i <= sampleCount; i++) {
    const t = i / sampleCount;
    const pt = quadraticBezierPoint(p0x, p0y, cpx, cpy, p1x, p1y, t);
    const dx = pt.x - prevPt.x;
    const dy = pt.y - prevPt.y;
    totalLength += Math.sqrt(dx * dx + dy * dy);
    lengths.push(totalLength);
    prevPt = pt;
  }
  const patternLength = dashLength + gapLength;
  let isDash = true;
  let patternOffset = 0;
  while (patternOffset < totalLength) {
    const segEnd = Math.min(patternOffset + (isDash ? dashLength : gapLength), totalLength);
    if (isDash) {
      const tStart = lengthToT(lengths, patternOffset, sampleCount);
      const tEnd = lengthToT(lengths, segEnd, sampleCount);
      ctx.beginPath();
      const startPt = quadraticBezierPoint(p0x, p0y, cpx, cpy, p1x, p1y, tStart);
      ctx.moveTo(startPt.x, startPt.y);
      const dashSteps = Math.max(Math.ceil((tEnd - tStart) * sampleCount), 2);
      for (let i = 1; i <= dashSteps; i++) {
        const t = tStart + (tEnd - tStart) * (i / dashSteps);
        const pt = quadraticBezierPoint(p0x, p0y, cpx, cpy, p1x, p1y, t);
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
    }
    patternOffset = segEnd;
    if (patternOffset >= totalLength) break;
    if (patternOffset % patternLength < 1e-3 || Math.abs(patternOffset % patternLength - dashLength) < 1e-3) {
      isDash = !isDash;
    }
  }
}

export { drawDashedQuadraticBezier };
//# sourceMappingURL=canvas-utilities.js.map

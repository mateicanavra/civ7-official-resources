import { VoronoiUtils } from '../voronoi-utils.js';

class WindContextDesc {
  m_equatorialOffset = 0.05;
  m_latitudeCompression = 0.75;
  m_hadleyCellStrength = 0.3;
}
class WindContext {
  m_desc;
  constructor(desc) {
    this.m_desc = desc;
  }
  sampleLatLong(latDeg, lonDeg) {
    return this.sampleSigned(latDeg / 90, lonDeg / 180);
  }
  sampleUV(u, v) {
    return this.sampleSigned(2 * u - 1, 2 * v - 1);
  }
  sampleSigned(_x, y) {
    const pos = Math.abs(y);
    const offsetPos = this.m_desc.m_latitudeCompression * pos + this.m_desc.m_equatorialOffset;
    const tradeWinds = -VoronoiUtils.gaussian(offsetPos, 0.17, 0.1);
    const westerlies = VoronoiUtils.gaussian(offsetPos, 0.5, 0.1);
    const polar = -VoronoiUtils.gaussian(offsetPos, 0.83, 0.1);
    const east = tradeWinds + westerlies + polar;
    const north = Math.sign(east) * this.m_desc.m_hadleyCellStrength * Math.sin(Math.PI * this.m_desc.m_latitudeCompression * pos);
    return { x: east, y: north };
  }
}

export { WindContext, WindContextDesc };
//# sourceMappingURL=wind-context.js.map

import { Diagram } from '../../core/scripts/external/TypeScript-Voronoi-master/src/diagram.js';
import { WrapType, VoronoiUtils } from './voronoi-utils.js';

class VoronoiBuilder {
  m_diagram = new Diagram();
  m_diagramDims = { x: 0, y: 0 };
  m_wrap = WrapType.None;
  constructor() {
  }
  init(hexDims, cellCountMultiple, relaxationSteps, wrap = WrapType.None) {
    this.m_diagramDims = { x: hexDims.x * Math.sqrt(3) * 0.5, y: hexDims.y * 0.75 };
    this.m_wrap = wrap;
    const totalCells = hexDims.x * hexDims.y * cellCountMultiple;
    console.log("Initializing voronoi-builder");
    console.log("  Diagram dims: {x:" + this.m_diagramDims.x + ", y:" + this.m_diagramDims.y + "}");
    console.log("  Total cells: " + totalCells + ", relaxed " + relaxationSteps + " times.");
    this.buildVoronoi(this.m_diagramDims.x, this.m_diagramDims.y, totalCells, relaxationSteps, wrap);
    console.log("  voronoi built...");
  }
  getDiagram() {
    return this.m_diagram;
  }
  getDiagramDims() {
    return this.m_diagramDims;
  }
  buildVoronoi(width, height, cellCount, relaxationSteps, wrap = WrapType.None) {
    const bbox = { xl: 0, xr: width, yt: 0, yb: height };
    const sites = VoronoiUtils.createRandomSites(cellCount, width, height);
    this.m_diagram = VoronoiUtils.computeVoronoi(sites, bbox, relaxationSteps, wrap);
  }
}

export { VoronoiBuilder };
//# sourceMappingURL=voronoi-builder.js.map

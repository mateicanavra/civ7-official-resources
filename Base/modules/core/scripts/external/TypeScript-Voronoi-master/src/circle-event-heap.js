class CircleEventHeap {
  constructor(initialSize) {
    this.size = 0;
    initialSize = Math.max(1, initialSize);
    this.y = new Float64Array(initialSize);
    this.x = new Float64Array(initialSize);
    this.indices = new Uint32Array(initialSize);
  }
  push(y, x, index) {
    if (this.size >= this.y.length) {
      const newCap = this.y.length * 2;
      const newY = new Float64Array(newCap);
      const newX = new Float64Array(newCap);
      const newIndices = new Uint32Array(newCap);
      newY.set(this.y);
      newX.set(this.x);
      newIndices.set(this.indices);
      this.y = newY;
      this.x = newX;
      this.indices = newIndices;
    }
    this.y[this.size] = y;
    this.x[this.size] = x;
    this.indices[this.size] = index;
    this.bubbleUp(this.size);
    this.size++;
  }
  pop() {
    if (this.size === 0) return;
    --this.size;
    if (this.size > 0) {
      this.y[0] = this.y[this.size];
      this.x[0] = this.x[this.size];
      this.indices[0] = this.indices[this.size];
      this.bubbleDown(0);
    }
  }
  clear() {
    this.size = 0;
  }
  swap(i, j) {
    const ty = this.y[i];
    this.y[i] = this.y[j];
    this.y[j] = ty;
    const tx = this.x[i];
    this.x[i] = this.x[j];
    this.x[j] = tx;
    const ti = this.indices[i];
    this.indices[i] = this.indices[j];
    this.indices[j] = ti;
  }
  bubbleUp(index) {
    const y = this.y;
    const x = this.x;
    while (index > 0) {
      const parent = index - 1 >> 1;
      const yi = y[index], yp = y[parent];
      if (yi > yp || yi === yp && x[index] >= x[parent]) break;
      this.swap(index, parent);
      index = parent;
    }
  }
  bubbleDown(index) {
    const length = this.size;
    const y = this.y;
    const x = this.x;
    while (true) {
      const left = 2 * index + 1;
      const right = left + 1;
      let smallest = index;
      let ys = y[smallest];
      let xs = x[smallest];
      if (left < length) {
        const yl = y[left];
        if (yl < ys || yl === ys && x[left] < xs) {
          smallest = left;
          ys = yl;
          xs = x[left];
        }
      }
      if (right < length) {
        const yr = y[right];
        if (yr < ys || yr === ys && x[right] < xs) {
          smallest = right;
        }
      }
      if (smallest === index) break;
      this.swap(index, smallest);
      index = smallest;
    }
  }
}

export { CircleEventHeap };
//# sourceMappingURL=circle-event-heap.js.map

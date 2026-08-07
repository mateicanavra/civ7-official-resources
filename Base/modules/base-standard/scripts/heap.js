class Heap {
  constructor(compare) {
    this.compare = compare;
  }
  items = [];
  get size() {
    return this.items.length;
  }
  peek() {
    return this.items[0];
  }
  push(value) {
    this.items.push(value);
    this.bubbleUp(this.items.length - 1);
  }
  pop() {
    const top = this.items[0];
    const last = this.items.pop();
    if (this.items.length > 0) {
      this.items[0] = last;
      this.bubbleDown(0);
    }
    return top;
  }
  clear() {
    this.items = [];
  }
  bubbleUp(index) {
    while (index > 0) {
      const parent = index - 1 >> 1;
      if (this.compare(this.items[index], this.items[parent]) >= 0) break;
      [this.items[parent], this.items[index]] = [this.items[index], this.items[parent]];
      index = parent;
    }
  }
  bubbleDown(index) {
    const length = this.items.length;
    while (true) {
      const left = 2 * index + 1;
      const right = left + 1;
      let smallest = index;
      if (left < length && this.compare(this.items[left], this.items[smallest]) < 0) {
        smallest = left;
      }
      if (right < length && this.compare(this.items[right], this.items[smallest]) < 0) {
        smallest = right;
      }
      if (smallest === index) break;
      [this.items[index], this.items[smallest]] = [this.items[smallest], this.items[index]];
      index = smallest;
    }
  }
}
class IndexedMinHeap {
  m_vals;
  m_indices;
  m_size = 0;
  // The value of the most recently popped entry. Lets hot Dijkstra loops
  // avoid a paired peek()+pop() (two root reads) per iteration.
  lastVal = 0;
  constructor(initialSize) {
    initialSize = Math.max(1, initialSize);
    this.m_vals = new Float64Array(initialSize);
    this.m_indices = new Uint32Array(initialSize);
  }
  get size() {
    return this.m_size;
  }
  // Caller's responsibility to check size > 0 before calling
  peek() {
    return this.m_vals[0];
  }
  push(value, index) {
    if (this.m_size >= this.m_vals.length) {
      const newVals = new Float64Array(this.m_vals.length * 2);
      const newIndices = new Uint32Array(this.m_indices.length * 2);
      newVals.set(this.m_vals);
      newIndices.set(this.m_indices);
      this.m_vals = newVals;
      this.m_indices = newIndices;
    }
    this.m_vals[this.m_size] = value;
    this.m_indices[this.m_size] = index;
    this.bubbleUp(this.m_size);
    this.m_size++;
  }
  pop() {
    if (this.m_size === 0) return -1;
    this.lastVal = this.m_vals[0];
    const top = this.m_indices[0];
    --this.m_size;
    if (this.m_size > 0) {
      this.m_vals[0] = this.m_vals[this.m_size];
      this.m_indices[0] = this.m_indices[this.m_size];
      this.bubbleDown(0);
    }
    return top;
  }
  clear() {
    this.m_size = 0;
  }
  swap(i, j) {
    const tempVal = this.m_vals[i];
    this.m_vals[i] = this.m_vals[j];
    this.m_vals[j] = tempVal;
    const tempIndex = this.m_indices[i];
    this.m_indices[i] = this.m_indices[j];
    this.m_indices[j] = tempIndex;
  }
  bubbleUp(index) {
    while (index > 0) {
      const parent = index - 1 >> 1;
      if (this.m_vals[index] >= this.m_vals[parent]) break;
      this.swap(index, parent);
      index = parent;
    }
  }
  bubbleDown(index) {
    const length = this.m_size;
    while (true) {
      const left = 2 * index + 1;
      const right = left + 1;
      let smallest = index;
      if (left < length && this.m_vals[left] < this.m_vals[smallest]) {
        smallest = left;
      }
      if (right < length && this.m_vals[right] < this.m_vals[smallest]) {
        smallest = right;
      }
      if (smallest === index) break;
      this.swap(index, smallest);
      index = smallest;
    }
  }
}

export { Heap, IndexedMinHeap };
//# sourceMappingURL=heap.js.map

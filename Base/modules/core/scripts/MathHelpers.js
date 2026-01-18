function op2(a, b, op) {
  return { x: op(a.x, b.x), y: op(a.y, b.y) };
}
function op3(a, b, op) {
  return { x: op(a.x, b.x), y: op(a.y, b.y), z: op(a.z, b.z) };
}
function op4(a, b, op) {
  return { x: op(a.x, b.x), y: op(a.y, b.y), z: op(a.z, b.z), w: op(a.w, b.w) };
}
function op2s(a, b, op) {
  return { x: op(a.x, b), y: op(a.y, b) };
}
function op3s(a, b, op) {
  return { x: op(a.x, b), y: op(a.y, b), z: op(a.z, b) };
}
function op4s(a, b, op) {
  return { x: op(a.x, b), y: op(a.y, b), z: op(a.z, b), w: op(a.w, b) };
}
function neg2(a) {
  return { x: -a.x, y: -a.y };
}
function neg3(a) {
  return { x: -a.x, y: -a.y, z: -a.z };
}
function neg4(a) {
  return { x: -a.x, y: -a.y, z: -a.z, w: -a.w };
}
function add1(a, b) {
  return a + b;
}
function add2(a, b) {
  return op2(a, b, add1);
}
function add3(a, b) {
  return op3(a, b, add1);
}
function add4(a, b) {
  return op4(a, b, add1);
}
function sub1(a, b) {
  return a - b;
}
function sub2(a, b) {
  return op2(a, b, sub1);
}
function sub3(a, b) {
  return op3(a, b, sub1);
}
function sub4(a, b) {
  return op4(a, b, sub1);
}
function mul1(a, b) {
  return a * b;
}
function mul2(a, b) {
  return op2(a, b, mul1);
}
function mul3(a, b) {
  return op3(a, b, mul1);
}
function mul4(a, b) {
  return op4(a, b, mul1);
}
function mul2s(a, b) {
  return op2s(a, b, mul1);
}
function mul3s(a, b) {
  return op3s(a, b, mul1);
}
function mul4s(a, b) {
  return op4s(a, b, mul1);
}
function div1(a, b) {
  return a / b;
}
function div2(a, b) {
  return op2(a, b, div1);
}
function div3(a, b) {
  return op3(a, b, div1);
}
function div4(a, b) {
  return op4(a, b, div1);
}
function div2s(a, b) {
  return op2s(a, b, div1);
}
function div3s(a, b) {
  return op3s(a, b, div1);
}
function div4s(a, b) {
  return op4s(a, b, div1);
}
function length2(a) {
  return Math.sqrt(dot2(a, a));
}
function length3(a) {
  return Math.sqrt(dot3(a, a));
}
function length4(a) {
  return Math.sqrt(dot4(a, a));
}
function norm2(a) {
  return div2s(a, length2(a));
}
function norm3(a) {
  return div3s(a, length3(a));
}
function norm4(a) {
  return div4s(a, length4(a));
}
function dot2(a, b) {
  const mul = mul2(a, b);
  return mul.x + mul.y;
}
function dot2_90(a, b) {
  return a.y * b.x - a.x * b.y;
}
function dot3(a, b) {
  const mul = mul3(a, b);
  return mul.x + mul.y + mul.z;
}
function dot4(a, b) {
  const mul = mul4(a, b);
  return mul.x + mul.y + mul.z + mul.w;
}
function rotate2(a, radians) {
  const sincos = { x: Math.cos(radians), y: Math.sin(radians) };
  return { x: sincos.x * a.x - sincos.y * a.y, y: sincos.y * a.x + sincos.x * a.y };
}

export { add1, add2, add3, add4, div1, div2, div2s, div3, div3s, div4, div4s, dot2, dot2_90, dot3, dot4, length2, length3, length4, mul1, mul2, mul2s, mul3, mul3s, mul4, mul4s, neg2, neg3, neg4, norm2, norm3, norm4, op2, op2s, op3, op3s, op4, op4s, rotate2, sub1, sub2, sub3, sub4 };
//# sourceMappingURL=MathHelpers.js.map

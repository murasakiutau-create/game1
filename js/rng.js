// Seedable PRNG (mulberry32) for reproducibility across save/load.

export function makeRng(seed) {
  let s = (seed >>> 0) || 1;
  return {
    next() {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    int(min, maxInclusive) {
      return Math.floor(this.next() * (maxInclusive - min + 1)) + min;
    },
    chance(p) {
      return this.next() < p;
    },
    pick(arr) {
      return arr[Math.floor(this.next() * arr.length)];
    },
    weighted(entries) {
      // entries: [{w, v}, ...]
      const total = entries.reduce((s, e) => s + e.w, 0);
      let r = this.next() * total;
      for (const e of entries) {
        r -= e.w;
        if (r <= 0) return e.v;
      }
      return entries[entries.length - 1].v;
    },
    state() { return s; },
    setState(v) { s = (v >>> 0) || 1; },
  };
}

export function hashStringToSeed(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

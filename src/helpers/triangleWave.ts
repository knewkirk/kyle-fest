export const triangleWave = (x: number, p: number, a: number): number =>
  Math.abs(((((x - p / 4) % p) + p) % p) - p / 2) - a;

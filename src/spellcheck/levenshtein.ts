/**
 * Levenshtein edit distance with an early-exit cap. If the partial best in a
 * row exceeds `cap`, the function bails out with `cap + 1` instead of
 * completing the full DP table — useful for spell-check loops over many
 * candidates where most are far away from the input.
 */
export function levenshtein(a: string, b: string, cap: number): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > cap) return cap + 1;
  const n = a.length;
  const m = b.length;
  if (!n) return m;
  if (!m) return n;
  let prev = new Array<number>(m + 1);
  let curr = new Array<number>(m + 1);
  for (let j = 0; j <= m; j++) prev[j] = j;
  for (let i = 1; i <= n; i++) {
    curr[0] = i;
    let rowMin = i;
    for (let j = 1; j <= m; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const ins = (prev[j] ?? 0) + 1;
      const del = (curr[j - 1] ?? 0) + 1;
      const sub = (prev[j - 1] ?? 0) + cost;
      const val = Math.min(ins, del, sub);
      curr[j] = val;
      if (val < rowMin) rowMin = val;
    }
    if (rowMin > cap) return cap + 1;
    [prev, curr] = [curr, prev];
  }
  return prev[m] ?? 0;
}

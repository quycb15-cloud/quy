const AREA_SCALE = 100;
const FLOATING_POINT_GUARD = 1e-9;

export function truncateAreaHa(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.trunc((value + FLOATING_POINT_GUARD) * AREA_SCALE) / AREA_SCALE;
}

export function sumAreaHa(values: ReadonlyArray<number | string | null | undefined>): number {
  let total = 0;
  values.forEach(value => {
    const parsed = Number(value ?? 0);
    if (Number.isFinite(parsed)) total += parsed;
  });
  return truncateAreaHa(total);
}

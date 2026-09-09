export type DuplicateKey = string;

export function assertNoDuplicateRows<T>(
  rows: readonly T[],
  keyOf: (row: T) => DuplicateKey,
  label: string,
) {
  const firstRowByKey = new Map<DuplicateKey, number>();
  const duplicates: Array<{ key: string; firstRow: number; duplicateRow: number }> = [];

  rows.forEach((row, index) => {
    const key = keyOf(row);
    const first = firstRowByKey.get(key);
    if (first !== undefined) {
      duplicates.push({ key, firstRow: first + 1, duplicateRow: index + 1 });
    } else {
      firstRowByKey.set(key, index);
    }
  });

  if (duplicates.length) {
    const preview = duplicates
      .slice(0, 5)
      .map(item => `${label} ${item.key} (dòng ${item.firstRow} và ${item.duplicateRow})`)
      .join('; ');
    throw new Error(`Tệp có dữ liệu trùng: ${preview}`);
  }
}

export const normalizeDedupText = (value: string | null | undefined) =>
  String(value ?? "").trim().toLocaleLowerCase("vi-VN");

export const dedupDate = (value: Date | string) => new Date(value).toISOString().slice(0, 10);

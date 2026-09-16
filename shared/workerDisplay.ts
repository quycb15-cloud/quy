export type WorkerDisplayRecord = {
  employeeCode?: string | null;
  phoneticName?: string | null;
  name?: string | null;
};

export function workerDisplayName(worker: WorkerDisplayRecord) {
  return worker.phoneticName?.trim() || worker.name?.trim() || "Chưa có tên phiên âm";
}

function tokenizeCode(value: string) {
  return value.trim().toLocaleUpperCase("vi").match(/\d+|\D+/g) ?? [];
}

export function compareEmployeeCode(a: string | null | undefined, b: string | null | undefined) {
  const left = a?.trim() ?? "";
  const right = b?.trim() ?? "";
  if (!left && !right) return 0;
  if (!left) return 1;
  if (!right) return -1;
  const leftTokens = tokenizeCode(left);
  const rightTokens = tokenizeCode(right);
  for (let index = 0; index < Math.max(leftTokens.length, rightTokens.length); index += 1) {
    const leftToken = leftTokens[index] ?? "";
    const rightToken = rightTokens[index] ?? "";
    if (leftToken === rightToken) continue;
    const leftNumber = /^\d+$/.test(leftToken);
    const rightNumber = /^\d+$/.test(rightToken);
    if (leftNumber && rightNumber) {
      const difference = Number(leftToken) - Number(rightToken);
      if (difference !== 0) return difference;
    } else if (leftNumber !== rightNumber) {
      return leftNumber ? -1 : 1;
    } else {
      const difference = leftToken.localeCompare(rightToken, "vi");
      if (difference !== 0) return difference;
    }
  }
  return left.localeCompare(right, "vi");
}

export function compareWorkersByCode<T extends WorkerDisplayRecord>(a: T, b: T) {
  return compareEmployeeCode(a.employeeCode, b.employeeCode) || workerDisplayName(a).localeCompare(workerDisplayName(b), "vi");
}

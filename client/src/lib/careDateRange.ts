export type DatedCareRecord = { activityDate: Date | string };

export function careDateKey(value: Date | string) {
  return new Date(value).toISOString().slice(0, 10);
}

export function latestCareDate<T extends DatedCareRecord>(records: T[]) {
  return records.reduce<string | undefined>((latest, record) => {
    const key = careDateKey(record.activityDate);
    return !latest || key > latest ? key : latest;
  }, undefined);
}

export function filterCareRecordsByDateRange<T extends DatedCareRecord>(records: T[], fromDate?: string, toDate?: string) {
  return records.filter(record => {
    const key = careDateKey(record.activityDate);
    return (!fromDate || key >= fromDate) && (!toDate || key <= toDate);
  });
}

export type DatedCareRecord = { activityDate: Date | string };

const VIETNAM_TIME_ZONE = "Asia/Ho_Chi_Minh";
const vietnamDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: VIETNAM_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function fromParts(year: number, month: number, day: number) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** Khóa ngày nghiệp vụ theo múi giờ Việt Nam, không phụ thuộc múi giờ thiết bị. */
export function careDateKey(value: Date | string) {
  const parts = vietnamDateFormatter.formatToParts(new Date(value));
  const lookup = new Map(parts.map(part => [part.type, part.value]));
  return fromParts(Number(lookup.get("year")), Number(lookup.get("month")), Number(lookup.get("day")));
}

/** Tạo timestamp 00:00 Việt Nam cho ngày nhập YYYY-MM-DD. */
export function careDateFromKey(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) throw new Error("Ngày nghiệp vụ không hợp lệ");
  return new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00+07:00`);
}

export function formatCareDate(value: Date | string) {
  const [year, month, day] = careDateKey(value).split("-");
  return `${Number(day)}/${Number(month)}/${year}`;
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

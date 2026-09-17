import { describe, expect, it } from "vitest";
import { compareCareRecordRows } from "./careRecordOrdering";

describe("compareCareRecordRows", () => {
  it("groups the same work content across teams before the next work content", () => {
    const rows = [
      { id: 4, activityDate: "2026-09-03", unit: "Đội 2", workContent: "Chặt chồi thân gỗ, làm cỏ, băm chồi" },
      { id: 1, activityDate: "2026-09-03", unit: "Đội 1", workContent: "Gia cố keo" },
      { id: 3, activityDate: "2026-09-03", unit: "Đội 3", workContent: "Gia cố keo" },
      { id: 2, activityDate: "2026-09-03", unit: "Đội 1", workContent: "Chặt chồi thân gỗ, làm cỏ, băm chồi" },
      { id: 5, activityDate: "2026-09-03", unit: "Đội 2", workContent: "Gia cố keo" },
    ];

    expect(rows.sort(compareCareRecordRows).map(row => `${row.workContent}|${row.unit}`)).toEqual([
      "Gia cố keo|Đội 1",
      "Gia cố keo|Đội 2",
      "Gia cố keo|Đội 3",
      "Chặt chồi thân gỗ, làm cỏ, băm chồi|Đội 1",
      "Chặt chồi thân gỗ, làm cỏ, băm chồi|Đội 2",
    ]);
  });

  it("keeps the newest date first", () => {
    const rows = [
      { id: 1, activityDate: "2026-09-02", unit: "Đội 1", workContent: "Gia cố keo" },
      { id: 2, activityDate: "2026-09-03", unit: "Đội 1", workContent: "Gia cố keo" },
    ];

    expect(rows.sort(compareCareRecordRows).map(row => row.activityDate)).toEqual([
      "2026-09-03",
      "2026-09-02",
    ]);
  });
});

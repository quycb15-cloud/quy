import { compareTeamName } from "@shared/teamOrder";

const WORK_CONTENT_PRIORITY = [
  "gia cố keo",
  "chặt chồi thân gỗ, làm cỏ, băm chồi",
];

export type CareRecordOrderInput = {
  activityDate: Date | string | number;
  workContent?: string | null;
  unit: string;
  gardenName?: string | null;
  id?: number;
};

/**
 * Sắp xếp bảng theo ngày mới nhất, sau đó gom cùng nội dung công việc
 * và mới sắp Đội 1 → Đội 6. Nhờ vậy người dùng theo dõi trọn một
 * công việc qua các Đội trước khi chuyển sang công việc tiếp theo.
 */
export function compareCareRecordRows(left: CareRecordOrderInput, right: CareRecordOrderInput) {
  const dateOrder = new Date(right.activityDate).getTime() - new Date(left.activityDate).getTime();
  if (dateOrder) return dateOrder;

  const leftWorkContent = (left.workContent ?? "").trim();
  const rightWorkContent = (right.workContent ?? "").trim();
  const leftPriority = WORK_CONTENT_PRIORITY.indexOf(leftWorkContent.toLocaleLowerCase("vi-VN"));
  const rightPriority = WORK_CONTENT_PRIORITY.indexOf(rightWorkContent.toLocaleLowerCase("vi-VN"));
  const workContentOrder = (leftPriority < 0 ? WORK_CONTENT_PRIORITY.length : leftPriority) - (rightPriority < 0 ? WORK_CONTENT_PRIORITY.length : rightPriority)
    || leftWorkContent.localeCompare(rightWorkContent, "vi", { numeric: true, sensitivity: "base" });
  if (workContentOrder) return workContentOrder;

  const teamOrder = compareTeamName(left.unit, right.unit);
  if (teamOrder) return teamOrder;

  const gardenOrder = (left.gardenName ?? "").localeCompare(right.gardenName ?? "", "vi", {
    numeric: true,
    sensitivity: "base",
  });
  if (gardenOrder) return gardenOrder;

  return (left.id ?? 0) - (right.id ?? 0);
}

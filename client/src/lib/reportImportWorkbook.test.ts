import { describe, expect, it } from "vitest";
import {
  buildProductionPlanTemplateMatrix,
  buildTechnicalSkillTemplateMatrix,
  parseProductionPlanMatrix,
  parseTechnicalSkillMatrix,
  productionPlanMerges,
  technicalSkillMerges,
} from "./reportImportWorkbook";

describe("report import workbooks", () => {
  it("tạo mẫu kế hoạch đúng bố cục file thật", () => {
    const matrix = buildProductionPlanTemplateMatrix();
    expect(matrix[0]).toEqual(["TT", "Đơn vị", "Kế hoạch năm", "Kế hoạch tháng", "Kế hoạch Giao Sản lượng", "", "", "", "Ghi chú"]);
    expect(productionPlanMerges).toContain("E1:H1");
    expect(productionPlanMerges).toContain("G2:H2");
  });

  it("đọc kế hoạch năm/tháng và cộng hai nguồn quy khô", () => {
    const result = parseProductionPlanMatrix([
      ["TT", "Đơn vị", "Kế hoạch năm", "Kế hoạch tháng", "Kế hoạch Giao Sản lượng", "", "", "", "Ghi chú"],
      ["", "", "", "", "Mủ đông, tạp", "", "Mủ quy khô", "", ""],
      ["", "", "", "", "Kế hoạch Mủ đông, tạp (kg)", "Kế hoạch Mủ dây (kg)", "Kế hoạch từ mủ đông, tạp (kg)", "Kế hoạch từ mủ dây (kg)", ""],
      [1, "Đội 1", 2026, 8, "50.524", 17, 25262, "=F4/2", ""],
    ]);
    expect(result.issues).toEqual([]);
    expect(result.rows[0]).toMatchObject({ unit: "Đội 1", year: 2026, month: 8, planFrozenLatex: 50524, planThreadLatex: 17, planDryRubber: 25270.5 });
  });

  it("vẫn đọc mẫu kế hoạch cũ có cột Năm/Tháng riêng", () => {
    const result = parseProductionPlanMatrix([
      ["TT", "Đơn vị", "Năm", "Tháng", "ĐVT", "Diện tích", "Sản lượng"],
      [],
      ["", "", "", "", "", "", "Kế hoạch"],
      [1, "Đội 1", 2026, 0, "ha", "283,13", "842.071", "", "", "421.036"],
    ]);
    expect(result.issues).toEqual([]);
    expect(result.rows[0]).toMatchObject({ unit: "Đội 1", year: 2026, month: 0, areaHa: 283.13, planFrozenLatex: 842071 });
  });

  it("đọc mẫu tay nghề thật với ngày báo cáo và Hao dăm tháng hiện tại", () => {
    const result = parseTechnicalSkillMatrix([
      ["TT", "Nội dung", "Tháng/năm báo cáo", "Quân số", "Loại tay nghề"],
      ["", "", "", "", "Xuất sắc"],
      ["", "", "", "", "Số thợ"],
      [1, "Đội 1", new Date("2026-08-31"), 57, "", "", 13, 22.81, 40, 70.18, 4, 7.02, 0, 0, 93, 3, 42, 73.68, 37, 5, 13.51, "", "", ""],
    ]);
    expect(result.issues).toEqual([]);
    expect(result.rows[0]).toMatchObject({ unit: "Đội 1", monthKey: "2026-08", workerCount: 57, goodCount: 13, fairCount: 40, haoDamWorkers: 42, previousHaoDamWorkers: 37, haoDamChangeWorkers: 5 });
    const serialDate = parseTechnicalSkillMatrix([
      ["TT", "Nội dung", "Tháng/năm báo cáo", "Quân số", "Loại tay nghề"], [], [],
      [1, "Đội 1", 46265, 57, 0, 0, 13, 0, 40, 0, 4, 0, 0, 0, 93, 3, 42, 73.68, 37, 5, 13.51, "", "", ""],
    ]);
    expect(serialDate.rows[0]?.monthKey).toBe("2026-08");
    const slashMonth = parseTechnicalSkillMatrix([
      ["TT", "Nội dung", "Tháng/năm báo cáo", "Quân số"], [], [],
      [1, "Đội 1", "08/2026", 57, 0, 0, 13, 0, 40, 0, 4, 0, 0, 0, 93, 3, 42, 73.68, 37, 5, 13.51, "", "", ""],
    ]);
    expect(slashMonth.issues).toEqual([]);
    expect(slashMonth.rows[0]?.monthKey).toBe("2026-08");
  });

  it("từ chối tổng số cấp tay nghề vượt quân số", () => {
    const invalid = parseTechnicalSkillMatrix([
      ["TT", "Nội dung", "Tháng/năm báo cáo", "Quân số", "Loại tay nghề"],
      [],
      [],
      [1, "Đội 1", new Date("2026-08-31"), 2, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0],
    ]);
    expect(invalid.rows).toHaveLength(0);
    expect(invalid.issues[0]).toContain("không vượt quân số");
    expect(technicalSkillMerges).toContain("Q1:U1");
    expect(technicalSkillMerges).toContain("T2:U2");
  });
});

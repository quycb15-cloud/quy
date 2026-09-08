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
  it("creates the production plan template with grouped headers and annual/monthly fields", () => {
    const matrix = buildProductionPlanTemplateMatrix();
    expect(matrix[0]).toContain("Đơn vị");
    expect(matrix[0]).toContain("Năm");
    expect(matrix[0]).toContain("Tháng");
    expect(productionPlanMerges).toContain("G1:L1");
  });

  it("parses a production plan row", () => {
    const result = parseProductionPlanMatrix([
      ["TT", "Đơn vị", "Năm", "Tháng", "ĐVT", "Diện tích", "Sản lượng"],
      [],
      ["", "", "", "", "", "", "Kế hoạch"],
      [1, "Đội 1", 2026, 0, "ha", "283,13", "842.071", "", "", "421.036"],
    ]);
    expect(result.issues).toEqual([]);
    expect(result.rows[0]).toMatchObject({ unit: "Đội 1", year: 2026, month: 0, areaHa: 283.13, planFrozenLatex: 842071 });
  });

  it("parses skill and hao dam counts and rejects over-allocation", () => {
    const valid = parseTechnicalSkillMatrix([
      ["TT", "Nội dung", "Tháng báo cáo", "Quân số", "Loại tay nghề"],
      ["", "", "", "", "Xuất sắc"],
      ["", "", "", "", "Số thợ"],
      [1, "Đội 1", "2026-08", 57, 0, 0, 13, 0, 40, 0, 4, 0, 93, 3, 42, 73.68, 37, 5, ""],
    ]);
    expect(valid.issues).toEqual([]);
    expect(valid.rows[0]).toMatchObject({ unit: "Đội 1", monthKey: "2026-08", workerCount: 57, goodCount: 13, fairCount: 40, haoDamWorkers: 42 });
    const invalid = parseTechnicalSkillMatrix([
      ["TT", "Nội dung", "Tháng báo cáo", "Quân số", "Loại tay nghề"],
      [],
      [],
      [1, "Đội 1", "2026-08", 2, 2, 0, 2, 0, 0, 0, 0, 0],
    ]);
    expect(invalid.rows).toHaveLength(0);
    expect(invalid.issues[0]).toContain("không vượt quân số");
    expect(technicalSkillMerges).toContain("O1:R1");
  });
});

import { describe, expect, it } from "vitest";
import { filterGuideChapters, normalizeGuideSearch } from "./userGuideSearch";

const chapters = [
  { title: "Cài phần mềm trên điện thoại", summary: "Android và iPhone", keywords: "cài đặt pwa", steps: ["Thêm vào màn hình chính"] },
  { title: "Import và export Excel", summary: "Tải mẫu", keywords: "dòng lỗi sheet", steps: ["Kiểm tra trước khi nhập"] },
];

describe("user guide search", () => {
  it("tìm được nội dung tiếng Việt khi người dùng gõ không dấu", () => {
    expect(filterGuideChapters(chapters, "cai dien thoai").map(chapter => chapter.title)).toEqual(["Cài phần mềm trên điện thoại"]);
  });

  it("tìm theo từ khóa chi tiết và trả toàn bộ khi truy vấn rỗng", () => {
    expect(filterGuideChapters(chapters, "dong loi").map(chapter => chapter.title)).toEqual(["Import và export Excel"]);
    expect(filterGuideChapters(chapters, "")).toHaveLength(2);
  });

  it("chuẩn hóa chữ đ và dấu tiếng Việt", () => {
    expect(normalizeGuideSearch("Đợt — Đội")).toBe("dot — doi");
  });
});

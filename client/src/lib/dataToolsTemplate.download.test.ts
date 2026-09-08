import { describe, expect, it, afterEach } from "vitest";
import * as XLSX from "xlsx";
import { createImportTemplateWorkbook, downloadWorkbookFile } from "./dataToolsTemplate";

const labels = { plots: "Vườn / lô", plotIndicators: "Chỉ số cây định kỳ", workers: "Nhân công", teamImports: "Nhập mủ theo đội", teamExports: "Xuất mủ theo đội", workerPlotAllocations: "Phân chia nhân công vườn cây", productionPlans: "Kế hoạch sản lượng tháng/năm", technicalSkillMonthly: "Tổng hợp tay nghề và hao dăm" } as const;
const samples = Object.fromEntries(Object.keys(labels).map(key => [key, { Mẫu: "" }])) as typeof labels extends Record<infer K, string> ? Record<K, Record<string, string | number>> : never;

const originalDocument = globalThis.document;
const originalWindow = globalThis.window;
const originalUrl = globalThis.URL;

afterEach(() => {
  Object.defineProperty(globalThis, "document", { value: originalDocument, configurable: true });
  Object.defineProperty(globalThis, "window", { value: originalWindow, configurable: true });
  Object.defineProperty(globalThis, "URL", { value: originalUrl, configurable: true });
});

describe("downloadWorkbookFile", () => {
  it.each(["plots", "productionPlans"] as const)("tải được mẫu %s qua Blob và link tải", dataset => {
    const { book, fileName } = createImportTemplateWorkbook(XLSX, dataset, labels, samples);
    const clicks: string[] = [];
    const anchor = { href: "", download: "", rel: "", click: () => clicks.push("clicked"), remove: () => undefined };
    Object.defineProperty(globalThis, "document", { configurable: true, value: { createElement: () => anchor, body: { appendChild: () => undefined } } });
    Object.defineProperty(globalThis, "window", { configurable: true, value: { setTimeout } });
    Object.defineProperty(globalThis, "URL", { configurable: true, value: { createObjectURL: () => "blob:template", revokeObjectURL: () => undefined } });

    downloadWorkbookFile({ write: () => new Uint8Array([1, 2, 3]) }, book, fileName);

    expect(anchor.download).toBe(fileName);
    expect(anchor.href).toBe("blob:template");
    expect(clicks).toEqual(["clicked"]);
  });
});

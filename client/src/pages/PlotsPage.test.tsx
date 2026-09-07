import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { GardenPlotGroups } from "./PlotsPage";
import PlotAllocationList from "@/components/PlotAllocationList";

describe("GardenPlotGroups allocation rendering", () => {
  it("renders one plot in each garden group with its allocated area", () => {
    const markup = renderToStaticMarkup(
      <GardenPlotGroups
        plots={[
          {
            id: 144,
            unit: "Đội 4",
            name: "7",
            code: "LO-DOI-4-2013-7",
            plantedYear: 2013,
            areaHa: 6.37,
            gardenType: null,
            tappingTrees: 3191,
            gardenAllocations: [
              { id: 1, gardenType: "A", areaHa: 4.52, tappingTrees: 2260 },
              { id: 2, gardenType: "B", areaHa: 1.81, tappingTrees: 931 },
            ],
            remainingAreaHa: 0.04,
            remainingTappingTrees: 0,
          } as any,
        ]}
        isAdmin={false}
        onEdit={vi.fn()}
        onAllocate={vi.fn()}
        onDelete={vi.fn()}
        deleting={false}
      />,
    );

    expect(markup).toContain("7 (2013)");
    expect(markup).toContain("Vườn A");
    expect(markup).toContain("Vườn B");
    expect(markup).toContain("4,52 ha");
    expect(markup).toContain("1,81 ha");
    expect(markup).toContain("2.260 cây");
    expect(markup).toContain("931 cây");
  });

  it("renders edit and remove actions for each allocation", () => {
    const onEdit = vi.fn();
    const onRemove = vi.fn();
    const markup = renderToStaticMarkup(<PlotAllocationList allocations={[{ id: 1, gardenType: "A", areaHa: 4.52, tappingTrees: 2260 }, { id: 2, gardenType: "B", areaHa: 1.81, tappingTrees: 931 }]} onEdit={onEdit} onRemove={onRemove} />);
    expect(markup).toContain("Vườn A");
    expect(markup).toContain("Vườn B");
    expect(markup).toContain("Sửa");
    expect(markup).toContain("Xóa");
  });
});

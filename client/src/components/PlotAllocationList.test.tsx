// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import PlotAllocationList, { type AllocationListItem } from "./PlotAllocationList";

const allocations: AllocationListItem[] = [
  { id: 41, gardenType: "A", areaHa: 4.52, tappingTrees: 2260 },
  { id: 42, gardenType: "B", areaHa: 1.81, tappingTrees: 931 },
];

describe("PlotAllocationList interactions", () => {
  afterEach(() => cleanup());
  it("passes the selected allocation to the edit callback", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<PlotAllocationList allocations={allocations} onEdit={onEdit} onRemove={vi.fn()} />);

    await user.click(screen.getAllByRole("button", { name: "Sửa" })[1]);

    expect(onEdit).toHaveBeenCalledWith(allocations[1]);
  });

  it("passes the selected allocation to the remove callback", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<PlotAllocationList allocations={allocations} onEdit={vi.fn()} onRemove={onRemove} />);

    await user.click(screen.getAllByRole("button", { name: "Xóa" })[0]);

    expect(onRemove).toHaveBeenCalledWith(allocations[0]);
  });
});

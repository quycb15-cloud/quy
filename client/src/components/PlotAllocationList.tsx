import React from "react";
import { Button } from "@/components/ui/button";
import { formatAreaHa as formatQuantity } from "@/lib/rubber";

export type AllocationListItem = {
  id: number;
  gardenType: "A" | "B" | "C";
  areaHa: number;
  tappingTrees: number;
};

type PlotAllocationListProps = {
  allocations: AllocationListItem[];
  onEdit: (item: AllocationListItem) => void;
  onRemove: (item: AllocationListItem) => void;
  removing?: boolean;
};

export default function PlotAllocationList({ allocations, onEdit, onRemove, removing = false }: PlotAllocationListProps) {
  if (!allocations.length) return <p className="mt-3 text-sm text-emerald-800">Chưa có phần nào được phân bổ.</p>;
  return (
    <div className="mt-3 space-y-2" aria-label="Các phần phân bổ của Lô">
      {allocations.map(item => (
        <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700">
          <span>Vườn {item.gardenType}: {formatQuantity(item.areaHa)} ha · {item.tappingTrees.toLocaleString("vi-VN")} cây</span>
          <span className="flex gap-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(item)}>Sửa</Button>
            <Button type="button" variant="ghost" size="sm" className="text-red-700 hover:text-red-800" disabled={removing} onClick={() => onRemove(item)}>Xóa</Button>
          </span>
        </div>
      ))}
    </div>
  );
}

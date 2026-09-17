import * as XLSX from "xlsx";
import { readFileSync } from "node:fs";
import { parseCareWorkbook } from "../client/src/lib/careExcel";

const path = "/home/ubuntu/upload/coord_signal_response/VqqcDNFbm9mRHLM4Zi2Pw8/Tong_hop_so_lieu_hang_ngay_2026.xlsx";
const workbook = XLSX.read(readFileSync(path), { cellDates: true });
const rows = parseCareWorkbook(workbook, "tapping", XLSX);
console.log(JSON.stringify({ count: rows.length, rows: rows.map(row => ({ sourceRow: row.sourceRow, unit: row.unit, gardenName: row.gardenName, planQuantity: row.planQuantity, actualQuantity: row.actualQuantity, pendingGardens: row.pendingGardens, partialGardens: row.partialGardens })) }, null, 2));

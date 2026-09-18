# Báo cáo nghiên cứu thiết kế biểu đồ Phân tích sản lượng

## Kết luận

Đề xuất của người dùng là phù hợp và có thể triển khai mà không cần thay đổi cấu trúc cơ sở dữ liệu. Nguyên nhân hai số liệu hiện giống nhau nằm ở tầng tổng hợp dashboard: `totalProduction` đang được gán bằng tổng Nhập, còn `monthlyProduction` chỉ được tạo từ các bản ghi Nhập. Vì vậy, biểu đồ hiện chỉ có một chuỗi dữ liệu và hai thẻ đang hiển thị cùng một giá trị.

Thiết kế mới nên dùng ba chuỗi số liệu độc lập theo cùng một trục tháng. **Sản lượng tổng** màu xanh lá là tổng Nhập. **Sản lượng All** màu xanh da trời là tổng Xuất khi bộ lọc Đợt là All. **Hao kho** màu đỏ là chênh lệch khối lượng giữa Nhập và Xuất. Cách tính được thống nhất với báo cáo hao hụt kho hiện có.

## Phát hiện hiện trạng

Trong `getDashboard`, hệ thống đã có sẵn hai tập dữ liệu sau khi lọc theo năm, tháng, đợt và phạm vi Đội: `selectedImports` và `selectedExports`. Tổng Nhập được cộng từ `row.totalImport`, còn Tổng Xuất được cộng từ `row.totalExport`.

Tuy nhiên, `totalProduction` hiện được tính lại từ `selectedImports`, nên bằng đúng Tổng Nhập. Chuỗi `monthlyProduction` cũng chỉ nhóm `selectedImports` theo tháng và trả về `{ label, value }`. Component hiện tại chỉ vẽ một đường Recharts với `dataKey="value"`. Đây là nguyên nhân trực tiếp khiến biểu đồ chưa thể hiện Xuất và Hao kho.

Báo cáo hao hụt kho hiện đã sử dụng công thức khối lượng `lossKg = totalImport - totalExport` và tỷ lệ `lossPercent = lossKg / totalImport × 100%`. Vì yêu cầu biểu đồ cần ba đường biến động theo số liệu thực tế, đường Hao kho nên dùng **kg**, còn tỷ lệ % có thể hiển thị trong thẻ tóm tắt hoặc tooltip phụ.

## Thiết kế được đề xuất

### Khu vực thẻ tóm tắt

| Thẻ | Màu | Giá trị chính | Đơn vị | Công thức |
|---|---|---:|---|---|
| Sản lượng tổng | Xanh lá | Tổng Nhập trong phạm vi đang lọc | kg | `Σ totalImport` |
| Sản lượng All | Xanh da trời | Tổng Xuất trong phạm vi đang lọc | kg | `Σ totalExport` |
| Hao kho | Đỏ | Chênh lệch Nhập − Xuất | kg | `Σ totalImport − Σ totalExport` |

Nên đổi phần mô tả của khối thành “Nhập, Xuất và Hao kho theo tháng trong phạm vi đang xem”. Khi Hao kho âm, vẫn giữ số âm để phản ánh đúng dữ liệu nguồn và cảnh báo tình trạng Xuất lớn hơn Nhập; không dùng `Math.max(0, ...)` vì sẽ làm mất thông tin cân đối.

### Biểu đồ đường

Biểu đồ giữ dạng đường theo tháng và có ba đường độc lập:

- **Sản lượng tổng**: xanh lá, `dataKey="totalImport"`.
- **Sản lượng All**: xanh da trời, `dataKey="totalExport"`.
- **Hao kho**: đỏ, `dataKey="warehouseLoss"`.

Mỗi điểm dữ liệu có dạng `{ label, totalImport, totalExport, warehouseLoss }`. Tập tháng là hợp nhất các tháng có dữ liệu Nhập hoặc Xuất trong phạm vi lọc. Tháng không có dữ liệu ở cả hai nguồn không hiển thị. Giá trị thiếu ở một nguồn trong tháng có nguồn còn lại được coi là `0`, tránh nối sai hoặc làm mất tháng.

Tooltip cần hiển thị đủ ba dòng với đơn vị kg và độ chính xác nguồn. Chú giải màu đặt ngay phía trên hoặc trong vùng biểu đồ để người dùng nhận diện nhanh. Trục tung dùng cùng đơn vị kg cho cả ba đường. Nếu có Hao kho âm, Recharts phải cho phép trục tung mở rộng xuống dưới 0.

### Bộ lọc Đợt

Khi Đợt là **All**, ba chuỗi được cộng từ tất cả Đợt phù hợp với Năm, Tháng và phạm vi Đội. Khi chọn một Đợt cụ thể, cùng thiết kế vẫn dùng được nhưng cả ba chuỗi chỉ lấy bản ghi của Đợt đó. Như vậy biểu đồ không thay đổi cấu trúc khi người dùng chuyển bộ lọc và luôn so sánh cùng một phạm vi dữ liệu.

## Phạm vi triển khai sau khi được duyệt

Tầng server sẽ mở rộng dữ liệu `monthlyProduction` thành ba giá trị theo tháng, đồng thời trả thêm tổng Hao kho khối lượng cho dashboard. Tầng giao diện sẽ thay hai thẻ cũ bằng ba thẻ màu xanh lá, xanh da trời và đỏ; thay đường biểu đồ đơn bằng ba đường; cập nhật tooltip, chú giải, trạng thái rỗng và mô tả công thức.

Regression test sẽ kiểm tra rằng Tổng Nhập và Tổng Xuất không còn dùng chung giá trị, Hao kho bằng Nhập trừ Xuất theo từng tháng, bộ lọc All cộng đủ các Đợt, và tháng chỉ có Xuất vẫn xuất hiện với Nhập bằng 0. Sau đó mới chạy typecheck, toàn bộ test, production build, kiểm tra responsive và lưu checkpoint **chưa publish**.

## Quyết định cần xác nhận

Phương án trên dùng Hao kho dạng **kg có dấu** theo công thức `Nhập − Xuất`, đồng thời giữ tỷ lệ Hao kho % ở các khu vực báo cáo hiện có. Nếu người dùng muốn đường Hao kho chỉ hiển thị số dương hoặc muốn dùng tỷ lệ % thay cho kg, công thức và trục biểu đồ sẽ cần điều chỉnh khác.

## Tài liệu tham chiếu nội bộ

- Hàm dashboard: `server/db.ts`, `getDashboard`.
- Công thức hao kho: `server/warehouseLossMath.ts`, `aggregateWarehouseLoss`.
- Component giao diện: `client/src/pages/Home.tsx`, khối `Phân tích sản lượng`.
- Công thức tỷ lệ tổng hợp: `server/rubberMath.ts`, `calculateLatexTotals`.

## References

[1]: https://recharts.org/en-US/api/LineChart "Recharts LineChart API"

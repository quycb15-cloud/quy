# Ghi nhận kiểm tra sort danh sách Lô

Ngày kiểm tra: 2026-09-05

Đã chụp trang `/plots` trên preview WebDev sau khi cập nhật `comparePlotsByYearAndName`. Trang Quản lý vườn tải đúng layout, mục Vườn được chọn và không có lỗi TypeScript/LSP; danh sách đang chờ phản hồi dữ liệu trong preview nên việc kiểm chứng thứ tự dữ liệu được thực hiện bằng 5 test comparator.

Quy tắc đã được kiểm chứng bằng test: ưu tiên `plantedYear` tăng dần; trong cùng năm, số thuần đứng theo số tự nhiên, hậu tố chữ đứng liền sau số tương ứng (14, 14A, 14B), hậu tố dạng 3-2012/4-2012 đứng sau nhóm tên thông thường; các Lô trùng tên được phân theo năm trồng trước.

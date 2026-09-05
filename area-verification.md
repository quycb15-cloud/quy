# Ghi nhận kiểm tra Tổng diện tích

Ngày kiểm tra: 2026-09-05.

Đã mở route `/` trên preview sau khi server restart. Trang tải đúng skeleton loading nhưng chưa hiển thị dữ liệu dashboard trong ảnh kiểm tra, vì vậy chưa thể xác nhận trực quan con số trên thẻ. Database đã xác nhận `SUM(areaHa)=1582.715`, `ROUND(...,2)=1582.72`, `TRUNCATE(...,2)=1582.71`; code đã đổi getDashboard.totalArea sang sumAreaHa để áp dụng giá trị 1582.71.

Kiểm tra lần hai sau build vẫn hiển thị skeleton trên preview, không có dữ liệu dashboard do phiên preview chưa đăng nhập. Vì vậy không đánh dấu xác minh trực quan hoàn tất; test database/tRPC và build là bằng chứng chính cho thay đổi.

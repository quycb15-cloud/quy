# Kiểm tra giao diện Hướng dẫn sử dụng

Lượt chụp desktop đầu tiên dừng ở skeleton do phiên preview chưa hoàn tất tải tài khoản và lazy route, không phải lỗi build. Lượt chụp mobile ngay sau đó hiển thị đầy đủ menu tiêu đề “Hướng dẫn sử dụng”, banner cài ứng dụng, tiêu đề trang, nút “Tải hướng dẫn PDF”, hero cẩm nang, nút “Mở PDF”, “Tải bộ ZIP”, “Cài ứng dụng” và ô tìm kiếm. Bố cục 390 × 844 không tràn ngang; nút và văn bản xuống dòng hợp lý.

Cần chụp lại desktop sau khi trang đã được làm nóng để xác nhận bố cục rộng và ảnh minh họa.
Lượt chụp desktop sau khi route đã tải cho thấy trang hiển thị đúng: mục Hướng dẫn sử dụng nằm đầu nhóm Hệ thống và được tô trạng thái active; hero, ô tìm kiếm, hai thẻ tải PDF/ZIP và mục lục hiển thị gọn trong chiều rộng 1440 × 900. Không có tràn ngang hay chồng lấn.
Trình duyệt sandbox không có phiên đăng nhập nên route `/user-guide` trả về màn hình đăng nhập nội bộ, đúng cơ chế bảo vệ chung của DashboardLayout. Trang Hướng dẫn dành cho tất cả tài khoản đã đăng nhập, không gắn cờ adminOnly hay productionOnly; người chưa đăng nhập vẫn phải xác thực trước khi xem dữ liệu nội bộ và hướng dẫn.

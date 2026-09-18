# Kiểm tra Phân tích sản lượng: Nhập, Xuất và Hao kho

Khối **Phân tích sản lượng** đã được thay bằng ba thẻ và một biểu đồ ba đường. Thẻ **Sản lượng tổng** dùng tổng Nhập (xanh lá). Thẻ **Sản lượng All** dùng tổng Xuất (xanh da trời). Thẻ **Hao kho** dùng Nhập trừ Xuất (đỏ), giữ số âm nếu Xuất lớn hơn Nhập.

Từ dữ liệu Đội thực tế, truy vấn đối chiếu theo tháng 2026 trả về bảy điểm có cả Nhập/Xuất: tháng 01 là 298.354 kg / 285.087 kg / 13.267 kg; tháng 02 là 42.967 kg / 41.120 kg / 1.847 kg; tháng 05 là 89.497 kg / 86.639 kg / 2.858 kg; tháng 06 là 353.122,32 kg / 332.415 kg / 20.707,32 kg; tháng 07 là 448.755 kg / 411.650 kg / 37.105 kg; tháng 08 là 320.644 kg / 292.078 kg / 28.566 kg; tháng 09 là 82.406 kg / 74.124 kg / 8.282 kg. Các giá trị trên phù hợp công thức Hao kho = Nhập − Xuất.

Preview desktop ở trạng thái không đăng nhập hiển thị đủ ba thẻ với màu xanh lá, xanh da trời, đỏ và trạng thái rỗng đúng chuẩn. Regression test xác nhận chuỗi tháng giữ Nhập/Xuất riêng, có Hao kho dương/âm và vẫn giữ tháng chỉ có Xuất.

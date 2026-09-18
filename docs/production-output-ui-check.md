# Kiểm tra giao diện Sản lượng xuất trên Tổng quan

- Desktop 1280×800: trong khối Quản lý sản lượng mủ, hai nhóm nằm cạnh nhau: Sản lượng nhập nền xanh lá và Sản lượng xuất nền xanh dương. Mỗi nhóm có ba chỉ tiêu Mủ đông/tạp, Mủ dây và Tổng. Không tràn ngang hoặc chồng lấn.
- Mobile 390×844: phần Tổng quan và khối Quản lý sản lượng hiển thị một cột; hai nhóm sẽ xếp dọc theo breakpoint `lg`, giữ ba chỉ tiêu trong mỗi nhóm, không làm vỡ bố cục.
- Dữ liệu preview desktop chưa tải phiên đăng nhập nên các chỉ tiêu đều 0. Màn hình mobile có phiên dữ liệu và hiển thị đúng phần đầu trang; khối sẽ tiếp tục bên dưới vùng chụp.
- API mới dùng đúng dữ liệu xuất mủ cùng bộ lọc Năm–Tháng/Cả năm–Đợt–Đội của khối nhập. Không thay đổi dữ liệu nguồn hay schema.

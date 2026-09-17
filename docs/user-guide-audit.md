# Kiểm kê Hướng dẫn sử dụng Cao su CN386

## Phạm vi tài liệu

Tài liệu cần bao phủ đăng nhập nội bộ và đăng nhập quản trị Manus; cài PWA trên máy tính/laptop, Android và iOS; điều hướng theo ba nhóm menu; lọc/tra cứu; nhập liệu trực tiếp; sửa/xóa; import/export Excel; sao lưu dữ liệu; xử lý lỗi; và phân quyền.

## Nhóm chức năng

- Điều hành: Tổng quan, Vườn, Nhập mủ, Xuất mủ, Khai thác & chăm sóc, Quản lý & Nhân công.
- Báo cáo: Báo cáo tiến độ, Hao hụt kho, Báo cáo tăng giảm, Sản lượng theo lô, Đánh giá tay nghề.
- Hệ thống: Import & Excel, Cài ứng dụng, Tài khoản & quyền (admin), Nhật ký hoạt động (admin). Sẽ bổ sung Hướng dẫn sử dụng cho mọi tài khoản.

## Luồng import

Trang Import & Excel hỗ trợ 9 bộ dữ liệu: Vườn/lô; Chỉ số cây định kỳ; Nhân công; Nhập mủ theo đội; Xuất mủ theo đội; Phân chia nhân công vườn cây; Kế hoạch sản lượng tháng/năm; Tổng hợp tay nghề và hao dăm; Đánh giá tay nghề nhân công. Khai thác & chăm sóc có workbook riêng 5 sheet. Sản lượng theo lô có mẫu riêng. Trang Vườn và Nhân công cũng có mẫu riêng.

Luồng chuẩn: chọn loại dữ liệu, tải mẫu, điền đúng cột, chọn tệp, xem số dòng hợp lệ và lỗi, sau đó bấm Nhập. Import lại bản ghi trùng khóa sẽ cập nhật dữ liệu hiện có theo quy tắc backend thay vì tạo bản sao.

## Luồng export

Có các export theo bộ lọc ở Nhập mủ, Xuất mủ, Báo cáo tiến độ, Hao hụt kho, Tăng/giảm, Sản lượng theo lô, Vườn, Nhân công và Khai thác & chăm sóc. Trang Import & Excel có nút Xuất toàn bộ Excel tạo workbook nhiều sheet.

## Sửa, xóa và lưu trữ

- Nhập mủ: sửa/xóa cả bản ghi theo Lô và Vườn/Đội.
- Xuất mủ: sửa/xóa theo Đội.
- Khai thác & chăm sóc: bấm Sửa, cập nhật hoặc xóa sau xác nhận.
- Vườn: admin sửa/xóa lô, sửa/xóa phần phân bổ.
- Nhân công: cập nhật trạng thái; không xóa vật lý qua giao diện.
- Sao lưu: admin có thể tạo và tải bản sao; hệ thống ghi lịch tự động Chủ nhật 00:15 giờ Việt Nam, giữ 8 bản gần nhất, không chứa mật khẩu/bí mật xác thực.

## Ảnh minh họa

Hai lượt chụp màn hình đã được thực hiện cho các route chính ở kích thước desktop. Một số ảnh đầu tiên hiển thị skeleton vì dữ liệu chưa tải xong; các ảnh tải xong và ảnh do người dùng cung cấp sẽ được chọn, cắt và chuẩn hóa. Cần bổ sung ảnh trang đăng nhập/cài đặt và ảnh hướng dẫn thao tác import để tài liệu không phụ thuộc hoàn toàn vào dữ liệu thật.

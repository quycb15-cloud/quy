# Project TODO

- [x] Chuyển toàn bộ mã nguồn Cao su CN386 hiện có vào dự án Manus WebDev mới
- [x] Bảo toàn backend tRPC, đăng nhập Manus OAuth và phân quyền nội bộ
- [x] Đồng bộ schema hiện có và bảng technical_skill_evaluations
- [x] Áp dụng migration vào DATABASE_URL do Manus WebDev cấp
- [x] Rà soát và sửa lỗi cấu hình môi trường, bao gồm VITE_APP_TITLE và DATABASE_URL
- [x] Chạy kiểm tra TypeScript toàn dự án
- [x] Chạy toàn bộ test Vitest và bổ sung/sửa test cần thiết
- [x] Chạy build production và kiểm tra lỗi runtime/frontend
- [x] Kiểm tra giao diện web nội bộ và các luồng dashboard, sản lượng, nhân công, đánh giá tay nghề
- [ ] Tạo checkpoint hoàn chỉnh trước khi publish
- [ ] Deploy website nội bộ Cao su CN386 trên Manus WebDev
- [x] Tạo ứng dụng Expo dùng chung backend WebDev
- [x] Tích hợp luồng xem dashboard, sản lượng, nhân công và đánh giá tay nghề trên điện thoại
- [x] Kiểm tra build và cấu hình chạy app Expo
- [ ] Bàn giao URL web, mã nguồn app Expo và hướng dẫn cài/chạy

## Rà soát bổ sung trước publish

- [x] Migrate đầy đủ toàn bộ schema Cao su CN386 vào DATABASE_URL WebDev mới, không chỉ technical_skill_evaluations và plot_garden_allocations
- [x] Xác minh các bảng cốt lõi tồn tại trong database WebDev bằng truy vấn kiểm tra
- [x] Bổ sung test cho technicalSkillSummary và saveTechnicalSkillEvaluation, gồm lọc kỳ, tổng hợp điểm và phạm vi quyền
- [ ] Kiểm tra end-to-end các route sau đăng nhập: dashboard, báo cáo, nhân công và đánh giá tay nghề
- [ ] Xác minh trạng thái loading, error, empty và thao tác ghi đánh giá trên WebDev mới
- [x] Xóa/đối chiếu cảnh báo runtime cũ trong log sau khi server restart

## Mobile Expo

- [x] Thêm endpoint mobile OAuth exchange dùng SDK Manus hiện có và bearer session token
- [x] Tạo project Expo TypeScript tối giản trong thư mục mobile
- [x] Kết nối tRPC mobile tới /api/trpc của WebDev bằng EXPO_PUBLIC_API_BASE_URL
- [x] Tạo các tab Dashboard, Sản lượng, Nhân công và Tay nghề dùng dữ liệu thật
- [x] Thêm trạng thái đăng nhập, loading, error và empty trên mobile
- [x] Kiểm tra typecheck/build Expo và test biến đổi dữ liệu mobile

## Rà soát mobile bổ sung

- [x] Chuẩn hóa route Expo từ thư mục có dấu nháy thừa sang `mobile/app/(tabs)` và chạy lại check/export
- [x] Bổ sung test thuần cho formatter và phép tổng hợp dữ liệu mobile
- [ ] Xác minh runtime app Expo sau đăng nhập Manus trên thiết bị hoặc Expo Go

# Daily care content and team notes verification — 2026-09-17

Đã thay đổi khóa duy nhất của `daily_care_records` để thêm `workContent`, đồng thời cập nhật save logic bằng truy vấn tìm bản ghi trước khi update/insert nhằm tránh lỗi NULL unique của MySQL đối với các category không có workContent.

Bảng theo dõi Chăm sóc, Phun/bôi thuốc và Bón phân hiện có cột riêng **Nội dung công việc**, sắp xếp từng dòng theo ngày, Đội và nội dung, thay vì gộp nội dung vào nhãn Đội/Vườn. Bảng tổng vẫn cộng toàn bộ số liệu trong phạm vi lọc.

Đã tạo bảng `daily_care_team_notes` theo `activityDate + unit`, thêm query/mutation `operations.teamNotes` và `operations.saveTeamNote`, áp dụng `care:read`, `care:write` và scope Đội. Khu vực Ghi chú theo Đội được đặt dưới các bảng tổng, sắp xếp theo Đội.

`pnpm check` đạt. `pnpm vitest run server/operations.test.ts` đạt 7/7. Toàn bộ `pnpm test` đạt 63 files / 201 tests. Preview desktop và mobile đạt; mobile giữ cuộn ngang cho bảng rộng.

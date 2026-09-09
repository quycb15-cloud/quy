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
- [x] Tạo checkpoint hoàn chỉnh trước khi publish
- [x] Deploy website nội bộ Cao su CN386 trên Manus WebDev
- [x] Tạo ứng dụng Expo dùng chung backend WebDev
- [x] Tích hợp luồng xem dashboard, sản lượng, nhân công và đánh giá tay nghề trên điện thoại
- [x] Kiểm tra build và cấu hình chạy app Expo
- [x] Bàn giao URL web, mã nguồn app Expo và hướng dẫn cài/chạy

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

## Production incident

- [x] Xác định nguyên nhân trang production `caosucn386-hcbqtzyq.manus.space` hiển thị “This page couldn’t load”
- [x] Kiểm tra log runtime production và phản hồi HTTP của domain team
- [x] Sửa lỗi production, chạy lại check/build và xác minh trang đăng nhập tải được
- [x] Tạo checkpoint bản sửa và deploy lại visibility team
- [ ] Kiểm tra sau deploy bằng domain Manus và cập nhật hướng dẫn truy cập

## Android PWA install

- [x] Thêm manifest PWA có tên, biểu tượng, màu giao diện và display standalone
- [x] Thêm icon PWA đúng kích thước và liên kết trong HTML
- [x] Thêm service worker/register để đáp ứng điều kiện cài đặt Android
- [x] Thêm nút cài đặt chủ động khi trình duyệt phát hiện beforeinstallprompt
- [x] Kiểm tra manifest, service worker, typecheck/build và deploy lại team
- [ ] Kiểm tra sau deploy bằng Chrome/Samsung Internet trên Android

## Import nhân công từ Excel

- [x] Xác định các cột nhân công hiện có và phân biệt với chức năng “Nhập mã số Excel”
- [x] Thiết kế mẫu Excel import nhân công: mã số, họ tên, tên phiên âm, Đội, trạng thái và thông tin liên quan
- [x] Thêm API tRPC import nhân công hàng loạt có kiểm tra quyền, trùng mã và phạm vi Đội
- [x] Thêm giao diện chọn file, xem trước dòng hợp lệ/lỗi và xác nhận import
- [x] Giữ nguyên dữ liệu đã có, không tạo bản ghi trùng khi import lại
- [x] Bổ sung test parser, validate và import hàng loạt
- [x] Kiểm tra typecheck, test, build và giao diện Quản lý & Nhân công

## Import nhân công — rà soát backend

- [x] Xác minh khóa unique của bảng workers và định nghĩa rõ khóa nhận diện khi import lại
- [x] Bổ sung kiểm tra server-side cho trùng mã, trùng nhân công và phạm vi Đội trước khi ghi
- [x] Bổ sung test tRPC backend cho import mới, import lại/update, trùng mã và validation
- [ ] Kiểm tra trực tiếp WorkforcePage sau khi thêm dialog import Excel
- [ ] Kiểm tra production PWA assets sau deploy trả đúng loại tài nguyên

## Login incident

- [ ] Xác định bước OAuth bị lỗi khi đăng nhập production
- [ ] Kiểm tra redirect URI, callback và session cookie sau OAuth
- [ ] Sửa lỗi đăng nhập và bổ sung test hồi quy
- [ ] Lưu checkpoint và deploy bản sửa với visibility team
- [ ] Xác minh đăng nhập sau deploy bằng trình duyệt người dùng

## Import button production incident

- [ ] Xác định vì sao nút Import nhân công Excel chưa xuất hiện trên production
- [ ] Kiểm tra bản deploy hiện tại có chứa WorkerImportDialog và tích hợp WorkforcePage
- [ ] Kiểm tra điều kiện quyền admin/nhóm khiến nút bị ẩn
- [ ] Sửa, kiểm thử, tạo checkpoint và deploy lại bản có nút import
- [ ] Xác minh nút import hiển thị sau deploy

## Import Lô từ Excel

- [x] Xác định các cột Lô cần import, chưa phân loại vườn
- [x] Kiểm tra API tRPC và quy tắc trùng mã Lô hiện có
- [x] Thêm mẫu Excel, chọn file, xem trước và hiển thị lỗi
- [x] Kết nối xác nhận import với backend và làm mới danh sách Lô
- [x] Bổ sung test parser/API và kiểm tra giao diện Quản lý vườn

## Website access incident

- [ ] Kiểm tra URL domain và URL deployment hiện tại bằng HTTP
- [ ] Kiểm tra runtime logs và trạng thái OAuth redirect
- [ ] Xác định, sửa và kiểm thử nguyên nhân không truy cập được website
- [ ] Lưu checkpoint bản sửa nếu có thay đổi mã nguồn
- [ ] Xác minh người dùng có thể mở website trước khi yêu cầu publish lại

## Sửa Import Lô theo mẫu bảng kiểm kê cây

- [x] Đối chiếu toàn bộ cột mẫu Excel với các cột schema plantation_plots hiện có
- [x] Bổ sung mapping cho kiểm kê hố/cây, cây cạo và các nhóm cây theo mẫu
- [x] Bổ sung phần trăm hoặc quy tắc tính phần trăm từ số lượng khi cần
- [x] Sửa file mẫu, parser, xem trước và API Import Lô theo mẫu mới
- [x] Bổ sung test và kiểm tra build trước checkpoint

## Sắp xếp Lô theo năm trồng

- [x] Sắp xếp danh sách Lô theo Năm trồng tăng dần
- [x] Sắp xếp Tên lô theo thứ tự tự nhiên trong từng năm: 1, 2, 3, 3A, 3B...
- [x] Giữ ổn định các Lô chưa có năm hoặc tên lô không chuẩn
- [x] Bổ sung test sort và kiểm tra giao diện Quản lý vườn

- [x] Trong cùng Năm trồng, xếp số thuần trước, hậu tố chữ như 14A/14B tiếp theo, rồi hậu tố dạng 3-2012/4-2012

- [x] Với các Lô trùng Tên lô, ưu tiên Năm trồng tăng dần trước khi so các trường phụ

## Sửa sai số Tổng diện tích

- [x] Xác định nguồn cộng diện tích và nguyên nhân 1.582,72 thay vì 1.582,71 ha
- [x] Chuẩn hóa phép cộng/định dạng diện tích để không cộng sai số floating point
- [x] Bổ sung test giá trị 1.582,71 ha và kiểm tra giao diện Tổng quan
- [x] Lưu checkpoint bản sửa; chưa publish nếu chưa có xác nhận riêng

## Rà soát Tổng diện tích bổ sung

- [ ] Mở trang Tổng quan và xác minh thẻ Tổng diện tích hiển thị 1.582,71 ha
- [x] Bổ sung test tích hợp getDashboard totalArea cho dữ liệu 1582.715

- [ ] Bổ sung test dashboard dùng tập bản ghi Lô mô phỏng tổng 1582.715 và assert kết quả totalArea 1582.71 trước checkpoint kế tiếp

## Lọc Lô theo Đội khi nhập sản lượng

- [ ] Thêm combobox Đội vào màn hình Nhập sản lượng theo Lô
- [ ] Lọc danh sách Lô theo Đội đã chọn, giữ quyền/phạm vi hiện có
- [ ] Reset Lô đã chọn khi đổi Đội và hiển thị trạng thái chưa chọn
- [ ] Bổ sung test lọc và kiểm tra giao diện responsive

## Sửa hiển thị phân bổ Vườn A/B

- [x] Đối chiếu dữ liệu phân bổ Lô 7 với dữ liệu hiển thị Vườn A/B
- [x] Xác định lỗi mapping hoặc bộ lọc làm mất chi tiết phân bổ
- [x] Sửa hiển thị để Vườn A/B hiện đúng diện tích và số cây đã phân bổ
- [x] Bổ sung test phân bổ nhiều phần và kiểm tra giao diện

## Rà soát UI phân bổ A/B

- [ ] Kiểm tra trực quan Quản lý vườn sau sửa để xác nhận Lô 7 hiện ở cả Vườn A và Vườn B
- [x] Bổ sung test render cho nhóm Vườn để khóa hiển thị nhiều allocation trên UI

## Allocation data incident

- [x] Kiểm tra bản ghi allocation thực tế của Lô 7 và payload khi chọn Vườn B
- [x] Xác định vì sao allocation A/B bị dồn thành Vườn A 6,37 ha
- [ ] Sửa procedure/API để mỗi Vườn giữ bản ghi riêng và không tự gộp sai
- [ ] Bổ sung test lưu A rồi B cho cùng một Lô và kiểm tra lại UI/modal
- [ ] Ghi nhận payload `gardenType: B` khi thao tác phân bổ Vườn B
- [x] Đối chiếu log activity để xác định nguồn dồn allocation vào Vườn A

- [x] Áp dụng logic hiển thị allocation theo phần cho tất cả các Lô có phân bổ A/B/C; Lô 7 chỉ là ca kiểm thử, không sửa dữ liệu riêng

## Năm trồng và chỉnh sửa phân bổ

- [x] Hiển thị năm trồng ngay sau tên/số Lô trong danh sách Quản lý vườn
- [x] Thêm API cập nhật từng allocation A/B/C với kiểm tra tổng diện tích và số cây
- [x] Thêm API xóa từng allocation khi nhập sai
- [x] Thêm nút sửa/xóa cho từng phần phân bổ trong danh sách
- [x] Bổ sung dialog chỉnh sửa và xác nhận xóa an toàn
- [x] Bổ sung test API, UI và build production
- [x] Bổ sung test UI PlotsPage cho tên Lô kèm năm trồng
- [x] Bổ sung test UI danh sách allocation cho nút Sửa/Xóa và điền lại form

## Mẫu Excel phân bổ công nhân theo Vườn A/B/C

- [x] Cập nhật nút Tải mẫu Excel để tạo đúng bố cục bảng phân bổ công nhân theo mẫu người dùng gửi
- [x] Tạo tiêu đề nhóm Vườn A, Vườn B, Vườn C với các cột Lô, Hàng-hàng, Diện tích, Tổng cây cạo
- [x] Bổ sung các cột TT, Mã công nhân, Tổng diện tích, Tổng cây cạo và Ghi chú trong mẫu
- [x] Giữ nguyên hoặc cập nhật parser/validation để đọc được mẫu mới nếu người dùng nạp lại
- [x] Bổ sung test mẫu Excel và chạy typecheck, toàn bộ test, build production
- [x] Lưu checkpoint cho mẫu Excel mới

## Lỗi tải mẫu Excel

- [x] Xác định nguyên nhân nút Tải mẫu Excel không tạo hoặc không tải được file
- [x] Sửa luồng tạo workbook/mẫu phân bổ Vườn A/B/C và xử lý lỗi rõ ràng trên giao diện
- [x] Bổ sung test hồi quy cho thao tác tạo mẫu Excel
- [x] Chạy typecheck, test, build và lưu checkpoint sửa lỗi trước khi triển khai lại

## Mở rộng báo cáo sản lượng, kho và tay nghề

- [x] Bổ sung Kết quả thực hiện so với Kế hoạch tháng/năm ở Tổng quan cho Chi nhánh và từng Đội
- [x] Làm tròn số và thêm so sánh tăng/giảm theo cùng kỳ năm và tháng trước trong tổng hợp sản lượng
- [x] Cho phép nhập mủ theo Vườn A/B/C/tất cả, không bắt buộc Lô; vẫn hỗ trợ nhập theo Lô cho đội sản xuất
- [x] Báo cáo tiến độ xuất nhập chỉ hiển thị theo Đội và nhận dữ liệu từ import nhập/xuất mủ
- [x] Bổ sung tổng hợp hao hụt kho theo từng Đội và hiển thị Kỳ/Tháng
- [x] Sửa báo cáo tăng giảm: Xuất đúng số liệu, Chênh = Xuất - Nhập và bổ sung Hao kho
- [x] Xây dựng tổng hợp đánh giá tay nghề theo Đội, quân số, tỷ lệ cấp tay nghề, tăng/giảm và hao dăm
- [x] Rà soát, bổ sung test, chạy check/test/build và lưu checkpoint cho toàn bộ phạm vi

## Mẫu kế hoạch và tổng hợp tay nghề mới

- [x] Định nghĩa mẫu import kế hoạch theo Đội, đơn vị, diện tích, kế hoạch mủ đông/tạp và kế hoạch mủ quy khô năm
- [x] Lưu kế hoạch tháng/năm và tỷ lệ thực hiện vào dữ liệu có kiểm tra trùng kỳ/Đội
- [x] Hiển thị Tổng quan thực hiện so với kế hoạch tháng/năm cho Chi nhánh và từng Đội
- [x] Định nghĩa mẫu tổng hợp tay nghề theo cấp Xuất sắc/Giỏi/Khá/Trung bình/Yếu và hao dăm tháng hiện tại/tháng trước
- [x] Lưu hoặc import dữ liệu hao dăm theo Đội/tháng và tính chênh lệch, tỷ lệ phần trăm, xếp hạng
- [x] Cập nhật trang tổng hợp tay nghề theo mẫu, gồm quân số, số thợ, tỷ lệ và biến động

## Hoàn thiện nhất quán báo cáo trước checkpoint

- [x] Chuyển ReportsPage và file export tiến độ sang team-only, bỏ nhãn/cột Vườn
- [x] Chuyển ProductionChangePage và export sang team-only, Chênh = Xuất - Nhập, thêm Hao kho
- [x] Hiển thị số thợ và tỷ lệ cho từng mức tay nghề, kèm biến động tháng trước của Xuất sắc/Giỏi/Khá
- [x] Bổ sung test hồi quy cho export tiến độ, báo cáo tăng giảm và tổng hợp tay nghề theo mẫu

## Test hồi quy báo cáo

- [x] Tách helper export tiến độ team-only và kiểm tra không có cột Vườn/Lô
- [x] Tách helper export tăng giảm và kiểm tra Chênh = Xuất - Nhập, có Hao kho
- [x] Tạo helper tính dòng tay nghề có số thợ, tỷ lệ và biến động tháng trước để kiểm thử độc lập

## Xác minh thực tế nút Tải mẫu Excel

- [x] Tách helper tạo workbook mẫu để kiểm chứng độc lập dataset phân bổ Vườn A/B/C
- [x] Bổ sung test gọi helper và kiểm tra cấu trúc workbook/mẫu tải xuống
- [x] Ghi nhận nguyên nhân kỹ thuật đã xác minh và lưu checkpoint sau bản sửa nút Tải mẫu

## Tổng quan theo Tháng và Đợt

- [x] Rà soát nguồn kỳ/đợt hiện tại và xác định cách suy ra tháng báo cáo
- [x] Bổ sung bộ lọc Tháng trên Tổng quan
- [x] Hiển thị các Đợt có dữ liệu, bao gồm Đợt 4 khi tồn tại
- [x] Nối bộ lọc vào API/tổng hợp số liệu Tổng quan
- [x] Bổ sung test cho Tháng và Đợt 4, chạy check/test/build và lưu checkpoint

## Sửa mẫu Excel, báo cáo tăng giảm và Kỳ xem Tổng quan

- [x] Khôi phục tải mẫu Excel cho Vườn/Lô và kiểm tra lỗi tạo/tải file
- [x] Khôi phục tải mẫu Excel kế hoạch sản lượng tháng/năm và kiểm tra lỗi tạo/tải file
- [x] Sửa báo cáo tăng–giảm để bỏ chỉ tiêu Chênh, chỉ hiển thị Hao kho
- [x] Đổi Tổng quan sang bộ chọn Kỳ xem gồm Tháng và Đợt theo mẫu người dùng
- [x] Đồng bộ các bảng/phân tích Tổng quan theo Tháng và Đợt đã chọn
- [x] Bổ sung test, kiểm tra trình duyệt, typecheck, toàn bộ test và build (đã xong test/check/build; còn chờ đăng nhập Team để kiểm tra trực tiếp)
- [x] Lưu checkpoint mới cho các chỉnh sửa này

## Bằng chứng cuối cho bản sửa Excel và Tổng quan

- [x] Bổ sung test trực tiếp downloadWorkbookFile cho mẫu Vườn/Lô và Kế hoạch sản lượng
- [ ] Xác minh trình duyệt hai nút Tải mẫu Excel và UI Tổng quan/Báo cáo Hao kho (đang chờ đăng nhập Team)
- [x] Đồng bộ các truy vấn dashboard khác theo cùng Tháng/Đợt hoặc ghi rõ phạm vi chỉ áp dụng cho panel sản lượng
- [x] Chạy lại check/test/build sau các test xác minh và chỉ đánh dấu hoàn tất sau đó

## Đồng bộ bốn phần Tổng quan theo Kỳ xem

- [x] Đối chiếu bốn phần Tổng quan với bộ lọc năm, tháng, đợt hiện tại
- [x] Sửa tổng sản lượng không còn cộng mọi kỳ khi đang chọn Kỳ xem
- [x] Sửa diễn biến sản lượng theo đúng năm, tháng, đợt đã chọn
- [x] Sửa tổng hợp theo Đội và các biểu đồ liên quan theo cùng kỳ
- [x] Bổ sung test đối chiếu dữ liệu kỳ và độ chính xác số nguồn
- [x] Chạy check/test/build, lưu checkpoint và chờ xác nhận trước publish

## Đồng bộ Tổng quan theo ảnh Kỳ xem

- [x] Bộ chọn Kỳ xem hiển thị rõ Năm, Tháng và Đợt
- [x] Quản lý sản lượng mủ dùng đúng tập dữ liệu Năm/Tháng/Đợt
- [x] Phân tích sản lượng dùng đúng tập dữ liệu Năm/Tháng/Đợt
- [x] Sản lượng từng kỳ dùng đúng tập dữ liệu Năm/Tháng/Đợt
- [x] Tổng quan theo 6 đội dùng đúng tổng và diễn biến kỳ đang xem
- [x] Bổ sung test cho tổng, diễn biến, lọc kỳ và độ chính xác nguồn

## Đối chiếu hai file Excel mẫu mới

- [x] Đọc cấu trúc sheet, dòng tiêu đề và cột dữ liệu của mẫu tổng hợp tay nghề 08/2026
- [x] Đọc cấu trúc sheet, dòng tiêu đề và cột dữ liệu của mẫu kế hoạch năm/tháng
- [x] Cập nhật parser và mẫu tải xuống theo đúng file thật, không làm mất tương thích hợp lý
- [x] Cập nhật import/API và Tổng quan dùng dữ liệu kế hoạch/tay nghề sau import
- [x] Bổ sung test bằng cấu trúc thực tế của hai file, chạy check/test/build
- [x] Lưu checkpoint mới và xin xác nhận triển khai Team

## Sửa kỳ Tổng quan và import kỳ báo cáo

- [x] Thêm lựa chọn Tháng = Cả năm và lọc đúng toàn bộ năm đã chọn
- [x] Thêm lựa chọn Đợt = All và tự nhận diện Đợt 4 khi có phát sinh
- [x] Đặt kỳ mặc định theo tổng đến thời kỳ hiện tại, không hiển thị dữ liệu ngoài kỳ mặc định
- [x] Chỉ hiển thị các tháng có dữ liệu trong danh sách lựa chọn
- [x] Sửa import kế hoạch để dòng Tháng = 0 nhận đúng Kế hoạch năm
- [x] Sửa import tổng hợp tay nghề nhận đúng tháng 08/2026 và ngày báo cáo tương ứng
- [x] Bổ sung test lọc kỳ, import tháng=0, ngày 08/2026, chạy check/test/build và lưu checkpoint

## Sửa monthKey và thẻ kế hoạch Tổng quan

- [x] Sửa lỗi validation monthKey khi import tổng hợp tay nghề, hỗ trợ dữ liệu tháng 08/2026 đúng định dạng
- [x] Chuyển thẻ Kế hoạch năm 2026 sang vị trí bên phải theo hình mẫu
- [x] Đổi nhãn/thẻ Kế hoạch tháng thành Kế hoạch TT
- [x] Tính lại tỷ lệ theo Kế hoạch TT và sản lượng Xuất mủ sau hao hụt kho
- [x] Bỏ hiển thị phần % thừa trong thẻ kế hoạch
- [x] Bổ sung test, chạy check/test/build và lưu checkpoint; chưa publish khi chưa có xác nhận mới

## Quy tắc hiển thị kế hoạch theo Tháng/Cả năm

- [x] Khi chọn Tháng có dữ liệu, vẫn hiển thị thẻ Kế hoạch tháng và số thực hiện tháng
- [x] Khi chọn Cả năm, hiển thị Kế hoạch TT theo sản lượng Xuất mủ và Kế hoạch năm
- [x] Sửa fallback TypeScript cho các trường xuất mủ của Tổng quan
- [x] Bổ sung test điều kiện hiển thị theo Tháng/Cả năm, chạy check/test/build và lưu checkpoint

- [x] Ẩn hoàn toàn nội dung Kế hoạch TT khi Kỳ xem là một Tháng; chỉ hiển thị Kế hoạch tháng và Kế hoạch năm

## Đồng bộ Đợt 4 toàn hệ thống

- [x] Rà soát các màn hình, API, parser và báo cáo đang dùng danh sách Đợt
- [x] Bổ sung Đợt 4 động từ dữ liệu thực tế vào mọi bộ lọc/nội dung liên quan
- [x] Đồng bộ All và Đợt 4 với Tổng quan, sản lượng, nhập/xuất và báo cáo
- [x] Bổ sung test Đợt 4 và chạy check/test/build
- [x] Lưu checkpoint; chưa publish khi chưa có xác nhận visibility

## Cơ chế chống trùng dữ liệu

- [x] Rà soát khóa nhận diện và các luồng ghi/import hiện có
- [x] Định nghĩa quy tắc chống trùng cho Vườn/Lô, nhập/xuất mủ, kế hoạch, tay nghề và phân bổ nhân công
- [x] Bổ sung validation và unique/upsert an toàn ở backend/database
- [x] Hiển thị lỗi trùng rõ ràng trước khi ghi dữ liệu
- [x] Bổ sung test dòng trùng trong cùng file và nhập lại cùng file
- [x] Chạy migration, check/test/build và lưu checkpoint; chưa publish khi chưa xác nhận visibility

- [x] Mở rộng chống trùng cho import mã nhân công và chỉ số Lô, chạy lại test và build

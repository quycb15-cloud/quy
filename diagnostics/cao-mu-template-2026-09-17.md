# Workbook mẫu Theo dõi cạo mủ — 2026-09-17

File: `Tong_hop_so_lieu_hang_ngay_2026.xlsx`

Workbook có một sheet `Theo dõi số liệu`, 20 cột và dữ liệu bắt đầu từ dòng 4. Dòng 1–2 là header hai tầng. Cột A là Ngày, B là Đội. Ba nhóm cột lặp cho phần theo dõi cạo mủ là C:H, I:N và O:T; mỗi nhóm gồm Vườn cạo, KH (Vườn), Cạo xong (Vườn), Chưa cạo (Vườn), Cạo chưa xong (Vườn), % hoàn thành thực hiện xong. File mẫu có giá trị Vườn `C` ở cả ba nhóm và các số liệu có thể là số, để trống hoặc dấu `-`.

Quy tắc import: hỗ trợ header hai tầng và ba nhóm cột; coi ô trống, `-` và `—` ở cột số là không phát sinh (0/null tùy trường); không báo lỗi chỉ vì số liệu trống. Vẫn bắt buộc Ngày, Đội và Vườn cạo cho mỗi nhóm có dữ liệu; giữ thông báo `Sheet + Dòng Excel`.

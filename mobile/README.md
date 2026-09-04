# Cao su CN386 Mobile

Ứng dụng Expo dùng chung backend tRPC của Cao su CN386 WebDev. App không chứa secret; chỉ dùng biến public để biết địa chỉ API.

## Cấu hình

Tạo file `mobile/.env` từ mẫu sau:

```bash
EXPO_PUBLIC_API_BASE_URL=https://caosucn386-hcbqtzyq.manus.space
EXPO_PUBLIC_OAUTH_PORTAL_URL=https://manus.im
```

`EXPO_PUBLIC_API_BASE_URL` là domain WebDev, không thêm `/api/trpc` ở cuối vì client tự nối đường dẫn tRPC. Không commit file `.env` có token hoặc mật khẩu.

## Chạy bằng Expo Go

Từ thư mục `mobile`, cài Node.js và pnpm, sau đó chạy:

```bash
pnpm install
pnpm start
```

Quét QR bằng Expo Go trên Android hoặc iPhone khi điện thoại và máy phát Metro có thể kết nối cùng mạng. Các tab chính gồm Tổng quan, Sản lượng, Nhân công và Tay nghề.

## Chạy Android/iOS native

```bash
pnpm android
pnpm ios
```

Cần Android Studio/emulator cho Android hoặc Xcode trên macOS cho iOS. Luồng đăng nhập mở Manus OAuth trong trình duyệt hệ thống, sau đó callback deep link `caosu-cn386://oauth/callback` đưa người dùng về app.

## Kiểm tra web export

```bash
pnpm web
```

App yêu cầu tài khoản Manus hợp lệ và quyền thuộc team Cao su CN386 để gọi dữ liệu nội bộ. Nếu mở domain bằng trình duyệt điện thoại, có thể dùng Chrome menu ⋮ → “Cài đặt ứng dụng”; Samsung Internet dùng “Thêm trang vào” → “Màn hình chính”.

# Component Bản đồ Lô cao su

**Tác giả:** Manus AI  
**Phạm vi:** React/Vite, mục **Quản lý vườn** (`/plots`) của Cao su CN386

## Kết quả triển khai

Bản triển khai thêm một Component Bản đồ dùng **Leaflet** và nền bản đồ OpenStreetMap vào mục **Quản lý vườn**. Leaflet là thư viện JavaScript mã nguồn mở cho bản đồ tương tác, có hỗ trợ thao tác trên trình duyệt di động và cho phép hiển thị dữ liệu GeoJSON dạng đa giác. [1] Component hoạt động trên Web và PWA mở bằng trình duyệt di động; các thao tác chạm trên màn hình cảm ứng tương ứng với thao tác click trên máy tính.

Khi trang Vườn được mở, Component thu thập toàn bộ ranh giới GeoJSON hợp lệ và gọi `fitBounds` để tự động zoom tới toàn bộ nông trường. Mỗi lô được hiển thị thành `Polygon` hoặc `MultiPolygon`. Màu sắc được gắn với trạng thái vận hành, gồm xanh lá cho lô đang cạo mủ, vàng cho lô kiến thiết cơ bản hoặc cây non, và đỏ cho lô dừng đầu tư. Người dùng có thể chọn lô trực tiếp trên bản đồ hoặc nhập Mã lô vào thanh tìm kiếm. Kết quả tìm kiếm sẽ gọi `flyToBounds` để đưa khung nhìn tới ranh giới của lô tìm được.

Pop-up của từng lô hiển thị tên lô, Mã lô, Đội, diện tích và trạng thái. Nút **“Xem lịch sử sản lượng mủ”** mở hộp thoại tổng hợp sản lượng theo từng năm và từng tháng, gồm Mủ đông/tạp, Quy khô và tổng kilogram. Component dùng trực tiếp API `rubber.plotProduction.list` đã tồn tại, nên không tạo thêm nguồn dữ liệu sản lượng song song.

## Kiến trúc và tệp nguồn

| Tệp | Vai trò |
|---|---|
| `client/src/components/maps/RubberFarmMap.tsx` | Component Leaflet hoàn chỉnh: tự zoom, Polygon, pop-up, tìm Mã lô, fly-to và hộp thoại lịch sử sản lượng. |
| `client/src/lib/plotMap.ts` | Chuẩn hóa tìm kiếm không phân biệt dấu, tính bounds Leaflet và tổng hợp lịch sử sản lượng theo tháng/năm. |
| `shared/plotMap.ts` | Kiểu GeoJSON dùng chung, màu trạng thái và kiểm tra chỉ nhận `Polygon` hoặc `MultiPolygon`. |
| `client/src/pages/PlotsPage.tsx` | Nạp lười Component để Leaflet không chạy trong SSR/test Node, hiển thị bản đồ trong mục Vườn và bổ sung trường trạng thái/GeoJSON vào biểu mẫu Lô. |
| `server/routers/rubber.ts` | Xác thực GeoJSON tại API trước khi ghi cơ sở dữ liệu. Dữ liệu `Point`, JSON lỗi hoặc ranh giới không đúng cấu trúc sẽ bị từ chối. |
| `server/db.ts` và `drizzle/schema.ts` | Lưu hai thuộc tính mới: `mapStatus` và `boundaryGeoJson`. |
| `drizzle/0038_plot_boundaries.sql` | Migration thêm hai cột cho bảng `plantation_plots`. |

## Cấu trúc dữ liệu ranh giới

Mỗi lô có hai trường mới. Trường `mapStatus` nhận một trong ba giá trị `tapping`, `immature` hoặc `suspended`. Trường `boundaryGeoJson` nhận chuỗi GeoJSON. Hệ thống chỉ chấp nhận geometry `Polygon` hoặc `MultiPolygon`, vì bản đồ lô phải có diện tích xác định.

GeoJSON dùng thứ tự tọa độ **`[kinh độ, vĩ độ]`**, khác với thứ tự Leaflet hiển thị nội bộ là `[vĩ độ, kinh độ]`. Component thực hiện phép chuyển đổi này trước khi truyền vào Leaflet. Mỗi linear ring cần có ít nhất bốn điểm và phải lặp lại điểm đầu ở cuối để khép kín ranh giới.

```json
{
  "type": "Polygon",
  "coordinates": [
    [
      [106.7000, 11.2000],
      [106.7040, 11.2000],
      [106.7040, 11.2030],
      [106.7000, 11.2030],
      [106.7000, 11.2000]
    ]
  ]
}
```

Người quản trị có thể dán JSON này trong trường **“Ranh giới GeoJSON (Polygon/MultiPolygon)”** khi tạo hoặc sửa Lô. Biểu mẫu cũng cho phép chọn trạng thái bản đồ. API chuẩn hóa chuỗi JSON trước khi lưu, vì vậy giao diện và API cùng tuân thủ một định dạng.

## Áp dụng cơ sở dữ liệu và khởi động

Sau khi đồng bộ mã nguồn, chạy migration trước khi mở chức năng cho người dùng. Môi trường hiện có sử dụng Drizzle, do đó có thể dùng lệnh sau để sinh và áp dụng migration theo cấu hình hiện hành.

```bash
pnpm db:push
```

Nếu quy trình triển khai của môi trường chỉ thực thi các tệp SQL đã rà soát, áp dụng `drizzle/0038_plot_boundaries.sql` trong cùng đợt phát hành. Sau migration, các lô cũ mặc định có `mapStatus = "tapping"` và `boundaryGeoJson = NULL`; chúng vẫn hoạt động bình thường nhưng không được đưa vào bản đồ cho tới khi có ranh giới khảo sát.

Component đã được tích hợp sẵn vào `PlotsPage`. Với một màn hình khác, chỉ cần nạp lười Component và truyền danh sách lô cùng bản ghi sản lượng:

```tsx
const RubberFarmMap = lazy(() => import("@/components/maps/RubberFarmMap"));

<Suspense fallback={<div className="h-[440px] animate-pulse rounded-xl bg-slate-100" />}>
  <RubberFarmMap
    plots={plots}
    productionEntries={productionEntries}
  />
</Suspense>
```

`plots` cần có các trường `id`, `code`, `name`, `unit`, `areaHa`, `mapStatus` và `boundaryGeoJson`. Mảng `productionEntries` cần có `plotId`, `recordDate`, `frozenContaminatedLatex` và `dryRubber`. Tất cả kiểu dữ liệu và hàm tổng hợp có thể tái sử dụng từ `client/src/lib/plotMap.ts` và `shared/plotMap.ts`.

## Vận hành bản đồ nền

Triển khai này không dùng Google Maps và không cần khóa API Google Maps. Leaflet không khóa ứng dụng vào một nhà cung cấp tile cụ thể; Component hiện dùng tile chuẩn OpenStreetMap qua HTTPS và hiển thị attribution bắt buộc ở góc bản đồ. [1] Tuy nhiên, dữ liệu OpenStreetMap được sử dụng tự do không đồng nghĩa máy chủ tile công cộng có năng lực vô hạn. Chính sách của OpenStreetMap Foundation yêu cầu attribution hiển thị, không tiền tải hoặc scrape tile, và không cung cấp cam kết SLA cho tile công cộng. [2]

Đối với tải vận hành lớn, cần cấu hình một tile provider phù hợp hoặc tự lưu trữ tile, thay vì sử dụng `tile.openstreetmap.org` như một dịch vụ có SLA. Không triển khai tính năng tải bản đồ ngoại tuyến bằng endpoint tile công cộng. Việc thay nhà cung cấp chỉ yêu cầu thay `url` và `attribution` trong `RubberFarmMap.tsx`; dữ liệu lô GeoJSON không bị thay đổi.

## Kiểm thử đã thực hiện

Bộ kiểm thử xác nhận việc chỉ chấp nhận Polygon/MultiPolygon, tính bounds theo đúng thứ tự Leaflet, tìm Mã lô không phân biệt dấu và tổng hợp sản lượng tháng/năm. API cũng có kiểm thử từ chối geometry `Point`. Việc nạp lười giữ Leaflet ngoài Node test runtime, do đó các kiểm thử SSR hiện có của trang Vườn vẫn hoạt động.

```bash
pnpm check
VITE_APP_TITLE='Cao su CN386' pnpm test
pnpm build
```

## References

[1]: https://leafletjs.com/ "Leaflet — open-source JavaScript library for mobile-friendly interactive maps"
[2]: https://operations.osmfoundation.org/policies/tiles/ "OpenStreetMap Foundation Tile Usage Policy"

import { PageHeader, Panel } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { filterGuideChapters } from "@/lib/userGuideSearch";
import {
  Archive,
  BarChart3,
  BookOpenCheck,
  CircleCheckBig,
  DatabaseBackup,
  Download,
  ExternalLink,
  FileSpreadsheet,
  Filter,
  Laptop,
  LogIn,
  Search,
  Smartphone,
  Sprout,
  UsersRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

const GUIDE_PDF_URL = "/manus-storage/huong-dan-su-dung-cao-su-cn386_b89a88de.pdf";
const EXCEL_BUNDLE_URL = "/manus-storage/bo-mau-excel-import-export-cao-su-cn386_1eb441e7.zip";

const images = {
  overview: "/manus-storage/01-tong-quan_b233d773.png",
  install: "/manus-storage/02-cai-ung-dung_a1526738.png",
  imports: "/manus-storage/03-nhap-mu_3943d2d0.png",
  exports: "/manus-storage/04-xuat-mu_d3206f47.png",
  care: "/manus-storage/05-khai-thac-cham-soc_8cb417ee.png",
  workforce: "/manus-storage/06-nhan-cong_231b9258.png",
  reports: "/manus-storage/07-bao-cao-tien-do_a26e9ead.png",
  excel: "/manus-storage/08-import-export-excel_6745a30a.png",
};

type GuideChapter = {
  id: string;
  title: string;
  summary: string;
  keywords: string;
  icon: LucideIcon;
  steps: string[];
  notes?: string[];
  image?: string;
  imageAlt?: string;
  caption?: string;
};

const chapters: GuideChapter[] = [
  {
    id: "install",
    title: "Cài phần mềm trên máy tính, Android và iPhone",
    summary: "Cài Cao su CN386 như một ứng dụng độc lập, có biểu tượng trên màn hình chính.",
    keywords: "cài đặt máy tính laptop chrome edge android ios iphone ipad pwa màn hình chính",
    icon: Smartphone,
    steps: [
      "Máy tính dùng Chrome: mở website, bấm biểu tượng Cài đặt trên thanh địa chỉ; hoặc mở menu ⋮ → Truyền, lưu và chia sẻ → Cài đặt trang dưới dạng ứng dụng.",
      "Máy tính dùng Edge: mở menu … → More tools → Apps → Install this site as an app.",
      "Android: bấm banner Cài Cao su CN386; nếu banner không hiện, mở menu Chrome ⋮ → Cài đặt ứng dụng hoặc Thêm vào màn hình chính.",
      "iPhone/iPad: mở website bằng Safari → Chia sẻ → Thêm vào Màn hình chính → bật Mở dưới dạng ứng dụng web → Thêm.",
    ],
    notes: ["Nếu đang mở link trong Zalo/Facebook, hãy chọn Mở bằng Chrome hoặc Safari trước khi cài."],
    image: images.install,
    imageAlt: "Trang Cài ứng dụng Cao su CN386",
    caption: "Hệ thống → Cài ứng dụng có nút cài, hướng dẫn thủ công và sao chép liên kết.",
  },
  {
    id: "login",
    title: "Đăng nhập, đăng xuất và phạm vi quyền",
    summary: "Dùng tài khoản cá nhân do quản trị viên cấp; dữ liệu và nút thao tác thay đổi theo quyền.",
    keywords: "đăng nhập mật khẩu tài khoản quyền đội đăng xuất quản trị viên",
    icon: LogIn,
    steps: [
      "Nhập đúng Tên đăng nhập và Mật khẩu, sau đó bấm Đăng nhập nội bộ một lần và chờ hệ thống xác thực.",
      "Quản trị viên Manus dùng liên kết đăng nhập riêng nằm dưới biểu mẫu đăng nhập nội bộ.",
      "Tên và vai trò xuất hiện ở cuối menu. Bấm vùng tên tài khoản rồi chọn Đăng xuất khi kết thúc.",
      "Nếu thiếu nút nhập, sửa, xóa hoặc import, hãy nhờ quản trị viên kiểm tra quyền chức năng và phạm vi Đội.",
    ],
    notes: ["Không dùng chung mật khẩu; không gửi mật khẩu trong ảnh chụp lỗi."],
  },
  {
    id: "lookup",
    title: "Theo dõi, lọc và tra cứu các chức năng",
    summary: "Luôn kiểm tra kỳ xem trước khi đọc số liệu: Năm, Tháng/Cả năm, Đợt, Đội hoặc khoảng ngày.",
    keywords: "tổng quan vườn lọc tra cứu năm tháng cả năm đợt đội từ ngày đến ngày",
    icon: Filter,
    steps: [
      "Tổng quan: chọn Năm → Tháng/Cả năm → Đợt; trong từng khối có thể chọn Tất cả đội hoặc một Đội.",
      "Vườn: chọn phạm vi Đội, tìm theo mã/tên lô và lọc Vườn A/B/C hoặc chưa phân loại.",
      "Nhật ký nhập/xuất và các bảng chăm sóc: chọn Đợt, Đội, Từ ngày và Đến ngày; bấm Đặt lại để bỏ bộ lọc.",
      "Các kỳ không có dữ liệu có thể không xuất hiện. Nếu báo cáo trống, mở rộng khoảng ngày hoặc chọn Cả năm/All/Tất cả.",
    ],
    image: images.overview,
    imageAlt: "Tổng quan vận hành và menu Cao su CN386",
    caption: "Menu gồm Điều hành, Báo cáo và Hệ thống; nội dung hiển thị theo quyền tài khoản.",
  },
  {
    id: "latex",
    title: "Ghi nhận, sửa, xóa và xuất Nhật ký nhập – xuất mủ",
    summary: "Nhập theo Đội/Vườn, theo dõi nhật ký, tra cứu theo kỳ và sửa hoặc xóa đúng bản ghi.",
    keywords: "nhập mủ xuất mủ sửa xóa nhật ký đợt vườn lô mủ đông mủ dây hao kho",
    icon: Sprout,
    steps: [
      "Nhập mủ: chọn Đội, Vườn A/B/C hoặc Tất cả vườn, ngày và Đợt. Lô không bắt buộc. Nhập Mủ đông, Mủ dây, ghi chú rồi lưu.",
      "Xuất mủ: chọn Đội, ngày, Đợt; nhập Mủ đông tạp và Mủ dây; kiểm tra Cộng xuất và Hao kho dự kiến trước khi lưu.",
      "Trong nhật ký, bấm Sửa tại đúng dòng. Cập nhật rồi lưu; nếu cần xóa, chọn Xóa bản ghi và xác nhận.",
      "Nút Xuất Excel dùng dữ liệu phù hợp bộ lọc hiện tại và có dòng tổng ở cuối file.",
    ],
    notes: ["Sau khi sửa hoặc xóa, lọc lại cùng kỳ và đối chiếu dòng Tổng cộng."],
    image: images.imports,
    imageAlt: "Biểu mẫu và Nhật ký nhập mủ",
    caption: "Nhập mủ ở bên trái; tra cứu theo Đợt và khoảng ngày ở bên phải.",
  },
  {
    id: "care",
    title: "Khai thác và chăm sóc hằng ngày",
    summary: "Theo dõi cạo mủ, rập thiết kế, chăm sóc, phun/bôi thuốc và bón phân theo ngày và Đội.",
    keywords: "khai thác chăm sóc cạo mủ rập thiết kế phun bôi thuốc bón phân ghi chú ngày",
    icon: Sprout,
    steps: [
      "Chọn đúng bảng theo dõi, ngày và Đội. Theo dõi cạo mủ dùng Vườn A/B/C; các bảng công việc dùng Nội dung công việc.",
      "Bộ lọc ngày mặc định về ngày gần nhất có dữ liệu. Dòng Tổng cộng tính trên toàn bộ phạm vi đang lọc.",
      "Bấm Sửa để cập nhật; trong chế độ sửa có thể Xóa dữ liệu. Ghi chú được hiển thị theo ngày và Đội có ghi chú.",
      "Tải mẫu Excel để import workbook 5 sheet; ô số trống, dấu - hoặc — được hiểu là không phát sinh.",
    ],
    notes: ["Ngày lọc và ngày hiển thị dùng ngày nghiệp vụ theo múi giờ Việt Nam."],
    image: images.care,
    imageAlt: "Trang Khai thác và chăm sóc hằng ngày",
    caption: "Form nhập, bộ lọc ngày, bảng theo dõi và các nút Excel trên cùng màn hình.",
  },
  {
    id: "workforce",
    title: "Quản lý nhân công và đánh giá tay nghề",
    summary: "Theo dõi biên chế, trạng thái, mã số, phân công, đánh giá kỹ thuật và hao dăm.",
    keywords: "nhân công biên chế mã số phân công tay nghề hao dăm import đánh giá",
    icon: UsersRound,
    steps: [
      "Tìm nhân công bằng Tên phiên âm hoặc Mã số; xem biên chế, đang hoạt động, không hoạt động, thừa và thiếu theo Đội.",
      "Quản trị viên có thể thêm/sửa nhân công, cập nhật biên chế, nhập mã số Excel và chốt snapshot tháng.",
      "Không xóa nhân công khỏi dữ liệu lịch sử; chuyển trạng thái sang Không hoạt động khi cần.",
      "Đánh giá tay nghề: chọn kỳ và Đội để xem điểm, mức tay nghề, năng suất, hao dăm và xếp hạng; tài khoản Đội nhập trong phạm vi được cấp.",
    ],
    image: images.workforce,
    imageAlt: "Trang Quản lý và Nhân công",
    caption: "Các nút xuất/import cùng khối tổng hợp biên chế và trạng thái nhân công.",
  },
  {
    id: "reports",
    title: "Báo cáo và xuất số liệu",
    summary: "Đọc đúng kỳ và xuất báo cáo tiến độ, hao hụt kho, tăng giảm, sản lượng lô và tay nghề.",
    keywords: "báo cáo tiến độ hao hụt kho tăng giảm sản lượng lô tay nghề csv excel",
    icon: BarChart3,
    steps: [
      "Báo cáo tiến độ: chọn Năm, Tháng/Cả năm, Đợt và Đội; tải CSV hoặc Excel.",
      "Hao hụt kho: đối chiếu Cộng nhập, Cộng xuất, chênh lệch kg và tỷ lệ theo kỳ/Đội.",
      "Báo cáo tăng giảm: xem kỳ hiện tại, tháng liền kề gần nhất có dữ liệu, cùng kỳ và hao kho.",
      "Sản lượng theo lô và Đánh giá tay nghề: lọc Đội/kỳ rồi xuất file theo phạm vi đang xem.",
    ],
    image: images.reports,
    imageAlt: "Bộ lọc Báo cáo tiến độ",
    caption: "Kiểm tra Năm, Tháng/Cả năm, Đợt và Đội trước khi tải báo cáo.",
  },
  {
    id: "excel",
    title: "Import, export và bộ mẫu Excel",
    summary: "Tải đúng mẫu, giữ cấu trúc, xem trước lỗi theo dòng rồi mới xác nhận nhập.",
    keywords: "import export excel mẫu zip chọn tệp tải mẫu dòng lỗi sheet xem trước",
    icon: FileSpreadsheet,
    steps: [
      "Mở Hệ thống → Import & Excel, chọn Loại dữ liệu rồi bấm Tải mẫu Excel.",
      "Giữ nguyên tên sheet và tiêu đề cột; xóa hoặc thay dòng ví dụ; lưu dạng .xlsx hoặc .xls.",
      "Bấm Chọn tệp Excel, đọc số dòng hợp lệ, bản xem trước và lỗi theo Sheet + Dòng Excel/Dòng số.",
      "Chỉ bấm Nhập sau khi kiểm tra. Import lại có thể cập nhật bản ghi trùng khóa, vì vậy nên xuất hoặc sao lưu trước khi nhập hàng loạt.",
      "Nút Xuất toàn bộ Excel tạo workbook nhiều sheet từ dữ liệu thật theo quyền hiện tại. Gói ZIP bên dưới chỉ chứa mẫu và cấu trúc, không chứa dữ liệu sản xuất.",
    ],
    notes: ["Gói ZIP gồm 14 mẫu import và 9 cấu trúc export; mẫu có danh mục Lô động vẫn nên tải mới trực tiếp từ phần mềm."],
    image: images.excel,
    imageAlt: "Trang Import và export Excel",
    caption: "Chọn loại dữ liệu, tải mẫu, chọn tệp và kiểm tra trước khi nhập.",
  },
  {
    id: "troubleshoot",
    title: "Sửa lỗi, chỉnh dữ liệu và lưu trữ an toàn",
    summary: "Quy trình xử lý lỗi theo dòng, sửa/xóa có kiểm tra, export đối chiếu và sao lưu dữ liệu.",
    keywords: "sửa lỗi lưu trữ sao lưu backup dòng lỗi không nhận file không thấy nút ngày lệch",
    icon: Wrench,
    steps: [
      "File không nhận diện: tải mẫu mới, không đổi tên cột/sheet, kiểm tra ngày, số, Đội, Mã lô và Vườn A/B/C; sửa đúng dòng được báo rồi chọn lại file.",
      "Không thấy dữ liệu: kiểm tra bộ lọc, mở rộng khoảng ngày, chọn Cả năm/All/Tất cả và đối chiếu nhật ký nguồn.",
      "Không thấy nút thao tác: đăng nhập đúng tài khoản; nhờ quản trị viên kiểm tra quyền và phạm vi Đội.",
      "Sửa an toàn: xuất dữ liệu trước, sửa đúng dòng, tải lại trang và đối chiếu tổng sau khi lưu; chỉ xóa sau khi đọc hộp xác nhận.",
      "Dữ liệu được lưu trên máy chủ. Quản trị viên có thể tạo/tải bản sao trong Import & Excel; file nguồn nên lưu theo Năm/Tháng/Đội/Loại dữ liệu và không ghi đè bản gốc.",
    ],
    notes: ["Khi báo lỗi cho quản trị viên, gửi tên tài khoản, chức năng, Đội, tên file, thời điểm và ảnh thông báo; không gửi mật khẩu."],
  },
];

function DownloadCard({ icon: Icon, title, description, href, fileName, tone }: { icon: LucideIcon; title: string; description: string; href: string; fileName: string; tone: "emerald" | "sky" }) {
  const styles = tone === "emerald" ? "border-emerald-200 bg-emerald-50 text-emerald-950" : "border-sky-200 bg-sky-50 text-sky-950";
  return <div className={`rounded-2xl border p-4 ${styles}`}>
    <div className="flex items-start gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/80 shadow-sm"><Icon className="h-5 w-5" /></div>
      <div className="min-w-0 flex-1"><p className="font-semibold">{title}</p><p className="mt-1 text-sm leading-5 opacity-75">{description}</p></div>
    </div>
    <a href={href} download={fileName} className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Download className="mr-2 h-4 w-4" />Tải xuống
    </a>
  </div>;
}

function GuideChapterCard({ chapter }: { chapter: GuideChapter }) {
  const Icon = chapter.icon;
  return <article id={chapter.id} className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_30px_-24px_rgba(15,23,42,0.45)]">
    <div className="p-4 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-800"><Icon className="h-5 w-5" /></div>
        <div><h2 className="font-display text-lg font-bold text-slate-950 sm:text-xl">{chapter.title}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{chapter.summary}</p></div>
      </div>
      <ol className="mt-5 grid gap-3">
        {chapter.steps.map((step, index) => <li key={step} className="flex gap-3 text-sm leading-6 text-slate-700"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-700 text-xs font-bold text-white">{index + 1}</span><span>{step}</span></li>)}
      </ol>
      {chapter.notes?.map(note => <div key={note} className="mt-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-900"><CircleCheckBig className="mt-0.5 h-4 w-4 shrink-0" /><span>{note}</span></div>)}
    </div>
    {chapter.image ? <figure className="border-t border-slate-200 bg-slate-50 p-3 sm:p-5"><img src={chapter.image} alt={chapter.imageAlt} loading="lazy" className="w-full rounded-xl border border-slate-200 bg-white shadow-sm" /><figcaption className="mt-2 text-center text-xs leading-5 text-slate-500">{chapter.caption}</figcaption></figure> : null}
  </article>;
}

export default function UserGuidePage() {
  const [query, setQuery] = useState("");
  const visibleChapters = useMemo(() => filterGuideChapters(chapters, query), [query]);

  return <div className="page-enter">
    <PageHeader eyebrow="Trung tâm trợ giúp" title="Hướng dẫn sử dụng" description="Tra cứu cách cài đặt, đăng nhập, theo dõi, nhập liệu, import/export Excel, sửa lỗi và sao lưu dữ liệu Cao su CN386." action={<a href={GUIDE_PDF_URL} download="huong-dan-su-dung-cao-su-cn386.pdf"><Button className="bg-emerald-700 hover:bg-emerald-800"><Download className="mr-2 h-4 w-4" />Tải hướng dẫn PDF</Button></a>} />

    <section className="mb-5 overflow-hidden rounded-[1.5rem] bg-[#0d2f25] text-white shadow-[0_24px_50px_-30px_rgba(13,47,37,0.8)]">
      <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[1fr_360px] lg:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300"><BookOpenCheck className="h-4 w-4" />Cẩm nang Cao su CN386</div>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">Tìm nhanh thao tác, tải tài liệu và bộ mẫu</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/75">Tài liệu PDF 14 trang có ảnh minh họa. Gói ZIP gồm 14 mẫu import và 9 cấu trúc export, không chứa dữ liệu sản xuất thật.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={GUIDE_PDF_URL} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center rounded-xl bg-emerald-400 px-4 text-sm font-bold text-emerald-950 transition hover:bg-emerald-300"><BookOpenCheck className="mr-2 h-4 w-4" />Mở PDF</a>
            <a href={EXCEL_BUNDLE_URL} download="bo-mau-excel-import-export-cao-su-cn386.zip" className="inline-flex h-10 items-center rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15"><Archive className="mr-2 h-4 w-4" />Tải bộ ZIP</a>
            <a href="/install" className="inline-flex h-10 items-center rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15"><Smartphone className="mr-2 h-4 w-4" />Cài ứng dụng</a>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
          <label htmlFor="guide-search" className="text-sm font-semibold text-emerald-50">Tìm trong hướng dẫn</label>
          <div className="relative mt-2"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input id="guide-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="VD: import, ngày, cài iPhone…" className="h-11 border-white/20 bg-white pl-9 text-slate-950" /></div>
          <p className="mt-2 text-xs text-emerald-50/65">{visibleChapters.length} mục phù hợp</p>
        </div>
      </div>
    </section>

    <div className="mb-5 grid gap-3 md:grid-cols-2">
      <DownloadCard icon={BookOpenCheck} title="Hướng dẫn sử dụng PDF" description="14 trang, có ảnh minh họa, phù hợp để in hoặc gửi nội bộ." href={GUIDE_PDF_URL} fileName="huong-dan-su-dung-cao-su-cn386.pdf" tone="emerald" />
      <DownloadCard icon={Archive} title="Bộ ZIP mẫu Import & Export" description="23 workbook mẫu và README; không chứa dữ liệu sản xuất thật." href={EXCEL_BUNDLE_URL} fileName="bo-mau-excel-import-export-cao-su-cn386.zip" tone="sky" />
    </div>

    <Panel compact className="mb-5" title="Đi đến nội dung" description="Chọn mục để cuộn nhanh; hoặc dùng ô tìm kiếm phía trên.">
      <nav aria-label="Mục lục hướng dẫn" className="flex flex-wrap gap-2">
        {chapters.map(chapter => <a key={chapter.id} href={`#${chapter.id}`} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800">{chapter.title}</a>)}
      </nav>
    </Panel>

    {visibleChapters.length ? <div className="grid gap-5">{visibleChapters.map(chapter => <GuideChapterCard key={chapter.id} chapter={chapter} />)}</div> : <Panel><div className="py-10 text-center"><Search className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 font-semibold text-slate-700">Không tìm thấy nội dung phù hợp</p><p className="mt-1 text-sm text-slate-500">Thử từ khóa khác như “import”, “đăng nhập”, “ngày”, “báo cáo” hoặc “sao lưu”.</p><Button variant="outline" className="mt-4" onClick={() => setQuery("")}>Xóa tìm kiếm</Button></div></Panel>}

    <section className="mt-5 grid gap-3 md:grid-cols-3">
      <a href="/install" className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"><Laptop className="h-5 w-5 text-emerald-700" /><p className="mt-3 font-semibold text-slate-900">Cài ứng dụng</p><p className="mt-1 text-sm leading-5 text-slate-500">Mở trang cài PWA cho máy tính và điện thoại.</p></a>
      <a href="/data-tools" className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"><DatabaseBackup className="h-5 w-5 text-emerald-700" /><p className="mt-3 font-semibold text-slate-900">Import & Excel</p><p className="mt-1 text-sm leading-5 text-slate-500">Tải mẫu mới nhất, import, xuất toàn bộ và sao lưu.</p></a>
      <a href="https://support.google.com/chrome/answer/9658361" target="_blank" rel="noreferrer" className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"><ExternalLink className="h-5 w-5 text-emerald-700" /><p className="mt-3 font-semibold text-slate-900">Hỗ trợ cài web app</p><p className="mt-1 text-sm leading-5 text-slate-500">Mở hướng dẫn chính thức của Google Chrome.</p></a>
    </section>
  </div>;
}

# Quy chuẩn mã và nội dung

## Mã nguồn và giao diện

- KISS, YAGNI, DRY; tên tệp kebab-case, trừ tên bắt buộc của công cụ.
- Giữ tệp mã dưới 200 dòng, tách theo trách nhiệm; JSON dữ liệu và Markdown không tính là tệp mã.
- TypeScript strict; dùng schema Content Collection và schema câu hỏi để kiểm tra dữ liệu.
- Astro 7.4.12, Node 24.15.0 qua nvm. Prettier `printWidth: 120`, có `prettier-plugin-astro`.
- Dùng Tailwind CSS v4 qua `@tailwindcss/vite`; không thêm CSS độc lập. Token giao diện nằm trong khối `@theme` trực tiếp ở `src/layouts/site-layout.astro`.
- Đọc và điều hướng nội dung vẫn dùng được khi tắt JavaScript; tương tác câu hỏi và lưu tiến độ cần JavaScript.
- Giữ khóa `ccarpp-learning-v2`; nạp và chuẩn hóa trạng thái bài mới nhất trước khi sửa. Dùng `navigator.locks` tuần tự hóa ghi liên thẻ khi khả dụng; khi lỗi lưu trữ hoặc bị từ chối khóa, chuyển sang bộ nhớ tạm. Đồng bộ sự kiện `storage`.
- Revision phải bao gồm nội dung (`contentHash`), số lựa chọn/số mục và định nghĩa bài dự đoán cùng đáp án, để thay đổi nội dung cũng vô hiệu hóa trạng thái cũ.

## Nội dung song ngữ

- HTML nguồn là cơ sở nhập toàn khóa; ảnh nguồn và SHA-256 dùng để đối chiếu. Không tự sửa dữ kiện hoặc phiên bản mô hình của nguồn.
- Tiếng Việt tự nhiên, đầy đủ; giữ số liệu, URL, tên sản phẩm, API, mã nguồn và khoảng trắng biên của từng đơn vị dịch.
- Thuật ngữ thống nhất: tác tử, luồng công việc, câu kiểm tra, câu lệnh, truy xuất.
- Giữ mã trang, nhóm, mục và câu hỏi ổn định giữa tiếng Anh và tiếng Việt, kể cả dấu `#` khi đổi ngôn ngữ.
- Sửa bản đồ dịch tại `src/data/translations/` qua `scripts/write-translation.mjs`. Công cụ kiểm tra chính xác tập khóa qua số lượng và khóa bắt buộc, token số và khoảng trắng biên; không bỏ qua lỗi kiểm tra.
- Chạy lại `scripts/import-course.mjs` sau khi ghép bản dịch để sinh Markdown. Không chỉ sửa đầu ra sinh tự động rồi để lần nhập sau ghi đè.
- Giữ nguyên khối mã nguồn. Không nhập lời giải chi tiết ẩn hoặc văn xuôi trích dẫn nguồn; giữ liên kết nguồn.
- Giải thích bẫy Anh–Việt ở `src/data/trap-explanations/` phải tự biên soạn ngắn gọn, chính xác theo nội dung bài; không sao chép lời giải ẩn và không coi đây là bản dịch nguyên văn của phần ẩn. Tích hợp bản đồ sau khi ghép xong bản dịch.
- Đáp án phải lấy từ dữ liệu nguồn và khớp lựa chọn hiển thị. Phản hồi đúng liệt kê đáp án thực tế cùng nguồn, không bịa lời giải.
- Điền chỗ trống dùng các lựa chọn của nguồn và bộ xử lý `choice`; không mô tả như nhập văn bản tự do.

## Kiểm chứng

Nêu Scope Contract trước khi kiểm tra; chọn lớp kiểm tra thấp nhất chứng minh được hành vi. Chạy đầy đủ phần liên quan khi thay đổi đường dẫn, cấu hình, hợp đồng chung hoặc chức năng an toàn trọng yếu.

Trình tự kiểm chứng toàn khóa: `npm run format:check` → `npm run check` → `npm run build` → `node scripts/compare-source.mjs` → `npm test`. Cài Chromium cho Playwright nếu chưa có.

Kiểm tra cả năm dạng câu hỏi, hoàn thành nhóm nhiều phần, đổi ngôn ngữ, khôi phục dữ liệu, revision thay đổi, nhiều thẻ và lưu trữ bị chặn. Build thành công không chứng minh bản dịch đúng. Lint trước commit, kiểm thử trước push; không đưa bí mật vào Git.

Kiểm chứng cuối ngày 2026-11-16: `npm run format:check` đạt; `npm run check` kiểm tra 49 tệp, không lỗi, cảnh báo hay gợi ý; dựng 269 trang trong 3,31 giây; toàn bộ 35/35 kiểm thử Playwright đạt trong 11,1 giây. Kiểm toán nguồn hiện tại xác nhận 395 câu hỏi, 278 khối mã, 10.039 đơn vị dịch và 10.338 liên kết, không lỗi. Xem [báo cáo chuyển URL và dọn mã](../plans/reports/verification-20261116-lesson-slugs-cleanup.md).

## URL và tương thích

- Dùng `lessonUrl(locale, lessonId)` trong `src/lib/lesson-routes.mjs`; không tự ghép URL số. Slug lấy từ URL nguồn, dùng chung giữa các ngôn ngữ; mã bài tiếp tục làm khóa trạng thái.
- URL slug và URL số tương thích đều phải sinh đầy đủ trang bài. `SiteLayout` đặt canonical theo slug và dùng `history.replaceState` trong head để chuẩn hóa URL số khi bật JavaScript, giữ query, fragment và vị trí đọc mà không tải lại. Khi tắt JavaScript, giữ nguyên URL số cùng query/fragment và khả năng đọc tại vị trí tương ứng; không thay bằng trang chuyển hướng rỗng.
- Chỉ 54 đường dẫn nguồn dùng `LessonRedirect`, có `noindex` và canonical. `location.replace` giữ query/fragment; meta refresh trong `noscript` chỉ bảo đảm tới URL đích cơ bản, không bảo đảm giữ query/fragment.
- Kiểm tra liên kết nội dung sau mỗi lần nhập lại và kiểm tra tương thích khi bật/tắt JavaScript. Bản dựng hiện có 269 trang: 106 slug, 106 trang số đầy đủ, 54 chuyển hướng nguồn và 3 trang đầu/thư viện.

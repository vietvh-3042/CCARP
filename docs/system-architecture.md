# Kiến trúc hệ thống

## Nền tảng và giao diện

Astro 7.4.12 sinh trang tĩnh, TypeScript strict kiểm tra mã và Content Collection kiểm tra metadata Markdown. Tailwind CSS v4 tích hợp bằng `@tailwindcss/vite` trong `astro.config.mjs`. Khối `@theme` khai báo trực tiếp trong `src/layouts/site-layout.astro`; không có tệp CSS độc lập trong `src/`. Node 24.15.0 được chọn qua nvm; Prettier dùng độ rộng 120.

Thư viện tổ chức 38 nhóm bài thuộc 7 chương. Sidebar, header, footer, nội dung và khối câu hỏi dùng bố cục theo nguồn. Vòng tiến độ thư viện tổng hợp câu kiểm tra của cả nhóm và liên kết đến phần chưa xong; trang bài có điều hướng trước/sau.

## Luồng nội dung

1. `src/data/course-outline.json` xác định 53 trang và URL nguồn; ảnh trong `images/` là dữ liệu đối chiếu.
2. `scripts/source-client.mjs` đọc HTML từ `.cache/course-source/` hoặc tải khi chưa có. Cache gồm 53 bài và trang thư viện; `.cache/` nằm trong `.gitignore`.
3. `scripts/import-course.mjs` trích nội dung, metadata, liên kết, đáp án và bài dự đoán; sinh `course-pages.json`, `checkpoints/course.json` và đơn vị dịch.
4. Bản đồ `src/data/translations/{pageId}.json` cung cấp tiếng Việt. `scripts/write-translation.mjs` kiểm tra khóa, số liệu và khoảng trắng biên trước khi ghi.
5. Trình nhập sinh Markdown trong `src/content/lessons/en/` và `vi/`. Đã sinh đủ 106 tệp.

Khối mã được giữ nguyên giữa nguồn và hai ngôn ngữ. Phần giải thích chi tiết ẩn và văn xuôi trích dẫn nguồn được loại khỏi nội dung nhập; URL nguồn vẫn được giữ. Giải thích bẫy dùng bản đồ Anh–Việt tự biên soạn trong `src/data/trap-explanations/`, đã tích hợp đủ 183 giải thích/gợi ý; không phải lời giải ẩn sao chép từ nguồn. Trạng thái `source-verified` là metadata nhập liệu, không thay thế kết luận kiểm chứng toàn hệ thống.

## Tuyến và ngôn ngữ

Tuyến chính là `/{locale}/lessons/{sourceSlug}/`, với `en` và `vi` dùng cùng slug nguồn. `src/lib/lesson-routes.mjs` tạo URL và cung cấp `pageId` dùng chung cho ứng dụng, trình nhập. Mã trang, nhóm, revision và khóa lưu trữ giữ nguyên; mục `section-N`, câu hỏi `checkpoint-N` và dấu `#` được giữ khi đổi ngôn ngữ.

`[locale]/lessons/[slug].astro` sinh đầy đủ nội dung cho cả URL slug và URL số `/{locale}/lessons/{lessonId}/`. `SiteLayout` đặt canonical tới slug và chạy `history.replaceState` trong head để đổi URL số mà không tải lại, giữ query, fragment và vị trí đọc. Khi tắt JavaScript, trang số vẫn đọc được đầy đủ tại URL số, giữ query, fragment và vị trí đọc; đây không phải trang chuyển hướng.

Chỉ 54 đường dẫn nguồn dưới `/anthropic/claude-architect-professional/learn/` dùng `LessonRedirect`: 53 bài cùng trang thư viện, chuyển tới bản tiếng Anh. `location.replace` giữ query/fragment; khi tắt JavaScript, meta refresh và liên kết dự phòng chỉ dùng URL đích cơ bản, không bảo đảm giữ query/fragment. Các trang này có `noindex` và canonical.

Bản dựng có 269 trang tĩnh: 106 bài theo slug + 106 trang số đầy đủ + 54 trang chuyển hướng nguồn + 2 thư viện + 1 trang chọn ngôn ngữ. `LibraryProgress` nhận URL từng phần từ máy chủ, không tự ghép URL số trong trình duyệt. Các tuyến ngôn ngữ được khai báo trực tiếp, không dùng middleware i18n mặc định.

## Câu hỏi và tiến độ

`src/lib/lesson-checkpoints.ts` kiểm tra schema đáp án cho 395 câu kiểm tra cùng bài luyện dự đoán. Các bộ xử lý riêng hỗ trợ chọn một (`choice`, gồm điền chỗ trống bằng lựa chọn), chọn nhiều (`multi`), ghép cặp (`match`) và sắp xếp (`order`). Phản hồi đúng liệt kê đáp án, cặp ghép hoặc thứ tự thực tế bằng ngôn ngữ đang đọc, kèm liên kết nguồn.

`src/scripts/checkpoint-store.ts` lưu tại khóa `ccarpp-learning-v2`: `version: 2`, `lessons` và `completedGroups`. Mỗi trang có `revision` và các lần trả lời. Revision được tính từ câu kiểm tra và bài dự đoán, gồm `contentHash`, số lựa chọn/số mục và cấu trúc đáp án; không chỉ vị trí đáp án. Revision không khớp khiến đáp án cũ được đặt lại. Dữ liệu dùng chung theo mã bài, không chia theo ngôn ngữ.

Hoàn thành nhóm yêu cầu đúng mọi câu kiểm tra ở tất cả các phần; bài dự đoán được lưu nhưng không chặn hoàn thành. Trước mỗi thay đổi, bộ lưu nạp lại tài liệu và chuẩn hóa trạng thái mới nhất của bài. Khi có `navigator.locks`, thao tác ghi dùng khóa theo tên lưu trữ để chạy tuần tự giữa các thẻ; khi không có API này, vẫn thực hiện chu trình nạp–sửa–lưu nhưng không có bảo đảm khóa liên thẻ. Sự kiện `storage` đồng bộ các thẻ. Nếu localStorage bị chặn, ghi thất bại hoặc yêu cầu khóa bị từ chối, tương tác tiếp tục trong bộ nhớ của lần truy cập; không bảo đảm giữ sau tải lại. Không có tài khoản, thanh toán hay máy chủ đồng bộ tiến độ.

## Dọn mã và kiểm chứng

Đã bỏ `rationale` mặc định khỏi bộ trích, schema và JSON vì không có nơi dùng; giải thích thực tế hiển thị không đổi. Nhãn, export và trường nguồn không dùng đã được loại bỏ; dữ liệu bài mẫu được thay bằng `checkpoints/course.json`.

Kiểm chứng cuối ngày 2026-11-16: `npm run format:check` đạt; `npm run check` kiểm tra 49 tệp, không lỗi, cảnh báo hay gợi ý; dựng 269 trang trong 3,31 giây; toàn bộ 35/35 kiểm thử Playwright đạt trong 11,1 giây. Kiểm toán nguồn hiện tại xác nhận 395 câu hỏi, 278 khối mã, 10.039 đơn vị dịch và 10.338 liên kết, không lỗi. Xem [báo cáo chuyển URL và dọn mã](../plans/reports/verification-20261116-lesson-slugs-cleanup.md).

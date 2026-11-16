# Ghi chú trích nội dung

## Phạm vi và nguồn

Khóa học có 53 trang nguồn, 38 nhóm bài và 7 chương. Danh mục ảnh cùng SHA-256 nằm trong `src/data/screenshot-inventory.json`; URL và cấu trúc bài nằm trong `src/data/course-outline.json`. Nội dung đầy đủ được nhập từ HTML nguồn, không còn giới hạn ở ảnh bài mẫu 1.1.

`scripts/source-client.mjs` đọc cache `.cache/course-source/` và tải nguồn khi chưa có. Có 53 HTML bài học cùng một HTML trang thư viện; toàn bộ `.cache/` được bỏ qua bởi Git. `plans/20261116-full-course-tailwind/source-inventory.json` ghi kiểm kê nguồn.

## Quy trình nhập và dịch

- `scripts/import-course.mjs` nhập cả 53 trang: metadata, nội dung nhìn thấy, bảng, khối mã, câu hỏi, bài dự đoán và liên kết.
- `scripts/source-content.mjs` chuẩn bị nội dung và đơn vị dịch; `scripts/source-questions.mjs` đối chiếu đáp án dữ liệu nguồn với lựa chọn, cặp ghép và thứ tự hiển thị.
- Mỗi trang có `src/data/translation-source/{pageId}.json`, gồm mô tả và các đơn vị văn bản. Các khối code/pre/SVG và định danh mã không được dịch.
- `scripts/write-translation.mjs` chỉ ghi bản đồ dịch khi đủ khóa, không rỗng, giữ token số và khoảng trắng đầu/cuối theo kiểm tra của công cụ.
- Đã ghép đủ bản dịch và sinh 106 Markdown trong `src/content/lessons/en/` và `vi/`.
- Mã trang, mục, câu kiểm tra và ánh xạ đáp án giữ ổn định giữa hai ngôn ngữ. Các đơn vị cạnh thẻ đậm/liên kết phải được đọc liền để dịch tự nhiên.

## Quy tắc giữ và loại nội dung

Giữ nội dung bài nhìn thấy và nguyên văn khối mã, kể cả phiên bản mô hình không thống nhất giữa bài đọc và câu hỏi. Ngày xuất bản, mốc tài liệu và tỷ trọng thi là dữ kiện từ nguồn, không phải ngày kiểm chứng dự án.

Loại thành phần thực thi, nội dung ẩn và lời giải chi tiết đóng sẵn khỏi bài nhập. Danh sách nguồn giữ URL nhưng không sao chép văn xuôi trích dẫn nguồn. Giải thích bẫy thay thế là nội dung Anh–Việt tự biên soạn ngắn gọn, chính xác, lưu riêng tại `src/data/trap-explanations/`. Đã tích hợp 176 giải thích bẫy và 7 gợi ý; không phải lời giải chi tiết ẩn được sao chép hay dịch lại. Header, sidebar và footer dùng component chung.

Bộ câu hỏi gồm 395 câu kiểm tra, cộng bài luyện dự đoán. Hỗ trợ chọn một, điền chỗ trống bằng lựa chọn, chọn nhiều, ghép cặp và sắp xếp. Phản hồi đúng hiển thị chính đáp án, các cặp hoặc thứ tự đúng cùng liên kết nguồn; không dùng lời giải ẩn làm nội dung dịch và không suy đoán đáp án từ vị trí cột.

Revision dữ liệu câu hỏi bao gồm `contentHash`, số lựa chọn/số mục và cấu trúc đáp án của cả câu kiểm tra lẫn bài dự đoán. Đổi nội dung có thể làm mất hiệu lực đáp án đã lưu dù vị trí đáp án không đổi.

## Đường dẫn và đối chiếu

Trình nhập dùng `src/lib/lesson-routes.mjs` để chuyển liên kết bài sang `/{locale}/lessons/{sourceSlug}/` trong đúng ngôn ngữ. Chạy lại trình nhập vẫn giữ URL slug; `sourceSlug` là metadata bắt buộc và không đổi theo tên tiếng Việt. Mã bài và ánh xạ đáp án giữ nguyên. Bộ kiểm toán từ chối liên kết nội dung còn dùng URL số.

106 URL số cũ vẫn sinh đầy đủ trang bài, không dùng trang chuyển hướng. `SiteLayout` đặt canonical theo slug và đổi URL bằng `history.replaceState` trong head khi bật JavaScript, giữ query, fragment và vị trí đọc mà không tải lại. Khi tắt JavaScript, nội dung vẫn đọc được tại URL số với query, fragment và vị trí đọc giữ nguyên.

54 đường dẫn nguồn gồm 53 slug bài gốc và trang thư viện dùng `LessonRedirect` tới bản tiếng Anh. JavaScript giữ query/fragment; meta refresh khi tắt JavaScript chỉ là dự phòng tới URL cơ bản, không bảo đảm giữ các phần này. Tổng bản dựng hiện tại là 269 trang: 106 slug, 106 trang số, 54 chuyển hướng nguồn và 3 trang đầu/thư viện.

Trường `rationale` mặc định không còn được sinh vì không có nơi đọc; giải thích/gợi ý song ngữ tự biên soạn vẫn giữ đầy đủ.

Kiểm chứng cuối ngày 2026-11-16: `npm run format:check` đạt; `npm run check` kiểm tra 49 tệp, không lỗi, cảnh báo hay gợi ý; dựng 269 trang trong 3,31 giây; toàn bộ 35/35 kiểm thử Playwright đạt trong 11,1 giây. Kiểm toán nguồn hiện tại xác nhận 395 câu hỏi, 278 khối mã, 10.039 đơn vị dịch và 10.338 liên kết, không lỗi. Xem [báo cáo chuyển URL và dọn mã](../plans/reports/verification-20261116-lesson-slugs-cleanup.md).

# Nhật ký thay đổi

## 2026-11-16 — URL slug và dọn mã không dùng

- Đổi URL bài học sang slug như trang nguồn; dùng cùng slug cho Anh–Việt, giữ mã bài cho dữ liệu và tiến độ.
- Cập nhật sidebar, chuyển ngôn ngữ, bài trước/sau, tiếp tục học, liên kết trong Markdown và kiểm toán nguồn.
- Tập trung tạo URL và mã trang tại `src/lib/lesson-routes.mjs`, bỏ logic trùng lặp.
- Giữ 106 trang tương thích URL số: JavaScript đổi thanh địa chỉ sang slug, còn khi tắt JavaScript vẫn đọc đầy đủ tại URL số với query/fragment ban đầu. 54 đường dẫn nguồn dùng thành phần chuyển hướng riêng.
- Bỏ 11 nhãn UI mỗi ngôn ngữ, hai nhãn Checkpoint mỗi ngôn ngữ, bốn export nội bộ, `sourceRoot`, `extras`, `linkId`, tham số `_dom` và dữ liệu `rationale` không dùng. Bỏ JSON bài mẫu cũ; giữ bằng chứng nguồn và toàn bộ nội dung đang dùng.
- JSON câu hỏi giảm 94.525 byte; build đã sinh 269 trang tĩnh. Kiểm chứng cuối: định dạng đạt; Astro 49 tệp không lỗi/cảnh báo/gợi ý; 35/35 kiểm tra đạt, đối chiếu nguồn/liên kết không lỗi; rà soát độc lập hoàn tất.

## 2026-11-16 — Toàn khóa song ngữ và Tailwind v4

### Thêm và thay đổi

- Mở rộng từ bài mẫu sang 53 trang nguồn, 38 nhóm bài và 7 chương. Đã sinh đủ 106 Markdown song ngữ.
- Nhập 395 câu kiểm tra cùng bài luyện dự đoán; hỗ trợ chọn một, điền chỗ trống bằng lựa chọn, chọn nhiều, ghép cặp và sắp xếp.
- Đáp án lấy từ dữ liệu nguồn; phản hồi đúng liệt kê đáp án thực tế và liên kết nguồn. Giữ nguyên khối mã; không nhập lời giải chi tiết ẩn và văn xuôi trích dẫn nguồn.
- Bổ sung `scripts/import-course.mjs`, `scripts/compare-source.mjs` và `scripts/write-translation.mjs` cho nhập toàn khóa, đối chiếu nguồn/mã/đáp án/liên kết và kiểm tra bản dịch theo khóa, số liệu, khoảng trắng biên.
- Cache 53 HTML bài nguồn và trang thư viện trong `.cache/course-source/`, được bỏ qua bởi Git.
- Tailwind CSS v4 qua `@tailwindcss/vite`, bỏ CSS độc lập; khối `@theme` nằm trực tiếp trong SiteLayout. Giữ Astro 7.4.12, Prettier 120 và Node 24.15.0 qua nvm.
- Giữ ID và dấu `#` khi đổi Anh–Việt; thêm 54 đường dẫn tương thích nguồn. Build thành 163 trang tĩnh.
- Chuyển trạng thái học sang `ccarpp-learning-v2`: đáp án theo revision, hoàn thành theo nhóm, đồng bộ giữa thẻ và dự phòng bộ nhớ khi lưu trữ bị chặn.
- Chỉ cho hoàn thành khi đạt câu kiểm tra ở mọi phần trong nhóm; thêm vòng tiến độ, tiếp tục học và bài trước/sau.

- Sửa việc ghi đè tiến độ: nạp và chuẩn hóa trạng thái bài mới nhất trước khi sửa; tuần tự hóa ghi liên thẻ bằng `navigator.locks` khi khả dụng, dự phòng bộ nhớ khi lỗi lưu trữ hoặc bị từ chối khóa.
- Revision nay bao gồm `contentHash`, số lựa chọn/số mục và định nghĩa bài dự đoán bên cạnh đáp án, tránh dùng lại trạng thái khi nội dung thay đổi.
- Bổ sung bản đồ giải thích bẫy Anh–Việt tự biên soạn trong `src/data/trap-explanations/`, đã tích hợp 176 giải thích và 7 gợi ý; không sao chép phần giải thích ẩn của nguồn. Phản hồi đáp án đúng vẫn liệt kê đáp án thực tế và nguồn.

### Sửa và kiểm chứng

- Sửa giải thích sai ngữ cảnh; bổ sung 183 giải thích/gợi ý tự biên soạn đúng tình huống.
- Sửa hai diễn đạt: OpenTelemetry quy mức sử dụng về người dùng, còn gateway áp giới hạn; giảm effort không bảo đảm câu trả lời hiển thị ngắn hơn.
- Bỏ middleware i18n mặc định đang chặn xuất các đường dẫn gốc; các tuyến Anh–Việt được khai báo trực tiếp.
- Giữ định dạng mã trong lựa chọn, sửa ngày bị lệch múi giờ và cỡ chữ nội dung theo ảnh.
- Định dạng đạt; Astro 46 tệp, 0 lỗi/cảnh báo/gợi ý; build 163 trang; 29/29 kiểm tra đạt, gồm toàn bộ 106 trang bài.
- Đối chiếu 395 câu hỏi, 278 khối mã, 10.039 đơn vị dịch và 10.338 liên kết: không lỗi. Rà soát độc lập hoàn tất.

Tài khoản, thanh toán, đồng bộ thiết bị và hosting nằm ngoài phạm vi.

Các mục bên dưới là lịch sử bản mẫu, không phải bằng chứng kiểm chứng hiện tại.

## 2026-11-16 — 0.1.0, bản mẫu cục bộ

### Thêm

- Dự án Astro 7.4.12, TypeScript, Node 24.15.0 qua nvm.
- Bài 1.1 Anh–Việt: 6 mục, 9 câu kiểm tra; lưu nguồn ảnh và SHA-256.
- Danh mục 53 ảnh và 53 tiêu đề song ngữ, thuộc 38 nhóm bài và 7 chương.
- Chuyển ngôn ngữ giữ bài/mục, đánh dấu đã đọc bằng localStorage.
- UI theo ảnh gốc: header, sidebar cuộn, khung mục tiêu, ghi chú, bảng, câu hỏi và ghép cặp.
- Prettier `printWidth: 120`, `format` và `format:check`.

### Sửa và kiểm chứng

- Menu điện thoại vẫn có điều hướng khi tắt JavaScript; hỗ trợ bàn phím và Escape.
- Liên kết ngôn ngữ giữ dấu `#` cả khi mở thẻ mới; tên truy cập chứa ngôn ngữ đích.
- Tìm kiếm lọc thư viện bài đã có; nhãn ghép cặp hiển thị rõ, không gợi ý đáp án.
- Playwright dùng đúng Chromium đã cài; preview kiểm thử chạy tiền cảnh bằng `--ignore-lock`.
- Định dạng đạt; Astro 0 lỗi/cảnh báo; build 5 trang; 14/14 kiểm tra đạt; rà soát không còn lỗi cần sửa.

### Chưa hoàn tất

37 nhóm bài còn lại chưa trích nội dung. Chưa chấm điểm, tạo tài khoản, đồng bộ thiết bị hoặc triển khai hosting.

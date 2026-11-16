# CCAR-P Study

Website học song ngữ Anh–Việt bằng Astro 7.4.12, TypeScript và Tailwind CSS v4, tái hiện trang thư viện và các module của khóa học nguồn.

## Đã hoàn thành

- 53 trang học, 38 nhóm bài, 7 chương; 106 tệp Markdown Anh–Việt.
- Giao diện theo nguồn: header, sidebar, nội dung, bảng, khung ghi chú và câu hỏi; hỗ trợ điện thoại.
- 395 Checkpoint tương tác: chọn một, điền chỗ trống bằng lựa chọn, chọn nhiều, ghép cặp và sắp xếp; có thêm bài dự đoán.
- Đổi ngôn ngữ giữ bài và mục đang đọc. Lưu đáp án trong trình duyệt, đồng bộ giữa các thẻ; hoàn thành nhóm chỉ khi mọi phần đạt.
- Vòng tiến độ, tiếp tục phần chưa xong, bài trước/sau và tìm kiếm thư viện.
- URL bài học dùng slug gốc ở cả hai ngôn ngữ. 54 đường dẫn nguồn và 106 URL số cũ vẫn mở được bài và đổi sang slug khi có JavaScript; build thành 269 trang tĩnh, trong đó có 106 trang bài học.
- Tailwind CSS v4 qua Vite, không còn tệp CSS riêng; Prettier `printWidth: 120`.

Giữ nguyên khối mã và ánh xạ đáp án theo nguồn. Có 183 phần giải thích/gợi ý Anh–Việt tự biên soạn; không sao chép lời giải chi tiết ẩn hoặc văn xuôi trích dẫn nguồn. Không có tài khoản, đồng bộ thiết bị hay hosting trong phạm vi này.

## Chạy cục bộ

```bash
nvm install
nvm use
npm ci
npm run dev
```

`.nvmrc` chọn Node 24.15.0. Mở `/vi/` hoặc `/en/`; bài học có dạng `/vi/lessons/from-business-problem-to-claude-solution-design/`. Có thể đổi cổng bằng `npm run dev -- --port 4322`.

## Nội dung và kiểm tra

Nội dung Markdown nằm ở `src/content/lessons/en/` và `vi/`. `scripts/import-course.mjs` nhập dữ liệu nguồn, giữ khối mã, tạo đơn vị dịch và sinh Markdown. Cache HTML ở `.cache/course-source/` được bỏ qua bởi Git.

Bản dịch nằm ở `src/data/translations/`, phần giải thích/gợi ý ở `src/data/trap-explanations/`. Các công cụ `write-translation.mjs` và `write-trap-explanations.mjs` kiểm tra dữ liệu trước khi ghi. Chạy lại trình nhập sau khi cập nhật dữ liệu; không chỉ sửa Markdown được sinh tự động.

```bash
npm run format:check
npm run check
npm run build
node scripts/compare-source.mjs
npx playwright install chromium
npm test
```

Kiểm chứng cuối sau khi chuyển URL slug ngày 2026-11-16: định dạng đạt, Astro 0 lỗi/cảnh báo/gợi ý, build 269 trang, **35/35 kiểm tra đạt**, gồm khởi tạo câu hỏi trên toàn bộ 106 trang. Đối chiếu 395 câu hỏi, 278 khối mã hai ngôn ngữ và 10.338 liên kết: không lỗi. Tiến độ dùng khóa `ccarpp-learning-v2`, có revision nội dung, khóa ghi liên thẻ khi trình duyệt hỗ trợ và dự phòng bộ nhớ.

[Báo cáo kiểm chứng](plans/reports/verification-20261116-lesson-slugs-cleanup.md) · [Lộ trình](docs/development-roadmap.md) · [Kiến trúc](docs/system-architecture.md) · [Ghi chú nguồn](docs/source-extraction-notes.md) · [Ảnh thư viện](plans/reports/course-library.png)

## URL bài học và dọn mã

Ví dụ: `/en/lessons/1.4/` chuyển đến `/en/lessons/multi-agent-system-design-when-to-split-and-how-to-decompose/`. Bản tiếng Việt dùng cùng slug với tiền tố `/vi/`. Liên kết sidebar, bài trước/sau, tiếp tục học, đổi ngôn ngữ và nội dung nhập đều dùng URL slug.

`src/lib/lesson-routes.mjs` là nơi tạo URL và mã trang dùng chung cho Astro và các script nhập/kiểm toán. Mã bài như `1.4` vẫn là khóa dữ liệu và tiến độ; đổi URL không đổi đáp án đã lưu. Với URL số cũ, JavaScript chuẩn hóa thanh địa chỉ bằng `history.replaceState`, giữ query/fragment; khi tắt JavaScript, bài vẫn hiện đầy đủ tại URL số và giữ nguyên vị trí đọc. Đường dẫn nguồn dùng chuyển hướng riêng đến URL slug.

Đã bỏ bộ dữ liệu mẫu `business-problems.json`, các nhãn không dùng, dữ liệu `rationale` mặc định không có nơi đọc, trường thu thập nguồn không dùng và các export nội bộ dư. Dữ liệu câu hỏi giảm từ 349.164 xuống 254.639 byte. Giữ ảnh nguồn, bản dịch, bằng chứng kiểm chứng và mọi dependency còn được dùng.

# URL slug và dọn mã không dùng

Ngày: 2026-11-16. Đã hoàn tất; rà soát độc lập không còn phát hiện cần sửa.

## Thay đổi

- URL chính dùng slug nguồn ở cả Anh và Việt, ví dụ `/en/lessons/multi-agent-system-design-when-to-split-and-how-to-decompose/`.
- Dùng chung `lessonUrl` và `pageId` tại `src/lib/lesson-routes.mjs`; cập nhật mọi nơi tạo liên kết và trình nhập nội dung.
- Giữ mã bài/nhóm, revision và khóa `ccarpp-learning-v2`; đáp án đã lưu không phụ thuộc URL.
- 106 trang URL số cũ vẫn có nội dung đầy đủ. JavaScript chuẩn hóa thanh địa chỉ sang slug bằng `history.replaceState`, giữ query/fragment; khi tắt JavaScript, URL số và vị trí đọc được giữ nguyên.
- 54 đường dẫn nguồn chuyển thẳng đến URL chính; còn hoạt động qua chuyển hướng HTML khi tắt JavaScript.

## Dọn mã có bằng chứng

- Bỏ 11 khóa UI mỗi ngôn ngữ và hai khóa nhãn Checkpoint mỗi ngôn ngữ không có nơi đọc.
- Bỏ export dư của bốn định nghĩa chỉ dùng nội bộ.
- Bỏ `sourceRoot`, bộ gom `extras`, trường `linkId`, tham số `_dom` và trường trả về `originalId` không có nơi dùng.
- Bỏ `rationale` mặc định khỏi bộ sinh, schema và JSON; phản hồi/giải thích đang dùng được giữ nguyên.
- Bỏ JSON bài mẫu `business-problems.json` đã được thay bằng bộ dữ liệu toàn khóa. Ảnh, bản dịch, bằng chứng lịch sử và mọi dependency còn dùng đều được giữ.
- Dữ liệu câu hỏi từ 349.164 xuống 254.639 byte, giảm 94.525 byte.

## Scope Contract

Changed — URL, các nơi tạo liên kết, dữ liệu sinh và mã không dùng đã xác minh.
Impacted — Mọi trang bài, ngôn ngữ, bookmark, mở lại tiến độ và kiểm toán liên kết.
Will verify — Định dạng, kiểu dữ liệu, build, đối chiếu nguồn và toàn bộ kiểm tra trình duyệt.
Deliberately skipped — Dịch vụ ngoài trang học, tài khoản, thanh toán, đồng bộ thiết bị và hosting.

## Kết quả

| Kiểm tra                          | Kết quả                                                                            |
| --------------------------------- | ---------------------------------------------------------------------------------- |
| `npm run format:check`            | Đạt                                                                                |
| `npm run check`                   | 49 tệp; 0 lỗi, 0 cảnh báo, 0 gợi ý                                                 |
| `npm run build`                   | 269 trang; 3,31 giây                                                               |
| `npm test`                        | 35/35 đạt; 11,1 giây                                                               |
| `node scripts/compare-source.mjs` | 53 trang, 395 câu hỏi, 278 khối mã, 10.039 đơn vị dịch, 10.338 liên kết; không lỗi |

Bộ kiểm tra mở đủ 106 trang slug Anh–Việt, thực hiện các dạng câu hỏi, chuyển ngôn ngữ, tiếp tục phần chưa xong, khôi phục đáp án qua URL cũ, query/fragment, bàn phím, bộ nhớ bị chặn và đọc khi tắt JavaScript. Kiểm toán từ chối mọi liên kết nội dung còn dùng URL số.

Phát hiện về bookmark không JavaScript có kiểm tra hồi quy: [lượt RED](../20261116-lesson-slugs-cleanup/no-script-red.txt) thất bại vì chuyển hướng làm mất query/fragment; sau sửa, cùng kiểm tra đạt và xác nhận vị trí đọc cùng thẻ canonical. Reviewer xác nhận đã sửa và không có phát hiện mới.

269 trang gồm 106 bài chính, 106 trang tương thích số, 54 đường dẫn nguồn và ba trang đầu/thư viện. Các file tương thích được giữ có chủ đích để liên kết đã xuất bản vẫn dùng được. Riêng đường dẫn nguồn khi tắt JavaScript có chuyển hướng HTML cơ bản, không giữ query/fragment; bookmark số vẫn giữ đầy đủ.

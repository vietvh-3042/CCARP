# Kiểm chứng toàn khóa song ngữ và Tailwind CSS v4

Ngày: 2026-11-16. Phạm vi đã hoàn tất và được rà soát độc lập.

## Scope Contract

Changed — 53 trang bài nguồn và thư viện, bản dịch, tuyến, giao diện Tailwind, câu hỏi và tiến độ.
Impacted — Tất cả trang và ngôn ngữ, liên kết, mã, đáp án, dữ liệu trình duyệt và bài nhiều phần.
Will verify — Định dạng, kiểu dữ liệu, build, đối chiếu nguồn/mã/đáp án/liên kết và hành vi trình duyệt.
Deliberately skipped — Tài khoản, thanh toán, đồng bộ thiết bị, dịch vụ ngoài trang học và hosting.

## Kết quả cuối

Lượt kiểm chứng do tester thực hiện sau khi ghép đủ nội dung và sửa các phát hiện rà soát:

| Lệnh                              | Kết quả                            |
| --------------------------------- | ---------------------------------- |
| `npm run format`                  | Exit 0                             |
| `npm run format:check`            | Đạt                                |
| `npm run check`                   | 46 tệp, 0 lỗi, 0 cảnh báo, 0 gợi ý |
| `npm run build`                   | 163 trang tĩnh, 2,55 giây          |
| `node scripts/compare-source.mjs` | Không lỗi                          |
| `npm test`                        | 29/29 đạt, 9,9 giây                |

Đối chiếu đủ 53 trang, 395 Checkpoint, 278 khối mã tính trên hai ngôn ngữ, 10.039 đơn vị dịch và 10.338 liên kết nội bộ. Dữ liệu máy đọc: [source-audit.json](../20261116-full-course-tailwind/source-audit.json).

Có 106 Markdown bài học, 54 đường dẫn tương thích nguồn và ba trang chọn ngôn ngữ/thư viện. Không còn tệp CSS độc lập trong `src/`; Tailwind v4 qua Vite, token ở SiteLayout; Prettier 120, Node 24.15.0 qua nvm.

## Hành vi đã kiểm tra

- Mở đủ 106 trang Anh–Việt: mọi câu hỏi khởi tạo, không có lỗi JavaScript.
- Chọn một, điền chỗ trống, chọn nhiều, ghép cặp và sắp xếp: chấm đáp án, thử lại và khôi phục sau tải lại.
- Đổi ngôn ngữ giữ bài/mục và đáp án; hoàn thành bài chỉ khi mọi Checkpoint ở mọi phần đều đúng.
- Thư viện thể hiện tiến độ và tiếp tục phần chưa xong; các đường dẫn gốc chuyển đến bài tương ứng.
- Đồng bộ giữa thẻ; thông báo đến chậm không ghi đè đáp án khác; dữ liệu hỏng và bộ nhớ bị chặn vẫn đọc/làm bài được.
- Menu điện thoại và bàn phím, bố cục desktop, đọc và đổi ngôn ngữ khi tắt JavaScript.
- Phần giải thích mở rộng đúng tình huống ở cả hai ngôn ngữ; ngày không lệch múi giờ.

## Rà soát và giới hạn

Các phát hiện về giải thích sai ngữ cảnh, ghi đè tiến độ liên thẻ, revision thiếu nội dung và hai diễn đạt kỹ thuật đã được sửa và xác nhận lại. Không còn phát hiện trong các phần được rà soát.

183 giải thích/gợi ý được tự biên soạn; lời giải chi tiết ẩn và văn xuôi trích dẫn của nguồn không được sao chép. Tiến độ chỉ lưu trong cùng trình duyệt, không có tài khoản hay đồng bộ thiết bị. Chưa triển khai hosting.

Ảnh đã xem lại: [thư viện](course-library.png), [desktop](course-desktop.png), [điện thoại](course-mobile.png).

Tài liệu được cập nhật sau kiểm chứng; chỉ chạy lại định dạng trên các tài liệu đã sửa.

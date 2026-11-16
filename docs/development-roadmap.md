# Lộ trình phát triển

Cập nhật: 2026-11-16. Đã hoàn thành phạm vi toàn khóa song ngữ và kiểm chứng cuối.

| Hạng mục                                                                   | Trạng thái |
| -------------------------------------------------------------------------- | ---------- |
| 53 trang nguồn, 38 nhóm bài, 7 chương và ảnh đối chiếu                     | Hoàn tất   |
| 106 Markdown Anh–Việt, giữ mã và liên kết                                  | Hoàn tất   |
| 395 Checkpoint tương tác và bài luyện dự đoán                              | Hoàn tất   |
| 183 phần giải thích/gợi ý song ngữ tự biên soạn                            | Hoàn tất   |
| Giao diện theo nguồn, Tailwind v4, Prettier 120                            | Hoàn tất   |
| Đổi ngôn ngữ, tiến độ, nhiều thẻ và hoàn thành bài nhiều phần              | Hoàn tất   |
| URL slug, 54 đường dẫn nguồn và 106 URL số cũ; 269 trang tĩnh              | Hoàn tất   |
| Định dạng, kiểu dữ liệu, build, đối chiếu nguồn và 35 kiểm tra trình duyệt | Đạt        |
| Rà soát độc lập và sửa các phát hiện                                       | Hoàn tất   |

Đối chiếu cuối: 278 khối mã trên hai ngôn ngữ, 10.039 đơn vị dịch và 10.338 liên kết nội bộ; không phát hiện lỗi. Lượt kiểm tra trình duyệt mở đủ 106 trang bài học. Các phát hiện về giải thích sai ngữ cảnh, ghi đè đáp án giữa thẻ, revision thiếu nội dung, định tuyến tĩnh và lệch ngày đã được sửa.

Tài khoản, thanh toán, đồng bộ thiết bị và triển khai hosting nằm ngoài phạm vi đã thực hiện.

[Báo cáo kiểm chứng](../plans/reports/verification-20261116-lesson-slugs-cleanup.md) · [Kế hoạch](../plans/20261116-lesson-slugs-cleanup/plan.md) · [Nhật ký](project-changelog.md)

## Chuyển URL slug và dọn mã

Đã chuyển mọi trang bài học và liên kết sang slug nguồn, giữ mã bài làm khóa tiến độ. URL số cũ chuyển sang slug; đã xác minh query, fragment, hai ngôn ngữ, bài nhiều phần và chế độ không JavaScript. Đã dọn nhãn, dữ liệu mặc định, bộ bài mẫu và export nội bộ không dùng. Kiểm chứng cuối đạt: định dạng hợp lệ; Astro 49 tệp, không lỗi/cảnh báo/gợi ý; build 269 trang; 35/35 kiểm tra đạt; đối chiếu 10.338 liên kết không lỗi. Rà soát độc lập đã xác nhận sửa trường hợp bookmark không JavaScript.

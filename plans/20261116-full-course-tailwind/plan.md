# Toàn khóa song ngữ với Tailwind CSS v4

## Phạm vi

Tái hiện thư viện và 53 trang nguồn thuộc 38 nhóm bài, 7 chương; giữ bố cục nguồn, đổi Anh–Việt và tiến độ trong trình duyệt. Hỗ trợ 395 câu kiểm tra cùng bài luyện dự đoán: chọn một, điền chỗ trống, chọn nhiều, ghép cặp và sắp xếp.

Astro 7.4.12, Tailwind v4 qua Vite, không CSS độc lập; khối `@theme` ở SiteLayout. Prettier 120 và Node 24.15.0 qua nvm.

## Giai đoạn

| Giai đoạn                                                                        | Trạng thái              |
| -------------------------------------------------------------------------------- | ----------------------- |
| Kiểm kê và lưu 53 trang nguồn, 38 nhóm bài, 7 chương                             | Hoàn tất                |
| Nhập nội dung tiếng Anh, mã, đáp án và liên kết                                  | Hoàn tất, đã kiểm toán  |
| Dịch toàn bộ và ghép bản đồ dịch                                                 | Hoàn tất                |
| Giao diện Tailwind, mọi dạng câu hỏi, lưu đáp án và tiến độ nhóm                 | Hoàn tất, đã kiểm chứng |
| Định dạng, kiểu dữ liệu, build, kiểm toán nguồn/liên kết, trình duyệt và rà soát | Đạt                     |

Đã xác nhận 106 Markdown và 163 trang tĩnh, gồm 54 đường dẫn tương thích nguồn; 29/29 kiểm tra đạt, đối chiếu nguồn không lỗi.

## Phân công và phụ thuộc

- Lượt chính: trình nhập, schema, nội dung sinh, đáp án, tương tác, tuyến bài, kiểm thử và kết luận cuối.
- Nhóm giao diện: layout/component, thư viện, chọn ngôn ngữ và loại CSS cũ.
- Nhóm dịch: chỉ bản đồ dịch được phân công; lưu qua `scripts/write-translation.mjs`.
- Tài liệu: đồng bộ đúng phạm vi; đã ghi kết quả kiểm chứng cuối.
- Giải thích bẫy: bản đồ Anh–Việt tự biên soạn ở `src/data/trap-explanations/`; đã tích hợp đủ 183 giải thích/gợi ý, không sao chép lời giải ẩn.
- Phụ thuộc: đủ bản đồ dịch và bản đồ giải thích bẫy → tích hợp → chạy lại `scripts/import-course.mjs` → build → `scripts/compare-source.mjs` và kiểm thử trình duyệt → rà soát → ghi kết quả.

## Điều kiện hoàn tất

- Đủ hai ngôn ngữ, giữ khối mã, số liệu, ID, dấu `#` và ánh xạ đáp án theo nguồn.
- Phản hồi đúng liệt kê đáp án thực tế và nguồn; loại lời giải chi tiết ẩn và văn xuôi trích dẫn nguồn.
- Khóa `ccarpp-learning-v2` lưu đáp án theo revision và hoàn thành nhóm; nạp/chuẩn hóa bài mới nhất trước khi sửa, khóa ghi liên thẻ bằng `navigator.locks` khi khả dụng, dự phòng bộ nhớ khi lỗi lưu trữ hoặc bị từ chối khóa.
- Revision xét `contentHash`, số lựa chọn/số mục và định nghĩa bài dự đoán cùng đáp án; thay đổi nội dung không được giữ nhầm tiến độ cũ.
- Chỉ hoàn thành khi mọi phần trong nhóm đạt; thư viện hiển thị vòng tiến độ, tiếp tục học và trang bài có trước/sau.
- Chỉ đánh dấu hoàn tất sau khi có kiểm chứng và rà soát cuối thực tế.

## Scope Contract

Changed — Nội dung toàn khóa, tuyến, câu hỏi, trạng thái học và giao diện/build Tailwind.
Impacted — Mọi trang, ngôn ngữ, liên kết nguồn, dạng câu hỏi, dữ liệu lưu và giao diện thích ứng.
Will verify — Kiểm kê và nguồn toàn khóa, mã/đáp án/liên kết, mọi dạng câu hỏi, định dạng/kiểu/build/trình duyệt và rà soát cuối.
Deliberately skipped — Tài khoản, thanh toán, đồng bộ thiết bị, dịch vụ ngoài phạm vi và triển khai hosting.

## Tài liệu liên quan

[Lộ trình](../../docs/development-roadmap.md) · [Ghi chú nguồn](../../docs/source-extraction-notes.md) · [Kiến trúc](../../docs/system-architecture.md)

## Kết quả

Định dạng đạt; Astro 0 lỗi/cảnh báo/gợi ý; 163 trang tĩnh; 29/29 kiểm tra đạt. Kiểm toán 395 câu hỏi, 278 khối mã, 10.039 đơn vị dịch và 10.338 liên kết: không lỗi. Rà soát độc lập hoàn tất.

[Báo cáo bàn giao](../reports/verification-20261116-full-course-tailwind.md)

// prompts/face_swap.ts

export const FACE_SWAP_PROMPT = `
**Nhiệm vụ:** Hoán đổi khuôn mặt chuyên nghiệp.

**Vai trò:** Bạn là một chuyên gia retoucher kỹ thuật số với kỹ năng cao trong việc ghép ảnh chân thực.

**Thông tin đầu vào:**
- **Ảnh 1 (Ảnh mục tiêu):** Chứa người mẫu, cơ thể, quần áo, kiểu tóc, và bối cảnh cần được giữ lại.
- **Ảnh 2 (Ảnh nguồn):** Chứa khuôn mặt sẽ được sử dụng để thay thế.

**Yêu cầu nghiêm ngặt:**
1.  **Trích xuất khuôn mặt:** Chỉ trích xuất các đặc điểm khuôn mặt (mắt, mũi, miệng, cằm, cấu trúc xương má) từ Ảnh 2.
2.  **Ghép chính xác:** Ghép khuôn mặt đã trích xuất từ Ảnh 2 vào vị trí khuôn mặt trên Ảnh 1.
3.  **Giữ nguyên tuyệt đối:** Giữ lại **TẤT CẢ** các yếu tố khác từ Ảnh 1. Cụ thể:
    - **Tóc:** Không thay đổi kiểu tóc, màu tóc, hoặc đường chân tóc.
    - **Quần áo & Cơ thể:** Không thay đổi quần áo, vóc dáng, tư thế, hoặc bất kỳ phần nào của cơ thể.
    - **Bối cảnh:** Không thay đổi nền, ánh sáng, hoặc bất kỳ vật thể nào xung quanh.
    - **Tông màu da:** Điều chỉnh tông màu da của khuôn mặt mới để hoàn toàn khớp với tông màu da trên cổ và cơ thể của Ảnh 1.
4.  **Kết quả tự nhiên:** Kết quả cuối cùng phải trông hoàn toàn tự nhiên, liền mạch, không có dấu hiệu chỉnh sửa. Ảnh phải có độ phân giải cao và sắc nét.

**KHÔNG ĐƯỢC LÀM:**
- **KHÔNG** thay đổi tóc.
- **KHÔNG** thay đổi quần áo.
- **KHÔNG** thay đổi nền.
- **KHÔNG** thay đổi hình dáng cơ thể.
- **KHÔNG** thay đổi ánh sáng tổng thể của Ảnh 1.

Thực hiện hoán đổi khuôn mặt một cách hoàn hảo.
`;

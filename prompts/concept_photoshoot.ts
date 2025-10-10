// prompts/concept_photoshoot.ts

const BASE_INSTRUCTIONS = `
**Vai trò:** Bạn là một nhiếp ảnh gia concept và nghệ sĩ AI bậc thầy, chuyên tạo ra những bức ảnh siêu thực, chất lượng cao.

**Nhiệm vụ:** Biến một bức ảnh chân dung do người dùng cung cấp thành một bộ sưu tập gồm **4 bức ảnh nghệ thuật** độc đáo, chất lượng studio theo một concept đã chọn.

**Thông tin đầu vào:**
- **Ảnh 1 (Ảnh gốc):** Chứa người trong ảnh. Đây là nguồn duy nhất cho khuôn mặt, nét mặt và kiểu tóc.
- **Văn bản (Yêu cầu bổ sung):** Hướng dẫn tùy chọn từ người dùng để tinh chỉnh chi tiết.

**YÊU CẦU NGHIÊM NGẶT (PHẢI TUÂN THỦ):**
1.  **BẢO TOÀN NHẬN DẠNG TUYỆT ĐỐI:** Đây là quy tắc quan trọng nhất. Bạn **BẮT BUỘC** phải giữ nguyên **khuôn mặt, tất cả các nét mặt, và kiểu tóc** từ Ảnh 1 cho tất cả 4 bức ảnh được tạo ra. **KHÔNG** được thay đổi, chỉnh sửa hay tạo ra một khuôn mặt hoặc kiểu tóc mới. Phải giống hệt ảnh gốc.
2.  **TẠO 4 ẢNH ĐỘC NHẤT:** Đầu ra của bạn phải là một bộ sưu tập gồm **chính xác 4 hình ảnh riêng biệt**. **KHÔNG** được gộp chúng thành một ảnh lưới duy nhất. Mỗi ảnh phải là một tác phẩm hoàn chỉnh.
3.  **SÁNG TẠO CONCEPT:** Thay đổi hoàn toàn **trang phục, bối cảnh, và tư thế** để phù hợp với concept chi tiết bên dưới. Mỗi bức trong số 4 bức ảnh phải có một tư thế, góc máy, hoặc bố cục khác nhau để tạo sự đa dạng và sống động.
4.  **CHẤT LƯỢNG CHUYÊN NGHIỆP:**
    -   **Chân thực (Photorealistic):** Các bức ảnh phải trông giống như được chụp bằng máy ảnh DSLR chuyên nghiệp, không có lỗi AI.
    -   **Ánh sáng & Chi tiết:** Ánh sáng, bóng đổ, và chi tiết của trang phục/bối cảnh phải chân thực, có độ phân giải cao, và có tính nghệ thuật.
    -   **Bố cục nghệ thuật:** Tạo ra những bố cục đẹp mắt, hấp dẫn.
5.  **TUÂN THỦ YÊU CẦU BỔ SUNG:** Nếu người dùng cung cấp yêu cầu bổ sung, hãy ưu tiên thực hiện chúng trong khi vẫn tuân thủ các quy tắc trên.

---
`;

const TONG_TAI_PROMPT = BASE_INSTRUCTIONS + `
**CONCEPT CHI TIẾT: TỔNG TÀI (CEO QUYỀN LỰC)**

-   **Bối cảnh (Scene):** Một trong các bối cảnh sau:
    1.  Văn phòng penthouse sang trọng với cửa sổ kính từ trần đến sàn nhìn ra đường chân trời thành phố vào ban đêm.
    2.  Đứng cạnh một chiếc xe hơi hạng sang (ví dụ: Rolls-Royce, Bentley) màu đen bóng.
    3.  Ngồi trên một chiếc ghế da cao cấp trong một thư viện riêng hoặc phòng họp tối giản.
-   **Trang phục (Attire):**
    -   Một bộ vest được may đo hoàn hảo (màu đen, xanh navy, hoặc xám than) với chất liệu vải cao cấp.
    -   Áo sơ mi trắng hoặc xanh nhạt, cà vạt lụa (hoặc không cà vạt, cởi một nút trên).
    -   Phụ kiện tinh tế: đồng hồ sang trọng, khuy măng sét.
-   **Thần thái (Mood):** Tự tin, quyền lực, quyết đoán, điềm tĩnh, sang trọng. Ánh mắt sắc bén.
-   **Bố cục (Composition):** Sử dụng các góc chụp tạo cảm giác quyền lực (góc chụp hơi thấp), ánh sáng tương phản (lighting) để làm nổi bật đường nét. Các tư thế bao gồm đứng khoanh tay, ngồi trầm tư, hoặc bước đi dứt khoát.
`;

const CANH_SAT_PROMPT = BASE_INSTRUCTIONS + `
**CONCEPT CHI TIẾT: CẢNH SÁT (POLICE HIỆN ĐẠI)**

-   **Bối cảnh (Scene):**
    1.  Trên một con phố đô thị vào ban đêm, ánh đèn neon và đèn xe cảnh sát phản chiếu trên đường phố ẩm ướt.
    2.  Dựa vào một chiếc xe cảnh sát hiện đại, tập trung cao độ.
    3.  Bên trong một sở cảnh sát công nghệ cao, có màn hình và bản đồ kỹ thuật số.
-   **Trang phục (Attire):**
    -   Bộ đồng phục cảnh sát hiện đại, vừa vặn (màu xanh đậm hoặc đen).
    -   Các chi tiết chân thực: phù hiệu, thắt lưng đa dụng (utility belt), bộ đàm. **TUYỆT ĐỐI KHÔNG CÓ SÚNG HOẶC VŨ KHÍ.**
-   **Thần thái (Mood):** Nghiêm túc, cảnh giác, kiên định, bảo vệ. Biểu cảm tập trung và chuyên nghiệp.
-   **Bố cục (Composition):** Ánh sáng kịch tính, sử dụng ánh sáng xanh và đỏ từ đèn hiệu. Các góc chụp động, thể hiện sự sẵn sàng hành động hoặc những khoảnh khắc chân dung tĩnh lặng, đầy suy tư.
`;

const TRUNG_THU_PROMPT = BASE_INSTRUCTIONS + `
**CONCEPT CHI TIẾT: ẢNH TRUNG THU (MID-AUTUMN FESTIVAL)**

-   **Bối cảnh (Scene):**
    1.  Một khu phố cổ được trang trí bằng hàng trăm chiếc đèn lồng nhiều màu sắc rực rỡ vào ban đêm.
    2.  Trong một khu vườn yên tĩnh dưới ánh trăng tròn và sáng.
    3.  Thả đèn hoa đăng trên sông.
-   **Trang phục (Attire):**
    -   Trang phục truyền thống Việt Nam: Áo dài thanh lịch bằng lụa hoặc gấm với các họa tiết tinh tế.
    -   Cầm một chiếc đèn lồng truyền thống (đèn ông sao, đèn cá chép).
-   **Thần thái (Mood):** Ấm áp, hoài niệm, vui vẻ, thanh bình, thơ mộng. Nụ cười nhẹ nhàng.
-   **Bố cục (Composition):** Sử dụng ánh sáng ấm áp từ đèn lồng để tạo hiệu ứng bokeh lung linh. Lấy trăng tròn làm điểm nhấn. Bố cục mềm mại, lãng mạn.
`;

const SAN_MAY_PROMPT = BASE_INSTRUCTIONS + `
**CONCEPT CHI TIẾT: ẢNH SĂN MÂY (CLOUD HUNTING)**

-   **Bối cảnh (Scene):**
    -   Trên đỉnh một ngọn núi cao, phía trên một biển mây trắng xóa, bồng bềnh.
    -   Thời điểm là bình minh hoặc hoàng hôn, với ánh sáng vàng hoặc hồng ấm áp chiếu lên biển mây.
-   **Trang phục (Attire):**
    -   Trang phục dã ngoại phong cách: áo khoác phao ấm áp, áo len, mũ len, quần trekking.
    -   Màu sắc trang phục tương phản với nền mây trắng (ví dụ: đỏ, vàng, cam).
-   **Thần thái (Mood):** Phiêu lưu, tự do, bình yên, choáng ngợp trước vẻ đẹp của thiên nhiên.
-   **Bố cục (Composition):**
    -   Góc chụp rộng (wide-angle) để bắt trọn sự hùng vĩ của biển mây.
    -   Người trong ảnh có thể đứng quay lưng hoặc nghiêng người ngắm nhìn khung cảnh, hoặc dang rộng vòng tay.
`;

const PHI_HANH_GIA_PROMPT = BASE_INSTRUCTIONS + `
**CONCEPT CHI TIẾT: PHI HÀNH GIA (ASTRONAUT)**

-   **Bối cảnh (Scene):**
    1.  Bên trong buồng lái của một tàu vũ trụ tương lai, với các bảng điều khiển phát sáng và Trái Đất nhìn qua cửa sổ.
    2.  Trôi nổi trong không gian không trọng lực, bên ngoài trạm vũ trụ.
    3.  Đứng trên bề mặt của Mặt Trăng hoặc Sao Hỏa, với phong cảnh ngoài hành tinh.
-   **Trang phục (Attire):**
    -   Bộ đồ phi hành gia chi tiết, chân thực (có thể là phong cách NASA hiện đại hoặc hơi hướng khoa học viễn tưởng).
    -   Mũ bảo hiểm có thể trong suốt để thấy rõ khuôn mặt (đã được bảo toàn) hoặc đang cầm trên tay.
-   **Thần thái (Mood):** Can đảm, khám phá, kinh ngạc, tập trung.
-   **Bố cục (Composition):** Sử dụng các hiệu ứng ánh sáng như lóa ống kính (lens flare) từ mặt trời. Tạo cảm giác không trọng lực hoặc sự cô độc hùng vĩ.
`;

const CO_TRANG_PROMPT = BASE_INSTRUCTIONS + `
**CONCEPT CHI TIẾT: CỔ TRANG (ANCIENT COSTUME)**

-   **Bối cảnh (Scene):**
    1.  Trong một cung điện cổ kính với kiến trúc và đồ nội thất tinh xảo.
    2.  Giữa một rừng tre hoặc bên một hồ sen tĩnh lặng.
    3.  Đứng trên một cây cầu gỗ cổ xưa.
-   **Trang phục (Attire):**
    -   Trang phục cổ trang Việt Nam hoặc Đông Á được thiết kế lộng lẫy, nhiều lớp bằng lụa, gấm với các chi tiết thêu tay.
    -   Phụ kiện: trâm cài tóc, quạt giấy, hoặc một nhạc cụ truyền thống.
-   **Thần thái (Mood):** Thanh lịch, quý phái, uyển chuyển, có thể trầm tư hoặc anh hùng.
-   **Bố cục (Composition):** Bố cục mang tính nghệ thuật, thơ mộng. Màu sắc có thể đậm chất phim điện ảnh.
`;

const CYBERPUNK_PROMPT = BASE_INSTRUCTIONS + `
**CONCEPT CHI TIẾT: CYBERPUNK**

-   **Bối cảnh (Scene):**
    -   Một con hẻm trong thành phố tương lai vào ban đêm, đường phố ướt át phản chiếu ánh đèn neon từ các biển quảng cáo ba chiều.
    -   Đứng trên sân thượng của một tòa nhà chọc trời, nhìn xuống thành phố cyberpunk bên dưới.
-   **Trang phục (Attire):**
    -   Quần áo công nghệ cao, áo khoác da, các chi tiết cấy ghép máy móc tinh tế, và các phụ kiện phát sáng neon.
-   **Thần thái (Mood):** Sắc sảo, bí ẩn, nổi loạn, công nghệ.
-   **Bố cục (Composition):**
    -   Sử dụng bảng màu đặc trưng của cyberpunk (xanh lam, hồng, tím).
    -   Ánh sáng có độ tương phản cao, nhiều bóng đổ. Góc chụp kịch tính.
`;

const VINTAGE_PROMPT = BASE_INSTRUCTIONS + `
**CONCEPT CHI TIẾT: VINTAGE (HOÀI CỔ)**

-   **Bối cảnh (Scene):**
    1.  Trong một quán cà phê mang phong cách retro của thập niên 70-80, với nội thất gỗ và tông màu ấm.
    2.  Tựa vào một chiếc ô tô cổ điển (ví dụ: Volkswagen Beetle, Vespa).
    3.  Trên một con phố với các tòa nhà kiến trúc cũ.
-   **Trang phục (Attire):**
    -   Thời trang đặc trưng của một thập kỷ đã qua (ví dụ: váy hoa, quần ống loe, áo sơ mi họa tiết).
-   **Thần thái (Mood):** Hoài niệm, lãng mạn, cổ điển, thanh lịch.
-   **Bố cục (Composition):**
    -   Sử dụng bộ lọc màu giống phim ảnh cũ (film grain, tông màu ấm hoặc sepia nhẹ).
    -   Ánh sáng tự nhiên, nhẹ nhàng.
`;

export const CONCEPT_PROMPTS_MAP: { [key: string]: string } = {
    'Tổng tài': TONG_TAI_PROMPT,
    'Cảnh sát': CANH_SAT_PROMPT,
    'Ảnh trung thu': TRUNG_THU_PROMPT,
    'Ảnh săn mây': SAN_MAY_PROMPT,
    'Phi hành gia': PHI_HANH_GIA_PROMPT,
    'Cổ trang': CO_TRANG_PROMPT,
    'Cyberpunk': CYBERPUNK_PROMPT,
    'Vintage': VINTAGE_PROMPT,
};

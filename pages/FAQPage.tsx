import React, { useState } from 'react';

interface FAQItemProps {
  question: string;
  children: React.ReactNode;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-200 dark:border-slate-700 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left text-lg font-semibold text-slate-800 dark:text-slate-200"
      >
        <span>{question}</span>
        <svg
          className={`w-6 h-6 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-screen mt-4' : 'max-h-0'
        }`}
      >
        <div className="text-slate-600 dark:text-slate-400 prose dark:prose-invert max-w-none">
          {children}
        </div>
      </div>
    </div>
  );
};

const FAQPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-extrabold text-center mb-8">Các câu hỏi thường gặp</h1>
      <div className="space-y-4">
        <FAQItem question="AI Nano Banana là gì?">
          <p>
            AI Nano Banana là tên mã của mô hình chỉnh sửa ảnh tiên tiến của Google, <code>gemini-2.5-flash-image-preview</code>. Đây là một AI chuyên dụng được thiết kế để xử lý hình ảnh chất lượng cao, tốc độ cao dựa trên các câu lệnh văn bản. Nó cho phép chỉnh sửa trực quan và sáng tạo mà không cần phần mềm phức tạp.
          </p>
        </FAQItem>
        <FAQItem question="Quá trình tạo ảnh hoạt động như thế nào?">
          <p>
            Quá trình rất đơn giản:
          </p>
          <ol>
            <li>Bạn tải lên một hình ảnh ban đầu.</li>
            <li>Bạn viết một câu lệnh văn bản mô tả thay đổi bạn muốn thực hiện (ví dụ: "thêm một chiếc mũ," "thay đổi nền thành bãi biển").</li>
            <li>Ứng dụng của chúng tôi gửi hình ảnh và câu lệnh của bạn đến AI.</li>
            <li>AI phân tích cả hai và tạo ra một hình ảnh mới dựa trên hướng dẫn của bạn, sau đó xuất hiện trên màn hình của bạn.</li>
          </ol>
        </FAQItem>
        <FAQItem question="Dữ liệu của tôi có an toàn và riêng tư không?">
          <p>
            <strong>Hoàn toàn có.</strong> Quyền riêng tư của bạn là ưu tiên hàng đầu của chúng tôi. Tất cả dữ liệu của bạn, bao gồm hình ảnh đã tải lên, hình ảnh đã tạo, khóa API và lịch sử sáng tạo, được lưu trữ độc quyền trên thiết bị của riêng bạn bằng bộ nhớ cục bộ của trình duyệt. Không có gì được lưu trên máy chủ của chúng tôi.
          </p>
        </FAQItem>
         <FAQItem question="Tôi có cần API Key để sử dụng Lensy Studio không?">
          <p>
            Để mục đích trình diễn, ứng dụng có thể sử dụng khóa API mặc định, được cấu hình sẵn. Tuy nhiên, để sử dụng rộng rãi hơn hoặc cho mục đích cá nhân, bạn có thể thêm khóa API Google Gemini của riêng mình trên trang <strong>Cài đặt</strong>. Khóa của bạn được lưu an toàn trong trình duyệt của bạn và không bao giờ được lưu trữ trên máy chủ của chúng tôi.
          </p>
        </FAQItem>
        <FAQItem question="Tôi có thể thực hiện những loại chỉnh sửa nào?">
          <p>
            Bạn có thể thực hiện rất nhiều loại chỉnh sửa! Điều này bao gồm thêm hoặc bớt đối tượng, thay đổi nền, thay đổi phong cách (ví dụ: làm cho ảnh trông giống như một bức tranh), thay đổi màu sắc, và nhiều hơn nữa. Giới hạn duy nhất là trí tưởng tượng của bạn. Hãy thử nghiệm với các câu lệnh khác nhau để xem những gì có thể!
          </p>
        </FAQItem>
      </div>
    </div>
  );
};

export default FAQPage;

import React, { useEffect } from 'react';
import { XIcon } from './Icons';

interface ApiKeyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeyGuideModal: React.FC<ApiKeyGuideModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 dark:bg-black/70 z-50 flex justify-center items-center backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="apiKeyModalTitle"
    >
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
      <div 
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full p-6 sm:p-8 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-700 pb-4 mb-4">
          <h2 id="apiKeyModalTitle" className="text-xl font-bold text-slate-900 dark:text-white">
            Làm thế nào để lấy Khóa API Google Gemini?
          </h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Đóng"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="text-slate-600 dark:text-slate-300 space-y-4">
          <p>
            Để sử dụng đầy đủ các tính năng của Lensy Studio, bạn cần có Khóa API Google Gemini. Dưới đây là cách lấy khóa của riêng bạn:
          </p>
          <ol className="list-decimal list-inside space-y-3 pl-2">
            <li>
              Truy cập trang web{' '}
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 font-medium hover:underline">
                Google AI Studio
              </a>.
            </li>
            <li>Đăng nhập bằng tài khoản Google của bạn nếu được yêu cầu.</li>
            <li>
              Nhấp vào nút "<b>Tạo khóa API</b>" (Get API key).
            </li>
            <li>
              Bạn có thể được yêu cầu tạo một dự án mới trên Google Cloud. Chỉ cần làm theo hướng dẫn trên màn hình.
            </li>
            <li>
              Sau khi tạo, khóa API của bạn (một chuỗi ký tự dài) sẽ được hiển thị. Nhấp vào biểu tượng sao chép để sao chép nó.
            </li>
            <li>
              Quay lại trang này, dán khóa vào trường "<b>Khóa API Gemini</b>" và nhấp vào "<b>Lưu khóa</b>".
            </li>
          </ol>
          <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-300 p-4 rounded-r-lg" role="alert">
            <p className="font-bold">Quan trọng</p>
            <p>Hãy giữ khóa API của bạn an toàn và không chia sẻ công khai.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyGuideModal;

import React, { useEffect } from 'react';
import { CogIcon } from './Icons';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onNavigate }) => {
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

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 dark:bg-black/70 z-50 flex justify-center items-center backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="apiKeyRequiredModalTitle"
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                <CogIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
        </div>
        <h2 id="apiKeyRequiredModalTitle" className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Yêu cầu nhập API Key
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Để sử dụng tính năng này, bạn cần cung cấp API Key Google Gemini của riêng mình trong trang Cài đặt.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={onClose} 
            className="w-full order-2 sm:order-1 justify-center py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-full shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
          >
            Đóng
          </button>
          <button 
            onClick={onNavigate} 
            className="w-full order-1 sm:order-2 justify-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
          >
            Đi đến Cài đặt
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;

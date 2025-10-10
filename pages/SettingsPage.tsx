
import React from 'react';
import { SunIcon, MoonIcon, QuestionMarkCircleIcon } from '../components/Icons';
import { useTheme } from '../contexts/ThemeContext';
import ApiKeyGuideModal from '../components/ApiKeyGuideModal';

const SettingsPage: React.FC = () => {
  const [apiKey, setApiKey] = React.useState('');
  const [saveStatus, setSaveStatus] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { theme, setTheme } = useTheme();

  React.useEffect(() => {
    const savedKey = localStorage.getItem('gemini-api-key') || '';
    setApiKey(savedKey);
  }, []);

  const handleSaveApiKey = () => {
    const trimmedApiKey = apiKey.trim();
    localStorage.setItem('gemini-api-key', trimmedApiKey);
    setApiKey(trimmedApiKey); // Keep UI in sync with what's stored
    setSaveStatus('Đã lưu khóa API thành công!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('gemini-api-key');
    setApiKey('');
    setSaveStatus('Đã xóa khóa API.');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-4xl font-extrabold text-center mb-8">Cài đặt</h1>
      
      {/* API Key Settings */}
      <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Cấu hình API Key</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Cung cấp khóa API Google Gemini của riêng bạn. Khóa của bạn được lưu trữ an toàn trong bộ nhớ cục bộ của trình duyệt và không bao giờ được gửi đến máy chủ của chúng tôi. Nếu không có khóa nào được cung cấp, ứng dụng sẽ sử dụng khóa mặc định cho mục đích trình diễn.
        </p>
        <div className="space-y-4">
          <div>
             <div className="flex justify-between items-center mb-1">
                <label htmlFor="api-key" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Khóa API Gemini
                </label>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                    aria-label="Tìm hiểu cách lấy Khóa API Gemini"
                >
                    <QuestionMarkCircleIcon className="w-4 h-4" />
                    <span>Làm thế nào để lấy khóa?</span>
                </button>
            </div>
            <input
              type="password"
              id="api-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="mt-1 block w-full rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
              placeholder="Nhập khóa API của bạn"
            />
          </div>
          <div className="flex items-center justify-between">
             <div className="flex gap-2">
                <button
                    onClick={handleSaveApiKey}
                    className="inline-flex justify-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                    Lưu khóa
                </button>
                <button
                    onClick={handleClearApiKey}
                    className="inline-flex justify-center py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-full shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                    Xóa khóa
                </button>
            </div>
            {saveStatus && <p className="text-sm text-emerald-500">{saveStatus}</p>}
          </div>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Giao diện</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Chọn giao diện của Lensy Studio. Lựa chọn của bạn sẽ được lưu cho lần truy cập tiếp theo.
        </p>
        <div className="flex gap-4">
            <button
                onClick={() => setTheme('light')}
                className={`flex-1 p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${theme === 'light' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30' : 'border-slate-300 dark:border-slate-600 hover:border-purple-400'}`}
            >
                <SunIcon className="w-8 h-8 mb-2 text-slate-700 dark:text-slate-300"/>
                <span className="font-semibold">Chế độ sáng</span>
            </button>
            <button
                onClick={() => setTheme('dark')}
                className={`flex-1 p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${theme === 'dark' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30' : 'border-slate-300 dark:border-slate-600 hover:border-purple-400'}`}
            >
                <MoonIcon className="w-8 h-8 mb-2 text-slate-700 dark:text-slate-300"/>
                <span className="font-semibold">Chế độ tối</span>
            </button>
        </div>
      </div>

      <ApiKeyGuideModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default SettingsPage;
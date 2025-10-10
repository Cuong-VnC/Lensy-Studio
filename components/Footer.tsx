import React from 'react';
import { CameraIcon } from './Icons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-slate-500 dark:text-slate-400">
        <div className="flex justify-center items-center gap-2 mb-2">
           <CameraIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
           <span className="text-lg font-bold text-slate-800 dark:text-slate-200">Lensy Studio</span>
        </div>
        <p>&copy; {new Date().getFullYear()} Lensy Studio. Bảo lưu mọi quyền.</p>
        <p className="text-sm mt-1">Biến trí tưởng tượng thành hiện thực với Lensy Studio.</p>
      </div>
    </footer>
  );
};

export default Footer;
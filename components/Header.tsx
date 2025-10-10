import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { CameraIcon, MenuIcon, XIcon, CogIcon } from './Icons';


const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { to: '/', text: 'Trang chủ' },
    { to: '/studio', text: 'Studio' },
    { to: '/prompts', text: 'Prompt Mẫu'},
    { to: '/faq', text: 'Hỏi đáp' },
    { to: '/contact', text: 'Liên hệ' },
  ];

  const settingsLink = { to: '/settings', text: 'Cài đặt' };

  const linkClasses = "text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium";
  const activeLinkClasses = "text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50";
  
  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NavLink to="/" className="flex-shrink-0 flex items-center gap-2">
              <CameraIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <span className="text-xl font-bold text-slate-900 dark:text-white">Lensy Studio</span>
            </NavLink>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
                >
                  {link.text}
                </NavLink>
              ))}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
             <NavLink 
                to={settingsLink.to} 
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" 
                aria-label={settingsLink.text}
             >
                <CogIcon className="w-6 h-6" />
             </NavLink>
             <ThemeToggle />
          </div>
          <div className="-mr-2 flex md:hidden">
             <div className="mr-2">
                <ThemeToggle />
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white"
            >
              <span className="sr-only">Mở menu chính</span>
              {isOpen ? <XIcon className="block h-6 w-6" /> : <MenuIcon className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {[...navLinks, settingsLink].map((link) => (
               <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `block ${linkClasses} ${isActive ? activeLinkClasses : ''}`}
              >
                {link.text}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
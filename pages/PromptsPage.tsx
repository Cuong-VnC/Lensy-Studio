import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCopyIcon, CheckIcon, SparklesIcon, SearchIcon, PencilIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/Icons';
import ApiKeyModal from '../components/ApiKeyModal';

interface PromptTemplate {
  title: string;
  description: string;
  prompt: string;
  previewImage: string;
}

const CustomStyles = () => (
  <style>{`
    .prompt-scrollbar::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    .prompt-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .prompt-scrollbar::-webkit-scrollbar-thumb {
      background-color: rgb(148 163 179 / 0.5);
      border-radius: 20px;
    }
    .dark .prompt-scrollbar::-webkit-scrollbar-thumb {
      background-color: rgb(100 115 135 / 0.7);
    }
    .prompt-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: rgb(148 163 179 / 0.5) transparent;
    }
  `}</style>
);

const Pagination: React.FC<{
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}> = ({ totalPages, currentPage, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="flex justify-center items-center gap-2 mt-12" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Trang trước"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>
      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
            currentPage === number
              ? 'bg-purple-600 text-white'
              : 'hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          aria-current={currentPage === number ? 'page' : undefined}
        >
          {number}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Trang tiếp theo"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </nav>
  );
};


const PromptsPage: React.FC = () => {
  const [copiedTitle, setCopiedTitle] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [promptTemplates, setPromptTemplates] = useState<PromptTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const PROMPTS_PER_PAGE = 9;

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const response = await fetch('./prompts/template_prompts.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: PromptTemplate[] = await response.json();
        setPromptTemplates(data);
      } catch (e) {
        console.error("Failed to fetch prompts:", e);
        setError('Không thể tải các prompt mẫu. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompts();
  }, []);

  const handleCopy = (promptText: string, title: string) => {
    navigator.clipboard.writeText(promptText.trim()).then(
      () => {
        setCopiedTitle(title);
        setTimeout(() => setCopiedTitle(null), 2500);
      },
      (err) => {
        console.error('Could not copy text: ', err);
        alert('Không thể sao chép prompt.');
      }
    );
  };
  
  const handleUseTemplate = (prompt: string) => {
    const userApiKey = localStorage.getItem('gemini-api-key');
    if (!userApiKey || userApiKey.trim() === '') {
      setIsApiKeyModalOpen(true);
    } else {
      navigate('/studio', {
        state: {
          feature: 'custom',
          prompt: prompt.trim(),
        },
      });
    }
  };

  const handleNavigateToSettings = () => {
    setIsApiKeyModalOpen(false);
    navigate('/settings');
  };

  const filteredPrompts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      return promptTemplates;
    }
    return promptTemplates.filter(
      (template) =>
        template.title.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query)
    );
  }, [searchQuery, promptTemplates]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const indexOfLastPrompt = currentPage * PROMPTS_PER_PAGE;
  const indexOfFirstPrompt = indexOfLastPrompt - PROMPTS_PER_PAGE;
  const currentPrompts = filteredPrompts.slice(indexOfFirstPrompt, indexOfLastPrompt);
  const totalPages = Math.ceil(filteredPrompts.length / PROMPTS_PER_PAGE);

  const pageContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-16">
          <h3 className="mt-2 text-xl font-semibold text-red-600 dark:text-red-400">Đã xảy ra lỗi</h3>
          <p className="mt-1 text-slate-500 dark:text-slate-400">{error}</p>
        </div>
      );
    }

    if (filteredPrompts.length === 0) {
      return (
        <div className="text-center py-16">
            <SearchIcon className="w-12 h-12 mx-auto text-slate-400" />
            <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Không tìm thấy kết quả</h3>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
                Hãy thử một từ khóa tìm kiếm khác.
            </p>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentPrompts.map((template) => (
            <div
              key={template.title}
              className="flex flex-col bg-white dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700/50 transition-all duration-300 hover:shadow-purple-500/20 hover:-translate-y-1"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-emerald-100 dark:from-purple-900/50 dark:to-emerald-900/50 flex items-center justify-center">
                    <SparklesIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                      {template.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                      {template.description}
                    </p>
                  </div>
                </div>
                {template.previewImage && (
                  <img
                    src={template.previewImage}
                    alt={`Preview for ${template.title}`}
                    className="flex-shrink-0 w-24 h-24 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                    loading="lazy"
                  />
                )}
              </div>
              
              <div className="mt-4 flex-grow flex flex-col bg-slate-100 dark:bg-slate-900/70 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center px-4 py-2 bg-slate-200/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Prompt</p>
                    <div className="relative">
                        <button
                        onClick={() => handleCopy(template.prompt, template.title)}
                        className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        aria-label={`Sao chép prompt cho ${template.title}`}
                        >
                        {copiedTitle === template.title ? (
                            <CheckIcon className="w-5 h-5 text-emerald-500" />
                        ) : (
                            <ClipboardCopyIcon className="w-5 h-5" />
                        )}
                        </button>
                        {copiedTitle === template.title && (
                            <span className="absolute -top-8 right-0 text-xs bg-slate-800 text-white px-2 py-1 rounded-md shadow-lg whitespace-nowrap">
                                Đã sao chép!
                            </span>
                        )}
                    </div>
                </div>
                <div className="p-4 overflow-y-auto max-h-56 prompt-scrollbar flex-grow">
                    <pre className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap font-sans">
                        <code>{template.prompt.trim()}</code>
                    </pre>
                </div>
              </div>
              <div className="mt-4">
                <button
                    onClick={() => handleUseTemplate(template.prompt)}
                    className="w-full bg-purple-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200 dark:bg-purple-500 dark:hover:bg-purple-600 flex items-center justify-center gap-2 group"
                >
                    <PencilIcon className="w-5 h-5 transition-transform duration-200 group-hover:rotate-[-12deg]" />
                    <span>Sử dụng mẫu</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        <Pagination 
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </>
    );
  };

  return (
    <>
      <CustomStyles />
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onNavigate={handleNavigateToSettings}
      />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 relative py-8 overflow-hidden rounded-3xl bg-slate-100/50 dark:bg-slate-900/50">
           <div className="absolute -top-10 -left-10 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 dark:opacity-10 animate-[pulse-subtle_8s_ease-in-out_infinite]"></div>
           <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-emerald-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 dark:opacity-10 animate-[pulse-subtle_8s_ease-in-out_infinite] [animation-delay:2s]"></div>
          <div className="relative">
            <h1 className="text-4xl font-extrabold tracking-tight">Thư viện Prompt Mẫu</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-500 dark:text-slate-400">
              Khám phá bộ sưu tập các prompt được tuyển chọn để khơi nguồn sáng tạo của bạn. Sao chép bất kỳ mẫu nào và thử nghiệm trong Studio!
            </p>
          </div>
        </div>

        <div className="mb-10 max-w-2xl mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="search"
              name="search"
              id="search"
              className="block w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-700 rounded-full text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
              placeholder="Tìm kiếm prompt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Tìm kiếm prompt"
            />
          </div>
        </div>
        
        {pageContent()}
      </div>
    </>
  );
};

export default PromptsPage;
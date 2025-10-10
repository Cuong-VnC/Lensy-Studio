import React from 'react';

const ContactPage: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Cảm ơn tin nhắn của bạn! Đây là bản demo và tin nhắn của bạn chưa được gửi.");
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">Liên hệ</h1>
        <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">
          Có câu hỏi hoặc phản hồi? Chúng tôi rất muốn nghe từ bạn.
        </p>
      </div>

      <div className="mt-12 bg-white dark:bg-slate-800/50 p-8 rounded-2xl shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Họ và tên
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              className="mt-1 block w-full rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Địa chỉ email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              className="mt-1 block w-full rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Nội dung tin nhắn
            </label>
            <textarea
              name="message"
              id="message"
              rows={4}
              required
              className="mt-1 block w-full rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
            ></textarea>
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Gửi tin nhắn
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
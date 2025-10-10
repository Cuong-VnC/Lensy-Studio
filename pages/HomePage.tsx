import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { SparklesIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/Icons';

// Custom styles for animations and effects that are not easily achievable with Tailwind out-of-the-box.
const Web3Styles = () => (
  <style>{`
    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes pulse-subtle {
      0%, 100% { opacity: 0.2; }
      50% { opacity: 0.3; }
    }
    .animation-delay-2000 {
        animation-delay: 2s;
    }
    .animated-border-card::before {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: 1.25rem; /* sync with rounded-2xl */
      background: conic-gradient(from 180deg at 50% 50%, #a855f7, #34d399, #a855f7);
      animation: rotate 4s linear infinite;
      z-index: -1;
      opacity: 0;
      transition: opacity 0.4s ease-in-out;
    }
    .animated-border-card:hover::before {
      opacity: 1;
    }
    .feature-card {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.5s ease-out, transform 0.5s ease-out;
    }
    .feature-card.is-visible {
      opacity: 1;
      transform: translateY(0);
    }
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `}</style>
);


const HeroSection: React.FC = () => (
  <div className="text-center py-16 md:py-24 relative overflow-hidden">
     {/* Background decorative elements */}
     <div className="absolute -top-10 -left-10 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 dark:opacity-10 animate-[pulse-subtle_8s_ease-in-out_infinite]"></div>
     <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-emerald-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 dark:opacity-10 animate-[pulse-subtle_8s_ease-in-out_infinite] animation-delay-2000"></div>

    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
      <span className="block">Biến trí tưởng tượng thành</span>
      <span className="block bg-gradient-to-r from-purple-500 to-emerald-400 bg-clip-text text-transparent py-2">
        Kiệt tác ảnh
      </span>
    </h1>
    <p className="mt-4 max-w-md mx-auto text-lg md:text-xl text-slate-500 dark:text-slate-400">
      Sử dụng AI Nano Banana tiên tiến, Lensy Studio biến tầm nhìn sáng tạo của bạn thành hiện thực trong vài giây. Tạo phong cách độc đáo của riêng bạn.
    </p>
    <div className="mt-8 flex justify-center">
      <NavLink
        to="/studio"
        className="group relative inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-700 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/40 dark:hover:shadow-emerald-400/30"
      >
        <span className="absolute left-0 inset-y-0 flex items-center pl-4">
            <SparklesIcon className="h-5 w-5 text-purple-300 group-hover:text-yellow-300 transition-colors duration-300" />
        </span>
        Bắt đầu sáng tạo ngay
      </NavLink>
    </div>
  </div>
);

const Feature: React.FC<{ title: string; description: string }> = ({ title, description }) => (
    <div className="relative animated-border-card h-full feature-card">
        <div className="h-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg p-6 rounded-2xl shadow-md flex flex-col">
            <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-emerald-500 text-white mb-4">
                    <SparklesIcon className="w-6 h-6" />
                </div>
            </div>
            <div className="flex-grow">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-2 text-base text-slate-500 dark:text-slate-400">{description}</p>
            </div>
        </div>
    </div>
);


const FeaturesSection: React.FC = () => {
  const features = [
    { title: "Thêm & Xóa đối tượng", description: "Dễ dàng thêm các yếu tố mới vào ảnh của bạn hoặc loại bỏ những chi tiết không mong muốn chỉ bằng một câu lệnh văn bản đơn giản." },
    { title: "Chuyển đổi phong cách nghệ thuật", description: "Biến ảnh của bạn thành tác phẩm nghệ thuật. Áp dụng phong cách của các họa sĩ nổi tiếng hoặc tạo ra một thẩm mỹ hoàn toàn mới." },
    { title: "Xoá nền", description: "Thay đổi hoặc xóa nền của bất kỳ hình ảnh nào ngay lập tức. Đặt chủ thể của bạn ở bất cứ đâu bạn có thể tưởng tượng." },
    { title: "Bộ lọc sáng tạo", description: "Áp dụng các bộ lọc và hiệu ứng độc đáo để mang lại cho hình ảnh của bạn một tâm trạng và cảm giác riêng biệt, từ vẻ ngoài cổ điển đến ánh sáng tương lai." },
    { title: "Văn bản thành hình ảnh", description: "Mô tả một cảnh hoặc ý tưởng, và để AI tạo ra một hình ảnh hoàn toàn mới chỉ từ lời nói của bạn." }
  ];

  const displayFeatures = [...features, ...features]; // Duplicate for seamless loop

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animationFrameId = useRef<number | null>(null);
  const inactivityTimer = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const SCROLL_SPEED = 50; // pixels per second

  const scrollStep = (timestamp: number) => {
    if (!scrollRef.current || isPaused) return;

    if (lastTimeRef.current) {
        const deltaTime = (timestamp - lastTimeRef.current) / 1000;
        const el = scrollRef.current;
        const scrollAmount = SCROLL_SPEED * deltaTime;
      
        el.scrollLeft += scrollAmount;

        if (el.scrollLeft >= el.scrollWidth / 2) {
            el.scrollLeft -= el.scrollWidth / 2;
        }
    }
    
    lastTimeRef.current = timestamp;
    animationFrameId.current = window.requestAnimationFrame(scrollStep);
  };

  const startScrolling = () => {
    if (animationFrameId.current) {
      window.cancelAnimationFrame(animationFrameId.current);
    }
    lastTimeRef.current = null;
    animationFrameId.current = window.requestAnimationFrame(scrollStep);
  };

  const stopScrolling = () => {
    if (animationFrameId.current) {
      window.cancelAnimationFrame(animationFrameId.current);
    }
  };

  useEffect(() => {
    if (!isPaused) {
      startScrolling();
    } else {
      stopScrolling();
    }
    return () => stopScrolling();
  }, [isPaused]);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        },
        {
            root: scrollContainer,
            threshold: 0.1,
        }
    );

    const featureElements = scrollContainer.querySelectorAll('.feature-card');
    featureElements.forEach(el => observer.observe(el));

    return () => {
        featureElements.forEach(el => observer.unobserve(el));
    };
}, []);

  const handleNav = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth * 0.8;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
    setIsPaused(true);
    if (inactivityTimer.current) {
        window.clearTimeout(inactivityTimer.current);
    }
    inactivityTimer.current = window.setTimeout(() => setIsPaused(false), 5000);
  };

  return (
    <div className="py-16 md:py-24 bg-slate-100/50 dark:bg-slate-900/50 rounded-3xl backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-purple-600 dark:text-purple-400 font-semibold tracking-wide uppercase">Chỉnh sửa bằng AI</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Mọi thứ bạn cần để tạo ra những hình ảnh tuyệt đẹp
          </p>
          <p className="mt-4 max-w-2xl text-xl text-slate-500 dark:text-slate-400 lg:mx-auto">
            Từ những chỉnh sửa đơn giản đến những biến đổi hoàn toàn, AI Nano Banana của chúng tôi giúp mọi người đều có thể chỉnh sửa ảnh chuyên nghiệp.
          </p>
        </div>
        <div 
          className="mt-12 relative" 
          onMouseEnter={() => setIsPaused(true)} 
          onMouseLeave={() => {
            if (inactivityTimer.current) {
              window.clearTimeout(inactivityTimer.current);
            }
            setIsPaused(false);
          }}
        >
          <div ref={scrollRef} className="flex gap-8 overflow-x-auto scrollbar-hide py-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 snap-x snap-mandatory scroll-smooth">
            {displayFeatures.map((feature, index) => (
              <div key={index} className="flex-shrink-0 w-[85%] sm:w-[45%] lg:w-[31%] snap-start">
                <Feature title={feature.title} description={feature.description} />
              </div>
            ))}
          </div>
          {/* Navigation Buttons */}
          <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between items-center left-0 px-2 sm:px-0 pointer-events-none">
             <button
              onClick={() => handleNav('left')}
              aria-label="Cuộn sang trái"
              className="pointer-events-auto w-12 h-12 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-md shadow-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 transform hover:scale-110"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => handleNav('right')}
              aria-label="Cuộn sang phải"
              className="pointer-events-auto w-12 h-12 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-md shadow-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 transform hover:scale-110"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Testimonial: React.FC<{ quote: string; name: string; role: string; avatar: string; }> = ({ quote, name, role, avatar }) => (
    <div className="p-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl shadow-lg flex flex-col items-center text-center transition-all duration-300 hover:scale-105 hover:shadow-purple-500/20 dark:hover:shadow-purple-400/10 border border-white/20 dark:border-slate-700/50">
        <img className="w-16 h-16 rounded-full mb-4 ring-2 ring-purple-400/50" src={avatar} alt={name} />
        <p className="text-slate-600 dark:text-slate-300 italic flex-grow">"{quote}"</p>
        <div className="mt-4">
            <p className="font-semibold text-slate-900 dark:text-white">{name}</p>
            <p className="text-purple-500 dark:text-purple-400 text-sm">{role}</p>
        </div>
    </div>
);

const TestimonialsSection: React.FC = () => (
    <div className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white text-center">Được các nhà sáng tạo ở khắp mọi nơi yêu thích</h2>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Testimonial quote="Lensy Studio là một yếu tố thay đổi cuộc chơi! Tôi đã tạo ra cả một bộ chân dung nghệ thuật trong vài phút. AI Nano Banana cực kỳ nhanh và trực quan." name="Alex Johnson" role="Nghệ sĩ kỹ thuật số" avatar="https://picsum.photos/id/1005/100/100" />
                <Testimonial quote="Là một người quản lý mạng xã hội, tôi cần hình ảnh chất lượng cao hàng ngày. Công cụ này đã tiết kiệm cho tôi vô số giờ. Nó rất dễ sử dụng." name="Samantha Lee" role="Giám đốc Marketing" avatar="https://picsum.photos/id/1011/100/100" />
                <Testimonial quote="Tôi không có kinh nghiệm chỉnh sửa ảnh, nhưng với Lensy Studio, tôi cảm thấy mình như một chuyên gia. Kết quả thật tuyệt vời. Rất khuyến khích!" name="David Chen" role="Nhiếp ảnh gia nghiệp dư" avatar="https://picsum.photos/id/1025/100/100" />
            </div>
        </div>
    </div>
);


const HomePage: React.FC = () => {
  return (
    <>
      <Web3Styles />
      <div className="space-y-12">
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
      </div>
    </>
  );
};

export default HomePage;
import { useState, useEffect } from 'react';
import { Leaf } from 'lucide-react';

interface Props {
  onStart: () => void;
}

const facts = [
  "🌍 One Delhi→Mumbai flight = 4 months of your electricity bill",
  "🥗 Going vegetarian 3 days a week saves 200kg CO₂ a year",
  "🚌 Switching to bus for 1 month = planting 2 trees",
  "⚡ The average Indian uses 158kg CO₂ every month"
];

export default function LandingHero({ onStart }: Props) {
  const [factIndex, setFactIndex] = useState(0);
  const [factFade, setFactFade] = useState('opacity-100 translate-y-0');
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setFactFade('opacity-0 -translate-y-1');
      
      setTimeout(() => {
        setFactIndex((prev) => (prev + 1) % facts.length);
        // Fade in
        setFactFade('opacity-100 translate-y-0');
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleStartClick = () => {
    setIsExiting(true);
    setTimeout(() => {
      onStart();
    }, 500); // Wait for transition-opacity dur-500
  };

  return (
    <div 
      className={`min-h-screen relative flex flex-col justify-between items-center px-6 py-12 overflow-hidden transition-opacity duration-500 ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ background: 'linear-gradient(to bottom, #f0faf6 0%, #ffffff 100%)' }}
    >
      {/* Background Floating Leaves (Minimal, 3 leaves) & Watermark */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
        {/* Floating Leaf Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
          <Leaf className="w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] text-[#1D9E75] opacity-[0.05] rotate-[25deg] transform animate-watermark-float" />
        </div>
        <div className="absolute bottom-0 left-[15%] animate-float-leaf-1">
          <Leaf className="text-[#1D9E75]/15 fill-[#1D9E75]/5 w-6 h-6 rotate-12" />
        </div>
        <div className="absolute bottom-0 left-[50%] animate-float-leaf-2">
          <Leaf className="text-[#1D9E75]/20 fill-[#1D9E75]/10 w-5 h-5 -rotate-45" />
        </div>
        <div className="absolute bottom-0 right-[20%] animate-float-leaf-3">
          <Leaf className="text-[#1D9E75]/15 fill-[#1D9E75]/5 w-7 h-7 rotate-45" />
        </div>
      </div>

      {/* Spacer to align center content */}
      <div className="flex-1" />

      {/* Center Content */}
      <div className="max-w-xl w-full text-center z-10 flex flex-col items-center">
        {/* Animated Green Leaf Logo */}
        <div className="mb-6 flex justify-center">
          <svg className="w-16 h-16 text-[#1D9E75] fill-[#1D9E75]/10 animate-breathe-leaf" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 22C2 22 8 22 12 18C16 14 18 10 18 6C18 6 18 2 14 2C10 2 6 4 2 8C-2 12 2 18 2 22Z" />
            <path d="M2 22C6 18 10 14 14 10" />
          </svg>
        </div>

        <h1 className="text-[48px] sm:text-[56px] leading-[1.15] font-bold text-gray-900 tracking-tight">
          Every breath you take
          <span className="block mt-1">tells a story.</span>
        </h1>
        
        <p className="text-[16px] text-gray-500 max-w-[280px] leading-relaxed mt-6">
          See what your daily choices cost the air around you — and what you can do about it.
        </p>

        {/* CTA Button */}
        <button
          onClick={handleStartClick}
          aria-label="Start breathing better"
          className="w-full sm:w-auto bg-[#1D9E75] hover:bg-[#188764] text-white font-semibold py-4 px-10 rounded-full text-base tracking-wide transition-all duration-300 transform active:scale-98 shadow-md shadow-emerald-800/10 mt-10"
        >
          Start breathing better &rarr;
        </button>

        {/* Rotating Fact Line */}
        <div className="h-14 mt-8 flex items-center justify-center">
          <div className={`px-6 py-2.5 bg-[#1D9E75]/10 border border-[#1D9E75]/15 rounded-full shadow-sm max-w-md transition-all duration-300 ${factFade}`}>
            <p className="text-[14px] text-gray-700 font-semibold tracking-wide">
              {facts[factIndex]}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1" />

      {/* Footer Text */}
      <div className="z-10 text-center flex flex-col items-center gap-3">
        <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">
          Available in 12 languages
        </p>
        <div className="flex gap-2.5 justify-center flex-wrap">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-gray-500 border border-gray-200 bg-gray-50/50 shadow-sm">
            🌍 6 Countries
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-gray-500 border border-gray-200 bg-gray-50/50 shadow-sm">
            🗣 12 Languages
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-gray-500 border border-gray-200 bg-gray-50/50 shadow-sm">
            ⚡ 2 Minutes
          </span>
        </div>
      </div>
    </div>
  );
}

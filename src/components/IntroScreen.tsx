/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Volume2, VolumeX, HelpCircle, Gamepad2, Award } from 'lucide-react';
import { AudioSynth } from '../utils/audio';

interface IntroScreenProps {
  onStart: (character: 'agent' | 'elf') => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export default function IntroScreen({ onStart, isMuted, onToggleMute }: IntroScreenProps) {
  const [selectedChar, setSelectedChar] = useState<'agent' | 'elf'>('agent');
  const [showHowTo, setShowHowTo] = useState(false);

  React.useEffect(() => {
    // 試圖於首頁載入時播放歡樂的背景音樂
    AudioSynth.startBGM('/第一頁音樂.mp3');

    // 瀏覽器自動播放限制：使用者在網頁上任何點擊/觸碰都會自動開啟音樂
    const handleFirstInteraction = () => {
      AudioSynth.startBGM('/第一頁音樂.mp3');
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  const handleStart = () => {
    AudioSynth.playClick();
    onStart(selectedChar);
  };

  const handleCharSelect = (char: 'agent' | 'elf') => {
    AudioSynth.playClick();
    setSelectedChar(char);
  };

  const handleToggleMute = () => {
    onToggleMute();
    AudioSynth.playClick();
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-300 overflow-hidden select-none">
      {/* 漂浮雲朵裝飾 */}
      <div className="absolute top-10 left-[-10%] w-48 h-16 bg-white/70 rounded-full blur-[1px] animate-[pulse_6s_infinite] pointer-events-none" style={{ animation: 'float-left 25s linear infinite' }} />
      <div className="absolute top-24 right-[-15%] w-64 h-20 bg-white/80 rounded-full blur-[1px] pointer-events-none" style={{ animation: 'float-right 30s linear infinite' }} />
      <div className="absolute bottom-32 left-[5%] w-40 h-12 bg-white/60 rounded-full blur-[1px] pointer-events-none animate-bounce" style={{ animationDuration: '4s' }} />

      {/* 頂部控制列 */}
      <div className="relative w-full flex justify-between items-center z-10 gap-2 md:gap-4 min-h-[48px]">
        <div className="flex items-center gap-2 bg-white/85 px-4 py-1.5 rounded-full shadow-md border border-sky-100 shrink-0 scale-50 md:scale-[1.5] origin-left relative z-10">
          <Award className="w-5 h-5 text-yellow-500 animate-bounce" />
          <span className="text-xs font-bold text-slate-700 font-sans hidden sm:inline">一起來玩玩看 看誰最高分喔</span>
          <span className="text-[10px] font-bold text-slate-700 font-sans sm:hidden">一起來玩玩看</span>
        </div>

        {/* LOGO.png 放置於頂部正中央 (絕對定位) */}
        <div className="absolute left-1/2 -translate-x-[calc(50%+12px)] md:-translate-x-1/2 max-h-16 md:max-h-none flex items-center justify-center pointer-events-none z-0">
          <img 
            src="/newlogo.png" 
            alt="Logo" 
            className="h-10 md:h-[84px] w-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="flex gap-2 shrink-0 relative z-10">
          <button
            id="btn-intro-mute"
            onClick={handleToggleMute}
            className="p-2.5 bg-white/90 hover:bg-white rounded-full shadow-md border border-sky-100 text-sky-600 transition-transform active:scale-95"
            title={isMuted ? '開啟聲音' : '靜音'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button
            id="btn-intro-how"
            onClick={() => { AudioSynth.playClick(); setShowHowTo(true); }}
            className="p-2.5 bg-white/90 hover:bg-white rounded-full shadow-md border border-sky-100 text-sky-600 transition-transform active:scale-95 flex items-center gap-1 font-bold text-sm px-4"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="hidden xs:inline">遊戲說明</span>
          </button>
        </div>
      </div>

      {/* 主標題區 (Switch/三麗鷗風格) */}
      <div className="flex flex-col items-center justify-center text-center my-auto z-10">
        <motion.div
          initial={{ scale: 0.3, rotate: -10, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 10, stiffness: 80 }}
          className="relative px-8 py-5 bg-yellow-300 rounded-3xl border-4 border-white shadow-[0_8px_0_rgba(202,138,4,1)] mb-4 text-center select-none"
        >
          {/* 可愛裝飾小星星 */}
          <span className="absolute -top-4 -left-4 text-3xl animate-spin" style={{ animationDuration: '3s' }}>⭐</span>
          <span className="absolute -bottom-4 -right-4 text-3xl animate-bounce">🎈</span>

          <h2 className="text-xl md:text-2xl font-black text-amber-800 tracking-wider font-sans mb-1">
            地價稅知識挑戰賽
          </h2>
          <h1 className="text-3xl md:text-5xl font-black text-rose-500 drop-shadow-[0_2px_0_rgba(255,255,255,1)] tracking-widest font-sans">
            地價稅拆彈超人
          </h1>
          <div className="mt-2 text-rose-600 font-extrabold text-sm tracking-wide bg-white/50 px-3 py-1 rounded-full border border-rose-200 inline-block">
            💣 拆炸彈大挑戰 💣
          </div>
        </motion.div>

        {/* 角色選擇 */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 backdrop-blur-sm p-5 rounded-3xl border-2 border-white/60 shadow-xl max-w-md w-full flex flex-col items-center mt-2"
        >
          <h3 className="text-sm font-black text-slate-600 mb-3 tracking-wider">選擇您的超萌角色</h3>
          
          <div className="grid grid-cols-2 gap-4 w-full mb-4">
            {/* 角色 1：新北稅務小尖兵 */}
            <button
              id="char-select-agent"
              onClick={() => handleCharSelect('agent')}
              className={`relative flex flex-col items-center p-3 rounded-2xl border-4 transition-all duration-300 ${
                selectedChar === 'agent'
                  ? 'border-emerald-400 bg-emerald-50 shadow-[0_4px_0_#34d399]'
                  : 'border-transparent bg-slate-50 hover:bg-slate-100 text-slate-500'
              }`}
            >
              <div className="w-20 h-20 mb-2 relative flex items-center justify-center">
                {/* 稅務小尖兵 SVG */}
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* 呼吸動畫 */}
                  <g className={selectedChar === 'agent' ? 'animate-[pulse_1.5s_infinite]' : ''}>
                    {/* 臉與腮紅 */}
                    <circle cx="50" cy="55" r="28" fill="#ffe4e1" />
                    <circle cx="34" cy="58" r="5" fill="#ffb6c1" opacity="0.8" />
                    <circle cx="66" cy="58" r="5" fill="#ffb6c1" opacity="0.8" />
                    {/* 眼睛 */}
                    <circle cx="40" cy="50" r="4" fill="#2d3748" />
                    <circle cx="60" cy="50" r="4" fill="#2d3748" />
                    <circle cx="41" cy="48" r="1.5" fill="#fff" />
                    <circle cx="61" cy="48" r="1.5" fill="#fff" />
                    {/* 微笑 */}
                    <path d="M 46 62 Q 50 66 54 62" stroke="#2d3748" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    {/* 可愛新北稅務帽 */}
                    <path d="M 18 42 C 20 20, 80 20, 82 42 Z" fill="#008080" />
                    <path d="M 15 42 L 85 42 Q 85 46 50 46 Q 15 46 15 42" fill="#004d4d" />
                    <circle cx="50" cy="30" r="6" fill="#fbbf24" />
                    <text x="50" y="33" fontSize="8" fontWeight="bold" fill="#fff" textAnchor="middle">稅</text>
                  </g>
                </svg>
              </div>
              <span className={`text-sm font-black ${selectedChar === 'agent' ? 'text-emerald-700' : 'text-slate-600'}`}>
                👨💼 稅務小尖兵
              </span>
            </button>

            {/* 角色 2：新北省稅小精靈 */}
            <button
              id="char-select-elf"
              onClick={() => handleCharSelect('elf')}
              className={`relative flex flex-col items-center p-3 rounded-2xl border-4 transition-all duration-300 ${
                selectedChar === 'elf'
                  ? 'border-amber-400 bg-amber-50 shadow-[0_4px_0_#fbbf24]'
                  : 'border-transparent bg-slate-50 hover:bg-slate-100 text-slate-500'
              }`}
            >
              <div className="w-20 h-20 mb-2 relative flex items-center justify-center">
                {/* 省稅小精靈 SVG */}
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <g className={selectedChar === 'elf' ? 'animate-[pulse_1.5s_infinite]' : ''}>
                    {/* 翅膀 */}
                    <path d="M 22 45 C 10 35, 15 65, 30 55" fill="#a7f3d0" opacity="0.7" />
                    <path d="M 78 45 C 90 35, 85 65, 70 55" fill="#a7f3d0" opacity="0.7" />
                    {/* 臉與腮紅 */}
                    <circle cx="50" cy="55" r="28" fill="#fff5ee" />
                    <circle cx="34" cy="58" r="5" fill="#fda4af" opacity="0.8" />
                    <circle cx="66" cy="58" r="5" fill="#fda4af" opacity="0.8" />
                    {/* 眼睛 */}
                    <circle cx="40" cy="50" r="4.5" fill="#2d3748" />
                    <circle cx="60" cy="50" r="4.5" fill="#2d3748" />
                    <circle cx="39" cy="48" r="1.5" fill="#fff" />
                    <circle cx="59" cy="48" r="1.5" fill="#fff" />
                    {/* 吐舌笑臉 */}
                    <path d="M 45 61 Q 50 67 55 61" stroke="#2d3748" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    <path d="M 47 63 Q 50 68 53 63 Z" fill="#fda4af" />
                    {/* 省稅小嫩芽屋頂帽 */}
                    <path d="M 20 40 L 50 18 L 80 40 Z" fill="#fb923c" />
                    <circle cx="50" cy="18" r="4" fill="#4ade80" />
                    <path d="M 50 18 Q 58 12 50 8 Q 42 12 50 18" fill="#22c55e" />
                  </g>
                </svg>
              </div>
              <span className={`text-sm font-black ${selectedChar === 'elf' ? 'text-amber-700' : 'text-slate-600'}`}>
                🏠 省稅小精靈
              </span>
            </button>
          </div>

          <button
            id="btn-start-game"
            onClick={handleStart}
            className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white font-black text-lg rounded-2xl shadow-[0_6px_0_rgba(190,24,74,1)] hover:shadow-[0_4px_0_rgba(190,24,74,1)] active:translate-y-1.5 active:shadow-none transition-all duration-150 flex items-center justify-center gap-2"
          >
            <Gamepad2 className="w-6 h-6" />
            <span>開始挑戰拆彈！</span>
          </button>
        </motion.div>
      </div>

      {/* 頁尾 */}
      <div className="z-10 text-xs font-bold text-sky-800 bg-white/40 px-4 py-1.5 rounded-full border border-white/20">
        新北市政府稅捐稽徵處 地價稅宣導小遊戲 🇹🇼 2026
      </div>

      {/* 遊戲說明 彈窗 */}
      {showHowTo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 max-w-md w-full border-4 border-yellow-300 shadow-2xl relative"
          >
            <h2 className="text-2xl font-black text-rose-500 text-center mb-4 flex items-center justify-center gap-1.5">
              <span>💣 遊戲玩法指南</span>
            </h2>
            <div className="space-y-4 text-slate-600 font-sans leading-relaxed text-sm">
              <p className="font-semibold bg-sky-50 p-2.5 rounded-xl border border-sky-100">
                你將在簡單的迷宮中探索，尋找帶有 <span className="text-emerald-600 font-black">A</span>、<span className="text-indigo-600 font-black">B</span>、或 <span className="text-pink-600 font-black">C</span> 答案的可愛炸彈。
              </p>
              
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <span className="bg-amber-400 text-white font-bold rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5 shrink-0">1</span>
                  <div>
                    <p className="font-bold text-slate-700">如何移動角色？</p>
                    <p><strong>電腦：</strong>使用鍵盤的 <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded shadow-xs text-xs font-mono font-bold">↑</kbd> <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded shadow-xs text-xs font-mono font-bold">↓</kbd> <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded shadow-xs text-xs font-mono font-bold">←</kbd> <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded shadow-xs text-xs font-mono font-bold">→</kbd> 或 <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded shadow-xs text-xs font-mono font-bold">WASD</kbd> 鍵移動。</p>
                    <p><strong>手機/平板：</strong>最直覺的操作！直接點擊角色<strong>上下左右的相鄰格子</strong>，角色就會往那裡前進一步！</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="bg-amber-400 text-white font-bold rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5 shrink-0">2</span>
                  <div>
                    <p className="font-bold text-slate-700">如何放置普通炸彈？（炸開木箱開路）</p>
                    <p><strong>電腦：</strong>按 <kbd className="px-2 py-0.5 bg-slate-100 border rounded shadow-xs text-xs font-mono font-bold">Space (空白鍵)</kbd> 或點擊黃色按鈕。</p>
                    <p><strong>手機/平板：</strong>直接點擊<strong>角色自身所在的格子</strong>，或點擊右下角黃色的「放炸彈 💣」按鈕！</p>
                    <p className="text-xs text-rose-500 font-bold mt-1">⚠️ 提醒：普通炸彈在 1.6 秒後爆炸，放完要趕快跑開，不然會被波及扣分數喔！炸開木箱會掉落金幣與花朵！</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="bg-amber-400 text-white font-bold rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5 shrink-0">3</span>
                  <div>
                    <p className="font-bold text-slate-700">如何拆除答案炸彈？</p>
                    <p><strong>電腦：</strong>走到答案炸彈旁，按 <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded shadow-xs text-xs font-mono font-bold">Enter</kbd> 鍵拆除，或點擊紅色按鈕。</p>
                    <p><strong>手機/平板：</strong>直接點擊<strong>相鄰的答案炸彈</strong>，或點擊右下角紅色的「拆答案炸彈 🎯」按鈕！</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="bg-amber-400 text-white font-bold rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5 shrink-0">4</span>
                  <div>
                    <p className="font-bold text-slate-700">拆對與拆錯</p>
                    <p>✔ 拆對正確答案炸彈：立馬過關！並獲得 100 分與地價稅小知識！</p>
                    <p>❌ 拆錯炸彈：爆炸並扣 1 顆愛心！你共有 ❤️❤️❤️ 三條命。</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-2.5 rounded-xl border border-yellow-200 text-xs font-bold text-amber-800">
                💡 提示：收集地圖上的金色閃亮金幣，可以探路順便拿額外金幣成就喔！
              </div>
            </div>

            <button
              id="btn-close-how"
              onClick={() => { AudioSynth.playClick(); setShowHowTo(false); }}
              className="mt-5 w-full py-2.5 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
            >
              我知道了，去挑戰！
            </button>
          </motion.div>
        </div>
      )}

      {/* 漂浮動畫 CSS */}
      <style>{`
        @keyframes float-left {
          0% { transform: translateX(-10vw); }
          100% { transform: translateX(110vw); }
        }
        @keyframes float-right {
          0% { transform: translateX(10vw) scaleX(-1); }
          100% { transform: translateX(-110vw) scaleX(-1); }
        }
      `}</style>
    </div>
  );
}

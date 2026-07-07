/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Award, RotateCcw, Share2, Sparkles, BookOpen, CheckCircle } from 'lucide-react';
import { AudioSynth } from '../utils/audio';

interface PromoScreenProps {
  score: number;
  deaths: number; // 答錯次數
  coinsCollected: number;
  character: 'agent' | 'elf';
  onRestart: () => void;
}

export default function PromoScreen({ score, deaths, coinsCollected, character, onRestart }: PromoScreenProps) {
  const isPerfect = deaths === 0;

  // 計算最終總得分
  // 答對4題 = 400分
  // 通關加分 = 300分
  // 零失誤 Perfect! 加分 = 500分
  // 金幣加分 = 每個金幣 10 分
  const baseScore = 400;
  const clearedBonus = 300;
  const perfectBonus = isPerfect ? 500 : 0;
  const coinBonus = coinsCollected * 10;
  const totalScore = baseScore + clearedBonus + perfectBonus + coinBonus;

  useEffect(() => {
    // 播放遊戲通關歡樂背景音樂
    AudioSynth.startBGM('/闖關成功音樂.mp3');
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 bg-gradient-to-b from-purple-600 via-indigo-600 to-slate-900 overflow-y-auto select-none text-white font-sans">
      
      {/* 煙火與彩帶粒子動畫 (CSS 實作，極速、流暢) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-ping"
            style={{
              top: `${Math.random() * 80}%`,
              left: `${Math.random() * 90}%`,
              width: `${Math.random() * 15 + 10}px`,
              height: `${Math.random() * 15 + 10}px`,
              backgroundColor: ['#f43f5e', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'][i % 6],
              animationDuration: `${Math.random() * 2 + 1}s`,
              animationDelay: `${Math.random() * 1.5}s`,
            }}
          />
        ))}
        {/* 彩帶漂浮 */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`ribbon-${i}`}
            className="absolute opacity-80"
            style={{
              top: `-10px`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 8 + 4}px`,
              height: `${Math.random() * 20 + 10}px`,
              backgroundColor: ['#f43f5e', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'][i % 6],
              transform: `rotate(${Math.random() * 360}deg)`,
              animation: `fall ${Math.random() * 4 + 4}s linear infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* 頂部恭喜標題 */}
      <div className="text-center z-10 w-full mt-2">
        <motion.div
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 10 }}
          className="inline-block"
        >
          <span className="bg-yellow-400 text-slate-900 text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider shadow-lg">
            🏆 CONGRATULATIONS 🏆
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-yellow-300 drop-shadow-[0_4px_0_rgba(0,0,0,0.4)] mt-2">
            恭喜全部答對！
          </h1>
          <p className="text-yellow-100 font-extrabold text-sm md:text-base tracking-widest mt-1 flex items-center justify-center gap-1.5">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" />
            <span>🎯 恭喜成為地價稅知識王！</span>
            <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" />
          </p>
        </motion.div>
      </div>

      {/* 中間大佈局：左邊是跳舞角色與分數，右邊是地價稅宣導小卡 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full max-w-5xl my-auto z-10 p-2 items-center">
        
        {/* 左側：角色歡樂跳舞 & 計分板 */}
        <div className="md:col-span-5 flex flex-col items-center bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/20 shadow-2xl">
          
          {/* 跳舞角色 */}
          <div className="w-32 h-32 mb-4 relative flex items-center justify-center bg-white/10 rounded-full p-2 border border-white/10 shadow-inner">
            <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-md animate-pulse" />
            {character === 'agent' ? (
              // 稅務小尖兵 跳舞 SVG
              <svg viewBox="0 0 100 100" className="w-full h-full animate-[bounce_0.8s_infinite]">
                <g>
                  {/* 手揮動 */}
                  <path d="M 15 50 Q 8 30 10 20" stroke="#ffe4e1" strokeWidth="6" strokeLinecap="round" fill="none" className="animate-[pulse_1s_infinite]" />
                  <path d="M 85 50 Q 92 30 90 20" stroke="#ffe4e1" strokeWidth="6" strokeLinecap="round" fill="none" className="animate-[pulse_1s_infinite]" />
                  {/* 臉與腮紅 */}
                  <circle cx="50" cy="55" r="28" fill="#ffe4e1" />
                  <circle cx="34" cy="58" r="5" fill="#ffb6c1" opacity="0.8" />
                  <circle cx="66" cy="58" r="5" fill="#ffb6c1" opacity="0.8" />
                  {/* 開心的眼睛 (瞇眼) */}
                  <path d="M 36 50 Q 40 45 44 50" stroke="#2d3748" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <path d="M 56 50 Q 60 45 64 50" stroke="#2d3748" strokeWidth="3" strokeLinecap="round" fill="none" />
                  {/* 歡呼的大嘴 */}
                  <circle cx="50" cy="63" r="4.5" fill="#e11d48" />
                  {/* 可愛新北稅務帽 */}
                  <path d="M 18 42 C 20 20, 80 20, 82 42 Z" fill="#008080" />
                  <path d="M 15 42 L 85 42 Q 85 46 50 46 Q 15 46 15 42" fill="#004d4d" />
                  <circle cx="50" cy="30" r="6" fill="#fbbf24" />
                  <text x="50" y="33" fontSize="8" fontWeight="bold" fill="#fff" textAnchor="middle">稅</text>
                </g>
              </svg>
            ) : (
              // 省稅小精靈 跳舞 SVG
              <svg viewBox="0 0 100 100" className="w-full h-full animate-[bounce_0.8s_infinite]" style={{ animationDelay: '0.2s' }}>
                <g>
                  {/* 翅膀拍動 */}
                  <path d="M 22 45 C 5 30, 10 70, 30 55" fill="#a7f3d0" opacity="0.8" className="origin-right animate-[pulse_0.5s_infinite]" />
                  <path d="M 78 45 C 95 30, 90 70, 70 55" fill="#a7f3d0" opacity="0.8" className="origin-left animate-[pulse_0.5s_infinite]" />
                  {/* 臉與腮紅 */}
                  <circle cx="50" cy="55" r="28" fill="#fff5ee" />
                  <circle cx="34" cy="58" r="5" fill="#fda4af" opacity="0.8" />
                  <circle cx="66" cy="58" r="5" fill="#fda4af" opacity="0.8" />
                  {/* 眨眼開心的眼睛 */}
                  <path d="M 36 50 Q 40 45 44 50" stroke="#2d3748" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <path d="M 56 50 Q 60 45 64 50" stroke="#2d3748" strokeWidth="3" strokeLinecap="round" fill="none" />
                  {/* 大笑嘴巴 */}
                  <path d="M 44 60 Q 50 67 56 60 Z" fill="#fda4af" stroke="#2d3748" strokeWidth="2" />
                  {/* 省稅小嫩芽屋頂帽 */}
                  <path d="M 20 40 L 50 18 L 80 40 Z" fill="#fb923c" />
                  <circle cx="50" cy="18" r="4" fill="#4ade80" />
                  <path d="M 50 18 Q 58 12 50 8 Q 42 12 50 18" fill="#22c55e" />
                </g>
              </svg>
            )}
          </div>

          {/* 計分明細卡 */}
          <div className="w-full space-y-2 text-sm bg-slate-900/50 p-4 rounded-2xl border border-white/10">
            <h4 className="text-center font-black text-yellow-300 border-b border-white/10 pb-1.5 mb-2 flex items-center justify-center gap-1">
              <Award className="w-4 h-4" /> 拆彈戰績結算
            </h4>
            <div className="flex justify-between">
              <span className="text-slate-300">成功拆除正確炸彈：</span>
              <span className="font-bold text-emerald-400">4 題 ({baseScore} 分)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">恭喜順利通關加分：</span>
              <span className="font-bold text-emerald-400">+{clearedBonus} 分</span>
            </div>
            {isPerfect && (
              <div className="flex justify-between items-center bg-yellow-500/20 px-2 py-1 rounded-md border border-yellow-500/30">
                <span className="text-yellow-300 font-extrabold flex items-center gap-1 text-xs">
                  ⭐ 零失誤 Perfect Bonus!
                </span>
                <span className="font-black text-yellow-300">+{perfectBonus} 分</span>
              </div>
            )}
            {coinBonus > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-300">收集黃金金幣 ({coinsCollected} 枚)：</span>
                <span className="font-bold text-amber-400">+{coinBonus} 分</span>
              </div>
            )}
            <div className="border-t border-white/20 pt-2 flex justify-between items-center mt-2">
              <span className="text-base font-black text-white">總得分：</span>
              <span className="text-3xl font-black text-yellow-300 animate-pulse">{totalScore} <span className="text-xs font-bold text-white">分</span></span>
            </div>
          </div>
        </div>

        {/* 右側：地價稅宣導知識卡片 (美觀大氣) */}
        <div className="md:col-span-7 flex flex-col gap-4">
          <div className="bg-white text-slate-800 rounded-3xl p-5 shadow-2xl border-4 border-yellow-300 flex flex-col">
            <h3 className="text-lg font-black text-rose-500 mb-3 flex items-center gap-2 border-b-2 border-rose-100 pb-2">
              <BookOpen className="w-5 h-5" />
              <span>新北地價稅核心知識</span>
            </h3>

            {/* 四張精美小知识卡 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* 知識一 */}
              <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100 flex gap-2.5 items-start">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-emerald-800 text-xs">自用住宅優惠稅率</h4>
                  <p className="text-slate-600 text-xs font-semibold leading-relaxed mt-1">
                    自用住宅土地地價稅享有最划算特惠稅率：<strong className="text-rose-500 font-black">千分之二</strong>，比一般稅率省下四倍以上！
                  </p>
                </div>
              </div>

              {/* 知識二 */}
              <div className="bg-sky-50/70 p-3 rounded-2xl border border-sky-100 flex gap-2.5 items-start">
                <CheckCircle className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-sky-800 text-xs">一般土地納稅義務人</h4>
                  <p className="text-slate-600 text-xs font-semibold leading-relaxed mt-1">
                    普通或一般土地的地價稅，依規定由<strong className="text-indigo-600 font-black">土地所有權人</strong>負責進行申報與繳納。
                  </p>
                </div>
              </div>

              {/* 知識三 */}
              <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-100 flex gap-2.5 items-start">
                <CheckCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-amber-800 text-xs">信託土地納稅義務人</h4>
                  <p className="text-slate-600 text-xs font-semibold leading-relaxed mt-1">
                    當土地設有信託關係時，信託土地的地價稅納稅義務人為：<strong className="text-amber-600 font-black">受託人</strong>負責繳納。
                  </p>
                </div>
              </div>

              {/* 知識四 */}
              <div className="bg-pink-50/70 p-3 rounded-2xl border border-pink-100 flex gap-2.5 items-start">
                <CheckCircle className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-pink-800 text-xs">自用住宅戶籍規定</h4>
                  <p className="text-slate-600 text-xs font-semibold leading-relaxed mt-1">
                    須由土地所有權人<strong className="text-rose-500 font-black">本人、配偶或直系親屬</strong>（如爸爸）在該地辦竣戶籍登記。
                  </p>
                </div>
              </div>

            </div>

            {/* 地價稅宣導總語 */}
            <div className="mt-4 bg-rose-50 border border-rose-100 p-3 rounded-2xl text-xs font-bold text-rose-800 leading-relaxed text-center">
              💡 溫馨提醒：每年地價稅在 <span className="bg-rose-200 px-1.5 py-0.5 rounded text-rose-900">11 月 1 日至 11 月 30 日</span> 開徵。想適用自用住宅優惠稅率，記得要在當年的 <span className="bg-rose-200 px-1.5 py-0.5 rounded text-rose-900">9 月 22 日前</span> 向新北市政府稅捐稽徵處或分處提出申請喔！
            </div>
          </div>
        </div>
      </div>

      {/* 底部控制按鈕：重新挑戰 */}
      <div className="w-full max-w-md flex flex-col gap-3 mt-6 mb-2 z-10">
        <button
          id="btn-promo-restart"
          onClick={() => { AudioSynth.playClick(); onRestart(); }}
          className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black text-lg rounded-2xl shadow-[0_6px_0_rgba(202,138,4,1)] hover:shadow-[0_4px_0_rgba(202,138,4,1)] active:translate-y-1.5 active:shadow-none transition-all duration-150 flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          <span>重新挑戰 拆彈超人！</span>
        </button>
      </div>

      {/* 飄落 CSS */}
      <style>{`
        @keyframes fall {
          0% {
            top: -10px;
            transform: translateY(0) rotate(0deg);
          }
          100% {
            top: 110vh;
            transform: translateY(110vh) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

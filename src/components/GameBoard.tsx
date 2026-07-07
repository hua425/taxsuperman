/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Sparkles, Star, Zap, Volume2, VolumeX, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, RotateCcw } from 'lucide-react';
import { Position, CellType, BombInfo, Player, RegularBomb, Flame } from '../types';
import { AudioSynth } from '../utils/audio';

interface GameBoardProps {
  levelIndex: number;
  questionTitle: string;
  questionText: string;
  grid: CellType[][];
  bombs: BombInfo[];
  player: Player;
  hearts: number;
  score: number;
  coinsCollected: number;
  themeColor: string;
  isMuted: boolean;
  onToggleMute: () => void;
  onMove: (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => void;
  onDefuse: (bombKey: 'A' | 'B' | 'C' | null) => void;
  onRestartLevel: () => void;
  character: 'agent' | 'elf';
  onCollectCoin: (x: number, y: number) => void;
  regularBombs: RegularBomb[];
  flames: Flame[];
  onPlaceRegularBomb: () => void;
}

export default function GameBoard({
  levelIndex,
  questionTitle,
  questionText,
  grid,
  bombs,
  player,
  hearts,
  score,
  coinsCollected,
  themeColor,
  isMuted,
  onToggleMute,
  onMove,
  onDefuse,
  onRestartLevel,
  character,
  onCollectCoin,
  regularBombs,
  flames,
  onPlaceRegularBomb
}: GameBoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // 滑動觸碰開始
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  // 滑動觸碰結束
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || player.state === 'BOOM' || player.state === 'WIN_DANCE') return;
    const startX = touchStartRef.current.x;
    const startY = touchStartRef.current.y;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const diffX = endX - startX;
    const diffY = endY - startY;

    // 滑動閾值，大於 25 像素即判定為滑動
    const threshold = 25;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      // 水平滑動
      if (Math.abs(diffX) > threshold) {
        if (diffX > 0) {
          onMove('RIGHT');
        } else {
          onMove('LEFT');
        }
      }
    } else {
      // 垂直滑動
      if (Math.abs(diffY) > threshold) {
        if (diffY > 0) {
          onMove('DOWN');
        } else {
          onMove('UP');
        }
      }
    }
    touchStartRef.current = null;
  };

  // 鍵盤監聽事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 避免空白鍵、Enter鍵和方向鍵滾動網頁或觸發預設表單
      if (['Space', 'Enter', 'NumpadEnter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(e.code)) {
        e.preventDefault();
      }

      if (player.state === 'BOOM' || player.state === 'WIN_DANCE') return;

      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          onMove('UP');
          break;
        case 'ArrowDown':
        case 'KeyS':
          onMove('DOWN');
          break;
        case 'ArrowLeft':
        case 'KeyA':
          onMove('LEFT');
          break;
        case 'ArrowRight':
        case 'KeyD':
          onMove('RIGHT');
          break;
        case 'Space':
          // 電腦版：放炸彈改用空白鍵
          onPlaceRegularBomb();
          break;
        case 'Enter':
        case 'NumpadEnter':
          // 電腦版：拆答案炸彈改為 Enter 鍵
          handleSpaceDefuse();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [player, bombs]);

  // 拆彈邏輯：找到與玩家在同一個或相鄰格子的答案炸彈
  const handleSpaceDefuse = () => {
    const nearbyBomb = bombs.find(b => Math.abs(b.x - player.x) + Math.abs(b.y - player.y) <= 1);
    if (nearbyBomb) {
      AudioSynth.playClick();
      onDefuse(nearbyBomb.key);
    } else {
      AudioSynth.playClick();
    }
  };

  // 手機版：點擊/觸碰迷宮格子（觸碰式移動 / 放炸彈 / 拆答案炸彈）
  const handleCellClick = (cx: number, cy: number) => {
    if (player.state === 'BOOM' || player.state === 'WIN_DANCE') return;

    // 1. 放炸彈觸碰點一下：如果點到玩家自己的格子
    if (player.x === cx && player.y === cy) {
      onPlaceRegularBomb();
      return;
    }

    // 2. 拆答案炸彈觸碰點一下：如果點到答案炸彈，且跟玩家相鄰
    const clickedBomb = bombs.find(b => b.x === cx && b.y === cy);
    if (clickedBomb) {
      if (isNearBomb(clickedBomb)) {
        AudioSynth.playClick();
        onDefuse(clickedBomb.key);
      } else {
        AudioSynth.playClick();
      }
      return;
    }

    // 3. 人物改上下左右觸碰式移動：點擊與玩家相鄰的其餘格子
    const dx = cx - player.x;
    const dy = cy - player.y;
    const isAdjacent = Math.abs(dx) + Math.abs(dy) === 1;

    if (isAdjacent) {
      if (dx === 1) onMove('RIGHT');
      else if (dx === -1) onMove('LEFT');
      else if (dy === 1) onMove('DOWN');
      else if (dy === -1) onMove('UP');
    }
  };

  // 點擊特定炸彈拆除 (手機/平板直覺控制)
  const handleBombClick = (bomb: BombInfo) => {
    if (player.state === 'BOOM' || player.state === 'WIN_DANCE') return;
    
    // 如果玩家離炸彈有些距離，提示或直接允許拆除 (為了行動裝置便利，只要點擊該炸彈且距離小於等於 2 就允許，或直接允許拆除)
    const dist = Math.abs(bomb.x - player.x) + Math.abs(bomb.y - player.y);
    if (dist <= 1) {
      AudioSynth.playClick();
      onDefuse(bomb.key);
    } else {
      // 如果太遠，可以發出點選聲，並提示走過去
      AudioSynth.playClick();
    }
  };

  // 判斷玩家與特定炸彈是否相鄰 (小於等於 1)
  const isNearBomb = (bomb: BombInfo) => {
    return Math.abs(bomb.x - player.x) + Math.abs(bomb.y - player.y) <= 1;
  };

  return (
    <div className={`w-full h-full flex flex-col p-3 md:p-4 bg-gradient-to-br ${themeColor} select-none overflow-hidden font-sans text-slate-800`}>
      
      {/* 頂部輕量化狀態欄 (RWD 適配) */}
      <div className="relative w-full flex justify-between items-center bg-white/95 backdrop-blur-xs px-4 py-2 rounded-2xl border-2 border-white shadow-sm z-10 mb-2 gap-2 min-h-[44px]">
        <div className="flex items-center gap-2 shrink-0 relative z-10">
          <span className="bg-emerald-500 text-white font-black px-3 py-1 rounded-xl text-xs shadow-sm">
            {questionTitle}
          </span>
          <div className="flex items-center gap-0.5 bg-rose-50 px-2 py-1 rounded-xl border border-rose-100/60">
            {[...Array(3)].map((_, i) => (
              <span key={i} className={`text-sm transition-transform duration-300 ${i < hearts ? 'scale-110' : 'opacity-20 scale-90'}`}>
                ❤️
              </span>
            ))}
          </div>
        </div>

        {/* LOGO.png 放置遊戲中上方正中央 (絕對定位) */}
        <div className="absolute left-1/2 -translate-x-[calc(50%+12px)] md:-translate-x-1/2 flex items-center justify-center pointer-events-none z-0">
          <img 
            src="/newlogo.png" 
            alt="Logo" 
            className="h-8 md:h-[72px] w-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* 頂部分數 & 金幣 & 靜音 & 重來 */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0 relative z-10">
          <div className="bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-xl flex items-center gap-1 text-xs font-black text-amber-800">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span className="hidden sm:inline">分數:</span><span>{score}</span>
          </div>
          <div className="bg-yellow-50 border border-yellow-200/60 px-2.5 py-1 rounded-xl flex items-center gap-1 text-xs font-black text-yellow-700">
            <span>🪙</span>
            <span className="hidden sm:inline">金幣:</span><span>{coinsCollected}</span>
          </div>
          <div className="flex gap-1">
            <button
              id="btn-board-mute"
              onClick={onToggleMute}
              className="p-1.5 bg-slate-50 hover:bg-slate-100 active:scale-90 rounded-lg text-slate-600 transition-all border border-slate-200/50"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button
              id="btn-board-restart"
              onClick={onRestartLevel}
              className="p-1.5 bg-slate-50 hover:bg-slate-100 active:scale-90 rounded-lg text-slate-600 transition-all border border-slate-200/50"
              title="重來此關"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Switch 雙螢幕主體 RWD 格局 */}
      <div className="flex-1 w-full grid grid-cols-12 gap-3 min-h-0 overflow-hidden">
        
        {/* 手機版精簡橫條 (僅在 md 以下，且未展開時顯示) */}
        {!isInfoExpanded && (
          <div 
            className="col-span-12 md:hidden bg-white/95 backdrop-blur-xs rounded-2xl border-2 border-emerald-400/60 p-2.5 shadow-sm z-30 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all" 
            onClick={() => setIsInfoExpanded(true)}
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span className="text-xs font-black text-slate-800 truncate max-w-[200px] sm:max-w-[300px]">
                {questionTitle}：{questionText}
              </span>
            </div>
            <span className="text-[10px] bg-emerald-500 text-white font-black px-2.5 py-1 rounded-xl shadow-sm hover:bg-emerald-600 shrink-0">
              對照答案選項 🔍
            </span>
          </div>
        )}

        {/* 手機版懸浮資訊 Modal (僅在 md 以下，且已展開時顯示) */}
        {isInfoExpanded && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 md:hidden">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white w-full max-w-sm rounded-3xl border-4 border-emerald-400 p-4 shadow-2xl flex flex-col gap-3 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 font-extrabold text-xs px-2.5 py-1 rounded-lg">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span>{questionTitle}</span>
                </div>
                <button 
                  onClick={() => setIsInfoExpanded(false)}
                  className="text-slate-500 hover:text-slate-700 font-bold text-xs bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg active:scale-95 transition-transform"
                >
                  ✕ 關閉
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-extrabold text-slate-400">❓ 題目內容：</span>
                <h3 className="text-xs sm:text-sm font-black text-slate-800 leading-normal">
                  {questionText}
                </h3>
              </div>

              {/* 答案選項對照表 */}
              <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-100 text-xs flex flex-col gap-1.5">
                <span className="font-extrabold text-slate-500 text-[11px]">🔍 答案選項對照：</span>
                <div className="flex flex-col gap-1.5">
                  {bombs.map(b => (
                    <div key={b.key} className="flex items-start gap-2 font-bold leading-normal">
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black text-white shrink-0 ${
                        b.key === 'A' ? 'bg-blue-500' : b.key === 'B' ? 'bg-pink-500' : 'bg-amber-500'
                      }`}>
                        {b.key}
                      </span>
                      <span className="text-slate-700 text-xs">{b.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 炸彈超人玩法提醒 */}
              <div className="bg-yellow-50 border border-yellow-200/60 rounded-xl p-2 text-[11px] font-bold text-yellow-800 flex flex-col gap-1">
                <div className="flex items-start gap-1">
                  <span>💡</span>
                  <span><strong>直覺觸碰操作：</strong>點擊人物上下左右的相鄰格子即可前進！點擊人物自身即可原地放置炸彈 💣，點擊相鄰的答案炸彈即可直接拆除 🎯！</span>
                </div>
                <div className="flex items-start gap-1 border-t border-yellow-200/50 pt-1 mt-1">
                  <span>🎮</span>
                  <span>也可以使用下方黃色<strong>「放炸彈 💣」</strong>與紅色<strong>「拆答案炸彈 🎯」</strong>按鈕哦！</span>
                </div>
              </div>

              <button
                onClick={() => setIsInfoExpanded(false)}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 text-center mt-1"
              >
                關閉，開始挑戰！
              </button>
            </motion.div>
          </div>
        )}

        {/* 電腦版 (md 以上) 固定在左邊的經典資訊板 (完全不遮擋，高對比排版) */}
        <div className="hidden md:flex col-span-4 flex-col gap-3 bg-white/95 rounded-2xl border-3 border-emerald-400/80 p-3 shadow-md min-h-0 overflow-y-auto max-h-none z-10 justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 font-extrabold text-xs px-2.5 py-1 rounded-lg w-fit border border-emerald-100">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>{questionTitle}</span>
            </div>
            
            <h3 className="text-xs md:text-sm lg:text-base font-black text-slate-800 leading-relaxed">
              {questionText}
            </h3>
          </div>

          <div className="flex flex-col gap-2">
            {/* 答案選項對照表 */}
            <div className="bg-slate-50 rounded-xl p-2 md:p-3 border border-slate-100 text-[11px] md:text-xs flex flex-col gap-1.5">
              <span className="font-extrabold text-slate-500">🔍 答案選項對照表：</span>
              <div className="flex flex-col gap-1.5">
                {bombs.map(b => (
                  <div key={b.key} className="flex items-start gap-1.5 font-bold leading-tight">
                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black text-white shrink-0 ${
                      b.key === 'A' ? 'bg-blue-500' : b.key === 'B' ? 'bg-pink-500' : 'bg-amber-500'
                    }`}>
                      {b.key}
                    </span>
                    <span className="text-slate-700">{b.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 炸彈提示 */}
            <div className="bg-amber-50/75 border border-amber-200/50 rounded-xl p-2 text-[10px] lg:text-[11px] font-bold text-amber-800 leading-normal flex items-start gap-1">
              <span>💣</span>
              <span><strong>放普通炸彈(空白鍵或黃按鈕)</strong> 可炸開木箱！炸開後會隨機掉落金幣或小花，別被自己放的炸彈爆炸波及囉！</span>
            </div>
          </div>

          {/* 電腦操作提示 */}
          <div className="flex flex-col text-[10px] lg:text-[11px] font-bold text-slate-400 leading-normal border-t border-dashed border-slate-200 pt-2">
            <span className="text-slate-600 font-extrabold mb-0.5">💻 鍵盤操控秘技：</span>
            <span>• WASD 或 方向鍵 ➔ 移動角色</span>
            <span>• <strong className="text-amber-500 font-extrabold">空白鍵 (Space)</strong> ➔ 放置普通炸彈</span>
            <span>• <strong className="text-rose-500 font-extrabold">Enter 鍵</strong> ➔ 拆除答案炸彈</span>
          </div>
        </div>

        {/* 右側：主迷宮地圖 & 操作 D-Pad */}
        <div className="col-span-12 md:col-span-8 flex flex-col justify-between min-h-0 overflow-hidden gap-2">
          
          {/* 迷宮本體 (適應容器大小) */}
          <div className="flex-1 w-full flex items-center justify-center min-h-0 overflow-hidden" ref={containerRef}>
            <div 
              className="relative w-full max-w-[800px] aspect-[13/9] bg-emerald-800/15 p-1.5 rounded-3xl border-4 border-white/80 shadow-lg flex items-center justify-center touch-none select-none"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              
              {/* 草地格網格 */}
              <div className="w-full h-full grid grid-cols-13 grid-rows-9 gap-[1.5px] bg-emerald-950/10 rounded-2xl overflow-hidden p-1">
                {grid.map((row, y) =>
                  row.map((cell, x) => {
                    const isPlayer = player.x === x && player.y === y;
                    const bomb = bombs.find(b => b.x === x && b.y === y);
                    const regularBomb = regularBombs.find(b => b.x === x && b.y === y);
                    const flame = flames.find(f => f.x === x && f.y === y);

                    const isAdjacent = Math.abs(x - player.x) + Math.abs(y - player.y) === 1;
                    const isSelf = player.x === x && player.y === y;
                    const isMovableCell = isAdjacent && cell !== 'WALL';

                    return (
                      <div
                        key={`${x}-${y}`}
                        onClick={() => handleCellClick(x, y)}
                        className={`relative w-full h-full rounded-xs flex items-center justify-center overflow-hidden select-none transition-all duration-100 ${
                          isMovableCell 
                            ? 'cursor-pointer hover:bg-emerald-300/80 hover:brightness-110 active:scale-95 ring-1 ring-emerald-300/30' 
                            : isSelf 
                            ? 'cursor-pointer hover:ring-2 hover:ring-amber-400 active:scale-95' 
                            : ''
                        }`}
                        style={{
                          backgroundColor: (x + y) % 2 === 0 ? 'rgba(167, 243, 208, 0.45)' : 'rgba(110, 231, 183, 0.45)'
                        }}
                      >
                        {/* 牆壁元素 */}
                        {cell === 'WALL' && (
                          <div className="absolute inset-0 bg-slate-400 border-[1.5px] border-slate-500 rounded-sm shadow-inner flex items-center justify-center">
                            <svg viewBox="0 0 40 40" className="w-full h-full opacity-85">
                              <rect x="2" y="2" width="36" height="36" rx="3" fill="#64748b" />
                              <rect x="5" y="5" width="30" height="30" rx="1" fill="#475569" />
                              <line x1="5" y1="20" x2="35" y2="20" stroke="#334155" strokeWidth="2" />
                              <line x1="20" y1="5" x2="20" y2="20" stroke="#334155" strokeWidth="2" />
                              <line x1="15" y1="20" x2="15" y2="35" stroke="#334155" strokeWidth="2" />
                            </svg>
                          </div>
                        )}

                        {/* 可炸開的木箱 */}
                        {cell === 'BRICK' && (
                          <div className="absolute inset-[1px] bg-amber-200 border-[1.5px] border-amber-300 rounded-sm shadow-sm flex items-center justify-center">
                            <svg viewBox="0 0 40 40" className="w-full h-full">
                              <rect x="2" y="2" width="36" height="36" rx="4" fill="#854d0e" />
                              <rect x="5" y="5" width="30" height="30" rx="2" fill="#a16207" />
                              <line x1="5" y1="5" x2="35" y2="35" stroke="#713f12" strokeWidth="2.5" />
                              <line x1="35" y1="5" x2="5" y2="35" stroke="#713f12" strokeWidth="2.5" />
                            </svg>
                          </div>
                        )}

                        {/* Q版小紅花 */}
                        {cell === 'FLOWER' && (
                          <div className="absolute w-[60%] h-[60%] flex items-center justify-center animate-[pulse_2s_infinite]">
                            <svg viewBox="0 0 24 24" className="w-full h-full">
                              <circle cx="12" cy="12" r="3" fill="#facc15" />
                              <circle cx="12" cy="6" r="4.5" fill="#f43f5e" />
                              <circle cx="12" cy="18" r="4.5" fill="#f43f5e" />
                              <circle cx="6" cy="12" r="4.5" fill="#f43f5e" />
                              <circle cx="18" cy="12" r="4.5" fill="#f43f5e" />
                            </svg>
                          </div>
                        )}

                        {/* 金幣 */}
                        {cell === 'COIN' && (
                          <motion.div
                            className="absolute w-[60%] h-[60%] cursor-pointer flex items-center justify-center z-1"
                            whileHover={{ scale: 1.25 }}
                            animate={{ rotateY: 360 }}
                            transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
                            onClick={() => onCollectCoin(x, y)}
                          >
                            <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-sm">
                              <circle cx="16" cy="16" r="14" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                              <circle cx="16" cy="16" r="9" fill="#f59e0b" />
                              <rect x="13" y="13" width="6" height="6" fill="#fbbf24" rx="1" />
                            </svg>
                          </motion.div>
                        )}

                        {/* 可愛答案炸彈 */}
                        {bomb && (
                          <motion.div
                            className={`absolute inset-0 flex flex-col items-center justify-center cursor-pointer z-10 p-0.5 rounded-lg ${
                              isNearBomb(bomb) ? 'bg-amber-300/30 ring-2 ring-yellow-400' : ''
                            }`}
                            animate={{
                              scale: [1, 1.04, 1],
                              rotate: [-1.5, 1.5, -1.5],
                            }}
                            transition={{
                              repeat: Infinity,
                              duration: 1.4 + (bomb.key === 'A' ? 0.1 : bomb.key === 'B' ? 0.2 : 0.3),
                              ease: 'easeInOut'
                            }}
                            onClick={() => handleBombClick(bomb)}
                          >
                            <div className="w-[70%] h-[70%] relative flex items-center justify-center mt-1">
                              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                                <path d="M 50 25 Q 55 10 70 12" fill="none" stroke="#e11d48" strokeWidth="4" />
                                <circle cx="70" cy="12" r="4.5" fill="#facc15" className="animate-ping" />
                                <circle cx="70" cy="12" r="2.5" fill="#ef4444" />
                                <circle
                                  cx="50"
                                  cy="55"
                                  r="32"
                                  fill={bomb.key === 'A' ? '#3b82f6' : bomb.key === 'B' ? '#ec4899' : '#f59e0b'}
                                  stroke="#ffffff"
                                  strokeWidth="2.5"
                                />
                                <circle cx="38" cy="50" r="3" fill="#ffffff" />
                                <circle cx="62" cy="50" r="3" fill="#ffffff" />
                                <circle cx="38" cy="51" r="1.5" fill="#1e293b" />
                                <circle cx="62" cy="51" r="1.5" fill="#1e293b" />
                                <ellipse cx="32" cy="56" rx="3" ry="1.5" fill="#fda4af" opacity="0.8" />
                                <ellipse cx="68" cy="56" rx="3" ry="1.5" fill="#fda4af" opacity="0.8" />
                                <circle cx="50" cy="55" r="14" fill="#ffffff" />
                                <text x="50" y="60.5" fontSize="17" fontWeight="900" fill="#1e293b" textAnchor="middle">
                                  {bomb.key}
                                </text>
                              </svg>
                            </div>
                            {isNearBomb(bomb) && (
                              <div className="absolute bottom-[2px] bg-rose-500 text-white font-black text-[7px] px-1 py-0.5 rounded-full scale-80 animate-bounce leading-none">
                                可拆除
                              </div>
                            )}
                          </motion.div>
                        )}

                        {/* 新增：普通炸彈 (RegularBomb) 渲染 */}
                        {regularBomb && (
                          <motion.div
                            className="absolute inset-[3px] z-10 flex items-center justify-center pointer-events-none"
                            animate={{
                              scale: [1, 1.15, 0.95, 1.1, 1],
                            }}
                            transition={{
                              repeat: Infinity,
                              duration: 0.5,
                            }}
                          >
                            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                              <path d="M 50 30 Q 60 15 75 10" fill="none" stroke="#facc15" strokeWidth="5" strokeLinecap="round" />
                              <circle cx="75" cy="10" r="4.5" fill="#ef4444" className="animate-ping" />
                              <circle cx="75" cy="10" r="2.5" fill="#ffffff" />
                              <circle cx="50" cy="60" r="30" fill="#334155" stroke="#1e293b" strokeWidth="2.5" />
                              <circle cx="42" cy="54" r="3" fill="#fff" />
                              <circle cx="58" cy="54" r="3" fill="#fff" />
                              <circle cx="42" cy="54" r="1.5" fill="#000" />
                              <circle cx="58" cy="54" r="1.5" fill="#000" />
                              <circle cx="50" cy="72" r="4" fill="#ef4444" className="animate-pulse" />
                            </svg>
                          </motion.div>
                        )}

                        {/* 新增：爆炸火焰 (Flame) 渲染 */}
                        {flame && (
                          <motion.div
                            className="absolute inset-0 z-15 flex items-center justify-center pointer-events-none"
                            initial={{ scale: 0.5, opacity: 0.5 }}
                            animate={{ scale: [0.5, 1.15, 1], opacity: [0.5, 1, 0.8] }}
                            transition={{ duration: 0.25 }}
                            style={{
                              backgroundColor: 'rgba(249, 115, 22, 0.35)',
                              boxShadow: 'inset 0 0 8px rgba(239, 68, 68, 0.7)',
                              borderRadius: '4px'
                            }}
                          >
                            <svg viewBox="0 0 100 100" className="w-full h-full select-none scale-105">
                              <path d="M 50 10 L 50 90 M 10 50 L 90 50" stroke="#f97316" strokeWidth="15" strokeLinecap="round" />
                              <path d="M 50 15 L 50 85 M 15 50 L 85 50" stroke="#facc15" strokeWidth="9" strokeLinecap="round" />
                              <circle cx="50" cy="50" r="20" fill="#ef4444" />
                              <circle cx="50" cy="50" r="13" fill="#f97316" />
                              <circle cx="50" cy="50" r="7" fill="#ffffff" />
                            </svg>
                          </motion.div>
                        )}

                        {/* 玩家角色呈現 */}
                        {isPlayer && (
                          <motion.div
                            className="absolute inset-[1px] z-20 flex items-center justify-center pointer-events-none"
                            layoutId="player"
                            transition={{ type: 'spring', stiffness: 350, damping: 24 }}
                          >
                            {character === 'agent' ? (
                              <svg
                                viewBox="0 0 100 100"
                                className={`w-full h-full ${
                                  player.state === 'WALKING'
                                    ? 'animate-[bounce_0.35s_infinite]'
                                    : player.state === 'BOOM'
                                    ? 'animate-bounce opacity-80'
                                    : player.state === 'WIN_DANCE'
                                    ? 'animate-[spin_1.2s_ease-out_infinite]'
                                    : ''
                                }`}
                              >
                                <g transform={player.direction === 'LEFT' ? 'scale(-1, 1) translate(-100, 0)' : ''}>
                                  {player.state === 'BOOM' ? (
                                    <circle cx="50" cy="55" r="28" fill="#4a5568" />
                                  ) : (
                                    <circle cx="50" cy="55" r="28" fill="#ffe4e1" />
                                  )}
                                  {player.state !== 'BOOM' && (
                                    <>
                                      <circle cx="34" cy="58" r="5" fill="#ffb6c1" opacity="0.8" />
                                      <circle cx="66" cy="58" r="5" fill="#ffb6c1" opacity="0.8" />
                                    </>
                                  )}
                                  {player.state === 'BOOM' ? (
                                    <>
                                      <line x1="36" y1="46" x2="44" y2="54" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                                      <line x1="44" y1="46" x2="36" y2="54" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                                      <line x1="56" y1="46" x2="64" y2="54" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                                      <line x1="64" y1="46" x2="56" y2="54" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                                    </>
                                  ) : player.state === 'WIN_DANCE' ? (
                                    <>
                                      <path d="M 34 50 Q 40 44 46 50" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />
                                      <path d="M 54 50 Q 60 44 66 50" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />
                                    </>
                                  ) : (
                                    <>
                                      <circle cx="40" cy="50" r="4" fill="#2d3748" />
                                      <circle cx="60" cy="50" r="4" fill="#2d3748" />
                                      <circle cx="41" cy="48" r="1.5" fill="#fff" />
                                      <circle cx="61" cy="48" r="1.5" fill="#fff" />
                                    </>
                                  )}
                                  {player.state === 'BOOM' ? (
                                    <line x1="45" y1="62" x2="55" y2="62" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                                  ) : (
                                    <path d="M 46 62 Q 50 66 54 62" stroke="#2d3748" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                                  )}
                                  <path d="M 18 42 C 20 20, 80 20, 82 42 Z" fill={player.state === 'BOOM' ? '#1a202c' : '#008080'} />
                                  <path d="M 15 42 L 85 42 Q 85 46 50 46 Q 15 46 15 42" fill={player.state === 'BOOM' ? '#000000' : '#004d4d'} />
                                  <circle cx="50" cy="30" r="6" fill="#fbbf24" />
                                  <text x="50" y="33" fontSize="8" fontWeight="bold" fill="#fff" textAnchor="middle">稅</text>
                                </g>
                              </svg>
                            ) : (
                              <svg
                                viewBox="0 0 100 100"
                                className={`w-full h-full ${
                                  player.state === 'WALKING'
                                    ? 'animate-[bounce_0.35s_infinite]'
                                    : player.state === 'BOOM'
                                    ? 'animate-bounce opacity-80'
                                    : player.state === 'WIN_DANCE'
                                    ? 'animate-[spin_1.2s_ease-out_infinite]'
                                    : ''
                                }`}
                              >
                                <g transform={player.direction === 'LEFT' ? 'scale(-1, 1) translate(-100, 0)' : ''}>
                                  <path d="M 22 45 C 10 35, 15 65, 30 55" fill="#a7f3d0" opacity="0.6" />
                                  <path d="M 78 45 C 90 35, 85 65, 70 55" fill="#a7f3d0" opacity="0.6" />
                                  {player.state === 'BOOM' ? (
                                    <circle cx="50" cy="55" r="28" fill="#4a5568" />
                                  ) : (
                                    <circle cx="50" cy="55" r="28" fill="#fff5ee" />
                                  )}
                                  {player.state !== 'BOOM' && (
                                    <>
                                      <circle cx="34" cy="58" r="5" fill="#fda4af" opacity="0.8" />
                                      <circle cx="66" cy="58" r="5" fill="#fda4af" opacity="0.8" />
                                    </>
                                  )}
                                  {player.state === 'BOOM' ? (
                                    <>
                                      <line x1="36" y1="46" x2="44" y2="54" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                                      <line x1="44" y1="46" x2="36" y2="54" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                                      <line x1="56" y1="46" x2="64" y2="54" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                                      <line x1="64" y1="46" x2="56" y2="54" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                                    </>
                                  ) : player.state === 'WIN_DANCE' ? (
                                    <>
                                      <path d="M 34 50 Q 40 44 46 50" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />
                                      <path d="M 54 50 Q 60 44 66 50" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />
                                    </>
                                  ) : (
                                    <>
                                      <circle cx="40" cy="50" r="4.5" fill="#2d3748" />
                                      <circle cx="60" cy="50" r="4.5" fill="#2d3748" />
                                      <circle cx="39" cy="48" r="1.5" fill="#fff" />
                                      <circle cx="59" cy="48" r="1.5" fill="#fff" />
                                    </>
                                  )}
                                  {player.state === 'BOOM' ? (
                                    <line x1="45" y1="62" x2="55" y2="62" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                                  ) : (
                                    <path d="M 45 61 Q 50 67 55 61" stroke="#2d3748" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                                  )}
                                  <path d="M 20 40 L 50 18 L 80 40 Z" fill={player.state === 'BOOM' ? '#1a202c' : '#fb923c'} />
                                  <circle cx="50" cy="18" r="4" fill="#4ade80" />
                                  <path d="M 50 18 Q 58 12 50 8 Q 42 12 50 18" fill="#22c55e" />
                                </g>
                              </svg>
                            )}
                          </motion.div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* 底部控制區 (Switch 掌機按鈕風格) */}
          <div className="w-full flex items-center justify-between gap-3 bg-white/95 p-2 rounded-2xl border-2 border-white shadow-sm z-10">
            
            {/* 左側 D-Pad 移動控制 */}
            <div className="flex items-center gap-2">
              <div className="grid grid-cols-3 grid-rows-3 gap-1 w-20 h-20 md:w-24 md:h-24 bg-slate-100 rounded-full p-1.5 border border-slate-200 shadow-inner shrink-0">
                <div />
                <button
                  id="btn-dpad-up"
                  onClick={() => onMove('UP')}
                  className="bg-sky-400 hover:bg-sky-500 active:bg-sky-600 text-white rounded-lg flex items-center justify-center shadow-sm active:scale-90 transition-all animate-[pulse_3s_infinite]"
                >
                  <ArrowUp className="w-4 h-4 stroke-[3]" />
                </button>
                <div />

                <button
                  id="btn-dpad-left"
                  onClick={() => onMove('LEFT')}
                  className="bg-sky-400 hover:bg-sky-500 active:bg-sky-600 text-white rounded-lg flex items-center justify-center shadow-sm active:scale-90 transition-all"
                >
                  <ArrowLeft className="w-4 h-4 stroke-[3]" />
                </button>
                <div className="bg-slate-300 rounded-full m-0.5" />
                <button
                  id="btn-dpad-right"
                  onClick={() => onMove('RIGHT')}
                  className="bg-sky-400 hover:bg-sky-500 active:bg-sky-600 text-white rounded-lg flex items-center justify-center shadow-sm active:scale-90 transition-all"
                >
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>

                <div />
                <button
                  id="btn-dpad-down"
                  onClick={() => onMove('DOWN')}
                  className="bg-sky-400 hover:bg-sky-500 active:bg-sky-600 text-white rounded-lg flex items-center justify-center shadow-sm active:scale-90 transition-all"
                >
                  <ArrowDown className="w-4 h-4 stroke-[3]" />
                </button>
                <div />
              </div>
              <div className="hidden lg:flex flex-col text-[10px] font-bold text-slate-400 shrink-0 select-none">
                <span>◀ 移動方向</span>
                <span>(可用 WASD)</span>
              </div>
            </div>

            {/* 右側：雙核心動作大按鍵 (放炸彈 💣 + 拆答案炸彈 🎯) */}
            <div className="flex-1 flex gap-2 justify-end max-w-[340px]">
              
              {/* 普通炸彈按鈕 */}
              <button
                id="btn-action-bomb"
                onClick={onPlaceRegularBomb}
                className="flex-1 py-2 md:py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 active:translate-y-0.5 text-white font-black text-xs md:text-sm rounded-xl shadow-[0_3px_0_rgba(180,83,9,1)] active:shadow-none transition-all flex flex-col items-center justify-center gap-0.5"
              >
                <span className="text-sm md:text-base animate-[bounce_2s_infinite]">💣</span>
                <span>放炸彈 (空白鍵)</span>
                <span className="text-[9px] opacity-80 font-medium hidden sm:inline">炸木箱開路 / 點角色</span>
              </button>

              {/* 拆除答案炸彈按鈕 */}
              <button
                id="btn-action-defuse"
                onClick={handleSpaceDefuse}
                className="flex-1 py-2 md:py-2.5 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 active:translate-y-0.5 text-white font-black text-xs md:text-sm rounded-xl shadow-[0_3px_0_rgba(190,24,74,1)] active:shadow-none transition-all flex flex-col items-center justify-center gap-0.5"
              >
                <span className="text-sm md:text-base">🎯</span>
                <span>拆答案炸彈</span>
                <span className="text-[9px] opacity-80 font-medium hidden sm:inline">(Enter 鍵)</span>
              </button>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

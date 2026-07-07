/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GameStage, QUESTIONS, CellType, Player, BombInfo, QUESTIONS as QUESTION_LIST, RegularBomb, Flame } from './types';
import { AudioSynth } from './utils/audio';
import { generateLevelData } from './utils/maps';
import IntroScreen from './components/IntroScreen';
import GameBoard from './components/GameBoard';
import PromoScreen from './components/PromoScreen';
import { Sparkles, HeartCrack, RotateCcw, Award, CheckCircle2, ChevronRight, XCircle } from 'lucide-react';

export default function App() {
  const [stage, setStage] = useState<GameStage>(GameStage.Intro);
  const [character, setCharacter] = useState<'agent' | 'elf'>('agent');
  const [levelIndex, setLevelIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [deaths, setDeaths] = useState(0);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // 當前關卡地圖與炸彈
  const [grid, setGrid] = useState<CellType[][]>([]);
  const [bombs, setBombs] = useState<BombInfo[]>([]);
  const [player, setPlayer] = useState<Player>({
    x: 1,
    y: 1,
    direction: 'RIGHT',
    state: 'IDLE'
  });

  // 新增：普通炸彈與火焰狀態
  const [regularBombs, setRegularBombs] = useState<RegularBomb[]>([]);
  const [flames, setFlames] = useState<Flame[]>([]);

  // 為了在定時器中取得最新值，使用 Ref
  const gridRef = useRef<CellType[][]>(grid);
  const playerRef = useRef<Player>(player);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  // 控制各類彈窗
  const [showClearedModal, setShowClearedModal] = useState(false);
  const [showExplodedModal, setShowExplodedModal] = useState(false);
  const [lastSelectedBomb, setLastSelectedBomb] = useState<BombInfo | null>(null);

  // 初始化音效狀態
  useEffect(() => {
    setIsMuted(AudioSynth.isMuted());
  }, []);

  // 開始遊戲
  const handleStartGame = (selectedChar: 'agent' | 'elf') => {
    setCharacter(selectedChar);
    setLevelIndex(0);
    setScore(0);
    setHearts(3);
    setDeaths(0);
    setCoinsCollected(0);
    loadLevel(0);
    setStage(GameStage.Playing);
    AudioSynth.startBGM();
  };

  // 載入關卡地圖
  const loadLevel = (index: number) => {
    const levelData = generateLevelData(index);
    setGrid(levelData.grid);
    setBombs(levelData.bombs);
    setPlayer({
      x: levelData.playerStart.x,
      y: levelData.playerStart.y,
      direction: 'RIGHT',
      state: 'IDLE'
    });
    setRegularBombs([]);
    setFlames([]);
    setShowClearedModal(false);
    setShowExplodedModal(false);
  };

  // 切換靜音
  const handleToggleMute = () => {
    const newMute = AudioSynth.toggleMute();
    setIsMuted(newMute);
  };

  // 重新挑戰此關卡 (重置位置與炸彈，但不扣命與分數，方便手滑重來)
  const handleRestartLevel = () => {
    AudioSynth.playClick();
    loadLevel(levelIndex);
  };

  // 角色移動邏輯
  const handleMove = (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (player.state === 'BOOM' || player.state === 'WIN_DANCE') return;

    let nextX = player.x;
    let nextY = player.y;

    switch (dir) {
      case 'UP': nextY -= 1; break;
      case 'DOWN': nextY += 1; break;
      case 'LEFT': nextX -= 1; break;
      case 'RIGHT': nextX += 1; break;
    }

    // 碰撞邊界檢查
    if (nextY < 0 || nextY >= grid.length || nextX < 0 || nextX >= grid[0].length) return;

    const targetCell = grid[nextY][nextX];

    // 如果撞牆、箱子，則阻擋
    if (targetCell === 'WALL' || targetCell === 'BRICK') {
      return;
    }

    // 收集金幣
    let newGrid = [...grid.map(row => [...row])];
    if (targetCell === 'COIN') {
      handleCollectCoin(nextX, nextY);
      newGrid[nextY][nextX] = 'EMPTY';
      setGrid(newGrid);
    }

    // 更新位置
    setPlayer({
      x: nextX,
      y: nextY,
      direction: dir,
      state: 'WALKING'
    });

    // 動畫短暫重置回待機
    setTimeout(() => {
      setPlayer(prev => ({
        ...prev,
        state: prev.state === 'WALKING' ? 'IDLE' : prev.state
      }));
    }, 150);
  };

  // 收集金幣
  const handleCollectCoin = (x: number, y: number) => {
    setCoinsCollected(prev => prev + 1);
    AudioSynth.playClick();
    
    // 把格子變成空的
    setGrid(prev => {
      const copy = prev.map(row => [...row]);
      copy[y][x] = 'EMPTY';
      return copy;
    });
  };

  // 放置普通炸彈 (炸開障礙物)
  const handlePlaceRegularBomb = () => {
    if (player.state === 'BOOM' || player.state === 'WIN_DANCE' || stage !== GameStage.Playing) return;

    // 檢查目前格子上是否已經放了炸彈
    const alreadyHasBomb = regularBombs.some(b => b.x === player.x && b.y === player.y);
    if (alreadyHasBomb) return;

    AudioSynth.playPlaceBomb();
    const newBomb: RegularBomb = {
      id: `${Date.now()}-${Math.random()}`,
      x: player.x,
      y: player.y,
      timer: 1600 // 1.6秒倒數
    };

    setRegularBombs(prev => [...prev, newBomb]);
  };

  // 觸發普通炸彈爆炸
  const triggerExplosion = (bx: number, by: number) => {
    AudioSynth.playBoom();

    const currentGrid = gridRef.current;
    const currentPlayer = playerRef.current;

    // 爆炸火焰格子收集
    const newFlames: Flame[] = [];
    const flameId = `${Date.now()}-${Math.random()}`;

    // 中心
    newFlames.push({ x: bx, y: by, id: `${flameId}-c` });

    // 十字方向傳播 (上下左右各 1 格)
    const directions = [
      { dx: 0, dy: -1 }, // 上
      { dx: 0, dy: 1 },  // 下
      { dx: -1, dy: 0 }, // 左
      { dx: 1, dy: 0 }   // 右
    ];

    let gridChanged = false;
    const gridCopy = currentGrid.map(row => [...row]);

    directions.forEach(({ dx, dy }) => {
      const tx = bx + dx;
      const ty = by + dy;

      if (ty >= 0 && ty < gridCopy.length && tx >= 0 && tx < gridCopy[0].length) {
        const cell = gridCopy[ty][tx];
        if (cell === 'WALL') {
          return; // 牆壁阻擋火焰，不傳播
        }

        if (cell === 'BRICK') {
          // 破壞木箱，火焰在此停止，並隨機掉落金幣或小花
          gridCopy[ty][tx] = 'EMPTY';
          gridChanged = true;

          const rand = Math.random();
          if (rand < 0.35) {
            gridCopy[ty][tx] = 'COIN';
          } else if (rand < 0.55) {
            gridCopy[ty][tx] = 'FLOWER';
          }

          newFlames.push({ x: tx, y: ty, id: `${flameId}-${dx}-${dy}` });
          return;
        }

        // 其他格子 (EMPTY, COIN, FLOWER，或是答案炸彈所在地，我們都不破壞，但火焰可以穿過)
        newFlames.push({ x: tx, y: ty, id: `${flameId}-${dx}-${dy}` });
      }
    });

    if (gridChanged) {
      setGrid(gridCopy);
    }

    setFlames(prev => [...prev, ...newFlames]);

    // 0.6秒後移除火焰
    setTimeout(() => {
      setFlames(prev => prev.filter(f => !newFlames.some(nf => nf.id === f.id)));
    }, 600);

    // 檢查玩家是否在爆炸範圍內
    const isPlayerHit = newFlames.some(f => f.x === currentPlayer.x && f.y === currentPlayer.y);
    if (isPlayerHit) {
      setPlayer(prev => ({ ...prev, state: 'BOOM' }));
      setScore(prev => Math.max(0, prev - 10)); // 扣 10 分，滿臉焦黑

      setTimeout(() => {
        setPlayer(prev => ({ ...prev, state: prev.state === 'BOOM' ? 'IDLE' : prev.state }));
      }, 1000);
    }
  };

  // 定時更新炸彈倒數
  useEffect(() => {
    if (stage !== GameStage.Playing) return;

    const interval = setInterval(() => {
      setRegularBombs(prev => {
        const exploding: RegularBomb[] = [];
        const remaining = prev.map(bomb => {
          const nextTimer = bomb.timer - 100;
          if (nextTimer <= 0) {
            exploding.push(bomb);
          }
          return { ...bomb, timer: nextTimer };
        }).filter(bomb => bomb.timer > 0);

        if (exploding.length > 0) {
          exploding.forEach(bomb => {
            triggerExplosion(bomb.x, bomb.y);
          });
        }

        return remaining;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [stage]);

  // 拆除炸彈
  const handleDefuse = (bombKey: 'A' | 'B' | 'C' | null) => {
    if (!bombKey) return;
    const bomb = bombs.find(b => b.key === bombKey);
    if (!bomb) return;

    setLastSelectedBomb(bomb);

    if (bomb.isCorrect) {
      // 答對了！
      AudioSynth.playDing();
      setScore(prev => prev + 100);
      setPlayer(prev => ({ ...prev, state: 'WIN_DANCE' }));

      const isLastLevel = levelIndex === QUESTION_LIST.length - 1;
      if (isLastLevel) {
        // 全部答對時直接跳到全部答對頁面，不用出現小視窗
        AudioSynth.playGameWin();
        setTimeout(() => {
          AudioSynth.stopBGM();
          setStage(GameStage.Promo);
        }, 1600); // 讓玩家跳舞 1.6秒 播放過關音效，之後直接跳轉 Promo
      } else {
        AudioSynth.playLevelWin();
        setShowClearedModal(true);
      }
    } else {
      // 答錯了！爆炸！
      AudioSynth.playBoom();
      setPlayer(prev => ({ ...prev, state: 'BOOM' }));
      setHearts(prev => {
        const nextHearts = prev - 1;
        if (nextHearts <= 0) {
          // 生命值歸零，顯示被炸 Modal，按鈕點擊後才 Game Over，給予良好體驗
          setDeaths(d => d + 1);
          setShowExplodedModal(true);
        } else {
          setDeaths(d => d + 1);
          setShowExplodedModal(true);
        }
        return nextHearts;
      });
    }
  };

  // 進入下一關或完成
  const handleNextLevel = () => {
    AudioSynth.playClick();
    const nextIndex = levelIndex + 1;
    if (nextIndex >= QUESTIONS.length) {
      // 全部通關
      AudioSynth.stopBGM();
      setStage(GameStage.Promo);
    } else {
      setLevelIndex(nextIndex);
      loadLevel(nextIndex);
    }
  };

  // 被炸後重試 (若生命還有) 或是 Game Over
  const handleRetryAfterExplosion = () => {
    AudioSynth.playClick();
    setShowExplodedModal(false);
    
    if (hearts <= 0) {
      // 生命歸零
      AudioSynth.stopBGM();
      setStage(GameStage.GameOver);
    } else {
      // 重新加載本關位置，讓玩家重選
      loadLevel(levelIndex);
    }
  };

  // 重新挑戰
  const handleRestartAll = () => {
    setStage(GameStage.Intro);
  };

  return (
    <div id="game-app-container" className="w-screen h-screen flex items-center justify-center bg-slate-900 overflow-hidden">
      
      {/* 限制最大寬高 16:9 的 Switch 風格框 */}
      <div className="relative w-full h-full max-w-[1280px] max-h-[720px] aspect-[16/9] bg-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden rounded-none md:rounded-3xl border-0 md:border-[12px] border-slate-700">
        
        {stage === GameStage.Intro && (
          <IntroScreen
            onStart={handleStartGame}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        )}

        {stage === GameStage.Playing && (
          <GameBoard
            levelIndex={levelIndex}
            questionTitle={QUESTIONS[levelIndex].title}
            questionText={QUESTIONS[levelIndex].question}
            grid={grid}
            bombs={bombs}
            player={player}
            hearts={hearts}
            score={score}
            coinsCollected={coinsCollected}
            themeColor={generateLevelData(levelIndex).themeColor}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onMove={handleMove}
            onDefuse={handleDefuse}
            onRestartLevel={handleRestartLevel}
            character={character}
            onCollectCoin={handleCollectCoin}
            regularBombs={regularBombs}
            flames={flames}
            onPlaceRegularBomb={handlePlaceRegularBomb}
          />
        )}

        {stage === GameStage.Promo && (
          <PromoScreen
            score={score}
            deaths={deaths}
            coinsCollected={coinsCollected}
            character={character}
            onRestart={handleRestartAll}
          />
        )}

        {/* GAME OVER 畫面 (Switch 可愛風) */}
        {stage === GameStage.GameOver && (
          <div className="w-full h-full bg-gradient-to-b from-slate-900 via-rose-950 to-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
            <div className="absolute top-10 text-rose-500 font-extrabold tracking-widest text-sm bg-rose-500/10 px-4 py-1.5 rounded-full border border-rose-500/20">
              MISSION FAILED
            </div>

            <HeartCrack className="w-20 h-20 text-rose-500 animate-bounce mb-4" />
            <h1 className="text-4xl md:text-6xl font-black text-rose-500 tracking-wider drop-shadow-lg">
              GAME OVER
            </h1>
            <p className="text-slate-300 font-semibold text-sm md:text-base mt-2 max-w-sm">
              很遺憾，愛心 ❤️ 已經全部歸零囉！<br />
              地價稅炸彈將你炸飛了。
            </p>

            <div className="mt-4 bg-slate-900/60 border border-slate-700/60 p-4 rounded-2xl text-xs text-slate-400 font-medium max-w-md text-left leading-relaxed">
              💡 沒關係！「自用住宅優惠稅率千分之二、信託土地義務人為受託人、一般土地義務人為所有權人、本人/配偶/直系親屬設籍即可符合條件」。記住這些秘訣，再挑戰一次吧！
            </div>

            <button
              id="btn-gameover-restart"
              onClick={handleRestartAll}
              className="mt-6 px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white font-black text-lg rounded-2xl shadow-[0_5px_0_rgba(190,24,74,1)] active:translate-y-1 active:shadow-none transition-all duration-150 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span>重新挑戰拆彈！</span>
            </button>
          </div>
        )}

        {/* 答對彈窗 (LevelCleared) */}
        {showClearedModal && lastSelectedBomb && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border-4 border-emerald-400 shadow-2xl relative select-none">
              
              {/* 金幣紙屑裝飾 */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-emerald-100 rounded-full border-4 border-white flex items-center justify-center shadow-lg animate-bounce">
                <span className="text-4xl animate-spin" style={{ animationDuration: '4s' }}>🎉</span>
              </div>

              <div className="text-center mt-12 mb-4">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full border border-emerald-200">
                  ✔ 答對了！成功拆彈！
                </span>
                <h2 className="text-2xl font-black text-emerald-600 mt-2 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 animate-pulse" />
                  <span>拆彈成功！+100分</span>
                </h2>
              </div>

              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 mb-5">
                <p className="text-xs font-black text-emerald-800 mb-1">💡 新北地價稅小學堂：</p>
                <p className="text-sm font-bold text-slate-700 leading-relaxed">
                  {QUESTIONS[levelIndex].explanation}
                </p>
              </div>

              <button
                id="btn-modal-next"
                onClick={handleNextLevel}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-base rounded-2xl shadow-[0_4px_0_rgba(16,185,129,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-1.5"
              >
                <span>繼續挑戰下一關</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* 答錯/爆炸彈窗 (Exploded) */}
        {showExplodedModal && lastSelectedBomb && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border-4 border-rose-500 shadow-2xl relative select-none">
              
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-rose-100 rounded-full border-4 border-white flex items-center justify-center shadow-lg animate-bounce">
                <span className="text-4xl">💥</span>
              </div>

              <div className="text-center mt-12 mb-4">
                <span className="bg-rose-100 text-rose-800 text-xs font-black px-3 py-1 rounded-full border border-rose-200">
                  Boom! 踩到地價稅炸彈！
                </span>
                <h2 className="text-2xl font-black text-rose-600 mt-2 flex items-center justify-center gap-1.5">
                  <XCircle className="w-6 h-6 text-rose-500" />
                  <span>扣除生命 ❤️ 1 顆！</span>
                </h2>
              </div>

              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 mb-5">
                <p className="text-xs font-black text-rose-800 mb-1">❌ 拆彈失敗原因：</p>
                <p className="text-sm font-bold text-slate-700 leading-relaxed">
                  你選擇了「{lastSelectedBomb.text}」！<br />
                  這是不正確的選項，地價稅炸彈被引爆了。
                  請再想想看正確答案是哪一個。
                </p>
              </div>

              <button
                id="btn-modal-retry"
                onClick={handleRetryAfterExplosion}
                className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-black text-base rounded-2xl shadow-[0_4px_0_rgba(244,63,94,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-1.5"
              >
                <span>{hearts <= 0 ? '查看結算' : '重新挑戰此關卡'}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

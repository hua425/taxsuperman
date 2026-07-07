/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CellType, Position, BombInfo, QUESTIONS } from '../types';

export interface LevelData {
  grid: CellType[][];
  bombs: BombInfo[];
  playerStart: Position;
  themeColor: string; // 區分不同關卡的背景色
  decorations: { type: 'house' | 'tree' | 'flower'; x: number; y: number }[];
}

const WIDTH = 13;
const HEIGHT = 9;

// 設計 4 關的固定迷宮，保證通暢，且炸彈都在合理位置
export function generateLevelData(levelIndex: number): LevelData {
  const grid: CellType[][] = Array(HEIGHT)
    .fill(null)
    .map(() => Array(WIDTH).fill('EMPTY'));

  // 1. 設置外牆
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      if (y === 0 || y === HEIGHT - 1 || x === 0 || x === WIDTH - 1) {
        grid[y][x] = 'WALL';
      }
    }
  }

  // 2. 設置炸彈超人經典固定內牆 (奇數格/偶數格交叉，偶數 x, y 設為 WALL)
  for (let y = 2; y < HEIGHT - 2; y += 2) {
    for (let x = 2; x < WIDTH - 2; x += 2) {
      grid[y][x] = 'WALL';
    }
  }

  // 3. 根據關卡，添加部分可通行與不可通行的裝飾 (如小木箱 BRICK、草叢、金幣 COIN)
  // 為確保玩家起始點 (1,1), (1,2), (2,1) 可通行
  const noBlock = [
    '1,1', '1,2', '2,1', // 起始安全區
    '11,1', '11,2', '10,1', // 炸彈 A 區
    '11,7', '11,6', '10,7', // 炸彈 B 區
    '1,7', '1,6', '2,7' // 炸彈 C 區
  ];

  // 根據 levelIndex 隨機撒木箱與金幣
  const seed = (levelIndex + 3) * 7;
  let rCount = 0;
  const pseudoRandom = () => {
    rCount++;
    const x = Math.sin(seed + rCount) * 10000;
    return x - Math.floor(x);
  };

  const decorations: { type: 'house' | 'tree' | 'flower'; x: number; y: number }[] = [];

  for (let y = 1; y < HEIGHT - 1; y++) {
    for (let x = 1; x < WIDTH - 1; x++) {
      // 排除內牆與起始安全區/炸彈區
      if (grid[y][x] === 'WALL') continue;
      if (noBlock.includes(`${x},${y}`)) continue;

      const rand = pseudoRandom();
      if (rand < 0.25) {
        grid[y][x] = 'BRICK'; // 小障礙木箱
      } else if (rand < 0.38) {
        grid[y][x] = 'COIN'; // 可愛金幣，可供玩家收集
      } else if (rand < 0.45) {
        grid[y][x] = 'FLOWER'; // 裝飾性花朵
      }
    }
  }

  // 4. 定義炸彈
  const question = QUESTIONS[levelIndex];
  const numOptions = question.options.length;

  const bombPositions: Position[] = [
    { x: 11, y: 1 }, // A 炸彈
    { x: 11, y: 7 }, // B 炸彈
    { x: 1, y: 7 }   // C 炸彈 (若有)
  ];

  const bombs: BombInfo[] = [];

  // 前 3 關只有 A、B 兩個選項，第 4 關有 A、B、C 三個選項
  for (let i = 0; i < numOptions; i++) {
    const option = question.options[i];
    const pos = bombPositions[i];
    bombs.push({
      key: option.key,
      x: pos.x,
      y: pos.y,
      text: option.text,
      isCorrect: option.key === question.correctAnswer
    });
    // 確保炸彈位置是空的，可以踩
    grid[pos.y][pos.x] = 'EMPTY';
  }

  // 不同關卡的配色與裝飾
  const themeColors = [
    'from-emerald-50 to-teal-100',  // 綠草風
    'from-sky-50 to-indigo-100',   // 藍天風
    'from-amber-50 to-orange-100', // 陽光暖橙風
    'from-rose-50 to-pink-100'     // 粉嫩櫻花風
  ];

  // 外牆裝飾：為了一些空地或外牆加入房屋、小樹的視覺
  decorations.push({ type: 'house', x: 0, y: 0 });
  decorations.push({ type: 'tree', x: WIDTH - 1, y: 0 });
  decorations.push({ type: 'tree', x: 0, y: HEIGHT - 1 });
  decorations.push({ type: 'house', x: WIDTH - 1, y: HEIGHT - 1 });

  return {
    grid,
    bombs,
    playerStart: { x: 1, y: 1 },
    themeColor: themeColors[levelIndex] || 'from-emerald-50 to-teal-100',
    decorations
  };
}

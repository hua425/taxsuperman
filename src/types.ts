/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum GameStage {
  Intro = 'INTRO',
  Tutorial = 'TUTORIAL',
  Playing = 'PLAYING',
  LevelCleared = 'LEVEL_CLEARED',
  GameOver = 'GAME_OVER',
  Promo = 'PROMO'
}

export interface Question {
  id: number;
  title: string;
  question: string;
  options: {
    key: 'A' | 'B' | 'C';
    text: string;
  }[];
  correctAnswer: 'A' | 'B' | 'C';
  explanation: string;
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    title: '第一關',
    question: '請問自用住宅地價稅優惠稅率是多少？',
    options: [
      { key: 'A', text: '千分之二' },
      { key: 'B', text: '千分之十' }
    ],
    correctAnswer: 'A',
    explanation: '自用住宅地價稅優惠稅率為：千分之二。'
  },
  {
    id: 2,
    title: '第二關',
    question: '一般土地的地價稅納稅義務人是誰？',
    options: [
      { key: 'A', text: '居住者' },
      { key: 'B', text: '土地所有權人' }
    ],
    correctAnswer: 'B',
    explanation: '一般土地地價稅由土地所有權人負責繳納。'
  },
  {
    id: 3,
    title: '第三關',
    question: '設有信託的土地，地價稅納稅義務人是誰？',
    options: [
      { key: 'A', text: '委託人' },
      { key: 'B', text: '受託人' }
    ],
    correctAnswer: 'B',
    explanation: '信託土地的地價稅納稅義務人為：受託人。'
  },
  {
    id: 4,
    title: '第四關',
    question: '下列何人辦竣戶籍登記，符合地價稅自用住宅優惠條件之一？',
    options: [
      { key: 'A', text: '姐姐' },
      { key: 'B', text: '姪子' },
      { key: 'C', text: '爸爸' }
    ],
    correctAnswer: 'C',
    explanation: '爸爸屬於符合規定之家屬（本人、配偶或直系親屬）之一。'
  }
];

export type CellType = 'EMPTY' | 'WALL' | 'BRICK' | 'COIN' | 'FLOWER';

export interface Position {
  x: number;
  y: number;
}

export interface BombInfo {
  key: 'A' | 'B' | 'C';
  x: number;
  y: number;
  text: string;
  isCorrect: boolean;
}

export interface Player {
  x: number;
  y: number;
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  state: 'IDLE' | 'WALKING' | 'BOOM' | 'WIN_DANCE';
}

export interface RegularBomb {
  id: string;
  x: number;
  y: number;
  timer: number; // 毫秒或剩餘秒數
}

export interface Flame {
  x: number;
  y: number;
  id: string;
}


/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioSynthManager {
  private ctx: AudioContext | null = null;
  private bgmAudio: HTMLAudioElement | null = null;
  private muted: boolean = false;
  private bgmPlaying: boolean = false;

  private currentBgmPath: string = '';

  constructor() {
    // 延遲初始化，等使用者點擊再建立 AudioContext 與 BGM Audio
  }

  private initBgmAudio(path: string) {
    if (typeof window !== 'undefined') {
      if (!this.bgmAudio) {
        this.bgmAudio = new Audio(path);
        this.bgmAudio.loop = true;
        this.bgmAudio.volume = 0.4;
        this.currentBgmPath = path;
      } else if (this.currentBgmPath !== path) {
        this.bgmAudio.pause();
        this.bgmAudio.src = path;
        this.bgmAudio.load();
        this.currentBgmPath = path;
      }
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopBGMInternal();
    } else {
      if (this.bgmPlaying) {
        this.playBGMInternal(this.currentBgmPath || '/%E8%83%8C%E6%99%AF%E9%9F%B3%E6%A8%82.mp3');
      }
    }
    return this.muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  // 播放 8-bit 音符
  private playTone(freq: number, type: 'sine' | 'square' | 'triangle' | 'sawtooth', duration: number, volume: number = 0.1) {
    if (this.muted || !this.ctx) return;
    try {
      this.initContext();
      if (!this.ctx || this.ctx.state === 'suspended') return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Web Audio error:', e);
    }
  }

  public startBGM(path: string = '/%E8%83%8C%E6%99%AF%E9%9F%B3%E6%A8%82.mp3') {
    this.bgmPlaying = true;
    this.playBGMInternal(path);
  }

  private playBGMInternal(path: string) {
    if (this.muted) return;
    this.stopBGMInternal();
    this.initContext();
    this.initBgmAudio(path);
    if (this.bgmAudio) {
      this.bgmAudio.muted = false;
      this.bgmAudio.play().catch(err => {
        console.warn('Failed to play background music:', err);
      });
    }
  }

  public stopBGM() {
    this.bgmPlaying = false;
    this.stopBGMInternal();
  }

  private stopBGMInternal() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
  }

  // 答對音效：Ding-Ding (兩個快速爬升的和弦音)
  public playDing() {
    this.initContext();
    if (this.muted) return;
    setTimeout(() => this.playTone(523.25, 'sine', 0.1, 0.15), 0);   // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.1, 0.15), 80);  // E5
    setTimeout(() => this.playTone(783.99, 'sine', 0.2, 0.20), 160); // G5
  }

  // 拆彈按鈕：卡擦聲 (金屬摩擦雜訊聲)
  public playClick() {
    this.initContext();
    if (this.muted) return;
    this.playTone(800, 'triangle', 0.03, 0.1);
    setTimeout(() => this.playTone(1500, 'triangle', 0.02, 0.05), 30);
  }

  // 放置炸彈：啵一聲
  public playPlaceBomb() {
    this.initContext();
    if (this.muted) return;
    this.playTone(300, 'sine', 0.08, 0.15);
    setTimeout(() => this.playTone(450, 'sine', 0.1, 0.1), 30);
  }

  // 爆炸音效：可愛版 Boom (由高往低急速下降的鋸齒波與低音)
  public playBoom() {
    this.initContext();
    if (this.muted || !this.ctx) return;
    try {
      this.initContext();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.5);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.6);

      // 同時播放一個超低頻的爆音
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(100, this.ctx.currentTime);
      subOsc.frequency.linearRampToValueAtTime(10, this.ctx.currentTime + 0.4);

      subGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      subGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);

      subOsc.start();
      subOsc.stop(this.ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('Web Audio Boom error:', e);
    }
  }

  // 關卡過關：勝利號角 (可愛的 C和弦 輝煌旋律)
  public playLevelWin() {
    this.initContext();
    if (this.muted) return;
    // C4(261.63), E4(329.63), G4(392.00), C5(523.25)
    const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 523.25];
    const deltas = [0, 100, 200, 300, 450, 600];
    const durs = [0.15, 0.15, 0.15, 0.15, 0.15, 0.4];

    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', durs[idx], 0.15);
      }, deltas[idx]);
    });
  }

  // 遊戲全部過關：歡樂慶祝音樂
  public playGameWin() {
    this.initContext();
    if (this.muted) return;
    // 快節奏大調琶音
    const notes = [
      523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50, // C5 到 C6
      1046.50, 1046.50, 1318.51, 1567.98, 2093.00 // 最終輝煌結尾
    ];
    const deltas = [
      0, 100, 200, 300, 400, 500, 600, 700,
      900, 1050, 1200, 1350, 1500
    ];
    const durs = [
      0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.2,
      0.15, 0.15, 0.15, 0.15, 0.6
    ];

    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', durs[idx], 0.15);
      }, deltas[idx]);
    });
  }
}

export const AudioSynth = new AudioSynthManager();

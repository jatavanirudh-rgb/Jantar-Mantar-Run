/**
 * Procedural Web Audio Engine for Jan Tar Runner
 * Pure synthesis with zero external audio assets.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private bgmOscs: OscillatorNode[] = [];
  private bgmGain: GainNode | null = null;
  private isBgmPlaying: boolean = false;
  private tempoBpm: number = 128;
  private bgmTimer: number | null = null;
  private beatStep: number = 0;

  constructor() {
    // Read user mute preference
    const saved = localStorage.getItem('jantar_runner_muted');
    if (saved !== null) {
      this.isMuted = saved === 'true';
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    localStorage.setItem('jantar_runner_muted', String(muted));
    if (muted && this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(0, this.ctx.currentTime);
    } else if (!muted && this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.setMute(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Procedural Jump SFX: bouncy ascending tone with air release
   */
  public playJump() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(420, t + 0.16);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  /**
   * Procedural Slide SFX: white noise friction whoosh on Delhi asphalt
   */
  public playSlide() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.25);
    filter.Q.value = 3.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }

  /**
   * Procedural Lane Switch Whoosh
   */
  public playLaneSwitch() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.09);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  /**
   * Procedural Coin/Rupee Pickup Chime (bright resonant sparkle)
   */
  public playCoin() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Harmonic bell pair
    const freqs = [987.77, 1318.51]; // B5, E6
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);

      gain.gain.setValueAtTime(0.2, t + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t + idx * 0.04);
      osc.stop(t + idx * 0.04 + 0.2);
    });
  }

  /**
   * Procedural Power-up pickup: triumphant rising chord
   */
  public playPowerup() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.06);

      gain.gain.setValueAtTime(0.25, t + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.005, t + i * 0.06 + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t + i * 0.06);
      osc.stop(t + i * 0.06 + 0.3);
    });
  }

  /**
   * Procedural Stumble SFX: bump with obstacle thud
   */
  public playStumble() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.18);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.2);

    // Also blow a short urgent whistle burst
    this.playWhistle(0.12);
  }

  /**
   * Procedural Indian Police Whistle: authentic dual-tone shrill trill!
   */
  public playWhistle(duration = 0.35) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Classic Delhi police whistle has two resonance chambers (~2500Hz & ~2800Hz) with turbulent cork ball flutter
    [2450, 2820].forEach((baseFreq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      // Vibrato LFO for pea-whistle flutter
      const lfo = this.ctx!.createOscillator();
      const lfoGain = this.ctx!.createGain();
      lfo.frequency.setValueAtTime(28, t); // 28Hz rapid trill
      lfoGain.gain.setValueAtTime(120, t);
      lfo.connect(osc.frequency);
      lfo.start(t);
      lfo.stop(t + duration);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.005, t + duration);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + duration);
    });
  }

  /**
   * Procedural Delhi Police Siren chirp
   */
  public playPoliceSiren() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(650, t);
    osc.frequency.linearRampToValueAtTime(950, t + 0.25);
    osc.frequency.linearRampToValueAtTime(650, t + 0.5);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1600;

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.005, t + 0.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.5);
  }

  /**
   * Procedural Game Over / Arrest Crash
   */
  public playCrash() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Heavy impact thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.4);
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.45);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.45);

    // Urgent police whistle sequence
    setTimeout(() => this.playWhistle(0.5), 100);
  }

  /**
   * Procedural Dhol Groove BGM (Indian energetic percussion beat)
   */
  public startBGM() {
    if (this.isBgmPlaying) return;
    this.initCtx();
    if (!this.ctx) return;

    this.isBgmPlaying = true;
    this.beatStep = 0;
    this.scheduleDholLoop();
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) {
      window.clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  public setSpeedMultiplier(mult: number) {
    this.tempoBpm = Math.min(160, 128 * mult);
  }

  private scheduleDholLoop() {
    if (!this.isBgmPlaying || !this.ctx) return;

    const stepDuration = 60 / (this.tempoBpm * 4); // 16th notes
    const t = this.ctx.currentTime;

    // Play synthesized Dhol bass ("Dha") and Treble ("Ta/Na") rhythm
    if (!this.isMuted) {
      const stepInMeasure = this.beatStep % 16;

      // Bass Dhol hits on steps: 0, 3, 6, 8, 11, 14 (classic bhangra/protest march dhol cadence)
      if ([0, 6, 8, 12].includes(stepInMeasure)) {
        this.synthDholBass(t, stepInMeasure === 0 ? 0.28 : 0.22);
      } else if ([3, 10, 14].includes(stepInMeasure)) {
        this.synthDholBass(t, 0.18, 95);
      }

      // Treble Dhol rim/snare clicks
      if ([2, 4, 7, 10, 12, 14, 15].includes(stepInMeasure)) {
        this.synthDholTreble(t, 0.08);
      }

      // Occasional energetic shaker / ghungroo accents
      if (this.beatStep % 2 === 0) {
        this.synthShaker(t, 0.03);
      }
    }

    this.beatStep++;
    this.bgmTimer = window.setTimeout(() => {
      this.scheduleDholLoop();
    }, stepDuration * 1000);
  }

  private synthDholBass(t: number, vol = 0.25, startFreq = 120) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.14);

    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  private synthDholTreble(t: number, vol = 0.1) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(190, t + 0.05);

    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  private synthShaker(t: number, vol = 0.03) {
    if (!this.ctx) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.04);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 4500;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
  }
}

export const sound = new SoundEngine();

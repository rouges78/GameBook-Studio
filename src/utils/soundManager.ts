type SoundType = 'success' | 'error' | 'warning' | 'info' | 'critical';

interface SoundConfig {
  enabled: boolean;
  volume: number;
}

class SoundManager {
  private static instance: SoundManager;
  private sounds: Map<SoundType, HTMLAudioElement>;
  private config: SoundConfig;

  private constructor() {
    this.sounds = new Map();
    this.config = {
      enabled: true,
      volume: 0.5
    };

    // Initialize sounds
    this.initializeSounds();
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private initializeSounds() {
    const soundFiles: Record<SoundType, string> = {
      success: '/sounds/success.mp3',
      error: '/sounds/error.mp3',
      warning: '/sounds/warning.mp3',
      info: '/sounds/info.mp3',
      critical: '/sounds/critical.mp3'
    };

    Object.entries(soundFiles).forEach(([type, path]) => {
      const audio = new Audio(path);
      audio.preload = 'auto';
      this.sounds.set(type as SoundType, audio);
    });
  }

  public async playSound(type: SoundType): Promise<void> {
    if (!this.config.enabled) return;

    const sound = this.sounds.get(type);
    if (!sound) return;

    try {
      sound.volume = this.config.volume;
      await sound.play();
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  }

  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  public setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1, volume));
  }

  public getConfig(): SoundConfig {
    return { ...this.config };
  }

  // Load config from storage
  public async loadConfig(): Promise<void> {
    try {
      const storedConfig = localStorage.getItem('notificationSoundConfig');
      if (storedConfig) {
        this.config = { ...this.config, ...JSON.parse(storedConfig) };
      }
    } catch (error) {
      console.error('Failed to load sound configuration:', error);
    }
  }

  // Save config to storage
  public async saveConfig(): Promise<void> {
    try {
      localStorage.setItem('notificationSoundConfig', JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save sound configuration:', error);
    }
  }

  // Preload all sounds
  public async preloadSounds(): Promise<void> {
    const loadPromises = Array.from(this.sounds.values()).map(audio => {
      return new Promise<void>((resolve, reject) => {
        audio.addEventListener('canplaythrough', () => resolve(), { once: true });
        audio.addEventListener('error', reject, { once: true });
        audio.load();
      });
    });

    try {
      await Promise.all(loadPromises);
    } catch (error) {
      console.error('Failed to preload sounds:', error);
    }
  }
}

export const soundManager = SoundManager.getInstance();
export type { SoundType, SoundConfig };

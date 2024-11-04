import { type SoundType } from '../src/utils/soundManager';

// Mock console.error to avoid noise in test output
console.error = jest.fn();

describe('SoundManager', () => {
  let mockAudio: any;
  let soundManager: any;

  beforeEach(() => {
    // Reset localStorage
    localStorage.clear();
    
    // Create a fresh mock Audio instance
    mockAudio = {
      play: jest.fn().mockResolvedValue(undefined),
      load: jest.fn(),
      addEventListener: jest.fn((event, callback) => {
        if (event === 'canplaythrough') {
          // Simulate immediate load
          callback();
        }
      }),
      removeEventListener: jest.fn(),
      volume: 1
    };

    // Mock Audio constructor
    global.Audio = jest.fn().mockImplementation(() => mockAudio);

    // Reset modules and get fresh soundManager instance
    jest.isolateModules(() => {
      const module = require('../src/utils/soundManager');
      soundManager = module.soundManager;
    });
  });

  it('initializes with default configuration', () => {
    const config = soundManager.getConfig();
    expect(config.enabled).toBe(true);
    expect(config.volume).toBe(0.5);
  });

  it('plays sounds for different notification types', async () => {
    const types: SoundType[] = ['success', 'error', 'warning', 'info', 'critical'];

    for (const type of types) {
      await soundManager.playSound(type);
      expect(mockAudio.play).toHaveBeenCalled();
      mockAudio.play.mockClear();
    }
  });

  it('respects enabled/disabled state', async () => {
    // When enabled
    soundManager.setEnabled(true);
    await soundManager.playSound('success');
    expect(mockAudio.play).toHaveBeenCalled();

    // When disabled
    mockAudio.play.mockClear();
    soundManager.setEnabled(false);
    await soundManager.playSound('success');
    expect(mockAudio.play).not.toHaveBeenCalled();
  });

  it('adjusts volume correctly', async () => {
    const testVolume = 0.7;
    soundManager.setVolume(testVolume);
    
    await soundManager.playSound('success');
    expect(mockAudio.volume).toBe(testVolume);
  });

  it('clamps volume between 0 and 1', () => {
    soundManager.setVolume(-0.5);
    expect(soundManager.getConfig().volume).toBe(0);

    soundManager.setVolume(1.5);
    expect(soundManager.getConfig().volume).toBe(1);
  });

  it('persists configuration to localStorage', async () => {
    const testConfig = {
      enabled: false,
      volume: 0.3
    };

    soundManager.setEnabled(testConfig.enabled);
    soundManager.setVolume(testConfig.volume);
    await soundManager.saveConfig();

    const storedConfig = localStorage.getItem('notificationSoundConfig');
    expect(storedConfig).toBeTruthy();
    expect(JSON.parse(storedConfig!)).toEqual(testConfig);
  });

  it('loads configuration from localStorage', async () => {
    const testConfig = {
      enabled: false,
      volume: 0.3
    };

    localStorage.setItem('notificationSoundConfig', JSON.stringify(testConfig));
    await soundManager.loadConfig();

    const config = soundManager.getConfig();
    expect(config).toEqual(testConfig);
  });

  it('preloads all sounds', async () => {
    await soundManager.preloadSounds();
    expect(mockAudio.load).toHaveBeenCalledTimes(5);
  }, 10000); // Increase timeout for preloading
});

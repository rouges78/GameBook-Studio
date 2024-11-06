"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.soundManager = void 0;
class SoundManager {
    constructor() {
        this.sounds = new Map();
        this.config = {
            enabled: true,
            volume: 0.5
        };
        // Initialize sounds
        this.initializeSounds();
    }
    static getInstance() {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }
    initializeSounds() {
        const soundFiles = {
            success: '/sounds/success.mp3',
            error: '/sounds/error.mp3',
            warning: '/sounds/warning.mp3',
            info: '/sounds/info.mp3',
            critical: '/sounds/critical.mp3'
        };
        Object.entries(soundFiles).forEach(([type, path]) => {
            const audio = new Audio(path);
            audio.preload = 'auto';
            this.sounds.set(type, audio);
        });
    }
    async playSound(type) {
        if (!this.config.enabled)
            return;
        const sound = this.sounds.get(type);
        if (!sound)
            return;
        try {
            sound.volume = this.config.volume;
            await sound.play();
        }
        catch (error) {
            console.error('Failed to play notification sound:', error);
        }
    }
    setEnabled(enabled) {
        this.config.enabled = enabled;
    }
    setVolume(volume) {
        this.config.volume = Math.max(0, Math.min(1, volume));
    }
    getConfig() {
        return { ...this.config };
    }
    // Load config from storage
    async loadConfig() {
        try {
            const storedConfig = localStorage.getItem('notificationSoundConfig');
            if (storedConfig) {
                this.config = { ...this.config, ...JSON.parse(storedConfig) };
            }
        }
        catch (error) {
            console.error('Failed to load sound configuration:', error);
        }
    }
    // Save config to storage
    async saveConfig() {
        try {
            localStorage.setItem('notificationSoundConfig', JSON.stringify(this.config));
        }
        catch (error) {
            console.error('Failed to save sound configuration:', error);
        }
    }
    // Preload all sounds
    async preloadSounds() {
        const loadPromises = Array.from(this.sounds.values()).map(audio => {
            return new Promise((resolve, reject) => {
                audio.addEventListener('canplaythrough', () => resolve(), { once: true });
                audio.addEventListener('error', reject, { once: true });
                audio.load();
            });
        });
        try {
            await Promise.all(loadPromises);
        }
        catch (error) {
            console.error('Failed to preload sounds:', error);
        }
    }
}
exports.soundManager = SoundManager.getInstance();

// Helper to reset SoundManager singleton for testing
export const resetSoundManager = () => {
  // Get the SoundManager class from the module
  const SoundManagerModule = require('../../src/utils/soundManager');
  const SoundManager = Object.getPrototypeOf(SoundManagerModule.soundManager).constructor;
  
  // Reset the singleton instance
  Object.defineProperty(SoundManager, 'instance', {
    value: null,
    writable: true
  });

  // Clear the module cache to force re-initialization
  jest.resetModules();

  // Re-import and return a fresh instance
  const freshModule = require('../../src/utils/soundManager');
  return freshModule.soundManager;
};

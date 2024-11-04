import fs from 'fs/promises';
import path from 'path';
import '@testing-library/jest-dom';
import { MockAudio } from './mocks/audio';

// Set up global Audio mock
global.Audio = jest.fn().mockImplementation((src: string) => new MockAudio(src));

// Define test paths
const TEST_ROOT = path.join(process.cwd(), 'test-data');
const TEST_BACKUP_DIR = path.join(TEST_ROOT, 'backups');

// Create test directories
export const setupTestEnvironment = async () => {
    try {
        await fs.mkdir(TEST_ROOT, { recursive: true });
        await fs.mkdir(TEST_BACKUP_DIR, { recursive: true });
        console.log('Test directories created:', { TEST_ROOT, TEST_BACKUP_DIR });
    } catch (error) {
        console.error('Error creating test directories:', error);
        throw error;
    }
};

// Clean up test directories
export const cleanupTestEnvironment = async () => {
    try {
        await fs.rm(TEST_ROOT, { recursive: true, force: true });
        console.log('Test directories cleaned up');
    } catch (error) {
        console.error('Error cleaning up test directories:', error);
    }
};

// Clean up individual test files
export const cleanupTestFiles = async () => {
    try {
        const files = await fs.readdir(TEST_BACKUP_DIR);
        await Promise.all(
            files.map(file => fs.unlink(path.join(TEST_BACKUP_DIR, file)))
        );
        console.log('Test files cleaned up');
    } catch (error) {
        console.error('Error cleaning up test files:', error);
    }
};

// Export paths for use in tests
export const TEST_PATHS = {
    root: TEST_ROOT,
    backups: TEST_BACKUP_DIR
};

// Update the mock's getPath function with the actual test path
import { app } from './mocks/electron';
app.getPath.mockReturnValue(TEST_ROOT);

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translations = void 0;
exports.translations = {
    title: 'Backup Manager',
    buttons: {
        create: 'Create Backup',
        import: 'Import Backup',
        export: 'Export',
        restore: 'Restore',
        settings: 'Settings',
        save: 'Save Settings',
        cleanup: 'Run Cleanup',
        cancel: 'Cancel'
    },
    table: {
        date: 'Date',
        version: 'Version',
        size: 'Size',
        category: 'Category',
        actions: 'Actions',
        noBackups: 'No backups available'
    },
    settings: {
        title: 'Backup Settings',
        maxBackups: 'Maximum Total Backups',
        retention: {
            title: 'Retention Settings',
            daily: 'Daily Backups to Keep',
            weekly: 'Weekly Backups to Keep',
            monthly: 'Monthly Backups to Keep'
        },
        autoCleanup: 'Enable Automatic Cleanup',
        cleanupHint: 'Automatically remove old backups based on retention settings'
    },
    stats: {
        title: 'Backup Statistics',
        totalBackups: 'Total Backups',
        totalSize: 'Total Size',
        oldestBackup: 'Oldest Backup',
        newestBackup: 'Newest Backup',
        categories: {
            daily: 'Daily',
            weekly: 'Weekly',
            monthly: 'Monthly'
        }
    },
    operations: {
        inProgress: 'Operation in progress...',
        success: 'Operation completed successfully',
        error: {
            load: 'Failed to load backups',
            create: 'Failed to create backup',
            restore: 'Failed to restore backup',
            export: 'Failed to export backup',
            import: 'Failed to import backup',
            delete: 'Failed to delete backup',
            versionRequired: 'Backup version required for this operation',
            settings: {
                load: 'Failed to load backup settings',
                save: 'Failed to save backup settings',
                cleanup: 'Failed to run cleanup'
            }
        }
    }
};

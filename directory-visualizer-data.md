GAMEBOOK-STUDIO
 ┣ .git
 ┃  ┣ hooks
 ┃  ┃  ┣ applypatch-msg.sample
 ┃  ┃  ┣ commit-msg.sample
 ┃  ┃  ┣ fsmonitor-watchman.sample
 ┃  ┃  ┣ post-update.sample
 ┃  ┃  ┣ pre-applypatch.sample
 ┃  ┃  ┣ pre-commit.sample
 ┃  ┃  ┣ pre-merge-commit.sample
 ┃  ┃  ┣ pre-push.sample
 ┃  ┃  ┣ pre-rebase.sample
 ┃  ┃  ┣ pre-receive.sample
 ┃  ┃  ┣ prepare-commit-msg.sample
 ┃  ┃  ┣ push-to-checkout.sample
 ┃  ┃  ┣ sendemail-validate.sample
 ┃  ┃  ┗ update.sample
 ┃  ┣ info
 ┃  ┃  ┗ exclude
 ┃  ┣ logs
 ┃  ┃  ┣ refs
 ┃  ┃  ┃  ┣ heads
 ┃  ┃  ┃  ┃  ┣ backup-current-state
 ┃  ┃  ┃  ┃  ┣ GBS
 ┃  ┃  ┃  ┃  ┣ main
 ┃  ┃  ┃  ┃  ┣ recovered_GBS
 ┃  ┃  ┃  ┃  ┗ restore-5f76bd6b
 ┃  ┃  ┃  ┣ remotes
 ┃  ┃  ┃  ┃  ┗ origin
 ┃  ┃  ┃  ┃     ┣ main
 ┃  ┃  ┃  ┃     ┣ recovered_GBS
 ┃  ┃  ┃  ┃     ┗ restore-5f76bd6b
 ┃  ┃  ┃  ┗ stash
 ┃  ┃  ┗ HEAD
 ┃  ┣ refs
 ┃  ┃  ┣ heads
 ┃  ┃  ┃  ┣ backup-current-state
 ┃  ┃  ┃  ┣ GBS
 ┃  ┃  ┃  ┣ main
 ┃  ┃  ┃  ┣ recovered_GBS
 ┃  ┃  ┃  ┗ restore-5f76bd6b
 ┃  ┃  ┣ original
 ┃  ┃  ┃  ┗ refs
 ┃  ┃  ┃     ┣ heads
 ┃  ┃  ┃     ┃  ┣ GBS
 ┃  ┃  ┃     ┃  ┗ recovered_GBS
 ┃  ┃  ┃     ┗ remotes
 ┃  ┃  ┃        ┗ origin
 ┃  ┃  ┃           ┗ main
 ┃  ┃  ┣ remotes
 ┃  ┃  ┃  ┗ origin
 ┃  ┃  ┃     ┣ main
 ┃  ┃  ┃     ┣ recovered_GBS
 ┃  ┃  ┃     ┗ restore-5f76bd6b
 ┃  ┃  ┣ tags
 ┃  ┃  ┗ stash
 ┃  ┣ .MERGE_MSG.swp
 ┃  ┣ COMMIT_EDITMSG
 ┃  ┣ config
 ┃  ┣ description
 ┃  ┣ FETCH_HEAD
 ┃  ┣ HEAD
 ┃  ┣ index
 ┃  ┣ ORIG_HEAD
 ┃  ┗ packed-refs
 ┣ .vite
 ┃  ┣ deps_temp_106a3a84
 ┃  ┃  ┗ package.json
 ┃  ┗ deps_temp_d2a1cfc6
 ┃     ┗ package.json
 ┣ dist-electron
 ┃  ┗ main.js
 ┣ docs
 ┃  ┣ api.md
 ┃  ┣ development.md
 ┃  ┣ faq.md
 ┃  ┗ user-guide.md
 ┣ electron
 ┃  ┣ electron
 ┃  ┃  ┣ types
 ┃  ┃  ┃  ┗ pages.js
 ┃  ┃  ┣ backup.js
 ┃  ┃  ┣ preload.js
 ┃  ┃  ┣ settings.js
 ┃  ┃  ┣ telemetry.js
 ┃  ┃  ┗ types.js
 ┃  ┣ src
 ┃  ┃  ┣ components
 ┃  ┃  ┃  ┣ BackupManager
 ┃  ┃  ┃  ┃  ┣ index.js
 ┃  ┃  ┃  ┃  ┣ translations.js
 ┃  ┃  ┃  ┃  ┗ types.js
 ┃  ┃  ┃  ┣ ExportPage
 ┃  ┃  ┃  ┃  ┣ index.js
 ┃  ┃  ┃  ┃  ┣ translations.js
 ┃  ┃  ┃  ┃  ┣ types.js
 ┃  ┃  ┃  ┃  ┗ utils.js
 ┃  ┃  ┃  ┣ Library
 ┃  ┃  ┃  ┃  ┣ index.js
 ┃  ┃  ┃  ┃  ┣ translations.js
 ┃  ┃  ┃  ┃  ┗ types.js
 ┃  ┃  ┃  ┣ ParagraphEditor
 ┃  ┃  ┃  ┃  ┣ components
 ┃  ┃  ┃  ┃  ┃  ┗ EditorMain.js
 ┃  ┃  ┃  ┃  ┣ hooks
 ┃  ┃  ┃  ┃  ┃  ┣ useActions.js
 ┃  ┃  ┃  ┃  ┃  ┣ useParagraphEditor.js
 ┃  ┃  ┃  ┃  ┃  ┗ useSearchHistory.js
 ┃  ┃  ┃  ┃  ┣ index.js
 ┃  ┃  ┃  ┃  ┣ ParagraphActions.js
 ┃  ┃  ┃  ┃  ┣ ParagraphContent.js
 ┃  ┃  ┃  ┃  ┣ ParagraphEditorControls.js
 ┃  ┃  ┃  ┃  ┣ ParagraphSidebar.js
 ┃  ┃  ┃  ┃  ┣ TagInput.js
 ┃  ┃  ┃  ┃  ┣ translations.js
 ┃  ┃  ┃  ┃  ┗ types.js
 ┃  ┃  ┃  ┣ StoryMap
 ┃  ┃  ┃  ┃  ┣ components
 ┃  ┃  ┃  ┃  ┃  ┣ ActionButtons.js
 ┃  ┃  ┃  ┃  ┃  ┣ ImageControls.js
 ┃  ┃  ┃  ┃  ┃  ┣ KeyboardShortcutsHelp.js
 ┃  ┃  ┃  ┃  ┃  ┣ MiniMap.js
 ┃  ┃  ┃  ┃  ┃  ┣ StoryMapCanvas.js
 ┃  ┃  ┃  ┃  ┃  ┣ StoryMapControls.js
 ┃  ┃  ┃  ┃  ┃  ┗ Toast.js
 ┃  ┃  ┃  ┃  ┣ hooks
 ┃  ┃  ┃  ┃  ┃  ┣ useInertiaScroll.js
 ┃  ┃  ┃  ┃  ┃  ┣ useKeyboardShortcuts.js
 ┃  ┃  ┃  ┃  ┃  ┗ useStoryMap.js
 ┃  ┃  ┃  ┃  ┣ index.js
 ┃  ┃  ┃  ┃  ┣ translations.js
 ┃  ┃  ┃  ┃  ┣ types.js
 ┃  ┃  ┃  ┃  ┗ utils.js
 ┃  ┃  ┃  ┣ TelemetryDashboard
 ┃  ┃  ┃  ┃  ┣ components
 ┃  ┃  ┃  ┃  ┃  ┣ CategoryFilters.js
 ┃  ┃  ┃  ┃  ┃  ┣ ChartSkeleton.js
 ┃  ┃  ┃  ┃  ┃  ┣ DateRangeFilters.js
 ┃  ┃  ┃  ┃  ┃  ┣ DetailedPerformanceMetrics.js
 ┃  ┃  ┃  ┃  ┃  ┣ ErrorAnalysis.js
 ┃  ┃  ┃  ┃  ┃  ┣ ErrorInspectionModal.js
 ┃  ┃  ┃  ┃  ┃  ┣ FiltersSkeleton.js
 ┃  ┃  ┃  ┃  ┃  ┣ index.js
 ┃  ┃  ┃  ┃  ┃  ┣ MemoryAlertsPanel.js
 ┃  ┃  ┃  ┃  ┃  ┣ MetricsSkeleton.js
 ┃  ┃  ┃  ┃  ┃  ┣ SystemMetrics.js
 ┃  ┃  ┃  ┃  ┃  ┣ TimeSeriesChart.js
 ┃  ┃  ┃  ┃  ┃  ┗ VirtualizedErrorTable.js
 ┃  ┃  ┃  ┃  ┣ hooks
 ┃  ┃  ┃  ┃  ┃  ┣ useChartVirtualization.js
 ┃  ┃  ┃  ┃  ┃  ┣ useDataProcessor.js
 ┃  ┃  ┃  ┃  ┃  ┗ useMemoryAlerts.js
 ┃  ┃  ┃  ┃  ┣ utils
 ┃  ┃  ┃  ┃  ┃  ┣ chartExport.js
 ┃  ┃  ┃  ┃  ┃  ┣ circuitBreaker.js
 ┃  ┃  ┃  ┃  ┃  ┣ dataProcessor.worker.js
 ┃  ┃  ┃  ┃  ┃  ┣ memoryAlertManager.js
 ┃  ┃  ┃  ┃  ┃  ┣ workerConfig.js
 ┃  ┃  ┃  ┃  ┃  ┗ workerPool.js
 ┃  ┃  ┃  ┃  ┣ index.js
 ┃  ┃  ┃  ┃  ┗ types.js
 ┃  ┃  ┃  ┣ UpdateNotification
 ┃  ┃  ┃  ┃  ┣ ErrorBoundary.js
 ┃  ┃  ┃  ┃  ┣ index.js
 ┃  ┃  ┃  ┃  ┗ types.js
 ┃  ┃  ┃  ┣ BookEditor.js
 ┃  ┃  ┃  ┣ CreateNewProject.js
 ┃  ┃  ┃  ┣ CustomPopup.js
 ┃  ┃  ┃  ┣ Dashboard.js
 ┃  ┃  ┃  ┣ ErrorBoundary.js
 ┃  ┃  ┃  ┣ Footer.js
 ┃  ┃  ┃  ┣ Header.js
 ┃  ┃  ┃  ┣ Help.js
 ┃  ┃  ┃  ┣ ImageEditor.js
 ┃  ┃  ┃  ┣ Library.js
 ┃  ┃  ┃  ┣ Notification.js
 ┃  ┃  ┃  ┣ Settings.js
 ┃  ┃  ┃  ┣ Sidebar.js
 ┃  ┃  ┃  ┗ ThemeEditor.js
 ┃  ┃  ┣ contexts
 ┃  ┃  ┃  ┗ ThemeContext.js
 ┃  ┃  ┣ hooks
 ┃  ┃  ┃  ┣ useAutoUpdater.js
 ┃  ┃  ┃  ┣ useEventHandLers.js
 ┃  ┃  ┃  ┣ useOptimizedRendering.js
 ┃  ┃  ┃  ┗ useOptimizedState.js
 ┃  ┃  ┣ types
 ┃  ┃  ┃  ┣ pages.js
 ┃  ┃  ┃  ┣ theme-types.js
 ┃  ┃  ┃  ┗ theme.js
 ┃  ┃  ┣ utils
 ┃  ┃  ┃  ┣ autoBackup.js
 ┃  ┃  ┃  ┣ backup.js
 ┃  ┃  ┃  ┣ metrics.js
 ┃  ┃  ┃  ┣ notifications.js
 ┃  ┃  ┃  ┣ prefetch.js
 ┃  ┃  ┃  ┣ projectCache.js
 ┃  ┃  ┃  ┣ soundManager.js
 ┃  ┃  ┃  ┣ storage.js
 ┃  ┃  ┃  ┣ telemetry.js
 ┃  ┃  ┃  ┗ telemetryCache.js
 ┃  ┃  ┣ App.js
 ┃  ┃  ┣ main.js
 ┃  ┃  ┗ types.js
 ┃  ┣ types
 ┃  ┃  ┗ pages.ts
 ┃  ┣ backup.js
 ┃  ┣ backup.ts
 ┃  ┣ database.js
 ┃  ┣ main.js
 ┃  ┣ package.json
 ┃  ┣ preload.js
 ┃  ┣ preload.ts
 ┃  ┣ settings.js
 ┃  ┣ settings.ts
 ┃  ┣ tsconfig.json
 ┃  ┣ types.d.ts
 ┃  ┣ types.js
 ┃  ┗ types.ts
 ┣ prisma
 ┃  ┣ migrations
 ┃  ┃  ┣ 20241103114259_init
 ┃  ┃  ┃  ┗ migration.sql
 ┃  ┃  ┣ 20241106070820_add_paragraph_fields
 ┃  ┃  ┃  ┗ migration.sql
 ┃  ┃  ┗ migration_lock.toml
 ┃  ┣ prisma
 ┃  ┃  ┣ dev.db
 ┃  ┃  ┗ dev.db-journal
 ┃  ┣ dev.db
 ┃  ┣ dev.db-journal
 ┃  ┗ schema.prisma
 ┣ public
 ┃  ┣ sounds
 ┃  ┃  ┗ README.md
 ┃  ┣ logo.png
 ┃  ┗ map-open.mp3
 ┣ release
 ┃  ┣ win-unpacked
 ┃  ┃  ┣ locales
 ┃  ┃  ┃  ┣ af.pak
 ┃  ┃  ┃  ┣ am.pak
 ┃  ┃  ┃  ┣ ar.pak
 ┃  ┃  ┃  ┣ bg.pak
 ┃  ┃  ┃  ┣ bn.pak
 ┃  ┃  ┃  ┣ ca.pak
 ┃  ┃  ┃  ┣ cs.pak
 ┃  ┃  ┃  ┣ da.pak
 ┃  ┃  ┃  ┣ de.pak
 ┃  ┃  ┃  ┣ el.pak
 ┃  ┃  ┃  ┣ en-GB.pak
 ┃  ┃  ┃  ┣ en-US.pak
 ┃  ┃  ┃  ┣ es-419.pak
 ┃  ┃  ┃  ┣ es.pak
 ┃  ┃  ┃  ┣ et.pak
 ┃  ┃  ┃  ┣ fa.pak
 ┃  ┃  ┃  ┣ fi.pak
 ┃  ┃  ┃  ┣ fil.pak
 ┃  ┃  ┃  ┣ fr.pak
 ┃  ┃  ┃  ┣ gu.pak
 ┃  ┃  ┃  ┣ he.pak
 ┃  ┃  ┃  ┣ hi.pak
 ┃  ┃  ┃  ┣ hr.pak
 ┃  ┃  ┃  ┣ hu.pak
 ┃  ┃  ┃  ┣ id.pak
 ┃  ┃  ┃  ┣ it.pak
 ┃  ┃  ┃  ┣ ja.pak
 ┃  ┃  ┃  ┣ kn.pak
 ┃  ┃  ┃  ┣ ko.pak
 ┃  ┃  ┃  ┣ lt.pak
 ┃  ┃  ┃  ┣ lv.pak
 ┃  ┃  ┃  ┣ ml.pak
 ┃  ┃  ┃  ┣ mr.pak
 ┃  ┃  ┃  ┣ ms.pak
 ┃  ┃  ┃  ┣ nb.pak
 ┃  ┃  ┃  ┣ nl.pak
 ┃  ┃  ┃  ┣ pl.pak
 ┃  ┃  ┃  ┣ pt-BR.pak
 ┃  ┃  ┃  ┣ pt-PT.pak
 ┃  ┃  ┃  ┣ ro.pak
 ┃  ┃  ┃  ┣ ru.pak
 ┃  ┃  ┃  ┣ sk.pak
 ┃  ┃  ┃  ┣ sl.pak
 ┃  ┃  ┃  ┣ sr.pak
 ┃  ┃  ┃  ┣ sv.pak
 ┃  ┃  ┃  ┣ sw.pak
 ┃  ┃  ┃  ┣ ta.pak
 ┃  ┃  ┃  ┣ te.pak
 ┃  ┃  ┃  ┣ th.pak
 ┃  ┃  ┃  ┣ tr.pak
 ┃  ┃  ┃  ┣ uk.pak
 ┃  ┃  ┃  ┣ ur.pak
 ┃  ┃  ┃  ┣ vi.pak
 ┃  ┃  ┃  ┣ zh-CN.pak
 ┃  ┃  ┃  ┗ zh-TW.pak
 ┃  ┃  ┣ resources
 ┃  ┃  ┃  ┣ app.asar.unpacked
 ┃  ┃  ┃  ┣ app-update.yml
 ┃  ┃  ┃  ┣ app.asar
 ┃  ┃  ┃  ┗ elevate.exe
 ┃  ┃  ┣ chrome_100_percent.pak
 ┃  ┃  ┣ chrome_200_percent.pak
 ┃  ┃  ┣ d3dcompiler_47.dll
 ┃  ┃  ┣ ffmpeg.dll
 ┃  ┃  ┣ GameBook Studio.exe
 ┃  ┃  ┣ icudtl.dat
 ┃  ┃  ┣ libEGL.dll
 ┃  ┃  ┣ libGLESv2.dll
 ┃  ┃  ┣ LICENSE.electron.txt
 ┃  ┃  ┣ LICENSES.chromium.html
 ┃  ┃  ┣ resources.pak
 ┃  ┃  ┣ snapshot_blob.bin
 ┃  ┃  ┣ v8_context_snapshot.bin
 ┃  ┃  ┣ vk_swiftshader_icd.json
 ┃  ┃  ┣ vk_swiftshader.dll
 ┃  ┃  ┗ vulkan-1.dll
 ┃  ┣ builder-debug.yml
 ┃  ┣ builder-effective-config.yaml
 ┃  ┣ GameBook Studio Setup 0.1.0.exe
 ┃  ┣ GameBook Studio Setup 0.1.0.exe.blockmap
 ┃  ┣ GameBook Studio Setup 0.1.1.exe
 ┃  ┣ GameBook Studio Setup 0.1.1.exe.blockmap
 ┃  ┗ latest.yml
 ┣ src
 ┃  ┣ components
 ┃  ┃  ┣ BackupManager
 ┃  ┃  ┃  ┣ index.tsx
 ┃  ┃  ┃  ┣ translations.ts
 ┃  ┃  ┃  ┗ types.ts
 ┃  ┃  ┣ CreateNewProject
 ┃  ┃  ┃  ┗ types.ts
 ┃  ┃  ┣ Dashboard
 ┃  ┃  ┃  ┗ types.ts
 ┃  ┃  ┣ ExportPage
 ┃  ┃  ┃  ┣ index.tsx
 ┃  ┃  ┃  ┣ translations.ts
 ┃  ┃  ┃  ┣ types.ts
 ┃  ┃  ┃  ┗ utils.ts
 ┃  ┃  ┣ Help
 ┃  ┃  ┃  ┗ types.ts
 ┃  ┃  ┣ Library
 ┃  ┃  ┃  ┣ index.tsx
 ┃  ┃  ┃  ┣ translations.ts
 ┃  ┃  ┃  ┗ types.ts
 ┃  ┃  ┣ ParagraphEditor
 ┃  ┃  ┃  ┣ components
 ┃  ┃  ┃  ┃  ┣ EditorMain.tsx
 ┃  ┃  ┃  ┃  ┗ FormattingToolbar.tsx
 ┃  ┃  ┃  ┣ hooks
 ┃  ┃  ┃  ┃  ┣ useActions.ts
 ┃  ┃  ┃  ┃  ┣ useHistory.ts
 ┃  ┃  ┃  ┃  ┣ useKeyboardShortcuts.ts
 ┃  ┃  ┃  ┃  ┗ useParagraphEditor.ts
 ┃  ┃  ┃  ┣ index.tsx
 ┃  ┃  ┃  ┣ ParagraphActions.tsx
 ┃  ┃  ┃  ┣ ParagraphContent.tsx
 ┃  ┃  ┃  ┣ ParagraphEditorControls.tsx
 ┃  ┃  ┃  ┣ ParagraphSidebar.tsx
 ┃  ┃  ┃  ┣ TagInput.tsx
 ┃  ┃  ┃  ┣ translations.ts
 ┃  ┃  ┃  ┣ types.js
 ┃  ┃  ┃  ┗ types.ts
 ┃  ┃  ┣ Settings
 ┃  ┃  ┃  ┣ AITab.tsx
 ┃  ┃  ┃  ┣ DatabaseTab.tsx
 ┃  ┃  ┃  ┣ GeneralTab.tsx
 ┃  ┃  ┃  ┣ index.ts
 ┃  ┃  ┃  ┣ NotificationsTab.tsx
 ┃  ┃  ┃  ┣ SettingsHeader.tsx
 ┃  ┃  ┃  ┣ SettingsSidebar.tsx
 ┃  ┃  ┃  ┣ translations.ts
 ┃  ┃  ┃  ┗ types.ts
 ┃  ┃  ┣ StoryMap
 ┃  ┃  ┃  ┣ components
 ┃  ┃  ┃  ┃  ┣ ActionButtons.tsx
 ┃  ┃  ┃  ┃  ┣ ContextMenu.tsx
 ┃  ┃  ┃  ┃  ┣ EditableTitle.tsx
 ┃  ┃  ┃  ┃  ┣ ImageControls.tsx
 ┃  ┃  ┃  ┃  ┣ KeyboardShortcutsHelp.tsx
 ┃  ┃  ┃  ┃  ┣ LinkPreview.tsx
 ┃  ┃  ┃  ┃  ┣ MiniMap.tsx
 ┃  ┃  ┃  ┃  ┣ SearchBar.tsx
 ┃  ┃  ┃  ┃  ┣ SidePanel.tsx
 ┃  ┃  ┃  ┃  ┣ StoryMapCanvas.tsx
 ┃  ┃  ┃  ┃  ┣ StoryMapControls.tsx
 ┃  ┃  ┃  ┃  ┣ Toast.tsx
 ┃  ┃  ┃  ┃  ┗ Toolbar.tsx
 ┃  ┃  ┃  ┣ hooks
 ┃  ┃  ┃  ┃  ┣ useCanvasEvents.ts
 ┃  ┃  ┃  ┃  ┣ useImageDrag.ts
 ┃  ┃  ┃  ┃  ┣ useInertiaScroll.ts
 ┃  ┃  ┃  ┃  ┣ useKeyboardShortcuts.ts
 ┃  ┃  ┃  ┃  ┣ useNodeInteractions.ts
 ┃  ┃  ┃  ┃  ┣ usePanZoom.ts
 ┃  ┃  ┃  ┃  ┗ useStoryMap.ts
 ┃  ┃  ┃  ┣ index.tsx
 ┃  ┃  ┃  ┣ translations.ts
 ┃  ┃  ┃  ┣ types.js
 ┃  ┃  ┃  ┣ types.ts
 ┃  ┃  ┃  ┗ utils.ts
 ┃  ┃  ┣ ThemeEditor
 ┃  ┃  ┃  ┗ types.ts
 ┃  ┃  ┣ UpdateNotification
 ┃  ┃  ┃  ┣ ErrorBoundary.tsx
 ┃  ┃  ┃  ┣ index.tsx
 ┃  ┃  ┃  ┗ types.ts
 ┃  ┃  ┣ BackupManager.tsx
 ┃  ┃  ┣ BookEditor.tsx
 ┃  ┃  ┣ ChangelogModal.tsx
 ┃  ┃  ┣ CreateNewProject.tsx
 ┃  ┃  ┣ CustomPopup.tsx
 ┃  ┃  ┣ Dashboard.tsx
 ┃  ┃  ┣ ErrorBoundary.tsx
 ┃  ┃  ┣ Footer.tsx
 ┃  ┃  ┣ Header.tsx
 ┃  ┃  ┣ Help.tsx
 ┃  ┃  ┣ ImageEditor.tsx
 ┃  ┃  ┣ Library.tsx
 ┃  ┃  ┣ Notification.tsx
 ┃  ┃  ┣ Settings.tsx
 ┃  ┃  ┣ Sidebar.tsx
 ┃  ┃  ┗ ThemeEditor.tsx
 ┃  ┣ contexts
 ┃  ┃  ┗ ThemeContext.tsx
 ┃  ┣ hooks
 ┃  ┃  ┣ useAutoUpdater.ts
 ┃  ┃  ┣ useEventHandLers.ts
 ┃  ┃  ┣ useOptimizedRendering.ts
 ┃  ┃  ┗ useOptimizedState.ts
 ┃  ┣ styles
 ┃  ┃  ┗ glow.css
 ┃  ┣ types
 ┃  ┃  ┣ electron.d.ts
 ┃  ┃  ┣ pages.js
 ┃  ┃  ┣ pages.ts
 ┃  ┃  ┣ performance.d.ts
 ┃  ┃  ┣ settings.ts
 ┃  ┃  ┣ storymap.d.ts
 ┃  ┃  ┣ theme-types.ts
 ┃  ┃  ┗ theme.ts
 ┃  ┣ utils
 ┃  ┃  ┣ autoBackup.ts
 ┃  ┃  ┣ backup.ts
 ┃  ┃  ┣ buttonStyles.ts
 ┃  ┃  ┣ metrics.ts
 ┃  ┃  ┣ notifications.ts
 ┃  ┃  ┣ prefetch.ts
 ┃  ┃  ┣ projectCache.ts
 ┃  ┃  ┣ soundManager.ts
 ┃  ┃  ┣ storage.ts
 ┃  ┃  ┗ themeStorage.ts
 ┃  ┣ App.tsx
 ┃  ┣ index.css
 ┃  ┣ main.tsx
 ┃  ┣ types.ts
 ┃  ┗ vite-env.d.ts
 ┣ tests
 ┃  ┣ helpers
 ┃  ┃  ┗ resetSoundManager.ts
 ┃  ┣ mocks
 ┃  ┃  ┣ audio.ts
 ┃  ┃  ┣ chartjs.ts
 ┃  ┃  ┣ chartjs.tsx
 ┃  ┃  ┣ electron.ts
 ┃  ┃  ┣ import-meta.ts
 ┃  ┃  ┣ worker.ts
 ┃  ┃  ┣ workerConfig.ts
 ┃  ┃  ┗ workerPool.ts
 ┃  ┣ types
 ┃  ┃  ┗ jest.d.ts
 ┃  ┣ backup-retention.test.ts
 ┃  ┣ CategoryFilters.test.tsx
 ┃  ┣ chartExport.test.ts
 ┃  ┣ ChartSkeleton.test.tsx
 ┃  ┣ circuitBreaker.test.ts
 ┃  ┣ dataProcessor.performance.test.ts
 ┃  ┣ dataProcessor.worker.test.ts
 ┃  ┣ DateRangeFilters.test.tsx
 ┃  ┣ DetailedPerformanceMetrics.snapshot.test.tsx
 ┃  ┣ DetailedPerformanceMetrics.test.tsx
 ┃  ┣ ErrorAnalysis.test.tsx
 ┃  ┣ ErrorInspectionModal.test.tsx
 ┃  ┣ FiltersSkeleton.test.tsx
 ┃  ┣ jest.d.ts
 ┃  ┣ KeyboardShortcutsHelp.test.tsx
 ┃  ┣ MemoryAlertsPanel.test.tsx
 ┃  ┣ MetricsSkeleton.test.tsx
 ┃  ┣ MiniMap.test.tsx
 ┃  ┣ setup.ts
 ┃  ┣ soundManager.test.ts
 ┃  ┣ StoryMap.affinity.test.tsx
 ┃  ┣ StoryMap.balance.test.tsx
 ┃  ┣ StoryMap.cost.test.tsx
 ┃  ┣ StoryMap.cpu.test.tsx
 ┃  ┣ StoryMap.durability.test.tsx
 ┃  ┣ StoryMap.elasticity.test.tsx
 ┃  ┣ StoryMap.endurance.test.tsx
 ┃  ┣ StoryMap.gang.test.tsx
 ┃  ┣ StoryMap.gpu.test.tsx
 ┃  ┣ StoryMap.healthmonitoring.test.tsx
 ┃  ┣ StoryMap.longevity.test.tsx
 ┃  ┣ StoryMap.network.test.tsx
 ┃  ┣ StoryMap.optimization.test.tsx
 ┃  ┣ StoryMap.performance.test.tsx
 ┃  ┣ StoryMap.performanceverification.test.tsx
 ┃  ┣ StoryMap.policy.test.tsx
 ┃  ┣ StoryMap.pool.test.tsx
 ┃  ┣ StoryMap.power.test.tsx
 ┃  ┣ StoryMap.prediction.test.tsx
 ┃  ┣ StoryMap.recovery.test.tsx
 ┃  ┣ StoryMap.reliability.test.tsx
 ┃  ┣ StoryMap.reservation.test.tsx
 ┃  ┣ StoryMap.resilience.test.tsx
 ┃  ┣ StoryMap.resource.test.tsx
 ┃  ┣ StoryMap.resourcepool.test.tsx
 ┃  ┣ StoryMap.resourcetracking.test.tsx
 ┃  ┣ StoryMap.scalability.test.tsx
 ┃  ┣ StoryMap.scheduling.test.tsx
 ┃  ┣ StoryMap.sla.test.tsx
 ┃  ┣ StoryMap.stability.test.tsx
 ┃  ┣ StoryMap.starvation.test.tsx
 ┃  ┣ StoryMap.stealing.test.tsx
 ┃  ┣ StoryMap.stress.test.tsx
 ┃  ┣ StoryMap.stressrecovery.test.tsx
 ┃  ┣ StoryMap.test.tsx
 ┃  ┣ StoryMap.thread.test.tsx
 ┃  ┣ StoryMap.validation.test.tsx
 ┃  ┣ StoryMap.worker.test.tsx
 ┃  ┣ SystemMetrics.test.tsx
 ┃  ┣ TelemetryDashboard.integration.test.tsx
 ┃  ┣ TelemetryDashboard.performance.test.tsx
 ┃  ┣ TimeSeriesChart.test.tsx
 ┃  ┣ Toast.test.tsx
 ┃  ┣ UpdateErrorBoundary.test.tsx
 ┃  ┣ UpdateNotification.test.tsx
 ┃  ┣ useAutoUpdater.test.ts
 ┃  ┣ useChartVirtualization.test.ts
 ┃  ┣ useDataProcessor.test.ts
 ┃  ┣ useStoryMap.test.ts
 ┃  ┣ VirtualizedErrorTable.test.tsx
 ┃  ┣ workerPool.memory.test.ts
 ┃  ┗ workerPool.test.ts
 ┣ .clinerules
 ┣ .code-split-metadata.json
 ┣ .env
 ┣ .gitignore
 ┣ babel.config.js
 ┣ CHANGELOG.md
 ┣ dev.bat
 ┣ dev.js
 ┣ dev.ps1
 ┣ eslint.config.js
 ┣ forge.config.js
 ┣ index.html
 ┣ jest.config.js
 ┣ LICENSE
 ┣ package-lock.json
 ┣ package.json
 ┣ postcss.config.cjs
 ┣ project-structure.md
 ┣ README.md
 ┣ tailwind.config.cjs
 ┣ temp_query.js
 ┣ temp_sync_query.js
 ┣ tsconfig.app.json
 ┣ tsconfig.build.json
 ┣ tsconfig.json
 ┣ tsconfig.node.json
 ┣ update.md
 ┗ vite.config.mjs
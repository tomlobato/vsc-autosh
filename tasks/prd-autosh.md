# PRD: autosh — Auto Shell Script Setup

## Introduction

Developers who work with shell scripts, Python scripts, and other interpreted languages repeat the same boilerplate every time they create a new file: add the shebang line, save, go to the terminal, `chmod +x`, come back to the editor, and start coding. This is tedious and easy to forget — leading to "permission denied" errors when trying to run the script.

**autosh** is a VS Code/Cursor extension that eliminates this friction. When a developer creates a new script file (`.sh`, `.py`, `.rb`, etc.), autosh automatically inserts the correct shebang, makes the file executable, and places the cursor where the developer wants to start typing. It also provides configurable shebangs, custom templates, a manual command for existing files, and visual feedback via status bar and notifications.

Target: all developers. Distribution: VS Code Marketplace (public).

## Goals

- Eliminate the repetitive shebang + chmod workflow when creating script files
- Support multiple script languages (`.sh`, `.zsh`, `.fish`, `.py`, `.rb`, `.pl`) with correct shebangs
- Allow full customization of shebangs and post-shebang templates per extension
- Provide a manual command for adding shebangs to existing files
- Give visual feedback (status bar + notifications) that is non-intrusive and configurable
- Work cross-platform (shebang on all OS, chmod on Unix only)
- Publish as a public VS Code Marketplace extension

## User Stories

### US-001: Auto-insert shebang on new .sh file
**Description:** As a developer, I want a bash shebang automatically inserted when I create a new `.sh` file so that I don't have to type it manually every time.

**Acceptance Criteria:**
- [ ] Creating a new `.sh` file via VS Code Explorer inserts `#!/bin/bash\n\n` at position (0,0)
- [ ] The shebang is only inserted if the file is empty (no content)
- [ ] The insertion uses `WorkspaceEdit` so it integrates with VS Code's undo stack
- [ ] The file is saved after insertion so the content persists to disk
- [ ] Typecheck passes (`npm run check-types`)

### US-002: Auto chmod +x on new script files
**Description:** As a developer, I want new script files to be automatically made executable so that I can run them immediately without manual `chmod`.

**Acceptance Criteria:**
- [ ] After shebang insertion, `chmod 0o755` is applied to the file on disk
- [ ] On Windows, chmod is skipped gracefully (no error)
- [ ] If chmod fails (e.g., read-only filesystem), a warning is logged to console but the extension does not crash
- [ ] `ls -la` confirms `rwxr-xr-x` permissions on macOS/Linux
- [ ] Typecheck passes

### US-003: Cursor positioning after shebang
**Description:** As a developer, I want my cursor placed 2 lines after the shebang so that I can start writing code immediately.

**Acceptance Criteria:**
- [ ] After shebang insertion, the file opens in the editor
- [ ] Cursor is positioned at line 3 (0-indexed: line 2, column 0)
- [ ] The cursor position is visible (editor scrolls to it via `revealRange`)
- [ ] If a template is configured, cursor is placed on the first empty line after the template
- [ ] Typecheck passes

### US-004: Configurable shebangs per extension
**Description:** As a developer, I want to configure which shebang is used for each file extension so that I can use `#!/usr/bin/env bash` instead of `#!/bin/bash` or customize for my environment.

**Acceptance Criteria:**
- [ ] Setting `autosh.shebangs` accepts an object mapping extension → shebang string
- [ ] Defaults: `{ ".sh": "#!/bin/bash", ".zsh": "#!/usr/bin/env zsh", ".fish": "#!/usr/bin/env fish", ".py": "#!/usr/bin/env python3", ".rb": "#!/usr/bin/env ruby", ".pl": "#!/usr/bin/env perl" }`
- [ ] User can override any default via VS Code settings (user or workspace level)
- [ ] Changing the setting takes effect on the next file creation (no restart needed)
- [ ] Typecheck passes

### US-005: Enabled extensions whitelist
**Description:** As a developer, I want to control which file extensions trigger autosh so that it only acts on file types I care about.

**Acceptance Criteria:**
- [ ] Setting `autosh.enabledExtensions` accepts a string array
- [ ] Default: `[".sh"]` (only bash enabled out of the box)
- [ ] Only file extensions present in this array trigger auto-insertion
- [ ] User can add `.py`, `.rb`, etc. to enable those
- [ ] Creating a file with an extension NOT in the list does nothing
- [ ] Typecheck passes

### US-006: Custom templates per extension
**Description:** As a developer, I want to define custom templates that are inserted after the shebang so that I can include boilerplate like `set -euo pipefail` automatically.

**Acceptance Criteria:**
- [ ] Setting `autosh.templates` accepts an object mapping extension → template string
- [ ] Default: `{}` (no templates)
- [ ] Template is inserted after the shebang line and a blank line
- [ ] Example: `{ ".sh": "set -euo pipefail\n" }` results in: `#!/bin/bash\n\nset -euo pipefail\n\n`
- [ ] Cursor is placed after the template content (on the next empty line)
- [ ] If no template is defined for an extension, only shebang + blank line is inserted
- [ ] Typecheck passes

### US-007: Manual "Add Shebang" command
**Description:** As a developer, I want a command palette action to add a shebang to an existing file so that I can fix files that were created before installing autosh.

**Acceptance Criteria:**
- [ ] Command `autosh.addShebang` registered with title "Autosh: Add Shebang"
- [ ] Accessible via Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
- [ ] Uses the active editor's file extension to determine the correct shebang
- [ ] If the file already starts with `#!`, shows a warning message and does nothing
- [ ] If no active editor is open, shows an error message
- [ ] If the file extension is unrecognized, shows a Quick Pick with all available shebangs (from `autosh.shebangs`) for the user to choose
- [ ] After insertion, applies chmod +x and positions cursor
- [ ] Typecheck passes

### US-008: Status bar indicator
**Description:** As a developer, I want a brief visual indicator in the status bar when autosh acts so that I know the setup was applied.

**Acceptance Criteria:**
- [ ] A status bar item appears with text `$(check) autosh` after shebang insertion
- [ ] The item is aligned to the right side of the status bar
- [ ] The item disappears after 3 seconds
- [ ] Respects `autosh.showStatusBar` setting (default: `true`)
- [ ] When `autosh.showStatusBar` is `false`, no status bar item is shown
- [ ] Typecheck passes

### US-009: Toast notification
**Description:** As a developer, I want an optional notification when autosh applies changes so that I have confirmation of what happened.

**Acceptance Criteria:**
- [ ] An information message (toast) shows "autosh: shebang added + chmod +x" after successful setup
- [ ] Respects `autosh.showNotification` setting (default: `true`)
- [ ] When `autosh.showNotification` is `false`, no notification is shown
- [ ] Typecheck passes

### US-010: Project scaffolding and marketplace publishing
**Description:** As a developer publishing autosh, I need the extension properly structured for the VS Code Marketplace.

**Acceptance Criteria:**
- [ ] `package.json` has valid `publisher`, `displayName`, `description`, `categories`, `icon`, `repository`
- [ ] Extension uses esbuild for bundling (`dist/extension.js`)
- [ ] `activationEvents: ["onStartupFinished"]`
- [ ] `.vscodeignore` excludes dev files from `.vsix`
- [ ] README.md with feature overview, configuration table, and usage examples
- [ ] Extension can be packaged with `vsce package` without errors
- [ ] Typecheck passes

## Functional Requirements

- FR-1: Listen to `workspace.onDidCreateFiles` event and filter by file extension
- FR-2: Check if newly created file is empty before inserting content
- FR-3: Insert shebang (from `autosh.shebangs` setting) at position (0,0) via `WorkspaceEdit`
- FR-4: Insert template (from `autosh.templates` setting) after the shebang line, if configured
- FR-5: Save the document after edit so content persists to disk
- FR-6: Apply `chmod 0o755` via `fs.promises.chmod` on non-Windows platforms
- FR-7: Open the file in the editor and position cursor on the first empty line after inserted content
- FR-8: Show a status bar item `$(check) autosh` for 3 seconds after action (if enabled)
- FR-9: Show an information toast notification after action (if enabled)
- FR-10: Register command `autosh.addShebang` that applies shebang + chmod to the active editor's file
- FR-11: The manual command must detect existing shebangs (line starts with `#!`) and warn instead of duplicating
- FR-14: If the manual command is run on a file with unrecognized extension, show a Quick Pick with all available shebangs for the user to choose
- FR-15: Extension icon: minimalist terminal/console icon with `$` prompt for marketplace listing
- FR-12: All settings under `autosh.*` are readable without extension restart (use `workspace.getConfiguration`)
- FR-13: Settings work at user level and workspace level (native VS Code `contributes.configuration` behavior)

## Non-Goals

- No automatic shebang detection/suggestion based on file content
- No priority-based or conditional shebang selection (e.g., different shebang per project)
- No `.bash` extension support (only `.sh` for bash scripts)
- No support for files without extensions (e.g., `Makefile`, `Dockerfile`)
- No automatic detection of the user's default shell (`$SHELL`) for dynamic defaults
- No custom keybinding registration (user can bind the command themselves)
- No telemetry or usage tracking
- No test framework (manual testing via Extension Development Host for v0.1)
- No CI/CD pipeline (v0.1 ships with manual `vsce publish`)

## Technical Considerations

- **VS Code API**: `workspace.onDidCreateFiles` (available since VS Code 1.39), `WorkspaceEdit`, `window.showTextDocument`, `window.createStatusBarItem`
- **Activation**: `onStartupFinished` — must be active before file creation events. Extension is tiny (~2KB bundled) so early activation has negligible cost
- **Bundling**: esbuild compiles TypeScript to a single CommonJS file at `dist/extension.js`. External: `vscode` module
- **Node.js APIs**: `fs.promises.chmod`, `path.extname` — no external dependencies
- **Platform**: chmod skipped on `process.platform === 'win32'`. Shebang insertion works on all platforms
- **Architecture**: 4 source files — `extension.ts` (activation), `handlers.ts` (logic), `config.ts` (settings), `statusbar.ts` (UI)

## Success Metrics

- New `.sh` file is ready to code in under 1 second (shebang + chmod + cursor positioned)
- Zero manual steps required for the developer after creating a script file
- Extension startup adds < 5ms to VS Code load time
- Extension works correctly on macOS, Linux, and Windows (chmod skipped)
- Published and installable from VS Code Marketplace

## Resolved Questions

- **`.bash` support?** — No. Only `.sh` for bash scripts.
- **Default `enabledExtensions`?** — Conservative: only `[".sh"]`. User enables others manually.
- **Picker for unrecognized extensions?** — Yes. Quick Pick with all available shebangs from `autosh.shebangs`.
- **Marketplace icon?** — Minimalist terminal/console icon with `$` prompt.

## Save Location

This PRD should be saved to: `tasks/prd-autosh.md`

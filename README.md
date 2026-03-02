# autosh

Auto-insert shebangs, `chmod +x`, and position your cursor when creating script files in VS Code.

## Features

- **Auto-shebang** — Automatically inserts the correct shebang line when you create a new script file
- **Auto-chmod** — Sets the file executable (`chmod +x`) on macOS and Linux
- **Cursor positioning** — Places your cursor on the first empty line, ready to code
- **Configurable** — Customize shebangs, templates, and which extensions are handled
- **Manual command** — Add a shebang to any existing file via the Command Palette
- **Status bar indicator** — Brief flash confirms when autosh has set up a file

## Usage

### Automatic (on file creation)

Create a new file with an enabled extension (e.g., `.sh`) and autosh will:

1. Insert the configured shebang line
2. Apply any template content you've defined
3. Run `chmod +x` (macOS/Linux)
4. Position your cursor on the first empty line
5. Show a notification and status bar flash

### Manual command

Open any file and run **Autosh: Add Shebang** from the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`).

- If the file extension has a known shebang, it's inserted automatically.
- If the extension is unrecognized, a Quick Pick menu lets you choose from all configured shebangs.
- Files that already start with `#!` are skipped with a warning.

## Supported Extensions

| Extension | Default Shebang |
|-----------|-----------------|
| `.sh` | `#!/usr/bin/env bash` |
| `.zsh` | `#!/usr/bin/env zsh` |
| `.fish` | `#!/usr/bin/env fish` |
| `.py` | `#!/usr/bin/env python3` |
| `.rb` | `#!/usr/bin/env ruby` |
| `.pl` | `#!/usr/bin/env perl` |

You can add or override shebangs for any extension via the `autosh.shebangs` setting.

## Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `autosh.shebangs` | `object` | See [Supported Extensions](#supported-extensions) | Map of file extensions to shebang lines |
| `autosh.templates` | `object` | `{}` | Map of file extensions to template content inserted after the shebang |
| `autosh.enabledExtensions` | `string[]` | `[".sh"]` | File extensions that trigger automatic shebang insertion on file creation |
| `autosh.showNotification` | `boolean` | `true` | Show a notification when a shebang is added |
| `autosh.showStatusBar` | `boolean` | `true` | Show a status bar indicator when a shebang is added |

## Template Example

Add boilerplate after the shebang using `autosh.templates`. For example, to add `set -euo pipefail` to all new bash scripts:

```json
{
  "autosh.templates": {
    ".sh": "set -euo pipefail"
  }
}
```

When you create a new `.sh` file, autosh will produce:

```bash
#!/usr/bin/env bash

set -euo pipefail

```

with the cursor on the last empty line, ready to go.

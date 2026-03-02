# Plan: autosh — VS Code Extension

## Context

Criar uma extensão VS Code/Cursor que, ao criar um arquivo script, automaticamente:
1. Insere o shebang apropriado + linha em branco no topo
2. Executa `chmod +x` no arquivo
3. Posiciona o cursor 2 linhas após o shebang

Suporta múltiplas extensões (`.sh`, `.zsh`, `.fish`, `.py`, `.rb`, `.pl`), shebangs e templates configuráveis, comando manual, status bar, notificações e workspace settings.

## Estrutura de Arquivos

```
autosh/
  .vscode/launch.json
  .vscode/tasks.json
  src/
    extension.ts          # Ativação, registro de eventos e comandos
    handlers.ts           # Lógica de criação de arquivo (shebang, chmod, cursor)
    config.ts             # Leitura de settings, mapeamento extensão→shebang
    statusbar.ts          # Status bar indicator
  package.json
  tsconfig.json
  esbuild.js
  .vscodeignore
  .gitignore
```

## Settings (`contributes.configuration`)

| Setting | Tipo | Default | Descrição |
|---------|------|---------|-----------|
| `autosh.shebangs` | `object` | `{ ".sh": "#!/bin/bash", ".zsh": "#!/usr/bin/env zsh", ".fish": "#!/usr/bin/env fish", ".py": "#!/usr/bin/env python3", ".rb": "#!/usr/bin/env ruby", ".pl": "#!/usr/bin/env perl" }` | Mapa extensão → shebang |
| `autosh.templates` | `object` | `{}` | Mapa extensão → template completo (linhas após shebang). Ex: `{ ".sh": "set -euo pipefail\n" }` |
| `autosh.enabledExtensions` | `string[]` | `[".sh"]` | Quais extensões estão ativas (o user liga as que quiser) |
| `autosh.showNotification` | `boolean` | `true` | Mostrar toast "autosh: shebang added + chmod +x" |
| `autosh.showStatusBar` | `boolean` | `true` | Mostrar indicator na status bar |

## Comando (`contributes.commands`)

- `autosh.addShebang` — "Autosh: Add Shebang" — aplica shebang + chmod em arquivo existente aberto no editor

## Passos de Implementação

### 1. Scaffolding do projeto
- Criar `package.json` com name, activationEvents: ["onStartupFinished"], contributes (configuration + commands)
- Criar `tsconfig.json`, `esbuild.js`, `.vscode/launch.json`, `.vscode/tasks.json`
- Criar `.vscodeignore`, `.gitignore`

### 2. `src/config.ts` — Configuração
```
getShebangForExtension(ext: string): string | undefined
  → lê autosh.shebangs[ext], retorna undefined se extensão não está em enabledExtensions
getTemplateForExtension(ext: string): string
  → lê autosh.templates[ext], retorna "" se não definido
isExtensionEnabled(ext: string): boolean
  → checa se ext está em autosh.enabledExtensions
```

### 3. `src/handlers.ts` — Lógica principal
```
handleFileCreated(uri):
  1. Extrair extensão do arquivo (path.extname)
  2. isExtensionEnabled(ext) → se não, return
  3. openTextDocument(uri) → checar se está vazio
  4. Montar conteúdo: shebang + "\n" + template + "\n"
  5. WorkspaceEdit.insert(uri, (0,0), conteúdo)
  6. applyEdit() → doc.save()
  7. chmod(uri.fsPath, 0o755) [skip no Windows, try/catch]
  8. showTextDocument(uri) → cursor na linha após o conteúdo inserido
  9. Mostrar notificação se autosh.showNotification
  10. Atualizar status bar

handleAddShebangCommand():
  1. Pegar activeTextEditor
  2. Se não tem editor → show error
  3. Extrair extensão → buscar shebang
  4. Se arquivo já começa com #! → show warning "já tem shebang"
  5. Inserir shebang + template + chmod
  6. Notificação + status bar
```

### 4. `src/statusbar.ts` — Status Bar
```
createStatusBarItem():
  → cria item alinhado à direita
  → texto: "$(check) autosh"
  → visível por 3 segundos após ação, depois esconde
  → respects autosh.showStatusBar setting
```

### 5. `src/extension.ts` — Ativação
```
activate(context):
  1. Registrar onDidCreateFiles → handleFileCreated
  2. Registrar comando autosh.addShebang → handleAddShebangCommand
  3. Criar status bar item
  4. Push tudo em context.subscriptions

deactivate(): noop
```

### 6. Instalar deps e compilar
- `npm install`
- `npm run compile`

## Edge Cases
- Arquivo já tem conteúdo → skip na criação automática
- Arquivo já tem shebang → skip + warning no comando manual
- Windows → skip chmod (shebang ainda é inserido)
- chmod falha → warn no console, não crasha
- Extensão não está em enabledExtensions → skip
- Template não definido para extensão → só shebang + linha vazia
- Ctrl+Z (undo) → funciona naturalmente pois usamos WorkspaceEdit (integrado ao undo stack do VS Code)
- Workspace settings → VS Code já suporta via `.vscode/settings.json` nativamente para `contributes.configuration`

## Verificação
1. `npm run compile` — sem erros
2. F5 → Extension Development Host
3. Criar `test.sh` → shebang `#!/bin/bash`, chmod +x, cursor linha 3
4. Criar `test.txt` → nada acontece (extensão não habilitada)
5. Habilitar `.py` em settings → criar `test.py` → shebang `#!/usr/bin/env python3`
6. Abrir arquivo `.sh` existente sem shebang → rodar "Autosh: Add Shebang" → shebang inserido
7. Configurar template `{ ".sh": "set -euo pipefail\n" }` → criar novo `.sh` → verificar template
8. `ls -la test.sh` → confirmar `rwxr-xr-x`
9. Verificar status bar aparece e some após 3s
10. Desabilitar notificação em settings → criar `.sh` → sem toast

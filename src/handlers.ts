import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { getShebangForExtension, getTemplateForExtension, isExtensionEnabled } from './config';
import { flashStatusBar } from './statusbar';

export async function handleFileCreated(
	uri: vscode.Uri,
	statusBar: vscode.StatusBarItem
): Promise<void> {
	const ext = path.extname(uri.fsPath);
	if (!isExtensionEnabled(ext)) {
		return;
	}

	const document = await vscode.workspace.openTextDocument(uri);
	if (document.getText().length !== 0) {
		return;
	}

	const shebang = getShebangForExtension(ext);
	if (!shebang) {
		return;
	}

	const template = getTemplateForExtension(ext);
	const content = template
		? shebang + '\n\n' + template + '\n'
		: shebang + '\n\n';

	const edit = new vscode.WorkspaceEdit();
	edit.insert(uri, new vscode.Position(0, 0), content);
	await vscode.workspace.applyEdit(edit);
	await document.save();

	if (process.platform !== 'win32') {
		try {
			await fs.promises.chmod(uri.fsPath, 0o755);
		} catch (err) {
			console.warn('autosh: failed to chmod', uri.fsPath, err);
		}
	}

	const editor = await vscode.window.showTextDocument(document);
	const lineCount = document.lineCount;
	// Position cursor on the last line of inserted content (the empty line after shebang)
	const cursorLine = template ? lineCount - 1 : 1;
	const position = new vscode.Position(cursorLine, 0);
	editor.selection = new vscode.Selection(position, position);
	editor.revealRange(new vscode.Range(position, position));

	const showNotification = vscode.workspace
		.getConfiguration('autosh')
		.get<boolean>('showNotification', true);
	if (showNotification) {
		vscode.window.showInformationMessage('autosh: shebang added + chmod +x');
	}

	flashStatusBar(statusBar);
}

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { getShebangForExtension, getTemplateForExtension, isExtensionEnabled, getAllShebangs } from './config';
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

export async function handleAddShebangCommand(
	statusBar: vscode.StatusBarItem
): Promise<void> {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showErrorMessage('No active editor');
		return;
	}

	const document = editor.document;
	const firstLine = document.lineAt(0).text;
	if (firstLine.startsWith('#!')) {
		vscode.window.showWarningMessage('File already has a shebang');
		return;
	}

	const ext = path.extname(document.uri.fsPath);
	let shebang = getShebangForExtension(ext);

	if (!shebang) {
		const allShebangs = getAllShebangs();
		const items = Object.entries(allShebangs).map(([extension, shebangStr]) => ({
			label: extension,
			description: shebangStr,
		}));

		const picked = await vscode.window.showQuickPick(items, {
			placeHolder: 'Select a shebang to add',
		});
		if (!picked) {
			return;
		}
		shebang = picked.description!;
	}

	const template = getTemplateForExtension(ext);
	const content = template
		? shebang + '\n\n' + template + '\n'
		: shebang + '\n\n';

	const edit = new vscode.WorkspaceEdit();
	edit.insert(document.uri, new vscode.Position(0, 0), content);
	await vscode.workspace.applyEdit(edit);

	if (process.platform !== 'win32') {
		try {
			await fs.promises.chmod(document.uri.fsPath, 0o755);
		} catch (err) {
			console.warn('autosh: failed to chmod', document.uri.fsPath, err);
		}
	}

	// Position cursor on first empty line after inserted content
	const lines = content.split('\n');
	const cursorLine = lines.length - 1;
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

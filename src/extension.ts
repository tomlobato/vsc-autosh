import * as vscode from 'vscode';
import { createStatusBar } from './statusbar';
import { handleFileCreated, handleAddShebangCommand } from './handlers';

export function activate(context: vscode.ExtensionContext) {
	const statusBar = createStatusBar(context);

	context.subscriptions.push(
		vscode.workspace.onDidCreateFiles((event) => {
			for (const file of event.files) {
				handleFileCreated(file, statusBar);
			}
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('autosh.addShebang', () => {
			handleAddShebangCommand(statusBar);
		})
	);
}

export function deactivate() {
}

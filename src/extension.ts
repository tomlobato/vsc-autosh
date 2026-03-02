import * as vscode from 'vscode';
import { createStatusBar } from './statusbar';
import { handleFileCreated } from './handlers';

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
			// Stub — will be implemented in US-004
		})
	);
}

export function deactivate() {
}

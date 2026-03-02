import * as vscode from 'vscode';

let flashTimer: ReturnType<typeof setTimeout> | undefined;

export function createStatusBar(context: vscode.ExtensionContext): vscode.StatusBarItem {
	const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
	item.text = '$(check) autosh';
	item.hide();
	context.subscriptions.push(item);
	return item;
}

export function flashStatusBar(item: vscode.StatusBarItem): void {
	const showStatusBar = vscode.workspace.getConfiguration('autosh').get<boolean>('showStatusBar', true);
	if (!showStatusBar) {
		return;
	}

	if (flashTimer !== undefined) {
		clearTimeout(flashTimer);
	}

	item.show();
	flashTimer = setTimeout(() => {
		item.hide();
		flashTimer = undefined;
	}, 3000);
}

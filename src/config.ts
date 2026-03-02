import * as vscode from 'vscode';

function getConfig() {
	return vscode.workspace.getConfiguration('autosh');
}

export function getShebangForExtension(ext: string): string | undefined {
	const shebangs = getConfig().get<Record<string, string>>('shebangs', {});
	return shebangs[ext];
}

export function getTemplateForExtension(ext: string): string {
	const templates = getConfig().get<Record<string, string>>('templates', {});
	return templates[ext] ?? '';
}

export function isExtensionEnabled(ext: string): boolean {
	const enabled = getConfig().get<string[]>('enabledExtensions', ['.sh']);
	return enabled.includes(ext);
}

export function getAllShebangs(): Record<string, string> {
	return getConfig().get<Record<string, string>>('shebangs', {});
}
